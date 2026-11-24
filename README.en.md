# HiFly for DeepSeek Harness

[中文](README.md)

A DSH connection plugin for the existing HiFly MCP endpoint, `https://hifly.cc/mcp`. Users authorize their own HiFly account in the browser and use the tools available to that account.

This release targets DSH `0.2.2-rc.5`. Local Desktop installation, browser OAuth, discovery of 22 tools, and a real read-only account query have passed. It requires Node.js 22+; DSH Desktop uses its bundled runtime. Source: https://github.com/peipei345/hifly-dsh-plugin . The v0.1.1 Release is public. Track [marketplace submission #18076](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin/pull/18076) for listing status; market search/install requires merge and catalog refresh. The published package was also installed into an isolated profile using the Desktop CLI, with its entry and composed bundle configuration verified. Discovering 22 tools does not mean that every generation tool was exercised.

## Install

Open **Plugins → Add plugin** and enter:

`https://github.com/peipei345/hifly-dsh-plugin/releases/download/v0.1.1/dsh-hifly-0.1.1.tgz`

For local development, an absolute package directory also works. Enable **HiFly · 飞影**, complete browser OAuth, and return to Harness.

First try: `Check my HiFly plan and credits. Do not create any assets or videos.`

HiFly may route consent through `hifly.cc/connect/workbuddy`; the requesting client must display **HiFly for DeepSeek Harness**. The MCP endpoint remains `https://hifly.cc/mcp`. If the page says the request expired, close the old page and disable/re-enable the plugin to start a fresh connection. If authorization succeeds but Harness remains disconnected, disable/re-enable the plugin to reconnect with the saved grant. Do not run the standalone check alongside the active Harness plugin.

Then list avatars and voices, choose resources, and explicitly request creation. Generation uses HiFly credits. Always check the original task ID instead of submitting a duplicate creation request.

## Authentication

The plugin registers `hifly` with DSH's MCP manager and uses pinned `mcp-remote@0.16.7` to bridge OAuth-protected Streamable HTTP to stdio. OAuth state is isolated in `~/.dsh/hifly-plugin/auth/` with directory mode `0700`. No shared API key, static bearer header, login item or edits to other MCP entries are needed.

Disabling the plugin removes its tools and closes its child process. Local authorization remains available for a reinstall. To revoke access, use the authorization controls in your HiFly account.

## Validation

From a source checkout with Node.js 22+ run `npm ci --ignore-scripts --legacy-peer-deps`, `npm run check`, and `npm run verify:connection`. The connection check only lists tools and calls `get_account_capabilities`; it never creates content. The installed package includes the package-check and connection-check scripts as well. Run `npm pack --ignore-scripts` from the source checkout to produce the installable package.
