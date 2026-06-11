/* ============================================================
   演示模式（Mock API）
   在 GitHub Pages 等纯静态环境下模拟后端：内存数据库 + 路由表。
   数据与操作日志保存在 localStorage：访问者的所有操作都被记录并保留
   （按浏览器持久化；点击角标可查看操作日志，可一键重置演示数据）。
   触发条件：github.io 域名 / 构建时 VITE_DEMO=1 / URL 带 ?demo
   ============================================================ */

export function isDemoMode() {
  if (typeof window === 'undefined') return false;
  if (window.location.hostname.endsWith('github.io')) return true;
  if (new URLSearchParams(window.location.search).has('demo')) return true;
  return import.meta.env.VITE_DEMO === '1';
}

const STORE_KEY = 'museum-demo-db-v2';

function today(offsetDays = 0) {
  const d = new Date(Date.now() + offsetDays * 86400000);
  return d.toISOString().slice(0, 10);
}
function ts(offsetDays = 0, hhmm = '10:00') {
  return `${today(offsetDays)}T${hhmm}:00`;
}

function seed() {
  return {
    users: [
      { id: 1, username: 'admin', realName: '系统管理员', role: 'ADMIN', phone: '13800000001' },
      { id: 2, username: 'keeper1', realName: '张库管', role: 'STORAGE_KEEPER', phone: '13800000002' },
      { id: 3, username: 'manager1', realName: '李展览', role: 'EXHIBITION_MANAGER', phone: '13800000003' },
      { id: 4, username: 'expert1', realName: '王专家', role: 'EXPERT', phone: '13800000004', specialty: '青铜器·陶瓷鉴定', institution: '省文物研究院' },
      { id: 5, username: 'expert2', realName: '赵研究员', role: 'EXPERT', phone: '13800000005', specialty: '书画修复', institution: '故宫博物院' }
    ],
    warehouses: [
      { id: 1, code: 'CK001', name: '一号库房（青铜器）', temperature: 22.0, humidity: 45.0, capacity: 200 },
      { id: 2, code: 'CK002', name: '二号库房（书画）', temperature: 20.0, humidity: 50.0, capacity: 150 },
      { id: 3, code: 'CK003', name: '三号库房（陶瓷）', temperature: 21.0, humidity: 48.0, capacity: 180 }
    ],
    halls: [
      { id: 1, code: 'ZT001', name: '第一展厅', area: 500.0, location: '一层东侧' },
      { id: 2, code: 'ZT002', name: '第二展厅', area: 600.0, location: '一层西侧' },
      { id: 3, code: 'ZT003', name: '特展厅', area: 350.0, location: '二层' }
    ],
    collections: [
      { id: 1, code: 'CP001', name: '商代青铜鼎', type: '青铜器', level: '一级文物', status: '在库', warehouse: '一号库房（青铜器）', entryDate: '2000-03-15', era: '商代晚期', material: '青铜', size: '通高85cm', source: '考古发掘', description: '商代晚期大型青铜礼器，饕餮纹饰庄重威严，是镇馆之宝之一。', createdAt: ts(-300), version: 3 },
      { id: 2, code: 'CP002', name: '宋代青花瓷瓶', type: '陶瓷', level: '二级文物', status: '在库', warehouse: '三号库房（陶瓷）', entryDate: '2005-07-20', era: '北宋', material: '瓷', size: '高32cm', source: '社会征集', description: '宋代景德镇青花瓷，釉色温润，保存完好。', createdAt: ts(-280), version: 1 },
      { id: 3, code: 'CP003', name: '明代山水画轴', type: '书画', level: '一级文物', status: '展出', warehouse: null, entryDate: '1998-11-08', era: '明代', material: '纸本设色', size: '纵180cm 横65cm', source: '捐赠', description: '明代文徵明真迹，笔意苍润，构图深远。', createdAt: ts(-260), version: 2 },
      { id: 4, code: 'CP004', name: '汉代玉璧', type: '玉器', level: '一级文物', status: '在库', warehouse: '一号库房（青铜器）', entryDate: '2002-01-25', era: '西汉', material: '和田玉', size: '直径28cm', source: '考古发掘', description: '汉代和田玉璧，谷纹规整，玉质莹润。', createdAt: ts(-240), version: 0 },
      { id: 5, code: 'CP005', name: '清代珐琅彩碗', type: '陶瓷', level: '二级文物', status: '修复中', warehouse: null, entryDate: '2010-09-12', era: '清乾隆', material: '瓷胎珐琅', size: '口径11cm', source: '社会征集', description: '清代乾隆年间珐琅彩瓷碗，彩绘花卉娇艳。口沿有细微冲线，正在修复。', createdAt: ts(-220), version: 1 },
      { id: 6, code: 'CP006', name: '唐代三彩马', type: '陶瓷', level: '一级文物', status: '在库', warehouse: '三号库房（陶瓷）', entryDate: '1995-05-30', era: '盛唐', material: '釉陶', size: '高48cm', source: '考古发掘', description: '唐代三彩釉陶马，造型生动，釉色流光溢彩。', createdAt: ts(-200), version: 0 },
      { id: 7, code: 'CP007', name: '西周青铜编钟', type: '青铜器', level: '一级文物', status: '展出', warehouse: null, entryDate: '2001-06-18', era: '西周晚期', material: '青铜', size: '一套8件', source: '考古发掘', description: '西周晚期编钟一套8件，音律完整，铭文清晰。', createdAt: ts(-180), version: 1 },
      { id: 8, code: 'CP008', name: '元代青花大盘', type: '陶瓷', level: '二级文物', status: '在库', warehouse: '三号库房（陶瓷）', entryDate: '2008-12-03', era: '元代', material: '瓷', size: '口径42cm', source: '海外回流', description: '元代景德镇青花缠枝纹大盘，发色浓艳。', createdAt: ts(-160), version: 0 },
      { id: 9, code: 'CP009', name: '战国错金银带钩', type: '青铜器', level: null, status: '未入库', warehouse: null, entryDate: today(-12), era: '战国', material: '青铜错金银', size: '长18cm', source: '新近征集', description: '战国错金银工艺带钩，纹饰精美，待鉴定定级。', createdAt: ts(-12), version: 0 },
      { id: 10, code: 'CP010', name: '清代缂丝龙袍', type: '其他', level: null, status: '未入库', warehouse: null, entryDate: today(-8), era: '清中期', material: '缂丝', size: '身长142cm', source: '捐赠', description: '清代缂丝十二章纹龙袍，织造繁复，待鉴定定级。', createdAt: ts(-8), version: 0 },
      { id: 11, code: 'CP011', name: '北魏石造像', type: '其他', level: '三级文物', status: '在库', warehouse: '二号库房（书画）', entryDate: '2015-04-22', era: '北魏', material: '砂岩', size: '高60cm', source: '社会征集', description: '北魏佛教石造像，面相清癯，衣纹流畅。', createdAt: ts(-140), version: 0 },
      { id: 12, code: 'CP012', name: '宋代米芾行书帖', type: '书画', level: '一级文物', status: '在库', warehouse: '二号库房（书画）', entryDate: '2003-10-11', era: '北宋', material: '纸本墨迹', size: '纵31cm 横58cm', source: '捐赠', description: '北宋米芾行书尺牍，八面出锋，神采飞扬。', createdAt: ts(-120), version: 2 }
    ],
    exhibitions: [
      { id: 1, code: 'ZL001', name: '吉金永辉——青铜文明常设展', type: 'permanent', hallId: 1, hallName: '第一展厅', startDate: '2024-01-10', endDate: '', status: '展出中', description: '以馆藏青铜器为主线，展现商周礼乐文明。' },
      { id: 2, code: 'ZL002', name: '翰墨丹青——古代书画常设展', type: 'permanent', hallId: 2, hallName: '第二展厅', startDate: '2024-03-01', endDate: '', status: '展出中', description: '遴选馆藏书画精品，呈现笔墨千年流变。' },
      { id: 3, code: 'LZ001', name: '丝路遗珍——西域文物特展', type: 'temporary', location: '特展厅', startDate: today(-20), endDate: today(40), status: '展出中', description: '联合多家博物馆举办的丝绸之路主题特展。' },
      { id: 4, code: 'LZ002', name: '瓷韵流光——馆藏陶瓷巡展', type: 'temporary', location: '市美术馆', startDate: today(15), endDate: today(75), status: '筹备中', description: '面向公众的馆藏陶瓷精品巡回展览。' },
      { id: 5, code: 'LZ003', name: '玉魄国魂——古代玉器临展', type: 'temporary', location: '特展厅', startDate: today(30), endDate: today(90), status: '待审批', exhibitionType: 'TEMPORARY', applicant: '李展览', reason: '配合馆庆推出玉器主题临展', createdAt: ts(-2, '14:20'), description: '以馆藏玉器为核心的临时展览方案。' }
    ],
    exhibitionCollections: [
      { exhibitionId: 1, collectionId: 7 },
      { exhibitionId: 2, collectionId: 3 }
    ],
    outboundRequests: [
      { id: 1, code: 'OUT-20260601-001', exhibitionId: 3, exhibitionType: 'TEMPORARY', applicant: '李展览', applicantId: 3, reason: '丝路特展需调展唐三彩马', status: '待审批', collectionIds: [6], createdAt: ts(-1, '09:12') },
      { id: 2, code: 'OUT-20260528-002', exhibitionId: 1, exhibitionType: 'PERMANENT', applicant: '李展览', applicantId: 3, reason: '常设展上新汉代玉璧', status: '已通过', collectionIds: [4], registered: false, approveComment: '同意，注意运输安全', createdAt: ts(-4, '15:40') },
      { id: 3, code: 'OUT-20260520-003', exhibitionId: 2, exhibitionType: 'PERMANENT', applicant: '李展览', applicantId: 3, reason: '书画展轮换展品', status: '已拒绝', collectionIds: [12], approveComment: '该帖近期已展出过，建议下一轮换期再展', createdAt: ts(-12, '11:05') }
    ],
    inboundRequests: [
      { id: 1, code: 'IN-20260603-001', warehouseId: 3, applicant: '李展览', applicantId: 3, reason: '瓷韵巡展首站结束，珐琅彩碗等回库', status: '待审批', collectionIds: [8], createdAt: ts(0, '08:50') },
      { id: 2, code: 'IN-20260525-002', warehouseId: 1, applicant: '李展览', applicantId: 3, reason: '编钟巡展结束回库', status: '已通过', collectionIds: [7], registered: false, approveComment: '同意，入库前请核对清单', createdAt: ts(-6, '16:30') }
    ],
    repairRequests: [
      { id: 1, code: 'REP-20260530-001', collectionId: 5, collectionName: '清代珐琅彩碗', applicant: '李展览', applicantId: 3, reason: '口沿发现细微冲线，需要专业修复', status: '修复中', expertId: 4, urgency: 'urgent', createdAt: ts(-10, '10:15') },
      { id: 2, code: 'REP-20260605-002', collectionId: 11, collectionName: '北魏石造像', applicant: '李展览', applicantId: 3, reason: '基座风化剥落，建议加固处理', status: '待审批', urgency: 'normal', createdAt: ts(-1, '13:45') },
      { id: 3, code: 'REP-20260518-003', collectionId: 3, collectionName: '明代山水画轴', applicant: '李展览', applicantId: 3, reason: '画心局部霉斑，需除霉处理', status: '已通过', urgency: 'normal', approveComment: '同意，请尽快指派专家', createdAt: ts(-15, '09:30') }
    ],
    repairRecords: [
      { id: 1, repairRequestId: 1, repairCode: 'REP-20260530-001', collectionId: 5, collectionName: '清代珐琅彩碗', collectionCode: 'CP005', reason: '口沿发现细微冲线，需要专业修复', status: '待修复', expertId: 4, createdAt: ts(-9, '09:00') },
      { id: 2, repairRequestId: 0, repairCode: 'REP-20260410-000', collectionId: 6, collectionName: '唐代三彩马', collectionCode: 'CP006', reason: '马尾部釉层起翘', status: '已修复', expertId: 4, beforeStatus: '马尾部釉层局部起翘约2cm', afterStatus: '起翘釉层回贴加固，整体稳定', conclusion: '修复完成，建议恒湿保存', repairMethod: '加固', createdAt: ts(-60, '09:00') }
    ],
    appraisals: [
      { id: 1, collectionId: 9, expertId: 4, conclusion: null, auditStatus: '待提交', createdAt: ts(-3, '10:30') },
      { id: 2, collectionId: 10, expertId: 4, conclusion: '缂丝织造工艺为清中期宫廷风格，十二章纹完整，确为清代宫廷服饰珍品。', confirmedLevel: '二级文物', judgedLevel: '二级文物', judgedAuthenticity: '真品', auditStatus: '待审核', createdAt: ts(-5, '14:00') },
      { id: 3, collectionId: 1, expertId: 4, conclusion: '器型纹饰与殷墟出土标准器一致，铸造工艺特征明确，为商晚期真品。', confirmedLevel: '一级文物', judgedLevel: '一级文物', judgedAuthenticity: '真品', auditStatus: '已通过', auditRemark: '审核通过', createdAt: ts(-30, '11:20') }
    ],
    storageRecords: [
      { id: 1, type: '入库', collectionId: 1, warehouseId: 1, inboundDate: ts(-300, '09:30'), outboundDate: null, operatorName: '张库管', remark: '初次入藏登记', createdAt: ts(-300, '09:30') },
      { id: 2, type: '入库', collectionId: 2, warehouseId: 3, inboundDate: ts(-280, '14:10'), outboundDate: null, operatorName: '张库管', remark: '', createdAt: ts(-280, '14:10') },
      { id: 3, type: '出库', collectionId: 3, warehouseId: 2, inboundDate: null, outboundDate: ts(-90, '10:00'), operatorName: '张库管', remark: '调往第二展厅常设展', createdAt: ts(-90, '10:00') },
      { id: 4, type: '出库', collectionId: 7, warehouseId: 1, inboundDate: null, outboundDate: ts(-75, '09:20'), operatorName: '张库管', remark: '青铜编钟调展', createdAt: ts(-75, '09:20') },
      { id: 5, type: '入库', collectionId: 11, warehouseId: 2, inboundDate: ts(-140, '15:45'), outboundDate: null, operatorName: '张库管', remark: '', createdAt: ts(-140, '15:45') }
    ],
    opLogs: [],
    nextId: 1000
  };
}

