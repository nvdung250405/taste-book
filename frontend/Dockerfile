# Stage 1: Build ứng dụng React bằng Node.js
FROM node:20-alpine AS builder

# Thiết lập thư mục làm việc trong container
WORKDIR /app

# Copy các tệp quản lý gói để cài đặt dependencies (tận dụng Docker cache)
COPY package.json package-lock.json ./
RUN npm ci

# Copy toàn bộ mã nguồn frontend vào container
COPY . .

# Chạy lệnh build của Vite (sẽ tạo ra thư mục 'dist')
RUN npm run build

# Stage 2: Phục vụ ứng dụng bằng Nginx
FROM nginx:alpine

# Xóa trang mặc định của Nginx
RUN rm -rf /usr/share/nginx/html/*

# Copy thư mục 'dist' từ Stage 1 sang thư mục phục vụ của Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80 để giao tiếp bên ngoài
EXPOSE 80

# Chạy Nginx
CMD ["nginx", "-g", "daemon off;"]