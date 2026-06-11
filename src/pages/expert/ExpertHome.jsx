import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/auth';
import { get } from '../../api/request';
import { clickSafe } from '../../utils/clickSafe';

export default function ExpertHome() {
  const { userInfo, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({});

  const entries = [
    { icon: '览', title: '藏品浏览', desc: '查看藏品基本信息', path: '/expert/collection-browse' },
    { icon: '鉴', title: '鉴定任务', desc: '查看并提交鉴定结论', path: '/expert/appraisal-list' },
    { icon: '录', title: '鉴定记录', desc: '查看历史鉴定记录', path: '/expert/appraisal-list?status=已通过' },
    { icon: '修', title: '修复记录', desc: '查看并提交修复记录', path: '/expert/repair-list' }
  ];

  useEffect(() => {
    get('/api/dashboard/expert').then(setStats).catch(() => {});
  }, []);

  const getBadge = (title) => {
    if (title === '鉴定任务') return stats.pendingAppraisals || 0;
    if (title === '修复记录') return stats.pendingRepairs || 0;
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
        <div className="header-title">文物专家工作台</div>
        <div className="header-sub">Expert Dashboard</div>
        <div className="user-chip">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
          <span>{userInfo?.realName || userInfo?.username} · 文物专家</span>
          <button className="btn btn-sm" style={{ marginLeft: 8, background: 'rgba(255,255,255,0.15)', color: '#fff' }} onClick={handleLogout}>退出</button>
        </div>
      </div>
      <div className="container">
        <div className="stat-grid" style={{ marginTop: 20 }}>
          <div className="stat-card"><div className="stat-num">{stats.completedAppraisals || 0}</div><div className="stat-label">已完成鉴定</div></div>
          <div className="stat-card stat-card-warn"><div className="stat-num">{stats.pendingAppraisals || 0}</div><div className="stat-label">待鉴定</div></div>
          <div className="stat-card"><div className="stat-num">{stats.completedRepairs || 0}</div><div className="stat-label">已完成修复</div></div>
          <div className="stat-card stat-card-warn"><div className="stat-num">{stats.pendingRepairs || 0}</div><div className="stat-label">待修复</div></div>
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
