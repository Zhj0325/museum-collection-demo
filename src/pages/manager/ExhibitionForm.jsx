import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { get, post, put } from '../../api/request';
import { compressImage } from '../../utils/image';

export default function ExhibitionForm() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id') || '';
  const type = searchParams.get('type') || 'permanent';
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', hallId: '', location: '', startDate: '', endDate: '', imageUrl: '', description: '' });
  const [halls, setHalls] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [hallsLoaded, setHallsLoaded] = useState(false);

  if (id && !loaded) {
    setLoaded(true);
    // 按展览类型读取详情（常设/临展是两张表、两个接口）
    get(`/api/exhibitions/${type}/${id}`).then(data => {
      setForm({
        name: data.name || '', hallId: data.hallId || '', location: data.location || '',
        startDate: data.startDate || '', endDate: data.endDate || '',
        imageUrl: data.imageUrl || '', description: data.description || ''
      });
    }).catch(() => {});
  }

  if (type === 'permanent' && !hallsLoaded) {
    setHallsLoaded(true);
    get('/api/exhibitions/halls').then(data => setHalls(data.records || data || [])).catch(() => {});
  }

  const handleSubmit = async () => {
    if (submitting) return;
    if (!form.name) { alert('请输入展览名称'); return; }
    if (type === 'temporary' && !form.location) { alert('请输入展览地点'); return; }
    setSubmitting(true);
    const payload = type === 'permanent'
      ? { name: form.name, hallId: form.hallId || null, startDate: form.startDate || null, imageUrl: form.imageUrl, description: form.description }
      : { name: form.name, location: form.location, startDate: form.startDate || null, endDate: form.endDate || null, imageUrl: form.imageUrl, description: form.description };
    try {
      if (id) {
        await put(`/api/exhibitions/${type}/${id}`, payload);
      } else {
        await post(`/api/exhibitions/${type}`, payload);
      }
      alert('保存成功');
      navigate('/manager/exhibition-list' + (type === 'temporary' ? '?tab=1' : ''));
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
            <div className="form-item"><span className="form-label">展览地点 *</span><input className="form-input" value={form.location} onChange={e => set('location', e.target.value)} placeholder="如：特展厅 / 市美术馆" /></div>
          )}
          <div className="form-item"><span className="form-label">开始日期</span><input className="form-input" type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} /></div>
          {type === 'temporary' && (
            <div className="form-item"><span className="form-label">结束日期</span><input className="form-input" type="date" value={form.endDate} onChange={e => set('endDate', e.target.value)} /></div>
          )}
          <div className="form-item">
            <span className="form-label">类型</span>
            <span className="form-value" style={{ flex: 1, textAlign: 'right', fontSize: 14, color: 'var(--brown-light)' }}>{type === 'permanent' ? '常设展览' : '临时巡展'}</span>
          </div>
          <div className="form-item form-item-col">
            <span className="form-label">展览配图</span>
            <div className="upload-row">
              <label className="upload-box">
                {form.imageUrl
                  ? <img src={form.imageUrl} alt="展览配图" />
                  : (
                    <span className="upload-hint">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>
                      拍照 / 选图
                    </span>
                  )}
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={async e => {
                    const file = e.target.files[0];
                    e.target.value = '';
                    if (!file) return;
                    try { set('imageUrl', await compressImage(file)); }
                    catch (err) { alert(err.message || '图片处理失败'); }
                  }}
                />
              </label>
              {form.imageUrl && (
                <button className="btn btn-sm btn-default" onClick={() => set('imageUrl', '')}>移除图片</button>
              )}
            </div>
            <span className="form-hint">支持手机拍照或从相册选择，自动压缩后保存</span>
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
