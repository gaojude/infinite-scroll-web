"use client";

import { useEffect, useRef, useState } from "react";

export default function AISection() {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            io.disconnect();
            break;
          }
        }
      },
      { threshold: 0.15 }
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      aria-labelledby="ai-section-heading"
      className="w-full max-w-2xl mt-28 mx-auto"
    >
      <div className={visible ? "animate-fade-in-up" : "opacity-0"}>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase border border-[var(--color-accent)] text-[var(--color-accent)] bg-[rgba(102,153,255,0.08)]">
            New
          </span>
          <h2
            id="ai-section-heading"
            className="text-xl md:text-2xl font-semibold tracking-tight"
          >
            Orchestrate a fleet of AI agents
          </h2>
        </div>

        <p className="mt-4 text-[var(--color-text-dim)] text-sm md:text-base leading-relaxed">
          One agent in the top cell drives the rest. It spawns worker
          terminals, sends them commands, watches their output, and reports
          back — all through the <span className="text-[var(--color-text)]">infinite-scroll</span> CLI.
        </p>

        <ol className="mt-8 flex flex-col gap-5">
          <li className="flex gap-4">
            <span
              aria-hidden
              className="flex-shrink-0 w-6 h-6 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-accent)] text-xs flex items-center justify-center font-semibold"
            >
              1
            </span>
            <div className="text-sm md:text-base leading-relaxed">
              <div className="text-[var(--color-text)]">Run your AI agent in the top cell.</div>
              <div className="text-[var(--color-text-dim)] mt-1">
                Open the top terminal cell and start Claude Code (or any
                agent that runs in a terminal).
              </div>
            </div>
          </li>

          <li className="flex gap-4">
            <span
              aria-hidden
              className="flex-shrink-0 w-6 h-6 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-accent)] text-xs flex items-center justify-center font-semibold"
            >
              2
            </span>
            <div className="text-sm md:text-base leading-relaxed">
              <div className="text-[var(--color-text)]">
                From the menu bar, choose{" "}
                <span className="font-mono text-[var(--color-accent)]">Edit → Copy CLI Prompt</span>.
              </div>
              <div className="text-[var(--color-text-dim)] mt-1">
                Paste it as the first message to your agent. It turns the
                agent into an orchestrator that knows how to drive the
                fleet.
              </div>
            </div>
          </li>

          <li className="flex gap-4">
            <span
              aria-hidden
              className="flex-shrink-0 w-6 h-6 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-accent)] text-xs flex items-center justify-center font-semibold"
            >
              3
            </span>
            <div className="text-sm md:text-base leading-relaxed">
              <div className="text-[var(--color-text)]">Tell it what you want.</div>
              <div className="text-[var(--color-text-dim)] mt-1">
                The agent spawns worker rows, delegates tasks across them,
                polls their output, and brings your attention back when
                something needs you.
              </div>
            </div>
          </li>
        </ol>

        <pre
          aria-label="Workspace layout"
          className="mt-8 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg px-4 py-3 text-[11px] md:text-xs text-[var(--color-text-dim)] leading-relaxed overflow-x-auto"
        >
{`Row 0    │ your agent  (you talk to this one)
─────────┼──────────────────────────────────────
Row 1    │ worker  │  worker         spawned by
Row 2    │ worker                    your agent
Row 3    │ ...`}
        </pre>
      </div>
    </section>
  );
}
