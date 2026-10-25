import db from "../models/index";
import { Op } from "sequelize";
import { validateLockedReferences, isPositiveInteger, systemIngredientUnitError, cookingStepsError, ingredientQuantityError } from "./recipeValidation";
import { getRecipes } from "./recipeSearchService";
import { getRecipeById, scaleRecipeIngredients, getMyRecipes } from "./recipeReadService";
import { ensureCommunityCategory } from "./recipeCategoryService";
import { adminGetRecipes, adminUpdateRecipe, adminDeleteRecipe, adminGetPendingRecipes, moderateRecipe } from "./recipeAdminService";

// 4.4 POST /api/v1/recipes - Người dùng tạo công thức mới (UC-08)
const createRecipe = async (user, data = {}, isAdminCreate = false) => {
  try {
    const authorId = user ? user.id || user.userId : null;
    if (!authorId) {
      return {
        EC: 5,
        EM: "Chưa xác thực hoặc phiên đăng nhập đã hết hạn!",
        DT: null,
      };
    }

    const {
      title,
      description,
      thumbnailUrl,
      cookTimeMinutes,
      difficulty,
      defaultServings,
      isPublic,
      categoryIds,
      categories,
      ingredients,
      steps,
      cookingSteps,
    } = data;

    // 1. Kiểm tra nguyên liệu và các bước làm (Ít nhất 1 nguyên liệu và 1 bước làm)
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

    // 2. Kiểm tra các trường bắt buộc khác
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

    // Ảnh đại diện (thumbnailUrl) là không bắt buộc
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

    // Kiểm tra danh mục hợp lệ: chỉ cho phép danh mục hệ thống hoặc danh mục do chính user này tạo
    const validCategories = await db.Category.findAll({
      where: {
        id: { [Op.in]: catList },
        [Op.or]: [{ createdBy: null }, { createdBy: authorId }],
      },
      attributes: ["id", "categoryName", "createdBy"],
    });

    if (validCategories.length !== catList.length) {
      return {
        EC: 1,
        EM: "Danh mục không hợp lệ hoặc bạn không có quyền sử dụng danh mục của người khác!",
        DT: null,
      };
    }

    // Kiểm tra và chuẩn hóa từng nguyên liệu
    const processedIngredients = [];
    for (let i = 0; i < ingredients.length; i++) {
      const ing = ingredients[i];
      // TH 1: Người dùng chọn nguyên liệu của hệ thống (có ingredientId)
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
      // TH 2: Người dùng tự gõ tay nguyên liệu ngoài hệ thống (customIngredientName)
      else if (
        ing.customIngredientName &&
        String(ing.customIngredientName).trim()
      ) {
        let customIngName = String(ing.customIngredientName).trim();
        let unitId = null;
        let customUnit = null;
        let unitName = "";

        // Có thể chọn đơn vị đo của hệ thống (unitId)
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
        }
        // Hoặc tự gõ tay đơn vị ngoài hệ thống (customUnit)
        else if (ing.customUnit && String(ing.customUnit).trim()) {
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

    // Kiểm tra từng bước làm
    const stepsError = cookingStepsError(stepsList);
    if (stepsError) return stepsError;

    // FE: Khi user.role === "Admin", tạo qua chức năng cá nhân (isAdminCreate = false)
    // và chọn isPublic = true, hiển thị xác nhận TRƯỚC khi gọi API:
    // "Chú ý: bạn đang là tài khoản quản trị viên, khi công thức này được phê duyệt ra hệ thống thì sẽ trở thành công thức chuẩn của hệ thống. Bạn có chắc chắn không?"
    // Chỉ gửi yêu cầu khi người dùng xác nhận. API cá nhân vẫn lưu Pending;
    // chỉ luồng tạo công thức chuẩn qua API quản trị mới duyệt ngay.
    // Xác định trạng thái duyệt dựa trên isPublic (hoặc isAdminCreate)
    const isPub = isAdminCreate
      ? true
      : isPublic === true || isPublic === "true";
    const approvalStatus = isAdminCreate
      ? "Approved"
      : isPub
        ? "Pending"
        : "Approved";

    // 3. Thực hiện lưu vào CSDL với transaction
    const t = await db.sequelize.transaction({ isolationLevel: "READ COMMITTED" });
    try {
      const referenceError = await validateLockedReferences(t, catList, processedIngredients);
      if (referenceError) {
        await t.rollback();
        return referenceError;
      }
      const newRecipe = await db.Recipe.create(
        {
          authorId: authorId,
          title: String(title).trim(),
          description: String(description).trim(),
          thumbnailUrl: thumb,
          cookTimeMinutes: Number(cookTimeMinutes),
          difficulty: matchedDifficulty,
          defaultServings: Number(defaultServings),
          isPublic: isPub,
          approvalStatus: approvalStatus,
          isDeleted: false,
        },
        { transaction: t },
      );

      // Thêm danh mục RecipeCategories
      const recipeCategoriesData = catList.map((catId) => ({
        recipeId: newRecipe.id,
        categoryId: Number(catId),
      }));
      await db.RecipeCategory.bulkCreate(recipeCategoriesData, {
        transaction: t,
      });

      // Thêm nguyên liệu RecipeIngredients đã được chuẩn hóa
      const recipeIngredientsData = processedIngredients.map((ing) => ({
        recipeId: newRecipe.id,
        ingredientId: ing.ingredientId,
        customIngredientName: ing.customIngredientName,
        quantity: ing.quantity,
        unitId: ing.unitId,
        customUnit: ing.customUnit,
      }));
      await db.RecipeIngredient.bulkCreate(recipeIngredientsData, {
        transaction: t,
      });

      // Thêm các bước làm CookingSteps
      const cookingStepsData = stepsList.map((st, index) => ({
        recipeId: newRecipe.id,
        stepNumber:
          st.stepNumber !== undefined ? Number(st.stepNumber) : index + 1,
        instruction: String(st.instruction).trim(),
      }));
      await db.CookingStep.bulkCreate(cookingStepsData, { transaction: t });

      // Nếu là công thức công khai của NGƯỜI DÙNG thường và được duyệt, tự động gắn danh mục "Đóng góp của cộng đồng"
      // (Công thức của hệ thống do Admin tạo thì KHÔNG đưa vào "Đóng góp của cộng đồng")
      const isAuthorAdmin = user && user.role === "Admin";
      if (!isAuthorAdmin && isPub && approvalStatus === "Approved") {
        await ensureCommunityCategory(newRecipe.id, t);
      }

      await t.commit();

      return {
        EC: 0,
        EM: isAdminCreate
          ? "Tạo công thức chuẩn hệ thống thành công!"
          : isPub
            ? "Tạo công thức thành công! Đang chờ phê duyệt."
            : "Tạo công thức riêng tư thành công!",
        DT: {
          recipeId: newRecipe.id,
          approvalStatus: newRecipe.approvalStatus,
        },
      };
    } catch (dbError) {
      await t.rollback();
      console.log("createRecipe transaction error:", dbError);
      return {
        EC: -1,
        EM: "Lỗi kết nối máy chủ!",
        DT: null,
      };
    }
  } catch (e) {
    console.log("createRecipe error:", e);
    return {
      EC: -1,
      EM: "Lỗi kết nối máy chủ!",
      DT: null,
    };
  }
};

// 4.6 PUT /api/v1/recipes/{recipeId} - Sửa công thức cá nhân (UC-10)
const updateRecipe = async (recipeId, user, data) => {
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
    if (!rId || isNaN(rId) || rId <= 0) {
      return {
        EC: 1,
        EM: "ID công thức không hợp lệ!",
        DT: null,
      };
    }

    // Kiểm tra công thức tồn tại và chưa bị xóa mềm
    const recipe = await db.Recipe.findOne({
      where: {
        id: rId,
        isDeleted: false,
      },
    });

    if (!recipe) {
      return {
        EC: 3,
        EM: "Không tìm thấy công thức cần cập nhật!",
        DT: null,
      };
    }

    // Kiểm tra quyền: Phải là tác giả của công thức
    if (Number(recipe.authorId) !== Number(userId)) {
      return {
        EC: 4,
        EM: "Bạn không có quyền chỉnh sửa công thức này!",
        DT: null,
      };
    }

    // Chốt chặn bảo vệ: Nếu công thức đã ở chế độ công khai và đã được Quản trị viên phê duyệt (isPublic = true VÀ approvalStatus = 'Approved')
    if (recipe.isPublic && recipe.approvalStatus === "Approved") {
      return {
        EC: 4,
        EM: "Công thức này đã được duyệt công khai lên hệ thống, bạn không có quyền chỉnh sửa!",
        DT: null,
      };
    }

    const {
      title,
      description,
      thumbnailUrl,
      cookTimeMinutes,
      difficulty,
      defaultServings,
      isPublic,
      categoryIds,
      categories,
      ingredients,
      steps,
      cookingSteps,
    } = data;

    // 1. Kiểm tra nguyên liệu và các bước làm (Ít nhất 1 nguyên liệu và 1 bước làm)
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

    // 2. Kiểm tra tên công thức
    if (!title || !String(title).trim()) {
      return {
        EC: 1,
        EM: "Tên công thức không được để trống!",
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

    // Ảnh đại diện (thumbnailUrl) là không bắt buộc
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

    // Kiểm tra danh mục hợp lệ: chỉ cho phép danh mục hệ thống hoặc danh mục do chính user này tạo
    const validCategories = await db.Category.findAll({
      where: {
        id: { [Op.in]: catList },
        [Op.or]: [{ createdBy: null }, { createdBy: userId }],
      },
      attributes: ["id", "categoryName", "createdBy"],
    });

    if (validCategories.length !== catList.length) {
      return {
        EC: 1,
        EM: "Danh mục không hợp lệ hoặc bạn không có quyền sử dụng danh mục của người khác!",
        DT: null,
      };
    }

    // Kiểm tra và chuẩn hóa từng nguyên liệu
    const processedIngredients = [];
    for (let i = 0; i < ingredients.length; i++) {
      const ing = ingredients[i];
      // TH 1: Người dùng chọn nguyên liệu của hệ thống (có ingredientId)
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
          ingredientName: foundIng.ingredientName,
          customIngredientName: null,
          quantity: Number(ing.quantity),
          unitId,
          unit: unitName,
          customUnit,
        });
      }
      // TH 2: Người dùng tự gõ tay nguyên liệu ngoài hệ thống (customIngredientName)
      else if (
        ing.customIngredientName &&
        String(ing.customIngredientName).trim()
      ) {
        let customIngName = String(ing.customIngredientName).trim();
        let unitId = null;
        let unitName = "";
        let customUnit = null;

        // Có thể chọn đơn vị đo của hệ thống (unitId)
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
        }
        // Hoặc tự gõ tay đơn vị ngoài hệ thống (customUnit)
        else if (ing.customUnit && String(ing.customUnit).trim()) {
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
          ingredientName: customIngName,
          customIngredientName: customIngName,
          quantity: Number(ing.quantity),
          unitId: unitId,
          unit: unitName,
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

    // Kiểm tra từng bước làm
    const stepsError = cookingStepsError(stepsList);
    if (stepsError) return stepsError;

    // FE: Khi user.role === "Admin" và chọn gửi công thức cá nhân để duyệt
    // công khai (isPublic = true), hiển thị xác nhận TRƯỚC khi gọi API:
    // "Chú ý: bạn đang là tài khoản quản trị viên, khi công thức này được phê duyệt ra hệ thống thì sẽ trở thành công thức chuẩn của hệ thống. Bạn có chắc chắn không?"
    // Chỉ gửi yêu cầu khi người dùng xác nhận. Việc gửi công khai vẫn lưu Pending.
    // Xác định trạng thái duyệt dựa trên isPublic
    // - Nếu chọn công khai (isPublic = true), bài chuyển/giữ trạng thái 'Pending' để Quản trị viên duyệt.
    // - Nếu để riêng tư (isPublic = false), bài ở trạng thái 'Approved' (cá nhân).
    const isPub = isPublic === true || isPublic === "true";
    const approvalStatus = isPub ? "Pending" : "Approved";
    const successMessage = isPub
      ? "Cập nhật công thức và gửi yêu cầu phê duyệt thành công!"
      : "Cập nhật công thức riêng tư thành công!";

    // Thực hiện cập nhật vào CSDL với transaction
    const t = await db.sequelize.transaction({ isolationLevel: "READ COMMITTED" });
    try {
      const referenceError = await validateLockedReferences(t, catList, processedIngredients);
      if (referenceError) {
        await t.rollback();
        return referenceError;
      }
      await recipe.update(
        {
          title: String(title).trim(),
          description: String(description).trim(),
          thumbnailUrl: thumb,
          cookTimeMinutes: Number(cookTimeMinutes),
          difficulty: matchedDifficulty,
          defaultServings: Number(defaultServings),
          isPublic: isPub,
          approvalStatus: approvalStatus,
          rejectionReason: null,
        },
        { transaction: t },
      );

      // Cập nhật danh mục: Xóa liên kết cũ và thêm mới
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

      // Cập nhật nguyên liệu: Xóa nguyên liệu cũ và thêm mới
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

      // Cập nhật các bước làm: Xóa bước làm cũ và thêm mới
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
        EM: successMessage,
        DT: {
          recipeId: recipe.id,
          approvalStatus: approvalStatus,
        },
      };
    } catch (dbError) {
      await t.rollback();
      console.log("updateRecipe transaction error:", dbError);
      return {
        EC: -1,
        EM: "Lỗi kết nối máy chủ!",
        DT: null,
      };
    }
  } catch (e) {
    console.log("updateRecipe error:", e);
    return {
      EC: -1,
      EM: "Lỗi kết nối máy chủ!",
      DT: null,
    };
  }
};

// 4.7 DELETE /api/v1/recipes/{recipeId} - Xóa mềm công thức (UC-11)
const deleteRecipe = async (recipeId, user) => {
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
    if (!rId || isNaN(rId) || rId <= 0) {
      return {
        EC: 1,
        EM: "ID công thức không hợp lệ!",
        DT: null,
      };
    }

    const recipe = await db.Recipe.findOne({
      where: {
        id: rId,
        isDeleted: false,
      },
    });

    if (!recipe) {
      return {
        EC: 3,
        EM: "Không tìm thấy công thức cần xoá!",
        DT: null,
      };
    }

    // Kiểm tra quyền xóa: Phải là tác giả của công thức
    if (Number(recipe.authorId) !== Number(userId)) {
      return {
        EC: 4,
        EM: "Bạn không có quyền xóa công thức này!",
        DT: null,
      };
    }

    // Ràng buộc nghiệp vụ: Chỉ cho phép xóa đối với công thức riêng tư (isPublic = false).
    // Nếu công thức đã ở chế độ công khai (isPublic = true), từ chối xóa vì đã thuộc về hệ thống.
    if (recipe.isPublic) {
      return {
        EC: 4,
        EM: "Công thức đã công khai thuộc hệ thống, bạn không có quyền xóa!",
        DT: null,
      };
    }

    // Thực hiện xóa mềm: Đặt isDeleted = true
    await recipe.update({ isDeleted: true });

    return {
      EC: 0,
      EM: "Đã xóa công thức thành công!",
      DT: null,
    };
  } catch (e) {
    console.log("deleteRecipe error:", e);
    return {
      EC: -1,
      EM: "Lỗi kết nối máy chủ!",
      DT: null,
    };
  }
};

// 4.9 POST /api/v1/admin/recipes - Admin tạo công thức chuẩn hệ thống (UC-19)
const adminCreateRecipe = async (user, data) => {
  return await createRecipe(user, { ...data, isPublic: true }, true);
};

module.exports = {
  getRecipes,
  getRecipeById,
  scaleRecipeIngredients,
  createRecipe,
  getMyRecipes,
  ensureCommunityCategory,
  updateRecipe,
  deleteRecipe,
  adminGetRecipes,
  adminCreateRecipe,
  adminUpdateRecipe,
  adminDeleteRecipe,
  adminGetPendingRecipes,
  moderateRecipe,
};
