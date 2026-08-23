import { Response } from "express";
import { prisma } from "../config/prisma";
import { AuthRequest } from "../middleware/auth.middleware";

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function getPeriodDays(period: string) {
  switch (period) {
    case "7 Days":
      return 7;
    case "90 Days":
      return 90;
    case "All Time":
      return null;
    case "30 Days":
    default:
      return 30;
  }
}

function calculateStreak(dates: Date[]) {
  if (!dates.length) return 0;

  const keys = new Set(
    dates.map((date) => startOfDay(date).toISOString().slice(0, 10))
  );

  let current = startOfDay(new Date());

  if (!keys.has(current.toISOString().slice(0, 10))) {
    current = addDays(current, -1);
  }

  if (!keys.has(current.toISOString().slice(0, 10))) {
    return 0;
  }

  let streak = 0;

  while (keys.has(current.toISOString().slice(0, 10))) {
    streak += 1;
    current = addDays(current, -1);
  }

  return streak;
}

function achievementSummary(
  bestWpm: number,
  accuracy: number,
  tests: number,
  practiceSeconds: number,
  streak: number
) {
  const practiceHours = practiceSeconds / 3600;

  return [
    {
      icon: "⚡",
      title: "Speed Master",
      description: "Reach 75+ WPM",
      status: bestWpm >= 75 ? "Completed" : "Progress",
      progress: Math.min(Math.round((bestWpm / 75) * 100), 100),
    },
    {
      icon: "🎯",
      title: "Accuracy Pro",
      description: "Maintain 95% accuracy",
      status: accuracy >= 95 ? "Completed" : "Progress",
      progress: Math.min(Math.round((accuracy / 95) * 100), 100),
    },
    {
      icon: "🔥",
      title: "7 Day Streak",
      description: "Practice for 7 consecutive days",
      status: streak >= 7 ? "Completed" : "Progress",
      progress: Math.min(Math.round((streak / 7) * 100), 100),
    },
  ];
}

