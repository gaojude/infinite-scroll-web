"use client";

import { useState, useEffect, useRef } from "react";

const TYPING_SPEED = 40;

function useTypewriter(text: string, delay: number = 0) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    let i = 0;
    const timeout = setTimeout(() => {
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
    }, delay);
    return () => clearTimeout(timeout);
  }, [text, delay]);

  return { displayed, done };
}

function TerminalCell({ lines, prompt, delay }: { lines: string[]; prompt: string; delay: number }) {
  const { displayed, done } = useTypewriter(prompt, delay);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [displayed]);

  return (
    <div
      ref={ref}
      className="flex-1 min-w-[140px] bg-[var(--color-terminal-bg)] p-3 font-mono text-xs md:text-sm overflow-hidden"
    >
      {lines.map((line, i) => (
        <div key={i} className="text-[var(--color-text-dim)] whitespace-pre">
          {line}
        </div>
      ))}
      <div className="flex">
        <span className="text-[var(--color-green)] mr-2">→</span>
        <span className="text-[var(--color-text)]">{displayed}</span>
        {!done && (
          <span
            className="inline-block w-2 h-4 bg-[var(--color-text)] ml-0.5"
            style={{ animation: "blink 1s step-end infinite" }}
          />
        )}
      </div>
      {done && (
        <div className="mt-1 text-[var(--color-text-dim)]">
          <span className="text-[var(--color-green)] mr-2">→</span>
          <span
            className="inline-block w-2 h-4 bg-[var(--color-text)] ml-0.5"
            style={{ animation: "blink 1s step-end infinite" }}
          />
        </div>
      )}
    </div>
  );
}

function NotesCell({ text, delay }: { text: string; delay: number }) {
  const { displayed } = useTypewriter(text, delay);

  return (
    <div className="flex-1 min-w-[140px] bg-[#121214] p-3 font-mono text-xs md:text-sm text-[var(--color-text-dim)]">
      {displayed.split("\n").map((line, i) => (
        <div key={i} className="whitespace-pre">
          {line || "\u00A0"}
        </div>
      ))}
    </div>
  );
}

function DemoRow({
  title,
  cells,
  delay,
}: {
  title: string;
  cells: React.ReactNode;
  delay: number;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  if (!visible) return null;

  return (
    <div
      className="rounded-lg border border-[var(--color-border)] overflow-hidden"
      style={{ animation: "fadeInUp 0.4s ease-out both" }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-3 h-7 bg-[var(--color-surface-2)] border-b border-[var(--color-border)]">
        <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-green)]" />
        <span className="text-[10px] md:text-xs text-[var(--color-text-dim)]">
          {title}
        </span>
      </div>
      {/* Cells */}
      <div className="flex divide-x divide-[var(--color-border)] h-36 md:h-48 overflow-x-auto">
        {cells}
      </div>
    </div>
  );
}

export function Demo() {
  const [showSecondRow, setShowSecondRow] = useState(false);
  const [showSplit, setShowSplit] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setShowSplit(true), 3500);
    const t2 = setTimeout(() => setShowSecondRow(true), 5500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <div className="space-y-3">
      {/* Keyboard hint */}
      <div className="flex justify-end gap-3 text-[10px] text-[var(--color-text-dim)] px-1">
        <span>
          {showSplit ? (
            <span style={{ animation: "fadeInUp 0.3s ease-out both" }}>
              <kbd className="text-[var(--color-accent)]">⌘D</kbd> split
            </span>
          ) : null}
        </span>
        <span>
          {showSecondRow ? (
            <span style={{ animation: "fadeInUp 0.3s ease-out both" }}>
              <kbd className="text-[var(--color-accent)]">⌘⇧↓</kbd> new row
            </span>
          ) : null}
        </span>
      </div>

      {/* Row 1 */}
      <DemoRow
        title="Row #1"
        delay={0}
        cells={
          <>
            <TerminalCell
              lines={["~/projects/api"]}
              prompt="npm run dev"
              delay={800}
            />
            {showSplit && (
              <TerminalCell
                lines={["~/projects/api"]}
                prompt="npm test -- --watch"
                delay={3800}
              />
            )}
            <NotesCell
              text={"# API Sprint\n\n- [x] auth middleware\n- [ ] rate limiting\n- [ ] error handling"}
              delay={1800}
            />
          </>
        }
      />

      {/* Row 2 */}
      {showSecondRow && (
        <DemoRow
          title="Row #2"
          delay={0}
          cells={
            <>
              <TerminalCell
                lines={["~/projects/frontend"]}
                prompt="claude"
                delay={400}
              />
              <NotesCell
                text={"# Frontend Tasks\n\n- dark mode toggle\n- fix nav on mobile"}
                delay={800}
              />
            </>
          }
        />
      )}
    </div>
  );
}
