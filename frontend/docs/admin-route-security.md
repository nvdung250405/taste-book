# Bảo vệ điều hướng Admin và responsive

## Phạm vi

Frontend chặn `/admin`, mọi trang con đã đăng ký và URL con không tồn tại. Guest, token thiếu/sai cấu trúc/hết hạn, tài khoản có role khác chính xác `Admin` được chuyển đến `/403` bằng replace. Admin hợp lệ vào URL không tồn tại nhận trang 404 bên trong layout đã bảo vệ. Không sửa Backend.

## Xác thực và phiên

- `AdminRoute` chỉ mount layout/trang/API Admin sau khi `/users/me` xác thực thành công. Không tin role tự lưu trong localStorage hoặc role đọc từ payload JWT.
- Kiểm tra exp phía client chỉ để chặn sớm; chữ ký token và role hiện tại do Backend xác thực.
- Query xác thực tách khỏi `profile`, theo token và pathname; luôn xác thực lại khi mount/đổi trang, focus, reconnect và mỗi 60 giây. Trong lúc xác thực lại, không mount nội dung Admin. Cache xác thực không được giữ khi không còn observer.
- Đăng nhập mới xóa cache của phiên cũ trước khi ghi token. Guard theo dõi thay đổi phiên, storage khác tab và hết hạn token. Thay đổi storage cùng tab ngoài luồng đăng nhập cũng được phát hiện qua nhịp kiểm tra 1 giây; Backend vẫn phải kiểm tra mọi request trong khoảng đó.
- Lỗi tải profile/5xx hiển thị thử lại, không mở quyền dựa vào cache cũ. HTTP 401 khi đang ở Admin xóa phiên và chuyển 403; HTTP 403 chuyển 403, không cố retry hay cấp quyền.
- `/403` là route độc lập, có đường về trang chủ và đăng nhập. Đường quay lại sau đăng nhập được kiểm tra: chỉ nhận path nội bộ, loại URL ngoài, dấu backslash/ký tự điều khiển và vòng lặp vào trang xác thực.

Frontend guard bảo vệ điều hướng và tránh tải giao diện trái quyền; không phải hàng rào bảo vệ dữ liệu trước việc sửa JavaScript/localStorage hoặc gọi API trực tiếp. Backend hiện có `checkUserJWT` và `checkAdminPermission` trên API Admin; phải tiếp tục giữ các kiểm tra này. Khi role bị thu hồi, API phải từ chối ngay, không phụ thuộc lần kiểm tra profile tiếp theo trên Frontend.

## Responsive

- Dưới 1024 px: header cố định và drawer quản trị, dành chiều rộng cho bảng/form trên tablet.
- Từ 1024 px: sidebar cố định theo viewport, không co chiều rộng, vùng menu cuộn riêng và phần đăng xuất luôn tiếp cận được.
- Nội dung có min-width 0 và padding theo kích thước màn hình; bảng rộng cuộn bên trong khung bảng thay vì làm tràn toàn trang.
- Drawer giới hạn theo viewport, có nhãn trợ năng, đóng bằng Escape hoặc sau khi chọn mục; navigation có trạng thái active và focus bàn phím.

## Minh chứng kiểm tra

- `npm run lint`: đạt.
- `npm test`: 101/101 đạt trên nhánh này (base develop chưa có PR #102).
- `npm run build`: đạt.
- Edge headless với API giả lập: Guest, token malformed/expired, User với role Admin giả trong localStorage/JWT, token bị Backend trả 401 đều chuyển 403; không gửi request `/admin/*`.
- Kiểm tra URL `/admin`, `/admin/users`, `/admin/recipes/123/edit`, `/admin/unknown/deep`, `/ADMIN/users` cho từng nhóm bị từ chối.
- Profile chậm/lỗi không mount trang con; thử lại thành công cho phép Admin. Đổi token Admin sang User, đăng xuất tab khác, hết hạn khi trang đang mở và API trả 403 đều bị chặn. Admin hợp lệ vào URL không tồn tại nhận 404.
- Dashboard, Users, Categories, Ingredients, Units, Approvals, Recipes và form tạo công thức ở 768×1024, 820×1180, 1024×768, 1366×768: không có tràn ngang toàn trang hoặc lỗi JavaScript; drawer đóng sau điều hướng và highlight đúng mục.

Các kiểm tra trình duyệt dùng mock để kiểm soát role/lỗi/expiry và quan sát request; cần nghiệm thu lại bằng tài khoản Guest/User/Admin và API staging thật trước khi phát hành.
