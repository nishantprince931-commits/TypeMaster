"use client";
import TypingKeyboard from "../../components/TypingKeyboard";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type Lesson = {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  difficulty: string;
  content: string;
};

const API_URL = "http://localhost:5000";

const LESSONS: Lesson[] = [
  {
    id: 1,
    title: "Home Row",
    subtitle: "ASDF JKL;",
    description: "Learn the foundation of touch typing.",
    difficulty: "Beginner",
    content:
      "asdf jkl; asdf jkl; sad lad fall ask flask; all dads ask; jkl; asdf.",
  },
  {
    id: 2,
    title: "Upper Row",
    subtitle: "QWERTYUIOP",
    description: "Practice the top row of your keyboard.",
    difficulty: "Beginner",
    content:
      "qwerty uiop qwerty uiop quiet type write power upper route.",
  },
  {
    id: 3,
    title: "Lower Row",
    subtitle: "ZXCVBNM",
    description: "Master the lower row keys.",
    difficulty: "Beginner",
    content:
      "zxcv bnm zxcv bnm zoom box vivid minimum maximum.",
  },
  {
    id: 4,
    title: "Numbers",
    subtitle: "1234567890",
    description: "Improve your number typing speed.",
    difficulty: "Intermediate",
    content:
      "12345 67890 12345 67890 2026 1234 5678 9090 2468 1357.",
  },
  {
    id: 5,
    title: "Symbols",
    subtitle: "! @ # $ % &",
    description: "Practice common keyboard symbols.",
    difficulty: "Intermediate",
    content:
      "! @ # $ % & ! @ # $ % & email@test.com #100 $50 %done &more.",
  },
  {
    id: 6,
    title: "Capital Letters",
    subtitle: "SHIFT + Letters",
    description: "Learn to type capital letters naturally.",
    difficulty: "Intermediate",
    content:
      "Type Fast And Stay Accurate. Keep Your Hands Relaxed And Ready.",
  },
  {
    id: 7,
    title: "Words",
    subtitle: "Common Words",
    description: "Build speed using everyday words.",
    difficulty: "Intermediate",
    content:
      "practice keyboard improve speed accuracy focus learn build repeat.",
  },
  {
    id: 8,
    title: "Sentences",
    subtitle: "Full Sentences",
    description: "Practice complete sentences with accuracy.",
    difficulty: "Advanced",
    content:
      "Small improvements every day can turn into strong typing skills over time.",
  },
  {
    id: 9,
    title: "Paragraphs",
    subtitle: "Long Text",
    description: "Train your typing endurance with paragraphs.",
    difficulty: "Advanced",
    content:
      "Consistent practice helps you build rhythm, accuracy, and endurance. Keep your fingers close to the home row, look at the text instead of the keyboard, and focus on smooth movement.",
  },
  {
    id: 10,
    title: "Advanced Speed Training",
    subtitle: "Speed Challenge",
    description: "Push your typing speed to the next level.",
    difficulty: "Expert",
    content:
      "Push your speed while keeping every sentence accurate, smooth, and consistent.",
  },
];