let db = null;
function loadDb() {
  if (db) return db;
  try {
    const cached = localStorage.getItem(STORE_KEY);
    db = cached ? JSON.parse(cached) : seed();
    if (!db.opLogs) db.opLogs = [];
  } catch { db = seed(); }
  return db;
}
function save() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(db)); } catch { /* 空间不足时放弃持久化 */ }
}

/* —— 操作日志：记录并保留每一次写操作 —— */
const RESOURCE_LABELS = {
  auth: '账号', dashboard: '工作台', collections: '藏品', users: '用户',
  warehouses: '库房', exhibitions: '展览', 'outbound-requests': '出库申请',
  'inbound-requests': '入库申请', 'repair-requests': '修复申请',
  'repair-records': '修复记录', appraisals: '鉴定', 'storage-records': '存放记录'
};

function describeOp(method, path) {
  const parts = path.split('/').filter(Boolean);
  const label = RESOURCE_LABELS[parts[1]] || parts[1];
  const tail = parts[parts.length - 1];
  if (parts[1] === 'auth') return tail === 'login' ? '登录系统' : '注册账号';
  if (tail === 'approve') return `审批${label} #${parts[2]}`;
  if (tail === 'assign') return label === '鉴定' ? '指派鉴定专家' : `指派${label}专家 #${parts[2]}`;
  if (tail === 'submit') return `提交鉴定结论 #${parts[2]}`;
  if (tail === 'audit') return `审核鉴定结论 #${parts[2]}`;
  if (tail === 'initial-inbound') return '未入库藏品入库登记';
  if (tail === 'outbound') return '出库登记';
  if (tail === 'inbound') return '入库登记';
  if (method === 'POST') return `新增${label}`;
  if (method === 'PUT') return `修改${label} #${parts[2] || ''}`;
  if (method === 'DELETE') return `删除${label} #${parts[2] || ''}`;
  return `${method} ${path}`;
}

