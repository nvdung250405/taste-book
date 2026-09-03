import express from "express";
import recipeController from "../controllers/recipeController";

const router = express.Router();

router.get("/read", recipeController.handleRead);
router.post("/create", recipeController.handleCreate);
router.put("/update", recipeController.handleUpdate);
router.delete("/delete", recipeController.handleDelete);

export default router;
