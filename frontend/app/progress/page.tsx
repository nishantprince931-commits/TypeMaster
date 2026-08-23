"use client";

import { useEffect, useMemo, useState } from "react";

export default function Progress() {
  const [period, setPeriod] = useState("30 Days");
  const [data, setData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProgress() {
      const token = localStorage.getItem("typemaster_token");

      if (!token) {
        setError("Please login to view your progress.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `http://localhost:5000/api/progress?period=${encodeURIComponent(period)}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const json = await response.json();

        if (!response.ok) {
          setError(json.message || "Unable to load progress.");
          return;
        }

        setData(json);
      } catch {
        setError(
          "Cannot connect to the backend. Make sure the backend is running."
        );
      } finally {
        setLoading(false);
      }
    }

    loadProgress();
  }, [period]);

  const wpmData = useMemo(
    () => data?.charts.wpm ?? [],
    [data]
  );

  const accuracyData = useMemo(
    () => data?.charts.accuracy ?? [],
    [data]
  );

  return (
    <main className="min-h-screen bg-[#070B14] px-4 py-6 text-white md:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <header className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-sm text-slate-400">TypeMaster Analytics</p>

            <h1 className="mt-1 text-3xl font-black md:text-4xl">
              Your Progress 📊
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              Track your real typing performance and see how your
              speed improves over time.
            </p>
          </div>

          <div className="flex rounded-xl bg-[#0D1424] p-1">
            {["7 Days", "30 Days", "90 Days", "All Time"].map(
              (item) => (
                <button
                  key={item}
                  onClick={() => setPeriod(item)}
                  className={`rounded-lg px-4 py-2 text-xs font-semibold transition md:text-sm ${
                    period === item
                      ? "bg-blue-600 text-white"
                      : "text-slate-500 hover:text-white"
                  }`}
                >
                  {item}
                </button>
              )
            )}
          </div>
        </header>

        {loading && (
          <div className="mt-6 rounded-2xl border border-white/10 bg-[#0D1424] px-5 py-4 text-sm text-slate-400">
            Loading your real progress...
          </div>
        )}

        {error && (
          <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Main Stats */}
        <section className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            icon="⚡"
            title="Best WPM"
            value={data ? String(Math.round(data.stats.bestWpm)) : "—"}
            change={data ? formatChange(data.stats.bestWpmChange) : "—"}
            positive={data ? data.stats.bestWpmChange >= 0 : true}
          />

          <StatCard
            icon="📈"
            title="Average WPM"
            value={data ? String(Math.round(data.stats.averageWpm)) : "—"}
            change={data ? formatChange(data.stats.averageWpmChange) : "—"}
            positive={data ? data.stats.averageWpmChange >= 0 : true}
          />

          <StatCard
            icon="🎯"
            title="Average Accuracy"
            value={
              data
                ? `${data.stats.averageAccuracy.toFixed(1)}%`
                : "—"
            }
            change={
              data
                ? formatChange(data.stats.averageAccuracyChange)
                : "—"
            }
            positive={
              data ? data.stats.averageAccuracyChange >= 0 : true
            }
          />

          <StatCard
            icon="📝"
            title="Tests Completed"
            value={data ? String(data.stats.tests) : "—"}
            change={data ? `+${data.stats.testsInPeriod}` : "—"}
            positive
          />
        </section>

        {/* Secondary Stats */}
        <section className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <SmallStat
            icon="⏱️"
            title="Practice Time"
            value={
              data
                ? formatPracticeTime(data.stats.practiceSeconds)
                : "—"
            }
          />

          <SmallStat
            icon="🔥"
            title="Current Streak"
            value={
              data
                ? `${data.stats.streak} ${
                    data.stats.streak === 1 ? "day" : "days"
                  }`
                : "—"
            }
          />

          <SmallStat
            icon="⭐"
            title="Total XP"
            value={
              data ? data.stats.xp.toLocaleString() : "—"
            }
          />

          <SmallStat
            icon="🏆"
            title="Current Level"
            value={
              data ? `Level ${data.stats.level}` : "—"
            }
          />
        </section>

        {/* Level Progress */}
        <section className="mt-6 overflow-hidden rounded-3xl border border-white/10 bg-[#0D1424]">
          <div className="bg-gradient-to-r from-blue-600/15 to-purple-600/15 p-6 md:p-8">
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
              <div>
                <p className="text-sm text-blue-400">Your Level</p>

                <div className="mt-1 flex items-end gap-3">
                  <h2 className="text-4xl font-black">
                    Level {data?.stats.level ?? "—"}
                  </h2>

                  <span className="pb-1 text-sm text-slate-400">
                    Typing Apprentice
                  </span>
                </div>

                <p className="mt-2 text-sm text-slate-400">
                  {data
                    ? `${data.levelProgress.remainingXp} XP remaining to reach Level ${
                        data.stats.level + 1
                      }.`
                    : "Loading level progress..."}
                </p>
              </div>

              <div className="w-full max-w-md">
                <div className="mb-2 flex justify-between text-xs">
                  <span className="text-slate-500">
                    {data
                      ? `${data.levelProgress.currentXp.toLocaleString()} / ${data.levelProgress.requiredXp.toLocaleString()} XP`
                      : "—"}
                  </span>

                  <span className="font-bold text-blue-400">
                    {data ? `${data.levelProgress.percentage}%` : "—"}
                  </span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-white/5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                    style={{
                      width: `${data?.levelProgress.percentage ?? 0}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Charts */}
        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          <ChartCard
            title="WPM Progress"
            subtitle={`${period} performance`}
            data={wpmData}
            max={100}
            unit="WPM"
          />

          <ChartCard
            title="Accuracy Progress"
            subtitle={`${period} performance`}
            data={accuracyData}
            max={100}
            unit="%"
          />
        </section>

        {/* Weekly Activity */}
        <section className="mt-6 rounded-3xl border border-white/10 bg-[#0D1424] p-6 md:p-8">
          <div className="flex flex-col justify-between gap-2 md:flex-row md:items-center">
            <div>
              <p className="text-sm text-slate-500">
                Practice Activity
              </p>

              <h2 className="text-xl font-black">
                Weekly Activity
              </h2>
            </div>

            <span className="rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-400">
              {data
                ? formatPracticeTime(data.weekly.totalPracticeSeconds)
                : "—"} this week
            </span>
          </div>

          <div className="mt-8 flex items-end justify-between gap-3">
            {data?.weekly.activity.map((item) => (
              <div
                key={item.day}
                className="flex flex-1 flex-col items-center"
              >
                <div className="flex h-48 w-full items-end justify-center">
                  <div
                    className="w-full max-w-12 rounded-t-xl bg-blue-600 transition hover:bg-blue-500"
                    style={{
                      height: `${item.percentage}%`,
                    }}
                    title={`${item.practiceSeconds}s`}
                  />
                </div>

                <p className="mt-3 text-xs text-slate-500">
                  {item.day}
                </p>
              </div>
            ))}

            {!data && (
              <div className="w-full py-12 text-center text-sm text-slate-600">
                No activity yet.
              </div>
            )}
          </div>
        </section>

        {/* Weak / Strong Keys */}
        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          <KeyAnalysis
            title="Weak Keys"
            description={
              data?.keyAnalysis.available
                ? "Keys that need more practice"
                : "Key-level data will appear after per-key tracking is added."
            }
            items={data?.keyAnalysis.weak ?? []}
            type="weak"
          />

          <KeyAnalysis
            title="Strong Keys"
            description={
              data?.keyAnalysis.available
                ? "Keys you're typing accurately"
                : "Key-level data will appear after per-key tracking is added."
            }
            items={data?.keyAnalysis.strong ?? []}
            type="strong"
          />
        </section>

        {/* Recent Tests */}
        <section className="mt-6 overflow-hidden rounded-3xl border border-white/10 bg-[#0D1424]">
          <div className="flex flex-col justify-between gap-3 border-b border-white/10 p-6 md:flex-row md:items-center">
            <div>
              <p className="text-sm text-slate-500">History</p>
              <h2 className="text-xl font-black">Recent Tests</h2>
            </div>
          </div>

          {data?.recentTests.length ? (
            <>
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[700px]">
                  <thead>
                    <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wide text-slate-500">
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Type</th>
                      <th className="px-6 py-4">WPM</th>
                      <th className="px-6 py-4">Accuracy</th>
                      <th className="px-6 py-4">Errors</th>
                    </tr>
                  </thead>

                  <tbody>
                    {data.recentTests.map((test) => (
                      <tr
                        key={test.id}
                        className="border-b border-white/5 hover:bg-white/[0.02]"
                      >
                        <td className="px-6 py-4 text-sm text-slate-400">
                          {formatDate(test.createdAt)}
                        </td>

                        <td className="px-6 py-4">
                          <span className="rounded-lg bg-white/5 px-3 py-1.5 text-xs">
                            {test.testType}
                          </span>
                        </td>

                        <td className="px-6 py-4 font-bold text-blue-400">
                          {Math.round(test.wpm)}
                        </td>

                        <td className="px-6 py-4 text-emerald-400">
                          {test.accuracy.toFixed(1)}%
                        </td>

                        <td className="px-6 py-4 text-slate-400">
                          {test.errors}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="space-y-3 p-4 md:hidden">
                {data.recentTests.map((test) => (
                  <div
                    key={test.id}
                    className="rounded-2xl border border-white/10 bg-[#080D18] p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold">
                          {test.testType}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {formatDate(test.createdAt)}
                        </p>
                      </div>

                      <span className="text-xl font-black text-blue-400">
                        {Math.round(test.wpm)}
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <MiniStat
                        label="Accuracy"
                        value={`${test.accuracy.toFixed(1)}%`}
                      />

                      <MiniStat
                        label="Errors"
                        value={test.errors}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="p-10 text-center text-sm text-slate-600">
              No typing tests found for this period.
            </div>
          )}
        </section>

        {/* Achievement Summary */}
        <section className="mt-6 grid gap-6 lg:grid-cols-3">
          {data?.achievements.map((achievement) => (
            <AchievementCard
              key={achievement.title}
              icon={achievement.icon}
              title={achievement.title}
              description={achievement.description}
              progress={
                achievement.status === "Completed"
                  ? "Completed"
                  : `${achievement.progress}%`
              }
              complete={achievement.status === "Completed"}
            />
          ))}
        </section>

        <footer className="mt-8 border-t border-white/10 py-6 text-center text-sm text-slate-500">
          Keep practicing and turn small improvements into big
          results. 🚀
        </footer>
      </div>
    </main>
  );
}

type ProgressData = {
  stats: {
    bestWpm: number;
    averageWpm: number;
    averageAccuracy: number;
    tests: number;
    testsInPeriod: number;
    practiceSeconds: number;
    streak: number;
    xp: number;
    level: number;
    bestWpmChange: number;
    averageWpmChange: number;
    averageAccuracyChange: number;
  };
  levelProgress: {
    currentXp: number;
    requiredXp: number;
    remainingXp: number;
    percentage: number;
  };
  charts: {
    wpm: number[];
    accuracy: number[];
  };
  weekly: {
    totalPracticeSeconds: number;
    activity: {
      day: string;
      practiceSeconds: number;
      percentage: number;
    }[];
  };
  recentTests: {
    id: string;
    createdAt: string;
    testType: string;
    wpm: number;
    accuracy: number;
    errors: number;
  }[];
  keyAnalysis: {
    available: boolean;
    weak: { key: string; accuracy: number }[];
    strong: { key: string; accuracy: number }[];
  };
  achievements: {
    icon: string;
    title: string;
    description: string;
    status: "Completed" | "Progress" | "Locked";
    progress: number;
  }[];
};

function formatPracticeTime(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours === 0) return `${minutes}m`;

  return `${hours}h ${minutes}m`;
}

function formatChange(value: number) {
  const rounded = Math.round(value * 10) / 10;

  if (rounded > 0) return `+${rounded}%`;
  if (rounded < 0) return `${rounded}%`;

  return "0%";
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StatCard({
  icon,
  title,
  value,
  change,
  positive,
}: {
  icon: string;
  title: string;
  value: string;
  change: string;
  positive?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0D1424] p-5">
      <div className="flex items-center justify-between">
        <span className="text-xl">{icon}</span>

        <span
          className={`text-xs font-semibold ${
            positive ? "text-emerald-400" : "text-red-400"
          }`}
        >
          {change}
        </span>
      </div>

      <p className="mt-4 text-xs text-slate-500">{title}</p>

      <p className="mt-1 text-2xl font-black">{value}</p>
    </div>
  );
}

function SmallStat({
  icon,
  title,
  value,
}: {
  icon: string;
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0D1424] p-5">
      <div className="text-xl">{icon}</div>

      <p className="mt-3 text-xs text-slate-500">{title}</p>

      <p className="mt-1 text-xl font-black">{value}</p>
    </div>
  );
}

function ChartCard({
  title,
  subtitle,
  data,
  max,
  unit,
}: {
  title: string;
  subtitle: string;
  data: number[];
  max: number;
  unit: string;
}) {
  const height = 220;

  return (
    <div className="rounded-3xl border border-white/10 bg-[#0D1424] p-6 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">{subtitle}</p>
          <h2 className="text-xl font-black">{title}</h2>
        </div>

        <span className="rounded-full bg-blue-500/10 px-3 py-1.5 text-xs text-blue-400">
          {data[data.length - 1]}
          {unit === "%" ? "%" : " WPM"}
        </span>
      </div>

      <div
        className="relative mt-8"
        style={{ height: `${height}px` }}
      >
        {/* Grid */}
        {[0, 25, 50, 75, 100].map((line) => (
          <div
            key={line}
            className="absolute left-0 right-0 border-t border-white/5"
            style={{
              bottom: `${line}%`,
            }}
          />
        ))}

        {/* Bars */}
        <div className="absolute inset-0 flex items-end gap-2">
          {data.map((value, index) => {
            const percentage = Math.min((value / max) * 100, 100);

            return (
              <div
                key={index}
                className="group relative flex h-full flex-1 items-end"
              >
                <div
                  className="w-full rounded-t-lg bg-gradient-to-t from-blue-700 to-blue-400 transition-all group-hover:from-blue-600 group-hover:to-cyan-400"
                  style={{
                    height: `${percentage}%`,
                  }}
                />

                <span className="absolute -top-6 left-1/2 hidden -translate-x-1/2 rounded-md bg-black px-2 py-1 text-[10px] text-white group-hover:block">
                  {value}
                  {unit === "%" ? "%" : ""}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-3 flex justify-between text-[10px] text-slate-600">
        {data.map((_, index) => (
          <span key={index}>{index + 1}</span>
        ))}
      </div>
    </div>
  );
}

function KeyAnalysis({
  title,
  description,
  items,
  type,
}: {
  title: string;
  description: string;
  items: { key: string; accuracy: number }[];
  type: "weak" | "strong";
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-[#0D1424] p-6 md:p-8">
      <div>
        <p className="text-sm text-slate-500">{description}</p>

        <h2 className="text-xl font-black">{title}</h2>
      </div>

      <div className="mt-6 space-y-4">
        {items.map((item) => (
          <div key={item.key}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-black ${
                    type === "weak"
                      ? "bg-red-500/10 text-red-400"
                      : "bg-emerald-500/10 text-emerald-400"
                  }`}
                >
                  {item.key}
                </div>

                <span className="text-sm font-semibold">
                  {type === "weak"
                    ? "Needs Practice"
                    : "Strong Performance"}
                </span>
              </div>

              <span className="text-sm font-bold text-slate-300">
                {item.accuracy}%
              </span>
            </div>

            <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/5">
              <div
                className={`h-full rounded-full ${
                  type === "weak"
                    ? "bg-red-500"
                    : "bg-emerald-500"
                }`}
                style={{ width: `${item.accuracy}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MiniStat({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-xl bg-white/5 p-3 text-center">
      <p className="text-[10px] uppercase text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-bold">{value}</p>
    </div>
  );
}

function AchievementCard({
  icon,
  title,
  description,
  progress,
  complete = false,
}: {
  icon: string;
  title: string;
  description: string;
  progress: string;
  complete?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0D1424] p-5">
      <div className="flex items-start gap-4">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl text-2xl ${
            complete
              ? "bg-emerald-500/10"
              : "bg-blue-500/10"
          }`}
        >
          {icon}
        </div>

        <div className="flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-bold">{title}</h3>

              <p className="mt-1 text-xs text-slate-500">
                {description}
              </p>
            </div>

            {complete && (
              <span className="text-emerald-400">✓</span>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between text-xs">
            <span className="text-slate-500">Progress</span>

            <span
              className={
                complete
                  ? "font-bold text-emerald-400"
                  : "font-bold text-blue-400"
              }
            >
              {progress}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}