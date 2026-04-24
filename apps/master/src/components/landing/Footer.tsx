'use client';

import { Terminal, Github } from 'lucide-react';

export default function Footer() {
  return (
    <footer
      className="w-full border-t"
      style={{
        background: 'var(--bg)',
        borderColor: 'var(--border)',
      }}
    >
      <div className="mx-auto w-full max-w-[1100px] px-6 py-12 md:py-14">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          {/* Brand */}
          <div className="max-w-[320px]">
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
            <p
              className="mt-3 text-[13px] leading-[1.55]"
              style={{ color: 'var(--fg-2)' }}
            >
              Part of the Autmzr family — automation tools for builders.
            </p>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 md:gap-12">
            <FooterCol title="Product">
              <FooterLink href="/">Sign in</FooterLink>
              <FooterLink href="#pricing">Pricing</FooterLink>
              <FooterLink
                href="https://github.com/autmzr/autmzr-command"
                external
              >
                <span className="inline-flex items-center gap-1.5">
                  <Github size={12} />
                  GitHub
                </span>
              </FooterLink>
            </FooterCol>
            <FooterCol title="Resources">
              <FooterLink
                href="https://github.com/autmzr/autmzr-command#readme"
                external
              >
                Docs
              </FooterLink>
              <FooterLink
                href="https://github.com/autmzr/autmzr-command/issues"
                external
              >
                Report a bug
              </FooterLink>
              <FooterLink
                href="https://github.com/autmzr/autmzr-command/releases"
                external
              >
                Changelog
              </FooterLink>
            </FooterCol>
            <FooterCol title="Legal">
              <FooterLink href="#">Privacy</FooterLink>
              <FooterLink href="#">Terms</FooterLink>
              <FooterLink href="mailto:hello@autmzr.com">Contact</FooterLink>
            </FooterCol>
          </div>
        </div>

        <div
          className="mt-10 flex flex-col items-start justify-between gap-3 border-t pt-6 sm:flex-row sm:items-center"
          style={{ borderColor: 'var(--border)' }}
        >
          <p
            className="font-mono text-[11.5px]"
            style={{ color: 'var(--muted)' }}
          >
            Made by Autmzr · MIT License · {new Date().getFullYear()}
          </p>
          <p
            className="font-mono text-[11.5px]"
            style={{ color: 'var(--muted)' }}
          >
            v0.1.0
          </p>
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
    <div>
      <h4
        className="font-mono text-[10.5px] uppercase tracking-[0.14em]"
        style={{ color: 'var(--muted)' }}
      >
        {title}
      </h4>
      <ul className="mt-3 space-y-2">{children}</ul>
    </div>
  );
}

function FooterLink({
  href,
  external,
  children,
}: {
  href: string;
  external?: boolean;
  children: React.ReactNode;
}) {
  return (
    <li>
      <a
        href={href}
        target={external ? '_blank' : undefined}
        rel={external ? 'noreferrer' : undefined}
        className="text-[13px] transition-colors hover:underline"
        style={{ color: 'var(--fg-2)' }}
      >
        {children}
      </a>
    </li>
  );
}
