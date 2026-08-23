import { Router } from "express";
import {
  getMyProfile,
  updateMyProfile,
} from "../controllers/user.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.get("/me", requireAuth, getMyProfile);
router.put("/me", requireAuth, updateMyProfile);

export default router;