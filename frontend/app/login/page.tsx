// Updated Login page with working Forgot Password link and password visibility.

"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Login failed.");
        return;
      }

      localStorage.setItem("typemaster_token", data.token);
      localStorage.setItem(
        "typemaster_user",
        JSON.stringify(data.user)
      );

      router.push("/");
    } catch {
      setError(
        "Cannot connect to the server. Make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#070B14] px-4 py-8 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-64px)] max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-3xl border border-white/10 bg-[#0D1424] lg:grid-cols-2">
          {/* Left */}
          <div className="hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-10 lg:block">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 text-2xl">
                ⌨
              </div>

              <div>
                <h1 className="text-xl font-black">TypeMaster</h1>
                <p className="text-xs text-blue-100">
                  Typing Platform
                </p>
              </div>
            </div>

            <div className="mt-24 max-w-md">
              <span className="rounded-full bg-white/15 px-3 py-1 text-xs">
                👋 Welcome Back
              </span>

              <h2 className="mt-5 text-4xl font-black leading-tight">
                Ready to improve your typing?
              </h2>

              <p className="mt-5 leading-7 text-blue-100">
                Continue your practice, complete today's challenge,
                maintain your streak, and climb the leaderboard.
              </p>

              <div className="mt-8 space-y-3">
                <Benefit
                  icon="⚡"
                  title="Track your WPM"
                  text="See your real typing performance."
                />

                <Benefit
                  icon="📊"
                  title="View your progress"
                  text="Understand how you're improving."
                />

                <Benefit
                  icon="🏆"
                  title="Compete globally"
                  text="Climb the TypeMaster leaderboard."
                />
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="flex items-center p-6 md:p-10">
            <div className="mx-auto w-full max-w-md">
              <p className="text-sm text-slate-400">Welcome Back</p>

              <h2 className="mt-1 text-3xl font-black">
                Login to TypeMaster
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Continue your typing journey.
              </p>

              {error && (
                <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              <form
                onSubmit={handleSubmit}
                className="mt-7 space-y-4"
              >
                <Input
                  label="Email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={setEmail}
                />

                <div>
                  <label className="mb-2 block text-sm text-slate-400">
                    Password
                  </label>

                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(event) =>
                        setPassword(event.target.value)
                      }
                      placeholder="Your password"
                      className="w-full rounded-xl border border-white/10 bg-[#080D18] px-4 py-3 pr-16 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword((current) => !current)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-xs font-semibold text-blue-400 hover:bg-white/5 hover:text-blue-300"
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Link
                    href="/forgot-password"
                    className="text-xs font-semibold text-blue-400 hover:text-blue-300"
                  >
                    Forgot Password?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-blue-600 px-5 py-3.5 font-bold transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Logging In..." : "Login →"}
                </button>
              </form>

              <div className="my-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-white/10" />
                <span className="text-xs text-slate-600">OR</span>
                <div className="h-px flex-1 bg-white/10" />
              </div>

              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-center text-xs text-slate-500">
                Your account is securely authenticated through the
                TypeMaster backend.
              </div>

              <p className="mt-6 text-center text-sm text-slate-500">
                Don't have an account?{" "}
                <Link
                  href="/signup"
                  className="font-semibold text-blue-400 hover:text-blue-300"
                >
                  Create Account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm text-slate-400">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-white/10 bg-[#080D18] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500"
      />
    </div>
  );
}

function Benefit({
  icon,
  title,
  text,
}: {
  icon: string;
  title: string;
  text: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl bg-white/10 p-4">
      <div className="text-2xl">{icon}</div>

      <div>
        <p className="text-sm font-bold">{title}</p>
        <p className="mt-1 text-xs text-blue-100/70">{text}</p>
      </div>
    </div>
  );
}