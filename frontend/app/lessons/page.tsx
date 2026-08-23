"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type LessonMeta = {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  difficulty: string;
  color: string;
  locked: boolean;
};

type Lesson = LessonMeta & { progress: number };

type LessonsResponse = {
  success: boolean;
  lessons: {
    id: number;
    progress: number;
    completed: boolean;
  }[];
};

const API_URL = "http://localhost:5000";

const lessonMeta: LessonMeta[] = [
  {
    id: 1,
    title: "Home Row",
    subtitle: "ASDF JKL;",
    description: "Learn the foundation of touch typing.",
    icon: "⌨️",
    difficulty: "Beginner",
    color: "from-blue-600 to-cyan-500",
    locked: false,
  },
  {
    id: 2,
    title: "Upper Row",
    subtitle: "QWERTYUIOP",
    description: "Practice the top row of your keyboard.",
    icon: "🔤",
    difficulty: "Beginner",
    color: "from-purple-600 to-indigo-500",
    locked: false,
  },
  {
    id: 3,
    title: "Lower Row",
    subtitle: "ZXCVBNM",
    description: "Master the lower row keys.",
    icon: "🔡",
    difficulty: "Beginner",
    color: "from-emerald-600 to-teal-500",
    locked: false,
  },
  {
    id: 4,
    title: "Numbers",
    subtitle: "1234567890",
    description: "Improve your number typing speed.",
    icon: "🔢",
    difficulty: "Intermediate",
    color: "from-orange-500 to-amber-500",
    locked: false,
  },
  {
    id: 5,
    title: "Symbols",
    subtitle: "! @ # $ % &",
    description: "Practice common keyboard symbols.",
    icon: "🔣",
    difficulty: "Intermediate",
    color: "from-pink-600 to-rose-500",
    locked: false,
  },
  {
    id: 6,
    title: "Capital Letters",
    subtitle: "SHIFT + Letters",
    description: "Learn to type capital letters naturally.",
    icon: "🔠",
    difficulty: "Intermediate",
    color: "from-violet-600 to-purple-500",
    locked: false,
  },
  {
    id: 7,
    title: "Words",
    subtitle: "Common Words",
    description: "Build speed using everyday words.",
    icon: "📝",
    difficulty: "Intermediate",
    color: "from-sky-600 to-blue-500",
    locked: false,
  },
  {
    id: 8,
    title: "Sentences",
    subtitle: "Full Sentences",
    description: "Practice complete sentences with accuracy.",
    icon: "📄",
    difficulty: "Advanced",
    color: "from-fuchsia-600 to-pink-500",
    locked: false,
  },
  {
    id: 9,
    title: "Paragraphs",
    subtitle: "Long Text",
    description: "Train your typing endurance with paragraphs.",
    icon: "📖",
    difficulty: "Advanced",
    color: "from-indigo-600 to-blue-500",
    locked: false,
  },
  {
    id: 10,
    title: "Advanced Speed Training",
    subtitle: "Speed Challenge",
    description: "Push your typing speed to the next level.",
    icon: "🚀",
    difficulty: "Expert",
    color: "from-red-600 to-orange-500",
    locked: true,
  },
];