function logOp(method, path, data) {
  const user = currentUser();
  // 登录操作发生在写入 userInfo 之前，从提交数据里取账号名
  const who = user ? `${user.realName}(${user.role})` : (data && data.username ? data.username : '游客');
  db.opLogs.unshift({
    time: new Date().toLocaleString('zh-CN', { hour12: false }),
    user: who,
    action: describeOp(method, path)
  });
  if (db.opLogs.length > 500) db.opLogs.length = 500;
}

export function getOpLogs() {
  loadDb();
  return db.opLogs;
}

export function resetDemoDb() {
  db = seed();
  save();
}
function nid() { return ++db.nextId; }

function currentUser() {
  try {
    const stored = localStorage.getItem('userInfo');
    return stored ? JSON.parse(stored) : null;
  } catch { return null; }
}

function fail(message, code = 400) {
  const err = { code, message };
  throw err;
}

function byId(arr, id) { return arr.find(x => String(x.id) === String(id)); }

function collectionBrief(c) {
  return c ? { id: c.id, name: c.name, code: c.code, type: c.type } : {};
}

function paginate(list, params) {
  const page = parseInt(params.page || '1', 10);
  const pageSize = parseInt(params.pageSize || '10', 10);
  return { records: list.slice((page - 1) * pageSize, page * pageSize), total: list.length };
}

