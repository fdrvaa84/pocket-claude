'use client';

const PROBLEMS = [
  {
    code: 'P-01',
    title: 'CLOSE THE LID, KILL THE AGENT.',
    body: 'Step away from your desk and your AI session dies with it. Long tasks need a machine that never sleeps.',
  },
  {
    code: 'P-02',
    title: 'ALWAYS-ON WORK, SOMETIMES-ON HARDWARE.',
    body: 'Refactoring 50 files or running an overnight build shouldn\u2019t depend on whether your laptop dozes off at 11pm.',
  },
  {
    code: 'P-03',
    title: 'ONE WORKFLOW, THREE MACHINES.',
    body: 'Work laptop, home server, cheap VPS \u2014 each with its own context. Switching between them is a part-time job.',
  },
  {
    code: 'P-04',
    title: 'PHONES CAN\u2019T SSH LIKE HUMANS.',
    body: 'You had an idea on the subway. The agent asked a question over lunch. By the time you\u2019re back at the keyboard, the moment is gone.',
  },
];

export default function Problem() {
  return (
    <section className="tac-sec">
      <div className="tac-container">
        <div className="tac-sec-head">
          <div className="row">
            <span className="id">
              <span className="num">[01]</span> &nbsp; THE PROBLEM
            </span>
            <span className="tac-tag">FAULTS DETECTED · 04</span>
          </div>
          <h2 className="tac-h2">
            WHY DOES YOUR DEV SETUP HATE MOBILE?
          </h2>
        </div>

        <div className="tac-grid-2">
          {PROBLEMS.map((p) => (
            <div key={p.code} className="tac-prob">
              <div className="head">
                <span className="code">{p.code}</span>
                <span>FAULT REPORT</span>
                <span className="sev">SEV: HIGH</span>
              </div>
              <h3>{p.title}</h3>
              <p>{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
