import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { homedir } from 'node:os';
import { mkdirSync, chmodSync } from 'node:fs';

export const MCP_URL = 'https://hifly.cc/mcp';
const require = createRequire(import.meta.url);

/** Use the host's Node runtime, not a possibly older system Node from PATH. */
export function createConnection() {
  const authDir = join(homedir(), '.dsh', 'hifly-plugin', 'auth');
  mkdirSync(authDir, { recursive: true, mode: 0o700 });
  chmodSync(authDir, 0o700);
  const proxy = join(dirname(require.resolve('mcp-remote/package.json')), 'dist', 'proxy.js');
  return {
    transport: 'stdio',
    command: process.execPath,
    args: [
      proxy, MCP_URL,
      '--transport', 'http-only',
      '--host', '127.0.0.1',
      '--auth-timeout', '600',
      '--static-oauth-client-metadata', JSON.stringify({
        client_name: 'HiFly for DeepSeek Harness',
        scope: 'hifly:mcp',
      }),
    ],
    env: {
      ELECTRON_RUN_AS_NODE: '1',
      NODE_TLS_REJECT_UNAUTHORIZED: '1',
      MCP_REMOTE_CONFIG_DIR: authDir,
    },
    startupTimeoutMs: 660000,
    toolCallTimeoutMs: 120000,
    closeTimeoutMs: 10000,
    reconnect: { enabled: true, maxAttempts: 3 },
  };
}
