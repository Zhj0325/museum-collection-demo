import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { get, post } from '../../api/request';

export default function InboundForm() {
  const [collections, setCollections] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [reason, setReason] = useState('');
  const [showCollections, setShowCollections] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useState(() => {
    get('/api/warehouses').then(data => setWarehouses(data.records || data || [])).catch(() => {});
  }, []);

  const loadCollections = () => {
    if (!selectedWarehouse) { alert('请先选择库房'); return; }
    get('/api/collections', { pageSize: 100 }).then(data => {
      const all = data.records || data || [];
      setCollections(all.filter(item => item.status !== '在库'));
    }).catch(() => {});
    setShowCollections(true);
  };

  const toggleCollection = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleSubmit = async () => {
    if (submitting) return;
    if (!selectedWarehouse) { alert('请选择库房'); return; }
    if (selectedIds.length === 0) { alert('请选择藏品'); return; }
    if (!reason) { alert('请填写入库原因'); return; }
    setSubmitting(true);
    try {
      await post('/api/inbound-requests', { warehouseId: selectedWarehouse.id, collectionIds: selectedIds, reason });
      alert('提交成功');
      navigate('/manager/home');
    } catch { /* 错误已由 request.js 统一提示 */ } finally { setSubmitting(false); }
  };

  return (
    <div>
      <div className="navbar">
        <div className="navbar-left">
          <button className="navbar-back" onClick={() => navigate('/manager/home')}>←</button>
          <span className="navbar-title">入库申请</span>
        </div>
      </div>
      <div className="container" style={{ paddingTop: 16 }}>
        <div className="card">
          <div className="card-title">选择目标库房</div>
          {warehouses.map(item => (
            <div key={item.id} className={`list-item ${selectedWarehouse?.id === item.id ? 'selected' : ''}`}
              onClick={() => setSelectedWarehouse(item)}
              style={{ cursor: 'pointer', border: selectedWarehouse?.id === item.id ? '2px solid var(--brown-dark)' : '' }}>
              <div className="list-item-icon">仓</div>
              <div className="list-item-body"><div className="list-item-title">{item.name}</div></div>
              {selectedWarehouse?.id === item.id && <span style={{ color: 'var(--gold)', fontWeight: 700 }}>✓</span>}
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
                <div className="list-item-sub">{item.code} · {item.type} · {item.status}</div>
              </div>
              {selectedIds.includes(item.id) && <span style={{ color: 'var(--gold)', fontWeight: 700 }}>✓</span>}
            </div>
          ))}
        </div>

        <div className="card">
          <div className="form-item form-item-col">
            <span className="form-label">入库原因 *</span>
            <textarea className="form-textarea" value={reason} onChange={e => setReason(e.target.value)} placeholder="请输入入库原因" />
          </div>
        </div>

        <button className="btn btn-primary btn-lg" style={{ width: '100%' }} onClick={handleSubmit} disabled={submitting}>
          {submitting ? '提交中...' : '提交申请'}
        </button>
      </div>
    </div>
  );
}
