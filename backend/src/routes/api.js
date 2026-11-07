import express from "express";
import imageRoutes from "./image";
import authRoutes from "./auth";
import userRoutes from "./user";
import adminRoutes from "./admin";
import homeRoutes from "./home";
import recipeRoutes from "./recipe";
import categoryRoutes from "./category";
import ingredientRoutes from "./ingredient";
import ingredientCategoryRoutes from "./ingredientCategory";
import unitRoutes from "./unit";
import favoriteRoutes from "./favorite";
import recipeListRoutes from "./recipeList";
import shoppingListRoutes from "./shoppingList";

const router = express.Router();

/**
 *
 * @param {*} app: express app
 */
const initApiRoutes = (app) => {
  // Mount các routes con theo đúng đặc tả API v1
  router.use("/home", homeRoutes);
  router.use("/images", imageRoutes);
  router.use("/auth", authRoutes);
  router.use("/users", userRoutes);
  router.use("/admin", adminRoutes);
  router.use("/categories", categoryRoutes);
  router.use("/ingredients", ingredientRoutes);
  router.use("/ingredient-categories", ingredientCategoryRoutes);
  router.use("/units", unitRoutes);
  router.use("/recipes", recipeRoutes);
  router.use("/favorites", favoriteRoutes);
  router.use("/recipe-lists", recipeListRoutes);
  router.use("/shopping-lists", shoppingListRoutes);

  return app.use("/api/v1/", router);
};

export default initApiRoutes;
