# Sử dụng image Node.js phiên bản nhẹ
FROM node:20-alpine

# Thiết lập thư mục làm việc
WORKDIR /app

# Copy file package.json và package-lock.json (nếu có)
COPY package.json package-lock.json ./

# Cài đặt các thư viện Node.js
RUN npm install

# Copy toàn bộ mã nguồn backend vào container
COPY . .

# Khai báo port mà Express.js server đang lắng nghe (thường là 5000 hoặc 3000)
# Bạn có thể thay đổi số 5000 này cho khớp với cấu hình trong file mã nguồn của bạn
EXPOSE 5000

# Lệnh khởi chạy server (Thay "npm start" bằng lệnh chạy thực tế của bạn, ví dụ: "node index.js")
CMD ["npm", "start"]