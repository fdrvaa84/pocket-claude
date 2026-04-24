'use client';

/**
 * MobileTabBar — iOS-style bottom-tab-bar навигации для мобильного layout.
 *
 * Три крупных раздела приложения на мобиле:
 *   • Home     — текущий чат / welcome
 *   • Chats    — список всех чатов (sessions)
 *   • Devices  — список устройств (DevicesList)
 *
 * Settings убран — доступны через профиль-аватар в top-bar (Settings + Logout).
 *
 * Только мобильный layout (`md:hidden`). На desktop этим разделам соответствуют
 * sidebars — нижний бар не нужен.
 *
 * Высота 54px + safe-area для iOS home-indicator.
 */

import { Home, MessagesSquare, MonitorSmartphone } from 'lucide-react';

export type MobileTab = 'home' | 'chats' | 'devices' | 'settings';
// 'settings' оставляем в типе для обратной совместимости (старый сохранённый state),
// но в bottom-bar его больше не рисуем — при попадании сюда AppShell рендерит
// Settings inline. Новые заходы всегда выдают 'home' default.

interface MobileTabBarProps {
  active: MobileTab;
  onChange: (tab: MobileTab) => void;
  /** Цифры-бейджи рядом с иконками (например, кол-во онлайн-устройств). */
  badges?: { chats?: number; devices?: number };
}

const TABS: Array<{ id: MobileTab; label: string; icon: typeof Home }> = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'chats', label: 'Chats', icon: MessagesSquare },
  { id: 'devices', label: 'Devices', icon: MonitorSmartphone },
];

export default function MobileTabBar({ active, onChange, badges }: MobileTabBarProps) {
  return (
    <nav
      role="tablist"
      aria-label="Основная навигация"
      className="md:hidden fixed left-0 right-0 bottom-0 z-30 flex items-stretch"
      style={{
        background: 'var(--surface)',
        borderTop: '1px solid var(--border)',
        // safe-bottom: 54px высоты + env(safe-area-inset-bottom) для home-indicator
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        // Лёгкий backdrop, чтобы при скролле контент не сливался с баром.
        boxShadow: '0 -1px 0 rgba(0,0,0,.02)',
      }}
    >
      {TABS.map((t) => {
        const Icon = t.icon;
        const isActive = active === t.id;
        const badgeRaw =
          t.id === 'chats' ? badges?.chats :
          t.id === 'devices' ? badges?.devices :
          undefined;
        const badge = typeof badgeRaw === 'number' && badgeRaw > 0 ? badgeRaw : undefined;
        return (
          <button
            key={t.id}
            role="tab"
            aria-selected={isActive}
            aria-label={t.label}
            onClick={() => onChange(t.id)}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 relative"
            style={{
              // Минимум 54px высоты и 44×44 hit-area по гайдлайнам Apple HIG.
              minHeight: 54,
              color: isActive ? 'var(--accent)' : 'var(--muted)',
              fontWeight: isActive ? 600 : 400,
              transition: 'color 120ms ease',
            }}
          >
            <span className="relative inline-flex">
              <Icon size={22} strokeWidth={isActive ? 2.2 : 1.8} />
              {badge !== undefined && (
                <span
                  className="absolute -top-1 -right-2 inline-flex items-center justify-center font-mono"
                  style={{
                    minWidth: 16,
                    height: 16,
                    padding: '0 4px',
                    fontSize: 10,
                    lineHeight: '16px',
                    borderRadius: 8,
                    background: 'var(--accent)',
                    color: 'var(--bg)',
                  }}
                >
                  {badge > 99 ? '99+' : badge}
                </span>
              )}
            </span>
            <span style={{ fontSize: 10.5, lineHeight: 1.1 }}>{t.label}</span>
            {isActive && (
              <span
                className="absolute top-0 left-1/2 -translate-x-1/2"
                style={{
                  width: 28,
                  height: 2,
                  background: 'var(--accent)',
                  borderRadius: 0,
                }}
              />
            )}
          </button>
        );
      })}
    </nav>
  );
}
