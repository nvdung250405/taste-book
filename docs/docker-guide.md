# Hướng Dẫn Khởi Chạy Hệ Thống TasteBook Bằng Docker

Tài liệu này tổng hợp chi tiết các bước để khởi chạy và quản lý dự án (bao gồm Database PostgreSQL, Backend Node.js và Frontend React/Vite) sử dụng Docker Desktop, cùng với các cách xử lý lỗi đã gặp phải.

## 1. Yêu Cầu Cần Thiết
- Đã cài đặt **Docker Desktop** và đảm bảo trạng thái đang chạy (hiển thị biểu tượng `Engine running` màu xanh lá ở góc dưới phần mềm).
- Sử dụng Terminal (Command Prompt, PowerShell, hoặc Terminal tích hợp trong VS Code).

## 2. Cấu Trúc Thư Mục
Để lệnh build chạy thành công, cấu trúc thư mục dự án cần tuân thủ đúng như khai báo trong `docker-compose.yml`:
```text
/Project-Folder
├── backend/
│   └── Dockerfile         # Dockerfile cho Node.js
├── frontend/
│   └── Dockerfile         # Dockerfile cho React/Vite
└── Dockerfile/            # (Nơi chứa file compose)
    └── docker-compose.yml
```

## 3. Các Bước Khởi Chạy

**Bước 1: Mở Terminal và di chuyển vào đúng thư mục**
Nếu sử dụng Command Prompt (CMD) trên Windows và thư mục nằm ở ổ đĩa khác ổ C, bạn phải sử dụng thêm cờ `/d` để đổi ổ đĩa.
```cmd
cd /d ...\taste-book\Dockerfile
```

**Bước 2: Khởi tạo hệ thống**
Chạy lệnh sau để Docker tiến hành tải image, build code và chạy ngầm (chế độ detached):
```bash
docker compose up --build -d
```
*(Chờ đến khi Terminal báo `Started` ở tất cả các dịch vụ).*

## 4. Kiểm Tra Tình Trạng Hoạt Động

Bạn có thể truy cập các dịch vụ theo các địa chỉ sau:

| Dịch Vụ | Phương Thức Truy Cập | Ghi chú |
| :--- | :--- | :--- |
| **Frontend** | Trình duyệt: `http://localhost:5173` | Giao diện React hiển thị tại đây. |
| **Backend API** | Trình duyệt / Postman: `http://localhost:5000` | Nếu truy cập trình duyệt hiện `404 Not Found` ở thư mục gốc `/` là **bình thường**. Backend API chỉ phản hồi đúng các đường dẫn route đã khai báo (vd: `/api/login`). |
| **Database** | Phần mềm DBeaver, TablePlus, pgAdmin | **KHÔNG** dùng trình duyệt (sẽ báo lỗi `ERR_EMPTY_RESPONSE`).<br>Kết nối bằng thông tin:<br>- Host: `localhost`<br>- Port: `5432`<br>- User: `postgres`<br>- Pass: `root`<br>- DB: `TasteBookDB` |

## 5. Xử Lý Các Lỗi Thường Gặp

### 5.1. Lỗi "lease does not exist: not found" khi đang build
Lỗi này xuất phát từ bộ nhớ đệm (build cache) của Docker bị hỏng.
**Cách khắc phục:**
1. Xóa toàn bộ cache: `docker builder prune -a -f`
2. Khởi động lại ứng dụng Docker Desktop.
3. Build lại từ đầu không dùng cache: `docker compose build --no-cache` rồi chạy `docker compose up -d`.

### 5.2. Lỗi "Lỗi kết nối máy chủ!" hiển thị trên giao diện Frontend
Mặc dù container Frontend và Backend báo xanh (Running), Frontend vẫn không gọi được API.
**Cách khắc phục:**
1. Nhấn `F12` trên trình duyệt, mở tab **Network**, bấm lại nút gửi dữ liệu.
2. Kiểm tra `Request URL` bị báo đỏ.
3. Nếu URL đang là `http://backend:5000/...`, trình duyệt không thể gọi được do trình duyệt nằm ngoài mạng Docker. Cần sửa code Frontend để gọi URL tuyệt đối là `http://localhost:5000/...`.
4. Nếu Console báo lỗi `CORS policy`, hãy kiểm tra lại cấu hình middleware `cors` trong file khởi tạo server của Node.js.

## 6. Các Lệnh Quản Lý Nhanh

- **Dừng hệ thống (tạm thời):**
  ```bash
  docker compose stop
  ```
- **Tắt và dọn dẹp các container (Dữ liệu PostgreSQL vẫn được giữ lại do đã mount volume `pgdata`):**
  ```bash
  docker compose down
  ```
- **Xem log thực tế của toàn bộ hệ thống để tìm lỗi (nếu crash):**
  ```bash
  docker compose logs -f
  ```
- **Xem log của riêng backend:**
  ```bash
  docker compose logs -f backend
  ```
