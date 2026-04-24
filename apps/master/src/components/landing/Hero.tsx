'use client';

import { ArrowRight, Github, Terminal } from 'lucide-react';

export default function Hero() {
  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ background: 'var(--bg)' }}
    >
      {/* Soft gradient blob — единственный декоративный элемент */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[480px] w-[720px] -translate-x-1/2 rounded-full opacity-60 blur-3xl"
        style={{ background: 'var(--vibrant-tint)' }}
      />

      {/* Top nav */}
      <nav className="relative z-10 mx-auto flex w-full max-w-[1100px] items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2">
          <div
            className="flex h-7 w-7 items-center justify-center rounded-lg"
            style={{ background: 'var(--accent)', color: 'var(--bg)' }}
          >
            <Terminal size={15} strokeWidth={2.4} />
          </div>
          <span className="text-[15px] font-semibold tracking-tight">
            Autmzr Command
          </span>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="https://github.com/autmzr/autmzr-command"
            target="_blank"
            rel="noreferrer"
            className="btn btn-ghost text-[12.5px]"
          >
            <Github size={14} />
            <span className="hidden sm:inline">GitHub</span>
          </a>
          <a href="/" className="btn btn-secondary text-[12.5px]">
            Sign in
          </a>
        </div>
      </nav>

      {/* Hero content */}
      <div className="relative z-10 mx-auto w-full max-w-[1100px] px-6 pb-16 pt-10 sm:pt-16 md:pb-24 md:pt-24">
        <div className="mx-auto max-w-[820px] text-center">
          <div
            className="mb-6 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11.5px] font-mono"
            style={{
              borderColor: 'var(--border)',
              background: 'var(--surface)',
              color: 'var(--muted)',
            }}
          >
            <span
              className="inline-block h-1.5 w-1.5 rounded-full"
              style={{ background: 'var(--ok)' }}
            />
            v0.1 · open-source · MIT
          </div>

          <h1
            className="text-[36px] font-semibold leading-[1.05] tracking-tight sm:text-[52px] md:text-[64px]"
            style={{ color: 'var(--fg)' }}
          >
            Your AI command center.
            <br />
            <span style={{ color: 'var(--vibrant)' }}>In your pocket.</span>
          </h1>

          <p
            className="mx-auto mt-6 max-w-[620px] text-[15px] leading-[1.6] sm:text-[17px]"
            style={{ color: 'var(--fg-2)' }}
          >
            Run Claude Code, Aider, and other AI agents on your own servers.
            Drive them all from one phone-friendly chat. One subscription, every
            device, anywhere you happen to be.
          </p>

          <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center">
            <a
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-[14px] font-semibold transition-colors"
              style={{
                background: 'var(--vibrant)',
                color: 'var(--vibrant-fg)',
              }}
            >
              Try free
              <ArrowRight size={16} />
            </a>
            <a
              href="https://github.com/autmzr/autmzr-command"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full border px-6 py-3 text-[14px] font-semibold transition-colors"
              style={{
                background: 'var(--surface)',
                borderColor: 'var(--border)',
                color: 'var(--fg)',
              }}
            >
              <Github size={16} />
              Star on GitHub
            </a>
          </div>

          <p
            className="mt-5 text-[12px] font-mono"
            style={{ color: 'var(--muted)' }}
          >
            Open-source · MIT · Self-hosted or $5/mo hosted
          </p>
        </div>

        {/* Phone mockup */}
        <div className="mt-16 flex justify-center sm:mt-20">
          <PhoneMockup />
        </div>
      </div>
    </section>
  );
}

