'use client';

import { Laptop2, Clock, Layers, MessageSquareDashed } from 'lucide-react';

const PROBLEMS = [
  {
    icon: Laptop2,
    title: 'Close the lid, kill the agent.',
    body: 'Step away from your desk and your AI session dies with it. Long tasks need a machine that never sleeps.',
  },
  {
    icon: Clock,
    title: 'Always-on work, sometimes-on hardware.',
    body: 'Refactoring 50 files or running an overnight build shouldn\u2019t depend on whether your laptop dozes off at 11pm.',
  },
  {
    icon: Layers,
    title: 'One workflow, three machines.',
    body: 'Work laptop, home server, cheap VPS \u2014 each with its own context. Switching between them is a part-time job.',
  },
  {
    icon: MessageSquareDashed,
    title: 'Phones can\u2019t SSH like humans.',
    body: 'You had an idea on the subway. The agent asked a question over lunch. By the time you\u2019re back at the keyboard, the moment is gone.',
  },
];

export default function Problem() {
  return (
    <section
      className="relative w-full"
      style={{ background: 'var(--bg-2)' }}
    >
      <div className="mx-auto w-full max-w-[1100px] px-6 py-20 md:py-28">
        <div className="mx-auto max-w-[700px] text-center">
          <p
            className="mb-3 font-mono text-[11px] uppercase tracking-[0.14em]"
            style={{ color: 'var(--vibrant)' }}
          >
            The problem
          </p>
          <h2
            className="text-[28px] font-semibold leading-[1.15] tracking-tight sm:text-[36px] md:text-[44px]"
          >
            Why does your dev setup
            <br className="hidden sm:block" />{' '}
            <span style={{ color: 'var(--muted)' }}>hate mobile?</span>
          </h2>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 md:mt-16">
          {PROBLEMS.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="rounded-[var(--radius)] border p-5 transition-colors sm:p-6"
              style={{
                background: 'var(--surface)',
                borderColor: 'var(--border)',
              }}
            >
              <div
                className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-lg"
                style={{
                  background: 'var(--vibrant-tint)',
                  color: 'var(--vibrant)',
                }}
              >
                <Icon size={18} strokeWidth={2.2} />
              </div>
              <h3 className="text-[16px] font-semibold tracking-tight sm:text-[17px]">
                {title}
              </h3>
              <p
                className="mt-2 text-[13.5px] leading-[1.55]"
                style={{ color: 'var(--fg-2)' }}
              >
                {body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
