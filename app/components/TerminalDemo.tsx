"use client";

import { useState, useEffect, useCallback, useRef } from "react";

// --- Types ---

interface Span {
  text: string;
  green?: boolean;
}

interface Line {
  type: "dir" | "prompt" | "output";
  spans: Span[];
}

interface CellState {
  lines: Line[];
  typing: string | null;
  cursorVisible: boolean;
}

interface RowState {
  id: number;
  title: string;
  cells: CellState[];
  visible: boolean;
}

type Step =
  | { action: "type"; row: number; cell: number; dir: string; text: string; delay: number }
  | { action: "output"; row: number; cell: number; spans: Span[]; delay: number }
  | { action: "split"; row: number; delay: number }
  | { action: "addRow"; delay: number }
  | { action: "focus"; row: number; cell: number; hint?: string; delay: number }
  | { action: "wait"; delay: number };

// --- Animation script ---

const SCRIPT: Step[] = [
  // Row 1: type npm run dev
  { action: "type", row: 0, cell: 0, dir: "~/projects/api", text: "npm run dev", delay: 500 },
  { action: "output", row: 0, cell: 0, spans: [
    { text: "Server running on :3000" },
  ], delay: 600 },

  // Split Row 1 — Cmd+D
  { action: "split", row: 0, delay: 600 },
  { action: "focus", row: 0, cell: 1, delay: 200 },

  // Row 1, Cell 2: type npm test
  { action: "type", row: 0, cell: 1, dir: "~/projects/api", text: "npm test -- --watch", delay: 300 },
  { action: "output", row: 0, cell: 1, spans: [
    { text: "PASS", green: true },
    { text: " src/auth.test.ts" },
  ], delay: 500 },

  // Split again from cell 1 for 3 panes — Cmd+D
  { action: "split", row: 0, delay: 600 },
  { action: "focus", row: 0, cell: 2, delay: 200 },
  { action: "type", row: 0, cell: 2, dir: "~/projects/api", text: "npx prisma studio", delay: 300 },
  { action: "output", row: 0, cell: 2, spans: [
    { text: "Prisma Studio on :5555" },
  ], delay: 500 },

  // Add Row 2 — Cmd+Shift+↓
  { action: "addRow", delay: 600 },
  { action: "focus", row: 1, cell: 0, delay: 300 },

  // Row 2: docker
  { action: "type", row: 1, cell: 0, dir: "~/infra", text: "docker compose up", delay: 300 },
  { action: "output", row: 1, cell: 0, spans: [
    { text: "Container " },
    { text: "api", green: true },
    { text: " started" },
  ], delay: 500 },

  // Split Row 2
  { action: "split", row: 1, delay: 500 },
  { action: "focus", row: 1, cell: 1, delay: 200 },

  // Row 2 Cell 2: logs
  { action: "type", row: 1, cell: 1, dir: "~/infra", text: "tail -f /var/log/app.log", delay: 300 },
  { action: "output", row: 1, cell: 1, spans: [
    { text: "[info] GET /api/users 200 12ms" },
  ], delay: 400 },
  { action: "output", row: 1, cell: 1, spans: [
    { text: "[info] POST /api/auth 201 8ms" },
  ], delay: 400 },

  // Add Row 3 from Row 2 — Cmd+Shift+↓
  { action: "addRow", delay: 600 },
  { action: "focus", row: 2, cell: 0, delay: 300 },

  // Row 3: git
  { action: "type", row: 2, cell: 0, dir: "~/projects/api", text: "git status", delay: 300 },
  { action: "output", row: 2, cell: 0, spans: [
    { text: "On branch main" },
  ], delay: 250 },
  { action: "output", row: 2, cell: 0, spans: [
    { text: "2 files changed, 14 insertions(+)" },
  ], delay: 300 },

  // Split Row 3
  { action: "split", row: 2, delay: 500 },
  { action: "focus", row: 2, cell: 1, delay: 200 },
  { action: "type", row: 2, cell: 1, dir: "~/projects/api", text: "npm run lint", delay: 300 },
  { action: "output", row: 2, cell: 1, spans: [
    { text: "✓", green: true },
    { text: " No issues found" },
  ], delay: 500 },

  // Add Row 4 from Row 3 — Cmd+Shift+↓
  { action: "addRow", delay: 600 },
  { action: "focus", row: 3, cell: 0, delay: 300 },
  { action: "type", row: 3, cell: 0, dir: "~/projects/web", text: "npm run dev", delay: 300 },
  { action: "output", row: 3, cell: 0, spans: [
    { text: "ready - started on :3001" },
  ], delay: 500 },

  // Navigate around to show off — rapid focus changes
  { action: "focus", row: 2, cell: 0, hint: "⌘↑", delay: 400 },
  { action: "focus", row: 1, cell: 1, hint: "⌘↑", delay: 400 },
  { action: "output", row: 1, cell: 1, spans: [
    { text: "[info] GET /api/health 200 2ms" },
  ], delay: 300 },
  { action: "focus", row: 0, cell: 0, hint: "⌘↑", delay: 400 },
  { action: "focus", row: 0, cell: 2, hint: "⌘→", delay: 400 },
  { action: "focus", row: 3, cell: 0, hint: "⌘↓", delay: 400 },

  // Pause
  { action: "wait", delay: 2000 },
];

