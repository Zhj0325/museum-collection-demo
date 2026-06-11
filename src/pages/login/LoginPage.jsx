import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, getRoleHome } from '../../context/auth';
import { post } from '../../api/request';

const ROLES = [
  { value: 'ADMIN', label: '管理员' },
  { value: 'STORAGE_KEEPER', label: '库房管理员' },
  { value: 'EXHIBITION_MANAGER', label: '展览负责人' },
  { value: 'EXPERT', label: '文物专家' }
];

const QUICK_ENTRIES = [
  { icon: '管', label: '管理员', username: 'admin', password: '123456' },
  { icon: '库', label: '库房管理员', username: 'keeper1', password: '123456' },
  { icon: '展', label: '展览负责人', username: 'manager1', password: '123456' },
  { icon: '专', label: '文物专家', username: 'expert1', password: '123456' }
];

export default function LoginPage() {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ username: '', password: '', realName: '', role: '', phone: '' });
  const [submitting, setSubmitting] = useState(false);
  const { userInfo, saveAuth } = useAuth();
  const navigate = useNavigate();

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    if (submitting) return;
    const { username, password, realName, role, phone } = form;
    if (!username) { alert('请输入账号'); return; }
    if (!password) { alert('请输入密码'); return; }
    if (mode === 'register') {
      if (!realName) { alert('请输入姓名'); return; }
      if (!role) { alert('请选择角色'); return; }
    }
    setSubmitting(true);
    try {
      if (mode === 'login') {
        const data = await post('/api/auth/login', { username, password });
        saveAuth(data.token, data);
        navigate(getRoleHome(data.role), { replace: true });
      } else {
        await post('/api/auth/register', { username, password, realName, role, phone });
        alert('注册成功，请登录');
        setMode('login');
        setForm({ username: '', password: '', realName: '', role: '', phone: '' });
      }
    } catch { /* 错误已由 request.js 统一提示 */ } finally { setSubmitting(false); }
  };

  const quickEntry = async (item) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const data = await post('/api/auth/login', { username: item.username, password: item.password });
      saveAuth(data.token, data);
      navigate(getRoleHome(data.role), { replace: true });
    } catch { /* 错误已由 request.js 统一提示 */ } finally { setSubmitting(false); }
  };

  if (userInfo) return null;

  return (
    <div className="container" style={{ paddingTop: 60 }}>
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <div style={{
          width: 72, height: 72, margin: '0 auto 14px', borderRadius: 20,
          background: 'linear-gradient(135deg, var(--gold), var(--gold-dark))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 24px rgba(139,111,63,0.35)'
        }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="3" x2="21" y1="22" y2="22" /><line x1="6" x2="6" y1="18" y2="11" /><line x1="10" x2="10" y1="18" y2="11" /><line x1="14" x2="14" y1="18" y2="11" /><line x1="18" x2="18" y1="18" y2="11" /><polygon points="12 2 20 7 4 7" />
          </svg>
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, color: 'var(--brown-dark)', letterSpacing: 4 }}>博物馆藏品管理</h1>
        <p style={{ fontSize: 13, color: 'var(--brown-light)', marginTop: 6 }}>
          {mode === 'login' ? '请登录您的账号' : '注册新账号'}
        </p>
      </div>

      <div className="card">
        <div className="form-item">
          <span className="form-label">账号</span>
          <input className="form-input" value={form.username} onChange={e => set('username', e.target.value)} placeholder="请输入账号" />
        </div>
        <div className="form-item">
          <span className="form-label">密码</span>
          <input className="form-input" type="password" value={form.password} onChange={e => set('password', e.target.value)} placeholder="请输入密码" onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
        </div>
        {mode === 'register' && (
          <>
            <div className="form-item">
              <span className="form-label">姓名</span>
              <input className="form-input" value={form.realName} onChange={e => set('realName', e.target.value)} placeholder="请输入姓名" />
            </div>
            <div className="form-item">
              <span className="form-label">角色</span>
              <select className="form-select" value={form.role} onChange={e => set('role', e.target.value)}>
                <option value="">请选择角色</option>
                {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
            <div className="form-item">
              <span className="form-label">手机号</span>
              <input className="form-input" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="选填" />
            </div>
          </>
        )}
        <button className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 20 }} onClick={handleSubmit} disabled={submitting}>
          {submitting ? '处理中...' : mode === 'login' ? '登录' : '注册'}
        </button>
      </div>

      <div style={{ textAlign: 'center', marginTop: 16 }}>
        <button className="btn btn-default" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
          {mode === 'login' ? '没有账号？去注册' : '已有账号？去登录'}
        </button>
      </div>

      <div style={{ marginTop: 32 }}>
        <p style={{ fontSize: 13, color: 'var(--brown-light)', textAlign: 'center', marginBottom: 12 }}>快速进入</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
          {QUICK_ENTRIES.map(item => (
            <button key={item.username} className="btn btn-default" onClick={() => quickEntry(item)}>
              <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--brown-dark)' }}>{item.icon}</span>
              <span style={{ marginLeft: 6 }}>{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
