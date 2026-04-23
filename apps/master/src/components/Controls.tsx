'use client';

import { useState, useRef, useEffect } from 'react';

// ---------------- Data ----------------

interface ModelSpec { value: string; label: string; badge?: string }

export const MODELS: ModelSpec[] = [
  { value: 'claude-opus-4-7',      label: 'Opus 4.7' },
  { value: 'claude-opus-4-7[1m]',  label: 'Opus 4.7', badge: '1M' },
  { value: 'claude-sonnet-4-6',    label: 'Sonnet 4.6' },
  { value: 'claude-haiku-4-5',     label: 'Haiku 4.5' },
];

export const EFFORTS = [
  { value: 'low',        label: 'Low' },
  { value: 'medium',     label: 'Medium' },
  { value: 'high',       label: 'High' },
  { value: 'extra_high', label: 'Extra high' },
  { value: 'max',        label: 'Max' },
] as const;

export const MODES = [
  { value: 'default',           label: 'Ask permissions',    hint: null,                       disabled: false },
  { value: 'acceptEdits',       label: 'Accept edits',        hint: null,                       disabled: false },
  { value: 'plan',              label: 'Plan mode',           hint: null,                       disabled: false },
  { value: 'bypassPermissions', label: 'Bypass permissions',  hint: null,                       disabled: false },
  { value: 'auto',              label: 'Auto mode',           hint: 'Enable in Claude Code settings', disabled: true },
] as const;

export type ModelValue = string;
export type EffortValue = typeof EFFORTS[number]['value'];
export type ModeValue = typeof MODES[number]['value'];

// ---------------- Popover primitive ----------------

function usePopover() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);
  return { open, setOpen, ref };
}

// ---------------- Mode pill ----------------

