'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import {
  Plus, Settings as SettingsIcon, Menu, X, ChevronRight, ChevronDown,
  FolderOpen, Files, TerminalSquare, MessageSquare,
  Send, Loader2, ArrowLeft, Mic,
} from 'lucide-react';
import Markdown from './Markdown';
import { COMMANDS, matchCommands, parseSlash, findCommand } from './slashCommands';
import { ModePill, ModelEffortPill, MODELS, MODES, EFFORTS, type ModelValue, type EffortValue, type ModeValue } from './Controls';
import { effectiveIntent, type DeviceIntent } from '@/lib/device-intent';

const FileTree = dynamic(() => import('./FileTree'), { ssr: false, loading: () => null });
const Terminal = dynamic(() => import('./Terminal'), { ssr: false, loading: () => null });
const PtyTerminal = dynamic(() => import('./PtyTerminal'), { ssr: false, loading: () => null });
const DeviceAddModal = dynamic(() => import('./DeviceAddModal'), { ssr: false, loading: () => null });
const ProjectCreateModal = dynamic(() => import('./ProjectCreateModal'), { ssr: false, loading: () => null });
const Settings = dynamic(() => import('./Settings'), { ssr: false, loading: () => null });
const FileEditor = dynamic(() => import('./FileEditor'), { ssr: false, loading: () => null });
const MobileChatSheet = dynamic(() => import('./MobileChatSheet'), { ssr: false, loading: () => null });

interface User { id: string; email: string; name: string | null; is_admin: boolean }
interface Device {
  id: string; name: string; kind: string; hostname: string | null;
  os?: string | null; arch?: string | null;
  online: boolean;
  claude_logged_in: boolean | null; last_online: string | null; root_path: string | null;
  intent?: DeviceIntent | null;
}
interface Project {
  id: string; name: string; path: string | null; device_id: string | null;
  device_name: string | null; device_kind: string | null;
  instructions: string; chat_count: number;
}
interface Session { id: string; title: string; project_id: string | null; updated_at: string; claude_session_id: string | null }
interface Message { id?: string; role: 'user' | 'assistant' | 'system'; content: string; tool_events?: any[] }

const THEMES = ['soft', 'light', 'dark'] as const;

