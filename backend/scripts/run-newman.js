#!/usr/bin/env node
/**
 * Chạy Postman Collection bằng Newman theo môi trường.
 *
 * Cách dùng (từ thư mục backend/):
 *   node scripts/run-newman.js <local|staging> [auth|user|recipes|recipe-mgmt|all]
 *
 * Ví dụ:
 *   node scripts/run-newman.js local                 # chạy tất cả collection trên local
 *   node scripts/run-newman.js staging recipe-mgmt   # chỉ chạy collection mới trên Render
 *
 * - Tự "đánh thức" backend trước khi chạy (Render free ngủ sau 15 phút - RSK-04).
 * - Báo cáo HTML: reports/<collection>-<env>-report.html
 * - Exit code != 0 nếu bất kỳ collection nào có test Fail (dùng được trong CI).
 */
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const POSTMAN_DIR = path.join(ROOT, "postman");
const REPORT_DIR = path.join(ROOT, "reports");
const DATA_DIR = path.join(POSTMAN_DIR, "data"); // ảnh mẫu cho test upload (dùng làm --working-dir)

const COLLECTIONS = {
  auth: "tastebook_auth_postman_collection_v2.json",
  user: "tastebook_user_profile_postman_collection_v2.json",
  recipes: "tastebook_recipes_postman_collection.json",
  categories: "tastebook_categories_postman_collection.json",
};

const ENVIRONMENTS = {
  local: {
    file: "tastebook_environment.local.postman_environment.json",
    timeoutRequestMs: 15000,
    warmupAttempts: 1,
  },
  staging: {
    file: "tastebook_environment.staging.postman_environment.json",
    timeoutRequestMs: 60000, // cold-start Render có thể mất 30-60s
    warmupAttempts: 8,
  },
};

const quote = (s) => JSON.stringify(String(s));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function fail(msg, code = 2) {
  console.error(`\n[run-newman] ${msg}\n`);
  process.exit(code);
}

function readBaseUrl(envPath) {
  const env = JSON.parse(fs.readFileSync(envPath, "utf8"));
  const item = (env.values || []).find(
    (v) => v.key === "baseUrl" && v.enabled !== false,
  );
  if (!item || !item.value)
    fail(`Environment ${path.basename(envPath)} chưa có biến baseUrl.`);
  return item.value.replace(/\/+$/, "");
}

async function warmUp(baseUrl, attempts, envName) {
  const url = `${baseUrl}/home`;
  for (let i = 1; i <= attempts; i++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(30000) });
      if (res.status < 500) {
        console.log(`[run-newman] Warm-up OK (${res.status}) - ${url}`);
        return;
      }
      console.log(
        `[run-newman] Warm-up lần ${i}/${attempts}: HTTP ${res.status}`,
      );
    } catch (e) {
      console.log(
        `[run-newman] Warm-up lần ${i}/${attempts}: ${e.cause?.code || e.message}`,
      );
    }
    if (i < attempts) await sleep(10000);
  }
  if (envName === "local") {
    fail(
      `Không kết nối được ${baseUrl}.\n` +
        `Hãy chạy backend local (npm start, cổng 5000) và đảm bảo DB đã db:setup.`,
    );
  }
  fail(`Staging không phản hồi sau ${attempts} lần thử: ${baseUrl}`);
}

async function main() {
  const [envName, which = "all"] = process.argv.slice(2);
  const envCfg = ENVIRONMENTS[envName];
  if (!envCfg)
    fail(
      `Thiếu/sai môi trường. Dùng: local | staging\n  node scripts/run-newman.js <local|staging> [${Object.keys(COLLECTIONS).join("|")}|all]`,
    );

  const keys = which === "all" ? Object.keys(COLLECTIONS) : [which];
  for (const k of keys)
    if (!COLLECTIONS[k])
      fail(
        `Collection không hợp lệ: "${k}". Chọn: ${Object.keys(COLLECTIONS).join(", ")}, all`,
      );

  const envPath = path.join(POSTMAN_DIR, envCfg.file);
  if (!fs.existsSync(envPath)) fail(`Không thấy file environment: ${envPath}`);

  const baseUrl = readBaseUrl(envPath);
  console.log(
    `[run-newman] Môi trường: ${envName.toUpperCase()}  |  baseUrl: ${baseUrl}`,
  );
  await warmUp(baseUrl, envCfg.warmupAttempts, envName);

  fs.mkdirSync(REPORT_DIR, { recursive: true });
  const failed = [];

  for (const key of keys) {
    const colPath = path.join(POSTMAN_DIR, COLLECTIONS[key]);
    if (!fs.existsSync(colPath)) {
      console.warn(
        `[run-newman] BỎ QUA "${key}": chưa có file ${COLLECTIONS[key]}`,
      );
      continue;
    }
    const report = path.join(REPORT_DIR, `${key}-${envName}-report.html`);
    const args = [
      "run",
      quote(colPath),
      "-e",
      quote(envPath),
      "--timeout-request",
      envCfg.timeoutRequestMs,
      "--reporters",
      "cli,htmlextra",
      "--reporter-htmlextra-export",
      quote(report),
      "--reporter-htmlextra-title",
      quote(`TasteBook - ${key} - ${envName}`),
    ];
    if (fs.existsSync(DATA_DIR)) args.push("--working-dir", quote(DATA_DIR));

    console.log(`\n[run-newman] ===== ${key} (${envName}) =====`);
    const r = spawnSync(`npx newman ${args.join(" ")}`, {
      cwd: ROOT,
      stdio: "inherit",
      shell: true,
    });
    if (r.status !== 0) failed.push(key);
  }

  console.log("\n[run-newman] ----------------------------------------");
  if (failed.length) {
    console.error(
      `[run-newman] CÓ LỖI ở: ${failed.join(", ")}  (xem thư mục reports/)`,
    );
    process.exit(1);
  }
  console.log(
    "[run-newman] Tất cả collection đã chạy xong, không có test Fail.",
  );
}

main().catch((e) => fail(e.stack || String(e), 1));
