import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

export interface AgentConfig {
  master_url: string;       // wss://claude.mydomain.com/ws/agent
  token: string;            // device_token
  name: string;             // human-readable
  installed_at: string;     // ISO
}

export const CONFIG_DIR = join(homedir(), '.pocket-claude');
export const CONFIG_PATH = join(CONFIG_DIR, 'config.json');

export function loadConfig(): AgentConfig {
  // CLI > env > file
  const fromCli = parseCli();
  if (fromCli.master_url && fromCli.token) {
    return {
      master_url: fromCli.master_url,
      token: fromCli.token,
      name: fromCli.name || 'agent',
      installed_at: new Date().toISOString(),
    };
  }

  if (process.env.PC_MASTER_URL && process.env.PC_TOKEN) {
    return {
      master_url: process.env.PC_MASTER_URL,
      token: process.env.PC_TOKEN,
      name: process.env.PC_NAME || 'agent',
      installed_at: new Date().toISOString(),
    };
  }

  if (existsSync(CONFIG_PATH)) {
    const raw = readFileSync(CONFIG_PATH, 'utf8');
    return JSON.parse(raw);
  }

  console.error('pocket-claude-agent: no config found.');
  console.error('Use: pocket-claude-agent --master wss://... --token ... --name ...');
  console.error('Or: set PC_MASTER_URL, PC_TOKEN, PC_NAME env vars.');
  console.error('Or: create ' + CONFIG_PATH);
  process.exit(1);
}

export function saveConfig(cfg: AgentConfig): void {
  if (!existsSync(CONFIG_DIR)) mkdirSync(CONFIG_DIR, { recursive: true, mode: 0o700 });
  writeFileSync(CONFIG_PATH, JSON.stringify(cfg, null, 2), { mode: 0o600 });
}

function parseCli(): Partial<AgentConfig> {
  const args = process.argv.slice(2);
  const out: Partial<AgentConfig> = {};
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    const v = args[i + 1];
    if (a === '--master' && v) { out.master_url = v; i++; }
    else if (a === '--token' && v) { out.token = v; i++; }
    else if (a === '--name' && v) { out.name = v; i++; }
  }
  return out;
}
