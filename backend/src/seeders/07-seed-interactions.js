"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const now = new Date();
    const favoriteRecipesData = [
      {
            "userId": 3,
            "recipeId": 1,
            "personalNotes": "Món khoái khẩu của cả nhà vào cuối tuần",
            "createdAt": now,
            "updatedAt": now
      },
      {
            "userId": 4,
            "recipeId": 2,
            "personalNotes": "Thịt kho rất mềm và thơm béo",
            "createdAt": now,
            "updatedAt": now
      }
];
    const recipeListsData = [
      {
            "id": 1,
            "userId": 3,
            "listName": "Bữa cơm sum họp cuối tuần",
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 2,
            "userId": 2,
            "listName": "Bữa trưa nhanh gọn",
            "createdAt": now,
            "updatedAt": now
      }
];
    const recipeListItemsData = [
      {
            "id": 1,
            "recipeListId": 1,
            "recipeId": 1,
            "targetServings": 6,
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 2,
            "recipeListId": 1,
            "recipeId": 2,
            "targetServings": 6,
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 3,
            "recipeListId": 2,
            "recipeId": 4,
            "targetServings": 2,
            "createdAt": now,
            "updatedAt": now
      }
];
    const shoppingListsData = [
      {
            "id": 1,
            "userId": 3,
            "title": "Đi chợ Metro Chủ Nhật",
            "status": "In_Progress",
            "createdAt": now,
            "updatedAt": now
      }
];
    const shoppingListRecipeListsData = [
      {
            "shoppingListId": 1,
            "recipeListId": 1
      }
];
    const shoppingListItemsData = [
      {
            "id": 1,
            "shoppingListId": 1,
            "ingredientId": 7,
            "itemName": "Cá lóc (cá quả)",
            "totalQuantity": 750.0,
            "unit": "g",
            "isPurchased": false,
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 2,
            "shoppingListId": 1,
            "ingredientId": 20,
            "itemName": "Dứa (thơm)",
            "totalQuantity": 0.75,
            "unit": "quả",
            "isPurchased": true,
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 3,
            "shoppingListId": 1,
            "ingredientId": 19,
            "itemName": "Cà chua",
            "totalQuantity": 3.0,
            "unit": "quả",
            "isPurchased": true,
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 4,
            "shoppingListId": 1,
            "ingredientId": 21,
            "itemName": "Đậu bắp",
            "totalQuantity": 150.0,
            "unit": "g",
            "isPurchased": false,
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 5,
            "shoppingListId": 1,
            "ingredientId": 22,
            "itemName": "Bạc hà (dọc mùng)",
            "totalQuantity": 1.5,
            "unit": "cây",
            "isPurchased": false,
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 6,
            "shoppingListId": 1,
            "ingredientId": 18,
            "itemName": "Giá đỗ",
            "totalQuantity": 150.0,
            "unit": "g",
            "isPurchased": false,
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 7,
            "shoppingListId": 1,
            "ingredientId": 42,
            "itemName": "Me chua chín",
            "totalQuantity": 75.0,
            "unit": "g",
            "isPurchased": false,
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 8,
            "shoppingListId": 1,
            "ingredientId": 16,
            "itemName": "Rau ngổ (ngò om)",
            "totalQuantity": 4.5,
            "unit": "nhánh",
            "isPurchased": false,
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 9,
            "shoppingListId": 1,
            "ingredientId": 1,
            "itemName": "Thịt ba chỉ heo",
            "totalQuantity": 750.0,
            "unit": "g",
            "isPurchased": false,
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 10,
            "shoppingListId": 1,
            "ingredientId": 11,
            "itemName": "Trứng cút",
            "totalQuantity": 22.5,
            "unit": "quả",
            "isPurchased": false,
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 11,
            "shoppingListId": 1,
            "ingredientId": 43,
            "itemName": "Nước dừa tươi",
            "totalQuantity": 3.0,
            "unit": "chén",
            "isPurchased": false,
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 12,
            "shoppingListId": 1,
            "ingredientId": 34,
            "itemName": "Nước mắm truyền thống",
            "totalQuantity": 7.5,
            "unit": "muỗng canh",
            "isPurchased": false,
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 13,
            "shoppingListId": 1,
            "ingredientId": 37,
            "itemName": "Đường cát trắng",
            "totalQuantity": 6.0,
            "unit": "muỗng canh",
            "isPurchased": false,
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 14,
            "shoppingListId": 1,
            "ingredientId": null,
            "itemName": "Nước rửa chén Sunlight",
            "totalQuantity": 1.0,
            "unit": "chai",
            "isPurchased": false,
            "createdAt": now,
            "updatedAt": now
      }
];

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

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("ShoppingListItems", null, {});
    await queryInterface.bulkDelete("ShoppingListRecipeLists", null, {});
    await queryInterface.bulkDelete("ShoppingLists", null, {});
    await queryInterface.bulkDelete("RecipeListItems", null, {});
    await queryInterface.bulkDelete("RecipeLists", null, {});
    await queryInterface.bulkDelete("FavoriteRecipes", null, {});
  },
};
