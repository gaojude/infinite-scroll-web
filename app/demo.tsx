"use client";

import { useState, useEffect, useRef } from "react";

const TYPING_SPEED = 30;

function Cursor() {
  return (
    <span
      className="inline-block w-[7px] h-[14px] bg-[var(--color-text)] ml-0.5 align-middle"
      style={{ animation: "blink 1s step-end infinite" }}
    />
  );
}

// Claude Code styled terminal cell
function ClaudeCell({
  dir,
  prompt,
  response,
  startAt,
  focused,
}: {
  dir: string;
  prompt: string;
  response?: string[];
  startAt: number;
  focused?: boolean;
}) {
  const [phase, setPhase] = useState<"idle" | "typing" | "done">("idle");
  const [typed, setTyped] = useState("");

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    timers.push(setTimeout(() => {
      setPhase("typing");
      let i = 0;
      const interval = setInterval(() => {
        if (i < prompt.length) {
          setTyped(prompt.slice(0, i + 1));
          i++;
        } else {
          clearInterval(interval);
          setPhase("done");
        }
      }, TYPING_SPEED);
      timers.push(interval as unknown as ReturnType<typeof setTimeout>);
    }, startAt));

    return () => timers.forEach(clearTimeout);
  }, [prompt, startAt]);

  return (
    <div
      className={`flex-1 min-w-[160px] bg-[#1e1e22] p-0 font-mono text-[11px] md:text-[13px] overflow-hidden leading-[1.5] flex flex-col ${focused ? "ring-1 ring-[var(--color-accent)] ring-inset" : ""}`}
    >
      {/* Welcome box — orange border, matches real Claude Code */}
      <div className="m-2 mb-1">
        <div className="border border-[#b5593c] rounded flex overflow-hidden">
          {/* Main welcome area */}
          <div className="flex-1 px-3 py-2 text-center">
            <div className="text-[var(--color-text-dim)] text-[8px] md:text-[9px] mb-0.5">── Claude Code ──</div>
            <div className="text-[var(--color-text)] font-bold text-[10px] md:text-[12px]">Welcome back!</div>
            <div className="text-[#c46a45] text-[12px] md:text-[14px] my-1 leading-none">
              <div>&nbsp;&nbsp;▐▛██▜▌</div>
              <div>&nbsp;▝▜████▛▘</div>
            </div>
            <div className="text-[var(--color-text-dim)] text-[8px] md:text-[9px] leading-relaxed">
              <div>Opus 4.6 (1M context)</div>
              <div>{dir}</div>
            </div>
          </div>
          {/* Tips sidebar */}
          <div className="border-l border-[#b5593c] px-2 py-2 text-[7px] md:text-[8px] w-[90px] md:w-[110px]">
            <div className="text-[#b5593c] font-bold">Tips</div>
            <div className="text-[var(--color-text-dim)] mt-0.5">Run /init to crea...</div>
            <div className="border-t border-[#b5593c] my-1" />
            <div className="text-[#b5593c] font-bold">Recent activity</div>
            <div className="text-[var(--color-text-dim)] mt-0.5">No recent activity</div>
          </div>
        </div>
      </div>

      {/* Prompt — dark background bar like real Claude Code */}
      <div className="bg-[#2a2a30] mx-0 px-3 py-1.5 flex items-start">
        <span className="text-[var(--color-text-dim)] mr-1.5 font-bold">❯</span>
        <span className="text-[var(--color-text)] font-bold">{typed}</span>
        {phase === "typing" && focused && <Cursor />}
      </div>

      {/* Response with bullet */}
      {phase === "done" && response && (
        <div className="px-3 py-1.5">
          {response.map((line, i) => (
            <div key={i} className="flex items-start gap-1.5 text-[var(--color-text)] opacity-80">
              {i === 0 && <span className="text-[var(--color-text-dim)]">●</span>}
              {i > 0 && <span className="opacity-0">●</span>}
              <span>{line}</span>
            </div>
          ))}
        </div>
      )}

      <div className="flex-1" />

      {/* Bottom separator + next prompt */}
      {phase === "done" && (
        <div>
          <div className="border-t border-[var(--color-border)] mx-2" />
          <div className="px-3 py-1 flex items-start">
            <span className="text-[var(--color-text-dim)] mr-1.5 font-bold">❯</span>
            {focused && <Cursor />}
          </div>
          <div className="border-t border-[var(--color-border)] mx-2" />
        </div>
      )}

      {/* Status bar */}
      <div className="px-3 py-1 flex items-center gap-1.5 text-[8px] md:text-[9px]">
        <span className="text-[#b5593c]">⏵⏵</span>
        <span className="text-[#b5593c]">bypass permissions on</span>
        <span className="text-[var(--color-text-dim)] ml-auto">◐ medium</span>
      </div>
    </div>
  );
}

