import db from "../models/index";
import { Op } from "sequelize";
import { isQualitativeUnit } from "./unitService";

const isString = (value) =>
  Object.prototype.toString.call(value) === "[object String]" && value === String(value);

// Exact non-negative rational arithmetic: retain every serving fraction until
// the final sum, then round half-up to the DECIMAL(10, 2) storage precision.
class ShoppingQuantityError extends Error {}

const gcd = (a, b) => {
  while (b !== 0n) [a, b] = [b, a % b];
  return a;
};

const fraction = (numerator, denominator) => {
  const divisor = gcd(numerator, denominator);
  return { numerator: numerator / divisor, denominator: denominator / divisor };
};

const parseQuantity = (value) => {
  if (!isString(value) && !Number.isFinite(value)) {
    throw new ShoppingQuantityError("Số lượng phải là số hữu hạn!");
  }
  const match = /^(\d+)(?:\.(\d+))?(?:e([+-]?\d+))?$/i.exec(String(value));
  if (!match) throw new ShoppingQuantityError("Số lượng nguyên liệu không hợp lệ!");
  const decimals = match[2] || "";
  const exponent = Number(match[3] || 0) - decimals.length;
  if (!Number.isSafeInteger(exponent) || Math.abs(exponent) > 1000) {
    throw new ShoppingQuantityError("Số lượng vượt quá giới hạn cho phép!");
  }
  const digits = BigInt(match[1] + decimals);
  // Avoid exponentiation: this project's Babel target rewrites ** to Math.pow,
  // which cannot operate on BigInt values.
  const powerOfTen = BigInt("1" + "0".repeat(Math.abs(exponent)));
  return exponent >= 0
    ? fraction(digits * powerOfTen, 1n)
    : fraction(digits, powerOfTen);
};

const scaleQuantity = (quantity, targetServings, defaultServings) =>
  fraction(quantity.numerator * BigInt(targetServings),
    quantity.denominator * BigInt(defaultServings));

const addQuantity = (left, right) => {
  const common = gcd(left.denominator, right.denominator);
  return fraction(
    left.numerator * (right.denominator / common) + right.numerator * (left.denominator / common),
    (left.denominator / common) * right.denominator,
  );
};

const roundQuantity = (quantity, qualitative = false) => {
  if (qualitative) return 0;
  const scaled = quantity.numerator * 100n;
  const cents = scaled / quantity.denominator +
    (2n * (scaled % quantity.denominator) >= quantity.denominator ? 1n : 0n);
  if (cents <= 0n) {
    throw new ShoppingQuantityError("Số lượng sau làm tròn phải từ 0.01 trở lên với đơn vị định lượng!");
  }
  if (cents > 9999999999n) {
    throw new ShoppingQuantityError("Số lượng sau làm tròn không được vượt quá 99999999.99!");
  }
  return Number(cents) / 100;
};

/**
 * 7.1 Lấy danh sách các phiên đi chợ của người dùng (UC-17)
 * @param {number} userId
 * @returns {Promise<{ EC: number, EM: string, DT: any }>}
 */
const getShoppingLists = async (userId) => {
  try {
    if (!userId) {
      return {
        EC: 5,
        EM: "Chưa xác thực hoặc phiên đăng nhập đã hết hạn!",
        DT: null,
      };
    }

    const lists = await db.ShoppingList.findAll({
      where: { userId: Number(userId) },
      attributes: ["id", "title", "status", "createdAt"],
      order: [["createdAt", "DESC"]],
    });

    const formattedLists = lists.map((list) => ({
      shoppingListId: list.id,
      title: list.title,
      status: list.status,
      createdAt: list.createdAt,
    }));

    return {
      EC: 0,
      EM: "Thành công!",
      DT: formattedLists,
    };
  } catch (error) {
    console.error("getShoppingLists error:", error);
    return {
      EC: -1,
      EM: "Lỗi kết nối máy chủ!",
      DT: null,
    };
  }
};

/**
 * 7.2 Tổng hợp và tạo danh sách đi chợ từ 1 hoặc nhiều Thực đơn (UC-17/18)
 * @param {number} userId
 * @param {{ title: string, recipeListIds: number[] }} rawData
 * @returns {Promise<{ EC: number, EM: string, DT: any }>}
 */
