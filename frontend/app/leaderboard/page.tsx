"use client";

import { useEffect, useMemo, useState } from "react";

type Player = {
  rank: number;
  id: string;
  name: string;
  country: string;
  wpm: number;
  accuracy: number;
  streak: number;
  xp: number;
  avatar: string;
};

type LeaderboardResponse = {
  success: boolean;
  players: Player[];
  stats: {
    players: number;
    topWpm: number;
    topAccuracy: number;
    longestStreak: number;
  };
  yourPosition: {
    rank: number;
    wpm: number;
    nextRank: number | null;
    wpmToNextRank: number;
  } | null;
};

const periods = ["Daily", "Weekly", "Monthly", "All Time"];
const API_URL = "http://localhost:5000";

export default function Leaderboard() {
  const [period, setPeriod] = useState("Daily");
  const [search, setSearch] = useState("");
  const [players, setPlayers] = useState<Player[]>([]);
  const [stats, setStats] = useState({
    players: 0,
    topWpm: 0,
    topAccuracy: 0,
    longestStreak: 0,
  });
  const [yourPosition, setYourPosition] = useState<LeaderboardResponse["yourPosition"]>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadLeaderboard(selectedPeriod: string) {
    const token = localStorage.getItem("typemaster_token");
    if (!token) {
      setError("Please login to view the leaderboard.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/leaderboard?period=${encodeURIComponent(selectedPeriod)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data: LeaderboardResponse = await response.json();

      if (!response.ok) {
        setError((data as unknown as { message?: string }).message || "Unable to load leaderboard.");
        return;
      }

      setPlayers(data.players || []);
      setStats(data.stats);
      setYourPosition(data.yourPosition ?? null);
    } catch {
      setError("Cannot connect to the leaderboard API.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLeaderboard(period);
  }, [period]);

  const filteredPlayers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return players;

    return players.filter((player) =>
      `${player.name} ${player.country}`.toLowerCase().includes(query)
    );
  }, [players, search]);

  const topThree = players.slice(0, 3);

  return (
    <main className="min-h-screen bg-[#070B14] px-4 py-6 text-white md:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <header className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-sm text-slate-400">TypeMaster</p>

            <h1 className="mt-1 text-3xl font-black md:text-4xl">
              Leaderboard 🏆
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              See how your typing speed compares with typists around
              the world.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#0D1424] px-5 py-4">
            <p className="text-xs text-slate-500">Your Rank</p>

            <div className="mt-1 flex items-end gap-2">
              <span className="text-3xl font-black">#{yourPosition?.rank ?? "—"}</span>
              <span className="pb-1 text-sm text-emerald-400">
                {yourPosition?.nextRank ? "Next rank available" : "Top of leaderboard"}
              </span>
            </div>
          </div>
        </header>

        {error && (
          <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Period Tabs */}
        <section className="mt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            {periods.map((item) => (
              <button
                key={item}
                onClick={() => setPeriod(item)}
                className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition ${
                  period === item
                    ? "bg-blue-600 text-white"
                    : "bg-[#0D1424] text-slate-400 hover:bg-white/10"
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
              🔎
            </span>

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search player..."
              className="w-full rounded-xl border border-white/10 bg-[#0D1424] py-3 pl-11 pr-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500 md:w-64"
            />
          </div>
        </section>

        {/* Podium */}
        {topThree.length > 0 && (
          <section className="mt-8 grid gap-4 md:grid-cols-3">
            {topThree[1] && (
              <PodiumCard
                player={topThree[1]}
                position="2nd"
                gradient="from-slate-500 to-slate-700"
              />
            )}
            {topThree[0] && (
              <PodiumCard
                player={topThree[0]}
                position="1st"
                gradient="from-yellow-500 to-orange-500"
                featured
              />
            )}
            {topThree[2] && (
              <PodiumCard
                player={topThree[2]}
                position="3rd"
                gradient="from-orange-600 to-red-600"
              />
            )}
          </section>
        )}

        {/* Stats */}
        <section className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard
            icon="👥"
            title="Players"
            value={stats.players.toLocaleString()}
          />

          <StatCard
            icon="⚡"
            title="Top WPM"
            value={String(stats.topWpm)}
          />

          <StatCard
            icon="🎯"
            title="Top Accuracy"
            value={`${stats.topAccuracy.toFixed(1)}%`}
          />

          <StatCard
            icon="🔥"
            title="Longest Streak"
            value={`${stats.longestStreak} days`}
          />
        </section>

        {/* Table */}
        <section className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-[#0D1424]">
          <div className="border-b border-white/10 p-5 md:p-6">
            <div className="flex flex-col justify-between gap-2 md:flex-row md:items-center">
              <div>
                <p className="text-sm text-slate-500">{period} Rankings</p>
                <h2 className="text-xl font-black">
                  Global Typists
                </h2>
              </div>

              <span className="rounded-full bg-blue-500/10 px-3 py-1.5 text-xs text-blue-400">
                Updated just now
              </span>
            </div>
          </div>

          {/* Desktop Table */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-6 py-4">Rank</th>
                  <th className="px-6 py-4">Player</th>
                  <th className="px-6 py-4">WPM</th>
                  <th className="px-6 py-4">Accuracy</th>
                  <th className="px-6 py-4">Streak</th>
                  <th className="px-6 py-4">XP</th>
                </tr>
              </thead>

              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                      Loading leaderboard...
                    </td>
                  </tr>
                )}

                {!loading && filteredPlayers.map((player) => (
                  <tr
                    key={player.name}
                    className={`border-b border-white/5 transition ${
                      player.name === "You"
                        ? "bg-blue-600/10"
                        : "hover:bg-white/[0.03]"
                    }`}
                  >
                    <td className="px-6 py-4">
                      <RankBadge rank={player.rank} />
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${
                            player.name === "You"
                              ? "from-blue-500 to-purple-500"
                              : "from-indigo-500 to-cyan-500"
                          } font-bold`}
                        >
                          {player.avatar}
                        </div>

                        <div>
                          <p className="font-semibold">
                            {player.name}
                            {player.name === "You" && (
                              <span className="ml-2 rounded-full bg-blue-500/10 px-2 py-1 text-[10px] text-blue-400">
                                YOU
                              </span>
                            )}
                          </p>

                          <p className="text-xs text-slate-500">
                            {player.country}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="font-bold text-blue-400">
                        {player.wpm}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className="text-emerald-400">
                        {player.accuracy.toFixed(1)}%
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span>🔥 {player.streak}</span>
                    </td>

                    <td className="px-6 py-4 font-semibold">
                      {player.xp.toLocaleString()}
                    </td>
                  </tr>
                ))}

                {filteredPlayers.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-12 text-center text-slate-500"
                    >
                      No players found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="space-y-3 p-4 md:hidden">
            {loading && (
              <div className="py-12 text-center text-slate-500">
                Loading leaderboard...
              </div>
            )}

            {!loading && filteredPlayers.map((player) => (
              <div
                key={player.name}
                className={`rounded-2xl border p-4 ${
                  player.name === "You"
                    ? "border-blue-500/30 bg-blue-600/10"
                    : "border-white/10 bg-[#080D18]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <RankBadge rank={player.rank} />

                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 font-bold">
                      {player.avatar}
                    </div>

                    <div>
                      <p className="font-semibold">
                        {player.name}
                      </p>

                      <p className="text-xs text-slate-500">
                        {player.country}
                      </p>
                    </div>
                  </div>

                  {player.name === "You" && (
                    <span className="rounded-full bg-blue-500/10 px-2 py-1 text-[10px] text-blue-400">
                      YOU
                    </span>
                  )}
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2">
                  <MiniStat label="WPM" value={player.wpm} />
                  <MiniStat
                    label="Accuracy"
                    value={`${player.accuracy.toFixed(1)}%`}
                  />
                  <MiniStat
                    label="Streak"
                    value={`🔥 ${player.streak}`}
                  />
                </div>
              </div>
            ))}

            {filteredPlayers.length === 0 && (
              <div className="py-12 text-center text-slate-500">
                No players found.
              </div>
            )}
          </div>
        </section>

        {/* Your Position */}
        <section className="mt-6 rounded-3xl border border-blue-500/20 bg-gradient-to-r from-blue-600/10 to-purple-600/10 p-6">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
            <div>
              <p className="text-sm text-blue-400">
                Your Current Position
              </p>

              <h2 className="mt-1 text-2xl font-black">
                You're ranked #{yourPosition?.rank ?? "—"}
              </h2>

              <p className="mt-2 text-sm text-slate-400">
                {yourPosition?.nextRank ? `Improve your WPM by ${yourPosition.wpmToNextRank} to move into the top ${yourPosition.nextRank}.` : "You are currently at the top of the leaderboard."}
              </p>
            </div>

            <div className="flex gap-3">
              <div className="rounded-2xl bg-[#0D1424] px-5 py-4 text-center">
                <p className="text-xs text-slate-500">Your WPM</p>
                <p className="mt-1 text-2xl font-black text-blue-400">
                  {yourPosition?.wpm ?? 0}
                </p>
              </div>

              <div className="rounded-2xl bg-[#0D1424] px-5 py-4 text-center">
                <p className="text-xs text-slate-500">Next Rank</p>
                <p className="mt-1 text-2xl font-black">{yourPosition?.nextRank ? `#${yourPosition.nextRank}` : "—"}</p>
              </div>
            </div>
          </div>
        </section>

        <footer className="mt-8 border-t border-white/10 py-6 text-center text-sm text-slate-500">
          Keep practicing and climb the leaderboard. 🏆
        </footer>
      </div>
    </main>
  );
}

function PodiumCard({
  player,
  position,
  gradient,
  featured = false,
}: {
  player: Player;
  position: string;
  gradient: string;
  featured?: boolean;
}) {
  return (
    <div
      className={`rounded-3xl border p-6 text-center ${
        featured
          ? "border-yellow-500/30 bg-yellow-500/5 md:-translate-y-3"
          : "border-white/10 bg-[#0D1424]"
      }`}
    >
      <div
        className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br ${gradient} text-3xl font-black shadow-xl`}
      >
        {player.avatar}
      </div>

      <div className="mt-4 text-sm text-slate-500">
        {position === "1st" ? "🥇" : position === "2nd" ? "🥈" : "🥉"}{" "}
        {position}
      </div>

      <h3 className="mt-1 text-xl font-black">{player.name}</h3>

      <p className="mt-1 text-xs text-slate-500">
        {player.country}
      </p>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-white/5 p-3">
          <p className="text-xs text-slate-500">WPM</p>
          <p className="mt-1 text-xl font-black text-blue-400">
            {player.wpm}
          </p>
        </div>

        <div className="rounded-xl bg-white/5 p-3">
          <p className="text-xs text-slate-500">Accuracy</p>
          <p className="mt-1 text-xl font-black text-emerald-400">
            {player.accuracy.toFixed(1)}%
          </p>
        </div>
      </div>
    </div>
  );
}

function RankBadge({ rank }: { rank: number }) {
  const medals: Record<number, string> = {
    1: "🥇",
    2: "🥈",
    3: "🥉",
  };

  return (
    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-sm font-bold">
      {medals[rank] || `#${rank}`}
    </div>
  );
}

function StatCard({
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

      <p className="mt-1 text-2xl font-black">{value}</p>
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