/** Статичный CSS-мокап телефона с фейковым chat-UI приложения */
function PhoneMockup() {
  return (
    <div
      className="relative mx-auto w-[300px] sm:w-[340px]"
      style={{
        filter: 'drop-shadow(0 30px 60px rgba(58,54,49,.18))',
      }}
    >
      {/* Frame */}
      <div
        className="relative rounded-[44px] p-[10px]"
        style={{
          background: 'var(--accent)',
          boxShadow:
            'inset 0 0 0 1.5px rgba(255,255,255,.06), 0 1px 2px rgba(0,0,0,.4)',
        }}
      >
        {/* Notch */}
        <div className="relative flex justify-center pb-[6px]">
          <div
            className="h-[22px] w-[100px] rounded-b-[14px]"
            style={{ background: 'var(--accent)' }}
          />
          <div
            aria-hidden
            className="absolute left-1/2 top-[6px] h-[8px] w-[64px] -translate-x-1/2 rounded-full"
            style={{ background: '#000', opacity: 0.6 }}
          />
        </div>

        {/* Screen */}
        <div
          className="overflow-hidden rounded-[34px]"
          style={{ background: 'var(--bg)' }}
        >
          <FakeChatUI />
        </div>
      </div>
    </div>
  );
}

function FakeChatUI() {
  return (
    <div className="flex h-[560px] flex-col">
      {/* Header */}
      <div
        className="flex items-center justify-between border-b px-4 py-3"
        style={{ borderColor: 'var(--border)' }}
      >
        <div className="flex items-center gap-2">
          <div
            className="h-2 w-2 rounded-full"
            style={{ background: 'var(--ok)' }}
          />
          <span className="text-[12px] font-medium">home-mac</span>
          <span className="text-[11px]" style={{ color: 'var(--muted)' }}>
            · autmzr-command
          </span>
        </div>
        <span className="font-mono text-[10px]" style={{ color: 'var(--muted)' }}>
          claude
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-3 overflow-hidden p-4">
        <Bubble role="user">
          Refactor the auth flow into a hook
        </Bubble>
        <Bubble role="assistant">
          <p className="m-0">Looking at <code className="font-mono">AuthScreen.tsx</code>. I&rsquo;ll extract:</p>
          <ul className="mt-1.5 list-disc space-y-0.5 pl-4">
            <li><code className="font-mono">useAuth()</code> — state + submit</li>
            <li><code className="font-mono">useInviteCode()</code> — URL parse</li>
          </ul>
        </Bubble>
        <Bubble role="tool">
          <span className="font-mono text-[10.5px]">
            edit · src/hooks/useAuth.ts · +47 -3
          </span>
        </Bubble>
        <Bubble role="assistant">
          <p className="m-0 text-[12.5px]">Done. Tests pass. Want me to wire it into the page?</p>
        </Bubble>
      </div>

      {/* Composer */}
      <div
        className="border-t p-3"
        style={{ borderColor: 'var(--border)' }}
      >
        <div
          className="flex items-center gap-2 rounded-2xl border px-3 py-2"
          style={{
            borderColor: 'var(--border)',
            background: 'var(--surface)',
          }}
        >
          <span
            className="text-[12.5px]"
            style={{ color: 'var(--muted)' }}
          >
            Reply to claude…
          </span>
          <span className="ml-auto typing-dots">
            <span /><span /><span />
          </span>
        </div>
      </div>
    </div>
  );
}

function Bubble({
  role,
  children,
}: {
  role: 'user' | 'assistant' | 'tool';
  children: React.ReactNode;
}) {
  if (role === 'tool') {
    return (
      <div
        className="rounded-lg border px-2.5 py-1.5 text-[11px]"
        style={{
          borderColor: 'var(--border)',
          background: 'var(--surface-2)',
          color: 'var(--muted)',
        }}
      >
        {children}
      </div>
    );
  }
  if (role === 'user') {
    return (
      <div className="flex justify-end">
        <div
          className="max-w-[80%] rounded-2xl rounded-tr-md px-3 py-2 text-[12.5px]"
          style={{
            background: 'var(--accent)',
            color: 'var(--bg)',
          }}
        >
          {children}
        </div>
      </div>
    );
  }
  return (
    <div className="flex justify-start">
      <div
        className="max-w-[88%] rounded-2xl rounded-tl-md px-3 py-2 text-[12.5px] leading-[1.5]"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          color: 'var(--fg)',
        }}
      >
        {children}
      </div>
    </div>
  );
}
