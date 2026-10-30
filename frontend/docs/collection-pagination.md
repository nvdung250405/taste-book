# Phân trang danh sách cá nhân — tiến độ issue #78

## Phạm vi đã thực hiện ở frontend

- Mở hoặc chuyển trang Công thức của tôi/Yêu thích gọi API với `page` và `limit=12`, không tự động gom các trang còn lại.
- Trang hiện tại và bộ lọc vẫn nằm trong URL. Tổng số trang lấy từ API khi duyệt danh sách không có bộ lọc.
- Các tab trạng thái luôn truy cập được. Chỉ badge Tất cả dùng tổng số từ API; không đếm trạng thái từ riêng trang đang xem.
- Khi tìm kiếm hoặc chọn trạng thái, frontend dùng truy vấn toàn bộ collection làm phương án tương thích với backend hiện tại. Truy vấn này dùng chung cache 60 giây, không tạo một collection mới cho mỗi từ khóa.
- Tìm kiếm favorites vẫn bao gồm tên món, tác giả và ghi chú trên toàn bộ dữ liệu.
- `fetchCollection` cho phép truyền hàm lấy ID, hỗ trợ `recipeId`/`id` mặc định và không làm mất bản ghi không có ID.
- Giữ rollback khi bỏ yêu thích thất bại và điều chỉnh trang khi xóa món cuối trang cuối.

## Phần còn cần backend

Issue #78 chưa hoàn tất toàn bộ. Tìm kiếm/lọc vẫn cần gom trang vì `/recipes/mine` và `/favorites` chỉ hỗ trợ `page`, `limit`. Tra cứu trạng thái yêu thích ở trang chủ/tìm kiếm/chi tiết vẫn cần danh sách đầy đủ để không tái phát lỗi #79.

Để loại bỏ hoàn toàn việc gom collection, cần API tìm kiếm/lọc trạng thái, số lượng theo trạng thái và cách tra cứu trạng thái yêu thích theo các ID đang hiển thị. Frontend không gửi các tham số này cho API khi chưa có hỗ trợ.

## Kiểm tra

- Chạy `npm run lint`, `npm test`, `npm run build` trong `frontend`.
- Kiểm tra Edge với API giả lập 205 bản ghi: một request trang mặc định, điều hướng URL, lọc trạng thái và ghi chú ngoài 100 bản ghi đầu, rollback bỏ yêu thích, điều chỉnh trang cuối và không hiển thị dữ liệu một phần khi tải collection thất bại.
- Cần nghiệm thu lại bằng dữ liệu staging trước khi merge.
