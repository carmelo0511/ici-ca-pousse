/* eslint-disable no-console */
const { existsSync } = require('fs');
const { join, resolve } = require('path');
const { spawnSync } = require('child_process');

const projectRoot = resolve(__dirname, '..');
const checks = [
  'node_modules',
  'node_modules/@vercel/analytics',
  'node_modules/@vercel/speed-insights',
  'node_modules/@tensorflow/tfjs',
];

const isMissing = checks.some((relativePath) => !existsSync(join(projectRoot, relativePath)));

if (isMissing) {

  const result = spawnSync('npm', ['install', '--legacy-peer-deps'], {
    cwd: projectRoot,
    stdio: 'inherit',
    shell: true,
    env: process.env,
  });
  process.exit(result.status || 0);
} else {

}


