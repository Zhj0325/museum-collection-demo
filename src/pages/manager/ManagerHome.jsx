import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/auth';
import { get } from '../../api/request';

export default function ManagerHome() {
  const { userInfo, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({});

  const entries = [
    { icon: '展', title: '常设展览', desc: '管理常设展览信息', path: '/manager/exhibition-list?tab=0' },
    { icon: '巡', title: '临时巡展', desc: '管理临时展览信息', path: '/manager/exhibition-list?tab=1' },
    { icon: '出', title: '出库申请', desc: '提交藏品出库申请', path: '/manager/outbound-form' },
    { icon: '入', title: '入库申请', desc: '提交藏品入库申请', path: '/manager/inbound-form' },
    { icon: '修', title: '修复申请', desc: '提交藏品修复申请', path: '/manager/repair-form' }
  ];

  useEffect(() => {
    get('/api/dashboard/manager').then(setStats).catch(() => {});
  }, []);

  const getBadge = (title) => {
    if (title === '出库申请') return stats.myPendingOutbound || 0;
    if (title === '入库申请') return stats.myPendingInbound || 0;
    if (title === '修复申请') return stats.myPendingRepair || 0;
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
        <div className="header-title">展览负责人工作台</div>
        <div className="header-sub">Exhibition Manager</div>
        <div className="user-chip">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
          <span>{userInfo?.realName || userInfo?.username} · 展览负责人</span>
          <button className="btn btn-sm" style={{ marginLeft: 8, background: 'rgba(255,255,255,0.15)', color: '#fff' }} onClick={handleLogout}>退出</button>
        </div>
      </div>
      <div className="container">
        <div className="stat-grid" style={{ marginTop: 20 }}>
          <div className="stat-card"><div className="stat-num">{stats.totalExhibitions || 0}</div><div className="stat-label">展览总数</div></div>
          <div className="stat-card"><div className="stat-num">{stats.ongoingExhibitions || 0}</div><div className="stat-label">进行中</div></div>
          <div className="stat-card stat-card-warn"><div className="stat-num">{stats.myPendingOutbound || 0}</div><div className="stat-label">待审批出库</div></div>
          <div className="stat-card stat-card-warn"><div className="stat-num">{stats.myPendingInbound || 0}</div><div className="stat-label">待审批入库</div></div>
        </div>
        <div className="card">
          <div className="entry-grid">
            {entries.map((e, i) => (
              <div key={i} className="entry-row" onClick={() => navigate(e.path)}>
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
