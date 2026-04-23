'use client';

import { useEffect, useState } from 'react';
import AuthScreen from '@/components/AuthScreen';
import AppShell from '@/components/AppShell';

interface User { id: string; email: string; name: string | null; is_admin: boolean }

export default function Home() {
  const [state, setState] = useState<'loading' | 'auth' | 'app'>('loading');
  const [user, setUser] = useState<User | null>(null);
  const [needSetup, setNeedSetup] = useState(false);

  useEffect(() => { checkAuth(); }, []);

  async function checkAuth() {
    const r = await fetch('/api/auth');
    if (!r.ok) { setState('auth'); return; }
    const j = await r.json();
    if (j.user) { setUser(j.user); setState('app'); }
    else { setNeedSetup(!!j.setup); setState('auth'); }
  }

  if (state === 'loading') {
    return <div className="h-dvh flex items-center justify-center" style={{ background: 'var(--bg)' }}>
      <div className="text-sm" style={{ color: 'var(--muted)' }}>Loading…</div>
    </div>;
  }
  if (state === 'auth') return <AuthScreen needSetup={needSetup} onAuth={(u) => { setUser(u); setState('app'); }} />;
  return <AppShell user={user!} />;
}
