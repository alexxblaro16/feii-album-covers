#!/usr/bin/env node
// PHASE-X14 acceptance smoke (F1 error boundary + F2 unmount cleanup).
import { spawnSync } from 'node:child_process';

const result = spawnSync(process.execPath, ['node_modules/vitest/vitest.mjs', 'run', 'tests/x14-smoke.test.jsx'], {
  stdio: 'inherit',
  cwd: process.cwd(),
});

process.exit(result.status ?? 1);
