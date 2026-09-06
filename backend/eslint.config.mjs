import js from "@eslint/js";
import globals from "globals";

export default [
  // Bỏ qua các thư mục không cần kiểm tra
  {
    ignores: ["node_modules/**", "build/**", "dist/**"],
  },
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module", // Hỗ trợ cú pháp import/export của Babel
      globals: {
        ...globals.node,    // Hỗ trợ process, console, require, module...
      },
    },
    rules: {
      // Đặt thành "warn" thay vì "error" để tránh làm đỏ CI khi có biến chưa dùng
      "no-unused-vars": "warn",
      "no-console": "off",     // Cho phép dùng console.log/console.error
      "no-undef": "error",
    },
  },
];
