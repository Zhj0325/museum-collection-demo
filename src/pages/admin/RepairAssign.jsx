import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { get, put } from '../../api/request';

export default function RepairAssign() {
  const [step, setStep] = useState(1);
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [experts, setExperts] = useState([]);
  const [selectedExpert, setSelectedExpert] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const loadRequests = () => {
    get('/api/repair-requests', { status: '已通过' }).then(data => setRequests(data.records || data || [])).catch(() => {});
  };

  const loadExperts = () => {
    get('/api/users/experts').then(data => setExperts(data.records || data || [])).catch(() => {});
  };

  useState(() => { loadRequests(); }, []);

  const selectRequest = (item) => {
    setSelectedRequest(item);
    setStep(2);
    loadExperts();
  };

  const confirmAssign = async () => {
    if (submitting) return;
    if (!selectedRequest) { alert('请选择修复申请'); return; }
    if (!selectedExpert) { alert('请选择专家'); return; }
    setSubmitting(true);
    try {
      await put('/api/repair-requests/' + selectedRequest.id + '/assign', { expertId: selectedExpert.id });
      alert('指派成功');
      navigate('/admin/home');
    } catch { /* 错误已由 request.js 统一提示 */ } finally { setSubmitting(false); }
  };

  return (
    <div>
      <div className="navbar">
        <div className="navbar-left">
          <button className="navbar-back" onClick={() => step === 2 ? setStep(1) : navigate('/admin/home')}>←</button>
          <span className="navbar-title">修复指派</span>
        </div>
      </div>
      <div className="container" style={{ paddingTop: 16 }}>
        {step === 1 ? (
          <>
            <div className="step-title">步骤 1：选择已通过的修复申请</div>
            {requests.map(item => (
              <div key={item.id} className="list-item" onClick={() => selectRequest(item)} style={{ cursor: 'pointer' }}>
                <div className="list-item-icon">{item.collectionName?.charAt(0)}</div>
                <div className="list-item-body">
                  <div className="list-item-title">{item.collectionName}</div>
                  <div className="list-item-sub">{item.code} · {item.reason}</div>
                </div>
                <span className="tag tag-approved">已通过</span>
                <span className="entry-arrow">›</span>
              </div>
            ))}
            {requests.length === 0 && (
              <div style={{ textAlign: 'center', padding: 60, color: 'var(--brown-fade)' }}><p>暂无已通过的修复申请</p></div>
            )}
          </>
        ) : (
          <>
            <div className="step-title">步骤 2：选择修复专家</div>
            <div className="card" style={{ marginBottom: 12, background: 'var(--bg)' }}>
              <strong>已选申请：</strong>{selectedRequest?.collectionName} ({selectedRequest?.code})
            </div>
            {experts.map(item => (
              <div key={item.id} className={`list-item ${selectedExpert?.id === item.id ? 'selected' : ''}`}
                onClick={() => setSelectedExpert(item)} style={{ cursor: 'pointer', border: selectedExpert?.id === item.id ? '2px solid var(--brown-dark)' : '' }}>
                <div className="list-item-icon">{item.realName?.charAt(0)}</div>
                <div className="list-item-body">
                  <div className="list-item-title">{item.realName}</div>
                  <div className="list-item-sub">{item.specialty || item.phone || ''}</div>
                </div>
                {selectedExpert?.id === item.id && <span style={{ color: 'var(--gold)', fontSize: 20, fontWeight: 700 }}>✓</span>}
              </div>
            ))}
            <button className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 20 }} onClick={confirmAssign} disabled={submitting}>
              {submitting ? '提交中...' : '确认指派'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
