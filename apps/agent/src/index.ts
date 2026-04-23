#!/usr/bin/env node
import { loadConfig } from './config.js';
import { connect } from './ws-client.js';

const cfg = loadConfig();
console.log(`[agent] starting as "${cfg.name}" → ${cfg.master_url}`);
connect(cfg);

process.on('SIGINT', () => { console.log('\n[agent] bye'); process.exit(0); });
process.on('SIGTERM', () => process.exit(0));