function sortBy(list, params) {
  const { sortBy: field, sortOrder } = params;
  if (!field) return list;
  const sorted = [...list].sort((a, b) => {
    const va = a[field] ?? '';
    const vb = b[field] ?? '';
    return va < vb ? -1 : va > vb ? 1 : 0;
  });
  return sortOrder === 'desc' ? sorted.reverse() : sorted;
}

/* —— 各资源处理器 —— */

function handleCollections(method, parts, params, data) {
  const col = db.collections;
  if (method === 'GET' && parts.length === 2) {
    let list = col;
    if (params.keyword) list = list.filter(c => c.name.includes(params.keyword) || c.code.includes(params.keyword));
    if (params.type) list = list.filter(c => c.type === params.type);
    if (params.status) list = list.filter(c => c.status === params.status);
    list = sortBy(list, params);
    return paginate(list, params);
  }
  if (method === 'GET' && parts.length === 3) {
    const c = byId(col, parts[2]);
    if (!c) fail('藏品不存在', 404);
    return { ...c, imageUrl: c.imageUrl || '' };
  }
  if (method === 'POST') {
    if (col.some(c => c.code === data.code)) fail('藏品编号已存在');
    const w = data.warehouseId ? byId(db.warehouses, data.warehouseId) : null;
    const c = { ...data, id: nid(), warehouse: w ? w.name : null, createdAt: ts(0, '10:00'), version: 0 };
    col.unshift(c); save();
    return c;
  }
  if (method === 'PUT' && parts.length === 3) {
    const c = byId(col, parts[2]);
    if (!c) fail('藏品不存在', 404);
    const w = data.warehouseId ? byId(db.warehouses, data.warehouseId) : null;
    Object.assign(c, data, { id: c.id, warehouse: w ? w.name : c.warehouse, version: (c.version || 0) + 1 });
    save();
    return c;
  }
  if (method === 'DELETE' && parts.length === 3) {
    const idx = col.findIndex(c => String(c.id) === String(parts[2]));
    if (idx < 0) fail('藏品不存在', 404);
    col.splice(idx, 1); save();
    return true;
  }
  fail('未知操作');
}

