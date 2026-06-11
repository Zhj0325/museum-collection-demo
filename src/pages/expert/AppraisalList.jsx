import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { get } from '../../api/request';
import { clickSafe } from '../../utils/clickSafe';

const TABS = ['全部', '待鉴定', '待审核', '已通过', '已驳回'];
const SORT_OPTIONS = [
  { value: 'createdAt|desc', label: '最新优先' },
  { value: 'createdAt|asc', label: '最早优先' },
];

function deriveStatus(item) {
  if (!item.conclusion) return '待鉴定';
  if (!item.auditStatus) return '已完成';
  return item.auditStatus;
}

export default function AppraisalList() {
  const [searchParams] = useSearchParams();
  const [list, setList] = useState([]);
  const [activeTab, setActiveTab] = useState(() => {
    const s = searchParams.get('status');
    const idx = TABS.indexOf(s);
    return idx > 0 ? idx : 0;
  });
  const [sortIdx, setSortIdx] = useState(0);
  const [showSort, setShowSort] = useState(false);
  const navigate = useNavigate();

  const loadData = () => {
    get('/api/appraisals', {}).then(data => {
      const raw = (data.records || data || []).map(it => ({ ...it, status: deriveStatus(it) }));
      setList(raw);
    }).catch(() => {});
  };

  useState(() => { loadData(); }, []);

  const filtered = TABS[activeTab] === '全部' ? list : list.filter(it => it.status === TABS[activeTab]);

  const sorted = [...filtered].sort((a, b) => {
    const [sortBy, sortOrder] = SORT_OPTIONS[sortIdx].value.split('|');
    const va = a[sortBy] || '';
    const vb = b[sortBy] || '';
    const cmp = va < vb ? -1 : va > vb ? 1 : 0;
    return sortOrder === 'asc' ? cmp : -cmp;
  });

  const goSubmit = (item) => {
    if (item.status === '已通过' || item.status === '待审核') {
      navigate('/expert/appraisal-detail?id=' + item.id);
    } else {
      navigate('/expert/appraisal-submit?id=' + item.id);
    }
  };

  return (
    <div>
      <div className="navbar">
        <div className="navbar-left">
          <button className="navbar-back" onClick={() => navigate('/expert/home')}>←</button>
          <span className="navbar-title">鉴定任务</span>
        </div>
      </div>
      <div className="tabs">
        {TABS.map((t, i) => (
          <button key={i} className={`tab-item ${i === activeTab ? 'active' : ''}`} onClick={() => setActiveTab(i)}>{t}</button>
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
          <div key={item.id} className="list-item" onClick={clickSafe(() => goSubmit(item))} style={{ cursor: 'pointer' }}>
            <div className="list-item-icon">{item.collectionName?.charAt(0)}</div>
            <div className="list-item-body">
              <div className="list-item-title">{item.collectionName}</div>
              <div className="list-item-sub">{item.collectionCode} · {item.collectionType}</div>
            </div>
            <div className="list-item-extra">
              <span className={`tag tag-${item.status === '待鉴定' ? 'pending' : item.status === '已通过' ? 'approved' : item.status === '已驳回' ? 'rejected' : 'processing'}`}>{item.status}</span>
            </div>
            <span className="entry-arrow">›</span>
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--brown-fade)' }}><p>暂无{TABS[activeTab]}记录</p></div>
        )}
      </div>
    </div>
  );
}
