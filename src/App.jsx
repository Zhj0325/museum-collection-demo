import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { RequireAuth } from './context/AuthContext';
import { useAuth, getRoleHome } from './context/auth';
import { isDemoMode, getOpLogs, resetDemoDb } from './api/mock';
import LoginPage from './pages/login/LoginPage';
import AdminHome from './pages/admin/AdminHome';
import CollectionList from './pages/admin/CollectionList';
import CollectionForm from './pages/admin/CollectionForm';
import ApprovalList from './pages/admin/ApprovalList';
import ApprovalDetail from './pages/admin/ApprovalDetail';
import AppraisalAssign from './pages/admin/AppraisalAssign';
import AppraisalAudit from './pages/admin/AppraisalAudit';
import RepairAssign from './pages/admin/RepairAssign';
import KeeperHome from './pages/keeper/KeeperHome';
import InitialStorage from './pages/keeper/InitialStorage';
import StorageForm from './pages/keeper/StorageForm';
import StorageRecords from './pages/keeper/StorageRecords';
import StorageRecordDetail from './pages/keeper/StorageRecordDetail';
import CollectionBrowse from './pages/keeper/CollectionBrowse';
import CollectionDetail from './pages/keeper/CollectionDetail';
import ManagerHome from './pages/manager/ManagerHome';
import ExhibitionList from './pages/manager/ExhibitionList';
import ExhibitionForm from './pages/manager/ExhibitionForm';
import ExhibitionCollections from './pages/manager/ExhibitionCollections';
import OutboundForm from './pages/manager/OutboundForm';
import InboundForm from './pages/manager/InboundForm';
import RepairForm from './pages/manager/RepairForm';
import ExpertHome from './pages/expert/ExpertHome';
import AppraisalList from './pages/expert/AppraisalList';
import AppraisalSubmit from './pages/expert/AppraisalSubmit';
import AppraisalDetail from './pages/expert/AppraisalDetail';
import RepairList from './pages/expert/RepairList';
import RepairSubmit from './pages/expert/RepairSubmit';

function HomeRedirect() {
  const { userInfo } = useAuth();
  if (userInfo) {
    return <Navigate to={getRoleHome(userInfo.role)} replace />;
  }
  return <Navigate to="/login" replace />;
}

