"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function Signup() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("India");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!name.trim() || !email.trim() || !password) {
      setError("Please fill all required fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
          country,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Unable to create account.");
        return;
      }

      localStorage.setItem("typemaster_token", data.token);
      localStorage.setItem("typemaster_user", JSON.stringify(data.user));

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
                🚀 Start Your Journey
              </span>

              <h2 className="mt-5 text-4xl font-black leading-tight">
                Become a faster and more accurate typist.
              </h2>

              <p className="mt-5 leading-7 text-blue-100">
                Practice daily, track your progress, earn achievements,
                and compete with typists around the world.
              </p>

              <div className="mt-8 grid grid-cols-2 gap-3">
                <Benefit icon="⚡" text="Improve WPM" />
                <Benefit icon="🎯" text="Increase Accuracy" />
                <Benefit icon="🏆" text="Earn Achievements" />
                <Benefit icon="🔥" text="Build Streaks" />
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="p-6 md:p-10">
            <div className="mx-auto max-w-md">
              <p className="text-sm text-slate-400">Create Account</p>

              <h2 className="mt-1 text-3xl font-black">
                Join TypeMaster
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Create your account and start improving your typing.
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
                  label="Name"
                  placeholder="Your name"
                  value={name}
                  onChange={setName}
                />

                <Input
                  label="Email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={setEmail}
                />

                <div>
                  <label className="mb-2 block text-sm text-slate-400">
                    Country
                  </label>

                  <select
                    value={country}
                    onChange={(event) => setCountry(event.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#080D18] px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
                  >
                    <option>India</option>
                    <option>United States</option>
                    <option>United Kingdom</option>
                    <option>Canada</option>
                    <option>Australia</option>
                    <option>Germany</option>
                    <option>France</option>
                    <option>Japan</option>
                    <option>Other</option>
                  </select>
                </div>

                <Input
                  label="Password"
                  type="password"
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={setPassword}
                />

                <Input
                  label="Confirm Password"
                  type="password"
                  placeholder="Repeat your password"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-blue-600 px-5 py-3.5 font-bold transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Creating Account..." : "Create Account →"}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-slate-500">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-blue-400 hover:text-blue-300"
                >
                  Login
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
  text,
}: {
  icon: string;
  text: string;
}) {
  return (
    <div className="rounded-xl bg-white/10 p-4">
      <div className="text-xl">{icon}</div>
      <p className="mt-2 text-sm font-semibold">{text}</p>
    </div>
  );
}