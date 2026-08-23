import { Router } from "express";
import { getProfileDashboard } from "../controllers/profile.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.get("/", requireAuth, getProfileDashboard);

export default router;