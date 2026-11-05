# Đề xuất dữ liệu seed TasteBook — ẩm thực Việt Nam

Ngày soạn: 05/11/2026. Trạng thái: đã chuyển dữ liệu vào các file seed `02`–`07`, giữ nguyên file tài khoản `01`. Chưa chạy seed/reset hoặc thay đổi schema/cơ sở dữ liệu.

## 1. Quy mô và cách kế thừa dữ liệu

- Giữ nguyên 4 tài khoản của `01-seed-users.js`, gồm 1 Admin và 3 User; giữ email, số điện thoại, avatar, cách tạo mật khẩu và vai trò hiện tại. Không chép mật khẩu vào tài liệu này.
- Có **20 công thức chuẩn công khai** và **6 công thức cá nhân riêng tư**, tổng cộng **26 công thức**. Hiểu “tầm 20 công thức chuẩn” là bộ món công khai; mỗi User có thêm 2 món riêng tư, đúng khoảng 2–3 món được yêu cầu.
- Kế thừa 5 món thực tế đầu tiên và giữ ID tương ứng, chỉnh định lượng và hướng dẫn đầy đủ hơn; riêng tên phở bỏ tuyên bố “gia truyền” như giải thích ở phần 7. Các bản ghi kiểm thử ID 6–10 hiện tại không thuộc bộ dữ liệu trình diễn mới; nếu còn cần kiểm thử thì chuyển sang bộ fixture riêng khi triển khai.
- ID 1–20 của công thức trong tài liệu là ID mục tiêu cho **database seed mới**. Không áp dụng cách ghi đè ID này vào database đang có người dùng thật hoặc dữ liệu cần giữ.
- 20 công thức chuẩn: `authorId=1`, `isPublic=true`, `approvalStatus="Approved"`. Đây là đề xuất chuyển quyền tác giả của 5 món cũ sang tài khoản quản lý thư viện chuẩn, phù hợp luồng tạo công thức chuẩn hiện tại của Admin.
- 6 công thức riêng tư: `authorId` tương ứng User, `isPublic=false`, `approvalStatus="Approved"`. Trạng thái Approved của bài riêng tư khớp service hiện tại; quyền xem vẫn phải phụ thuộc `isPublic` và chủ sở hữu.
- Giữ URL ảnh hiện có của 5 món ID 1–5. Các món ID 6–26 ban đầu để `thumbnailUrl=null` để bổ sung sau; hiện đã được người dùng điền URL ảnh trong seed. Ảnh bổ sung có thể là null hoặc URL HTTP/HTTPS hợp lệ, không bắt buộc giữ null. Mọi công thức có `rejectionReason=null`, `isDeleted=false`. Không dùng ảnh của món khác.
- Bản này là các **phiên bản nấu gia đình được chuẩn hóa định lượng**, không khẳng định tồn tại một công thức duy nhất cho mỗi món hay mọi địa phương. Chưa nấu thử; cần hiệu chỉnh cảm quan khi sử dụng thực tế, đặc biệt độ mặn của mắm và độ hút nước của bột/gạo.

### Tài khoản giữ nguyên

| id | username | email | role | Công thức riêng tư |
|---|---|---|---|---|
| 1 | System Admin | admin@gmail.com | Admin | Không phân bổ trong bộ này |
| 2 | Bếp Trưởng Hoang | chef.hoang@tastebook.vn | User | 21, 22 |
| 3 | Nguyễn Thị Lan Anh | lananh.kitchen@gmail.com | User | 23, 24 |
| 4 | Trần Minh Đức | duc.foodie@gmail.com | User | 25, 26 |

## 2. Quy tắc dữ liệu áp dụng

Đối chiếu `backend/src/models/`, `recipeService.js`, `shoppingListService.js` và 7 seeder hiện có; ưu tiên model/service thực tế khi tài liệu `PROJECT_RULES.md` mô tả tên trường cũ.

| Đối tượng | Quy tắc khi chuyển tài liệu sang seed |
|---|---|
| Recipes | Dùng `id`, `authorId`, `title`, `description`, `thumbnailUrl`, `cookTimeMinutes`, `difficulty`, `defaultServings`, `isPublic`, `approvalStatus`, `rejectionReason`, `isDeleted`, timestamps. |
| Difficulty | Chỉ `Easy`, `Medium`, `Hard`. |
| Thời gian | `cookTimeMinutes` là thời gian nấu/gia nhiệt dự kiến ở khẩu phần mặc định, không cộng ngâm và ướp. Mỗi món ghi thêm thời gian chuẩn bị/chờ trong mô tả. Khi đổi khẩu phần, không nhân thời gian này theo hệ số; tổng thời gian có thể tăng do chờ sôi, chia mẻ hoặc thay dụng cụ. Đây là quy ước dữ liệu đề xuất, không phải trường mới. |
| Khẩu phần | Số nguyên dương; món ăn với cơm được tính là số người chia món trong một bữa có món khác. Cơm trắng ăn kèm không tự động nằm trong nguyên liệu nếu không liệt kê. |
| RecipeIngredients | Dùng `recipeId`, `ingredientId`, `quantity`, `unitId`, `customIngredientName=null`, `customUnit=null`; **không dùng cột `unit` cũ**. |
| Định lượng | Tất cả dòng của bộ món này có quantity dương, tối đa 2 chữ số thập phân. Nguyên liệu hệ thống dùng đúng đơn vị mặc định trong danh mục bên dưới. |
| CookingSteps | Dùng `recipeId`, `stepNumber`, `instruction` và timestamps; đánh số liên tục từ 1 riêng cho từng món. Model hiện tại **không có `mediaUrl` hoặc `timerSeconds`**; thời gian và nhiệt độ ghi trong instruction. |
| RecipeCategories | Mỗi cặp `(recipeId, categoryId)` xuất hiện một lần. Danh mục của User chỉ gắn vào công thức của chính User đó. |
| Timestamps | Khi triển khai, tạo một biến `now` cho một lượt seed và dùng nhất quán. Không dùng ngày tương lai để giả tương tác. |
| ShoppingListItems | Model này vẫn dùng chuỗi `unit`, lấy đúng `Units.unitName`; không đổi nhầm thành `unitId`. |

Khối lượng g là phần nguyên liệu được sử dụng sau nhặt bỏ phần không ăn được, trừ các dòng ghi rõ còn xương/vỏ. Gạo, bột, đậu và nấm khô cân trước ngâm. Tôm của các món bên dưới tính phần thịt đã bóc vỏ; khi đi chợ cần mua nhiều hơn do hao hụt. Nước nấu thuộc nguyên liệu; nước rửa, nước chần bỏ và nước vận hành xửng hấp là vật tư thao tác, không cộng vào khẩu phần. Dầu chiên là lượng cấp cho chảo, không phải lượng dầu thực sự hấp thụ.

Mỗi nguyên liệu chỉ có một dòng trong một món, kể cả dùng cho nước chấm và phần chính. Hướng dẫn ghi cách chia lượng; các lượng thành phần phải cộng đúng lượng tổng. Không thay “gà” bằng “heo”, “nước cốt dừa” bằng “nước dừa”, hoặc “dầu màu điều” bằng “hạt điều”.

### Viết hướng dẫn để sử dụng khi đổi số người ăn

Bảng nguyên liệu và thông tin số bánh/cuốn trong mô tả là dữ liệu gốc cho `defaultServings`. Trước khi nấu với số người khác, tính lại **toàn bộ bảng nguyên liệu** theo `quantity × targetServings / defaultServings`, rồi thực hiện các bước với bảng đã đổi. Trong các bước dưới đây, “lượng trong bảng”, “toàn bộ”, “một nửa”, “phần còn lại” đều chỉ lượng **sau khi đổi khẩu phần**.

| Nội dung | Cách áp dụng |
|---|---|
| Nguyên liệu dùng một lần | Tham chiếu tên nguyên liệu; dùng toàn bộ lượng đã tính trong bảng, trừ khi bước đó yêu cầu chia hoặc giữ lại. |
| Nguyên liệu dùng nhiều lần | Chia theo phân số hoặc tỉ lệ nêu trong bước. Mọi phân số đều tính trên **tổng lượng ban đầu của chính nguyên liệu đó trong bảng đã đổi**, trừ khi ghi rõ lấy từ một hỗn hợp/phần đã tách. “Phần còn lại” là lượng chưa dùng, không tính tỉ lệ thêm lần nữa. |
| Tỉ lệ nhiều phần | Ví dụ nước chia `5:7:4` nghĩa là chia tổng nước thành 16 phần bằng nhau: lấy 5 phần, 7 phần và 4 phần cho ba mục đích theo đúng thứ tự đã nêu. |
| Chia hỗn hợp đã trộn | Chia đều hoặc theo số bánh/cuốn thực tế; không dùng hết gia vị cho từng mẻ. Khi chia mẻ thịt, chia cả dầu, nước và gia vị đi kèm theo lượng thịt mỗi mẻ. |
| Kích thước nguyên liệu | Giữ độ dày/kích thước cắt được chỉ dẫn. Tăng số miếng, không tăng gấp đôi độ dày chỉ vì nấu cho gấp đôi người. |
| Nhiệt độ, thời gian và độ chín | Giữ nhiệt độ và lấy thời gian mỗi mẻ làm mốc; kiểm tra độ chín thực tế. Không nhân nhiệt độ, thời gian ướp/ngâm, thời gian mỗi mẻ hoặc thời gian nghỉ theo số người. Các mốc nấu liu riu tính từ khi nồi sôi trở lại. |
| Nồi, chảo, khay và xửng | Chọn dụng cụ đủ chứa và chừa khoảng trống; chia mẻ nếu không thể giữ độ dày lớp thực phẩm. Không nhồi kín chảo/khay để cố giữ nguyên tổng thời gian. |
| Nước nấu và bay hơi | Lượng tính theo khẩu phần là điểm bắt đầu. Dùng nắp/lửa thích hợp, kiểm tra mức ngập, độ sánh và thể tích thành phẩm; bay hơi không tăng tuyến tính theo số người. Nước bổ sung ngoài bảng là điều chỉnh thực tế, không nằm trong số mua tự sinh. |
| Dầu chiên/rán | Lượng trong bảng là lượng cấp dự kiến; độ sâu dầu còn phụ thuộc chảo. Có thể dùng lại dầu còn phù hợp giữa các mẻ trong cùng lượt nấu, không đổ lại toàn bộ lượng cho mỗi mẻ. Khi giảm khẩu phần, chọn chảo nhỏ hơn nếu cần. |
| Trứng và vật đếm | Nếu tính ra phần lẻ quả trứng gà, đánh tan rồi lấy đúng tỉ lệ; phần lẻ trứng cút được chia sau khi luộc. Số lượng mua có thể làm tròn lên, lượng sử dụng vẫn theo bảng. |
| Bát/chén ăn và số bánh/cuốn | Chia thành số phần ăn đang chọn; không cố định 4 bát hoặc 16 cuốn trong bước. Giữ kích thước mỗi bánh/cuốn, điều chỉnh số lượng theo tổng bột/nhân; sản lượng ghi trong mô tả chỉ là ước tính ở khẩu phần gốc. |

Ví dụ R01 có tổng nước mắm gốc 30 ml cho 4 người: nấu 8 người thì bảng là 60 ml; bước ướp dùng `1/3` tức 20 ml, bước nêm dùng phần còn lại tức 40 ml. Nấu 2 người thì tổng là 15 ml, chia thành 5 ml và 10 ml. Không sửa thời gian nấu cá thành gấp đôi hoặc một nửa một cách tự động.

Các tỉ lệ trong instruction là văn bản hướng dẫn, **chưa phải biến động được ứng dụng tự thay bằng con số**. Khi triển khai giao diện nấu theo khẩu phần, cần hiển thị bảng đã tính theo số người đang chọn. Không giả định instruction văn bản sẽ tự đổi các số. Ghi chú “Khi đổi khẩu phần” của mỗi món cần ghép vào description khi đưa vào seed, để người nấu vẫn thấy hướng dẫn tương ứng; không tạo cột mới ngoài schema hiện tại.

## 3. Danh mục công thức — Categories

Giữ ID 1–9, bổ sung từ 10. ID 9 giữ để tương thích nhưng không gắn hàng loạt vào món chuẩn của Admin.

| id | categoryName | createdBy |
|---|---|---|
| 1 | Món chính | null |
| 2 | Món canh | null |
| 3 | Món kho | null |
| 4 | Món xào | null |
| 5 | Bún - Mì - Phở | null |
| 6 | Món khai vị & Ăn vặt | null |
| 7 | Món chay | null |
| 8 | Món tráng miệng & Đồ uống | null |
| 9 | Đóng góp của cộng đồng | null |
| 10 | Món nướng | null |
| 11 | Món chiên | null |
| 12 | Món hấp | null |
| 13 | Cơm - Xôi - Cháo | null |
| 14 | Gỏi - Cuốn | null |
| 15 | Bánh Việt | null |
| 16 | Ẩm thực miền Bắc | null |
| 17 | Ẩm thực miền Trung | null |
| 18 | Ẩm thực miền Nam | null |
| 19 | Ẩm thực vùng cao phía Bắc | null |
| 20 | Bếp riêng của Hoang | 2 |
| 21 | Cơm nhà Lan Anh | 3 |
| 22 | Món Đức tự nấu | 4 |

Món phổ biến nhiều nơi như gà xào sả ớt không bắt buộc gắn vùng miền. “Món chay” áp dụng cho phiên bản không có thịt/cá, nước mắm, dầu hào động vật hoặc nước dùng thịt; đọc thành phần nước tương khi mua. Không suy diễn nhãn chay là phù hợp mọi chế độ ăn chuyên biệt.

## 4. Nhóm nguyên liệu — IngredientCategories

Giữ 8 nhóm cũ; tách bổ sung để danh mục dễ tìm. Thay đổi nhóm không đổi bản chất/ID nguyên liệu.

| id | categoryName |
|---|---|
| 1 | Thịt & Gia cầm |
| 2 | Thủy hải sản |
| 3 | Trứng & Đậu phụ |
| 4 | Rau xanh & Rau thơm |
| 5 | Củ, Quả & Nấm |
| 6 | Gia vị tươi |
| 7 | Gia vị mặn, ngọt & Dầu ăn |
| 8 | Tinh bột & Đồ khô |
| 9 | Gạo & Ngũ cốc |
| 10 | Đậu, Hạt & Sản phẩm từ hạt |
| 11 | Trái cây & Nguyên liệu món ngọt |
| 12 | Nước & Chất lỏng nấu ăn |
| 13 | Gia vị khô & Thảo mộc khô |

## 5. Đơn vị — Units

Giữ nguyên ID/tên 1–24 để không phá tham chiếu hiện có; thêm một số cách đong đếm thường dùng. Không thể có một danh sách “đầy đủ tuyệt đối” cho mọi bếp Việt, vì kích cỡ bát, bó và bao gói thay đổi. Bộ dưới đây đủ cho dữ liệu đề xuất và cách ghi phổ biến; công thức chính ưu tiên g/ml/quả.

