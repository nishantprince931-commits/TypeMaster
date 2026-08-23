"use client";

import { useEffect, useMemo, useState } from "react";
import TypingKeyboard from "../components/TypingKeyboard";

const TEXTS = [
  "Practice makes progress. Type every day and focus on accuracy before speed.",
  "Fast and accurate typing can help you work more efficiently and communicate better.",
  "The best way to improve your typing skills is to practice consistently every day.",
];

const DURATIONS = [15, 30, 60, 120];

const API_URL = "http://localhost:5000";

export default function TypingTest() {
  const [duration, setDuration] = useState(60);
  const [text, setText] = useState(TEXTS[0]);
  const [input, setInput] = useState("");
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");

  const correctCharacters = useMemo(() => {
    let correct = 0;

    for (let i = 0; i < input.length; i++) {
      if (input[i] === text[i]) {
        correct++;
      }
    }

    return correct;
  }, [input, text]);

  const errors = useMemo(() => {
    let wrong = 0;

    for (let i = 0; i < input.length; i++) {
      if (input[i] !== text[i]) {
        wrong++;
      }
    }

    return wrong;
  }, [input, text]);

  const accuracy =
    input.length > 0
      ? Math.round((correctCharacters / input.length) * 100)
      : 100;

  const elapsedSeconds = duration - timeLeft;
  const currentCharacter = text[input.length] || "";

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

  useEffect(() => {
    if (!finished || saving || saved) return;

    saveResult();
  }, [finished]);

  const saveResult = async () => {
    const token = localStorage.getItem("typemaster_token");

    if (!token) {
      setSaveError("Please login before taking a typing test.");
      return;
    }

    try {
      setSaving(true);
      setSaveError("");

      const response = await fetch(`${API_URL}/api/tests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          testType: "typing-test",
          durationSeconds: duration,
          wpm,
          accuracy,
          correctCharacters,
          wrongCharacters: errors,
          errors,
          practiceSeconds: duration - timeLeft,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setSaveError(
          data.message || "Unable to save test result."
        );
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
      setSaveError(
        "Could not connect to the backend. Make sure it is running."
      );
    } finally {
      setSaving(false);
    }
  };

  const startTest = () => {
    setStarted(true);
  };

  const handleInput = (value: string) => {
    if (finished) return;

    if (!started) {
      setStarted(true);
    }

    setInput(value);

    if (value.length >= text.length) {
      setFinished(true);
    }
  };

  const restart = () => {
    const randomText =
      TEXTS[Math.floor(Math.random() * TEXTS.length)];

    setText(randomText);
    setInput("");
    setStarted(false);
    setFinished(false);
    setTimeLeft(duration);
    setSaving(false);
    setSaved(false);
    setSaveError("");
  };

  const changeDuration = (newDuration: number) => {
    if (started) return;

    setDuration(newDuration);
    setTimeLeft(newDuration);
  };

  return (
    <main className="min-h-screen bg-[#070B14] px-4 py-6 text-white md:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-sm text-slate-400">TypeMaster</p>
            <h1 className="text-3xl font-black">Typing Test</h1>
          </div>

          <button
            onClick={restart}
            className="rounded-xl bg-white/10 px-5 py-3 text-sm font-semibold transition hover:bg-white/15"
          >
            ↻ Restart
          </button>
        </div>

        <section className="mt-6 rounded-2xl border border-white/10 bg-[#0D1424] p-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="mr-2 text-sm text-slate-400">
              Test Duration
            </span>

            {DURATIONS.map((item) => (
              <button
                key={item}
                disabled={started}
                onClick={() => changeDuration(item)}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  duration === item
                    ? "bg-blue-600 text-white"
                    : "bg-white/5 text-slate-300 hover:bg-white/10"
                } ${
                  started
                    ? "cursor-not-allowed opacity-50"
                    : ""
                }`}
              >
                {item}s
              </button>
            ))}
          </div>
        </section>

        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-5">
          <Stat label="Time" value={`${timeLeft}s`} />
          <Stat label="WPM" value={wpm.toString()} />
          <Stat
            label="Accuracy"
            value={`${accuracy}%`}
          />
          <Stat
            label="Correct"
            value={correctCharacters.toString()}
          />
          <Stat label="Errors" value={errors.toString()} />
        </div>

        <section className="mt-6 rounded-3xl border border-white/10 bg-[#0D1424] p-5 md:p-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">
                {duration} Second Test
              </p>

              <h2 className="text-xl font-bold">
                Type the text below
              </h2>
            </div>

            {!started && !finished && (
              <button
                onClick={startTest}
                className="rounded-xl bg-blue-600 px-5 py-3 font-bold transition hover:bg-blue-500"
              >
                Start Test
              </button>
            )}

            {started && !finished && (
              <span className="rounded-full bg-blue-500/10 px-4 py-2 text-sm text-blue-400">
                Test Running
              </span>
            )}

            {finished && (
              <span className="rounded-full bg-emerald-500/10 px-4 py-2 text-sm text-emerald-400">
                Completed
              </span>
            )}
          </div>

          <div className="mt-6 rounded-2xl bg-[#080D18] p-6 text-xl leading-10 tracking-wide md:p-8 md:text-2xl">
            {text.split("").map((character, index) => {
              const typedCharacter = input[index];

              let className = "text-slate-500";

              if (typedCharacter !== undefined) {
                className =
                  typedCharacter === character
                    ? "text-emerald-400"
                    : "rounded bg-red-500/20 text-red-400";
              } else if (index === input.length) {
                className =
                  "rounded border-b-2 border-blue-400 text-white";
              }

              return (
                <span
                  key={`${character}-${index}`}
                  className={className}
                >
                  {character}
                </span>
              );
            })}
          </div>
           <TypingKeyboard nextKey={currentCharacter} />
          <textarea
            value={input}
            onChange={(event) =>
              handleInput(event.target.value)
            }
            disabled={finished}
            autoFocus
            spellCheck={false}
            placeholder={
              finished
                ? "Test completed."
                : "Click here and start typing..."
            }
            className="mt-5 min-h-36 w-full resize-none rounded-2xl border border-white/10 bg-[#080D18] p-5 text-lg text-white outline-none placeholder:text-slate-600 focus:border-blue-500"
          />

          <div className="mt-5">
            <div className="mb-2 flex justify-between text-xs text-slate-500">
              <span>Test Progress</span>
              <span>
                {Math.min(input.length, text.length)} /{" "}
                {text.length}
              </span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-white/5">
              <div
                className="h-full rounded-full bg-blue-600 transition-all"
                style={{
                  width: `${Math.min(
                    (input.length / text.length) * 100,
                    100
                  )}%`,
                }}
              />
            </div>
          </div>
        </section>

        {finished && (
          <section className="mt-6 rounded-3xl border border-blue-500/20 bg-gradient-to-br from-blue-600/15 to-purple-600/15 p-6 text-center md:p-8">
            <p className="text-sm text-slate-400">
              Test Complete
            </p>

            <h2 className="mt-2 text-3xl font-black">
              Your Result 🎉
            </h2>

            <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
              <Result label="WPM" value={wpm} />
              <Result
                label="Accuracy"
                value={`${accuracy}%`}
              />
              <Result
                label="Correct"
                value={correctCharacters}
              />
              <Result label="Errors" value={errors} />
            </div>

            {saving && (
              <p className="mt-5 text-sm text-blue-400">
                Saving result...
              </p>
            )}

            {saved && (
              <p className="mt-5 text-sm text-emerald-400">
                ✓ Result saved to your account.
              </p>
            )}

            {saveError && (
              <p className="mt-5 text-sm text-red-400">
                {saveError}
              </p>
            )}

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                onClick={restart}
                className="rounded-xl bg-blue-600 px-6 py-3 font-bold transition hover:bg-blue-500"
              >
                Try Again
              </button>

              <button
                onClick={() => {
                  navigator.clipboard?.writeText(
                    `I typed ${wpm} WPM with ${accuracy}% accuracy on TypeMaster!`
                  );
                }}
                className="rounded-xl bg-white/10 px-6 py-3 font-bold transition hover:bg-white/15"
              >
                📤 Share Result
              </button>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

function Stat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0D1424] p-4">
      <p className="text-xs text-slate-500">{label}</p>
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
      <p className="mt-1 text-3xl font-black">{value}</p>
    </div>
  );
}