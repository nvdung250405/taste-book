# Giao diện kiểm duyệt công thức

Đăng nhập bằng tài khoản Admin và truy cập `/admin/approvals`. Frontend sử dụng API backend hiện có, không yêu cầu migration hoặc thay đổi backend.

- Layout riêng có Sidebar, Header desktop và menu mobile.
- Bảng công thức chờ duyệt hỗ trợ tìm theo tên món/tác giả và làm mới.
- Modal hiển thị ảnh, mô tả, tác giả, danh mục, thời gian, khẩu phần, độ khó, nguyên liệu và bước nấu.
- Duyệt hoặc từ chối với lý do bắt buộc. Trong lúc gửi, khóa thao tác; khi lỗi giữ nội dung để thử lại.
- Thành công hiện thông báo, đóng modal, xóa dòng đã xử lý khỏi cache và tải lại danh sách. Tự làm mới mỗi 30 giây khi trang hoạt động.
- Điều khiển “Gán cờ Món chính thức” tạm vô hiệu hóa và có giải thích vì API hiện tại chưa hỗ trợ. Không gửi cờ không được hỗ trợ hoặc thông báo thành công giả.

Kiểm tra frontend:

```powershell
cd frontend
npm run lint
npm run build
node --test src/hooks/queries/useRecipeQueries.test.mjs
```
