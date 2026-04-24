'use client';

const PROBLEMS = [
  {
    n: '01',
    title: 'CLOSE THE LID, KILL THE AGENT.',
    body: 'Step away from your desk and your AI session dies with it. Long tasks need a machine that never sleeps.',
  },
  {
    n: '02',
    title: 'ALWAYS-ON WORK, SOMETIMES-ON HARDWARE.',
    body: 'Refactoring 50 files or running an overnight build shouldn\u2019t depend on whether your laptop dozes off at 11pm.',
  },
  {
    n: '03',
    title: 'ONE WORKFLOW, THREE MACHINES.',
    body: 'Work laptop, home server, cheap VPS — each with its own context. Switching between them is a part-time job.',
  },
  {
    n: '04',
    title: 'PHONES CAN\u2019T SSH LIKE HUMANS.',
    body: 'You had an idea on the subway. The agent asked a question over lunch. By the time you\u2019re back at the keyboard, the moment is gone.',
  },
];

export default function Problem() {
  return (
    <section className="bru-section">
      <div className="bru-container">
        <div className="bru-eyebrow">▶ THE PROBLEM</div>
        <h2>
          Why does your dev setup
          <br />
          <span className="accent">hate mobile?</span>
        </h2>

        <div className="bru-grid-2">
          {PROBLEMS.map((p) => (
            <div key={p.n} className="bru-card">
              <span className="num mono">{p.n}.</span>
              <h3>{p.title}</h3>
              <p>{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
