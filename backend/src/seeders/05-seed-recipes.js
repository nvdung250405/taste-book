"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const now = new Date();
    const recipesData = [
      {
            "id": 1,
            "authorId": 2,
            "title": "Canh chua cá lóc miền Tây",
            "description": "Món canh chua thanh mát đậm đà hương vị miền Tây Nam Bộ",
            "thumbnailUrl": "https://res.cloudinary.com/sf4yjct9/image/upload/v1789269532/tastebook_uploads/una957qnxfqpmeh7vm0t.jpg",
            "cookTimeMinutes": 35,
            "difficulty": "Medium",
            "defaultServings": 4,
            "isPublic": true,
            "approvalStatus": "Approved",
            "rejectionReason": null,
            "pendingUpdateData": null,
            "isDeleted": false,
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 2,
            "authorId": 2,
            "title": "Thịt kho tàu nước dừa trứng cút",
            "description": "Món thịt kho mềm rục béo ngậy ăn cùng cơm nóng",
            "thumbnailUrl": "https://res.cloudinary.com/sf4yjct9/image/upload/v1789269594/tastebook_uploads/hbspigqd9hauf2e0fhn0.webp",
            "cookTimeMinutes": 50,
            "difficulty": "Easy",
            "defaultServings": 4,
            "isPublic": true,
            "approvalStatus": "Approved",
            "rejectionReason": null,
            "pendingUpdateData": null,
            "isDeleted": false,
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 3,
            "authorId": 3,
            "title": "Phở bò gia truyền Hà Nội",
            "description": "Nước dùng thanh ngọt từ xương ống ninh kèm hoa hồi quế",
            "thumbnailUrl": "https://res.cloudinary.com/sf4yjct9/image/upload/v1789269633/tastebook_uploads/p0jhwrqov0o1dbrj1mky.webp",
            "cookTimeMinutes": 90,
            "difficulty": "Hard",
            "defaultServings": 4,
            "isPublic": true,
            "approvalStatus": "Approved",
            "rejectionReason": null,
            "pendingUpdateData": null,
            "isDeleted": false,
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 4,
            "authorId": 3,
            "title": "Gà xào sả ớt",
            "description": "Thịt gà săn giòn thơm lừng mùi sả cay cay vị ớt",
            "thumbnailUrl": "https://res.cloudinary.com/sf4yjct9/image/upload/v1789269671/tastebook_uploads/wultafhebuw7skdb9px7.webp",
            "cookTimeMinutes": 25,
            "difficulty": "Easy",
            "defaultServings": 3,
            "isPublic": true,
            "approvalStatus": "Approved",
            "rejectionReason": null,
            "pendingUpdateData": null,
            "isDeleted": false,
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 5,
            "authorId": 4,
            "title": "Bò lúc lắc",
            "description": "Thịt bò mềm ngọt xào cùng ớt chuông hành tây",
            "thumbnailUrl": "https://res.cloudinary.com/sf4yjct9/image/upload/v1789269706/tastebook_uploads/fxtcqitccfiph1pi2o0i.jpg",
            "cookTimeMinutes": 20,
            "difficulty": "Easy",
            "defaultServings": 2,
            "isPublic": true,
            "approvalStatus": "Approved",
            "rejectionReason": null,
            "pendingUpdateData": null,
            "isDeleted": false,
            "createdAt": now,
            "updatedAt": now
      }
];
    const recipeCategoriesData = [
      {
            "recipeId": 1,
            "categoryId": 1
      },
      {
            "recipeId": 1,
            "categoryId": 2
      },
      {
            "recipeId": 2,
            "categoryId": 1
      },
      {
            "recipeId": 2,
            "categoryId": 3
      },
      {
            "recipeId": 3,
            "categoryId": 5
      },
      {
            "recipeId": 4,
            "categoryId": 1
      },
      {
            "recipeId": 4,
            "categoryId": 4
      },
      {
            "recipeId": 5,
            "categoryId": 1
      },
      {
            "recipeId": 5,
            "categoryId": 4
      },
      {
            "recipeId": 1,
            "categoryId": 9
      },
      {
            "recipeId": 2,
            "categoryId": 9
      },
      {
            "recipeId": 3,
            "categoryId": 9
      },
      {
            "recipeId": 4,
            "categoryId": 9
      },
      {
            "recipeId": 5,
            "categoryId": 9
      }
];

    await queryInterface.bulkInsert("Recipes", recipesData);
    await queryInterface.bulkInsert("RecipeCategories", recipeCategoriesData);

    try {
      await queryInterface.sequelize.query(
        'SELECT setval(pg_get_serial_sequence(\'"Recipes"\', \'id\'), coalesce(max(id), 1)) FROM "Recipes";'
      );
    } catch (error) {
      console.error("Error setting sequence for Recipes:", error);
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("RecipeCategories", null, {});
    await queryInterface.bulkDelete("Recipes", null, {});
  },
};
