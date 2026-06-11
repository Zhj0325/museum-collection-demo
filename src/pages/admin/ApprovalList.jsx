import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { get } from '../../api/request';
import { clickSafe } from '../../utils/clickSafe';

const TABS = ['出库申请', '入库申请', '修复申请', '展览审批'];
const TYPE_KEYS = ['outbound', 'inbound', 'repair', 'exhibition'];
const URLS = ['/api/outbound-requests', '/api/inbound-requests', '/api/repair-requests', '/api/exhibitions/pending'];

export default function ApprovalList() {
  const [activeTab, setActiveTab] = useState(0);
  const [list, setList] = useState([]);
  const [loaded, setLoaded] = useState({});
  const navigate = useNavigate();

  const load = (idx) => {
    if (loaded[idx]) return;
    get(URLS[idx]).then(data => {
      const records = (data.records || data || []).map(item => ({ ...item, type: TYPE_KEYS[idx] }));
      setList(records);
      setLoaded(prev => ({ ...prev, [idx]: true }));
    }).catch(() => setList([]));
  };

  const switchTab = (idx) => {
    setActiveTab(idx);
    load(idx);
  };

  useState(() => { load(0); }, []);

  return (
    <div>
      <div className="navbar">
        <div className="navbar-left">
          <button className="navbar-back" onClick={() => navigate('/admin/home')}>←</button>
          <span className="navbar-title">审批管理</span>
        </div>
      </div>
      <div className="tabs">
        {TABS.map((t, i) => (
          <button key={i} className={`tab-item ${i === activeTab ? 'active' : ''}`} onClick={() => switchTab(i)}>{t}</button>
        ))}
      </div>
      <div className="container" style={{ paddingTop: 12 }}>
        {list.map(item => (
          <div key={item.id} className="list-item" onClick={clickSafe(() => { const extra = item.exhibitionType ? '&exhibitionType=' + item.exhibitionType : ''; navigate('/admin/approval-detail?id=' + item.id + '&type=' + item.type + extra); })} style={{ cursor: 'pointer' }}>
            <div className="list-item-icon">{['出','入','修','展'][activeTab]}</div>
            <div className="list-item-body">
              <div className="list-item-title">{item.code || item.name || item.collectionName || '申请'}</div>
              <div className="list-item-sub">{item.applicant || item.reason || ''}</div>
            </div>
            <div className="list-item-extra">
              <span className={`tag tag-${item.status === '待审批' ? 'pending' : item.status === '已通过' ? 'approved' : 'rejected'}`}>{item.status}</span>
            </div>
            <span className="entry-arrow">›</span>
          </div>
        ))}
        {list.length === 0 && (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--brown-fade)' }}>
            <p style={{ fontSize: 40 }}>📋</p>
            <p>暂无{TABS[activeTab]}</p>
          </div>
        )}
      </div>
    </div>
  );
}