export default function LessonPracticePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const lessonId = Number(params?.id || 0);

  const lesson = LESSONS.find((item) => item.id === lessonId);

  const [input, setInput] = useState("");
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!started || finished) return;

    const timer = window.setInterval(() => {
      setSeconds((value) => value + 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [started, finished]);

  const correct = useMemo(() => {
    if (!lesson) return 0;

    let count = 0;
    for (let i = 0; i < input.length; i += 1) {
      if (input[i] === lesson.content[i]) count += 1;
    }
    return count;
  }, [input, lesson]);

  const errors = input.length - correct;

  const accuracy = input.length
    ? Math.round((correct / input.length) * 100)
    : 100;

  const wpm =
    seconds > 0
      ? Math.round((correct / 5 / seconds) * 60)
      : 0;

  const progress = lesson?.content.length
    ? Math.min(
        100,
        Math.round((input.length / lesson.content.length) * 100)
      )
    : 0;

  if (!lesson) {
    return (
      <main className="min-h-screen bg-[#070B14] p-8 text-white">
        <div className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-[#0D1424] p-8 text-center">
          <h1 className="text-3xl font-black">Lesson not found</h1>
          <Link
            href="/lessons"
            className="mt-6 inline-block rounded-xl bg-blue-600 px-6 py-3 font-bold"
          >
            ← Back to Lessons
          </Link>
        </div>
      </main>
    );
  }

  // At this point TypeScript knows lesson exists.
  const currentLesson = lesson;

  // Character that should be typed next.
  const currentCharacter = currentLesson.content[input.length] || "";

  async function finishLesson() {
    if (finished || input.length === 0) return;

    setFinished(true);
    setMessage("");
    setSaving(true);

    const token = localStorage.getItem("typemaster_token");

    if (!token) {
      setSaving(false);
      setMessage("Please login to save lesson progress.");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/lessons/${currentLesson.id}/progress`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            progress: progress >= 100 ? 100 : Math.max(25, progress),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Unable to save lesson progress.");
        return;
      }

      setMessage(
        data.rewardXp > 0
          ? `Lesson completed! +${data.rewardXp} XP earned.`
          : `Lesson progress saved at ${data.progress}%.`
      );
    } catch {
      setMessage("Cannot connect to the backend.");
    } finally {
      setSaving(false);
    }
  }

  function handleInput(value: string) {
    if (finished) return;

    if (!started) setStarted(true);

    setInput(value);

    if (value.length >= currentLesson.content.length) {
      window.setTimeout(() => {
        void finishLesson();
      }, 0);
    }
  }

  function restart() {
    setInput("");
    setStarted(false);
    setFinished(false);
    setSeconds(0);
    setMessage("");
  }

  return (
    <main className="min-h-screen bg-[#070B14] px-4 py-6 text-white md:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <Link
              href="/lessons"
              className="text-sm font-semibold text-blue-400 hover:text-blue-300"
            >
              ← Back to Lessons
            </Link>
            <p className="mt-4 text-sm text-slate-500">
              {currentLesson.difficulty}
            </p>
            <h1 className="text-3xl font-black">{currentLesson.title}</h1>
            <p className="mt-1 text-sm text-slate-400">
              {currentLesson.subtitle} · {currentLesson.description}
            </p>
          </div>

          <div className="flex gap-3">
            <div className="rounded-2xl border border-white/10 bg-[#0D1424] px-5 py-3 text-center">
              <p className="text-xs text-slate-500">WPM</p>
              <p className="text-xl font-black text-blue-400">{wpm}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#0D1424] px-5 py-3 text-center">
              <p className="text-xs text-slate-500">Accuracy</p>
              <p className="text-xl font-black text-emerald-400">
                {accuracy}%
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#0D1424] px-5 py-3 text-center">
              <p className="text-xs text-slate-500">Time</p>
              <p className="text-xl font-black">{seconds}s</p>
            </div>
          </div>
        </div>

        <section className="mt-8 rounded-3xl border border-white/10 bg-[#0D1424] p-6 md:p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500">Lesson Practice</p>
              <h2 className="text-xl font-black">Type the text below</h2>
            </div>
            <span className="rounded-full bg-blue-500/10 px-3 py-1.5 text-xs text-blue-400">
              {progress}%
            </span>
          </div>

          <div className="mt-6 rounded-2xl bg-[#080D18] p-6 text-xl leading-10 tracking-wide">
            {currentLesson.content.split("").map((character, index) => {
              const typed = input[index];

              const className =
                typed === undefined
                  ? index === input.length
                    ? "border-b-2 border-blue-400 text-white"
                    : "text-slate-600"
                  : typed === character
                  ? "text-emerald-400"
                  : "rounded bg-red-500/20 text-red-400";

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
              finished ? "Lesson finished." : "Start typing here..."
            }
            className="mt-6 min-h-40 w-full resize-none rounded-2xl border border-white/10 bg-[#080D18] p-5 text-lg text-white outline-none placeholder:text-slate-600 focus:border-blue-500"
          />

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            {!finished && (
              <button
                type="button"
                onClick={() => {
                  if (input.length > 0) {
                    void finishLesson();
                  } else {
                    setStarted(true);
                  }
                }}
                className="rounded-xl bg-blue-600 px-6 py-3 font-bold hover:bg-blue-500"
              >
                {started ? "Finish Lesson" : "Start Lesson"}
              </button>
            )}

            <button
              type="button"
              onClick={restart}
              className="rounded-xl bg-white/10 px-6 py-3 font-semibold hover:bg-white/15"
            >
              ↻ Restart
            </button>

            {finished && (
              <button
                type="button"
                onClick={() => router.push("/lessons")}
                className="rounded-xl bg-emerald-500/10 px-6 py-3 font-bold text-emerald-400 hover:bg-emerald-500/20"
              >
                Back to Lessons →
              </button>
            )}
          </div>

          {saving && (
            <p className="mt-5 text-sm text-blue-400">
              Saving lesson progress...
            </p>
          )}

          {message && (
            <p className="mt-5 text-sm text-emerald-400">{message}</p>
          )}
        </section>
      </div>
    </main>
  );
}