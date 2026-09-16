"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const now = new Date();
    const data = [
      {
            "id": 1,
            "ingredientName": "Thịt ba chỉ heo",
            "ingredientCategoryId": 1,
            "defaultUnitId": 1,
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 2,
            "ingredientName": "Thịt bò phi-lê",
            "ingredientCategoryId": 1,
            "defaultUnitId": 1,
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 3,
            "ingredientName": "Nạm bò",
            "ingredientCategoryId": 1,
            "defaultUnitId": 1,
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 4,
            "ingredientName": "Xương ống bò",
            "ingredientCategoryId": 1,
            "defaultUnitId": 2,
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 5,
            "ingredientName": "Thịt gà ta",
            "ingredientCategoryId": 1,
            "defaultUnitId": 1,
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 6,
            "ingredientName": "Sườn heo non",
            "ingredientCategoryId": 1,
            "defaultUnitId": 1,
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 7,
            "ingredientName": "Cá lóc (cá quả)",
            "ingredientCategoryId": 2,
            "defaultUnitId": 1,
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 8,
            "ingredientName": "Tôm sú tươi",
            "ingredientCategoryId": 2,
            "defaultUnitId": 15,
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 9,
            "ingredientName": "Mực ống",
            "ingredientCategoryId": 2,
            "defaultUnitId": 1,
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 10,
            "ingredientName": "Trứng gà",
            "ingredientCategoryId": 3,
            "defaultUnitId": 8,
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 11,
            "ingredientName": "Trứng cút",
            "ingredientCategoryId": 3,
            "defaultUnitId": 8,
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 12,
            "ingredientName": "Đậu phụ trắng",
            "ingredientCategoryId": 3,
            "defaultUnitId": 16,
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 13,
            "ingredientName": "Rau muống",
            "ingredientCategoryId": 4,
            "defaultUnitId": 13,
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 14,
            "ingredientName": "Hành lá",
            "ingredientCategoryId": 4,
            "defaultUnitId": 12,
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 15,
            "ingredientName": "Ngò rí (rau mùi)",
            "ingredientCategoryId": 4,
            "defaultUnitId": 12,
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 16,
            "ingredientName": "Rau ngổ (ngò om)",
            "ingredientCategoryId": 4,
            "defaultUnitId": 12,
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 17,
            "ingredientName": "Húng quế",
            "ingredientCategoryId": 4,
            "defaultUnitId": 12,
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 18,
            "ingredientName": "Giá đỗ",
            "ingredientCategoryId": 4,
            "defaultUnitId": 1,
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 19,
            "ingredientName": "Cà chua",
            "ingredientCategoryId": 5,
            "defaultUnitId": 8,
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 20,
            "ingredientName": "Dứa (thơm)",
            "ingredientCategoryId": 5,
            "defaultUnitId": 8,
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 21,
            "ingredientName": "Đậu bắp",
            "ingredientCategoryId": 5,
            "defaultUnitId": 1,
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 22,
            "ingredientName": "Bạc hà (dọc mùng)",
            "ingredientCategoryId": 5,
            "defaultUnitId": 11,
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 23,
            "ingredientName": "Cà rốt",
            "ingredientCategoryId": 5,
            "defaultUnitId": 9,
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 24,
            "ingredientName": "Khoai tây",
            "ingredientCategoryId": 5,
            "defaultUnitId": 9,
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 25,
            "ingredientName": "Hành tây",
            "ingredientCategoryId": 5,
            "defaultUnitId": 9,
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 26,
            "ingredientName": "Nấm rơm",
            "ingredientCategoryId": 5,
            "defaultUnitId": 1,
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 27,
            "ingredientName": "Nấm hương khô",
            "ingredientCategoryId": 5,
            "defaultUnitId": 1,
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 28,
            "ingredientName": "Tỏi khô",
            "ingredientCategoryId": 6,
            "defaultUnitId": 10,
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 29,
            "ingredientName": "Hành tím",
            "ingredientCategoryId": 6,
            "defaultUnitId": 9,
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 30,
            "ingredientName": "Gừng tươi",
            "ingredientCategoryId": 6,
            "defaultUnitId": 9,
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 31,
            "ingredientName": "Sả cây",
            "ingredientCategoryId": 6,
            "defaultUnitId": 11,
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 32,
            "ingredientName": "Ớt hiểm",
            "ingredientCategoryId": 6,
            "defaultUnitId": 8,
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 33,
            "ingredientName": "Chanh tươi",
            "ingredientCategoryId": 6,
            "defaultUnitId": 8,
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 34,
            "ingredientName": "Nước mắm truyền thống",
            "ingredientCategoryId": 7,
            "defaultUnitId": 6,
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 35,
            "ingredientName": "Hạt nêm",
            "ingredientCategoryId": 7,
            "defaultUnitId": 5,
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 36,
            "ingredientName": "Muối tinh",
            "ingredientCategoryId": 7,
            "defaultUnitId": 5,
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 37,
            "ingredientName": "Đường cát trắng",
            "ingredientCategoryId": 7,
            "defaultUnitId": 6,
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 38,
            "ingredientName": "Tiêu đen xay",
            "ingredientCategoryId": 7,
            "defaultUnitId": 5,
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 39,
            "ingredientName": "Dầu ăn",
            "ingredientCategoryId": 7,
            "defaultUnitId": 6,
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 40,
            "ingredientName": "Dầu hào",
            "ingredientCategoryId": 7,
            "defaultUnitId": 6,
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 41,
            "ingredientName": "Nước tương (xì dầu)",
            "ingredientCategoryId": 7,
            "defaultUnitId": 6,
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 42,
            "ingredientName": "Me chua chín",
            "ingredientCategoryId": 7,
            "defaultUnitId": 1,
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 43,
            "ingredientName": "Nước dừa tươi",
            "ingredientCategoryId": 7,
            "defaultUnitId": 7,
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 44,
            "ingredientName": "Hoa hồi & Quế khô",
            "ingredientCategoryId": 7,
            "defaultUnitId": 1,
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 45,
            "ingredientName": "Bánh phở tươi",
            "ingredientCategoryId": 8,
            "defaultUnitId": 1,
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 46,
            "ingredientName": "Bún tươi",
            "ingredientCategoryId": 8,
            "defaultUnitId": 1,
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 47,
            "ingredientName": "Đậu phộng (lạc rang)",
            "ingredientCategoryId": 8,
            "defaultUnitId": 1,
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 48,
            "ingredientName": "Bột năng",
            "ingredientCategoryId": 8,
            "defaultUnitId": 1,
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 49,
            "ingredientName": "Bột ngọt (mì chính)",
            "ingredientCategoryId": 7,
            "defaultUnitId": 5,
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 50,
            "ingredientName": "Thịt nạc heo xay",
            "ingredientCategoryId": 1,
            "defaultUnitId": 1,
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 51,
            "ingredientName": "Giấm gạo",
            "ingredientCategoryId": 7,
            "defaultUnitId": 6,
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 52,
            "ingredientName": "Rau xà lách",
            "ingredientCategoryId": 4,
            "defaultUnitId": 1,
            "createdAt": now,
            "updatedAt": now
      }
];

    await queryInterface.bulkInsert("Ingredients", data);

    try {
      await queryInterface.sequelize.query(
        'SELECT setval(pg_get_serial_sequence(\'"Ingredients"\', \'id\'), coalesce(max(id), 1)) FROM "Ingredients";'
      );
    } catch (error) {
      console.error("Error setting sequence for Ingredients:", error);
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("Ingredients", null, {});
  },
};
