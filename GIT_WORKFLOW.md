# Git Workflow – TasteBook

## 1. Mục đích

Tài liệu này quy định cách quản lý mã nguồn bằng Git/GitHub cho dự án TasteBook. Mục tiêu là:

- Quản lý source code thống nhất.
- Hạn chế xung đột khi nhiều thành viên cùng phát triển.
- Chuẩn hóa branch và commit.
- Kiểm soát thay đổi thông qua Pull Request.
- Đảm bảo code được kiểm tra trước khi merge và triển khai.

---

## 2. Mô hình phân nhánh

TasteBook sử dụng mô hình:

```text
main
  │
  └── develop
        ├── feature/*
        ├── fix/*
        └── hotfix/*
```

### 2.1. `main`

- Là branch Production.
- Chỉ chứa phiên bản ổn định.
- Không commit trực tiếp.
- Không merge code chưa được review và kiểm tra.
- Chỉ nhận code từ `develop` hoặc `hotfix/*` theo quy trình.

### 2.2. `develop`

- Là branch tích hợp các tính năng đã hoàn thành.
- Dùng làm cơ sở để tạo `feature/*` và `fix/*`.
- Hạn chế commit trực tiếp.
- Code được đưa vào thông qua Pull Request.

### 2.3. `feature/*`

Dùng để phát triển tính năng mới.

Ví dụ:

```text
feature/login
feature/recipe-management
feature/recipe-search
feature/cloudinary-upload
```

Branch được tạo từ `develop` và sau khi hoàn thành sẽ tạo Pull Request vào `develop`.

### 2.4. `fix/*`

Dùng để sửa lỗi phát hiện trong quá trình phát triển.

Ví dụ:

```text
fix/login-validation
fix/recipe-search
fix/image-upload
```

Branch được tạo từ `develop` và merge vào `develop` sau khi review và CI đạt yêu cầu.

### 2.5. `hotfix/*`

Dùng để xử lý lỗi nghiêm trọng đang xảy ra trên Production.

Ví dụ:

```text
hotfix/production-login-error
hotfix/database-connection
```

Branch được tạo từ `main`. Sau khi hoàn thành phải cập nhật thay đổi cần thiết về cả `main` và `develop`.

---

## 3. Quy tắc đặt tên branch

- Sử dụng chữ thường.
- Dùng dấu `-` để phân tách các từ.
- Không sử dụng khoảng trắng.
- Tên phải ngắn gọn và mô tả đúng công việc.
- Sử dụng đúng prefix: `feature/`, `fix/`, `hotfix/`.

Ví dụ hợp lệ:

```text
feature/user-registration
feature/recipe-management
fix/recipe-validation
hotfix/database-connection
```

Ví dụ không nên dùng:

```text
newfeature
test
abc
mybranch
fix
```

---

## 4. Quy trình tạo branch

Trước khi bắt đầu công việc:

```bash
git checkout develop
git pull origin develop
git checkout -b feature/<ten-tinh-nang>
```

Ví dụ:

```bash
git checkout develop
git pull origin develop
git checkout -b feature/recipe-management
```

---

## 5. Quy tắc Commit

TasteBook sử dụng cú pháp Conventional Commits:

```text
<type>: <description>
```

### 5.1. Các loại Commit

| Type | Ý nghĩa | Ví dụ |
|---|---|---|
| `feat` | Thêm chức năng | `feat: add recipe search` |
| `fix` | Sửa lỗi | `fix: validate recipe input` |
| `docs` | Tài liệu | `docs: update git workflow` |
| `refactor` | Tái cấu trúc | `refactor: improve recipe service` |
| `test` | Kiểm thử | `test: add recipe service tests` |
| `chore` | Bảo trì/cấu hình | `chore: update docker config` |
| `ci` | CI/CD | `ci: add github actions workflow` |

### 5.2. Quy tắc Commit

- Commit message phải mô tả rõ thay đổi.
- Một commit nên tập trung vào một mục đích.
- Không dùng message quá chung chung.
- Không commit password, API key, API secret, JWT secret hoặc database credential.
- Kiểm tra code và test trước khi push.

Ví dụ tốt:

```text
feat: add recipe management
fix: prevent duplicate recipe names
test: add recipe service tests
docs: update deployment guide
ci: add docker build workflow
```

Không nên:

```text
update
fix
test
abc
final
final2
```

---

## 6. Quy trình Push Code

Sau khi hoàn thành thay đổi:

```bash
git status
git add .
git commit -m "feat: add recipe management"
git push origin feature/recipe-management
```

Không sử dụng `git add .` nếu chưa kiểm tra các file được thay đổi.

Trước khi push cần đảm bảo:

- Không có file chứa secret.
- Không có file build/cache không cần thiết.
- Code đã được kiểm tra.
- Test liên quan đã chạy.

---

## 7. Quy trình Pull Request

Luồng chuẩn:

```text
feature/* / fix/*
        ↓
      GitHub
        ↓
   Pull Request
        ↓
 GitHub Actions CI
        ↓
 Code Check → Build → Test
        ↓
    Code Review
        ↓
   Approval
        ↓
 Merge → develop
```

### 7.1. Tạo Pull Request

Pull Request phải:

- Có tiêu đề rõ ràng.
- Mô tả nội dung thay đổi.
- Nêu các chức năng/lỗi đã xử lý.
- Nêu cách kiểm thử.
- Sử dụng Pull Request Template.
- Liên kết Issue nếu có.

### 7.2. Pull Request vào `develop`

