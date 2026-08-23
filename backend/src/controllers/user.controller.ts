import { Response } from "express";
import { prisma } from "../config/prisma";
import { AuthRequest } from "../middleware/auth.middleware";

export async function getMyProfile(
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

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
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

    const testStats = await prisma.typingTest.aggregate({
      where: { userId },
      _count: { _all: true },
      _sum: { practiceSeconds: true },
      _avg: { wpm: true, accuracy: true },
      _max: { wpm: true },
    });

    const achievementCount = await prisma.userAchievement.count({
      where: { userId },
    });

    return res.status(200).json({
      success: true,
      user: {
        ...user,
        statistics: {
          tests: testStats._count._all,
          practiceSeconds: testStats._sum.practiceSeconds ?? 0,
          averageWpm: testStats._avg.wpm ?? 0,
          averageAccuracy: testStats._avg.accuracy ?? 0,
          bestWpm: testStats._max.wpm ?? 0,
          achievements: achievementCount,
        },
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load profile.",
    });
  }
}

export async function updateMyProfile(
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

    const name =
      typeof req.body.name === "string"
        ? req.body.name.trim()
        : "";

    const country =
      typeof req.body.country === "string"
        ? req.body.country.trim()
        : "";

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Name is required.",
      });
    }

    const user = await prisma.user.update({
      where: {
        id: req.user.userId,
      },
      data: {
        name,
        country: country || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
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

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      user,
    });
  } catch (error) {
    console.error("Update profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update profile.",
    });
  }
}