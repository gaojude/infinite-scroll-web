import { Demo } from "./demo";

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center px-4 pt-20 pb-12 md:pt-32 md:pb-20">
        <div className="animate-fade-in-up text-center max-w-2xl mx-auto">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight leading-tight">
            Infinite Scroll
          </h1>
          <p className="mt-4 text-[var(--color-text-dim)] text-sm md:text-base max-w-md mx-auto">
            A terminal workspace that never forgets.
            <br />
            Split, stack, and persist your sessions.
          </p>
        </div>

        <div className="animate-fade-in-up-delay mt-8 flex flex-col sm:flex-row gap-3">
          <a
            href="/InfiniteScroll.dmg"
            className="inline-flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download for macOS
          </a>
          <a
            href="https://github.com/gaojude/infinite-scroll"
            target="_blank"
            className="inline-flex items-center gap-2 border border-[var(--color-border)] px-5 py-2.5 rounded-lg text-sm font-medium text-[var(--color-text-dim)] hover:text-white hover:border-[var(--color-text-dim)] transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            Source
          </a>
        </div>
      </section>

      {/* Interactive Demo */}
      <section className="px-4 pb-16 md:pb-24">
        <div className="max-w-5xl mx-auto animate-fade-in-up-delay-2">
          <Demo />
        </div>
      </section>

      {/* Features */}
      <section className="px-4 pb-16 md:pb-24">
        <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <Feature
            icon="⌘D"
            title="Split anything"
            desc="Duplicate terminals or notes. Each row grows to fit."
          />
          <Feature
            icon="↺"
            title="Session persistence"
            desc="Quit and reopen. Your sessions survive via tmux."
          />
          <Feature
            icon="⌘↑↓←→"
            title="Keyboard native"
            desc="Navigate rows and cells without touching the mouse."
          />
        </div>
      </section>

      {/* Shortcuts */}
      <section className="px-4 pb-16 md:pb-24">
        <div className="max-w-md mx-auto">
          <h2 className="text-center text-lg font-medium mb-6">Shortcuts</h2>
          <div className="space-y-2 text-sm">
            <Shortcut keys="⌘ D" desc="Duplicate cell" />
            <Shortcut keys="⌘ W" desc="Close cell" />
            <Shortcut keys="⌘ ⇧ ↓" desc="New row" />
            <Shortcut keys="⌘ ↑ ↓" desc="Navigate rows" />
            <Shortcut keys="⌘ ← →" desc="Navigate cells" />
            <Shortcut keys="⌘ + / −" desc="Zoom in / out" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--color-border)] px-4 py-8 text-center text-xs text-[var(--color-text-dim)]">
        <a
          href="https://github.com/gaojude/infinite-scroll"
          className="hover:text-white transition-colors"
        >
          github.com/gaojude/infinite-scroll
        </a>
      </footer>
    </main>
  );
}

function Feature({
  icon,
  title,
  desc,
}: {
  icon: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="p-4">
      <div className="text-2xl mb-2 text-[var(--color-accent)]">{icon}</div>
      <h3 className="font-medium text-sm mb-1">{title}</h3>
      <p className="text-xs text-[var(--color-text-dim)]">{desc}</p>
    </div>
  );
}

function Shortcut({ keys, desc }: { keys: string; desc: string }) {
  return (
    <div className="flex justify-between items-center py-1.5 px-3 rounded bg-[var(--color-surface)]">
      <span className="text-[var(--color-text-dim)]">{desc}</span>
      <kbd className="text-[var(--color-accent)] text-xs">{keys}</kbd>
    </div>
  );
}
