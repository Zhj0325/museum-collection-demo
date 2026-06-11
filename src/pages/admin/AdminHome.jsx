import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/auth';
import { get } from '../../api/request';
import { clickSafe } from '../../utils/clickSafe';

export default function AdminHome() {
  const { userInfo, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({});

  const entries = [
    { icon: '藏', title: '藏品管理', desc: '增删改查藏品信息', path: '/admin/collection-list' },
    { icon: '录', title: '藏品录入', desc: '新增藏品到系统', path: '/admin/collection-form' },
    { icon: '管', title: '审批管理', desc: '出/入库、修复、展览审批', path: '/admin/approval-list' },
    { icon: '鉴', title: '鉴定指派', desc: '指派专家鉴定藏品', path: '/admin/appraisal-assign' },
    { icon: '审', title: '鉴定审核', desc: '审核专家提交的鉴定结论', path: '/admin/appraisal-audit' },
    { icon: '修', title: '修复指派', desc: '指派专家修复藏品', path: '/admin/repair-assign' }
  ];

  useEffect(() => {
    get('/api/dashboard/admin').then(setStats).catch(() => {});
  }, []);

  const getBadge = (title) => {
    if (title === '审批管理') return (stats.pendingOutbound || 0) + (stats.pendingInbound || 0) + (stats.pendingRepair || 0);
    if (title === '鉴定审核') return stats.pendingAppraisalAudit || 0;
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
        <div className="header-title">管理员工作台</div>
        <div className="header-sub">Admin Dashboard</div>
        <div className="user-chip">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
          <span>{userInfo?.realName || userInfo?.username} · 管理员</span>
          <button className="btn btn-sm" style={{ marginLeft: 8, background: 'rgba(255,255,255,0.15)', color: '#fff' }} onClick={handleLogout}>退出</button>
        </div>
      </div>

      <div className="container">
        <div className="stat-grid" style={{ marginTop: 20 }}>
          <div className="stat-card"><div className="stat-num">{stats.totalCollections || 0}</div><div className="stat-label">藏品总数</div></div>
          <div className="stat-card"><div className="stat-num">{stats.inStock || 0}</div><div className="stat-label">在库藏品</div></div>
          <div className="stat-card stat-card-warn"><div className="stat-num">{stats.pendingOutbound || 0}</div><div className="stat-label">待审批出库</div></div>
          <div className="stat-card stat-card-warn"><div className="stat-num">{stats.pendingInbound || 0}</div><div className="stat-label">待审批入库</div></div>
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