export async function getProgress(
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
    const period = String(req.query.period || "30 Days");
    const periodDays = getPeriodDays(period);

    const now = new Date();
    const periodStart =
      periodDays === null
        ? new Date(0)
        : addDays(startOfDay(now), -periodDays + 1);

    const tests = await prisma.typingTest.findMany({
      where: {
        userId,
        createdAt: {
          gte: periodStart,
          lte: now,
        },
      },
      orderBy: {
        createdAt: "asc",
      },
      select: {
        id: true,
        createdAt: true,
        testType: true,
        wpm: true,
        accuracy: true,
        errors: true,
        practiceSeconds: true,
      },
    });

    const allTests = await prisma.typingTest.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
      select: {
        createdAt: true,
        wpm: true,
        accuracy: true,
        practiceSeconds: true,
      },
    });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        xp: true,
        level: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const allBestWpm = allTests.length
      ? Math.max(...allTests.map((test) => test.wpm))
      : 0;

    const allAverageWpm = allTests.length
      ? allTests.reduce((sum, test) => sum + test.wpm, 0) /
        allTests.length
      : 0;

    const allAverageAccuracy = allTests.length
      ? allTests.reduce((sum, test) => sum + test.accuracy, 0) /
        allTests.length
      : 0;

    const allPracticeSeconds = allTests.reduce(
      (sum, test) => sum + test.practiceSeconds,
      0
    );

    const periodBestWpm = tests.length
      ? Math.max(...tests.map((test) => test.wpm))
      : 0;

    const periodAverageWpm = tests.length
      ? tests.reduce((sum, test) => sum + test.wpm, 0) /
        tests.length
      : 0;

    const periodAverageAccuracy = tests.length
      ? tests.reduce((sum, test) => sum + test.accuracy, 0) /
        tests.length
      : 0;

    const streak = calculateStreak(
      allTests.map((test) => test.createdAt)
    );

    const previousStart =
      periodDays === null
        ? null
        : addDays(periodStart, -periodDays);

    let bestWpmChange = 0;
    let averageWpmChange = 0;
    let accuracyChange = 0;

    if (previousStart) {
      const previousTests = await prisma.typingTest.findMany({
        where: {
          userId,
          createdAt: {
            gte: previousStart,
            lt: periodStart,
          },
        },
        select: {
          wpm: true,
          accuracy: true,
        },
      });

      if (previousTests.length) {
        const previousBest = Math.max(
          ...previousTests.map((test) => test.wpm)
        );
        const previousAverage =
          previousTests.reduce(
            (sum, test) => sum + test.wpm,
            0
          ) / previousTests.length;
        const previousAccuracy =
          previousTests.reduce(
            (sum, test) => sum + test.accuracy,
            0
          ) / previousTests.length;

        bestWpmChange =
          previousBest === 0
            ? 0
            : ((periodBestWpm - previousBest) / previousBest) *
              100;

        averageWpmChange =
          previousAverage === 0
            ? 0
            : ((periodAverageWpm - previousAverage) /
                previousAverage) *
              100;

        accuracyChange =
          ((periodAverageAccuracy - previousAccuracy) /
            Math.max(previousAccuracy, 1)) *
          100;
      }
    }

    const chartTests = [...tests].slice(-12);

    const maxPractice = Math.max(
      ...tests.map((test) => test.practiceSeconds),
      1
    );

    const weeklyActivity = Array.from({ length: 7 }).map(
      (_, index) => {
        const day = addDays(
          startOfDay(now),
          index - 6
        );

        const key = day.toISOString().slice(0, 10);

        const practiceSeconds = tests
          .filter(
            (test) =>
              startOfDay(test.createdAt)
                .toISOString()
                .slice(0, 10) === key
          )
          .reduce(
            (sum, test) => sum + test.practiceSeconds,
            0
          );

        return {
          day: day.toLocaleDateString("en-US", {
            weekday: "short",
          }),
          practiceSeconds,
          percentage: Math.min(
            Math.round((practiceSeconds / maxPractice) * 100),
            100
          ),
        };
      }
    );

    const currentLevelBaseXp = Math.max(
      0,
      (user.level - 1) * 1000
    );

    const currentLevelXp = Math.max(
      0,
      user.xp - currentLevelBaseXp
    );

    const requiredXp = 1000;

    const achievements = achievementSummary(
      allBestWpm,
      allAverageAccuracy,
      allTests.length,
      allPracticeSeconds,
      streak
    );

    return res.status(200).json({
      success: true,

      stats: {
        bestWpm: allBestWpm,
        averageWpm: allAverageWpm,
        averageAccuracy: allAverageAccuracy,
        tests: allTests.length,
        testsInPeriod: tests.length,
        practiceSeconds: allPracticeSeconds,
        streak,
        xp: user.xp,
        level: user.level,
        bestWpmChange,
        averageWpmChange,
        averageAccuracyChange: accuracyChange,
      },

      levelProgress: {
        currentXp: currentLevelXp,
        requiredXp,
        remainingXp: Math.max(
          requiredXp - currentLevelXp,
          0
        ),
        percentage: Math.min(
          Math.round((currentLevelXp / requiredXp) * 100),
          100
        ),
      },

      charts: {
        wpm: chartTests.map((test) => Math.round(test.wpm)),
        accuracy: chartTests.map((test) =>
          Math.round(test.accuracy)
        ),
      },

      weekly: {
        totalPracticeSeconds: weeklyActivity.reduce(
          (sum, item) => sum + item.practiceSeconds,
          0
        ),
        activity: weeklyActivity,
      },

      recentTests: [...tests]
        .reverse()
        .slice(0, 10)
        .map((test) => ({
          id: test.id,
          createdAt: test.createdAt,
          testType: test.testType,
          wpm: test.wpm,
          accuracy: test.accuracy,
          errors: test.errors,
        })),

      keyAnalysis: {
        available: false,
        weak: [],
        strong: [],
      },

      achievements,
    });
  } catch (error) {
    console.error("Progress error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load progress.",
    });
  }
}