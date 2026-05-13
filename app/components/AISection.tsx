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
          <span
            className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase border border-[var(--color-accent)] text-[var(--color-accent)] bg-[rgba(102,153,255,0.08)]"
          >
            New
          </span>
          <h2
            id="ai-section-heading"
            className="text-xl md:text-2xl font-semibold tracking-tight"
          >
            Brief your AI agent from the CLI
          </h2>
        </div>

        <p className="mt-4 text-[var(--color-text-dim)] text-sm md:text-base leading-relaxed">
          Drive the whole fleet from the command line. Your AI agent can read,
          write, and focus cells across every terminal in view. Edit a cell,
          hit <span className="text-[var(--color-text)]">Copy CLI Prompt</span>,
          and paste a ready-made brief into your agent — no copy-pasting state
          by hand.
        </p>

        <code className="mt-5 inline-block bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg px-3 py-1.5 text-xs text-[var(--color-accent)]">
          infinite-scroll focus row=2 cell=1
        </code>
      </div>
    </section>
  );
}