const generateShoppingList = async (userId, rawData = {}) => {
  let transaction;
  try {
    transaction = await db.sequelize.transaction();
    if (!userId) {
      await transaction.rollback();
      return {
        EC: 5,
        EM: "Chưa xác thực hoặc phiên đăng nhập đã hết hạn!",
        DT: null,
      };
    }

    const { title, recipeListIds } = rawData || {};

    if (!isString(title) || !title.trim()) {
      await transaction.rollback();
      return {
        EC: 1,
        EM: "Tiêu đề danh sách đi chợ phải là chuỗi không được để trống!",
        DT: null,
      };
    }

    const cleanTitle = title.trim();
    if (cleanTitle.length > 100) {
      await transaction.rollback();
      return {
        EC: 1,
        EM: "Tiêu đề danh sách đi chợ không được vượt quá 100 ký tự!",
        DT: null,
      };
    }

    if (!recipeListIds || !Array.isArray(recipeListIds) || recipeListIds.length === 0) {
      await transaction.rollback();
      return {
        EC: 1,
        EM: "Vui lòng chọn ít nhất một thực đơn!",
        DT: null,
      };
    }

    const cleanIds = [...new Set(recipeListIds)];
    const hasInvalidId = cleanIds.some((id) => !Number.isSafeInteger(id) || id <= 0);
    if (hasInvalidId) {
      await transaction.rollback();
      return {
        EC: 1,
        EM: "Danh sách mã thực đơn không hợp lệ!",
        DT: null,
      };
    }

    const lists = await db.RecipeList.findAll({
      where: {
        id: { [Op.in]: cleanIds },
      },
      include: [
        {
          model: db.RecipeListItem,
          as: "recipeListItems",
          include: [
            {
              model: db.Recipe,
              as: "recipe",
              where: { isDeleted: false },
              required: false,
              include: [
                {
                  model: db.RecipeIngredient,
                  as: "ingredients",
                  include: [
                    { model: db.Ingredient, as: "ingredient" },
                    { model: db.Unit, as: "unitGroup" },
                  ],
                },
              ],
            },
          ],
        },
      ],
      transaction,
    });

    if (lists.length !== cleanIds.length) {
      await transaction.rollback();
      return {
        EC: 3,
        EM: "Một hoặc nhiều thực đơn được chọn không tồn tại!",
        DT: null,
      };
    }

    const hasForbiddenList = lists.some((list) => list.userId !== Number(userId));
    if (hasForbiddenList) {
      await transaction.rollback();
      return {
        EC: 4,
        EM: "Bạn không có quyền sử dụng thực đơn của người khác!",
        DT: null,
      };
    }

    const aggregatedMap = new Map();
    let totalRecipeCount = 0;

    for (const list of lists) {
      const items = list.recipeListItems || [];
      for (const item of items) {
        if (!item.recipe) continue;
        totalRecipeCount++;

        const targetServings = item.targetServings;
        const defaultServings = item.recipe.defaultServings;
        if (!Number.isSafeInteger(targetServings) || targetServings <= 0 ||
            !Number.isSafeInteger(defaultServings) || defaultServings <= 0) {
          throw new ShoppingQuantityError("Khẩu phần targetServings và defaultServings phải là số nguyên dương!");
        }

        const ingredients = item.recipe.ingredients || [];
        for (const ing of ingredients) {
          const ingredientId = ing.ingredientId || null;
          const itemName = ing.ingredient ? ing.ingredient.ingredientName : ing.customIngredientName || "Nguyên liệu";
          const unit = ing.unitGroup ? ing.unitGroup.unitName : ing.customUnit || "";
          const unitClean = unit.trim().toLowerCase();
          const isQualitative = isQualitativeUnit(unit);

          // Luồng 2b: Nếu là nguyên liệu định tính ("vừa đủ", "tùy khẩu vị"): không nhân tỷ lệ và không tính tổng số lượng
          const baseQuantity = parseQuantity(ing.quantity);
          if (!isQualitative && baseQuantity.numerator === 0n) {
            throw new ShoppingQuantityError("Số lượng nguyên liệu định lượng phải lớn hơn 0!");
          }
          const scaledQuantity = isQualitative ? parseQuantity(0)
            : scaleQuantity(baseQuantity, targetServings, defaultServings);

          // Luồng 2a: Nếu nguyên liệu trùng tên nhưng khác đơn vị đo lường: key khác nhau -> tách thành các dòng riêng
          const key = ingredientId
            ? `id_${ingredientId}_${unitClean}`
            : `name_${itemName.trim().toLowerCase()}_${unitClean}`;

          if (aggregatedMap.has(key)) {
            const existing = aggregatedMap.get(key);
            if (!isQualitative) {
              existing.totalQuantity = addQuantity(existing.totalQuantity, scaledQuantity);
            }
          } else {
            aggregatedMap.set(key, {
              ingredientId: ingredientId,
              itemName: itemName,
              totalQuantity: scaledQuantity,
              unit: unit,
            });
          }
        }
      }
    }

    if (totalRecipeCount === 0 || aggregatedMap.size === 0) {
      await transaction.rollback();
      return {
        EC: 1,
        EM: "Thực đơn được chọn chưa có món ăn nào để đi chợ!",
        DT: null,
      };
    }

    // Validate the final totals before writing any shopping list records.
    const roundedItems = Array.from(aggregatedMap.values()).map((item) => ({
      ...item,
      totalQuantity: roundQuantity(item.totalQuantity, isQualitativeUnit(item.unit)),
    }));

    const newShoppingList = await db.ShoppingList.create(
      {
        userId: Number(userId),
        title: cleanTitle,
        status: "In_Progress",
      },
      { transaction }
    );

    const recipeListRecords = cleanIds.map((rId) => ({
      shoppingListId: newShoppingList.id,
      recipeListId: rId,
    }));
    await db.ShoppingListRecipeList.bulkCreate(recipeListRecords, { transaction });

    const shoppingListItemsRecords = roundedItems.map((item) => ({
      shoppingListId: newShoppingList.id,
      ingredientId: item.ingredientId,
      itemName: item.itemName,
      totalQuantity: item.totalQuantity,
      unit: item.unit,
      isPurchased: false,
    }));
    await db.ShoppingListItem.bulkCreate(shoppingListItemsRecords, { transaction });

    await transaction.commit();

    return {
      EC: 0,
      EM: "Đã tổng hợp danh sách đi chợ thông minh thành công!",
      DT: {
        shoppingListId: newShoppingList.id,
        title: newShoppingList.title,
        status: newShoppingList.status,
        totalItems: shoppingListItemsRecords.length,
      },
    };
  } catch (error) {
    if (transaction && !transaction.finished) {
      try {
        await transaction.rollback();
      } catch (rollbackError) {
        console.error("generateShoppingList rollback error:", rollbackError);
      }
    }
    if (error instanceof ShoppingQuantityError) {
      return { EC: 1, EM: error.message, DT: null };
    }
    console.error("generateShoppingList error:", error);
    return {
      EC: -1,
      EM: "Lỗi kết nối máy chủ!",
      DT: null,
    };
  }
};

