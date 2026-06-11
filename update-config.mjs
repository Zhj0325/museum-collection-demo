/* 更新线上前端的后端地址配置
   三处同步：本地 public/api-config.json（随构建进 dist）、
   仓库 main:public/api-config.json、gh-pages:api-config.json（线上同源读取，立即生效）
   用法: $env:GH_TOKEN='<token>'; node update-config.mjs https://xxx.trycloudflare.com */
import { writeFileSync } from 'node:fs';
import { EnvHttpProxyAgent, setGlobalDispatcher } from 'undici';
setGlobalDispatcher(new EnvHttpProxyAgent());

const TOKEN = process.env.GH_TOKEN;
const apiBase = process.argv[2];
if (!TOKEN || !apiBase) { console.error('用法: GH_TOKEN=<token> node update-config.mjs <后端地址>'); process.exit(1); }

const REPO = 'Zhj0325/museum-collection-demo';
const headers = {
  Authorization: 'Bearer ' + TOKEN,
  Accept: 'application/vnd.github+json',
  'User-Agent': 'museum-config-update',
  'Content-Type': 'application/json'
};

const configJson = JSON.stringify({
  apiBase: apiBase.replace(/\/$/, ''),
  updatedAt: new Date().toISOString()
}, null, 2) + '\n';
writeFileSync(new URL('./public/api-config.json', import.meta.url), configJson);
const content = Buffer.from(configJson).toString('base64');

async function putFile(branch, path) {
  const url = `https://api.github.com/repos/${REPO}/contents/${path}`;
  const existing = await fetch(`${url}?ref=${branch}`, { headers });
  const sha = existing.status === 200 ? (await existing.json()).sha : undefined;
  const res = await fetch(url, {
    method: 'PUT', headers,
    body: JSON.stringify({ message: 'config: 更新后端地址', content, branch, ...(sha ? { sha } : {}) })
  });
  console.log(`${branch}:${path} → ${res.status === 200 || res.status === 201 ? 'OK' : res.status + ' ' + await res.text()}`);
}

await putFile('main', 'public/api-config.json');
await putFile('gh-pages', 'api-config.json');
console.log('后端地址已更新:', apiBase);
