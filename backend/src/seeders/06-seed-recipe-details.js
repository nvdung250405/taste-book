"use strict";

// Dữ liệu phát triển theo docs/seed-data-vietnamese-cuisine-proposal.md.

module.exports = {
  up: async (queryInterface) => {
    const now = new Date();
    const recipeIngredientsData = [
      {
        "id": 1,
        "recipeId": 1,
        "ingredientId": 7,
        "customIngredientName": null,
        "quantity": 600,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 2,
        "recipeId": 1,
        "ingredientId": 19,
        "customIngredientName": null,
        "quantity": 200,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 3,
        "recipeId": 1,
        "ingredientId": 20,
        "customIngredientName": null,
        "quantity": 150,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 4,
        "recipeId": 1,
        "ingredientId": 21,
        "customIngredientName": null,
        "quantity": 100,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 5,
        "recipeId": 1,
        "ingredientId": 22,
        "customIngredientName": null,
        "quantity": 100,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 6,
        "recipeId": 1,
        "ingredientId": 18,
        "customIngredientName": null,
        "quantity": 100,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 7,
        "recipeId": 1,
        "ingredientId": 42,
        "customIngredientName": null,
        "quantity": 30,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 8,
        "recipeId": 1,
        "ingredientId": 16,
        "customIngredientName": null,
        "quantity": 10,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 9,
        "recipeId": 1,
        "ingredientId": 28,
        "customIngredientName": null,
        "quantity": 10,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 10,
        "recipeId": 1,
        "ingredientId": 32,
        "customIngredientName": null,
        "quantity": 3,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 11,
        "recipeId": 1,
        "ingredientId": 34,
        "customIngredientName": null,
        "quantity": 30,
        "unitId": 3,
        "customUnit": null
      },
      {
        "id": 12,
        "recipeId": 1,
        "ingredientId": 37,
        "customIngredientName": null,
        "quantity": 20,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 13,
        "recipeId": 1,
        "ingredientId": 36,
        "customIngredientName": null,
        "quantity": 3,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 14,
        "recipeId": 1,
        "ingredientId": 39,
        "customIngredientName": null,
        "quantity": 15,
        "unitId": 3,
        "customUnit": null
      },
      {
        "id": 15,
        "recipeId": 1,
        "ingredientId": 53,
        "customIngredientName": null,
        "quantity": 1400,
        "unitId": 3,
        "customUnit": null
      },
      {
        "id": 16,
        "recipeId": 2,
        "ingredientId": 1,
        "customIngredientName": null,
        "quantity": 600,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 17,
        "recipeId": 2,
        "ingredientId": 11,
        "customIngredientName": null,
        "quantity": 16,
        "unitId": 8,
        "customUnit": null
      },
      {
        "id": 18,
        "recipeId": 2,
        "ingredientId": 43,
        "customIngredientName": null,
        "quantity": 600,
        "unitId": 3,
        "customUnit": null
      },
      {
        "id": 19,
        "recipeId": 2,
        "ingredientId": 53,
        "customIngredientName": null,
        "quantity": 300,
        "unitId": 3,
        "customUnit": null
      },
      {
        "id": 20,
        "recipeId": 2,
        "ingredientId": 34,
        "customIngredientName": null,
        "quantity": 45,
        "unitId": 3,
        "customUnit": null
      },
      {
        "id": 21,
        "recipeId": 2,
        "ingredientId": 37,
        "customIngredientName": null,
        "quantity": 25,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 22,
        "recipeId": 2,
        "ingredientId": 29,
        "customIngredientName": null,
        "quantity": 20,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 23,
        "recipeId": 2,
        "ingredientId": 28,
        "customIngredientName": null,
        "quantity": 10,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 24,
        "recipeId": 2,
        "ingredientId": 38,
        "customIngredientName": null,
        "quantity": 1,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 25,
        "recipeId": 2,
        "ingredientId": 39,
        "customIngredientName": null,
        "quantity": 10,
        "unitId": 3,
        "customUnit": null
      },
      {
        "id": 26,
        "recipeId": 3,
        "ingredientId": 4,
        "customIngredientName": null,
        "quantity": 1500,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 27,
        "recipeId": 3,
        "ingredientId": 3,
        "customIngredientName": null,
        "quantity": 600,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 28,
        "recipeId": 3,
        "ingredientId": 45,
        "customIngredientName": null,
        "quantity": 800,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 29,
        "recipeId": 3,
        "ingredientId": 25,
        "customIngredientName": null,
        "quantity": 200,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 30,
        "recipeId": 3,
        "ingredientId": 30,
        "customIngredientName": null,
        "quantity": 60,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 31,
        "recipeId": 3,
        "ingredientId": 29,
        "customIngredientName": null,
        "quantity": 40,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 32,
        "recipeId": 3,
        "ingredientId": 54,
        "customIngredientName": null,
        "quantity": 3,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 33,
        "recipeId": 3,
        "ingredientId": 55,
        "customIngredientName": null,
        "quantity": 5,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 34,
        "recipeId": 3,
        "ingredientId": 56,
        "customIngredientName": null,
        "quantity": 3,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 35,
        "recipeId": 3,
        "ingredientId": 34,
        "customIngredientName": null,
        "quantity": 40,
        "unitId": 3,
        "customUnit": null
      },
      {
        "id": 36,
        "recipeId": 3,
        "ingredientId": 36,
        "customIngredientName": null,
        "quantity": 12,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 37,
        "recipeId": 3,
        "ingredientId": 37,
        "customIngredientName": null,
        "quantity": 10,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 38,
        "recipeId": 3,
        "ingredientId": 14,
        "customIngredientName": null,
        "quantity": 30,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 39,
        "recipeId": 3,
        "ingredientId": 15,
        "customIngredientName": null,
        "quantity": 20,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 40,
        "recipeId": 3,
        "ingredientId": 60,
        "customIngredientName": null,
        "quantity": 30,
        "unitId": 3,
        "customUnit": null
      },
      {
        "id": 41,
        "recipeId": 3,
        "ingredientId": 32,
        "customIngredientName": null,
        "quantity": 5,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 42,
        "recipeId": 3,
        "ingredientId": 53,
        "customIngredientName": null,
        "quantity": 4500,
        "unitId": 3,
        "customUnit": null
      },
      {
        "id": 43,
        "recipeId": 4,
        "ingredientId": 5,
        "customIngredientName": null,
        "quantity": 600,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 44,
        "recipeId": 4,
        "ingredientId": 31,
        "customIngredientName": null,
        "quantity": 50,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 45,
        "recipeId": 4,
        "ingredientId": 32,
        "customIngredientName": null,
        "quantity": 5,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 46,
        "recipeId": 4,
        "ingredientId": 28,
        "customIngredientName": null,
        "quantity": 15,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 47,
        "recipeId": 4,
        "ingredientId": 29,
        "customIngredientName": null,
        "quantity": 20,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 48,
        "recipeId": 4,
        "ingredientId": 34,
        "customIngredientName": null,
        "quantity": 30,
        "unitId": 3,
        "customUnit": null
      },
      {
        "id": 49,
        "recipeId": 4,
        "ingredientId": 37,
        "customIngredientName": null,
        "quantity": 10,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 50,
        "recipeId": 4,
        "ingredientId": 38,
        "customIngredientName": null,
        "quantity": 1,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 51,
        "recipeId": 4,
        "ingredientId": 39,
        "customIngredientName": null,
        "quantity": 20,
        "unitId": 3,
        "customUnit": null
      },
      {
        "id": 52,
        "recipeId": 4,
        "ingredientId": 53,
        "customIngredientName": null,
        "quantity": 80,
        "unitId": 3,
        "customUnit": null
      },
      {
        "id": 53,
        "recipeId": 5,
        "ingredientId": 2,
        "customIngredientName": null,
        "quantity": 350,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 54,
        "recipeId": 5,
        "ingredientId": 57,
        "customIngredientName": null,
        "quantity": 120,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 55,
        "recipeId": 5,
        "ingredientId": 25,
        "customIngredientName": null,
        "quantity": 100,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 56,
        "recipeId": 5,
        "ingredientId": 19,
        "customIngredientName": null,
        "quantity": 100,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 57,
        "recipeId": 5,
        "ingredientId": 52,
        "customIngredientName": null,
        "quantity": 60,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 58,
        "recipeId": 5,
        "ingredientId": 28,
        "customIngredientName": null,
        "quantity": 10,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 59,
        "recipeId": 5,
        "ingredientId": 40,
        "customIngredientName": null,
        "quantity": 15,
        "unitId": 3,
        "customUnit": null
      },
      {
        "id": 60,
        "recipeId": 5,
        "ingredientId": 41,
        "customIngredientName": null,
        "quantity": 10,
        "unitId": 3,
        "customUnit": null
      },
      {
        "id": 61,
        "recipeId": 5,
        "ingredientId": 37,
        "customIngredientName": null,
        "quantity": 5,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 62,
        "recipeId": 5,
        "ingredientId": 38,
        "customIngredientName": null,
        "quantity": 1,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 63,
        "recipeId": 5,
        "ingredientId": 39,
        "customIngredientName": null,
        "quantity": 20,
        "unitId": 3,
        "customUnit": null
      },
      {
        "id": 64,
        "recipeId": 6,
        "ingredientId": 1,
        "customIngredientName": null,
        "quantity": 350,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 65,
        "recipeId": 6,
        "ingredientId": 50,
        "customIngredientName": null,
        "quantity": 350,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 66,
        "recipeId": 6,
        "ingredientId": 46,
        "customIngredientName": null,
        "quantity": 800,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 67,
        "recipeId": 6,
        "ingredientId": 59,
        "customIngredientName": null,
        "quantity": 150,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 68,
        "recipeId": 6,
        "ingredientId": 23,
        "customIngredientName": null,
        "quantity": 100,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 69,
        "recipeId": 6,
        "ingredientId": 52,
        "customIngredientName": null,
        "quantity": 150,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 70,
        "recipeId": 6,
        "ingredientId": 61,
        "customIngredientName": null,
        "quantity": 30,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 71,
        "recipeId": 6,
        "ingredientId": 62,
        "customIngredientName": null,
        "quantity": 30,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 72,
        "recipeId": 6,
        "ingredientId": 29,
        "customIngredientName": null,
        "quantity": 30,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 73,
        "recipeId": 6,
        "ingredientId": 28,
        "customIngredientName": null,
        "quantity": 20,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 74,
        "recipeId": 6,
        "ingredientId": 34,
        "customIngredientName": null,
        "quantity": 90,
        "unitId": 3,
        "customUnit": null
      },
      {
        "id": 75,
        "recipeId": 6,
        "ingredientId": 37,
        "customIngredientName": null,
        "quantity": 60,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 76,
        "recipeId": 6,
        "ingredientId": 51,
        "customIngredientName": null,
        "quantity": 60,
        "unitId": 3,
        "customUnit": null
      },
      {
        "id": 77,
        "recipeId": 6,
        "ingredientId": 38,
        "customIngredientName": null,
        "quantity": 2,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 78,
        "recipeId": 6,
        "ingredientId": 39,
        "customIngredientName": null,
        "quantity": 15,
        "unitId": 3,
        "customUnit": null
      },
      {
        "id": 79,
        "recipeId": 6,
        "ingredientId": 32,
        "customIngredientName": null,
        "quantity": 5,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 80,
        "recipeId": 6,
        "ingredientId": 53,
        "customIngredientName": null,
        "quantity": 400,
        "unitId": 3,
        "customUnit": null
      },
      {
        "id": 81,
        "recipeId": 7,
        "ingredientId": 50,
        "customIngredientName": null,
        "quantity": 250,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 82,
        "recipeId": 7,
        "ingredientId": 8,
        "customIngredientName": null,
        "quantity": 100,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 83,
        "recipeId": 7,
        "ingredientId": 64,
        "customIngredientName": null,
        "quantity": 40,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 84,
        "recipeId": 7,
        "ingredientId": 63,
        "customIngredientName": null,
        "quantity": 10,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 85,
        "recipeId": 7,
        "ingredientId": 23,
        "customIngredientName": null,
        "quantity": 80,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 86,
        "recipeId": 7,
        "ingredientId": 25,
        "customIngredientName": null,
        "quantity": 80,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 87,
        "recipeId": 7,
        "ingredientId": 10,
        "customIngredientName": null,
        "quantity": 1,
        "unitId": 8,
        "customUnit": null
      },
      {
        "id": 88,
        "recipeId": 7,
        "ingredientId": 14,
        "customIngredientName": null,
        "quantity": 15,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 89,
        "recipeId": 7,
        "ingredientId": 65,
        "customIngredientName": null,
        "quantity": 120,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 90,
        "recipeId": 7,
        "ingredientId": 34,
        "customIngredientName": null,
        "quantity": 45,
        "unitId": 3,
        "customUnit": null
      },
      {
        "id": 91,
        "recipeId": 7,
        "ingredientId": 38,
        "customIngredientName": null,
        "quantity": 1,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 92,
        "recipeId": 7,
        "ingredientId": 39,
        "customIngredientName": null,
        "quantity": 400,
        "unitId": 3,
        "customUnit": null
      },
      {
        "id": 93,
        "recipeId": 7,
        "ingredientId": 37,
        "customIngredientName": null,
        "quantity": 20,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 94,
        "recipeId": 7,
        "ingredientId": 51,
        "customIngredientName": null,
        "quantity": 25,
        "unitId": 3,
        "customUnit": null
      },
      {
        "id": 95,
        "recipeId": 7,
        "ingredientId": 28,
        "customIngredientName": null,
        "quantity": 10,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 96,
        "recipeId": 7,
        "ingredientId": 32,
        "customIngredientName": null,
        "quantity": 3,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 97,
        "recipeId": 7,
        "ingredientId": 53,
        "customIngredientName": null,
        "quantity": 120,
        "unitId": 3,
        "customUnit": null
      },
      {
        "id": 98,
        "recipeId": 8,
        "ingredientId": 66,
        "customIngredientName": null,
        "quantity": 700,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 99,
        "recipeId": 8,
        "ingredientId": 68,
        "customIngredientName": null,
        "quantity": 30,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 100,
        "recipeId": 8,
        "ingredientId": 69,
        "customIngredientName": null,
        "quantity": 40,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 101,
        "recipeId": 8,
        "ingredientId": 70,
        "customIngredientName": null,
        "quantity": 3,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 102,
        "recipeId": 8,
        "ingredientId": 29,
        "customIngredientName": null,
        "quantity": 20,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 103,
        "recipeId": 8,
        "ingredientId": 34,
        "customIngredientName": null,
        "quantity": 50,
        "unitId": 3,
        "customUnit": null
      },
      {
        "id": 104,
        "recipeId": 8,
        "ingredientId": 37,
        "customIngredientName": null,
        "quantity": 15,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 105,
        "recipeId": 8,
        "ingredientId": 39,
        "customIngredientName": null,
        "quantity": 40,
        "unitId": 3,
        "customUnit": null
      },
      {
        "id": 106,
        "recipeId": 8,
        "ingredientId": 14,
        "customIngredientName": null,
        "quantity": 100,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 107,
        "recipeId": 8,
        "ingredientId": 67,
        "customIngredientName": null,
        "quantity": 100,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 108,
        "recipeId": 8,
        "ingredientId": 46,
        "customIngredientName": null,
        "quantity": 800,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 109,
        "recipeId": 8,
        "ingredientId": 47,
        "customIngredientName": null,
        "quantity": 50,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 110,
        "recipeId": 8,
        "ingredientId": 60,
        "customIngredientName": null,
        "quantity": 25,
        "unitId": 3,
        "customUnit": null
      },
      {
        "id": 111,
        "recipeId": 8,
        "ingredientId": 28,
        "customIngredientName": null,
        "quantity": 10,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 112,
        "recipeId": 8,
        "ingredientId": 32,
        "customIngredientName": null,
        "quantity": 3,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 113,
        "recipeId": 8,
        "ingredientId": 53,
        "customIngredientName": null,
        "quantity": 100,
        "unitId": 3,
        "customUnit": null
      },
      {
        "id": 114,
        "recipeId": 9,
        "ingredientId": 71,
        "customIngredientName": null,
        "quantity": 500,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 115,
        "recipeId": 9,
        "ingredientId": 72,
        "customIngredientName": null,
        "quantity": 40,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 116,
        "recipeId": 9,
        "ingredientId": 73,
        "customIngredientName": null,
        "quantity": 40,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 117,
        "recipeId": 9,
        "ingredientId": 74,
        "customIngredientName": null,
        "quantity": 50,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 118,
        "recipeId": 9,
        "ingredientId": 75,
        "customIngredientName": null,
        "quantity": 10,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 119,
        "recipeId": 9,
        "ingredientId": 36,
        "customIngredientName": null,
        "quantity": 5,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 120,
        "recipeId": 9,
        "ingredientId": 39,
        "customIngredientName": null,
        "quantity": 15,
        "unitId": 3,
        "customUnit": null
      },
      {
        "id": 121,
        "recipeId": 9,
        "ingredientId": 53,
        "customIngredientName": null,
        "quantity": 2000,
        "unitId": 3,
        "customUnit": null
      },
      {
        "id": 122,
        "recipeId": 10,
        "ingredientId": 76,
        "customIngredientName": null,
        "quantity": 500,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 123,
        "recipeId": 10,
        "ingredientId": 77,
        "customIngredientName": null,
        "quantity": 600,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 124,
        "recipeId": 10,
        "ingredientId": 46,
        "customIngredientName": null,
        "quantity": 800,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 125,
        "recipeId": 10,
        "ingredientId": 31,
        "customIngredientName": null,
        "quantity": 100,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 126,
        "recipeId": 10,
        "ingredientId": 78,
        "customIngredientName": null,
        "quantity": 25,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 127,
        "recipeId": 10,
        "ingredientId": 25,
        "customIngredientName": null,
        "quantity": 150,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 128,
        "recipeId": 10,
        "ingredientId": 29,
        "customIngredientName": null,
        "quantity": 30,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 129,
        "recipeId": 10,
        "ingredientId": 28,
        "customIngredientName": null,
        "quantity": 15,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 130,
        "recipeId": 10,
        "ingredientId": 79,
        "customIngredientName": null,
        "quantity": 20,
        "unitId": 3,
        "customUnit": null
      },
      {
        "id": 131,
        "recipeId": 10,
        "ingredientId": 39,
        "customIngredientName": null,
        "quantity": 10,
        "unitId": 3,
        "customUnit": null
      },
      {
        "id": 132,
        "recipeId": 10,
        "ingredientId": 80,
        "customIngredientName": null,
        "quantity": 5,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 133,
        "recipeId": 10,
        "ingredientId": 34,
        "customIngredientName": null,
        "quantity": 30,
        "unitId": 3,
        "customUnit": null
      },
      {
        "id": 134,
        "recipeId": 10,
        "ingredientId": 36,
        "customIngredientName": null,
        "quantity": 8,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 135,
        "recipeId": 10,
        "ingredientId": 37,
        "customIngredientName": null,
        "quantity": 15,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 136,
        "recipeId": 10,
        "ingredientId": 14,
        "customIngredientName": null,
        "quantity": 20,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 137,
        "recipeId": 10,
        "ingredientId": 15,
        "customIngredientName": null,
        "quantity": 15,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 138,
        "recipeId": 10,
        "ingredientId": 81,
        "customIngredientName": null,
        "quantity": 150,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 139,
        "recipeId": 10,
        "ingredientId": 18,
        "customIngredientName": null,
        "quantity": 150,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 140,
        "recipeId": 10,
        "ingredientId": 17,
        "customIngredientName": null,
        "quantity": 20,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 141,
        "recipeId": 10,
        "ingredientId": 60,
        "customIngredientName": null,
        "quantity": 30,
        "unitId": 3,
        "customUnit": null
      },
      {
        "id": 142,
        "recipeId": 10,
        "ingredientId": 53,
        "customIngredientName": null,
        "quantity": 3500,
        "unitId": 3,
        "customUnit": null
      },
      {
        "id": 143,
        "recipeId": 11,
        "ingredientId": 82,
        "customIngredientName": null,
        "quantity": 800,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 144,
        "recipeId": 11,
        "ingredientId": 1,
        "customIngredientName": null,
        "quantity": 350,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 145,
        "recipeId": 11,
        "ingredientId": 8,
        "customIngredientName": null,
        "quantity": 300,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 146,
        "recipeId": 11,
        "ingredientId": 29,
        "customIngredientName": null,
        "quantity": 30,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 147,
        "recipeId": 11,
        "ingredientId": 28,
        "customIngredientName": null,
        "quantity": 15,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 148,
        "recipeId": 11,
        "ingredientId": 75,
        "customIngredientName": null,
        "quantity": 15,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 149,
        "recipeId": 11,
        "ingredientId": 34,
        "customIngredientName": null,
        "quantity": 40,
        "unitId": 3,
        "customUnit": null
      },
      {
        "id": 150,
        "recipeId": 11,
        "ingredientId": 36,
        "customIngredientName": null,
        "quantity": 3,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 151,
        "recipeId": 11,
        "ingredientId": 37,
        "customIngredientName": null,
        "quantity": 10,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 152,
        "recipeId": 11,
        "ingredientId": 39,
        "customIngredientName": null,
        "quantity": 20,
        "unitId": 3,
        "customUnit": null
      },
      {
        "id": 153,
        "recipeId": 11,
        "ingredientId": 79,
        "customIngredientName": null,
        "quantity": 10,
        "unitId": 3,
        "customUnit": null
      },
      {
        "id": 154,
        "recipeId": 11,
        "ingredientId": 53,
        "customIngredientName": null,
        "quantity": 1000,
        "unitId": 3,
        "customUnit": null
      },
      {
        "id": 155,
        "recipeId": 11,
        "ingredientId": 47,
        "customIngredientName": null,
        "quantity": 50,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 156,
        "recipeId": 11,
        "ingredientId": 83,
        "customIngredientName": null,
        "quantity": 60,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 157,
        "recipeId": 11,
        "ingredientId": 52,
        "customIngredientName": null,
        "quantity": 120,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 158,
        "recipeId": 11,
        "ingredientId": 81,
        "customIngredientName": null,
        "quantity": 120,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 159,
        "recipeId": 11,
        "ingredientId": 18,
        "customIngredientName": null,
        "quantity": 100,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 160,
        "recipeId": 11,
        "ingredientId": 17,
        "customIngredientName": null,
        "quantity": 20,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 161,
        "recipeId": 11,
        "ingredientId": 14,
        "customIngredientName": null,
        "quantity": 20,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 162,
        "recipeId": 11,
        "ingredientId": 60,
        "customIngredientName": null,
        "quantity": 30,
        "unitId": 3,
        "customUnit": null
      },
      {
        "id": 163,
        "recipeId": 11,
        "ingredientId": 32,
        "customIngredientName": null,
        "quantity": 5,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 164,
        "recipeId": 12,
        "ingredientId": 5,
        "customIngredientName": null,
        "quantity": 1000,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 165,
        "recipeId": 12,
        "ingredientId": 84,
        "customIngredientName": null,
        "quantity": 350,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 166,
        "recipeId": 12,
        "ingredientId": 25,
        "customIngredientName": null,
        "quantity": 150,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 167,
        "recipeId": 12,
        "ingredientId": 29,
        "customIngredientName": null,
        "quantity": 30,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 168,
        "recipeId": 12,
        "ingredientId": 30,
        "customIngredientName": null,
        "quantity": 20,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 169,
        "recipeId": 12,
        "ingredientId": 70,
        "customIngredientName": null,
        "quantity": 2,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 170,
        "recipeId": 12,
        "ingredientId": 85,
        "customIngredientName": null,
        "quantity": 20,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 171,
        "recipeId": 12,
        "ingredientId": 59,
        "customIngredientName": null,
        "quantity": 150,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 172,
        "recipeId": 12,
        "ingredientId": 23,
        "customIngredientName": null,
        "quantity": 100,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 173,
        "recipeId": 12,
        "ingredientId": 58,
        "customIngredientName": null,
        "quantity": 150,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 174,
        "recipeId": 12,
        "ingredientId": 34,
        "customIngredientName": null,
        "quantity": 40,
        "unitId": 3,
        "customUnit": null
      },
      {
        "id": 175,
        "recipeId": 12,
        "ingredientId": 37,
        "customIngredientName": null,
        "quantity": 25,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 176,
        "recipeId": 12,
        "ingredientId": 36,
        "customIngredientName": null,
        "quantity": 6,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 177,
        "recipeId": 12,
        "ingredientId": 60,
        "customIngredientName": null,
        "quantity": 30,
        "unitId": 3,
        "customUnit": null
      },
      {
        "id": 178,
        "recipeId": 12,
        "ingredientId": 51,
        "customIngredientName": null,
        "quantity": 30,
        "unitId": 3,
        "customUnit": null
      },
      {
        "id": 179,
        "recipeId": 12,
        "ingredientId": 28,
        "customIngredientName": null,
        "quantity": 10,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 180,
        "recipeId": 12,
        "ingredientId": 32,
        "customIngredientName": null,
        "quantity": 5,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 181,
        "recipeId": 12,
        "ingredientId": 39,
        "customIngredientName": null,
        "quantity": 20,
        "unitId": 3,
        "customUnit": null
      },
      {
        "id": 182,
        "recipeId": 12,
        "ingredientId": 53,
        "customIngredientName": null,
        "quantity": 2000,
        "unitId": 3,
        "customUnit": null
      },
      {
        "id": 183,
        "recipeId": 13,
        "ingredientId": 86,
        "customIngredientName": null,
        "quantity": 200,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 184,
        "recipeId": 13,
        "ingredientId": 48,
        "customIngredientName": null,
        "quantity": 20,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 185,
        "recipeId": 13,
        "ingredientId": 8,
        "customIngredientName": null,
        "quantity": 250,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 186,
        "recipeId": 13,
        "ingredientId": 14,
        "customIngredientName": null,
        "quantity": 40,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 187,
        "recipeId": 13,
        "ingredientId": 29,
        "customIngredientName": null,
        "quantity": 15,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 188,
        "recipeId": 13,
        "ingredientId": 39,
        "customIngredientName": null,
        "quantity": 40,
        "unitId": 3,
        "customUnit": null
      },
      {
        "id": 189,
        "recipeId": 13,
        "ingredientId": 34,
        "customIngredientName": null,
        "quantity": 40,
        "unitId": 3,
        "customUnit": null
      },
      {
        "id": 190,
        "recipeId": 13,
        "ingredientId": 37,
        "customIngredientName": null,
        "quantity": 25,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 191,
        "recipeId": 13,
        "ingredientId": 36,
        "customIngredientName": null,
        "quantity": 2,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 192,
        "recipeId": 13,
        "ingredientId": 32,
        "customIngredientName": null,
        "quantity": 3,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 193,
        "recipeId": 13,
        "ingredientId": 53,
        "customIngredientName": null,
        "quantity": 800,
        "unitId": 3,
        "customUnit": null
      },
      {
        "id": 194,
        "recipeId": 14,
        "ingredientId": 5,
        "customIngredientName": null,
        "quantity": 1200,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 195,
        "recipeId": 14,
        "ingredientId": 87,
        "customIngredientName": null,
        "quantity": 5,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 196,
        "recipeId": 14,
        "ingredientId": 31,
        "customIngredientName": null,
        "quantity": 40,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 197,
        "recipeId": 14,
        "ingredientId": 30,
        "customIngredientName": null,
        "quantity": 20,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 198,
        "recipeId": 14,
        "ingredientId": 29,
        "customIngredientName": null,
        "quantity": 30,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 199,
        "recipeId": 14,
        "ingredientId": 28,
        "customIngredientName": null,
        "quantity": 15,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 200,
        "recipeId": 14,
        "ingredientId": 32,
        "customIngredientName": null,
        "quantity": 5,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 201,
        "recipeId": 14,
        "ingredientId": 36,
        "customIngredientName": null,
        "quantity": 6,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 202,
        "recipeId": 14,
        "ingredientId": 34,
        "customIngredientName": null,
        "quantity": 20,
        "unitId": 3,
        "customUnit": null
      },
      {
        "id": 203,
        "recipeId": 14,
        "ingredientId": 39,
        "customIngredientName": null,
        "quantity": 20,
        "unitId": 3,
        "customUnit": null
      },
      {
        "id": 204,
        "recipeId": 14,
        "ingredientId": 60,
        "customIngredientName": null,
        "quantity": 20,
        "unitId": 3,
        "customUnit": null
      },
      {
        "id": 205,
        "recipeId": 15,
        "ingredientId": 86,
        "customIngredientName": null,
        "quantity": 250,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 206,
        "recipeId": 15,
        "ingredientId": 48,
        "customIngredientName": null,
        "quantity": 20,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 207,
        "recipeId": 15,
        "ingredientId": 70,
        "customIngredientName": null,
        "quantity": 3,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 208,
        "recipeId": 15,
        "ingredientId": 88,
        "customIngredientName": null,
        "quantity": 200,
        "unitId": 3,
        "customUnit": null
      },
      {
        "id": 209,
        "recipeId": 15,
        "ingredientId": 53,
        "customIngredientName": null,
        "quantity": 550,
        "unitId": 3,
        "customUnit": null
      },
      {
        "id": 210,
        "recipeId": 15,
        "ingredientId": 1,
        "customIngredientName": null,
        "quantity": 250,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 211,
        "recipeId": 15,
        "ingredientId": 8,
        "customIngredientName": null,
        "quantity": 250,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 212,
        "recipeId": 15,
        "ingredientId": 18,
        "customIngredientName": null,
        "quantity": 300,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 213,
        "recipeId": 15,
        "ingredientId": 25,
        "customIngredientName": null,
        "quantity": 100,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 214,
        "recipeId": 15,
        "ingredientId": 14,
        "customIngredientName": null,
        "quantity": 30,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 215,
        "recipeId": 15,
        "ingredientId": 39,
        "customIngredientName": null,
        "quantity": 80,
        "unitId": 3,
        "customUnit": null
      },
      {
        "id": 216,
        "recipeId": 15,
        "ingredientId": 36,
        "customIngredientName": null,
        "quantity": 4,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 217,
        "recipeId": 15,
        "ingredientId": 34,
        "customIngredientName": null,
        "quantity": 50,
        "unitId": 3,
        "customUnit": null
      },
      {
        "id": 218,
        "recipeId": 15,
        "ingredientId": 37,
        "customIngredientName": null,
        "quantity": 30,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 219,
        "recipeId": 15,
        "ingredientId": 60,
        "customIngredientName": null,
        "quantity": 30,
        "unitId": 3,
        "customUnit": null
      },
      {
        "id": 220,
        "recipeId": 15,
        "ingredientId": 28,
        "customIngredientName": null,
        "quantity": 15,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 221,
        "recipeId": 15,
        "ingredientId": 32,
        "customIngredientName": null,
        "quantity": 5,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 222,
        "recipeId": 15,
        "ingredientId": 52,
        "customIngredientName": null,
        "quantity": 200,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 223,
        "recipeId": 15,
        "ingredientId": 89,
        "customIngredientName": null,
        "quantity": 200,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 224,
        "recipeId": 15,
        "ingredientId": 17,
        "customIngredientName": null,
        "quantity": 30,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 225,
        "recipeId": 16,
        "ingredientId": 8,
        "customIngredientName": null,
        "quantity": 300,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 226,
        "recipeId": 16,
        "ingredientId": 1,
        "customIngredientName": null,
        "quantity": 300,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 227,
        "recipeId": 16,
        "ingredientId": 46,
        "customIngredientName": null,
        "quantity": 300,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 228,
        "recipeId": 16,
        "ingredientId": 90,
        "customIngredientName": null,
        "quantity": 120,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 229,
        "recipeId": 16,
        "ingredientId": 52,
        "customIngredientName": null,
        "quantity": 150,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 230,
        "recipeId": 16,
        "ingredientId": 17,
        "customIngredientName": null,
        "quantity": 20,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 231,
        "recipeId": 16,
        "ingredientId": 58,
        "customIngredientName": null,
        "quantity": 150,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 232,
        "recipeId": 16,
        "ingredientId": 91,
        "customIngredientName": null,
        "quantity": 100,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 233,
        "recipeId": 16,
        "ingredientId": 47,
        "customIngredientName": null,
        "quantity": 40,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 234,
        "recipeId": 16,
        "ingredientId": 28,
        "customIngredientName": null,
        "quantity": 10,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 235,
        "recipeId": 16,
        "ingredientId": 39,
        "customIngredientName": null,
        "quantity": 10,
        "unitId": 3,
        "customUnit": null
      },
      {
        "id": 236,
        "recipeId": 16,
        "ingredientId": 37,
        "customIngredientName": null,
        "quantity": 15,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 237,
        "recipeId": 16,
        "ingredientId": 36,
        "customIngredientName": null,
        "quantity": 3,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 238,
        "recipeId": 16,
        "ingredientId": 53,
        "customIngredientName": null,
        "quantity": 1200,
        "unitId": 3,
        "customUnit": null
      },
      {
        "id": 239,
        "recipeId": 17,
        "ingredientId": 92,
        "customIngredientName": null,
        "quantity": 700,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 240,
        "recipeId": 17,
        "ingredientId": 34,
        "customIngredientName": null,
        "quantity": 40,
        "unitId": 3,
        "customUnit": null
      },
      {
        "id": 241,
        "recipeId": 17,
        "ingredientId": 37,
        "customIngredientName": null,
        "quantity": 25,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 242,
        "recipeId": 17,
        "ingredientId": 43,
        "customIngredientName": null,
        "quantity": 300,
        "unitId": 3,
        "customUnit": null
      },
      {
        "id": 243,
        "recipeId": 17,
        "ingredientId": 29,
        "customIngredientName": null,
        "quantity": 25,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 244,
        "recipeId": 17,
        "ingredientId": 28,
        "customIngredientName": null,
        "quantity": 10,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 245,
        "recipeId": 17,
        "ingredientId": 32,
        "customIngredientName": null,
        "quantity": 5,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 246,
        "recipeId": 17,
        "ingredientId": 38,
        "customIngredientName": null,
        "quantity": 2,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 247,
        "recipeId": 17,
        "ingredientId": 14,
        "customIngredientName": null,
        "quantity": 20,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 248,
        "recipeId": 17,
        "ingredientId": 39,
        "customIngredientName": null,
        "quantity": 15,
        "unitId": 3,
        "customUnit": null
      },
      {
        "id": 249,
        "recipeId": 18,
        "ingredientId": 94,
        "customIngredientName": null,
        "quantity": 400,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 250,
        "recipeId": 18,
        "ingredientId": 93,
        "customIngredientName": null,
        "quantity": 800,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 251,
        "recipeId": 18,
        "ingredientId": 31,
        "customIngredientName": null,
        "quantity": 40,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 252,
        "recipeId": 18,
        "ingredientId": 28,
        "customIngredientName": null,
        "quantity": 20,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 253,
        "recipeId": 18,
        "ingredientId": 29,
        "customIngredientName": null,
        "quantity": 20,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 254,
        "recipeId": 18,
        "ingredientId": 34,
        "customIngredientName": null,
        "quantity": 80,
        "unitId": 3,
        "customUnit": null
      },
      {
        "id": 255,
        "recipeId": 18,
        "ingredientId": 37,
        "customIngredientName": null,
        "quantity": 45,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 256,
        "recipeId": 18,
        "ingredientId": 95,
        "customIngredientName": null,
        "quantity": 15,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 257,
        "recipeId": 18,
        "ingredientId": 39,
        "customIngredientName": null,
        "quantity": 40,
        "unitId": 3,
        "customUnit": null
      },
      {
        "id": 258,
        "recipeId": 18,
        "ingredientId": 38,
        "customIngredientName": null,
        "quantity": 2,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 259,
        "recipeId": 18,
        "ingredientId": 14,
        "customIngredientName": null,
        "quantity": 40,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 260,
        "recipeId": 18,
        "ingredientId": 23,
        "customIngredientName": null,
        "quantity": 120,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 261,
        "recipeId": 18,
        "ingredientId": 59,
        "customIngredientName": null,
        "quantity": 120,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 262,
        "recipeId": 18,
        "ingredientId": 51,
        "customIngredientName": null,
        "quantity": 40,
        "unitId": 3,
        "customUnit": null
      },
      {
        "id": 263,
        "recipeId": 18,
        "ingredientId": 58,
        "customIngredientName": null,
        "quantity": 150,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 264,
        "recipeId": 18,
        "ingredientId": 19,
        "customIngredientName": null,
        "quantity": 150,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 265,
        "recipeId": 18,
        "ingredientId": 60,
        "customIngredientName": null,
        "quantity": 25,
        "unitId": 3,
        "customUnit": null
      },
      {
        "id": 266,
        "recipeId": 18,
        "ingredientId": 32,
        "customIngredientName": null,
        "quantity": 5,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 267,
        "recipeId": 18,
        "ingredientId": 53,
        "customIngredientName": null,
        "quantity": 650,
        "unitId": 3,
        "customUnit": null
      },
      {
        "id": 268,
        "recipeId": 19,
        "ingredientId": 12,
        "customIngredientName": null,
        "quantity": 500,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 269,
        "recipeId": 19,
        "ingredientId": 26,
        "customIngredientName": null,
        "quantity": 150,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 270,
        "recipeId": 19,
        "ingredientId": 96,
        "customIngredientName": null,
        "quantity": 150,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 271,
        "recipeId": 19,
        "ingredientId": 97,
        "customIngredientName": null,
        "quantity": 100,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 272,
        "recipeId": 19,
        "ingredientId": 28,
        "customIngredientName": null,
        "quantity": 10,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 273,
        "recipeId": 19,
        "ingredientId": 41,
        "customIngredientName": null,
        "quantity": 40,
        "unitId": 3,
        "customUnit": null
      },
      {
        "id": 274,
        "recipeId": 19,
        "ingredientId": 37,
        "customIngredientName": null,
        "quantity": 10,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 275,
        "recipeId": 19,
        "ingredientId": 36,
        "customIngredientName": null,
        "quantity": 2,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 276,
        "recipeId": 19,
        "ingredientId": 38,
        "customIngredientName": null,
        "quantity": 1,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 277,
        "recipeId": 19,
        "ingredientId": 39,
        "customIngredientName": null,
        "quantity": 40,
        "unitId": 3,
        "customUnit": null
      },
      {
        "id": 278,
        "recipeId": 19,
        "ingredientId": 14,
        "customIngredientName": null,
        "quantity": 20,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 279,
        "recipeId": 19,
        "ingredientId": 53,
        "customIngredientName": null,
        "quantity": 300,
        "unitId": 3,
        "customUnit": null
      },
      {
        "id": 280,
        "recipeId": 20,
        "ingredientId": 98,
        "customIngredientName": null,
        "quantity": 500,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 281,
        "recipeId": 20,
        "ingredientId": 99,
        "customIngredientName": null,
        "quantity": 50,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 282,
        "recipeId": 20,
        "ingredientId": 88,
        "customIngredientName": null,
        "quantity": 300,
        "unitId": 3,
        "customUnit": null
      },
      {
        "id": 283,
        "recipeId": 20,
        "ingredientId": 37,
        "customIngredientName": null,
        "quantity": 70,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 284,
        "recipeId": 20,
        "ingredientId": 36,
        "customIngredientName": null,
        "quantity": 1,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 285,
        "recipeId": 20,
        "ingredientId": 73,
        "customIngredientName": null,
        "quantity": 15,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 286,
        "recipeId": 20,
        "ingredientId": 47,
        "customIngredientName": null,
        "quantity": 30,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 287,
        "recipeId": 20,
        "ingredientId": 100,
        "customIngredientName": null,
        "quantity": 10,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 288,
        "recipeId": 20,
        "ingredientId": 53,
        "customIngredientName": null,
        "quantity": 700,
        "unitId": 3,
        "customUnit": null
      },
      {
        "id": 289,
        "recipeId": 21,
        "ingredientId": 13,
        "customIngredientName": null,
        "quantity": 400,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 290,
        "recipeId": 21,
        "ingredientId": 28,
        "customIngredientName": null,
        "quantity": 20,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 291,
        "recipeId": 21,
        "ingredientId": 39,
        "customIngredientName": null,
        "quantity": 20,
        "unitId": 3,
        "customUnit": null
      },
      {
        "id": 292,
        "recipeId": 21,
        "ingredientId": 41,
        "customIngredientName": null,
        "quantity": 15,
        "unitId": 3,
        "customUnit": null
      },
      {
        "id": 293,
        "recipeId": 21,
        "ingredientId": 36,
        "customIngredientName": null,
        "quantity": 2,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 294,
        "recipeId": 21,
        "ingredientId": 37,
        "customIngredientName": null,
        "quantity": 3,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 295,
        "recipeId": 21,
        "ingredientId": 53,
        "customIngredientName": null,
        "quantity": 40,
        "unitId": 3,
        "customUnit": null
      },
      {
        "id": 296,
        "recipeId": 22,
        "ingredientId": 10,
        "customIngredientName": null,
        "quantity": 3,
        "unitId": 8,
        "customUnit": null
      },
      {
        "id": 297,
        "recipeId": 22,
        "ingredientId": 14,
        "customIngredientName": null,
        "quantity": 20,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 298,
        "recipeId": 22,
        "ingredientId": 34,
        "customIngredientName": null,
        "quantity": 10,
        "unitId": 3,
        "customUnit": null
      },
      {
        "id": 299,
        "recipeId": 22,
        "ingredientId": 38,
        "customIngredientName": null,
        "quantity": 0.5,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 300,
        "recipeId": 22,
        "ingredientId": 39,
        "customIngredientName": null,
        "quantity": 15,
        "unitId": 3,
        "customUnit": null
      },
      {
        "id": 301,
        "recipeId": 22,
        "ingredientId": 53,
        "customIngredientName": null,
        "quantity": 15,
        "unitId": 3,
        "customUnit": null
      },
      {
        "id": 302,
        "recipeId": 23,
        "ingredientId": 101,
        "customIngredientName": null,
        "quantity": 450,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 303,
        "recipeId": 23,
        "ingredientId": 50,
        "customIngredientName": null,
        "quantity": 150,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 304,
        "recipeId": 23,
        "ingredientId": 29,
        "customIngredientName": null,
        "quantity": 15,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 305,
        "recipeId": 23,
        "ingredientId": 14,
        "customIngredientName": null,
        "quantity": 15,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 306,
        "recipeId": 23,
        "ingredientId": 34,
        "customIngredientName": null,
        "quantity": 20,
        "unitId": 3,
        "customUnit": null
      },
      {
        "id": 307,
        "recipeId": 23,
        "ingredientId": 36,
        "customIngredientName": null,
        "quantity": 2,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 308,
        "recipeId": 23,
        "ingredientId": 38,
        "customIngredientName": null,
        "quantity": 0.5,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 309,
        "recipeId": 23,
        "ingredientId": 39,
        "customIngredientName": null,
        "quantity": 10,
        "unitId": 3,
        "customUnit": null
      },
      {
        "id": 310,
        "recipeId": 23,
        "ingredientId": 53,
        "customIngredientName": null,
        "quantity": 1000,
        "unitId": 3,
        "customUnit": null
      },
      {
        "id": 311,
        "recipeId": 24,
        "ingredientId": 12,
        "customIngredientName": null,
        "quantity": 450,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 312,
        "recipeId": 24,
        "ingredientId": 19,
        "customIngredientName": null,
        "quantity": 300,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 313,
        "recipeId": 24,
        "ingredientId": 29,
        "customIngredientName": null,
        "quantity": 15,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 314,
        "recipeId": 24,
        "ingredientId": 14,
        "customIngredientName": null,
        "quantity": 15,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 315,
        "recipeId": 24,
        "ingredientId": 103,
        "customIngredientName": null,
        "quantity": 20,
        "unitId": 3,
        "customUnit": null
      },
      {
        "id": 316,
        "recipeId": 24,
        "ingredientId": 37,
        "customIngredientName": null,
        "quantity": 8,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 317,
        "recipeId": 24,
        "ingredientId": 36,
        "customIngredientName": null,
        "quantity": 2,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 318,
        "recipeId": 24,
        "ingredientId": 39,
        "customIngredientName": null,
        "quantity": 35,
        "unitId": 3,
        "customUnit": null
      },
      {
        "id": 319,
        "recipeId": 24,
        "ingredientId": 53,
        "customIngredientName": null,
        "quantity": 150,
        "unitId": 3,
        "customUnit": null
      },
      {
        "id": 320,
        "recipeId": 25,
        "ingredientId": 6,
        "customIngredientName": null,
        "quantity": 600,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 321,
        "recipeId": 25,
        "ingredientId": 57,
        "customIngredientName": null,
        "quantity": 120,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 322,
        "recipeId": 25,
        "ingredientId": 25,
        "customIngredientName": null,
        "quantity": 100,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 323,
        "recipeId": 25,
        "ingredientId": 28,
        "customIngredientName": null,
        "quantity": 15,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 324,
        "recipeId": 25,
        "ingredientId": 34,
        "customIngredientName": null,
        "quantity": 30,
        "unitId": 3,
        "customUnit": null
      },
      {
        "id": 325,
        "recipeId": 25,
        "ingredientId": 51,
        "customIngredientName": null,
        "quantity": 35,
        "unitId": 3,
        "customUnit": null
      },
      {
        "id": 326,
        "recipeId": 25,
        "ingredientId": 37,
        "customIngredientName": null,
        "quantity": 30,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 327,
        "recipeId": 25,
        "ingredientId": 48,
        "customIngredientName": null,
        "quantity": 5,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 328,
        "recipeId": 25,
        "ingredientId": 39,
        "customIngredientName": null,
        "quantity": 30,
        "unitId": 3,
        "customUnit": null
      },
      {
        "id": 329,
        "recipeId": 25,
        "ingredientId": 38,
        "customIngredientName": null,
        "quantity": 1,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 330,
        "recipeId": 25,
        "ingredientId": 53,
        "customIngredientName": null,
        "quantity": 400,
        "unitId": 3,
        "customUnit": null
      },
      {
        "id": 331,
        "recipeId": 26,
        "ingredientId": 102,
        "customIngredientName": null,
        "quantity": 200,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 332,
        "recipeId": 26,
        "ingredientId": 73,
        "customIngredientName": null,
        "quantity": 20,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 333,
        "recipeId": 26,
        "ingredientId": 37,
        "customIngredientName": null,
        "quantity": 90,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 334,
        "recipeId": 26,
        "ingredientId": 88,
        "customIngredientName": null,
        "quantity": 200,
        "unitId": 3,
        "customUnit": null
      },
      {
        "id": 335,
        "recipeId": 26,
        "ingredientId": 48,
        "customIngredientName": null,
        "quantity": 15,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 336,
        "recipeId": 26,
        "ingredientId": 36,
        "customIngredientName": null,
        "quantity": 1,
        "unitId": 1,
        "customUnit": null
      },
      {
        "id": 337,
        "recipeId": 26,
        "ingredientId": 53,
        "customIngredientName": null,
        "quantity": 1200,
        "unitId": 3,
        "customUnit": null
      }
    ].map((row) => ({ ...row, createdAt: now, updatedAt: now }));
    const cookingStepsData = [
      {
        "id": 1,
        "recipeId": 1,
        "stepNumber": 1,
        "instruction": "Cá làm sạch, bỏ mang/nội tạng, cắt khúc 2–3 cm và thấm ráo. Ướp với 1/3 tổng nước mắm và 1/3 tổng muối trong 10 phút. Rửa rau, thái cà chua múi cau, dứa lát, đậu bắp xéo; băm tỏi, thái ớt và rau ngổ."
      },
      {
        "id": 2,
        "recipeId": 1,
        "stepNumber": 2,
        "instruction": "Dọc mùng loại ăn được tước vỏ, thái xéo; bóp với phần muối còn lại, xả kỹ và vắt nhẹ. Chần trong nước sôi riêng 2 phút, bỏ nước chần. Không sử dụng cây dại chưa xác định đúng loại."
      },
      {
        "id": 3,
        "recipeId": 1,
        "stepNumber": 3,
        "instruction": "Lấy 1/7 tổng nước lọc trong bảng, làm nóng rồi dầm toàn bộ me, lọc bỏ xơ. Phi tỏi bằng toàn bộ dầu tới vàng nhạt, vớt một nửa tỏi ra để rắc cuối."
      },
      {
        "id": 4,
        "recipeId": 1,
        "stepNumber": 4,
        "instruction": "Cho cà chua và dứa vào phần dầu tỏi, đảo 2 phút. Thêm toàn bộ nước lọc còn lại và nước me, đun sôi."
      },
      {
        "id": 5,
        "recipeId": 1,
        "stepNumber": 5,
        "instruction": "Thả cá vào khi nước sôi, hạ vừa lửa, hớt bọt và nấu 8–12 phút tùy độ dày, đến khi thịt cá chín đục, tách thớ; không khuấy mạnh làm vỡ cá."
      },
      {
        "id": 6,
        "recipeId": 1,
        "stepNumber": 6,
        "instruction": "Thêm đậu bắp, dọc mùng, phần nước mắm còn lại và toàn bộ đường; nấu 3 phút. Cho giá vào nấu thêm 1 phút, tắt bếp rồi thêm rau ngổ, ớt và tỏi phi đã giữ. Thành phẩm chua dịu, cá chín nguyên khúc, rau không nhũn."
      },
      {
        "id": 7,
        "recipeId": 2,
        "stepNumber": 1,
        "instruction": "Ba chỉ cắt miếng khoảng 3 cm, chần nhanh trong nước sôi riêng rồi rửa sạch cặn và để ráo. Băm hành tím, tỏi."
      },
      {
        "id": 8,
        "recipeId": 2,
        "stepNumber": 2,
        "instruction": "Trứng cút luộc khoảng 5 phút từ lúc nước sôi nhẹ, làm nguội và bóc vỏ. Ướp thịt với 2/3 tổng nước mắm, 2/5 tổng đường, toàn bộ hành, tỏi và tiêu trong 30 phút."
      },
      {
        "id": 9,
        "recipeId": 2,
        "stepNumber": 3,
        "instruction": "Cho toàn bộ dầu và phần đường còn lại vào nồi, đun vừa đến màu hổ phách; không để đen. Thêm thịt vào đảo 5 phút, tránh bắn đường nóng."
      },
      {
        "id": 10,
        "recipeId": 2,
        "stepNumber": 4,
        "instruction": "Rót toàn bộ nước dừa và nước lọc trong bảng, đun sôi, hớt bọt. Hạ nhỏ lửa, đậy hé và kho khoảng 45 phút."
      },
      {
        "id": 11,
        "recipeId": 2,
        "stepNumber": 5,
        "instruction": "Cho trứng và phần nước mắm còn lại vào, kho thêm 20 phút. Nếu cạn quá nhanh, giảm lửa/đậy nắp thay vì tiếp tục đun khô; với nồi bốc hơi mạnh có thể cần bổ sung nước nóng, ghi lượng thực tế khi hiệu chỉnh phiên bản seed."
      },
      {
        "id": 12,
        "recipeId": 2,
        "stepNumber": 6,
        "instruction": "Kiểm tra thịt mềm khi xiên nhưng không nát, trứng thấm vị, nước kho còn xâm xấp. Tắt bếp, để nghỉ 5 phút trước khi dùng với cơm."
      },
      {
        "id": 13,
        "recipeId": 3,
        "stepNumber": 1,
        "instruction": "Chần xương trong nồi nước sôi riêng khoảng 10 phút rồi xả sạch cặn. Nạm thấm sạch. Nướng 3/4 tổng hành tây, toàn bộ hành tím và gừng đến thơm, bỏ phần cháy đen. Giữ phần hành tây còn lại để thái mỏng ăn kèm."
      },
      {
        "id": 14,
        "recipeId": 3,
        "stepNumber": 2,
        "instruction": "Cho xương, nạm, hành gừng nướng và 8/9 tổng nước lọc trong bảng vào nồi lớn; giữ 1/9 nước làm dự phòng. Đun sôi, hớt bọt, hạ lửa chỉ sôi lăn tăn. Cho 2/3 tổng muối vào. Đậy hé để hạn chế bay hơi."
      },
      {
        "id": 15,
        "recipeId": 3,
        "stepNumber": 3,
        "instruction": "Sau khoảng 75–100 phút, kiểm tra nạm chín mềm vừa phải thì vớt ra, đậy giữ ẩm để nguội bớt rồi thái ngang thớ. Tiếp tục ninh xương để tổng thời gian đạt khoảng 4 giờ."
      },
      {
        "id": 16,
        "recipeId": 3,
        "stepNumber": 4,
        "instruction": "Rang hồi, quế, hạt mùi 1–2 phút, bọc túi lọc và cho vào 45 phút cuối, sau đó vớt túi ra để không đắng/nồng."
      },
      {
        "id": 17,
        "recipeId": 3,
        "stepNumber": 5,
        "instruction": "Lọc nước dùng, loại xương và gia vị. Dùng phần nước dự phòng để bù bay hơi khi cần; đun cô hoặc bù nước để thu khoảng 600 ml nước dùng cho mỗi phần ăn đang nấu. Nêm toàn bộ nước mắm, đường và phần muối còn lại; đun sôi lại. Lượng dự phòng có thể không dùng hết; mức nước thực tế phụ thuộc nồi và độ hé nắp."
      },
      {
        "id": 18,
        "recipeId": 3,
        "stepNumber": 6,
        "instruction": "Chần phở bằng nước sôi riêng, chia thành số bát tương ứng số phần ăn đang nấu; xếp nạm, hành tây sống thái mỏng, hành lá và rau mùi. Chan khoảng 600 ml nước dùng nóng mỗi bát. Chanh và ớt chia đều ăn kèm, không cho chanh vào cả nồi."
      },
      {
        "id": 19,
        "recipeId": 4,
        "stepNumber": 1,
        "instruction": "Thịt gà thấm khô, cắt miếng 2–3 cm. Băm sả, ớt, hành và tỏi; để riêng dụng cụ tiếp xúc thịt sống và đồ chín."
      },
      {
        "id": 20,
        "recipeId": 4,
        "stepNumber": 2,
        "instruction": "Ướp gà với một nửa tổng sả, một nửa tổng nước mắm, một nửa tổng đường và toàn bộ tiêu trong 20 phút trong ngăn mát."
      },
      {
        "id": 21,
        "recipeId": 4,
        "stepNumber": 3,
        "instruction": "Làm nóng toàn bộ dầu, phi hành, tỏi và phần sả còn lại khoảng 1 phút; thêm gà, đảo lửa vừa lớn 5 phút tới săn."
      },
      {
        "id": 22,
        "recipeId": 4,
        "stepNumber": 4,
        "instruction": "Thêm toàn bộ nước lọc, phần nước mắm và đường còn lại cùng ớt; đậy nắp, nấu lửa vừa nhỏ 8–10 phút."
      },
      {
        "id": 23,
        "recipeId": 4,
        "stepNumber": 5,
        "instruction": "Mở nắp, đảo 3–4 phút cho sốt bám thịt; kiểm tra miếng dày nhất chín hoàn toàn rồi tắt bếp. Thịt còn ẩm, sả thơm, không cháy đen."
      },
      {
        "id": 24,
        "recipeId": 5,
        "stepNumber": 1,
        "instruction": "Bò thấm khô, cắt khối khoảng 2 cm. Ướp với toàn bộ dầu hào, nước tương, đường, tiêu và một nửa tổng tỏi băm trong 15 phút."
      },
      {
        "id": 25,
        "recipeId": 5,
        "stepNumber": 2,
        "instruction": "Cắt ớt chuông, hành tây miếng vuông. Xà lách và cà chua rửa bằng nước sạch, để ráo, xếp lên đĩa."
      },
      {
        "id": 26,
        "recipeId": 5,
        "stepNumber": 3,
        "instruction": "Làm nóng chảo với một nửa tổng dầu; xào ớt chuông và hành tây 2–3 phút rồi trút ra."
      },
      {
        "id": 27,
        "recipeId": 5,
        "stepNumber": 4,
        "instruction": "Dùng phần dầu còn lại, cho bò vào một lớp, chia lượt nếu chảo nhỏ. Áp chảo rồi đảo/lắc trong khoảng 4–6 phút mỗi mẻ tùy độ dày, cho phần tỏi còn lại vào cuối để không cháy. Kiểm tra độ chín mong muốn và phù hợp người ăn; thời gian không phải bảo đảm độ chín tuyệt đối."
      },
      {
        "id": 28,
        "recipeId": 5,
        "stepNumber": 5,
        "instruction": "Trút rau củ lại vào chảo, đảo 30–60 giây, tắt bếp và bày lên đĩa rau. Không om lâu khiến bò dai."
      },
      {
        "id": 29,
        "recipeId": 6,
        "stepNumber": 1,
        "instruction": "Ba chỉ thái lát dày 4–5 mm. Băm hành, tỏi; dùng 1/3 tổng nước mắm, 1/3 tổng đường, một nửa tổng tỏi cùng toàn bộ hành, tiêu và dầu để ướp. Chia hỗn hợp gia vị theo lượng mỗi loại thịt, giữ hai loại thịt riêng, ướp ngăn mát 45 phút; nặn phần thịt xay thành viên dẹt có độ dày tương tự nhau."
      },
      {
        "id": 30,
        "recipeId": 6,
        "stepNumber": 2,
        "instruction": "Đu đủ và cà rốt thái lát mỏng. Trộn với một nửa tổng giấm và 1/6 tổng đường, để 20 phút rồi để ráo. Rửa sạch, để ráo rau sống."
      },
      {
        "id": 31,
        "recipeId": 6,
        "stepNumber": 3,
        "instruction": "Hòa toàn bộ nước lọc với phần nước mắm, đường và giấm còn lại. Đun ấm để tan đường, để nguội bớt, thêm phần tỏi còn lại và toàn bộ ớt."
      },
      {
        "id": 32,
        "recipeId": 6,
        "stepNumber": 4,
        "instruction": "Làm nóng lò 210°C; nướng thịt trên vỉ có khay hứng 18–25 phút, trở giữa chừng. Chả viên phải chín tận giữa, ba chỉ chín mềm, xém mặt vừa; không dùng màu nướng để kết luận thịt đã chín."
      },
      {
        "id": 33,
        "recipeId": 6,
        "stepNumber": 5,
        "instruction": "Chia nước chấm, chả và đồ chua theo số phần ăn đang nấu; bún cùng rau để riêng. Chỉ ngâm chả trong nước chấm ngay trước lúc ăn để còn thơm."
      },
      {
        "id": 34,
        "recipeId": 7,
        "stepNumber": 1,
        "instruction": "Ngâm miến trong nước thường 10–15 phút đến mềm, để ráo và cắt ngắn. Mộc nhĩ ngâm riêng đến nở vừa, rửa sạch, bỏ chân, băm nhỏ; không ngâm qua đêm ở nhiệt độ phòng. Băm tôm, thái nhỏ hành tây, cà rốt và hành lá."
      },
      {
        "id": 35,
        "recipeId": 7,
        "stepNumber": 2,
        "instruction": "Trộn thịt, tôm, miến, mộc nhĩ, rau củ với lượng trứng trong bảng, 1/3 tổng nước mắm và toàn bộ tiêu. Nếu lượng trứng là phần lẻ, đánh tan trứng rồi lấy đúng tỉ lệ. Trộn ngay trước khi cuốn, không để nhân ra nhiều nước."
      },
      {
        "id": 36,
        "recipeId": 7,
        "stepNumber": 3,
        "instruction": "Làm mềm bánh đa nem bằng khăn ẩm, chia nhân theo số vỏ thực tế và cuốn vừa tay, không siết chặt. Giữ cuốn nhỏ đều nhau; mẻ gốc 4 phần ăn cho khoảng 16 cuốn, thay đổi số cuốn theo khẩu phần và kích thước vỏ, không tăng độ dày cuốn."
      },
      {
        "id": 37,
        "recipeId": 7,
        "stepNumber": 4,
        "instruction": "Cho dầu theo bảng vào chảo có kích thước phù hợp để rán ngập một phần cuốn; rán từng mẻ ở khoảng 150–160°C tới nhân chín và vỏ vàng nhạt, khoảng 8–10 phút/mẻ; vớt lên giá. Trước khi ăn có thể tăng lên 170–175°C và rán lại 1–2 phút cho giòn; không để dầu bốc khói. Không thêm lại toàn bộ lượng dầu cho mỗi mẻ."
      },
      {
        "id": 38,
        "recipeId": 7,
        "stepNumber": 5,
        "instruction": "Hòa toàn bộ nước lọc với phần nước mắm còn lại, toàn bộ đường, giấm, tỏi băm và ớt. Cắt kiểm tra một cuốn dày nhất: nhân chín hoàn toàn, không còn phần thịt/tôm sống; dùng nem nóng với nước chấm."
      },
      {
        "id": 39,
        "recipeId": 8,
        "stepNumber": 1,
        "instruction": "Cá thấm khô, cắt miếng khoảng 3 cm, rà lại xương sót. Riềng giã nhỏ, mẻ lọc mịn, hành tím băm; hành lá và thì là cắt đoạn."
      },
      {
        "id": 40,
        "recipeId": 8,
        "stepNumber": 2,
        "instruction": "Ướp cá với toàn bộ riềng, mẻ, nghệ, hành tím, 2/5 tổng nước mắm, 1/3 tổng đường và 1/4 tổng dầu trong ngăn mát 60 phút."
      },
      {
        "id": 41,
        "recipeId": 8,
        "stepNumber": 3,
        "instruction": "Xếp cá lên khay có giấy nướng, nướng lò đã nóng 200°C khoảng 12–15 phút, trở nhẹ nếu cần, tới gần chín."
      },
      {
        "id": 42,
        "recipeId": 8,
        "stepNumber": 4,
        "instruction": "Hòa toàn bộ nước lọc, phần nước mắm và đường còn lại cùng toàn bộ nước chanh, tỏi và ớt làm nước chấm. Chia bún và lạc ra đĩa theo số phần ăn đang nấu."
      },
      {
        "id": 43,
        "recipeId": 8,
        "stepNumber": 5,
        "instruction": "Làm nóng phần dầu còn lại trong chảo, cho cá cùng hành lá và thì là vào đảo nhẹ 3–5 phút đến cá chín hoàn toàn, rau vừa mềm. Ăn nóng cùng bún, lạc và nước chấm."
      },
      {
        "id": 44,
        "recipeId": 9,
        "stepNumber": 1,
        "instruction": "Vo nếp theo lượng trong bảng đã đổi, chia thành 5 phần bằng nhau tương ứng 5 màu. Chia toàn bộ nước lọc thành 5 phần bằng nhau: một phần dùng ngâm màu trắng; một phần nấu lá cẩm 10 phút rồi lọc; một phần xay lá dứa rồi lọc; một phần xay nghệ rồi lọc; một phần dùng ngâm nếp sẽ trộn gấc. Để nước màu nguội trước khi ngâm."
      },
      {
        "id": 45,
        "recipeId": 9,
        "stepNumber": 2,
        "instruction": "Ngâm riêng 5 phần nếp trong các nước đã chuẩn bị khoảng 6 giờ trong ngăn mát. Dùng dụng cụ riêng cho từng màu; nước ngâm phải phủ mặt nếp. Không thêm phẩm màu không rõ nguồn gốc."
      },
      {
        "id": 46,
        "recipeId": 9,
        "stepNumber": 3,
        "instruction": "Đổ bỏ nước ngâm, để nếp ráo ít nhất 15 phút. Chia toàn bộ muối và dầu thành 5 phần bằng nhau, trộn mỗi phần vào một màu nếp. Phần nếp dành màu đỏ trộn thêm toàn bộ thịt gấc trong bảng, bóp nhẹ cho bám màu."
      },
      {
        "id": 47,
        "recipeId": 9,
        "stepNumber": 4,
        "instruction": "Đun sôi nước xửng riêng. Xếp 5 màu vào các khoang/khay có vách ngăn chịu nhiệt; không nén chặt, chừa đường hơi. Hấp 25 phút lửa vừa mạnh."
      },
      {
        "id": 48,
        "recipeId": 9,
        "stepNumber": 5,
        "instruction": "Mở nắp tránh nước nhỏ xuống xôi, xới nhẹ từng phần, hấp tiếp khoảng 20 phút đến hạt nếp mềm dẻo, không còn lõi cứng. Xếp 5 màu cạnh nhau, không trộn lẫn. Màu thực tế phụ thuộc nguyên liệu và giống nếp."
      },
      {
        "id": 49,
        "recipeId": 10,
        "stepNumber": 1,
        "instruction": "Chần giò heo và bắp bò trong nước sôi riêng, rửa sạch cặn. Đập dập 7/10 tổng sả; băm phần sả còn lại cùng toàn bộ hành tím và tỏi. Hành tây bổ đôi."
      },
      {
        "id": 50,
        "recipeId": 10,
        "stepNumber": 2,
        "instruction": "Chia toàn bộ nước lọc trong bảng thành ba phần theo tỉ lệ 2:30:3, lần lượt dùng hòa ruốc, ninh thịt và dự phòng. Hòa toàn bộ mắm ruốc với phần nước dành hòa ruốc, để lắng rồi lọc phần nước phía trên, bỏ cặn. Dùng rây mịn; không cho nguyên phần cặn vào nồi."
      },
      {
        "id": 51,
        "recipeId": 10,
        "stepNumber": 3,
        "instruction": "Cho thịt, hành tây, sả đập dập và phần nước dành ninh thịt vào nồi, đun sôi, hớt bọt, thêm toàn bộ muối rồi ninh lửa nhỏ. Cho nước ruốc đã lọc vào sau khi nồi trong bọt."
      },
      {
        "id": 52,
        "recipeId": 10,
        "stepNumber": 4,
        "instruction": "Kiểm tra giò heo sau 60–90 phút và bắp bò sau 90–120 phút; vớt riêng từng phần khi vừa mềm để không nát. Thái bắp bò ngang thớ, giữ giò nguyên khoanh. Duy trì nồi nước dùng nóng."
      },
      {
        "id": 53,
        "recipeId": 10,
        "stepNumber": 5,
        "instruction": "Phi hành, tỏi và sả băm bằng dầu ăn; hạ lửa, thêm dầu màu điều cùng ớt bột, đảo 20–30 giây rồi cho vào nồi. Không rang cháy ớt. Nêm nước mắm và đường."
      },
      {
        "id": 54,
        "recipeId": 10,
        "stepNumber": 6,
        "instruction": "Lọc bỏ hành/sả lớn, dùng phần nước dự phòng để điều chỉnh bay hơi khi cần, nhắm khoảng 600 ml nước dùng cho mỗi phần ăn đang nấu. Đun sôi lại và giữ nóng; thời gian mẻ gốc khoảng 150 phút gồm sơ chế nhiệt và hoàn thiện. Không bắt buộc dùng hết nước dự phòng nếu đã đạt lượng nước dùng và vị phù hợp."
      },
      {
        "id": 55,
        "recipeId": 10,
        "stepNumber": 7,
        "instruction": "Rửa rau bằng nước sạch; giá chần chín riêng. Chần bún, chia theo số phần ăn đang nấu, xếp bò và giò, chan khoảng 600 ml nước dùng mỗi bát, rắc hành mùi. Bắp chuối, húng quế và chanh chia riêng ăn kèm."
      },
      {
        "id": 56,
        "recipeId": 11,
        "stepNumber": 1,
        "instruction": "Ba chỉ thái lát vừa, tôm bỏ chỉ lưng. Giã nghệ, băm hành và tỏi. Ướp thịt với một nửa của từng loại hành, tỏi, nghệ, một nửa tổng nước mắm, toàn bộ muối và một nửa tổng đường trong 20 phút. Tôm ướp riêng với phần hành, tỏi, nghệ còn lại và 1/4 tổng nước mắm; giữ 1/4 nước mắm và một nửa đường cho bước nêm cuối."
      },
      {
        "id": 57,
        "recipeId": 11,
        "stepNumber": 2,
        "instruction": "Làm nóng toàn bộ dầu ăn và dầu màu điều, xào thịt 5 phút tới săn; thêm toàn bộ nước lọc trong bảng, đun sôi, hạ nhỏ lửa và nấu 25 phút."
      },
      {
        "id": 58,
        "recipeId": 11,
        "stepNumber": 3,
        "instruction": "Cho tôm cùng nước ướp, phần nước mắm và đường đã giữ vào, nấu thêm 5–7 phút đến tôm chín và thịt mềm. Giữ nước nhân khoảng 200 ml cho mỗi phần ăn đang nấu, vị đậm hơn canh vì ăn cùng mì và rau."
      },
      {
        "id": 59,
        "recipeId": 11,
        "stepNumber": 4,
        "instruction": "Rau sống rửa sạch để ráo, giá chần chín, hành lá thái nhỏ. Trụng mì theo độ mềm của sợi thành phẩm rồi chia theo số phần ăn đang nấu."
      },
      {
        "id": 60,
        "recipeId": 11,
        "stepNumber": 5,
        "instruction": "Xếp rau, mì, thịt và tôm; chan khoảng 200 ml nước nhân mỗi tô. Rắc lạc, hành, thêm bánh tráng mè bẻ miếng; chanh và ớt dùng kèm. Không chan đầy như phở."
      },
      {
        "id": 61,
        "recipeId": 12,
        "stepNumber": 1,
        "instruction": "Cho gà, 9/10 tổng nước lọc, toàn bộ gừng, hành tím và 2/3 tổng muối vào nồi; giữ 1/10 nước cho nước chấm. Đun sôi nhẹ rồi luộc liu riu 25–35 phút tùy miếng; kiểm tra phần dày nhất chín hoàn toàn. Vớt gà để nguội bớt và xé thịt, giữ lại nước luộc."
      },
      {
        "id": 62,
        "recipeId": 12,
        "stepNumber": 2,
        "instruction": "Vo gạo để ráo. Phi một nửa tổng tỏi với toàn bộ dầu, cho gạo và nghệ vào đảo 2 phút. Chuyển vào nồi cơm, lấy nước luộc gà đã lọc để nấu theo tỉ lệ khởi điểm 1.2 ml nước dùng cho mỗi 1 g gạo khô trong bảng đã đổi. Nấu và ủ theo nồi, điều chỉnh nước theo loại gạo khi nấu thử; phần nước này lấy từ nồi gà, không phải lượng nước mới cộng thêm vào bảng."
      },
      {
        "id": 63,
        "recipeId": 12,
        "stepNumber": 3,
        "instruction": "Đu đủ và cà rốt thái sợi; trộn toàn bộ giấm với 2/5 tổng đường, ngâm rau 20 phút rồi để ráo. Hành tây thái mỏng, ngâm nước lạnh riêng 10 phút, để thật ráo. Dưa leo thái lát, rau răm thái vừa."
      },
      {
        "id": 64,
        "recipeId": 12,
        "stepNumber": 4,
        "instruction": "Hòa phần nước lọc đã giữ với 3/4 tổng nước mắm, phần đường còn lại, 2/3 tổng nước chanh, phần tỏi còn lại và toàn bộ ớt làm nước chấm."
      },
      {
        "id": 65,
        "recipeId": 12,
        "stepNumber": 5,
        "instruction": "Trộn gà xé với hành tây, rau răm, phần nước mắm, nước chanh và muối còn lại. Xới cơm, chia gà trộn, đồ chua và dưa leo theo số phần ăn đang nấu, dùng cùng nước chấm. Phần nước luộc còn dư không bắt buộc chia vào món cơm."
      },
      {
        "id": 66,
        "recipeId": 13,
        "stepNumber": 1,
        "instruction": "Chia toàn bộ nước lọc thành ba phần theo tỉ lệ 5:7:4, lần lượt để nguội pha bột, làm nóng pha bột và để pha nước chấm. Trộn toàn bộ bột gạo, bột năng, muối với phần nước nguội pha bột. Rót từ từ phần nước nóng pha bột vào, khuấy đều; nghỉ bột 45 phút. Khuấy lại ngay trước mỗi lượt múc để bột không lắng."
      },
      {
        "id": 67,
        "recipeId": 13,
        "stepNumber": 2,
        "instruction": "Hấp tôm riêng khoảng 5 phút đến chín, giã/tơi nhỏ. Phi toàn bộ hành tím bằng 1/4 tổng dầu, cho tôm vào đảo lửa nhỏ 5–7 phút với 1/4 tổng nước mắm cho tơi ráo, không cháy."
      },
      {
        "id": 68,
        "recipeId": 13,
        "stepNumber": 3,
        "instruction": "Hành lá thái nhỏ, cho vào bát chịu nhiệt. Đun nóng 5/8 tổng dầu rồi rót lên hành, đảo đều; giữ 1/8 tổng dầu còn lại để quét chén."
      },
      {
        "id": 69,
        "recipeId": 13,
        "stepNumber": 4,
        "instruction": "Pha nước chấm bằng phần nước dành nước chấm, phần nước mắm còn lại và toàn bộ đường, đun tan rồi để ấm, thêm ớt. Phiên bản này không pha chanh/giấm."
      },
      {
        "id": 70,
        "recipeId": 13,
        "stepNumber": 5,
        "instruction": "Làm nóng chén nhỏ trong xửng sôi khoảng 2 phút; quét rất mỏng dầu đã giữ, múc khoảng 25 ml bột mỗi chén để giữ cùng độ dày bánh. Hấp 6–8 phút/mẻ đến bột trong đục đồng đều, không còn lớp hồ lỏng ở tâm. Lau nước dưới nắp giữa các mẻ, lặp lại đến hết bột; không tăng lượng bột mỗi chén theo số người."
      },
      {
        "id": 71,
        "recipeId": 13,
        "stepNumber": 6,
        "instruction": "Để bánh se mặt 2 phút, thêm tôm chấy và dầu hành, ăn với nước mắm. Độ lõm và số chén phụ thuộc kích thước chén, không phải tiêu chí để bỏ qua kiểm tra bánh chín."
      },
      {
        "id": 72,
        "recipeId": 14,
        "stepNumber": 1,
        "instruction": "Gà chia miếng lớn dày tương đối đều, thấm khô, khía nhẹ phần đùi. Rang mắc khén lửa nhỏ 1–2 phút tới thơm rồi giã, tránh rang cháy gây đắng."
      },
      {
        "id": 73,
        "recipeId": 14,
        "stepNumber": 2,
        "instruction": "Giã toàn bộ sả, gừng, hành, tỏi với 3/5 tổng mắc khén, 2/3 tổng muối, 3/5 tổng ớt, toàn bộ nước mắm và dầu. Xoa đều lên gà, ướp kín trong ngăn mát 2 giờ."
      },
      {
        "id": 74,
        "recipeId": 14,
        "stepNumber": 3,
        "instruction": "Làm nóng lò 190°C. Đặt gà lên vỉ có khay hứng, nướng 25 phút rồi trở mặt; nướng tiếp 20–25 phút tùy miếng. Nếu mặt vàng quá nhanh thì che lỏng bằng giấy bạc."
      },
      {
        "id": 75,
        "recipeId": 14,
        "stepNumber": 4,
        "instruction": "Kiểm tra phần thịt dày nhất gần xương đã chín hoàn toàn; nếu chưa chín thì nướng tiếp và ghi lại thời gian theo thiết bị thực tế. Không dùng nước ướp thịt sống làm nước chấm."
      },
      {
        "id": 76,
        "recipeId": 14,
        "stepNumber": 5,
        "instruction": "Trộn phần mắc khén, muối và ớt còn lại với toàn bộ nước chanh làm chấm kiểu gia đình; để gà nghỉ 5 phút rồi chặt miếng. Đây không được mô tả là công thức chẩm chéo truyền thống đầy đủ."
      },
      {
        "id": 77,
        "recipeId": 15,
        "stepNumber": 1,
        "instruction": "Trộn toàn bộ bột gạo, bột năng, nghệ, nước cốt dừa với 8/11 tổng nước lọc và một nửa tổng muối, khuấy mịn; thêm hành lá thái nhỏ, nghỉ 30 phút. Giữ 3/11 nước còn lại cho nước chấm. Bột phải đủ loãng để láng mỏng; điều chỉnh nhỏ khi thử bánh đầu và cập nhật nếu thay đổi công thức."
      },
      {
        "id": 78,
        "recipeId": 15,
        "stepNumber": 2,
        "instruction": "Ba chỉ thái mỏng; hành tây thái múi mỏng. Ướp thịt và tôm với phần muối còn lại, 1/5 tổng nước mắm và 1/3 tổng tỏi băm trong 10 phút."
      },
      {
        "id": 79,
        "recipeId": 15,
        "stepNumber": 3,
        "instruction": "Dùng 1/8 tổng dầu xào thịt và tôm chín, chia nhân theo số bánh dự kiến từ lượng bột đã đổi khẩu phần. Rau sống rửa sạch, để ráo; giá rửa sạch để dùng làm nhân được nấu chín."
      },
      {
        "id": 80,
        "recipeId": 15,
        "stepNumber": 4,
        "instruction": "Pha phần nước lọc đã giữ với phần nước mắm và tỏi còn lại cùng toàn bộ đường, nước chanh và ớt. Khuấy tan đường."
      },
      {
        "id": 81,
        "recipeId": 15,
        "stepNumber": 5,
        "instruction": "Làm nóng chảo, chia phần dầu còn lại cho các lượt đổ bánh. Với chảo 24–26 cm, cho một phần thịt tôm, hành tây, múc khoảng 100–110 ml bột láng mỏng, thêm một phần giá, đậy 1–2 phút. Lượng bột mỗi bánh phụ thuộc chảo, không nhân theo số người."
      },
      {
        "id": 82,
        "recipeId": 15,
        "stepNumber": 6,
        "instruction": "Mở nắp, nấu thêm 2–3 phút đến vỏ khô giòn, giá chín, gập bánh. Lặp lại đến hết bột và nhân, khuấy bột trước mỗi lượt. Ăn ngay với rau và nước chấm để bánh không ỉu."
      },
      {
        "id": 83,
        "recipeId": 16,
        "stepNumber": 1,
        "instruction": "Dành 5/6 tổng nước lọc để luộc ba chỉ với toàn bộ muối; giữ 1/6 nước cho sốt tương. Luộc sôi nhỏ khoảng 20–25 phút tùy độ dày, kiểm tra chín tận giữa rồi vớt ra. Cho tôm vào nước luộc đang sôi, nấu khoảng 3–4 phút tới chín, vớt ra để ráo. Nước luộc này không dùng làm sốt tương."
      },
      {
        "id": 84,
        "recipeId": 16,
        "stepNumber": 2,
        "instruction": "Thịt nguội bớt thái mỏng; tôm bổ dọc nếu con lớn. Rau rửa sạch để ráo kỹ, dưa leo bỏ ruột mềm rồi cắt thanh; chia bún và nhân theo số lá bánh tráng thực tế, giữ mỗi cuốn kích thước tương tự."
      },
      {
        "id": 85,
        "recipeId": 16,
        "stepNumber": 3,
        "instruction": "Xay/dằm toàn bộ tương hột với phần nước lọc đã giữ. Phi toàn bộ tỏi với dầu, cho tương và đường vào nấu 5–7 phút; thêm một nửa tổng lạc giã, khuấy sánh vừa rồi tắt bếp."
      },
      {
        "id": 86,
        "recipeId": 16,
        "stepNumber": 4,
        "instruction": "Chuẩn bị bánh tráng theo lượng trong bảng đã đổi; mẻ gốc 4 phần ăn dùng khoảng 12 lá. Làm ẩm vừa theo hướng dẫn sản phẩm bằng nước sạch riêng. Xếp xà lách, rau, dưa leo, bún, thịt, tôm và cuốn chắc vừa tay đến hết nhân."
      },
      {
        "id": 87,
        "recipeId": 16,
        "stepNumber": 5,
        "instruction": "Chia sốt, rắc phần lạc còn lại. Dùng cuốn ngay sau khi làm; nếu chờ, giữ lạnh và che để bánh không khô, tránh để thịt tôm chín lâu ngoài nhiệt độ phòng."
      },
      {
        "id": 88,
        "recipeId": 17,
        "stepNumber": 1,
        "instruction": "Cá làm sạch nhớt và máu đọng, thấm ráo; khúc dày khoảng 2–3 cm. Băm hành tỏi, thái hành lá và ớt."
      },
      {
        "id": 89,
        "recipeId": 17,
        "stepNumber": 2,
        "instruction": "Ướp cá với 3/4 tổng nước mắm, 2/5 tổng đường, một nửa của từng loại hành tím và tỏi cùng một nửa tổng tiêu trong ngăn mát 25 phút."
      },
      {
        "id": 90,
        "recipeId": 17,
        "stepNumber": 3,
        "instruction": "Đun phần đường còn lại với toàn bộ dầu tới màu hổ phách; thêm phần hành tỏi còn lại, đảo nhanh rồi xếp cá nhẹ tay vào, trở một lần cho bám màu."
      },
      {
        "id": 91,
        "recipeId": 17,
        "stepNumber": 4,
        "instruction": "Rót toàn bộ nước dừa và phần nước mắm còn lại, đun sôi rồi hạ nhỏ lửa kho 25–30 phút, rưới nước kho lên mặt cá thay vì đảo. Hé nắp giai đoạn cuối cho nước sánh, tránh cạn cháy."
      },
      {
        "id": 92,
        "recipeId": 17,
        "stepNumber": 5,
        "instruction": "Kiểm tra cá chín tới giữa khúc, thêm toàn bộ hành lá, ớt và phần tiêu còn lại, đun thêm 1 phút. Nếu dùng nồi đất, phải là loại dùng được trên bếp và tăng nhiệt từ từ."
      },
      {
        "id": 93,
        "recipeId": 18,
        "stepNumber": 1,
        "instruction": "Sườn dày khoảng 1–1,5 cm, thấm khô và dần nhẹ. Băm sả, hành tím, tỏi. Ướp sườn với toàn bộ sả, hành tím, một nửa tổng tỏi, 7/16 tổng nước mắm, 1/3 tổng đường, toàn bộ mật ong, tiêu và 3/8 tổng dầu; giữ ngăn mát ít nhất 2 giờ."
      },
      {
        "id": 94,
        "recipeId": 18,
        "stepNumber": 2,
        "instruction": "Chia toàn bộ nước lọc thành hai phần theo tỉ lệ 10:3, lần lượt để nấu cơm và pha nước chấm. Vo gạo tấm để ráo, nấu với phần nước nấu cơm bằng nồi cơm rồi ủ 10 phút. Tỉ lệ khởi điểm tương đương 1.25 ml nước cho mỗi 1 g gạo khô, có thể cần điều chỉnh theo giống gạo/nồi khi nấu thử."
      },
      {
        "id": 95,
        "recipeId": 18,
        "stepNumber": 3,
        "instruction": "Cà rốt và đu đủ thái sợi, trộn toàn bộ giấm và 2/9 tổng đường, để 20 phút rồi để ráo. Dưa leo và cà chua thái lát. Đun phần dầu còn lại và rót vào hành lá thái nhỏ trong bát chịu nhiệt làm dầu hành."
      },
      {
        "id": 96,
        "recipeId": 18,
        "stepNumber": 4,
        "instruction": "Pha phần nước dành nước chấm với phần nước mắm, đường và tỏi còn lại cùng toàn bộ nước chanh và ớt; khuấy tan."
      },
      {
        "id": 97,
        "recipeId": 18,
        "stepNumber": 5,
        "instruction": "Làm nóng lò 210°C, nướng sườn 18–25 phút, trở giữa chừng, kiểm tra chín tận phần gần xương. Không quét nước ướp sống lên sườn ở cuối quá trình nướng."
      },
      {
        "id": 98,
        "recipeId": 18,
        "stepNumber": 6,
        "instruction": "Chia cơm, sườn, rau và đồ chua theo số phần ăn đang nấu; rưới dầu hành lên cơm, nước mắm để riêng. Không ghi thành “cơm tấm sườn bì chả” vì bản này không có bì và chả."
      },
      {
        "id": 99,
        "recipeId": 19,
        "stepNumber": 1,
        "instruction": "Đậu phụ để ráo, thấm khô, cắt khối 2–3 cm. Nấm bỏ chân bẩn, rửa nhanh, để ráo; nấm rơm bổ đôi, nấm đùi gà thái, nấm bào ngư xé vừa."
      },
      {
        "id": 100,
        "recipeId": 19,
        "stepNumber": 2,
        "instruction": "Dùng 3/4 tổng dầu áp chảo đậu 6–8 phút mỗi mẻ, trở nhẹ đến vàng các mặt rồi lấy ra. Nếu chia mẻ, chia phần dầu này cho các mẻ."
      },
      {
        "id": 101,
        "recipeId": 19,
        "stepNumber": 3,
        "instruction": "Thêm phần dầu còn lại, phi toàn bộ tỏi băm, cho nấm vào đảo 3 phút. Thêm toàn bộ nước tương, đường, muối và nước lọc trong bảng, đun sôi."
      },
      {
        "id": 102,
        "recipeId": 19,
        "stepNumber": 4,
        "instruction": "Cho đậu vào, kho nhỏ lửa 10–12 phút, lắc nồi nhẹ cho thấm. Không dùng dầu hào thường hay hạt nêm thịt để nêm món này."
      },
      {
        "id": 103,
        "recipeId": 19,
        "stepNumber": 5,
        "instruction": "Khi nấm chín, đậu nóng và sốt còn sánh nhẹ, thêm hành lá và tiêu, nấu thêm 1 phút. Món chay này có hành tỏi, không phù hợp chế độ kiêng ngũ vị tân nếu chưa điều chỉnh."
      },
      {
        "id": 104,
        "recipeId": 20,
        "stepNumber": 1,
        "instruction": "Ngâm bột báng bằng nước sạch riêng 20 phút rồi xả ráo. Chuối chín vừa, cắt lát dày 1,5–2 cm, trộn với 2/7 tổng đường trong 10 phút. Lá dứa rửa, buộc gọn."
      },
      {
        "id": 105,
        "recipeId": 20,
        "stepNumber": 2,
        "instruction": "Đun toàn bộ nước lọc trong bảng với lá dứa, cho bột báng vào nấu 10–15 phút, khuấy nhẹ đến gần trong; thời gian có thể khác theo sản phẩm."
      },
      {
        "id": 106,
        "recipeId": 20,
        "stepNumber": 3,
        "instruction": "Cho chuối cùng nước đường tiết ra vào nồi, nấu lửa nhỏ 5–7 phút tới chuối mềm nhưng không nát."
      },
      {
        "id": 107,
        "recipeId": 20,
        "stepNumber": 4,
        "instruction": "Thêm toàn bộ nước cốt dừa, phần đường còn lại và toàn bộ muối, đun sôi nhẹ 3–5 phút; không sôi trào mạnh. Kiểm tra bột báng trong, không còn lõi cứng, vớt lá dứa."
      },
      {
        "id": 108,
        "recipeId": 20,
        "stepNumber": 5,
        "instruction": "Múc chè theo số phần ăn đang nấu, rắc toàn bộ lạc và mè chia đều. Độ sánh tăng khi nguội; món này không cần bột năng bổ sung."
      },
      {
        "id": 109,
        "recipeId": 21,
        "stepNumber": 1,
        "instruction": "Nhặt rau, rửa sạch, cắt đoạn 5–6 cm, tách phần cọng lớn và lá. Tỏi đập dập, băm thô."
      },
      {
        "id": 110,
        "recipeId": 21,
        "stepNumber": 2,
        "instruction": "Làm nóng chảo với dầu; cho một nửa tỏi vào phi thơm 20–30 giây, không để vàng sẫm."
      },
      {
        "id": 111,
        "recipeId": 21,
        "stepNumber": 3,
        "instruction": "Cho cọng vào đảo 1–2 phút, thêm lá, nước, muối, đường và nước tương; xào lửa lớn 3–4 phút, đảo để rau chín đều."
      },
      {
        "id": 112,
        "recipeId": 21,
        "stepNumber": 4,
        "instruction": "Thêm phần tỏi còn lại, đảo 1 phút tới rau chín, cọng còn giòn; dọn ngay. Không chần rồi ghi thiếu công đoạn/định lượng gia vị trong bản này."
      },
      {
        "id": 113,
        "recipeId": 22,
        "stepNumber": 1,
        "instruction": "Hành lá rửa sạch thái nhỏ. Đập trứng vào bát, loại vỏ sót và đánh tan. Nếu lượng trứng trong bảng là phần lẻ quả, lấy lượng trứng đã đánh tương ứng trước khi trộn toàn bộ nước mắm, tiêu và nước theo bảng."
      },
      {
        "id": 114,
        "recipeId": 22,
        "stepNumber": 2,
        "instruction": "Trộn hành lá vào trứng. Làm nóng chảo chống dính ở lửa vừa; chảo cỡ 22–24 cm phù hợp mẻ gốc, chia lượng dầu trong bảng cho các lượt chiên nếu tăng mẻ."
      },
      {
        "id": 115,
        "recipeId": 22,
        "stepNumber": 3,
        "instruction": "Đổ một lượng trứng đủ tạo lớp mỏng đều, nghiêng chảo; giữ phần hỗn hợp còn lại cho các lượt tiếp theo. Hạ lửa vừa nhỏ, đậy khoảng 3–4 phút tới mặt trên gần đông."
      },
      {
        "id": 116,
        "recipeId": 22,
        "stepNumber": 4,
        "instruction": "Lật bằng đĩa hoặc chia miếng để trở, chiên thêm 1–2 phút đến trứng đông hoàn toàn, không còn phần trứng lỏng. Tắt bếp và cắt miếng."
      },
      {
        "id": 117,
        "recipeId": 23,
        "stepNumber": 1,
        "instruction": "Bí gọt vỏ, bỏ hạt, cân theo lượng trong bảng đã đổi khẩu phần rồi cắt miếng 2 cm. Băm hành tím, thái hành lá. Trộn thịt với một nửa tổng nước mắm và toàn bộ tiêu."
      },
      {
        "id": 118,
        "recipeId": 23,
        "stepNumber": 2,
        "instruction": "Phi hành tím với dầu, cho thịt vào đảo tơi 2–3 phút tới đổi màu, không để vón thành khối sống bên trong."
      },
      {
        "id": 119,
        "recipeId": 23,
        "stepNumber": 3,
        "instruction": "Rót nước, đun sôi và hớt bọt; cho bí vào, nấu nhỏ lửa 12–15 phút đến bí mềm khi xiên nhưng chưa nát."
      },
      {
        "id": 120,
        "recipeId": 23,
        "stepNumber": 4,
        "instruction": "Thêm phần nước mắm còn lại và toàn bộ muối, đun 1 phút; kiểm tra thịt chín rồi thêm hành lá, tắt bếp."
      },
      {
        "id": 121,
        "recipeId": 24,
        "stepNumber": 1,
        "instruction": "Đậu thấm khô, cắt miếng 2 cm; cà chua băm nhỏ hoặc thái hạt lựu, hành tím băm, hành lá thái."
      },
      {
        "id": 122,
        "recipeId": 24,
        "stepNumber": 2,
        "instruction": "Dùng 5/7 tổng dầu áp chảo đậu 6–8 phút mỗi mẻ đến vàng nhẹ, trở đều rồi lấy ra. Chia phần dầu này cho các mẻ nếu cần."
      },
      {
        "id": 123,
        "recipeId": 24,
        "stepNumber": 3,
        "instruction": "Thêm phần dầu còn lại, phi toàn bộ hành tím, cho cà chua và muối vào xào 4 phút. Thêm toàn bộ nước lọc, đường, nước mắm chay trong bảng, nấu 3 phút cho cà mềm thành sốt."
      },
      {
        "id": 124,
        "recipeId": 24,
        "stepNumber": 4,
        "instruction": "Cho đậu vào, rim 5 phút, trở nhẹ cho sốt bám đều. Thêm hành lá, tắt bếp khi đậu nóng thấm sốt; không thêm nước mắm cá vì món đang gắn danh mục chay."
      },
      {
        "id": 125,
        "recipeId": 25,
        "stepNumber": 1,
        "instruction": "Sườn chặt miếng vừa, chần nước sôi riêng 3 phút rồi rửa cặn. Hành tây và ớt chuông cắt vuông, tỏi băm."
      },
      {
        "id": 126,
        "recipeId": 25,
        "stepNumber": 2,
        "instruction": "Chia toàn bộ nước lọc trong bảng thành ba phần theo tỉ lệ 15:4:1, lần lượt để nấu sườn, pha sốt và hòa bột năng. Cho sườn cùng phần nước dành nấu sườn vào nồi vừa lượng thịt, đậy nắp nấu nhỏ lửa 15–20 phút tới gần mềm; giữ nước nấu còn lại."
      },
      {
        "id": 127,
        "recipeId": 25,
        "stepNumber": 3,
        "instruction": "Hòa toàn bộ nước mắm, giấm, đường, tiêu với phần nước dành pha sốt. Hòa riêng toàn bộ bột năng với phần nước dành hòa bột."
      },
      {
        "id": 128,
        "recipeId": 25,
        "stepNumber": 4,
        "instruction": "Làm nóng dầu trong chảo, áp chảo sườn ráo mặt khoảng 5 phút; thêm tỏi vào cuối. Cho hỗn hợp sốt và phần nước nấu sườn vào, đun nhỏ lửa 5 phút."
      },
      {
        "id": 129,
        "recipeId": 25,
        "stepNumber": 5,
        "instruction": "Thêm hành tây, ớt chuông, đảo 2–3 phút. Khuấy lại bột năng và rót từ từ vào chảo, đun 1–2 phút đến sốt bóng sánh, sườn chín mềm. Không đổ bột khô trực tiếp gây vón."
      },
      {
        "id": 130,
        "recipeId": 26,
        "stepNumber": 1,
        "instruction": "Vo đậu, ngâm nước sạch riêng 2 giờ trong ngăn mát, xả và để ráo. Lá dứa rửa sạch, buộc gọn."
      },
      {
        "id": 131,
        "recipeId": 26,
        "stepNumber": 2,
        "instruction": "Cho toàn bộ đậu, lá dứa và 11/12 tổng nước lọc vào nồi; giữ 1/12 nước để hòa bột năng. Đun sôi, hớt bọt và nấu nhỏ lửa 20–25 phút tới đậu mềm. Khuấy sát đáy nhẹ tay để không khét."
      },
      {
        "id": 132,
        "recipeId": 26,
        "stepNumber": 3,
        "instruction": "Vớt lá dứa, thêm đường và muối, khuấy tan rồi nấu 3 phút. Cho đường sau khi đậu mềm để tránh kéo dài thời gian nấu đậu."
      },
      {
        "id": 133,
        "recipeId": 26,
        "stepNumber": 4,
        "instruction": "Hòa toàn bộ bột năng với phần nước đã giữ, khuấy lại rồi rót từ từ vào nồi chè đang sôi nhẹ. Nấu 2 phút đến bột chín, chè sánh nhẹ."
      },
      {
        "id": 134,
        "recipeId": 26,
        "stepNumber": 5,
        "instruction": "Thêm toàn bộ nước cốt dừa, khuấy đều, đun sôi lăn tăn 2 phút rồi tắt bếp. Chia theo số phần ăn đang nấu; không gọi là chè thuần đậu xanh nếu bỏ qua thành phần dừa trong mô tả."
      }
    ].map((row) => ({ ...row, createdAt: now, updatedAt: now }));

    await queryInterface.bulkInsert("RecipeIngredients", recipeIngredientsData);
    await queryInterface.bulkInsert("CookingSteps", cookingStepsData);

    try {
      await queryInterface.sequelize.query(
        'SELECT setval(pg_get_serial_sequence(\'"RecipeIngredients"\', \'id\'), coalesce(max(id), 1)) FROM "RecipeIngredients";'
      );
      await queryInterface.sequelize.query(
        'SELECT setval(pg_get_serial_sequence(\'"CookingSteps"\', \'id\'), coalesce(max(id), 1)) FROM "CookingSteps";'
      );
    } catch (error) {
      console.error("Error setting sequence for Recipe Details:", error);
    }
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete("CookingSteps", null, {});
    await queryInterface.bulkDelete("RecipeIngredients", null, {});
  },
};
