#!/usr/bin/env node

/**
 * Script de desenvolvimento - inicia API + Workers juntos
 */

const { spawn } = require('child_process');
const path = require('path');

const processes = [];

function startProcess(name, command, args) {
  console.log(`[*] Starting ${name}...`);

  const proc = spawn(command, args, {
    stdio: 'inherit',
    shell: true,
    cwd: path.resolve(__dirname, '..'),
  });

  proc.on('error', (error) => {
    console.error(`[ERROR] ${name} error:`, error);
  });

  proc.on('exit', (code) => {
    console.log(`${name} exited with code ${code}`);
    cleanup();
  });

  processes.push(proc);
  return proc;
}

function cleanup() {
  console.log('\n[*] Shutting down...');
  processes.forEach((proc) => {
    if (proc && !proc.killed) {
      proc.kill('SIGTERM');
    }
  });
  process.exit(0);
}

// Handle Ctrl+C
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

// Start services
console.log('[*] Starting development environment\n');

startProcess('API', 'npm', ['run', 'dev']);
startProcess('Worker', 'npm', ['run', 'worker']);

console.log('\n[OK] Development environment running!');
console.log('[API] http://localhost:3000');
console.log('[METRICS] http://localhost:3000/api/metrics');
console.log('[HEALTH] http://localhost:3000/api/health\n');
console.log('Press Ctrl+C to stop all services\n');
