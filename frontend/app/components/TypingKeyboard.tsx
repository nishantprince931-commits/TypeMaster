"use client";

type TypingKeyboardProps = {
  nextKey: string;
};

const rows = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["Z", "X", "C", "V", "B", "N", "M"],
];

export default function TypingKeyboard({
  nextKey,
}: TypingKeyboardProps) {
  const activeKey = nextKey || "";
  const activeLetter = activeKey.toUpperCase();

  return (
    <div className="mx-auto mt-7 w-full max-w-5xl rounded-3xl border border-slate-300/70 bg-gradient-to-b from-slate-200 to-slate-300 p-5 shadow-2xl">

      {/* Keyboard Area */}
      <div className="rounded-2xl bg-slate-400/30 p-4 shadow-inner">

        {rows.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className={`mb-2 flex justify-center gap-1.5 ${
              rowIndex === 1
                ? "translate-x-2"
                : rowIndex === 2
                ? "translate-x-7"
                : ""
            }`}
          >
            {row.map((key) => {
              const isActive = key === activeLetter;

              return (
                <div
                  key={key}
                  className={`
                    flex h-11 w-11 items-center justify-center
                    rounded-lg border
                    text-sm font-black
                    select-none
                    transition-all duration-150
                    sm:h-12 sm:w-12
                    ${
                      isActive
                        ? `
                          -translate-y-1
                          scale-110
                          border-blue-500
                          bg-blue-500
                          text-white
                          shadow-[0_6px_15px_rgba(59,130,246,0.55)]
                        `
                        : `
                          border-slate-300
                          bg-white
                          text-slate-700
                          shadow-[0_3px_0_#94a3b8]
                        `
                    }
                  `}
                >
                  {key}
                </div>
              );
            })}
          </div>
        ))}

        {/* Space Bar */}
        <div className="mt-2 flex justify-center">
          <div
            className={`
              flex h-11 w-64 items-center justify-center
              rounded-lg border text-xs font-black
              transition-all duration-150
              sm:w-80
              ${
                activeKey === " "
                  ? `
                    -translate-y-1
                    border-blue-500
                    bg-blue-500
                    text-white
                    shadow-[0_6px_15px_rgba(59,130,246,0.55)]
                  `
                  : `
                    border-slate-300
                    bg-white
                    text-slate-500
                    shadow-[0_3px_0_#94a3b8]
                  `
              }
            `}
          >
            SPACE
          </div>
        </div>
      </div>

      {/* Hands / Finger Guide */}
      <div className="relative mt-5 flex justify-center">
        <div className="flex items-center gap-12 text-6xl opacity-40 select-none">
          <span>🖐️</span>
          <span className="-scale-x-100">🖐️</span>
        </div>
      </div>

      {/* Current Key */}
      <div className="mt-3 text-center">
        <span className="text-xs font-semibold text-slate-500">
          Next key
        </span>

        <span className="ml-2 font-black text-blue-600">
          {activeKey === " "
            ? "SPACE"
            : activeLetter || "—"}
        </span>
      </div>
    </div>
  );
}