import db from "../models/index";
import { Op, Sequelize } from "sequelize";
import { lockMasterData } from "./unitService";
import { validateLockedReferences, isPositiveInteger, systemIngredientUnitError, cookingStepsError, ingredientQuantityError, hasVietnameseAccents } from "./recipeValidation";
import { ensureCommunityCategory } from "./recipeCategoryService";

const isAdminRecipeId = (value) =>
  (typeof value === "number" || (typeof value === "string" && /^\d+$/.test(value))) &&
  Number.isSafeInteger(Number(value)) && Number(value) > 0;

// Chỉ khóa bảng Recipes: author được LEFT JOIN nên không khóa phía nullable.
const lockAdminRecipe = (recipeId, transaction) => db.Recipe.findOne({
  where: { id: recipeId, isDeleted: false },
  include: [{ model: db.User, as: "author", attributes: ["id", "username", "role"] }],
  transaction,
  lock: { level: "UPDATE", of: db.Recipe },
});

const adminRecipeChanged = (recipe, previousUpdatedAt) =>
  recipe.updatedAt === undefined && previousUpdatedAt === undefined
    ? false
    : new Date(recipe.updatedAt).getTime() !== new Date(previousUpdatedAt).getTime();

const adminRecipeConflict = () => ({
  EC: 2,
  EM: "Công thức đã thay đổi trong lúc xử lý, vui lòng tải lại và thử lại!",
  DT: null,
});

// 4.8 GET /api/v1/admin/recipes (UC-19: Admin xem danh sách công thức chuẩn hệ thống)
const adminGetRecipes = async (query = {}) => {
  try {
    const { keyword, search, scope } = query;
    for (const [name, value] of Object.entries({ keyword, search })) {
      if (value !== undefined && typeof value !== "string") {
        return { EC: 1, EM: `${name} phải là chuỗi!`, DT: null };
      }
    }

    // Theo đặc tả UC-19 (Bảng 3.20 - Quản lý công thức chuẩn hệ thống):
    // Công thức chuẩn: tác giả là Admin, công khai và đã được duyệt,
    // kể cả công thức Admin tạo qua chức năng cá nhân rồi được phê duyệt.
    // scope='all': công thức công khai đã duyệt của mọi tác giả.
    // Không dùng query.status để ghi đè Approved; bài chờ duyệt có API riêng.
    const whereClause = {
      isDeleted: false,
      isPublic: true,
      approvalStatus: "Approved",
    };

    if (scope !== "all") {
      whereClause[Op.and] = [
        Sequelize.where(Sequelize.col("author.role"), "Admin"),
      ];
    }

    // Lọc theo từ khóa tìm kiếm theo tên món ăn
    const kw = (keyword || search || "").trim();
    if (kw) {
      const isAccented = hasVietnameseAccents(kw);
      const titleCondition = isAccented
        ? { title: { [Op.iLike]: `%${kw}%` } }
        : Sequelize.where(
            Sequelize.fn("unaccent", Sequelize.col("Recipe.title")),
            { [Op.iLike]: Sequelize.fn("unaccent", `%${kw}%`) },
          );
      whereClause[Op.and] = whereClause[Op.and] || [];
      whereClause[Op.and].push(titleCondition);
    }

    const recipes = await db.Recipe.findAll({
      where: whereClause,
      include: [
        {
          model: db.User,
          as: "author",
          attributes: ["id", "username", "role"],
        },
      ],
      order: [["id", "ASC"]],
    });

    const formatted = recipes.map((r) => ({
      recipeId: r.id,
      title: r.title,
      thumbnailUrl: r.thumbnailUrl,
      cookTimeMinutes: r.cookTimeMinutes,
      difficulty: r.difficulty,
      defaultServings: r.defaultServings,
      authorName: r.author ? r.author.username : "",
      isPublic: r.isPublic,
      approvalStatus: r.approvalStatus,
    }));

    return {
      EC: 0,
      EM: "Thành công!",
      DT: {
        total: formatted.length,
        recipes: formatted,
      },
    };
  } catch (e) {
    console.log("adminGetRecipes error:", e);
    return {
      EC: -1,
      EM: "Lỗi kết nối máy chủ!",
      DT: null,
    };
  }
};

