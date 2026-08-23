import { Router } from "express";
import { completeDailyChallenge } from "../controllers/daily-challenge.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.post("/complete", requireAuth, completeDailyChallenge);

export default router;