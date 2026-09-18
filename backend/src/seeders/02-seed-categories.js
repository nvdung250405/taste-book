"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const now = new Date();
    const data = [
      {
            "id": 1,
            "categoryName": "Món chính",
            "createdBy": null,
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 2,
            "categoryName": "Món canh",
            "createdBy": null,
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 3,
            "categoryName": "Món kho",
            "createdBy": null,
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 4,
            "categoryName": "Món xào",
            "createdBy": null,
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 5,
            "categoryName": "Bún - Mì - Phở",
            "createdBy": null,
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 6,
            "categoryName": "Món khai vị & Ăn vặt",
            "createdBy": null,
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 7,
            "categoryName": "Món chay",
            "createdBy": null,
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 8,
            "categoryName": "Món tráng miệng & Đồ uống",
            "createdBy": null,
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 9,
            "categoryName": "Đóng góp của cộng đồng",
            "createdBy": null,
            "createdAt": now,
            "updatedAt": now
      }
];

    await queryInterface.bulkInsert("Categories", data);

    try {
      await queryInterface.sequelize.query(
        'SELECT setval(pg_get_serial_sequence(\'"Categories"\', \'id\'), coalesce(max(id), 1)) FROM "Categories";'
      );
    } catch (error) {
      console.error("Error setting sequence for Categories:", error);
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("Categories", null, {});
  },
};
