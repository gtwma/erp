/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  ClipboardList, 
  Package, 
  GitBranch, 
  Settings, 
  Bell, 
  User,
  ChevronRight,
  Plus,
  History,
  TrendingUp,
  Box,
  Home,
  Grid,
  Search,
  HelpCircle,
  Menu,
  Trash2,
  List,
  PlusCircle,
  BarChart3,
  SearchCode
} from 'lucide-react';
import { Requirement, Plan, Subcontract, ReqStatus, PlanStatus, LineageRelation } from './types';
import { MOCK_REQUIREMENTS, MOCK_PLANS, MOCK_SUBCONTRACTS, MOCK_LINEAGE } from './constants';
import { RequirementPool } from './components/RequirementPool';
import { PlanPool } from './components/PlanPool';
import { SubcontractPool } from './components/SubcontractPool';
import { TraceView } from './components/TraceView';
import { Dashboard } from './components/Dashboard';
import { CreateRequirement } from './components/CreateRequirement';
import { RequirementAppList } from './components/RequirementAppList';
import { ViewDocument } from './components/ViewDocument';
import { SplitModal } from './components/SplitModal';
import { MergeModal } from './components/MergeModal';
import { motion, AnimatePresence } from 'motion/react';

type ViewType = 'DASHBOARD' | 'REQ_APP' | 'REQ_POOL' | 'PLAN_POOL' | 'SUB_POOL' | 'TRACE' | 'CREATE_REQ' | 'VIEW_REQ' | 'VIEW_PLAN';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewType>('DASHBOARD');
  const [requirements, setRequirements] = useState<Requirement[]>(MOCK_REQUIREMENTS);
  const [plans, setPlans] = useState<Plan[]>(MOCK_PLANS);
  const [subcontracts, setSubcontracts] = useState<Subcontract[]>(MOCK_SUBCONTRACTS);
  const [lineage, setLineage] = useState<LineageRelation[]>(MOCK_LINEAGE);

  // Split Modal State
  const [splitModalOpen, setSplitModalOpen] = useState(false);
  const [splitTargetId, setSplitTargetId] = useState<string | null>(null);
  const [splitType, setSplitType] = useState<'REQ' | 'PLAN'>('REQ');

  // Merge Modal State
  const [mergeModalOpen, setMergeModalOpen] = useState(false);
  const [mergeTargetIds, setMergeTargetIds] = useState<string[]>([]);
  const [mergeType, setMergeType] = useState<'REQ' | 'PLAN'>('REQ');

  // View Document State
  const [viewingDoc, setViewingDoc] = useState<Requirement | Plan | null>(null);

  // Stats
  const stats = useMemo(() => {
    const totalReq = requirements.length;
    const pendingReq = requirements.filter(r => r.status === ReqStatus.APPROVED).length;
    const totalPlan = plans.length;
    const totalSub = subcontracts.length;
    return { totalReq, pendingReq, totalPlan, totalSub };
  }, [requirements, plans, subcontracts]);

  // Handlers
  const handlePickToPlan = (ids: string[]) => {
    const selectedReqs = requirements.filter(r => ids.includes(r.id));
    const newPlans: Plan[] = selectedReqs.map((req, idx) => ({
      id: `PLN-${Date.now()}-${idx}`,
      reqLineId: req.id,
      materialCode: req.materialCode,
      name: req.name,
      spec: req.spec,
      qty: req.qty - req.assignedQty,
      status: PlanStatus.APPROVED,
      createdAt: new Date().toLocaleString(),
    }));

    const updatedReqs = requirements.map(req => {
      if (ids.includes(req.id)) {
        return { ...req, assignedQty: req.qty, status: ReqStatus.COMPLETED };
      }
      return req;
    });

    setRequirements(updatedReqs);
    setPlans([...plans, ...newPlans]);
    
    const newLineage: LineageRelation[] = selectedReqs.map((req, idx) => ({
      id: `L-${Date.now()}-${idx}`,
      type: 'REQ_TO_PLAN',
      sourceIds: [req.id],
      targetIds: [newPlans[idx].id],
      qty: req.qty - req.assignedQty,
      timestamp: new Date().toLocaleString(),
    }));
    setLineage([...lineage, ...newLineage]);
    
    setCurrentView('PLAN_POOL');
  };

  const handleMergeReqs = (ids: string[]) => {
    setMergeType('REQ');
    setMergeTargetIds(ids);
    setMergeModalOpen(true);
  };

  const confirmMergeReqs = () => {
    const ids = mergeTargetIds;
    const selectedReqs = requirements.filter(r => ids.includes(r.id));
    
    // Group by material properties
    const groups: Record<string, { items: Requirement[], totalQty: number }> = {};
    selectedReqs.forEach(req => {
      const key = `${req.materialCode}|${req.name}|${req.spec}|${req.unitPrice}`;
      if (!groups[key]) {
        groups[key] = { items: [], totalQty: 0 };
      }
      groups[key].items.push(req);
      groups[key].totalQty += req.qty;
    });

    const newReqs: Requirement[] = [];
    const newLineages: LineageRelation[] = [];
    const now = Date.now();

    Object.values(groups).forEach((group, idx) => {
      const first = group.items[0];
      const newReq: Requirement = {
        id: `REQ-MERGE-${now}-${idx}`,
        materialCode: first.materialCode,
        name: first.name,
        spec: first.spec,
        qty: group.totalQty,
        assignedQty: 0,
        unitPrice: first.unitPrice,
        status: ReqStatus.DRAFT,
        createdAt: new Date().toLocaleString(),
        creator: '系统合并',
      };
      newReqs.push(newReq);

      newLineages.push({
        id: `L-MERGE-${now}-${idx}`,
        type: 'REQ_MERGE',
        sourceIds: group.items.map(i => i.id),
        targetIds: [newReq.id],
        qty: group.totalQty,
        timestamp: new Date().toLocaleString(),
      });
    });

    const updatedReqs = requirements.map(req => {
      if (ids.includes(req.id)) {
        return { ...req, status: ReqStatus.MERGED };
      }
      return req;
    });

    setRequirements([...updatedReqs, ...newReqs]);
    setLineage([...lineage, ...newLineages]);
    setMergeModalOpen(false);
    setMergeTargetIds([]);
  };

  const handleSplitReq = (id: string) => {
    setSplitType('REQ');
    setSplitTargetId(id);
    setSplitModalOpen(true);
  };

  const handleSplitPlan = (id: string) => {
    setSplitType('PLAN');
    setSplitTargetId(id);
    setSplitModalOpen(true);
  };

  const handleMergePlans = (ids: string[]) => {
    setMergeType('PLAN');
    setMergeTargetIds(ids);
    setMergeModalOpen(true);
  };

  const handleViewDoc = (doc: Requirement | Plan, type: 'REQ' | 'PLAN') => {
    setViewingDoc(doc);
    setCurrentView(type === 'REQ' ? 'VIEW_REQ' : 'VIEW_PLAN');
  };

  const confirmMergePlans = () => {
    const ids = mergeTargetIds;
    const selectedPlans = plans.filter(p => ids.includes(p.id));
    
    // Group by material properties
    const groups: Record<string, { items: Plan[], totalQty: number }> = {};
    selectedPlans.forEach(plan => {
      const key = `${plan.materialCode}|${plan.name}|${plan.spec}`;
      if (!groups[key]) {
        groups[key] = { items: [], totalQty: 0 };
      }
      groups[key].items.push(plan);
      groups[key].totalQty += plan.qty;
    });

    const newPlans: Plan[] = [];
    const newLineages: LineageRelation[] = [];
    const now = Date.now();

    Object.values(groups).forEach((group, idx) => {
      const first = group.items[0];
      const newPlan: Plan = {
        id: `PLN-MERGE-${now}-${idx}`,
        reqLineId: first.reqLineId, // Note: if multiple reqLineIds, we just take the first one or handle differently
        materialCode: first.materialCode,
        name: first.name,
        spec: first.spec,
        qty: group.totalQty,
        status: PlanStatus.DRAFT,
        createdAt: new Date().toLocaleString(),
      };
      newPlans.push(newPlan);

      newLineages.push({
        id: `L-PLAN-MERGE-${now}-${idx}`,
        type: 'PLAN_MERGE',
        sourceIds: group.items.map(i => i.id),
        targetIds: [newPlan.id],
        qty: group.totalQty,
        timestamp: new Date().toLocaleString(),
      });
    });

    const updatedPlans = plans.map(p => {
      if (ids.includes(p.id)) {
        return { ...p, status: PlanStatus.MERGED };
      }
      return p;
    });

    setPlans([...updatedPlans, ...newPlans]);
    setLineage([...lineage, ...newLineages]);
    setMergeModalOpen(false);
    setMergeTargetIds([]);
  };

  const confirmSplit = (splits: number[]) => {
    if (!splitTargetId) return;

    if (splitType === 'REQ') {
      const target = requirements.find(r => r.id === splitTargetId);
      if (!target) return;

      const newReqs: Requirement[] = splits.map((qty, idx) => ({
        id: `REQ-SPLIT-${Date.now()}-${idx}`,
        materialCode: target.materialCode,
        name: target.name,
        spec: target.spec,
        qty: qty,
        assignedQty: 0,
        unitPrice: target.unitPrice,
        status: ReqStatus.DRAFT,
        createdAt: new Date().toLocaleString(),
        creator: '系统拆分',
      }));

      const updatedReqs = requirements.map(req => {
        if (req.id === splitTargetId) {
          return { ...req, status: ReqStatus.SPLIT };
        }
        return req;
      });

      setRequirements([...updatedReqs, ...newReqs]);
      
      const newLineage: LineageRelation = {
        id: `L-REQ-SPLIT-${Date.now()}`,
        type: 'REQ_SPLIT',
        sourceIds: [splitTargetId],
        targetIds: newReqs.map(r => r.id),
        qty: target.qty,
        timestamp: new Date().toLocaleString(),
      };
      setLineage([...lineage, newLineage]);
    } else {
      const target = plans.find(p => p.id === splitTargetId);
      if (!target) return;

      const newPlans: Plan[] = splits.map((qty, idx) => ({
        id: `PLN-SPLIT-${Date.now()}-${idx}`,
        reqLineId: target.reqLineId,
        materialCode: target.materialCode,
        name: target.name,
        spec: target.spec,
        qty: qty,
        status: PlanStatus.DRAFT,
        createdAt: new Date().toLocaleString(),
      }));

      const updatedPlans = plans.map(p => {
        if (p.id === splitTargetId) {
          return { ...p, status: PlanStatus.SPLIT };
        }
        return p;
      });

      setPlans([...updatedPlans, ...newPlans]);
      
      const newLineage: LineageRelation = {
        id: `L-PLAN-SPLIT-${Date.now()}`,
        type: 'PLAN_SPLIT',
        sourceIds: [splitTargetId],
        targetIds: newPlans.map(p => p.id),
        qty: target.qty,
        timestamp: new Date().toLocaleString(),
      };
      setLineage([...lineage, newLineage]);
    }
    
    setSplitModalOpen(false);
    setSplitTargetId(null);
  };

  const handleAssignPlan = (ids: string[], user: string) => {
    const updatedPlans = plans.map(p => {
      if (ids.includes(p.id)) {
        return { ...p, assignedTo: user, status: PlanStatus.ASSIGNED };
      }
      return p;
    });
    setPlans(updatedPlans);
  };

  const handleSubcontract = (ids: string[]) => {
    const newSub: Subcontract = {
      id: `SUB-${Date.now()}`,
      name: `采购包-${subcontracts.length + 1}`,
      planIds: ids,
      status: '进行中',
      createdAt: new Date().toLocaleString(),
    };

    const updatedPlans = plans.map(p => {
      if (ids.includes(p.id)) {
        return { ...p, status: PlanStatus.SUBCONTRACTED };
      }
      return p;
    });

    setPlans(updatedPlans);
    setSubcontracts([...subcontracts, newSub]);
    setCurrentView('SUB_POOL');
  };

  const handleSaveReq = (req: Requirement) => {
    setRequirements([req, ...requirements]);
    setCurrentView('REQ_APP');
  };

  return (
    <div className="flex flex-col h-screen bg-erp-bg text-erp-text-main font-sans">
      {/* Top Navigation Bar - Deep Blue */}
      <header className="h-12 bg-erp-primary flex items-center justify-between px-4 shrink-0 z-50">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white/20 rounded flex items-center justify-center">
              <Box className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold text-lg tracking-tight">数字化采购管理平台</span>
          </div>
          
          <nav className="flex items-center space-x-1">
            <TopNavItem icon={<Home className="w-4 h-4" />} active={currentView === 'DASHBOARD'} onClick={() => setCurrentView('DASHBOARD')} />
            <TopNavItem icon={<Grid className="w-4 h-4" />} />
            <div className="h-4 w-[1px] bg-white/20 mx-2" />
            <TopMenuLink label="采购需求" active={currentView === 'REQ_APP' || currentView === 'REQ_POOL' || currentView === 'CREATE_REQ'} onClick={() => setCurrentView('REQ_APP')} />
            <TopMenuLink label="采购计划" active={currentView === 'PLAN_POOL'} onClick={() => setCurrentView('PLAN_POOL')} />
            <TopMenuLink label="采购立项" active={false} />
            <TopMenuLink label="招标采购" active={false} />
            <TopMenuLink icon={<Menu className="w-4 h-4" />} />
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          <button className="bg-red-500 hover:bg-red-600 text-white text-[10px] px-2 py-1 rounded font-bold transition-colors">操作手册下载</button>
          <div className="relative">
            <Bell className="w-5 h-5 text-white/80 cursor-pointer hover:text-white" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full border-2 border-erp-primary">27</span>
          </div>
          <HelpCircle className="w-5 h-5 text-white/80 cursor-pointer hover:text-white" />
          <div className="flex items-center space-x-2 cursor-pointer group">
            <div className="w-7 h-7 rounded-full bg-white/20 border border-white/30 flex items-center justify-center overflow-hidden">
              <User className="w-4 h-4 text-white" />
            </div>
            <span className="text-white text-xs font-medium">管理员</span>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Light Gray */}
        <aside className="w-56 bg-white border-r border-erp-border flex flex-col shrink-0">
          <div className="h-10 px-4 flex items-center border-b border-erp-border bg-gray-50/50">
            <span className="text-xs font-bold text-erp-text-main">
              {currentView === 'DASHBOARD' ? '工作台' : 
               currentView === 'REQ_APP' || currentView === 'REQ_POOL' || currentView === 'CREATE_REQ' ? '采购需求' : 
               currentView === 'PLAN_POOL' ? '采购计划' : 
               currentView === 'SUB_POOL' ? '分包管理' : '血缘追溯'}
            </span>
            <Menu className="w-3 h-3 ml-auto text-erp-text-sub cursor-pointer" />
          </div>
          <nav className="flex-1 py-2">
            {currentView === 'DASHBOARD' ? (
              <SideNavItem 
                icon={<LayoutDashboard className="w-4 h-4" />} 
                label="我的桌面" 
                active={true}
              />
            ) : (currentView === 'REQ_APP' || currentView === 'REQ_POOL' || currentView === 'CREATE_REQ') ? (
              <>
                <SideNavItem 
                  icon={<FileText className="w-4 h-4" />} 
                  label="采购需求申请" 
                  active={currentView === 'REQ_APP' || currentView === 'CREATE_REQ'}
                  onClick={() => setCurrentView('REQ_APP')}
                />
                <SideNavItem 
                  icon={<ClipboardList className="w-4 h-4" />} 
                  label="需求池" 
                  active={currentView === 'REQ_POOL'}
                  onClick={() => setCurrentView('REQ_POOL')}
                />
              </>
            ) : currentView === 'PLAN_POOL' || currentView === 'SUB_POOL' ? (
              <>
                <SideNavItem 
                  icon={<ClipboardList className="w-4 h-4" />} 
                  label="采购计划申请" 
                  active={currentView === 'PLAN_POOL'}
                  onClick={() => setCurrentView('PLAN_POOL')}
                />
                <SideNavItem 
                  icon={<Package className="w-4 h-4" />} 
                  label="分包管理" 
                  active={currentView === 'SUB_POOL'}
                  onClick={() => setCurrentView('SUB_POOL')}
                />
              </>
            ) : (
              <SideNavItem 
                icon={<SearchCode className="w-4 h-4" />} 
                label="血缘追溯" 
                active={true}
              />
            )}
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0 bg-white overflow-hidden">
          {/* Content Header / Toolbar */}
          <div className="h-12 px-4 border-b border-erp-border flex items-center justify-between bg-white shrink-0">
            <div className="flex items-center space-x-2">
              {currentView === 'CREATE_REQ' && (
                <>
                  <button 
                    onClick={() => setCurrentView('REQ_APP')}
                    className="text-xs px-6 py-1.5 rounded-[2px] border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors bg-white"
                  >
                    回到第一步
                  </button>
                  <button 
                    onClick={() => setCurrentView('REQ_APP')}
                    className="text-xs px-6 py-1.5 rounded-[2px] border border-red-500 text-red-500 hover:bg-red-50 transition-colors bg-white"
                  >
                    终止流程
                  </button>
                  <button 
                    onClick={() => {
                      const btn = document.getElementById('req-submit-btn');
                      if (btn) btn.click();
                    }}
                    className="text-xs px-6 py-1.5 bg-[#2196F3] text-white rounded-[2px] hover:bg-blue-600 font-medium"
                  >
                    提交申请
                  </button>
                </>
              )}
            </div>

            {(currentView === 'REQ_APP' || currentView === 'REQ_POOL' || currentView === 'PLAN_POOL') && (
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-4 text-xs text-gray-600">
                  <label className="flex items-center space-x-1 cursor-pointer">
                    <input type="radio" name="filter" defaultChecked className="w-3 h-3 accent-[#2196F3]" />
                    <span>所有</span>
                  </label>
                  <label className="flex items-center space-x-1 cursor-pointer">
                    <input type="radio" name="filter" className="w-3 h-3 accent-[#2196F3]" />
                    <span>编辑中</span>
                  </label>
                  <label className="flex items-center space-x-1 cursor-pointer">
                    <input type="radio" name="filter" className="w-3 h-3 accent-[#2196F3]" />
                    <span>待审核</span>
                  </label>
                  <label className="flex items-center space-x-1 cursor-pointer">
                    <input type="radio" name="filter" className="w-3 h-3 accent-[#2196F3]" />
                    <span>审核通过</span>
                  </label>
                  <label className="flex items-center space-x-1 cursor-pointer">
                    <input type="radio" name="filter" className="w-3 h-3 accent-[#2196F3]" />
                    <span>审核不通过</span>
                  </label>
                </div>

                <div className="flex items-center">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="请输入采购需求内容" 
                      className="pl-9 pr-3 py-1.5 border border-gray-300 rounded-l-[2px] text-xs outline-none focus:border-[#2196F3] w-64"
                    />
                  </div>
                  <button className="bg-[#2196F3] p-1.5 rounded-r-[2px] hover:bg-blue-600 transition-colors">
                    <Search className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Table Area */}
          <div className="flex-1 overflow-auto bg-gray-50/30">
            <AnimatePresence mode="wait">
              {currentView === 'DASHBOARD' && (
                <motion.div key="dash" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <Dashboard stats={stats} />
                </motion.div>
              )}
              {currentView === 'REQ_APP' && (
                <motion.div key="req-app" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <RequirementAppList 
                    requirements={requirements} 
                    onCreateNew={() => setCurrentView('CREATE_REQ')}
                    onView={(req) => handleViewDoc(req, 'REQ')}
                  />
                </motion.div>
              )}
              {currentView === 'VIEW_REQ' && viewingDoc && (
                <motion.div key="view-req" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
                  <ViewDocument 
                    document={viewingDoc} 
                    type="REQ" 
                    lineage={lineage}
                    onClose={() => setCurrentView('REQ_APP')} 
                  />
                </motion.div>
              )}
              {currentView === 'VIEW_PLAN' && viewingDoc && (
                <motion.div key="view-plan" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
                  <ViewDocument 
                    document={viewingDoc} 
                    type="PLAN" 
                    lineage={lineage}
                    onClose={() => setCurrentView('PLAN_POOL')} 
                  />
                </motion.div>
              )}
              {currentView === 'REQ_POOL' && (
                <motion.div key="req" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <RequirementPool 
                    requirements={requirements} 
                    lineage={lineage}
                    onPickToPlan={handlePickToPlan}
                    onMerge={handleMergeReqs}
                    onSplit={handleSplitReq}
                    onView={(req) => handleViewDoc(req, 'REQ')}
                  />
                </motion.div>
              )}
              {currentView === 'CREATE_REQ' && (
                <motion.div key="create-req" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                  <CreateRequirement onClose={() => setCurrentView('REQ_APP')} onSave={handleSaveReq} />
                </motion.div>
              )}
              {currentView === 'PLAN_POOL' && (
                <motion.div key="plan" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <PlanPool 
                    plans={plans} 
                    lineage={lineage}
                    onAssign={handleAssignPlan}
                    onSubcontract={handleSubcontract}
                    onMerge={handleMergePlans}
                    onSplit={handleSplitPlan}
                    onView={(plan) => handleViewDoc(plan, 'PLAN')}
                  />
                </motion.div>
              )}
              {currentView === 'SUB_POOL' && (
                <motion.div key="sub" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <SubcontractPool 
                    subcontracts={subcontracts} 
                    onBack={() => setCurrentView('PLAN_POOL')} 
                  />
                </motion.div>
              )}
              {currentView === 'TRACE' && (
                <motion.div key="trace" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <TraceView 
                    lineage={lineage}
                    requirements={requirements}
                    plans={plans}
                    subcontracts={subcontracts}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Pagination Footer */}
          {(currentView === 'REQ_APP' || currentView === 'REQ_POOL' || currentView === 'PLAN_POOL' || currentView === 'SUB_POOL') && (
            <footer className="h-10 px-4 border-t border-erp-border flex items-center justify-end space-x-2 bg-white shrink-0">
              <button className="p-1 border border-erp-border rounded text-erp-text-sub hover:bg-gray-50"><ChevronRight className="w-3 h-3 rotate-180" /></button>
              <button className="px-2 py-0.5 border border-erp-secondary bg-erp-secondary text-white text-xs rounded">1</button>
              <button className="px-2 py-0.5 border border-erp-border text-erp-text-sub text-xs rounded hover:bg-gray-50">2</button>
              <button className="p-1 border border-erp-border rounded text-erp-text-sub hover:bg-gray-50"><ChevronRight className="w-3 h-3" /></button>
              <span className="text-xs text-erp-text-sub ml-4">跳至</span>
              <input type="text" defaultValue="1" className="w-8 h-6 border border-erp-border text-center text-xs rounded" />
              <span className="text-xs text-erp-text-sub">页 共19条</span>
            </footer>
          )}
        </main>
      </div>

      {/* Modals */}
      <SplitModal 
        isOpen={splitModalOpen}
        onClose={() => setSplitModalOpen(false)}
        onConfirm={confirmSplit}
        target={splitType === 'REQ' ? requirements.find(r => r.id === splitTargetId) || null : plans.find(p => p.id === splitTargetId) || null}
        lineage={lineage}
        sourceInfo={
          splitType === 'PLAN' && splitTargetId 
            ? `源自需求: ${plans.find(p => p.id === splitTargetId)?.reqLineId}` 
            : undefined
        }
      />

      <MergeModal
        isOpen={mergeModalOpen}
        onClose={() => setMergeModalOpen(false)}
        onConfirm={mergeType === 'REQ' ? confirmMergeReqs : confirmMergePlans}
        type={mergeType}
        lineage={lineage}
        sources={
          mergeType === 'REQ' 
            ? requirements.filter(r => mergeTargetIds.includes(r.id))
            : plans.filter(p => mergeTargetIds.includes(p.id))
        }
      />
    </div>
  );
}

// Sub-components
function TopNavItem({ icon, active, onClick }: { icon: React.ReactNode, active?: boolean, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`p-2 rounded transition-colors ${active ? 'bg-white/20 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
    >
      {icon}
    </button>
  );
}

function TopMenuLink({ label, icon, active, onClick }: { label?: string, icon?: React.ReactNode, active?: boolean, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap rounded ${active ? 'bg-white/20 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
    >
      {label || icon}
    </button>
  );
}

function SideNavItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) {
  return (
    <div 
      onClick={onClick}
      className={`flex items-center space-x-2 px-4 py-2 cursor-pointer transition-colors ${active ? 'text-erp-secondary border-r-2 border-erp-secondary bg-erp-secondary/5' : 'text-erp-text-sub hover:bg-gray-50'}`}
    >
      <div className={active ? 'text-erp-secondary' : 'text-erp-text-sub'}>{icon}</div>
      <span className="text-xs font-medium">{label}</span>
    </div>
  );
}