/**
 * 7.3 Xem chi tiết checklist mua sắm (UC-18)
 * @param {number} userId
 * @param {number|string} shoppingListId
 * @returns {Promise<{ EC: number, EM: string, DT: any }>}
 */
const getShoppingListDetail = async (userId, shoppingListId) => {
  try {
    if (!userId) {
      return {
        EC: 5,
        EM: "Chưa xác thực hoặc phiên đăng nhập đã hết hạn!",
        DT: null,
      };
    }

    const sId = Number(shoppingListId);
    if (!sId || isNaN(sId) || !Number.isInteger(sId) || sId <= 0) {
      return {
        EC: 1,
        EM: "Mã danh sách đi chợ không hợp lệ!",
        DT: null,
      };
    }

    const shoppingList = await db.ShoppingList.findOne({
      where: { id: sId },
      include: [
        {
          model: db.ShoppingListItem,
          as: "shoppingListItems",
          attributes: [
            "id",
            "ingredientId",
            "itemName",
            "totalQuantity",
            "unit",
            "isPurchased",
          ],
        },
      ],
      order: [
        [{ model: db.ShoppingListItem, as: "shoppingListItems" }, "id", "ASC"],
      ],
    });

    if (!shoppingList) {
      return {
        EC: 3,
        EM: "Không tìm thấy danh sách đi chợ!",
        DT: null,
      };
    }

    if (shoppingList.userId !== Number(userId)) {
      return {
        EC: 4,
        EM: "Bạn không có quyền xem danh sách đi chợ này!",
        DT: null,
      };
    }

    const formattedItems = (shoppingList.shoppingListItems || []).map((item) => ({
      itemId: item.id,
      ingredientId: item.ingredientId,
      itemName: item.itemName,
      totalQuantity: Number(item.totalQuantity),
      unit: item.unit,
      isPurchased: item.isPurchased,
    }));

    return {
      EC: 0,
      EM: "Thành công!",
      DT: {
        shoppingListId: shoppingList.id,
        title: shoppingList.title,
        status: shoppingList.status,
        items: formattedItems,
      },
    };
  } catch (error) {
    console.error("getShoppingListDetail error:", error);
    return {
      EC: -1,
      EM: "Lỗi kết nối máy chủ!",
      DT: null,
    };
  }
};

