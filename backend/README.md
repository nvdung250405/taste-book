# TasteBook Backend API 🍳

Dự án Backend cung cấp APIs cho ứng dụng chia sẻ công thức nấu ăn và đi chợ **TasteBook**. Được xây dựng dựa trên Node.js, Express, Sequelize ORM và PostgreSQL.

---

## 🛠️ Yêu Cầu Hệ Thống & Cài Đặt Công Cụ

Để dự án hoạt động trơn tru dưới local của bạn, vui lòng cài đặt các phần mềm sau:

### 1. Node.js
* Tải và cài đặt phiên bản LTS (khuyên dùng Node v18 hoặc v20 trở lên, ở dự án này thì nên cài v24.17.0 cho giống với ở Backend).
* Link tải: [NodeJS Official Site](https://nodejs.org/)

### 2. Docker (Khuyên dùng để cài PostgreSQL nhanh chóng)
* Sử dụng Docker giúp chạy cơ sở dữ liệu PostgreSQL ngay lập tức chỉ với 1 câu lệnh mà không cần cài đặt trực tiếp trên hệ điều hành.
* Link tải: [Docker Desktop](https://www.docker.com/products/docker-desktop/)

### 3. DBeaver (Trình quản lý cơ sở dữ liệu trực quan)
* Công cụ UI giúp kết nối và quản lý cơ sở dữ liệu PostgreSQL trực quan hơn.
* Link tải: [DBeaver Community](https://dbeaver.io/download/)

---

## 🚀 Hướng Dẫn Khởi Chạy Dự Án (Từng bước)

### Bước 1: Khởi động PostgreSQL Database
Bạn có 2 lựa chọn để thiết lập cơ sở dữ liệu:

* **Lựa chọn A (Dùng Docker - Khuyên dùng)**:
  Mở Terminal tại thư mục gốc dự án và chạy lệnh sau để khởi động Postgres container trong nền:
  ```bash
  docker compose up -d
  ```
  *(Database `TasteBookDB` sẽ tự động được tạo với thông tin kết nối mặc định: port `5432`, user `postgres`, password `root`)*

* **Lựa chọn B (Cài PostgreSQL trực tiếp trên máy)**:
  Tải và cài đặt PostgreSQL thủ công từ [PostgreSQL Official](https://www.postgresql.org/download/). Nhớ tạo sẵn một database trống có tên là `TasteBookDB` thông qua pgAdmin hoặc DBeaver.

---

### Bước 2: Cấu hình Môi Trường (`.env`)
1. Nhân bản file cấu hình mẫu từ `.env.example` thành `.env`:
   ```bash
   cp .env.example .env
   ```
2. Mở file `.env` ra và điền các thông tin phù hợp. Nếu bạn chạy PostgreSQL qua Docker ở Bước 1, sử dụng cấu hình mặc định sau:
   ```env
   PORT=8080
   JWT_SECRET=hiusmall
   JWT_EXPIRES_IN=1h

   # Cấu hình PostgreSQL
   DB_HOST=localhost
   DB_PORT=5432
   DB_DATABASE_NAME=TasteBookDB
   DB_USERNAME=postgres
   DB_PASSWORD=root
   DB_DIALECT=postgres

   # Cấu hình Cloudinary (Thành viên Backend cung cấp)
   CLOUDINARY_CLOUD_NAME=
   CLOUDINARY_API_KEY=
   CLOUDINARY_API_SECRET=
   ```

---

### Bước 3: Cài đặt Dependencies
Chạy lệnh sau để tải các thư viện cần thiết:
```bash
npm install
```

---

### Bước 4: Chạy Cơ Chế Khởi Tạo Bảng (Migrations)
Sequelize sẽ tự động đồng bộ hóa cấu trúc database (tạo các bảng, ràng buộc khóa ngoại):
```bash
npx sequelize-cli db:migrate
```
*(Nếu muốn xóa sạch toàn bộ các bảng trong database để chạy lại từ đầu, bạn có thể chạy lệnh rollback: `npx sequelize-cli db:migrate:undo:all`)*

---

### Bước 5: Khởi chạy Server
Chạy lệnh sau để khởi động dự án ở chế độ Development (sử dụng nodemon tự động reload khi sửa code):
```bash
npm run start
```

Dự án sẽ chạy tại địa chỉ: `http://localhost:8080`

---

## 📖 Tài Liệu Đặc Tả API (Swagger)

Dự án tích hợp sẵn **Swagger UI** để đội FrontEnd tra cứu nhanh danh sách API, các tham số đầu vào, định dạng dữ liệu đầu ra và chạy thử nghiệm.

* Địa chỉ truy cập Swagger: [http://localhost:8080/api-docs](http://localhost:8080/api-docs)

---

## 💾 Đồng Bộ Dữ Liệu Thực Tế (Backup & Restore)

Để đội ngũ FrontEnd có dữ liệu thực tế giống với dữ liệu bạn đang thao tác dưới Backend, bạn có thể thực hiện Import/Export theo hướng dẫn sau:

### Cách 1: Sử dụng DBeaver (Khuyên dùng)
* **Xuất file SQL (Backup)**: Click chuột phải vào database `TasteBookDB` -> **Tools** -> **Backup database** -> Chọn schema `public` -> Thiết lập file đầu ra dạng `.sql` -> Nhấn **Start**.

* **Nhập file SQL (Restore)**: Tạo database trống tên `TasteBookDB` -> Click chuột phải vào database mới -> **Tools** -> **Restore database** -> Chọn file `.sql` nhận từ Backend -> Nhấn **Start**.

### Cách 2: Sử dụng Dòng lệnh (Khi chạy PostgreSQL bằng Docker)
* **Xuất dữ liệu từ Backend**:
  ```bash
  docker exec -t postgresql pg_dump -U postgres -d TasteBookDB > tastebook_backup.sql
  ```
* **Nhập dữ liệu phía FrontEnd** (Sau khi copy file backup vào thư mục gốc dự án):
  ```bash
  cat tastebook_backup.sql | docker exec -i postgresql psql -U postgres -d TasteBookDB
  ```

---

## 📂 Cấu trúc thư mục quan trọng đối với FrontEnd

* `src/routes/`: Nơi định nghĩa các tuyến đường API và Swagger annotations. Ví dụ:
  * `src/routes/upload.js`: Chứa API upload & xóa ảnh (`/api/v1/image/upload`, `/api/v1/image/delete`).
* `src/models/`: Cấu trúc dữ liệu của các thực thể trong cơ sở dữ liệu để tham chiếu kiểu dữ liệu nếu cần.
