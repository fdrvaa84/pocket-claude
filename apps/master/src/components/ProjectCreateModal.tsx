'use client';

import { useEffect, useState } from 'react';
import DeviceBrowser from './DeviceBrowser';
import { effectiveIntent, type DeviceIntent } from '@/lib/device-intent';

interface Device {
  id: string; name: string; kind: string; online: boolean;
  root_path?: string | null;
  agent_logged_in?: boolean | null;
  intent?: DeviceIntent | null;
}
interface Props {
  devices: Device[];
  onClose: () => void;
  onCreated: (id: string) => void;
}

type Mode = null | 'pick-existing' | 'pick-parent';

export default function ProjectCreateModal({ devices, onClose, onCreated }: Props) {
  const [deviceId, setDeviceId] = useState<string | null>(devices.find(d => d.online)?.id || null);
  const [claudeDeviceId, setClaudeDeviceId] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>(null);
  const [parentPath, setParentPath] = useState<string | null>(null);  // для режима "создать новую"
  const [newName, setNewName] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const selectedDevice = devices.find(d => d.id === deviceId);
  const needsClaudeDevice = !!selectedDevice && effectiveIntent(selectedDevice) === 'fs-only';
  const claudeCandidates = devices.filter(d => d.id !== deviceId && d.online && effectiveIntent(d) === 'claude');
  const proxyOk = !needsClaudeDevice || !!claudeDeviceId;

  // Автовыбор первого подходящего claude-устройства при смене основного устройства.
  useEffect(() => {
    if (needsClaudeDevice && !claudeDeviceId && claudeCandidates.length > 0) {
      setClaudeDeviceId(claudeCandidates[0].id);
    }
  }, [deviceId, needsClaudeDevice]); // eslint-disable-line

  function basename(path: string): string {
    return path.split('/').filter(Boolean).pop() || 'project';
  }

  async function createFromExisting(path: string) {
    if (needsClaudeDevice && !claudeDeviceId) { setErr('Выбери устройство с claude'); return; }
    setErr(''); setBusy(true);
    const r = await fetch('/api/projects', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: basename(path), device_id: deviceId, path,
        claude_device_id: needsClaudeDevice ? claudeDeviceId : null,
      }),
    });
    setBusy(false);
    if (!r.ok) { const j = await r.json().catch(() => ({})); setErr(j.error || 'error'); return; }
    const j = await r.json();
    onCreated(j.id);
  }

  async function createNew() {
    setErr('');
    if (!parentPath || !newName.trim()) { setErr('нужно имя'); return; }
    if (!/^[\w.\- ]+$/.test(newName.trim())) { setErr('недопустимые символы в имени'); return; }
    if (needsClaudeDevice && !claudeDeviceId) { setErr('Выбери устройство с claude'); return; }
    setBusy(true);
    // 1) mkdir
    const m = await fetch(`/api/devices/${deviceId}/mkdir`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: parentPath, name: newName.trim() }),
    });
    if (!m.ok) {
      const j = await m.json().catch(() => ({})); setBusy(false); setErr(j.error || 'не удалось создать папку'); return;
    }
    const md = await m.json();
    // 2) project
    const r = await fetch('/api/projects', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newName.trim(), device_id: deviceId, path: md.path,
        claude_device_id: needsClaudeDevice ? claudeDeviceId : null,
      }),
    });
    setBusy(false);
    if (!r.ok) { const j = await r.json().catch(() => ({})); setErr(j.error || 'ошибка'); return; }
    const j = await r.json();
    onCreated(j.id);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,.5)', backdropFilter: 'blur(6px)' }} onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl p-5 flex flex-col gap-3"
        style={{ background: 'var(--surface)', boxShadow: '0 8px 24px rgba(0,0,0,.15)' }}
        onClick={(e) => e.stopPropagation()}>
        <h3 className="text-base font-semibold">Новый проект</h3>

        {/* Device */}
        <label className="text-xs" style={{ color: 'var(--muted)' }}>Устройство</label>
        <div className="flex flex-col gap-1.5">
          {devices.length === 0 && (
            <div className="text-xs px-3 py-4 text-center rounded-lg"
              style={{ background: 'var(--accent-light)', color: 'var(--muted)' }}>
              Нет устройств. Settings → + Device.
            </div>
          )}
          {devices.map(d => {
            const role = effectiveIntent(d);
            return (
              <button key={d.id} onClick={() => { setDeviceId(d.id); setParentPath(null); setClaudeDeviceId(null); }} type="button"
                disabled={!d.online}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-left disabled:opacity-50"
                style={{
                  border: `1px solid ${deviceId === d.id ? 'var(--accent)' : 'var(--border)'}`,
                  background: deviceId === d.id ? 'var(--accent-light)' : 'transparent',
                }}>
                <span className="text-lg">{role === 'claude' ? '🤖' : '📂'}</span>
                <span className="flex-1 min-w-0">
                  <span className="block text-sm">{d.name}</span>
                  <span className="block text-[10.5px]" style={{ color: 'var(--muted)' }}>
                    {d.online ? 'онлайн' : 'оффлайн'}
                    {' · '}
                    <span style={{ color: role === 'claude' ? 'var(--ok)' : 'var(--fg-2)' }}>
                      {role === 'claude' ? 'claude' : 'files-only'}
                    </span>
                  </span>
                </span>
                <span className="w-2 h-2 rounded-full" style={{ background: d.online ? 'var(--ok)' : 'var(--danger)' }} />
              </button>
            );
          })}
        </div>

        {/* Где запускать Claude — показывается если на выбранном устройстве нет claude login */}
        {needsClaudeDevice && (
          <div className="mt-1 p-3 rounded-xl flex flex-col gap-2" style={{ background: 'var(--accent-tint)', border: '1px solid var(--border)' }}>
            <div className="text-xs" style={{ color: 'var(--fg)' }}>
              Где запускать Claude?
            </div>
            {claudeCandidates.length === 0 ? (
              <div className="text-xs px-2 py-2 rounded" style={{ background: 'var(--danger-bg)', color: 'var(--danger)' }}>
                Нет онлайн-устройств с Claude. Подключи хотя бы одно в Settings.
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                {claudeCandidates.map(d => (
                  <button key={d.id} type="button"
                    onClick={() => setClaudeDeviceId(d.id)}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left text-sm"
                    style={{
                      border: `1px solid ${claudeDeviceId === d.id ? 'var(--accent)' : 'var(--border)'}`,
                      background: claudeDeviceId === d.id ? 'var(--surface)' : 'transparent',
                    }}>
                    <span>{d.kind === 'laptop' ? '💻' : '🖥'}</span>
                    <span className="flex-1">{d.name}</span>
                    <span className="font-mono text-[10px]" style={{ color: 'var(--ok)' }}>claude ✓</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Две большие кнопки */}
        <div className="flex flex-col gap-2 mt-1">
          <button type="button" disabled={!deviceId || !selectedDevice?.online || !proxyOk}
            onClick={() => setMode('pick-existing')}
            className="p-3 rounded-xl text-left flex items-start gap-3 disabled:opacity-40"
            style={{ border: '1px solid var(--border)' }}>
            <div className="text-xl">📂</div>
            <div className="flex-1">
              <div className="text-sm font-medium">Выбрать существующую папку</div>
              <div className="text-[11px]" style={{ color: 'var(--muted)' }}>Например, уже клонированный репозиторий</div>
            </div>
          </button>
          <button type="button" disabled={!deviceId || !selectedDevice?.online || !proxyOk}
            onClick={() => { setMode('pick-parent'); setParentPath(null); }}
            className="p-3 rounded-xl text-left flex items-start gap-3 disabled:opacity-40"
            style={{ border: '1px solid var(--border)' }}>
            <div className="text-xl">🆕</div>
            <div className="flex-1">
              <div className="text-sm font-medium">Создать новую папку</div>
              <div className="text-[11px]" style={{ color: 'var(--muted)' }}>Выберешь где, впишешь имя</div>
            </div>
          </button>
        </div>

        {/* Форма для режима "создать новую" — показывается после выбора parent */}
        {mode === 'pick-parent' && parentPath && (
          <div className="mt-1 p-3 rounded-xl flex flex-col gap-2" style={{ background: 'var(--accent-light)', border: '1px solid var(--border)' }}>
            <div className="text-xs" style={{ color: 'var(--muted)' }}>Создаю в:</div>
            <div className="text-xs font-mono truncate">{parentPath}</div>
            <label className="text-xs mt-1" style={{ color: 'var(--muted)' }}>Имя папки</label>
            <input value={newName} autoFocus onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') createNew(); }}
              placeholder="my-bot"
              className="px-3 py-2 rounded-lg text-sm bg-[var(--bg)] outline-none font-mono"
              style={{ border: '1px solid var(--border)', color: 'var(--fg)' }} />
            <div className="text-[11px] font-mono truncate" style={{ color: 'var(--muted)' }}>
              → {parentPath}/<b>{newName || 'имя'}</b>
            </div>
            <div className="flex gap-2 mt-1">
              <button onClick={() => { setParentPath(null); setNewName(''); }} className="btn-secondary text-xs">← Назад</button>
              <div className="flex-1" />
              <button onClick={createNew} disabled={busy || !newName.trim()} className="btn-primary text-xs disabled:opacity-40">
                {busy ? '...' : 'Создать'}
              </button>
            </div>
          </div>
        )}

        {err && <div className="text-xs" style={{ color: 'var(--danger)' }}>{err}</div>}

        <div className="flex justify-end gap-2 mt-2">
          <button onClick={onClose} className="btn-secondary">Закрыть</button>
        </div>
      </div>

      {/* Browser для обоих режимов. В pick-existing сразу создаём проект. В pick-parent — запоминаем как parent. */}
      {mode && deviceId && !parentPath && (
        <DeviceBrowser
          deviceId={deviceId}
          deviceName={selectedDevice?.name || ''}
          onClose={() => setMode(null)}
          onPick={(path) => {
            if (mode === 'pick-existing') { createFromExisting(path); setMode(null); }
            else { setParentPath(path); }
          }}
        />
      )}
    </div>
  );
}