/**
 * 7.4 Đánh dấu đã mua / chưa mua mặt hàng trong danh sách đi chợ (UC-18)
 * @param {number} userId
 * @param {number|string} shoppingListId
 * @param {number|string} itemId
 * @param {{ isPurchased: boolean }} rawData
 * @returns {Promise<{ EC: number, EM: string, DT: any }>}
 */
const updateShoppingListItemStatus = async (userId, shoppingListId, itemId, rawData = {}) => {
  try {
    if (!userId) {
      return {
        EC: 5,
        EM: "Chưa xác thực hoặc phiên đăng nhập đã hết hạn!",
        DT: null,
      };
    }

    const sId = Number(shoppingListId);
    if (!sId || isNaN(sId) || !Number.isInteger(sId) || sId <= 0) {
      return {
        EC: 1,
        EM: "Mã danh sách đi chợ không hợp lệ!",
        DT: null,
      };
    }

    const itId = Number(itemId);
    if (!itId || isNaN(itId) || !Number.isInteger(itId) || itId <= 0) {
      return {
        EC: 1,
        EM: "Mã mặt hàng không hợp lệ!",
        DT: null,
      };
    }

    if (rawData?.isPurchased !== true && rawData?.isPurchased !== false) {
      return {
        EC: 1,
        EM: "Trạng thái isPurchased phải là kiểu boolean (true hoặc false)!",
        DT: null,
      };
    }

    const shoppingList = await db.ShoppingList.findByPk(sId);
    if (!shoppingList) {
      return {
        EC: 3,
        EM: "Không tìm thấy danh sách đi chợ!",
        DT: null,
      };
    }

    if (shoppingList.userId !== Number(userId)) {
      return {
        EC: 4,
        EM: "Bạn không có quyền chỉnh sửa danh sách đi chợ này!",
        DT: null,
      };
    }

    const item = await db.ShoppingListItem.findOne({
      where: {
        id: itId,
        shoppingListId: sId,
      },
    });

    if (!item) {
      return {
        EC: 3,
        EM: "Không tìm thấy mặt hàng trong danh sách!",
        DT: null,
      };
    }

    await item.update({ isPurchased: rawData.isPurchased });

    return {
      EC: 0,
      EM: "Cập nhật trạng thái mặt hàng thành công!",
      DT: {
        itemId: item.id,
        isPurchased: item.isPurchased,
      },
    };
  } catch (error) {
    console.error("updateShoppingListItemStatus error:", error);
    return {
      EC: -1,
      EM: "Lỗi kết nối máy chủ!",
      DT: null,
    };
  }
};

/**
 * 7.5 Thêm món mua ngoài tự do vào danh sách đi chợ (UC-18)
 * @param {number} userId
 * @param {number|string} shoppingListId
 * @param {{ itemName: string, totalQuantity?: number, unit: string }} rawData
 * @returns {Promise<{ EC: number, EM: string, DT: any }>}
 */
