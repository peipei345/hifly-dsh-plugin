import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { createConnection, MCP_URL } from '../connection.mjs';

const root = new URL('../', import.meta.url);
const pkg = JSON.parse(await readFile(new URL('package.json', root), 'utf8'));
assert(pkg.dsh?.bundle?.patch, 'Missing installable dsh.bundle manifest');
await access(new URL(pkg.dsh.bundle.patch, root));
await access(new URL(pkg.main, root));
await access(new URL(pkg.icon, root));
for (const lang of ['en', 'zh']) {
  const locale = JSON.parse(await readFile(new URL(`locale/${lang}.json`, root), 'utf8'));
  assert(locale.meta?.title && locale.meta?.description, `Missing ${lang} storefront metadata`);
}
assert.equal(MCP_URL, 'https://hifly.cc/mcp');
const entry = createConnection();
assert.equal(entry.transport, 'stdio');
assert(entry.args.includes(MCP_URL));
assert.equal(entry.env.NODE_TLS_REJECT_UNAUTHORIZED, '1');
assert(!entry.headers, 'Do not distribute static authentication headers');
assert(!pkg.scripts.postinstall, 'Installation must not start authorization');
console.log('Package metadata, bundle files, bilingual storefront and connection configuration: passed.');
