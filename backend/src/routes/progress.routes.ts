import { Router } from "express";
import { getProgress } from "../controllers/progress.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.get("/", requireAuth, getProgress);

export default router;