const addShoppingListItem = async (userId, shoppingListId, rawData = {}) => {
  try {
    if (!userId) {
      return {
        EC: 5,
        EM: "Chưa xác thực hoặc phiên đăng nhập đã hết hạn!",
        DT: null,
      };
    }

    const sId = Number(shoppingListId);
    if (!sId || isNaN(sId) || !Number.isInteger(sId) || sId <= 0) {
      return {
        EC: 1,
        EM: "Mã danh sách đi chợ không hợp lệ!",
        DT: null,
      };
    }

    if (!isString(rawData?.itemName)) {
      return { EC: 1, EM: "Tên món phát sinh phải là chuỗi!", DT: null };
    }
    const cleanItemName = rawData.itemName.trim();
    if (!cleanItemName) {
      return {
        EC: 1,
        EM: "Tên món phát sinh không được để trống!",
        DT: null,
      };
    }

    if (cleanItemName.length > 255) {
      return {
        EC: 1,
        EM: "Tên món không được vượt quá 255 ký tự!",
        DT: null,
      };
    }

    if (!isString(rawData?.unit)) {
      return { EC: 1, EM: "Đơn vị tính phải là chuỗi!", DT: null };
    }
    const cleanUnit = rawData.unit.trim();
    if (!cleanUnit) {
      return {
        EC: 1,
        EM: "Đơn vị tính không được để trống!",
        DT: null,
      };
    }

    const isQualitative = isQualitativeUnit(cleanUnit);
    if (cleanUnit.length > 255) {
      return { EC: 1, EM: "Đơn vị tính không được vượt quá 255 ký tự!", DT: null };
    }

    let cleanQuantity = 0;
    if (rawData.totalQuantity === undefined) {
      if (!isQualitative) {
        return {
          EC: 1,
          EM: "Số lượng không được để trống!",
          DT: null,
        };
      }
      cleanQuantity = 0;
    } else {
      cleanQuantity = rawData.totalQuantity;
      if (!Number.isFinite(cleanQuantity)) {
        return { EC: 1, EM: "Số lượng phải là số hữu hạn!", DT: null };
      }
      if (cleanQuantity < 0 || (!isQualitative && cleanQuantity === 0)) {
        return {
          EC: 1,
          EM: "Số lượng phải lớn hơn 0; chỉ đơn vị định tính mới được dùng 0!",
          DT: null,
        };
      }
    }

    cleanQuantity = roundQuantity(parseQuantity(cleanQuantity), isQualitative);

    const shoppingList = await db.ShoppingList.findByPk(sId);
    if (!shoppingList) {
      return {
        EC: 3,
        EM: "Không tìm thấy danh sách đi chợ!",
        DT: null,
      };
    }

    if (shoppingList.userId !== Number(userId)) {
      return {
        EC: 4,
        EM: "Bạn không có quyền chỉnh sửa danh sách đi chợ này!",
        DT: null,
      };
    }

    const newItem = await db.ShoppingListItem.create({
      shoppingListId: sId,
      ingredientId: null,
      itemName: cleanItemName,
      totalQuantity: cleanQuantity,
      unit: cleanUnit,
      isPurchased: false,
    });

    return {
      EC: 0,
      EM: "Thêm món phát sinh thành công!",
      DT: {
        itemId: newItem.id,
        itemName: newItem.itemName,
        totalQuantity: Number(newItem.totalQuantity),
        unit: newItem.unit,
        isPurchased: newItem.isPurchased,
      },
    };
  } catch (error) {
    if (error instanceof ShoppingQuantityError) {
      return { EC: 1, EM: error.message, DT: null };
    }
    console.error("addShoppingListItem error:", error);
    return {
      EC: -1,
      EM: "Lỗi kết nối máy chủ!",
      DT: null,
    };
  }
};

/**
 * 7.6 Cập nhật trạng thái chuyến đi chợ (UC-18)
 * @param {number} userId
 * @param {number|string} shoppingListId
 * @param {{ status: string }} rawData
 * @returns {Promise<{ EC: number, EM: string, DT: any }>}
 */
const updateShoppingListStatus = async (userId, shoppingListId, rawData = {}) => {
  try {
    if (!userId) {
      return {
        EC: 5,
        EM: "Chưa xác thực hoặc phiên đăng nhập đã hết hạn!",
        DT: null,
      };
    }

    const sId = Number(shoppingListId);
    if (!sId || isNaN(sId) || !Number.isInteger(sId) || sId <= 0) {
      return {
        EC: 1,
        EM: "Mã danh sách đi chợ không hợp lệ!",
        DT: null,
      };
    }

    const validStatuses = ["In_Progress", "Completed"];
    const status = String(rawData?.status || "").trim();
    if (!validStatuses.includes(status)) {
      return {
        EC: 1,
        EM: "Trạng thái không hợp lệ (Chỉ chấp nhận 'In_Progress' hoặc 'Completed')!",
        DT: null,
      };
    }

    const shoppingList = await db.ShoppingList.findByPk(sId);
    if (!shoppingList) {
      return {
        EC: 3,
        EM: "Không tìm thấy danh sách đi chợ!",
        DT: null,
      };
    }

    if (shoppingList.userId !== Number(userId)) {
      return {
        EC: 4,
        EM: "Bạn không có quyền chỉnh sửa danh sách đi chợ này!",
        DT: null,
      };
    }

    await shoppingList.update({ status });

    return {
      EC: 0,
      EM: "Cập nhật trạng thái chuyến đi chợ thành công!",
      DT: {
        shoppingListId: shoppingList.id,
        status: shoppingList.status,
      },
    };
  } catch (error) {
    console.error("updateShoppingListStatus error:", error);
    return {
      EC: -1,
      EM: "Lỗi kết nối máy chủ!",
      DT: null,
    };
  }
};

