'use client';

import { useEffect, useState } from 'react';
import { Sparkles, Loader2, Lock, Mail, User as UserIcon, Ticket } from 'lucide-react';
import { api } from '@/lib/api';

interface Props {
  needSetup: boolean;
  onAuth: (user: any) => void;
}

type Mode = 'login' | 'signup';

export default function AuthScreen({ needSetup, onAuth }: Props) {
  // needSetup === true → форсим регистрацию первого админа.
  // Иначе пользователь сам выбирает: «Войти» или «Регистрация» (по invite-коду).
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  // Если пришли по ссылке /?invite=XXX — автоматически открываем регистрацию
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const code = new URL(window.location.href).searchParams.get('invite');
    if (code && !needSetup) {
      setInviteCode(code);
      setMode('signup');
    }
  }, [needSetup]);

  const isSignup = needSetup || mode === 'signup';

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(''); setBusy(true);
    const body: Record<string, unknown> = { email, password };
    if (isSignup) {
      body.name = name;
      if (!needSetup) body.inviteCode = inviteCode;
    }
    const r = await api('/api/auth', {
      method: isSignup ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    setBusy(false);
    if (!r.ok) {
      const j = await r.json().catch(() => ({}));
      setErr(j.error || `Ошибка ${r.status}`); return;
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
          <h1 className="text-[22px] font-semibold tracking-tight">Autmzr Command</h1>
          <p className="text-[13px] mt-1.5" style={{ color: 'var(--muted)' }}>
            {needSetup
              ? 'Создай аккаунт администратора'
              : isSignup ? 'Регистрация по приглашению' : 'Войди в свой аккаунт'}
          </p>
        </div>

        <form onSubmit={submit} className="surface p-6 flex flex-col gap-4" style={{ boxShadow: 'var(--shadow)' }}>
          {isSignup && (
            <div>
              <label className="field-label flex items-center gap-1.5"><UserIcon size={11} />Имя</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className="field" placeholder="Александр" />
            </div>
          )}
          <div>
            <label className="field-label flex items-center gap-1.5"><Mail size={11} />Email</label>
            <input type="email" value={email} required onChange={(e) => setEmail(e.target.value)}
              className="field" placeholder="you@example.com" autoComplete="email" />
          </div>
          <div>
            <label className="field-label flex items-center gap-1.5"><Lock size={11} />Пароль</label>
            <input type="password" value={password} required onChange={(e) => setPassword(e.target.value)}
              className="field" placeholder="•••••••" minLength={isSignup ? 8 : undefined}
              autoComplete={isSignup ? 'new-password' : 'current-password'} />
            {isSignup && (
              <p className="text-[10.5px] mt-1.5" style={{ color: 'var(--muted)' }}>
                Минимум 8 символов · буквы + цифры
              </p>
            )}
          </div>
          {isSignup && !needSetup && (
            <div>
              <label className="field-label flex items-center gap-1.5"><Ticket size={11} />Invite-код</label>
              <input value={inviteCode} required onChange={(e) => setInviteCode(e.target.value.trim())}
                className="field font-mono" placeholder="код от админа" />
            </div>
          )}
          {err && (
            <div className="text-[12px] px-3 py-2 rounded-lg flex items-start gap-2"
              style={{ background: 'var(--danger-bg)', color: 'var(--danger)' }}>
              {err}
            </div>
          )}
          <button type="submit" disabled={busy} className="btn btn-primary mt-1">
            {busy && <Loader2 size={14} className="animate-spin" />}
            {isSignup ? (needSetup ? 'Создать и войти' : 'Зарегистрироваться') : 'Войти'}
          </button>

          {!needSetup && (
            <button type="button"
              onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setErr(''); }}
              className="text-[12px] underline-offset-2 hover:underline"
              style={{ color: 'var(--muted)' }}
            >
              {mode === 'login' ? 'Есть invite-код? Зарегистрироваться' : '← Войти существующим аккаунтом'}
            </button>
          )}
        </form>

        <p className="text-center text-[11px] mt-5" style={{ color: 'var(--muted)' }}>
          self-hosted · MIT · подключай свои сервера
        </p>
      </div>
    </div>
  );
}
