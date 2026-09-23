import db from "../models/index";
import { Op, Sequelize } from "sequelize";

// Hàm kiểm tra chuỗi có chứa dấu tiếng Việt hay không
const hasVietnameseAccents = (str) => {
  return /[\u0300-\u036fàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(str);
};

// 4.1 GET /api/v1/recipes - Tìm kiếm / Lọc công thức (UC-06)
const getRecipes = async (query = {}) => {
  try {
    const {
      keyword,
      search,
      categoryId,
      ingredientId,
      difficulty,
      cookingTime,
      cookTime,
      maxCookTime,
      maxTime,
      page,
      limit,
      sortBy,
      sortOrder,
    } = query;

    let whereClause = {
      isPublic: true,
      approvalStatus: "Approved",
      isDeleted: false,
    };

    // 1. Phân trang: page & limit
    let pageNumber = 1;
    if (page !== undefined && page !== null && page !== "") {
      pageNumber = Number(page);
      if (!Number.isInteger(pageNumber) || pageNumber <= 0) {
        return {
          EC: 1,
          EM: "Tham số phân trang page hoặc limit không hợp lệ!",
          DT: null,
        };
      }
    }

    let limitNumber = 10;
    if (limit !== undefined && limit !== null && limit !== "") {
      limitNumber = Number(limit);
      if (!Number.isInteger(limitNumber) || limitNumber <= 0) {
        return {
          EC: 1,
          EM: "Tham số phân trang page hoặc limit không hợp lệ!",
          DT: null,
        };
      }
      if (limitNumber > 100) limitNumber = 100;
    }

    // 2. Sắp xếp: sortBy & sortOrder
    let orderCol = "createdAt";
    if (sortBy) {
      let cleanSortBy = typeof sortBy === "string" ? sortBy.trim() : `${sortBy}`.trim();
      if (cleanSortBy === "cookingTime" || cleanSortBy === "cookTime") cleanSortBy = "cookTimeMinutes";
      const allowedSortBy = ["createdAt", "cookTimeMinutes", "title"];
      if (!allowedSortBy.includes(cleanSortBy)) {
        return {
          EC: 1,
          EM: "Tham số sắp xếp không hợp lệ!",
          DT: null,
        };
      }
      orderCol = cleanSortBy;
    }

    let orderDir = "DESC";
    if (sortOrder) {
      let cleanSortOrder = (typeof sortOrder === "string" ? sortOrder.trim() : `${sortOrder}`.trim()).toUpperCase();
      if (!["ASC", "DESC"].includes(cleanSortOrder)) {
        return {
          EC: 1,
          EM: "Tham số sắp xếp không hợp lệ!",
          DT: null,
        };
      }
      orderDir = cleanSortOrder;
    }

    // 3. Kiểm tra và lọc theo độ khó (Easy, Medium, Hard)
    if (difficulty !== undefined && difficulty !== null && difficulty !== "") {
      const validDifficulties = ["Easy", "Medium", "Hard"];
      let matchedDifficulty = validDifficulties.find(
        (d) => d.toLowerCase() === difficulty.trim().toLowerCase()
      );
      if (!matchedDifficulty) {
        return {
          EC: 1,
          EM: "Độ khó không hợp lệ (Chỉ nhận Easy, Medium, Hard)!",
          DT: null,
        };
      }
      whereClause.difficulty = matchedDifficulty;
    }

    // 4. Lọc theo thời gian nấu tối đa (phút)
    let rawTime = cookingTime !== undefined ? cookingTime : (cookTime !== undefined ? cookTime : (maxCookTime !== undefined ? maxCookTime : maxTime));
    if (rawTime !== undefined && rawTime !== null && rawTime !== "") {
      let parsedTime = Number(rawTime);
      if (!Number.isInteger(parsedTime) || parsedTime <= 0) {
        return {
          EC: 1,
          EM: "Thời gian nấu phải là số nguyên dương lớn hơn 0!",
          DT: null,
        };
      }
      whereClause.cookTimeMinutes = { [Op.lte]: parsedTime };
    }

    // 5. Lọc theo từ khóa tìm kiếm (Tên món ăn hoặc Tên nguyên liệu)
    let kw = (keyword || search || "").trim();
    if (kw) {
      let isAccented = hasVietnameseAccents(kw);
      let titleCondition = isAccented
        ? { title: { [Op.iLike]: `%${kw}%` } }
        : Sequelize.where(
            Sequelize.fn("unaccent", Sequelize.col("Recipe.title")),
            { [Op.iLike]: Sequelize.fn("unaccent", `%${kw}%`) }
          );

      // Tìm các công thức có nguyên liệu chứa từ khóa
      let matchingIngs = await db.RecipeIngredient.findAll({
        attributes: ["recipeId"],
        include: [
          {
            model: db.Ingredient,
            as: "ingredient",
            required: false,
            attributes: ["ingredientName"],
          },
        ],
        where: {
          [Op.or]: [
            isAccented
              ? { customIngredientName: { [Op.iLike]: `%${kw}%` } }
              : Sequelize.where(
                  Sequelize.fn("unaccent", Sequelize.col("RecipeIngredient.customIngredientName")),
                  { [Op.iLike]: Sequelize.fn("unaccent", `%${kw}%`) }
                ),
            isAccented
              ? { "$ingredient.ingredientName$": { [Op.iLike]: `%${kw}%` } }
              : Sequelize.where(
                  Sequelize.fn("unaccent", Sequelize.col("ingredient.ingredientName")),
                  { [Op.iLike]: Sequelize.fn("unaccent", `%${kw}%`) }
                ),
          ],
        },
        raw: true,
      });

      let ingRecipeIds = matchingIngs.map((r) => r.recipeId);

      whereClause[Op.and] = whereClause[Op.and] || [];
      whereClause[Op.and].push({
        [Op.or]: [
          titleCondition,
          { id: { [Op.in]: ingRecipeIds } },
        ],
      });
    }

    // 6. Lọc theo danh mục món ăn
    if (categoryId !== undefined && categoryId !== null && categoryId !== "") {
      let catId = Number(categoryId);
      if (isNaN(catId) || !Number.isInteger(catId) || catId <= 0) {
        return {
          EC: 1,
          EM: "Danh mục không hợp lệ!",
          DT: null,
        };
      }
      let matchingCatRecipes = await db.RecipeCategory.findAll({
        where: { categoryId: catId },
        attributes: ["recipeId"],
        raw: true,
      });
      let catRecipeIds = matchingCatRecipes.map((r) => r.recipeId);
      whereClause[Op.and] = whereClause[Op.and] || [];
      whereClause[Op.and].push({ id: { [Op.in]: catRecipeIds } });
    }

    // 7. Lọc theo nguyên liệu (ingredientId)
    if (ingredientId !== undefined && ingredientId !== null && ingredientId !== "") {
      let ingId = Number(ingredientId);
      if (isNaN(ingId) || !Number.isInteger(ingId) || ingId <= 0) {
        return {
          EC: 1,
          EM: "Nguyên liệu không hợp lệ!",
          DT: null,
        };
      }
      let matchingIngRecipes = await db.RecipeIngredient.findAll({
        where: { ingredientId: ingId },
        attributes: ["recipeId"],
        raw: true,
      });
      let ingRecipeIds = matchingIngRecipes.map((r) => r.recipeId);
      whereClause[Op.and] = whereClause[Op.and] || [];
      whereClause[Op.and].push({ id: { [Op.in]: ingRecipeIds } });
    }

    // 8. Truy vấn cơ sở dữ liệu có phân trang và sắp xếp
    const offset = (pageNumber - 1) * limitNumber;
    const { count, rows: recipes } = await db.Recipe.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: db.User,
          as: "author",
          attributes: ["id", "username"],
        },
        {
          model: db.Category,
          as: "categories",
          attributes: ["id", "categoryName"],
          through: { attributes: [] },
        },
      ],
      order: [[orderCol, orderDir]],
      limit: limitNumber,
      offset: offset,
      distinct: true,
    });

    let formattedRecipes = recipes.map((recipe) => ({
      recipeId: recipe.id,
      title: recipe.title,
      thumbnailUrl: recipe.thumbnailUrl,
      cookTimeMinutes: recipe.cookTimeMinutes,
      difficulty: recipe.difficulty,
      defaultServings: recipe.defaultServings,
      authorName: recipe.author ? recipe.author.username : "",
      categories: (recipe.categories || []).map((cat) => ({
        categoryId: cat.id,
        categoryName: cat.categoryName,
      })),
    }));

    return {
      EC: 0,
      EM: "Lấy danh sách công thức thành công!",
      DT: {
        page: pageNumber,
        limit: limitNumber,
        total: count,
        totalPages: Math.ceil(count / limitNumber),
        recipes: formattedRecipes,
      },
    };
  } catch (e) {
    console.log("getRecipes error:", e);
    return {
      EC: -1,
      EM: "Lỗi kết nối máy chủ!",
      DT: null,
    };
  }
};