// --- Helpers ---

function makeEmptyCell(): CellState {
  return { lines: [], typing: null, cursorVisible: true };
}

function makeRow(id: number): RowState {
  return {
    id,
    title: `Row #${id}`,
    cells: [makeEmptyCell()],
    visible: true,
  };
}

function initialState(): { rows: RowState[]; focus: [number, number] } {
  return {
    rows: [makeRow(1)],
    focus: [0, 0],
  };
}

// --- Component ---

export default function TerminalDemo() {
  const [rows, setRows] = useState<RowState[]>(() => initialState().rows);
  const [focus, setFocus] = useState<[number, number]>([0, 0]);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [hint, setHint] = useState<string | null>(null);
  const [fading, setFading] = useState(false);
  const rowCountRef = useRef(1);
  const cancelRef = useRef(false);

  const sleep = useCallback((ms: number) => {
    return new Promise<void>((resolve) => {
      setTimeout(resolve, ms);
    });
  }, []);

  const typeText = useCallback(
    (row: number, cell: number, dir: string, text: string): Promise<void> => {
      return new Promise((resolve) => {
        // Add directory line first
        setRows((prev) => {
          const next = structuredClone(prev);
          if (next[row]?.cells[cell]) {
            next[row].cells[cell].lines.push({ type: "dir", spans: [{ text: dir }] });
            next[row].cells[cell].typing = "";
          }
          return next;
        });

        let i = 0;
        const interval = setInterval(() => {
          if (cancelRef.current) {
            clearInterval(interval);
            resolve();
            return;
          }
          i++;
          if (i <= text.length) {
            setRows((prev) => {
              const next = structuredClone(prev);
              if (next[row]?.cells[cell]) {
                next[row].cells[cell].typing = text.slice(0, i);
              }
              return next;
            });
          } else {
            clearInterval(interval);
            // Commit typed text as a prompt line
            setRows((prev) => {
              const next = structuredClone(prev);
              if (next[row]?.cells[cell]) {
                next[row].cells[cell].lines.push({ type: "prompt", spans: [{ text }] });
                next[row].cells[cell].typing = null;
              }
              return next;
            });
            resolve();
          }
        }, 55);
      });
    },
    []
  );

  const runLoop = useCallback(async () => {
    cancelRef.current = false;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      for (const step of SCRIPT) {
        if (cancelRef.current) return;

        switch (step.action) {
          case "type":
            await typeText(step.row, step.cell, step.dir, step.text);
            await sleep(step.delay);
            break;

          case "output":
            setRows((prev) => {
              const next = structuredClone(prev);
              if (next[step.row]?.cells[step.cell]) {
                next[step.row].cells[step.cell].lines.push({
                  type: "output",
                  spans: step.spans,
                });
              }
              return next;
            });
            await sleep(step.delay);
            break;

          case "split":
            setHint("⌘D");
            setRows((prev) => {
              const next = structuredClone(prev);
              if (next[step.row]) {
                next[step.row].cells.push(makeEmptyCell());
              }
              return next;
            });
            await sleep(1800);
            setHint(null);
            await sleep(step.delay - 1200 > 0 ? step.delay - 1200 : 0);
            break;

          case "addRow": {
            rowCountRef.current += 1;
            const newId = rowCountRef.current;
            const rowCount = rowCountRef.current;
            setHint("⌘ Shift ↓");
            setRows((prev) => [...prev, makeRow(newId)]);
            const totalHeight = rowCount * (ROW_HEIGHT + 10) + 10;
            const viewportH = 420;
            const needed = Math.max(0, totalHeight - viewportH);
            setScrollOffset(needed);
            await sleep(1800);
            setHint(null);
            await sleep(step.delay - 1200 > 0 ? step.delay - 1200 : 0);
            break;
          }

          case "focus":
            if (step.hint) setHint(step.hint);
            setFocus([step.row, step.cell]);
            if (step.hint) {
              await sleep(Math.min(step.delay, 1500));
              setHint(null);
              await sleep(Math.max(0, step.delay - 1500));
            } else {
              await sleep(step.delay);
            }
            break;

          case "wait":
            await sleep(step.delay);
            break;
        }
      }

      // Loop reset
      if (cancelRef.current) return;
      setFading(true);
      await sleep(800);
      const init = initialState();
      setRows(init.rows);
      setFocus(init.focus);
      setScrollOffset(0);
      setHint(null);
      rowCountRef.current = 1;
      await sleep(200);
      setFading(false);
      await sleep(600);
    }
  }, [typeText, sleep]);

  useEffect(() => {
    const timer = setTimeout(() => runLoop(), 800);
    return () => {
      cancelRef.current = true;
      clearTimeout(timer);
    };
  }, [runLoop]);

  // --- Render ---

  const ROW_HEIGHT = 150; // px per row in the mockup
  const HEADER_H = 28;

  return (
    <div
      className="terminal-demo-wrapper"
      style={{
        opacity: fading ? 0 : 1,
        transition: "opacity 0.6s ease",
      }}
    >
      {/* macOS window frame */}
      <div className="terminal-window">
        {/* Title bar */}
        <div className="terminal-titlebar">
          <div className="terminal-traffic-lights">
            <span className="tl-red" />
            <span className="tl-yellow" />
            <span className="tl-green" />
          </div>
          <span className="terminal-titlebar-text">Infinite Scroll</span>
          <div className="terminal-traffic-lights" style={{ visibility: "hidden" }}>
            <span className="tl-red" />
            <span className="tl-yellow" />
            <span className="tl-green" />
          </div>
        </div>

        {/* Canvas viewport */}
        <div className="terminal-viewport">
          <div
            className="terminal-canvas"
            style={{
              transform: `translateY(-${scrollOffset}px)`,
              transition: "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            {rows.map((row, ri) => (
              <div
                key={row.id}
                className="terminal-row"
                style={{
                  animation: ri > 0 ? "slideInRow 0.4s ease-out both" : undefined,
                }}
              >
                {/* Row header */}
                <div className="terminal-row-header">
                  <div className="terminal-status-dot" />
                  <span className="terminal-row-title">{row.title}</span>
                  <div style={{ flex: 1 }} />
                  <span className="terminal-row-btn">⊞</span>
                  <span className="terminal-row-btn">×</span>
                </div>

                {/* Cells */}
                <div className="terminal-cells" style={{ height: ROW_HEIGHT - HEADER_H }}>
                  {row.cells.map((cell, ci) => {
                    const isFocused = focus[0] === ri && focus[1] === ci;
                    return (
                      <div
                        key={`${row.id}-${ci}`}
                        className="terminal-cell"
                        style={{
                          boxShadow: isFocused
                            ? "inset 0 0 0 2px var(--color-accent)"
                            : "none",
                          transition: "box-shadow 0.25s ease",
                          flex: 1,
                          minWidth: 0,
                        }}
                      >
                        <div className="terminal-cell-content">
                          {cell.lines.map((line, li) => (
                            <div key={li} className="terminal-line">
                              {line.type === "dir" && (
                                <span className="t-dir">{line.spans[0]?.text}</span>
                              )}
                              {line.type === "prompt" && (
                                <>
                                  <span className="t-arrow">→ </span>
                                  <span className="t-cmd">{line.spans[0]?.text}</span>
                                </>
                              )}
                              {line.type === "output" && (
                                <span style={{ animation: "fadeInLine 0.3s ease both" }}>
                                  {line.spans.map((s, si) => (
                                    <span key={si} className={s.green ? "t-green" : "t-output"}>
                                      {s.text}
                                    </span>
                                  ))}
                                </span>
                              )}
                            </div>
                          ))}
                          {cell.typing !== null && (
                            <div className="terminal-line">
                              <span className="t-arrow">→ </span>
                              <span className="t-cmd">{cell.typing}</span>
                              <span className="t-cursor" />
                            </div>
                          )}
                          {cell.typing === null && isFocused && cell.lines.length > 0 && (
                            <div className="terminal-line">
                              <span className="t-arrow">→ </span>
                              <span className="t-cursor" />
                            </div>
                          )}
                          {cell.typing === null && isFocused && cell.lines.length === 0 && (
                            <div className="terminal-line">
                              <span className="t-cursor" />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Shortcut hint badge */}
          {hint && (
            <div className="terminal-hint" key={hint}>
              {hint}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
