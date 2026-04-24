'use client';

import { useEffect, useState } from 'react';

function fmt(d: Date) {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getUTCFullYear()}.${p(d.getUTCMonth() + 1)}.${p(
    d.getUTCDate(),
  )} ${p(d.getUTCHours())}:${p(d.getUTCMinutes())}:${p(d.getUTCSeconds())} UTC`;
}

export default function Footer() {
  const [ts, setTs] = useState<string>('');

  useEffect(() => {
    setTs(fmt(new Date()));
    const id = setInterval(() => setTs(fmt(new Date())), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <footer className="tac-foot">
      <div className="tac-foot-inner">
        <div className="tac-foot-grid">
          <div className="tac-foot-brand">
            <div className="logo">
              <span className="glyph">A</span>
              AUTMZR/COMMAND
            </div>
            <p>
              Part of the Autmzr family — automation tools for builders.
            </p>
            <div style={{ marginTop: 6 }}>
              <span className="tac-tag">[v0.1.0]</span>{' '}
              <span className="tac-tag ok">[OPERATIONAL]</span>
            </div>
          </div>

          <div className="tac-foot-cols">
            <div>
              <h4>// PRODUCT</h4>
              <ul>
                <li>
                  <a href="/">Sign in</a>
                </li>
                <li>
                  <a href="#pricing">Pricing</a>
                </li>
                <li>
                  <a
                    href="https://github.com/autmzr/autmzr-command"
                    target="_blank"
                    rel="noreferrer"
                  >
                    GitHub
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4>// RESOURCES</h4>
              <ul>
                <li>
                  <a
                    href="https://github.com/autmzr/autmzr-command#readme"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Docs
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/autmzr/autmzr-command/issues"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Report a bug
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/autmzr/autmzr-command/releases"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Changelog
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4>// LEGAL</h4>
              <ul>
                <li>
                  <a href="#">Privacy</a>
                </li>
                <li>
                  <a href="#">Terms</a>
                </li>
                <li>
                  <a href="mailto:hello@autmzr.com">Contact</a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="tac-foot-bar">
          <span>
            MADE BY AUTMZR · MIT LICENSE · {new Date().getFullYear()}
          </span>
          <span>
            <span className="ts">[{ts || '----.--.-- --:--:-- UTC'}]</span>
          </span>
        </div>
      </div>
    </footer>
  );
}