const getRecipeById = async (id, viewerId = null, viewerRole = null) => {
  try {
    let recipeId = Number(id);
    if (!recipeId || isNaN(recipeId) || recipeId <= 0) {
      return {
        EC: 3,
        EM: "Không tìm thấy công thức nấu ăn!",
        DT: null,
      };
    }

    const recipe = await db.Recipe.findOne({
      where: {
        id: recipeId,
        isDeleted: false,
      },
      include: [
        {
          model: db.User,
          as: "author",
          attributes: ["id", "username"],
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
        [{ model: db.CookingStep, as: "cookingSteps" }, "stepNumber", "ASC"],
        [{ model: db.RecipeIngredient, as: "ingredients" }, "id", "ASC"],
      ],
    });

    if (!recipe) {
      return {
        EC: 3,
        EM: "Không tìm thấy công thức nấu ăn!",
        DT: null,
      };
    }

    // Kiểm tra quyền xem (UC-07): Công thức riêng tư (isPublic = false) hoặc chưa duyệt (Pending/Rejected)
    // chỉ cho phép xem bởi chính tác giả hoặc Admin
    const isOwner = viewerId && Number(viewerId) === Number(recipe.authorId);
    const isAdmin = viewerRole === "Admin";
    if (!recipe.isPublic || recipe.approvalStatus !== "Approved") {
      if (!isOwner && !isAdmin) {
        return {
          EC: 3,
          EM: "Không tìm thấy công thức nấu ăn!",
          DT: null,
        };
      }
    }

    // Danh mục hệ thống thì ai cũng thấy; danh mục tự tạo chỉ hiện khi chính người tạo đăng nhập
    let formattedCategories = (recipe.categories || [])
      .filter((cat) => {
        if (cat.createdBy === null || cat.createdBy === undefined) {
          return true;
        }
        return viewerId && Number(viewerId) === Number(cat.createdBy);
      })
      .map((cat) => ({
        categoryId: cat.id,
        categoryName: cat.categoryName,
      }));

    let formattedIngredients = (recipe.ingredients || []).map((item) => ({
      ingredientId: item.ingredientId || (item.ingredient ? item.ingredient.id : null),
      ingredientName: item.ingredient
        ? item.ingredient.ingredientName
        : (item.customIngredientName || ""),
      quantity: Number(item.quantity),
      unitId: item.unitId || (item.unitGroup ? item.unitGroup.id : null),
      unit: item.unitGroup ? item.unitGroup.unitName : (item.customUnit || ""),
    }));

    let formattedSteps = (recipe.cookingSteps || []).map((step) => ({
      stepNumber: step.stepNumber,
      instruction: step.instruction,
    }));

    return {
      EC: 0,
      EM: "Thành công!",
      DT: {
        recipeId: recipe.id,
        title: recipe.title,
        description: recipe.description || "",
        thumbnailUrl: recipe.thumbnailUrl,
        cookTimeMinutes: recipe.cookTimeMinutes,
        difficulty: recipe.difficulty,
        defaultServings: recipe.defaultServings,
        authorName: recipe.author ? recipe.author.username : "",
        isPublic: recipe.isPublic,
        approvalStatus: recipe.approvalStatus,
        hasPendingUpdate: recipe.pendingUpdateData !== null,
        pendingUpdateData:
          (viewerId && Number(viewerId) === Number(recipe.authorId)) ||
          viewerRole === "Admin"
            ? recipe.pendingUpdateData
            : undefined,
        categories: formattedCategories,
        ingredients: formattedIngredients,
        steps: formattedSteps,
      },
    };
  } catch (e) {
    console.log("getRecipeById error:", e);
    return {
      EC: -1,
      EM: "Lỗi kết nối máy chủ!",
      DT: null,
    };
  }
};

const scaleRecipeIngredients = async (id, query = {}, viewerId = null, viewerRole = null) => {
  try {
    const rawServings = query.servings !== undefined ? query.servings : query.targetServings;
    const numServings = Number(rawServings);
    if (
      rawServings === undefined ||
      rawServings === null ||
      String(rawServings).trim() === "" ||
      isNaN(numServings) ||
      !Number.isInteger(numServings) ||
      numServings <= 0
    ) {
      return {
        EC: 1,
        EM: "Số khẩu phần ăn phải lớn hơn 0!",
        DT: null,
      };
    }

    let recipeId = Number(id);
    if (!recipeId || isNaN(recipeId) || recipeId <= 0) {
      return {
        EC: 3,
        EM: "Không tìm thấy công thức nấu ăn!",
        DT: null,
      };
    }

    const recipe = await db.Recipe.findOne({
      where: {
        id: recipeId,
        isDeleted: false,
      },
      include: [
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
      ],
      order: [
        [{ model: db.RecipeIngredient, as: "ingredients" }, "id", "ASC"],
      ],
    });

    if (!recipe) {
      return {
        EC: 3,
        EM: "Không tìm thấy công thức nấu ăn!",
        DT: null,
      };
    }

    // Kiểm tra quyền xem: Chỉ tính toán định lượng cho công thức công khai đã duyệt, hoặc chính tác giả / Admin
    const isOwner = viewerId && Number(viewerId) === Number(recipe.authorId);
    const isAdmin = viewerRole === "Admin";
    if (!recipe.isPublic || recipe.approvalStatus !== "Approved") {
      if (!isOwner && !isAdmin) {
        return {
          EC: 3,
          EM: "Không tìm thấy công thức nấu ăn!",
          DT: null,
        };
      }
    }

    let targetServings = numServings;
    let baseServings = Number(recipe.defaultServings) > 0 ? Number(recipe.defaultServings) : 1;
    let scaleFactor = Math.round((targetServings / baseServings) * 100) / 100;

    // Đơn vị định tính theo chuẩn hệ thống (UC-07 - Luồng 2a): Giữ nguyên định lượng gốc, không nhân hệ số N
    const qualitativeUnits = ["vừa đủ", "tùy khẩu vị"];

    let ingredients = (recipe.ingredients || []).map((item) => {
      let baseQuantity = Number(item.quantity);
      let unitName = item.unitGroup ? item.unitGroup.unitName : (item.customUnit || "");
      let ingName = item.ingredient
        ? item.ingredient.ingredientName
        : (item.customIngredientName || "");

      const isQualitative = qualitativeUnits.includes(unitName.toLowerCase().trim());

      let scaledQuantity = isQualitative
        ? baseQuantity
        : Math.round(baseQuantity * (targetServings / baseServings) * 100) / 100;

      return {
        ingredientName: ingName,
        scaledQuantity: scaledQuantity,
        unit: unitName,
      };
    });

    return {
      EC: 0,
      EM: "Tính toán định lượng thành công!",
      DT: {
        recipeId: recipe.id,
        defaultServings: recipe.defaultServings,
        targetServings: targetServings,
        scaleFactor: scaleFactor,
        ingredients: ingredients,
      },
    };
  } catch (e) {
    console.log("scaleRecipeIngredients error:", e);
    return {
      EC: -1,
      EM: "Lỗi kết nối máy chủ!",
      DT: null,
    };
  }
};

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
      isNaN(Number(cookTimeMinutes)) ||
      Number(cookTimeMinutes) <= 0
    ) {
      return {
        EC: 1,
        EM: "Thời gian nấu phải là số nguyên dương!",
        DT: null,
      };
    }

    const validDifficulties = ["Easy", "Medium", "Hard"];
    let matchedDifficulty = validDifficulties.find(
      (d) => d.toLowerCase() === String(difficulty || "").trim().toLowerCase()
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
      isNaN(Number(defaultServings)) ||
      Number(defaultServings) <= 0
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
        [Op.or]: [
          { createdBy: null },
          { createdBy: authorId },
        ],
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
      if (
        ing.quantity === undefined ||
        ing.quantity === null ||
        isNaN(Number(ing.quantity)) ||
        Number(ing.quantity) <= 0
      ) {
        return {
          EC: 1,
          EM: `Định lượng nguyên liệu ở vị trí ${i + 1} phải lớn hơn 0!`,
          DT: null,
        };
      }

      // TH 1: Người dùng chọn nguyên liệu của hệ thống (có ingredientId)
      if (ing.ingredientId) {
        const foundIng = await db.Ingredient.findByPk(Number(ing.ingredientId));
        if (!foundIng) {
          return {
            EC: 1,
            EM: `Nguyên liệu hệ thống với ID ${ing.ingredientId} không tồn tại!`,
            DT: null,
          };
        }

        // Nếu có gửi unitId, chỉ cho phép đúng defaultUnit của nguyên liệu đó
        if (ing.unitId && Number(ing.unitId) !== foundIng.defaultUnitId) {
          return {
            EC: 1,
            EM: `Nguyên liệu "${foundIng.ingredientName}" chỉ được sử dụng đơn vị đo mặc định của hệ thống!`,
            DT: null,
          };
        }

        processedIngredients.push({
          ingredientId: foundIng.id,
          customIngredientName: null,
          quantity: Number(ing.quantity),
          unitId: foundIng.defaultUnitId,
          customUnit: null, // Nguyên liệu hệ thống luôn chỉ dùng đơn vị mặc định
        });
      }
      // TH 2: Người dùng tự gõ tay nguyên liệu ngoài hệ thống (customIngredientName)
      else if (ing.customIngredientName && String(ing.customIngredientName).trim()) {
        let customIngName = String(ing.customIngredientName).trim();
        let unitId = null;
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
        }
        // Hoặc tự gõ tay đơn vị ngoài hệ thống (customUnit)
        else if (ing.customUnit && String(ing.customUnit).trim()) {
          customUnit = String(ing.customUnit).trim();
        } else {
          return {
            EC: 1,
            EM: `Nguyên liệu tự nhập "${customIngName}" phải chọn đơn vị hệ thống hoặc tự nhập đơn vị!`,
            DT: null,
          };
        }

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
    for (let i = 0; i < stepsList.length; i++) {
      const st = stepsList[i];
      if (!st.instruction || !String(st.instruction).trim()) {
        return {
          EC: 1,
          EM: `Nội dung bước làm thứ ${st.stepNumber || i + 1} không được để trống!`,
          DT: null,
        };
      }
    }

    // Xác định trạng thái duyệt dựa trên isPublic (hoặc isAdminCreate)
    const isPub = isAdminCreate ? true : (isPublic === true || isPublic === "true");
    const approvalStatus = isAdminCreate ? "Approved" : (isPub ? "Pending" : "Approved");

    // 3. Thực hiện lưu vào CSDL với transaction
    const t = await db.sequelize.transaction();
    try {
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
        { transaction: t }
      );

      // Thêm danh mục RecipeCategories
      const recipeCategoriesData = catList.map((catId) => ({
        recipeId: newRecipe.id,
        categoryId: Number(catId),
      }));
      await db.RecipeCategory.bulkCreate(recipeCategoriesData, { transaction: t });

      // Thêm nguyên liệu RecipeIngredients đã được chuẩn hóa
      const recipeIngredientsData = processedIngredients.map((ing) => ({
        recipeId: newRecipe.id,
        ingredientId: ing.ingredientId,
        customIngredientName: ing.customIngredientName,
        quantity: ing.quantity,
        unitId: ing.unitId,
        customUnit: ing.customUnit,
      }));
      await db.RecipeIngredient.bulkCreate(recipeIngredientsData, { transaction: t });

      // Thêm các bước làm CookingSteps
      const cookingStepsData = stepsList.map((st, index) => ({
        recipeId: newRecipe.id,
        stepNumber:
          st.stepNumber !== undefined && !isNaN(Number(st.stepNumber))
            ? Number(st.stepNumber)
            : index + 1,
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
        { transaction }
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
  }
};

// 4.5 GET /api/v1/recipes/mine - Quản lý công thức của tôi (UC-09)
const getMyRecipes = async (user) => {
  try {
    const userId = user ? user.id || user.userId : null;
    if (!userId) {
      return {
        EC: 5,
        EM: "Chưa xác thực hoặc phiên đăng nhập đã hết hạn!",
        DT: null,
      };
    }

    const recipes = await db.Recipe.findAll({
      where: {
        authorId: userId,
        isDeleted: false,
      },
      attributes: [
        "id",
        "title",
        "thumbnailUrl",
        "cookTimeMinutes",
        "difficulty",
        "defaultServings",
        "isPublic",
        "approvalStatus",
        "rejectionReason",
        "pendingUpdateData",
        "createdAt",
      ],
      order: [["createdAt", "DESC"]],
    });

    const formatted = recipes.map((r) => ({
      recipeId: r.id,
      title: r.title,
      thumbnailUrl: r.thumbnailUrl,
      cookTimeMinutes: r.cookTimeMinutes,
      difficulty: r.difficulty,
      defaultServings: r.defaultServings,
      isPublic: r.isPublic,
      approvalStatus: r.approvalStatus,
      rejectionReason: r.rejectionReason,
      hasPendingUpdate: r.pendingUpdateData !== null,
      pendingUpdateData: r.pendingUpdateData,
      createdAt: r.createdAt,
    }));

    return {
      EC: 0,
      EM: "Thành công!",
      DT: formatted,
    };
  } catch (e) {
    console.log("getMyRecipes error:", e);
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

    // Quy tắc nghiệp vụ: Công thức đã công khai (isPublic = true) thì không cho phép chuyển về chế độ riêng tư
    if (recipe.isPublic && (data.isPublic === false || data.isPublic === "false")) {
      return {
        EC: 1,
        EM: "Công thức đã công khai không thể chuyển về chế độ riêng tư để đảm bảo dữ liệu cho người dùng khác!",
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
      isNaN(Number(cookTimeMinutes)) ||
      Number(cookTimeMinutes) <= 0
    ) {
      return {
        EC: 1,
        EM: "Thời gian nấu phải là số nguyên dương!",
        DT: null,
      };
    }

    const validDifficulties = ["Easy", "Medium", "Hard"];
    let matchedDifficulty = validDifficulties.find(
      (d) => d.toLowerCase() === String(difficulty || "").trim().toLowerCase()
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
      isNaN(Number(defaultServings)) ||
      Number(defaultServings) <= 0
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
        [Op.or]: [
          { createdBy: null },
          { createdBy: userId },
        ],
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
      if (
        ing.quantity === undefined ||
        ing.quantity === null ||
        isNaN(Number(ing.quantity)) ||
        Number(ing.quantity) <= 0
      ) {
        return {
          EC: 1,
          EM: `Định lượng nguyên liệu ở vị trí ${i + 1} phải lớn hơn 0!`,
          DT: null,
        };
      }

      // TH 1: Người dùng chọn nguyên liệu của hệ thống (có ingredientId)
      if (ing.ingredientId) {
        const foundIng = await db.Ingredient.findByPk(Number(ing.ingredientId), {
          include: [{ model: db.Unit, as: "defaultUnit", attributes: ["id", "unitName"] }],
        });
        if (!foundIng) {
          return {
            EC: 1,
            EM: `Nguyên liệu hệ thống với ID ${ing.ingredientId} không tồn tại!`,
            DT: null,
          };
        }

        // Nếu có gửi unitId, chỉ cho phép đúng defaultUnit của nguyên liệu đó
        if (ing.unitId && Number(ing.unitId) !== foundIng.defaultUnitId) {
          return {
            EC: 1,
            EM: `Nguyên liệu "${foundIng.ingredientName}" chỉ được sử dụng đơn vị đo mặc định của hệ thống!`,
            DT: null,
          };
        }

        processedIngredients.push({
          ingredientId: foundIng.id,
          ingredientName: foundIng.ingredientName,
          customIngredientName: null,
          quantity: Number(ing.quantity),
          unitId: foundIng.defaultUnitId,
          unit: foundIng.defaultUnit ? foundIng.defaultUnit.unitName : "",
          customUnit: null,
        });
      }
      // TH 2: Người dùng tự gõ tay nguyên liệu ngoài hệ thống (customIngredientName)
      else if (ing.customIngredientName && String(ing.customIngredientName).trim()) {
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
    for (let i = 0; i < stepsList.length; i++) {
      const st = stepsList[i];
      if (!st.instruction || !String(st.instruction).trim()) {
        return {
          EC: 1,
          EM: `Nội dung bước làm thứ ${st.stepNumber || i + 1} không được để trống!`,
          DT: null,
        };
      }
    }

    // TH 1: Công thức HIỆN TẠI ĐÃ CÔNG KHAI (recipe.isPublic = true)
    // -> Giữ nguyên dữ liệu gốc cho cộng đồng đang dùng, lưu bản sửa đổi mới vào pendingUpdateData để chờ Admin duyệt lại
    if (recipe.isPublic) {
      const formattedCategories = validCategories.map((c) => ({
        categoryId: c.id,
        categoryName: c.categoryName,
      }));

      const pendingData = {
        title: String(title).trim(),
        description: String(description).trim(),
        thumbnailUrl: thumb,
        cookTimeMinutes: Number(cookTimeMinutes),
        difficulty: matchedDifficulty,
        defaultServings: Number(defaultServings),
        categoryIds: catList.map(Number),
        categories: formattedCategories,
        ingredients: processedIngredients,
        steps: stepsList.map((st, index) => ({
          stepNumber:
            st.stepNumber !== undefined && !isNaN(Number(st.stepNumber))
              ? Number(st.stepNumber)
              : index + 1,
          instruction: String(st.instruction).trim(),
        })),
        submittedAt: new Date().toISOString(),
      };

      await recipe.update({
        pendingUpdateData: pendingData,
        rejectionReason: null, // Reset lý do từ chối nếu lần sửa trước bị từ chối
      });

      return {
        EC: 0,
        EM: "Yêu cầu chỉnh sửa công thức đã được lưu và đang chờ Quản trị viên duyệt lại!",
        DT: {
          recipeId: recipe.id,
          hasPendingUpdate: true,
        },
      };
    }

    // TH 2: Công thức HIỆN TẠI ĐANG LÀ RIÊNG TƯ (recipe.isPublic = false)
    // -> Được phép cập nhật trực tiếp vào cơ sở dữ liệu
    // - Nếu chọn công khai (isPublic = true), bài chuyển trạng thái 'Pending' chờ Admin duyệt lần đầu.
    // - Nếu tiếp tục để riêng tư (isPublic = false), trạng thái là 'Approved' (cá nhân).
    const isPub = isPublic === true || isPublic === "true";
    const approvalStatus = isPub ? "Pending" : "Approved";

    // Thực hiện cập nhật vào CSDL với transaction
    const t = await db.sequelize.transaction();
    try {
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
          pendingUpdateData: null,
          rejectionReason: null,
        },
        { transaction: t }
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
      await db.RecipeCategory.bulkCreate(recipeCategoriesData, { transaction: t });

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
      await db.RecipeIngredient.bulkCreate(recipeIngredientsData, { transaction: t });

      // Cập nhật các bước làm: Xóa bước làm cũ và thêm mới
      await db.CookingStep.destroy({
        where: { recipeId: rId },
        transaction: t,
      });

      const cookingStepsData = stepsList.map((st, index) => ({
        recipeId: rId,
        stepNumber:
          st.stepNumber !== undefined && !isNaN(Number(st.stepNumber))
            ? Number(st.stepNumber)
            : index + 1,
        instruction: String(st.instruction).trim(),
      }));
      await db.CookingStep.bulkCreate(cookingStepsData, { transaction: t });

      await t.commit();

      return {
        EC: 0,
        EM: isPub
          ? "Cập nhật và gửi yêu cầu phê duyệt công khai thành công!"
          : "Cập nhật công thức riêng tư thành công!",
        DT: {
          recipeId: recipe.id,
          approvalStatus: recipe.approvalStatus,
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

    // Thực hiện xóa mềm: Đặt isDeleted = true
    await recipe.update({ isDeleted: true });

    return {
      EC: 0,
      EM: "Đã xóa công thức an toàn!",
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

// 4.8 GET /api/v1/admin/recipes (UC-19: Admin xem danh sách công thức chuẩn hệ thống)
const adminGetRecipes = async (query = {}) => {
  try {
    const { status, keyword, search, scope } = query;

    // Theo đặc tả UC-19 (Bảng 3.20 - Quản lý công thức chuẩn hệ thống):
    // Mặc định Admin chỉ xem các công thức chuẩn do hệ thống/Admin tạo lập (author.role = 'Admin').
    // Nếu truyền scope='all', Admin có thể xem toàn bộ công thức công khai để tra cứu tổng quan.
    const whereClause = {
      isDeleted: false,
    };

    if (scope === "all") {
      whereClause[Op.or] = [
        { isPublic: true },
        Sequelize.where(Sequelize.col("author.role"), "Admin"),
      ];
    } else {
      whereClause[Op.and] = [
        Sequelize.where(Sequelize.col("author.role"), "Admin"),
      ];
    }

    // Lọc theo trạng thái duyệt (Pending, Approved, Rejected) nếu có truyền
    if (status && String(status).trim()) {
      whereClause.approvalStatus = String(status).trim();
    }

    // Lọc theo từ khóa tìm kiếm theo tên món ăn
    const kw = (keyword || search || "").trim();
    if (kw) {
      const isAccented = hasVietnameseAccents(kw);
      const titleCondition = isAccented
        ? { title: { [Op.iLike]: `%${kw}%` } }
        : Sequelize.where(
            Sequelize.fn("unaccent", Sequelize.col("Recipe.title")),
            { [Op.iLike]: Sequelize.fn("unaccent", `%${kw}%`) }
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
      hasPendingUpdate: r.pendingUpdateData !== null,
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

// 4.9 POST /api/v1/admin/recipes - Admin tạo công thức chuẩn hệ thống (UC-19)
const adminCreateRecipe = async (user, data) => {
  return await createRecipe(user, { ...data, isPublic: true }, true);
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
    if (!rId || isNaN(rId) || rId <= 0) {
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

    // 2. Kiểm tra quyền: Chỉ cho phép Admin sửa công thức chuẩn do Admin tạo
    if (!recipe.author || recipe.author.role !== "Admin") {
      return {
        EC: 4,
        EM: "Bạn chỉ có thể chỉnh sửa công thức chuẩn do Admin tạo!",
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
      isNaN(Number(cookTimeMinutes)) ||
      Number(cookTimeMinutes) <= 0
    ) {
      return {
        EC: 1,
        EM: "Thời gian nấu phải là số nguyên dương!",
        DT: null,
      };
    }

    const validDifficulties = ["Easy", "Medium", "Hard"];
    let matchedDifficulty = validDifficulties.find(
      (d) => d.toLowerCase() === String(difficulty || "").trim().toLowerCase()
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
      isNaN(Number(defaultServings)) ||
      Number(defaultServings) <= 0
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
      if (
        ing.quantity === undefined ||
        ing.quantity === null ||
        isNaN(Number(ing.quantity)) ||
        Number(ing.quantity) <= 0
      ) {
        return {
          EC: 1,
          EM: `Định lượng nguyên liệu ở vị trí ${i + 1} phải lớn hơn 0!`,
          DT: null,
        };
      }

      // TH 1: Chọn nguyên liệu của hệ thống (có ingredientId)
      if (ing.ingredientId) {
        const foundIng = await db.Ingredient.findByPk(Number(ing.ingredientId));
        if (!foundIng) {
          return {
            EC: 1,
            EM: `Nguyên liệu hệ thống với ID ${ing.ingredientId} không tồn tại!`,
            DT: null,
          };
        }

        if (ing.unitId && Number(ing.unitId) !== foundIng.defaultUnitId) {
          return {
            EC: 1,
            EM: `Nguyên liệu "${foundIng.ingredientName}" chỉ được sử dụng đơn vị đo mặc định của hệ thống!`,
            DT: null,
          };
        }

        processedIngredients.push({
          ingredientId: foundIng.id,
          customIngredientName: null,
          quantity: Number(ing.quantity),
          unitId: foundIng.defaultUnitId,
          customUnit: null,
        });
      }
      // TH 2: Tự gõ tay nguyên liệu ngoài hệ thống (customIngredientName)
      else if (ing.customIngredientName && String(ing.customIngredientName).trim()) {
        let customIngName = String(ing.customIngredientName).trim();
        let unitId = null;
        let customUnit = null;

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
        } else if (ing.customUnit && String(ing.customUnit).trim()) {
          customUnit = String(ing.customUnit).trim();
        } else {
          return {
            EC: 1,
            EM: `Nguyên liệu tự nhập "${customIngName}" phải chọn đơn vị hệ thống hoặc tự nhập đơn vị!`,
            DT: null,
          };
        }

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
    for (let i = 0; i < stepsList.length; i++) {
      const st = stepsList[i];
      if (!st.instruction || !String(st.instruction).trim()) {
        return {
          EC: 1,
          EM: `Nội dung bước làm thứ ${st.stepNumber || i + 1} không được để trống!`,
          DT: null,
        };
      }
    }

    // 7. Thực hiện cập nhật với Transaction (Công thức chuẩn luôn isPublic = true, approvalStatus = 'Approved')
    const t = await db.sequelize.transaction();
    try {
      await recipe.update(
        {
          title: String(title).trim(),
          description: String(description).trim(),
          thumbnailUrl: thumb,
          cookTimeMinutes: Number(cookTimeMinutes),
          difficulty: matchedDifficulty,
          defaultServings: Number(defaultServings),
          isPublic: true,
          approvalStatus: "Approved",
          pendingUpdateData: null,
          rejectionReason: null,
        },
        { transaction: t }
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
      await db.RecipeCategory.bulkCreate(recipeCategoriesData, { transaction: t });

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
      await db.RecipeIngredient.bulkCreate(recipeIngredientsData, { transaction: t });

      // Cập nhật các bước làm
      await db.CookingStep.destroy({
        where: { recipeId: rId },
        transaction: t,
      });

      const cookingStepsData = stepsList.map((st, index) => ({
        recipeId: rId,
        stepNumber:
          st.stepNumber !== undefined && !isNaN(Number(st.stepNumber))
            ? Number(st.stepNumber)
            : index + 1,
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
    if (!rId || isNaN(rId) || rId <= 0) {
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

    // 2. Kiểm tra quyền: Chỉ cho phép Admin xóa công thức chuẩn do Admin tạo
    if (!recipe.author || recipe.author.role !== "Admin") {
      return {
        EC: 4,
        EM: "Bạn chỉ có thể xóa công thức chuẩn do Admin tạo!",
        DT: null,
      };
    }

    // 3. Thực hiện xóa mềm: Đặt isDeleted = true
    await recipe.update({ isDeleted: true });

    return {
      EC: 0,
      EM: "Đã xóa mềm công thức chuẩn!",
      DT: null,
    };
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
        [Op.or]: [
          { approvalStatus: "Pending" },
          { pendingUpdateData: { [Op.ne]: null } },
        ],
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
      const isUpdate = recipe.pendingUpdateData !== null;
      let title = recipe.title;
      let description = recipe.description || "";
      let thumbnailUrl = recipe.thumbnailUrl;
      let cookTimeMinutes = recipe.cookTimeMinutes;
      let difficulty = recipe.difficulty;
      let defaultServings = recipe.defaultServings;

      let formattedCategories = (recipe.categories || []).map((cat) => ({
        categoryId: cat.id,
        categoryName: cat.categoryName,
      }));

      let formattedIngredients = (recipe.ingredients || []).map((item) => ({
        ingredientId: item.ingredientId || (item.ingredient ? item.ingredient.id : null),
        ingredientName: item.ingredient
          ? item.ingredient.ingredientName
          : (item.customIngredientName || ""),
        quantity: Number(item.quantity),
        unitId: item.unitId || (item.unitGroup ? item.unitGroup.id : null),
        unit: item.unitGroup ? item.unitGroup.unitName : (item.customUnit || ""),
      }));

      let formattedSteps = (recipe.cookingSteps || []).map((step) => ({
        stepNumber: step.stepNumber,
        instruction: step.instruction,
      }));

      // Nếu là yêu cầu chỉnh sửa, lưu lại toàn bộ bản hiện tại (V1) để Frontend đối chiếu so sánh Trước & Sau (Diff View)
      const currentData = isUpdate
        ? {
            title: title,
            description: description,
            thumbnailUrl: thumbnailUrl,
            cookTimeMinutes: cookTimeMinutes,
            difficulty: difficulty,
            defaultServings: defaultServings,
            categories: formattedCategories,
            ingredients: formattedIngredients,
            cookingSteps: formattedSteps,
          }
        : null;

      // Nếu là yêu cầu chỉnh sửa, nạp dữ liệu từ pendingUpdateData để Admin xem đúng nội dung mới nhất
      if (isUpdate) {
        const pData = typeof recipe.pendingUpdateData === "string"
          ? JSON.parse(recipe.pendingUpdateData)
          : recipe.pendingUpdateData;

        if (pData) {
          title = pData.title || title;
          description = pData.description !== undefined ? pData.description : description;
          thumbnailUrl = pData.thumbnailUrl !== undefined ? pData.thumbnailUrl : thumbnailUrl;
          cookTimeMinutes = pData.cookTimeMinutes || cookTimeMinutes;
          difficulty = pData.difficulty || difficulty;
          defaultServings = pData.defaultServings || defaultServings;
          if (pData.categories && Array.isArray(pData.categories)) {
            formattedCategories = pData.categories;
          }
          if (pData.ingredients && Array.isArray(pData.ingredients)) {
            formattedIngredients = pData.ingredients.map((ing) => ({
              ingredientId: ing.ingredientId,
              ingredientName: ing.ingredientName || ing.customIngredientName || "",
              quantity: Number(ing.quantity),
              unitId: ing.unitId,
              unit: ing.unit || ing.customUnit || "",
            }));
          }
          if (pData.steps && Array.isArray(pData.steps)) {
            formattedSteps = pData.steps.map((st) => ({
              stepNumber: st.stepNumber,
              instruction: st.instruction,
            }));
          }
        }
      }

      return {
        recipeId: recipe.id,
        requestType: isUpdate ? "UPDATE" : "NEW",
        title: title,
        description: description,
        thumbnailUrl: thumbnailUrl,
        cookTimeMinutes: cookTimeMinutes,
        difficulty: difficulty,
        defaultServings: defaultServings,
        isPublic: recipe.isPublic,
        approvalStatus: recipe.approvalStatus,
        authorId: recipe.authorId,
        authorName: recipe.author ? recipe.author.username : "",
        authorEmail: recipe.author ? recipe.author.email : "",
        categories: formattedCategories,
        ingredients: formattedIngredients,
        cookingSteps: formattedSteps,
        currentData: currentData,
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
        EM: "Không tìm thấy công thức cần duyệt!",
        DT: null,
      };
    }

    const isUpdate = recipe.pendingUpdateData !== null;
    const isNewPending = recipe.approvalStatus === "Pending";

    // Chỉ kiểm duyệt công thức đang chờ duyệt (Bài mới Pending HOẶC Bài có pendingUpdateData)
    if (!recipe.isPublic || (!isNewPending && !isUpdate)) {
      if (recipe.approvalStatus === "Approved" && !isUpdate) {
        return {
          EC: 1,
          EM: "Công thức này đã được phê duyệt và không có yêu cầu cập nhật nào đang chờ!",
          DT: null,
        };
      }
      if (recipe.approvalStatus === "Rejected" && !isUpdate) {
        return {
          EC: 1,
          EM: "Công thức này đã bị từ chối trước đó!",
          DT: null,
        };
      }
      return {
        EC: 1,
        EM: "Công thức không ở trạng thái chờ kiểm duyệt!",
        DT: null,
      };
    }

    const rawStatus = data.approvalStatus || data.action;
    if (!rawStatus || !String(rawStatus).trim()) {
      return {
        EC: 1,
        EM: "Trạng thái duyệt không hợp lệ (Chỉ chấp nhận 'Approved' hoặc 'Rejected')!",
        DT: null,
      };
    }

    const normalizedStatus = String(rawStatus).trim();
    if (
      normalizedStatus !== "Approved" &&
      normalizedStatus !== "Rejected" &&
      normalizedStatus.toLowerCase() !== "approved" &&
      normalizedStatus.toLowerCase() !== "rejected"
    ) {
      return {
        EC: 1,
        EM: "Trạng thái duyệt không hợp lệ (Chỉ chấp nhận 'Approved' hoặc 'Rejected')!",
        DT: null,
      };
    }

    const finalStatus =
      normalizedStatus.toLowerCase() === "approved" ? "Approved" : "Rejected";

    // TRƯỜNG HỢP 1: DUYỆT BẢN CẬP NHẬT CỦA CÔNG THỨC ĐÃ CÔNG KHAI (isUpdate === true)
    if (isUpdate) {
      if (finalStatus === "Rejected") {
        const reason = data.rejectionReason;
        if (!reason || !String(reason).trim()) {
          return {
            EC: 1,
            EM: "Vui lòng nhập lý do từ chối bản cập nhật!",
            DT: null,
          };
        }

        // Từ chối bản cập nhật: Xóa pendingUpdateData, lưu lý do phản hồi, bản gốc V1 vẫn giữ nguyên hiển thị
        await recipe.update({
          pendingUpdateData: null,
          rejectionReason: String(reason).trim(),
        });

        return {
          EC: 0,
          EM: "Đã từ chối bản cập nhật thành công! Phiên bản hiện tại vẫn được giữ nguyên trên hệ thống.",
          DT: {
            recipeId: recipe.id,
            requestType: "UPDATE",
            approvalStatus: recipe.approvalStatus,
            rejectionReason: recipe.rejectionReason,
          },
        };
      } else {
        // Phê duyệt bản cập nhật: Ghi đè dữ liệu từ pendingUpdateData vào các bảng chính thức
        const pData = typeof recipe.pendingUpdateData === "string"
          ? JSON.parse(recipe.pendingUpdateData)
          : recipe.pendingUpdateData;

        const t = await db.sequelize.transaction();
        try {
          await recipe.update(
            {
              title: pData.title,
              description: pData.description,
              thumbnailUrl: pData.thumbnailUrl,
              cookTimeMinutes: pData.cookTimeMinutes,
              difficulty: pData.difficulty,
              defaultServings: pData.defaultServings,
              pendingUpdateData: null,
              rejectionReason: null,
              approvalStatus: "Approved",
              isPublic: true,
            },
            { transaction: t }
          );

          if (pData.categoryIds && Array.isArray(pData.categoryIds)) {
            await db.RecipeCategory.destroy({
              where: { recipeId: rId },
              transaction: t,
            });
            const recipeCategoriesData = pData.categoryIds.map((catId) => ({
              recipeId: rId,
              categoryId: Number(catId),
            }));
            await db.RecipeCategory.bulkCreate(recipeCategoriesData, { transaction: t });
          }

          if (pData.ingredients && Array.isArray(pData.ingredients)) {
            await db.RecipeIngredient.destroy({
              where: { recipeId: rId },
              transaction: t,
            });
            const recipeIngredientsData = pData.ingredients.map((ing) => ({
              recipeId: rId,
              ingredientId: ing.ingredientId,
              customIngredientName: ing.customIngredientName,
              quantity: ing.quantity,
              unitId: ing.unitId,
              customUnit: ing.customUnit,
            }));
            await db.RecipeIngredient.bulkCreate(recipeIngredientsData, { transaction: t });
          }

          if (pData.steps && Array.isArray(pData.steps)) {
            await db.CookingStep.destroy({
              where: { recipeId: rId },
              transaction: t,
            });
            const cookingStepsData = pData.steps.map((st, index) => ({
              recipeId: rId,
              stepNumber: st.stepNumber || index + 1,
              instruction: String(st.instruction).trim(),
            }));
            await db.CookingStep.bulkCreate(cookingStepsData, { transaction: t });
          }

          await t.commit();

          return {
            EC: 0,
            EM: "Phê duyệt bản cập nhật công thức thành công!",
            DT: {
              recipeId: recipe.id,
              requestType: "UPDATE",
              approvalStatus: "Approved",
              rejectionReason: null,
            },
          };
        } catch (errTx) {
          await t.rollback();
          console.log("moderateRecipe update transaction error:", errTx);
          return {
            EC: -1,
            EM: "Lỗi kết nối máy chủ khi cập nhật công thức!",
            DT: null,
          };
        }
      }
    }

    // TRƯỜNG HỢP 2: DUYỆT CÔNG THỨC MỚI TẠO (isNewPending === true)
    if (finalStatus === "Rejected") {
      const reason = data.rejectionReason;
      if (!reason || !String(reason).trim()) {
        return {
          EC: 1,
          EM: "Vui lòng nhập lý do từ chối bài viết!",
          DT: null,
        };
      }

      await recipe.update({
        approvalStatus: "Rejected",
        rejectionReason: String(reason).trim(),
        isPublic: false,
      });

      return {
        EC: 0,
        EM: "Đã từ chối công thức bài viết thành công!",
        DT: {
          recipeId: recipe.id,
          requestType: "NEW",
          approvalStatus: "Rejected",
          rejectionReason: recipe.rejectionReason,
        },
      };
    } else {
      await recipe.update({
        approvalStatus: "Approved",
        rejectionReason: null,
        isPublic: true,
      });

      // Gắn danh mục cộng đồng nếu tác giả không phải là Admin
      await ensureCommunityCategory(recipe.id);

      return {
        EC: 0,
        EM: "Phê duyệt công thức thành công!",
        DT: {
          recipeId: recipe.id,
          requestType: "NEW",
          approvalStatus: "Approved",
          rejectionReason: null,
        },
      };
    }
  } catch (e) {
    console.log("moderateRecipe error:", e);
    return {
      EC: -1,
      EM: "Lỗi kết nối máy chủ!",
      DT: null,
    };
  }
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
