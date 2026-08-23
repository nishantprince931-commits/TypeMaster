import { Response } from "express";
import { prisma } from "../config/prisma";
import { AuthRequest } from "../middleware/auth.middleware";

type Period = "Daily" | "Weekly" | "Monthly" | "All Time";

function getStartDate(period: Period) {
  const now = new Date();

  if (period === "Daily") {
    const d = new Date(now);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  const days = period === "Weekly" ? 6 : period === "Monthly" ? 29 : null;
  if (days === null) return null;

  const d = new Date(now);
  d.setDate(d.getDate() - days);
  d.setHours(0, 0, 0, 0);
  return d;
}

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function dateKey(date: Date) {
  return startOfDay(date).toISOString().slice(0, 10);
}

function getCurrentStreak(dates: Date[]) {
  if (dates.length === 0) return 0;

  const uniqueDays = new Set(dates.map(dateKey));
  let current = startOfDay(new Date());

  if (!uniqueDays.has(dateKey(current))) {
    current.setDate(current.getDate() - 1);

    if (!uniqueDays.has(dateKey(current))) {
      return 0;
    }
  }

  let streak = 0;

  while (uniqueDays.has(dateKey(current))) {
    streak += 1;
    current.setDate(current.getDate() - 1);
  }

  return streak;
}

export async function getLeaderboard(req: AuthRequest, res: Response) {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const raw = String(req.query.period || "Daily");

    const period = (
      ["Daily", "Weekly", "Monthly", "All Time"] as const
    ).includes(raw as Period)
      ? (raw as Period)
      : "Daily";

    const startDate = getStartDate(period);

    const where = startDate
      ? {
          createdAt: {
            gte: startDate,
          },
        }
      : undefined;

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        country: true,
        xp: true,
      },
    });

    const grouped = await prisma.typingTest.groupBy({
      by: ["userId"],
      where,
      _max: {
        wpm: true,
      },
      _avg: {
        accuracy: true,
      },
    });

    // We calculate current streak from the actual typing-test dates,
    // rather than relying on the User.streak field.
    const allTestDates = await prisma.typingTest.findMany({
      select: {
        userId: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const datesByUser = new Map<string, Date[]>();

    for (const test of allTestDates) {
      const list = datesByUser.get(test.userId) ?? [];
      list.push(test.createdAt);
      datesByUser.set(test.userId, list);
    }

    const streakByUser = new Map<string, number>();

    for (const user of users) {
      streakByUser.set(
        user.id,
        getCurrentStreak(datesByUser.get(user.id) ?? [])
      );
    }

    const map = new Map(grouped.map((row) => [row.userId, row]));

    const players = users
      .map((user) => {
        const row = map.get(user.id);

        return {
          id: user.id,
          name: user.name,
          country: user.country || "Unknown",
          wpm: row?._max.wpm ?? 0,
          accuracy: row?._avg.accuracy ?? 0,
          streak: streakByUser.get(user.id) ?? 0,
          xp: user.xp ?? 0,
          avatar: user.name.trim().charAt(0).toUpperCase() || "?",
        };
      })
      .filter((player) => player.wpm > 0)
      .sort(
        (a, b) =>
          b.wpm - a.wpm ||
          b.accuracy - a.accuracy ||
          b.xp - a.xp
      )
      .map((player, index) => ({
        ...player,
        rank: index + 1,
      }));

    const yourIndex = players.findIndex(
      (player) => player.id === req.user!.userId
    );

    const you = yourIndex >= 0 ? players[yourIndex] : null;

    // Higher-ranked player is the next target. For rank #1 there is no next rank.
    const next = yourIndex > 0 ? players[yourIndex - 1] : null;

    const longestStreak = players.reduce(
      (max, player) => Math.max(max, player.streak),
      0
    );

    return res.json({
      success: true,
      period,
      players,
      stats: {
        players: players.length,
        topWpm: players[0]?.wpm ?? 0,
        topAccuracy: players[0]?.accuracy ?? 0,
        longestStreak,
      },
      yourPosition: you
        ? {
            rank: you.rank,
            wpm: you.wpm,
            nextRank: next?.rank ?? null,
            wpmToNextRank: next
              ? Math.max(next.wpm - you.wpm, 0)
              : 0,
          }
        : null,
    });
  } catch (error) {
    console.error("Leaderboard error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load leaderboard.",
    });
  }
}