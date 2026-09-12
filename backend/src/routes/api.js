import express from "express";
import imageRoutes from "./image";
import authRoutes from "./auth";
import userRoutes from "./user";
import adminRoutes from "./admin";
import recipeRoutes from "./recipe";

const router = express.Router();

/**
 *
 * @param {*} app: express app
 */
const initApiRoutes = (app) => {
  // Mount các routes con theo đúng đặc tả API v1
  router.use("/images", imageRoutes);
  router.use("/auth", authRoutes);
  router.use("/users", userRoutes);
  router.use("/admin", adminRoutes);
  router.use("/recipe", recipeRoutes);

  return app.use("/api/v1/", router);
};

export default initApiRoutes;
