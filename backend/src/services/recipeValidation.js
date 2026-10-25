import db from "../models/index";
import { Op } from "sequelize";
import { isQualitativeUnit, lockMasterData } from "./unitService";

// Kiểm tra trước giao dịch chỉ giúp báo lỗi sớm. Kiểm tra lại sau khi lấy khóa
// dùng chung để tránh ghi tham chiếu vừa bị xóa hoặc đổi đơn vị mặc định đồng thời.
const validateLockedReferences = async (transaction, categoryIds, ingredients) => {
  await lockMasterData(transaction);
  const categories = await db.Category.findAll({
    where: { id: { [Op.in]: categoryIds } }, transaction,
  });
  if (categories.length !== categoryIds.length) {
    return { EC: 1, EM: "Danh mục đã thay đổi hoặc không còn tồn tại!", DT: null };
  }
  for (const [index, item] of ingredients.entries()) {
    if (item.ingredientId) {
      const ingredient = await db.Ingredient.findByPk(item.ingredientId, { transaction });
      if (!ingredient || Number(ingredient.defaultUnitId) !== Number(item.unitId)) {
        return { EC: 1, EM: "Nguyên liệu hoặc đơn vị mặc định đã thay đổi, vui lòng tải lại dữ liệu!", DT: null };
      }
    }
    let unitName = item.customUnit || "";
    if (item.unitId) {
      const unit = await db.Unit.findByPk(item.unitId, { transaction });
      if (!unit) return { EC: 1, EM: "Đơn vị đo không còn tồn tại!", DT: null };
      unitName = unit.unitName;
    }
    const error = ingredientQuantityError(item.quantity, unitName, index + 1);
    if (error) return error;
  }
  return null;
};

const isPositiveInteger = (value) =>
  (Number.isInteger(value) || value === String(value)) &&
  Number.isInteger(Number(value)) &&
  Number(value) > 0;

const systemIngredientUnitError = (ingredient, input) => {
  const hasUnitId = input.unitId !== undefined && input.unitId !== null;
  const hasCustomUnit =
    input.customUnit !== undefined &&
    input.customUnit !== null &&
    String(input.customUnit).trim() !== "";
  if (
    hasCustomUnit ||
    (hasUnitId &&
      (!isPositiveInteger(input.unitId) ||
        Number(input.unitId) !== Number(ingredient.defaultUnitId)))
  ) {
    return {
      EC: 1,
      EM: "Nguyên liệu hệ thống chỉ được sử dụng đơn vị đo mặc định của hệ thống!",
      DT: null,
    };
  }
  return null;
};

const cookingStepsError = (steps) => {
  const seen = new Set();
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    const stepNumber = step?.stepNumber === undefined ? i + 1 : step.stepNumber;
    if (!isPositiveInteger(stepNumber)) {
      return {
        EC: 1,
        EM: `Số thứ tự bước làm ở vị trí ${i + 1} phải là số nguyên dương!`,
        DT: null,
      };
    }
    const number = Number(stepNumber);
    if (seen.has(number)) {
      return {
        EC: 1,
        EM: `Số thứ tự bước làm ${number} bị trùng trong công thức!`,
        DT: null,
      };
    }
    seen.add(number);
    if (!step?.instruction || !String(step.instruction).trim()) {
      return {
        EC: 1,
        EM: `Nội dung bước làm thứ ${number} không được để trống!`,
        DT: null,
      };
    }
  }
  return null;
};

const ingredientQuantityError = (quantity, unitName, position) => {
  const value = Number(quantity);
  if (
    quantity === undefined ||
    quantity === null ||
    String(quantity).trim() === "" ||
    !Number.isFinite(value) ||
    value < 0 ||
    (value === 0 && !isQualitativeUnit(unitName))
  ) {
    return {
      EC: 1,
      EM: `Định lượng nguyên liệu ở vị trí ${position} phải lớn hơn 0; chỉ đơn vị định tính mới được dùng 0!`,
      DT: null,
    };
  }
  return null;
};

// Hàm kiểm tra chuỗi có chứa dấu tiếng Việt hay không
const hasVietnameseAccents = (str) => {
  return /[\u0300-\u036fàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(
    str,
  );
};

export { validateLockedReferences, isPositiveInteger, systemIngredientUnitError, cookingStepsError, ingredientQuantityError, hasVietnameseAccents };
