import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { get, post } from '../../api/request';

export default function RepairForm() {
  const [collections, setCollections] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [reason, setReason] = useState('');
  const [urgency, setUrgency] = useState('normal');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useState(() => {
    get('/api/collections', { pageSize: 100 }).then(data => setCollections(data.records || data || [])).catch(() => {});
  }, []);

  const handleSubmit = async () => {
    if (submitting) return;
    if (!selectedCollection) { alert('请选择藏品'); return; }
    if (!reason) { alert('请填写修复原因'); return; }
    setSubmitting(true);
    try {
      await post('/api/repair-requests', { collectionId: selectedCollection.id, reason, urgency });
      alert('提交成功');
      navigate('/manager/home');
    } catch { /* 错误已由 request.js 统一提示 */ } finally { setSubmitting(false); }
  };

  return (
    <div>
      <div className="navbar">
        <div className="navbar-left">
          <button className="navbar-back" onClick={() => navigate('/manager/home')}>←</button>
          <span className="navbar-title">修复申请</span>
        </div>
      </div>
      <div className="container" style={{ paddingTop: 16 }}>
        <div className="card">
          <div className="card-title">选择藏品</div>
          <div className="search-bar" style={{ marginBottom: 10 }}>
            <input value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="搜索藏品" />
          </div>
          {collections.filter(it => it.name?.includes(keyword)).map(item => (
            <div key={item.id} className={`list-item ${selectedCollection?.id === item.id ? 'selected' : ''}`}
              onClick={() => setSelectedCollection(item)}
              style={{ cursor: 'pointer', border: selectedCollection?.id === item.id ? '2px solid var(--brown-dark)' : '' }}>
              <div className="list-item-icon">{item.name?.charAt(0)}</div>
              <div className="list-item-body">
                <div className="list-item-title">{item.name}</div>
                <div className="list-item-sub">{item.code} · {item.type} · {item.status}</div>
              </div>
              {selectedCollection?.id === item.id && <span style={{ color: 'var(--gold)', fontWeight: 700 }}>✓</span>}
            </div>
          ))}
        </div>

        <div className="card">
          <div className="form-item">
            <span className="form-label">紧急程度</span>
            <select className="form-select" value={urgency} onChange={e => setUrgency(e.target.value)}>
              <option value="normal">普通</option>
              <option value="urgent">紧急</option>
            </select>
          </div>
          <div className="form-item form-item-col">
            <span className="form-label">修复原因 *</span>
            <textarea className="form-textarea" value={reason} onChange={e => setReason(e.target.value)} placeholder="请详细描述修复原因" />
          </div>
        </div>

        <button className="btn btn-primary btn-lg" style={{ width: '100%' }} onClick={handleSubmit} disabled={submitting}>
          {submitting ? '提交中...' : '提交申请'}
        </button>
      </div>
    </div>
  );
}
