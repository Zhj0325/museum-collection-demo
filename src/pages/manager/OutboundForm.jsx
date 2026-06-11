import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { get, post } from '../../api/request';

export default function OutboundForm() {
  const [exhibitions, setExhibitions] = useState([]);
  const [selectedExhibition, setSelectedExhibition] = useState(null);
  const [collections, setCollections] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [reason, setReason] = useState('');
  const [showCollections, setShowCollections] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useState(() => {
    get('/api/exhibitions').then(data => {
      const list = (data.records || data || []).filter(item => item.status === '展出中' || item.status === '筹备中');
      setExhibitions(list);
    }).catch(() => {});
  }, []);

  const loadCollections = () => {
    get('/api/collections', { status: '在库', pageSize: 100 }).then(data => setCollections(data.records || data || [])).catch(() => {});
    setShowCollections(true);
  };

  const toggleCollection = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleSubmit = async () => {
    if (submitting) return;
    if (!selectedExhibition) { alert('请选择展览'); return; }
    if (selectedIds.length === 0) { alert('请选择藏品'); return; }
    if (!reason) { alert('请填写出库原因'); return; }
    setSubmitting(true);
    try {
      await post('/api/outbound-requests', { exhibitionId: selectedExhibition.id, collectionIds: selectedIds, reason });
      alert('提交成功');
      navigate('/manager/home');
    } catch { /* 错误已由 request.js 统一提示 */ } finally { setSubmitting(false); }
  };

  return (
    <div>
      <div className="navbar">
        <div className="navbar-left">
          <button className="navbar-back" onClick={() => navigate('/manager/home')}>←</button>
          <span className="navbar-title">出库申请</span>
        </div>
      </div>
      <div className="container" style={{ paddingTop: 16 }}>
        <div className="card">
          <div className="card-title">选择展览</div>
          {exhibitions.map(item => (
            <div key={item.id} className={`list-item ${selectedExhibition?.id === item.id ? 'selected' : ''}`}
              onClick={() => setSelectedExhibition(item)}
              style={{ cursor: 'pointer', border: selectedExhibition?.id === item.id ? '2px solid var(--brown-dark)' : '' }}>
              <div className="list-item-icon">{item.name?.charAt(0)}</div>
              <div className="list-item-body"><div className="list-item-title">{item.name}</div></div>
              {selectedExhibition?.id === item.id && <span style={{ color: 'var(--gold)', fontWeight: 700 }}>✓</span>}
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-title">选择藏品（{selectedIds.length}件已选）</div>
          <button className="btn btn-default" onClick={loadCollections}>选择藏品</button>
          {showCollections && collections.map(item => (
            <div key={item.id} className="list-item" onClick={() => toggleCollection(item.id)}
              style={{ cursor: 'pointer', background: selectedIds.includes(item.id) ? '#FAF6F1' : '' }}>
              <div className="list-item-icon">{item.name?.charAt(0)}</div>
              <div className="list-item-body">
                <div className="list-item-title">{item.name}</div>
                <div className="list-item-sub">{item.code} · {item.type}</div>
              </div>
              {selectedIds.includes(item.id) && <span style={{ color: 'var(--gold)', fontWeight: 700 }}>✓</span>}
            </div>
          ))}
        </div>

        <div className="card">
          <div className="form-item form-item-col">
            <span className="form-label">出库原因 *</span>
            <textarea className="form-textarea" value={reason} onChange={e => setReason(e.target.value)} placeholder="请输入出库原因" />
          </div>
        </div>

        <button className="btn btn-primary btn-lg" style={{ width: '100%' }} onClick={handleSubmit} disabled={submitting}>
          {submitting ? '提交中...' : '提交申请'}
        </button>
      </div>
    </div>
  );
}
