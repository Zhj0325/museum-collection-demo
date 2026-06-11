import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { get } from '../../api/request';

function deriveStatus(item) {
  if (!item.conclusion) return '待鉴定';
  if (!item.auditStatus) return '已完成';
  return item.auditStatus;
}

export default function AppraisalDetail() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const [detail, setDetail] = useState({});
  const navigate = useNavigate();

  useState(() => {
    get('/api/appraisals/' + id).then(data => setDetail(data || {})).catch(() => {});
  }, []);

  const status = deriveStatus(detail);

  return (
    <div>
      <div className="navbar">
        <div className="navbar-left">
          <button className="navbar-back" onClick={() => navigate('/expert/appraisal-list')}>←</button>
          <span className="navbar-title">鉴定详情</span>
        </div>
      </div>
      <div className="detail-banner">
        <div className="detail-icon">{detail.collectionName?.charAt(0)}</div>
        <div className="detail-name">{detail.collectionName || '藏品'}</div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <span className={`tag tag-${status === '待鉴定' ? 'pending' : status === '已通过' ? 'approved' : status === '已驳回' ? 'rejected' : 'processing'}`} style={{ fontSize: 13 }}>{status}</span>
        </div>
      </div>
      <div className="container" style={{ paddingTop: 16 }}>
        <div className="card">
          <div className="detail-row"><span className="detail-label">藏品编号</span><span className="detail-value">{detail.collectionCode}</span></div>
          <div className="detail-row"><span className="detail-label">藏品类型</span><span className="detail-value">{detail.collectionType}</span></div>
          <div className="detail-row"><span className="detail-label">原有级别</span><span className="detail-value">{detail.collectionLevel || '-'}</span></div>
          <div className="detail-row"><span className="detail-label">鉴定结论</span><span className="detail-value">{detail.conclusion || '-'}</span></div>
          <div className="detail-row"><span className="detail-label">认定级别</span><span className="detail-value">{detail.confirmedLevel || detail.judgedLevel || '-'}</span></div>
          <div className="detail-row"><span className="detail-label">真伪判定</span><span className="detail-value">{detail.judgedAuthenticity || '-'}</span></div>
          <div className="detail-row"><span className="detail-label">审核状态</span><span className="detail-value">{detail.auditStatus || '-'}</span></div>
        </div>
        {detail.collectionId && (
          <button className="btn btn-default" style={{ width: '100%' }}
            onClick={() => navigate('/keeper/collection-detail?id=' + detail.collectionId)}>查看藏品详情</button>
        )}
      </div>
    </div>
  );
}