Chỉ merge khi:

- CI Pass.
- Build thành công.
- Test bắt buộc Pass.
- Không còn conflict.
- Review đạt yêu cầu.
- Các comment bắt buộc đã được xử lý.

### 7.3. Pull Request vào `main`

Pull Request `develop → main` dùng để phát hành Production.

Yêu cầu:

- Phiên bản đã được kiểm thử trên Preview.
- CI Pass.
- Build và Test Pass.
- Code Review/Approval hoàn tất.
- Không còn conflict.
- Không chứa secret.
- Được xác nhận là phiên bản có thể phát hành.

---

## 8. Quy trình Code Review

Reviewer cần kiểm tra:

### Chức năng

- Code có đúng yêu cầu không?
- Có làm ảnh hưởng chức năng hiện tại không?
- Có xử lý các trường hợp lỗi cần thiết không?

### Code Quality

- Code dễ đọc và dễ bảo trì.
- Tên biến/hàm rõ ràng.
- Không có code thừa.
- Không có debug code.
- Tuân thủ cấu trúc dự án.

### Testing

- Có test phù hợp với thay đổi.
- Test quan trọng đã Pass.
- Không làm hỏng test hiện có.

### Security

- Không có password hoặc API key.
- Không có secret trong source code.
- Không log thông tin nhạy cảm.
- Không vô tình đưa file cấu hình nhạy cảm vào repository.

### Database/API/Configuration

- Thay đổi database được kiểm tra.
- Thay đổi API không phá vỡ chức năng hiện tại.
- Environment Variables được sử dụng thay cho secret hard-code.

---

## 9. Quy định Approval và Merge

Pull Request phải có ít nhất **1 reviewer approval** nếu nhóm có nhiều thành viên.

Không được merge khi:

- CI đang Failed.
- Có lỗi build.
- Test bắt buộc Failed.
- Còn conflict.
- Còn comment quan trọng chưa xử lý.
- Có secret trong source.
- Reviewer chưa approve.

Có thể sử dụng **Squash and Merge** để giữ lịch sử branch `main` và `develop` gọn hơn.

---

## 10. Quy trình xử lý Review Comment

```text
Reviewer phát hiện vấn đề
        ↓
Comment trên Pull Request
        ↓
Developer sửa code
        ↓
Push commit mới
        ↓
CI chạy lại
        ↓
Reviewer kiểm tra lại
        ↓
Approve
```

Developer không nên đóng hoặc bỏ qua comment quan trọng khi chưa xử lý.

---

## 11. Đồng bộ branch

Trước khi tạo Pull Request, Developer nên cập nhật branch từ `develop`:

```bash
git checkout develop
git pull origin develop
```

Sau đó cập nhật branch đang làm việc theo chiến lược mà nhóm thống nhất.

Mục tiêu là giảm khả năng xảy ra merge conflict và đảm bảo code được xây dựng trên nền code mới nhất.

---

## 12. Tích hợp với CI/CD

GitHub Actions thực hiện CI:

```text
Push / Pull Request
        ↓
GitHub Actions
        ↓
Code Check
        ↓
Build
        ↓
Test
        ↓
Docker Build
        ↓
CI Success / CI Failed
```

Nếu CI Failed:

```text
CI Failed → Không Merge → Developer sửa → Push lại → CI chạy lại
```

Sau khi merge vào `develop`, phiên bản có thể được triển khai lên Preview trên Render.

Sau khi `develop` được kiểm thử ổn định và merge vào `main`, phiên bản Production được triển khai trên Render.

---

## 13. Quản lý Secret

Không được lưu trực tiếp các thông tin sau trong repository:

- Password.
- Database credential.
- API Key.
- API Secret.
- JWT Secret.
- Render Deploy Hook/Token.
- Các thông tin xác thực khác.

Development sử dụng Environment Variables cục bộ.

Preview và Production sử dụng Environment Variables/Secrets được cấu hình trên Render.

File `.env.local` phải được thêm vào `.gitignore`.

---

## 14. Rollback

Khi phiên bản Production gặp lỗi nghiêm trọng:

1. Kiểm tra deployment log trên Render.
2. Xác định phiên bản ổn định trước đó.
3. Rollback hoặc redeploy phiên bản ổn định.
4. Tạo `hotfix/*` để xử lý nguyên nhân.
5. Chạy lại CI và review.
6. Triển khai lại sau khi đã xác nhận lỗi được khắc phục.

---

## 15. Quy trình tổng thể

```text
Developer
   ↓
feature/* hoặc fix/*
   ↓
Code + Local Test
   ↓
Conventional Commit
   ↓
Push GitHub
   ↓
Pull Request
   ↓
GitHub Actions
   ↓
Code Check → Build → Test → Docker Build
   ↓
Code Review
   ↓
Approval
   ↓
Merge → develop
   ↓
Preview trên Render
   ↓
Integration Test
   ↓
Pull Request → main
   ↓
Review + CI
   ↓
Production trên Render
```

## 16. Nguyên tắc bắt buộc

- Mọi thay đổi source code phải được quản lý bằng Git.
- Không commit trực tiếp vào `main`.
- Thay đổi tính năng/lỗi phải sử dụng branch phù hợp.
- Pull Request phải được review trước khi merge.
- CI phải Pass trước khi merge.
- Không lưu secret trong repository.
- Chỉ triển khai Production phiên bản đã được kiểm tra.
- Khi phát hiện lỗi Production phải có khả năng rollback.