export default function Lessons() {
  const [selectedLevel, setSelectedLevel] = useState("All");
  const [lessons, setLessons] = useState<Lesson[]>(
    lessonMeta.map((lesson) => ({ ...lesson, progress: 0 }))
  );
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  const levels = ["All", "Beginner", "Intermediate", "Advanced", "Expert"];

  useEffect(() => {
    loadLessons();
  }, []);

  async function loadLessons() {
    const token = localStorage.getItem("typemaster_token");

    if (!token) {
      setLoading(false);
      setMessage("Please login to view your lesson progress.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/lessons/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data: LessonsResponse = await response.json();

      if (!response.ok) {
        setMessage("Unable to load lesson progress.");
        return;
      }

      const progressMap = new Map(
        data.lessons.map((item) => [item.id, item.progress])
      );

      setLessons(
        lessonMeta.map((lesson) => ({
          ...lesson,
          progress: progressMap.get(lesson.id) ?? 0,
        }))
      );
    } catch {
      setMessage("Cannot connect to the backend.");
    } finally {
      setLoading(false);
    }
  }

  async function updateLessonProgress(
    lessonId: number,
    currentProgress: number
  ) {
    const token = localStorage.getItem("typemaster_token");

    if (!token) {
      setMessage("Please login to save lesson progress.");
      return;
    }

    const nextProgress =
      currentProgress >= 100 ? 100 : Math.min(currentProgress + 25, 100);

    try {
      setSavingId(lessonId);
      setMessage("");

      const response = await fetch(
        `${API_URL}/api/lessons/${lessonId}/progress`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ progress: nextProgress }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Unable to save lesson progress.");
        return;
      }

      setLessons((current) =>
        current.map((lesson) =>
          lesson.id === lessonId
            ? { ...lesson, progress: data.progress }
            : lesson
        )
      );

      setMessage(
        data.rewardXp > 0
          ? `Lesson completed! +${data.rewardXp} XP added to your account.`
          : "Lesson progress saved."
      );

      window.setTimeout(() => setMessage(""), 2500);
    } catch {
      setMessage("Cannot connect to the backend.");
    } finally {
      setSavingId(null);
    }
  }

  const filteredLessons =
    selectedLevel === "All"
      ? lessons
      : lessons.filter((lesson) => lesson.difficulty === selectedLevel);

  const completed = lessons.filter((lesson) => lesson.progress === 100).length;

  const overallProgress = lessons.length
    ? Math.round(
        lessons.reduce((sum, lesson) => sum + lesson.progress, 0) /
          lessons.length
      )
    : 0;

  const currentLevel =
    overallProgress >= 80
      ? "Advanced"
      : overallProgress >= 40
      ? "Intermediate"
      : "Beginner";

  const nextLesson = lessons.find(
    (lesson) => !lesson.locked && lesson.progress < 100
  );

  return (
    <main className="min-h-screen bg-[#070B14] px-4 py-6 text-white md:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div>
            <p className="text-sm text-slate-400">TypeMaster Academy</p>
            <h1 className="mt-1 text-3xl font-black md:text-4xl">
              Typing Lessons
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              Learn touch typing step by step, improve your accuracy,
              and build professional typing speed.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#0D1424] px-5 py-4">
            <p className="text-xs text-slate-500">Overall Progress</p>
            <div className="mt-2 flex items-center gap-3">
              <div className="h-2 w-32 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-blue-600"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
              <span className="text-sm font-bold">{overallProgress}%</span>
            </div>
          </div>
        </header>

        {message && (
          <div className="mt-5 rounded-xl border border-blue-500/20 bg-blue-500/10 px-4 py-3 text-sm text-blue-300">
            {message}
          </div>
        )}

        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          <Stat icon="📚" label="Total Lessons" value={lessons.length.toString()} />
          <Stat icon="✅" label="Completed" value={completed.toString()} />
          <Stat icon="⚡" label="Current Level" value={currentLevel} />
          <Stat icon="🎯" label="Overall Progress" value={`${overallProgress}%`} />
        </div>

        <section className="mt-8">
          <div className="flex flex-wrap gap-2">
            {levels.map((level) => (
              <button
                key={level}
                onClick={() => setSelectedLevel(level)}
                className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                  selectedLevel === level
                    ? "bg-blue-600 text-white"
                    : "bg-[#0D1424] text-slate-400 hover:bg-white/10"
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </section>

        <section className="mt-6">
          {loading ? (
            <div className="rounded-3xl border border-white/10 bg-[#0D1424] p-10 text-center text-slate-500">
              Loading lesson progress...
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredLessons.map((lesson) => (
                <LessonCard
                  key={lesson.id}
                  lesson={lesson}
                  saving={savingId === lesson.id}
                  onProgress={() =>
                    updateLessonProgress(lesson.id, lesson.progress)
                  }
                />
              ))}
            </div>
          )}
        </section>

        <section className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-[#0D1424]">
          <div className="p-6 md:p-8">
            <p className="text-sm text-blue-400">Learn the Basics</p>
            <h2 className="mt-1 text-2xl font-black">Finger Position Guide</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              Keep your fingers on the home row and use the correct
              finger for every key. This will help you type faster
              without looking at the keyboard.
            </p>

            <div className="mt-8 overflow-x-auto">
              <div className="min-w-[700px]">
                <KeyboardRow keys={["Q","W","E","R","T","Y","U","I","O","P"]} />
                <KeyboardRow keys={["A","S","D","F","G","H","J","K","L",";"]} active />
                <KeyboardRow keys={["Z","X","C","V","B","N","M",",",".","/"]} />
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-4 text-xs text-slate-400">
              <Legend color="bg-pink-500" text="Left Pinky" />
              <Legend color="bg-orange-500" text="Left Ring" />
              <Legend color="bg-yellow-500" text="Left Middle" />
              <Legend color="bg-emerald-500" text="Index Fingers" />
              <Legend color="bg-blue-500" text="Right Hand" />
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-7 md:p-10">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div>
              <span className="rounded-full bg-white/15 px-3 py-1 text-xs">
                🚀 Keep Learning
              </span>
              <h2 className="mt-4 text-2xl font-black md:text-3xl">
                {nextLesson
                  ? `Continue: ${nextLesson.title}`
                  : "All lessons completed!"}
              </h2>
              <p className="mt-2 max-w-xl text-sm text-blue-100">
                {nextLesson
                  ? "Complete lessons to build your skills and earn XP."
                  : "Amazing work. Keep practicing to maintain your speed."}
              </p>
            </div>

            {nextLesson && (
              <Link
                href={`/lessons/${nextLesson.id}`}
                className="rounded-xl bg-white px-6 py-3 font-bold text-blue-700 transition hover:scale-105"
              >
                Start Next Lesson →
              </Link>
            )}
          </div>
        </section>

        <footer className="mt-8 border-t border-white/10 py-6 text-center text-sm text-slate-500">
          Learn typing. Build speed. Master your keyboard.
        </footer>
      </div>
    </main>
  );
}

function LessonCard({
  lesson,
  saving,
  onProgress,
}: {
  lesson: Lesson;
  saving: boolean;
  onProgress: () => void;
}) {
  return (
    <div className="group overflow-hidden rounded-3xl border border-white/10 bg-[#0D1424] transition hover:-translate-y-1 hover:border-blue-500/30">
      <div className={`bg-gradient-to-r ${lesson.color} p-5`}>
        <div className="flex items-start justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-2xl backdrop-blur">
            {lesson.icon}
          </div>

          {lesson.locked ? (
            <span className="rounded-full bg-black/20 px-3 py-1 text-xs">
              🔒 Locked
            </span>
          ) : (
            <span className="rounded-full bg-white/15 px-3 py-1 text-xs">
              {lesson.difficulty}
            </span>
          )}
        </div>

        <p className="mt-6 text-sm text-white/70">{lesson.subtitle}</p>
        <h3 className="mt-1 text-2xl font-black">{lesson.title}</h3>
      </div>

      <div className="p-5">
        <p className="min-h-12 text-sm leading-6 text-slate-400">
          {lesson.description}
        </p>

        <div className="mt-5 flex items-center justify-between text-xs">
          <span className="text-slate-500">Progress</span>
          <span className="font-bold text-slate-300">{lesson.progress}%</span>
        </div>

        <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/5">
          <div
            className="h-full rounded-full bg-blue-600 transition-all"
            style={{ width: `${lesson.progress}%` }}
          />
        </div>

        {lesson.locked ? (
          <button
            disabled
            className="mt-5 w-full cursor-not-allowed rounded-xl bg-white/5 py-3 text-sm font-bold text-slate-600"
          >
            Locked
          </button>
        ) : lesson.progress === 100 ? (
          <Link
            href={`/lessons/${lesson.id}`}
            className="mt-5 block w-full rounded-xl bg-emerald-500/10 py-3 text-center text-sm font-bold text-emerald-400 transition hover:bg-emerald-500/20"
          >
            Review Lesson
          </Link>
        ) : (
          <Link
            href={`/lessons/${lesson.id}`}
            className="mt-5 block w-full rounded-xl bg-blue-600 py-3 text-center text-sm font-bold text-white transition hover:bg-blue-500"
          >
            {saving
              ? "Saving..."
              : lesson.progress > 0
              ? "Continue Lesson"
              : "Start Lesson"}
          </Link>
        )}
      </div>
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

function KeyboardRow({
  keys,
  active = false,
}: {
  keys: string[];
  active?: boolean;
}) {
  return (
    <div className="mb-2 flex justify-center gap-1.5">
      {keys.map((key, index) => (
        <div
          key={`${key}-${index}`}
          className={`flex h-12 w-12 items-center justify-center rounded-lg border text-sm font-bold ${
            active
              ? index < 5
                ? "border-pink-500/30 bg-pink-500/10 text-pink-300"
                : "border-blue-500/30 bg-blue-500/10 text-blue-300"
              : "border-white/10 bg-[#080D18] text-slate-500"
          }`}
        >
          {key}
        </div>
      ))}
    </div>
  );
}

function Legend({
  color,
  text,
}: {
  color: string;
  text: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className={`h-3 w-3 rounded-full ${color}`} />
      {text}
    </div>
  );
}