/**
 * 7.7 Xóa phiên đi chợ (UC-18)
 * @param {number} userId
 * @param {number|string} shoppingListId
 * @returns {Promise<{ EC: number, EM: string, DT: any }>}
 */
const deleteShoppingList = async (userId, shoppingListId) => {
  try {
    if (!userId) {
      return {
        EC: 5,
        EM: "Chưa xác thực hoặc phiên đăng nhập đã hết hạn!",
        DT: null,
      };
    }

    const sId = Number(shoppingListId);
    if (!sId || isNaN(sId) || !Number.isInteger(sId) || sId <= 0) {
      return {
        EC: 1,
        EM: "Mã danh sách đi chợ không hợp lệ!",
        DT: null,
      };
    }

    const shoppingList = await db.ShoppingList.findByPk(sId);
    if (!shoppingList) {
      return {
        EC: 3,
        EM: "Không tìm thấy danh sách đi chợ!",
        DT: null,
      };
    }

    if (shoppingList.userId !== Number(userId)) {
      return {
        EC: 4,
        EM: "Bạn không có quyền xóa danh sách đi chợ này!",
        DT: null,
      };
    }

    await shoppingList.destroy();

    return {
      EC: 0,
      EM: "Đã xóa danh sách đi chợ!",
      DT: null,
    };
  } catch (error) {
    console.error("deleteShoppingList error:", error);
    return {
      EC: -1,
      EM: "Lỗi kết nối máy chủ!",
      DT: null,
    };
  }
};

/**
 * 7.8 Xóa các mặt hàng đã mua, giữ lại danh sách và các mặt hàng chưa mua (UC-18).
 */
const deletePurchasedItems = async (userId, shoppingListId) => {
  let transaction;
  try {
    if (!userId) {
      return { EC: 5, EM: "Chưa xác thực hoặc phiên đăng nhập đã hết hạn!", DT: null };
    }

    const sId = Number(shoppingListId);
    if ((isString(shoppingListId) && !/^[1-9][0-9]*$/.test(shoppingListId)) ||
        (!isString(shoppingListId) && !Number.isInteger(shoppingListId)) ||
        !Number.isInteger(sId) || sId <= 0 || sId > 2147483647) {
      return { EC: 1, EM: "Mã danh sách đi chợ không hợp lệ!", DT: null };
    }

    transaction = await db.sequelize.transaction();
    const shoppingList = await db.ShoppingList.findByPk(sId, { transaction });
    if (!shoppingList) {
      await transaction.rollback();
      return { EC: 3, EM: "Không tìm thấy danh sách đi chợ!", DT: null };
    }
    if (shoppingList.userId !== Number(userId)) {
      await transaction.rollback();
      return { EC: 4, EM: "Bạn không có quyền xóa mặt hàng trong danh sách đi chợ này!", DT: null };
    }

    const deletedItems = await db.ShoppingListItem.destroy({
      where: { shoppingListId: sId, isPurchased: true },
      transaction,
    });
    await transaction.commit();
    return {
      EC: 0,
      EM: "Đã xóa các mặt hàng đã mua!",
      DT: { shoppingListId: sId, deletedItems },
    };
  } catch (error) {
    if (transaction && !transaction.finished) {
      try {
        await transaction.rollback();
      } catch (rollbackError) {
        console.error("deletePurchasedItems rollback error:", rollbackError);
      }
    }
    console.error("deletePurchasedItems error:", error);
    return { EC: -1, EM: "Lỗi kết nối máy chủ!", DT: null };
  }
};

export default {
  getShoppingLists,
  generateShoppingList,
  getShoppingListDetail,
  updateShoppingListItemStatus,
  addShoppingListItem,
  updateShoppingListStatus,
  deleteShoppingList,
  deletePurchasedItems,
};


