import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { get, post } from '../../api/request';

const METHODS = ['清洁', '修补', '加固', '翻新', '其他'];

export default function RepairSubmit() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const navigate = useNavigate();
  const [detail, setDetail] = useState({});
  const [beforeStatus, setBeforeStatus] = useState('');
  const [afterStatus, setAfterStatus] = useState('');
  const [conclusion, setConclusion] = useState('');
  const [repairMethod, setRepairMethod] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useState(() => {
    get('/api/repair-records/' + id).then(setDetail).catch(() => {});
  }, []);

  const handleSubmit = async () => {
    if (submitting) return;
    if (!beforeStatus) { alert('请描述修复前状态'); return; }
    if (!afterStatus) { alert('请描述修复后状态'); return; }
    if (!conclusion) { alert('请填写修复结论'); return; }
    setSubmitting(true);
    try {
      await post('/api/repair-records', {
        repairRequestId: id, beforeStatus, afterStatus, conclusion, repairMethod
      });
      alert('提交成功');
      navigate('/expert/repair-list');
    } catch { /* 错误已由 request.js 统一提示 */ } finally { setSubmitting(false); }
  };

  return (
    <div>
      <div className="navbar">
        <div className="navbar-left">
          <button className="navbar-back" onClick={() => navigate('/expert/repair-list')}>←</button>
          <span className="navbar-title">提交修复</span>
        </div>
      </div>
      <div className="container" style={{ paddingTop: 16 }}>
        <div className="detail-banner">
          <div className="detail-icon">{detail.collectionName?.charAt(0)}</div>
          <div className="detail-name">{detail.collectionName || '藏品'}</div>
          <div style={{ position: 'relative', zIndex: 1, fontSize: 13, opacity: 0.8 }}>{detail.repairCode} · {detail.collectionCode}</div>
        </div>
        <div className="card">
          <div className="form-item form-item-col">
            <span className="form-label">修复前状态 *</span>
            <textarea className="form-textarea" value={beforeStatus} onChange={e => setBeforeStatus(e.target.value)} placeholder="描述修复前的状态" />
          </div>
          <div className="form-item form-item-col">
            <span className="form-label">修复后状态 *</span>
            <textarea className="form-textarea" value={afterStatus} onChange={e => setAfterStatus(e.target.value)} placeholder="描述修复后的状态" />
          </div>
          <div className="form-item">
            <span className="form-label">修复方法</span>
            <select className="form-select" value={repairMethod} onChange={e => setRepairMethod(e.target.value)}>
              <option value="">请选择</option>
              {METHODS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div className="form-item form-item-col">
            <span className="form-label">修复结论 *</span>
            <textarea className="form-textarea" value={conclusion} onChange={e => setConclusion(e.target.value)} placeholder="填写修复结论" />
          </div>
        </div>
        <button className="btn btn-primary btn-lg" style={{ width: '100%' }} onClick={handleSubmit} disabled={submitting}>
          {submitting ? '提交中...' : '提交'}
        </button>
      </div>
    </div>
  );
}
