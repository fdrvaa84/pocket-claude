'use client';

import { useState, useEffect } from 'react';

interface Props { onClose: () => void }
type Intent = 'claude' | 'fs-only';

export default function DeviceAddModal({ onClose }: Props) {
  const [name, setName] = useState('');
  const [intent, setIntent] = useState<Intent>('claude');
  const [step, setStep] = useState<'form' | 'waiting'>('form');
  const [cmd, setCmd] = useState<{ connect_cmd: string; id: string; token: string; intent: Intent } | null>(null);
  const [copied, setCopied] = useState(false);
  const [online, setOnline] = useState(false);

  async function create() {
    if (!name.trim()) return;
    const r = await fetch('/api/devices', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, intent }),
    });
    if (!r.ok) { alert('Failed'); return; }
    const j = await r.json();
    setCmd({ ...j, intent: j.intent });
    setStep('waiting');
  }

  // poll online status
  useEffect(() => {
    if (step !== 'waiting' || !cmd) return;
    const t = setInterval(async () => {
      const r = await fetch('/api/devices');
      if (!r.ok) return;
      const { devices } = await r.json();
      const d = devices.find((x: any) => x.id === cmd.id);
      if (d?.online) { setOnline(true); clearInterval(t); }
    }, 3000);
    return () => clearInterval(t);
  }, [step, cmd]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,.5)', backdropFilter: 'blur(6px)' }} onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl p-5" style={{ background: 'var(--surface)', boxShadow: '0 8px 24px rgba(0,0,0,.15)' }}
        onClick={(e) => e.stopPropagation()}>
        <h3 className="text-base font-semibold mb-1">Новое устройство</h3>
        <p className="text-xs mb-4" style={{ color: 'var(--muted)' }}>Одна команда — и твой сервер в списке.</p>

        {step === 'form' && (
          <>
            <label className="block text-xs mb-1" style={{ color: 'var(--muted)' }}>Имя</label>
            <input value={name} autoFocus onChange={(e) => setName(e.target.value)} placeholder="home-mac"
              className="w-full px-3 py-2 rounded-lg text-sm bg-transparent outline-none"
              style={{ border: '1px solid var(--border)', color: 'var(--fg)' }} />

            <label className="block text-xs mt-4 mb-1.5" style={{ color: 'var(--muted)' }}>Что за устройство?</label>
            <div className="flex flex-col gap-1.5">
              <button type="button" onClick={() => setIntent('claude')}
                className="flex items-start gap-2.5 p-2.5 rounded-xl text-left"
                style={{
                  border: `1px solid ${intent === 'claude' ? 'var(--accent)' : 'var(--border)'}`,
                  background: intent === 'claude' ? 'var(--accent-light)' : 'transparent',
                }}>
                <span className="text-xl leading-none mt-0.5">🤖</span>
                <span className="flex-1">
                  <span className="block text-[13px] font-medium">С Claude Code</span>
                  <span className="block text-[11px] mt-0.5" style={{ color: 'var(--muted)' }}>
                    Здесь запускается Claude CLI. Требует <code className="font-mono">claude login</code>.
                  </span>
                </span>
              </button>
              <button type="button" onClick={() => setIntent('fs-only')}
                className="flex items-start gap-2.5 p-2.5 rounded-xl text-left"
                style={{
                  border: `1px solid ${intent === 'fs-only' ? 'var(--accent)' : 'var(--border)'}`,
                  background: intent === 'fs-only' ? 'var(--accent-light)' : 'transparent',
                }}>
                <span className="text-xl leading-none mt-0.5">📂</span>
                <span className="flex-1">
                  <span className="block text-[13px] font-medium">Только файлы и команды</span>
                  <span className="block text-[11px] mt-0.5" style={{ color: 'var(--muted)' }}>
                    Хранилище проектов. Claude-вызовы пойдут с выбранного claude-устройства.
                  </span>
                </span>
              </button>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button onClick={onClose} className="btn-secondary">Отмена</button>
              <button onClick={create} className="btn-primary">Создать</button>
            </div>
          </>
        )}

        {step === 'waiting' && cmd && (
          <>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[11px] font-mono px-2 py-0.5 rounded"
                style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--fg-2)' }}>
                {cmd.intent === 'fs-only' ? '📂 files-only' : '🤖 claude'}
              </span>
              <div className="text-xs" style={{ color: 'var(--muted)' }}>Запусти на устройстве:</div>
            </div>
            <div className="relative">
              <pre className="text-[11px] font-mono p-3 rounded-lg whitespace-pre-wrap break-all"
                style={{ background: '#1a1a1a', color: '#e5e7eb' }}>{cmd.connect_cmd}</pre>
              <button onClick={() => { navigator.clipboard.writeText(cmd.connect_cmd); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
                className="absolute top-2 right-2 text-[10px] px-2 py-1 rounded" style={{ background: 'rgba(255,255,255,.15)', color: '#fff' }}>
                {copied ? '✓' : 'copy'}
              </button>
            </div>

            <div className="mt-3 flex items-center gap-2 p-3 rounded-lg"
              style={{ background: 'var(--accent-light)', border: '1px solid var(--border)' }}>
              <span className="w-2 h-2 rounded-full" style={{ background: online ? 'var(--ok)' : '#d97706',
                animation: online ? 'none' : 'pulse 1.4s infinite' }} />
              <div className="text-xs">{online ? <strong>Подключено ✓</strong> : 'Жду подключения…'}</div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button onClick={onClose} className="btn-primary">{online ? 'Готово' : 'Закрыть'}</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
