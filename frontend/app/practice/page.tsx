"use client";

import { useEffect, useMemo, useState } from "react";

const TEXT =
  "The ability to type quickly and accurately helps you communicate better and work more efficiently every day.";

const KEYBOARD_ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["Z", "X", "C", "V", "B", "N", "M"],
];

export default function Practice() {
  const [input, setInput] = useState("");
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);

  const correctCharacters = useMemo(() => {
    let correct = 0;

    for (let i = 0; i < input.length; i++) {
      if (input[i] === TEXT[i]) {
        correct++;
      }
    }

    return correct;
  }, [input]);

  const errors = useMemo(() => {
    let wrong = 0;

    for (let i = 0; i < input.length; i++) {
      if (input[i] !== TEXT[i]) {
        wrong++;
      }
    }

    return wrong;
  }, [input]);

  const accuracy =
    input.length > 0
      ? Math.round((correctCharacters / input.length) * 100)
      : 100;

  const elapsedSeconds = 60 - timeLeft;

  const wpm =
    elapsedSeconds > 0
      ? Math.round((correctCharacters / 5 / elapsedSeconds) * 60)
      : 0;

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

  const handleInput = (value: string) => {
    if (finished) return;

    if (!started) {
      setStarted(true);
    }

    setInput(value);

    if (value.length >= TEXT.length) {
      setFinished(true);
    }
  };

  const restart = () => {
    setInput("");
    setStarted(false);
    setFinished(false);
    setTimeLeft(60);
  };

  const currentCharacter = TEXT[input.length];

  return (
    <main className="min-h-screen bg-[#070B14] px-4 py-6 text-white md:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-sm text-slate-400">TypeMaster</p>
            <h1 className="text-3xl font-bold">Typing Practice</h1>
          </div>

          <button
            onClick={restart}
            className="rounded-xl bg-white/10 px-5 py-3 text-sm font-semibold transition hover:bg-white/15"
          >
            ↻ Restart
          </button>
        </div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard
            label="Time"
            value={`${timeLeft}s`}
            icon="⏱️"
          />

          <StatCard
            label="WPM"
            value={wpm.toString()}
            icon="⚡"
          />

          <StatCard
            label="Accuracy"
            value={`${accuracy}%`}
            icon="🎯"
          />

          <StatCard
            label="Errors"
            value={errors.toString()}
            icon="❌"
          />
        </div>

        {/* Typing Area */}
        <section className="mt-6 rounded-3xl border border-white/10 bg-[#0D1424] p-5 shadow-2xl md:p-8">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">60 Second Practice</p>
              <h2 className="text-xl font-bold">Type the text below</h2>
            </div>

            {started && !finished && (
              <span className="rounded-full bg-blue-500/10 px-4 py-2 text-sm text-blue-400">
                Typing...
              </span>
            )}

            {finished && (
              <span className="rounded-full bg-emerald-500/10 px-4 py-2 text-sm text-emerald-400">
                Completed
              </span>
            )}
          </div>

          {/* Text */}
          <div className="rounded-2xl bg-[#080D18] p-6 text-xl leading-10 tracking-wide md:p-8 md:text-2xl">
            {TEXT.split("").map((character, index) => {
              const typedCharacter = input[index];

              let className = "text-slate-500";

              if (typedCharacter !== undefined) {
                if (typedCharacter === character) {
                  className = "text-emerald-400";
                } else {
                  className = "rounded bg-red-500/20 text-red-400";
                }
              } else if (index === input.length) {
                className =
                  "rounded border-b-2 border-blue-400 text-white";
              }

              return (
                <span key={`${character}-${index}`} className={className}>
                  {character}
                </span>
              );
            })}
          </div>

          {/* Input */}
          <textarea
            value={input}
            onChange={(event) => handleInput(event.target.value)}
            disabled={finished}
            autoFocus
            spellCheck={false}
            placeholder={
              finished
                ? "Practice completed. Press Restart to try again."
                : "Start typing here..."
            }
            className="mt-5 min-h-32 w-full resize-none rounded-2xl border border-white/10 bg-[#080D18] p-5 text-lg text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500"
          />

          {/* Current character */}
          <div className="mt-5 flex items-center justify-center">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-8 py-4 text-center">
              <p className="text-xs uppercase tracking-widest text-slate-500">
                Current Key
              </p>

              <p className="mt-1 text-3xl font-black text-blue-400">
                {currentCharacter === " " ? "SPACE" : currentCharacter || "—"}
              </p>
            </div>
          </div>
        </section>

        {/* Keyboard */}
        <section className="mt-6 rounded-3xl border border-white/10 bg-[#0D1424] p-5 md:p-8">
          <div className="mb-5">
            <p className="text-sm text-slate-400">Keyboard</p>
            <h2 className="text-xl font-bold">Virtual Keyboard</h2>
          </div>

          <div className="space-y-2">
            {KEYBOARD_ROWS.map((row, rowIndex) => (
              <div
                key={rowIndex}
                className="flex justify-center gap-1.5 md:gap-2"
              >
                {row.map((key) => {
                  const active =
                    currentCharacter?.toUpperCase() === key;

                  return (
                    <div
                      key={key}
                      className={`flex h-11 w-8 items-center justify-center rounded-lg border text-xs font-bold transition md:h-14 md:w-14 md:text-sm ${
                        active
                          ? "border-blue-400 bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                          : "border-white/10 bg-[#080D18] text-slate-400"
                      }`}
                    >
                      {key}
                    </div>
                  );
                })}
              </div>
            ))}

            <div className="flex justify-center pt-1">
              <div
                className={`flex h-11 w-48 items-center justify-center rounded-lg border text-xs font-bold md:h-14 md:w-80 md:text-sm ${
                  currentCharacter === " "
                    ? "border-blue-400 bg-blue-600 text-white"
                    : "border-white/10 bg-[#080D18] text-slate-400"
                }`}
              >
                SPACE
              </div>
            </div>
          </div>
        </section>

        {/* Result */}
        {finished && (
          <section className="mt-6 rounded-3xl border border-blue-500/20 bg-gradient-to-br from-blue-600/15 to-purple-600/15 p-6 text-center md:p-8">
            <p className="text-sm text-slate-400">Practice Complete</p>

            <h2 className="mt-2 text-3xl font-black">
              Great Job! 🎉
            </h2>

            <div className="mt-6 grid grid-cols-3 gap-3">
              <ResultItem label="WPM" value={wpm} />
              <ResultItem label="Accuracy" value={`${accuracy}%`} />
              <ResultItem label="Errors" value={errors} />
            </div>

            <button
              onClick={restart}
              className="mt-6 rounded-xl bg-blue-600 px-7 py-3 font-bold transition hover:bg-blue-500"
            >
              Try Again
            </button>
          </section>
        )}
      </div>
    </main>
  );
}

function StatCard({
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
      <p className="mt-3 text-sm text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-black">{value}</p>
    </div>
  );
}

function ResultItem({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-2xl bg-[#0D1424] p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-black">{value}</p>
    </div>
  );
}