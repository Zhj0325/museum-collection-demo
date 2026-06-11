import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { get, post, put } from '../../api/request';
import { compressImage } from '../../utils/image';

const TYPES = ['未分类', '青铜器', '陶瓷', '书画', '玉器', '其他'];
const LEVELS = ['一级文物', '二级文物', '三级文物', '一般文物', '未定级'];
const STATUSES = ['未入库', '在库', '展出', '修复中', '借出'];

export default function CollectionForm() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id') || '';
  const navigate = useNavigate();
  const [form, setForm] = useState({
    code: '', name: '', type: '未分类', level: '未定级', status: '未入库',
    warehouseId: null, entryDate: '', description: '无', imageUrl: '', version: 0
  });
  const [warehouses, setWarehouses] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const loadedRef = useRef(false);

  useEffect(() => {
    get('/api/warehouses').then(data => setWarehouses(data.records || data || [])).catch(() => {});
  }, []);

  const loadCollection = useCallback(() => {
    if (!id) return;
    get('/api/collections/' + id).then(data => {
      const found = data.warehouse ? warehouses.find(w => w.name === data.warehouse) : null;
      setForm({
        code: data.code || '', name: data.name || '', type: data.type || '',
        level: data.level || '', status: data.status || '未入库',
        warehouseId: found ? found.id : null, entryDate: data.entryDate || '',
        description: data.description || '', imageUrl: data.imageUrl || '', version: data.version || 0
      });
    }).catch(() => {});
  }, [id, warehouses]);

  useEffect(() => {
    if (!id || !warehouses.length || loadedRef.current) return;
    loadedRef.current = true;
    loadCollection();
  }, [id, warehouses, loadCollection]);

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    if (submitting) return;
    if (!form.name) { alert('请输入藏品名称'); return; }
    if (!form.code) { alert('请输入藏品编号'); return; }
    setSubmitting(true);
    try {
      if (id) {
        await put('/api/collections/' + id, form);
      } else {
        await post('/api/collections', form);
      }
      alert('保存成功');
      navigate('/admin/collection-list');
    } catch (e) {
      if (e && e.code === 409) {
        if (window.confirm(e.message || '该藏品正被其他管理员修改，是否重新加载最新数据？')) {
          loadCollection();
        }
      }
    } finally { setSubmitting(false); }
  };

  return (
    <div>
      <div className="navbar">
        <div className="navbar-left">
          <button className="navbar-back" onClick={() => navigate('/admin/collection-list')}>←</button>
          <span className="navbar-title">{id ? '编辑藏品' : '新增藏品'}</span>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 16 }}>
        <div className="card">
          <div className="form-item"><span className="form-label">藏品编号</span><input className="form-input" value={form.code} onChange={e => set('code', e.target.value)} placeholder="如 CP001" /></div>
          <div className="form-item"><span className="form-label">藏品名称</span><input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="请输入藏品名称" /></div>
          <div className="form-item">
            <span className="form-label">藏品类型</span>
            <select className="form-select" value={form.type} onChange={e => set('type', e.target.value)}>
              {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="form-item">
            <span className="form-label">文物级别</span>
            <select className="form-select" value={form.level} onChange={e => set('level', e.target.value)}>
              {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div className="form-item">
            <span className="form-label">藏品状态</span>
            <select className="form-select" value={form.status} onChange={e => set('status', e.target.value)}>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-item">
            <span className="form-label">藏品库房</span>
            <select className="form-select" value={form.warehouseId} onChange={e => set('warehouseId', e.target.value ? Number(e.target.value) : null)} >
              <option value="">未指定</option>
              {warehouses.map(w => (
                <option key={w.id} value={w.id}>{w.name}
                  {w.code ? `（${w.code}）` : ''}
                </option>
              ))}
            </select>
          </div>
          <div className="form-item"><span className="form-label">入库日期</span><input className="form-input" type="date" value={form.entryDate} onChange={e => set('entryDate', e.target.value)} /></div>
          <div className="form-item form-item-col">
            <span className="form-label">藏品图片</span>
            <div className="upload-row">
              <label className="upload-box">
                {form.imageUrl
                  ? <img src={form.imageUrl} alt="藏品图片" />
                  : (
                    <span className="upload-hint">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" /><circle cx="12" cy="13" r="3" /></svg>
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
            <span className="form-label">藏品描述</span>
            <textarea className="form-textarea" value={form.description} onChange={e => set('description', e.target.value)} placeholder="请输入藏品详细描述" />
          </div>
        </div>

        <button className="btn btn-primary btn-lg" style={{ width: '100%' }} onClick={handleSubmit} disabled={submitting}>
          {submitting ? '保存中...' : '保存'}
        </button>
      </div>
    </div>
  );
}