// 4.10 PUT /api/v1/admin/recipes/{recipeId} - Admin sửa công thức chuẩn hệ thống (UC-19)
const adminUpdateRecipe = async (recipeId, user, data) => {
  try {
    const userId = user ? user.id || user.userId : null;
    if (!userId) {
      return {
        EC: 5,
        EM: "Chưa xác thực hoặc phiên đăng nhập đã hết hạn!",
        DT: null,
      };
    }

    const rId = Number(recipeId);
    if (!isAdminRecipeId(recipeId)) {
      return {
        EC: 1,
        EM: "ID công thức không hợp lệ!",
        DT: null,
      };
    }

    // 1. Kiểm tra công thức tồn tại và chưa bị xóa mềm
    const recipe = await db.Recipe.findOne({
      where: {
        id: rId,
        isDeleted: false,
      },
      include: [
        {
          model: db.User,
          as: "author",
          attributes: ["id", "username", "role"],
        },
      ],
    });

    if (!recipe) {
      return {
        EC: 3,
        EM: "Không tìm thấy công thức cần cập nhật!",
        DT: null,
      };
    }

    // 2. Chỉ sửa công thức chuẩn hệ thống qua API quản trị.
    // Công thức cá nhân hoặc chờ duyệt phải đi qua luồng cá nhân/kiểm duyệt.
    const isSystemRecipe =
      recipe.author?.role === "Admin" &&
      recipe.isPublic &&
      recipe.approvalStatus === "Approved";

    if (!isSystemRecipe) {
      return {
        EC: 4,
        EM: "Bạn chỉ có thể chỉnh sửa công thức chuẩn hệ thống đã được duyệt!",
        DT: null,
      };
    }

    const previousUpdatedAt = recipe.updatedAt;

    const {
      title,
      description,
      thumbnailUrl,
      cookTimeMinutes,
      difficulty,
      defaultServings,
      categoryIds,
      categories,
      ingredients,
      steps,
      cookingSteps,
    } = data;

    // 3. Kiểm tra nguyên liệu và các bước làm (Ít nhất 1 nguyên liệu và 1 bước làm)
    const stepsList = steps || cookingSteps;
    if (
      !ingredients ||
      !Array.isArray(ingredients) ||
      ingredients.length === 0 ||
      !stepsList ||
      !Array.isArray(stepsList) ||
      stepsList.length === 0
    ) {
      return {
        EC: 1,
        EM: "Công thức phải có ít nhất 1 nguyên liệu và 1 bước làm!",
        DT: null,
      };
    }

    // 4. Kiểm tra các trường thông tin cơ bản
    if (!title || !String(title).trim()) {
      return {
        EC: 1,
        EM: "Tiêu đề công thức không được để trống!",
        DT: null,
      };
    }

    if (!description || !String(description).trim()) {
      return {
        EC: 1,
        EM: "Mô tả công thức không được để trống!",
        DT: null,
      };
    }

    const thumb =
      thumbnailUrl && String(thumbnailUrl).trim()
        ? String(thumbnailUrl).trim()
        : null;

    if (
      cookTimeMinutes === undefined ||
      cookTimeMinutes === null ||
      !isPositiveInteger(cookTimeMinutes)
    ) {
      return {
        EC: 1,
        EM: "Thời gian nấu phải là số nguyên dương!",
        DT: null,
      };
    }

    const validDifficulties = ["Easy", "Medium", "Hard"];
    let matchedDifficulty = validDifficulties.find(
      (d) =>
        d.toLowerCase() ===
        String(difficulty || "")
          .trim()
          .toLowerCase(),
    );
    if (!matchedDifficulty) {
      return {
        EC: 1,
        EM: "Độ khó không hợp lệ (Chỉ nhận Easy, Medium, Hard)!",
        DT: null,
      };
    }

    if (
      defaultServings === undefined ||
      defaultServings === null ||
      !isPositiveInteger(defaultServings)
    ) {
      return {
        EC: 1,
        EM: "Khẩu phần mặc định phải là số nguyên dương!",
        DT: null,
      };
    }

    const catList = categoryIds || categories;
    if (!catList || !Array.isArray(catList) || catList.length === 0) {
      return {
        EC: 1,
        EM: "Công thức phải thuộc ít nhất 1 danh mục!",
        DT: null,
      };
    }

    // Kiểm tra danh mục hợp lệ trong hệ thống
    const validCategories = await db.Category.findAll({
      where: {
        id: { [Op.in]: catList },
      },
      attributes: ["id", "categoryName"],
    });

    if (validCategories.length !== catList.length) {
      return {
        EC: 1,
        EM: "Danh mục không hợp lệ hoặc không tồn tại trong hệ thống!",
        DT: null,
      };
    }

    // 5. Kiểm tra và chuẩn hóa từng nguyên liệu
    const processedIngredients = [];
    for (let i = 0; i < ingredients.length; i++) {
      const ing = ingredients[i];
      // TH 1: Chọn nguyên liệu của hệ thống (có ingredientId)
      if (ing.ingredientId) {
        const foundIng = await db.Ingredient.findByPk(
          Number(ing.ingredientId),
          {
            include: [
              {
                model: db.Unit,
                as: "defaultUnit",
                attributes: ["id", "unitName"],
              },
            ],
          },
        );
        if (!foundIng) {
          return {
            EC: 1,
            EM: `Nguyên liệu hệ thống với ID ${ing.ingredientId} không tồn tại!`,
            DT: null,
          };
        }

        const unitError = systemIngredientUnitError(foundIng, ing);
        if (unitError) return unitError;

        const unitId = foundIng.defaultUnitId;
        const customUnit = null;
        let unitName = foundIng.defaultUnit?.unitName || "";
        if (Number(ing.quantity) === 0 && !unitName && unitId) {
          unitName = (await db.Unit.findByPk(unitId))?.unitName || "";
        }
        const quantityError = ingredientQuantityError(
          ing.quantity,
          unitName,
          i + 1,
        );
        if (quantityError) return quantityError;

        processedIngredients.push({
          ingredientId: foundIng.id,
          customIngredientName: null,
          quantity: Number(ing.quantity),
          unitId,
          customUnit,
        });
      }
      // TH 2: Tự gõ tay nguyên liệu ngoài hệ thống (customIngredientName)
      else if (
        ing.customIngredientName &&
        String(ing.customIngredientName).trim()
      ) {
        let customIngName = String(ing.customIngredientName).trim();
        let unitId = null;
        let customUnit = null;
        let unitName = "";

        if (ing.unitId) {
          const foundUnit = await db.Unit.findByPk(Number(ing.unitId));
          if (!foundUnit) {
            return {
              EC: 1,
              EM: `Đơn vị đo hệ thống với ID ${ing.unitId} không tồn tại!`,
              DT: null,
            };
          }
          unitId = foundUnit.id;
          unitName = foundUnit.unitName;
        } else if (ing.customUnit && String(ing.customUnit).trim()) {
          customUnit = String(ing.customUnit).trim();
          unitName = customUnit;
        } else {
          return {
            EC: 1,
            EM: `Nguyên liệu tự nhập "${customIngName}" phải chọn đơn vị hệ thống hoặc tự nhập đơn vị!`,
            DT: null,
          };
        }

        const quantityError = ingredientQuantityError(
          ing.quantity,
          unitName,
          i + 1,
        );
        if (quantityError) return quantityError;

        processedIngredients.push({
          ingredientId: null,
          customIngredientName: customIngName,
          quantity: Number(ing.quantity),
          unitId: unitId,
          customUnit: customUnit,
        });
      } else {
        return {
          EC: 1,
          EM: `Nguyên liệu ở vị trí ${i + 1} phải chọn từ hệ thống hoặc tự nhập tên nguyên liệu!`,
          DT: null,
        };
      }
    }

    // 6. Kiểm tra từng bước làm
    const stepsError = cookingStepsError(stepsList);
    if (stepsError) return stepsError;

    // 7. Thực hiện cập nhật với Transaction (Công thức chuẩn luôn isPublic = true, approvalStatus = 'Approved')
    const t = await db.sequelize.transaction({ isolationLevel: "READ COMMITTED" });
    try {
      const referenceError = await validateLockedReferences(t, catList, processedIngredients);
      if (referenceError) {
        await t.rollback();
        return referenceError;
      }
      const lockedRecipe = await lockAdminRecipe(rId, t);
      if (!lockedRecipe) {
        await t.rollback();
        return { EC: 3, EM: "Không tìm thấy công thức cần cập nhật!", DT: null };
      }
      if (lockedRecipe.author?.role !== "Admin" || !lockedRecipe.isPublic || lockedRecipe.approvalStatus !== "Approved") {
        await t.rollback();
        return { EC: 4, EM: "Bạn chỉ có thể chỉnh sửa công thức chuẩn hệ thống đã được duyệt!", DT: null };
      }
      if (adminRecipeChanged(lockedRecipe, previousUpdatedAt)) {
        await t.rollback();
        return adminRecipeConflict();
      }
      await lockedRecipe.update(
        {
          title: String(title).trim(),
          description: String(description).trim(),
          thumbnailUrl: thumb,
          cookTimeMinutes: Number(cookTimeMinutes),
          difficulty: matchedDifficulty,
          defaultServings: Number(defaultServings),
          isPublic: true,
          approvalStatus: "Approved",
          rejectionReason: null,
        },
        { transaction: t },
      );

      // Cập nhật danh mục
      await db.RecipeCategory.destroy({
        where: { recipeId: rId },
        transaction: t,
      });

      const recipeCategoriesData = catList.map((catId) => ({
        recipeId: rId,
        categoryId: Number(catId),
      }));
      await db.RecipeCategory.bulkCreate(recipeCategoriesData, {
        transaction: t,
      });

      // Cập nhật nguyên liệu
      await db.RecipeIngredient.destroy({
        where: { recipeId: rId },
        transaction: t,
      });

      const recipeIngredientsData = processedIngredients.map((ing) => ({
        recipeId: rId,
        ingredientId: ing.ingredientId,
        customIngredientName: ing.customIngredientName,
        quantity: ing.quantity,
        unitId: ing.unitId,
        customUnit: ing.customUnit,
      }));
      await db.RecipeIngredient.bulkCreate(recipeIngredientsData, {
        transaction: t,
      });

      // Cập nhật các bước làm
      await db.CookingStep.destroy({
        where: { recipeId: rId },
        transaction: t,
      });

      const cookingStepsData = stepsList.map((st, index) => ({
        recipeId: rId,
        stepNumber:
          st.stepNumber !== undefined ? Number(st.stepNumber) : index + 1,
        instruction: String(st.instruction).trim(),
      }));
      await db.CookingStep.bulkCreate(cookingStepsData, { transaction: t });

      await t.commit();

      return {
        EC: 0,
        EM: "Cập nhật công thức chuẩn thành công!",
        DT: null,
      };
    } catch (dbError) {
      await t.rollback();
      console.log("adminUpdateRecipe transaction error:", dbError);
      return {
        EC: -1,
        EM: "Lỗi kết nối máy chủ!",
        DT: null,
      };
    }
  } catch (e) {
    console.log("adminUpdateRecipe error:", e);
    return {
      EC: -1,
      EM: "Lỗi kết nối máy chủ!",
      DT: null,
    };
  }
};

