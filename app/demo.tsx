"use client";

import { useState, useEffect, useRef } from "react";

const TYPING_SPEED = 35;

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
  dir,
  command,
  output,
  startAt,
  focused,
}: {
  dir: string;
  command: string;
  output?: string[];
  startAt: number;
  focused?: boolean;
}) {
  const { displayed, done } = useTypewriter(command, startAt);
  return (
    <div
      className={`flex-1 min-w-[120px] bg-[var(--color-terminal-bg)] p-2.5 font-mono text-[10px] md:text-xs overflow-hidden relative ${focused ? "ring-1 ring-[var(--color-accent)] ring-inset" : ""}`}
    >
      <div className="text-[var(--color-text-dim)] opacity-60">{dir}</div>
      <div className="flex mt-0.5">
        <span className="text-[var(--color-green)] mr-1.5">→</span>
        <span className="text-[var(--color-text)]">{displayed}</span>
        {!done && focused && <Cursor />}
      </div>
      {done && output && (
        <div className="mt-1 text-[var(--color-text-dim)] opacity-70">
          {output.map((l, i) => (
            <div key={i}>{l}</div>
          ))}
        </div>
      )}
      {done && (
        <div className="mt-0.5 flex">
          <span className="text-[var(--color-green)] mr-1.5">→</span>
          {focused && <Cursor />}
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
  const [typing, setTyping] = useState(false);
  const prevFocused = useRef(false);

  useEffect(() => {
    // Only start typing when focus arrives (transition from false→true)
    if (focused && !prevFocused.current && !typing && content.length < text.length) {
      setTyping(true);
      let i = content.length;
      const interval = setInterval(() => {
        if (i < text.length) {
          setContent(text.slice(0, i + 1));
          i++;
        } else {
          setTyping(false);
          clearInterval(interval);
        }
      }, TYPING_SPEED);
      return () => clearInterval(interval);
    }
    prevFocused.current = !!focused;
  }, [focused, text, typing, content.length]);

  return (
    <div
      className={`flex-1 min-w-[120px] bg-[#111113] p-2.5 font-mono text-[10px] md:text-xs text-[var(--color-text-dim)] overflow-hidden ${focused ? "ring-1 ring-[var(--color-accent)] ring-inset" : ""}`}
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
      <div className="flex divide-x divide-[var(--color-border)] h-28 md:h-36">
        {children}
      </div>
    </div>
  );
}

// Timeline: sequence of events with timestamps (ms)
const EVENTS = [
  { t: 0, type: "start" },
  { t: 2500, type: "key", keys: "⌘ D" },
  { t: 3000, type: "split1" },
  { t: 5000, type: "key", keys: "⌘ ⇧ ↓" },
  { t: 5500, type: "row2" },
  { t: 7500, type: "key", keys: "⌘ D" },
  { t: 8000, type: "split2" },
  { t: 10000, type: "key", keys: "⌘ ⇧ ↓" },
  { t: 10500, type: "row3" },
  { t: 12500, type: "key", keys: "⌘ ↑" },
  { t: 13000, type: "focus-r2" },
  { t: 14000, type: "key", keys: "⌘ →" },
  { t: 14500, type: "focus-r2-notes" },
  // Close the app
  { t: 16500, type: "key", keys: "⌘ Q" },
  { t: 17000, type: "close-app" },
  // Reopen — sessions resume
  { t: 19500, type: "reopen-app" },
  { t: 22500, type: "reset" },
] as const;

const CYCLE = 23500;

export function Demo() {
  const [tick, setTick] = useState(0);
  const [showKey, setShowKey] = useState<string | null>(null);
  const [showSplit1, setShowSplit1] = useState(false);
  const [showRow2, setShowRow2] = useState(false);
  const [showSplit2, setShowSplit2] = useState(false);
  const [showRow3, setShowRow3] = useState(false);
  const [focusedCell, setFocusedCell] = useState("r1-t1");
  const [scrollOffset, setScrollOffset] = useState(0);
  const [appClosed, setAppClosed] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const cycleRef = useRef(0);

  useEffect(() => {
    function runCycle() {
      // Reset
      setShowSplit1(false);
      setShowRow2(false);
      setShowSplit2(false);
      setShowRow3(false);
      setFocusedCell("r1-t1");
      setScrollOffset(0);
      setShowKey(null);
      setAppClosed(false);
      setTick((t) => t + 1);

      const timers: ReturnType<typeof setTimeout>[] = [];

      for (const event of EVENTS) {
        timers.push(
          setTimeout(() => {
            switch (event.type) {
              case "key":
                setShowKey(event.keys);
                setTimeout(() => setShowKey(null), 400);
                break;
              case "split1":
                setShowSplit1(true);
                setFocusedCell("r1-t2");
                break;
              case "row2":
                setShowRow2(true);
                setFocusedCell("r2-t1");
                break;
              case "split2":
                setShowSplit2(true);
                setFocusedCell("r2-t2");
                break;
              case "row3":
                setShowRow3(true);
                setFocusedCell("r3-t1");
                setScrollOffset(1);
                break;
              case "focus-r2":
                setFocusedCell("r2-t1");
                setScrollOffset(0);
                break;
              case "focus-r2-notes":
                setFocusedCell("r2-notes");
                break;
              case "close-app":
                setAppClosed(true);
                setShowKey(null);
                setFocusedCell("");
                break;
              case "reopen-app":
                setAppClosed(false);
                setFocusedCell("r2-t1");
                setScrollOffset(0);
                break;
            }
          }, event.t)
        );
      }

      const next = setTimeout(() => {
        cycleRef.current++;
        runCycle();
      }, CYCLE);
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

        {/* Viewport — clips and scrolls */}
        <div
          className="relative overflow-hidden"
          style={{ height: "clamp(240px, 40vw, 380px)" }}
        >
        {/* Close/reopen overlay */}
        {appClosed && (
          <div
            className="absolute inset-0 z-30 bg-[var(--color-bg)] flex flex-col items-center justify-center gap-4"
            style={{ animation: "fadeInUp 0.3s ease-out both" }}
          >
            <div className="text-4xl">∞</div>
            <div className="text-sm text-[var(--color-text-dim)]">
              Session saved. Reopening...
            </div>
          </div>
        )}

          <KeyCombo keys={showKey ?? ""} show={!!showKey} />

          <div
            ref={scrollRef}
            className="transition-transform duration-500 ease-in-out"
            style={{
              transform: `translateY(-${scrollOffset * 140}px)`,
            }}
          >
            {/* Row 1 */}
            <DemoRow title="Row #1" show>
              <TerminalCell
                dir="~/projects/api"
                command="npm run dev"
                output={["Server running on :3000"]}
                startAt={500}
                focused={focusedCell === "r1-t1"}
              />
              {showSplit1 && (
                <TerminalCell
                  dir="~/projects/api"
                  command="npm test -- --watch"
                  output={["PASS src/auth.test.ts"]}
                  startAt={0}
                  focused={focusedCell === "r1-t2"}
                />
              )}
              <NotesCell
                text={"# API Sprint\n\n- [x] auth middleware\n- [ ] rate limiting\n- [ ] logging"}
                focused={focusedCell === "r1-notes"}
              />
            </DemoRow>

            {/* Row 2 */}
            <DemoRow title="Row #2" show={showRow2}>
              <TerminalCell
                dir="~/projects/web"
                command="claude"
                output={["Claude Code v1.0"]}
                startAt={300}
                focused={focusedCell === "r2-t1"}
              />
              {showSplit2 && (
                <TerminalCell
                  dir="~/projects/web"
                  command="npm run build"
                  output={["✓ 47 modules built"]}
                  startAt={0}
                  focused={focusedCell === "r2-t2"}
                />
              )}
              <NotesCell
                text={"# Frontend\n\n- dark mode\n- mobile nav\n- perf audit"}
                focused={focusedCell === "r2-notes"}
              />
            </DemoRow>

            {/* Row 3 */}
            <DemoRow title="Row #3" show={showRow3}>
              <TerminalCell
                dir="~/projects/infra"
                command="terraform plan"
                output={["Plan: 3 to add, 0 to change"]}
                startAt={300}
                focused={focusedCell === "r3-t1"}
              />
              <NotesCell
                text={"# Infra\n\n- staging env\n- DNS cutover"}
                focused={focusedCell === "r3-notes"}
              />
            </DemoRow>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
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
