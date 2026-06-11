import { isDemoMode, mockRequest } from './mock';

const BASE_URL = '';

function getToken() {
  return localStorage.getItem('token');
}

function handleUnauth() {
  localStorage.removeItem('token');
  localStorage.removeItem('userInfo');
  window.location.hash = '#/login';
}

async function request(url, options = {}) {
  // 演示模式：纯静态部署（GitHub Pages）时由浏览器内 Mock 接管全部接口
  if (isDemoMode()) {
    return mockRequest(options.method || 'GET', url, options.data);
  }

  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: 'Bearer ' + token } : {})
  };

  try {
    const res = await fetch(BASE_URL + url, {
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