function requestView(r, exhibitions) {
  const view = { ...r };
  if (r.exhibitionId && exhibitions) {
    const ex = byId(db.exhibitions, r.exhibitionId);
    view.exhibitionName = ex ? ex.name : '';
  }
  view.items = (r.collectionIds || []).map(id => collectionBrief(byId(db.collections, id)));
  return view;
}

function handleReqList(listName, method, parts, params, data, codePrefix) {
  const list = db[listName];
  if (method === 'GET' && parts.length === 2) {
    let result = list;
    if (params.status) result = result.filter(r => r.status === params.status && !r.registered);
    return result.map(r => requestView(r, true));
  }
  if (method === 'GET' && parts.length === 3) {
    const r = byId(list, parts[2]);
    if (!r) fail('申请不存在', 404);
    return requestView(r, true);
  }
  if (method === 'POST') {
    const user = currentUser();
    const r = {
      ...data,
      id: nid(),
      code: `${codePrefix}-${today().replace(/-/g, '')}-${String(db.nextId).slice(-3)}`,
      applicant: user ? user.realName : '演示用户',
      applicantId: user ? user.id : 0,
      status: '待审批',
      createdAt: ts(0, '11:00')
    };
    list.unshift(r); save();
    return r;
  }
  if (method === 'PUT' && parts[3] === 'approve') {
    const r = byId(list, parts[2]);
    if (!r) fail('申请不存在', 404);
    r.status = data.passed ? '已通过' : '已拒绝';
    r.approveComment = data.comment || '';
    save();
    return r;
  }
  fail('未知操作');
}

function handleRepairRequests(method, parts, params, data) {
  const list = db.repairRequests;
  if (method === 'PUT' && parts[3] === 'assign') {
    const r = byId(list, parts[2]);
    if (!r) fail('申请不存在', 404);
    r.status = '修复中';
    r.expertId = Number(data.expertId);
    const c = byId(db.collections, r.collectionId);
    if (c) c.status = '修复中';
    db.repairRecords.unshift({
      id: nid(), repairRequestId: r.id, repairCode: r.code,
      collectionId: r.collectionId, collectionName: c ? c.name : r.collectionName,
      collectionCode: c ? c.code : '', reason: r.reason,
      status: '待修复', expertId: r.expertId, createdAt: ts(0, '11:30')
    });
    save();
    return r;
  }
  if (method === 'GET' && parts.length === 2) {
    let result = list;
    if (params.status) result = result.filter(r => r.status === params.status);
    return result.map(r => {
      const c = byId(db.collections, r.collectionId);
      return { ...r, collectionName: c ? c.name : r.collectionName, items: [collectionBrief(c)] };
    });
  }
  if (method === 'GET' && parts.length === 3) {
    const r = byId(list, parts[2]);
    if (!r) fail('申请不存在', 404);
    const c = byId(db.collections, r.collectionId);
    return { ...r, collectionName: c ? c.name : r.collectionName, items: [collectionBrief(c)] };
  }
  if (method === 'POST') {
    const user = currentUser();
    const c = byId(db.collections, data.collectionId);
    const r = {
      ...data,
      id: nid(),
      code: `REP-${today().replace(/-/g, '')}-${String(db.nextId).slice(-3)}`,
      collectionName: c ? c.name : '',
      applicant: user ? user.realName : '演示用户',
      applicantId: user ? user.id : 0,
      status: '待审批',
      createdAt: ts(0, '11:00')
    };
    list.unshift(r); save();
    return r;
  }
  return handleReqList('repairRequests', method, parts, params, data, 'REP');
}

