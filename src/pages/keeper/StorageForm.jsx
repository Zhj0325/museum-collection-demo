import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { get, post } from '../../api/request';

export default function StorageForm() {
  const [tabIdx, setTabIdx] = useState(0);
  const [outRequests, setOutRequests] = useState([]);
  const [selectedOut, setSelectedOut] = useState(null);
  const [inRequests, setInRequests] = useState([]);
  const [selectedIn, setSelectedIn] = useState(null);
  const [outDate, setOutDate] = useState(new Date().toISOString().slice(0, 10));
  const [inDate, setInDate] = useState(new Date().toISOString().slice(0, 10));
  const [submitting, setSubmitting] = useState(false);
  const [loaded, setLoaded] = useState({});
  const navigate = useNavigate();

  const loadTab = (idx) => {
    if (loaded[idx]) return;
    if (idx === 0) {
      get('/api/outbound-requests', { status: '已通过' }).then(data => setOutRequests(data.records || data || [])).catch(() => {});
    } else {
      get('/api/inbound-requests', { status: '已通过' }).then(data => setInRequests(data.records || data || [])).catch(() => {});
    }
    setLoaded(prev => ({ ...prev, [idx]: true }));
  };

  const switchTab = (idx) => { setTabIdx(idx); loadTab(idx); };

  useState(() => { loadTab(0); }, []);

  const handleSubmit = async () => {
    if (submitting) return;
    if (tabIdx === 0) {
      if (!selectedOut) { alert('请选择出库申请'); return; }
      if (!outDate) { alert('请选择出库日期'); return; }
      setSubmitting(true);
      try {
        await post('/api/storage-records/outbound', { outboundReqId: selectedOut.id, outboundDate: outDate });
        alert('出库登记成功');
        navigate('/keeper/home');
      } catch { /* 错误已由 request.js 统一提示 */ } finally { setSubmitting(false); }
    } else {
      if (!selectedIn) { alert('请选择入库申请'); return; }
      if (!inDate) { alert('请选择入库日期'); return; }
      setSubmitting(true);
      try {
        await post('/api/storage-records/inbound', { inboundReqId: selectedIn.id, inboundDate: inDate });
        alert('入库登记成功');
        navigate('/keeper/home');
      } catch { /* 错误已由 request.js 统一提示 */ } finally { setSubmitting(false); }
    }
  };

  return (
    <div>
      <div className="navbar">
        <div className="navbar-left">
          <button className="navbar-back" onClick={() => navigate('/keeper/home')}>←</button>
          <span className="navbar-title">出入库登记</span>
        </div>
      </div>
      <div className="tabs">
        {['出库登记', '入库登记'].map((t, i) => (
          <button key={i} className={`tab-item ${i === tabIdx ? 'active' : ''}`} onClick={() => switchTab(i)}>{t}</button>
        ))}
      </div>
      <div className="container" style={{ paddingTop: 12 }}>
        {tabIdx === 0 ? (
          <div className="card">
            <div className="card-title">选择出库申请</div>
            {outRequests.map(item => (
              <div key={item.id} className={`list-item ${selectedOut?.id === item.id ? 'selected' : ''}`}
                onClick={() => setSelectedOut(item)}
                style={{ cursor: 'pointer', border: selectedOut?.id === item.id ? '2px solid var(--brown-dark)' : '' }}>
                <div className="list-item-icon">{item.code?.charAt(0)}</div>
                <div className="list-item-body">
                  <div className="list-item-title">{item.code}</div>
                  <div className="list-item-sub">{item.reason?.slice(0, 30)}</div>
                </div>
                {selectedOut?.id === item.id && <span style={{ color: 'var(--gold)', fontWeight: 700 }}>✓</span>}
              </div>
            ))}
          </div>
        ) : (
          <div className="card">
            <div className="card-title">选择入库申请</div>
            {inRequests.map(item => (
              <div key={item.id} className={`list-item ${selectedIn?.id === item.id ? 'selected' : ''}`}
                onClick={() => setSelectedIn(item)}
                style={{ cursor: 'pointer', border: selectedIn?.id === item.id ? '2px solid var(--brown-dark)' : '' }}>
                <div className="list-item-icon">{item.code?.charAt(0)}</div>
                <div className="list-item-body">
                  <div className="list-item-title">{item.code}</div>
                  <div className="list-item-sub">{item.reason?.slice(0, 30)}</div>
                </div>
                {selectedIn?.id === item.id && <span style={{ color: 'var(--gold)', fontWeight: 700 }}>✓</span>}
              </div>
            ))}
          </div>
        )}
        <div className="card">
          <div className="form-item">
            <span className="form-label">{tabIdx === 0 ? '出库日期' : '入库日期'}</span>
            <input className="form-input" type="date"
              value={tabIdx === 0 ? outDate : inDate}
              onChange={e => tabIdx === 0 ? setOutDate(e.target.value) : setInDate(e.target.value)} />
          </div>
        </div>
        <button className="btn btn-primary btn-lg" style={{ width: '100%' }} onClick={handleSubmit} disabled={submitting}>
          {submitting ? '提交中...' : '确认提交'}
        </button>
      </div>
    </div>
  );
}
