'use client';

import { Terminal, Github } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="ln-footer">
      <div className="ln-container ln-footer-inner">
        <div className="ln-footer-grid">
          <div className="ln-footer-brand-col">
            <a href="#" className="ln-brand">
              <span className="ln-brand-mark">
                <Terminal size={13} strokeWidth={2.4} />
              </span>
              Autmzr Command
            </a>
            <p>Part of the Autmzr family — automation tools for builders.</p>
          </div>

          <FooterCol title="Product">
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
                <Github size={12} strokeWidth={1.6} />
                GitHub
              </a>
            </li>
          </FooterCol>

          <FooterCol title="Resources">
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
          </FooterCol>

          <FooterCol title="Legal">
            <li>
              <a href="#">Privacy</a>
            </li>
            <li>
              <a href="#">Terms</a>
            </li>
            <li>
              <a href="mailto:hello@autmzr.com">Contact</a>
            </li>
          </FooterCol>
        </div>

        <div className="ln-footer-bottom">
          <span>
            Made by Autmzr · MIT License · {new Date().getFullYear()}
          </span>
          <span>v0.1.0</span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="ln-footer-col">
      <h4>{title}</h4>
      <ul>{children}</ul>
    </div>
  );
}
