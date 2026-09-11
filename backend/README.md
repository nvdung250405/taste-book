# TasteBook Backend API 🍳

Dự án Backend cung cấp dịch vụ RESTful API cho nền tảng gợi ý công thức nấu ăn, quản lý thực đơn và đi chợ thông minh **TasteBook**. Được xây dựng dựa trên Node.js, Express.js, Sequelize ORM (v6) và cơ sở dữ liệu PostgreSQL.

---

## 🛠️ Yêu Cầu Hệ Thống & Cài Đặt Công Cụ

Để dự án hoạt động trơn tru dưới môi trường local, vui lòng cài đặt các phần mềm sau:

### 1. Node.js
* Khuyên dùng phiên bản LTS (Node v18, v20 hoặc v24.x trở lên).
* Link tải: [NodeJS Official Site](https://nodejs.org/)

### 2. Docker (Khuyên dùng để chạy PostgreSQL nhanh chóng)
* Sử dụng Docker giúp khởi chạy PostgreSQL chỉ với 1 câu lệnh mà không cần cài đặt trực tiếp lên hệ điều hành.
* Link tải: [Docker Desktop](https://www.docker.com/products/docker-desktop/)

### 3. DBeaver (Trình quản lý cơ sở dữ liệu trực quan)
* Công cụ UI mã nguồn mở giúp kết nối và quản trị CSDL PostgreSQL trực quan, thuận tiện.
* Link tải: [DBeaver Community](https://dbeaver.io/download/)

---

## 🚀 Hướng Dẫn Khởi Chạy Dự Án (Từng bước)

> **Lưu ý:** Nếu bạn đang đứng ở thư mục gốc của repository (`taste-book`), hãy mở terminal và di chuyển vào thư mục Backend:
> ```bash
> cd backend
> ```

### Bước 1: Khởi động PostgreSQL Database
Bạn có thể chọn 1 trong 2 cách sau để thiết lập cơ sở dữ liệu:

* **Lựa chọn A (Sử dụng Docker Compose đi kèm dự án - Khuyên dùng)**:
  Từ thư mục gốc `taste-book`, khởi động dịch vụ PostgreSQL container:
  ```bash
  docker compose -f Dockerfile/docker-compose.yml up -d db
  ```
  *(Database mặc định: port `5432`, username `postgres`, password `root` hoặc theo file cấu hình).*

* **Lựa chọn B (Cài PostgreSQL trực tiếp trên máy)**:
  Cài đặt PostgreSQL từ [PostgreSQL Official](https://www.postgresql.org/download/). Sử dụng DBeaver hoặc pgAdmin để tạo sẵn một database trống có tên `TasteBookDB` (hoặc `taste_book_db`).

---

### Bước 2: Cấu hình Môi Trường (`.env`)
1. Di chuyển vào thư mục `backend`:
   ```bash
   cd backend
   ```
2. Nhân bản file cấu hình mẫu từ `.env.example` thành `.env`:
   ```bash
   cp .env.example .env
   ```
3. Mở file `.env` và điền thông tin kết nối phù hợp:
   ```env
   PORT=5000
   REACT_URL=http://localhost:5173
   JWT_SECRET=
   JWT_EXPIRES_IN=

   # Cấu hình PostgreSQL
   DB_HOST=localhost
   DB_PORT=5432
   DB_DATABASE_NAME=taste_book_db
   DB_USERNAME=postgres
   DB_PASSWORD=password123
   DB_DIALECT=postgres

   # Cấu hình Cloudinary (Dành cho tính năng upload ảnh)
   CLOUDINARY_CLOUD_NAME=
   CLOUDINARY_API_KEY=
   CLOUDINARY_API_SECRET=
   ```

---

### Bước 3: Cài đặt Dependencies
Cài đặt toàn bộ các thư viện cần thiết cho Backend:
```bash
npm install
```

---

### Bước 4: Khởi Tạo Bảng & Nạp Dữ Liệu Mẫu (Migrations & Seeders)

Hệ thống hỗ trợ các lệnh quản trị CSDL tự động qua Sequelize CLI:

* **Cách 1: Thiết lập tự động trọn gói (Khuyên dùng)**:
  Tạo cấu trúc bảng và tự động nạp toàn bộ 15 bảng dữ liệu mẫu chỉ với 1 lệnh duy nhất:
  ```bash
  npm run db:setup
  ```

* **Cách 2: Chạy riêng từng bước**:
  1. Chạy Migrations (tạo bảng & khóa ngoại):
     ```bash
     npm run db:migrate
     ```
  2. Chạy Seeders (nạp dữ liệu mẫu 15 bảng vào CSDL):
     ```bash
     npm run db:seed
     ```

* **Các lệnh quản trị CSDL hữu ích khác**:
  * Hủy / Xóa sạch dữ liệu mẫu đã nạp:
    ```bash
    npm run db:seed:undo
    ```
  * Reset toàn bộ CSDL (xóa sạch bảng, tạo lại bảng mới và nạp lại dữ liệu mẫu từ đầu):
    ```bash
    npm run db:reset
    ```

---

### Bước 5: Khởi chạy Server Backend
Khởi động server ở chế độ Development (tự động reload khi sửa code với nodemon):
```bash
npm run start
```

Máy chủ API sẽ hoạt động tại: **`http://localhost:5000`**

---

### Bước 6: Kiểm Tra Chuẩn Code (Linting)
Trước khi commit hoặc tạo Pull Request, luôn chạy ESLint để đảm bảo không bị lỗi CI:
```bash
npm run lint
```

---

## 🔑 Tài Khoản Kiểm Thử Mẫu (Đã nạp sẵn trong Seed Data)

Sau khi chạy lệnh `npm run db:seed` hoặc `npm run db:setup`, bạn có thể sử dụng ngay các tài khoản sau để đăng nhập và kiểm thử chức năng:

| Loại tài khoản | Email đăng nhập | Mật khẩu mặc định | Vai trò (Role) | Ghi chú |
| :--- | :--- | :---: | :---: | :--- |
| **Quản trị viên (Admin)** | `admin@gmail.com` | `admin123` | **Admin** | Kiểm duyệt công thức, quản lý người dùng |
| **Bếp Trưởng Hoàng** | `chef.hoang@tastebook.vn` | `123456` | **User** | Tác giả của các món canh chua, thịt kho tàu |
| **Nguyễn Thị Lan Anh** | `lananh.kitchen@gmail.com` | `123456` | **User** | Người dùng đã có sẵn thực đơn & danh sách đi chợ mẫu |
| **Trần Minh Đức** | `duc.foodie@gmail.com` | `123456` | **User** | Người dùng thành viên |

---

## 📖 Tài Liệu Đặc Tả API (Swagger UI) & Postman Collections

* **Swagger UI:** Truy cập trực tiếp tại địa chỉ: **[http://localhost:5000/api-docs](http://localhost:5000/api-docs)**
* **Postman Collections (Thư mục `backend/postman/`):**
  * `tastebook_auth.postman_collection.json`: Bộ kiểm thử tự động toàn diện cho Phân hệ Xác thực & Phân quyền (Auth UC-02, UC-03, UC-04).
  * `tastebook_user_profile.postman_collection.json`: Bộ kiểm thử tự động cho Quản lý hồ sơ cá nhân & Đổi mật khẩu (UC-05).

---

## 📋 Quy Chuẩn Định Dạng Phản Hồi API (Response Format)

Tất cả các API trả về từ Backend bắt buộc tuân theo cấu trúc JSON 3 trường thống nhất:

```json
{
  "EC": 0,
  "EM": "Thông điệp phản hồi chi tiết",
  "DT": {}
}
```

* **`EC` (Error Code):** Mã lỗi nghiệp vụ (`0`: Thành công; `1`: Dữ liệu đầu vào không hợp lệ; `2`: Trùng lặp dữ liệu; `3`: Không tìm thấy tài nguyên; `4`: Không có quyền; `5`: Chưa đăng nhập / Hết hạn token; `6`: Sai thông tin đăng nhập; `-1`: Lỗi máy chủ).
* **`EM` (Error Message):** Chuỗi thông báo thân thiện để hiển thị Toast thông báo phía FrontEnd.
* **`DT` (Data):** Dữ liệu trả về (Object, Array hoặc `null`).

---

## 📂 Cấu Trúc Thư Mục Dự Án Backend

```text
backend/
├── postman/            # Các bộ Postman Collection kiểm thử tự động chuẩn EC
├── src/
│   ├── config/         # Cấu hình CSDL, CORS, Cloudinary, Swagger
│   ├── controllers/    # Tiếp nhận request & điều hướng nghiệp vụ
│   ├── middleware/     # Middleware xác thực JWT (JWTAction.js) & phân quyền RBAC
│   ├── migrations/     # 15 file migration tạo bảng CSDL PostgreSQL
│   ├── models/         # 15 Sequelize Models & quan hệ Associations
│   ├── routes/         # Định tuyến API (/api/v1/auth, /users, /recipes, /images...)
│   ├── seeders/        # 7 file nạp dữ liệu mẫu khởi tạo hệ thống
│   ├── services/       # Xử lý logic nghiệp vụ và truy vấn CSDL
│   └── server.js       # File khởi chạy chính của ứng dụng
├── .env.example        # File mẫu cấu hình biến môi trường
├── package.json        # Thư viện phụ thuộc và các scripts npm
└── README.md           # Tài liệu hướng dẫn cài đặt & vận hành dự án
```