// 4.11 DELETE /api/v1/admin/recipes/{recipeId} - Admin xóa công thức chuẩn hệ thống (UC-19)
const adminDeleteRecipe = async (recipeId, user) => {
  try {
    const userId = user ? user.id || user.userId : null;
    if (!userId) {
      return {
        EC: 5,
        EM: "Chưa xác thực hoặc phiên đăng nhập đã hết hạn!",
        DT: null,
      };
    }

    const rId = Number(recipeId);
    if (!isAdminRecipeId(recipeId)) {
      return {
        EC: 1,
        EM: "ID công thức không hợp lệ!",
        DT: null,
      };
    }

    // 1. Kiểm tra công thức tồn tại và chưa bị xóa mềm
    const recipe = await db.Recipe.findOne({
      where: {
        id: rId,
        isDeleted: false,
      },
      include: [
        {
          model: db.User,
          as: "author",
          attributes: ["id", "username", "role"],
        },
      ],
    });

    if (!recipe) {
      return {
        EC: 3,
        EM: "Không tìm thấy công thức cần xoá!",
        DT: null,
      };
    }

    // 2. Xử lý xóa theo loại công thức:
    // Công thức riêng tư của cả User và Admin chỉ được xóa qua API cá nhân
    // với kiểm tra chủ sở hữu. API quản trị chỉ xóa công thức công khai đã duyệt.
    if (!recipe.isPublic) {
      return {
        EC: 4,
        EM: "Công thức này đang ở chế độ riêng tư của người dùng, Admin không thể thao tác!",
        DT: null,
      };
    }

    if (recipe.approvalStatus !== "Approved") {
      return {
        EC: 4,
        EM: "Admin chỉ được xóa công thức đã duyệt! Công thức chờ duyệt phải được xử lý qua chức năng kiểm duyệt.",
        DT: null,
      };
    }

    const previousUpdatedAt = recipe.updatedAt;
    const t = await db.sequelize.transaction({ isolationLevel: "READ COMMITTED" });
    try {
      // Giữ cùng thứ tự khóa với sửa công thức và kiểm duyệt để tránh deadlock.
      await lockMasterData(t);
      const lockedRecipe = await lockAdminRecipe(rId, t);
      if (!lockedRecipe) {
        await t.rollback();
        return { EC: 3, EM: "Không tìm thấy công thức cần xoá!", DT: null };
      }
      if (!lockedRecipe.isPublic || lockedRecipe.approvalStatus !== "Approved") {
        await t.rollback();
        return { EC: 4, EM: "Admin chỉ được xóa công thức công khai đã duyệt!", DT: null };
      }
      if (adminRecipeChanged(lockedRecipe, previousUpdatedAt)) {
        await t.rollback();
        return adminRecipeConflict();
      }
      await lockedRecipe.update({ isDeleted: true }, { transaction: t });
      await t.commit();
      return { EC: 0, EM: "Đã xóa mềm công thức thành công!", DT: null };
    } catch (error) {
      await t.rollback();
      throw error;
    }
  } catch (e) {
    console.log("adminDeleteRecipe error:", e);
    return {
      EC: -1,
      EM: "Lỗi kết nối máy chủ!",
      DT: null,
    };
  }
};

