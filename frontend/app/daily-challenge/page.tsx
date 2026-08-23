"use client";

import { useEffect, useMemo, useState } from "react";
import TypingKeyboard from "../components/TypingKeyboard";

const CHALLENGE_TEXT =
  "Consistency is the key to becoming a faster and more accurate typist. Practice every day and focus on steady improvement.";

const TARGET_WPM = 70;
const TARGET_ACCURACY = 90;
const XP_REWARD = 50;

export default function DailyChallenge() {
  const [input, setInput] = useState("");
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");

  const correct = useMemo(() => {
    let count = 0;

    for (let i = 0; i < input.length; i++) {
      if (input[i] === CHALLENGE_TEXT[i]) {
        count++;
      }
    }

    return count;
  }, [input]);

  const errors = useMemo(() => {
    let count = 0;

    for (let i = 0; i < input.length; i++) {
      if (input[i] !== CHALLENGE_TEXT[i]) {
        count++;
      }
    }

    return count;
  }, [input]);

  const accuracy =
    input.length > 0
      ? Math.round((correct / input.length) * 100)
      : 100;

  const elapsed = 60 - timeLeft;

  const wpm =
    elapsed > 0
      ? Math.round((correct / 5 / elapsed) * 60)
      : 0;

  const progress = Math.min(
    Math.round((wpm / TARGET_WPM) * 100),
    100
  );
  const currentCharacter = CHALLENGE_TEXT[input.length] || "";
  const challengeCompleted =
    wpm >= TARGET_WPM && accuracy >= TARGET_ACCURACY;

  useEffect(() => {
    if (!started || finished || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((current) => {
        if (current <= 1) {
          setFinished(true);
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [started, finished, timeLeft]);

  useEffect(() => {
    if (!finished || saving || saved) return;

    void saveChallengeResult();
  }, [finished, saving, saved]);

  async function saveChallengeResult() {
    const token = localStorage.getItem("typemaster_token");

    if (!token) {
      setSaveError("Please login before completing the daily challenge.");
      return;
    }

    try {
      setSaving(true);
      setSaveError("");

      const response = await fetch(
        "http://localhost:5000/api/daily-challenge/complete",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            durationSeconds: 60,
            wpm,
            accuracy,
            correctCharacters: correct,
            wrongCharacters: errors,
            errors,
            challengeText: CHALLENGE_TEXT,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setSaveError(data.message || "Unable to save challenge result.");
        return;
      }

      setSaved(true);

      if (data.user) {
        localStorage.setItem(
          "typemaster_user",
          JSON.stringify(data.user)
        );
      }
    } catch {
      setSaveError("Cannot connect to the backend.");
    } finally {
      setSaving(false);
    }
  }

  const handleInput = (value: string) => {
    if (finished) return;

    if (!started) {
      setStarted(true);
    }

    setInput(value);

    if (value.length >= CHALLENGE_TEXT.length) {
      setFinished(true);
    }
  };

  const restart = () => {
    setInput("");
    setStarted(false);
    setFinished(false);
    setTimeLeft(60);
    setSaving(false);
    setSaved(false);
    setSaveError("");
  };

  return (
    <main className="min-h-screen bg-[#070B14] px-4 py-6 text-white md:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <header className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div>
            <p className="text-sm text-slate-400">TypeMaster</p>

            <h1 className="mt-1 text-3xl font-black md:text-4xl">
              Daily Challenge ⚡
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Complete today's challenge and earn XP.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-orange-500/10 px-4 py-3 text-sm font-bold text-orange-400">
              🔥 Today's Challenge
            </div>

            <button
              onClick={restart}
              className="rounded-xl bg-white/10 px-4 py-3 text-sm font-semibold hover:bg-white/15"
            >
              ↻ Restart
            </button>
          </div>
        </header>

        {/* Challenge Hero */}
        <section className="mt-8 overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 via-pink-600 to-purple-700 p-7 md:p-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_320px] lg:items-center">
            <div>
              <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
                TODAY'S CHALLENGE
              </span>

              <h2 className="mt-5 text-4xl font-black md:text-5xl">
                Reach 70 WPM
              </h2>

              <p className="mt-4 max-w-xl text-sm leading-7 text-white/80 md:text-base">
                Type the challenge text for 60 seconds. Reach at
                least 70 WPM with 90% accuracy to complete today's
                challenge.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <GoalBadge
                  icon="⚡"
                  label="Target"
                  value={`${TARGET_WPM} WPM`}
                />

                <GoalBadge
                  icon="🎯"
                  label="Accuracy"
                  value={`${TARGET_ACCURACY}%`}
                />

                <GoalBadge
                  icon="⭐"
                  label="Reward"
                  value={`${XP_REWARD} XP`}
                />
              </div>
            </div>

            {/* Timer */}
            <div className="rounded-3xl bg-black/20 p-7 text-center backdrop-blur">
              <p className="text-xs uppercase tracking-widest text-white/60">
                Time Remaining
              </p>

              <p className="mt-2 text-6xl font-black">
                {timeLeft}
              </p>

              <p className="text-sm text-white/60">seconds</p>

              <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/20">
                <div
                  className="h-full rounded-full bg-white transition-all"
                  style={{
                    width: `${((60 - timeLeft) / 60) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Goals */}
        <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <GoalCard
            icon="⚡"
            title="Speed Goal"
            current={`${wpm} WPM`}
            target={`${TARGET_WPM} WPM`}
            percentage={Math.min((wpm / TARGET_WPM) * 100, 100)}
          />

          <GoalCard
            icon="🎯"
            title="Accuracy Goal"
            current={`${accuracy}%`}
            target={`${TARGET_ACCURACY}%`}
            percentage={Math.min(
              (accuracy / TARGET_ACCURACY) * 100,
              100
            )}
          />

          <GoalCard
            icon="⭐"
            title="XP Reward"
            current={challengeCompleted ? `+${XP_REWARD} XP` : "Locked"}
            target={`${XP_REWARD} XP`}
            percentage={challengeCompleted ? 100 : 0}
          />
        </section>

        {/* Stats */}
        <section className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          <Stat label="WPM" value={wpm.toString()} icon="⚡" />
          <Stat
            label="Accuracy"
            value={`${accuracy}%`}
            icon="🎯"
          />
          <Stat
            label="Correct"
            value={correct.toString()}
            icon="✓"
          />
          <Stat
            label="Errors"
            value={errors.toString()}
            icon="❌"
          />
        </section>

        {/* Typing Area */}
        <section className="mt-6 rounded-3xl border border-white/10 bg-[#0D1424] p-5 md:p-8">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <p className="text-sm text-slate-400">
                Daily Challenge Text
              </p>

              <h2 className="mt-1 text-xl font-bold">
                Type carefully and stay consistent
              </h2>
            </div>

            {!started && !finished && (
              <button
                onClick={() => setStarted(true)}
                className="rounded-xl bg-orange-500 px-6 py-3 font-bold text-white transition hover:bg-orange-400"
              >
                Start Challenge →
              </button>
            )}

            {started && !finished && (
              <span className="rounded-full bg-orange-500/10 px-4 py-2 text-sm text-orange-400">
                Challenge Running
              </span>
            )}

            {finished && (
              <span
                className={`rounded-full px-4 py-2 text-sm ${
                  challengeCompleted
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "bg-red-500/10 text-red-400"
                }`}
              >
                {challengeCompleted
                  ? "Challenge Completed"
                  : "Challenge Finished"}
              </span>
            )}
          </div>

          {/* Text */}
          <div className="mt-6 rounded-2xl bg-[#080D18] p-6 text-xl leading-10 tracking-wide md:p-8 md:text-2xl">
            {CHALLENGE_TEXT.split("").map((character, index) => {
              const typedCharacter = input[index];

              let className = "text-slate-500";

              if (typedCharacter !== undefined) {
                className =
                  typedCharacter === character
                    ? "text-emerald-400"
                    : "rounded bg-red-500/20 text-red-400";
              } else if (index === input.length) {
                className =
                  "rounded border-b-2 border-orange-400 text-white";
              }

              return (
                <span key={`${character}-${index}`} className={className}>
                  {character}
                </span>
              );
            })}
          </div>
          <TypingKeyboard nextKey={currentCharacter} />
          <textarea
            value={input}
            onChange={(event) => handleInput(event.target.value)}
            disabled={finished}
            autoFocus
            spellCheck={false}
            placeholder={
              finished
                ? "Challenge finished. Press Restart to try again."
                : "Start typing here..."
            }
            className="mt-5 min-h-36 w-full resize-none rounded-2xl border border-white/10 bg-[#080D18] p-5 text-lg text-white outline-none placeholder:text-slate-600 focus:border-orange-500"
          />

          <div className="mt-5">
            <div className="mb-2 flex justify-between text-xs text-slate-500">
              <span>Challenge Progress</span>
              <span>{progress}%</span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-white/5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-orange-500 to-pink-500 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </section>

        {/* Result */}
        {finished && (
          <section
            className={`mt-6 rounded-3xl border p-7 text-center md:p-10 ${
              challengeCompleted
                ? "border-emerald-500/20 bg-emerald-500/5"
                : "border-orange-500/20 bg-orange-500/5"
            }`}
          >
            <div className="text-5xl">
              {challengeCompleted ? "🏆" : "💪"}
            </div>

            <h2 className="mt-4 text-3xl font-black">
              {challengeCompleted
                ? "Challenge Complete!"
                : "Good Attempt!"}
            </h2>

            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-400">
              {challengeCompleted
                ? `Amazing! You reached the target and earned ${XP_REWARD} XP.`
                : `You didn't reach both targets this time. Keep practicing and try again.`}
            </p>

            {saving && (
              <p className="mt-5 text-sm text-blue-400">
                Saving your challenge result...
              </p>
            )}

            {saved && (
              <p className="mt-5 text-sm text-emerald-400">
                ✓ Challenge result saved. XP and profile updated.
              </p>
            )}

            {saveError && (
              <p className="mt-5 text-sm text-red-400">
                {saveError}
              </p>
            )}

            <div className="mx-auto mt-7 grid max-w-2xl grid-cols-3 gap-3">
              <Result
                label="WPM"
                value={wpm}
              />

              <Result
                label="Accuracy"
                value={`${accuracy}%`}
              />

              <Result
                label="XP"
                value={challengeCompleted ? `+${XP_REWARD}` : "0"}
              />
            </div>

            <button
              onClick={restart}
              className="mt-7 rounded-xl bg-orange-500 px-7 py-3 font-bold hover:bg-orange-400"
            >
              Try Again
            </button>
          </section>
        )}

        {/* Rules */}
        <section className="mt-6 grid gap-4 md:grid-cols-3">
          <Info
            icon="🎯"
            title="Reach the Target"
            text="Get at least 70 WPM and maintain 90% accuracy."
          />

          <Info
            icon="🔥"
            title="Keep Your Streak"
            text="Complete your daily challenge regularly to maintain your streak."
          />

          <Info
            icon="⭐"
            title="Earn XP"
            text="Complete the challenge to earn 50 XP and progress faster."
          />
        </section>

        <footer className="mt-8 border-t border-white/10 py-6 text-center text-sm text-slate-500">
          A new typing challenge is waiting every day.
        </footer>
      </div>
    </main>
  );
}

function GoalBadge({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-white/10 px-4 py-3">
      <div className="text-xs text-white/60">
        {icon} {label}
      </div>
      <div className="mt-1 font-bold">{value}</div>
    </div>
  );
}

function GoalCard({
  icon,
  title,
  current,
  target,
  percentage,
}: {
  icon: string;
  title: string;
  current: string;
  target: string;
  percentage: number;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0D1424] p-5">
      <div className="flex items-center justify-between">
        <span className="text-xl">{icon}</span>

        <span className="text-xs text-slate-500">
          Goal: {target}
        </span>
      </div>

      <p className="mt-4 text-sm text-slate-400">{title}</p>

      <div className="mt-1 text-2xl font-black">{current}</div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/5">
        <div
          className="h-full rounded-full bg-blue-600 transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0D1424] p-5">
      <div className="text-xl">{icon}</div>

      <p className="mt-3 text-xs text-slate-500">{label}</p>

      <p className="mt-1 text-2xl font-black">{value}</p>
    </div>
  );
}

function Result({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-2xl bg-[#0D1424] p-5">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-black">{value}</p>
    </div>
  );
}

function Info({
  icon,
  title,
  text,
}: {
  icon: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0D1424] p-5">
      <div className="text-2xl">{icon}</div>

      <h3 className="mt-3 font-bold">{title}</h3>

      <p className="mt-1 text-sm leading-6 text-slate-400">
        {text}
      </p>
    </div>
  );
}