import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { get } from '../../api/request';
import { clickSafe } from '../../utils/clickSafe';

export default function StorageRecords() {
  const [list, setList] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();

  const loadData = async (append) => {
    const pageSize = 10;
    try {
      const res = await get('/api/storage-records', { page: append ? page + 1 : 1, pageSize, keyword });
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
          <button className="navbar-back" onClick={() => navigate('/keeper/home')}>←</button>
          <span className="navbar-title">存放记录</span>
        </div>
      </div>
      <div className="container" style={{ paddingTop: 12 }}>
        <div className="search-bar" style={{ marginBottom: 10 }}>
          <input value={keyword} onChange={e => setKeyword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} placeholder="搜索藏品名称/编号" />
          {keyword && <button className="search-clear" onClick={() => { setKeyword(''); loadData(); }}>×</button>}
          <button className="btn btn-primary btn-sm" style={{ marginLeft: 8 }} onClick={handleSearch}>搜索</button>
        </div>
        {list.map(item => (
          <div key={item.id} className="list-item" onClick={clickSafe(() => navigate('/keeper/storage-record-detail?id=' + item.id))} style={{ cursor: 'pointer' }}>
            <div className="list-item-icon">{item.type === '入库' ? '入' : '出'}</div>
            <div className="list-item-body">
              <div className="list-item-title">{item.collectionName || '藏品'}</div>
              <div className="list-item-sub">{item.warehouseName || ''} ·  {(item.inboundDate || item.outboundDate || '').replace('T', ' ')}</div>
            </div>
            <div className="list-item-extra">
              <span className={`tag tag-${item.type === '入库' ? 'approved' : 'processing'}`}>{item.type}</span>
            </div>
            <span className="entry-arrow">›</span>
          </div>
        ))}
        {list.length < total && (
          <div className="load-more"><button className="btn btn-default" onClick={() => loadData(true)}>加载更多</button></div>
        )}
        {list.length === 0 && (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--brown-fade)' }}><p>暂无存放记录</p></div>
        )}
      </div>
    </div>
  );
}
