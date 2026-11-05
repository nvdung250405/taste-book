# Các issue frontend theo SRS

Nhánh `feature/fe-srs-issues`, chỉ thay đổi frontend. Giữ các bản sửa #116, #117, #127 và chuyển tab Công thức của tôi từ công việc trước.

| Issue | Hành vi đã triển khai |
| --- | --- |
| #116 | Scope all/admin; đối chiếu API Admin để nhận diện bài hệ thống; ẩn Sửa/Xóa bài cộng đồng và khi chưa xác minh được quyền thao tác. |
| #117 | Thẻ số công thức chờ duyệt, màu cảnh báo, liên kết kiểm duyệt; loading, 0, lỗi/thử lại và làm mới. |
| #124 | Ba tab kiểm duyệt dùng query/cache riêng; bắt buộc lý do từ chối/gỡ bài; duyệt lại; làm mới các trạng thái sau thao tác. |
| #127 | Chọn nhiều danh mục, đánh dấu hệ thống; gợi ý nguyên liệu/đơn vị; khóa đơn vị nguyên liệu chuẩn và giữ ID khi sửa; hỗ trợ nhập riêng. |
| #129 | Gửi POST logout với token hiện tại trước khi dọn session; thông báo khi chưa thể xác nhận thu hồi; không retry/queue logout; xóa dữ liệu và hủy query ngay cả khi lỗi. |
| #131 | Đơn vị định tính xóa/khóa số lượng, gửi 0, hiển thị đơn vị không kèm 0, không scale số lượng; định lượng yêu cầu số dương. |
| #133 | Tải chi tiết thực đơn trước khi xác nhận xóa để lấy activeShoppingTripCount; cảnh báo gỡ liên kết nhưng giữ dữ liệu đi chợ; làm mới cache liên quan. |
| #135 | Hai bộ chọn món đều xử lý metadata trùng; hỏi đổi khẩu phần, cập nhật item cũ bằng PUT; hủy không cập nhật; cùng khẩu phần báo rõ ràng; lỗi giữ hộp thoại để thử lại. |
| #137 | Dùng chung kiểm tra 0…/+84… và chuẩn hóa số trước khi gửi; áp dụng đăng ký, đăng nhập và hồ sơ. |
| #139 | Giữ món nguồn đã xóa, gắn nhãn, bỏ link và khóa khẩu phần; vẫn cho gỡ; API yêu cầu xác nhận bỏ qua thì liệt kê món và chỉ gửi confirmSkipDeleted=true sau Tiếp tục. Hủy đóng và không tạo. |
| #141 | Pending/Approved công khai chỉ có Xem, ảnh/tiêu đề trỏ chi tiết; URL sửa chuyển về Công thức của tôi kèm thông báo; xác nhận khóa sửa/xóa trước gửi duyệt. Draft/Rejected vẫn sửa/xóa. |
| #142 | Truyền selectedId từ phản hồi tạo đi chợ vào điều hướng; chọn đúng ID, không tự mở chuyến khác; lỗi trùng tiêu đề có hướng dẫn đổi lựa chọn hoặc tự nhập tên tại Đi chợ. |

## Phụ thuộc Backend

- API kiểm duyệt hiện trả `createdAt` và `rejectionReason` nhưng không trả ngày từ chối. Giao diện đọc `rejectedAt` nếu được cung cấp, hiện hiển thị **Chưa có dữ liệu**. Cần Backend bổ sung trường ngày thực tế để đáp ứng đủ mục ngày từ chối của #124; không dùng ngày tạo thay thế.
- Các cờ trùng món, activeShoppingTripCount, isRecipeDeleted, requiresConfirmation/skippedRecipes và confirmSkipDeleted được tích hợp theo hợp đồng Backend hiện có trên develop.
- Quyền API vẫn do Backend kiểm tra; các thay đổi này không chỉnh sửa Backend.

## Kiểm tra

- 136 test frontend đạt, lint và production build đạt.
- Edge headless với API giả lập: Pending khóa thao tác và URL sửa; đơn vị chuẩn định tính khóa số lượng; gỡ bài/duyệt lại; cảnh báo chuyến đi chợ và hủy xóa; món đã xóa; đổi khẩu phần trùng, hủy, lỗi và thử lại; xác nhận bỏ qua món; điều hướng mở đúng ID từ lịch tuần; xác nhận trước gửi duyệt.
- Edge với API giả lập: đăng ký/đăng nhập/cập nhật hồ sơ bằng +84; POST logout mang Bearer, giữ token khi chờ phản hồi, sau đó chuyển login và xóa token.
- Chưa chạy tích hợp với Backend thật. Các kiểm tra trên sử dụng API giả lập.
