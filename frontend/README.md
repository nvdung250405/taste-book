# React + Vite

## Quy ước mã nguồn và file sinh tự động

- `src/api/`: khai báo endpoint và gọi Axios. Hook trong `src/hooks/queries/` gọi các module API để quản lý cache và trạng thái tải dữ liệu.
- `logs/`: lưu log chạy lệnh cục bộ, ví dụ `npm run build > logs/build-results.log`. Tạo thư mục trước khi ghi log nếu chưa có.
- `performance-results/`, `playwright-report/`, `test-results/`: báo cáo do các công cụ kiểm thử sinh ra, giữ nguyên đường dẫn công cụ sử dụng.
- `public/images/optimized/`: các biến thể ảnh sinh tự động; `npm run images:optimize` tạo lại các ảnh này, bước prebuild/predev cũng tự thực hiện.
- Các thư mục output trên không đưa lên Git. Giữ script, cấu hình và mã kiểm thử (`.mjs`) trong Git để có thể chạy lại.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Production performance

Build compression, browser checks, Lighthouse measurements and Render acceptance notes: [docs/performance.md](docs/performance.md).
