import db from "../models/index";
import { Op, Sequelize } from "sequelize";

// Dùng chung khóa giao dịch PostgreSQL khi ghi dữ liệu chuẩn và công thức.
// Lấy khóa trước khi đọc tham chiếu; READ COMMITTED đọc được thay đổi đã chốt của lượt ghi trước.
const lockMasterData = (transaction) => db.sequelize.query(
  "SELECT pg_advisory_xact_lock(2102223)", { transaction },
);

const withMasterDataTransaction = async (work) => {
  let transaction;
  try {
    transaction = await db.sequelize.transaction({ isolationLevel: "READ COMMITTED" });
    await lockMasterData(transaction);
    const result = await work(transaction);
    if (result.EC === 0) await transaction.commit();
    else await transaction.rollback();
    return result;
  } catch (error) {
    if (transaction && !transaction.finished) await transaction.rollback();
    if (error.name === "SequelizeUniqueConstraintError") {
      return { EC: 2, EM: "Tên dữ liệu đã tồn tại!", DT: null };
    }
    if (error.name === "SequelizeForeignKeyConstraintError") {
      return { EC: 2, EM: "Dữ liệu liên quan đã thay đổi hoặc đang được sử dụng!", DT: null };
    }
    console.log("masterData transaction error:", error);
    return { EC: -1, EM: "Lỗi kết nối máy chủ!", DT: null };
  }
};

const isMasterDataId = (value) =>
  (typeof value === "number" || (typeof value === "string" && /^\d+$/.test(value))) &&
  Number.isSafeInteger(Number(value)) && Number(value) > 0;

const isMasterDataName = (value, maxLength = 255) =>
  typeof value === "string" && value.trim().length > 0 && value.trim().length <= maxLength;

const QUALITATIVE_UNITS = ["vừa đủ", "tùy khẩu vị", "vừa vừa", "nêm nếm"];

const isQualitativeUnit = (unitName) =>
  QUALITATIVE_UNITS.includes(
    String(unitName || "")
      .normalize("NFC")
      .trim()
      .replace(/\s+/g, " ")
      .toLowerCase(),
  );

// 3.7 GET /api/v1/units - Lấy danh sách đơn vị đo (UC-23)
const getUnits = async () => {
  try {
    let units = await db.Unit.findAll({
      attributes: [["id", "unitId"], "unitName"],
      order: [["id", "ASC"]],
    });

    return {
      EC: 0,
      EM: "Thành công!",
      DT: units,
    };
  } catch (e) {
    console.log("getUnits error:", e);
    return {
      EC: -1,
      EM: "Lỗi kết nối máy chủ!",
      DT: null,
    };
  }
};

// 3.8 POST /api/v1/admin/units - Thêm đơn vị đo mới (UC-23)
const createAdminUnit = async (data) => {
  return withMasterDataTransaction(async (transaction) => {
    if (!data || !isMasterDataName(data.unitName, 30)) {
      return {
        EC: 1,
        EM: "Tên đơn vị không được để trống!",
        DT: null,
      };
    }

    let cleanName = data.unitName.trim();

    // Kiểm tra trùng tên đơn vị đo (không phân biệt hoa thường và dấu tiếng Việt)
    let exist = await db.Unit.findOne({
      transaction,
      where: Sequelize.where(
        Sequelize.fn("unaccent", Sequelize.col("unitName")),
        {
          [Op.iLike]: Sequelize.fn("unaccent", cleanName),
        },
      ),
    });

    if (exist) {
      return {
        EC: 2,
        EM: "Đơn vị đo lường này đã có trên hệ thống!",
        DT: null,
      };
    }

    let newUnit = await db.Unit.create({
      unitName: cleanName,
    }, { transaction });

    return {
      EC: 0,
      EM: "Thêm đơn vị đo thành công!",
      DT: {
        unitId: newUnit.id,
        unitName: newUnit.unitName,
      },
    };
  });
};

// 3.9 PUT /api/v1/admin/units/:unitId - Sửa đơn vị đo (UC-23)
const updateAdminUnit = async (unitId, data) => {
  return withMasterDataTransaction(async (transaction) => {
    if (!data || !isMasterDataName(data.unitName, 30)) {
      return {
        EC: 1,
        EM: "Tên đơn vị không được để trống!",
        DT: null,
      };
    }

    let id = Number(unitId);
    if (!isMasterDataId(unitId)) {
      return {
        EC: 3,
        EM: "Không tìm thấy đơn vị đo lường!",
        DT: null,
      };
    }

    let unit = await db.Unit.findOne({ transaction, where: { id } });
    if (!unit) {
      return {
        EC: 3,
        EM: "Không tìm thấy đơn vị đo lường!",
        DT: null,
      };
    }

    let cleanName = data.unitName.trim();

    // Kiểm tra trùng tên đơn vị đo khác (không phân biệt hoa thường và dấu tiếng Việt)
    let exist = await db.Unit.findOne({
      transaction,
      where: {
        id: { [Op.ne]: id },
        [Op.and]: [
          Sequelize.where(Sequelize.fn("unaccent", Sequelize.col("unitName")), {
            [Op.iLike]: Sequelize.fn("unaccent", cleanName),
          }),
        ],
      },
    });

    if (exist) {
      return {
        EC: 2,
        EM: "Đơn vị đo lường này đã có trên hệ thống!",
        DT: null,
      };
    }

    unit.unitName = cleanName;
    await unit.save({ transaction });

    return {
      EC: 0,
      EM: "Cập nhật đơn vị thành công!",
      DT: null,
    };
  });
};

// 3.10 DELETE /api/v1/admin/units/:unitId - Xóa đơn vị đo (UC-23)
const deleteAdminUnit = async (unitId) => {
  return withMasterDataTransaction(async (transaction) => {
    let id = Number(unitId);
    if (!isMasterDataId(unitId)) {
      return {
        EC: 3,
        EM: "Không tìm thấy đơn vị đo lường!",
        DT: null,
      };
    }

    let unit = await db.Unit.findOne({ transaction, where: { id } });
    if (!unit) {
      return {
        EC: 3,
        EM: "Không tìm thấy đơn vị đo lường!",
        DT: null,
      };
    }

    const usage = await db.RecipeIngredient.count({
      where: { unitId: id },
      include: [{ model: db.Recipe, as: "recipe", required: true, where: { isDeleted: false } }],
      transaction,
    });
    const defaults = await db.Ingredient.count({ where: { defaultUnitId: id }, transaction });
    if (usage > 0 || defaults > 0) {
      return { EC: 2, EM: "Không thể xóa đơn vị đang được công thức hoạt động hoặc nguyên liệu chuẩn sử dụng!", DT: null };
    }
    // Lưu tên đơn vị để giữ lịch sử cho công thức đã xóa mềm.
    await db.RecipeIngredient.update(
      { customUnit: unit.unitName },
      {
        where: {
          unitId: id,
        },
        validate: false,
        transaction,
      },
    );

    await unit.destroy({ transaction });

    return {
      EC: 0,
      EM: "Xóa đơn vị đo lường thành công!",
      DT: null,
    };
  });
};

module.exports = {
  lockMasterData,
  withMasterDataTransaction,
  isMasterDataId,
  isMasterDataName,
  isQualitativeUnit,
  getUnits,
  createAdminUnit,
  updateAdminUnit,
  deleteAdminUnit,
};
