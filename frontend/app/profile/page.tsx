"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Profile() {
  const router = useRouter();
  const [editing, setEditing] = useState(false);

 const [name, setName] = useState("");
  const [country, setCountry] = useState("India");

  const [email, setEmail] = useState("");
  const [level, setLevel] = useState(1);
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestWpm, setBestWpm] = useState(0);
  const [averageWpm, setAverageWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [tests, setTests] = useState(0);
  const [practiceSeconds, setPracticeSeconds] = useState(0);
  const [achievementsCount, setAchievementsCount] = useState(0);
  const [memberSince, setMemberSince] = useState("");
  const [nextGoal, setNextGoal] = useState(50);
  const [nextGoalRemaining, setNextGoalRemaining] = useState(50);
  const [nextGoalCompleted, setNextGoalCompleted] = useState(false);
  const [levelProgress, setLevelProgress] = useState(0);
  const [levelCurrentXp, setLevelCurrentXp] = useState(0);
  const [levelRequiredXp, setLevelRequiredXp] = useState(1000);
  const [achievements, setAchievements] = useState<
    {
      icon: string;
      title: string;
      description: string;
      status: "Completed" | "Progress" | "Locked";
      progress: number;
    }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    async function loadProfile() {
      const token = localStorage.getItem("typemaster_token");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/profile`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          console.error(data.message);
          return;
        }

        const user = data.user;
        const stats = data.statistics;
        const nextGoalData = data.nextGoal;
        const levelData = data.levelProgress;

        setName(user.name ?? "");
        setEmail(user.email ?? "");
        setCountry(user.country ?? "");
        setLevel(user.level ?? 1);
        setXp(user.xp ?? 0);
        setStreak(user.streak ?? 0);

        // WPM and accuracy are returned on the user object by /api/profile.
        setBestWpm(stats.bestWpm ?? user.bestWpm ?? 0);
        setAverageWpm(stats.averageWpm ?? user.averageWpm ?? 0);
        setAccuracy(stats.averageAccuracy ?? user.averageAccuracy ?? 0);

        setTests(stats.tests ?? 0);
        setPracticeSeconds(stats.practiceSeconds ?? 0);
        setAchievementsCount(stats.achievements ?? 0);
        setMemberSince(user.createdAt ?? "");
        setNextGoal(nextGoalData?.target ?? 50);
        setNextGoalRemaining(nextGoalData?.remaining ?? 0);
        setNextGoalCompleted(Boolean(nextGoalData?.completed));
        setLevelProgress(levelData?.percentage ?? 0);
        setLevelCurrentXp(levelData?.currentXp ?? 0);
        setLevelRequiredXp(levelData?.requiredXp ?? 1000);
        setAchievements(Array.isArray(data.achievements) ? data.achievements : []);
      } catch (error) {
        console.error("Profile loading error:", error);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  async function handleSaveProfile() {
    const token = localStorage.getItem("typemaster_token");

    if (!token) {
      router.push("/login");
      return;
    }

    if (!name.trim()) {
      setSaveMessage("Name cannot be empty.");
      return;
    }

    try {
      setSavingProfile(true);
      setSaveMessage("");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/me`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: name.trim(),
            country: country.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setSaveMessage(data.message || "Unable to save profile.");
        return;
      }

      setName(data.user.name ?? "");
      setCountry(data.user.country ?? "");
      localStorage.setItem(
        "typemaster_user",
        JSON.stringify(data.user)
      );
      setEditing(false);
      setSaveMessage("Profile saved successfully.");

      window.setTimeout(() => setSaveMessage(""), 2500);
    } catch {
      setSaveMessage("Unable to connect to the backend.");
    } finally {
      setSavingProfile(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem("typemaster_token");
    localStorage.removeItem("typemaster_user");
    router.push("/login");
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#070B14] px-4 py-6 text-white md:px-8">
        <div className="mx-auto flex min-h-[70vh] max-w-7xl items-center justify-center">
          <div className="rounded-2xl border border-white/10 bg-[#0D1424] px-6 py-5 text-sm text-slate-400">
            Loading your profile...
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#070B14] px-4 py-6 text-white md:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <header className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-sm text-slate-400">TypeMaster</p>

            <h1 className="mt-1 text-3xl font-black md:text-4xl">
              My Profile 👤
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              View your typing performance, achievements and account
              information.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (editing) {
                  handleSaveProfile();
                } else {
                  setEditing(true);
                }
              }}
              className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold transition hover:bg-blue-500"
            >
              {savingProfile
                ? "Saving..."
                : editing
                ? "Save Profile"
                : "✏️ Edit Profile"}
            </button>

            <button
              onClick={handleLogout}
              className="rounded-xl border border-red-500/20 bg-red-500/10 px-5 py-3 text-sm font-bold text-red-400 transition hover:bg-red-500/15"
            >
              Log Out
            </button>
          </div>
        </header>

        {saveMessage && (
          <div className="mt-4 rounded-xl border border-blue-500/20 bg-blue-500/10 px-4 py-3 text-sm text-blue-300">
            {saveMessage}
          </div>
        )}

        {/* Profile Hero */}
        <section className="relative mt-8 overflow-hidden rounded-3xl border border-white/10 bg-[#0D1424]">
          <div className="h-32 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />

          <div className="px-6 pb-7 md:px-8">
            <div className="-mt-12 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div className="flex flex-col gap-4 md:flex-row md:items-end">
                {/* Avatar */}
                <div className="flex h-24 w-24 items-center justify-center rounded-3xl border-4 border-[#0D1424] bg-gradient-to-br from-cyan-500 to-blue-600 text-4xl font-black shadow-2xl">
                  {name ? name.charAt(0).toUpperCase() : "?"}
                </div>

                <div className="pb-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-2xl font-black">
                      {name}
                    </h2>

                    <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-white/90">
                      Level {level}
                    </span>
                  </div>

                  <p className="mt-1 text-sm font-medium text-white/85">
                    Typing Apprentice
                  </p>

                  <p className="mt-2 text-xs font-medium text-white/70">
                    Member since {formatMemberSince(memberSince)}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <MiniProfileStat
                  label="Best WPM"
                  value={String(bestWpm)}
                />

                <MiniProfileStat
                  label="Accuracy"
                  value={`${accuracy.toFixed(1)}%`}
                />

                <MiniProfileStat
                  label="Streak"
                  value={`${streak} ${streak === 1 ? "Day" : "Days"} 🔥`}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Edit Form */}
        {editing && (
          <section className="mt-6 rounded-3xl border border-blue-500/20 bg-blue-500/5 p-6 md:p-8">
            <p className="text-sm text-blue-400">Edit Account</p>

            <h2 className="mt-1 text-xl font-black">
              Profile Information
            </h2>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <Field
                label="Name"
                value={name}
                onChange={setName}
              />

              <Field
                label="Country"
                value={country}
                onChange={setCountry}
              />

              <div>
                <label className="mb-2 block text-sm text-slate-400">
                  Email
                </label>

                <input
                  value={email}
                  disabled
                  className="w-full rounded-xl border border-white/10 bg-[#080D18] px-4 py-3 text-sm text-slate-500 outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-400">
                  Username
                </label>

                <input
                  value={email ? email.split("@")[0] : ""}
                  disabled
                  className="w-full rounded-xl border border-white/10 bg-[#080D18] px-4 py-3 text-sm text-slate-500 outline-none"
                />
              </div>
            </div>
          </section>
        )}

        {/* Level + XP */}
        <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="rounded-3xl border border-white/10 bg-[#0D1424] p-6 md:p-8">
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
              <div>
                <p className="text-sm text-blue-400">Current Level</p>

                <div className="mt-1 flex items-end gap-3">
                  <h2 className="text-4xl font-black">Level {level}</h2>

                  <span className="pb-1 text-sm text-slate-500">
                    Typing Apprentice
                  </span>
                </div>

                <p className="mt-2 text-sm text-slate-400">
                  {nextGoalCompleted
                    ? "100 WPM goal completed."
                    : `${nextGoalRemaining} WPM needed to reach ${nextGoal} WPM.`}
                </p>
              </div>

              <div className="rounded-2xl bg-white/5 px-5 py-4 text-center">
                <p className="text-xs text-slate-500">Total XP</p>

                <p className="mt-1 text-2xl font-black text-blue-400">
                  {xp.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="mt-6">
              <div className="mb-2 flex justify-between text-xs">
                <span className="text-slate-500">
                  {levelCurrentXp.toLocaleString()} / {levelRequiredXp.toLocaleString()} XP
                </span>

                <span className="font-bold text-blue-400">
                  {levelProgress}%
                </span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-white/5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                  style={{ width: `${levelProgress}%` }}
                />
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-orange-500/10 to-pink-500/10 p-6">
            <div className="text-3xl">🔥</div>

            <p className="mt-4 text-sm text-slate-400">
              Current Streak
            </p>

            <p className="mt-1 text-4xl font-black">{streak} {streak === 1 ? "Day" : "Days"}</p>

            <p className="mt-2 text-xs text-slate-500">
              Keep practicing daily to extend your streak.
            </p>

            <div className="mt-6 flex gap-1.5">
              {Array.from({ length: Math.max(7, streak) }).map(
                (_, index) => (
                  <div
                    key={index}
                    className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm ${
                      index < streak
                        ? "bg-orange-500/15 text-orange-300"
                        : "bg-white/5 text-slate-600"
                    }`}
                  >
                    {index < streak ? "✓" : "·"}
                  </div>
                )
              )}
            </div>
          </div>
        </section>

        {/* Performance Stats */}
        <section className="mt-6">
          <div className="mb-4">
            <p className="text-sm text-slate-500">Performance</p>
            <h2 className="text-xl font-black">Typing Statistics</h2>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            <Stat icon="⚡" label="Best WPM" value={String(bestWpm)} />
            <Stat icon="📈" label="Average WPM" value={String(Math.round(averageWpm))} />
            <Stat icon="🎯" label="Accuracy" value={`${accuracy.toFixed(1)}%`} />
            <Stat icon="📝" label="Tests" value={String(tests)} />
            <Stat icon="⏱️" label="Practice" value={formatPracticeTime(practiceSeconds)} />
            <Stat icon="🏆" label="Achievements" value={String(achievementsCount)} />
          </div>
        </section>

        {/* About */}
        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-[#0D1424] p-6 md:p-8">
            <p className="text-sm text-slate-500">Account</p>

            <h2 className="mt-1 text-xl font-black">
              Personal Information
            </h2>

            <div className="mt-6 space-y-4">
              <InfoRow
                icon="👤"
                label="Full Name"
                value={name}
              />

              <InfoRow
                icon="✉️"
                label="Email"
                value={email}
              />

              <InfoRow
                icon="🌍"
                label="Country"
                value={country}
              />

              <InfoRow
                icon="🏅"
                label="Role"
                value="Typing Apprentice"
              />

              <InfoRow
                icon="📅"
                label="Member Since"
                value={formatMemberSince(memberSince)}
              />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="rounded-3xl border border-white/10 bg-[#0D1424] p-6 md:p-8">
            <p className="text-sm text-slate-500">Quick Actions</p>

            <h2 className="mt-1 text-xl font-black">
              Keep Improving
            </h2>

            <div className="mt-6 space-y-3">
              <ActionCard
                icon="⌨️"
                title="Start Practice"
                description="Improve your typing speed."
                href="/practice"
              />

              <ActionCard
                icon="⚡"
                title="Daily Challenge"
                description="Complete today's challenge."
                href="/daily-challenge"
              />

              <ActionCard
                icon="📚"
                title="Continue Lessons"
                description="Keep learning touch typing."
                href="/lessons"
              />

              <ActionCard
                icon="🏆"
                title="View Leaderboard"
                description="See your global ranking."
                href="/leaderboard"
              />
            </div>
          </div>
        </section>

        {/* Achievements */}
        <section className="mt-8">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <p className="text-sm text-slate-500">Achievements</p>

              <h2 className="text-xl font-black">
                Your Badges
              </h2>
            </div>

            <span className="text-sm text-blue-400">
              {achievementsCount} unlocked
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {achievements.map((achievement) => (
              <Achievement
                key={achievement.title}
                {...achievement}
              />
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="mt-8 rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-7 md:p-10">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div>
              <span className="rounded-full bg-white/15 px-3 py-1 text-xs">
                🚀 Next Goal
              </span>

              <h2 className="mt-4 text-2xl font-black md:text-3xl">
                {nextGoalCompleted
                  ? "100 WPM Goal Completed 🏆"
                  : `Reach ${nextGoal} WPM`}
              </h2>

              <p className="mt-2 max-w-xl text-sm text-blue-100">
                {nextGoalCompleted
                  ? `Amazing! Your best speed is ${bestWpm} WPM.`
                  : `You're currently at ${bestWpm} WPM. You need ${nextGoalRemaining} more WPM to reach your next milestone.`}
              </p>
            </div>

            <Link
              href="/practice"
              className="rounded-xl bg-white px-6 py-3 font-bold text-blue-700 transition hover:scale-105"
            >
              Start Practice →
            </Link>
          </div>
        </section>

        <footer className="mt-8 border-t border-white/10 py-6 text-center text-sm text-slate-500">
          Keep improving every day. Your progress is your achievement. 🚀
        </footer>
      </div>
    </main>
  );
}

function formatMemberSince(value: string) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

function formatPracticeTime(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours === 0) {
    return `${minutes}m`;
  }

  return `${hours}h ${minutes}m`;
}

function MiniProfileStat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/15 bg-black/20 px-4 py-3 text-center backdrop-blur">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-white/70">
        {label}
      </p>

      <p className="mt-1 text-lg font-black text-white">{value}</p>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm text-slate-400">
        {label}
      </label>

      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-white/10 bg-[#080D18] px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
      />
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0D1424] p-5">
      <div className="text-xl">{icon}</div>

      <p className="mt-3 text-xs text-slate-500">{label}</p>

      <p className="mt-1 text-2xl font-black">{value}</p>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl bg-white/5 p-4">
      <div className="flex items-center gap-3">
        <span>{icon}</span>

        <span className="text-sm text-slate-500">{label}</span>
      </div>

      <span className="text-right text-sm font-semibold">
        {value}
      </span>
    </div>
  );
}

