import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { get, put } from '../../api/request';

const LEVELS = ['未定级', '一般文物', '三级文物', '二级文物', '一级文物'];
const AUTHENTICITIES = ['真品', '仿品', '待考'];

export default function AppraisalSubmit() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const navigate = useNavigate();
  const [detail, setDetail] = useState({});
  const [conclusion, setConclusion] = useState('');
  const [judgedLevel, setJudgedLevel] = useState('');
  const [judgedAuthenticity, setJudgedAuthenticity] = useState('真品');
  const [submitting, setSubmitting] = useState(false);

  useState(() => {
    get('/api/appraisals/' + id).then(setDetail).catch(() => {});
  }, []);

  const handleSubmit = async () => {
    if (submitting) return;
    if (!conclusion) { alert('请输入鉴定结论'); return; }
    setSubmitting(true);
    try {
      await put('/api/appraisals/' + id + '/submit', {
        conclusion,
        confirmedLevel: judgedLevel || LEVELS[0],
        judgedLevel: judgedLevel || LEVELS[0],
        judgedAuthenticity
      });
      if (window.confirm('已提交\n\n鉴定结论已提交，等待管理员审核通过后才会更新藏品信息。')) {
        navigate('/expert/appraisal-list');
      }
    } catch { /* 错误已由 request.js 统一提示 */ } finally { setSubmitting(false); }
  };

  return (
    <div>
      <div className="navbar">
        <div className="navbar-left">
          <button className="navbar-back" onClick={() => navigate('/expert/appraisal-list')}>←</button>
          <span className="navbar-title">提交鉴定</span>
        </div>
      </div>
      <div className="container" style={{ paddingTop: 16 }}>
        <div className="detail-banner">
          <div className="detail-icon">{detail.collectionName?.charAt(0)}</div>
          <div className="detail-name">{detail.collectionName || '藏品'}</div>
          <div style={{ position: 'relative', zIndex: 1, fontSize: 13, opacity: 0.8 }}>{detail.collectionCode} · {detail.collectionType}</div>
        </div>
        <div className="card">
          <div className="form-item form-item-col">
            <span className="form-label">鉴定结论 *</span>
            <textarea className="form-textarea" value={conclusion} onChange={e => setConclusion(e.target.value)} placeholder="请输入详细鉴定结论" />
          </div>
          <div className="form-item">
            <span className="form-label">认定级别</span>
            <select className="form-select" value={judgedLevel} onChange={e => setJudgedLevel(e.target.value)}>
              <option value="">请选择</option>
              {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div className="form-item">
            <span className="form-label">真伪判定</span>
            <select className="form-select" value={judgedAuthenticity} onChange={e => setJudgedAuthenticity(e.target.value)}>
              {AUTHENTICITIES.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
        </div>
        <button className="btn btn-primary btn-lg" style={{ width: '100%' }} onClick={handleSubmit} disabled={submitting}>
          {submitting ? '提交中...' : '提交鉴定结论'}
        </button>
      </div>
    </div>
  );
}
