'use client';

import { useState, useRef, useEffect } from 'react';

interface Option { value: string; label: string; hint?: string }
interface Props {
  label: string;
  value: string;
  options: Option[];
  onChange: (value: string) => void;
  accent?: boolean;
}

export default function Dropdown({ label, value, options, onChange, accent }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  const current = options.find(o => o.value === value) || options[0];

  return (
    <div className="relative" ref={ref}>
      <button type="button" onClick={() => setOpen(!open)}
        className="px-2.5 py-1 rounded-full text-[11px] flex items-center gap-1"
        style={{
          background: accent ? 'var(--accent)' : 'var(--accent-light)',
          color: accent ? 'var(--bg)' : 'var(--fg)',
          border: '1px solid var(--border)',
        }}>
        <span style={{ opacity: accent ? .85 : .55 }}>{label}:</span>
        <span className="font-medium">{current.label}</span>
        <span style={{ opacity: .6, fontSize: 9 }}>▾</span>
      </button>
      {open && (
        <div className="absolute bottom-full mb-1 left-0 rounded-xl overflow-hidden min-w-[180px] z-20"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: '0 4px 14px rgba(0,0,0,.12)' }}>
          {options.map(o => (
            <button key={o.value} onClick={() => { onChange(o.value); setOpen(false); }}
              className="w-full px-3 py-2 text-left text-xs flex items-center gap-2"
              style={{ background: o.value === value ? 'var(--accent-light)' : 'transparent' }}>
              <span className="flex-1">{o.label}</span>
              {o.hint && <span className="text-[10px]" style={{ color: 'var(--muted)' }}>{o.hint}</span>}
              {o.value === value && <span style={{ color: 'var(--accent)' }}>✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
