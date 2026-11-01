const assert = require("assert/strict");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const postman = path.join(root, "postman");
const files = [
  "tastebook_uc19_admin_recipes_postman_collection.json",
  "tastebook_uc20_moderation_postman_collection.json",
  "tastebook_uc21_admin_categories_postman_collection.json",
  "tastebook_uc22_admin_ingredients_postman_collection.json",
  "tastebook_uc23_admin_units_postman_collection.json",
  "tastebook_uc24_admin_users_postman_collection.json",
  "tastebook_uc08_admin_images_postman_collection.json",
];
const flatten = (items) => items.flatMap((item) => item.item ? flatten(item.item) : [item]);
const caseId = (name) => name.match(/^TC-\d{2}-\d{2}[a-z]?\b/)?.[0];

function parseCsv(text) {
  const rows = [];
  let row = [], value = "", quoted = false;
  for (let index = 0; index < text.length; index++) {
    const ch = text[index];
    if (ch === '"') {
      if (quoted && text[index + 1] === '"') { value += '"'; index++; }
      else quoted = !quoted;
    } else if (!quoted && ch === ",") { row.push(value); value = ""; }
    else if (!quoted && ch === "\n") { row.push(value.replace(/\r$/, "")); rows.push(row); row = []; value = ""; }
    else value += ch;
  }
  if (value || row.length) { row.push(value); rows.push(row); }
  assert.equal(quoted, false, "CSV có dấu nháy chưa đóng");
  return rows;
}

function validateCollections() {
  const allIds = [], results = [];
  let scripts = 0;
  for (const filename of files) {
    const c = JSON.parse(fs.readFileSync(path.join(postman, filename), "utf8"));
    const items = flatten(c.item);
    const ids = items.map((item) => caseId(item.name)).filter(Boolean);
    assert.ok(items.length < 100, filename + " có ít nhất 100 request trước khi lặp");
    assert.ok(c.item.some((f) => f.name === "00_Setup"));
    assert.ok(c.item.some((f) => f.name === "99_Teardown"));
    assert.ok(items.at(-1).name.endsWith("Kiểm tra đủ mã TC đã được thực thi"));
    assert.equal(new Set(ids).size, ids.length, filename + " trùng mã TC");
    for (const variable of c.variable) assert.equal(variable.value, "", "Không lưu token/ID thật vào collection");
    for (const object of [c, ...items]) for (const event of object.event || []) {
      new vm.Script(event.script.exec.join("\n")); scripts++;
    }
    for (const item of items) {
      assert.ok(/^(TC-(?:SETUP-\d{2}|\d{2}-\d{2}[a-z]?)|PRE-\d{2}-\d{2}|TD-\d{2}-\d{2})\s/.test(item.name), item.name);
      if (item.request.body?.raw) JSON.parse(item.request.body.raw.replace(/([[:,]\s*){{\w+}}/g, "$1 1").replace(/{{\w+}}/g, "test"));
    }
    if (!filename.includes("uc08")) for (const type of ["Normal", "Abnormal", "Boundary"]) {
      assert.ok(items.some((i) => caseId(i.name) && i.request.description.includes("Loại: " + type)), filename + " thiếu " + type);
    }
    if (filename.includes("uc08")) assert.deepEqual(ids, ["TC-08-59", "TC-08-60", "TC-08-61", "TC-08-62"]);
    if (filename.includes("uc22")) {
      for (const item of items) for (const event of item.event || []) {
        if (item.name.startsWith("TC-SETUP-01 ") && event.listen === "prerequest") continue;
        assert.ok(!event.script.exec.join("\n").includes("setNextRequest(null)"), item.name + " vẫn dừng toàn bộ UC-22 khi fail");
      }
      assert.ok(items.some((item) => (item.event || []).some((event) => event.script.exec.join("\n").includes("QA_BLOCKED"))));
    }
    allIds.push(...ids); results.push({ file: filename, requests: items.length, cases: ids.length });
  }
  assert.equal(new Set(allIds).size, allIds.length, "Trùng mã giữa các UC");
  const master = JSON.parse(fs.readFileSync(path.join(postman, "tastebook_admin_rbac_postman_collection.json"), "utf8"));
  assert.deepEqual(flatten(master.item).map((i) => caseId(i.name)).filter(Boolean).sort(), allIds.slice().sort());
  const api = parseCsv(fs.readFileSync(path.join(postman, "admin_api_test_cases.csv"), "utf8").replace(/^\uFEFF/, ""));
  const manual = parseCsv(fs.readFileSync(path.join(postman, "admin_manual_test_cases.csv"), "utf8").replace(/^\uFEFF/, ""));
  assert.deepEqual(api.slice(1).map((row) => row[0]).sort(), allIds.slice().sort(), "CSV chưa có đủ dòng API");
  assert.equal(new Set([...allIds, ...manual.slice(1).map((row) => row[0])]).size, allIds.length + manual.length - 1, "Mã manual trùng API");
  console.log(JSON.stringify({ collections: results, apiCases: allIds.length, manualCases: manual.length - 1, scriptsParsed: scripts }));
}

async function validateRunner(which, env, failAt = -1) {
  const calls = [];
  const code = fs.readFileSync(path.join(__dirname, "run-newman.js"), "utf8").replace(/main\(\)\.catch\([\s\S]*$/, "module.exports = { main };");
  const context = {
    __dirname,
    require(name) {
      if (name === "child_process") return { spawnSync(command) { calls.push(command); return { status: calls.length - 1 === failAt ? 1 : 0 }; } };
      if (name === "fs") return { ...fs, mkdirSync() {} };
      return require(name);
    },
    process: { argv: ["node", "run-newman.js", env, which], exit(code) { const e = new Error("exit " + code); e.exitCode = code; throw e; } },
    module: { exports: {} }, console: { log() {}, warn() {}, error() {} },
    fetch: async () => ({ status: 200 }), AbortSignal, setTimeout,
  };
  vm.runInNewContext(code, context);
  let failure;
  try { await context.module.exports.main(); } catch (error) { failure = error; }
  if (failAt >= 0) assert.equal(failure?.exitCode, 1);
  else assert.equal(failure, undefined);
  assert.equal(calls.length, which === "admin" ? 7 : 1);
  assert.ok(calls.every((command) => !command.includes("tastebook_admin_rbac_postman_collection.json")), "Runner gọi nhầm file tổng hợp");
  assert.ok(calls.every((command) => !command.includes("--reporter-htmlextra-skipSensitiveData")));
  assert.ok(calls.every((command) => command.includes("--reporter-htmlextra-skipHeaders") && command.includes("Authorization,Cookie,Set-Cookie")));
  assert.ok(calls.every((command) => command.includes("--reporter-htmlextra-hideRequestBody") && command.includes("--reporter-htmlextra-hideResponseBody")));
  assert.ok(calls.every((command) => command.includes("--delay-request 3000")));
  if (which === "uc22") assert.ok(calls[0].includes("tastebook_uc22_admin_ingredients_postman_collection.json"));
}

(async () => {
  validateCollections();
  await validateRunner("admin", "staging");
  await validateRunner("uc22", "staging");
  await validateRunner("uc22", "local");
  await validateRunner("admin", "staging", 0);
  console.log("PASS: TC/CSV, các bộ độc lập, giãn cách Staging và tiếp tục UC sau khi một UC thất bại.");
})().catch((error) => { console.error(error); process.exitCode = 1; });
