import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { get, put } from '../../api/request';

const URL_MAP = {
  outbound: '/api/outbound-requests/',
  inbound: '/api/inbound-requests/',
  repair: '/api/repair-requests/',
  exhibition: '/api/exhibitions/'
};

export default function ApprovalDetail() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const type = searchParams.get('type');
  const exhibitionType = searchParams.get('exhibitionType') || '';
  const navigate = useNavigate();
  const [detail, setDetail] = useState({});
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loaded, setLoaded] = useState(false);

  if (!loaded) {
    setLoaded(true);
    if (type === 'exhibition' && exhibitionType) {
      get(URL_MAP[type] + exhibitionType + '/' + id).then(setDetail).catch(() => {});
    } else {
      const url = URL_MAP[type];
      if (url) get(url + id).then(setDetail).catch(() => {});
    }
  }

  const doApprove = async (passed) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const approveUrl = type === 'exhibition'
        ? URL_MAP[type] + exhibitionType + '/' + id + '/approve'
        : URL_MAP[type] + id + '/approve';
      await put(approveUrl, { passed, comment });
      alert(passed ? '审批通过' : '已拒绝');
      navigate('/admin/approval-list');
    } catch { /* 错误已由 request.js 统一提示 */ } finally { setSubmitting(false); }
  };

  return (
    <div>
      <div className="navbar">
        <div className="navbar-left">
          <button className="navbar-back" onClick={() => navigate('/admin/approval-list')}>←</button>
          <span className="navbar-title">审批详情</span>
        </div>
      </div>
      <div className="container" style={{ paddingTop: 16 }}>
        <div className="detail-banner">
          <div className="detail-icon">{['出','入','修','展'][['outbound','inbound','repair','exhibition'].indexOf(type)] || '审'}</div>
          <div className="detail-name">{detail.code || detail.collectionName || detail.name || '申请详情'}</div>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <span className={`tag tag-${detail.status === '待审批' ? 'pending' : detail.status === '已通过' ? 'approved' : 'rejected'}`} style={{ fontSize: 13 }}>
              {detail.status}
            </span>
          </div>
        </div>
        <div className="card">
          <div className="detail-row"><span className="detail-label">申请人</span><span className="detail-value">{detail.applicant}</span></div>
          <div className="detail-row"><span className="detail-label">原因</span><span className="detail-value">{detail.reason}</span></div>
          {detail.createdAt && <div className="detail-row"><span className="detail-label">申请时间</span><span className="detail-value">{detail.createdAt}</span></div>}
          {detail.items && detail.items.length > 0 && (
            <div className="detail-row" style={{ flexDirection: 'column', gap: 8 }}>
              <span className="detail-label">关联藏品</span>
              {detail.items.map((it, i) => <div key={i} style={{ fontSize: 13 }}>{it.name} ({it.code})</div>)}
            </div>
          )}
        </div>
        {detail.status === '待审批' && (
          <div className="card">
            <div className="card-title">审批意见</div>
            <textarea className="form-textarea" value={comment} onChange={e => setComment(e.target.value)} placeholder="请输入审批意见（拒绝时必填）" />
            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => { if (window.confirm('确定要批准此申请吗？')) doApprove(true); }} disabled={submitting}>通过</button>
              <button className="btn btn-danger" style={{ flex: 1 }} onClick={() => { if (!comment) { alert('请输入审批意见'); return; } if (window.confirm('确定要拒绝此申请吗？')) doApprove(false); }} disabled={submitting}>拒绝</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
