"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const now = new Date();
    const ingrCategoriesData = [
      {
            "id": 1,
            "categoryName": "Thịt & Gia cầm",
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 2,
            "categoryName": "Thủy hải sản",
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 3,
            "categoryName": "Trứng & Đậu phụ",
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 4,
            "categoryName": "Rau xanh & Rau thơm",
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 5,
            "categoryName": "Củ, Quả & Nấm",
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 6,
            "categoryName": "Gia vị tươi",
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 7,
            "categoryName": "Gia vị mặn, ngọt & Dầu ăn",
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 8,
            "categoryName": "Tinh bột & Đồ khô",
            "createdAt": now,
            "updatedAt": now
      }
];
    const unitsData = [
      {
            "id": 1,
            "unitName": "g",
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 2,
            "unitName": "kg",
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 3,
            "unitName": "ml",
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 4,
            "unitName": "lít",
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 5,
            "unitName": "thìa cà phê",
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 6,
            "unitName": "muỗng canh",
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 7,
            "unitName": "chén",
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 8,
            "unitName": "quả",
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 9,
            "unitName": "củ",
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 10,
            "unitName": "tép",
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 11,
            "unitName": "cây",
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 12,
            "unitName": "nhánh",
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 13,
            "unitName": "bó",
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 14,
            "unitName": "lát",
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 15,
            "unitName": "con",
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 16,
            "unitName": "miếng",
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 17,
            "unitName": "gói",
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 18,
            "unitName": "lon",
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 19,
            "unitName": "chai",
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 20,
            "unitName": "hộp",
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 21,
            "unitName": "khúc",
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 22,
            "unitName": "nắm",
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 23,
            "unitName": "vừa đủ",
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 24,
            "unitName": "tùy khẩu vị",
            "createdAt": now,
            "updatedAt": now
      }
];

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

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("Units", null, {});
    await queryInterface.bulkDelete("IngredientCategories", null, {});
  },
};
