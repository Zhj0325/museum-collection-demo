import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { get } from '../../api/request';

export default function CollectionDetail() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const [detail, setDetail] = useState({});
  const navigate = useNavigate();

  useState(() => {
    if (id) get('/api/collections/' + id).then(setDetail).catch(() => {});
  }, []);

  return (
    <div>
      <div className="navbar">
        <div className="navbar-left">
          <button className="navbar-back" onClick={() => navigate(-1)}>←</button>
          <span className="navbar-title">藏品详情</span>
        </div>
      </div>
      <div className="detail-banner">
        <div className="detail-icon">
          {detail.imageUrl ? <img src={detail.imageUrl} alt={detail.name} /> : detail.name?.charAt(0)}
        </div>
        <div className="detail-name">{detail.name}</div>
        <div style={{ position: 'relative', zIndex: 1, marginTop: 8 }}>
          <span className={`tag tag-${detail.status === '在库' ? 'approved' : detail.status === '未入库' ? 'pending' : detail.status === '修复中' ? 'repair' : 'processing'}`} style={{ fontSize: 13 }}>{detail.status}</span>
        </div>
      </div>
      <div className="container" style={{ paddingTop: 16 }}>
        <div className="card">
          <div className="detail-row"><span className="detail-label">藏品编号</span><span className="detail-value">{detail.code || '-'}</span></div>
          <div className="detail-row"><span className="detail-label">藏品类型</span><span className="detail-value">{detail.type || '-'}</span></div>
          <div className="detail-row"><span className="detail-label">文物级别</span><span className="detail-value">{detail.level || '-'}</span></div>
          <div className="detail-row"><span className="detail-label">藏品库房</span><span className="detail-value">{detail.warehouse || '-'}</span></div>
          <div className="detail-row"><span className="detail-label">入库日期</span><span className="detail-value">{detail.entryDate || '-'}</span></div>
          <div className="detail-row"><span className="detail-label">材质</span><span className="detail-value">{detail.material || '-'}</span></div>
          <div className="detail-row"><span className="detail-label">年代</span><span className="detail-value">{detail.era || '-'}</span></div>
          <div className="detail-row"><span className="detail-label">尺寸</span><span className="detail-value">{detail.size || '-'}</span></div>
          <div className="detail-row"><span className="detail-label">来源</span><span className="detail-value">{detail.source || '-'}</span></div>
        </div>
        {detail.description && (
          <div className="card">
            <div className="card-title">藏品描述</div>
            <p className="desc-text" style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.8 }}>{detail.description}</p>
          </div>
        )}
        {detail.imageUrl && (
          <div className="card">
            <div className="card-title">实物图片</div>
            <img src={detail.imageUrl} alt={detail.name} style={{ width: '100%', borderRadius: 'var(--radius)', maxHeight: 300, objectFit: 'contain', background: '#f5f5f5' }} />
          </div>
        )}
      </div>
    </div>
  );
}
