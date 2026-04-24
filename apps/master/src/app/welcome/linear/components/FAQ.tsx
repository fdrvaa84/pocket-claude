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
          master over WebSocket. It never reads your <code>~/.claude/</code>{' '}
          directory or touches your OAuth tokens.
        </p>
        <p>
          For the hosted plan, the same code runs on our box — the difference is
          who pays the SSL bill.
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
          Yes — because each device runs its own <code>claude</code> CLI bound
          to your account. Anthropic’s rate limits still apply per
          subscription, so don’t expect to triple your throughput. But you do
          get to start a task on the VPS and finish it on the laptop without
          re-authenticating.
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
          working. Conversations stay on whichever machine ran them — they come
          back when the device comes back.
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
    <section className="ln-section" id="faq">
      <div className="ln-container ln-faq">
        <div className="ln-section-head center">
          <span className="ln-eyebrow">FAQ</span>
          <h2 className="ln-h2">Honest answers to honest questions.</h2>
        </div>

        <div className="ln-faq-list">
          {QUESTIONS.map((item, i) => {
            const isOpen = open === i;
            return (
              <div
                key={item.q}
                className={`ln-faq-item${isOpen ? ' open' : ''}`}
              >
                <button
                  type="button"
                  className="ln-faq-q"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                >
                  <span>{item.q}</span>
                  <span className="ln-faq-icon" aria-hidden>
                    {isOpen ? (
                      <Minus size={13} strokeWidth={2} />
                    ) : (
                      <Plus size={13} strokeWidth={2} />
                    )}
                  </span>
                </button>
                {isOpen && <div className="ln-faq-a">{item.a}</div>}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
