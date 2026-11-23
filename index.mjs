import { createConnection } from './connection.mjs';

export const name = 'hifly';
export const inject = ['mcpManager'];

/** Registration is owned by this plugin; disabling it removes its MCP tools. */
export function apply(ctx) {
  ctx.mcpManager.register('hifly', createConnection());
}
