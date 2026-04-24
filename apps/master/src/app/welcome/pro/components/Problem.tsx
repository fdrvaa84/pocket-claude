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
    <section className="ln-section" id="problem">
      <div className="ln-container">
        <div className="ln-section-head center">
          <span className="ln-eyebrow">The problem</span>
          <h2 className="ln-h2">
            Why does your dev setup{' '}
            <span style={{ color: 'var(--muted)' }}>hate mobile?</span>
          </h2>
        </div>

        <div className="ln-grid cols-2">
          {PROBLEMS.map(({ icon: Icon, title, body }) => (
            <article key={title} className="ln-card">
              <span className="icon-box">
                <Icon size={16} strokeWidth={1.5} />
              </span>
              <h3 className="ln-h3">{title}</h3>
              <p className="ln-body" style={{ marginTop: 8 }}>
                {body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
