'use client';

import { Plug, Smartphone, MessageCircle } from 'lucide-react';

export default function HowItWorks() {
  return (
    <section
      className="relative w-full"
      style={{ background: 'var(--bg)' }}
    >
      <div className="mx-auto w-full max-w-[1100px] px-6 py-20 md:py-28">
        <div className="mx-auto max-w-[700px] text-center">
          <p
            className="mb-3 font-mono text-[11px] uppercase tracking-[0.14em]"
            style={{ color: 'var(--vibrant)' }}
          >
            How it works
          </p>
          <h2 className="text-[28px] font-semibold leading-[1.15] tracking-tight sm:text-[36px] md:text-[44px]">
            From zero to chatting in five minutes.
          </h2>
          <p
            className="mx-auto mt-4 max-w-[520px] text-[14.5px] leading-[1.55]"
            style={{ color: 'var(--fg-2)' }}
          >
            One curl on each machine. One web app to rule them.
          </p>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-3 md:gap-6">
          <Step
            number={1}
            icon={Plug}
            title="Connect"
            body="Run a single curl on any VPS, mac mini, or work laptop. The agent installs as a systemd / launchd service."
          >
            <CodeBlock>
              <span style={{ color: 'var(--muted)' }}>$ </span>
              curl -sSL pocket.app/connect.sh | bash
              {'\n'}
              <span style={{ color: 'var(--ok)' }}>
                {'->'} home-mac connected
              </span>
            </CodeBlock>
          </Step>

          <Step
            number={2}
            icon={Smartphone}
            title="Open"
            body="Sign in from your phone\u2019s browser. Every device you registered shows up in one list \u2014 online or off."
          >
            <DeviceList />
          </Step>

          <Step
            number={3}
            icon={MessageCircle}
            title="Command"
            body="Pick a device, send a task. The agent runs 24/7 on your hardware, streams every keystroke back."
          >
            <ChatPreview />
          </Step>
        </div>
      </div>
    </section>
  );
}

function Step({
  number,
  icon: Icon,
  title,
  body,
  children,
}: {
  number: number;
  icon: typeof Plug;
  title: string;
  body: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="flex flex-col rounded-[var(--radius)] border p-5 sm:p-6"
      style={{
        background: 'var(--surface)',
        borderColor: 'var(--border)',
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="flex h-7 w-7 items-center justify-center rounded-full font-mono text-[12px] font-semibold"
          style={{
            background: 'var(--vibrant)',
            color: 'var(--vibrant-fg)',
          }}
        >
          {number}
        </div>
        <Icon
          size={18}
          strokeWidth={2.2}
          style={{ color: 'var(--muted)' }}
        />
        <h3 className="text-[16px] font-semibold tracking-tight">{title}</h3>
      </div>
      <p
        className="mt-3 text-[13.5px] leading-[1.55]"
        style={{ color: 'var(--fg-2)' }}
      >
        {body}
      </p>
      <div className="mt-5 flex-1">{children}</div>
    </div>
  );
}

function CodeBlock({ children }: { children: React.ReactNode }) {
  return (
    <pre
      className="font-mono overflow-x-auto rounded-lg border p-3 text-[11.5px] leading-[1.55] whitespace-pre-wrap break-words"
      style={{
        background: 'var(--code-bg)',
        borderColor: 'var(--border)',
        color: 'var(--fg)',
      }}
    >
      {children}
    </pre>
  );
}

function DeviceList() {
  const devices = [
    { name: 'home-mac', status: 'ok', label: 'online' },
    { name: 'vps-fra-1', status: 'ok', label: 'online' },
    { name: 'work-laptop', status: 'muted', label: 'sleeping' },
  ];
  return (
    <div
      className="rounded-lg border p-2"
      style={{
        background: 'var(--bg)',
        borderColor: 'var(--border)',
      }}
    >
      {devices.map((d) => (
        <div
          key={d.name}
          className="flex items-center justify-between px-2.5 py-2"
        >
          <div className="flex items-center gap-2">
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{
                background:
                  d.status === 'ok' ? 'var(--ok)' : 'var(--muted)',
              }}
            />
            <span className="font-mono text-[12px]">{d.name}</span>
          </div>
          <span
            className="text-[10.5px]"
            style={{ color: 'var(--muted)' }}
          >
            {d.label}
          </span>
        </div>
      ))}
    </div>
  );
}

function ChatPreview() {
  return (
    <div className="space-y-2">
      <div
        className="ml-auto max-w-[85%] rounded-2xl rounded-tr-md px-3 py-2 text-[12.5px]"
        style={{
          background: 'var(--accent)',
          color: 'var(--bg)',
        }}
      >
        Add error handling to the upload route
      </div>
      <div
        className="max-w-[90%] rounded-2xl rounded-tl-md border px-3 py-2 text-[12.5px] leading-[1.5]"
        style={{
          background: 'var(--bg)',
          borderColor: 'var(--border)',
        }}
      >
        On it. Wrapping with try/catch and logging via{' '}
        <code className="font-mono">pino</code>.
      </div>
    </div>
  );
}
