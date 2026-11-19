# Tối ưu build và nghiệm thu hiệu năng Frontend

Phạm vi thay đổi: chỉ `frontend/`, không sửa Backend, Docker hoặc cấu hình dịch vụ Render.

## Build production

```sh
npm ci
npm run build
```

`prebuild` sinh ảnh WebP từ ảnh gốc, Vite build/minify/tách chunk, sau đó sinh `.gz` và `.br` cho tài nguyên văn bản từ 1 KB khi nén nhỏ hơn bản gốc. Giữ nguyên file gốc để hosting lựa chọn encoding thích hợp. `postbuild` tạo `performance-results/build-report.json` và kiểm tra ngân sách JavaScript tải ban đầu không quá **150 KiB Gzip**.

Đầu ra triển khai là `dist/`. Báo cáo, screenshot và ảnh WebP sinh tự động được gitignore; ảnh sẽ được tạo lại bởi `npm run dev` hoặc `npm run build`.

## Các thay đổi tối ưu

- Dùng `build.rolldownOptions.output.codeSplitting` của Vite 8, tách React, Router và TanStack Query thành chunk có hash để cache độc lập. Xem [Vite build](https://vite.dev/guide/build).
- Lazy load trang chi tiết công thức, layout/route quản trị và menu mobile. Menu mobile chỉ tải mã Sheet khi người dùng mở, vẫn phục hồi focus về nút mở khi đóng.
- Giữ lazy loading/async decoding cho ảnh thẻ công thức và ảnh bước nấu dưới màn hình đầu; giữ ảnh hero phía trên màn hình tải sớm, không đặt lazy cho ảnh LCP.
- Hero có WebP 640/1280/1920px, `srcset`/`sizes`, preload responsive và ảnh JPEG dự phòng. Ảnh nền đăng nhập/đăng ký dùng WebP. Các thumbnail Cloudinary/Unsplash tiếp tục dùng biến đổi kích thước và chất lượng trong `recipeImages.js`.
- Target Chrome/Edge 111+, Safari 16.4+; CSS được chuyển đổi theo Safari 16.4. Trình duyệt cũ hơn không nằm trong phạm vi cấu hình này.

## Số liệu build local

So sánh cùng mã ứng dụng trước/sau tối ưu; Gzip dùng cùng thuật toán `gzipSync` mặc định để đối chiếu. Đây là tổng đồ thị import tĩnh của entry, không chỉ kích thước file mang tên `index`.

| Chỉ số | Trước | Sau |
| --- | ---: | ---: |
| JavaScript tải ban đầu, Gzip | 165.554 byte | 144.222 byte |
| Chunk entry chính, chưa nén | 371.053 byte | khoảng 64.437 byte |
| Hero mobile WebP 640px | JPEG gốc 310.601 byte | 45.650 byte |
| Hero WebP 1280px | JPEG gốc 310.601 byte | 134.474 byte |
| Ảnh nền đăng nhập | 159.239 byte | 83.828 byte |
| Ảnh nền đăng ký | 220.670 byte | 59.854 byte |

Số byte/hash có thể thay đổi khi code thay đổi; báo cáo build sinh tự động là nguồn số liệu cho mỗi build cụ thể. Phân nhỏ chunk không đồng nghĩa tổng dữ liệu tải ban đầu giảm bằng mức giảm của riêng chunk entry.

## Nghiệm thu FCP trên Render

Đã đo **bản đang deploy** tại `https://tastebook-frontend.onrender.com/` ngày **13/11/2026**, bằng Lighthouse 13.6.0, Chrome 157 headless, 3 lượt/mobile và 3 lượt/desktop. API `/categories` và `/home` của backend Render trả HTTP 200 trong lượt đo.

| Thiết bị mô phỏng | FCP từng lượt | FCP trung vị | Mục tiêu < 1.500 ms |
| --- | --- | ---: | --- |
| Mobile | 1.060 / 961 / 952 ms | **961 ms** | Đạt |
| Desktop | 293 / 302 / 290 ms | **293 ms** | Đạt |

Mobile dùng Lighthouse simulated throttling: RTT 150 ms, throughput 1.638,4 Kbps, CPU slowdown 4x. Đây là kết quả lab của trang chủ ở thời điểm đo, không phải p75 người dùng thật hay cam kết mọi lần tải/mọi route đều dưới 1,5 giây. LCP mobile khoảng 3,2–3,3 giây, nên không dùng kết quả FCP để khẳng định toàn bộ Core Web Vitals đều đạt.

**Các số FCP trên thuộc bản Render hiện tại, chưa phải bản build mới trong workspace. Bản tối ưu mới chưa được deploy. Cần chạy lại sau khi PM merge và Render deploy hoàn tất.**

```sh
# Mặc định 3 lượt/mobile + 3 lượt/desktop, fail nếu FCP trung vị >= 1.500 ms.
npm run test:performance -- https://tastebook-frontend.onrender.com/
```

Có thể đặt `PERF_RUNS`, `PERF_URL` hoặc `CHROME_PATH` trong môi trường. Lệnh cần trình duyệt Chrome/Chromium hoạt động; trên Windows ưu tiên Chrome đã cài. Kết quả gồm HTML, JSON từng lượt và `summary.json` tại `performance-results/tastebook-frontend-onrender-com/`. Lưu bản trước khi chạy lại vì lần chạy tiếp theo sẽ ghi đè.

## Chrome, Edge, Safari và đa thiết bị

```sh
npx playwright install chromium webkit
npm run test:browsers -- --project=chrome-desktop --project=chrome-mobile --project=edge-desktop --project=edge-mobile
# Chạy trên máy có WebKit hoạt động, khuyến nghị macOS:
npm run test:browsers -- --project=webkit-desktop --project=webkit-mobile
```

Chrome và Edge cần được cài trên máy. Có thể chạy toàn bộ project bằng `npm run test:browsers`. Mặc định script build production, chạy static server local có thương lượng Gzip/Brotli, sau đó kiểm thử với API fixture để kết quả giao diện ổn định.

Đã đạt **70 test**, bỏ qua có chủ đích **2 test menu mobile trên project desktop**. Bao phủ 16 màn hình ở Chrome/Edge desktop/mobile: trang chủ, tìm kiếm, chi tiết công thức, đăng nhập/đăng ký, tạo công thức, thực đơn, đi chợ, hồ sơ và các trang admin. Kiểm tra h1 hiển thị, lỗi JavaScript, tràn ngang, menu mobile, deep link, Content-Encoding và cache của assets. Có screenshot minh chứng trong báo cáo HTML `playwright-report/index.html`.

**Safari chưa nghiệm thu:** WebKit 27.2 trên máy Windows hiện tại báo thiếu dependency và không khởi chạy được (`spawn UNKNOWN` khi thử chạy trực tiếp). Chưa đánh dấu các test WebKit là pass. Playwright WebKit cũng không phải Safari thật; cần kiểm tra Safari trên macOS/iPhone trước khi đóng tiêu chí đa trình duyệt. Xem [Playwright browsers](https://playwright.dev/docs/browsers).

Checklist Safari thực:

- Trang chủ/tìm kiếm: font, hero, responsive ảnh, không tràn ngang ở 390px và 1440px.
- Menu mobile: mở/đóng, focus bàn phím, link hoạt động.
- Công thức: ảnh hero, ảnh bước nấu lazy, số lượng/khẩu phần, chọn nguyên liệu, form upload.
- Thực đơn/đi chợ: popup, cuộn nội dung, checkbox, ô nhập và validation.
- Admin: bảng cuộn trong khung, bộ lọc và phân trang.

## Hosting và Content-Encoding

Render Static Sites tự phục vụ Brotli tại edge theo [tài liệu Render](https://render.com/docs/static-sites). File sidecar không tự kích hoạt encoding ở mọi loại hosting. Không đổi URL script sang `.gz`/`.br` và không đặt cứng `Content-Encoding` cho toàn bộ tài nguyên.

Trên Render giữ Root Directory `frontend`, build `npm ci && npm run build`, Publish Directory `dist`. Giữ SPA rewrite `/* -> /index.html`. Có thể cấu hình `Cache-Control: public, max-age=31536000, immutable` cho `/assets/*`; HTML cần revalidate để không giữ tham chiếu chunk cũ. Cấu hình này thuộc bước triển khai, chưa sửa trong task frontend.

Kiểm tra bản build local có nén đúng:

```sh
npm run build
npm run serve:dist
# Mở http://127.0.0.1:4173
```

Server này chỉ phục vụ kiểm tra artifact frontend; không thay thế backend và không dùng làm cấu hình triển khai Render Static Site.