function handleExhibitions(method, parts, params, data) {
  const exs = db.exhibitions;
  const sub = parts[2];

  if (method === 'GET' && parts.length === 2) return exs.filter(e => e.status !== '待审批');
  if (method === 'GET' && sub === 'halls') return db.halls;
  if (method === 'GET' && sub === 'permanent') return exs.filter(e => e.type === 'permanent' && e.status !== '待审批');
  if (method === 'GET' && sub === 'temporary') return exs.filter(e => e.type === 'temporary' && e.status !== '待审批');
  if (method === 'GET' && sub === 'pending') return exs.filter(e => e.status === '待审批');

  // /api/exhibitions/{PERMANENT|TEMPORARY}/{id}[/approve] —— 展览审批
  if ((sub === 'PERMANENT' || sub === 'TEMPORARY' || sub === 'permanent' || sub === 'temporary') && parts.length >= 4) {
    const ex = byId(exs, parts[3]);
    if (!ex) fail('展览不存在', 404);
    if (method === 'PUT' && parts[4] === 'approve') {
      ex.status = data.passed ? '筹备中' : '已拒绝';
      ex.approveComment = data.comment || '';
      save();
      return ex;
    }
    return { ...ex, applicant: ex.applicant || '李展览' };
  }

  // /api/exhibitions/:id/collections[/:cid]
  if (parts[3] === 'collections') {
    const exId = Number(parts[2]);
    if (method === 'GET') {
      return db.exhibitionCollections
        .filter(m => m.exhibitionId === exId)
        .map(m => {
          const c = byId(db.collections, m.collectionId);
          return { ...collectionBrief(c), collectionId: m.collectionId };
        });
    }
    if (method === 'POST') {
      if (db.exhibitionCollections.some(m => m.exhibitionId === exId && m.collectionId === Number(data.collectionId))) {
        fail('该藏品已在展品列表中');
      }
      db.exhibitionCollections.push({ exhibitionId: exId, collectionId: Number(data.collectionId) });
      save();
      return true;
    }
    if (method === 'DELETE') {
      const cid = Number(parts[4]);
      db.exhibitionCollections = db.exhibitionCollections.filter(m => !(m.exhibitionId === exId && m.collectionId === cid));
      save();
      return true;
    }
  }

  if (method === 'GET' && parts.length === 3) {
    const ex = byId(exs, sub);
    if (!ex) fail('展览不存在', 404);
    return ex;
  }
  if (method === 'POST' && parts.length === 2) {
    const hall = data.hallId ? byId(db.halls, data.hallId) : null;
    const ex = {
      ...data,
      id: nid(),
      code: (data.type === 'permanent' ? 'ZL' : 'LZ') + String(db.nextId).slice(-3),
      hallName: hall ? hall.name : '',
      location: hall ? hall.name : (data.location || '待定'),
      status: '筹备中'
    };
    exs.unshift(ex); save();
    return ex;
  }
  if (method === 'PUT' && parts.length === 3) {
    const ex = byId(exs, sub);
    if (!ex) fail('展览不存在', 404);
    const hall = data.hallId ? byId(db.halls, data.hallId) : null;
    Object.assign(ex, data, { id: ex.id, hallName: hall ? hall.name : ex.hallName });
    save();
    return ex;
  }
  if (method === 'DELETE' && parts.length === 3) {
    const idx = exs.findIndex(e => String(e.id) === String(sub));
    if (idx < 0) fail('展览不存在', 404);
    exs.splice(idx, 1); save();
    return true;
  }
  fail('未知操作');
}

function appraisalView(a) {
  const c = byId(db.collections, a.collectionId);
  const expert = byId(db.users, a.expertId);
  return {
    ...a,
    collectionName: c ? c.name : '',
    collectionCode: c ? c.code : '',
    collectionType: c ? c.type : '',
    collectionLevel: c ? c.level : '',
    expertName: expert ? expert.realName : ''
  };
}

function handleAppraisals(method, parts, params, data) {
  const list = db.appraisals;
  if (method === 'GET' && parts[2] === 'pending-audit') {
    const pending = list.filter(a => a.auditStatus === '待审核').map(appraisalView);
    return paginate(pending, params);
  }
  if (method === 'POST' && parts[2] === 'assign') {
    list.unshift({
      id: nid(), collectionId: Number(data.collectionId), expertId: Number(data.expertId),
      conclusion: null, auditStatus: '待提交', createdAt: ts(0, '11:00')
    });
    save();
    return true;
  }
  if (method === 'GET' && parts.length === 2) {
    const user = currentUser();
    const mine = user && user.role === 'EXPERT' ? list.filter(a => a.expertId === user.id) : list;
    return mine.map(appraisalView);
  }
  if (method === 'GET' && parts.length === 3) {
    const a = byId(list, parts[2]);
    if (!a) fail('鉴定记录不存在', 404);
    return appraisalView(a);
  }
  if (method === 'PUT' && parts[3] === 'submit') {
    const a = byId(list, parts[2]);
    if (!a) fail('鉴定记录不存在', 404);
    Object.assign(a, data, { auditStatus: '待审核' });
    save();
    return a;
  }
  if (method === 'PUT' && parts[3] === 'audit') {
    const a = byId(list, parts[2]);
    if (!a) fail('鉴定记录不存在', 404);
    a.auditStatus = data.approved ? '已通过' : '已驳回';
    a.auditRemark = data.remark || '';
    if (data.approved) {
      const c = byId(db.collections, a.collectionId);
      if (c && a.confirmedLevel && a.confirmedLevel !== '未定级') c.level = a.confirmedLevel;
    }
    save();
    return a;
  }
  fail('未知操作');
}

