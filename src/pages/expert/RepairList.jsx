import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { get } from '../../api/request';

const TABS = ['全部', '待修复', '修复中', '已修复'];
const SORT_OPTIONS = [
  { value: 'createdAt|desc', label: '最新优先' },
  { value: 'createdAt|asc', label: '最早优先' },
];

export default function RepairList() {
  const [list, setList] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [sortIdx, setSortIdx] = useState(0);
  const [showSort, setShowSort] = useState(false);
  const navigate = useNavigate();

  const loadData = (tabIdx) => {
    const statusMap = { 1: '待修复', 2: '修复中', 3: '已修复' };
    const status = statusMap[tabIdx];
    const params = status ? { status } : {};
    get('/api/repair-records', params).then(data => setList(data.records || data || [])).catch(() => {});
  };

  useState(() => { loadData(0); }, []);

  const switchTab = (idx) => { setActiveTab(idx); loadData(idx); };

  const sorted = [...list].sort((a, b) => {
    const [sortBy, sortOrder] = SORT_OPTIONS[sortIdx].value.split('|');
    const va = a[sortBy] || '';
    const vb = b[sortBy] || '';
    const cmp = va < vb ? -1 : va > vb ? 1 : 0;
    return sortOrder === 'asc' ? cmp : -cmp;
  });

  return (
    <div>
      <div className="navbar">
        <div className="navbar-left">
          <button className="navbar-back" onClick={() => navigate('/expert/home')}>←</button>
          <span className="navbar-title">修复记录</span>
        </div>
      </div>
      <div className="tabs">
        {TABS.map((t, i) => (
          <button key={i} className={`tab-item ${i === activeTab ? 'active' : ''}`} onClick={() => switchTab(i)}>{t}</button>
        ))}
      </div>
      <div className="container" style={{ paddingTop: 12 }}>
        <div className="filter-bar" style={{ marginBottom: 8 }}>
          <div style={{ flex: 1 }} />
          <button className="btn btn-default btn-sm" onClick={() => setShowSort(!showSort)}>
            {SORT_OPTIONS[sortIdx].label} ▾
          </button>
        </div>

        {showSort && (
          <>
            <div className="modal-mask" onClick={() => setShowSort(false)} />
            <div className="sort-panel" style={{ position: 'fixed', top: '30%', left: 20, right: 20, background: '#fff', borderRadius: 14, padding: 8, zIndex: 1001, boxShadow: '0 12px 40px rgba(0,0,0,0.2)' }}>
              {SORT_OPTIONS.map((opt, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 20px', cursor: 'pointer', borderBottom: i < SORT_OPTIONS.length - 1 ? '1px solid #f0f0f0' : 'none', color: i === sortIdx ? 'var(--brown-dark)' : 'var(--text)', fontWeight: i === sortIdx ? 600 : 400 }}
                  onClick={() => { setSortIdx(i); setShowSort(false); }}>
                  {opt.label} {i === sortIdx && '✓'}
                </div>
              ))}
            </div>
          </>
        )}

        {sorted.map(item => (
          <div key={item.id} className="list-item" onClick={() => navigate('/expert/repair-submit?id=' + item.id)} style={{ cursor: 'pointer' }}>
            <div className="list-item-icon">{item.collectionName?.charAt(0)}</div>
            <div className="list-item-body">
              <div className="list-item-title">{item.collectionName}</div>
              <div className="list-item-sub">{item.repairCode} · {item.reason?.slice(0, 30)}</div>
            </div>
            <div className="list-item-extra">
              <span className={`tag tag-${item.status === '已修复' ? 'approved' : item.status === '修复中' ? 'processing' : 'pending'}`}>{item.status}</span>
            </div>
            <span className="entry-arrow">›</span>
          </div>
        ))}
        {list.length === 0 && (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--brown-fade)' }}><p>暂无{TABS[activeTab]}记录</p></div>
        )}
      </div>
    </div>
  );
}
