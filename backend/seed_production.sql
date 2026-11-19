-- TasteBook: du lieu demo PostgreSQL, dong bo tu 7 Sequelize seeders.
-- Dieu kien: da chay migrations; tat ca 15 bang seed phai rong.
-- Khong dung de tron voi du lieu Production hien co; khong DELETE/TRUNCATE/upsert.
-- Chay: psql -X --set=ON_ERROR_STOP=1 --dbname=<database> --file=seed_production.sql
-- Tai khoan demo: admin@gmail.com / admin123; 3 User / 123456.
-- Mat khau duoc bam bcrypt boi 01-seed-users.js; timestamps dung thoi diem nap.
-- File chua tai khoan demo voi mat khau cong khai; chi nap vao moi truong demo duoc phep.

BEGIN;
SET LOCAL client_encoding = 'UTF8';
SET LOCAL lock_timeout = '10s';

LOCK TABLE "Users", "Categories", "IngredientCategories", "Units", "Ingredients", "Recipes", "RecipeCategories", "RecipeIngredients", "CookingSteps", "FavoriteRecipes", "RecipeLists", "RecipeListItems", "ShoppingLists", "ShoppingListRecipeLists", "ShoppingListItems" IN EXCLUSIVE MODE;
DO $seed_guard$
BEGIN
  IF EXISTS (SELECT 1 FROM "Users") THEN
    RAISE EXCEPTION 'Seed requires empty table: Users';
  END IF;
  IF EXISTS (SELECT 1 FROM "Categories") THEN
    RAISE EXCEPTION 'Seed requires empty table: Categories';
  END IF;
  IF EXISTS (SELECT 1 FROM "IngredientCategories") THEN
    RAISE EXCEPTION 'Seed requires empty table: IngredientCategories';
  END IF;
  IF EXISTS (SELECT 1 FROM "Units") THEN
    RAISE EXCEPTION 'Seed requires empty table: Units';
  END IF;
  IF EXISTS (SELECT 1 FROM "Ingredients") THEN
    RAISE EXCEPTION 'Seed requires empty table: Ingredients';
  END IF;
  IF EXISTS (SELECT 1 FROM "Recipes") THEN
    RAISE EXCEPTION 'Seed requires empty table: Recipes';
  END IF;
  IF EXISTS (SELECT 1 FROM "RecipeCategories") THEN
    RAISE EXCEPTION 'Seed requires empty table: RecipeCategories';
  END IF;
  IF EXISTS (SELECT 1 FROM "RecipeIngredients") THEN
    RAISE EXCEPTION 'Seed requires empty table: RecipeIngredients';
  END IF;
  IF EXISTS (SELECT 1 FROM "CookingSteps") THEN
    RAISE EXCEPTION 'Seed requires empty table: CookingSteps';
  END IF;
  IF EXISTS (SELECT 1 FROM "FavoriteRecipes") THEN
    RAISE EXCEPTION 'Seed requires empty table: FavoriteRecipes';
  END IF;
  IF EXISTS (SELECT 1 FROM "RecipeLists") THEN
    RAISE EXCEPTION 'Seed requires empty table: RecipeLists';
  END IF;
  IF EXISTS (SELECT 1 FROM "RecipeListItems") THEN
    RAISE EXCEPTION 'Seed requires empty table: RecipeListItems';
  END IF;
  IF EXISTS (SELECT 1 FROM "ShoppingLists") THEN
    RAISE EXCEPTION 'Seed requires empty table: ShoppingLists';
  END IF;
  IF EXISTS (SELECT 1 FROM "ShoppingListRecipeLists") THEN
    RAISE EXCEPTION 'Seed requires empty table: ShoppingListRecipeLists';
  END IF;
  IF EXISTS (SELECT 1 FROM "ShoppingListItems") THEN
    RAISE EXCEPTION 'Seed requires empty table: ShoppingListItems';
  END IF;
END;
$seed_guard$;

