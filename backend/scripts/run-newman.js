#!/usr/bin/env node
/**
 * Chạy Postman Collection bằng Newman theo môi trường.
 *
 * Cách dùng (từ thư mục backend/):
 *   node scripts/run-newman.js <local|staging> [auth|admin|user|recipes|...|all]
 *
 * Ví dụ:
 *   node scripts/run-newman.js local                 # chạy tất cả collection trên local
 *   node scripts/run-newman.js staging uc19          # chạy riêng UC-19
 *   node scripts/run-newman.js staging admin         # chạy tuần tự các bộ Admin độc lập
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
  uc19: "tastebook_uc19_admin_recipes_postman_collection.json",
  uc20: "tastebook_uc20_moderation_postman_collection.json",
  uc21: "tastebook_uc21_admin_categories_postman_collection.json",
  uc22: "tastebook_uc22_admin_ingredients_postman_collection.json",
  uc23: "tastebook_uc23_admin_units_postman_collection.json",
  uc24: "tastebook_uc24_admin_users_postman_collection.json",
  "admin-images": "tastebook_uc08_admin_images_postman_collection.json",
  user: "tastebook_user_profile_postman_collection_v2.json",
  recipes: "tastebook_recipes_postman_collection.json",
  categories: "tastebook_categories_postman_collection.json",
  uc08: "tastebook_uc08_recipe_postman_collection.json",
  uc09_11: "tastebook_uc09_11_recipe_postman_collection.json",
  uc12_favorites: "tastebook_uc12_favorites_postman_collection.json",
  uc13: "tastebook_uc13_recipe_list_postman_collection.json",
  uc14: "tastebook_uc14_create_recipe_list_postman_collection.json",
  uc15: "tastebook_uc15_delete_recipe_list_postman_collection.json",
  uc16: "tastebook_uc16_recipe_list_items_postman_collection.json",
  uc17: "tastebook_uc17_shopping_list_postman_collection.json",
  uc18: "tastebook_uc18_shopping_list_postman_collection.json",
};

const ADMIN_COLLECTIONS = ["uc19", "uc20", "uc21", "uc22", "uc23", "uc24", "admin-images"];
// 3 giây/request theo cấu hình chạy QA; quota 100 request/15 phút vẫn dùng chung.
const API_DELAY_MS = 3000;

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

function authRequestNames(collectionPath) {
  const collection = JSON.parse(fs.readFileSync(collectionPath, "utf8"));
  const names = [];
  const visit = (items) => {
    for (const item of items || []) {
      if (item.item) visit(item.item);
      const url = typeof item.request?.url === "string" ? item.request.url : item.request?.url?.raw;
      if (url && /\/auth\/(login|register)(?:[/?#]|$)/.test(url)) names.push(item.name);
    }
  };
  visit(collection.item);
  return names;
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

  const keys = which === "admin" ? ADMIN_COLLECTIONS : which === "all" ? Object.keys(COLLECTIONS) : [which];
  for (const k of keys)
    if (!COLLECTIONS[k])
      fail(
        `Collection không hợp lệ: "${k}". Chọn: ${Object.keys(COLLECTIONS).join(", ")}, admin, all`,
      );

  const envPath = path.join(POSTMAN_DIR, envCfg.file);
  if (!fs.existsSync(envPath)) fail(`Không thấy file environment: ${envPath}`);
  for (const key of keys) {
    if (!fs.existsSync(path.join(POSTMAN_DIR, COLLECTIONS[key]))) {
      fail(`Không thấy collection ${COLLECTIONS[key]}; không được bỏ qua rồi báo thành công.`);
    }
  }

  const baseUrl = readBaseUrl(envPath);
  console.log(
    `[run-newman] Môi trường: ${envName.toUpperCase()}  |  baseUrl: ${baseUrl}`,
  );
  await warmUp(baseUrl, envCfg.warmupAttempts, envName);

  fs.mkdirSync(REPORT_DIR, { recursive: true });
  const failed = [];

  for (const key of keys) {
    const colPath = path.join(POSTMAN_DIR, COLLECTIONS[key]);
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
    if (ADMIN_COLLECTIONS.includes(key)) {
      args.push("--reporter-htmlextra-skipHeaders", quote("Authorization,Cookie,Set-Cookie"));
      const authRequests = authRequestNames(colPath).join(",");
      if (authRequests) {
        args.push("--reporter-htmlextra-hideRequestBody", quote(authRequests));
        args.push("--reporter-htmlextra-hideResponseBody", quote(authRequests));
      }
    }
    if (ADMIN_COLLECTIONS.includes(key) || which === "all") {
      args.push("--delay-request", API_DELAY_MS);
      console.log(`[run-newman] Giãn cách ${API_DELAY_MS} ms/request. Quota API vẫn là 100 request/15 phút/IP; tránh chạy dồn nhiều bộ.`);
    }

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
