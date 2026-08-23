import { Response } from "express";
import { prisma } from "../config/prisma";
import { AuthRequest } from "../middleware/auth.middleware";

const LESSON_ORDERS = Array.from({ length: 10 }, (_, index) => index + 1);

export async function getMyLessons(req: AuthRequest, res: Response) {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const rows = await prisma.lessonProgress.findMany({
      where: {
        userId: req.user.userId,
      },
      select: {
        progress: true,
        completed: true,
        lesson: {
          select: {
            order: true,
          },
        },
      },
    });

    const progressMap = new Map(
      rows.map((row) => [
        row.lesson.order,
        Math.max(0, Math.min(100, row.progress ?? 0)),
      ])
    );

    return res.json({
      success: true,
      lessons: LESSON_ORDERS.map((order) => ({
        id: order,
        progress: progressMap.get(order) ?? 0,
        completed: (progressMap.get(order) ?? 0) >= 100,
      })),
    });
  } catch (error) {
    console.error("Get lesson progress error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load lesson progress.",
    });
  }
}

export async function updateLessonProgress(
  req: AuthRequest,
  res: Response
) {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    // Frontend sends 1..10. Database Lesson.id is a cuid string,
    // so we use Lesson.order to find the real database row.
    const lessonOrder = Number(req.params.lessonId);
    const requestedProgress = Number(req.body.progress);

    if (
      !Number.isInteger(lessonOrder) ||
      !LESSON_ORDERS.includes(lessonOrder)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid lesson.",
      });
    }

    if (!Number.isFinite(requestedProgress)) {
      return res.status(400).json({
        success: false,
        message: "Invalid lesson progress.",
      });
    }

    const progress = Math.max(
      0,
      Math.min(100, Math.round(requestedProgress))
    );

    const lesson = await prisma.lesson.findFirst({
      where: {
        order: lessonOrder,
      },
      select: {
        id: true,
        order: true,
        title: true,
      },
    });

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: `Lesson ${lessonOrder} has not been seeded in the database yet.`,
      });
    }

    const existing = await prisma.lessonProgress.findUnique({
      where: {
        userId_lessonId: {
          userId: req.user.userId,
          lessonId: lesson.id,
        },
      },
      select: {
        id: true,
        progress: true,
        completed: true,
      },
    });

    const previousProgress = existing?.progress ?? 0;
    const becameComplete =
      progress >= 100 && previousProgress < 100;

    const rewardXp = becameComplete ? 25 : 0;

    if (existing) {
      await prisma.lessonProgress.update({
        where: {
          id: existing.id,
        },
        data: {
          progress,
          completed: progress >= 100,
          completedAt:
            progress >= 100
              ? existing.completed
                ? undefined
                : new Date()
              : null,
        },
      });
    } else {
      await prisma.lessonProgress.create({
        data: {
          userId: req.user.userId,
          lessonId: lesson.id,
          progress,
          completed: progress >= 100,
          completedAt:
            progress >= 100 ? new Date() : null,
        },
      });
    }

    let user = await prisma.user.findUnique({
      where: {
        id: req.user.userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        country: true,
        role: true,
        level: true,
        xp: true,
        streak: true,
        bestWpm: true,
        averageWpm: true,
        averageAccuracy: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (rewardXp > 0) {
      const newXp = user.xp + rewardXp;
      const newLevel = Math.floor(newXp / 1000) + 1;

      user = await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          xp: newXp,
          level: newLevel,
        },
        select: {
          id: true,
          name: true,
          email: true,
          country: true,
          role: true,
          level: true,
          xp: true,
          streak: true,
          bestWpm: true,
          averageWpm: true,
          averageAccuracy: true,
          createdAt: true,
        },
      });
    }

    return res.json({
      success: true,
      lesson: {
        id: lessonOrder,
        title: lesson.title,
      },
      progress,
      completed: progress >= 100,
      rewardXp,
      user,
    });
  } catch (error) {
    console.error("Update lesson progress error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to save lesson progress.",
    });
  }
}