// 4.12 GET /api/v1/admin/recipes/pending - Xem danh sách công thức chờ duyệt (UC-20)
const adminGetPendingRecipes = async () => {
  try {
    const pendingRecipes = await db.Recipe.findAll({
      where: {
        isDeleted: false,
        isPublic: true,
        approvalStatus: "Pending",
      },
      include: [
        {
          model: db.User,
          as: "author",
          attributes: ["id", "username", "email", "role"],
        },
        {
          model: db.Category,
          as: "categories",
          attributes: ["id", "categoryName", "createdBy"],
          through: { attributes: [] },
        },
        {
          model: db.RecipeIngredient,
          as: "ingredients",
          include: [
            {
              model: db.Ingredient,
              as: "ingredient",
              attributes: ["id", "ingredientName"],
            },
            {
              model: db.Unit,
              as: "unitGroup",
              attributes: ["id", "unitName"],
            },
          ],
        },
        {
          model: db.CookingStep,
          as: "cookingSteps",
          attributes: ["id", "stepNumber", "instruction"],
        },
      ],
      order: [
        ["createdAt", "ASC"],
        [{ model: db.CookingStep, as: "cookingSteps" }, "stepNumber", "ASC"],
        [{ model: db.RecipeIngredient, as: "ingredients" }, "id", "ASC"],
      ],
    });

    const formatted = pendingRecipes.map((recipe) => {
      let formattedCategories = (recipe.categories || []).map((cat) => ({
        categoryId: cat.id,
        categoryName: cat.categoryName,
      }));

      let formattedIngredients = (recipe.ingredients || []).map((item) => ({
        ingredientId:
          item.ingredientId || (item.ingredient ? item.ingredient.id : null),
        ingredientName: item.ingredient
          ? item.ingredient.ingredientName
          : item.customIngredientName || "",
        quantity: Number(item.quantity),
        unitId: item.unitId || (item.unitGroup ? item.unitGroup.id : null),
        unit: item.unitGroup ? item.unitGroup.unitName : item.customUnit || "",
      }));

      let formattedSteps = (recipe.cookingSteps || []).map((step) => ({
        stepNumber: step.stepNumber,
        instruction: step.instruction,
      }));

      return {
        recipeId: recipe.id,
        title: recipe.title,
        description: recipe.description || "",
        thumbnailUrl: recipe.thumbnailUrl,
        cookTimeMinutes: recipe.cookTimeMinutes,
        difficulty: recipe.difficulty,
        defaultServings: recipe.defaultServings,
        isPublic: recipe.isPublic,
        approvalStatus: recipe.approvalStatus,
        authorId: recipe.authorId,
        authorName: recipe.author ? recipe.author.username : "",
        authorEmail: recipe.author ? recipe.author.email : "",
        categories: formattedCategories,
        ingredients: formattedIngredients,
        cookingSteps: formattedSteps,
        createdAt: recipe.createdAt,
      };
    });

    return {
      EC: 0,
      EM: "Thành công!",
      DT: formatted,
    };
  } catch (e) {
    console.log("adminGetPendingRecipes error:", e);
    return {
      EC: -1,
      EM: "Lỗi kết nối máy chủ!",
      DT: null,
    };
  }
};

