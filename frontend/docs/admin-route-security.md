# Bảo vệ điều hướng Admin và responsive

## Phạm vi

Frontend chặn `/admin`, mọi trang con đã đăng ký và URL con không tồn tại. Guest, token thiếu/sai cấu trúc/hết hạn, tài khoản có role khác chính xác `Admin` được chuyển đến `/403` bằng replace. Admin hợp lệ vào URL không tồn tại nhận trang 404 bên trong layout đã bảo vệ. Không sửa Backend.

## Xác thực và phiên

- `AdminRoute` chỉ mount layout/trang/API Admin sau khi `/users/me` xác thực thành công. Không tin role tự lưu trong localStorage hoặc role đọc từ payload JWT.
- Kiểm tra exp phía client chỉ để chặn sớm; chữ ký token và role hiện tại do Backend xác thực.
- Query xác thực tách khỏi `profile`, theo token và dùng chung giữa các URL Admin. Xác thực lần đầu khi mount; kiểm tra lại định kỳ 60 giây và khi focus/reconnect nếu dữ liệu đã stale. Chuyển giữa các trang Admin không gọi lại profile khi phiên đã xác thực. Cache không được giữ khi không còn observer.
- Đăng nhập mới xóa cache của phiên cũ trước khi ghi token. Guard theo dõi thay đổi phiên, storage khác tab và hết hạn token. Thay đổi storage cùng tab ngoài luồng đăng nhập cũng được phát hiện qua nhịp kiểm tra 1 giây; Backend vẫn phải kiểm tra mọi request trong khoảng đó.
- Lần xác thực đầu tiên chưa thành công vẫn chặn trang con và hiển thị thử lại. Sau khi cùng token đã được xác nhận Admin, kiểm tra nền chậm/lỗi tạm thời không unmount layout hoặc làm mất bản nháp; lỗi có banner thử lại. Không dùng dữ liệu phiên khác hoặc role tự lưu để cấp quyền. HTTP 401 xóa phiên và chuyển 403; HTTP 403 hoặc role mới khác Admin chuyển 403.
- HTTP 429 được ghi nhận kèm Retry-After; polling chờ ít nhất khoảng này và không refetch do focus/reconnect khi đang chờ. Không tự retry ngay, không tăng hoặc vô hiệu hóa giới hạn Backend.
- `/403` là route độc lập, có đường về trang chủ và đăng nhập. Đường quay lại sau đăng nhập được kiểm tra: chỉ nhận path nội bộ, loại URL ngoài, dấu backslash/ký tự điều khiển và vòng lặp vào trang xác thực.

Frontend guard bảo vệ điều hướng và tránh tải giao diện trái quyền; không phải hàng rào bảo vệ dữ liệu trước việc sửa JavaScript/localStorage hoặc gọi API trực tiếp. Backend hiện có `checkUserJWT` và `checkAdminPermission` trên API Admin; phải tiếp tục giữ các kiểm tra này. Khi role bị thu hồi, API phải từ chối ngay, không phụ thuộc lần kiểm tra profile tiếp theo trên Frontend.

## Responsive

- Dưới 1024 px: header cố định và drawer quản trị, dành chiều rộng cho bảng/form trên tablet.
- Từ 1024 px: sidebar cố định theo viewport, không co chiều rộng, vùng menu cuộn riêng và phần đăng xuất luôn tiếp cận được.
- Nội dung có min-width 0 và padding theo kích thước màn hình; bảng rộng cuộn bên trong khung bảng thay vì làm tràn toàn trang.
- Drawer giới hạn theo viewport, có nhãn trợ năng, đóng bằng Escape hoặc sau khi chọn mục; navigation có trạng thái active và focus bàn phím.

## Minh chứng kiểm tra

- `npm run lint`: đạt.
- `npm test`: lần kiểm tra gần nhất 114/114 đạt (gồm thay đổi các issue #106–#109).
- `npm run build`: đạt.
- Edge headless với API giả lập: Guest, token malformed/expired, User với role Admin giả trong localStorage/JWT, token bị Backend trả 401 đều chuyển 403; không gửi request `/admin/*`.
- Kiểm tra URL `/admin`, `/admin/users`, `/admin/recipes/123/edit`, `/admin/unknown/deep`, `/ADMIN/users` cho từng nhóm bị từ chối.
- Profile chậm/lỗi không mount trang con; thử lại thành công cho phép Admin. Đổi token Admin sang User, đăng xuất tab khác, hết hạn khi trang đang mở và API trả 403 đều bị chặn. Admin hợp lệ vào URL không tồn tại nhận 404.
- Dashboard, Users, Categories, Ingredients, Units, Approvals, Recipes và form tạo công thức ở 768×1024, 820×1180, 1024×768, 1366×768: không có tràn ngang toàn trang hoặc lỗi JavaScript; drawer đóng sau điều hướng và highlight đúng mục.

Các kiểm tra trình duyệt dùng mock để kiểm soát role/lỗi/expiry và quan sát request; cần nghiệm thu lại bằng tài khoản Guest/User/Admin và API staging thật trước khi phát hành.

## Sửa gián đoạn do kiểm tra quyền nền

Log Backend local xác nhận /users/me trả HTTP 429; giới hạn API hiện là 100 request/15 phút. Guard trước đây còn unmount toàn bộ trang ở mỗi lần kiểm tra nền và khi lỗi, gây mất modal/bản nháp. Bản sửa giữ nội dung của cùng phiên Admin đã được xác thực, giảm truy vấn lặp khi chuyển trang và tuân thủ Retry-After. Lần xác thực đầu tiên, đổi token, token hết hạn hoặc API từ chối quyền vẫn bị chặn. Backend vẫn kiểm tra quyền trên mọi thao tác.

Kiểm tra Edge giả lập thời gian: chuyển Units–Categories–Units không phát sinh thêm request profile; mở form nhập bản nháp, kiểm tra nền gặp 429 vẫn giữ form/giá trị, không gọi lại API trang con do remount; không polling sớm hơn Retry-After; phục hồi giữ bản nháp; role bị đổi sang User chuyển 403.
