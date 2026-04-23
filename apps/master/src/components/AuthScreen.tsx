'use client';

import { useState } from 'react';
import { Sparkles, Loader2, Lock, Mail, User as UserIcon } from 'lucide-react';

interface Props {
  needSetup: boolean;
  onAuth: (user: any) => void;
}

export default function AuthScreen({ needSetup, onAuth }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(''); setBusy(true);
    const r = await fetch('/api/auth', {
      method: needSetup ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    });
    setBusy(false);
    if (!r.ok) {
      const j = await r.json().catch(() => ({}));
      setErr(j.error || 'Не получилось'); return;
    }
    const j = await r.json();
    onAuth(j.user);
  }

  return (
    <div className="h-dvh flex items-center justify-center p-6 animate-fadeIn"
      style={{ background: 'var(--bg)' }}>
      <div className="w-full max-w-sm animate-fadeUp">
        <div className="text-center mb-7">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-3"
            style={{ background: 'var(--accent)', color: 'var(--bg)' }}>
            <Sparkles size={22} strokeWidth={2.2} />
          </div>
          <h1 className="text-[22px] font-semibold tracking-tight">Pocket Claude</h1>
          <p className="text-[13px] mt-1.5" style={{ color: 'var(--muted)' }}>
            {needSetup ? 'Создай аккаунт администратора' : 'Войди в свой аккаунт'}
          </p>
        </div>

        <form onSubmit={submit} className="surface p-6 flex flex-col gap-4" style={{ boxShadow: 'var(--shadow)' }}>
          {needSetup && (
            <div>
              <label className="field-label flex items-center gap-1.5"><UserIcon size={11} />Имя</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className="field" placeholder="Александр" />
            </div>
          )}
          <div>
            <label className="field-label flex items-center gap-1.5"><Mail size={11} />Email</label>
            <input type="email" value={email} required onChange={(e) => setEmail(e.target.value)}
              className="field" placeholder="you@example.com" />
          </div>
          <div>
            <label className="field-label flex items-center gap-1.5"><Lock size={11} />Пароль</label>
            <input type="password" value={password} required onChange={(e) => setPassword(e.target.value)}
              className="field" placeholder="•••••••" minLength={needSetup ? 6 : undefined} />
          </div>
          {err && (
            <div className="text-[12px] px-3 py-2 rounded-lg flex items-start gap-2"
              style={{ background: 'var(--danger-bg)', color: 'var(--danger)' }}>
              {err}
            </div>
          )}
          <button type="submit" disabled={busy} className="btn btn-primary mt-1">
            {busy && <Loader2 size={14} className="animate-spin" />}
            {needSetup ? 'Создать и войти' : 'Войти'}
          </button>
        </form>

        <p className="text-center text-[11px] mt-5" style={{ color: 'var(--muted)' }}>
          self-hosted · MIT · подключай свои сервера
        </p>
      </div>
    </div>
  );
}
