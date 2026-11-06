"use strict";

// Dữ liệu phát triển theo docs/seed-data-vietnamese-cuisine-proposal.md.

module.exports = {
  up: async (queryInterface) => {
    const now = new Date();
    const data = [
      {
        "id": 1,
        "categoryName": "Món chính",
        "createdBy": null
      },
      {
        "id": 2,
        "categoryName": "Món canh",
        "createdBy": null
      },
      {
        "id": 3,
        "categoryName": "Món kho",
        "createdBy": null
      },
      {
        "id": 4,
        "categoryName": "Món xào",
        "createdBy": null
      },
      {
        "id": 5,
        "categoryName": "Bún - Mì - Phở",
        "createdBy": null
      },
      {
        "id": 6,
        "categoryName": "Món khai vị & Ăn vặt",
        "createdBy": null
      },
      {
        "id": 7,
        "categoryName": "Món chay",
        "createdBy": null
      },
      {
        "id": 8,
        "categoryName": "Món tráng miệng & Đồ uống",
        "createdBy": null
      },
      {
        "id": 9,
        "categoryName": "Đóng góp của cộng đồng",
        "createdBy": null
      },
      {
        "id": 10,
        "categoryName": "Món nướng",
        "createdBy": null
      },
      {
        "id": 11,
        "categoryName": "Món chiên",
        "createdBy": null
      },
      {
        "id": 12,
        "categoryName": "Món hấp",
        "createdBy": null
      },
      {
        "id": 13,
        "categoryName": "Cơm - Xôi - Cháo",
        "createdBy": null
      },
      {
        "id": 14,
        "categoryName": "Gỏi - Cuốn",
        "createdBy": null
      },
      {
        "id": 15,
        "categoryName": "Bánh Việt",
        "createdBy": null
      },
      {
        "id": 16,
        "categoryName": "Ẩm thực miền Bắc",
        "createdBy": null
      },
      {
        "id": 17,
        "categoryName": "Ẩm thực miền Trung",
        "createdBy": null
      },
      {
        "id": 18,
        "categoryName": "Ẩm thực miền Nam",
        "createdBy": null
      },
      {
        "id": 19,
        "categoryName": "Ẩm thực vùng cao phía Bắc",
        "createdBy": null
      },
      {
        "id": 20,
        "categoryName": "Bếp riêng của Hoang",
        "createdBy": 2
      },
      {
        "id": 21,
        "categoryName": "Cơm nhà Lan Anh",
        "createdBy": 3
      },
      {
        "id": 22,
        "categoryName": "Món Đức tự nấu",
        "createdBy": 4
      }
    ].map((row) => ({ ...row, createdAt: now, updatedAt: now }));

    await queryInterface.bulkInsert("Categories", data);

    try {
      await queryInterface.sequelize.query(
        'SELECT setval(pg_get_serial_sequence(\'"Categories"\', \'id\'), coalesce(max(id), 1)) FROM "Categories";'
      );
    } catch (error) {
      console.error("Error setting sequence for Categories:", error);
    }
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete("Categories", null, {});
  },
};
