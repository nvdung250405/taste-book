"use strict";

// Dữ liệu phát triển theo docs/seed-data-vietnamese-cuisine-proposal.md.

module.exports = {
  up: async (queryInterface) => {
    const now = new Date();
    const ingrCategoriesData = [
      {
        "id": 1,
        "categoryName": "Thịt & Gia cầm"
      },
      {
        "id": 2,
        "categoryName": "Thủy hải sản"
      },
      {
        "id": 3,
        "categoryName": "Trứng & Đậu phụ"
      },
      {
        "id": 4,
        "categoryName": "Rau xanh & Rau thơm"
      },
      {
        "id": 5,
        "categoryName": "Củ, Quả & Nấm"
      },
      {
        "id": 6,
        "categoryName": "Gia vị tươi"
      },
      {
        "id": 7,
        "categoryName": "Gia vị mặn, ngọt & Dầu ăn"
      },
      {
        "id": 8,
        "categoryName": "Tinh bột & Đồ khô"
      },
      {
        "id": 9,
        "categoryName": "Gạo & Ngũ cốc"
      },
      {
        "id": 10,
        "categoryName": "Đậu, Hạt & Sản phẩm từ hạt"
      },
      {
        "id": 11,
        "categoryName": "Trái cây & Nguyên liệu món ngọt"
      },
      {
        "id": 12,
        "categoryName": "Nước & Chất lỏng nấu ăn"
      },
      {
        "id": 13,
        "categoryName": "Gia vị khô & Thảo mộc khô"
      }
    ].map((row) => ({ ...row, createdAt: now, updatedAt: now }));
    const unitsData = [
      {
        "id": 1,
        "unitName": "g"
      },
      {
        "id": 2,
        "unitName": "kg"
      },
      {
        "id": 3,
        "unitName": "ml"
      },
      {
        "id": 4,
        "unitName": "lít"
      },
      {
        "id": 5,
        "unitName": "thìa cà phê"
      },
      {
        "id": 6,
        "unitName": "muỗng canh"
      },
      {
        "id": 7,
        "unitName": "chén"
      },
      {
        "id": 8,
        "unitName": "quả"
      },
      {
        "id": 9,
        "unitName": "củ"
      },
      {
        "id": 10,
        "unitName": "tép"
      },
      {
        "id": 11,
        "unitName": "cây"
      },
      {
        "id": 12,
        "unitName": "nhánh"
      },
      {
        "id": 13,
        "unitName": "bó"
      },
      {
        "id": 14,
        "unitName": "lát"
      },
      {
        "id": 15,
        "unitName": "con"
      },
      {
        "id": 16,
        "unitName": "miếng"
      },
      {
        "id": 17,
        "unitName": "gói"
      },
      {
        "id": 18,
        "unitName": "lon"
      },
      {
        "id": 19,
        "unitName": "chai"
      },
      {
        "id": 20,
        "unitName": "hộp"
      },
      {
        "id": 21,
        "unitName": "khúc"
      },
      {
        "id": 22,
        "unitName": "nắm"
      },
      {
        "id": 23,
        "unitName": "vừa đủ"
      },
      {
        "id": 24,
        "unitName": "tùy khẩu vị"
      },
      {
        "id": 25,
        "unitName": "cái"
      },
      {
        "id": 26,
        "unitName": "lá"
      },
      {
        "id": 27,
        "unitName": "bát"
      },
      {
        "id": 28,
        "unitName": "vá"
      },
      {
        "id": 29,
        "unitName": "giọt"
      }
    ].map((row) => ({ ...row, createdAt: now, updatedAt: now }));

    await queryInterface.bulkInsert("IngredientCategories", ingrCategoriesData);
    await queryInterface.bulkInsert("Units", unitsData);

    try {
      await queryInterface.sequelize.query(
        'SELECT setval(pg_get_serial_sequence(\'"IngredientCategories"\', \'id\'), coalesce(max(id), 1)) FROM "IngredientCategories";'
      );
      await queryInterface.sequelize.query(
        'SELECT setval(pg_get_serial_sequence(\'"Units"\', \'id\'), coalesce(max(id), 1)) FROM "Units";'
      );
    } catch (error) {
      console.error("Error setting sequence for Categories & Units:", error);
    }
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete("Units", null, {});
    await queryInterface.bulkDelete("IngredientCategories", null, {});
  },
};
