import { Router } from "express";
import { saveTypingTest } from "../controllers/test.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.post("/", requireAuth, saveTypingTest);

export default router;