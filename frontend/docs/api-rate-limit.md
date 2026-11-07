# Xử lý giới hạn API chung trên Frontend

Backend local hiện áp dụng 100 request/15 phút cho API theo IP. Khi vượt ngưỡng, tất cả nhóm trang có thể nhận 429, không chỉ Admin. Frontend không thay đổi hoặc vô hiệu hóa giới hạn Backend.

## Cách xử lý

- Khi nhận 429 có `X-RateLimit-Policy: api`, ghi lại thời hạn từ Retry-After (số giây hoặc HTTP date). Nếu thiếu header có thời hạn, chờ mặc định 60 giây rồi thử lại dữ liệu đọc. Limiter riêng của login/register không khóa toàn website.
- Trong thời gian chờ, Axios từ chối request mới tại client với thông báo 429 tiếng Việt, không tiếp tục gọi Backend. Không xếp hàng hoặc tự gửi lại thao tác ghi.
- Thời hạn được lưu vào localStorage và đồng bộ qua các tab, nên reload hoặc điều hướng không làm FE tiếp tục gửi request dồn dập.
- Banner chung và QueryError hiển thị số giây còn lại. Nút thử lại của QueryError bị vô hiệu hóa trong thời gian chờ.
- Hết thời gian chờ, chỉ refetch query đọc đang active và có lỗi 429. Không fetch toàn bộ cache, không replay mutation.
- Query mặc định cache 60 giây, không retry 429 hoặc tự retry query lỗi khi remount. Các mutation vẫn `networkMode: always`, `retry: false`.
- Trang chủ, tìm kiếm, công thức cá nhân, yêu thích, danh mục cá nhân, thực đơn và đi chợ giữ dữ liệu đã có khi refetch lỗi. Nếu chưa từng tải thành công thì hiển thị trạng thái lỗi/chờ; không giả lập dữ liệu.

## Minh chứng

- 116/116 tests, gồm request sau global429 bị chặn trước adapter, hết thời gian chờ gọi lại được và query429 không tự retry.
- Edge với API giả lập đúng các header CORS của Backend: nhận429, có countdown/nút retry bị khóa; dữ liệu trang chủ vẫn hiển thị; chuyển trang và reload không có request API trong thời gian chờ; hết hạn tự tải lại danh sách yêu thích đang xem; không phát sinh request ghi.
- Không thay đổi Backend, database hoặc cấu hình giới hạn. Cần thử tích hợp với tải thực tế trước phát hành. Nhóm Backend cần đánh giá mức 100 request/15 phút nếu không đáp ứng sử dụng bình thường hoặc nhiều người dùng chung IP.
