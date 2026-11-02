# Issue #112 — Công thức bị từ chối

- Dùng chung `recipeStatus` cho bộ lọc, số đếm cục bộ và MyRecipeCard; Rejected được ưu tiên trước isPublic.
- Card hiển thị nhãn đỏ, lý do từ chối và đường sửa; bỏ nhãn Riêng tư gây nhầm trên bài bị từ chối.
- Test bao phủ isPublic=false/approvalStatus=Rejected, số đếm, bộ lọc và HTML card.

### Đồng bộ Backend

PR #114 (commit 4096067, đã có trên develop) sửa API: rejected lọc theo approvalStatus, private loại Rejected và totals ưu tiên Rejected. MyRecipesPage tiếp tục dùng phân trang và totals của API, không tải toàn bộ dữ liệu để lọc tại client.

Test trang Bị từ chối dùng dữ liệu phản hồi theo hợp đồng API mới: isPublic=false/Rejected, nhãn đỏ, lý do, số đếm rejected/private và query status=rejected. Thay đổi trong nhánh này chỉ thuộc frontend. Chưa kiểm thử luồng Admin từ chối rồi tác giả tải lại với Backend đang chạy.

## Kiểm tra

119 test frontend đạt; lint và production build đạt. Không thay đổi Backend.
