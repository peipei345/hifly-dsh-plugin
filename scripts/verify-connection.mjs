import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';
import { createConnection } from '../connection.mjs';

const config = createConnection();
const env = Object.fromEntries(['HOME', 'USERPROFILE', 'PATH', 'TMPDIR', 'TEMP', 'LANG', 'SystemRoot']
  .filter(key => process.env[key]).map(key => [key, process.env[key]]));
Object.assign(env, config.env);
const child = spawn(config.command, config.args, { env, stdio: ['pipe', 'pipe', 'pipe'] });
const pending = new Map();
const lines = createInterface({ input: child.stdout });
let nextId = 1;
let completed = false;

// Keep OAuth protocol messages and credentials out of the verification output.
child.stderr.on('data', chunk => {
  const text = chunk.toString();
  if (text.includes('Waiting for authorization')) console.log('Browser authorization is pending.');
  if (text.includes('Connected to remote server')) console.log('Remote MCP connection established.');
});
lines.on('line', line => {
  let message;
  try { message = JSON.parse(line); } catch { return; }
  if (!pending.has(message.id)) return;
  const { resolve, reject, timer } = pending.get(message.id);
  clearTimeout(timer);
  pending.delete(message.id);
  if (message.error) reject(new Error(`MCP error ${message.error.code}`));
  else resolve(message.result);
});
child.on('error', () => {
  for (const item of pending.values()) item.reject(new Error('Could not start MCP transport'));
});
child.on('exit', code => {
  if (!completed) {
    for (const item of pending.values()) item.reject(new Error(`Transport exited (${code})`));
  }
});
function send(message) { child.stdin.write(`${JSON.stringify({ jsonrpc: '2.0', ...message })}\n`); }
function request(method, params = {}, timeoutMs = 660000) {
  const id = nextId++;
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => { pending.delete(id); reject(new Error(`${method} timed out`)); }, timeoutMs);
    pending.set(id, { resolve, reject, timer });
    send({ id, method, params });
  });
}
try {
  console.log('Checking HiFly MCP. A browser may open for your authorization. No content will be created.');
  const initialized = await request('initialize', {
    protocolVersion: '2025-03-26', capabilities: {},
    clientInfo: { name: 'hifly-dsh-package-check', version: '0.1.0' },
  });
  send({ method: 'notifications/initialized' });
  let cursor;
  const tools = [];
  do {
    const page = await request('tools/list', cursor ? { cursor } : {}, 120000);
    tools.push(...page.tools);
    cursor = page.nextCursor;
  } while (cursor);
  const accountTool = tools.find(tool => tool.name === 'get_account_capabilities');
  if (!accountTool) throw new Error('Expected read-only get_account_capabilities tool was not discovered');
  const account = await request('tools/call', { name: accountTool.name, arguments: {} }, 120000);
  if (account.isError) throw new Error('Read-only account query returned an MCP tool error');
  console.log(JSON.stringify({
    connected: true, protocol: initialized.protocolVersion,
    toolCount: tools.length, readOnlyAccountQuery: 'passed', contentCreated: false,
  }, null, 2));
  completed = true;
} catch (error) {
  console.error(`Connection validation failed: ${error.message}`);
  process.exitCode = 1;
} finally {
  for (const item of pending.values()) clearTimeout(item.timer);
  lines.close();
  child.stdin.end();
  child.kill('SIGTERM');
  const force = setTimeout(() => child.kill('SIGKILL'), 5000);
  force.unref();
}