| id | unitName | Quy ước hoặc giới hạn |
|---|---|---|
| 1 | g | Đơn vị khối lượng chuẩn của bộ món |
| 2 | kg | 1 kg = 1000 g; giữ để tương thích |
| 3 | ml | Đơn vị thể tích chuẩn của bộ món |
| 4 | lít | 1 lít = 1000 ml |
| 5 | thìa cà phê | Quy ước thìa đong gạt ngang 5 ml |
| 6 | muỗng canh | Quy ước thìa đong gạt ngang 15 ml |
| 7 | chén | Không có thể tích phổ quát; phải nêu dung tích nếu dùng |
| 8 | quả | Đếm trứng/trái; cần ghi kích thước tham khảo |
| 9 | củ | Khối lượng thay đổi theo củ |
| 10 | tép | Dùng cho tỏi; không có khối lượng cố định |
| 11 | cây | Sả/dọc mùng; kích thước thay đổi |
| 12 | nhánh | Rau/gia vị tươi; kích thước thay đổi |
| 13 | bó | Không có khối lượng cố định |
| 14 | lát | Phụ thuộc độ dày |
| 15 | con | Phụ thuộc loài/kích cỡ |
| 16 | miếng | Cần mô tả kích thước/khối lượng |
| 17 | gói | Phải ghi khối lượng tịnh |
| 18 | lon | Phải ghi dung tích/khối lượng tịnh |
| 19 | chai | Phải ghi dung tích |
| 20 | hộp | Phải ghi khối lượng/dung tích |
| 21 | khúc | Phụ thuộc độ dài/khối lượng |
| 22 | nắm | Không có khối lượng cố định |
| 23 | vừa đủ | Định tính, giữ để tương thích; không dùng trong bộ 26 món |
| 24 | tùy khẩu vị | Định tính, giữ để tương thích; không dùng trong bộ 26 món |
| 25 | cái | Bánh/vật rời; không tự quy đổi sang g |
| 26 | lá | Lá gói/lá gia vị; không tự quy đổi sang g |
| 27 | bát | Không có thể tích phổ quát |
| 28 | vá | Phụ thuộc dụng cụ |
| 29 | giọt | Không có thể tích cố định giữa các chất/dụng cụ |

Không tạo thêm bản ghi đồng nghĩa `gam`, `gr`, `mililit`, `muỗng cà phê`, `thìa canh` nếu chưa có cơ chế chuẩn hóa. Thể tích thìa đong không suy ra cùng một khối lượng g cho đường, muối và dầu. Service đi chợ đang gom theo nguyên liệu + đơn vị, **không tự đổi kg→g hoặc thìa→ml**; vì vậy thống nhất đơn vị ngay từ seed.

## 6. Danh mục nguyên liệu — Ingredients

`Nhóm` = `ingredientCategoryId`; `ĐV` = `defaultUnitId`. Giữ ID 1–52, nhưng chuẩn hóa một số đơn vị mặc định về g/ml. ID 44 hỗn hợp hồi–quế được giữ, không dùng cho món mới vì cần cân riêng từng loại. Danh mục bao gồm một số nguyên liệu cũ chưa dùng, nhằm giữ kế thừa và phục vụ tìm kiếm/gợi ý sau này. Không xóa chúng chỉ vì chưa có trong 26 món.

| id | ingredientName | Nhóm | ĐV | Ghi chú |
|---|---|---|---|---|
| 1 | Thịt ba chỉ heo | 1 | 1 | |
| 2 | Thịt bò phi-lê | 1 | 1 | |
| 3 | Nạm bò | 1 | 1 | |
| 4 | Xương ống bò | 1 | 1 | Cân còn xương |
| 5 | Thịt gà ta | 1 | 1 | Ghi rõ có xương/lọc xương trong món |
| 6 | Sườn heo non | 1 | 1 | Cân còn xương |
| 7 | Cá lóc (cá quả) | 2 | 1 | Khúc cá đã làm sạch, còn xương |
| 8 | Tôm sú tươi | 2 | 1 | Thịt đã bóc vỏ trong bộ món này |
| 9 | Mực ống | 2 | 1 | |
| 10 | Trứng gà | 3 | 8 | Cỡ vừa khoảng 50–60 g/quả còn vỏ |
| 11 | Trứng cút | 3 | 8 | |
| 12 | Đậu phụ trắng | 3 | 1 | |
| 13 | Rau muống | 4 | 1 | |
| 14 | Hành lá | 4 | 1 | |
| 15 | Ngò rí (rau mùi) | 4 | 1 | |
| 16 | Rau ngổ (ngò om) | 4 | 1 | |
| 17 | Húng quế | 4 | 1 | |
| 18 | Giá đỗ | 4 | 1 | |
| 19 | Cà chua | 5 | 1 | |
| 20 | Dứa (thơm) | 5 | 1 | Bỏ vỏ/mắt/lõi cứng |
| 21 | Đậu bắp | 5 | 1 | |
| 22 | Bạc hà (dọc mùng) | 5 | 1 | Dùng loại ăn được; không phải lá bạc hà |
| 23 | Cà rốt | 5 | 1 | |
| 24 | Khoai tây | 5 | 1 | |
| 25 | Hành tây | 5 | 1 | |
| 26 | Nấm rơm | 5 | 1 | |
| 27 | Nấm hương khô | 5 | 1 | Cân khô |
| 28 | Tỏi khô | 6 | 1 | Bóc vỏ |
| 29 | Hành tím | 6 | 1 | Bóc vỏ |
| 30 | Gừng tươi | 6 | 1 | |
| 31 | Sả cây | 6 | 1 | Phần dùng được |
| 32 | Ớt hiểm | 6 | 1 | |
| 33 | Chanh tươi | 6 | 8 | Giữ nguyên liệu cũ; món cần chính xác dùng ID 60 |
| 34 | Nước mắm truyền thống | 7 | 3 | |
| 35 | Hạt nêm | 7 | 1 | Không mặc định là chay |
| 36 | Muối tinh | 7 | 1 | |
| 37 | Đường cát trắng | 7 | 1 | |
| 38 | Tiêu đen xay | 13 | 1 | |
| 39 | Dầu ăn | 7 | 3 | |
| 40 | Dầu hào | 7 | 3 | Mặc định loại có thành phần động vật |
| 41 | Nước tương (xì dầu) | 7 | 3 | Chọn loại chay cho món chay |
| 42 | Me chua chín | 7 | 1 | Thịt me bỏ hạt |
| 43 | Nước dừa tươi | 12 | 3 | Không phải nước cốt dừa |
| 44 | Hoa hồi & Quế khô | 13 | 1 | Hỗn hợp cũ, giữ nhưng không dùng |
| 45 | Bánh phở tươi | 8 | 1 | |
| 46 | Bún tươi | 8 | 1 | |
| 47 | Đậu phộng (lạc rang) | 10 | 1 | Rang chín, bỏ vỏ lụa |
| 48 | Bột năng | 8 | 1 | |
| 49 | Bột ngọt (mì chính) | 7 | 1 | |
| 50 | Thịt nạc heo xay | 1 | 1 | |
| 51 | Giấm gạo | 7 | 3 | |
| 52 | Rau xà lách | 4 | 1 | |
| 53 | Nước lọc | 12 | 3 | Nước nấu/pha dùng được |
| 54 | Hoa hồi khô | 13 | 1 | |
| 55 | Quế thanh | 13 | 1 | |
| 56 | Hạt mùi khô | 13 | 1 | |
| 57 | Ớt chuông đỏ | 5 | 1 | |
| 58 | Dưa leo | 5 | 1 | |
| 59 | Đu đủ xanh | 5 | 1 | Gọt vỏ, bỏ hạt |
| 60 | Nước cốt chanh tươi | 6 | 3 | Không gộp tự động với quả chanh ID 33 |
| 61 | Rau tía tô | 4 | 1 | |
| 62 | Rau kinh giới | 4 | 1 | |
| 63 | Mộc nhĩ khô | 8 | 1 | Cân khô |
| 64 | Miến dong khô | 8 | 1 | Cân khô |
| 65 | Bánh đa nem | 8 | 1 | Loại mỏng để rán, cân khô |
| 66 | Cá lăng phi-lê | 2 | 1 | Bỏ da/xương |
| 67 | Thì là | 4 | 1 | |
| 68 | Riềng tươi | 6 | 1 | |
| 69 | Cơm mẻ | 7 | 1 | Thành phẩm lên men dùng nấu ăn |
| 70 | Bột nghệ | 13 | 1 | |
| 71 | Gạo nếp | 9 | 1 | Cân khô |
| 72 | Lá cẩm tím | 4 | 1 | Loại dùng tạo màu thực phẩm |
| 73 | Lá dứa (lá nếp) | 4 | 1 | |
| 74 | Thịt gấc | 11 | 1 | Bỏ hạt |
| 75 | Nghệ tươi | 6 | 1 | |
| 76 | Bắp bò | 1 | 1 | |
| 77 | Giò heo | 1 | 1 | Khoanh còn xương |
| 78 | Mắm ruốc Huế | 7 | 1 | |
| 79 | Dầu màu điều | 7 | 3 | Dầu thành phẩm |
| 80 | Ớt bột | 13 | 1 | |
| 81 | Bắp chuối bào | 4 | 1 | |
| 82 | Sợi mì Quảng tươi | 8 | 1 | |
| 83 | Bánh tráng mè nướng | 8 | 1 | Thành phẩm |
| 84 | Gạo tẻ | 9 | 1 | Cân khô |
| 85 | Rau răm | 4 | 1 | |
| 86 | Bột gạo | 8 | 1 | |
| 87 | Mắc khén | 13 | 1 | |
| 88 | Nước cốt dừa | 11 | 3 | Loại không đường |
| 89 | Rau cải xanh | 4 | 1 | |
| 90 | Bánh tráng cuốn | 8 | 1 | Loại cuốn gỏi cuốn |
| 91 | Tương hột | 7 | 1 | Thành phẩm từ đậu nành |
| 92 | Cá hú | 2 | 1 | Khúc đã làm sạch, còn xương |
| 93 | Sườn cốt lết heo | 1 | 1 | Cân còn xương |
| 94 | Gạo tấm | 9 | 1 | Cân khô |
| 95 | Mật ong | 7 | 1 | |
| 96 | Nấm đùi gà | 5 | 1 | |
| 97 | Nấm bào ngư | 5 | 1 | |
| 98 | Chuối sứ chín | 11 | 1 | Khối lượng đã bóc vỏ |
| 99 | Bột báng | 8 | 1 | Cân khô |
| 100 | Mè trắng rang | 10 | 1 | |
| 101 | Bí đỏ | 5 | 1 | Gọt vỏ, bỏ hạt |
| 102 | Đậu xanh cà vỏ | 10 | 1 | Cân khô |
| 103 | Nước mắm chay | 7 | 3 | Thành phẩm không có cá/hải sản |

Không tạo đồng thời ID mới cho “lạc” và “đậu phộng”, “cá quả” và “cá lóc”, “ngò rí” và “rau mùi”. Các từ đồng nghĩa có thể bổ sung vào mô tả/từ khóa sau, không dùng để tạo nguyên liệu trùng lặp.

## 7. Mục lục 26 công thức và metadata

Mỗi dòng nguyên liệu trong phần 8–9 là một bản ghi RecipeIngredients. Tên món là `title`; câu **Mô tả** là nội dung nền cho `description`. Ghép thêm ghi chú thời gian/định lượng quan trọng vào description khi triển khai, vì model chưa có cột ghi chú nguyên liệu riêng. Các bước đánh số là toàn bộ CookingSteps, không rút gọn thành một câu.

| id | title | authorId | defaultServings | cookTimeMinutes | difficulty | categoryIds | thumbnailUrl |
|---|---|---|---|---|---|---|---|
| 1 | Canh chua cá lóc miền Tây | 1 | 4 | 25 | Medium | 2,18 | https://res.cloudinary.com/sf4yjct9/image/upload/v1789269532/tastebook_uploads/una957qnxfqpmeh7vm0t.jpg |
| 2 | Thịt kho tàu nước dừa trứng cút | 1 | 4 | 75 | Medium | 1,3,18 | https://res.cloudinary.com/sf4yjct9/image/upload/v1789269594/tastebook_uploads/hbspigqd9hauf2e0fhn0.webp |
| 3 | Phở bò Hà Nội | 1 | 4 | 240 | Hard | 1,5,16 | https://res.cloudinary.com/sf4yjct9/image/upload/v1789269633/tastebook_uploads/p0jhwrqov0o1dbrj1mky.webp |
| 4 | Gà xào sả ớt | 1 | 3 | 20 | Easy | 1,4 | https://res.cloudinary.com/sf4yjct9/image/upload/v1789269671/tastebook_uploads/wultafhebuw7skdb9px7.webp |
| 5 | Bò lúc lắc | 1 | 2 | 10 | Medium | 1,4,18 | https://res.cloudinary.com/sf4yjct9/image/upload/v1789269706/tastebook_uploads/fxtcqitccfiph1pi2o0i.jpg |
| 6 | Bún chả Hà Nội | 1 | 4 | 25 | Medium | 1,5,10,16 | https://res.cloudinary.com/sf4yjct9/image/upload/v1793886322/tastebook_uploads/kaymsgft55zttntahrpp.jpg |
| 7 | Nem rán miền Bắc | 1 | 4 | 30 | Medium | 6,11,16 | https://res.cloudinary.com/sf4yjct9/image/upload/v1793886502/tastebook_uploads/fhftudnpza717eskobq2.webp |
| 8 | Chả cá lăng thì là kiểu Hà Nội | 1 | 4 | 20 | Medium | 1,10,16 | https://res.cloudinary.com/sf4yjct9/image/upload/v1793886570/tastebook_uploads/ja8pmht2ahuwdrpfvqz3.jpg |
| 9 | Xôi ngũ sắc phiên bản nấu tại nhà | 1 | 5 | 45 | Hard | 7,12,13,19 | https://res.cloudinary.com/sf4yjct9/image/upload/v1793886661/tastebook_uploads/iakeqbrzdbm3wy8wzsh1.jpg |
| 10 | Bún bò Huế | 1 | 4 | 150 | Hard | 1,5,17 | https://res.cloudinary.com/sf4yjct9/image/upload/v1793886733/tastebook_uploads/uwkknr6w9f01h5kol0b7.jpg |
| 11 | Mì Quảng tôm thịt | 1 | 4 | 45 | Medium | 1,5,17 | https://res.cloudinary.com/sf4yjct9/image/upload/v1793886849/tastebook_uploads/btgmyorax0bwnswrshze.png |
| 12 | Cơm gà Hội An phiên bản gia đình | 1 | 4 | 60 | Medium | 1,13,17 | https://res.cloudinary.com/sf4yjct9/image/upload/v1793886947/tastebook_uploads/eyoewmprremeoyuwnjdw.jpg |
| 13 | Bánh bèo chén Huế | 1 | 4 | 35 | Hard | 6,12,15,17 | https://res.cloudinary.com/sf4yjct9/image/upload/v1793887014/tastebook_uploads/kcl8lcaftvv15ik8zjns.jpg |
| 14 | Gà nướng mắc khén Tây Bắc | 1 | 4 | 50 | Medium | 1,10,19 | https://res.cloudinary.com/sf4yjct9/image/upload/v1793887082/tastebook_uploads/lw1ayprbyygrjuf7c8c3.jpg |
| 15 | Bánh xèo miền Tây | 1 | 4 | 40 | Hard | 1,11,15,18 | https://res.cloudinary.com/sf4yjct9/image/upload/v1793887175/tastebook_uploads/h63rsjaofrtkt7pqzldg.jpg |
| 16 | Gỏi cuốn tôm thịt | 1 | 4 | 30 | Medium | 6,14,18 | https://res.cloudinary.com/sf4yjct9/image/upload/v1793887236/tastebook_uploads/yddwiytdbnwaetds3tbm.jpg |
| 17 | Cá hú kho tộ | 1 | 4 | 35 | Medium | 1,3,18 | https://res.cloudinary.com/sf4yjct9/image/upload/v1793887307/tastebook_uploads/cmolnnt4vxbvtbz9ghzv.jpg |
| 18 | Cơm tấm sườn nướng | 1 | 4 | 40 | Medium | 1,10,13,18 | https://res.cloudinary.com/sf4yjct9/image/upload/v1793887405/tastebook_uploads/qldlw78nmck4twclonyl.png |
| 19 | Đậu phụ kho nấm chay | 1 | 4 | 25 | Easy | 1,3,7 | https://res.cloudinary.com/sf4yjct9/image/upload/v1793887478/tastebook_uploads/m8abhhf6uwg0ovjymvw2.jpg |
| 20 | Chè chuối nước cốt dừa | 1 | 4 | 25 | Easy | 7,8,18 | https://res.cloudinary.com/sf4yjct9/image/upload/v1793887540/tastebook_uploads/jglih0ba7dczqovdnugu.jpg |
| 21 | Rau muống xào tỏi của Hoang | 2 | 2 | 8 | Easy | 4,7,20 | https://res.cloudinary.com/sf4yjct9/image/upload/v1793887705/tastebook_uploads/lfeylopjdlvo56zzkdj3.jpg |
| 22 | Trứng chiên hành của Hoang | 2 | 2 | 8 | Easy | 1,11,20 | https://res.cloudinary.com/sf4yjct9/image/upload/v1793887795/tastebook_uploads/omux8s66kus7rytdxlst.jpg |
| 23 | Canh bí đỏ thịt bằm của Lan Anh | 3 | 3 | 20 | Easy | 2,21 | https://res.cloudinary.com/sf4yjct9/image/upload/v1793887883/tastebook_uploads/xjemxisuyuqk4ddbzvb9.png |
| 24 | Đậu phụ sốt cà chua của Lan Anh | 3 | 3 | 20 | Easy | 1,7,21 | https://res.cloudinary.com/sf4yjct9/image/upload/v1793887935/tastebook_uploads/lw03f2ip7wavq5bhmpvw.jpg |
| 25 | Sườn xào chua ngọt của Đức | 4 | 3 | 35 | Medium | 1,4,22 | https://res.cloudinary.com/sf4yjct9/image/upload/v1793887998/tastebook_uploads/kzyqg2gnwzbvmtrzq0ow.jpg |
| 26 | Chè đậu xanh lá dứa của Đức | 4 | 4 | 35 | Easy | 7,8,22 | https://res.cloudinary.com/sf4yjct9/image/upload/v1793888047/tastebook_uploads/ymva7oydemvcb60hc3yw.jpg |

