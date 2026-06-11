import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { get, post, put } from '../../api/request';

export default function ExhibitionForm() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id') || '';
  const type = searchParams.get('type') || 'permanent';
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', hallId: '', startDate: '', endDate: '', description: '' });
  const [halls, setHalls] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [hallsLoaded, setHallsLoaded] = useState(false);

  if (id && !loaded) {
    setLoaded(true);
    get('/api/exhibitions/' + id).then(data => {
      setForm({ name: data.name || '', hallId: data.hallId || '', startDate: data.startDate || '', endDate: data.endDate || '', description: data.description || '' });
    }).catch(() => {});
  }

  if (type === 'permanent' && !hallsLoaded) {
    setHallsLoaded(true);
    get('/api/exhibitions/halls').then(data => setHalls(data.records || data || [])).catch(() => {});
  }

  const handleSubmit = async () => {
    if (submitting) return;
    if (!form.name) { alert('请输入展览名称'); return; }
    setSubmitting(true);
    try {
      if (id) {
        await put('/api/exhibitions/' + id, { ...form, type });
      } else {
        await post('/api/exhibitions', { ...form, type });
      }
      alert('保存成功');
      navigate('/manager/exhibition-list');
    } catch { /* 错误已由 request.js 统一提示 */ } finally { setSubmitting(false); }
  };

  const set = (f, v) => setForm(prev => ({ ...prev, [f]: v }));

  return (
    <div>
      <div className="navbar">
        <div className="navbar-left">
          <button className="navbar-back" onClick={() => navigate('/manager/exhibition-list')}>←</button>
          <span className="navbar-title">{id ? '编辑展览' : '新增展览'}</span>
        </div>
      </div>
      <div className="container" style={{ paddingTop: 16 }}>
        <div className="card">
          <div className="form-item"><span className="form-label">展览名称 *</span><input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="请输入展览名称" /></div>
          {type === 'permanent' ? (
            <div className="form-item">
              <span className="form-label">展厅</span>
              <select className="form-select" value={form.hallId} onChange={e => set('hallId', e.target.value)}>
                <option value="">请选择展厅</option>
                {halls.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
              </select>
            </div>
          ) : (
            <div className="form-item"><span className="form-label">展厅ID</span><input className="form-input" value={form.hallId} onChange={e => set('hallId', e.target.value)} placeholder="请输入展厅ID" /></div>
          )}
          <div className="form-item"><span className="form-label">开始日期</span><input className="form-input" type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} /></div>
          <div className="form-item"><span className="form-label">结束日期</span><input className="form-input" type="date" value={form.endDate} onChange={e => set('endDate', e.target.value)} /></div>
          <div className="form-item">
            <span className="form-label">类型</span>
            <span className="form-value" style={{ flex: 1, textAlign: 'right', fontSize: 14, color: 'var(--brown-light)' }}>{type === 'permanent' ? '常设展览' : '临时巡展'}</span>
          </div>
        </div>
        <div className="card">
          <div className="form-item form-item-col">
            <span className="form-label">展览描述</span>
            <textarea className="form-textarea" value={form.description} onChange={e => set('description', e.target.value)} placeholder="请输入展览详细描述" />
          </div>
        </div>
        <button className="btn btn-primary btn-lg" style={{ width: '100%' }} onClick={handleSubmit} disabled={submitting}>
          {submitting ? '保存中...' : '保存'}
        </button>
      </div>
    </div>
  );
}
