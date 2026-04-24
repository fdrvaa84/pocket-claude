'use client';

import {
  Globe,
  Smartphone,
  RefreshCw,
  Plug2,
  ShieldCheck,
  Zap,
} from 'lucide-react';

const FEATURES = [
  {
    icon: Globe,
    title: 'Multi-device',
    body: 'Servers, laptops, mac minis \u2014 all under one dashboard. Switch context with a tap.',
  },
  {
    icon: Smartphone,
    title: 'Mobile-first UI',
    body: 'Built for one-handed use on a phone. The desktop just gets the same UI, wider.',
  },
  {
    icon: RefreshCw,
    title: 'Resume anywhere',
    body: 'Close a tab, open another. Your conversation, files, and tool calls stay exactly where they were.',
  },
  {
    icon: Plug2,
    title: 'Multi-agent',
    body: 'Claude Code today. Aider, Gemini CLI, Codex coming next. Same chat, different brains.',
  },
  {
    icon: ShieldCheck,
    title: 'Your subscription',
    body: 'We never see your API keys or OAuth tokens. Auth stays on your device, on your terms.',
  },
  {
    icon: Zap,
    title: '5-minute setup',
    body: 'One curl. One web sign-in. No Docker compose files to debug at 2am.',
  },
];

export default function Features() {
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
            Features
          </p>
          <h2 className="text-[28px] font-semibold leading-[1.15] tracking-tight sm:text-[36px] md:text-[44px]">
            Built for the way you actually code now.
          </h2>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 md:grid-cols-3 md:mt-16">
          {FEATURES.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="rounded-[var(--radius)] border p-5 transition-colors sm:p-6"
              style={{
                background: 'var(--surface)',
                borderColor: 'var(--border)',
              }}
            >
              <div
                className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-lg border"
                style={{
                  background: 'var(--surface-2)',
                  borderColor: 'var(--border)',
                  color: 'var(--fg)',
                }}
              >
                <Icon size={17} strokeWidth={2.2} />
              </div>
              <h3 className="text-[15.5px] font-semibold tracking-tight">
                {title}
              </h3>
              <p
                className="mt-2 text-[13px] leading-[1.55]"
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
