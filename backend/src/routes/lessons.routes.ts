import { Router } from "express";
import {
  getMyLessons,
  updateLessonProgress,
} from "../controllers/lessons.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.get("/me", requireAuth, getMyLessons);
router.put("/:lessonId/progress", requireAuth, updateLessonProgress);

export default router;