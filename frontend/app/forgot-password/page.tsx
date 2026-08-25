"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://typemaster-backend-dhb8.onrender.com";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [resetLink, setResetLink] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setMessage("");
    setResetLink("");

    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    try {
      setLoading(true);
      console.log("FORGOT PASSWORD API:", `${API_URL}/api/auth/forgot-password`);
      console.log("FORGOT PASSWORD RESPONSE:", 'data');
      const response = await fetch(
        `${API_URL}/api/auth/forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Unable to process request.");
        return;
      }

      setMessage(
        "If an account exists for this email, a password reset link has been generated."
      );

      if (data.resetLink) {
        setResetLink(data.resetLink);
      }
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
      <div className="mx-auto flex min-h-[calc(100vh-64px)] max-w-xl items-center justify-center">
        <div className="w-full rounded-3xl border border-white/10 bg-[#0D1424] p-6 md:p-10">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-3xl">
              🔐
            </div>

            <p className="mt-6 text-sm text-slate-400">
              TypeMaster Account
            </p>

            <h1 className="mt-1 text-3xl font-black">
              Forgot Password?
            </h1>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
              Enter your email address and we'll help you reset your
              password.
            </p>
          </div>

          {error && (
            <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {message && (
            <div className="mt-6 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-7 space-y-5">
            <div>
              <label className="mb-2 block text-sm text-slate-400">
                Email Address
              </label>

              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-white/10 bg-[#080D18] px-4 py-3.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-blue-600 px-5 py-3.5 font-bold transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Generating Reset Link..." : "Reset Password →"}
            </button>
          </form>

          {resetLink && (
            <div className="mt-6 rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-4">
              <p className="text-xs font-semibold text-yellow-400">
                Development Reset Link
              </p>

              <a
                href={resetLink}
                className="mt-2 block break-all text-sm text-blue-400 hover:text-blue-300"
              >
                {resetLink}
              </a>

              <p className="mt-2 text-xs text-slate-500">
                This link is shown only for local development.
                Later we'll connect email delivery.
              </p>
            </div>
          )}

          <div className="mt-7 text-center">
            <Link
              href="/login"
              className="text-sm font-semibold text-blue-400 hover:text-blue-300"
            >
              ← Back to Login
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}