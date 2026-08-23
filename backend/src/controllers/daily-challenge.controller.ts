import { Response } from "express";
import { prisma } from "../config/prisma";
import { AuthRequest } from "../middleware/auth.middleware";

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

export async function completeDailyChallenge(
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

    const userId = req.user.userId;

    const {
      durationSeconds,
      wpm,
      accuracy,
      correctCharacters,
      wrongCharacters,
      errors,
    } = req.body;

    if (
      typeof durationSeconds !== "number" ||
      typeof wpm !== "number" ||
      typeof accuracy !== "number" ||
      typeof correctCharacters !== "number" ||
      typeof wrongCharacters !== "number" ||
      typeof errors !== "number"
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid challenge result.",
      });
    }

    const today = startOfToday();

    const existing = await prisma.typingTest.findFirst({
      where: {
        userId,
        testType: "daily-challenge",
        createdAt: {
          gte: today,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Today's challenge has already been completed.",
        test: existing,
      });
    }

    const challengeCompleted = wpm >= 70 && accuracy >= 90;
    const rewardXp = challengeCompleted ? 50 : 0;

    const result = await prisma.$transaction(async (tx) => {
      const test = await tx.typingTest.create({
        data: {
          userId,
          testType: "daily-challenge",
          durationSeconds,
          wpm,
          accuracy,
          correctCharacters,
          wrongCharacters,
          errors,
          practiceSeconds: durationSeconds,
        },
      });

      const userBeforeUpdate = await tx.user.findUnique({
        where: { id: userId },
        select: {
          xp: true,
          level: true,
        },
      });

      const currentXp = userBeforeUpdate?.xp ?? 0;
      const newXp = currentXp + rewardXp;
      const newLevel = Math.max(
        1,
        Math.floor(newXp / 1000) + 1
      );

      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          xp: newXp,
          level: newLevel,
          bestWpm: Math.max(
            userBeforeUpdate ? 0 : 0,
            wpm
          ),
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

      // Recalculate user typing aggregates so the profile remains current.
      const stats = await tx.typingTest.aggregate({
        where: { userId },
        _avg: {
          wpm: true,
          accuracy: true,
        },
        _max: {
          wpm: true,
        },
      });

      const finalUser = await tx.user.update({
        where: { id: userId },
        data: {
          bestWpm: stats._max.wpm ?? 0,
          averageWpm: stats._avg.wpm ?? 0,
          averageAccuracy: stats._avg.accuracy ?? 0,
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

      return {
        test,
        user: finalUser,
      };
    });

    return res.status(201).json({
      success: true,
      message: challengeCompleted
        ? "Daily challenge completed. 50 XP awarded."
        : "Daily challenge result saved.",
      completed: challengeCompleted,
      rewardXp,
      ...result,
    });
  } catch (error) {
    console.error("Daily challenge error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to save daily challenge.",
    });
  }
}