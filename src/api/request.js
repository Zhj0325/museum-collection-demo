import { mockRequest } from './mock';

/* ============================================================
   运行模式解析（三种）：
   1. 强制演示：构建时 VITE_DEMO=1 或 URL 带 ?demo → 浏览器内 Mock
   2. 线上(github.io)：从仓库读取 api-config.json 探测真实后端，
      在线 → 直连后端（数据共享、永久保留）；离线 → 自动回退演示模式
   3. 本地开发：相对路径走 vite 代理至 localhost:8080
   ============================================================ */

const FORCED_DEMO = import.meta.env.VITE_DEMO === '1'
  || (typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('demo'));
const ON_PAGES = typeof window !== 'undefined' && window.location.hostname.endsWith('github.io');

// 后端地址配置（随隧道地址变化，由 update-config.mjs 推送，前端运行时拉取）
const CONFIG_SOURCES = [
  { url: 'https://api.github.com/repos/Zhj0325/museum-collection-demo/contents/api-config.json', headers: { Accept: 'application/vnd.github.raw+json' } },
  { url: 'https://raw.githubusercontent.com/Zhj0325/museum-collection-demo/main/api-config.json', headers: {} }
];

let apiBase = '';
let demoActive = FORCED_DEMO;
let modePromise = null;

async function fetchWithTimeout(url, options = {}, ms = 6000) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), ms);
  try {
    return await fetch(url, { ...options, signal: ctl.signal });
  } finally { clearTimeout(t); }
}

export function resolveMode() {
  if (modePromise) return modePromise;
  modePromise = (async () => {
    if (FORCED_DEMO) { demoActive = true; return; }
    if (!ON_PAGES) { demoActive = false; return; }
    try {
      let config = null;
      for (const src of CONFIG_SOURCES) {
        try {
          const res = await fetchWithTimeout(src.url, { headers: src.headers });
          if (res.ok) { config = await res.json(); break; }
        } catch { /* 尝试下一个源 */ }
      }
      if (!config || !config.apiBase) throw new Error('无后端配置');
      const health = await fetchWithTimeout(config.apiBase + '/api/auth/health');
      if (!health.ok) throw new Error('后端不在线');
      apiBase = config.apiBase.replace(/\/$/, '');
      demoActive = false;
    } catch {
      demoActive = true; // 后端不可达 → 回退浏览器内演示模式
    }
  })();
  return modePromise;
}

export function isDemoActive() { return demoActive; }
export function isBackendLive() { return ON_PAGES && !demoActive; }

function getToken() {
  return localStorage.getItem('token');
}

function handleUnauth() {
  localStorage.removeItem('token');
  localStorage.removeItem('userInfo');
  window.location.hash = '#/login';
}

async function request(url, options = {}) {
  await resolveMode();

  // 演示模式：由浏览器内 Mock 接管全部接口
  if (demoActive) {
    return mockRequest(options.method || 'GET', url, options.data);
  }

  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: 'Bearer ' + token } : {})
  };

  try {
    const res = await fetch(apiBase + url, {
      method: options.method || 'GET',
      headers,
      body: options.data ? JSON.stringify(options.data) : undefined,
      signal: options.signal
    });

    if (res.status === 401) {
      handleUnauth();
      throw new Error('请重新登录');
    }

    const json = await res.json();

    if (res.ok && json.code === 200) {
      return json.data;
    }

    const msg = json.message || '请求失败';
    alert(msg.length > 30 ? msg.slice(0, 28) + '…' : msg);
    throw json;
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    if (err.message === '请重新登录') throw err;
    if (err.message && err.message.includes('Failed to fetch')) {
      alert('网络连接失败，请检查后端是否启动');
    }
    throw err;
  }
}

export const get = (url, params) => {
  let fullUrl = url;
  if (params) {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') qs.append(k, v);
    });
    const str = qs.toString();
    if (str) fullUrl += '?' + str;
  }
  return request(fullUrl, { method: 'GET' });
};

export const post = (url, data) => request(url, { method: 'POST', data });
export const put = (url, data) => request(url, { method: 'PUT', data });
export const del = (url) => request(url, { method: 'DELETE' });
