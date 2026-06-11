import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { get, post } from '../../api/request';

export default function InitialStorage() {
  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [warehouses, setWarehouses] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [inboundDate, setInboundDate] = useState(new Date().toISOString().slice(0, 10));
  const [remark, setRemark] = useState('无');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useState(() => {
    get('/api/collections', { status: '未入库', pageSize: 100 }).then(data => setCollections(data.records || data || [])).catch(() => {});
    get('/api/warehouses').then(data => setWarehouses(data.records || data || [])).catch(() => {});
  }, []);

  const handleSubmit = async () => {
    if (submitting) return;
    if (!selectedCollection) { alert('请选择藏品'); return; }
    if (!selectedWarehouse) { alert('请选择库房'); return; }
    if (!inboundDate) { alert('请选择入库日期'); return; }
    setSubmitting(true);
    try {
      await post('/api/storage-records/initial-inbound', {
        collectionId: selectedCollection.id, warehouseId: selectedWarehouse.id, inboundDate, remark
      });
      alert('入库登记成功');
      navigate('/keeper/home');
    } catch { /* 错误已由 request.js 统一提示 */ } finally { setSubmitting(false); }
  };

  return (
    <div>
      <div className="navbar">
        <div className="navbar-left">
          <button className="navbar-back" onClick={() => navigate('/keeper/home')}>←</button>
          <span className="navbar-title">未入库藏品入库</span>
        </div>
      </div>
      <div className="container" style={{ paddingTop: 16 }}>
        <div className="card">
          <div className="card-title">选择藏品</div>
          {collections.map(item => (
            <div key={item.id} className={`list-item ${selectedCollection?.id === item.id ? 'selected' : ''}`}
              onClick={() => setSelectedCollection(item)}
              style={{ cursor: 'pointer', border: selectedCollection?.id === item.id ? '2px solid var(--brown-dark)' : '' }}>
              <div className="list-item-icon">{item.name?.charAt(0)}</div>
              <div className="list-item-body">
                <div className="list-item-title">{item.name}</div>
                <div className="list-item-sub">{item.code} · {item.type}</div>
              </div>
              {selectedCollection?.id === item.id && <span style={{ color: 'var(--gold)', fontWeight: 700 }}>✓</span>}
            </div>
          ))}
        </div>
        <div className="card">
          <div className="card-title">选择库房</div>
          {warehouses.map(item => (
            <div key={item.id} className={`list-item ${selectedWarehouse?.id === item.id ? 'selected' : ''}`}
              onClick={() => setSelectedWarehouse(item)}
              style={{ cursor: 'pointer', border: selectedWarehouse?.id === item.id ? '2px solid var(--brown-dark)' : '' }}>
              <div className="list-item-icon">仓</div>
              <div className="list-item-body">
                <div className="list-item-title">{item.name}</div>
                <div className="list-item-sub">{item.code}</div>
              </div>
              {selectedWarehouse?.id === item.id && <span style={{ color: 'var(--gold)', fontWeight: 700 }}>✓</span>}
            </div>
          ))}
        </div>
        <div className="card">
          <div className="form-item"><span className="form-label">入库日期</span><input className="form-input" type="date" value={inboundDate} onChange={e => setInboundDate(e.target.value)} /></div>
          <div className="form-item form-item-col">
            <span className="form-label">备注</span>
            <textarea className="form-textarea" value={remark} onChange={e => setRemark(e.target.value)} placeholder="入库备注（选填）" />
          </div>
        </div>
        <button className="btn btn-primary btn-lg" style={{ width: '100%' }} onClick={handleSubmit} disabled={submitting}>
          {submitting ? '提交中...' : '确认入库'}
        </button>
      </div>
    </div>
  );
}
