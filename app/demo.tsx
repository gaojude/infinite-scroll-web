"use client";

import { useState, useEffect, useRef } from "react";

const TYPING_SPEED = 30;

function useTypewriter(text: string, startAt: number) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setStarted(true), startAt);
    return () => clearTimeout(t);
  }, [startAt]);

  useEffect(() => {
    if (!started) return;
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.slice(0, i + 1));
        i++;
      } else {
        setDone(true);
        clearInterval(interval);
      }
    }, TYPING_SPEED);
    return () => clearInterval(interval);
  }, [text, started]);

  return { displayed, done, started };
}

function Cursor() {
  return (
    <span
      className="inline-block w-[7px] h-[14px] bg-[var(--color-text)] ml-0.5 align-middle"
      style={{ animation: "blink 1s step-end infinite" }}
    />
  );
}

function TerminalCell({
  lines,
  startAt,
  focused,
}: {
  lines: { prefix?: string; text: string; dim?: boolean }[];
  startAt: number;
  focused?: boolean;
}) {
  const [visibleLines, setVisibleLines] = useState(0);
  const [typingLine, setTypingLine] = useState("");
  const [allDone, setAllDone] = useState(false);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    let delay = startAt;

    lines.forEach((line, idx) => {
      timers.push(
        setTimeout(() => {
          setVisibleLines(idx);
          let i = 0;
          const interval = setInterval(() => {
            if (i < line.text.length) {
              setTypingLine(line.text.slice(0, i + 1));
              i++;
            } else {
              setVisibleLines(idx + 1);
              setTypingLine("");
              clearInterval(interval);
              if (idx === lines.length - 1) setAllDone(true);
            }
          }, TYPING_SPEED);
          timers.push(interval as unknown as ReturnType<typeof setTimeout>);
        }, delay)
      );
      delay += line.text.length * TYPING_SPEED + 200;
    });

    return () => timers.forEach(clearTimeout);
  }, [lines, startAt]);

  return (
    <div
      className={`flex-1 min-w-[140px] bg-[var(--color-terminal-bg)] p-2.5 font-mono text-[10px] md:text-xs overflow-hidden ${focused ? "ring-1 ring-[var(--color-accent)] ring-inset" : ""}`}
    >
      {lines.slice(0, visibleLines).map((line, i) => (
        <div key={i} className={line.dim ? "text-[var(--color-text-dim)] opacity-60" : ""}>
          {line.prefix && (
            <span className="text-[var(--color-green)] mr-1.5">{line.prefix}</span>
          )}
          <span className={line.dim ? "" : "text-[var(--color-text)]"}>{line.text}</span>
        </div>
      ))}
      {visibleLines < lines.length && typingLine && (
        <div>
          {lines[visibleLines].prefix && (
            <span className="text-[var(--color-green)] mr-1.5">{lines[visibleLines].prefix}</span>
          )}
          <span className="text-[var(--color-text)]">{typingLine}</span>
          {focused && <Cursor />}
        </div>
      )}
      {allDone && focused && (
        <div className="mt-0.5 flex">
          <span className="text-[var(--color-green)] mr-1.5">→</span>
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
      className={`flex-1 min-w-[140px] bg-[#111113] p-2.5 font-mono text-[10px] md:text-xs text-[var(--color-text-dim)] overflow-hidden ${focused ? "ring-1 ring-[var(--color-accent)] ring-inset" : ""}`}
    >
      {content.split("\n").map((line, i) => (
        <div key={i} className="whitespace-pre leading-relaxed">
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
      <div className="flex divide-x divide-[var(--color-border)] h-32 md:h-40">
        {children}
      </div>
    </div>
  );
}

// Row 1: Claude Code working on auth
const ROW1_CLAUDE = [
  { text: "~/projects/saas", dim: true },
  { prefix: "→", text: "claude" },
  { text: "Claude Code v1.0.2", dim: true },
  { prefix: ">", text: "implement JWT auth middleware" },
  { text: "I'll create the auth middleware...", dim: true },
];

// Row 1 split: tests running
const ROW1_TESTS = [
  { text: "~/projects/saas", dim: true },
  { prefix: "→", text: "npm test -- --watch" },
  { text: "PASS src/auth.test.ts (4 tests)", dim: true },
  { text: "PASS src/middleware.test.ts (7 tests)", dim: true },
];

// Row 2: Claude Code working on frontend
const ROW2_CLAUDE = [
  { text: "~/projects/saas/web", dim: true },
  { prefix: "→", text: "claude" },
  { text: "Claude Code v1.0.2", dim: true },
  { prefix: ">", text: "add dark mode to the dashboard" },
  { text: "I'll update the theme provider...", dim: true },
];

// Row 2 split: dev server
const ROW2_DEV = [
  { text: "~/projects/saas/web", dim: true },
  { prefix: "→", text: "npm run dev" },
  { text: "ready on localhost:3000", dim: true },
  { text: "✓ compiled in 240ms", dim: true },
];

// Row 3: Claude Code on infra
const ROW3_CLAUDE = [
  { text: "~/projects/saas/infra", dim: true },
  { prefix: "→", text: "claude" },
  { text: "Claude Code v1.0.2", dim: true },
  { prefix: ">", text: "set up staging environment" },
  { text: "I'll create the Terraform config...", dim: true },
];

const EVENTS = [
  // Start: Row 1 with Claude Code on auth
  { t: 0, type: "start" },
  // Split Row 1: open test runner alongside Claude
  { t: 3500, type: "key", keys: "⌘ D" },
  { t: 4000, type: "split1" },
  // Focus notes, jot down plan
  { t: 6000, type: "key", keys: "⌘ →" },
  { t: 6300, type: "focus-r1-notes" },
  // New row: spin up another Claude for frontend
  { t: 9000, type: "key", keys: "⌘ ⇧ ↓" },
  { t: 9500, type: "row2" },
  // Split Row 2: dev server alongside Claude
  { t: 12000, type: "key", keys: "⌘ D" },
  { t: 12500, type: "split2" },
  // New row: third Claude for infra
  { t: 14500, type: "key", keys: "⌘ ⇧ ↓" },
  { t: 15000, type: "row3" },
  // Navigate between rows
  { t: 17000, type: "key", keys: "⌘ ↑" },
  { t: 17300, type: "focus-r2" },
  { t: 18500, type: "key", keys: "⌘ ↑" },
  { t: 18800, type: "focus-r1" },
  // Scroll down to show all rows
  { t: 20000, type: "scroll-down" },
  // Close app
  { t: 22000, type: "key", keys: "⌘ Q" },
  { t: 22500, type: "close-app" },
  // Reopen — all three Claude sessions resume
  { t: 25000, type: "reopen-app" },
  { t: 28000, type: "reset" },
] as const;

const CYCLE = 29000;

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
                setFocusedCell("r1-tests");
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
                setFocusedCell("r2-dev");
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
              case "close-app":
                setAppClosed(true);
                setShowKey(null);
                setFocusedCell("");
                break;
              case "reopen-app":
                setAppClosed(false);
                setResumed(true);
                setFocusedCell("r1-claude");
                setScrollOffset(0);
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
      {/* macOS window chrome */}
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
          style={{ height: "clamp(260px, 42vw, 400px)" }}
        >
          {/* Close overlay */}
          {appClosed && (
            <div
              className="absolute inset-0 z-30 bg-[var(--color-bg)] flex flex-col items-center justify-center gap-3"
              style={{ animation: "fadeInUp 0.3s ease-out both" }}
            >
              <div className="text-5xl opacity-40">∞</div>
              <div className="text-xs text-[var(--color-text-dim)]">
                3 Claude sessions saved
              </div>
              <div className="mt-2 text-[10px] text-[var(--color-accent)]">
                Reopening...
              </div>
            </div>
          )}

          {/* Resume badge */}
          {resumed && !appClosed && (
            <div
              className="absolute top-2 left-1/2 -translate-x-1/2 z-20 bg-[var(--color-green)]/10 border border-[var(--color-green)]/30 rounded-full px-3 py-0.5 text-[10px] text-[var(--color-green)]"
              style={{ animation: "fadeInUp 0.3s ease-out both" }}
            >
              Sessions resumed
            </div>
          )}

          <KeyCombo keys={showKey ?? ""} show={!!showKey} />

          <div
            className="transition-transform duration-500 ease-in-out"
            style={{
              transform: `translateY(-${scrollOffset * 168}px)`,
            }}
          >
            {/* Row 1: Auth — Claude + tests + notes */}
            <DemoRow title="Row #1 — auth service" show>
              <TerminalCell
                lines={ROW1_CLAUDE}
                startAt={400}
                focused={focusedCell === "r1-claude"}
              />
              {showSplit1 && (
                <TerminalCell
                  lines={ROW1_TESTS}
                  startAt={200}
                  focused={focusedCell === "r1-tests"}
                />
              )}
              <NotesCell
                text={"# Auth TODO\n\n- JWT middleware\n- refresh tokens\n- rate limiting\n- tests passing ✓"}
                focused={focusedCell === "r1-notes"}
              />
            </DemoRow>

            {/* Row 2: Frontend — Claude + dev server + notes */}
            <DemoRow title="Row #2 — frontend" show={showRow2}>
              <TerminalCell
                lines={ROW2_CLAUDE}
                startAt={300}
                focused={focusedCell === "r2-claude"}
              />
              {showSplit2 && (
                <TerminalCell
                  lines={ROW2_DEV}
                  startAt={200}
                  focused={focusedCell === "r2-dev"}
                />
              )}
              <NotesCell
                text={"# Frontend\n\n- dark mode toggle\n- dashboard layout\n- mobile responsive"}
                focused={focusedCell === "r2-notes"}
              />
            </DemoRow>

            {/* Row 3: Infra — Claude + notes */}
            <DemoRow title="Row #3 — infrastructure" show={showRow3}>
              <TerminalCell
                lines={ROW3_CLAUDE}
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

      {/* Scroll dots */}
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
