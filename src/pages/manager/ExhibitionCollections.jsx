import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { get, post, del } from '../../api/request';

export default function ExhibitionCollections() {
  const [searchParams] = useSearchParams();
  const exhibitionId = searchParams.get('id');
  const [currentList, setCurrentList] = useState([]);
  const [availableList, setAvailableList] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const navigate = useNavigate();

  const loadCurrent = () => {
    get('/api/exhibitions/' + exhibitionId + '/collections').then(data => setCurrentList(data.records || data || [])).catch(() => {});
  };

  const loadAvailable = () => {
    get('/api/collections', { status: '在库', pageSize: 50 }).then(data => setAvailableList(data.records || data || [])).catch(() => {});
  };

  useState(() => { loadCurrent(); }, []);

  const handleRemove = async (item) => {
    if (!window.confirm('确定移除 ' + item.name + ' 吗？')) return;
    try { await del('/api/exhibitions/' + exhibitionId + '/collections/' + item.collectionId); loadCurrent(); } catch { /* 错误已由 request.js 统一提示 */ }
  };

  const handleAdd = async (item) => {
    try {
      await post('/api/exhibitions/' + exhibitionId + '/collections', { collectionId: item.id });
      alert('添加成功');
      loadCurrent();
      setShowAdd(false);
    } catch { /* 错误已由 request.js 统一提示 */ }
  };

  return (
    <div>
      <div className="navbar">
        <div className="navbar-left">
          <button className="navbar-back" onClick={() => navigate('/manager/exhibition-list')}>←</button>
          <span className="navbar-title">展品管理</span>
        </div>
        <button className="btn btn-sm" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff' }}
          onClick={() => { setShowAdd(true); loadAvailable(); }}>+ 添加展品</button>
      </div>
      <div className="container" style={{ paddingTop: 16 }}>
        <div className="card-title">当前展品 ({currentList.length})</div>
        {currentList.map(item => (
          <div key={item.collectionId || item.id} className="list-item">
            <div className="list-item-icon">{item.name?.charAt(0)}</div>
            <div className="list-item-body">
              <div className="list-item-title">{item.name}</div>
              <div className="list-item-sub">{item.code} · {item.type}</div>
            </div>
            <button className="btn btn-danger btn-sm" onClick={() => handleRemove(item)}>移除</button>
          </div>
        ))}
        {currentList.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--brown-fade)' }}><p>暂无展品</p></div>
        )}
      </div>

      {showAdd && (
        <>
          <div className="modal-mask" onClick={() => setShowAdd(false)} />
          <div className="modal-box" style={{ position: 'fixed', top: '10%', left: '50%', transform: 'translateX(-50%)', zIndex: 1001, maxHeight: '80vh', overflow: 'auto', width: 400 }}>
            <div className="modal-title">添加展品</div>
            <div className="search-bar" style={{ marginBottom: 10 }}>
              <input value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="搜索藏品" />
            </div>
            {availableList.filter(it => it.name?.includes(keyword)).map(item => (
              <div key={item.id} className="list-item" onClick={() => handleAdd(item)} style={{ cursor: 'pointer' }}>
                <div className="list-item-icon">{item.name?.charAt(0)}</div>
                <div className="list-item-body">
                  <div className="list-item-title">{item.name}</div>
                  <div className="list-item-sub">{item.code} · {item.type}</div>
                </div>
                <span style={{ color: 'var(--gold)', fontSize: 18 }}>+</span>
              </div>
            ))}
            <div className="modal-actions">
              <button className="btn btn-default" onClick={() => setShowAdd(false)}>关闭</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