function ActionCard({
  icon,
  title,
  description,
  href,
}: {
  icon: string;
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="flex w-full items-center gap-4 rounded-2xl border border-white/10 bg-[#080D18] p-4 text-left transition hover:border-blue-500/30 hover:bg-white/[0.03]"
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-xl">
        {icon}
      </div>

      <div>
        <h3 className="text-sm font-bold">{title}</h3>

        <p className="mt-1 text-xs text-slate-500">
          {description}
        </p>
      </div>

      <span className="ml-auto text-slate-500">→</span>
    </Link>
  );
}

function Achievement({
  icon,
  title,
  description,
  status,
  progress = 0,
}: {
  icon: string;
  title: string;
  description: string;
  status: string;
  progress?: number;
}) {
  const completed = status === "Completed";
  const locked = status === "Locked";

  return (
    <div
      className={`rounded-2xl border p-5 ${
        locked
          ? "border-white/5 bg-white/[0.02] opacity-50"
          : completed
          ? "border-emerald-500/15 bg-emerald-500/5"
          : "border-blue-500/15 bg-blue-500/5"
      }`}
    >
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-2xl">
          {icon}
        </div>

        <div className="flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-bold">{title}</h3>

              <p className="mt-1 text-xs text-slate-500">
                {description}
              </p>
            </div>

            <span
              className={`text-xs ${
                completed
                  ? "text-emerald-400"
                  : locked
                  ? "text-slate-500"
                  : "text-blue-400"
              }`}
            >
              {completed ? "✓" : locked ? "🔒" : "◔"}
            </span>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span>{status}</span>

              {status === "Progress" && (
                <span className="text-blue-400">{progress}%</span>
              )}
            </div>

            {status !== "Locked" && (
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/5">
                <div
                  className={`h-full rounded-full ${
                    status === "Completed"
                      ? "bg-emerald-500"
                      : "bg-blue-500"
                  }`}
                  style={{
                    width: `${Math.min(Math.max(progress, 0), 100)}%`,
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}