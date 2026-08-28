"use client";

import { useState } from "react";
import Link from "next/link";

export default function Home() {
  const [darkMode, setDarkMode] = useState(true);

  const theme = darkMode
    ? {
        page: "bg-[#070B14] text-white",
        sidebar: "border-white/10 bg-[#0B1020]",
        card: "border-white/10 bg-[#0D1424]",
        input: "bg-[#080D18]",
        hover: "hover:bg-white/5",
        muted: "text-slate-400",
        soft: "text-slate-500",
      }
    : {
        page: "bg-slate-100 text-slate-900",
        sidebar: "border-slate-200 bg-white",
        card: "border-slate-200 bg-white",
        input: "bg-slate-50",
        hover: "hover:bg-slate-100",
        muted: "text-slate-500",
        soft: "text-slate-500",
      };

  return (
    <main className={`min-h-screen ${theme.page}`}>
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside
          className={`hidden w-64 border-r p-5 md:block ${theme.sidebar}`}
        >
          <div className="mb-10 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-xl">
              ⌨
            </div>

            <div>
              <h1 className="text-xl font-bold">TypeMaster</h1>
              <p className="text-xs text-slate-400">Typing Platform</p>
            </div>
          </div>

          <nav className="space-y-2">
            <Link
              href="/"
              className="flex w-full items-center gap-3 rounded-xl bg-blue-600 px-4 py-3 text-left text-white transition hover:bg-blue-500"
            >
              <span>⌂</span>
              Home
            </Link>

            <Link
              href="/practice"
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 transition ${theme.muted} ${theme.hover}`}
            >
              <span>⌨</span>
              Practice
            </Link>

            <Link
              href="/typing-test"
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 transition ${theme.muted} ${theme.hover}`}
            >
              <span>◉</span>
              Typing Test
            </Link>

            <Link
              href="/lessons"
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 transition ${theme.muted} ${theme.hover}`}
            >
              <span>▣</span>
              Lessons
            </Link>

            <Link
              href="/daily-challenge"
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 transition ${theme.muted} ${theme.hover}`}
            >
              <span>⚡</span>
              Daily Challenge
            </Link>

            <Link
              href="/leaderboard"
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 transition ${theme.muted} ${theme.hover}`}
            >
              <span>🏆</span>
              Leaderboard
            </Link>

            <Link
              href="/progress"
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 transition ${theme.muted} ${theme.hover}`}
            >
              <span>◒</span>
              Progress
            </Link>

            <Link
              href="/profile"
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 transition ${theme.muted} ${theme.hover}`}
            >
              <span>♙</span>
              Profile
            </Link>

            <Link
              href="/settings"
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 transition ${theme.muted} ${theme.hover}`}
            >
              <span>⚙</span>
              Settings
            </Link>
          </nav>

          <div className="mt-10 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 p-4">
            <p className="text-sm text-blue-100">Current Level</p>

            <div className="mt-1 flex items-end justify-between">
              <h2 className="text-2xl font-bold">Level 8</h2>
              <span className="text-sm">2,450 XP</span>
            </div>

            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/20">
              <div className="h-full w-[72%] rounded-full bg-white" />
            </div>

            <p className="mt-2 text-xs text-blue-100">
              550 XP to Level 9
            </p>
          </div>
        </aside>

        {/* Main */}
        <section className="flex-1">
          {/* Header */}
          <header
            className={`flex items-center justify-between border-b px-5 py-4 md:px-8 ${
              darkMode ? "border-white/10" : "border-slate-200"
            }`}
          >
            <div>
              <p className="text-sm text-slate-400">
                Wednesday, August 19
              </p>

              <h2 className="text-xl font-bold">
                Good evening 👋
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`rounded-xl px-4 py-2 text-sm transition ${
                  darkMode
                    ? "bg-white/10 hover:bg-white/15"
                    : "bg-white shadow-sm hover:bg-slate-50"
                }`}
              >
                {darkMode ? "☀ Light" : "🌙 Dark"}
              </button>

              <Link
                href="/profile"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-bold transition hover:bg-blue-500"
              >
                N
              </Link>
            </div>
          </header>

          <div className="mx-auto max-w-7xl space-y-6 p-5 md:p-8">
            {/* Hero */}
            <div className="overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-7 md:p-10">
              <div className="max-w-2xl">
                <span className="rounded-full bg-white/15 px-3 py-1 text-sm">
                  🔥 7 Day Streak
                </span>

                <h1 className="mt-5 text-3xl font-black md:text-5xl">
                  Improve your typing speed.
                </h1>

                <p className="mt-4 text-blue-100 md:text-lg">
                  Practice daily, improve your accuracy, and become a
                  faster and more confident typist.
                </p>

                <Link
                  href="/typing-test"
                  className="mt-6 inline-block rounded-xl bg-white px-6 py-3 font-bold text-blue-700 shadow-lg transition hover:scale-105"
                >
                  Start Typing Now →
                </Link>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {[
                ["⚡", "Best WPM", "78"],
                ["🎯", "Accuracy", "95.4%"],
                ["⏱", "Practice Time", "24h 30m"],
                ["✓", "Tests Completed", "156"],
              ].map(([icon, title, value]) => (
                <div
                  key={title}
                  className={`rounded-2xl border p-5 ${theme.card}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xl">{icon}</span>

                    <span className="text-xs text-emerald-400">
                      +12%
                    </span>
                  </div>

                  <p className="mt-4 text-sm text-slate-400">
                    {title}
                  </p>

                  <h3 className="mt-1 text-2xl font-bold">
                    {value}
                  </h3>
                </div>
              ))}
            </div>

            {/* Practice + Challenge */}
            <div className="grid gap-6 lg:grid-cols-3">
              <div
                className={`rounded-2xl border p-6 lg:col-span-2 ${theme.card}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">
                      Quick Practice
                    </p>

                    <h2 className="mt-1 text-2xl font-bold">
                      Ready to type?
                    </h2>
                  </div>

                  <span className="rounded-lg bg-blue-500/10 px-3 py-2 text-sm text-blue-400">
                    60 Seconds
                  </span>
                </div>

                <div
                  className={`mt-5 rounded-xl p-5 text-lg leading-8 ${theme.input}`}
                >
                  The ability to type quickly and accurately helps
                  you communicate better and work more efficiently.
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <Link
                    href="/practice"
                    className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-500"
                  >
                    Start Practice
                  </Link>

                  <button
                    className={`rounded-xl px-5 py-3 font-semibold ${
                      darkMode
                        ? "bg-white/10 hover:bg-white/15"
                        : "bg-slate-100 hover:bg-slate-200"
                    }`}
                  >
                    Custom Text
                  </button>
                </div>
              </div>

              <div className="rounded-2xl bg-gradient-to-br from-orange-500 to-pink-600 p-6">
                <p className="text-sm text-orange-100">
                  Today's Challenge
                </p>

                <h2 className="mt-2 text-2xl font-bold">
                  Reach 70 WPM
                </h2>

                <p className="mt-3 text-sm text-orange-100">
                  Complete today's challenge and earn 50 XP.
                </p>

                <div className="mt-6 h-2 rounded-full bg-white/20">
                  <div className="h-full w-[68%] rounded-full bg-white" />
                </div>

                <p className="mt-2 text-xs text-orange-100">
                  68% completed
                </p>

                <Link
                  href="/daily-challenge"
                  className="mt-6 block w-full rounded-xl bg-white py-3 text-center font-bold text-orange-600 transition hover:bg-orange-50"
                >
                  Continue Challenge
                </Link>
              </div>
            </div>

            {/* Bottom section */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Performance */}
              <div
                className={`rounded-2xl border p-6 ${theme.card}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">
                      Performance
                    </p>

                    <h2 className="text-xl font-bold">
                      WPM Progress
                    </h2>
                  </div>

                  <span className="text-sm text-emerald-400">
                    +18.4%
                  </span>
                </div>

                <div className="mt-8 flex h-44 items-end gap-3">
                  {[35, 45, 42, 58, 52, 65, 60, 72, 78].map(
                    (height, index) => (
                      <div
                        key={index}
                        className="flex flex-1 flex-col items-center justify-end gap-2"
                      >
                        <div
                          className="w-full rounded-t-lg bg-blue-500 transition hover:bg-blue-400"
                          style={{
                            height: `${height * 2}px`,
                          }}
                        />

                        <span className="text-xs text-slate-500">
                          {index + 1}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Leaderboard */}
              <div
                className={`rounded-2xl border p-6 ${theme.card}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">
                      Global Ranking
                    </p>

                    <h2 className="text-xl font-bold">
                      Leaderboard
                    </h2>
                  </div>

                  <Link
                    href="/leaderboard"
                    className="text-sm text-blue-400 transition hover:text-blue-300"
                  >
                    View All →
                  </Link>
                </div>

                <div className="mt-5 space-y-3">
                  {[
                    ["1", "Alex", "112 WPM"],
                    ["2", "Sarah", "106 WPM"],
                    ["3", "Mike", "101 WPM"],
                    ["8", "You", "78 WPM"],
                  ].map(([rank, name, wpm]) => (
                    <div
                      key={name}
                      className={`flex items-center justify-between rounded-xl p-3 ${
                        name === "You"
                          ? "bg-blue-600/15"
                          : darkMode
                          ? "bg-white/5"
                          : "bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-5 text-center font-bold">
                          {rank}
                        </span>

                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-sm font-bold">
                          {name[0]}
                        </div>

                        <span className="font-medium">
                          {name}
                        </span>
                      </div>

                      <span className="text-sm font-semibold text-blue-400">
                        {wpm}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <footer className="border-t border-white/10 pt-6 text-center text-sm text-slate-500">
              © 2026 TypeMaster — Improve your typing every day.
            </footer>
          </div>
        </section>
      </div>
    </main>
  );
}