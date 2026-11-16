# Kiểm tra giao diện và Accessibility

Các thay đổi chỉ nằm trong frontend: tăng tương phản chữ cam/xám và các nút hành động, bổ sung tên cho nút chuyển danh mục và xem mật khẩu, nhãn tìm kiếm trang chủ, mô tả ảnh xem trước và viền focus bàn phím. Các từ khóa tìm kiếm phổ biến dùng nút HTML để thao tác được bằng bàn phím. Ảnh thuần trang trí hoặc nằm cạnh tiêu đề tương ứng tiếp tục dùng `alt=""` để tránh đọc lặp.

## Cách chạy lại

Trong thư mục `frontend`:

```sh
npm run lint
npm test
npm run test:accessibility
npm run test:browsers -- --project=chrome-desktop --project=chrome-mobile --project=edge-desktop --project=edge-mobile
```

Kiểm tra accessibility dùng axe-core với các quy tắc WCAG 2 A/AA và WCAG 2.1 AA trên 16 trang, gồm cả trang đăng nhập, tạo công thức, đi chợ và admin. Dữ liệu API và phiên đăng nhập được giả lập trong fixture, không phải kiểm thử tích hợp backend. Báo cáo đính kèm trong Playwright lưu các vi phạm đầy đủ.

Đo Lighthouse trên build production bằng `npm run serve:dist`, sau đó ở terminal khác:

```sh
npx lighthouse http://127.0.0.1:4173/ --only-categories=accessibility --output=html --output=json --output-path=performance-results/accessibility-mobile --chrome-flags="--headless"
npx lighthouse http://127.0.0.1:4173/ --only-categories=accessibility --preset=desktop --output=html --output=json --output-path=performance-results/accessibility-desktop --chrome-flags="--headless"
```

## Kết quả và giới hạn

- Ngày 16/11/2026: Lighthouse trang chủ production local đạt **100/100 Accessibility**, cả mobile và desktop; không có audit tự động thất bại. Báo cáo local nằm tại `performance-results/accessibility-local-{mobile,desktop}.report.html` và JSON tương ứng.
- 164 unit test đạt. Kiểm tra axe trên 16 trang ở Chrome desktop/mobile: 32 lượt đạt, không có vi phạm tự động trong các quy tắc đã bật.
- Bộ kiểm tra đầy đủ Chrome/Edge desktop/mobile: 134 lượt đạt, 2 lượt bỏ qua có chủ đích (menu mobile ở viewport desktop). Trong đó có 64 lượt axe trên 16 trang. Hai kiểm tra bổ sung xác nhận từ khóa phổ biến kích hoạt được bằng phím Enter trên Chrome desktop/mobile cũng đạt.
- Sau khi rebase lên develop mới nhất: lint/build đạt, 175/175 unit test đạt và 138 lượt kiểm tra Chrome/Edge desktop/mobile đạt (2 lượt bỏ qua có chủ đích như trên), gồm kiểm tra bàn phím trên cả 4 cấu hình.
- Chưa deploy các thay đổi này; cần chạy lại Lighthouse trên Render sau khi deploy để nghiệm thu môi trường thật. Không quy đổi kết quả axe thành điểm Lighthouse cho từng trang.
- Các trạng thái popup, lỗi form, dữ liệu dài và thao tác bàn phím/trình đọc màn hình cần được Tester rà soát thêm theo danh sách lỗi thực tế. Chưa nhận được danh sách lỗi Tester hoặc báo cáo audit sơ bộ từ đầu vào của task.
- Safari thật chưa được kiểm chứng trên máy này. Điểm tự động cao không thay thế đánh giá thủ công khả năng tiếp cận.

Báo cáo sinh tự động và ảnh chụp không đưa lên Git; giữ mã kiểm thử và hướng dẫn để tái lập.
