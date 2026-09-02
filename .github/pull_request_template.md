## 1. Mô tả

<!-- Mô tả ngắn gọn thay đổi và lý do thực hiện -->

## 2. Loại thay đổi

- [ ] Feature
- [ ] Bug fix
- [ ] Refactor
- [ ] Documentation
- [ ] Test
- [ ] CI/CD
- [ ] Configuration

## 3. Nội dung thay đổi

<!-- Liệt kê các thay đổi chính -->

- 
- 
- 

## 4. Issue liên quan

<!-- Ví dụ: Closes #123 -->

Closes #

## 5. Kiểm thử

- [ ] Đã chạy build thành công
- [ ] Đã chạy unit test
- [ ] Đã chạy integration test nếu cần
- [ ] Đã kiểm tra chức năng liên quan
- [ ] GitHub Actions CI đã Pass

## 6. Code Review Checklist

### Code Quality

- [ ] Code dễ đọc và dễ bảo trì
- [ ] Đặt tên biến/hàm rõ ràng
- [ ] Không có code thừa hoặc debug code
- [ ] Tuân thủ quy ước của dự án

### Security

- [ ] Không chứa password
- [ ] Không chứa API Key/API Secret
- [ ] Không chứa JWT Secret
- [ ] Không chứa database credential
- [ ] Không hard-code thông tin nhạy cảm

### Testing

- [ ] Có test phù hợp với thay đổi
- [ ] Test hiện có không bị lỗi
- [ ] Đã kiểm tra các trường hợp lỗi quan trọng

### Database/API/Configuration

- [ ] Không ảnh hưởng database hiện có
- [ ] Nếu có thay đổi database, đã kiểm tra migration/schema
- [ ] Nếu có thay đổi API, đã kiểm tra các chức năng liên quan
- [ ] Environment Variables được sử dụng đúng cách

## 7. Ảnh hưởng

- [ ] Không ảnh hưởng chức năng hiện có
- [ ] Có ảnh hưởng frontend
- [ ] Có ảnh hưởng backend
- [ ] Có thay đổi database
- [ ] Có thay đổi API
- [ ] Có thay đổi Docker
- [ ] Có thay đổi CI/CD
- [ ] Có thay đổi Environment Variables

## 8. Ghi chú cho Reviewer

<!-- Nêu những phần cần reviewer chú ý -->

## 9. Checklist trước khi Merge

- [ ] Pull Request có mô tả đầy đủ
- [ ] CI Pass
- [ ] Build Pass
- [ ] Test Pass
- [ ] Không còn merge conflict
- [ ] Đã xử lý các review comment quan trọng
- [ ] Đã có ít nhất 1 Approval nếu áp dụng
- [ ] Không có secret trong source code
- [ ] Đã tự review code
- [ ] Sẵn sàng merge