// 4.13 PATCH /api/v1/admin/recipes/{recipeId}/moderation - Kiểm duyệt công thức (UC-20)
const moderateRecipe = async (recipeId, data = {}) => {
  try {
    const rId = Number(recipeId);
    if (!isPositiveInteger(recipeId) || !Number.isSafeInteger(rId)) {
      return {
        EC: 1,
        EM: "ID công thức không hợp lệ!",
        DT: null,
      };
    }

    if (!data || typeof data !== "object" || Array.isArray(data)) {
      return { EC: 1, EM: "Dữ liệu kiểm duyệt phải là một object!", DT: null };
    }

    // Giữ hỗ trợ action cho client cũ; approvalStatus được ưu tiên nếu có.
    const rawStatus = data.approvalStatus !== undefined ? data.approvalStatus : data.action;
    if (typeof rawStatus !== "string" || !/^(approved|rejected)$/i.test(rawStatus.trim())) {
      return {
        EC: 1,
        EM: "Trạng thái duyệt không hợp lệ (Chỉ chấp nhận 'Approved' hoặc 'Rejected')!",
        DT: null,
      };
    }
    const finalStatus = rawStatus.trim().toLowerCase() === "approved" ? "Approved" : "Rejected";
    if (finalStatus === "Rejected" &&
        (typeof data.rejectionReason !== "string" || !data.rejectionReason.trim())) {
      return { EC: 1, EM: "Vui lòng nhập lý do từ chối bài viết là chuỗi không rỗng!", DT: null };
    }

    // Khóa bản ghi đến khi commit: yêu cầu duyệt tiếp theo phải đọc trạng thái mới nhất.
    // Cập nhật trạng thái và danh mục cùng thành công hoặc cùng được hoàn tác.
    return await db.sequelize.transaction(async (transaction) => {
      await lockMasterData(transaction);
      const recipe = await db.Recipe.findOne({
        where: {
          id: rId,
          isDeleted: false,
        },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!recipe) {
        return {
          EC: 3,
          EM: "Không tìm thấy công thức cần duyệt!",
          DT: null,
        };
      }

      // Chỉ kiểm duyệt công thức đang ở chế độ công khai
      if (!recipe.isPublic) {
        return {
          EC: 1,
          EM: "Công thức không ở trạng thái công khai để kiểm duyệt!",
          DT: null,
        };
      }

      if (recipe.approvalStatus === "Rejected") {
        return {
          EC: 1,
          EM: "Công thức này đã bị từ chối trước đó!",
          DT: null,
        };
      }

      if (finalStatus === "Approved" && recipe.approvalStatus === "Approved") {
        return {
          EC: 1,
          EM: "Công thức này đã được phê duyệt trước đó!",
          DT: null,
        };
      }

      if (recipe.approvalStatus !== "Pending") {
        return {
          EC: 1,
          EM: recipe.approvalStatus === "Approved"
            ? "Không thể từ chối công thức đã được phê duyệt!"
            : "Công thức không ở trạng thái chờ duyệt!",
          DT: null,
        };
      }

      if (finalStatus === "Rejected") {
        const reason = data.rejectionReason.trim();
        await recipe.update({
          approvalStatus: "Rejected",
          rejectionReason: reason,
          isPublic: false,
        }, { transaction });

        return {
          EC: 0,
          EM: "Đã từ chối công thức bài viết thành công!",
          DT: {
            recipeId: recipe.id,
            approvalStatus: "Rejected",
            rejectionReason: reason,
          },
        };
      } else {
        await recipe.update({
          approvalStatus: "Approved",
          rejectionReason: null,
          isPublic: true,
        }, { transaction });

        // Gắn danh mục cộng đồng nếu tác giả không phải là Admin
        await ensureCommunityCategory(recipe.id, transaction);

        return {
          EC: 0,
          EM: "Phê duyệt công thức thành công!",
          DT: {
            recipeId: recipe.id,
            approvalStatus: "Approved",
            rejectionReason: null,
          },
        };
      }
    });
  } catch (e) {
    console.log("moderateRecipe error:", e);
    return {
      EC: -1,
      EM: "Lỗi kết nối máy chủ!",
      DT: null,
    };
  }
};

export { adminGetRecipes, adminUpdateRecipe, adminDeleteRecipe, adminGetPendingRecipes, moderateRecipe };
