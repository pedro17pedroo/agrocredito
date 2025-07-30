import { Router } from "express";
import { UserController } from "../controllers/UserController";
import { authenticateToken } from "../middleware/auth";

const router = Router();

// All user routes require authentication
router.use(authenticateToken);

// User routes
router.get("/", UserController.getAll);
router.get("/:id", UserController.getById);
router.post("/", UserController.create);
router.patch("/:id", UserController.update);
router.patch("/:id/profile", UserController.assignProfile);

export default router;