**Điều chỉnh tên:** món 3 bỏ chữ “gia truyền” vì không có thông tin truyền nghề để chứng minh. Món 8 và 12 ghi rõ “kiểu/phiên bản gia đình” để mô tả đúng cách làm, tránh nhận là một công thức thương hiệu/nguyên bản duy nhất.

## 8. Chi tiết 20 công thức chuẩn công khai

### R01 — Canh chua cá lóc miền Tây

**Mô tả:** Canh cá lóc vị chua me, có thơm, cà chua, đậu bắp, dọc mùng và rau ngổ; dùng chung trong bữa cơm 4 người. Chuẩn bị 20 phút, nấu 25 phút.

| ingredientId | Nguyên liệu | quantity | Đơn vị |
|---|---|---|---|
| 7 | Cá lóc, khúc còn xương | 600 | g |
| 19 | Cà chua | 200 | g |
| 20 | Dứa | 150 | g |
| 21 | Đậu bắp | 100 | g |
| 22 | Dọc mùng | 100 | g |
| 18 | Giá đỗ | 100 | g |
| 42 | Me chua chín bỏ hạt | 30 | g |
| 16 | Rau ngổ | 10 | g |
| 28 | Tỏi | 10 | g |
| 32 | Ớt hiểm | 3 | g |
| 34 | Nước mắm | 30 | ml |
| 37 | Đường | 20 | g |
| 36 | Muối | 3 | g |
| 39 | Dầu ăn | 15 | ml |
| 53 | Nước lọc | 1400 | ml |

1. Cá làm sạch, bỏ mang/nội tạng, cắt khúc 2–3 cm và thấm ráo. Ướp với 1/3 tổng nước mắm và 1/3 tổng muối trong 10 phút. Rửa rau, thái cà chua múi cau, dứa lát, đậu bắp xéo; băm tỏi, thái ớt và rau ngổ.
2. Dọc mùng loại ăn được tước vỏ, thái xéo; bóp với phần muối còn lại, xả kỹ và vắt nhẹ. Chần trong nước sôi riêng 2 phút, bỏ nước chần. Không sử dụng cây dại chưa xác định đúng loại.
3. Lấy 1/7 tổng nước lọc trong bảng, làm nóng rồi dầm toàn bộ me, lọc bỏ xơ. Phi tỏi bằng toàn bộ dầu tới vàng nhạt, vớt một nửa tỏi ra để rắc cuối.
4. Cho cà chua và dứa vào phần dầu tỏi, đảo 2 phút. Thêm toàn bộ nước lọc còn lại và nước me, đun sôi.
5. Thả cá vào khi nước sôi, hạ vừa lửa, hớt bọt và nấu 8–12 phút tùy độ dày, đến khi thịt cá chín đục, tách thớ; không khuấy mạnh làm vỡ cá.
6. Thêm đậu bắp, dọc mùng, phần nước mắm còn lại và toàn bộ đường; nấu 3 phút. Cho giá vào nấu thêm 1 phút, tắt bếp rồi thêm rau ngổ, ớt và tỏi phi đã giữ. Thành phẩm chua dịu, cá chín nguyên khúc, rau không nhũn.

**Khi đổi khẩu phần:** Giữ độ dày khúc cá, chọn nồi để cá ngập nước canh mà không phải xếp quá chặt. Chờ nồi sôi trở lại rồi kiểm tra cá chín theo độ dày; chia canh theo số người đang nấu.

### R02 — Thịt kho tàu nước dừa trứng cút

**Mô tả:** Ba chỉ kho nước dừa với trứng cút, vị mặn ngọt dịu, thịt mềm nhưng còn miếng; phiên bản Nam Bộ. Chuẩn bị 20 phút, ướp 30 phút, nấu 75 phút.

| ingredientId | Nguyên liệu | quantity | Đơn vị |
|---|---|---|---|
| 1 | Thịt ba chỉ heo | 600 | g |
| 11 | Trứng cút | 16 | quả |
| 43 | Nước dừa tươi | 600 | ml |
| 53 | Nước lọc | 300 | ml |
| 34 | Nước mắm | 45 | ml |
| 37 | Đường | 25 | g |
| 29 | Hành tím | 20 | g |
| 28 | Tỏi | 10 | g |
| 38 | Tiêu đen xay | 1 | g |
| 39 | Dầu ăn | 10 | ml |

1. Ba chỉ cắt miếng khoảng 3 cm, chần nhanh trong nước sôi riêng rồi rửa sạch cặn và để ráo. Băm hành tím, tỏi.
2. Trứng cút luộc khoảng 5 phút từ lúc nước sôi nhẹ, làm nguội và bóc vỏ. Ướp thịt với 2/3 tổng nước mắm, 2/5 tổng đường, toàn bộ hành, tỏi và tiêu trong 30 phút.
3. Cho toàn bộ dầu và phần đường còn lại vào nồi, đun vừa đến màu hổ phách; không để đen. Thêm thịt vào đảo 5 phút, tránh bắn đường nóng.
4. Rót toàn bộ nước dừa và nước lọc trong bảng, đun sôi, hớt bọt. Hạ nhỏ lửa, đậy hé và kho khoảng 45 phút.
5. Cho trứng và phần nước mắm còn lại vào, kho thêm 20 phút. Nếu cạn quá nhanh, giảm lửa/đậy nắp thay vì tiếp tục đun khô; với nồi bốc hơi mạnh có thể cần bổ sung nước nóng, ghi lượng thực tế khi hiệu chỉnh phiên bản seed.
6. Kiểm tra thịt mềm khi xiên nhưng không nát, trứng thấm vị, nước kho còn xâm xấp. Tắt bếp, để nghỉ 5 phút trước khi dùng với cơm.

**Khi đổi khẩu phần:** Giữ miếng thịt khoảng 3 cm, chọn nồi để nước kho phủ vừa mặt thịt lúc bắt đầu. Nấu nhiều có thể lâu sôi hơn; kết thúc theo độ mềm và mức nước kho, không nhân 75 phút theo số người.

### R03 — Phở bò Hà Nội

**Mô tả:** Phở nạm chín với nước dùng xương bò, gừng hành nướng, hồi, quế và hạt mùi; không dùng thịt tái trong bản seed này. Chuẩn bị 30 phút, nấu khoảng 4 giờ. Nước dùng thành phẩm mục tiêu 2400 ml cho 4 bát.

| ingredientId | Nguyên liệu | quantity | Đơn vị |
|---|---|---|---|
| 4 | Xương ống bò | 1500 | g |
| 3 | Nạm bò | 600 | g |
| 45 | Bánh phở tươi | 800 | g |
| 25 | Hành tây | 200 | g |
| 30 | Gừng | 60 | g |
| 29 | Hành tím | 40 | g |
| 54 | Hoa hồi khô | 3 | g |
| 55 | Quế thanh | 5 | g |
| 56 | Hạt mùi khô | 3 | g |
| 34 | Nước mắm | 40 | ml |
| 36 | Muối | 12 | g |
| 37 | Đường | 10 | g |
| 14 | Hành lá | 30 | g |
| 15 | Rau mùi | 20 | g |
| 60 | Nước cốt chanh | 30 | ml |
| 32 | Ớt hiểm | 5 | g |
| 53 | Nước lọc | 4500 | ml |

1. Chần xương trong nồi nước sôi riêng khoảng 10 phút rồi xả sạch cặn. Nạm thấm sạch. Nướng 3/4 tổng hành tây, toàn bộ hành tím và gừng đến thơm, bỏ phần cháy đen. Giữ phần hành tây còn lại để thái mỏng ăn kèm.
2. Cho xương, nạm, hành gừng nướng và 8/9 tổng nước lọc trong bảng vào nồi lớn; giữ 1/9 nước làm dự phòng. Đun sôi, hớt bọt, hạ lửa chỉ sôi lăn tăn. Cho 2/3 tổng muối vào. Đậy hé để hạn chế bay hơi.
3. Sau khoảng 75–100 phút, kiểm tra nạm chín mềm vừa phải thì vớt ra, đậy giữ ẩm để nguội bớt rồi thái ngang thớ. Tiếp tục ninh xương để tổng thời gian đạt khoảng 4 giờ.
4. Rang hồi, quế, hạt mùi 1–2 phút, bọc túi lọc và cho vào 45 phút cuối, sau đó vớt túi ra để không đắng/nồng.
5. Lọc nước dùng, loại xương và gia vị. Dùng phần nước dự phòng để bù bay hơi khi cần; đun cô hoặc bù nước để thu khoảng 600 ml nước dùng cho mỗi phần ăn đang nấu. Nêm toàn bộ nước mắm, đường và phần muối còn lại; đun sôi lại. Lượng dự phòng có thể không dùng hết; mức nước thực tế phụ thuộc nồi và độ hé nắp.
6. Chần phở bằng nước sôi riêng, chia thành số bát tương ứng số phần ăn đang nấu; xếp nạm, hành tây sống thái mỏng, hành lá và rau mùi. Chan khoảng 600 ml nước dùng nóng mỗi bát. Chanh và ớt chia đều ăn kèm, không cho chanh vào cả nồi.

**Khi đổi khẩu phần:** Mục tiêu nước dùng bằng khoảng 600 ml × số phần ăn, không giữ cố định tổng 2400 ml của mẻ gốc. Giữ miếng nạm có độ dày tương tự; nếu nồi không đủ lớn thì chia nồi, chia cả nguyên liệu và gia vị. Thời gian ninh xương không nhân theo số bát.

### R04 — Gà xào sả ớt

**Mô tả:** Gà lọc xương xào sả ớt, sốt bám nhẹ, hợp bữa cơm gia đình. Chuẩn bị 15 phút, ướp 20 phút, nấu 20 phút.

| ingredientId | Nguyên liệu | quantity | Đơn vị |
|---|---|---|---|
| 5 | Thịt gà ta lọc xương | 600 | g |
| 31 | Sả | 50 | g |
| 32 | Ớt hiểm | 5 | g |
| 28 | Tỏi | 15 | g |
| 29 | Hành tím | 20 | g |
| 34 | Nước mắm | 30 | ml |
| 37 | Đường | 10 | g |
| 38 | Tiêu | 1 | g |
| 39 | Dầu ăn | 20 | ml |
| 53 | Nước lọc | 80 | ml |

1. Thịt gà thấm khô, cắt miếng 2–3 cm. Băm sả, ớt, hành và tỏi; để riêng dụng cụ tiếp xúc thịt sống và đồ chín.
2. Ướp gà với một nửa tổng sả, một nửa tổng nước mắm, một nửa tổng đường và toàn bộ tiêu trong 20 phút trong ngăn mát.
3. Làm nóng toàn bộ dầu, phi hành, tỏi và phần sả còn lại khoảng 1 phút; thêm gà, đảo lửa vừa lớn 5 phút tới săn.
4. Thêm toàn bộ nước lọc, phần nước mắm và đường còn lại cùng ớt; đậy nắp, nấu lửa vừa nhỏ 8–10 phút.
5. Mở nắp, đảo 3–4 phút cho sốt bám thịt; kiểm tra miếng dày nhất chín hoàn toàn rồi tắt bếp. Thịt còn ẩm, sả thơm, không cháy đen.

**Khi đổi khẩu phần:** Chảo cần đủ rộng để đảo gà; nấu nhiều thì chia mẻ và chia đều phần dầu, gia vị, nước theo lượng gà mỗi mẻ. Giữ miếng gà 2–3 cm và kiểm tra miếng dày nhất của từng mẻ.

### R05 — Bò lúc lắc

**Mô tả:** Bò phi-lê áp chảo nhanh với ớt chuông, hành tây; ăn cùng xà lách và cà chua. Chuẩn bị 15 phút, ướp 15 phút, nấu 10 phút.

