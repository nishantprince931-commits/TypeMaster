import { Response } from "express";
import { prisma } from "../config/prisma";
import { AuthRequest } from "../middleware/auth.middleware";

type AchievementResult = {
  icon: string;
  title: string;
  description: string;
  status: "Completed" | "Progress" | "Locked";
  progress: number;
};

function startOfDay(date: Date) {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

function getDateKey(date: Date) {
  return startOfDay(date).toISOString().slice(0, 10);
}

function getCurrentStreak(testDates: Date[]) {
  if (testDates.length === 0) return 0;

  const uniqueDays = new Set(testDates.map(getDateKey));
  let currentDate = startOfDay(new Date());

  if (!uniqueDays.has(getDateKey(currentDate))) {
    currentDate.setDate(currentDate.getDate() - 1);

    if (!uniqueDays.has(getDateKey(currentDate))) {
      return 0;
    }
  }

  let streak = 0;

  while (uniqueDays.has(getDateKey(currentDate))) {
    streak += 1;
    currentDate.setDate(currentDate.getDate() - 1);
  }

  return streak;
}

function getNextGoal(bestWpm: number) {
  if (bestWpm < 50) {
    return { target: 50, remaining: 50 - bestWpm, completed: false };
  }

  if (bestWpm < 75) {
    return { target: 75, remaining: 75 - bestWpm, completed: false };
  }

  if (bestWpm < 100) {
    return { target: 100, remaining: 100 - bestWpm, completed: false };
  }

  return { target: 100, remaining: 0, completed: true };
}

function getAchievements(
  bestWpm: number,
  averageAccuracy: number,
  testCount: number,
  practiceSeconds: number,
  streak: number
): AchievementResult[] {
  const practiceHours = practiceSeconds / 3600;

  return [
    {
      icon: "⚡",
      title: "Speed Master",
      description: "Reach 75 WPM",
      status: bestWpm >= 75 ? "Completed" : "Progress",
      progress: Math.min(Math.round((bestWpm / 75) * 100), 100),
    },
    {
      icon: "🎯",
      title: "Accuracy Pro",
      description: "Reach 95% accuracy",
      status: averageAccuracy >= 95 ? "Completed" : "Progress",
      progress: Math.min(Math.round((averageAccuracy / 95) * 100), 100),
    },
    {
      icon: "🔥",
      title: "7 Day Streak",
      description: "Practice 7 days in a row",
      status: streak >= 7 ? "Completed" : "Progress",
      progress: Math.min(Math.round((streak / 7) * 100), 100),
    },
    {
      icon: "🏆",
      title: "First 100 WPM",
      description: "Reach 100 WPM",
      status: bestWpm >= 100 ? "Completed" : "Locked",
      progress: Math.min(Math.round((bestWpm / 100) * 100), 100),
    },
    {
      icon: "📝",
      title: "100 Tests",
      description: "Complete 100 typing tests",
      status: testCount >= 100 ? "Completed" : "Progress",
      progress: Math.min(Math.round((testCount / 100) * 100), 100),
    },
    {
      icon: "⏱️",
      title: "10 Hours",
      description: "Practice for 10 hours",
      status: practiceHours >= 10 ? "Completed" : "Progress",
      progress: Math.min(Math.round((practiceHours / 10) * 100), 100),
    },
  ];
}

export async function getProfileDashboard(
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

    const tests = await prisma.typingTest.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        wpm: true,
        accuracy: true,
        practiceSeconds: true,
        createdAt: true,
      },
    });

    const testCount = tests.length;
    const practiceSeconds = tests.reduce(
      (sum, test) => sum + (test.practiceSeconds ?? 0),
      0
    );

    const bestWpm =
      testCount > 0 ? Math.max(...tests.map((test) => test.wpm)) : 0;

    const averageWpm =
      testCount > 0
        ? tests.reduce((sum, test) => sum + test.wpm, 0) / testCount
        : 0;

    const averageAccuracy =
      testCount > 0
        ? tests.reduce((sum, test) => sum + test.accuracy, 0) / testCount
        : 0;

    const streak = getCurrentStreak(
      tests.map((test) => test.createdAt)
    );

    const nextGoal = getNextGoal(bestWpm);

    const achievements = getAchievements(
      bestWpm,
      averageAccuracy,
      testCount,
      practiceSeconds,
      streak
    );

    const completedAchievements = achievements.filter(
      (achievement) => achievement.status === "Completed"
    ).length;

    const currentLevelBaseXp = Math.max(0, (user.level - 1) * 1000);
    const currentLevelXp = Math.max(0, user.xp - currentLevelBaseXp);
    const requiredXp = 1000;
    const levelPercentage = Math.min(
      Math.round((currentLevelXp / requiredXp) * 100),
      100
    );

    return res.status(200).json({
      success: true,

      user: {
        ...user,
        streak,
        bestWpm,
        averageWpm,
        averageAccuracy,
      },

      statistics: {
        tests: testCount,
        practiceSeconds,

        // Keep these inside statistics too so the frontend
        // can use one consistent source for all typing stats.
        bestWpm,
        averageWpm,
        averageAccuracy,

        achievements: completedAchievements,
      },

      levelProgress: {
        currentXp: currentLevelXp,
        requiredXp,
        percentage: levelPercentage,
      },

      nextGoal,
      achievements,
    });
  } catch (error) {
    console.error("Profile dashboard error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load profile dashboard.",
    });
  }
}