function storageView(r) {
  const c = byId(db.collections, r.collectionId);
  const w = byId(db.warehouses, r.warehouseId);
  return {
    ...r,
    collectionName: c ? c.name : '',
    collectionCode: c ? c.code : '',
    collectionType: c ? c.type : '',
    warehouseName: w ? w.name : '',
    warehouseCode: w ? w.code : ''
  };
}

function handleStorageRecords(method, parts, params, data) {
  const list = db.storageRecords;
  const user = currentUser();
  const operatorName = user ? user.realName : '张库管';

  if (method === 'POST' && parts[2] === 'initial-inbound') {
    const c = byId(db.collections, data.collectionId);
    if (!c) fail('藏品不存在', 404);
    if (c.status !== '未入库') fail('该藏品不是未入库状态');
    const w = byId(db.warehouses, data.warehouseId);
    c.status = '在库';
    c.warehouse = w ? w.name : null;
    list.unshift({
      id: nid(), type: '入库', collectionId: c.id, warehouseId: Number(data.warehouseId),
      inboundDate: `${data.inboundDate}T09:00:00`, outboundDate: null,
      operatorName, remark: data.remark || '初次入库', createdAt: ts(0, '11:00')
    });
    save();
    return true;
  }
  if (method === 'POST' && parts[2] === 'outbound') {
    const req = byId(db.outboundRequests, data.outboundReqId);
    if (!req) fail('出库申请不存在', 404);
    req.registered = true;
    (req.collectionIds || []).forEach(cid => {
      const c = byId(db.collections, cid);
      if (c) {
        list.unshift({
          id: nid(), type: '出库', collectionId: c.id,
          warehouseId: db.warehouses.find(w => w.name === c.warehouse)?.id || 1,
          inboundDate: null, outboundDate: `${data.outboundDate}T09:00:00`,
          operatorName, remark: `出库申请 ${req.code}`, createdAt: ts(0, '11:00')
        });
        c.status = '展出';
        c.warehouse = null;
      }
    });
    save();
    return true;
  }
  if (method === 'POST' && parts[2] === 'inbound') {
    const req = byId(db.inboundRequests, data.inboundReqId);
    if (!req) fail('入库申请不存在', 404);
    req.registered = true;
    const w = byId(db.warehouses, req.warehouseId);
    (req.collectionIds || []).forEach(cid => {
      const c = byId(db.collections, cid);
      if (c) {
        list.unshift({
          id: nid(), type: '入库', collectionId: c.id, warehouseId: req.warehouseId,
          inboundDate: `${data.inboundDate}T09:00:00`, outboundDate: null,
          operatorName, remark: `入库申请 ${req.code}`, createdAt: ts(0, '11:00')
        });
        c.status = '在库';
        c.warehouse = w ? w.name : null;
      }
    });
    save();
    return true;
  }
  if (method === 'GET' && parts.length === 3) {
    const r = byId(list, parts[2]);
    if (!r) fail('存放记录不存在', 404);
    return storageView(r);
  }
  if (method === 'GET') {
    let result = list.map(storageView);
    if (params.keyword) result = result.filter(r => r.collectionName.includes(params.keyword) || r.collectionCode.includes(params.keyword));
    return paginate(result, params);
  }
  fail('未知操作');
}

function handleRepairRecords(method, parts, params, data) {
  const list = db.repairRecords;
  if (method === 'GET' && parts.length === 3) {
    const r = byId(list, parts[2]);
    if (!r) fail('修复记录不存在', 404);
    return r;
  }
  if (method === 'GET') {
    const user = currentUser();
    let result = user && user.role === 'EXPERT' ? list.filter(r => r.expertId === user.id) : list;
    if (params.status) result = result.filter(r => r.status === params.status);
    return result;
  }
  if (method === 'POST') {
    const r = list.find(x => String(x.repairRequestId) === String(data.repairRequestId)) || byId(list, data.repairRequestId);
    if (!r) fail('修复记录不存在', 404);
    Object.assign(r, data, { status: '已修复', finishDate: today() });
    const req = byId(db.repairRequests, r.repairRequestId);
    if (req) req.status = '已完成';
    save();
    return r;
  }
  fail('未知操作');
}