| ingredientId | Nguyên liệu | quantity | Đơn vị |
|---|---|---|---|
| 2 | Thịt bò phi-lê | 350 | g |
| 57 | Ớt chuông đỏ | 120 | g |
| 25 | Hành tây | 100 | g |
| 19 | Cà chua | 100 | g |
| 52 | Xà lách | 60 | g |
| 28 | Tỏi | 10 | g |
| 40 | Dầu hào | 15 | ml |
| 41 | Nước tương | 10 | ml |
| 37 | Đường | 5 | g |
| 38 | Tiêu | 1 | g |
| 39 | Dầu ăn | 20 | ml |

1. Bò thấm khô, cắt khối khoảng 2 cm. Ướp với toàn bộ dầu hào, nước tương, đường, tiêu và một nửa tổng tỏi băm trong 15 phút.
2. Cắt ớt chuông, hành tây miếng vuông. Xà lách và cà chua rửa bằng nước sạch, để ráo, xếp lên đĩa.
3. Làm nóng chảo với một nửa tổng dầu; xào ớt chuông và hành tây 2–3 phút rồi trút ra.
4. Dùng phần dầu còn lại, cho bò vào một lớp, chia lượt nếu chảo nhỏ. Áp chảo rồi đảo/lắc trong khoảng 4–6 phút mỗi mẻ tùy độ dày, cho phần tỏi còn lại vào cuối để không cháy. Kiểm tra độ chín mong muốn và phù hợp người ăn; thời gian không phải bảo đảm độ chín tuyệt đối.
5. Trút rau củ lại vào chảo, đảo 30–60 giây, tắt bếp và bày lên đĩa rau. Không om lâu khiến bò dai.

**Khi đổi khẩu phần:** Giữ bò thành khối khoảng 2 cm và chỉ xếp một lớp trên mặt chảo. Tăng số mẻ thay vì kéo dài một lần xào với chảo đầy; chia rau, dầu và tỏi cho từng mẻ tương ứng.

### R06 — Bún chả Hà Nội

**Mô tả:** Bún với chả viên, ba chỉ nướng, đu đủ cà rốt ngâm nhanh và nước mắm pha; rau sống để riêng. Chuẩn bị 25 phút, ướp 45 phút, nướng khoảng 25 phút.

| ingredientId | Nguyên liệu | quantity | Đơn vị |
|---|---|---|---|
| 1 | Ba chỉ heo | 350 | g |
| 50 | Thịt heo xay | 350 | g |
| 46 | Bún tươi | 800 | g |
| 59 | Đu đủ xanh | 150 | g |
| 23 | Cà rốt | 100 | g |
| 52 | Xà lách | 150 | g |
| 61 | Tía tô | 30 | g |
| 62 | Kinh giới | 30 | g |
| 29 | Hành tím | 30 | g |
| 28 | Tỏi | 20 | g |
| 34 | Nước mắm | 90 | ml |
| 37 | Đường | 60 | g |
| 51 | Giấm gạo | 60 | ml |
| 38 | Tiêu | 2 | g |
| 39 | Dầu ăn | 15 | ml |
| 32 | Ớt | 5 | g |
| 53 | Nước lọc | 400 | ml |

1. Ba chỉ thái lát dày 4–5 mm. Băm hành, tỏi; dùng 1/3 tổng nước mắm, 1/3 tổng đường, một nửa tổng tỏi cùng toàn bộ hành, tiêu và dầu để ướp. Chia hỗn hợp gia vị theo lượng mỗi loại thịt, giữ hai loại thịt riêng, ướp ngăn mát 45 phút; nặn phần thịt xay thành viên dẹt có độ dày tương tự nhau.
2. Đu đủ và cà rốt thái lát mỏng. Trộn với một nửa tổng giấm và 1/6 tổng đường, để 20 phút rồi để ráo. Rửa sạch, để ráo rau sống.
3. Hòa toàn bộ nước lọc với phần nước mắm, đường và giấm còn lại. Đun ấm để tan đường, để nguội bớt, thêm phần tỏi còn lại và toàn bộ ớt.
4. Làm nóng lò 210°C; nướng thịt trên vỉ có khay hứng 18–25 phút, trở giữa chừng. Chả viên phải chín tận giữa, ba chỉ chín mềm, xém mặt vừa; không dùng màu nướng để kết luận thịt đã chín.
5. Chia nước chấm, chả và đồ chua theo số phần ăn đang nấu; bún cùng rau để riêng. Chỉ ngâm chả trong nước chấm ngay trước lúc ăn để còn thơm.

**Khi đổi khẩu phần:** Giữ lát ba chỉ 4–5 mm và độ dày chả viên, tăng số miếng thay vì làm viên to hơn. Nướng một lớp, chia khay/mẻ nếu cần; mốc 18–25 phút tính cho từng mẻ có độ dày tương tự.

### R07 — Nem rán miền Bắc

**Mô tả:** Nem nhân heo, tôm, miến và mộc nhĩ, kèm nước chấm chua ngọt; khoảng 16 cuốn nhỏ, 4 người ăn khai vị. Chuẩn bị 35 phút, rán 30 phút.

| ingredientId | Nguyên liệu | quantity | Đơn vị |
|---|---|---|---|
| 50 | Thịt heo xay | 250 | g |
| 8 | Tôm bóc vỏ | 100 | g |
| 64 | Miến dong khô | 40 | g |
| 63 | Mộc nhĩ khô | 10 | g |
| 23 | Cà rốt | 80 | g |
| 25 | Hành tây | 80 | g |
| 10 | Trứng gà | 1 | quả |
| 14 | Hành lá | 15 | g |
| 65 | Bánh đa nem | 120 | g |
| 34 | Nước mắm | 45 | ml |
| 38 | Tiêu | 1 | g |
| 39 | Dầu ăn | 400 | ml |
| 37 | Đường | 20 | g |
| 51 | Giấm gạo | 25 | ml |
| 28 | Tỏi | 10 | g |
| 32 | Ớt | 3 | g |
| 53 | Nước lọc | 120 | ml |

1. Ngâm miến trong nước thường 10–15 phút đến mềm, để ráo và cắt ngắn. Mộc nhĩ ngâm riêng đến nở vừa, rửa sạch, bỏ chân, băm nhỏ; không ngâm qua đêm ở nhiệt độ phòng. Băm tôm, thái nhỏ hành tây, cà rốt và hành lá.
2. Trộn thịt, tôm, miến, mộc nhĩ, rau củ với lượng trứng trong bảng, 1/3 tổng nước mắm và toàn bộ tiêu. Nếu lượng trứng là phần lẻ, đánh tan trứng rồi lấy đúng tỉ lệ. Trộn ngay trước khi cuốn, không để nhân ra nhiều nước.
3. Làm mềm bánh đa nem bằng khăn ẩm, chia nhân theo số vỏ thực tế và cuốn vừa tay, không siết chặt. Giữ cuốn nhỏ đều nhau; mẻ gốc 4 phần ăn cho khoảng 16 cuốn, thay đổi số cuốn theo khẩu phần và kích thước vỏ, không tăng độ dày cuốn.
4. Cho dầu theo bảng vào chảo có kích thước phù hợp để rán ngập một phần cuốn; rán từng mẻ ở khoảng 150–160°C tới nhân chín và vỏ vàng nhạt, khoảng 8–10 phút/mẻ; vớt lên giá. Trước khi ăn có thể tăng lên 170–175°C và rán lại 1–2 phút cho giòn; không để dầu bốc khói. Không thêm lại toàn bộ lượng dầu cho mỗi mẻ.
5. Hòa toàn bộ nước lọc với phần nước mắm còn lại, toàn bộ đường, giấm, tỏi băm và ớt. Cắt kiểm tra một cuốn dày nhất: nhân chín hoàn toàn, không còn phần thịt/tôm sống; dùng nem nóng với nước chấm.

**Khi đổi khẩu phần:** Giữ kích thước nem và nhiệt độ rán, điều chỉnh số cuốn/số mẻ. Khi nấu ít, dùng chảo nhỏ hơn để đủ độ sâu dầu; số cuốn là ước tính, không phải trường số lượng đã được ứng dụng tự tính.

### R08 — Chả cá lăng thì là kiểu Hà Nội

**Mô tả:** Cá lăng ướp riềng mẻ nghệ, nướng sơ rồi đảo cùng hành thì là; ăn với bún, lạc và nước mắm chanh. Bản này chọn nước mắm thay mắm tôm. Chuẩn bị 20 phút, ướp 60 phút, nấu 20 phút.

| ingredientId | Nguyên liệu | quantity | Đơn vị |
|---|---|---|---|
| 66 | Cá lăng phi-lê | 700 | g |
| 68 | Riềng | 30 | g |
| 69 | Cơm mẻ | 40 | g |
| 70 | Bột nghệ | 3 | g |
| 29 | Hành tím | 20 | g |
| 34 | Nước mắm | 50 | ml |
| 37 | Đường | 15 | g |
| 39 | Dầu ăn | 40 | ml |
| 14 | Hành lá | 100 | g |
| 67 | Thì là | 100 | g |
| 46 | Bún tươi | 800 | g |
| 47 | Lạc rang | 50 | g |
| 60 | Nước cốt chanh | 25 | ml |
| 28 | Tỏi | 10 | g |
| 32 | Ớt | 3 | g |
| 53 | Nước lọc | 100 | ml |

1. Cá thấm khô, cắt miếng khoảng 3 cm, rà lại xương sót. Riềng giã nhỏ, mẻ lọc mịn, hành tím băm; hành lá và thì là cắt đoạn.
2. Ướp cá với toàn bộ riềng, mẻ, nghệ, hành tím, 2/5 tổng nước mắm, 1/3 tổng đường và 1/4 tổng dầu trong ngăn mát 60 phút.
3. Xếp cá lên khay có giấy nướng, nướng lò đã nóng 200°C khoảng 12–15 phút, trở nhẹ nếu cần, tới gần chín.
4. Hòa toàn bộ nước lọc, phần nước mắm và đường còn lại cùng toàn bộ nước chanh, tỏi và ớt làm nước chấm. Chia bún và lạc ra đĩa theo số phần ăn đang nấu.
5. Làm nóng phần dầu còn lại trong chảo, cho cá cùng hành lá và thì là vào đảo nhẹ 3–5 phút đến cá chín hoàn toàn, rau vừa mềm. Ăn nóng cùng bún, lạc và nước chấm.

**Khi đổi khẩu phần:** Giữ miếng cá khoảng 3 cm, nướng một lớp và chia mẻ đảo cá cùng hành thì là khi chảo đầy. Chia phần dầu dành cho chảo theo lượng cá mỗi mẻ; kiểm tra cá chín ở cả bước nướng và bước đảo cuối.

### R09 — Xôi ngũ sắc phiên bản nấu tại nhà

**Mô tả:** Xôi năm màu trắng, tím lá cẩm, xanh lá dứa, đỏ gấc, vàng nghệ, lấy cảm hứng từ xôi vùng cao phía Bắc. Cách tạo màu gia đình này không đại diện cho toàn bộ kỹ thuật dùng lá của các cộng đồng địa phương. Chuẩn bị 35 phút, ngâm 6 giờ, hấp 45 phút; 5 phần xôi.

| ingredientId | Nguyên liệu | quantity | Đơn vị |
|---|---|---|---|
| 71 | Gạo nếp | 500 | g |
| 72 | Lá cẩm tím | 40 | g |
| 73 | Lá dứa | 40 | g |
| 74 | Thịt gấc bỏ hạt | 50 | g |
| 75 | Nghệ tươi | 10 | g |
| 36 | Muối | 5 | g |
| 39 | Dầu ăn | 15 | ml |
| 53 | Nước lọc | 2000 | ml |

1. Vo nếp theo lượng trong bảng đã đổi, chia thành 5 phần bằng nhau tương ứng 5 màu. Chia toàn bộ nước lọc thành 5 phần bằng nhau: một phần dùng ngâm màu trắng; một phần nấu lá cẩm 10 phút rồi lọc; một phần xay lá dứa rồi lọc; một phần xay nghệ rồi lọc; một phần dùng ngâm nếp sẽ trộn gấc. Để nước màu nguội trước khi ngâm.
2. Ngâm riêng 5 phần nếp trong các nước đã chuẩn bị khoảng 6 giờ trong ngăn mát. Dùng dụng cụ riêng cho từng màu; nước ngâm phải phủ mặt nếp. Không thêm phẩm màu không rõ nguồn gốc.
3. Đổ bỏ nước ngâm, để nếp ráo ít nhất 15 phút. Chia toàn bộ muối và dầu thành 5 phần bằng nhau, trộn mỗi phần vào một màu nếp. Phần nếp dành màu đỏ trộn thêm toàn bộ thịt gấc trong bảng, bóp nhẹ cho bám màu.
4. Đun sôi nước xửng riêng. Xếp 5 màu vào các khoang/khay có vách ngăn chịu nhiệt; không nén chặt, chừa đường hơi. Hấp 25 phút lửa vừa mạnh.
5. Mở nắp tránh nước nhỏ xuống xôi, xới nhẹ từng phần, hấp tiếp khoảng 20 phút đến hạt nếp mềm dẻo, không còn lõi cứng. Xếp 5 màu cạnh nhau, không trộn lẫn. Màu thực tế phụ thuộc nguyên liệu và giống nếp.

**Khi đổi khẩu phần:** Luôn giữ 5 màu, chỉ thay lượng nếp mỗi màu; số màu không phải số người ăn. Giữ lớp nếp tơi và không quá dày, tăng số tầng hoặc chia mẻ hấp; thời gian dựa vào độ dày lớp nếp và độ mềm hạt, không nhân 45 phút theo khẩu phần.

### R10 — Bún bò Huế

**Mô tả:** Bún sợi lớn với bắp bò, giò heo, nước dùng thơm sả và mắm ruốc Huế; bản gia đình không thêm huyết/chả. Chuẩn bị 30 phút, nấu 150 phút; mục tiêu 2400 ml nước dùng cho 4 bát.

| ingredientId | Nguyên liệu | quantity | Đơn vị |
|---|---|---|---|
| 76 | Bắp bò | 500 | g |
| 77 | Giò heo | 600 | g |
| 46 | Bún tươi loại sợi lớn | 800 | g |
| 31 | Sả | 100 | g |
| 78 | Mắm ruốc Huế | 25 | g |
| 25 | Hành tây | 150 | g |
| 29 | Hành tím | 30 | g |
| 28 | Tỏi | 15 | g |
| 79 | Dầu màu điều | 20 | ml |
| 39 | Dầu ăn | 10 | ml |
| 80 | Ớt bột | 5 | g |
| 34 | Nước mắm | 30 | ml |
| 36 | Muối | 8 | g |
| 37 | Đường | 15 | g |
| 14 | Hành lá | 20 | g |
| 15 | Rau mùi | 15 | g |
| 81 | Bắp chuối bào | 150 | g |
| 18 | Giá đỗ | 150 | g |
| 17 | Húng quế | 20 | g |
| 60 | Nước cốt chanh | 30 | ml |
| 53 | Nước lọc | 3500 | ml |

