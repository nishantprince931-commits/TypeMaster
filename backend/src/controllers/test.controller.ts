import { Response } from "express";
import { prisma } from "../config/prisma";
import { AuthRequest } from "../middleware/auth.middleware";

export async function saveTypingTest(
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
      typingTextId,
      testType,
      durationSeconds,
      wpm,
      accuracy,
      correctCharacters,
      wrongCharacters,
      errors,
      practiceSeconds,
    } = req.body;

    if (
      !testType ||
      typeof durationSeconds !== "number" ||
      typeof wpm !== "number" ||
      typeof accuracy !== "number" ||
      typeof correctCharacters !== "number" ||
      typeof wrongCharacters !== "number" ||
      typeof errors !== "number"
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid test data.",
      });
    }

    if (
      durationSeconds <= 0 ||
      wpm < 0 ||
      accuracy < 0 ||
      accuracy > 100
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid typing test values.",
      });
    }

    const test = await prisma.typingTest.create({
      data: {
        userId,
        typingTextId: typingTextId || null,
        testType: String(testType),
        durationSeconds,
        wpm,
        accuracy,
        correctCharacters,
        wrongCharacters,
        errors,
        practiceSeconds:
          typeof practiceSeconds === "number"
            ? Math.max(0, practiceSeconds)
            : durationSeconds,
      },
    });

    const aggregate = await prisma.typingTest.aggregate({
      where: {
        userId,
      },
      _avg: {
        wpm: true,
        accuracy: true,
      },
      _max: {
        wpm: true,
      },
      _count: {
        _all: true,
      },
    });

    const currentUser = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        xp: true,
      },
    });

    const newXp = (currentUser?.xp ?? 0) + 10;

    const newLevel = Math.max(
      1,
      Math.floor(newXp / 500) + 1
    );

    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        bestWpm: aggregate._max.wpm ?? 0,
        averageWpm: aggregate._avg.wpm ?? 0,
        averageAccuracy: aggregate._avg.accuracy ?? 0,
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
      },
    });

    return res.status(201).json({
      success: true,
      message: "Typing test saved successfully.",
      test,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Save typing test error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to save typing test.",
    });
  }
}