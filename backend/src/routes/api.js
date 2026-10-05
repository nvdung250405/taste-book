import express from "express";
import imageRoutes from "./image";
import authRoutes from "./auth";
import userRoutes from "./user";
import adminRoutes from "./admin";
import homeRoutes from "./home";
import recipeRoutes from "./recipe";
import categoryRoutes from "./category";

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
  router.use("/recipes", recipeRoutes);

  return app.use("/api/v1/", router);
};

export default initApiRoutes;
