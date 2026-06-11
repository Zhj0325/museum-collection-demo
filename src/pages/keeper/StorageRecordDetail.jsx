import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { get } from '../../api/request';

export default function StorageRecordDetail() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const [detail, setDetail] = useState({});
  const navigate = useNavigate();

  useState(() => {
    get('/api/storage-records/' + id).then(setDetail).catch(() => {});
  }, []);

  return (
    <div>
      <div className="navbar">
        <div className="navbar-left">
          <button className="navbar-back" onClick={() => navigate('/keeper/storage-records')}>←</button>
          <span className="navbar-title">存放记录详情</span>
        </div>
      </div>
      <div className="detail-banner">
        <div className="detail-icon">{detail.type === '入库' ? '入' : '出'}</div>
        <div className="detail-name">{detail.collectionName || '藏品'}</div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <span className={`tag tag-${detail.type === '入库' ? 'approved' : 'processing'}`} style={{ fontSize: 13 }}>{detail.type}</span>
        </div>
      </div>
      <div className="container" style={{ paddingTop: 16 }}>
        <div className="card">
          <div className="detail-row"><span className="detail-label">藏品编号</span><span className="detail-value">{detail.collectionCode}</span></div>
          <div className="detail-row"><span className="detail-label">藏品类型</span><span className="detail-value">{detail.collectionType}</span></div>
          <div className="detail-row"><span className="detail-label">库房</span><span className="detail-value">{detail.warehouseName} ({detail.warehouseCode})</span></div>
          <div className="detail-row"><span className="detail-label">入库时间</span><span className="detail-value">{detail.inboundDate ? detail.inboundDate.replace('T', ' ') : '-'}</span></div>
          <div className="detail-row"><span className="detail-label">出库时间</span><span className="detail-value">{detail.outboundDate ? detail.outboundDate.replace('T', ' ') : '-'}</span></div>
          <div className="detail-row"><span className="detail-label">操作员</span><span className="detail-value">{detail.operatorName}</span></div>
          <div className="detail-row"><span className="detail-label">备注</span><span className="detail-value">{detail.remark || '-'}</span></div>
        </div>
        {detail.collectionId && (
          <button className="btn btn-default" style={{ width: '100%' }}
            onClick={() => navigate('/keeper/collection-detail?id=' + detail.collectionId)}>查看藏品详情</button>
        )}
      </div>
    </div>
  );
}
