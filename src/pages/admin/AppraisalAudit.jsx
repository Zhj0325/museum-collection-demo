import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { get, put } from '../../api/request';

export default function AppraisalAudit() {
  const [list, setList] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [showDialog, setShowDialog] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [currentAction, setCurrentAction] = useState('approve');
  const [remark, setRemark] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const loadData = async (append) => {
    const pageSize = 10;
    try {
      const res = await get('/api/appraisals/pending-audit', { page: append ? page + 1 : 1, pageSize });
      setList(append ? [...list, ...res.records] : res.records);
      setTotal(res.total);
      setPage(append ? page + 1 : 1);
    } catch { /* 错误已由 request.js 统一提示 */ }
  };

  useState(() => { loadData(); }, []);

  const openDialog = (id, action) => {
    setCurrentId(id);
    setCurrentAction(action);
    setRemark('');
    setShowDialog(true);
  };

  const confirmAudit = async () => {
    if (submitting) return;
    if (currentAction === 'reject' && !remark.trim()) { alert('请填写驳回原因'); return; }
    setSubmitting(true);
    try {
      await put('/api/appraisals/' + currentId + '/audit', {
        approved: currentAction === 'approve',
        remark: remark.trim()
      });
      setShowDialog(false);
      loadData();
    } catch { /* 错误已由 request.js 统一提示 */ } finally { setSubmitting(false); }
  };

  return (
    <div>
      <div className="navbar">
        <div className="navbar-left">
          <button className="navbar-back" onClick={() => navigate('/admin/home')}>←</button>
          <span className="navbar-title">鉴定审核</span>
        </div>
      </div>
      <div className="container" style={{ paddingTop: 16 }}>
        {list.map(item => (
          <div key={item.id} className="list-item">
            <div className="list-item-icon">鉴</div>
            <div className="list-item-body">
              <div className="list-item-title">{item.collectionName || '藏品'}</div>
              <div className="list-item-sub">专家：{item.expertName} · 结论：{item.conclusion?.slice(0, 20) || '待鉴定'}</div>
            </div>
            <div className="action-btns">
              <button className="btn btn-primary btn-sm" onClick={() => openDialog(item.id, 'approve')}>通过</button>
              <button className="btn btn-danger btn-sm" onClick={() => openDialog(item.id, 'reject')}>驳回</button>
            </div>
          </div>
        ))}
        {list.length < total && (
          <div className="load-more"><button className="btn btn-default" onClick={() => loadData(true)}>加载更多</button></div>
        )}
        {list.length === 0 && (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--brown-fade)' }}><p>暂无待审核鉴定</p></div>
        )}

        {showDialog && (
          <>
            <div className="modal-mask" onClick={() => setShowDialog(false)} />
            <div className="modal-box" style={{ position: 'fixed', top: '30%', left: '50%', transform: 'translateX(-50%)', zIndex: 1001 }}>
              <div className="modal-title">{currentAction === 'approve' ? '确认通过' : '驳回原因'}</div>
              <textarea className="form-textarea" value={remark} onChange={e => setRemark(e.target.value)} placeholder={currentAction === 'reject' ? '请填写驳回原因（必填）' : '审核意见（选填）'} />
              <div className="modal-actions">
                <button className="btn btn-default" onClick={() => setShowDialog(false)}>取消</button>
                <button className={`btn ${currentAction === 'approve' ? 'btn-primary' : 'btn-danger'}`} onClick={confirmAudit} disabled={submitting}>确认</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
