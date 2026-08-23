"use client";

import { useState } from "react";

export default function Settings() {
  const [darkMode, setDarkMode] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);
  const [keyboardSounds, setKeyboardSounds] = useState(false);
  const [virtualKeyboard, setVirtualKeyboard] = useState(true);
  const [highlightMistakes, setHighlightMistakes] = useState(true);
  const [instantFeedback, setInstantFeedback] = useState(true);

  const [language, setLanguage] = useState("English");
  const [timer, setTimer] = useState("60 Seconds");
  const [saved, setSaved] = useState(false);

  const saveSettings = () => {
    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2500);
  };

  return (
    <main className="min-h-screen bg-[#070B14] px-4 py-6 text-white md:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <header className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-sm text-slate-400">TypeMaster</p>

            <h1 className="mt-1 text-3xl font-black md:text-4xl">
              Settings ⚙️
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              Customize your typing experience, sounds, keyboard
              preferences, language and timer.
            </p>
          </div>

          <button
            onClick={saveSettings}
            className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold transition hover:bg-blue-500"
          >
            Save Changes
          </button>
        </header>

        {/* Saved notification */}
        {saved && (
          <div className="mt-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-5 py-4 text-sm text-emerald-400">
            ✓ Settings saved successfully.
          </div>
        )}

        {/* Appearance */}
        <section className="mt-8 rounded-3xl border border-white/10 bg-[#0D1424] p-6 md:p-8">
          <SectionHeader
            icon="🎨"
            title="Appearance"
            description="Customize how TypeMaster looks."
          />

          <div className="mt-6 space-y-4">
            <SettingToggle
              title="Dark Mode"
              description="Use the dark interface throughout the website."
              enabled={darkMode}
              onChange={setDarkMode}
            />
          </div>
        </section>

        {/* Sounds */}
        <section className="mt-6 rounded-3xl border border-white/10 bg-[#0D1424] p-6 md:p-8">
          <SectionHeader
            icon="🔊"
            title="Sounds"
            description="Control typing and interface sounds."
          />

          <div className="mt-6 space-y-4">
            <SettingToggle
              title="Sound Effects"
              description="Play sounds for important actions and notifications."
              enabled={soundEffects}
              onChange={setSoundEffects}
            />

            <SettingToggle
              title="Keyboard Sounds"
              description="Play a subtle sound whenever a key is pressed."
              enabled={keyboardSounds}
              onChange={setKeyboardSounds}
            />
          </div>
        </section>

        {/* Typing Experience */}
        <section className="mt-6 rounded-3xl border border-white/10 bg-[#0D1424] p-6 md:p-8">
          <SectionHeader
            icon="⌨️"
            title="Typing Experience"
            description="Choose how typing feedback is displayed."
          />

          <div className="mt-6 space-y-4">
            <SettingToggle
              title="Show Virtual Keyboard"
              description="Display the on-screen keyboard during typing."
              enabled={virtualKeyboard}
              onChange={setVirtualKeyboard}
            />

            <SettingToggle
              title="Highlight Mistakes"
              description="Highlight incorrect characters while typing."
              enabled={highlightMistakes}
              onChange={setHighlightMistakes}
            />

            <SettingToggle
              title="Instant Feedback"
              description="Show correct and incorrect characters immediately."
              enabled={instantFeedback}
              onChange={setInstantFeedback}
            />
          </div>
        </section>

        {/* Language + Timer */}
        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          <SelectCard
            icon="🌐"
            title="Typing Language"
            description="Choose the language used for typing practice."
          >
            <select
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#080D18] px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
            >
              <option>English</option>
              <option>Hindi</option>
              <option>Urdu</option>
              <option>Punjabi</option>
            </select>
          </SelectCard>

          <SelectCard
            icon="⏱️"
            title="Default Timer"
            description="Choose the default duration for typing practice."
          >
            <select
              value={timer}
              onChange={(event) => setTimer(event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#080D18] px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
            >
              <option>15 Seconds</option>
              <option>30 Seconds</option>
              <option>60 Seconds</option>
              <option>120 Seconds</option>
              <option>5 Minutes</option>
            </select>
          </SelectCard>
        </section>

        {/* Current Settings */}
        <section className="mt-6 rounded-3xl border border-white/10 bg-[#0D1424] p-6 md:p-8">
          <SectionHeader
            icon="📋"
            title="Current Settings"
            description="Review your selected preferences."
          />

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Preference
              label="Theme"
              value={darkMode ? "Dark" : "Light"}
            />

            <Preference
              label="Language"
              value={language}
            />

            <Preference
              label="Timer"
              value={timer}
            />

            <Preference
              label="Sound Effects"
              value={soundEffects ? "On" : "Off"}
            />

            <Preference
              label="Keyboard Sounds"
              value={keyboardSounds ? "On" : "Off"}
            />

            <Preference
              label="Virtual Keyboard"
              value={virtualKeyboard ? "On" : "Off"}
            />

            <Preference
              label="Highlight Mistakes"
              value={highlightMistakes ? "On" : "Off"}
            />

            <Preference
              label="Instant Feedback"
              value={instantFeedback ? "On" : "Off"}
            />
          </div>
        </section>

        {/* Account */}
        <section className="mt-6 rounded-3xl border border-white/10 bg-[#0D1424] p-6 md:p-8">
          <SectionHeader
            icon="👤"
            title="Account"
            description="Manage your TypeMaster account."
          />

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            <AccountAction
              title="Edit Profile"
              description="Update your personal information."
            />

            <AccountAction
              title="Change Password"
              description="Update your account password."
            />

            <AccountAction
              title="Log Out"
              description="Sign out from this device."
              danger
            />
          </div>
        </section>

        {/* Save */}
        <div className="mt-6 flex flex-col items-center justify-between gap-4 rounded-3xl border border-blue-500/20 bg-blue-500/5 p-6 md:flex-row">
          <div>
            <h2 className="font-bold">Ready to save?</h2>

            <p className="mt-1 text-sm text-slate-500">
              Your preferences will be used across your typing
              experience.
            </p>
          </div>

          <button
            onClick={saveSettings}
            className="w-full rounded-xl bg-blue-600 px-7 py-3 font-bold transition hover:bg-blue-500 md:w-auto"
          >
            Save Settings
          </button>
        </div>

        <footer className="mt-8 border-t border-white/10 py-6 text-center text-sm text-slate-500">
          Customize TypeMaster to match your typing style. ⚙️
        </footer>
      </div>
    </main>
  );
}

function SectionHeader({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-xl">
        {icon}
      </div>

      <div>
        <h2 className="text-xl font-black">{title}</h2>

        <p className="mt-1 text-sm text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
}

function SettingToggle({
  title,
  description,
  enabled,
  onChange,
}: {
  title: string;
  description: string;
  enabled: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-5 rounded-2xl border border-white/10 bg-[#080D18] p-4 md:p-5">
      <div>
        <h3 className="text-sm font-bold">{title}</h3>

        <p className="mt-1 max-w-xl text-xs leading-5 text-slate-500">
          {description}
        </p>
      </div>

      <button
        type="button"
        onClick={() => onChange(!enabled)}
        aria-pressed={enabled}
        className={`relative h-7 w-12 shrink-0 rounded-full transition ${
          enabled ? "bg-blue-600" : "bg-slate-700"
        }`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
            enabled ? "left-6" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}

function SelectCard({
  icon,
  title,
  description,
  children,
}: {
  icon: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-[#0D1424] p-6 md:p-8">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10 text-xl">
          {icon}
        </div>

        <div>
          <h2 className="text-xl font-black">{title}</h2>

          <p className="mt-1 text-sm text-slate-500">
            {description}
          </p>
        </div>
      </div>

      <div className="mt-6">{children}</div>
    </div>
  );
}

function Preference({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-[#080D18] p-4">
      <span className="text-sm text-slate-500">{label}</span>

      <span className="text-sm font-bold text-blue-400">
        {value}
      </span>
    </div>
  );
}

function AccountAction({
  title,
  description,
  danger = false,
}: {
  title: string;
  description: string;
  danger?: boolean;
}) {
  return (
    <button
      className={`rounded-2xl border p-5 text-left transition ${
        danger
          ? "border-red-500/10 bg-red-500/5 hover:bg-red-500/10"
          : "border-white/10 bg-[#080D18] hover:border-blue-500/30"
      }`}
    >
      <h3
        className={`font-bold ${
          danger ? "text-red-400" : "text-white"
        }`}
      >
        {title}
      </h3>

      <p className="mt-1 text-xs leading-5 text-slate-500">
        {description}
      </p>
    </button>
  );
}