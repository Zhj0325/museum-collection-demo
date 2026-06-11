import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { get } from '../../api/request';
import { useAuth, getRoleHome } from '../../context/auth';

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

export default function CollectionBrowse() {
  const { userInfo } = useAuth();
  const rolePrefix = getRoleHome(userInfo?.role).split('/')[1];
  const [searchParams] = useSearchParams();
  const [list, setList] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [type, setType] = useState('');
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [sortIdx, setSortIdx] = useState(0);
  const [showSort, setShowSort] = useState(false);
  const navigate = useNavigate();

  const loadData = async (append, activeType, activeSortIdx, activeStatus) => {
    const pageSize = 10;
    const si = activeSortIdx !== undefined ? activeSortIdx : sortIdx;
    const t = activeType !== undefined ? activeType : type;
    const s = activeStatus !== undefined ? activeStatus : status;
    const [sortBy, sortOrder] = SORT_OPTIONS[si].value.split('|');
    try {
      const res = await get('/api/collections', { page: append ? page + 1 : 1, pageSize, keyword, type: t, status: s, sortBy, sortOrder });
      setList(append ? [...list, ...res.records] : res.records);
      setTotal(res.total);
      setPage(append ? page + 1 : 1);
    } catch { /* 错误已由 request.js 统一提示 */ }
  };

  useState(() => { loadData(); }, []);

  const handleSearch = () => { setPage(1); loadData(); };

  return (
    <div>
      <div className="navbar">
        <div className="navbar-left">
          <button className="navbar-back" onClick={() => navigate(getRoleHome(userInfo?.role))}>←</button>
          <span className="navbar-title">藏品浏览</span>
        </div>
      </div>
      <div className="container" style={{ paddingTop: 12 }}>
        <div className="search-bar" style={{ marginBottom: 10 }}>
          <input value={keyword} onChange={e => setKeyword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} placeholder="搜索藏品名称/编号" />
          {keyword && <button className="search-clear" onClick={() => { setKeyword(''); loadData(); }}>×</button>}
          <button className="btn btn-primary btn-sm" style={{ marginLeft: 8 }} onClick={handleSearch}>搜索</button>
        </div>

        <div className="filter-area" style={{ marginBottom: 12 }}>
          <div className="filter-group">
            <div className="filter-group-label">藏品分类</div>
            <div className="filter-types">
              {TYPES.map(t => (
                <button key={t} className={`filter-chip ${type === t ? 'active' : ''}`} onClick={() => { const newType = type === t ? '' : t; setType(newType); loadData(false, newType); }}>{t}</button>
              ))}
            </div>
          </div>
          <div className="filter-group" style={{ marginTop: 8 }}>
            <div className="filter-group-label">库存状态</div>
            <div className="filter-types">
              {['在库', '未入库', '展出'].map(s => (
                <button key={s} className={`filter-chip ${status === s ? 'active' : ''}`} onClick={() => { const ns = status === s ? '' : s; setStatus(ns); loadData(false, undefined, undefined, ns); }}>{s}</button>
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
                  onClick={() => { setSortIdx(i); setShowSort(false); loadData(false, undefined, i); }}>
                  {opt.label} {i === sortIdx && '✓'}
                </div>
              ))}
            </div>
          </>
        )}

        {list.map(item => (
          <div key={item.id} className="list-item" onClick={() => navigate(`/${rolePrefix}/collection-detail?id=` + item.id)} style={{ cursor: 'pointer' }}>
            <div className="list-item-icon">{item.name?.charAt(0)}</div>
            <div className="list-item-body">
              <div className="list-item-title">{item.name}</div>
              <div className="list-item-sub">{item.code} · {item.type} · {item.level}</div>
            </div>
            <div className="list-item-extra">
              <span className={`tag tag-${item.status === '在库' ? 'approved' : item.status === '未入库' ? 'pending' : 'processing'}`}>{item.status}</span>
            </div>
            <span className="entry-arrow">›</span>
          </div>
        ))}
        {list.length < total && (
          <div className="load-more"><button className="btn btn-default" onClick={() => loadData(true)}>加载更多</button></div>
        )}
        {list.length === 0 && (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--brown-fade)' }}>
            <p style={{ fontSize: 40 }}>📭</p>
            <p>暂无藏品</p>
          </div>
        )}
      </div>
    </div>
  );
}