function handleDashboard(role) {
  const cols = db.collections;
  if (role === 'admin') {
    return {
      totalCollections: cols.length,
      inStock: cols.filter(c => c.status === '在库').length,
      pendingOutbound: db.outboundRequests.filter(r => r.status === '待审批').length,
      pendingInbound: db.inboundRequests.filter(r => r.status === '待审批').length,
      pendingRepair: db.repairRequests.filter(r => r.status === '待审批').length,
      pendingAppraisalAudit: db.appraisals.filter(a => a.auditStatus === '待审核').length
    };
  }
  if (role === 'keeper') {
    const isToday = (d) => d && d.startsWith(today());
    return {
      totalInWarehouse: cols.filter(c => c.status === '在库').length,
      unstoredCount: cols.filter(c => c.status === '未入库').length,
      todayInbound: db.storageRecords.filter(r => r.type === '入库' && isToday(r.inboundDate)).length,
      todayOutbound: db.storageRecords.filter(r => r.type === '出库' && isToday(r.outboundDate)).length,
      pendingTasks: db.outboundRequests.filter(r => r.status === '已通过' && !r.registered).length
        + db.inboundRequests.filter(r => r.status === '已通过' && !r.registered).length
    };
  }
  if (role === 'manager') {
    return {
      totalExhibitions: db.exhibitions.filter(e => e.status !== '待审批').length,
      ongoingExhibitions: db.exhibitions.filter(e => e.status === '展出中').length,
      myPendingOutbound: db.outboundRequests.filter(r => r.status === '待审批').length,
      myPendingInbound: db.inboundRequests.filter(r => r.status === '待审批').length,
      myPendingRepair: db.repairRequests.filter(r => r.status === '待审批').length
    };
  }
  if (role === 'expert') {
    const user = currentUser();
    const mine = user ? db.appraisals.filter(a => a.expertId === user.id) : db.appraisals;
    const myRepairs = user ? db.repairRecords.filter(r => r.expertId === user.id) : db.repairRecords;
    return {
      completedAppraisals: mine.filter(a => a.auditStatus === '已通过').length,
      pendingAppraisals: mine.filter(a => !a.conclusion).length,
      completedRepairs: myRepairs.filter(r => r.status === '已修复').length,
      pendingRepairs: myRepairs.filter(r => r.status !== '已修复').length
    };
  }
  return {};
}

function route(method, path, params, data) {
  const parts = path.split('/').filter(Boolean); // ['api', 'collections', ...]
  const resource = parts[1];

  if (resource === 'auth') {
    if (parts[2] === 'login') {
      const u = db.users.find(x => x.username === data.username);
      if (!u || data.password !== '123456') fail('账号或密码错误（演示账号密码均为 123456）');
      return { token: 'demo-token-' + u.role, ...u };
    }
    if (parts[2] === 'register') {
      if (db.users.some(x => x.username === data.username)) fail('账号已存在');
      db.users.push({ id: nid(), ...data });
      save();
      return true;
    }
  }
  if (resource === 'dashboard') return handleDashboard(parts[2]);
  if (resource === 'collections') return handleCollections(method, parts, params, data);
  if (resource === 'users' && parts[2] === 'experts') return db.users.filter(u => u.role === 'EXPERT');
  if (resource === 'warehouses') return db.warehouses;
  if (resource === 'exhibitions') return handleExhibitions(method, parts, params, data);
  if (resource === 'outbound-requests') return handleReqList('outboundRequests', method, parts, params, data, 'OUT');
  if (resource === 'inbound-requests') return handleReqList('inboundRequests', method, parts, params, data, 'IN');
  if (resource === 'repair-requests') return handleRepairRequests(method, parts, params, data);
  if (resource === 'repair-records') return handleRepairRecords(method, parts, params, data);
  if (resource === 'appraisals') return handleAppraisals(method, parts, params, data);
  if (resource === 'storage-records') return handleStorageRecords(method, parts, params, data);
  fail('接口不存在: ' + path, 404);
}

export function mockRequest(method, url, data) {
  loadDb();
  const [path, query] = url.split('?');
  const params = Object.fromEntries(new URLSearchParams(query || ''));
  return new Promise((resolve, reject) => {
    // 模拟网络延迟，让加载动画可感知
    setTimeout(() => {
      try {
        const result = route(method, path, params, data);
        if (method !== 'GET') { logOp(method, path, data); save(); }
        resolve(result);
      } catch (err) {
        const msg = (err && err.message) || '请求失败';
        alert(msg.length > 40 ? msg.slice(0, 38) + '…' : msg);
        reject(err);
      }
    }, 120 + Math.random() * 180);
  });
}