// Plain terminal cell (for test runners, dev servers)
function ShellCell({
  lines,
  focused,
}: {
  lines: { text: string; green?: boolean; dim?: boolean }[];
  focused?: boolean;
}) {
  return (
    <div
      className={`flex-1 min-w-[140px] bg-[var(--color-terminal-bg)] p-2 font-mono text-[9px] md:text-[11px] overflow-hidden leading-[1.4] ${focused ? "ring-1 ring-[var(--color-accent)] ring-inset" : ""}`}
    >
      {lines.map((line, i) => (
        <div
          key={i}
          className={
            line.green
              ? "text-[var(--color-green)]"
              : line.dim
                ? "text-[var(--color-text-dim)] opacity-60"
                : "text-[var(--color-text)]"
          }
        >
          {line.text}
        </div>
      ))}
      {focused && (
        <div className="flex mt-0.5">
          <span className="text-[var(--color-green)] mr-1">→</span>
          <Cursor />
        </div>
      )}
    </div>
  );
}

function NotesCell({
  text,
  focused,
}: {
  text: string;
  focused?: boolean;
}) {
  const [content, setContent] = useState("");
  const prevFocused = useRef(false);

  useEffect(() => {
    if (focused && !prevFocused.current && content.length < text.length) {
      let i = content.length;
      const interval = setInterval(() => {
        if (i < text.length) {
          setContent(text.slice(0, i + 1));
          i++;
        } else {
          clearInterval(interval);
        }
      }, TYPING_SPEED);
      prevFocused.current = true;
      return () => clearInterval(interval);
    }
    if (!focused) prevFocused.current = false;
  }, [focused, text, content.length]);

  return (
    <div
      className={`flex-1 min-w-[140px] bg-[#111113] p-2 font-mono text-[9px] md:text-[11px] text-[var(--color-text-dim)] overflow-hidden leading-[1.4] ${focused ? "ring-1 ring-[var(--color-accent)] ring-inset" : ""}`}
    >
      {content.split("\n").map((line, i) => (
        <div key={i} className="whitespace-pre">
          {line || "\u00A0"}
        </div>
      ))}
      {focused && <Cursor />}
    </div>
  );
}

function KeyCombo({ keys, show }: { keys: string; show: boolean }) {
  if (!show) return null;
  return (
    <div
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 bg-black/85 backdrop-blur-md border border-[var(--color-accent)]/30 rounded-xl px-6 py-3 text-lg md:text-2xl font-mono text-white shadow-2xl tracking-wider"
      style={{ animation: "fadeInUp 0.15s ease-out both" }}
    >
      {keys}
    </div>
  );
}

function DemoRow({
  title,
  children,
  show,
}: {
  title: string;
  children: React.ReactNode;
  show: boolean;
}) {
  if (!show) return null;
  return (
    <div
      className="border-t border-[var(--color-border)]"
      style={{ animation: "fadeInUp 0.3s ease-out both" }}
    >
      <div className="flex items-center gap-1.5 px-2.5 h-6 bg-[var(--color-surface-2)] border-b border-[var(--color-border)]">
        <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-green)]" />
        <span className="text-[9px] md:text-[10px] text-[var(--color-text-dim)]">
          {title}
        </span>
      </div>
      <div className="flex divide-x divide-[var(--color-border)] h-48 md:h-56">
        {children}
      </div>
    </div>
  );
}

const EVENTS = [
  { t: 0, type: "start" },
  // Split Row 1: test runner
  { t: 3500, type: "key", keys: "⌘ D" },
  { t: 4000, type: "split1" },
  // Focus notes
  { t: 6000, type: "key", keys: "⌘ →" },
  { t: 6300, type: "focus-r1-notes" },
  // New row: frontend Claude
  { t: 9000, type: "key", keys: "⌘ ⇧ ↓" },
  { t: 9500, type: "row2" },
  // Split Row 2: dev server
  { t: 12000, type: "key", keys: "⌘ D" },
  { t: 12500, type: "split2" },
  // New row: infra Claude
  { t: 14500, type: "key", keys: "⌘ ⇧ ↓" },
  { t: 15000, type: "row3" },
  // Navigate back up
  { t: 17000, type: "key", keys: "⌘ ↑" },
  { t: 17300, type: "focus-r2" },
  { t: 18500, type: "key", keys: "⌘ ↑" },
  { t: 18800, type: "focus-r1" },
  // Scroll to show everything
  { t: 20000, type: "scroll-down" },
  // Mouse moves to close button
  { t: 21500, type: "mouse-to-close" },
  { t: 22500, type: "close-app" },
  // Desktop with icon, mouse double-clicks
  { t: 24500, type: "mouse-to-icon" },
  { t: 25500, type: "reopen-app" },
  { t: 28500, type: "reset" },
] as const;

