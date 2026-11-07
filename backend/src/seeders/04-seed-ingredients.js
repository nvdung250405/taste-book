"use strict";

// Dữ liệu phát triển theo docs/seed-data-vietnamese-cuisine-proposal.md.

module.exports = {
  up: async (queryInterface) => {
    const now = new Date();
    const data = [
      {
        "id": 1,
        "ingredientName": "Thịt ba chỉ heo",
        "ingredientCategoryId": 1,
        "defaultUnitId": 1
      },
      {
        "id": 2,
        "ingredientName": "Thịt bò phi-lê",
        "ingredientCategoryId": 1,
        "defaultUnitId": 1
      },
      {
        "id": 3,
        "ingredientName": "Nạm bò",
        "ingredientCategoryId": 1,
        "defaultUnitId": 1
      },
      {
        "id": 4,
        "ingredientName": "Xương ống bò",
        "ingredientCategoryId": 1,
        "defaultUnitId": 1
      },
      {
        "id": 5,
        "ingredientName": "Thịt gà ta",
        "ingredientCategoryId": 1,
        "defaultUnitId": 1
      },
      {
        "id": 6,
        "ingredientName": "Sườn heo non",
        "ingredientCategoryId": 1,
        "defaultUnitId": 1
      },
      {
        "id": 7,
        "ingredientName": "Cá lóc (cá quả)",
        "ingredientCategoryId": 2,
        "defaultUnitId": 1
      },
      {
        "id": 8,
        "ingredientName": "Tôm sú tươi",
        "ingredientCategoryId": 2,
        "defaultUnitId": 1
      },
      {
        "id": 9,
        "ingredientName": "Mực ống",
        "ingredientCategoryId": 2,
        "defaultUnitId": 1
      },
      {
        "id": 10,
        "ingredientName": "Trứng gà",
        "ingredientCategoryId": 3,
        "defaultUnitId": 8
      },
      {
        "id": 11,
        "ingredientName": "Trứng cút",
        "ingredientCategoryId": 3,
        "defaultUnitId": 8
      },
      {
        "id": 12,
        "ingredientName": "Đậu phụ trắng",
        "ingredientCategoryId": 3,
        "defaultUnitId": 1
      },
      {
        "id": 13,
        "ingredientName": "Rau muống",
        "ingredientCategoryId": 4,
        "defaultUnitId": 1
      },
      {
        "id": 14,
        "ingredientName": "Hành lá",
        "ingredientCategoryId": 4,
        "defaultUnitId": 1
      },
      {
        "id": 15,
        "ingredientName": "Ngò rí (rau mùi)",
        "ingredientCategoryId": 4,
        "defaultUnitId": 1
      },
      {
        "id": 16,
        "ingredientName": "Rau ngổ (ngò om)",
        "ingredientCategoryId": 4,
        "defaultUnitId": 1
      },
      {
        "id": 17,
        "ingredientName": "Húng quế",
        "ingredientCategoryId": 4,
        "defaultUnitId": 1
      },
      {
        "id": 18,
        "ingredientName": "Giá đỗ",
        "ingredientCategoryId": 4,
        "defaultUnitId": 1
      },
      {
        "id": 19,
        "ingredientName": "Cà chua",
        "ingredientCategoryId": 5,
        "defaultUnitId": 1
      },
      {
        "id": 20,
        "ingredientName": "Dứa (thơm)",
        "ingredientCategoryId": 5,
        "defaultUnitId": 1
      },
      {
        "id": 21,
        "ingredientName": "Đậu bắp",
        "ingredientCategoryId": 5,
        "defaultUnitId": 1
      },
      {
        "id": 22,
        "ingredientName": "Bạc hà (dọc mùng)",
        "ingredientCategoryId": 5,
        "defaultUnitId": 1
      },
      {
        "id": 23,
        "ingredientName": "Cà rốt",
        "ingredientCategoryId": 5,
        "defaultUnitId": 1
      },
      {
        "id": 24,
        "ingredientName": "Khoai tây",
        "ingredientCategoryId": 5,
        "defaultUnitId": 1
      },
      {
        "id": 25,
        "ingredientName": "Hành tây",
        "ingredientCategoryId": 5,
        "defaultUnitId": 1
      },
      {
        "id": 26,
        "ingredientName": "Nấm rơm",
        "ingredientCategoryId": 5,
        "defaultUnitId": 1
      },
      {
        "id": 27,
        "ingredientName": "Nấm hương khô",
        "ingredientCategoryId": 5,
        "defaultUnitId": 1
      },
      {
        "id": 28,
        "ingredientName": "Tỏi khô",
        "ingredientCategoryId": 6,
        "defaultUnitId": 1
      },
      {
        "id": 29,
        "ingredientName": "Hành tím",
        "ingredientCategoryId": 6,
        "defaultUnitId": 1
      },
      {
        "id": 30,
        "ingredientName": "Gừng tươi",
        "ingredientCategoryId": 6,
        "defaultUnitId": 1
      },
      {
        "id": 31,
        "ingredientName": "Sả cây",
        "ingredientCategoryId": 6,
        "defaultUnitId": 1
      },
      {
        "id": 32,
        "ingredientName": "Ớt hiểm",
        "ingredientCategoryId": 6,
        "defaultUnitId": 1
      },
      {
        "id": 33,
        "ingredientName": "Chanh tươi",
        "ingredientCategoryId": 6,
        "defaultUnitId": 8
      },
      {
        "id": 34,
        "ingredientName": "Nước mắm truyền thống",
        "ingredientCategoryId": 7,
        "defaultUnitId": 3
      },
      {
        "id": 35,
        "ingredientName": "Hạt nêm",
        "ingredientCategoryId": 7,
        "defaultUnitId": 1
      },
      {
        "id": 36,
        "ingredientName": "Muối tinh",
        "ingredientCategoryId": 7,
        "defaultUnitId": 1
      },
      {
        "id": 37,
        "ingredientName": "Đường cát trắng",
        "ingredientCategoryId": 7,
        "defaultUnitId": 1
      },
      {
        "id": 38,
        "ingredientName": "Tiêu đen xay",
        "ingredientCategoryId": 13,
        "defaultUnitId": 1
      },
      {
        "id": 39,
        "ingredientName": "Dầu ăn",
        "ingredientCategoryId": 7,
        "defaultUnitId": 3
      },
      {
        "id": 40,
        "ingredientName": "Dầu hào",
        "ingredientCategoryId": 7,
        "defaultUnitId": 3
      },
      {
        "id": 41,
        "ingredientName": "Nước tương (xì dầu)",
        "ingredientCategoryId": 7,
        "defaultUnitId": 3
      },
      {
        "id": 42,
        "ingredientName": "Me chua chín",
        "ingredientCategoryId": 7,
        "defaultUnitId": 1
      },
      {
        "id": 43,
        "ingredientName": "Nước dừa tươi",
        "ingredientCategoryId": 12,
        "defaultUnitId": 3
      },
      {
        "id": 44,
        "ingredientName": "Hoa hồi & Quế khô",
        "ingredientCategoryId": 13,
        "defaultUnitId": 1
      },
      {
        "id": 45,
        "ingredientName": "Bánh phở tươi",
        "ingredientCategoryId": 8,
        "defaultUnitId": 1
      },
      {
        "id": 46,
        "ingredientName": "Bún tươi",
        "ingredientCategoryId": 8,
        "defaultUnitId": 1
      },
      {
        "id": 47,
        "ingredientName": "Đậu phộng (lạc rang)",
        "ingredientCategoryId": 10,
        "defaultUnitId": 1
      },
      {
        "id": 48,
        "ingredientName": "Bột năng",
        "ingredientCategoryId": 8,
        "defaultUnitId": 1
      },
      {
        "id": 49,
        "ingredientName": "Bột ngọt (mì chính)",
        "ingredientCategoryId": 7,
        "defaultUnitId": 1
      },
      {
        "id": 50,
        "ingredientName": "Thịt nạc heo xay",
        "ingredientCategoryId": 1,
        "defaultUnitId": 1
      },
      {
        "id": 51,
        "ingredientName": "Giấm gạo",
        "ingredientCategoryId": 7,
        "defaultUnitId": 3
      },
      {
        "id": 52,
        "ingredientName": "Rau xà lách",
        "ingredientCategoryId": 4,
        "defaultUnitId": 1
      },
      {
        "id": 53,
        "ingredientName": "Nước lọc",
        "ingredientCategoryId": 12,
        "defaultUnitId": 3
      },
      {
        "id": 54,
        "ingredientName": "Hoa hồi khô",
        "ingredientCategoryId": 13,
        "defaultUnitId": 1
      },
      {
        "id": 55,
        "ingredientName": "Quế thanh",
        "ingredientCategoryId": 13,
        "defaultUnitId": 1
      },
      {
        "id": 56,
        "ingredientName": "Hạt mùi khô",
        "ingredientCategoryId": 13,
        "defaultUnitId": 1
      },
      {
        "id": 57,
        "ingredientName": "Ớt chuông đỏ",
        "ingredientCategoryId": 5,
        "defaultUnitId": 1
      },
      {
        "id": 58,
        "ingredientName": "Dưa leo",
        "ingredientCategoryId": 5,
        "defaultUnitId": 1
      },
      {
        "id": 59,
        "ingredientName": "Đu đủ xanh",
        "ingredientCategoryId": 5,
        "defaultUnitId": 1
      },
      {
        "id": 60,
        "ingredientName": "Nước cốt chanh tươi",
        "ingredientCategoryId": 6,
        "defaultUnitId": 3
      },
      {
        "id": 61,
        "ingredientName": "Rau tía tô",
        "ingredientCategoryId": 4,
        "defaultUnitId": 1
      },
      {
        "id": 62,
        "ingredientName": "Rau kinh giới",
        "ingredientCategoryId": 4,
        "defaultUnitId": 1
      },
      {
        "id": 63,
        "ingredientName": "Mộc nhĩ khô",
        "ingredientCategoryId": 8,
        "defaultUnitId": 1
      },
      {
        "id": 64,
        "ingredientName": "Miến dong khô",
        "ingredientCategoryId": 8,
        "defaultUnitId": 1
      },
      {
        "id": 65,
        "ingredientName": "Bánh đa nem",
        "ingredientCategoryId": 8,
        "defaultUnitId": 1
      },
      {
        "id": 66,
        "ingredientName": "Cá lăng phi-lê",
        "ingredientCategoryId": 2,
        "defaultUnitId": 1
      },
      {
        "id": 67,
        "ingredientName": "Thì là",
        "ingredientCategoryId": 4,
        "defaultUnitId": 1
      },
      {
        "id": 68,
        "ingredientName": "Riềng tươi",
        "ingredientCategoryId": 6,
        "defaultUnitId": 1
      },
      {
        "id": 69,
        "ingredientName": "Cơm mẻ",
        "ingredientCategoryId": 7,
        "defaultUnitId": 1
      },
      {
        "id": 70,
        "ingredientName": "Bột nghệ",
        "ingredientCategoryId": 13,
        "defaultUnitId": 1
      },
      {
        "id": 71,
        "ingredientName": "Gạo nếp",
        "ingredientCategoryId": 9,
        "defaultUnitId": 1
      },
      {
        "id": 72,
        "ingredientName": "Lá cẩm tím",
        "ingredientCategoryId": 4,
        "defaultUnitId": 1
      },
      {
        "id": 73,
        "ingredientName": "Lá dứa (lá nếp)",
        "ingredientCategoryId": 4,
        "defaultUnitId": 1
      },
      {
        "id": 74,
        "ingredientName": "Thịt gấc",
        "ingredientCategoryId": 11,
        "defaultUnitId": 1
      },
      {
        "id": 75,
        "ingredientName": "Nghệ tươi",
        "ingredientCategoryId": 6,
        "defaultUnitId": 1
      },
      {
        "id": 76,
        "ingredientName": "Bắp bò",
        "ingredientCategoryId": 1,
        "defaultUnitId": 1
      },
      {
        "id": 77,
        "ingredientName": "Giò heo",
        "ingredientCategoryId": 1,
        "defaultUnitId": 1
      },
      {
        "id": 78,
        "ingredientName": "Mắm ruốc Huế",
        "ingredientCategoryId": 7,
        "defaultUnitId": 1
      },
      {
        "id": 79,
        "ingredientName": "Dầu màu điều",
        "ingredientCategoryId": 7,
        "defaultUnitId": 3
      },
      {
        "id": 80,
        "ingredientName": "Ớt bột",
        "ingredientCategoryId": 13,
        "defaultUnitId": 1
      },
      {
        "id": 81,
        "ingredientName": "Bắp chuối bào",
        "ingredientCategoryId": 4,
        "defaultUnitId": 1
      },
      {
        "id": 82,
        "ingredientName": "Sợi mì Quảng tươi",
        "ingredientCategoryId": 8,
        "defaultUnitId": 1
      },
      {
        "id": 83,
        "ingredientName": "Bánh tráng mè nướng",
        "ingredientCategoryId": 8,
        "defaultUnitId": 1
      },
      {
        "id": 84,
        "ingredientName": "Gạo tẻ",
        "ingredientCategoryId": 9,
        "defaultUnitId": 1
      },
      {
        "id": 85,
        "ingredientName": "Rau răm",
        "ingredientCategoryId": 4,
        "defaultUnitId": 1
      },
      {
        "id": 86,
        "ingredientName": "Bột gạo",
        "ingredientCategoryId": 8,
        "defaultUnitId": 1
      },
      {
        "id": 87,
        "ingredientName": "Mắc khén",
        "ingredientCategoryId": 13,
        "defaultUnitId": 1
      },
      {
        "id": 88,
        "ingredientName": "Nước cốt dừa",
        "ingredientCategoryId": 11,
        "defaultUnitId": 3
      },
      {
        "id": 89,
        "ingredientName": "Rau cải xanh",
        "ingredientCategoryId": 4,
        "defaultUnitId": 1
      },
      {
        "id": 90,
        "ingredientName": "Bánh tráng cuốn",
        "ingredientCategoryId": 8,
        "defaultUnitId": 1
      },
      {
        "id": 91,
        "ingredientName": "Tương hột",
        "ingredientCategoryId": 7,
        "defaultUnitId": 1
      },
      {
        "id": 92,
        "ingredientName": "Cá hú",
        "ingredientCategoryId": 2,
        "defaultUnitId": 1
      },
      {
        "id": 93,
        "ingredientName": "Sườn cốt lết heo",
        "ingredientCategoryId": 1,
        "defaultUnitId": 1
      },
      {
        "id": 94,
        "ingredientName": "Gạo tấm",
        "ingredientCategoryId": 9,
        "defaultUnitId": 1
      },
      {
        "id": 95,
        "ingredientName": "Mật ong",
        "ingredientCategoryId": 7,
        "defaultUnitId": 1
      },
      {
        "id": 96,
        "ingredientName": "Nấm đùi gà",
        "ingredientCategoryId": 5,
        "defaultUnitId": 1
      },
      {
        "id": 97,
        "ingredientName": "Nấm bào ngư",
        "ingredientCategoryId": 5,
        "defaultUnitId": 1
      },
      {
        "id": 98,
        "ingredientName": "Chuối sứ chín",
        "ingredientCategoryId": 11,
        "defaultUnitId": 1
      },
      {
        "id": 99,
        "ingredientName": "Bột báng",
        "ingredientCategoryId": 8,
        "defaultUnitId": 1
      },
      {
        "id": 100,
        "ingredientName": "Mè trắng rang",
        "ingredientCategoryId": 10,
        "defaultUnitId": 1
      },
      {
        "id": 101,
        "ingredientName": "Bí đỏ",
        "ingredientCategoryId": 5,
        "defaultUnitId": 1
      },
      {
        "id": 102,
        "ingredientName": "Đậu xanh cà vỏ",
        "ingredientCategoryId": 10,
        "defaultUnitId": 1
      },
      {
        "id": 103,
        "ingredientName": "Nước mắm chay",
        "ingredientCategoryId": 7,
        "defaultUnitId": 3
      }
    ].map((row) => ({ ...row, createdAt: now, updatedAt: now }));

    await queryInterface.bulkInsert("Ingredients", data);

    try {
      await queryInterface.sequelize.query(
        'SELECT setval(pg_get_serial_sequence(\'"Ingredients"\', \'id\'), coalesce(max(id), 1)) FROM "Ingredients";'
      );
    } catch (error) {
      console.error("Error setting sequence for Ingredients:", error);
    }
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete("Ingredients", null, {});
  },
};