1. Chần giò heo và bắp bò trong nước sôi riêng, rửa sạch cặn. Đập dập 7/10 tổng sả; băm phần sả còn lại cùng toàn bộ hành tím và tỏi. Hành tây bổ đôi.
2. Chia toàn bộ nước lọc trong bảng thành ba phần theo tỉ lệ 2:30:3, lần lượt dùng hòa ruốc, ninh thịt và dự phòng. Hòa toàn bộ mắm ruốc với phần nước dành hòa ruốc, để lắng rồi lọc phần nước phía trên, bỏ cặn. Dùng rây mịn; không cho nguyên phần cặn vào nồi.
3. Cho thịt, hành tây, sả đập dập và phần nước dành ninh thịt vào nồi, đun sôi, hớt bọt, thêm toàn bộ muối rồi ninh lửa nhỏ. Cho nước ruốc đã lọc vào sau khi nồi trong bọt.
4. Kiểm tra giò heo sau 60–90 phút và bắp bò sau 90–120 phút; vớt riêng từng phần khi vừa mềm để không nát. Thái bắp bò ngang thớ, giữ giò nguyên khoanh. Duy trì nồi nước dùng nóng.
5. Phi hành, tỏi và sả băm bằng dầu ăn; hạ lửa, thêm dầu màu điều cùng ớt bột, đảo 20–30 giây rồi cho vào nồi. Không rang cháy ớt. Nêm nước mắm và đường.
6. Lọc bỏ hành/sả lớn, dùng phần nước dự phòng để điều chỉnh bay hơi khi cần, nhắm khoảng 600 ml nước dùng cho mỗi phần ăn đang nấu. Đun sôi lại và giữ nóng; thời gian mẻ gốc khoảng 150 phút gồm sơ chế nhiệt và hoàn thiện. Không bắt buộc dùng hết nước dự phòng nếu đã đạt lượng nước dùng và vị phù hợp.
7. Rửa rau bằng nước sạch; giá chần chín riêng. Chần bún, chia theo số phần ăn đang nấu, xếp bò và giò, chan khoảng 600 ml nước dùng mỗi bát, rắc hành mùi. Bắp chuối, húng quế và chanh chia riêng ăn kèm.

**Khi đổi khẩu phần:** Tổng nước dùng thành phẩm mục tiêu là khoảng 600 ml × số phần ăn, không cố định 2400 ml. Chọn nồi vừa lượng thịt, không nhồi kín; giữ độ dày khoanh giò/miếng bắp bò tương tự và vớt từng loại khi mềm, không nhân thời gian ninh theo số người.

### R11 — Mì Quảng tôm thịt

**Mô tả:** Mì Quảng với nhân tôm thịt, nước nhân đậm vị chỉ chan xâm xấp, có rau, lạc và bánh tráng mè. Chuẩn bị 25 phút, ướp 20 phút, nấu 45 phút.

| ingredientId | Nguyên liệu | quantity | Đơn vị |
|---|---|---|---|
| 82 | Sợi mì Quảng tươi | 800 | g |
| 1 | Ba chỉ heo | 350 | g |
| 8 | Tôm bóc vỏ | 300 | g |
| 29 | Hành tím | 30 | g |
| 28 | Tỏi | 15 | g |
| 75 | Nghệ tươi | 15 | g |
| 34 | Nước mắm | 40 | ml |
| 36 | Muối | 3 | g |
| 37 | Đường | 10 | g |
| 39 | Dầu ăn | 20 | ml |
| 79 | Dầu màu điều | 10 | ml |
| 53 | Nước lọc | 1000 | ml |
| 47 | Lạc rang | 50 | g |
| 83 | Bánh tráng mè nướng | 60 | g |
| 52 | Xà lách | 120 | g |
| 81 | Bắp chuối bào | 120 | g |
| 18 | Giá đỗ | 100 | g |
| 17 | Húng quế | 20 | g |
| 14 | Hành lá | 20 | g |
| 60 | Nước cốt chanh | 30 | ml |
| 32 | Ớt | 5 | g |

1. Ba chỉ thái lát vừa, tôm bỏ chỉ lưng. Giã nghệ, băm hành và tỏi. Ướp thịt với một nửa của từng loại hành, tỏi, nghệ, một nửa tổng nước mắm, toàn bộ muối và một nửa tổng đường trong 20 phút. Tôm ướp riêng với phần hành, tỏi, nghệ còn lại và 1/4 tổng nước mắm; giữ 1/4 nước mắm và một nửa đường cho bước nêm cuối.
2. Làm nóng toàn bộ dầu ăn và dầu màu điều, xào thịt 5 phút tới săn; thêm toàn bộ nước lọc trong bảng, đun sôi, hạ nhỏ lửa và nấu 25 phút.
3. Cho tôm cùng nước ướp, phần nước mắm và đường đã giữ vào, nấu thêm 5–7 phút đến tôm chín và thịt mềm. Giữ nước nhân khoảng 200 ml cho mỗi phần ăn đang nấu, vị đậm hơn canh vì ăn cùng mì và rau.
4. Rau sống rửa sạch để ráo, giá chần chín, hành lá thái nhỏ. Trụng mì theo độ mềm của sợi thành phẩm rồi chia theo số phần ăn đang nấu.
5. Xếp rau, mì, thịt và tôm; chan khoảng 200 ml nước nhân mỗi tô. Rắc lạc, hành, thêm bánh tráng mè bẻ miếng; chanh và ớt dùng kèm. Không chan đầy như phở.

**Khi đổi khẩu phần:** Tổng nước nhân thành phẩm mục tiêu là khoảng 200 ml × số phần ăn; không giữ tổng 800 ml của mẻ gốc. Nấu nhiều thì xào săn thịt theo mẻ trước khi gom vào nồi nấu, giữ nguyên cỡ tôm và độ dày thịt để kiểm tra độ chín.

### R12 — Cơm gà Hội An phiên bản gia đình

**Mô tả:** Cơm nấu nước luộc gà và nghệ, gà xé trộn hành tây rau răm, đu đủ cà rốt chua; phiên bản không kèm lòng gà. Chuẩn bị 30 phút, nấu 60 phút.

| ingredientId | Nguyên liệu | quantity | Đơn vị |
|---|---|---|---|
| 5 | Gà ta miếng lớn có xương | 1000 | g |
| 84 | Gạo tẻ | 350 | g |
| 25 | Hành tây | 150 | g |
| 29 | Hành tím | 30 | g |
| 30 | Gừng | 20 | g |
| 70 | Bột nghệ | 2 | g |
| 85 | Rau răm | 20 | g |
| 59 | Đu đủ xanh | 150 | g |
| 23 | Cà rốt | 100 | g |
| 58 | Dưa leo | 150 | g |
| 34 | Nước mắm | 40 | ml |
| 37 | Đường | 25 | g |
| 36 | Muối | 6 | g |
| 60 | Nước cốt chanh | 30 | ml |
| 51 | Giấm gạo | 30 | ml |
| 28 | Tỏi | 10 | g |
| 32 | Ớt | 5 | g |
| 39 | Dầu ăn | 20 | ml |
| 53 | Nước lọc | 2000 | ml |

1. Cho gà, 9/10 tổng nước lọc, toàn bộ gừng, hành tím và 2/3 tổng muối vào nồi; giữ 1/10 nước cho nước chấm. Đun sôi nhẹ rồi luộc liu riu 25–35 phút tùy miếng; kiểm tra phần dày nhất chín hoàn toàn. Vớt gà để nguội bớt và xé thịt, giữ lại nước luộc.
2. Vo gạo để ráo. Phi một nửa tổng tỏi với toàn bộ dầu, cho gạo và nghệ vào đảo 2 phút. Chuyển vào nồi cơm, lấy nước luộc gà đã lọc để nấu theo tỉ lệ khởi điểm 1.2 ml nước dùng cho mỗi 1 g gạo khô trong bảng đã đổi. Nấu và ủ theo nồi, điều chỉnh nước theo loại gạo khi nấu thử; phần nước này lấy từ nồi gà, không phải lượng nước mới cộng thêm vào bảng.
3. Đu đủ và cà rốt thái sợi; trộn toàn bộ giấm với 2/5 tổng đường, ngâm rau 20 phút rồi để ráo. Hành tây thái mỏng, ngâm nước lạnh riêng 10 phút, để thật ráo. Dưa leo thái lát, rau răm thái vừa.
4. Hòa phần nước lọc đã giữ với 3/4 tổng nước mắm, phần đường còn lại, 2/3 tổng nước chanh, phần tỏi còn lại và toàn bộ ớt làm nước chấm.
5. Trộn gà xé với hành tây, rau răm, phần nước mắm, nước chanh và muối còn lại. Xới cơm, chia gà trộn, đồ chua và dưa leo theo số phần ăn đang nấu, dùng cùng nước chấm. Phần nước luộc còn dư không bắt buộc chia vào món cơm.

**Khi đổi khẩu phần:** Giữ cỡ miếng gà, chọn nồi luộc vừa để nước phủ thịt. Tính nước nấu cơm theo lượng gạo đã đổi, không giữ cố định lượng nước của mẻ gốc; dùng nồi cơm đủ dung tích hoặc chia lượt, không nhân thời gian nấu cơm theo số người.

### R13 — Bánh bèo chén Huế

**Mô tả:** Bánh bột gạo hấp chén nhỏ, mặt tôm chấy và mỡ hành làm bằng dầu; khoảng 24 chén, 4 phần ăn nhẹ. Chuẩn bị 30 phút, nghỉ bột 45 phút, nấu/hấp 35 phút.

| ingredientId | Nguyên liệu | quantity | Đơn vị |
|---|---|---|---|
| 86 | Bột gạo | 200 | g |
| 48 | Bột năng | 20 | g |
| 8 | Tôm bóc vỏ | 250 | g |
| 14 | Hành lá | 40 | g |
| 29 | Hành tím | 15 | g |
| 39 | Dầu ăn | 40 | ml |
| 34 | Nước mắm | 40 | ml |
| 37 | Đường | 25 | g |
| 36 | Muối | 2 | g |
| 32 | Ớt | 3 | g |
| 53 | Nước lọc | 800 | ml |

1. Chia toàn bộ nước lọc thành ba phần theo tỉ lệ 5:7:4, lần lượt để nguội pha bột, làm nóng pha bột và để pha nước chấm. Trộn toàn bộ bột gạo, bột năng, muối với phần nước nguội pha bột. Rót từ từ phần nước nóng pha bột vào, khuấy đều; nghỉ bột 45 phút. Khuấy lại ngay trước mỗi lượt múc để bột không lắng.
2. Hấp tôm riêng khoảng 5 phút đến chín, giã/tơi nhỏ. Phi toàn bộ hành tím bằng 1/4 tổng dầu, cho tôm vào đảo lửa nhỏ 5–7 phút với 1/4 tổng nước mắm cho tơi ráo, không cháy.
3. Hành lá thái nhỏ, cho vào bát chịu nhiệt. Đun nóng 5/8 tổng dầu rồi rót lên hành, đảo đều; giữ 1/8 tổng dầu còn lại để quét chén.
4. Pha nước chấm bằng phần nước dành nước chấm, phần nước mắm còn lại và toàn bộ đường, đun tan rồi để ấm, thêm ớt. Phiên bản này không pha chanh/giấm.
5. Làm nóng chén nhỏ trong xửng sôi khoảng 2 phút; quét rất mỏng dầu đã giữ, múc khoảng 25 ml bột mỗi chén để giữ cùng độ dày bánh. Hấp 6–8 phút/mẻ đến bột trong đục đồng đều, không còn lớp hồ lỏng ở tâm. Lau nước dưới nắp giữa các mẻ, lặp lại đến hết bột; không tăng lượng bột mỗi chén theo số người.
6. Để bánh se mặt 2 phút, thêm tôm chấy và dầu hành, ăn với nước mắm. Độ lõm và số chén phụ thuộc kích thước chén, không phải tiêu chí để bỏ qua kiểm tra bánh chín.

**Khi đổi khẩu phần:** Tăng hoặc giảm số chén/số mẻ, giữ chén cùng kích thước và lớp bột mỏng. Khoảng 25 ml là lượng cho một chén nhỏ, không phải lượng nguyên liệu cho cả công thức; số chén ghi trong mô tả là ước tính, dùng hết bột và chia tôm đều theo số chén thực tế.

### R14 — Gà nướng mắc khén Tây Bắc

**Mô tả:** Gà ướp mắc khén, sả, gừng rồi nướng lò, mô phỏng hương vị gà nướng vùng Tây Bắc trong điều kiện bếp gia đình. Chuẩn bị 20 phút, ướp 2 giờ, nướng 50 phút.

| ingredientId | Nguyên liệu | quantity | Đơn vị |
|---|---|---|---|
| 5 | Gà ta miếng có xương | 1200 | g |
| 87 | Mắc khén | 5 | g |
| 31 | Sả | 40 | g |
| 30 | Gừng | 20 | g |
| 29 | Hành tím | 30 | g |
| 28 | Tỏi | 15 | g |
| 32 | Ớt | 5 | g |
| 36 | Muối | 6 | g |
| 34 | Nước mắm | 20 | ml |
| 39 | Dầu ăn | 20 | ml |
| 60 | Nước cốt chanh | 20 | ml |

1. Gà chia miếng lớn dày tương đối đều, thấm khô, khía nhẹ phần đùi. Rang mắc khén lửa nhỏ 1–2 phút tới thơm rồi giã, tránh rang cháy gây đắng.
2. Giã toàn bộ sả, gừng, hành, tỏi với 3/5 tổng mắc khén, 2/3 tổng muối, 3/5 tổng ớt, toàn bộ nước mắm và dầu. Xoa đều lên gà, ướp kín trong ngăn mát 2 giờ.
3. Làm nóng lò 190°C. Đặt gà lên vỉ có khay hứng, nướng 25 phút rồi trở mặt; nướng tiếp 20–25 phút tùy miếng. Nếu mặt vàng quá nhanh thì che lỏng bằng giấy bạc.
4. Kiểm tra phần thịt dày nhất gần xương đã chín hoàn toàn; nếu chưa chín thì nướng tiếp và ghi lại thời gian theo thiết bị thực tế. Không dùng nước ướp thịt sống làm nước chấm.
5. Trộn phần mắc khén, muối và ớt còn lại với toàn bộ nước chanh làm chấm kiểu gia đình; để gà nghỉ 5 phút rồi chặt miếng. Đây không được mô tả là công thức chẩm chéo truyền thống đầy đủ.

**Khi đổi khẩu phần:** Giữ cỡ miếng gà, xếp thoáng một lớp trên vỉ. Chia khay hoặc nướng nhiều mẻ nếu cần, giữ nhiệt độ lò và kiểm tra từng mẻ; không nướng nguyên một khối gà dày hơn theo hệ số khẩu phần.

### R15 — Bánh xèo miền Tây

**Mô tả:** Bánh xèo vỏ mỏng từ bột gạo, nước cốt dừa và nghệ, nhân tôm ba chỉ giá; cuốn rau chấm nước mắm chua ngọt. Khoảng 8 bánh chảo 24–26 cm, 4 phần. Chuẩn bị 30 phút, nghỉ bột 30 phút, nấu 40 phút.