const CYCLE = 29500;

export function Demo() {
  const [showKey, setShowKey] = useState<string | null>(null);
  const [showSplit1, setShowSplit1] = useState(false);
  const [showRow2, setShowRow2] = useState(false);
  const [showSplit2, setShowSplit2] = useState(false);
  const [showRow3, setShowRow3] = useState(false);
  const [focusedCell, setFocusedCell] = useState("r1-claude");
  const [scrollOffset, setScrollOffset] = useState(0);
  const [appClosed, setAppClosed] = useState(false);
  const [resumed, setResumed] = useState(false);
  const [mousePos, setMousePos] = useState<{ x: string; y: string } | null>(null);
  const [mouseClick, setMouseClick] = useState(false);

  useEffect(() => {
    function runCycle() {
      setShowSplit1(false);
      setShowRow2(false);
      setShowSplit2(false);
      setShowRow3(false);
      setFocusedCell("r1-claude");
      setScrollOffset(0);
      setShowKey(null);
      setAppClosed(false);
      setResumed(false);
      setMousePos(null);
      setMouseClick(false);

      const timers: ReturnType<typeof setTimeout>[] = [];

      for (const event of EVENTS) {
        timers.push(
          setTimeout(() => {
            switch (event.type) {
              case "key":
                setShowKey(event.keys);
                setTimeout(() => setShowKey(null), 450);
                break;
              case "split1":
                setShowSplit1(true);
                setFocusedCell("r1-shell");
                break;
              case "focus-r1-notes":
                setFocusedCell("r1-notes");
                break;
              case "row2":
                setShowRow2(true);
                setFocusedCell("r2-claude");
                setScrollOffset(1);
                break;
              case "split2":
                setShowSplit2(true);
                setFocusedCell("r2-shell");
                break;
              case "row3":
                setShowRow3(true);
                setFocusedCell("r3-claude");
                setScrollOffset(2);
                break;
              case "focus-r2":
                setFocusedCell("r2-claude");
                setScrollOffset(1);
                break;
              case "focus-r1":
                setFocusedCell("r1-claude");
                setScrollOffset(0);
                break;
              case "scroll-down":
                setScrollOffset(2);
                setFocusedCell("r3-claude");
                break;
              case "mouse-to-close":
                setMousePos({ x: "12px", y: "12px" });
                setScrollOffset(0);
                setFocusedCell("");
                break;
              case "close-app":
                setMouseClick(true);
                setTimeout(() => {
                  setMouseClick(false);
                  setMousePos(null);
                  setAppClosed(true);
                }, 200);
                break;
              case "mouse-to-icon":
                setMousePos({ x: "50%", y: "55%" });
                break;
              case "reopen-app":
                setMouseClick(true);
                setTimeout(() => {
                  setMouseClick(false);
                  setMousePos(null);
                  setAppClosed(false);
                  setResumed(true);
                  setFocusedCell("r1-claude");
                  setScrollOffset(0);
                }, 200);
                break;
            }
          }, event.t)
        );
      }

      const next = setTimeout(runCycle, CYCLE);
      timers.push(next);
      return timers;
    }

    const timers = runCycle();
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="relative">
      <div className="rounded-xl border border-[var(--color-border)] overflow-hidden bg-[var(--color-surface)] shadow-2xl shadow-black/40">
        {/* Title bar */}
        <div className="flex items-center px-3 h-8 bg-[#1e1e22] border-b border-[var(--color-border)]">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
          </div>
          <div className="flex-1 text-center text-[10px] md:text-xs text-[var(--color-text-dim)]">
            Infinite Scroll
          </div>
          <div className="w-12" />
        </div>

        {/* Viewport */}
        <div
          className="relative overflow-hidden"
          style={{ height: "clamp(300px, 48vw, 480px)" }}
        >
          {/* Mouse cursor */}
          {mousePos && (
            <div
              className="absolute z-40 pointer-events-none transition-all duration-500 ease-in-out"
              style={{ left: mousePos.x, top: mousePos.y }}
            >
              <svg width="16" height="20" viewBox="0 0 16 20" fill="none" className={mouseClick ? "scale-90" : ""}>
                <path d="M1 1L1 14L4.5 10.5L8 17L10.5 16L7 9.5L12 9.5L1 1Z" fill="white" stroke="black" strokeWidth="1"/>
              </svg>
            </div>
          )}

          {/* Desktop with app icon */}
          {appClosed && (
            <div
              className="absolute inset-0 z-30 flex flex-col items-center justify-center"
              style={{
                animation: "fadeInUp 0.3s ease-out both",
                background: "linear-gradient(180deg, #1a1a2e 0%, #0a0a14 100%)",
              }}
            >
              <div className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-white/5 transition-colors">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-[var(--color-accent)] to-purple-600 flex items-center justify-center shadow-lg">
                  <span className="text-white text-2xl md:text-3xl font-bold">∞</span>
                </div>
                <span className="text-[10px] text-[var(--color-text-dim)]">Infinite Scroll</span>
              </div>
              <div className="mt-4 text-[10px] text-[var(--color-text-dim)] opacity-50">
                3 sessions waiting...
              </div>
            </div>
          )}

          {resumed && !appClosed && (
            <div
              className="absolute top-2 left-1/2 -translate-x-1/2 z-20 bg-[var(--color-green)]/10 border border-[var(--color-green)]/30 rounded-full px-3 py-0.5 text-[10px] text-[var(--color-green)]"
              style={{ animation: "fadeInUp 0.3s ease-out both" }}
            >
              All sessions resumed
            </div>
          )}

          <KeyCombo keys={showKey ?? ""} show={!!showKey} />

          <div
            className="transition-transform duration-500 ease-in-out"
            style={{ transform: `translateY(-${scrollOffset * 230}px)` }}
          >
            {/* Row 1: Auth — Claude Code + tests + notes */}
            <DemoRow title="Row #1 — auth service" show>
              <ClaudeCell
                dir="~/projects/saas"
                prompt="implement JWT auth middleware"
                response={[
                  "I'll create the auth middleware.",
                  "Writing src/middleware/auth.ts...",
                  "✓ Created JWT verification",
                ]}
                startAt={400}
                focused={focusedCell === "r1-claude"}
              />
              {showSplit1 && (
                <ShellCell
                  lines={[
                    { text: "~/projects/saas", dim: true },
                    { text: "→ npm test -- --watch" },
                    { text: "PASS src/auth.test.ts (4 tests)", green: true },
                    { text: "PASS src/middleware.test.ts (7 tests)", green: true },
                    { text: "Tests: 11 passed, 11 total", dim: true },
                  ]}
                  focused={focusedCell === "r1-shell"}
                />
              )}
              <NotesCell
                text={"# Auth TODO\n\n- JWT middleware\n- refresh tokens\n- rate limiting\n- tests passing ✓"}
                focused={focusedCell === "r1-notes"}
              />
            </DemoRow>

            {/* Row 2: Frontend — Claude Code + dev server + notes */}
            <DemoRow title="Row #2 — frontend" show={showRow2}>
              <ClaudeCell
                dir="~/projects/saas/web"
                prompt="add dark mode to the dashboard"
                response={[
                  "I'll update the theme provider.",
                  "Editing src/theme.tsx...",
                  "✓ Dark mode toggle added",
                ]}
                startAt={300}
                focused={focusedCell === "r2-claude"}
              />
              {showSplit2 && (
                <ShellCell
                  lines={[
                    { text: "~/projects/saas/web", dim: true },
                    { text: "→ npm run dev" },
                    { text: "ready on localhost:3000", dim: true },
                    { text: "✓ compiled in 240ms", green: true },
                  ]}
                  focused={focusedCell === "r2-shell"}
                />
              )}
              <NotesCell
                text={"# Frontend\n\n- dark mode toggle\n- dashboard layout\n- mobile responsive"}
                focused={focusedCell === "r2-notes"}
              />
            </DemoRow>

            {/* Row 3: Infra — Claude Code + notes */}
            <DemoRow title="Row #3 — infrastructure" show={showRow3}>
              <ClaudeCell
                dir="~/projects/saas/infra"
                prompt="set up staging environment"
                response={[
                  "I'll create the Terraform config.",
                  "Writing infra/staging.tf...",
                  "✓ Staging env configured",
                ]}
                startAt={300}
                focused={focusedCell === "r3-claude"}
              />
              <NotesCell
                text={"# Infra\n\n- staging env\n- DNS + SSL\n- CI/CD pipeline"}
                focused={focusedCell === "r3-notes"}
              />
            </DemoRow>
          </div>
        </div>
      </div>

      <div className="flex justify-center mt-3 gap-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`w-1 h-1 rounded-full transition-colors duration-300 ${scrollOffset >= i ? "bg-[var(--color-accent)]" : "bg-[var(--color-border)]"}`}
          />
        ))}
      </div>
    </div>
  );
}
