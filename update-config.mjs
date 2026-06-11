/* 更新线上前端的后端地址配置（推送 api-config.json 到仓库 main 分支）
   用法: $env:GH_TOKEN='<token>'; node update-config.mjs https://xxx.trycloudflare.com */
import { EnvHttpProxyAgent, setGlobalDispatcher } from 'undici';
setGlobalDispatcher(new EnvHttpProxyAgent());

const TOKEN = process.env.GH_TOKEN;
const apiBase = process.argv[2];
if (!TOKEN || !apiBase) { console.error('用法: GH_TOKEN=<token> node update-config.mjs <后端地址>'); process.exit(1); }

const REPO_PATH = '/repos/Zhj0325/museum-collection-demo/contents/api-config.json';
const headers = {
  Authorization: 'Bearer ' + TOKEN,
  Accept: 'application/vnd.github+json',
  'User-Agent': 'museum-config-update',
  'Content-Type': 'application/json'
};

const existing = await fetch('https://api.github.com' + REPO_PATH, { headers });
const sha = existing.status === 200 ? (await existing.json()).sha : undefined;

const content = Buffer.from(JSON.stringify({
  apiBase: apiBase.replace(/\/$/, ''),
  updatedAt: new Date().toISOString()
}, null, 2)).toString('base64');

const res = await fetch('https://api.github.com' + REPO_PATH, {
  method: 'PUT', headers,
  body: JSON.stringify({ message: 'config: 更新后端地址 ' + apiBase, content, ...(sha ? { sha } : {}), branch: 'main' })
});
console.log(res.status === 200 || res.status === 201 ? '配置已更新: ' + apiBase : '失败: ' + res.status + ' ' + await res.text());