export default function AppShell({ user }: { user: User }) {
  const [theme, setTheme] = useState<typeof THEMES[number]>('soft');
  const [devices, setDevices] = useState<Device[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [tools, setTools] = useState<Array<{ id: string; tool: string; input?: string }>>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(true);
  const [mobilePane, setMobilePane] = useState<'chat' | 'files' | 'terminal'>('chat');
  const [showAddDevice, setShowAddDevice] = useState(false);
  const [showAddProject, setShowAddProject] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [rightTab, setRightTab] = useState<'files' | 'terminal'>('files');
  const [openFile, setOpenFile] = useState<string | null>(null);
  const [slashOpen, setSlashOpen] = useState(false);
  const [slashIdx, setSlashIdx] = useState(0);
  const [model, setModel] = useState<ModelValue>('claude-sonnet-4-6');
  const [permissionMode, setPermissionMode] = useState<ModeValue>('bypassPermissions');
  const [effort, setEffort] = useState<EffortValue>('medium');
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const taRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const saved = (localStorage.getItem('pc_theme') as typeof THEMES[number]) || 'soft';
    setTheme(saved); document.documentElement.setAttribute('data-theme', saved);
  }, []);
  function setThemeAnd(t: typeof THEMES[number]) {
    setTheme(t); localStorage.setItem('pc_theme', t); document.documentElement.setAttribute('data-theme', t);
  }

  useEffect(() => {
    try {
      const m = localStorage.getItem('pc_model'); if (m) setModel(m as ModelValue);
      const pm = localStorage.getItem('pc_pmode'); if (pm) setPermissionMode(pm as ModeValue);
      const ef = localStorage.getItem('pc_effort'); if (ef) setEffort(ef as EffortValue);
    } catch {}
  }, []);
  useEffect(() => { localStorage.setItem('pc_model', model); }, [model]);
  useEffect(() => { localStorage.setItem('pc_pmode', permissionMode); }, [permissionMode]);
  useEffect(() => { localStorage.setItem('pc_effort', effort); }, [effort]);

  useEffect(() => { loadDevices(); loadProjects(); loadSessions(); }, []);
  useEffect(() => { const t = setInterval(loadDevices, 30_000); return () => clearInterval(t); }, []);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, tools]);
  useEffect(() => {
    if (activeSessionId) loadMessages(activeSessionId); else { setMessages([]); setTools([]); }
  }, [activeSessionId]);

  const [runningJob, setRunningJob] = useState<{ started_at: string; partial: string } | null>(null);
  useEffect(() => {
    if (!activeSessionId) { setRunningJob(null); return; }
    const poll = async () => {
      if (sending) return;
      try {
        const r = await fetch(`/api/sessions/${activeSessionId}/job`);
        if (!r.ok) { setRunningJob(null); return; }
        const j = await r.json();
        if (j.job) setRunningJob({ started_at: j.job.started_at, partial: j.job.accumulated_text || '' });
        else { if (runningJob) await loadMessages(activeSessionId); setRunningJob(null); }
      } catch {}
    };
    poll();
    const iv = setInterval(poll, 2000);
    return () => clearInterval(iv);
  }, [activeSessionId, sending]); // eslint-disable-line

  useEffect(() => {
    const ta = taRef.current; if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 200) + 'px';
  }, [input]);

  async function loadDevices() {
    const r = await fetch('/api/devices'); if (r.ok) setDevices((await r.json()).devices);
  }
  async function loadProjects() {
    const r = await fetch('/api/projects'); if (r.ok) setProjects((await r.json()).projects);
  }
  async function loadSessions() {
    const r = await fetch('/api/sessions'); if (r.ok) setSessions((await r.json()).sessions);
  }
  async function loadMessages(sid: string) {
    const r = await fetch(`/api/sessions?id=${sid}`); if (r.ok) setMessages((await r.json()).messages);
    setTools([]);
  }
  async function deleteSession(sid: string) {
    if (!confirm('Удалить чат?')) return;
    await fetch('/api/sessions', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: sid }) });
    if (activeSessionId === sid) setActiveSessionId(null);
    loadSessions();
  }
  async function deleteProject(id: string) {
    if (!confirm('Удалить проект?')) return;
    await fetch('/api/projects', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    if (activeProjectId === id) setActiveProjectId(null);
    loadProjects();
  }
  function toggleProject(pid: string) {
    const n = new Set(expanded); if (n.has(pid)) n.delete(pid); else n.add(pid); setExpanded(n);
  }

  const handleSlash = useCallback(async (text: string): Promise<boolean> => {
    const parsed = parseSlash(text);
    if (!parsed) return false;
    const known = findCommand(parsed.name);
    if (!known) return false;
    if (known.kind === 'claude') return false;

    const addMsg = (role: 'user' | 'assistant' | 'system', content: string) =>
      setMessages((m) => [...m, { role, content }]);

    switch (parsed.name) {
      case '/clear': case '/newchat':
        setActiveSessionId(null); setMessages([]); setTools([]); setInput(''); return true;
      case '/help': {
        const help = COMMANDS.map(c => `- **${c.name}**${c.args ? ` \`${c.args}\`` : ''} — ${c.description}`).join('\n');
        addMsg('user', text); addMsg('assistant', `### Slash-команды\n\n${help}`); setInput(''); return true;
      }
      case '/files': setRightTab('files'); setRightOpen(true); setMobilePane('files'); setInput(''); return true;
      case '/terminal': setRightTab('terminal'); setRightOpen(true); setMobilePane('terminal'); setInput(''); return true;
      case '/settings': setShowSettings(true); setInput(''); return true;
      case '/cd': {
        if (!parsed.args || !activeProjectId) { addMsg('assistant', '❌ `/cd ПУТЬ`'); setInput(''); return true; }
        addMsg('user', text);
        const r = await fetch('/api/projects', {
          method: 'PUT', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: activeProjectId, path: parsed.args }),
        });
        if (!r.ok) { const j = await r.json().catch(() => ({})); addMsg('assistant', `❌ ${j.error || 'Ошибка'}`); }
        else { addMsg('assistant', `✓ папка → \`${parsed.args}\``); loadProjects(); }
        setInput(''); return true;
      }
      case '/!': case '/exec': {
        if (!parsed.args || !activeProjectId) { setInput(''); return true; }
        addMsg('user', text);
        const res = await fetch('/api/exec', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ projectId: activeProjectId, command: parsed.args }),
        });
        if (!res.ok || !res.body) { addMsg('assistant', '❌ ошибка'); setInput(''); return true; }
        let out = '';
        const reader = res.body.getReader(); const dec = new TextDecoder(); let buf = '';
        while (true) {
          const { value, done } = await reader.read(); if (done) break;
          buf += dec.decode(value, { stream: true });
          const lns = buf.split('\n'); buf = lns.pop() || '';
          for (const raw of lns) {
            const ln = raw.trim(); if (!ln.startsWith('data:')) continue;
            try {
              const ev = JSON.parse(ln.slice(5).trim());
              if (ev.type === 'out' || ev.type === 'err') out += ev.text;
              if (ev.type === 'exit') out += `\n[exit ${ev.code}]`;
            } catch {}
          }
        }
        addMsg('assistant', '```\n' + (out || '(пусто)') + '\n```');
        setInput(''); return true;
      }
    }
    return false;
  }, [activeProjectId]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || sending) return;
    if (await handleSlash(text)) return;
    if (!activeProjectId) { alert('Выбери проект слева'); return; }
    setMessages((m) => [...m, { role: 'user', content: text }, { role: 'assistant', content: '' }]);
    setInput(''); setSending(true); setTools([]);
    let assistantText = ''; let newSid: string | null = null;
    try {
      const res = await fetch('/api/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, sessionId: activeSessionId, projectId: activeProjectId, model, permissionMode, effort }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setMessages((m) => { const c = [...m]; c[c.length - 1] = { role: 'assistant', content: `❌ ${j.error || res.statusText}` }; return c; });
        setSending(false); return;
      }
      if (!res.body) throw new Error('No stream');
      const reader = res.body.getReader(); const dec = new TextDecoder();
      let buf = '';
      while (true) {
        const { value, done } = await reader.read(); if (done) break;
        buf += dec.decode(value, { stream: true });
        const lines = buf.split('\n'); buf = lines.pop() || '';
        for (const raw of lines) {
          const ln = raw.trim(); if (!ln.startsWith('data:')) continue;
          const payload = ln.slice(5).trim(); if (!payload) continue;
          try {
            const ev = JSON.parse(payload);
            if (ev.sessionId && !newSid) newSid = ev.sessionId;
            if (ev.type === 'text' && typeof ev.text === 'string') {
              assistantText += ev.text;
              setMessages((m) => { const c = [...m]; c[c.length - 1] = { role: 'assistant', content: assistantText }; return c; });
            } else if (ev.type === 'replace' && typeof ev.text === 'string') {
              assistantText = ev.text;
              setMessages((m) => { const c = [...m]; c[c.length - 1] = { role: 'assistant', content: assistantText }; return c; });
            } else if (ev.type === 'tool_use') {
              setTools((t) => [...t, { id: `${Date.now()}-${Math.random()}`, tool: ev.tool, input: ev.toolInput }]);
            } else if (ev.type === 'error') {
              setMessages((m) => { const c = [...m]; c[c.length - 1] = { role: 'assistant', content: `❌ ${ev.error}` }; return c; });
            }
          } catch {}
        }
      }
      if (newSid && newSid !== activeSessionId) { setActiveSessionId(newSid); loadSessions(); } else loadSessions();
    } catch (e: any) {
      // Если браузер (мобильный!) порвал SSE при переходе в другое приложение,
      // backend продолжает выполнять задачу. Не путаем пользователя ❌ — вместо
      // этого убираем пустой placeholder, чтобы поллинг (/api/sessions/:id/job)
      // показал прогресс и подхватил финальный ответ из БД.
      const isNetLikeError =
        e?.name === 'AbortError' ||
        /load failed|networkerror|network error|failed to fetch|connection|aborted|stream/i.test(String(e?.message || ''));
      if (newSid && isNetLikeError) {
        if (newSid !== activeSessionId) { setActiveSessionId(newSid); loadSessions(); }
        setMessages((m) => {
          const last = m[m.length - 1];
          if (last?.role === 'assistant' && !last.content && !assistantText) return m.slice(0, -1);
          return m;
        });
      } else {
        setMessages((m) => { const c = [...m]; c[c.length - 1] = { role: 'assistant', content: `❌ ${e.message || 'Error'}` }; return c; });
      }
    } finally { setSending(false); }
  }, [sending, activeProjectId, activeSessionId, model, permissionMode, effort, handleSlash]);

  // Когда вкладка снова становится видимой (вернулся в браузер),
  // если есть активная сессия — сразу подтянем свежие сообщения и прогресс job'а,
  // не ждём следующего 2-секундного тика поллинга.
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState !== 'visible') return;
      if (activeSessionId) {
        // тихий refresh: подтягиваем сообщения и заново опрашиваем job
        fetch(`/api/sessions?id=${activeSessionId}`)
          .then(r => r.ok ? r.json() : null)
          .then(j => { if (j?.messages) setMessages(j.messages); })
          .catch(() => {});
      }
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [activeSessionId]);

  const slashSuggestions = slashOpen && input.startsWith('/') ? matchCommands(input) : [];

  function onKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (slashSuggestions.length > 0) {
      if (e.key === 'ArrowDown') { e.preventDefault(); setSlashIdx(i => (i + 1) % slashSuggestions.length); return; }
      if (e.key === 'ArrowUp') { e.preventDefault(); setSlashIdx(i => (i - 1 + slashSuggestions.length) % slashSuggestions.length); return; }
      if (e.key === 'Tab') {
        e.preventDefault();
        const c = slashSuggestions[slashIdx] || slashSuggestions[0];
        setInput(c.name + (c.args ? ' ' : '')); setSlashOpen(false); return;
      }
      if (e.key === 'Escape') { setSlashOpen(false); return; }
    }
    // Enter = новая строка (поведение textarea по умолчанию).
    // Отправка только по кнопке или Cmd/Ctrl+Enter (удобно на desktop).
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  function fmtDuration(ms: number): string {
    const s = Math.floor(ms / 1000);
    if (s < 60) return `${s}с`;
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}:${String(s % 60).padStart(2, '0')}`;
    return `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  }

  const activeProject = projects.find(p => p.id === activeProjectId);
  const activeDevice = activeProject ? devices.find(d => d.id === activeProject.device_id) : null;
  const sessionsByProject = sessions.reduce((acc, s) => {
    const k = s.project_id || '__none__'; (acc[k] = acc[k] || []).push(s); return acc;
  }, {} as Record<string, Session[]>);
  const onlineCount = devices.filter(d => d.online).length;

  return (
    <div className="h-dvh flex flex-col md:flex-row" style={{ background: 'var(--bg)', color: 'var(--fg)' }}>

      {/* ============ SIDEBAR ============ */}
      <aside className={`${drawerOpen ? 'fixed inset-y-0 left-0 z-50 w-[82%] max-w-[320px] shadow-2xl animate-slideUp md:animate-none' : 'hidden'} md:relative md:flex md:w-[260px] flex-col shrink-0`}
        style={{ background: 'var(--bg-2)', borderRight: '1px solid var(--border)' }}>

        {/* Brand */}
        <div className="flex items-center gap-2.5 px-3 pt-3.5 pb-3" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="w-7 h-7 rounded-md flex items-center justify-center font-mono font-bold text-[14px] shrink-0"
            style={{ background: 'var(--accent)', color: 'var(--bg)' }}>P</div>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-semibold leading-tight">pocket-claude</div>
            <div className="font-mono text-[10.5px] mt-0.5" style={{ color: 'var(--muted)' }}>
              v0.1.0 · {onlineCount}/{devices.length} online
            </div>
          </div>
          <button onClick={() => setDrawerOpen(false)} className="md:hidden btn btn-icon btn-ghost">
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-1.5 py-2">
          {/* Projects section */}
          <div className="flex items-center justify-between px-2 pt-2 pb-1.5">
            <div className="font-mono text-[10px] uppercase tracking-[0.12em]" style={{ color: 'var(--muted)' }}>projects</div>
            <button onClick={() => setShowAddProject(true)}
              className="w-5 h-5 rounded flex items-center justify-center text-[14px] hover:bg-[var(--surface-2)]"
              style={{ color: 'var(--muted)' }} title="Новый проект">
              +
            </button>
          </div>

          {projects.length === 0 && (
            <div className="px-3 py-5 text-center">
              <div className="font-mono text-[10.5px]" style={{ color: 'var(--muted)' }}>
                {devices.length === 0 ? '└─ нужно подключить устройство' : '└─ создай первый проект'}
              </div>
            </div>
          )}

          {projects.map(p => {
            const isOpen = expanded.has(p.id);
            const isActive = activeProjectId === p.id;
            const plist = sessionsByProject[p.id] || [];
            const device = devices.find(d => d.id === p.device_id);
            return (
              <div key={p.id} className="mb-px">
                <div className="group flex items-center gap-1.5 px-2 py-[5px] rounded-md cursor-pointer"
                  style={{
                    background: isActive ? 'var(--accent)' : 'transparent',
                    color: isActive ? 'var(--bg)' : 'var(--fg-2)',
                  }}>
                  <button onClick={() => toggleProject(p.id)}
                    className="font-mono text-[9px] w-2.5 flex items-center justify-center shrink-0"
                    style={{ color: isActive ? 'rgba(255,255,255,.5)' : 'var(--muted)' }}>
                    {isOpen ? '▾' : '▸'}
                  </button>
                  <button onClick={() => {
                    setActiveProjectId(p.id);
                    setActiveSessionId(null);
                    setDrawerOpen(false);
                    setMobilePane('chat');
                    // Раскрываем проект чтобы сразу были видны сессии для выбора.
                    if (!expanded.has(p.id)) {
                      const n = new Set(expanded); n.add(p.id); setExpanded(n);
                    }
                  }}
                    className="flex-1 text-left text-[13px] truncate min-w-0">{p.name}</button>
                  {device && (
                    <span className="font-mono text-[9.5px] px-1.5 py-px rounded shrink-0"
                      style={{
                        background: isActive ? 'rgba(255,255,255,.12)' : 'var(--surface-2)',
                        color: isActive ? 'rgba(255,255,255,.7)' : 'var(--muted)',
                        border: isActive ? '1px solid transparent' : '1px solid var(--border)',
                      }}>{device.name}</span>
                  )}
                  <button onClick={(e) => { e.stopPropagation(); deleteProject(p.id); }}
                    className="opacity-0 group-hover:opacity-100 ml-0.5"
                    style={{ color: isActive ? 'rgba(255,255,255,.6)' : 'var(--muted)' }}>
                    <X size={11} />
                  </button>
                </div>
                {isOpen && (
                  <div className="ml-1 mt-0.5 mb-1">
                    <button onClick={() => { setActiveProjectId(p.id); setActiveSessionId(null); setDrawerOpen(false); setMobilePane('chat'); }}
                      className="w-full flex items-center gap-1.5 px-2 py-1 text-[11.5px] rounded-md hover:bg-[var(--surface-2)]"
                      style={{ color: 'var(--muted)' }}>
                      <span className="font-mono w-3 inline-block">{plist.length === 0 ? '└─' : '├─'}</span>
                      <Plus size={10} /> новый чат
                    </button>
                    {plist.map((s, idx) => {
                      const isLast = idx === plist.length - 1;
                      const isActiveSession = activeSessionId === s.id;
                      return (
                        <div key={s.id} className="group flex items-center gap-1 px-2 py-1 rounded-md"
                          style={{
                            background: isActiveSession ? 'var(--accent-tint)' : 'transparent',
                            color: isActiveSession ? 'var(--fg)' : 'var(--fg-2)',
                            fontWeight: isActiveSession ? 500 : 400,
                          }}>
                          <span className="font-mono text-[11px] w-3 inline-block" style={{ color: 'var(--muted)' }}>{isLast ? '└─' : '├─'}</span>
                          <button onClick={() => { setActiveSessionId(s.id); setActiveProjectId(p.id); setDrawerOpen(false); setMobilePane('chat'); }}
                            className="flex-1 text-left truncate text-[12px]">{s.title}</button>
                          <button onClick={(e) => { e.stopPropagation(); deleteSession(s.id); }}
                            className="opacity-0 group-hover:opacity-100" style={{ color: 'var(--muted)' }}>
                            <X size={10} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {/* Tools section */}
          <div className="font-mono text-[10px] uppercase tracking-[0.12em] px-2 pt-4 pb-1.5" style={{ color: 'var(--muted)' }}>tools</div>
          <button onClick={() => setShowSettings(true)}
            className="w-full flex items-center gap-2 px-2 py-[5px] rounded-md text-[12.5px] hover:bg-[var(--surface-2)]"
            style={{ color: 'var(--fg-2)' }}>
            <SettingsIcon size={12} style={{ color: 'var(--muted)' }} />
            <span className="flex-1 text-left">Settings</span>
            <span className="font-mono text-[9.5px] px-1.5 py-px rounded"
              style={{ background: 'var(--surface-2)', color: 'var(--muted)', border: '1px solid var(--border)' }}>⌘,</span>
          </button>

          {/* Devices section — split by role */}
          <div className="flex items-center justify-between px-2 pt-4 pb-1.5">
            <div className="font-mono text-[10px] uppercase tracking-[0.12em]" style={{ color: 'var(--muted)' }}>
              devices <span className="ml-1" style={{ color: 'var(--border-strong)' }}>·</span> <span style={{ color: 'var(--fg-2)' }}>{onlineCount}/{devices.length}</span>
            </div>
            <button onClick={() => setShowAddDevice(true)}
              className="w-5 h-5 rounded flex items-center justify-center text-[14px] hover:bg-[var(--surface-2)]"
              style={{ color: 'var(--muted)' }} title="Подключить устройство">
              +
            </button>
          </div>

          {devices.length === 0 ? (
            <button onClick={() => setShowAddDevice(true)}
              className="w-full flex items-center gap-2 px-2 py-[5px] rounded-md text-[12px] hover:bg-[var(--surface-2)]"
              style={{ color: 'var(--muted)' }}>
              <span className="font-mono w-3 inline-block">└─</span>
              нет подключений
            </button>
          ) : (() => {
            const claudeDevs = devices.filter(d => effectiveIntent(d) === 'claude');
            const fsDevs = devices.filter(d => effectiveIntent(d) === 'fs-only');
            const renderRow = (d: Device, role: 'claude' | 'fs-only') => (
              <button key={d.id} onClick={() => setShowSettings(true)}
                className="group w-full flex items-center gap-1.5 px-2 py-[5px] rounded-md hover:bg-[var(--surface-2)] text-left"
                title={`${d.name} · ${d.os || ''}/${d.arch || ''}${d.hostname ? ' · ' + d.hostname : ''}`}>
                <span className="text-[12px] leading-none w-3.5 shrink-0">{role === 'claude' ? '🤖' : '📂'}</span>
                <span className="font-mono text-[10px] w-2 inline-block shrink-0"
                  style={{ color: d.online ? 'var(--ok)' : 'var(--danger)' }}>{d.online ? '●' : '○'}</span>
                <span className="text-[12.5px] truncate flex-1" style={{ color: 'var(--fg-2)' }}>{d.name}</span>
                <span className="font-mono text-[10px] shrink-0" style={{ color: 'var(--muted)' }}>
                  {d.os === 'darwin' ? 'mac' : d.os === 'linux' ? 'linux' : d.os === 'win32' ? 'win' : d.kind}
                </span>
                {role === 'claude' && d.online && d.claude_logged_in === false && (
                  <span className="font-mono text-[9.5px] shrink-0" title="нет claude login" style={{ color: 'var(--warn)' }}>⚠</span>
                )}
              </button>
            );
            return (
              <>
                {claudeDevs.length > 0 && (
                  <>
                    <div className="font-mono text-[9px] uppercase tracking-[0.14em] px-2 pt-1 pb-0.5" style={{ color: 'var(--muted)', opacity: .65 }}>
                      🤖 claude
                    </div>
                    {claudeDevs.map(d => renderRow(d, 'claude'))}
                  </>
                )}
                {fsDevs.length > 0 && (
                  <>
                    <div className="font-mono text-[9px] uppercase tracking-[0.14em] px-2 pt-2 pb-0.5" style={{ color: 'var(--muted)', opacity: .65 }}>
                      📂 files
                    </div>
                    {fsDevs.map(d => renderRow(d, 'fs-only'))}
                  </>
                )}
              </>
            );
          })()}
        </div>

        {/* User block */}
        <div className="flex items-center gap-2.5 px-3 py-3" style={{ borderTop: '1px solid var(--border)' }}>
          <div className="w-6 h-6 rounded-full flex items-center justify-center font-mono text-[11px] font-semibold shrink-0"
            style={{ background: 'var(--accent)', color: 'var(--bg)' }}>
            {(user.name || user.email)[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[12.5px] truncate leading-tight">{user.name || user.email.split('@')[0]}</div>
            <div className="font-mono text-[10.5px] truncate" style={{ color: 'var(--muted)' }}>{user.email}</div>
          </div>
        </div>
      </aside>

      {/* ============ CENTER ============ */}
      <main className={`flex-1 flex flex-col min-w-0 min-h-0 ${mobilePane !== 'chat' ? 'hidden md:flex' : 'flex'}`}>

        {/* Topbar — prompt-style breadcrumb */}
        <div className="flex items-center justify-between gap-3 px-4 py-2.5"
          style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}>
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <button onClick={() => setDrawerOpen(true)} className="md:hidden btn btn-icon btn-ghost">
              <Menu size={18} />
            </button>
            <div className="font-mono text-[13px] flex items-baseline gap-1.5 min-w-0">
              <span style={{ color: 'var(--muted)' }}>~</span>
              <span className="truncate" style={{ fontWeight: 500 }}>{activeProject?.name || 'pocket-claude'}</span>
              {activeDevice && (
                <span className="text-[11.5px] flex items-center gap-1 shrink-0" style={{ color: 'var(--muted)' }}>
                  <span>@</span>
                  <span className="inline-block w-[6px] h-[6px] rounded-full"
                    style={{ background: activeDevice.online ? 'var(--ok)' : 'var(--danger)' }} />
                  <span>{activeDevice.name}</span>
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {/* Landscape-phone: компактный pane-switcher (chat/files/terminal), т.к. bottom nav скрыт */}
            {activeProject && (
              <div className="hidden short:flex md:short:hidden items-center gap-0.5 mr-1 rounded-md overflow-hidden"
                style={{ border: '1px solid var(--border)', background: 'var(--surface)' }}>
                {([
                  { id: 'chat' as const, ic: MessageSquare, lbl: 'chat' },
                  { id: 'files' as const, ic: Files, lbl: 'files' },
                  { id: 'terminal' as const, ic: TerminalSquare, lbl: 'terminal' },
                ]).map((t) => {
                  const Icon = t.ic;
                  const active = mobilePane === t.id;
                  return (
                    <button key={t.id} onClick={() => setMobilePane(t.id)}
                      className="px-2.5 py-1 inline-flex items-center justify-center"
                      style={{
                        background: active ? 'var(--accent)' : 'transparent',
                        color: active ? 'var(--bg)' : 'var(--fg-2)',
                      }}
                      aria-label={t.lbl}>
                      <Icon size={14} />
                    </button>
                  );
                })}
              </div>
            )}
            {/* Mobile-only: модель + цветной индикатор режима. Tap → шторка настроек. */}
            {activeProjectId && (
              <button type="button" onClick={() => setMobileSheetOpen(true)}
                className="md:hidden font-mono inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] shrink-0"
                style={{ background: 'var(--surface)', color: 'var(--fg)', border: '1px solid var(--border)' }}
                aria-label={`Модель: ${model}, режим: ${permissionMode}`}
                title={permissionMode}>
                <span>{(MODELS.find(m => m.value === model)?.label || 'Sonnet').split(' ')[0]}</span>
                <span className="inline-block w-[7px] h-[7px] rounded-full"
                  style={{
                    background:
                      permissionMode === 'bypassPermissions' ? 'var(--warn)' :
                      permissionMode === 'acceptEdits' ? 'var(--ok)' :
                      permissionMode === 'plan' ? '#7c8ef0' :
                      'var(--muted)',
                  }} />
              </button>
            )}
            {activeProjectId && (
              <button onClick={() => { setActiveSessionId(null); setMessages([]); setTools([]); }}
                className="font-mono inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[12px]"
                style={{ background: 'var(--accent)', color: 'var(--bg)', border: '1px solid var(--accent)' }}>
                <Plus size={11} /> Чат
                <span className="hidden md:inline text-[9.5px] px-1 py-px rounded" style={{ background: 'rgba(255,255,255,.14)' }}>⌘N</span>
              </button>
            )}
            <button onClick={() => setRightOpen(!rightOpen)}
              className="hidden md:inline-flex font-mono items-center gap-1 px-2.5 py-1 rounded-md text-[12px]"
              style={{ background: 'var(--surface)', color: 'var(--fg)', border: '1px solid var(--border)' }}>
              <Files size={11} />
              <span>{rightOpen ? 'Скрыть' : 'Файлы'}</span>
            </button>
          </div>
        </div>

        {/* Messages / Welcome */}
        <div className="flex-1 overflow-y-auto">

          {/* WELCOME — no project */}
          {messages.length === 0 && !activeSessionId && !runningJob && !activeProject && (
            <div className="animate-fadeIn">
              <div className="max-w-3xl mx-auto px-6 py-10">
                <h1 className="text-[26px] font-semibold tracking-[-0.025em] flex items-baseline gap-2.5 flex-wrap">
                  Привет, {user.name?.split(' ')[0] || user.email.split('@')[0]}
                  <span className="font-mono text-[12px] px-2 py-0.5 rounded font-normal"
                    style={{ background: 'var(--surface-2)', color: 'var(--muted)', border: '1px solid var(--border)' }}>v0.1.0</span>
                </h1>
                <p className="font-mono text-[12.5px] mt-2 mb-7 flex items-center gap-3 flex-wrap" style={{ color: 'var(--muted)' }}>
                  <span><span style={{ color: 'var(--ok)' }}>●</span> {onlineCount}/{devices.length} устройств online</span>
                  <span style={{ color: 'var(--border-strong)' }}>·</span>
                  <span>{projects.length} проектов</span>
                  <span style={{ color: 'var(--border-strong)' }}>·</span>
                  <span>{sessions.length} чатов</span>
                </p>

                {/* Stats grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 rounded-xl overflow-hidden mb-7"
                  style={{ border: '1px solid var(--border)', background: 'var(--bg)' }}>
                  {[
                    { k: 'Устройств', v: `${onlineCount}/${devices.length || 0}`, sub: devices.length === 0 ? 'нет подключений' : 'online' },
                    { k: 'Проектов', v: projects.length.toString(), sub: projects.length === 0 ? 'создай первый' : 'на устройствах' },
                    { k: 'Чатов', v: sessions.length.toString(), sub: sessions.length > 0 ? 'всего' : 'пока пусто' },
                    { k: 'Модель', v: MODELS.find(m => m.value === model)?.label || model, sub: `effort: ${effort}` },
                  ].map((c, i) => (
                    <div key={i} className="px-4 py-3"
                      style={{
                        borderRight: (i % 4) < 3 ? '1px solid var(--border)' : undefined,
                        borderTop: i >= 2 ? '1px solid var(--border)' : undefined,
                      }}>
                      <div className="font-mono text-[10.5px] uppercase tracking-[0.08em]" style={{ color: 'var(--muted)' }}>{c.k}</div>
                      <div className="font-mono text-[20px] font-medium leading-none mt-1.5 tracking-tight">{c.v}</div>
                      <div className="font-mono text-[11px] mt-1" style={{ color: 'var(--muted)' }}>{c.sub}</div>
                    </div>
                  ))}
                </div>

                {/* Devices */}
                <div className="mb-7">
                  <div className="flex items-center justify-between pb-2 mb-2" style={{ borderBottom: '1px solid var(--border)' }}>
                    <div className="font-mono text-[11px] uppercase tracking-[0.1em]">
                      <span style={{ color: 'var(--muted)' }}># </span>devices
                    </div>
                    <button onClick={() => setShowAddDevice(true)} className="font-mono text-[11px] hover:underline" style={{ color: 'var(--muted)' }}>
                      + подключить
                    </button>
                  </div>
                  {devices.length === 0 ? (
                    <button onClick={() => setShowAddDevice(true)}
                      className="w-full text-left px-4 py-4 rounded-lg hover:bg-[var(--surface)]"
                      style={{ border: '1px dashed var(--border-strong)' }}>
                      <div className="text-[13.5px] font-medium">Подключи первое устройство</div>
                      <div className="font-mono text-[11.5px] mt-0.5" style={{ color: 'var(--muted)' }}>
                        сервер или комп с установленным claude cli
                      </div>
                    </button>
                  ) : (
                    <div className="space-y-px">
                      {devices.map((d, idx) => {
                        const isLast = idx === devices.length - 1;
                        return (
                          <div key={d.id} className="flex items-center gap-2.5 px-2 py-2 rounded hover:bg-[var(--surface)]">
                            <span className="font-mono text-[12px] w-4 shrink-0" style={{ color: 'var(--muted)' }}>{isLast ? '└─' : '├─'}</span>
                            <span className="font-mono text-[10px] shrink-0"
                              style={{ color: d.online ? 'var(--ok)' : 'var(--danger)' }}>{d.online ? '●' : '○'}</span>
                            <span className="text-[13px] font-medium truncate">{d.name}</span>
                            <span className="font-mono text-[10.5px] shrink-0" style={{ color: 'var(--muted)' }}>
                              {d.os || '—'}/{d.arch || '—'}
                            </span>
                            {d.root_path && (
                              <span className="font-mono text-[10.5px] truncate ml-auto opacity-80" style={{ color: 'var(--muted)' }}>
                                {d.root_path}
                              </span>
                            )}
                            {d.online && d.claude_logged_in === false && (
                              <span className="font-mono text-[10.5px] shrink-0" style={{ color: 'var(--warn)' }}>⚠ no_login</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Projects */}
                <div className="mb-7">
                  <div className="flex items-center justify-between pb-2 mb-2" style={{ borderBottom: '1px solid var(--border)' }}>
                    <div className="font-mono text-[11px] uppercase tracking-[0.1em]">
                      <span style={{ color: 'var(--muted)' }}># </span>projects
                      <span className="ml-2" style={{ color: 'var(--muted)' }}>{projects.length}</span>
                    </div>
                    <button onClick={() => setShowAddProject(true)} className="font-mono text-[11px] hover:underline" style={{ color: 'var(--muted)' }}>
                      + создать
                    </button>
                  </div>
                  {projects.length === 0 ? (
                    <button onClick={() => setShowAddProject(true)}
                      disabled={devices.length === 0}
                      className="w-full text-left px-4 py-4 rounded-lg hover:bg-[var(--surface)] disabled:opacity-50"
                      style={{ border: '1px dashed var(--border-strong)' }}>
                      <div className="text-[13.5px] font-medium">Открой папку с проектом или создай новый</div>
                    </button>
                  ) : (
                    <div className="space-y-px">
                      {projects.slice(0, 6).map((p, idx) => {
                        const dev = devices.find(d => d.id === p.device_id);
                        const isLast = idx === Math.min(projects.length, 6) - 1;
                        return (
                          <button key={p.id}
                            onClick={() => { setActiveProjectId(p.id); setActiveSessionId(null); }}
                            className="w-full flex items-center gap-2.5 px-2 py-2 rounded hover:bg-[var(--surface)] text-left">
                            <span className="font-mono text-[12px] w-4 shrink-0" style={{ color: 'var(--muted)' }}>{isLast ? '└─' : '├─'}</span>
                            <span className="text-[13px] font-medium truncate">{p.name}</span>
                            {dev && (
                              <span className="font-mono text-[10px] px-1.5 py-px rounded shrink-0"
                                style={{ background: 'var(--surface-2)', color: 'var(--muted)', border: '1px solid var(--border)' }}>
                                <span style={{ color: dev.online ? 'var(--ok)' : 'var(--danger)' }}>●</span> {dev.name}
                              </span>
                            )}
                            <span className="font-mono text-[10.5px] truncate ml-auto opacity-80" style={{ color: 'var(--muted)' }}>{p.path || 'sandbox'}</span>
                            <span className="font-mono text-[11px] shrink-0" style={{ color: 'var(--muted)' }}>→</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Recent chats */}
                {sessions.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between pb-2 mb-2" style={{ borderBottom: '1px solid var(--border)' }}>
                      <div className="font-mono text-[11px] uppercase tracking-[0.1em]">
                        <span style={{ color: 'var(--muted)' }}># </span>recent_chats
                      </div>
                      <span className="font-mono text-[11px]" style={{ color: 'var(--muted)' }}>{Math.min(sessions.length, 6)} of {sessions.length}</span>
                    </div>
                    <div className="space-y-px">
                      {sessions.slice(0, 6).map((s, idx) => {
                        const proj = projects.find(p => p.id === s.project_id);
                        const isLast = idx === Math.min(sessions.length, 6) - 1;
                        return (
                          <button key={s.id}
                            onClick={() => { if (proj) setActiveProjectId(proj.id); setActiveSessionId(s.id); }}
                            className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded hover:bg-[var(--surface)] text-left">
                            <span className="font-mono text-[12px] w-4 shrink-0" style={{ color: 'var(--muted)' }}>{isLast ? '└─' : '├─'}</span>
                            <span className="text-[12.5px] truncate">{s.title}</span>
                            {proj && <span className="font-mono text-[10.5px] ml-auto shrink-0" style={{ color: 'var(--muted)' }}>{proj.name}</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* WELCOME — project active, no session */}
          {messages.length === 0 && !activeSessionId && !runningJob && activeProject && (
            <div className="animate-fadeIn">
              <div className="max-w-3xl mx-auto px-6 py-12">
                <h1 className="text-[26px] font-semibold tracking-[-0.025em] flex items-baseline gap-2.5 flex-wrap">
                  {activeProject.name}
                  {activeDevice && (
                    <span className="font-mono text-[12px] px-2 py-0.5 rounded font-normal"
                      style={{ background: 'var(--surface-2)', color: 'var(--muted)', border: '1px solid var(--border)' }}>
                      @{activeDevice.name}
                    </span>
                  )}
                </h1>
                <p className="font-mono text-[12.5px] mt-2 mb-7 flex items-center gap-3 flex-wrap" style={{ color: 'var(--muted)' }}>
                  {activeDevice && (
                    <span><span style={{ color: activeDevice.online ? 'var(--ok)' : 'var(--danger)' }}>●</span> {activeDevice.online ? 'online' : 'offline'}</span>
                  )}
                  {activeDevice && <span style={{ color: 'var(--border-strong)' }}>·</span>}
                  <span style={{ color: 'var(--fg-2)' }}>{activeProject.path || 'sandbox'}</span>
                  {activeDevice?.os && (
                    <>
                      <span style={{ color: 'var(--border-strong)' }}>·</span>
                      <span>{activeDevice.os}/{activeDevice.arch}</span>
                    </>
                  )}
                </p>

                <div className="font-mono text-[11px] uppercase tracking-[0.1em] pb-2 mb-3"
                  style={{ color: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>
                  <span># </span>quick_prompts
                </div>
                <div className="space-y-1.5">
                  {[
                    'Что в этой папке? Кратко.',
                    'Покажи git status и опиши изменения',
                    'Найди и покажи TODO-комментарии',
                  ].map((s, i) => (
                    <button key={s} onClick={() => sendMessage(s)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-left hover:bg-[var(--surface)] animate-fadeUp"
                      style={{ border: '1px solid var(--border)', animationDelay: `${i * 40}ms` }}>
                      <span className="font-mono text-[12px] shrink-0" style={{ color: 'var(--muted)' }}>$</span>
                      <span className="text-[13px] flex-1">{s}</span>
                      <span className="font-mono text-[10.5px]" style={{ color: 'var(--muted)' }}>↵</span>
                    </button>
                  ))}
                </div>

                {/* История чатов этого проекта — сразу видна, не прячется под ▸ */}
                {(sessionsByProject[activeProject.id] || []).length > 0 && (
                  <div className="mt-7">
                    <div className="flex items-center justify-between pb-2 mb-2"
                      style={{ borderBottom: '1px solid var(--border)' }}>
                      <div className="font-mono text-[11px] uppercase tracking-[0.1em]">
                        <span style={{ color: 'var(--muted)' }}># </span>chats
                        <span className="ml-2" style={{ color: 'var(--muted)' }}>
                          {(sessionsByProject[activeProject.id] || []).length}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-px">
                      {(sessionsByProject[activeProject.id] || []).map((s, idx, arr) => {
                        const isLast = idx === arr.length - 1;
                        return (
                          <button key={s.id}
                            onClick={() => { setActiveSessionId(s.id); setMobilePane('chat'); }}
                            className="w-full flex items-center gap-2.5 px-2 py-2 rounded hover:bg-[var(--surface)] text-left group">
                            <span className="font-mono text-[12px] w-4 shrink-0" style={{ color: 'var(--muted)' }}>{isLast ? '└─' : '├─'}</span>
                            <span className="text-[13px] truncate flex-1">{s.title}</span>
                            <span className="font-mono text-[10.5px] shrink-0" style={{ color: 'var(--muted)' }}>
                              {new Date(s.updated_at).toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' })}
                            </span>
                            <span className="font-mono text-[11px] opacity-0 group-hover:opacity-100 shrink-0" style={{ color: 'var(--muted)' }}>→</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Messages list */}
          <div className="max-w-3xl mx-auto px-4 md:px-8 py-6 flex flex-col gap-5">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-3 animate-fadeUp ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className="w-7 h-7 rounded-md flex items-center justify-center text-[10.5px] font-semibold shrink-0 font-mono"
                  style={{
                    background: m.role === 'user' ? 'var(--surface-2)' : 'var(--accent)',
                    color: m.role === 'user' ? 'var(--fg-2)' : 'var(--bg)',
                    border: m.role === 'user' ? '1px solid var(--border)' : 'none',
                  }}>
                  {m.role === 'user' ? (user.name?.[0] || 'У').toUpperCase() : 'C'}
                </div>
                <div className={`min-w-0 max-w-[min(85%,680px)] ${m.role === 'user' ? 'text-right' : ''}`}>
                  <div className={m.role === 'user' ? 'inline-block px-3.5 py-2 text-left' : ''}
                    style={m.role === 'user' ? {
                      background: 'var(--surface-2)', color: 'var(--fg)',
                      border: '1px solid var(--border)',
                      borderRadius: '12px 12px 4px 12px',
                    } : {}}>
                    {m.content
                      ? (m.role === 'user'
                          ? <span className="whitespace-pre-wrap text-[14px]">{m.content}</span>
                          : <Markdown content={m.content} />)
                      : (m.role === 'assistant' && sending && i === messages.length - 1
                          ? <span className="typing-dots inline-block"><span></span><span></span><span></span></span>
                          : null)}
                  </div>
                </div>
              </div>
            ))}

            {/* Tool chips */}
            {tools.length > 0 && sending && (
              <div className="ml-10 flex flex-wrap gap-1.5 animate-fadeIn">
                {tools.slice(-5).map(t => (
                  <span key={t.id} className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-mono"
                    style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--fg-2)' }}>
                    <span className="px-1 py-px rounded text-[9px] uppercase tracking-wide font-semibold"
                      style={{ background: 'var(--accent)', color: 'var(--bg)' }}>{t.tool}</span>
                    {t.input && <span className="truncate max-w-[260px]" style={{ color: 'var(--muted)' }}>{t.input}</span>}
                  </span>
                ))}
              </div>
            )}

            {/* Running job indicator */}
            {runningJob && !sending && (
              <div className="flex gap-3 ml-0 animate-fadeIn">
                <div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
                  style={{ background: 'var(--accent)', color: 'var(--bg)' }}>
                  <Loader2 size={13} className="animate-spin" />
                </div>
                <div className="px-3.5 py-2.5 max-w-[min(85%,680px)]"
                  style={{
                    background: 'var(--surface)', border: '1px solid var(--border)',
                    borderRadius: '12px 12px 12px 4px',
                  }}>
                  <div className="flex items-center gap-2 font-mono text-[11.5px]" style={{ color: 'var(--muted)' }}>
                    <span><span style={{ color: 'var(--ok)' }}>●</span> {activeDevice?.name}</span>
                    <span>·</span>
                    <span>{fmtDuration(Date.now() - new Date(runningJob.started_at).getTime())}</span>
                  </div>
                  {runningJob.partial && (
                    <div className="mt-2 text-[13px] whitespace-pre-wrap" style={{ opacity: .85 }}>
                      {runningJob.partial.slice(-500)}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        </div>

        {/* Composer — prompt-style.
            safe-area на mobile обрабатывает bottom-nav (ниже). Здесь safe-bottom включаем
            только если проект не выбран (тогда nav скрыт и composer — последний элемент). */}
        <div className={`shrink-0 px-4 md:px-8 pt-3 pb-4 ${!activeProject ? 'safe-bottom' : ''}`}
          style={{ borderTop: '1px solid var(--border)', background: 'var(--bg)' }}>
          <div className="max-w-3xl mx-auto relative">
            {/* Slash dropdown */}
            {slashSuggestions.length > 0 && (
              <div className="absolute bottom-full mb-2 left-0 right-0 overflow-hidden z-10 animate-scaleIn rounded-lg"
                style={{
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  boxShadow: 'var(--shadow-lg)', transformOrigin: 'bottom',
                }}>
                <div className="px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.1em] flex items-center gap-1"
                  style={{ color: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>
                  <span>/ slash_commands</span>
                  <span className="ml-auto flex items-center gap-1">
                    <span className="kbd">↑↓</span><span className="kbd">Tab</span>
                  </span>
                </div>
                <div className="max-h-[280px] overflow-y-auto">
                  {slashSuggestions.map((c, i) => (
                    <button key={c.name}
                      onClick={() => { setInput(c.name + (c.args ? ' ' : '')); setSlashOpen(!!c.args); }}
                      className="w-full px-3 py-2 text-left flex items-center gap-2 text-[13px]"
                      style={{ background: i === slashIdx ? 'var(--accent-tint)' : 'transparent' }}>
                      <span className="font-mono text-[12.5px]" style={{ color: 'var(--accent)' }}>{c.name}</span>
                      {c.args && <span className="font-mono text-[11px]" style={{ color: 'var(--muted)' }}>{c.args}</span>}
                      <span className="ml-auto text-[11px] truncate" style={{ color: 'var(--muted)' }}>{c.description}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input row */}
            <div className="flex items-end gap-1.5 md:gap-2.5 px-1.5 md:px-3 py-1.5 md:py-2.5 rounded-[24px] md:rounded-xl"
              style={{ background: 'var(--surface)', border: '1px solid var(--border-strong)' }}>
              {/* + — открывает mobile sheet с настройками + tools. На desktop прячем. */}
              <button type="button" onClick={() => setMobileSheetOpen(true)}
                disabled={!activeProjectId}
                className="md:hidden w-10 h-10 rounded-full flex items-center justify-center disabled:opacity-30 shrink-0"
                style={{ color: mobileSheetOpen ? 'var(--bg)' : 'var(--fg-2)', background: mobileSheetOpen ? 'var(--accent)' : 'transparent' }}
                aria-label="Настройки">
                <Plus size={22} />
              </button>
              {/* $ prompt — только на desktop */}
              <span className="hidden md:inline font-mono text-[14px] pt-[3px] shrink-0" style={{ color: 'var(--muted)' }}>$</span>
              <textarea ref={taRef} value={input}
                onChange={(e) => { setInput(e.target.value); setSlashOpen(e.target.value.startsWith('/')); setSlashIdx(0); }}
                onKeyDown={onKey} rows={1}
                disabled={sending || !activeProjectId}
                placeholder={!activeProjectId ? 'Выбери проект…' : sending ? 'Жду ответ…' : 'Сообщение…'}
                className="flex-1 bg-transparent outline-none resize-none text-[16px] md:text-[14px] leading-[1.4] placeholder:opacity-50 py-2 md:pt-0.5"
                style={{ maxHeight: 200 }} />
              {/* Кнопка справа: mic если пусто, send если есть текст или идёт отправка */}
              {input.trim().length === 0 && !sending ? (
                <button type="button"
                  onClick={() => alert('Голосовой ввод — скоро')}
                  disabled={!activeProjectId}
                  className="w-10 h-10 md:w-8 md:h-8 rounded-full flex items-center justify-center disabled:opacity-30 shrink-0"
                  style={{ color: 'var(--muted)' }}
                  aria-label="Голос">
                  <Mic size={18} />
                </button>
              ) : (
                <button onClick={() => sendMessage(input)} disabled={sending || !input.trim()}
                  className="w-10 h-10 md:w-8 md:h-8 rounded-full md:rounded-md flex items-center justify-center disabled:opacity-30 shrink-0"
                  style={{ background: 'var(--accent)', color: 'var(--bg)' }}
                  aria-label="Отправить">
                  {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={14} />}
                </button>
              )}
            </div>

            {/* Pills row — только на desktop. На mobile модель/режим живут в topbar. */}
            <div className="hidden md:flex items-center gap-1.5 mt-2 flex-wrap">
              <ModePill value={permissionMode} onChange={setPermissionMode} />
              <ModelEffortPill model={model} effort={effort} onChange={(m, e) => { setModel(m); setEffort(e); }} />
              <div className="ml-auto font-mono text-[10.5px] flex items-center gap-2" style={{ color: 'var(--muted)' }}>
                <span className="kbd">/</span>commands
                <span style={{ color: 'var(--border-strong)' }}>·</span>
                <span className="kbd">⌘↵</span>send
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ============ RIGHT PANEL (desktop) ============ */}
      {rightOpen && activeProject && (
        <aside className="hidden md:flex w-[320px] shrink-0 flex-col"
          style={{ background: 'var(--bg-2)', borderLeft: '1px solid var(--border)' }}>
          <div className="flex" style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}>
            {[
              { id: 'files' as const, label: 'files' },
              { id: 'terminal' as const, label: 'terminal' },
            ].map(t => (
              <button key={t.id} onClick={() => setRightTab(t.id)}
                className="flex-1 py-2.5 font-mono text-[12px]"
                style={{
                  color: rightTab === t.id ? 'var(--fg)' : 'var(--muted)',
                  borderBottom: rightTab === t.id ? '2px solid var(--accent)' : '2px solid transparent',
                  background: rightTab === t.id ? 'var(--bg)' : 'transparent',
                }}>
                {t.label}
              </button>
            ))}
          </div>
          <div className="flex-1 min-h-0">
            {rightTab === 'files' && <FileTree projectId={activeProjectId!} onOpenFile={(p) => setOpenFile(p)} />}
            {rightTab === 'terminal' && activeDevice && (
              <PtyTerminal
                deviceId={activeDevice.id}
                deviceName={activeDevice.name}
                cwd={activeProject?.path || undefined}
              />
            )}
          </div>
        </aside>
      )}

      {/* ============ MOBILE: Files / Terminal full-screen ============ */}
      {mobilePane === 'files' && activeProject && (
        <div className="flex-1 min-h-0 md:hidden flex flex-col">
          <div className="flex items-center gap-2 px-4 py-3 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
            <button onClick={() => setMobilePane('chat')} className="btn btn-icon btn-ghost"><ArrowLeft size={16} /></button>
            <div className="font-mono text-[12.5px]">files</div>
          </div>
          <div className="flex-1 min-h-0 overflow-hidden"><FileTree projectId={activeProjectId!} onOpenFile={(p) => setOpenFile(p)} /></div>
        </div>
      )}
      {mobilePane === 'terminal' && activeProject && activeDevice && (
        <div className="flex-1 min-h-0 md:hidden flex flex-col">
          <div className="flex items-center gap-2 px-4 py-3 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
            <button onClick={() => setMobilePane('chat')} className="btn btn-icon btn-ghost"><ArrowLeft size={16} /></button>
            <div className="font-mono text-[12.5px]">terminal · {activeDevice.name}</div>
          </div>
          <div className="flex-1 min-h-0 overflow-hidden">
            <PtyTerminal
              deviceId={activeDevice.id}
              deviceName={activeDevice.name}
              cwd={activeProject?.path || undefined}
              mobileBar={true}
              onExit={() => setMobilePane('chat')}
            />
          </div>
        </div>
      )}

      {/* ============ MOBILE bottom tabs ============
         НЕ fixed! Это обычный flex-item в корневом flex-col на mobile —
         composer/terminal-input благодаря этому остаются доступны. */}
      {activeProject && (
        <nav className="md:hidden short:hidden shrink-0 flex pt-1.5 safe-bottom"
          style={{ background: 'var(--bg-2)', borderTop: '1px solid var(--border)' }}>
          {[
            { id: 'chat', icon: MessageSquare, label: 'chat' },
            { id: 'files', icon: Files, label: 'files' },
            { id: 'terminal', icon: TerminalSquare, label: 'terminal' },
          ].map((t) => {
            const Icon = t.icon;
            const active = mobilePane === t.id;
            return (
              <button key={t.id} onClick={() => setMobilePane(t.id as any)}
                className="flex-1 flex flex-col items-center gap-1 py-2.5 relative"
                style={{ color: active ? 'var(--fg)' : 'var(--muted)' }}>
                <Icon size={18} />
                <span className="font-mono text-[10px]">{t.label}</span>
                {active && <span className="absolute top-0 w-8 h-0.5" style={{ background: 'var(--accent)' }} />}
              </button>
            );
          })}
        </nav>
      )}

      {drawerOpen && <div className="fixed inset-0 z-40 md:hidden animate-fadeIn"
        style={{ background: 'rgba(0,0,0,.4)' }} onClick={() => setDrawerOpen(false)} />}

      {showAddDevice && <DeviceAddModal onClose={() => { setShowAddDevice(false); loadDevices(); }} />}
      {showAddProject && <ProjectCreateModal devices={devices}
        onClose={() => setShowAddProject(false)}
        onCreated={(id) => { setShowAddProject(false); setActiveProjectId(id); loadProjects(); }} />}
      {showSettings && <Settings user={user} devices={devices} theme={theme}
        onThemeChange={setThemeAnd}
        onAddDevice={() => { setShowSettings(false); setShowAddDevice(true); }}
        onReload={loadDevices}
        onClose={() => setShowSettings(false)}
        onCreateProject={async (deviceId, path) => {
          const name = path.split('/').filter(Boolean).pop() || 'project';
          const r = await fetch('/api/projects', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, device_id: deviceId, path }),
          });
          if (r.ok) { const j = await r.json(); setActiveProjectId(j.id); loadProjects(); }
        }} />}
      {openFile && activeProjectId && (
        <FileEditor projectId={activeProjectId} filePath={openFile} onClose={() => setOpenFile(null)} />
      )}

      {/* Mobile settings sheet — открывается по [+] слева от textarea или по мета-pill под ним */}
      <MobileChatSheet
        open={mobileSheetOpen}
        onClose={() => setMobileSheetOpen(false)}
        mode={permissionMode}
        onModeChange={setPermissionMode}
        model={model}
        onModelChange={setModel}
        effort={effort}
        onEffortChange={setEffort}
        onOpenFiles={() => { setRightTab('files'); setRightOpen(true); setMobilePane('files'); }}
        onOpenTerminal={() => { setRightTab('terminal'); setRightOpen(true); setMobilePane('terminal'); }}
        onInsertCommand={(text) => {
          setInput(text);
          // Открываем slash-dropdown и фокусируем textarea — юзер либо сразу жмёт Send,
          // либо дописывает args (например, для /cd, /! и т.п.)
          setSlashOpen(false);
          setTimeout(() => taRef.current?.focus(), 100);
        }}
      />
    </div>
  );
}