-- Users: 4 records.
INSERT INTO "Users" ("id", "username", "email", "password", "phone", "avatarUrl", "role", "createdAt", "updatedAt") VALUES
  (1, E'System Admin', E'admin@gmail.com', E'$2a$10$re7M6ovzprAsg6pcq7YfIO3HUyWv4clT5EZ5qSGLZALWy6NhZv5Yy', E'0999999999', E'https://res.cloudinary.com/sf4yjct9/image/upload/v1788611681/tastebook_uploads/f1plgomkateq3nufqchm.png', E'Admin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (2, E'Bếp Trưởng Hoang', E'chef.hoang@tastebook.vn', E'$2a$10$re7M6ovzprAsg6pcq7YfIO1H01369fazrWzkQpvMq/FeEj58/1jda', E'0912345678', E'https://res.cloudinary.com/sf4yjct9/image/upload/v1788611681/tastebook_uploads/f1plgomkateq3nufqchm.png', E'User', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (3, E'Nguyễn Thị Lan Anh', E'lananh.kitchen@gmail.com', E'$2a$10$re7M6ovzprAsg6pcq7YfIO1H01369fazrWzkQpvMq/FeEj58/1jda', E'0987654321', E'https://res.cloudinary.com/sf4yjct9/image/upload/v1788611681/tastebook_uploads/f1plgomkateq3nufqchm.png', E'User', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (4, E'Trần Minh Đức', E'duc.foodie@gmail.com', E'$2a$10$re7M6ovzprAsg6pcq7YfIO1H01369fazrWzkQpvMq/FeEj58/1jda', E'0934567890', E'https://res.cloudinary.com/sf4yjct9/image/upload/v1788611681/tastebook_uploads/f1plgomkateq3nufqchm.png', E'User', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Categories: 22 records.
INSERT INTO "Categories" ("id", "categoryName", "createdBy", "createdAt", "updatedAt") VALUES
  (1, E'Món chính', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (2, E'Món canh', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (3, E'Món kho', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (4, E'Món xào', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (5, E'Bún - Mì - Phở', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (6, E'Món khai vị & Ăn vặt', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (7, E'Món chay', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (8, E'Món tráng miệng & Đồ uống', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (9, E'Đóng góp của cộng đồng', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (10, E'Món nướng', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (11, E'Món chiên', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (12, E'Món hấp', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (13, E'Cơm - Xôi - Cháo', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (14, E'Gỏi - Cuốn', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (15, E'Bánh Việt', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (16, E'Ẩm thực miền Bắc', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (17, E'Ẩm thực miền Trung', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (18, E'Ẩm thực miền Nam', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (19, E'Ẩm thực vùng cao phía Bắc', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (20, E'Bếp riêng của Hoang', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (21, E'Cơm nhà Lan Anh', 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (22, E'Món Đức tự nấu', 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- IngredientCategories: 13 records.
INSERT INTO "IngredientCategories" ("id", "categoryName", "createdAt", "updatedAt") VALUES
  (1, E'Thịt & Gia cầm', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (2, E'Thủy hải sản', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (3, E'Trứng & Đậu phụ', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (4, E'Rau xanh & Rau thơm', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (5, E'Củ, Quả & Nấm', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (6, E'Gia vị tươi', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (7, E'Gia vị mặn, ngọt & Dầu ăn', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (8, E'Tinh bột & Đồ khô', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (9, E'Gạo & Ngũ cốc', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (10, E'Đậu, Hạt & Sản phẩm từ hạt', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (11, E'Trái cây & Nguyên liệu món ngọt', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (12, E'Nước & Chất lỏng nấu ăn', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (13, E'Gia vị khô & Thảo mộc khô', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Units: 29 records.
INSERT INTO "Units" ("id", "unitName", "createdAt", "updatedAt") VALUES
  (1, E'g', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (2, E'kg', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (3, E'ml', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (4, E'lít', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (5, E'thìa cà phê', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (6, E'muỗng canh', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (7, E'chén', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (8, E'quả', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (9, E'củ', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (10, E'tép', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (11, E'cây', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (12, E'nhánh', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (13, E'bó', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (14, E'lát', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (15, E'con', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (16, E'miếng', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (17, E'gói', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (18, E'lon', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (19, E'chai', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (20, E'hộp', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (21, E'khúc', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (22, E'nắm', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (23, E'vừa đủ', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (24, E'tùy khẩu vị', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (25, E'cái', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (26, E'lá', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (27, E'bát', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (28, E'vá', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (29, E'giọt', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Ingredients: 103 records.
INSERT INTO "Ingredients" ("id", "ingredientName", "ingredientCategoryId", "defaultUnitId", "createdAt", "updatedAt") VALUES
  (1, E'Thịt ba chỉ heo', 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (2, E'Thịt bò phi-lê', 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (3, E'Nạm bò', 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (4, E'Xương ống bò', 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (5, E'Thịt gà ta', 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (6, E'Sườn heo non', 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (7, E'Cá lóc (cá quả)', 2, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (8, E'Tôm sú tươi', 2, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (9, E'Mực ống', 2, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (10, E'Trứng gà', 3, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (11, E'Trứng cút', 3, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (12, E'Đậu phụ trắng', 3, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (13, E'Rau muống', 4, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (14, E'Hành lá', 4, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (15, E'Ngò rí (rau mùi)', 4, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (16, E'Rau ngổ (ngò om)', 4, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (17, E'Húng quế', 4, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (18, E'Giá đỗ', 4, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (19, E'Cà chua', 5, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (20, E'Dứa (thơm)', 5, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (21, E'Đậu bắp', 5, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (22, E'Bạc hà (dọc mùng)', 5, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (23, E'Cà rốt', 5, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (24, E'Khoai tây', 5, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (25, E'Hành tây', 5, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (26, E'Nấm rơm', 5, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (27, E'Nấm hương khô', 5, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (28, E'Tỏi khô', 6, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (29, E'Hành tím', 6, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (30, E'Gừng tươi', 6, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (31, E'Sả cây', 6, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (32, E'Ớt hiểm', 6, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (33, E'Chanh tươi', 6, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (34, E'Nước mắm truyền thống', 7, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (35, E'Hạt nêm', 7, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (36, E'Muối tinh', 7, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (37, E'Đường cát trắng', 7, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (38, E'Tiêu đen xay', 13, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (39, E'Dầu ăn', 7, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (40, E'Dầu hào', 7, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (41, E'Nước tương (xì dầu)', 7, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (42, E'Me chua chín', 7, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (43, E'Nước dừa tươi', 12, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (44, E'Hoa hồi & Quế khô', 13, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (45, E'Bánh phở tươi', 8, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (46, E'Bún tươi', 8, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (47, E'Đậu phộng (lạc rang)', 10, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (48, E'Bột năng', 8, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (49, E'Bột ngọt (mì chính)', 7, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (50, E'Thịt nạc heo xay', 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (51, E'Giấm gạo', 7, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (52, E'Rau xà lách', 4, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (53, E'Nước lọc', 12, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (54, E'Hoa hồi khô', 13, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (55, E'Quế thanh', 13, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (56, E'Hạt mùi khô', 13, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (57, E'Ớt chuông đỏ', 5, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (58, E'Dưa leo', 5, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (59, E'Đu đủ xanh', 5, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (60, E'Nước cốt chanh tươi', 6, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (61, E'Rau tía tô', 4, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (62, E'Rau kinh giới', 4, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (63, E'Mộc nhĩ khô', 8, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (64, E'Miến dong khô', 8, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (65, E'Bánh đa nem', 8, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (66, E'Cá lăng phi-lê', 2, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (67, E'Thì là', 4, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (68, E'Riềng tươi', 6, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (69, E'Cơm mẻ', 7, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (70, E'Bột nghệ', 13, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (71, E'Gạo nếp', 9, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (72, E'Lá cẩm tím', 4, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (73, E'Lá dứa (lá nếp)', 4, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (74, E'Thịt gấc', 11, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (75, E'Nghệ tươi', 6, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (76, E'Bắp bò', 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (77, E'Giò heo', 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (78, E'Mắm ruốc Huế', 7, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (79, E'Dầu màu điều', 7, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (80, E'Ớt bột', 13, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (81, E'Bắp chuối bào', 4, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (82, E'Sợi mì Quảng tươi', 8, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (83, E'Bánh tráng mè nướng', 8, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (84, E'Gạo tẻ', 9, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (85, E'Rau răm', 4, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (86, E'Bột gạo', 8, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (87, E'Mắc khén', 13, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (88, E'Nước cốt dừa', 11, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (89, E'Rau cải xanh', 4, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (90, E'Bánh tráng cuốn', 8, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (91, E'Tương hột', 7, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (92, E'Cá hú', 2, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (93, E'Sườn cốt lết heo', 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (94, E'Gạo tấm', 9, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (95, E'Mật ong', 7, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (96, E'Nấm đùi gà', 5, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (97, E'Nấm bào ngư', 5, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (98, E'Chuối sứ chín', 11, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (99, E'Bột báng', 8, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (100, E'Mè trắng rang', 10, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (101, E'Bí đỏ', 5, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (102, E'Đậu xanh cà vỏ', 10, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (103, E'Nước mắm chay', 7, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Recipes: 26 records.
INSERT INTO "Recipes" ("id", "authorId", "title", "description", "thumbnailUrl", "cookTimeMinutes", "difficulty", "defaultServings", "isPublic", "approvalStatus", "rejectionReason", "isDeleted", "createdAt", "updatedAt") VALUES
  (1, 1, E'Canh chua cá lóc miền Tây', E'Canh cá lóc vị chua me, có thơm, cà chua, đậu bắp, dọc mùng và rau ngổ; dùng chung trong bữa cơm 4 người. Chuẩn bị 20 phút, nấu 25 phút.

Quy cách nguyên liệu: Cá lóc, khúc còn xương; Me chua chín bỏ hạt.

Khi đổi khẩu phần: Giữ độ dày khúc cá, chọn nồi để cá ngập nước canh mà không phải xếp quá chặt. Chờ nồi sôi trở lại rồi kiểm tra cá chín theo độ dày; chia canh theo số người đang nấu.

Định lượng và thời gian mô tả là cho khẩu phần mặc định. Khi đổi số người ăn, tính lại bảng nguyên liệu trước khi nấu; các tỉ lệ trong bước áp dụng trên tổng lượng đã đổi, phần còn lại là lượng chưa dùng. Nguyên liệu không yêu cầu chia thì dùng toàn bộ lượng trong bảng. Giữ kích thước cắt, nhiệt độ và thời gian mỗi mẻ làm mốc, kiểm tra độ chín; chia mẻ khi dụng cụ không đủ chứa. Nước nấu và dầu chiên có thể cần điều chỉnh theo dụng cụ và mức bay hơi.', E'https://res.cloudinary.com/sf4yjct9/image/upload/v1789269532/tastebook_uploads/una957qnxfqpmeh7vm0t.jpg', 25, E'Medium', 4, TRUE, E'Approved', NULL, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (2, 1, E'Thịt kho tàu nước dừa trứng cút', E'Ba chỉ kho nước dừa với trứng cút, vị mặn ngọt dịu, thịt mềm nhưng còn miếng; phiên bản Nam Bộ. Chuẩn bị 20 phút, ướp 30 phút, nấu 75 phút.

Khi đổi khẩu phần: Giữ miếng thịt khoảng 3 cm, chọn nồi để nước kho phủ vừa mặt thịt lúc bắt đầu. Nấu nhiều có thể lâu sôi hơn; kết thúc theo độ mềm và mức nước kho, không nhân 75 phút theo số người.

Định lượng và thời gian mô tả là cho khẩu phần mặc định. Khi đổi số người ăn, tính lại bảng nguyên liệu trước khi nấu; các tỉ lệ trong bước áp dụng trên tổng lượng đã đổi, phần còn lại là lượng chưa dùng. Nguyên liệu không yêu cầu chia thì dùng toàn bộ lượng trong bảng. Giữ kích thước cắt, nhiệt độ và thời gian mỗi mẻ làm mốc, kiểm tra độ chín; chia mẻ khi dụng cụ không đủ chứa. Nước nấu và dầu chiên có thể cần điều chỉnh theo dụng cụ và mức bay hơi.', E'https://res.cloudinary.com/sf4yjct9/image/upload/v1789269594/tastebook_uploads/hbspigqd9hauf2e0fhn0.webp', 75, E'Medium', 4, TRUE, E'Approved', NULL, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (3, 1, E'Phở bò Hà Nội', E'Phở nạm chín với nước dùng xương bò, gừng hành nướng, hồi, quế và hạt mùi; không dùng thịt tái trong bản seed này. Chuẩn bị 30 phút, nấu khoảng 4 giờ. Nước dùng thành phẩm mục tiêu 2400 ml cho 4 bát.

Khi đổi khẩu phần: Mục tiêu nước dùng bằng khoảng 600 ml × số phần ăn, không giữ cố định tổng 2400 ml của mẻ gốc. Giữ miếng nạm có độ dày tương tự; nếu nồi không đủ lớn thì chia nồi, chia cả nguyên liệu và gia vị. Thời gian ninh xương không nhân theo số bát.

Định lượng và thời gian mô tả là cho khẩu phần mặc định. Khi đổi số người ăn, tính lại bảng nguyên liệu trước khi nấu; các tỉ lệ trong bước áp dụng trên tổng lượng đã đổi, phần còn lại là lượng chưa dùng. Nguyên liệu không yêu cầu chia thì dùng toàn bộ lượng trong bảng. Giữ kích thước cắt, nhiệt độ và thời gian mỗi mẻ làm mốc, kiểm tra độ chín; chia mẻ khi dụng cụ không đủ chứa. Nước nấu và dầu chiên có thể cần điều chỉnh theo dụng cụ và mức bay hơi.', E'https://res.cloudinary.com/sf4yjct9/image/upload/v1789269633/tastebook_uploads/p0jhwrqov0o1dbrj1mky.webp', 240, E'Hard', 4, TRUE, E'Approved', NULL, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (4, 1, E'Gà xào sả ớt', E'Gà lọc xương xào sả ớt, sốt bám nhẹ, hợp bữa cơm gia đình. Chuẩn bị 15 phút, ướp 20 phút, nấu 20 phút.

Quy cách nguyên liệu: Thịt gà ta lọc xương.

Khi đổi khẩu phần: Chảo cần đủ rộng để đảo gà; nấu nhiều thì chia mẻ và chia đều phần dầu, gia vị, nước theo lượng gà mỗi mẻ. Giữ miếng gà 2–3 cm và kiểm tra miếng dày nhất của từng mẻ.

Định lượng và thời gian mô tả là cho khẩu phần mặc định. Khi đổi số người ăn, tính lại bảng nguyên liệu trước khi nấu; các tỉ lệ trong bước áp dụng trên tổng lượng đã đổi, phần còn lại là lượng chưa dùng. Nguyên liệu không yêu cầu chia thì dùng toàn bộ lượng trong bảng. Giữ kích thước cắt, nhiệt độ và thời gian mỗi mẻ làm mốc, kiểm tra độ chín; chia mẻ khi dụng cụ không đủ chứa. Nước nấu và dầu chiên có thể cần điều chỉnh theo dụng cụ và mức bay hơi.', E'https://res.cloudinary.com/sf4yjct9/image/upload/v1789269671/tastebook_uploads/wultafhebuw7skdb9px7.webp', 20, E'Easy', 3, TRUE, E'Approved', NULL, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (5, 1, E'Bò lúc lắc', E'Bò phi-lê áp chảo nhanh với ớt chuông, hành tây; ăn cùng xà lách và cà chua. Chuẩn bị 15 phút, ướp 15 phút, nấu 10 phút.

Khi đổi khẩu phần: Giữ bò thành khối khoảng 2 cm và chỉ xếp một lớp trên mặt chảo. Tăng số mẻ thay vì kéo dài một lần xào với chảo đầy; chia rau, dầu và tỏi cho từng mẻ tương ứng.

Định lượng và thời gian mô tả là cho khẩu phần mặc định. Khi đổi số người ăn, tính lại bảng nguyên liệu trước khi nấu; các tỉ lệ trong bước áp dụng trên tổng lượng đã đổi, phần còn lại là lượng chưa dùng. Nguyên liệu không yêu cầu chia thì dùng toàn bộ lượng trong bảng. Giữ kích thước cắt, nhiệt độ và thời gian mỗi mẻ làm mốc, kiểm tra độ chín; chia mẻ khi dụng cụ không đủ chứa. Nước nấu và dầu chiên có thể cần điều chỉnh theo dụng cụ và mức bay hơi.', E'https://res.cloudinary.com/sf4yjct9/image/upload/v1789269706/tastebook_uploads/fxtcqitccfiph1pi2o0i.jpg', 10, E'Medium', 2, TRUE, E'Approved', NULL, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (6, 1, E'Bún chả Hà Nội', E'Bún với chả viên, ba chỉ nướng, đu đủ cà rốt ngâm nhanh và nước mắm pha; rau sống để riêng. Chuẩn bị 25 phút, ướp 45 phút, nướng khoảng 25 phút.

Khi đổi khẩu phần: Giữ lát ba chỉ 4–5 mm và độ dày chả viên, tăng số miếng thay vì làm viên to hơn. Nướng một lớp, chia khay/mẻ nếu cần; mốc 18–25 phút tính cho từng mẻ có độ dày tương tự.

Định lượng và thời gian mô tả là cho khẩu phần mặc định. Khi đổi số người ăn, tính lại bảng nguyên liệu trước khi nấu; các tỉ lệ trong bước áp dụng trên tổng lượng đã đổi, phần còn lại là lượng chưa dùng. Nguyên liệu không yêu cầu chia thì dùng toàn bộ lượng trong bảng. Giữ kích thước cắt, nhiệt độ và thời gian mỗi mẻ làm mốc, kiểm tra độ chín; chia mẻ khi dụng cụ không đủ chứa. Nước nấu và dầu chiên có thể cần điều chỉnh theo dụng cụ và mức bay hơi.', E'https://res.cloudinary.com/sf4yjct9/image/upload/v1793886322/tastebook_uploads/kaymsgft55zttntahrpp.jpg', 25, E'Medium', 4, TRUE, E'Approved', NULL, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (7, 1, E'Nem rán miền Bắc', E'Nem nhân heo, tôm, miến và mộc nhĩ, kèm nước chấm chua ngọt; khoảng 16 cuốn nhỏ, 4 người ăn khai vị. Chuẩn bị 35 phút, rán 30 phút.

Quy cách nguyên liệu: Tôm bóc vỏ.

Khi đổi khẩu phần: Giữ kích thước nem và nhiệt độ rán, điều chỉnh số cuốn/số mẻ. Khi nấu ít, dùng chảo nhỏ hơn để đủ độ sâu dầu; số cuốn là ước tính, không phải trường số lượng đã được ứng dụng tự tính.

Định lượng và thời gian mô tả là cho khẩu phần mặc định. Khi đổi số người ăn, tính lại bảng nguyên liệu trước khi nấu; các tỉ lệ trong bước áp dụng trên tổng lượng đã đổi, phần còn lại là lượng chưa dùng. Nguyên liệu không yêu cầu chia thì dùng toàn bộ lượng trong bảng. Giữ kích thước cắt, nhiệt độ và thời gian mỗi mẻ làm mốc, kiểm tra độ chín; chia mẻ khi dụng cụ không đủ chứa. Nước nấu và dầu chiên có thể cần điều chỉnh theo dụng cụ và mức bay hơi.', E'https://res.cloudinary.com/sf4yjct9/image/upload/v1793886502/tastebook_uploads/fhftudnpza717eskobq2.webp', 30, E'Medium', 4, TRUE, E'Approved', NULL, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (8, 1, E'Chả cá lăng thì là kiểu Hà Nội', E'Cá lăng ướp riềng mẻ nghệ, nướng sơ rồi đảo cùng hành thì là; ăn với bún, lạc và nước mắm chanh. Bản này chọn nước mắm thay mắm tôm. Chuẩn bị 20 phút, ướp 60 phút, nấu 20 phút.

Khi đổi khẩu phần: Giữ miếng cá khoảng 3 cm, nướng một lớp và chia mẻ đảo cá cùng hành thì là khi chảo đầy. Chia phần dầu dành cho chảo theo lượng cá mỗi mẻ; kiểm tra cá chín ở cả bước nướng và bước đảo cuối.

Định lượng và thời gian mô tả là cho khẩu phần mặc định. Khi đổi số người ăn, tính lại bảng nguyên liệu trước khi nấu; các tỉ lệ trong bước áp dụng trên tổng lượng đã đổi, phần còn lại là lượng chưa dùng. Nguyên liệu không yêu cầu chia thì dùng toàn bộ lượng trong bảng. Giữ kích thước cắt, nhiệt độ và thời gian mỗi mẻ làm mốc, kiểm tra độ chín; chia mẻ khi dụng cụ không đủ chứa. Nước nấu và dầu chiên có thể cần điều chỉnh theo dụng cụ và mức bay hơi.', E'https://res.cloudinary.com/sf4yjct9/image/upload/v1793886570/tastebook_uploads/ja8pmht2ahuwdrpfvqz3.jpg', 20, E'Medium', 4, TRUE, E'Approved', NULL, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (9, 1, E'Xôi ngũ sắc phiên bản nấu tại nhà', E'Xôi năm màu trắng, tím lá cẩm, xanh lá dứa, đỏ gấc, vàng nghệ, lấy cảm hứng từ xôi vùng cao phía Bắc. Cách tạo màu gia đình này không đại diện cho toàn bộ kỹ thuật dùng lá của các cộng đồng địa phương. Chuẩn bị 35 phút, ngâm 6 giờ, hấp 45 phút; 5 phần xôi.

Quy cách nguyên liệu: Thịt gấc bỏ hạt.

Khi đổi khẩu phần: Luôn giữ 5 màu, chỉ thay lượng nếp mỗi màu; số màu không phải số người ăn. Giữ lớp nếp tơi và không quá dày, tăng số tầng hoặc chia mẻ hấp; thời gian dựa vào độ dày lớp nếp và độ mềm hạt, không nhân 45 phút theo khẩu phần.

Định lượng và thời gian mô tả là cho khẩu phần mặc định. Khi đổi số người ăn, tính lại bảng nguyên liệu trước khi nấu; các tỉ lệ trong bước áp dụng trên tổng lượng đã đổi, phần còn lại là lượng chưa dùng. Nguyên liệu không yêu cầu chia thì dùng toàn bộ lượng trong bảng. Giữ kích thước cắt, nhiệt độ và thời gian mỗi mẻ làm mốc, kiểm tra độ chín; chia mẻ khi dụng cụ không đủ chứa. Nước nấu và dầu chiên có thể cần điều chỉnh theo dụng cụ và mức bay hơi.', E'https://res.cloudinary.com/sf4yjct9/image/upload/v1793886661/tastebook_uploads/iakeqbrzdbm3wy8wzsh1.jpg', 45, E'Hard', 5, TRUE, E'Approved', NULL, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (10, 1, E'Bún bò Huế', E'Bún sợi lớn với bắp bò, giò heo, nước dùng thơm sả và mắm ruốc Huế; bản gia đình không thêm huyết/chả. Chuẩn bị 30 phút, nấu 150 phút; mục tiêu 2400 ml nước dùng cho 4 bát.

Quy cách nguyên liệu: Bún tươi loại sợi lớn.

Khi đổi khẩu phần: Tổng nước dùng thành phẩm mục tiêu là khoảng 600 ml × số phần ăn, không cố định 2400 ml. Chọn nồi vừa lượng thịt, không nhồi kín; giữ độ dày khoanh giò/miếng bắp bò tương tự và vớt từng loại khi mềm, không nhân thời gian ninh theo số người.

Định lượng và thời gian mô tả là cho khẩu phần mặc định. Khi đổi số người ăn, tính lại bảng nguyên liệu trước khi nấu; các tỉ lệ trong bước áp dụng trên tổng lượng đã đổi, phần còn lại là lượng chưa dùng. Nguyên liệu không yêu cầu chia thì dùng toàn bộ lượng trong bảng. Giữ kích thước cắt, nhiệt độ và thời gian mỗi mẻ làm mốc, kiểm tra độ chín; chia mẻ khi dụng cụ không đủ chứa. Nước nấu và dầu chiên có thể cần điều chỉnh theo dụng cụ và mức bay hơi.', E'https://res.cloudinary.com/sf4yjct9/image/upload/v1793886733/tastebook_uploads/uwkknr6w9f01h5kol0b7.jpg', 150, E'Hard', 4, TRUE, E'Approved', NULL, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (11, 1, E'Mì Quảng tôm thịt', E'Mì Quảng với nhân tôm thịt, nước nhân đậm vị chỉ chan xâm xấp, có rau, lạc và bánh tráng mè. Chuẩn bị 25 phút, ướp 20 phút, nấu 45 phút.

Quy cách nguyên liệu: Tôm bóc vỏ.

Khi đổi khẩu phần: Tổng nước nhân thành phẩm mục tiêu là khoảng 200 ml × số phần ăn; không giữ tổng 800 ml của mẻ gốc. Nấu nhiều thì xào săn thịt theo mẻ trước khi gom vào nồi nấu, giữ nguyên cỡ tôm và độ dày thịt để kiểm tra độ chín.

Định lượng và thời gian mô tả là cho khẩu phần mặc định. Khi đổi số người ăn, tính lại bảng nguyên liệu trước khi nấu; các tỉ lệ trong bước áp dụng trên tổng lượng đã đổi, phần còn lại là lượng chưa dùng. Nguyên liệu không yêu cầu chia thì dùng toàn bộ lượng trong bảng. Giữ kích thước cắt, nhiệt độ và thời gian mỗi mẻ làm mốc, kiểm tra độ chín; chia mẻ khi dụng cụ không đủ chứa. Nước nấu và dầu chiên có thể cần điều chỉnh theo dụng cụ và mức bay hơi.', E'https://res.cloudinary.com/sf4yjct9/image/upload/v1793886849/tastebook_uploads/btgmyorax0bwnswrshze.png', 45, E'Medium', 4, TRUE, E'Approved', NULL, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (12, 1, E'Cơm gà Hội An phiên bản gia đình', E'Cơm nấu nước luộc gà và nghệ, gà xé trộn hành tây rau răm, đu đủ cà rốt chua; phiên bản không kèm lòng gà. Chuẩn bị 30 phút, nấu 60 phút.

Quy cách nguyên liệu: Gà ta miếng lớn có xương.

Khi đổi khẩu phần: Giữ cỡ miếng gà, chọn nồi luộc vừa để nước phủ thịt. Tính nước nấu cơm theo lượng gạo đã đổi, không giữ cố định lượng nước của mẻ gốc; dùng nồi cơm đủ dung tích hoặc chia lượt, không nhân thời gian nấu cơm theo số người.

Định lượng và thời gian mô tả là cho khẩu phần mặc định. Khi đổi số người ăn, tính lại bảng nguyên liệu trước khi nấu; các tỉ lệ trong bước áp dụng trên tổng lượng đã đổi, phần còn lại là lượng chưa dùng. Nguyên liệu không yêu cầu chia thì dùng toàn bộ lượng trong bảng. Giữ kích thước cắt, nhiệt độ và thời gian mỗi mẻ làm mốc, kiểm tra độ chín; chia mẻ khi dụng cụ không đủ chứa. Nước nấu và dầu chiên có thể cần điều chỉnh theo dụng cụ và mức bay hơi.', E'https://res.cloudinary.com/sf4yjct9/image/upload/v1793886947/tastebook_uploads/eyoewmprremeoyuwnjdw.jpg', 60, E'Medium', 4, TRUE, E'Approved', NULL, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (13, 1, E'Bánh bèo chén Huế', E'Bánh bột gạo hấp chén nhỏ, mặt tôm chấy và mỡ hành làm bằng dầu; khoảng 24 chén, 4 phần ăn nhẹ. Chuẩn bị 30 phút, nghỉ bột 45 phút, nấu/hấp 35 phút.

Quy cách nguyên liệu: Tôm bóc vỏ.

Khi đổi khẩu phần: Tăng hoặc giảm số chén/số mẻ, giữ chén cùng kích thước và lớp bột mỏng. Khoảng 25 ml là lượng cho một chén nhỏ, không phải lượng nguyên liệu cho cả công thức; số chén ghi trong mô tả là ước tính, dùng hết bột và chia tôm đều theo số chén thực tế.

Định lượng và thời gian mô tả là cho khẩu phần mặc định. Khi đổi số người ăn, tính lại bảng nguyên liệu trước khi nấu; các tỉ lệ trong bước áp dụng trên tổng lượng đã đổi, phần còn lại là lượng chưa dùng. Nguyên liệu không yêu cầu chia thì dùng toàn bộ lượng trong bảng. Giữ kích thước cắt, nhiệt độ và thời gian mỗi mẻ làm mốc, kiểm tra độ chín; chia mẻ khi dụng cụ không đủ chứa. Nước nấu và dầu chiên có thể cần điều chỉnh theo dụng cụ và mức bay hơi.', E'https://res.cloudinary.com/sf4yjct9/image/upload/v1793887014/tastebook_uploads/kcl8lcaftvv15ik8zjns.jpg', 35, E'Hard', 4, TRUE, E'Approved', NULL, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (14, 1, E'Gà nướng mắc khén Tây Bắc', E'Gà ướp mắc khén, sả, gừng rồi nướng lò, mô phỏng hương vị gà nướng vùng Tây Bắc trong điều kiện bếp gia đình. Chuẩn bị 20 phút, ướp 2 giờ, nướng 50 phút.

Quy cách nguyên liệu: Gà ta miếng có xương.

Khi đổi khẩu phần: Giữ cỡ miếng gà, xếp thoáng một lớp trên vỉ. Chia khay hoặc nướng nhiều mẻ nếu cần, giữ nhiệt độ lò và kiểm tra từng mẻ; không nướng nguyên một khối gà dày hơn theo hệ số khẩu phần.

Định lượng và thời gian mô tả là cho khẩu phần mặc định. Khi đổi số người ăn, tính lại bảng nguyên liệu trước khi nấu; các tỉ lệ trong bước áp dụng trên tổng lượng đã đổi, phần còn lại là lượng chưa dùng. Nguyên liệu không yêu cầu chia thì dùng toàn bộ lượng trong bảng. Giữ kích thước cắt, nhiệt độ và thời gian mỗi mẻ làm mốc, kiểm tra độ chín; chia mẻ khi dụng cụ không đủ chứa. Nước nấu và dầu chiên có thể cần điều chỉnh theo dụng cụ và mức bay hơi.', E'https://res.cloudinary.com/sf4yjct9/image/upload/v1793887082/tastebook_uploads/lw1ayprbyygrjuf7c8c3.jpg', 50, E'Medium', 4, TRUE, E'Approved', NULL, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (15, 1, E'Bánh xèo miền Tây', E'Bánh xèo vỏ mỏng từ bột gạo, nước cốt dừa và nghệ, nhân tôm ba chỉ giá; cuốn rau chấm nước mắm chua ngọt. Khoảng 8 bánh chảo 24–26 cm, 4 phần. Chuẩn bị 30 phút, nghỉ bột 30 phút, nấu 40 phút.

Quy cách nguyên liệu: Tôm bóc vỏ.

Khi đổi khẩu phần: Giữ đường kính chảo và độ mỏng vỏ, thay đổi số bánh/số lượt đổ. Chia nhân và giá theo số bánh thực tế để dùng hết cùng bột; mốc thời gian áp dụng mỗi bánh, tổng thời gian tăng khi có thêm lượt.

Định lượng và thời gian mô tả là cho khẩu phần mặc định. Khi đổi số người ăn, tính lại bảng nguyên liệu trước khi nấu; các tỉ lệ trong bước áp dụng trên tổng lượng đã đổi, phần còn lại là lượng chưa dùng. Nguyên liệu không yêu cầu chia thì dùng toàn bộ lượng trong bảng. Giữ kích thước cắt, nhiệt độ và thời gian mỗi mẻ làm mốc, kiểm tra độ chín; chia mẻ khi dụng cụ không đủ chứa. Nước nấu và dầu chiên có thể cần điều chỉnh theo dụng cụ và mức bay hơi.', E'https://res.cloudinary.com/sf4yjct9/image/upload/v1793887175/tastebook_uploads/h63rsjaofrtkt7pqzldg.jpg', 40, E'Hard', 4, TRUE, E'Approved', NULL, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (16, 1, E'Gỏi cuốn tôm thịt', E'Cuốn tôm luộc, ba chỉ, bún và rau, chấm tương hột lạc; khoảng 12 cuốn, 4 phần ăn nhẹ. Chuẩn bị 30 phút, nấu 30 phút.

Quy cách nguyên liệu: Tôm bóc vỏ.

Khi đổi khẩu phần: Tăng giảm số cuốn, không tăng độ dày cuốn. Giữ miếng ba chỉ có độ dày tương tự khi luộc, chọn nồi vừa lượng thịt để nước phủ; làm sốt trong nồi nhỏ phù hợp và kiểm tra độ sánh thay vì chỉ dựa vào thời gian.

Định lượng và thời gian mô tả là cho khẩu phần mặc định. Khi đổi số người ăn, tính lại bảng nguyên liệu trước khi nấu; các tỉ lệ trong bước áp dụng trên tổng lượng đã đổi, phần còn lại là lượng chưa dùng. Nguyên liệu không yêu cầu chia thì dùng toàn bộ lượng trong bảng. Giữ kích thước cắt, nhiệt độ và thời gian mỗi mẻ làm mốc, kiểm tra độ chín; chia mẻ khi dụng cụ không đủ chứa. Nước nấu và dầu chiên có thể cần điều chỉnh theo dụng cụ và mức bay hơi.', E'https://res.cloudinary.com/sf4yjct9/image/upload/v1793887236/tastebook_uploads/yddwiytdbnwaetds3tbm.jpg', 30, E'Medium', 4, TRUE, E'Approved', NULL, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (17, 1, E'Cá hú kho tộ', E'Cá hú kho tiêu, hành, nước mắm và nước dừa; sốt nâu sánh nhẹ, hợp cơm nóng. Chuẩn bị 15 phút, ướp 25 phút, nấu 35 phút.

Khi đổi khẩu phần: Giữ khúc cá dày 2–3 cm; chọn nồi rộng vừa để xếp cá ít lớp, chia nồi khi lượng lớn. Điều chỉnh lửa/nắp để nước kho sánh đúng mức, không nhân thời gian kho theo số người.

Định lượng và thời gian mô tả là cho khẩu phần mặc định. Khi đổi số người ăn, tính lại bảng nguyên liệu trước khi nấu; các tỉ lệ trong bước áp dụng trên tổng lượng đã đổi, phần còn lại là lượng chưa dùng. Nguyên liệu không yêu cầu chia thì dùng toàn bộ lượng trong bảng. Giữ kích thước cắt, nhiệt độ và thời gian mỗi mẻ làm mốc, kiểm tra độ chín; chia mẻ khi dụng cụ không đủ chứa. Nước nấu và dầu chiên có thể cần điều chỉnh theo dụng cụ và mức bay hơi.', E'https://res.cloudinary.com/sf4yjct9/image/upload/v1793887307/tastebook_uploads/cmolnnt4vxbvtbz9ghzv.jpg', 35, E'Medium', 4, TRUE, E'Approved', NULL, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (18, 1, E'Cơm tấm sườn nướng', E'Cơm gạo tấm, sườn cốt lết nướng, dầu hành, đồ chua và nước mắm pha; phiên bản không có bì/chả trứng. Chuẩn bị 30 phút, ướp ít nhất 2 giờ, nấu khoảng 40 phút do cơm và thịt làm song song.

Khi đổi khẩu phần: Giữ miếng sườn dày 1–1,5 cm, nướng một lớp và chia mẻ nếu cần. Không vượt dung tích nấu của nồi cơm; tăng lượng gạo/nước theo bảng, giữ nhiệt độ nướng và kiểm tra sườn chín gần xương từng mẻ.

Định lượng và thời gian mô tả là cho khẩu phần mặc định. Khi đổi số người ăn, tính lại bảng nguyên liệu trước khi nấu; các tỉ lệ trong bước áp dụng trên tổng lượng đã đổi, phần còn lại là lượng chưa dùng. Nguyên liệu không yêu cầu chia thì dùng toàn bộ lượng trong bảng. Giữ kích thước cắt, nhiệt độ và thời gian mỗi mẻ làm mốc, kiểm tra độ chín; chia mẻ khi dụng cụ không đủ chứa. Nước nấu và dầu chiên có thể cần điều chỉnh theo dụng cụ và mức bay hơi.', E'https://res.cloudinary.com/sf4yjct9/image/upload/v1793887405/tastebook_uploads/qldlw78nmck4twclonyl.png', 40, E'Medium', 4, TRUE, E'Approved', NULL, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (19, 1, E'Đậu phụ kho nấm chay', E'Đậu phụ kho nấm rơm, nấm đùi gà và nấm bào ngư, dùng nước tương; món chay ăn cùng cơm. Chuẩn bị 20 phút, nấu 25 phút.

Quy cách nguyên liệu: Nước tương chay.

Khi đổi khẩu phần: Áp chảo đậu một lớp, tăng số mẻ nếu cần; kho trong nồi đủ rộng để đảo nhẹ. Kiểm tra nấm chín và sốt sánh, vì lượng nước tiết ra từ nấm và mức bay hơi thay đổi theo mẻ.

Định lượng và thời gian mô tả là cho khẩu phần mặc định. Khi đổi số người ăn, tính lại bảng nguyên liệu trước khi nấu; các tỉ lệ trong bước áp dụng trên tổng lượng đã đổi, phần còn lại là lượng chưa dùng. Nguyên liệu không yêu cầu chia thì dùng toàn bộ lượng trong bảng. Giữ kích thước cắt, nhiệt độ và thời gian mỗi mẻ làm mốc, kiểm tra độ chín; chia mẻ khi dụng cụ không đủ chứa. Nước nấu và dầu chiên có thể cần điều chỉnh theo dụng cụ và mức bay hơi.', E'https://res.cloudinary.com/sf4yjct9/image/upload/v1793887478/tastebook_uploads/m8abhhf6uwg0ovjymvw2.jpg', 25, E'Easy', 4, TRUE, E'Approved', NULL, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (20, 1, E'Chè chuối nước cốt dừa', E'Chè chuối sứ chín, bột báng và nước cốt dừa, vị ngọt vừa; 4 chén tráng miệng. Chuẩn bị 15 phút, ngâm bột báng 20 phút, nấu 25 phút.

Quy cách nguyên liệu: Chuối sứ chín bóc vỏ.

Khi đổi khẩu phần: Giữ độ dày lát chuối, dùng nồi chừa khoảng trống chống trào và khuấy sát đáy. Nồi lớn lâu nóng hơn; thời điểm kết thúc dựa vào chuối mềm, bột báng chín và độ sánh, không nhân thời gian nấu theo số chén.

Định lượng và thời gian mô tả là cho khẩu phần mặc định. Khi đổi số người ăn, tính lại bảng nguyên liệu trước khi nấu; các tỉ lệ trong bước áp dụng trên tổng lượng đã đổi, phần còn lại là lượng chưa dùng. Nguyên liệu không yêu cầu chia thì dùng toàn bộ lượng trong bảng. Giữ kích thước cắt, nhiệt độ và thời gian mỗi mẻ làm mốc, kiểm tra độ chín; chia mẻ khi dụng cụ không đủ chứa. Nước nấu và dầu chiên có thể cần điều chỉnh theo dụng cụ và mức bay hơi.', E'https://res.cloudinary.com/sf4yjct9/image/upload/v1793887540/tastebook_uploads/jglih0ba7dczqovdnugu.jpg', 25, E'Easy', 4, TRUE, E'Approved', NULL, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (21, 2, E'Rau muống xào tỏi của Hoang', E'Rau muống xào tỏi nước tương, món riêng tư cho bữa tối 2 người của Hoang. Chuẩn bị 12 phút, nấu 8 phút.

Quy cách nguyên liệu: Nước tương chay.

Khi đổi khẩu phần: Giữ độ dài cọng rau, chia mẻ để chảo đủ nóng và rau chín đều. Chia lượng tỏi, dầu, nước và gia vị theo lượng rau mỗi mẻ; không dồn toàn bộ rau vào chảo nhỏ rồi kéo dài thời gian xào.

Định lượng và thời gian mô tả là cho khẩu phần mặc định. Khi đổi số người ăn, tính lại bảng nguyên liệu trước khi nấu; các tỉ lệ trong bước áp dụng trên tổng lượng đã đổi, phần còn lại là lượng chưa dùng. Nguyên liệu không yêu cầu chia thì dùng toàn bộ lượng trong bảng. Giữ kích thước cắt, nhiệt độ và thời gian mỗi mẻ làm mốc, kiểm tra độ chín; chia mẻ khi dụng cụ không đủ chứa. Nước nấu và dầu chiên có thể cần điều chỉnh theo dụng cụ và mức bay hơi.', E'https://res.cloudinary.com/sf4yjct9/image/upload/v1793887705/tastebook_uploads/lfeylopjdlvo56zzkdj3.jpg', 8, E'Easy', 2, FALSE, E'Approved', NULL, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (22, 2, E'Trứng chiên hành của Hoang', E'Trứng chiên mỏng với hành lá, nước mắm và tiêu, dùng cho bữa cơm nhanh 2 người. Chuẩn bị 5 phút, nấu 8 phút.

Khi đổi khẩu phần: Dùng chảo nhỏ hơn khi nấu ít hoặc chiên nhiều lượt khi nấu nhiều, giữ lớp trứng mỏng tương tự. Thực hiện bước chiên và trở cho từng lượt đến hết hỗn hợp; không tăng độ dày trứng theo số người.

Định lượng và thời gian mô tả là cho khẩu phần mặc định. Khi đổi số người ăn, tính lại bảng nguyên liệu trước khi nấu; các tỉ lệ trong bước áp dụng trên tổng lượng đã đổi, phần còn lại là lượng chưa dùng. Nguyên liệu không yêu cầu chia thì dùng toàn bộ lượng trong bảng. Giữ kích thước cắt, nhiệt độ và thời gian mỗi mẻ làm mốc, kiểm tra độ chín; chia mẻ khi dụng cụ không đủ chứa. Nước nấu và dầu chiên có thể cần điều chỉnh theo dụng cụ và mức bay hơi.', E'https://res.cloudinary.com/sf4yjct9/image/upload/v1793887795/tastebook_uploads/omux8s66kus7rytdxlst.jpg', 8, E'Easy', 2, FALSE, E'Approved', NULL, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (23, 3, E'Canh bí đỏ thịt bằm của Lan Anh', E'Canh bí đỏ mềm với thịt heo bằm, hành lá, nấu cho bữa cơm 3 người. Chuẩn bị 15 phút, nấu 20 phút.

Khi đổi khẩu phần: Giữ miếng bí khoảng 2 cm và đánh tơi thịt. Chọn nồi đủ chứa, bắt đầu tính thời gian nấu bí khi canh sôi trở lại, kết thúc khi bí mềm vừa; chia canh theo số phần ăn đang nấu.

Định lượng và thời gian mô tả là cho khẩu phần mặc định. Khi đổi số người ăn, tính lại bảng nguyên liệu trước khi nấu; các tỉ lệ trong bước áp dụng trên tổng lượng đã đổi, phần còn lại là lượng chưa dùng. Nguyên liệu không yêu cầu chia thì dùng toàn bộ lượng trong bảng. Giữ kích thước cắt, nhiệt độ và thời gian mỗi mẻ làm mốc, kiểm tra độ chín; chia mẻ khi dụng cụ không đủ chứa. Nước nấu và dầu chiên có thể cần điều chỉnh theo dụng cụ và mức bay hơi.', E'https://res.cloudinary.com/sf4yjct9/image/upload/v1793887883/tastebook_uploads/xjemxisuyuqk4ddbzvb9.png', 20, E'Easy', 3, FALSE, E'Approved', NULL, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (24, 3, E'Đậu phụ sốt cà chua của Lan Anh', E'Đậu phụ áp chảo sốt cà chua nước mắm chay, ăn với cơm; 3 người. Chuẩn bị 15 phút, nấu 20 phút.

Khi đổi khẩu phần: Giữ miếng đậu khoảng 2 cm và áp chảo một lớp; tăng số mẻ thay vì nhồi chảo. Điều chỉnh lửa/nắp để sốt bám đậu, vì cà chua có thể tiết lượng nước khác nhau.

Định lượng và thời gian mô tả là cho khẩu phần mặc định. Khi đổi số người ăn, tính lại bảng nguyên liệu trước khi nấu; các tỉ lệ trong bước áp dụng trên tổng lượng đã đổi, phần còn lại là lượng chưa dùng. Nguyên liệu không yêu cầu chia thì dùng toàn bộ lượng trong bảng. Giữ kích thước cắt, nhiệt độ và thời gian mỗi mẻ làm mốc, kiểm tra độ chín; chia mẻ khi dụng cụ không đủ chứa. Nước nấu và dầu chiên có thể cần điều chỉnh theo dụng cụ và mức bay hơi.', E'https://res.cloudinary.com/sf4yjct9/image/upload/v1793887935/tastebook_uploads/lw03f2ip7wavq5bhmpvw.jpg', 20, E'Easy', 3, FALSE, E'Approved', NULL, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (25, 4, E'Sườn xào chua ngọt của Đức', E'Sườn non sốt giấm đường cùng ớt chuông và hành tây; 3 người dùng chung bữa cơm. Chuẩn bị 20 phút, nấu 35 phút.

Khi đổi khẩu phần: Giữ cỡ miếng sườn, dùng nồi vừa để nấu mềm và áp chảo theo mẻ. Nếu chia mẻ hoàn thiện sốt, chia cả rau, sốt, nước nấu sườn và hỗn hợp bột theo lượng sườn mỗi mẻ; kiểm tra độ mềm và độ sánh trước khi tắt bếp.

Định lượng và thời gian mô tả là cho khẩu phần mặc định. Khi đổi số người ăn, tính lại bảng nguyên liệu trước khi nấu; các tỉ lệ trong bước áp dụng trên tổng lượng đã đổi, phần còn lại là lượng chưa dùng. Nguyên liệu không yêu cầu chia thì dùng toàn bộ lượng trong bảng. Giữ kích thước cắt, nhiệt độ và thời gian mỗi mẻ làm mốc, kiểm tra độ chín; chia mẻ khi dụng cụ không đủ chứa. Nước nấu và dầu chiên có thể cần điều chỉnh theo dụng cụ và mức bay hơi.', E'https://res.cloudinary.com/sf4yjct9/image/upload/v1793887998/tastebook_uploads/kzyqg2gnwzbvmtrzq0ow.jpg', 35, E'Medium', 3, FALSE, E'Approved', NULL, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (26, 4, E'Chè đậu xanh lá dứa của Đức', E'Chè đậu xanh cà vỏ, lá dứa và nước cốt dừa; 4 phần tráng miệng. Chuẩn bị 10 phút, ngâm đậu 2 giờ, nấu 35 phút.

Khi đổi khẩu phần: Giữ tỉ lệ đậu, nước và bột theo bảng đã đổi, dùng nồi đủ lớn và khuấy sát đáy. Nấu tới đậu mềm rồi mới thêm đường; lượng lớn cần lâu sôi hơn nhưng không nhân thời gian làm mềm đậu một cách tự động.

Định lượng và thời gian mô tả là cho khẩu phần mặc định. Khi đổi số người ăn, tính lại bảng nguyên liệu trước khi nấu; các tỉ lệ trong bước áp dụng trên tổng lượng đã đổi, phần còn lại là lượng chưa dùng. Nguyên liệu không yêu cầu chia thì dùng toàn bộ lượng trong bảng. Giữ kích thước cắt, nhiệt độ và thời gian mỗi mẻ làm mốc, kiểm tra độ chín; chia mẻ khi dụng cụ không đủ chứa. Nước nấu và dầu chiên có thể cần điều chỉnh theo dụng cụ và mức bay hơi.', E'https://res.cloudinary.com/sf4yjct9/image/upload/v1793888047/tastebook_uploads/ymva7oydemvcb60hc3yw.jpg', 35, E'Easy', 4, FALSE, E'Approved', NULL, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- RecipeCategories: 80 records.
INSERT INTO "RecipeCategories" ("recipeId", "categoryId") VALUES
  (1, 2),
  (1, 18),
  (2, 1),
  (2, 3),
  (2, 18),
  (3, 1),
  (3, 5),
  (3, 16),
  (4, 1),
  (4, 4),
  (5, 1),
  (5, 4),
  (5, 18),
  (6, 1),
  (6, 5),
  (6, 10),
  (6, 16),
  (7, 6),
  (7, 11),
  (7, 16),
  (8, 1),
  (8, 10),
  (8, 16),
  (9, 7),
  (9, 12),
  (9, 13),
  (9, 19),
  (10, 1),
  (10, 5),
  (10, 17),
  (11, 1),
  (11, 5),
  (11, 17),
  (12, 1),
  (12, 13),
  (12, 17),
  (13, 6),
  (13, 12),
  (13, 15),
  (13, 17),
  (14, 1),
  (14, 10),
  (14, 19),
  (15, 1),
  (15, 11),
  (15, 15),
  (15, 18),
  (16, 6),
  (16, 14),
  (16, 18),
  (17, 1),
  (17, 3),
  (17, 18),
  (18, 1),
  (18, 10),
  (18, 13),
  (18, 18),
  (19, 1),
  (19, 3),
  (19, 7),
  (20, 7),
  (20, 8),
  (20, 18),
  (21, 4),
  (21, 7),
  (21, 20),
  (22, 1),
  (22, 11),
  (22, 20),
  (23, 2),
  (23, 21),
  (24, 1),
  (24, 7),
  (24, 21),
  (25, 1),
  (25, 4),
  (25, 22),
  (26, 7),
  (26, 8),
  (26, 22);

-- RecipeIngredients: 337 records.
INSERT INTO "RecipeIngredients" ("id", "recipeId", "ingredientId", "customIngredientName", "quantity", "unitId", "customUnit", "createdAt", "updatedAt") VALUES
  (1, 1, 7, NULL, 600, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (2, 1, 19, NULL, 200, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (3, 1, 20, NULL, 150, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (4, 1, 21, NULL, 100, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (5, 1, 22, NULL, 100, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (6, 1, 18, NULL, 100, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (7, 1, 42, NULL, 30, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (8, 1, 16, NULL, 10, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (9, 1, 28, NULL, 10, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (10, 1, 32, NULL, 3, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (11, 1, 34, NULL, 30, 3, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (12, 1, 37, NULL, 20, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (13, 1, 36, NULL, 3, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (14, 1, 39, NULL, 15, 3, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (15, 1, 53, NULL, 1400, 3, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (16, 2, 1, NULL, 600, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (17, 2, 11, NULL, 16, 8, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (18, 2, 43, NULL, 600, 3, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (19, 2, 53, NULL, 300, 3, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (20, 2, 34, NULL, 45, 3, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (21, 2, 37, NULL, 25, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (22, 2, 29, NULL, 20, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (23, 2, 28, NULL, 10, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (24, 2, 38, NULL, 1, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (25, 2, 39, NULL, 10, 3, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (26, 3, 4, NULL, 1500, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (27, 3, 3, NULL, 600, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (28, 3, 45, NULL, 800, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (29, 3, 25, NULL, 200, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (30, 3, 30, NULL, 60, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (31, 3, 29, NULL, 40, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (32, 3, 54, NULL, 3, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (33, 3, 55, NULL, 5, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (34, 3, 56, NULL, 3, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (35, 3, 34, NULL, 40, 3, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (36, 3, 36, NULL, 12, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (37, 3, 37, NULL, 10, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (38, 3, 14, NULL, 30, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (39, 3, 15, NULL, 20, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (40, 3, 60, NULL, 30, 3, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (41, 3, 32, NULL, 5, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (42, 3, 53, NULL, 4500, 3, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (43, 4, 5, NULL, 600, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (44, 4, 31, NULL, 50, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (45, 4, 32, NULL, 5, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (46, 4, 28, NULL, 15, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (47, 4, 29, NULL, 20, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (48, 4, 34, NULL, 30, 3, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (49, 4, 37, NULL, 10, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (50, 4, 38, NULL, 1, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (51, 4, 39, NULL, 20, 3, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (52, 4, 53, NULL, 80, 3, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (53, 5, 2, NULL, 350, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (54, 5, 57, NULL, 120, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (55, 5, 25, NULL, 100, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (56, 5, 19, NULL, 100, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (57, 5, 52, NULL, 60, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (58, 5, 28, NULL, 10, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (59, 5, 40, NULL, 15, 3, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (60, 5, 41, NULL, 10, 3, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (61, 5, 37, NULL, 5, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (62, 5, 38, NULL, 1, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (63, 5, 39, NULL, 20, 3, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (64, 6, 1, NULL, 350, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (65, 6, 50, NULL, 350, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (66, 6, 46, NULL, 800, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (67, 6, 59, NULL, 150, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (68, 6, 23, NULL, 100, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (69, 6, 52, NULL, 150, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (70, 6, 61, NULL, 30, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (71, 6, 62, NULL, 30, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (72, 6, 29, NULL, 30, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (73, 6, 28, NULL, 20, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (74, 6, 34, NULL, 90, 3, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (75, 6, 37, NULL, 60, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (76, 6, 51, NULL, 60, 3, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (77, 6, 38, NULL, 2, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (78, 6, 39, NULL, 15, 3, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (79, 6, 32, NULL, 5, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (80, 6, 53, NULL, 400, 3, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (81, 7, 50, NULL, 250, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (82, 7, 8, NULL, 100, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (83, 7, 64, NULL, 40, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (84, 7, 63, NULL, 10, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (85, 7, 23, NULL, 80, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (86, 7, 25, NULL, 80, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (87, 7, 10, NULL, 1, 8, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (88, 7, 14, NULL, 15, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (89, 7, 65, NULL, 120, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (90, 7, 34, NULL, 45, 3, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (91, 7, 38, NULL, 1, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (92, 7, 39, NULL, 400, 3, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (93, 7, 37, NULL, 20, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (94, 7, 51, NULL, 25, 3, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (95, 7, 28, NULL, 10, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (96, 7, 32, NULL, 3, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (97, 7, 53, NULL, 120, 3, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (98, 8, 66, NULL, 700, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (99, 8, 68, NULL, 30, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (100, 8, 69, NULL, 40, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (101, 8, 70, NULL, 3, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (102, 8, 29, NULL, 20, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (103, 8, 34, NULL, 50, 3, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (104, 8, 37, NULL, 15, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (105, 8, 39, NULL, 40, 3, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (106, 8, 14, NULL, 100, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (107, 8, 67, NULL, 100, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (108, 8, 46, NULL, 800, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (109, 8, 47, NULL, 50, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (110, 8, 60, NULL, 25, 3, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (111, 8, 28, NULL, 10, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (112, 8, 32, NULL, 3, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (113, 8, 53, NULL, 100, 3, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (114, 9, 71, NULL, 500, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (115, 9, 72, NULL, 40, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (116, 9, 73, NULL, 40, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (117, 9, 74, NULL, 50, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (118, 9, 75, NULL, 10, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (119, 9, 36, NULL, 5, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (120, 9, 39, NULL, 15, 3, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (121, 9, 53, NULL, 2000, 3, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (122, 10, 76, NULL, 500, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (123, 10, 77, NULL, 600, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (124, 10, 46, NULL, 800, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (125, 10, 31, NULL, 100, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (126, 10, 78, NULL, 25, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (127, 10, 25, NULL, 150, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (128, 10, 29, NULL, 30, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (129, 10, 28, NULL, 15, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (130, 10, 79, NULL, 20, 3, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (131, 10, 39, NULL, 10, 3, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (132, 10, 80, NULL, 5, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (133, 10, 34, NULL, 30, 3, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (134, 10, 36, NULL, 8, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (135, 10, 37, NULL, 15, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (136, 10, 14, NULL, 20, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (137, 10, 15, NULL, 15, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (138, 10, 81, NULL, 150, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (139, 10, 18, NULL, 150, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (140, 10, 17, NULL, 20, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (141, 10, 60, NULL, 30, 3, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (142, 10, 53, NULL, 3500, 3, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (143, 11, 82, NULL, 800, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (144, 11, 1, NULL, 350, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (145, 11, 8, NULL, 300, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (146, 11, 29, NULL, 30, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (147, 11, 28, NULL, 15, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (148, 11, 75, NULL, 15, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (149, 11, 34, NULL, 40, 3, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (150, 11, 36, NULL, 3, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (151, 11, 37, NULL, 10, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (152, 11, 39, NULL, 20, 3, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (153, 11, 79, NULL, 10, 3, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (154, 11, 53, NULL, 1000, 3, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (155, 11, 47, NULL, 50, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (156, 11, 83, NULL, 60, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (157, 11, 52, NULL, 120, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (158, 11, 81, NULL, 120, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (159, 11, 18, NULL, 100, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (160, 11, 17, NULL, 20, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (161, 11, 14, NULL, 20, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (162, 11, 60, NULL, 30, 3, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (163, 11, 32, NULL, 5, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (164, 12, 5, NULL, 1000, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (165, 12, 84, NULL, 350, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (166, 12, 25, NULL, 150, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (167, 12, 29, NULL, 30, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (168, 12, 30, NULL, 20, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (169, 12, 70, NULL, 2, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (170, 12, 85, NULL, 20, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (171, 12, 59, NULL, 150, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (172, 12, 23, NULL, 100, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (173, 12, 58, NULL, 150, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (174, 12, 34, NULL, 40, 3, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (175, 12, 37, NULL, 25, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (176, 12, 36, NULL, 6, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (177, 12, 60, NULL, 30, 3, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (178, 12, 51, NULL, 30, 3, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (179, 12, 28, NULL, 10, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (180, 12, 32, NULL, 5, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (181, 12, 39, NULL, 20, 3, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (182, 12, 53, NULL, 2000, 3, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (183, 13, 86, NULL, 200, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (184, 13, 48, NULL, 20, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (185, 13, 8, NULL, 250, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (186, 13, 14, NULL, 40, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (187, 13, 29, NULL, 15, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (188, 13, 39, NULL, 40, 3, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (189, 13, 34, NULL, 40, 3, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (190, 13, 37, NULL, 25, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (191, 13, 36, NULL, 2, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (192, 13, 32, NULL, 3, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (193, 13, 53, NULL, 800, 3, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (194, 14, 5, NULL, 1200, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (195, 14, 87, NULL, 5, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (196, 14, 31, NULL, 40, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (197, 14, 30, NULL, 20, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (198, 14, 29, NULL, 30, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (199, 14, 28, NULL, 15, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (200, 14, 32, NULL, 5, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (201, 14, 36, NULL, 6, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (202, 14, 34, NULL, 20, 3, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (203, 14, 39, NULL, 20, 3, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (204, 14, 60, NULL, 20, 3, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (205, 15, 86, NULL, 250, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (206, 15, 48, NULL, 20, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (207, 15, 70, NULL, 3, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (208, 15, 88, NULL, 200, 3, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (209, 15, 53, NULL, 550, 3, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (210, 15, 1, NULL, 250, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (211, 15, 8, NULL, 250, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (212, 15, 18, NULL, 300, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (213, 15, 25, NULL, 100, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (214, 15, 14, NULL, 30, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (215, 15, 39, NULL, 80, 3, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (216, 15, 36, NULL, 4, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (217, 15, 34, NULL, 50, 3, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (218, 15, 37, NULL, 30, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (219, 15, 60, NULL, 30, 3, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (220, 15, 28, NULL, 15, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (221, 15, 32, NULL, 5, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (222, 15, 52, NULL, 200, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (223, 15, 89, NULL, 200, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (224, 15, 17, NULL, 30, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (225, 16, 8, NULL, 300, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (226, 16, 1, NULL, 300, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (227, 16, 46, NULL, 300, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (228, 16, 90, NULL, 120, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (229, 16, 52, NULL, 150, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (230, 16, 17, NULL, 20, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (231, 16, 58, NULL, 150, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (232, 16, 91, NULL, 100, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (233, 16, 47, NULL, 40, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (234, 16, 28, NULL, 10, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (235, 16, 39, NULL, 10, 3, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (236, 16, 37, NULL, 15, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (237, 16, 36, NULL, 3, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (238, 16, 53, NULL, 1200, 3, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (239, 17, 92, NULL, 700, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (240, 17, 34, NULL, 40, 3, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (241, 17, 37, NULL, 25, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (242, 17, 43, NULL, 300, 3, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (243, 17, 29, NULL, 25, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (244, 17, 28, NULL, 10, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (245, 17, 32, NULL, 5, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (246, 17, 38, NULL, 2, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (247, 17, 14, NULL, 20, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (248, 17, 39, NULL, 15, 3, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (249, 18, 94, NULL, 400, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (250, 18, 93, NULL, 800, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (251, 18, 31, NULL, 40, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (252, 18, 28, NULL, 20, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (253, 18, 29, NULL, 20, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (254, 18, 34, NULL, 80, 3, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (255, 18, 37, NULL, 45, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (256, 18, 95, NULL, 15, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (257, 18, 39, NULL, 40, 3, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (258, 18, 38, NULL, 2, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (259, 18, 14, NULL, 40, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (260, 18, 23, NULL, 120, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (261, 18, 59, NULL, 120, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (262, 18, 51, NULL, 40, 3, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (263, 18, 58, NULL, 150, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (264, 18, 19, NULL, 150, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (265, 18, 60, NULL, 25, 3, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (266, 18, 32, NULL, 5, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (267, 18, 53, NULL, 650, 3, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (268, 19, 12, NULL, 500, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (269, 19, 26, NULL, 150, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (270, 19, 96, NULL, 150, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (271, 19, 97, NULL, 100, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (272, 19, 28, NULL, 10, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (273, 19, 41, NULL, 40, 3, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (274, 19, 37, NULL, 10, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (275, 19, 36, NULL, 2, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (276, 19, 38, NULL, 1, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (277, 19, 39, NULL, 40, 3, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (278, 19, 14, NULL, 20, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (279, 19, 53, NULL, 300, 3, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (280, 20, 98, NULL, 500, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (281, 20, 99, NULL, 50, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (282, 20, 88, NULL, 300, 3, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (283, 20, 37, NULL, 70, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (284, 20, 36, NULL, 1, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (285, 20, 73, NULL, 15, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (286, 20, 47, NULL, 30, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (287, 20, 100, NULL, 10, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (288, 20, 53, NULL, 700, 3, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (289, 21, 13, NULL, 400, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (290, 21, 28, NULL, 20, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (291, 21, 39, NULL, 20, 3, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (292, 21, 41, NULL, 15, 3, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (293, 21, 36, NULL, 2, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (294, 21, 37, NULL, 3, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (295, 21, 53, NULL, 40, 3, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (296, 22, 10, NULL, 3, 8, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (297, 22, 14, NULL, 20, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (298, 22, 34, NULL, 10, 3, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (299, 22, 38, NULL, 0.5, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (300, 22, 39, NULL, 15, 3, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (301, 22, 53, NULL, 15, 3, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (302, 23, 101, NULL, 450, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (303, 23, 50, NULL, 150, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (304, 23, 29, NULL, 15, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (305, 23, 14, NULL, 15, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (306, 23, 34, NULL, 20, 3, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (307, 23, 36, NULL, 2, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (308, 23, 38, NULL, 0.5, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (309, 23, 39, NULL, 10, 3, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (310, 23, 53, NULL, 1000, 3, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (311, 24, 12, NULL, 450, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (312, 24, 19, NULL, 300, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (313, 24, 29, NULL, 15, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (314, 24, 14, NULL, 15, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (315, 24, 103, NULL, 20, 3, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (316, 24, 37, NULL, 8, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (317, 24, 36, NULL, 2, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (318, 24, 39, NULL, 35, 3, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (319, 24, 53, NULL, 150, 3, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (320, 25, 6, NULL, 600, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (321, 25, 57, NULL, 120, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (322, 25, 25, NULL, 100, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (323, 25, 28, NULL, 15, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (324, 25, 34, NULL, 30, 3, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (325, 25, 51, NULL, 35, 3, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (326, 25, 37, NULL, 30, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (327, 25, 48, NULL, 5, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (328, 25, 39, NULL, 30, 3, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (329, 25, 38, NULL, 1, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (330, 25, 53, NULL, 400, 3, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (331, 26, 102, NULL, 200, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (332, 26, 73, NULL, 20, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (333, 26, 37, NULL, 90, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (334, 26, 88, NULL, 200, 3, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (335, 26, 48, NULL, 15, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (336, 26, 36, NULL, 1, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (337, 26, 53, NULL, 1200, 3, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- CookingSteps: 134 records.
INSERT INTO "CookingSteps" ("id", "recipeId", "stepNumber", "instruction", "createdAt", "updatedAt") VALUES
  (1, 1, 1, E'Cá làm sạch, bỏ mang/nội tạng, cắt khúc 2–3 cm và thấm ráo. Ướp với 1/3 tổng nước mắm và 1/3 tổng muối trong 10 phút. Rửa rau, thái cà chua múi cau, dứa lát, đậu bắp xéo; băm tỏi, thái ớt và rau ngổ.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (2, 1, 2, E'Dọc mùng loại ăn được tước vỏ, thái xéo; bóp với phần muối còn lại, xả kỹ và vắt nhẹ. Chần trong nước sôi riêng 2 phút, bỏ nước chần. Không sử dụng cây dại chưa xác định đúng loại.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (3, 1, 3, E'Lấy 1/7 tổng nước lọc trong bảng, làm nóng rồi dầm toàn bộ me, lọc bỏ xơ. Phi tỏi bằng toàn bộ dầu tới vàng nhạt, vớt một nửa tỏi ra để rắc cuối.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (4, 1, 4, E'Cho cà chua và dứa vào phần dầu tỏi, đảo 2 phút. Thêm toàn bộ nước lọc còn lại và nước me, đun sôi.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (5, 1, 5, E'Thả cá vào khi nước sôi, hạ vừa lửa, hớt bọt và nấu 8–12 phút tùy độ dày, đến khi thịt cá chín đục, tách thớ; không khuấy mạnh làm vỡ cá.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (6, 1, 6, E'Thêm đậu bắp, dọc mùng, phần nước mắm còn lại và toàn bộ đường; nấu 3 phút. Cho giá vào nấu thêm 1 phút, tắt bếp rồi thêm rau ngổ, ớt và tỏi phi đã giữ. Thành phẩm chua dịu, cá chín nguyên khúc, rau không nhũn.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (7, 2, 1, E'Ba chỉ cắt miếng khoảng 3 cm, chần nhanh trong nước sôi riêng rồi rửa sạch cặn và để ráo. Băm hành tím, tỏi.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (8, 2, 2, E'Trứng cút luộc khoảng 5 phút từ lúc nước sôi nhẹ, làm nguội và bóc vỏ. Ướp thịt với 2/3 tổng nước mắm, 2/5 tổng đường, toàn bộ hành, tỏi và tiêu trong 30 phút.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (9, 2, 3, E'Cho toàn bộ dầu và phần đường còn lại vào nồi, đun vừa đến màu hổ phách; không để đen. Thêm thịt vào đảo 5 phút, tránh bắn đường nóng.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (10, 2, 4, E'Rót toàn bộ nước dừa và nước lọc trong bảng, đun sôi, hớt bọt. Hạ nhỏ lửa, đậy hé và kho khoảng 45 phút.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (11, 2, 5, E'Cho trứng và phần nước mắm còn lại vào, kho thêm 20 phút. Nếu cạn quá nhanh, giảm lửa/đậy nắp thay vì tiếp tục đun khô; với nồi bốc hơi mạnh có thể cần bổ sung nước nóng, ghi lượng thực tế khi hiệu chỉnh phiên bản seed.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (12, 2, 6, E'Kiểm tra thịt mềm khi xiên nhưng không nát, trứng thấm vị, nước kho còn xâm xấp. Tắt bếp, để nghỉ 5 phút trước khi dùng với cơm.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (13, 3, 1, E'Chần xương trong nồi nước sôi riêng khoảng 10 phút rồi xả sạch cặn. Nạm thấm sạch. Nướng 3/4 tổng hành tây, toàn bộ hành tím và gừng đến thơm, bỏ phần cháy đen. Giữ phần hành tây còn lại để thái mỏng ăn kèm.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (14, 3, 2, E'Cho xương, nạm, hành gừng nướng và 8/9 tổng nước lọc trong bảng vào nồi lớn; giữ 1/9 nước làm dự phòng. Đun sôi, hớt bọt, hạ lửa chỉ sôi lăn tăn. Cho 2/3 tổng muối vào. Đậy hé để hạn chế bay hơi.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (15, 3, 3, E'Sau khoảng 75–100 phút, kiểm tra nạm chín mềm vừa phải thì vớt ra, đậy giữ ẩm để nguội bớt rồi thái ngang thớ. Tiếp tục ninh xương để tổng thời gian đạt khoảng 4 giờ.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (16, 3, 4, E'Rang hồi, quế, hạt mùi 1–2 phút, bọc túi lọc và cho vào 45 phút cuối, sau đó vớt túi ra để không đắng/nồng.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (17, 3, 5, E'Lọc nước dùng, loại xương và gia vị. Dùng phần nước dự phòng để bù bay hơi khi cần; đun cô hoặc bù nước để thu khoảng 600 ml nước dùng cho mỗi phần ăn đang nấu. Nêm toàn bộ nước mắm, đường và phần muối còn lại; đun sôi lại. Lượng dự phòng có thể không dùng hết; mức nước thực tế phụ thuộc nồi và độ hé nắp.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (18, 3, 6, E'Chần phở bằng nước sôi riêng, chia thành số bát tương ứng số phần ăn đang nấu; xếp nạm, hành tây sống thái mỏng, hành lá và rau mùi. Chan khoảng 600 ml nước dùng nóng mỗi bát. Chanh và ớt chia đều ăn kèm, không cho chanh vào cả nồi.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (19, 4, 1, E'Thịt gà thấm khô, cắt miếng 2–3 cm. Băm sả, ớt, hành và tỏi; để riêng dụng cụ tiếp xúc thịt sống và đồ chín.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (20, 4, 2, E'Ướp gà với một nửa tổng sả, một nửa tổng nước mắm, một nửa tổng đường và toàn bộ tiêu trong 20 phút trong ngăn mát.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (21, 4, 3, E'Làm nóng toàn bộ dầu, phi hành, tỏi và phần sả còn lại khoảng 1 phút; thêm gà, đảo lửa vừa lớn 5 phút tới săn.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (22, 4, 4, E'Thêm toàn bộ nước lọc, phần nước mắm và đường còn lại cùng ớt; đậy nắp, nấu lửa vừa nhỏ 8–10 phút.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (23, 4, 5, E'Mở nắp, đảo 3–4 phút cho sốt bám thịt; kiểm tra miếng dày nhất chín hoàn toàn rồi tắt bếp. Thịt còn ẩm, sả thơm, không cháy đen.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (24, 5, 1, E'Bò thấm khô, cắt khối khoảng 2 cm. Ướp với toàn bộ dầu hào, nước tương, đường, tiêu và một nửa tổng tỏi băm trong 15 phút.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (25, 5, 2, E'Cắt ớt chuông, hành tây miếng vuông. Xà lách và cà chua rửa bằng nước sạch, để ráo, xếp lên đĩa.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (26, 5, 3, E'Làm nóng chảo với một nửa tổng dầu; xào ớt chuông và hành tây 2–3 phút rồi trút ra.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (27, 5, 4, E'Dùng phần dầu còn lại, cho bò vào một lớp, chia lượt nếu chảo nhỏ. Áp chảo rồi đảo/lắc trong khoảng 4–6 phút mỗi mẻ tùy độ dày, cho phần tỏi còn lại vào cuối để không cháy. Kiểm tra độ chín mong muốn và phù hợp người ăn; thời gian không phải bảo đảm độ chín tuyệt đối.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (28, 5, 5, E'Trút rau củ lại vào chảo, đảo 30–60 giây, tắt bếp và bày lên đĩa rau. Không om lâu khiến bò dai.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (29, 6, 1, E'Ba chỉ thái lát dày 4–5 mm. Băm hành, tỏi; dùng 1/3 tổng nước mắm, 1/3 tổng đường, một nửa tổng tỏi cùng toàn bộ hành, tiêu và dầu để ướp. Chia hỗn hợp gia vị theo lượng mỗi loại thịt, giữ hai loại thịt riêng, ướp ngăn mát 45 phút; nặn phần thịt xay thành viên dẹt có độ dày tương tự nhau.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (30, 6, 2, E'Đu đủ và cà rốt thái lát mỏng. Trộn với một nửa tổng giấm và 1/6 tổng đường, để 20 phút rồi để ráo. Rửa sạch, để ráo rau sống.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (31, 6, 3, E'Hòa toàn bộ nước lọc với phần nước mắm, đường và giấm còn lại. Đun ấm để tan đường, để nguội bớt, thêm phần tỏi còn lại và toàn bộ ớt.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (32, 6, 4, E'Làm nóng lò 210°C; nướng thịt trên vỉ có khay hứng 18–25 phút, trở giữa chừng. Chả viên phải chín tận giữa, ba chỉ chín mềm, xém mặt vừa; không dùng màu nướng để kết luận thịt đã chín.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (33, 6, 5, E'Chia nước chấm, chả và đồ chua theo số phần ăn đang nấu; bún cùng rau để riêng. Chỉ ngâm chả trong nước chấm ngay trước lúc ăn để còn thơm.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (34, 7, 1, E'Ngâm miến trong nước thường 10–15 phút đến mềm, để ráo và cắt ngắn. Mộc nhĩ ngâm riêng đến nở vừa, rửa sạch, bỏ chân, băm nhỏ; không ngâm qua đêm ở nhiệt độ phòng. Băm tôm, thái nhỏ hành tây, cà rốt và hành lá.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (35, 7, 2, E'Trộn thịt, tôm, miến, mộc nhĩ, rau củ với lượng trứng trong bảng, 1/3 tổng nước mắm và toàn bộ tiêu. Nếu lượng trứng là phần lẻ, đánh tan trứng rồi lấy đúng tỉ lệ. Trộn ngay trước khi cuốn, không để nhân ra nhiều nước.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (36, 7, 3, E'Làm mềm bánh đa nem bằng khăn ẩm, chia nhân theo số vỏ thực tế và cuốn vừa tay, không siết chặt. Giữ cuốn nhỏ đều nhau; mẻ gốc 4 phần ăn cho khoảng 16 cuốn, thay đổi số cuốn theo khẩu phần và kích thước vỏ, không tăng độ dày cuốn.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (37, 7, 4, E'Cho dầu theo bảng vào chảo có kích thước phù hợp để rán ngập một phần cuốn; rán từng mẻ ở khoảng 150–160°C tới nhân chín và vỏ vàng nhạt, khoảng 8–10 phút/mẻ; vớt lên giá. Trước khi ăn có thể tăng lên 170–175°C và rán lại 1–2 phút cho giòn; không để dầu bốc khói. Không thêm lại toàn bộ lượng dầu cho mỗi mẻ.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (38, 7, 5, E'Hòa toàn bộ nước lọc với phần nước mắm còn lại, toàn bộ đường, giấm, tỏi băm và ớt. Cắt kiểm tra một cuốn dày nhất: nhân chín hoàn toàn, không còn phần thịt/tôm sống; dùng nem nóng với nước chấm.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (39, 8, 1, E'Cá thấm khô, cắt miếng khoảng 3 cm, rà lại xương sót. Riềng giã nhỏ, mẻ lọc mịn, hành tím băm; hành lá và thì là cắt đoạn.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (40, 8, 2, E'Ướp cá với toàn bộ riềng, mẻ, nghệ, hành tím, 2/5 tổng nước mắm, 1/3 tổng đường và 1/4 tổng dầu trong ngăn mát 60 phút.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (41, 8, 3, E'Xếp cá lên khay có giấy nướng, nướng lò đã nóng 200°C khoảng 12–15 phút, trở nhẹ nếu cần, tới gần chín.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (42, 8, 4, E'Hòa toàn bộ nước lọc, phần nước mắm và đường còn lại cùng toàn bộ nước chanh, tỏi và ớt làm nước chấm. Chia bún và lạc ra đĩa theo số phần ăn đang nấu.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (43, 8, 5, E'Làm nóng phần dầu còn lại trong chảo, cho cá cùng hành lá và thì là vào đảo nhẹ 3–5 phút đến cá chín hoàn toàn, rau vừa mềm. Ăn nóng cùng bún, lạc và nước chấm.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (44, 9, 1, E'Vo nếp theo lượng trong bảng đã đổi, chia thành 5 phần bằng nhau tương ứng 5 màu. Chia toàn bộ nước lọc thành 5 phần bằng nhau: một phần dùng ngâm màu trắng; một phần nấu lá cẩm 10 phút rồi lọc; một phần xay lá dứa rồi lọc; một phần xay nghệ rồi lọc; một phần dùng ngâm nếp sẽ trộn gấc. Để nước màu nguội trước khi ngâm.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (45, 9, 2, E'Ngâm riêng 5 phần nếp trong các nước đã chuẩn bị khoảng 6 giờ trong ngăn mát. Dùng dụng cụ riêng cho từng màu; nước ngâm phải phủ mặt nếp. Không thêm phẩm màu không rõ nguồn gốc.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (46, 9, 3, E'Đổ bỏ nước ngâm, để nếp ráo ít nhất 15 phút. Chia toàn bộ muối và dầu thành 5 phần bằng nhau, trộn mỗi phần vào một màu nếp. Phần nếp dành màu đỏ trộn thêm toàn bộ thịt gấc trong bảng, bóp nhẹ cho bám màu.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (47, 9, 4, E'Đun sôi nước xửng riêng. Xếp 5 màu vào các khoang/khay có vách ngăn chịu nhiệt; không nén chặt, chừa đường hơi. Hấp 25 phút lửa vừa mạnh.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (48, 9, 5, E'Mở nắp tránh nước nhỏ xuống xôi, xới nhẹ từng phần, hấp tiếp khoảng 20 phút đến hạt nếp mềm dẻo, không còn lõi cứng. Xếp 5 màu cạnh nhau, không trộn lẫn. Màu thực tế phụ thuộc nguyên liệu và giống nếp.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (49, 10, 1, E'Chần giò heo và bắp bò trong nước sôi riêng, rửa sạch cặn. Đập dập 7/10 tổng sả; băm phần sả còn lại cùng toàn bộ hành tím và tỏi. Hành tây bổ đôi.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (50, 10, 2, E'Chia toàn bộ nước lọc trong bảng thành ba phần theo tỉ lệ 2:30:3, lần lượt dùng hòa ruốc, ninh thịt và dự phòng. Hòa toàn bộ mắm ruốc với phần nước dành hòa ruốc, để lắng rồi lọc phần nước phía trên, bỏ cặn. Dùng rây mịn; không cho nguyên phần cặn vào nồi.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (51, 10, 3, E'Cho thịt, hành tây, sả đập dập và phần nước dành ninh thịt vào nồi, đun sôi, hớt bọt, thêm toàn bộ muối rồi ninh lửa nhỏ. Cho nước ruốc đã lọc vào sau khi nồi trong bọt.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (52, 10, 4, E'Kiểm tra giò heo sau 60–90 phút và bắp bò sau 90–120 phút; vớt riêng từng phần khi vừa mềm để không nát. Thái bắp bò ngang thớ, giữ giò nguyên khoanh. Duy trì nồi nước dùng nóng.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (53, 10, 5, E'Phi hành, tỏi và sả băm bằng dầu ăn; hạ lửa, thêm dầu màu điều cùng ớt bột, đảo 20–30 giây rồi cho vào nồi. Không rang cháy ớt. Nêm nước mắm và đường.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (54, 10, 6, E'Lọc bỏ hành/sả lớn, dùng phần nước dự phòng để điều chỉnh bay hơi khi cần, nhắm khoảng 600 ml nước dùng cho mỗi phần ăn đang nấu. Đun sôi lại và giữ nóng; thời gian mẻ gốc khoảng 150 phút gồm sơ chế nhiệt và hoàn thiện. Không bắt buộc dùng hết nước dự phòng nếu đã đạt lượng nước dùng và vị phù hợp.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (55, 10, 7, E'Rửa rau bằng nước sạch; giá chần chín riêng. Chần bún, chia theo số phần ăn đang nấu, xếp bò và giò, chan khoảng 600 ml nước dùng mỗi bát, rắc hành mùi. Bắp chuối, húng quế và chanh chia riêng ăn kèm.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (56, 11, 1, E'Ba chỉ thái lát vừa, tôm bỏ chỉ lưng. Giã nghệ, băm hành và tỏi. Ướp thịt với một nửa của từng loại hành, tỏi, nghệ, một nửa tổng nước mắm, toàn bộ muối và một nửa tổng đường trong 20 phút. Tôm ướp riêng với phần hành, tỏi, nghệ còn lại và 1/4 tổng nước mắm; giữ 1/4 nước mắm và một nửa đường cho bước nêm cuối.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (57, 11, 2, E'Làm nóng toàn bộ dầu ăn và dầu màu điều, xào thịt 5 phút tới săn; thêm toàn bộ nước lọc trong bảng, đun sôi, hạ nhỏ lửa và nấu 25 phút.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (58, 11, 3, E'Cho tôm cùng nước ướp, phần nước mắm và đường đã giữ vào, nấu thêm 5–7 phút đến tôm chín và thịt mềm. Giữ nước nhân khoảng 200 ml cho mỗi phần ăn đang nấu, vị đậm hơn canh vì ăn cùng mì và rau.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (59, 11, 4, E'Rau sống rửa sạch để ráo, giá chần chín, hành lá thái nhỏ. Trụng mì theo độ mềm của sợi thành phẩm rồi chia theo số phần ăn đang nấu.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (60, 11, 5, E'Xếp rau, mì, thịt và tôm; chan khoảng 200 ml nước nhân mỗi tô. Rắc lạc, hành, thêm bánh tráng mè bẻ miếng; chanh và ớt dùng kèm. Không chan đầy như phở.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (61, 12, 1, E'Cho gà, 9/10 tổng nước lọc, toàn bộ gừng, hành tím và 2/3 tổng muối vào nồi; giữ 1/10 nước cho nước chấm. Đun sôi nhẹ rồi luộc liu riu 25–35 phút tùy miếng; kiểm tra phần dày nhất chín hoàn toàn. Vớt gà để nguội bớt và xé thịt, giữ lại nước luộc.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (62, 12, 2, E'Vo gạo để ráo. Phi một nửa tổng tỏi với toàn bộ dầu, cho gạo và nghệ vào đảo 2 phút. Chuyển vào nồi cơm, lấy nước luộc gà đã lọc để nấu theo tỉ lệ khởi điểm 1.2 ml nước dùng cho mỗi 1 g gạo khô trong bảng đã đổi. Nấu và ủ theo nồi, điều chỉnh nước theo loại gạo khi nấu thử; phần nước này lấy từ nồi gà, không phải lượng nước mới cộng thêm vào bảng.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (63, 12, 3, E'Đu đủ và cà rốt thái sợi; trộn toàn bộ giấm với 2/5 tổng đường, ngâm rau 20 phút rồi để ráo. Hành tây thái mỏng, ngâm nước lạnh riêng 10 phút, để thật ráo. Dưa leo thái lát, rau răm thái vừa.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (64, 12, 4, E'Hòa phần nước lọc đã giữ với 3/4 tổng nước mắm, phần đường còn lại, 2/3 tổng nước chanh, phần tỏi còn lại và toàn bộ ớt làm nước chấm.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (65, 12, 5, E'Trộn gà xé với hành tây, rau răm, phần nước mắm, nước chanh và muối còn lại. Xới cơm, chia gà trộn, đồ chua và dưa leo theo số phần ăn đang nấu, dùng cùng nước chấm. Phần nước luộc còn dư không bắt buộc chia vào món cơm.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (66, 13, 1, E'Chia toàn bộ nước lọc thành ba phần theo tỉ lệ 5:7:4, lần lượt để nguội pha bột, làm nóng pha bột và để pha nước chấm. Trộn toàn bộ bột gạo, bột năng, muối với phần nước nguội pha bột. Rót từ từ phần nước nóng pha bột vào, khuấy đều; nghỉ bột 45 phút. Khuấy lại ngay trước mỗi lượt múc để bột không lắng.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (67, 13, 2, E'Hấp tôm riêng khoảng 5 phút đến chín, giã/tơi nhỏ. Phi toàn bộ hành tím bằng 1/4 tổng dầu, cho tôm vào đảo lửa nhỏ 5–7 phút với 1/4 tổng nước mắm cho tơi ráo, không cháy.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (68, 13, 3, E'Hành lá thái nhỏ, cho vào bát chịu nhiệt. Đun nóng 5/8 tổng dầu rồi rót lên hành, đảo đều; giữ 1/8 tổng dầu còn lại để quét chén.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (69, 13, 4, E'Pha nước chấm bằng phần nước dành nước chấm, phần nước mắm còn lại và toàn bộ đường, đun tan rồi để ấm, thêm ớt. Phiên bản này không pha chanh/giấm.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (70, 13, 5, E'Làm nóng chén nhỏ trong xửng sôi khoảng 2 phút; quét rất mỏng dầu đã giữ, múc khoảng 25 ml bột mỗi chén để giữ cùng độ dày bánh. Hấp 6–8 phút/mẻ đến bột trong đục đồng đều, không còn lớp hồ lỏng ở tâm. Lau nước dưới nắp giữa các mẻ, lặp lại đến hết bột; không tăng lượng bột mỗi chén theo số người.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (71, 13, 6, E'Để bánh se mặt 2 phút, thêm tôm chấy và dầu hành, ăn với nước mắm. Độ lõm và số chén phụ thuộc kích thước chén, không phải tiêu chí để bỏ qua kiểm tra bánh chín.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (72, 14, 1, E'Gà chia miếng lớn dày tương đối đều, thấm khô, khía nhẹ phần đùi. Rang mắc khén lửa nhỏ 1–2 phút tới thơm rồi giã, tránh rang cháy gây đắng.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (73, 14, 2, E'Giã toàn bộ sả, gừng, hành, tỏi với 3/5 tổng mắc khén, 2/3 tổng muối, 3/5 tổng ớt, toàn bộ nước mắm và dầu. Xoa đều lên gà, ướp kín trong ngăn mát 2 giờ.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (74, 14, 3, E'Làm nóng lò 190°C. Đặt gà lên vỉ có khay hứng, nướng 25 phút rồi trở mặt; nướng tiếp 20–25 phút tùy miếng. Nếu mặt vàng quá nhanh thì che lỏng bằng giấy bạc.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (75, 14, 4, E'Kiểm tra phần thịt dày nhất gần xương đã chín hoàn toàn; nếu chưa chín thì nướng tiếp và ghi lại thời gian theo thiết bị thực tế. Không dùng nước ướp thịt sống làm nước chấm.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (76, 14, 5, E'Trộn phần mắc khén, muối và ớt còn lại với toàn bộ nước chanh làm chấm kiểu gia đình; để gà nghỉ 5 phút rồi chặt miếng. Đây không được mô tả là công thức chẩm chéo truyền thống đầy đủ.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (77, 15, 1, E'Trộn toàn bộ bột gạo, bột năng, nghệ, nước cốt dừa với 8/11 tổng nước lọc và một nửa tổng muối, khuấy mịn; thêm hành lá thái nhỏ, nghỉ 30 phút. Giữ 3/11 nước còn lại cho nước chấm. Bột phải đủ loãng để láng mỏng; điều chỉnh nhỏ khi thử bánh đầu và cập nhật nếu thay đổi công thức.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (78, 15, 2, E'Ba chỉ thái mỏng; hành tây thái múi mỏng. Ướp thịt và tôm với phần muối còn lại, 1/5 tổng nước mắm và 1/3 tổng tỏi băm trong 10 phút.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (79, 15, 3, E'Dùng 1/8 tổng dầu xào thịt và tôm chín, chia nhân theo số bánh dự kiến từ lượng bột đã đổi khẩu phần. Rau sống rửa sạch, để ráo; giá rửa sạch để dùng làm nhân được nấu chín.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (80, 15, 4, E'Pha phần nước lọc đã giữ với phần nước mắm và tỏi còn lại cùng toàn bộ đường, nước chanh và ớt. Khuấy tan đường.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (81, 15, 5, E'Làm nóng chảo, chia phần dầu còn lại cho các lượt đổ bánh. Với chảo 24–26 cm, cho một phần thịt tôm, hành tây, múc khoảng 100–110 ml bột láng mỏng, thêm một phần giá, đậy 1–2 phút. Lượng bột mỗi bánh phụ thuộc chảo, không nhân theo số người.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (82, 15, 6, E'Mở nắp, nấu thêm 2–3 phút đến vỏ khô giòn, giá chín, gập bánh. Lặp lại đến hết bột và nhân, khuấy bột trước mỗi lượt. Ăn ngay với rau và nước chấm để bánh không ỉu.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (83, 16, 1, E'Dành 5/6 tổng nước lọc để luộc ba chỉ với toàn bộ muối; giữ 1/6 nước cho sốt tương. Luộc sôi nhỏ khoảng 20–25 phút tùy độ dày, kiểm tra chín tận giữa rồi vớt ra. Cho tôm vào nước luộc đang sôi, nấu khoảng 3–4 phút tới chín, vớt ra để ráo. Nước luộc này không dùng làm sốt tương.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (84, 16, 2, E'Thịt nguội bớt thái mỏng; tôm bổ dọc nếu con lớn. Rau rửa sạch để ráo kỹ, dưa leo bỏ ruột mềm rồi cắt thanh; chia bún và nhân theo số lá bánh tráng thực tế, giữ mỗi cuốn kích thước tương tự.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (85, 16, 3, E'Xay/dằm toàn bộ tương hột với phần nước lọc đã giữ. Phi toàn bộ tỏi với dầu, cho tương và đường vào nấu 5–7 phút; thêm một nửa tổng lạc giã, khuấy sánh vừa rồi tắt bếp.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (86, 16, 4, E'Chuẩn bị bánh tráng theo lượng trong bảng đã đổi; mẻ gốc 4 phần ăn dùng khoảng 12 lá. Làm ẩm vừa theo hướng dẫn sản phẩm bằng nước sạch riêng. Xếp xà lách, rau, dưa leo, bún, thịt, tôm và cuốn chắc vừa tay đến hết nhân.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (87, 16, 5, E'Chia sốt, rắc phần lạc còn lại. Dùng cuốn ngay sau khi làm; nếu chờ, giữ lạnh và che để bánh không khô, tránh để thịt tôm chín lâu ngoài nhiệt độ phòng.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (88, 17, 1, E'Cá làm sạch nhớt và máu đọng, thấm ráo; khúc dày khoảng 2–3 cm. Băm hành tỏi, thái hành lá và ớt.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (89, 17, 2, E'Ướp cá với 3/4 tổng nước mắm, 2/5 tổng đường, một nửa của từng loại hành tím và tỏi cùng một nửa tổng tiêu trong ngăn mát 25 phút.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (90, 17, 3, E'Đun phần đường còn lại với toàn bộ dầu tới màu hổ phách; thêm phần hành tỏi còn lại, đảo nhanh rồi xếp cá nhẹ tay vào, trở một lần cho bám màu.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (91, 17, 4, E'Rót toàn bộ nước dừa và phần nước mắm còn lại, đun sôi rồi hạ nhỏ lửa kho 25–30 phút, rưới nước kho lên mặt cá thay vì đảo. Hé nắp giai đoạn cuối cho nước sánh, tránh cạn cháy.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (92, 17, 5, E'Kiểm tra cá chín tới giữa khúc, thêm toàn bộ hành lá, ớt và phần tiêu còn lại, đun thêm 1 phút. Nếu dùng nồi đất, phải là loại dùng được trên bếp và tăng nhiệt từ từ.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (93, 18, 1, E'Sườn dày khoảng 1–1,5 cm, thấm khô và dần nhẹ. Băm sả, hành tím, tỏi. Ướp sườn với toàn bộ sả, hành tím, một nửa tổng tỏi, 7/16 tổng nước mắm, 1/3 tổng đường, toàn bộ mật ong, tiêu và 3/8 tổng dầu; giữ ngăn mát ít nhất 2 giờ.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (94, 18, 2, E'Chia toàn bộ nước lọc thành hai phần theo tỉ lệ 10:3, lần lượt để nấu cơm và pha nước chấm. Vo gạo tấm để ráo, nấu với phần nước nấu cơm bằng nồi cơm rồi ủ 10 phút. Tỉ lệ khởi điểm tương đương 1.25 ml nước cho mỗi 1 g gạo khô, có thể cần điều chỉnh theo giống gạo/nồi khi nấu thử.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (95, 18, 3, E'Cà rốt và đu đủ thái sợi, trộn toàn bộ giấm và 2/9 tổng đường, để 20 phút rồi để ráo. Dưa leo và cà chua thái lát. Đun phần dầu còn lại và rót vào hành lá thái nhỏ trong bát chịu nhiệt làm dầu hành.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (96, 18, 4, E'Pha phần nước dành nước chấm với phần nước mắm, đường và tỏi còn lại cùng toàn bộ nước chanh và ớt; khuấy tan.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (97, 18, 5, E'Làm nóng lò 210°C, nướng sườn 18–25 phút, trở giữa chừng, kiểm tra chín tận phần gần xương. Không quét nước ướp sống lên sườn ở cuối quá trình nướng.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (98, 18, 6, E'Chia cơm, sườn, rau và đồ chua theo số phần ăn đang nấu; rưới dầu hành lên cơm, nước mắm để riêng. Không ghi thành “cơm tấm sườn bì chả” vì bản này không có bì và chả.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (99, 19, 1, E'Đậu phụ để ráo, thấm khô, cắt khối 2–3 cm. Nấm bỏ chân bẩn, rửa nhanh, để ráo; nấm rơm bổ đôi, nấm đùi gà thái, nấm bào ngư xé vừa.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (100, 19, 2, E'Dùng 3/4 tổng dầu áp chảo đậu 6–8 phút mỗi mẻ, trở nhẹ đến vàng các mặt rồi lấy ra. Nếu chia mẻ, chia phần dầu này cho các mẻ.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (101, 19, 3, E'Thêm phần dầu còn lại, phi toàn bộ tỏi băm, cho nấm vào đảo 3 phút. Thêm toàn bộ nước tương, đường, muối và nước lọc trong bảng, đun sôi.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (102, 19, 4, E'Cho đậu vào, kho nhỏ lửa 10–12 phút, lắc nồi nhẹ cho thấm. Không dùng dầu hào thường hay hạt nêm thịt để nêm món này.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (103, 19, 5, E'Khi nấm chín, đậu nóng và sốt còn sánh nhẹ, thêm hành lá và tiêu, nấu thêm 1 phút. Món chay này có hành tỏi, không phù hợp chế độ kiêng ngũ vị tân nếu chưa điều chỉnh.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (104, 20, 1, E'Ngâm bột báng bằng nước sạch riêng 20 phút rồi xả ráo. Chuối chín vừa, cắt lát dày 1,5–2 cm, trộn với 2/7 tổng đường trong 10 phút. Lá dứa rửa, buộc gọn.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (105, 20, 2, E'Đun toàn bộ nước lọc trong bảng với lá dứa, cho bột báng vào nấu 10–15 phút, khuấy nhẹ đến gần trong; thời gian có thể khác theo sản phẩm.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (106, 20, 3, E'Cho chuối cùng nước đường tiết ra vào nồi, nấu lửa nhỏ 5–7 phút tới chuối mềm nhưng không nát.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (107, 20, 4, E'Thêm toàn bộ nước cốt dừa, phần đường còn lại và toàn bộ muối, đun sôi nhẹ 3–5 phút; không sôi trào mạnh. Kiểm tra bột báng trong, không còn lõi cứng, vớt lá dứa.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (108, 20, 5, E'Múc chè theo số phần ăn đang nấu, rắc toàn bộ lạc và mè chia đều. Độ sánh tăng khi nguội; món này không cần bột năng bổ sung.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (109, 21, 1, E'Nhặt rau, rửa sạch, cắt đoạn 5–6 cm, tách phần cọng lớn và lá. Tỏi đập dập, băm thô.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (110, 21, 2, E'Làm nóng chảo với dầu; cho một nửa tỏi vào phi thơm 20–30 giây, không để vàng sẫm.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (111, 21, 3, E'Cho cọng vào đảo 1–2 phút, thêm lá, nước, muối, đường và nước tương; xào lửa lớn 3–4 phút, đảo để rau chín đều.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (112, 21, 4, E'Thêm phần tỏi còn lại, đảo 1 phút tới rau chín, cọng còn giòn; dọn ngay. Không chần rồi ghi thiếu công đoạn/định lượng gia vị trong bản này.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (113, 22, 1, E'Hành lá rửa sạch thái nhỏ. Đập trứng vào bát, loại vỏ sót và đánh tan. Nếu lượng trứng trong bảng là phần lẻ quả, lấy lượng trứng đã đánh tương ứng trước khi trộn toàn bộ nước mắm, tiêu và nước theo bảng.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (114, 22, 2, E'Trộn hành lá vào trứng. Làm nóng chảo chống dính ở lửa vừa; chảo cỡ 22–24 cm phù hợp mẻ gốc, chia lượng dầu trong bảng cho các lượt chiên nếu tăng mẻ.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (115, 22, 3, E'Đổ một lượng trứng đủ tạo lớp mỏng đều, nghiêng chảo; giữ phần hỗn hợp còn lại cho các lượt tiếp theo. Hạ lửa vừa nhỏ, đậy khoảng 3–4 phút tới mặt trên gần đông.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (116, 22, 4, E'Lật bằng đĩa hoặc chia miếng để trở, chiên thêm 1–2 phút đến trứng đông hoàn toàn, không còn phần trứng lỏng. Tắt bếp và cắt miếng.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (117, 23, 1, E'Bí gọt vỏ, bỏ hạt, cân theo lượng trong bảng đã đổi khẩu phần rồi cắt miếng 2 cm. Băm hành tím, thái hành lá. Trộn thịt với một nửa tổng nước mắm và toàn bộ tiêu.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (118, 23, 2, E'Phi hành tím với dầu, cho thịt vào đảo tơi 2–3 phút tới đổi màu, không để vón thành khối sống bên trong.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (119, 23, 3, E'Rót nước, đun sôi và hớt bọt; cho bí vào, nấu nhỏ lửa 12–15 phút đến bí mềm khi xiên nhưng chưa nát.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (120, 23, 4, E'Thêm phần nước mắm còn lại và toàn bộ muối, đun 1 phút; kiểm tra thịt chín rồi thêm hành lá, tắt bếp.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (121, 24, 1, E'Đậu thấm khô, cắt miếng 2 cm; cà chua băm nhỏ hoặc thái hạt lựu, hành tím băm, hành lá thái.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (122, 24, 2, E'Dùng 5/7 tổng dầu áp chảo đậu 6–8 phút mỗi mẻ đến vàng nhẹ, trở đều rồi lấy ra. Chia phần dầu này cho các mẻ nếu cần.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (123, 24, 3, E'Thêm phần dầu còn lại, phi toàn bộ hành tím, cho cà chua và muối vào xào 4 phút. Thêm toàn bộ nước lọc, đường, nước mắm chay trong bảng, nấu 3 phút cho cà mềm thành sốt.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (124, 24, 4, E'Cho đậu vào, rim 5 phút, trở nhẹ cho sốt bám đều. Thêm hành lá, tắt bếp khi đậu nóng thấm sốt; không thêm nước mắm cá vì món đang gắn danh mục chay.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (125, 25, 1, E'Sườn chặt miếng vừa, chần nước sôi riêng 3 phút rồi rửa cặn. Hành tây và ớt chuông cắt vuông, tỏi băm.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (126, 25, 2, E'Chia toàn bộ nước lọc trong bảng thành ba phần theo tỉ lệ 15:4:1, lần lượt để nấu sườn, pha sốt và hòa bột năng. Cho sườn cùng phần nước dành nấu sườn vào nồi vừa lượng thịt, đậy nắp nấu nhỏ lửa 15–20 phút tới gần mềm; giữ nước nấu còn lại.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (127, 25, 3, E'Hòa toàn bộ nước mắm, giấm, đường, tiêu với phần nước dành pha sốt. Hòa riêng toàn bộ bột năng với phần nước dành hòa bột.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (128, 25, 4, E'Làm nóng dầu trong chảo, áp chảo sườn ráo mặt khoảng 5 phút; thêm tỏi vào cuối. Cho hỗn hợp sốt và phần nước nấu sườn vào, đun nhỏ lửa 5 phút.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (129, 25, 5, E'Thêm hành tây, ớt chuông, đảo 2–3 phút. Khuấy lại bột năng và rót từ từ vào chảo, đun 1–2 phút đến sốt bóng sánh, sườn chín mềm. Không đổ bột khô trực tiếp gây vón.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (130, 26, 1, E'Vo đậu, ngâm nước sạch riêng 2 giờ trong ngăn mát, xả và để ráo. Lá dứa rửa sạch, buộc gọn.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (131, 26, 2, E'Cho toàn bộ đậu, lá dứa và 11/12 tổng nước lọc vào nồi; giữ 1/12 nước để hòa bột năng. Đun sôi, hớt bọt và nấu nhỏ lửa 20–25 phút tới đậu mềm. Khuấy sát đáy nhẹ tay để không khét.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (132, 26, 3, E'Vớt lá dứa, thêm đường và muối, khuấy tan rồi nấu 3 phút. Cho đường sau khi đậu mềm để tránh kéo dài thời gian nấu đậu.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (133, 26, 4, E'Hòa toàn bộ bột năng với phần nước đã giữ, khuấy lại rồi rót từ từ vào nồi chè đang sôi nhẹ. Nấu 2 phút đến bột chín, chè sánh nhẹ.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (134, 26, 5, E'Thêm toàn bộ nước cốt dừa, khuấy đều, đun sôi lăn tăn 2 phút rồi tắt bếp. Chia theo số phần ăn đang nấu; không gọi là chè thuần đậu xanh nếu bỏ qua thành phần dừa trong mô tả.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- FavoriteRecipes: 6 records.
INSERT INTO "FavoriteRecipes" ("userId", "recipeId", "personalNotes", "createdAt", "updatedAt") VALUES
  (3, 1, E'Canh chua cho bữa cơm sum họp cuối tuần.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (4, 2, E'Kho lửa nhỏ để thịt mềm và trứng thấm.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (2, 6, E'Chuẩn bị đồ chua trước khi nướng chả.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (2, 14, E'Ướp gà từ buổi sáng cho bữa tối.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (3, 19, E'Món chay cho ngày đổi vị.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (4, 11, E'Nhớ chan nước nhân xâm xấp.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- RecipeLists: 6 records.
INSERT INTO "RecipeLists" ("id", "userId", "listName", "createdAt", "updatedAt") VALUES
  (1, 3, E'Bữa cơm sum họp cuối tuần', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (2, 2, E'Bữa trưa nhanh gọn', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (3, 4, E'Cuối tuần đổi món miền Trung', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (4, 3, E'Bữa cơm chay gia đình', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (5, 4, E'Món riêng Đức muốn nấu', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (6, 3, E'Bổ sung món chay cho ngày mai', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- RecipeListItems: 12 records.
INSERT INTO "RecipeListItems" ("id", "recipeListId", "recipeId", "targetServings", "createdAt", "updatedAt") VALUES
  (1, 1, 1, 6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (2, 1, 2, 6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (3, 2, 4, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (4, 2, 21, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (5, 2, 22, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (6, 3, 11, 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (7, 3, 13, 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (8, 4, 19, 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (9, 4, 24, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (10, 5, 25, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (11, 5, 26, 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (12, 6, 19, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ShoppingLists: 2 records.
INSERT INTO "ShoppingLists" ("id", "userId", "title", "status", "createdAt", "updatedAt") VALUES
  (1, 3, E'Đi chợ cho bữa cơm cuối tuần', E'In_Progress', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (2, 3, E'Đi chợ hai bữa chay', E'Completed', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ShoppingListRecipeLists: 3 records.
INSERT INTO "ShoppingListRecipeLists" ("shoppingListId", "recipeListId") VALUES
  (1, 1),
  (2, 4),
  (2, 6);

-- ShoppingListItems: 36 records.
INSERT INTO "ShoppingListItems" ("id", "shoppingListId", "ingredientId", "itemName", "totalQuantity", "unit", "isPurchased", "createdAt", "updatedAt") VALUES
  (1, 1, 7, E'Cá lóc (cá quả)', 900, E'g', FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (2, 1, 19, E'Cà chua', 300, E'g', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (3, 1, 20, E'Dứa (thơm)', 225, E'g', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (4, 1, 21, E'Đậu bắp', 150, E'g', FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (5, 1, 22, E'Bạc hà (dọc mùng)', 150, E'g', FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (6, 1, 18, E'Giá đỗ', 150, E'g', FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (7, 1, 42, E'Me chua chín', 45, E'g', FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (8, 1, 16, E'Rau ngổ (ngò om)', 15, E'g', FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (9, 1, 28, E'Tỏi khô', 30, E'g', FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (10, 1, 32, E'Ớt hiểm', 4.5, E'g', FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (11, 1, 34, E'Nước mắm truyền thống', 112.5, E'ml', FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (12, 1, 37, E'Đường cát trắng', 67.5, E'g', FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (13, 1, 36, E'Muối tinh', 4.5, E'g', FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (14, 1, 39, E'Dầu ăn', 37.5, E'ml', FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (15, 1, 53, E'Nước lọc', 2550, E'ml', FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (16, 1, 1, E'Thịt ba chỉ heo', 900, E'g', FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (17, 1, 11, E'Trứng cút', 24, E'quả', FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (18, 1, 43, E'Nước dừa tươi', 900, E'ml', FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (19, 1, 29, E'Hành tím', 30, E'g', FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (20, 1, 38, E'Tiêu đen xay', 1.5, E'g', FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (21, 1, NULL, E'Nước rửa chén', 1, E'chai', FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (22, 2, 12, E'Đậu phụ trắng', 1200, E'g', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (23, 2, 26, E'Nấm rơm', 225, E'g', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (24, 2, 96, E'Nấm đùi gà', 225, E'g', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (25, 2, 97, E'Nấm bào ngư', 150, E'g', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (26, 2, 28, E'Tỏi khô', 15, E'g', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (27, 2, 41, E'Nước tương (xì dầu)', 60, E'ml', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (28, 2, 37, E'Đường cát trắng', 23, E'g', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (29, 2, 36, E'Muối tinh', 5, E'g', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (30, 2, 38, E'Tiêu đen xay', 1.5, E'g', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (31, 2, 39, E'Dầu ăn', 95, E'ml', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (32, 2, 14, E'Hành lá', 45, E'g', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (33, 2, 53, E'Nước lọc', 600, E'ml', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (34, 2, 19, E'Cà chua', 300, E'g', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (35, 2, 29, E'Hành tím', 15, E'g', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (36, 2, 103, E'Nước mắm chay', 20, E'ml', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

DO $seed_counts$
BEGIN
  IF (SELECT COUNT(*) FROM "Users") <> 4 THEN
    RAISE EXCEPTION 'Unexpected seed count: Users';
  END IF;
  IF (SELECT COUNT(*) FROM "Categories") <> 22 THEN
    RAISE EXCEPTION 'Unexpected seed count: Categories';
  END IF;
  IF (SELECT COUNT(*) FROM "IngredientCategories") <> 13 THEN
    RAISE EXCEPTION 'Unexpected seed count: IngredientCategories';
  END IF;
  IF (SELECT COUNT(*) FROM "Units") <> 29 THEN
    RAISE EXCEPTION 'Unexpected seed count: Units';
  END IF;
  IF (SELECT COUNT(*) FROM "Ingredients") <> 103 THEN
    RAISE EXCEPTION 'Unexpected seed count: Ingredients';
  END IF;
  IF (SELECT COUNT(*) FROM "Recipes") <> 26 THEN
    RAISE EXCEPTION 'Unexpected seed count: Recipes';
  END IF;
  IF (SELECT COUNT(*) FROM "RecipeCategories") <> 80 THEN
    RAISE EXCEPTION 'Unexpected seed count: RecipeCategories';
  END IF;
  IF (SELECT COUNT(*) FROM "RecipeIngredients") <> 337 THEN
    RAISE EXCEPTION 'Unexpected seed count: RecipeIngredients';
  END IF;
  IF (SELECT COUNT(*) FROM "CookingSteps") <> 134 THEN
    RAISE EXCEPTION 'Unexpected seed count: CookingSteps';
  END IF;
  IF (SELECT COUNT(*) FROM "FavoriteRecipes") <> 6 THEN
    RAISE EXCEPTION 'Unexpected seed count: FavoriteRecipes';
  END IF;
  IF (SELECT COUNT(*) FROM "RecipeLists") <> 6 THEN
    RAISE EXCEPTION 'Unexpected seed count: RecipeLists';
  END IF;
  IF (SELECT COUNT(*) FROM "RecipeListItems") <> 12 THEN
    RAISE EXCEPTION 'Unexpected seed count: RecipeListItems';
  END IF;
  IF (SELECT COUNT(*) FROM "ShoppingLists") <> 2 THEN
    RAISE EXCEPTION 'Unexpected seed count: ShoppingLists';
  END IF;
  IF (SELECT COUNT(*) FROM "ShoppingListRecipeLists") <> 3 THEN
    RAISE EXCEPTION 'Unexpected seed count: ShoppingListRecipeLists';
  END IF;
  IF (SELECT COUNT(*) FROM "ShoppingListItems") <> 36 THEN
    RAISE EXCEPTION 'Unexpected seed count: ShoppingListItems';
  END IF;
END;
$seed_counts$;

-- Align serial sequences after explicit IDs.
SELECT setval(pg_get_serial_sequence('"Users"', 'id'), MAX("id"), TRUE) FROM "Users";
SELECT setval(pg_get_serial_sequence('"Categories"', 'id'), MAX("id"), TRUE) FROM "Categories";
SELECT setval(pg_get_serial_sequence('"IngredientCategories"', 'id'), MAX("id"), TRUE) FROM "IngredientCategories";
SELECT setval(pg_get_serial_sequence('"Units"', 'id'), MAX("id"), TRUE) FROM "Units";
SELECT setval(pg_get_serial_sequence('"Ingredients"', 'id'), MAX("id"), TRUE) FROM "Ingredients";
SELECT setval(pg_get_serial_sequence('"Recipes"', 'id'), MAX("id"), TRUE) FROM "Recipes";
SELECT setval(pg_get_serial_sequence('"RecipeIngredients"', 'id'), MAX("id"), TRUE) FROM "RecipeIngredients";
SELECT setval(pg_get_serial_sequence('"CookingSteps"', 'id'), MAX("id"), TRUE) FROM "CookingSteps";
SELECT setval(pg_get_serial_sequence('"RecipeLists"', 'id'), MAX("id"), TRUE) FROM "RecipeLists";
SELECT setval(pg_get_serial_sequence('"RecipeListItems"', 'id'), MAX("id"), TRUE) FROM "RecipeListItems";
SELECT setval(pg_get_serial_sequence('"ShoppingLists"', 'id'), MAX("id"), TRUE) FROM "ShoppingLists";
SELECT setval(pg_get_serial_sequence('"ShoppingListItems"', 'id'), MAX("id"), TRUE) FROM "ShoppingListItems";

COMMIT;

-- Verification: one count per seeded table.
SELECT 'Users' AS table_name, COUNT(*) AS row_count FROM "Users"
UNION ALL
SELECT 'Categories' AS table_name, COUNT(*) AS row_count FROM "Categories"
UNION ALL
SELECT 'IngredientCategories' AS table_name, COUNT(*) AS row_count FROM "IngredientCategories"
UNION ALL
SELECT 'Units' AS table_name, COUNT(*) AS row_count FROM "Units"
UNION ALL
SELECT 'Ingredients' AS table_name, COUNT(*) AS row_count FROM "Ingredients"
UNION ALL
SELECT 'Recipes' AS table_name, COUNT(*) AS row_count FROM "Recipes"
UNION ALL
SELECT 'RecipeCategories' AS table_name, COUNT(*) AS row_count FROM "RecipeCategories"
UNION ALL
SELECT 'RecipeIngredients' AS table_name, COUNT(*) AS row_count FROM "RecipeIngredients"
UNION ALL
SELECT 'CookingSteps' AS table_name, COUNT(*) AS row_count FROM "CookingSteps"
UNION ALL
SELECT 'FavoriteRecipes' AS table_name, COUNT(*) AS row_count FROM "FavoriteRecipes"
UNION ALL
SELECT 'RecipeLists' AS table_name, COUNT(*) AS row_count FROM "RecipeLists"
UNION ALL
SELECT 'RecipeListItems' AS table_name, COUNT(*) AS row_count FROM "RecipeListItems"
UNION ALL
SELECT 'ShoppingLists' AS table_name, COUNT(*) AS row_count FROM "ShoppingLists"
UNION ALL
SELECT 'ShoppingListRecipeLists' AS table_name, COUNT(*) AS row_count FROM "ShoppingListRecipeLists"
UNION ALL
SELECT 'ShoppingListItems' AS table_name, COUNT(*) AS row_count FROM "ShoppingListItems";