| ingredientId | Nguyên liệu | quantity | Đơn vị |
|---|---|---|---|
| 86 | Bột gạo | 250 | g |
| 48 | Bột năng | 20 | g |
| 70 | Bột nghệ | 3 | g |
| 88 | Nước cốt dừa | 200 | ml |
| 53 | Nước lọc | 550 | ml |
| 1 | Ba chỉ heo | 250 | g |
| 8 | Tôm bóc vỏ | 250 | g |
| 18 | Giá đỗ | 300 | g |
| 25 | Hành tây | 100 | g |
| 14 | Hành lá | 30 | g |
| 39 | Dầu ăn | 80 | ml |
| 36 | Muối | 4 | g |
| 34 | Nước mắm | 50 | ml |
| 37 | Đường | 30 | g |
| 60 | Nước cốt chanh | 30 | ml |
| 28 | Tỏi | 15 | g |
| 32 | Ớt | 5 | g |
| 52 | Xà lách | 200 | g |
| 89 | Cải xanh | 200 | g |
| 17 | Húng quế | 30 | g |

1. Trộn toàn bộ bột gạo, bột năng, nghệ, nước cốt dừa với 8/11 tổng nước lọc và một nửa tổng muối, khuấy mịn; thêm hành lá thái nhỏ, nghỉ 30 phút. Giữ 3/11 nước còn lại cho nước chấm. Bột phải đủ loãng để láng mỏng; điều chỉnh nhỏ khi thử bánh đầu và cập nhật nếu thay đổi công thức.
2. Ba chỉ thái mỏng; hành tây thái múi mỏng. Ướp thịt và tôm với phần muối còn lại, 1/5 tổng nước mắm và 1/3 tổng tỏi băm trong 10 phút.
3. Dùng 1/8 tổng dầu xào thịt và tôm chín, chia nhân theo số bánh dự kiến từ lượng bột đã đổi khẩu phần. Rau sống rửa sạch, để ráo; giá rửa sạch để dùng làm nhân được nấu chín.
4. Pha phần nước lọc đã giữ với phần nước mắm và tỏi còn lại cùng toàn bộ đường, nước chanh và ớt. Khuấy tan đường.
5. Làm nóng chảo, chia phần dầu còn lại cho các lượt đổ bánh. Với chảo 24–26 cm, cho một phần thịt tôm, hành tây, múc khoảng 100–110 ml bột láng mỏng, thêm một phần giá, đậy 1–2 phút. Lượng bột mỗi bánh phụ thuộc chảo, không nhân theo số người.
6. Mở nắp, nấu thêm 2–3 phút đến vỏ khô giòn, giá chín, gập bánh. Lặp lại đến hết bột và nhân, khuấy bột trước mỗi lượt. Ăn ngay với rau và nước chấm để bánh không ỉu.

**Khi đổi khẩu phần:** Giữ đường kính chảo và độ mỏng vỏ, thay đổi số bánh/số lượt đổ. Chia nhân và giá theo số bánh thực tế để dùng hết cùng bột; mốc thời gian áp dụng mỗi bánh, tổng thời gian tăng khi có thêm lượt.

### R16 — Gỏi cuốn tôm thịt

**Mô tả:** Cuốn tôm luộc, ba chỉ, bún và rau, chấm tương hột lạc; khoảng 12 cuốn, 4 phần ăn nhẹ. Chuẩn bị 30 phút, nấu 30 phút.

| ingredientId | Nguyên liệu | quantity | Đơn vị |
|---|---|---|---|
| 8 | Tôm bóc vỏ | 300 | g |
| 1 | Ba chỉ heo | 300 | g |
| 46 | Bún tươi | 300 | g |
| 90 | Bánh tráng cuốn | 120 | g |
| 52 | Xà lách | 150 | g |
| 17 | Húng quế | 20 | g |
| 58 | Dưa leo | 150 | g |
| 91 | Tương hột | 100 | g |
| 47 | Lạc rang | 40 | g |
| 28 | Tỏi | 10 | g |
| 39 | Dầu ăn | 10 | ml |
| 37 | Đường | 15 | g |
| 36 | Muối | 3 | g |
| 53 | Nước lọc | 1200 | ml |

1. Dành 5/6 tổng nước lọc để luộc ba chỉ với toàn bộ muối; giữ 1/6 nước cho sốt tương. Luộc sôi nhỏ khoảng 20–25 phút tùy độ dày, kiểm tra chín tận giữa rồi vớt ra. Cho tôm vào nước luộc đang sôi, nấu khoảng 3–4 phút tới chín, vớt ra để ráo. Nước luộc này không dùng làm sốt tương.
2. Thịt nguội bớt thái mỏng; tôm bổ dọc nếu con lớn. Rau rửa sạch để ráo kỹ, dưa leo bỏ ruột mềm rồi cắt thanh; chia bún và nhân theo số lá bánh tráng thực tế, giữ mỗi cuốn kích thước tương tự.
3. Xay/dằm toàn bộ tương hột với phần nước lọc đã giữ. Phi toàn bộ tỏi với dầu, cho tương và đường vào nấu 5–7 phút; thêm một nửa tổng lạc giã, khuấy sánh vừa rồi tắt bếp.
4. Chuẩn bị bánh tráng theo lượng trong bảng đã đổi; mẻ gốc 4 phần ăn dùng khoảng 12 lá. Làm ẩm vừa theo hướng dẫn sản phẩm bằng nước sạch riêng. Xếp xà lách, rau, dưa leo, bún, thịt, tôm và cuốn chắc vừa tay đến hết nhân.
5. Chia sốt, rắc phần lạc còn lại. Dùng cuốn ngay sau khi làm; nếu chờ, giữ lạnh và che để bánh không khô, tránh để thịt tôm chín lâu ngoài nhiệt độ phòng.

**Khi đổi khẩu phần:** Tăng giảm số cuốn, không tăng độ dày cuốn. Giữ miếng ba chỉ có độ dày tương tự khi luộc, chọn nồi vừa lượng thịt để nước phủ; làm sốt trong nồi nhỏ phù hợp và kiểm tra độ sánh thay vì chỉ dựa vào thời gian.

### R17 — Cá hú kho tộ

**Mô tả:** Cá hú kho tiêu, hành, nước mắm và nước dừa; sốt nâu sánh nhẹ, hợp cơm nóng. Chuẩn bị 15 phút, ướp 25 phút, nấu 35 phút.

| ingredientId | Nguyên liệu | quantity | Đơn vị |
|---|---|---|---|
| 92 | Cá hú cắt khúc | 700 | g |
| 34 | Nước mắm | 40 | ml |
| 37 | Đường | 25 | g |
| 43 | Nước dừa tươi | 300 | ml |
| 29 | Hành tím | 25 | g |
| 28 | Tỏi | 10 | g |
| 32 | Ớt | 5 | g |
| 38 | Tiêu | 2 | g |
| 14 | Hành lá | 20 | g |
| 39 | Dầu ăn | 15 | ml |

1. Cá làm sạch nhớt và máu đọng, thấm ráo; khúc dày khoảng 2–3 cm. Băm hành tỏi, thái hành lá và ớt.
2. Ướp cá với 3/4 tổng nước mắm, 2/5 tổng đường, một nửa của từng loại hành tím và tỏi cùng một nửa tổng tiêu trong ngăn mát 25 phút.
3. Đun phần đường còn lại với toàn bộ dầu tới màu hổ phách; thêm phần hành tỏi còn lại, đảo nhanh rồi xếp cá nhẹ tay vào, trở một lần cho bám màu.
4. Rót toàn bộ nước dừa và phần nước mắm còn lại, đun sôi rồi hạ nhỏ lửa kho 25–30 phút, rưới nước kho lên mặt cá thay vì đảo. Hé nắp giai đoạn cuối cho nước sánh, tránh cạn cháy.
5. Kiểm tra cá chín tới giữa khúc, thêm toàn bộ hành lá, ớt và phần tiêu còn lại, đun thêm 1 phút. Nếu dùng nồi đất, phải là loại dùng được trên bếp và tăng nhiệt từ từ.

**Khi đổi khẩu phần:** Giữ khúc cá dày 2–3 cm; chọn nồi rộng vừa để xếp cá ít lớp, chia nồi khi lượng lớn. Điều chỉnh lửa/nắp để nước kho sánh đúng mức, không nhân thời gian kho theo số người.

### R18 — Cơm tấm sườn nướng

**Mô tả:** Cơm gạo tấm, sườn cốt lết nướng, dầu hành, đồ chua và nước mắm pha; phiên bản không có bì/chả trứng. Chuẩn bị 30 phút, ướp ít nhất 2 giờ, nấu khoảng 40 phút do cơm và thịt làm song song.

| ingredientId | Nguyên liệu | quantity | Đơn vị |
|---|---|---|---|
| 94 | Gạo tấm | 400 | g |
| 93 | Sườn cốt lết heo | 800 | g |
| 31 | Sả | 40 | g |
| 28 | Tỏi | 20 | g |
| 29 | Hành tím | 20 | g |
| 34 | Nước mắm | 80 | ml |
| 37 | Đường | 45 | g |
| 95 | Mật ong | 15 | g |
| 39 | Dầu ăn | 40 | ml |
| 38 | Tiêu | 2 | g |
| 14 | Hành lá | 40 | g |
| 23 | Cà rốt | 120 | g |
| 59 | Đu đủ xanh | 120 | g |
| 51 | Giấm gạo | 40 | ml |
| 58 | Dưa leo | 150 | g |
| 19 | Cà chua | 150 | g |
| 60 | Nước cốt chanh | 25 | ml |
| 32 | Ớt | 5 | g |
| 53 | Nước lọc | 650 | ml |

1. Sườn dày khoảng 1–1,5 cm, thấm khô và dần nhẹ. Băm sả, hành tím, tỏi. Ướp sườn với toàn bộ sả, hành tím, một nửa tổng tỏi, 7/16 tổng nước mắm, 1/3 tổng đường, toàn bộ mật ong, tiêu và 3/8 tổng dầu; giữ ngăn mát ít nhất 2 giờ.
2. Chia toàn bộ nước lọc thành hai phần theo tỉ lệ 10:3, lần lượt để nấu cơm và pha nước chấm. Vo gạo tấm để ráo, nấu với phần nước nấu cơm bằng nồi cơm rồi ủ 10 phút. Tỉ lệ khởi điểm tương đương 1.25 ml nước cho mỗi 1 g gạo khô, có thể cần điều chỉnh theo giống gạo/nồi khi nấu thử.
3. Cà rốt và đu đủ thái sợi, trộn toàn bộ giấm và 2/9 tổng đường, để 20 phút rồi để ráo. Dưa leo và cà chua thái lát. Đun phần dầu còn lại và rót vào hành lá thái nhỏ trong bát chịu nhiệt làm dầu hành.
4. Pha phần nước dành nước chấm với phần nước mắm, đường và tỏi còn lại cùng toàn bộ nước chanh và ớt; khuấy tan.
5. Làm nóng lò 210°C, nướng sườn 18–25 phút, trở giữa chừng, kiểm tra chín tận phần gần xương. Không quét nước ướp sống lên sườn ở cuối quá trình nướng.
6. Chia cơm, sườn, rau và đồ chua theo số phần ăn đang nấu; rưới dầu hành lên cơm, nước mắm để riêng. Không ghi thành “cơm tấm sườn bì chả” vì bản này không có bì và chả.

**Khi đổi khẩu phần:** Giữ miếng sườn dày 1–1,5 cm, nướng một lớp và chia mẻ nếu cần. Không vượt dung tích nấu của nồi cơm; tăng lượng gạo/nước theo bảng, giữ nhiệt độ nướng và kiểm tra sườn chín gần xương từng mẻ.

### R19 — Đậu phụ kho nấm chay

**Mô tả:** Đậu phụ kho nấm rơm, nấm đùi gà và nấm bào ngư, dùng nước tương; món chay ăn cùng cơm. Chuẩn bị 20 phút, nấu 25 phút.

| ingredientId | Nguyên liệu | quantity | Đơn vị |
|---|---|---|---|
| 12 | Đậu phụ trắng | 500 | g |
| 26 | Nấm rơm | 150 | g |
| 96 | Nấm đùi gà | 150 | g |
| 97 | Nấm bào ngư | 100 | g |
| 28 | Tỏi | 10 | g |
| 41 | Nước tương chay | 40 | ml |
| 37 | Đường | 10 | g |
| 36 | Muối | 2 | g |
| 38 | Tiêu | 1 | g |
| 39 | Dầu ăn | 40 | ml |
| 14 | Hành lá | 20 | g |
| 53 | Nước lọc | 300 | ml |

1. Đậu phụ để ráo, thấm khô, cắt khối 2–3 cm. Nấm bỏ chân bẩn, rửa nhanh, để ráo; nấm rơm bổ đôi, nấm đùi gà thái, nấm bào ngư xé vừa.
2. Dùng 3/4 tổng dầu áp chảo đậu 6–8 phút mỗi mẻ, trở nhẹ đến vàng các mặt rồi lấy ra. Nếu chia mẻ, chia phần dầu này cho các mẻ.
3. Thêm phần dầu còn lại, phi toàn bộ tỏi băm, cho nấm vào đảo 3 phút. Thêm toàn bộ nước tương, đường, muối và nước lọc trong bảng, đun sôi.
4. Cho đậu vào, kho nhỏ lửa 10–12 phút, lắc nồi nhẹ cho thấm. Không dùng dầu hào thường hay hạt nêm thịt để nêm món này.
5. Khi nấm chín, đậu nóng và sốt còn sánh nhẹ, thêm hành lá và tiêu, nấu thêm 1 phút. Món chay này có hành tỏi, không phù hợp chế độ kiêng ngũ vị tân nếu chưa điều chỉnh.

**Khi đổi khẩu phần:** Áp chảo đậu một lớp, tăng số mẻ nếu cần; kho trong nồi đủ rộng để đảo nhẹ. Kiểm tra nấm chín và sốt sánh, vì lượng nước tiết ra từ nấm và mức bay hơi thay đổi theo mẻ.

### R20 — Chè chuối nước cốt dừa

**Mô tả:** Chè chuối sứ chín, bột báng và nước cốt dừa, vị ngọt vừa; 4 chén tráng miệng. Chuẩn bị 15 phút, ngâm bột báng 20 phút, nấu 25 phút.

| ingredientId | Nguyên liệu | quantity | Đơn vị |
|---|---|---|---|
| 98 | Chuối sứ chín bóc vỏ | 500 | g |
| 99 | Bột báng | 50 | g |
| 88 | Nước cốt dừa | 300 | ml |
| 37 | Đường | 70 | g |
| 36 | Muối | 1 | g |
| 73 | Lá dứa | 15 | g |
| 47 | Lạc rang | 30 | g |
| 100 | Mè trắng rang | 10 | g |
| 53 | Nước lọc | 700 | ml |

