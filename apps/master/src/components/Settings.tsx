'use client';

/**
 * Settings — глобальные настройки аккаунта и UI.
 *
 * Содержит ровно три вкладки (нав-рефакторинг):
 *   1. Invites  — приглашения и реферальные коды
 *   2. Theme    — выбор темы оформления
 *   3. Account  — профиль + Logout
 *
 * Девайсы и всё, что к ним относится (install / login / gemini / preferred_agent /
 * intent / root_path / browser), переехали в `<DevicesList />` + `<DeviceSheet />`.
 * Сюда же — НЕ возвращаем: Settings больше не «грязное ведро».
 *
 * Settings рендерится в двух режимах:
 *   • desktop — модалка по центру (как раньше)
 *   • mobile  — inline-content внутри bottom-tab `settings`
 *               (передаётся `embedded` prop от AppShell)
 */

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Ticket, Palette, User as UserIcon, X, LogOut } from 'lucide-react';

const InvitesPanel = dynamic(() => import('./InvitesPanel'), { ssr: false, loading: () => null });

interface User { id: string; email: string; name: string | null }

const THEMES = ['soft', 'light', 'dark'] as const;
type Theme = typeof THEMES[number];

type Tab = 'invites' | 'theme' | 'account';

const TABS: Array<{ id: Tab; label: string; icon: typeof Ticket }> = [
  { id: 'invites', label: 'Invites', icon: Ticket },
  { id: 'theme', label: 'Theme', icon: Palette },
  { id: 'account', label: 'Account', icon: UserIcon },
];

export default function Settings({
  user,
  theme,
  onThemeChange,
  onClose,
  embedded = false,
}: {
  user: User;
  theme: Theme;
  onThemeChange: (t: Theme) => void;
  /** Закрытие модалки. На embedded-режиме игнорируется. */
  onClose: () => void;
  /** На мобиле — рендерим inline (без модалки). */
  embedded?: boolean;
}) {
  const [tab, setTab] = useState<Tab>('invites');

  async function logout() {
    await fetch('/api/auth', { method: 'DELETE' });
    location.reload();
  }

  const tabStrip = (
    <div
      className="flex gap-1 px-2 py-2 overflow-x-auto"
      style={{ borderBottom: '1px solid var(--border)' }}
      role="tablist"
    >
      {TABS.map((t) => {
        const Icon = t.icon;
        const active = tab === t.id;
        return (
          <button
            key={t.id}
            role="tab"
            aria-selected={active}
            onClick={() => setTab(t.id)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-[13px] font-medium shrink-0"
            style={{
              background: active ? 'var(--accent)' : 'transparent',
              color: active ? 'var(--bg)' : 'var(--fg-2)',
              minHeight: 44,
            }}
          >
            <Icon size={14} />
            {t.label}
          </button>
        );
      })}
    </div>
  );

  const body = (
    <>
      {tab === 'invites' && (
        <div className="py-2">
          <InvitesPanel />
        </div>
      )}

      {tab === 'theme' && (
        <div className="p-5">
          <div className="text-xs uppercase tracking-wider mb-3" style={{ color: 'var(--muted)' }}>
            Тема
          </div>
          <div className="flex gap-2 flex-wrap">
            {THEMES.map((t) => (
              <button
                key={t}
                onClick={() => onThemeChange(t)}
                className="px-4 py-2 rounded-full text-sm"
                style={{
                  background: theme === t ? 'var(--accent)' : 'var(--accent-light)',
                  color: theme === t ? 'var(--bg)' : 'var(--fg)',
                  minHeight: 44,
                }}
              >
                {t}
              </button>
            ))}
          </div>
          <p className="text-[12px] mt-3" style={{ color: 'var(--muted)' }}>
            Выбор сохраняется на этом устройстве.
          </p>
        </div>
      )}

      {tab === 'account' && (
        <div className="p-5">
          <div className="text-xs uppercase tracking-wider mb-3" style={{ color: 'var(--muted)' }}>
            Аккаунт
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center font-semibold text-base"
              style={{ background: 'var(--accent)', color: 'var(--bg)' }}
            >
              {(user.name || user.email)[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{user.name || '—'}</div>
              <div className="text-[12px] truncate" style={{ color: 'var(--muted)' }}>
                {user.email}
              </div>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium"
            style={{
              background: 'var(--accent-light)',
              color: 'var(--danger)',
              border: '1px solid var(--border)',
              minHeight: 44,
            }}
          >
            <LogOut size={14} />
            Выйти
          </button>
        </div>
      )}
    </>
  );

  // === Embedded (mobile inline) =====================================
  if (embedded) {
    return (
      <div className="flex flex-col h-full" style={{ background: 'var(--bg)' }}>
        {tabStrip}
        <div className="flex-1 overflow-y-auto">{body}</div>
      </div>
    );
  }

  // === Modal (desktop) ==============================================
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,.5)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl max-h-[85dvh] rounded-2xl flex flex-col overflow-hidden"
        style={{ background: 'var(--surface)', boxShadow: '0 8px 24px rgba(0,0,0,.15)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <h2 className="text-base font-semibold">Settings</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-md flex items-center justify-center"
            style={{ color: 'var(--muted)' }}
            aria-label="Закрыть"
          >
            <X size={18} />
          </button>
        </div>
        {tabStrip}
        <div className="flex-1 overflow-y-auto">{body}</div>
      </div>
    </div>
  );
}
