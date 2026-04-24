'use client';

import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

const QUESTIONS: { q: string; a: React.ReactNode }[] = [
  {
    q: 'Is this safe? You’re running on my servers.',
    a: (
      <>
        <p>
          The whole codebase is MIT and on GitHub — inspect every line. The agent
          we install on your machine is a single Node script that talks to the
          master over WebSocket. It never reads your{' '}
          <code className="font-mono">~/.claude/</code> directory or touches
          your OAuth tokens.
        </p>
        <p>
          For the hosted plan, the same code runs on our box — the difference
          is who pays the SSL bill.
        </p>
      </>
    ),
  },
  {
    q: 'Which AI tools are supported?',
    a: (
      <>
        <p>
          Anthropic’s Claude Code CLI is shipping today. Aider, Gemini CLI,
          Codex CLI, and Cursor-Agent are next on the roadmap. If a tool runs in
          a terminal and speaks streaming JSON, we can probably wire it up.
        </p>
      </>
    ),
  },
  {
    q: 'Can I use one Claude Pro subscription across multiple devices?',
    a: (
      <>
        <p>
          Yes — because each device runs its own{' '}
          <code className="font-mono">claude</code> CLI bound to your account.
          Anthropic’s rate limits still apply per subscription, so don’t expect
          to triple your throughput. But you do get to start a task on the VPS
          and finish it on the laptop without re-authenticating.
        </p>
      </>
    ),
  },
  {
    q: 'What if my server goes down?',
    a: (
      <>
        <p>
          That device shows up offline in the UI. Your other devices keep
          working. Conversations stay on whichever machine ran them — they
          come back when the device comes back.
        </p>
        <p>
          On the hosted plan, the master itself is replicated. Your devices are
          your problem, but the dashboard always works.
        </p>
      </>
    ),
  },
  {
    q: 'How is this different from Cursor, Replit, or GitHub Codespaces?',
    a: (
      <>
        <p>
          They sell you compute — their VMs, their bill. We sell you a remote
          control. You already have a laptop, a home server, a $4/mo VPS:
          Autmzr Command turns them into your distributed AI workstation.
        </p>
        <p>
          You also keep your existing Claude Pro / Max / API key. No double
          subscriptions.
        </p>
      </>
    ),
  },
  {
    q: 'When is the mobile app coming?',
    a: (
      <>
        <p>
          The web app is mobile-first by design — install it from your browser
          to your home screen and it behaves like one. A native iOS / Android
          shell is on the v0.3 roadmap, mostly for push notifications when the
          agent needs your attention.
        </p>
      </>
    ),
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="relative w-full" style={{ background: 'var(--bg-2)' }}>
      <div className="mx-auto w-full max-w-[820px] px-6 py-20 md:py-28">
        <div className="text-center">
          <p
            className="mb-3 font-mono text-[11px] uppercase tracking-[0.14em]"
            style={{ color: 'var(--vibrant)' }}
          >
            FAQ
          </p>
          <h2 className="text-[28px] font-semibold leading-[1.15] tracking-tight sm:text-[36px] md:text-[44px]">
            Honest answers to honest questions.
          </h2>
        </div>

        <div className="mt-12 space-y-2.5 md:mt-16">
          {QUESTIONS.map((item, i) => {
            const isOpen = open === i;
            return (
              <div
                key={item.q}
                className="rounded-[var(--radius)] border transition-colors"
                style={{
                  background: 'var(--surface)',
                  borderColor: isOpen
                    ? 'var(--border-strong)'
                    : 'var(--border)',
                }}
              >
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left sm:px-6"
                >
                  <span className="text-[14.5px] font-semibold tracking-tight sm:text-[15.5px]">
                    {item.q}
                  </span>
                  <span
                    className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full"
                    style={{
                      background: isOpen
                        ? 'var(--vibrant-tint)'
                        : 'var(--surface-2)',
                      color: isOpen ? 'var(--vibrant)' : 'var(--muted)',
                    }}
                  >
                    {isOpen ? <Minus size={14} /> : <Plus size={14} />}
                  </span>
                </button>
                {isOpen && (
                  <div
                    className="space-y-2.5 px-5 pb-5 text-[13.5px] leading-[1.6] animate-fadeUp sm:px-6 sm:pb-6"
                    style={{ color: 'var(--fg-2)' }}
                  >
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
