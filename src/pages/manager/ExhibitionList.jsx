import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { get, del } from '../../api/request';

export default function ExhibitionList() {
  const [searchParams] = useSearchParams();
  const initialTab = parseInt(searchParams.get('tab') || '0') || 0;
  const [activeTab, setActiveTab] = useState(initialTab);
  const [list, setList] = useState([]);
  const [loaded, setLoaded] = useState({});
  const navigate = useNavigate();

  const load = (idx, force) => {
    if (!force && loaded[idx]) return;
    const url = idx === 0 ? '/api/exhibitions/permanent' : '/api/exhibitions/temporary';
    get(url).then(data => {
      setList((data.records || data || []).map(item => ({ ...item, type: idx === 0 ? 'permanent' : 'temporary' })));
      setLoaded(prev => ({ ...prev, [idx]: true }));
    }).catch(() => {});
  };

  const switchTab = (idx) => { setActiveTab(idx); load(idx); };

  useState(() => { load(initialTab); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('确认删除此展览？')) return;
    // force 重载：load 内对 loaded 的早退检查读取的是旧闭包，删除后必须强制刷新
    try { await del('/api/exhibitions/' + id); setLoaded({}); load(activeTab, true); } catch { /* 错误已由 request.js 统一提示 */ }
  };

  return (
    <div>
      <div className="navbar">
        <div className="navbar-left">
          <button className="navbar-back" onClick={() => navigate('/manager/home')}>←</button>
          <span className="navbar-title">展览管理</span>
        </div>
        <button className="btn btn-sm" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff' }}
          onClick={() => navigate('/manager/exhibition-form?type=' + (activeTab === 0 ? 'permanent' : 'temporary'))}>+ 新增</button>
      </div>
      <div className="tabs">
        {['常设展览', '临时巡展'].map((t, i) => (
          <button key={i} className={`tab-item ${i === activeTab ? 'active' : ''}`} onClick={() => switchTab(i)}>{t}</button>
        ))}
      </div>
      <div className="container" style={{ paddingTop: 12 }}>
        {list.map(item => (
          <div key={item.id} className="list-item">
            <div className="list-item-icon">{item.name?.charAt(0)}</div>
            <div className="list-item-body">
              <div className="list-item-title">{item.name}</div>
              <div className="list-item-sub">{item.startDate} ~ {item.endDate} · {item.status}</div>
            </div>
            <div className="action-btns">
              <button className="btn btn-default btn-sm" onClick={() => navigate('/manager/exhibition-collections?id=' + item.id)}>展品</button>
              <button className="btn btn-default btn-sm" onClick={() => navigate('/manager/exhibition-form?id=' + item.id + '&type=' + item.type)}>编辑</button>
              <button className="btn btn-danger btn-sm" onClick={() => handleDelete(item.id)}>删除</button>
            </div>
          </div>
        ))}
        {list.length === 0 && (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--brown-fade)' }}><p>暂无展览</p></div>
        )}
      </div>
    </div>
  );
}
