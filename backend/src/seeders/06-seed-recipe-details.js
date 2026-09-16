"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const now = new Date();
    const recipeIngredientsData = [
      {
            "id": 1,
            "recipeId": 1,
            "ingredientId": 7,
            "customIngredientName": null,
            "quantity": 500.0,
            "unitId": 1,
            "customUnit": null,
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 2,
            "recipeId": 1,
            "ingredientId": 20,
            "customIngredientName": null,
            "quantity": 0.5,
            "unitId": 8,
            "customUnit": null,
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 3,
            "recipeId": 1,
            "ingredientId": 19,
            "customIngredientName": null,
            "quantity": 2.0,
            "unitId": 8,
            "customUnit": null,
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 4,
            "recipeId": 1,
            "ingredientId": 21,
            "customIngredientName": null,
            "quantity": 100.0,
            "unitId": 1,
            "customUnit": null,
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 5,
            "recipeId": 1,
            "ingredientId": 22,
            "customIngredientName": null,
            "quantity": 1.0,
            "unitId": 11,
            "customUnit": null,
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 6,
            "recipeId": 1,
            "ingredientId": 18,
            "customIngredientName": null,
            "quantity": 100.0,
            "unitId": 1,
            "customUnit": null,
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 7,
            "recipeId": 1,
            "ingredientId": 42,
            "customIngredientName": null,
            "quantity": 50.0,
            "unitId": 1,
            "customUnit": null,
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 8,
            "recipeId": 1,
            "ingredientId": 34,
            "customIngredientName": null,
            "quantity": 2.0,
            "unitId": 6,
            "customUnit": null,
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 9,
            "recipeId": 1,
            "ingredientId": 37,
            "customIngredientName": null,
            "quantity": 2.0,
            "unitId": 6,
            "customUnit": null,
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 10,
            "recipeId": 1,
            "ingredientId": 16,
            "customIngredientName": null,
            "quantity": 3.0,
            "unitId": 12,
            "customUnit": null,
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 11,
            "recipeId": 2,
            "ingredientId": 1,
            "customIngredientName": null,
            "quantity": 500.0,
            "unitId": 1,
            "customUnit": null,
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 12,
            "recipeId": 2,
            "ingredientId": 11,
            "customIngredientName": null,
            "quantity": 15.0,
            "unitId": 8,
            "customUnit": null,
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 13,
            "recipeId": 2,
            "ingredientId": 43,
            "customIngredientName": null,
            "quantity": 2.0,
            "unitId": 7,
            "customUnit": null,
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 14,
            "recipeId": 2,
            "ingredientId": 34,
            "customIngredientName": null,
            "quantity": 3.0,
            "unitId": 6,
            "customUnit": null,
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 15,
            "recipeId": 2,
            "ingredientId": 37,
            "customIngredientName": null,
            "quantity": 2.0,
            "unitId": 6,
            "customUnit": null,
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 16,
            "recipeId": 3,
            "ingredientId": 4,
            "customIngredientName": null,
            "quantity": 1.0,
            "unitId": 2,
            "customUnit": null,
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 17,
            "recipeId": 3,
            "ingredientId": 3,
            "customIngredientName": null,
            "quantity": 400.0,
            "unitId": 1,
            "customUnit": null,
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 18,
            "recipeId": 3,
            "ingredientId": 45,
            "customIngredientName": null,
            "quantity": 500.0,
            "unitId": 1,
            "customUnit": null,
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 19,
            "recipeId": 3,
            "ingredientId": 44,
            "customIngredientName": null,
            "quantity": 10.0,
            "unitId": 1,
            "customUnit": null,
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 20,
            "recipeId": 4,
            "ingredientId": 5,
            "customIngredientName": null,
            "quantity": 500.0,
            "unitId": 1,
            "customUnit": null,
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 21,
            "recipeId": 4,
            "ingredientId": 31,
            "customIngredientName": null,
            "quantity": 4.0,
            "unitId": 11,
            "customUnit": null,
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 22,
            "recipeId": 4,
            "ingredientId": 32,
            "customIngredientName": null,
            "quantity": 2.0,
            "unitId": 8,
            "customUnit": null,
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 23,
            "recipeId": 4,
            "ingredientId": 28,
            "customIngredientName": null,
            "quantity": 4.0,
            "unitId": 10,
            "customUnit": null,
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 24,
            "recipeId": 4,
            "ingredientId": 34,
            "customIngredientName": null,
            "quantity": 2.0,
            "unitId": 6,
            "customUnit": null,
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 25,
            "recipeId": 4,
            "ingredientId": 37,
            "customIngredientName": null,
            "quantity": 1.0,
            "unitId": 6,
            "customUnit": null,
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 26,
            "recipeId": 5,
            "ingredientId": 2,
            "customIngredientName": null,
            "quantity": 300.0,
            "unitId": 1,
            "customUnit": null,
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 27,
            "recipeId": 5,
            "ingredientId": 25,
            "customIngredientName": null,
            "quantity": 1.0,
            "unitId": 9,
            "customUnit": null,
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 28,
            "recipeId": 5,
            "ingredientId": 19,
            "customIngredientName": null,
            "quantity": 1.0,
            "unitId": 8,
            "customUnit": null,
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 29,
            "recipeId": 5,
            "ingredientId": 28,
            "customIngredientName": null,
            "quantity": 3.0,
            "unitId": 10,
            "customUnit": null,
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 30,
            "recipeId": 5,
            "ingredientId": 40,
            "customIngredientName": null,
            "quantity": 1.0,
            "unitId": 6,
            "customUnit": null,
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 31,
            "recipeId": 5,
            "ingredientId": 38,
            "customIngredientName": null,
            "quantity": 1.0,
            "unitId": 5,
            "customUnit": null,
            "createdAt": now,
            "updatedAt": now
      }
];
    const cookingStepsData = [
      {
            "id": 1,
            "recipeId": 1,
            "stepNumber": 1,
            "instruction": "Cá lóc làm sạch màng đen, cắt khúc dày 2.5cm, ướp với chút hạt nêm, tiêu và nước mắm 15 phút.",
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 2,
            "recipeId": 1,
            "stepNumber": 2,
            "instruction": "Dứa gọt vỏ bỏ mắt cắt lát tam giác; cà chua bổ múi cau; đậu bắp và bạc hà tước vỏ cắt xéo; rau ngổ rửa sạch cắt nhỏ.",
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 3,
            "recipeId": 1,
            "stepNumber": 3,
            "instruction": "Dầm me trong 1 bát nước ấm lấy nước cốt. Phi thơm tỏi băm trong nồi rồi vớt ra đĩa riêng.",
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 4,
            "recipeId": 1,
            "stepNumber": 4,
            "instruction": "Cho cà chua và dứa vào nồi xào sơ, đổ 1.2 lít nước vào đun sôi bùng, trút nước cốt me vào khuấy đều.",
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 5,
            "recipeId": 1,
            "stepNumber": 5,
            "instruction": "Nước sôi thả cá lóc vào nấu chín trong 8 phút, hớt bọt thường xuyên cho nước trong.",
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 6,
            "recipeId": 1,
            "stepNumber": 6,
            "instruction": "Thêm đậu bắp, bạc hà, giá đỗ vào nấu sôi lại trong 2 phút. Nêm 2 muỗng nước mắm, 2 muỗng đường cho vừa vị chua ngọt.",
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 7,
            "recipeId": 1,
            "stepNumber": 7,
            "instruction": "Múc canh ra tô, rắc rau ngổ, ớt cắt lát và tỏi phi thơm lên trên, dùng nóng.",
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 8,
            "recipeId": 2,
            "stepNumber": 1,
            "instruction": "Thịt ba chỉ rửa sạch, chần qua nước sôi 2 phút rồi cắt miếng vuông 3x3 cm.",
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 9,
            "recipeId": 2,
            "stepNumber": 2,
            "instruction": "Luộc chín trứng cút, bóc sạch vỏ để ráo.",
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 10,
            "recipeId": 2,
            "stepNumber": 3,
            "instruction": "Ướp thịt với hành tím băm, tỏi băm, nước mắm, đường, tiêu trong ít nhất 30 phút.",
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 11,
            "recipeId": 2,
            "stepNumber": 4,
            "instruction": "Đun nóng ít dầu và 1 muỗng đường làm nước màu cánh gián, cho thịt vào đảo săn đều.",
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 12,
            "recipeId": 2,
            "stepNumber": 5,
            "instruction": "Đổ nước dừa tươi ngập mặt thịt, đun sôi rồi hạ nhỏ lửa đun liu riu trong 30 phút.",
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 13,
            "recipeId": 2,
            "stepNumber": 6,
            "instruction": "Cho trứng cút vào kho cùng thêm 15-20 phút đến khi thịt mềm rục, nước kho sánh vàng óng.",
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 14,
            "recipeId": 3,
            "stepNumber": 1,
            "instruction": "Xương bò ngâm nước muối 1 tiếng, chần nước sôi cùng gừng rồi rửa sạch bọt bẩn.",
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 15,
            "recipeId": 3,
            "stepNumber": 2,
            "instruction": "Nướng thơm hành tây, gừng, hoa hồi và quế trên lửa, cạo sạch muội đen và rửa sạch.",
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 16,
            "recipeId": 3,
            "stepNumber": 3,
            "instruction": "Ninh xương bò và nạm bò cùng 3 lít nước và túi gia vị nướng, hớt bọt liên tục.",
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 17,
            "recipeId": 3,
            "stepNumber": 4,
            "instruction": "Vớt nạm bò ra ngâm nước lạnh sau 45 phút rồi thái mỏng. Tiếp tục ninh xương thêm 45 phút.",
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 18,
            "recipeId": 3,
            "stepNumber": 5,
            "instruction": "Nêm nước dùng với nước mắm ngon và muối vừa miệng thanh ngọt.",
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 19,
            "recipeId": 3,
            "stepNumber": 6,
            "instruction": "Chần bánh phở, xếp nạm bò, rắc hành ngò thái nhỏ và chan nước dùng sôi sùng sục vào thưởng thức.",
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 20,
            "recipeId": 4,
            "stepNumber": 1,
            "instruction": "Thịt gà rửa sạch với nước muối loãng, chặt miếng vừa ăn, để ráo nước.",
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 21,
            "recipeId": 4,
            "stepNumber": 2,
            "instruction": "Sả cây, ớt hiểm, tỏi băm nhuyễn; ướp gà với một nửa phần sả tỏi ớt, nước mắm, đường trong 20 phút.",
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 22,
            "recipeId": 4,
            "stepNumber": 3,
            "instruction": "Phi thơm phần sả tỏi ớt còn lại với dầu ăn, trút gà vào đảo săn trên lửa lớn.",
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 23,
            "recipeId": 4,
            "stepNumber": 4,
            "instruction": "Hạ nhỏ lửa đun liu riu đến khi thịt gà chín vàng thơm, nước sốt cạn sệt bám đều quanh thịt thì tắt bếp.",
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 24,
            "recipeId": 5,
            "stepNumber": 1,
            "instruction": "Thịt bò thấm khô, cắt khối vuông quân cờ cỡ 2x2 cm. Ướp với dầu hào, tỏi băm, tiêu đen trong 15 phút.",
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 25,
            "recipeId": 5,
            "stepNumber": 2,
            "instruction": "Hành tây bóc vỏ, cà chua rửa sạch cắt miếng vuông cùng cỡ với thịt bò.",
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 26,
            "recipeId": 5,
            "stepNumber": 3,
            "instruction": "Đặt chảo lên bếp lửa lớn cùng chút dầu ăn, trút thịt bò vào lắc chảo nhanh tay trong 2-3 phút cho xém cạnh.",
            "createdAt": now,
            "updatedAt": now
      },
      {
            "id": 27,
            "recipeId": 5,
            "stepNumber": 4,
            "instruction": "Cho tiếp hành tây, cà chua vào đảo nhanh tay 1 phút rồi tắt bếp, rắc tiêu đen lên đĩa và thưởng thức.",
            "createdAt": now,
            "updatedAt": now
      }
];

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

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("CookingSteps", null, {});
    await queryInterface.bulkDelete("RecipeIngredients", null, {});
  },
};
