import db from "../models/index";

// Hàm đảm bảo một công thức của NGƯỜI DÙNG khi công khai và được duyệt sẽ có danh mục "Đóng góp của cộng đồng"
// (Công thức do Admin tạo là công thức chuẩn của hệ thống, không đưa vào danh mục này)
const ensureCommunityCategory = async (recipeId, transaction = null) => {
  try {
    const recipe = await db.Recipe.findByPk(recipeId, {
      include: [
        {
          model: db.User,
          as: "author",
          attributes: ["id", "role"],
        },
      ],
      transaction,
    });

    // Nếu không tìm thấy hoặc tác giả là Admin -> Không đưa vào "Đóng góp của cộng đồng"
    if (!recipe || (recipe.author && recipe.author.role === "Admin")) {
      return;
    }

    let communityCat = await db.Category.findOne({
      where: { categoryName: "Đóng góp của cộng đồng" },
      transaction,
    });
    if (!communityCat) {
      communityCat = await db.Category.create(
        { categoryName: "Đóng góp của cộng đồng", createdBy: null },
        { transaction },
      );
    }
    if (communityCat) {
      await db.RecipeCategory.findOrCreate({
        where: {
          recipeId: recipeId,
          categoryId: communityCat.id,
        },
        defaults: {
          recipeId: recipeId,
          categoryId: communityCat.id,
        },
        transaction,
      });
    }
  } catch (err) {
    console.log("ensureCommunityCategory error:", err);
    throw err;
  }
};

export { ensureCommunityCategory };
