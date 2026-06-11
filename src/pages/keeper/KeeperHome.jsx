import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/auth';
import { get } from '../../api/request';
import { clickSafe } from '../../utils/clickSafe';

export default function KeeperHome() {
  const { userInfo, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({});

  const entries = [
    { icon: '入', title: '未入库藏品入库', desc: '将新藏品直接入库登记', path: '/keeper/initial-storage' },
    { icon: '登', title: '出入库登记', desc: '藏品出库/入库操作', path: '/keeper/storage-form' },
    { icon: '存', title: '存放记录', desc: '查看历史出入库记录', path: '/keeper/storage-records' },
    { icon: '览', title: '藏品浏览', desc: '浏览所有藏品信息', path: '/keeper/collection-browse' }
  ];

  useEffect(() => {
    get('/api/dashboard/keeper').then(setStats).catch(() => {});
  }, []);

  const getBadge = (title) => {
    if (title === '出入库登记') return stats.pendingTasks || 0;
    return 0;
  };

  const handleLogout = async () => {
    const ok = await logout();
    if (ok) navigate('/login', { replace: true });
  };

  return (
    <div>
      <div className="header-banner">
        <div className="header-greeting">博物馆藏品管理系统</div>
        <div className="header-title">库房管理员工作台</div>
        <div className="header-sub">Storage Keeper</div>
        <div className="user-chip">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
          <span>{userInfo?.realName || userInfo?.username} · 库房管理员</span>
          <button className="btn btn-sm" style={{ marginLeft: 8, background: 'rgba(255,255,255,0.15)', color: '#fff' }} onClick={handleLogout}>退出</button>
        </div>
      </div>
      <div className="container">
        <div className="stat-grid" style={{ marginTop: 20 }}>
          <div className="stat-card"><div className="stat-num">{stats.totalInWarehouse || 0}</div><div className="stat-label">在库藏品</div></div>
          <div className="stat-card stat-card-warn"><div className="stat-num">{stats.unstoredCount || 0}</div><div className="stat-label">待入库</div></div>
          <div className="stat-card"><div className="stat-num">{stats.todayInbound || 0}</div><div className="stat-label">今日入库</div></div>
          <div className="stat-card"><div className="stat-num">{stats.todayOutbound || 0}</div><div className="stat-label">今日出库</div></div>
        </div>
        <div className="card">
          <div className="entry-grid">
            {entries.map((e, i) => (
              <div key={i} className="entry-row" onClick={clickSafe(() => navigate(e.path))}>
                <div className="entry-icon">{e.icon}</div>
                <div className="entry-body">
                  <div className="entry-title">
                    {e.title}
                    {getBadge(e.title) > 0 && <span className="entry-badge">{getBadge(e.title)}</span>}
                  </div>
                  <div className="entry-desc">{e.desc}</div>
                </div>
                <span className="entry-arrow">›</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
