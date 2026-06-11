import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { get, post } from '../../api/request';

const SORT_OPTIONS = [
  { value: 'createdAt|desc', label: '最新创建' },
  { value: 'createdAt|asc', label: '最早创建' },
  { value: 'entryDate|desc', label: '入库时间↓' },
  { value: 'entryDate|asc', label: '入库时间↑' },
  { value: 'name|asc', label: '朝代时间顺序' },
  { value: 'name|desc', label: '朝代时间逆序' },
  { value: 'code|asc', label: '编号升序' },
  { value: 'code|desc', label: '编号降序' },
];

const TYPES = ['青铜器', '陶瓷', '书画', '玉器', '其他'];

export default function AppraisalAssign() {
  const [step, setStep] = useState(1);
  const [collections, setCollections] = useState([]);
  const [kw, setKw] = useState('');
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');
  const [sortIdx, setSortIdx] = useState(0);
  const [showSort, setShowSort] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [experts, setExperts] = useState([]);
  const [selectedExpert, setSelectedExpert] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const searchCollections = (activeType, activeSortIdx, activeStatus) => {
    const si = activeSortIdx !== undefined ? activeSortIdx : sortIdx;
    const t = activeType !== undefined ? activeType : type;
    const s = activeStatus !== undefined ? activeStatus : status;
    const [sortBy, sortOrder] = SORT_OPTIONS[si].value.split('|');
    get('/api/collections', { pageSize: 50, keyword: kw, type: t, status: s, sortBy, sortOrder })
      .then(res => setCollections(res.records || res || [])).catch(() => {});
  };

  const loadExperts = () => {
    get('/api/users/experts').then(data => setExperts(data.records || data || [])).catch(() => {});
  };

  useState(() => { searchCollections(); }, []);

  const selectCollection = (item) => {
    setSelectedCollection(item);
    setStep(2);
    loadExperts();
  };

  const confirmAssign = async () => {
    if (submitting) return;
    if (!selectedCollection) { alert('请选择藏品'); return; }
    if (!selectedExpert) { alert('请选择专家'); return; }
    setSubmitting(true);
    try {
      await post('/api/appraisals/assign', { collectionId: selectedCollection.id, expertId: selectedExpert.id });
      alert('指派成功');
      navigate('/admin/home');
    } catch { /* 错误已由 request.js 统一提示 */ } finally { setSubmitting(false); }
  };

  return (
    <div>
      <div className="navbar">
        <div className="navbar-left">
          <button className="navbar-back" onClick={() => step === 2 ? setStep(1) : navigate('/admin/home')}>←</button>
          <span className="navbar-title">鉴定指派</span>
        </div>
      </div>
      <div className="container" style={{ paddingTop: 16 }}>
        {step === 1 ? (
          <>
            <div className="step-title">步骤 1：选择待鉴定藏品</div>
            <div className="search-bar" style={{ marginBottom: 10 }}>
              <input value={kw} onChange={e => setKw(e.target.value)} onKeyDown={e => e.key === 'Enter' && searchCollections()} placeholder="搜索藏品" />
              <button className="btn btn-primary btn-sm" style={{ marginLeft: 8 }} onClick={() => searchCollections()}>搜索</button>
            </div>

            <div className="filter-area" style={{ marginBottom: 10 }}>
              <div className="filter-group">
                <div className="filter-group-label">藏品分类</div>
                <div className="filter-types">
                  {TYPES.map(t => (
                    <button key={t} className={`filter-chip ${type === t ? 'active' : ''}`} onClick={() => { const nt = type === t ? '' : t; setType(nt); searchCollections(nt); }}>{t}</button>
                  ))}
                </div>
              </div>
              <div className="filter-group" style={{ marginTop: 8 }}>
                <div className="filter-group-label">库存状态</div>
                <div className="filter-types">
                  {['在库', '未入库', '展出'].map(s => (
                    <button key={s} className={`filter-chip ${status === s ? 'active' : ''}`} onClick={() => { const ns = status === s ? '' : s; setStatus(ns); searchCollections(undefined, undefined, ns); }}>{s}</button>
                  ))}
                </div>
              </div>
              <div style={{ marginTop: 8 }}>
                <button className="btn btn-default btn-sm" onClick={() => setShowSort(!showSort)}>
                  {SORT_OPTIONS[sortIdx].label} ▾
                </button>
              </div>
            </div>

            {showSort && (
              <>
                <div className="modal-mask" onClick={() => setShowSort(false)} />
                <div className="sort-panel" style={{ position: 'fixed', top: '30%', left: 20, right: 20, background: '#fff', borderRadius: 14, padding: 8, zIndex: 1001, boxShadow: '0 12px 40px rgba(0,0,0,0.2)' }}>
                  {SORT_OPTIONS.map((opt, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 20px', cursor: 'pointer', borderBottom: i < SORT_OPTIONS.length - 1 ? '1px solid #f0f0f0' : 'none', color: i === sortIdx ? 'var(--brown-dark)' : 'var(--text)', fontWeight: i === sortIdx ? 600 : 400 }}
                      onClick={() => { setSortIdx(i); setShowSort(false); searchCollections(undefined, i); }}>
                      {opt.label} {i === sortIdx && '✓'}
                    </div>
                  ))}
                </div>
              </>
            )}

            {collections.map(item => (
              <div key={item.id} className="list-item" onClick={() => selectCollection(item)} style={{ cursor: 'pointer' }}>
                <div className="list-item-icon">{item.name?.charAt(0)}</div>
                <div className="list-item-body">
                  <div className="list-item-title">{item.name}</div>
                  <div className="list-item-sub">{item.code} · {item.type} · {item.level}</div>
                </div>
                <span className={`tag tag-${item.status === '在库' ? 'approved' : 'pending'}`}>{item.status}</span>
                <span className="entry-arrow">›</span>
              </div>
            ))}
          </>
        ) : (
          <>
            <div className="step-title">步骤 2：选择鉴定专家</div>
            <div className="card" style={{ marginBottom: 12, background: 'var(--bg)' }}>
              <strong>已选藏品：</strong>{selectedCollection?.name} ({selectedCollection?.code})
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