function DemoRibbon() {
  const [open, setOpen] = useState(false);
  const [logs, setLogs] = useState([]);
  if (!isDemoMode()) return null;

  const show = () => { setLogs([...getOpLogs()]); setOpen(true); };
  const reset = () => {
    if (!window.confirm('确定要重置演示数据吗？所有操作记录将清空并恢复初始数据。')) return;
    resetDemoDb();
    window.location.reload();
  };

  return (
    <>
      <button className="demo-ribbon" onClick={show} title="点击查看操作日志">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
        演示模式 · 操作已记录保留（点击查看）
      </button>
      {open && (
        <>
          <div className="modal-mask" onClick={() => setOpen(false)} />
          <div className="modal-box" style={{ position: 'fixed', top: '10%', left: '50%', transform: 'translateX(-50%)', zIndex: 1001, width: 'min(92vw, 520px)' }}>
            <div className="modal-title">操作日志（{logs.length} 条，保存在本浏览器）</div>
            <div style={{ maxHeight: '50vh', overflowY: 'auto' }}>
              {logs.length === 0 && <div className="empty-state" style={{ padding: 24 }}><div className="empty-state-text">暂无操作记录，去各工作台试试增删改与审批吧</div></div>}
              {logs.map((l, i) => (
                <div key={i} className="detail-row">
                  <span className="detail-label" style={{ width: 150 }}>{l.time}</span>
                  <span className="detail-value">{l.user} · {l.action}</span>
                </div>
              ))}
            </div>
            <div className="modal-actions">
              <button className="btn btn-danger btn-sm" onClick={reset}>重置演示数据</button>
              <button className="btn btn-default btn-sm" onClick={() => setOpen(false)}>关闭</button>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default function App() {
  return (
    <>
      <DemoRibbon />
      <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Admin */}
      <Route path="/admin/home" element={<RequireAuth role="ADMIN"><AdminHome /></RequireAuth>} />
      <Route path="/admin/collection-list" element={<RequireAuth role="ADMIN"><CollectionList /></RequireAuth>} />
      <Route path="/admin/collection-form" element={<RequireAuth role="ADMIN"><CollectionForm /></RequireAuth>} />
      <Route path="/admin/approval-list" element={<RequireAuth role="ADMIN"><ApprovalList /></RequireAuth>} />
      <Route path="/admin/approval-detail" element={<RequireAuth role="ADMIN"><ApprovalDetail /></RequireAuth>} />
      <Route path="/admin/appraisal-assign" element={<RequireAuth role="ADMIN"><AppraisalAssign /></RequireAuth>} />
      <Route path="/admin/appraisal-audit" element={<RequireAuth role="ADMIN"><AppraisalAudit /></RequireAuth>} />
      <Route path="/admin/repair-assign" element={<RequireAuth role="ADMIN"><RepairAssign /></RequireAuth>} />

      {/* Keeper */}
      <Route path="/keeper/home" element={<RequireAuth role="STORAGE_KEEPER"><KeeperHome /></RequireAuth>} />
      <Route path="/keeper/initial-storage" element={<RequireAuth role="STORAGE_KEEPER"><InitialStorage /></RequireAuth>} />
      <Route path="/keeper/storage-form" element={<RequireAuth role="STORAGE_KEEPER"><StorageForm /></RequireAuth>} />
      <Route path="/keeper/storage-records" element={<RequireAuth role="STORAGE_KEEPER"><StorageRecords /></RequireAuth>} />
      <Route path="/keeper/storage-record-detail" element={<RequireAuth role="STORAGE_KEEPER"><StorageRecordDetail /></RequireAuth>} />
      <Route path="/keeper/collection-browse" element={<RequireAuth role="STORAGE_KEEPER"><CollectionBrowse /></RequireAuth>} />
      <Route path="/keeper/collection-detail" element={<RequireAuth role="STORAGE_KEEPER"><CollectionDetail /></RequireAuth>} />

      {/* Manager */}
      <Route path="/manager/home" element={<RequireAuth role="EXHIBITION_MANAGER"><ManagerHome /></RequireAuth>} />
      <Route path="/manager/exhibition-list" element={<RequireAuth role="EXHIBITION_MANAGER"><ExhibitionList /></RequireAuth>} />
      <Route path="/manager/exhibition-form" element={<RequireAuth role="EXHIBITION_MANAGER"><ExhibitionForm /></RequireAuth>} />
      <Route path="/manager/exhibition-collections" element={<RequireAuth role="EXHIBITION_MANAGER"><ExhibitionCollections /></RequireAuth>} />
      <Route path="/manager/outbound-form" element={<RequireAuth role="EXHIBITION_MANAGER"><OutboundForm /></RequireAuth>} />
      <Route path="/manager/inbound-form" element={<RequireAuth role="EXHIBITION_MANAGER"><InboundForm /></RequireAuth>} />
      <Route path="/manager/repair-form" element={<RequireAuth role="EXHIBITION_MANAGER"><RepairForm /></RequireAuth>} />

      {/* Expert */}
      <Route path="/expert/home" element={<RequireAuth role="EXPERT"><ExpertHome /></RequireAuth>} />
      <Route path="/expert/collection-browse" element={<RequireAuth role="EXPERT"><CollectionBrowse /></RequireAuth>} />
      <Route path="/expert/collection-detail" element={<RequireAuth role="EXPERT"><CollectionDetail /></RequireAuth>} />
      <Route path="/expert/appraisal-list" element={<RequireAuth role="EXPERT"><AppraisalList /></RequireAuth>} />
      <Route path="/expert/appraisal-submit" element={<RequireAuth role="EXPERT"><AppraisalSubmit /></RequireAuth>} />
      <Route path="/expert/appraisal-detail" element={<RequireAuth role="EXPERT"><AppraisalDetail /></RequireAuth>} />
      <Route path="/expert/repair-list" element={<RequireAuth role="EXPERT"><RepairList /></RequireAuth>} />
      <Route path="/expert/repair-submit" element={<RequireAuth role="EXPERT"><RepairSubmit /></RequireAuth>} />
      </Routes>
    </>
  );
}
