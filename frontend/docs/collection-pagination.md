# Phân trang danh sách cá nhân — issue #78

## Hợp đồng API sau PR Backend #101

- `/recipes/mine`: `page`, `limit`, `search`, `status` (`all`, `approved`, `pending`, `rejected`, `private`; `draft` là alias).
- `/favorites`: `page`, `limit`, `search`; tìm trong tên món, tên tác giả và ghi chú.
- Cả hai trả `DT.items`, `total`, `totalPages`. Mine trả thêm `DT.totals` gồm `total`, `approved`, `pending`, `rejected`, `private`; số lượng thuộc cùng phạm vi từ khóa, không giới hạn vào trang/tab.

## Frontend

- `useMyRecipes()` và `useFavorites()` mặc định chỉ gọi trang 1 với `limit=12`, không gom collection kể cả khi không truyền tham số.
- Hai trang gửi trang, từ khóa và trạng thái tới API; không lọc/cắt trang lại trên client. Kết quả khớp không dấu hoặc ghi chú do Backend trả được giữ nguyên.
- Query key chứa toàn bộ tham số và truyền AbortSignal để hủy request cũ. URL giữ trang/từ khóa/tab; đổi từ khóa/tab đặt lại trang 1. Tab `draft` gửi `status=private`.
- Badge lấy từ `DT.totals`, không đếm trang hiện tại hoặc dùng tổng tab đang chọn làm số Tất cả.
- Bỏ yêu thích cập nhật tức thì, rollback khi lỗi, refetch và điều chỉnh trang cuối. Sửa ghi chú làm mới các kết quả tìm kiếm liên quan.

## Ngoại lệ tương thích issue #79

Backend chưa có API tra cứu trạng thái yêu thích theo nhóm ID. `useFavoriteIds` giữ truy vấn riêng `['favorites', 'ids']`, cache 60 giây, chỉ chạy khi đã đăng nhập và có ID cần hiển thị. Chỉ truy vấn này còn dùng `fetchCollection` để giữ trạng thái đúng cho món sau 100 bản ghi đầu. Danh sách/tìm kiếm/phân trang không dùng truy vấn này. Khi có API lookup, thay riêng phần này mà không thay hai trang danh sách.

## Kiểm tra

- `npm run lint`, `npm test`, `npm run build` trong `frontend`.
- Test hook: trang mặc định và search/status chỉ gọi một lần; key phân biệt bộ lọc; lookup không dùng nhầm cache trang đã lọc; rollback cả trang và lookup.
- Test trang: URL page 2, kết quả máy chủ không bị lọc/cắt lại, tab riêng tư và badge tổng máy chủ.
- Edge với API giả lập 205 bản ghi: chuyển trang, lọc trạng thái/riêng tư, kết hợp tìm kiếm/trạng thái, tìm trong ghi chú, rollback bỏ lưu, điều chỉnh trang cuối, lỗi tải và thử lại đều đạt; các request danh sách đều có limit=12, không có lỗi JavaScript. Cần nghiệm thu staging với dữ liệu thật.