1. Ngâm bột báng bằng nước sạch riêng 20 phút rồi xả ráo. Chuối chín vừa, cắt lát dày 1,5–2 cm, trộn với 2/7 tổng đường trong 10 phút. Lá dứa rửa, buộc gọn.
2. Đun toàn bộ nước lọc trong bảng với lá dứa, cho bột báng vào nấu 10–15 phút, khuấy nhẹ đến gần trong; thời gian có thể khác theo sản phẩm.
3. Cho chuối cùng nước đường tiết ra vào nồi, nấu lửa nhỏ 5–7 phút tới chuối mềm nhưng không nát.
4. Thêm toàn bộ nước cốt dừa, phần đường còn lại và toàn bộ muối, đun sôi nhẹ 3–5 phút; không sôi trào mạnh. Kiểm tra bột báng trong, không còn lõi cứng, vớt lá dứa.
5. Múc chè theo số phần ăn đang nấu, rắc toàn bộ lạc và mè chia đều. Độ sánh tăng khi nguội; món này không cần bột năng bổ sung.

**Khi đổi khẩu phần:** Giữ độ dày lát chuối, dùng nồi chừa khoảng trống chống trào và khuấy sát đáy. Nồi lớn lâu nóng hơn; thời điểm kết thúc dựa vào chuối mềm, bột báng chín và độ sánh, không nhân thời gian nấu theo số chén.

## 9. Chi tiết 6 công thức riêng tư

Các món dưới đây là dữ liệu mô phỏng công thức User tự tạo. Không coi là bài đã được User thật viết hoặc xác nhận. Mỗi món có nội dung độc lập, không sao chép nguyên công thức công khai rồi đổi quyền xem.

### R21 — Rau muống xào tỏi của Hoang

**Mô tả:** Rau muống xào tỏi nước tương, món riêng tư cho bữa tối 2 người của Hoang. Chuẩn bị 12 phút, nấu 8 phút.

| ingredientId | Nguyên liệu | quantity | Đơn vị |
|---|---|---|---|
| 13 | Rau muống nhặt sạch | 400 | g |
| 28 | Tỏi | 20 | g |
| 39 | Dầu ăn | 20 | ml |
| 41 | Nước tương chay | 15 | ml |
| 36 | Muối | 2 | g |
| 37 | Đường | 3 | g |
| 53 | Nước lọc | 40 | ml |

1. Nhặt rau, rửa sạch, cắt đoạn 5–6 cm, tách phần cọng lớn và lá. Tỏi đập dập, băm thô.
2. Làm nóng chảo với dầu; cho một nửa tỏi vào phi thơm 20–30 giây, không để vàng sẫm.
3. Cho cọng vào đảo 1–2 phút, thêm lá, nước, muối, đường và nước tương; xào lửa lớn 3–4 phút, đảo để rau chín đều.
4. Thêm phần tỏi còn lại, đảo 1 phút tới rau chín, cọng còn giòn; dọn ngay. Không chần rồi ghi thiếu công đoạn/định lượng gia vị trong bản này.

**Khi đổi khẩu phần:** Giữ độ dài cọng rau, chia mẻ để chảo đủ nóng và rau chín đều. Chia lượng tỏi, dầu, nước và gia vị theo lượng rau mỗi mẻ; không dồn toàn bộ rau vào chảo nhỏ rồi kéo dài thời gian xào.

### R22 — Trứng chiên hành của Hoang

**Mô tả:** Trứng chiên mỏng với hành lá, nước mắm và tiêu, dùng cho bữa cơm nhanh 2 người. Chuẩn bị 5 phút, nấu 8 phút.

| ingredientId | Nguyên liệu | quantity | Đơn vị |
|---|---|---|---|
| 10 | Trứng gà | 3 | quả |
| 14 | Hành lá | 20 | g |
| 34 | Nước mắm | 10 | ml |
| 38 | Tiêu | 0.5 | g |
| 39 | Dầu ăn | 15 | ml |
| 53 | Nước lọc | 15 | ml |

1. Hành lá rửa sạch thái nhỏ. Đập trứng vào bát, loại vỏ sót và đánh tan. Nếu lượng trứng trong bảng là phần lẻ quả, lấy lượng trứng đã đánh tương ứng trước khi trộn toàn bộ nước mắm, tiêu và nước theo bảng.
2. Trộn hành lá vào trứng. Làm nóng chảo chống dính ở lửa vừa; chảo cỡ 22–24 cm phù hợp mẻ gốc, chia lượng dầu trong bảng cho các lượt chiên nếu tăng mẻ.
3. Đổ một lượng trứng đủ tạo lớp mỏng đều, nghiêng chảo; giữ phần hỗn hợp còn lại cho các lượt tiếp theo. Hạ lửa vừa nhỏ, đậy khoảng 3–4 phút tới mặt trên gần đông.
4. Lật bằng đĩa hoặc chia miếng để trở, chiên thêm 1–2 phút đến trứng đông hoàn toàn, không còn phần trứng lỏng. Tắt bếp và cắt miếng.

**Khi đổi khẩu phần:** Dùng chảo nhỏ hơn khi nấu ít hoặc chiên nhiều lượt khi nấu nhiều, giữ lớp trứng mỏng tương tự. Thực hiện bước chiên và trở cho từng lượt đến hết hỗn hợp; không tăng độ dày trứng theo số người.

### R23 — Canh bí đỏ thịt bằm của Lan Anh

**Mô tả:** Canh bí đỏ mềm với thịt heo bằm, hành lá, nấu cho bữa cơm 3 người. Chuẩn bị 15 phút, nấu 20 phút.

| ingredientId | Nguyên liệu | quantity | Đơn vị |
|---|---|---|---|
| 101 | Bí đỏ | 450 | g |
| 50 | Thịt heo xay | 150 | g |
| 29 | Hành tím | 15 | g |
| 14 | Hành lá | 15 | g |
| 34 | Nước mắm | 20 | ml |
| 36 | Muối | 2 | g |
| 38 | Tiêu | 0.5 | g |
| 39 | Dầu ăn | 10 | ml |
| 53 | Nước lọc | 1000 | ml |

1. Bí gọt vỏ, bỏ hạt, cân theo lượng trong bảng đã đổi khẩu phần rồi cắt miếng 2 cm. Băm hành tím, thái hành lá. Trộn thịt với một nửa tổng nước mắm và toàn bộ tiêu.
2. Phi hành tím với dầu, cho thịt vào đảo tơi 2–3 phút tới đổi màu, không để vón thành khối sống bên trong.
3. Rót nước, đun sôi và hớt bọt; cho bí vào, nấu nhỏ lửa 12–15 phút đến bí mềm khi xiên nhưng chưa nát.
4. Thêm phần nước mắm còn lại và toàn bộ muối, đun 1 phút; kiểm tra thịt chín rồi thêm hành lá, tắt bếp.

**Khi đổi khẩu phần:** Giữ miếng bí khoảng 2 cm và đánh tơi thịt. Chọn nồi đủ chứa, bắt đầu tính thời gian nấu bí khi canh sôi trở lại, kết thúc khi bí mềm vừa; chia canh theo số phần ăn đang nấu.

### R24 — Đậu phụ sốt cà chua của Lan Anh

**Mô tả:** Đậu phụ áp chảo sốt cà chua nước mắm chay, ăn với cơm; 3 người. Chuẩn bị 15 phút, nấu 20 phút.

| ingredientId | Nguyên liệu | quantity | Đơn vị |
|---|---|---|---|
| 12 | Đậu phụ trắng | 450 | g |
| 19 | Cà chua | 300 | g |
| 29 | Hành tím | 15 | g |
| 14 | Hành lá | 15 | g |
| 103 | Nước mắm chay | 20 | ml |
| 37 | Đường | 8 | g |
| 36 | Muối | 2 | g |
| 39 | Dầu ăn | 35 | ml |
| 53 | Nước lọc | 150 | ml |

1. Đậu thấm khô, cắt miếng 2 cm; cà chua băm nhỏ hoặc thái hạt lựu, hành tím băm, hành lá thái.
2. Dùng 5/7 tổng dầu áp chảo đậu 6–8 phút mỗi mẻ đến vàng nhẹ, trở đều rồi lấy ra. Chia phần dầu này cho các mẻ nếu cần.
3. Thêm phần dầu còn lại, phi toàn bộ hành tím, cho cà chua và muối vào xào 4 phút. Thêm toàn bộ nước lọc, đường, nước mắm chay trong bảng, nấu 3 phút cho cà mềm thành sốt.
4. Cho đậu vào, rim 5 phút, trở nhẹ cho sốt bám đều. Thêm hành lá, tắt bếp khi đậu nóng thấm sốt; không thêm nước mắm cá vì món đang gắn danh mục chay.

**Khi đổi khẩu phần:** Giữ miếng đậu khoảng 2 cm và áp chảo một lớp; tăng số mẻ thay vì nhồi chảo. Điều chỉnh lửa/nắp để sốt bám đậu, vì cà chua có thể tiết lượng nước khác nhau.

### R25 — Sườn xào chua ngọt của Đức

**Mô tả:** Sườn non sốt giấm đường cùng ớt chuông và hành tây; 3 người dùng chung bữa cơm. Chuẩn bị 20 phút, nấu 35 phút.

| ingredientId | Nguyên liệu | quantity | Đơn vị |
|---|---|---|---|
| 6 | Sườn heo non | 600 | g |
| 57 | Ớt chuông đỏ | 120 | g |
| 25 | Hành tây | 100 | g |
| 28 | Tỏi | 15 | g |
| 34 | Nước mắm | 30 | ml |
| 51 | Giấm gạo | 35 | ml |
| 37 | Đường | 30 | g |
| 48 | Bột năng | 5 | g |
| 39 | Dầu ăn | 30 | ml |
| 38 | Tiêu | 1 | g |
| 53 | Nước lọc | 400 | ml |

1. Sườn chặt miếng vừa, chần nước sôi riêng 3 phút rồi rửa cặn. Hành tây và ớt chuông cắt vuông, tỏi băm.
2. Chia toàn bộ nước lọc trong bảng thành ba phần theo tỉ lệ 15:4:1, lần lượt để nấu sườn, pha sốt và hòa bột năng. Cho sườn cùng phần nước dành nấu sườn vào nồi vừa lượng thịt, đậy nắp nấu nhỏ lửa 15–20 phút tới gần mềm; giữ nước nấu còn lại.
3. Hòa toàn bộ nước mắm, giấm, đường, tiêu với phần nước dành pha sốt. Hòa riêng toàn bộ bột năng với phần nước dành hòa bột.
4. Làm nóng dầu trong chảo, áp chảo sườn ráo mặt khoảng 5 phút; thêm tỏi vào cuối. Cho hỗn hợp sốt và phần nước nấu sườn vào, đun nhỏ lửa 5 phút.
5. Thêm hành tây, ớt chuông, đảo 2–3 phút. Khuấy lại bột năng và rót từ từ vào chảo, đun 1–2 phút đến sốt bóng sánh, sườn chín mềm. Không đổ bột khô trực tiếp gây vón.

**Khi đổi khẩu phần:** Giữ cỡ miếng sườn, dùng nồi vừa để nấu mềm và áp chảo theo mẻ. Nếu chia mẻ hoàn thiện sốt, chia cả rau, sốt, nước nấu sườn và hỗn hợp bột theo lượng sườn mỗi mẻ; kiểm tra độ mềm và độ sánh trước khi tắt bếp.

### R26 — Chè đậu xanh lá dứa của Đức

**Mô tả:** Chè đậu xanh cà vỏ, lá dứa và nước cốt dừa; 4 phần tráng miệng. Chuẩn bị 10 phút, ngâm đậu 2 giờ, nấu 35 phút.

| ingredientId | Nguyên liệu | quantity | Đơn vị |
|---|---|---|---|
| 102 | Đậu xanh cà vỏ | 200 | g |
| 73 | Lá dứa | 20 | g |
| 37 | Đường | 90 | g |
| 88 | Nước cốt dừa | 200 | ml |
| 48 | Bột năng | 15 | g |
| 36 | Muối | 1 | g |
| 53 | Nước lọc | 1200 | ml |

1. Vo đậu, ngâm nước sạch riêng 2 giờ trong ngăn mát, xả và để ráo. Lá dứa rửa sạch, buộc gọn.
2. Cho toàn bộ đậu, lá dứa và 11/12 tổng nước lọc vào nồi; giữ 1/12 nước để hòa bột năng. Đun sôi, hớt bọt và nấu nhỏ lửa 20–25 phút tới đậu mềm. Khuấy sát đáy nhẹ tay để không khét.
3. Vớt lá dứa, thêm đường và muối, khuấy tan rồi nấu 3 phút. Cho đường sau khi đậu mềm để tránh kéo dài thời gian nấu đậu.
4. Hòa toàn bộ bột năng với phần nước đã giữ, khuấy lại rồi rót từ từ vào nồi chè đang sôi nhẹ. Nấu 2 phút đến bột chín, chè sánh nhẹ.
5. Thêm toàn bộ nước cốt dừa, khuấy đều, đun sôi lăn tăn 2 phút rồi tắt bếp. Chia theo số phần ăn đang nấu; không gọi là chè thuần đậu xanh nếu bỏ qua thành phần dừa trong mô tả.

**Khi đổi khẩu phần:** Giữ tỉ lệ đậu, nước và bột theo bảng đã đổi, dùng nồi đủ lớn và khuấy sát đáy. Nấu tới đậu mềm rồi mới thêm đường; lượng lớn cần lâu sôi hơn nhưng không nhân thời gian làm mềm đậu một cách tự động.

## 10. Tương tác, thực đơn và danh sách đi chợ

Giữ tinh thần dữ liệu `07-seed-interactions.js`, mở rộng đủ để thử tìm kiếm, yêu thích, đổi khẩu phần và tính riêng tư. Các bảng dưới đây là bộ tương tác mục tiêu hoàn chỉnh cho bản đề xuất; không giữ dòng đi chợ cũ có số lượng sai với định lượng mới.

### FavoriteRecipes

| userId | recipeId | personalNotes |
|---|---|---|
| 3 | 1 | Canh chua cho bữa cơm sum họp cuối tuần. |
| 4 | 2 | Kho lửa nhỏ để thịt mềm và trứng thấm. |
| 2 | 6 | Chuẩn bị đồ chua trước khi nướng chả. |
| 2 | 14 | Ướp gà từ buổi sáng cho bữa tối. |
| 3 | 19 | Món chay cho ngày đổi vị. |
| 4 | 11 | Nhớ chan nước nhân xâm xấp. |

Tất cả đều trỏ tới món công khai Approved, chưa xóa; không tạo yêu thích món riêng tư của người khác.

### RecipeLists

| id | userId | listName |
|---|---|---|
| 1 | 3 | Bữa cơm sum họp cuối tuần |
| 2 | 2 | Bữa trưa nhanh gọn |
| 3 | 4 | Cuối tuần đổi món miền Trung |
| 4 | 3 | Bữa cơm chay gia đình |
| 5 | 4 | Món riêng Đức muốn nấu |
| 6 | 3 | Bổ sung món chay cho ngày mai |

### RecipeListItems

