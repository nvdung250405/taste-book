"use strict";

// Dữ liệu phát triển theo docs/seed-data-vietnamese-cuisine-proposal.md.

module.exports = {
  up: async (queryInterface) => {
    const now = new Date();
    const favoriteRecipesData = [
      {
        "userId": 3,
        "recipeId": 1,
        "personalNotes": "Canh chua cho bữa cơm sum họp cuối tuần."
      },
      {
        "userId": 4,
        "recipeId": 2,
        "personalNotes": "Kho lửa nhỏ để thịt mềm và trứng thấm."
      },
      {
        "userId": 2,
        "recipeId": 6,
        "personalNotes": "Chuẩn bị đồ chua trước khi nướng chả."
      },
      {
        "userId": 2,
        "recipeId": 14,
        "personalNotes": "Ướp gà từ buổi sáng cho bữa tối."
      },
      {
        "userId": 3,
        "recipeId": 19,
        "personalNotes": "Món chay cho ngày đổi vị."
      },
      {
        "userId": 4,
        "recipeId": 11,
        "personalNotes": "Nhớ chan nước nhân xâm xấp."
      }
    ].map((row) => ({ ...row, createdAt: now, updatedAt: now }));
    const recipeListsData = [
      {
        "id": 1,
        "userId": 3,
        "listName": "Bữa cơm sum họp cuối tuần"
      },
      {
        "id": 2,
        "userId": 2,
        "listName": "Bữa trưa nhanh gọn"
      },
      {
        "id": 3,
        "userId": 4,
        "listName": "Cuối tuần đổi món miền Trung"
      },
      {
        "id": 4,
        "userId": 3,
        "listName": "Bữa cơm chay gia đình"
      },
      {
        "id": 5,
        "userId": 4,
        "listName": "Món riêng Đức muốn nấu"
      },
      {
        "id": 6,
        "userId": 3,
        "listName": "Bổ sung món chay cho ngày mai"
      }
    ].map((row) => ({ ...row, createdAt: now, updatedAt: now }));
    const recipeListItemsData = [
      {
        "id": 1,
        "recipeListId": 1,
        "recipeId": 1,
        "targetServings": 6
      },
      {
        "id": 2,
        "recipeListId": 1,
        "recipeId": 2,
        "targetServings": 6
      },
      {
        "id": 3,
        "recipeListId": 2,
        "recipeId": 4,
        "targetServings": 2
      },
      {
        "id": 4,
        "recipeListId": 2,
        "recipeId": 21,
        "targetServings": 2
      },
      {
        "id": 5,
        "recipeListId": 2,
        "recipeId": 22,
        "targetServings": 2
      },
      {
        "id": 6,
        "recipeListId": 3,
        "recipeId": 11,
        "targetServings": 4
      },
      {
        "id": 7,
        "recipeListId": 3,
        "recipeId": 13,
        "targetServings": 4
      },
      {
        "id": 8,
        "recipeListId": 4,
        "recipeId": 19,
        "targetServings": 4
      },
      {
        "id": 9,
        "recipeListId": 4,
        "recipeId": 24,
        "targetServings": 3
      },
      {
        "id": 10,
        "recipeListId": 5,
        "recipeId": 25,
        "targetServings": 3
      },
      {
        "id": 11,
        "recipeListId": 5,
        "recipeId": 26,
        "targetServings": 4
      },
      {
        "id": 12,
        "recipeListId": 6,
        "recipeId": 19,
        "targetServings": 2
      }
    ].map((row) => ({ ...row, createdAt: now, updatedAt: now }));
    const shoppingListsData = [
      {
        "id": 1,
        "userId": 3,
        "title": "Đi chợ cho bữa cơm cuối tuần",
        "status": "In_Progress"
      },
      {
        "id": 2,
        "userId": 3,
        "title": "Đi chợ hai bữa chay",
        "status": "Completed"
      }
    ].map((row) => ({ ...row, createdAt: now, updatedAt: now }));
    const shoppingListRecipeListsData = [
      {
        "shoppingListId": 1,
        "recipeListId": 1
      },
      {
        "shoppingListId": 2,
        "recipeListId": 4
      },
      {
        "shoppingListId": 2,
        "recipeListId": 6
      }
    ];
    const shoppingListItemsData = [
      {
        "id": 1,
        "shoppingListId": 1,
        "ingredientId": 7,
        "itemName": "Cá lóc (cá quả)",
        "totalQuantity": 900,
        "unit": "g",
        "isPurchased": false
      },
      {
        "id": 2,
        "shoppingListId": 1,
        "ingredientId": 19,
        "itemName": "Cà chua",
        "totalQuantity": 300,
        "unit": "g",
        "isPurchased": true
      },
      {
        "id": 3,
        "shoppingListId": 1,
        "ingredientId": 20,
        "itemName": "Dứa (thơm)",
        "totalQuantity": 225,
        "unit": "g",
        "isPurchased": true
      },
      {
        "id": 4,
        "shoppingListId": 1,
        "ingredientId": 21,
        "itemName": "Đậu bắp",
        "totalQuantity": 150,
        "unit": "g",
        "isPurchased": false
      },
      {
        "id": 5,
        "shoppingListId": 1,
        "ingredientId": 22,
        "itemName": "Bạc hà (dọc mùng)",
        "totalQuantity": 150,
        "unit": "g",
        "isPurchased": false
      },
      {
        "id": 6,
        "shoppingListId": 1,
        "ingredientId": 18,
        "itemName": "Giá đỗ",
        "totalQuantity": 150,
        "unit": "g",
        "isPurchased": false
      },
      {
        "id": 7,
        "shoppingListId": 1,
        "ingredientId": 42,
        "itemName": "Me chua chín",
        "totalQuantity": 45,
        "unit": "g",
        "isPurchased": false
      },
      {
        "id": 8,
        "shoppingListId": 1,
        "ingredientId": 16,
        "itemName": "Rau ngổ (ngò om)",
        "totalQuantity": 15,
        "unit": "g",
        "isPurchased": false
      },
      {
        "id": 9,
        "shoppingListId": 1,
        "ingredientId": 28,
        "itemName": "Tỏi khô",
        "totalQuantity": 30,
        "unit": "g",
        "isPurchased": false
      },
      {
        "id": 10,
        "shoppingListId": 1,
        "ingredientId": 32,
        "itemName": "Ớt hiểm",
        "totalQuantity": 4.5,
        "unit": "g",
        "isPurchased": false
      },
      {
        "id": 11,
        "shoppingListId": 1,
        "ingredientId": 34,
        "itemName": "Nước mắm truyền thống",
        "totalQuantity": 112.5,
        "unit": "ml",
        "isPurchased": false
      },
      {
        "id": 12,
        "shoppingListId": 1,
        "ingredientId": 37,
        "itemName": "Đường cát trắng",
        "totalQuantity": 67.5,
        "unit": "g",
        "isPurchased": false
      },
      {
        "id": 13,
        "shoppingListId": 1,
        "ingredientId": 36,
        "itemName": "Muối tinh",
        "totalQuantity": 4.5,
        "unit": "g",
        "isPurchased": false
      },
      {
        "id": 14,
        "shoppingListId": 1,
        "ingredientId": 39,
        "itemName": "Dầu ăn",
        "totalQuantity": 37.5,
        "unit": "ml",
        "isPurchased": false
      },
      {
        "id": 15,
        "shoppingListId": 1,
        "ingredientId": 53,
        "itemName": "Nước lọc",
        "totalQuantity": 2550,
        "unit": "ml",
        "isPurchased": false
      },
      {
        "id": 16,
        "shoppingListId": 1,
        "ingredientId": 1,
        "itemName": "Thịt ba chỉ heo",
        "totalQuantity": 900,
        "unit": "g",
        "isPurchased": false
      },
      {
        "id": 17,
        "shoppingListId": 1,
        "ingredientId": 11,
        "itemName": "Trứng cút",
        "totalQuantity": 24,
        "unit": "quả",
        "isPurchased": false
      },
      {
        "id": 18,
        "shoppingListId": 1,
        "ingredientId": 43,
        "itemName": "Nước dừa tươi",
        "totalQuantity": 900,
        "unit": "ml",
        "isPurchased": false
      },
      {
        "id": 19,
        "shoppingListId": 1,
        "ingredientId": 29,
        "itemName": "Hành tím",
        "totalQuantity": 30,
        "unit": "g",
        "isPurchased": false
      },
      {
        "id": 20,
        "shoppingListId": 1,
        "ingredientId": 38,
        "itemName": "Tiêu đen xay",
        "totalQuantity": 1.5,
        "unit": "g",
        "isPurchased": false
      },
      {
        "id": 21,
        "shoppingListId": 1,
        "ingredientId": null,
        "itemName": "Nước rửa chén",
        "totalQuantity": 1,
        "unit": "chai",
        "isPurchased": false
      },
      {
        "id": 22,
        "shoppingListId": 2,
        "ingredientId": 12,
        "itemName": "Đậu phụ trắng",
        "totalQuantity": 1200,
        "unit": "g",
        "isPurchased": true
      },
      {
        "id": 23,
        "shoppingListId": 2,
        "ingredientId": 26,
        "itemName": "Nấm rơm",
        "totalQuantity": 225,
        "unit": "g",
        "isPurchased": true
      },
      {
        "id": 24,
        "shoppingListId": 2,
        "ingredientId": 96,
        "itemName": "Nấm đùi gà",
        "totalQuantity": 225,
        "unit": "g",
        "isPurchased": true
      },
      {
        "id": 25,
        "shoppingListId": 2,
        "ingredientId": 97,
        "itemName": "Nấm bào ngư",
        "totalQuantity": 150,
        "unit": "g",
        "isPurchased": true
      },
      {
        "id": 26,
        "shoppingListId": 2,
        "ingredientId": 28,
        "itemName": "Tỏi khô",
        "totalQuantity": 15,
        "unit": "g",
        "isPurchased": true
      },
      {
        "id": 27,
        "shoppingListId": 2,
        "ingredientId": 41,
        "itemName": "Nước tương (xì dầu)",
        "totalQuantity": 60,
        "unit": "ml",
        "isPurchased": true
      },
      {
        "id": 28,
        "shoppingListId": 2,
        "ingredientId": 37,
        "itemName": "Đường cát trắng",
        "totalQuantity": 23,
        "unit": "g",
        "isPurchased": true
      },
      {
        "id": 29,
        "shoppingListId": 2,
        "ingredientId": 36,
        "itemName": "Muối tinh",
        "totalQuantity": 5,
        "unit": "g",
        "isPurchased": true
      },
      {
        "id": 30,
        "shoppingListId": 2,
        "ingredientId": 38,
        "itemName": "Tiêu đen xay",
        "totalQuantity": 1.5,
        "unit": "g",
        "isPurchased": true
      },
      {
        "id": 31,
        "shoppingListId": 2,
        "ingredientId": 39,
        "itemName": "Dầu ăn",
        "totalQuantity": 95,
        "unit": "ml",
        "isPurchased": true
      },
      {
        "id": 32,
        "shoppingListId": 2,
        "ingredientId": 14,
        "itemName": "Hành lá",
        "totalQuantity": 45,
        "unit": "g",
        "isPurchased": true
      },
      {
        "id": 33,
        "shoppingListId": 2,
        "ingredientId": 53,
        "itemName": "Nước lọc",
        "totalQuantity": 600,
        "unit": "ml",
        "isPurchased": true
      },
      {
        "id": 34,
        "shoppingListId": 2,
        "ingredientId": 19,
        "itemName": "Cà chua",
        "totalQuantity": 300,
        "unit": "g",
        "isPurchased": true
      },
      {
        "id": 35,
        "shoppingListId": 2,
        "ingredientId": 29,
        "itemName": "Hành tím",
        "totalQuantity": 15,
        "unit": "g",
        "isPurchased": true
      },
      {
        "id": 36,
        "shoppingListId": 2,
        "ingredientId": 103,
        "itemName": "Nước mắm chay",
        "totalQuantity": 20,
        "unit": "ml",
        "isPurchased": true
      }
    ].map((row) => ({ ...row, createdAt: now, updatedAt: now }));

    await queryInterface.bulkInsert("FavoriteRecipes", favoriteRecipesData);
    await queryInterface.bulkInsert("RecipeLists", recipeListsData);
    await queryInterface.bulkInsert("RecipeListItems", recipeListItemsData);
    await queryInterface.bulkInsert("ShoppingLists", shoppingListsData);
    await queryInterface.bulkInsert("ShoppingListRecipeLists", shoppingListRecipeListsData);
    await queryInterface.bulkInsert("ShoppingListItems", shoppingListItemsData);

    try {
      await queryInterface.sequelize.query(
        'SELECT setval(pg_get_serial_sequence(\'"RecipeLists"\', \'id\'), coalesce(max(id), 1)) FROM "RecipeLists";'
      );
      await queryInterface.sequelize.query(
        'SELECT setval(pg_get_serial_sequence(\'"RecipeListItems"\', \'id\'), coalesce(max(id), 1)) FROM "RecipeListItems";'
      );
      await queryInterface.sequelize.query(
        'SELECT setval(pg_get_serial_sequence(\'"ShoppingLists"\', \'id\'), coalesce(max(id), 1)) FROM "ShoppingLists";'
      );
      await queryInterface.sequelize.query(
        'SELECT setval(pg_get_serial_sequence(\'"ShoppingListItems"\', \'id\'), coalesce(max(id), 1)) FROM "ShoppingListItems";'
      );
    } catch (error) {
      console.error("Error setting sequence for Interactions:", error);
    }
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete("ShoppingListItems", null, {});
    await queryInterface.bulkDelete("ShoppingListRecipeLists", null, {});
    await queryInterface.bulkDelete("ShoppingLists", null, {});
    await queryInterface.bulkDelete("RecipeListItems", null, {});
    await queryInterface.bulkDelete("RecipeLists", null, {});
    await queryInterface.bulkDelete("FavoriteRecipes", null, {});
  },
};
