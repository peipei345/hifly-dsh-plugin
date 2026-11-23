import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';

// Run only after the company has selected and published a public release repo.
const repo = process.argv[2];
if (!repo || !/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repo)) {
  console.error('Usage: node scripts/prepare-market-entry.mjs GITHUB_OWNER/REPOSITORY');
  console.error('The company GitLab project remains private. This does not publish or change any repository.');
  process.exit(1);
}
// GitHub CLI honors the machine's proxy configuration and never exposes its token here.
// This command only reads public repository metadata and package contents.
function github(path) {
  return JSON.parse(execFileSync('gh', ['api', path], { encoding: 'utf8', timeout: 30000 }));
}
const repository = github(`repos/${repo}`);
if (repository.private || repository.archived || repository.disabled) throw new Error('Repository must be public, active and not archived');
if (repository.full_name.toLowerCase() !== repo.toLowerCase()) throw new Error('Repository identity does not match');
const file = github(`repos/${repo}/contents/package.json?ref=${encodeURIComponent(repository.default_branch)}`);
if (file.encoding !== 'base64' || typeof file.content !== 'string') throw new Error('Published package.json is not a regular file');
const manifest = JSON.parse(Buffer.from(file.content, 'base64').toString('utf8'));
const local = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
if (manifest.name !== local.name || manifest.version !== local.version || !manifest.dsh?.bundle?.patch) {
  throw new Error('Published package identity or dsh.bundle differs from this release');
}
const ageHours = (Date.now() - Date.parse(repository.created_at)) / 3600000;
if (ageHours < 24) throw new Error(`Market requires a repository at least 24 hours old; current age: ${ageHours.toFixed(1)} h`);
if (!repository.topics?.includes('dsh-plugin')) throw new Error('Add the dsh-plugin topic before submission');
const outputDir = new URL('../market-output/', import.meta.url);
await mkdir(outputDir, { recursive: true });
const filename = `${repo.replace('/', '__')}.yml`;
const text = `url: https://github.com/${repo}\nname: ${repo}\ncategory: tools\ndescription:\n  en: 'Connect HiFly MCP with browser OAuth to query avatars and voices, generate speech and avatar videos, and check task results.'\n  zh: '飞影 HiFly：通过浏览器授权连接 MCP，查询数字人和声音、生成配音与数字人视频、查询任务结果。'\n`;
await writeFile(new URL(filename, outputDir), text);
console.log(`Ready: market-output/${filename}`);
console.log(`Submit it at data/plugins/${filename} in awesome-dsh-plugin/awesome-dsh-plugin.`);
