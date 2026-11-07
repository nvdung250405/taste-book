# BIÊN BẢN NGHIỆM THU & ĐÁNH GIÁ PULL REQUEST #143

- **Dự án:** TasteBook (Học phần Project 1 - Nhóm 09)
- **Pull Request:** [#143](https://github.com/nvdung250405/taste-book/pull/143)
- **Tiêu đề PR:** `fix(be): [#119, #126, #128, #130, #132, #134, #136, #138, #140] align backend with updated SRS`
- **Tác giả PR:** `@Hiu-Small` (Nguyễn Trung Hiếu - Backend Lead)
- **Người nghiệm thu (Reviewer):** `@nvdung250405` (Ngô Văn Dũng - Project Manager)
- **Nhánh nguồn (Head):** `fix/backend-srs-compliance`
- **Nhánh đích (Base):** `develop`
- **Thời điểm nghiệm thu:** 04/11/2026

---

## 1. TỔNG QUAN PHẠM VI NGHIỆM THU

Pull Request #143 giải quyết toàn diện 9 issue kỹ thuật Backend theo bản đặc tả yêu cầu SRS mới ([`docs/01. SRS - Đặc tả yêu cầu - Nhóm-09.md`](../01.%20SRS%20-%20%C4%90%E1%BA%B7c%20t%E1%BA%A3%20y%C3%AAu%20c%E1%BA%A7u%20-%20Nh%C3%B3m-09.md)) và tài liệu đối soát [`docs/SRS-implementation-issues-2026-11-03.md`](../SRS-implementation-issues-2026-11-03.md):

1. **#119 (UC-20)**: Nâng cấp API kiểm duyệt công thức, hỗ trợ lọc theo trạng thái (`Pending`, `Approved`, `Rejected`), cơ chế Hủy duyệt (`Revoke`) và Duyệt lại (`Re-approve`).
2. **#126 (UC-19)**: Chặn cấm Admin sửa hoặc xóa công thức do User tạo (`author.role !== 'Admin'`) bằng mã lỗi HTTP 403 Forbidden.
3. **#128 (UC-04)**: Xây dựng cơ chế thu hồi token JWT tại server khi đăng xuất (`POST /auth/logout`) qua bảng `RevokedTokens` trong PostgreSQL và định danh `jti`.
4. **#130 (UC-08, UC-10)**: Chuẩn hóa nguyên liệu định tính ("vừa đủ", "nêm nếm"...), ép cứng `quantity = 0` và giữ nguyên không nhân tỉ lệ khi đổi khẩu phần (scale).
5. **#132 (UC-15)**: Bổ sung trường `activeShoppingTripCount` đếm số chuyến đi chợ dở dang; xóa thực đơn trong transaction an toàn, bảo toàn 100% dữ liệu danh sách đi chợ.
6. **#134 (UC-16)**: Trả về metadata chi tiết khi thêm món trùng; hỗ trợ cập nhật khẩu phần thay vì báo lỗi đơn thuần; bổ sung unique index `(recipeListId, recipeId)`.
7. **#136 (UC-02, UC-03, UC-05)**: Chuẩn hóa số điện thoại dạng `0...` và `+84...` về cùng một định dạng chuẩn khi đăng ký, đăng nhập và cập nhật hồ sơ cá nhân.
8. **#138 (UC-16, UC-17)**: Trả cờ `isRecipeDeleted` trong chi tiết thực đơn; chặn sửa khẩu phần món đã xóa nguồn; bắt buộc xác nhận danh sách món bị loại khi tạo danh sách đi chợ.
9. **#140 (UC-10, UC-11)**: Khóa toàn diện API sửa, xóa và đổi sang riêng tư đối với công thức đang chờ duyệt (`Pending`) của User.

---

## 2. KẾT QUẢ KIỂM THỬ THỰC TẾ (TEST EVIDENCE)

### 2.1. Backend Test Suite (Automated Jest Tests)

- **Lệnh thực thi:** `npm test --prefix backend`
- **Kết quả:** **23/23 Test Suites PASS (100%)**
- **Số lượng tests:** **1.670/1.670 tests PASS (100%)**
- **Thời gian chạy:** ~32.1 giây.
- **Chi tiết các bộ test chính:**
  - `tests/integration/tokenRevocation.test.js`: PASS (Kiểm thử thu hồi token, chặn 401 sau logout, optional guard).
  - `tests/integration/recipeList.test.js`: PASS (Kiểm thử metadata món trùng #134, cờ món xóa #138, liên kết đi chợ #132).
  - `tests/integration/recipe.test.js`: PASS (Kiểm thử khóa bài Pending #140, cấm Admin sửa bài User #126, định tính #130).
  - `tests/integration/auth.test.js`: PASS (Kiểm thử chuẩn hóa SĐT #136, đăng ký/đăng nhập đa định dạng).
  - `tests/unit/tokenRevocationService.test.js`: PASS (Kiểm thử dọn dẹp token hết hạn).

### 2.2. Frontend Test Suite (Regression Protection)

- **Lệnh thực thi:** `npm test --prefix frontend`
- **Kết quả:** **124/124 tests PASS (100%)**
- **Ghi nhận:** Thay đổi phía Backend không gây ra bất kỳ lỗi hồi quy nào cho giao diện người dùng hiện tại.

### 2.3. Static Code Analysis & Linting

- **Lệnh thực thi:** `npm run lint --prefix backend`
- **Kết quả:** **0 errors**, 31 warnings (các biến `Sequelize` không sử dụng trong file migration tự sinh của framework).

---

## 3. ĐÁNH GIÁ CHẤT LƯỢNG MÃ NGUỒN (CODE REVIEW CHECKLIST)

- [x] **Đúng kiến trúc & SRS**: Bám sát 100% luồng nghiệp vụ trong SRS mới và tài liệu đối soát ngày 03/11/2026.
- [x] **Toàn vẹn CSDL (Data Integrity)**: Toàn bộ các thao tác ghi xóa đa bảng đều bọc trong Sequelize Transaction (`transaction.commit()` / `transaction.rollback()`).
- [x] **Bảo mật (Security & RBAC)**: Token JWT bị thu hồi ngay lập tức sau khi logout; Admin không thể xâm phạm nội dung cá nhân của User; bài Pending được bảo vệ nghiêm ngặt chống sửa đổi trái phép.
- [x] **Tương thích ngược**: Có migration chuyển đổi CSDL an toàn (`16`, `17`, `18`).
- [x] **Tài liệu API (OpenAPI/Swagger)**: Đã cập nhật file `backend/swagger.yaml` đầy đủ cho các endpoint mới/bổ sung tham số.

---

## 4. KẾT LUẬN & QUYẾT ĐỊNH

- **Đánh giá chung:** ĐẠT CHUẨN XUẤT SẮC (APPROVED).
- **Quyết định:** Chấp thuận và thực hiện **Merge Pull Request #143 vào nhánh `develop`**.
- **Đóng các issue liên quan:**
  - Issue **#119** (BE Quản lý kiểm duyệt công thức)
  - Issue **#126** (BE Bảo vệ công thức của User trước Admin)
  - Issue **#128** (BE Thu hồi token JWT khi logout)
  - Issue **#130** (BE Chuẩn hóa nguyên liệu định tính)
  - Issue **#132** (BE Cảnh báo & bảo toàn dữ liệu khi xóa thực đơn)
  - Issue **#134** (BE Trả metadata món trùng & cập nhật khẩu phần)
  - Issue **#136** (BE Chuẩn hóa số điện thoại)
  - Issue **#138** (BE Xử lý công thức bị xóa trong thực đơn và đi chợ)
  - Issue **#140** (BE Khóa sửa/xóa bài viết Pending)
- **Kế hoạch tiếp theo:** Phân hệ Frontend (`@phoos3110`) tiếp tục triển khai các issue giao diện tương ứng (#124, #116, #129, #131, #133, #135, #137, #139, #141, #142).