| id | recipeListId | recipeId | targetServings |
|---|---|---|---|
| 1 | 1 | 1 | 6 |
| 2 | 1 | 2 | 6 |
| 3 | 2 | 4 | 2 |
| 4 | 2 | 21 | 2 |
| 5 | 2 | 22 | 2 |
| 6 | 3 | 11 | 4 |
| 7 | 3 | 13 | 4 |
| 8 | 4 | 19 | 4 |
| 9 | 4 | 24 | 3 |
| 10 | 5 | 25 | 3 |
| 11 | 5 | 26 | 4 |
| 12 | 6 | 19 | 2 |

List 2 chỉ dùng món riêng của User 2; List 4 chỉ dùng món riêng của User 3; List 5 chỉ dùng món riêng của User 4. Không tạo tham chiếu chéo công thức private. Cơm trắng ăn kèm chưa được thêm vào các thực đơn này; không âm thầm đưa gạo vào danh sách mua tự sinh.

### ShoppingLists và ShoppingListRecipeLists

| ShoppingLists.id | userId | title | status |
|---|---|---|---|
| 1 | 3 | Đi chợ cho bữa cơm cuối tuần | In_Progress |
| 2 | 3 | Đi chợ hai bữa chay | Completed |

| shoppingListId | recipeListId |
|---|---|
| 1 | 1 |
| 2 | 4 |
| 2 | 6 |

Các thực đơn gộp vào cùng danh sách mua phải thuộc chủ danh sách đó. Danh sách 2 cố ý gộp hai thực đơn cùng có R19 để kiểm tra cộng dồn qua nhiều RecipeList.

### ShoppingListItems — danh sách 1, dữ liệu tính sẵn

R01 và R02 đều từ 4 lên 6 phần, hệ số 1.5. Số dưới đây là kết quả sau cộng dồn theo `(ingredientId, unit)`; `itemName` lấy đúng tên trong Ingredients.

| id | shoppingListId | ingredientId | itemName | totalQuantity | unit | isPurchased |
|---|---|---|---|---|---|---|
| 1 | 1 | 7 | Cá lóc (cá quả) | 900 | g | false |
| 2 | 1 | 19 | Cà chua | 300 | g | true |
| 3 | 1 | 20 | Dứa (thơm) | 225 | g | true |
| 4 | 1 | 21 | Đậu bắp | 150 | g | false |
| 5 | 1 | 22 | Bạc hà (dọc mùng) | 150 | g | false |
| 6 | 1 | 18 | Giá đỗ | 150 | g | false |
| 7 | 1 | 42 | Me chua chín | 45 | g | false |
| 8 | 1 | 16 | Rau ngổ (ngò om) | 15 | g | false |
| 9 | 1 | 28 | Tỏi khô | 30 | g | false |
| 10 | 1 | 32 | Ớt hiểm | 4.5 | g | false |
| 11 | 1 | 34 | Nước mắm truyền thống | 112.5 | ml | false |
| 12 | 1 | 37 | Đường cát trắng | 67.5 | g | false |
| 13 | 1 | 36 | Muối tinh | 4.5 | g | false |
| 14 | 1 | 39 | Dầu ăn | 37.5 | ml | false |
| 15 | 1 | 53 | Nước lọc | 2550 | ml | false |
| 16 | 1 | 1 | Thịt ba chỉ heo | 900 | g | false |
| 17 | 1 | 11 | Trứng cút | 24 | quả | false |
| 18 | 1 | 43 | Nước dừa tươi | 900 | ml | false |
| 19 | 1 | 29 | Hành tím | 30 | g | false |
| 20 | 1 | 38 | Tiêu đen xay | 1.5 | g | false |
| 21 | 1 | null | Nước rửa chén | 1 | chai | false |

Dòng 21 là mục người dùng nhập thêm, không phải nguyên liệu món ăn và không nằm trong Ingredients. Nước lọc được giữ vì service hiện tại chưa có cờ loại trừ vật tư sẵn có; người dùng có thể đánh dấu đã có. Không tự bỏ dòng này rồi tuyên bố kết quả giống hệt phép cộng của service.

### ShoppingListItems — danh sách 2, dữ liệu tính sẵn

R19 xuất hiện ở 4 phần và 2 phần, tổng hệ số 1.5; R24 giữ 3 phần, hệ số 1.0. Tất cả các mục được đánh dấu đã mua để nhất quán với trạng thái Completed.

| id | shoppingListId | ingredientId | itemName | totalQuantity | unit | isPurchased |
|---|---|---|---|---|---|---|
| 22 | 2 | 12 | Đậu phụ trắng | 1200 | g | true |
| 23 | 2 | 26 | Nấm rơm | 225 | g | true |
| 24 | 2 | 96 | Nấm đùi gà | 225 | g | true |
| 25 | 2 | 97 | Nấm bào ngư | 150 | g | true |
| 26 | 2 | 28 | Tỏi khô | 15 | g | true |
| 27 | 2 | 41 | Nước tương (xì dầu) | 60 | ml | true |
| 28 | 2 | 37 | Đường cát trắng | 23 | g | true |
| 29 | 2 | 36 | Muối tinh | 5 | g | true |
| 30 | 2 | 38 | Tiêu đen xay | 1.5 | g | true |
| 31 | 2 | 39 | Dầu ăn | 95 | ml | true |
| 32 | 2 | 14 | Hành lá | 45 | g | true |
| 33 | 2 | 53 | Nước lọc | 600 | ml | true |
| 34 | 2 | 19 | Cà chua | 300 | g | true |
| 35 | 2 | 29 | Hành tím | 15 | g | true |
| 36 | 2 | 103 | Nước mắm chay | 20 | ml | true |

### Quy tắc tính khẩu phần và ví dụ kiểm tra

`Lượng cần = quantity gốc × targetServings / defaultServings`.

- Danh sách 1: nước mắm = `(30 + 45) × 6/4 = 112.50 ml`; tỏi = `(10 + 10) × 6/4 = 30 g`; trứng cút = `16 × 6/4 = 24 quả`.
- Danh sách 2: đậu phụ = `500 × (4/4 + 2/4) + 450 × 3/3 = 1200 g`; nước tương = `40 × 1.5 = 60 ml`; nước mắm chay là nguyên liệu khác, không nhập vào nước tương.
- Không làm tròn từng món trước khi cộng; lưu kết quả cuối tối đa 2 chữ số thập phân, phù hợp `DECIMAL(10,2)` hiện tại.
- Nếu khẩu phần khác tạo 1.5 quả trứng, dữ liệu toán học có thể giữ 1.5; hướng dẫn mua thực tế có thể đề nghị mua 2 quả. Không âm thầm làm tròn rồi gọi đó là kết quả service.
- Kiểm tra hướng dẫn R01 ở 2 người và 8 người: nước mắm tổng lần lượt 15 ml và 60 ml; phần ướp `1/3` lần lượt 5 ml và 20 ml, phần nêm còn lại 10 ml và 40 ml. Tổng các phần luôn khớp bảng đã đổi.
- Kiểm tra sản lượng R07 khi từ 4 lên 8 người: lượng nhân/vỏ tăng gấp đôi, dự kiến khoảng 32 cuốn cùng kích thước thay vì 16 cuốn to gấp đôi. Thời gian rán mỗi mẻ và nhiệt độ giữ theo chỉ dẫn; tổng thời gian có thể tăng do thêm mẻ.
- Các phép chia gia vị trong bước là hướng dẫn thao tác, không phải dòng nguyên liệu mới để cộng lần nữa vào danh sách mua. Tránh làm tròn sớm từng phần nhỏ khiến tổng bị lệch; phần dùng cuối lấy lượng thực tế còn lại.

## 11. Đối chiếu triển khai theo các seed hiện có

| File hiện tại | Dữ liệu mục tiêu |
|---|---|
| `01-seed-users.js` | Giữ nguyên 4 tài khoản. |
| `02-seed-categories.js` | 22 Categories: 19 chung, 3 riêng. |
| `03-seed-ingredient-categories-units.js` | 13 IngredientCategories, 29 Units. |
| `04-seed-ingredients.js` | 103 Ingredients; giữ ID 1–52 và chuẩn hóa đơn vị như bảng. |
| `05-seed-recipes.js` | 26 Recipes và 80 RecipeCategories theo metadata; giữ ảnh ID 1–5, cho phép bổ sung URL ảnh ID 6–26. |
| `06-seed-recipe-details.js` | 337 RecipeIngredients và 134 CookingSteps trong phần 8–9; dùng unitId/customUnit theo model. |
| `07-seed-interactions.js` | 6 FavoriteRecipes, 6 RecipeLists, 12 RecipeListItems, 2 ShoppingLists, 3 ShoppingListRecipeLists, 36 ShoppingListItems. |

Khi nạp dữ liệu cần dùng database phát triển sạch hoặc quy trình reset được cho phép, chèn theo thứ tự khóa ngoại, xóa theo thứ tự ngược và reset sequence sau ID lớn nhất. Seeder hiện tại dùng `bulkInsert` với ID cố định, không phải upsert/idempotent: không chạy lại trực tiếp lên bộ dữ liệu đã seed. Các thay đổi quyền sở hữu, đơn vị và thay ID kiểm thử đã được chuyển đồng bộ vào các seed `02`–`07`; kiểm tra dùng queryInterface giả lập, chưa chạy thao tác nạp/xóa dữ liệu thật.

### Danh sách kiểm tra trước khi dùng seed

- Đủ 26 món, 20 public/Approved và 6 private/Approved; User 2, 3, 4 mỗi người đúng 2 món riêng.
- Mỗi recipeId có ít nhất một danh mục, nguyên liệu và các bước đầy đủ; không trùng cặp recipe/category, không trùng dòng ingredient trong một món.
- Mọi ingredientId, unitId, categoryId và authorId đều tồn tại. Đơn vị tại từng dòng khớp defaultUnitId đã chuẩn hóa.
- Tất cả món chay không dùng nước mắm cá/dầu hào động vật; món có trứng không gắn nhãn chay trong bộ này.
- Không có tên món thử nghiệm trong bộ demo; các test về Pending/Rejected/Deleted/định tính được giữ ở fixture kiểm thử nếu cần, không gán ngẫu nhiên cho món chuẩn.
- ThumbnailUrl ID 1–5 giữ đúng URL cũ; ID 6–26 có thể null hoặc URL HTTP/HTTPS hợp lệ. Không tạo trường media/timer mà model chưa hỗ trợ.
- Cả 26 món có ghi chú đổi khẩu phần; các bước dùng lượng sau khi đổi và tỉ lệ chia nguyên liệu, không giữ định lượng cả mẻ hoặc số bát ăn cố định từ khẩu phần gốc. Các số g/ml còn trong bước chỉ phục vụ tỉ lệ nấu hoặc lượng mỗi bát/bánh, đã ghi rõ phạm vi.
- Với nguyên liệu dùng nhiều bước, kiểm tra tổng các phần bằng toàn bộ lượng trong bảng; tách rõ nước nấu, nước chấm, nước dự phòng và nước thao tác bỏ đi. Không nhân nhiệt độ/thời gian theo hệ số khẩu phần; món chiên, xào, nướng, hấp ghi rõ cách chia mẻ.
- ShoppingLists thuộc đúng User, chỉ gộp RecipeLists của User đó, không tham chiếu công thức private của người khác.
- Kiểm tra tự sinh hai danh sách mua khớp toàn bộ dòng tính sẵn, không tính dòng nước rửa chén vào phần cộng tự động.
- Không khẳng định thời gian là chính xác tuyệt đối: độ dày nguyên liệu, thiết bị và loại gạo/bột thay đổi thời gian, mức nước; nấu thử là bước xác nhận cảm quan tiếp theo.

## 12. Nguồn tham khảo và giới hạn xác nhận

Nguồn bên ngoài dùng để đối chiếu tên món, đặc trưng và phạm vi vùng miền. Định lượng và hướng dẫn trong tài liệu là bản biên soạn cho seed gia đình, không chép nguyên văn và không gán cho nguồn là công thức đã được họ chứng nhận.

- [Vietnam Tourism — 21 must-try Vietnamese dishes](https://vietnam.travel/things-to-do/21-must-try-vietnamese-dishes/): đối chiếu tên và nét nhận diện một số món như phở, bún chả, mì Quảng, bánh xèo, cơm tấm, gỏi cuốn; không suy từ nguồn này ra định lượng chuẩn duy nhất.
- [Vietnam Tourism — A foodie guide by region](https://vietnam.travel/things-to-do/vietnam-foodie-guide-region/): tham khảo cách phân bố món theo các miền; nhãn vùng trong tài liệu là vùng gắn với phiên bản được chọn, không phải khẳng định món chỉ tồn tại ở đó.
- [Vietnam Tourism — 5 classic recipes from Vietnam](https://vietnam.travel/things-to-do/recipes-from-vietnam/): nguồn tham khảo bổ trợ cho cách trình bày món Việt nấu tại nhà; không dùng như xác nhận đã thử nghiệm 26 công thức này.
- [Cục Du lịch Quốc gia Việt Nam — Experiencing historical Dien Bien and exploring nature and culture in Northwestern region](https://vietnamtourism.vn/en/index.php/news/items/18553): đối chiếu sự hiện diện của xôi, gà nướng và gia vị mắc khén trong ẩm thực vùng Tây Bắc. Phiên bản lò nướng và tổ hợp màu xôi trong bản này là lựa chọn triển khai tại nhà.
- Nguồn quy tắc ứng dụng: `backend/src/seeders/01–07`, `backend/src/models/recipe.js`, `recipeIngredient.js`, `ingredient.js`, `cookingStep.js`, `shoppingListItem.js`, `backend/src/services/recipeService.js`, `shoppingListService.js` tại thời điểm soạn.

Đã kiểm tra tự động trên nội dung Markdown: đủ 26 công thức, 103 nguyên liệu, 337 dòng nguyên liệu công thức, 134 bước và 36 mục đi chợ; ID nguyên liệu tồn tại, không lặp trong từng món, số lượng dương, đơn vị khớp mặc định, thứ tự bước liên tục, tiêu đề khớp metadata và hai bảng đi chợ khớp phép cộng khẩu phần. Bản chỉnh sửa hướng dẫn có đủ 26 ghi chú đổi khẩu phần; đã rà lại các phần chia nguyên liệu để giữ đúng định lượng gốc, giữ riêng lượng cho mỗi bát/bánh và tỉ lệ nước/gạo.

Kiểm thử triển khai: `backend/tests/unit/seedData.test.js` chạy toàn bộ hàm up của 7 seeder bằng queryInterface giả lập, kiểm tra payload bằng model Sequelize hiện tại, quan hệ/thứ tự khóa ngoại, quyền riêng tư, đơn vị mặc định, ảnh cũ và phép cộng khẩu phần. Hàm down được kiểm tra theo thứ tự ngược. Kiểm tra này không kết nối database, không xác nhận thực thi SQL trên PostgreSQL và không kiểm chứng nấu ở mọi quy mô.

Tài liệu này đủ làm đầu vào triển khai seed và review quan hệ dữ liệu. Mức xác nhận hiện tại là đối chiếu mã nguồn, cấu trúc dữ liệu và biên soạn công thức; chưa có kiểm chứng nấu thực tế, kiểm tra nội dung ảnh khớp món hoặc xác nhận từ đầu bếp từng địa phương.