export function ModePill({ value, onChange }: { value: ModeValue; onChange: (v: ModeValue) => void }) {
  const { open, setOpen, ref } = usePopover();
  const current = MODES.find(m => m.value === value) || MODES[0];
  const isBypass = value === 'bypassPermissions';

  function onKey(e: KeyboardEvent) {
    if (!open) return;
    const n = Number(e.key);
    if (n >= 1 && n <= 4) {
      e.preventDefault();
      const pick = MODES[n - 1];
      if (!pick.disabled) { onChange(pick.value); setOpen(false); }
    }
    if (e.key === 'Escape') setOpen(false);
  }
  useEffect(() => {
    if (open) { window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey); }
  }); // eslint-disable-line

  return (
    <div className="relative" ref={ref}>
      <button type="button" onClick={() => setOpen(!open)}
        className="font-mono px-2.5 py-1 rounded-md text-[11.5px] inline-flex items-center gap-1"
        style={{
          background: isBypass ? '#f5c94c' : 'var(--surface-2)',
          color: isBypass ? '#2a2620' : 'var(--fg)',
          border: `1px solid ${isBypass ? '#e6b63a' : 'var(--border)'}`,
        }}>
        <span style={{ opacity: isBypass ? .65 : .55, fontWeight: 400 }}>mode=</span>
        <span style={{ fontWeight: 500 }}>{isBypass ? 'Bypass' : current.label.replace(/ permissions| mode/i, '').replace('Ask', 'Ask').trim()}</span>
      </button>
      {open && (
        <div className="absolute bottom-full mb-2 left-0 rounded-2xl overflow-hidden min-w-[260px] z-20 p-1.5"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: '0 8px 24px rgba(0,0,0,.14)' }}>
          <div className="flex items-center justify-between px-2 py-1.5">
            <div className="text-[11px] uppercase tracking-wider" style={{ color: 'var(--muted)' }}>Mode</div>
            <div className="flex gap-1">
              <Kbd>⇧</Kbd><Kbd>⌘</Kbd><Kbd>M</Kbd>
            </div>
          </div>
          {MODES.map((m, i) => (
            <button key={m.value}
              onClick={() => { if (!m.disabled) { onChange(m.value); setOpen(false); } }}
              disabled={m.disabled}
              className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-sm text-left"
              style={{
                opacity: m.disabled ? .5 : 1,
                background: value === m.value ? 'var(--accent-light)' : 'transparent',
                cursor: m.disabled ? 'not-allowed' : 'pointer',
              }}>
              <span className="flex-1">
                <span className="block">{m.label}</span>
                {m.hint && <span className="block text-[10.5px]" style={{ color: 'var(--muted)' }}>{m.hint}</span>}
              </span>
              {value === m.value && <span style={{ color: 'var(--fg)' }}>✓</span>}
              {!m.disabled && <span className="text-[10.5px]" style={{ color: 'var(--muted)' }}>{i + 1}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------- Model + Effort pill ----------------

export function ModelEffortPill({
  model, effort, onChange,
}: {
  model: ModelValue;
  effort: EffortValue;
  onChange: (m: ModelValue, e: EffortValue) => void;
}) {
  const { open, setOpen, ref } = usePopover();
  const curModel = MODELS.find(m => m.value === model) || MODELS[0];
  const curEffort = EFFORTS.find(e => e.value === effort) || EFFORTS[1];

  function onKey(e: KeyboardEvent) {
    if (!open) return;
    const n = Number(e.key);
    if (n >= 1 && n <= MODELS.length) {
      e.preventDefault();
      onChange(MODELS[n - 1].value, effort);
    }
    if (e.key === 'Escape') setOpen(false);
  }
  useEffect(() => {
    if (open) { window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey); }
  }); // eslint-disable-line

  return (
    <div className="relative" ref={ref}>
      <button type="button" onClick={() => setOpen(!open)}
        className="font-mono px-2.5 py-1 rounded-md text-[11.5px] inline-flex items-center gap-1"
        style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--fg)' }}>
        <span style={{ opacity: .55, fontWeight: 400 }}>model=</span>
        <span style={{ fontWeight: 500 }}>{curModel.label}{curModel.badge ? ` ${curModel.badge}` : ''}</span>
        <span style={{ opacity: .35 }}>·</span>
        <span style={{ opacity: .55, fontWeight: 400 }}>effort=</span>
        <span style={{ fontWeight: 500 }}>{curEffort.label.toLowerCase()}</span>
      </button>

      {open && (
        <div className="absolute bottom-full mb-2 left-0 rounded-2xl overflow-hidden min-w-[280px] z-20 p-1.5"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: '0 8px 24px rgba(0,0,0,.14)' }}>

          {/* Models */}
          <div className="flex items-center justify-between px-2 py-1.5">
            <div className="text-[11px] uppercase tracking-wider" style={{ color: 'var(--muted)' }}>Models</div>
            <div className="flex gap-1"><Kbd>⇧</Kbd><Kbd>⌘</Kbd><Kbd>I</Kbd></div>
          </div>
          {MODELS.map((m, i) => (
            <button key={m.value}
              onClick={() => onChange(m.value, effort)}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm text-left"
              style={{ background: model === m.value ? 'var(--accent-light)' : 'transparent' }}>
              <span className="flex-1 flex items-center gap-1.5">
                <span>{m.label}</span>
                {m.badge && <span className="text-[10px]" style={{ color: 'var(--muted)' }}>{m.badge}</span>}
              </span>
              {model === m.value && <span>✓</span>}
              <span className="text-[10.5px]" style={{ color: 'var(--muted)' }}>{i + 1}</span>
            </button>
          ))}

          {/* Divider */}
          <div className="my-1.5 mx-2" style={{ borderTop: '1px solid var(--border)' }} />

          {/* Effort */}
          <div className="flex items-center justify-between px-2 py-1.5">
            <div className="text-[11px] uppercase tracking-wider" style={{ color: 'var(--muted)' }}>Effort</div>
            <div className="flex gap-1"><Kbd>⇧</Kbd><Kbd>⌘</Kbd><Kbd>E</Kbd></div>
          </div>
          {EFFORTS.map(e => (
            <button key={e.value}
              onClick={() => onChange(model, e.value)}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm text-left"
              style={{ background: effort === e.value ? 'var(--accent-light)' : 'transparent' }}>
              <span className="flex-1">{e.label}</span>
              {effort === e.value && <span>✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] rounded"
      style={{ background: 'var(--accent-light)', color: 'var(--muted)', border: '1px solid var(--border)' }}>
      {children}
    </span>
  );
}
