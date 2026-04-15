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
  SearchCode,
  RefreshCw,
  XCircle
} from 'lucide-react';
import { Requirement, Plan, Subcontract, AuditStatus, ReqProcessStatus, PlanProcessStatus, LineageRelation, ProjectApproval, LineItem } from './types';
import { MOCK_REQUIREMENTS, MOCK_PLANS, MOCK_SUBCONTRACTS, MOCK_LINEAGE, MOCK_PROJECTS } from './constants';
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
import { SubcontractModal } from './components/SubcontractModal';
import { ProjectApprovalPool } from './components/ProjectApprovalPool';
import { CreateProjectApproval } from './components/CreateProjectApproval';
import { PickRequirementModal } from './components/PickRequirementModal';
import { AssignModal } from './components/AssignModal';
import { PickApprovedModal } from './components/PickApprovedModal';
import { motion, AnimatePresence } from 'motion/react';

type ViewType = 'DASHBOARD' | 'REQ_APP' | 'REQ_POOL' | 'PLAN_POOL' | 'SUB_POOL' | 'TRACE' | 'CREATE_REQ' | 'VIEW_REQ' | 'VIEW_PLAN' | 'VIEW_SUB' | 'PROJECT_APP' | 'CREATE_PROJECT' | 'REQ_CHANGE' | 'PLAN_CHANGE' | 'REQ_TERMINATE' | 'PLAN_TERMINATE';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewType>('DASHBOARD');
  const [requirements, setRequirements] = useState<Requirement[]>(MOCK_REQUIREMENTS);
  const [plans, setPlans] = useState<Plan[]>(MOCK_PLANS);
  const [subcontracts, setSubcontracts] = useState<Subcontract[]>(MOCK_SUBCONTRACTS);
  const [projects, setProjects] = useState<ProjectApproval[]>(MOCK_PROJECTS);
  const [lineage, setLineage] = useState<LineageRelation[]>(MOCK_LINEAGE);

  // Split Modal State
  const [splitModalOpen, setSplitModalOpen] = useState(false);
  const [splitTargetId, setSplitTargetId] = useState<string | null>(null);
  const [splitType, setSplitType] = useState<'REQ' | 'PLAN'>('REQ');

  // Merge Modal State
  const [mergeModalOpen, setMergeModalOpen] = useState(false);
  const [mergeTargetIds, setMergeTargetIds] = useState<string[]>([]);
  const [mergeType, setMergeType] = useState<'REQ' | 'PLAN'>('REQ');

  // Subcontract Modal State
  const [subcontractModalOpen, setSubcontractModalOpen] = useState(false);
  const [subcontractTargetPlans, setSubcontractTargetPlans] = useState<Plan[]>([]);

  // Pick Requirement Modal State
  const [pickReqModalOpen, setPickReqModalOpen] = useState(false);
  const [pickReqTargetId, setPickReqTargetId] = useState<string | undefined>(undefined);

  // Assign Modal State
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignTargetIds, setAssignTargetIds] = useState<string[]>([]);

  // Pick Approved Modal State
  const [pickApprovedModalOpen, setPickApprovedModalOpen] = useState(false);
  const [pickApprovedType, setPickApprovedType] = useState<'REQ' | 'PLAN'>('REQ');
  const [pickApprovedAction, setPickApprovedAction] = useState<'CHANGE' | 'TERMINATE'>('CHANGE');

  // View Document State
  const [viewingDoc, setViewingDoc] = useState<Requirement | Plan | null>(null);

  // Stats
  const stats = useMemo(() => {
    const totalReq = requirements.length;
    const pendingReq = requirements.filter(r => r.auditStatus === AuditStatus.APPROVED).length;
    const totalPlan = plans.length;
    const totalSub = subcontracts.length;
    const totalProject = projects.length;
    return { totalReq, pendingReq, totalPlan, totalSub, totalProject };
  }, [requirements, plans, subcontracts, projects]);

  // Handlers
  const [selectedSubsForProject, setSelectedSubsForProject] = useState<Subcontract[]>([]);

  const handlePickToPlan = (ids: string[], targetPlanId?: string) => {
    const selectedReqs = requirements.filter(r => ids.includes(r.id));
    if (selectedReqs.length === 0) return;

    const now = Date.now();
    const totalQty = selectedReqs.reduce((sum, r) => sum + (r.qty - r.assignedQty), 0);
    
    // Aggregate all items from all selected requirements
    const newItems: any[] = [];
    selectedReqs.forEach(req => {
      if (req.items && req.items.length > 0) {
        req.items.forEach(item => {
          newItems.push({
            ...item,
            id: `PLN-LI-${now}-${item.id}`
          });
        });
      } else {
        newItems.push({
          id: `PLN-LI-${now}-${req.id}`,
          materialCode: req.materialCode,
          materialName: req.name,
          spec: req.spec,
          unit: '个',
          qty: req.qty - req.assignedQty,
          unitPrice: req.unitPrice
        });
      }
    });

    if (targetPlanId) {
      setPlans(plans.map(p => {
        if (p.id === targetPlanId) {
          const updatedPlan = {
            ...p,
            qty: p.qty + totalQty,
            items: [...(p.items || []), ...newItems]
          };
          if (viewingDoc && viewingDoc.id === targetPlanId) {
            setViewingDoc(updatedPlan);
          }
          return updatedPlan;
        }
        return p;
      }));
    } else {
      const newPlan: Plan = {
        id: `PLN-${now}`,
        reqLineId: selectedReqs[0].id,
        materialCode: selectedReqs.length === 1 ? selectedReqs[0].materialCode : 'MULTIPLE',
        name: `采购计划汇总`,
        spec: selectedReqs.length === 1 ? selectedReqs[0].spec : '混合规格',
        qty: totalQty,
        auditStatus: AuditStatus.APPROVED,
        processStatus: PlanProcessStatus.NORMAL,
        createdAt: new Date().toLocaleString(),
        items: newItems
      };
      setPlans(prev => [...prev, newPlan]);
    }

    const updatedReqs = requirements.map(req => {
      if (ids.includes(req.id)) {
        return { ...req, assignedQty: req.qty, processStatus: ReqProcessStatus.COMPLETED };
      }
      return req;
    });

    setRequirements(updatedReqs);
    
    const newLineage: LineageRelation = {
      id: `L-${now}`,
      type: 'REQ_TO_PLAN',
      sourceIds: ids,
      targetIds: [targetPlanId || `PLN-${now}`],
      qty: totalQty,
      timestamp: new Date().toLocaleString(),
    };
    setLineage([...lineage, newLineage]);
    
    if (!targetPlanId) {
      setCurrentView('PLAN_POOL');
    }
  };

  const handleCreateEmptyPlan = () => {
    const now = Date.now();
    const newPlan: Plan = {
      id: `PLN-${now}`,
      reqLineId: 'MANUAL',
      materialCode: 'PENDING',
      name: '新建采购计划',
      spec: '待完善',
      qty: 0,
      auditStatus: AuditStatus.DRAFT,
      processStatus: PlanProcessStatus.NORMAL,
      createdAt: new Date().toLocaleString(),
      items: []
    };
    setPlans(prev => [...prev, newPlan]);
    setViewingDoc(newPlan as any);
    setCurrentView('VIEW_PLAN');
  };

  const handleMergeReqs = (ids: string[]) => {
    setMergeType('REQ');
    setMergeTargetIds(ids);
    setMergeModalOpen(true);
  };

  const confirmMergeReqs = () => {
    const ids = mergeTargetIds;
    const selectedReqs = requirements.filter(r => ids.includes(r.id));
    if (selectedReqs.length === 0) return;

    const now = Date.now();
    const totalQty = selectedReqs.reduce((sum, r) => sum + r.qty, 0);
    const totalPrice = selectedReqs.reduce((sum, r) => sum + r.qty * r.unitPrice, 0);
    const first = selectedReqs[0];

    // Aggregate all items from selected requirements
    const allItems: LineItem[] = [];
    selectedReqs.forEach(req => {
      if (req.items && req.items.length > 0) {
        allItems.push(...req.items);
      } else {
        allItems.push({
          id: `LI-FALLBACK-${req.id}`,
          materialCode: req.materialCode,
          materialName: req.name,
          spec: req.spec,
          unit: '个',
          qty: req.qty,
          unitPrice: req.unitPrice
        });
      }
    });

    // Group by material properties for line items
    const itemGroups: Record<string, { materialCode: string, materialName: string, spec: string, unit: string, totalQty: number, unitPrice: number }> = {};
    allItems.forEach(item => {
      const key = `${item.materialCode}|${item.materialName}|${item.spec}|${item.unitPrice}`;
      if (!itemGroups[key]) {
        itemGroups[key] = { 
          materialCode: item.materialCode, 
          materialName: item.materialName, 
          spec: item.spec, 
          unit: item.unit,
          totalQty: 0, 
          unitPrice: item.unitPrice 
        };
      }
      itemGroups[key].totalQty += item.qty;
    });

    const newItems = Object.values(itemGroups).map((g, idx) => ({
      id: `LI-${now}-${idx}`,
      materialCode: g.materialCode,
      materialName: g.materialName,
      spec: g.spec,
      unit: g.unit,
      qty: g.totalQty,
      unitPrice: g.unitPrice
    }));

    const newReq: Requirement = {
      id: `REQ-MERGE-${now}`,
      materialCode: newItems.length === 1 ? newItems[0].materialCode : 'MULTIPLE',
      name: newItems.length === 1 ? newItems[0].materialName : `采购申请汇总`,
      spec: newItems.length === 1 ? newItems[0].spec : '混合规格',
      qty: totalQty,
      assignedQty: 0,
      unitPrice: totalQty > 0 ? totalPrice / totalQty : 0,
      auditStatus: AuditStatus.APPROVED,
      processStatus: ReqProcessStatus.NORMAL,
      createdAt: new Date().toLocaleString(),
      creator: '系统合并',
      items: newItems
    };

    const newLineage: LineageRelation = {
      id: `L-MERGE-${now}`,
      type: 'REQ_MERGE',
      sourceIds: selectedReqs.map(i => i.id),
      targetIds: [newReq.id],
      qty: totalQty,
      timestamp: new Date().toLocaleString(),
    };

    const updatedReqs = requirements.map(req => {
      if (ids.includes(req.id)) {
        return { ...req, processStatus: ReqProcessStatus.MERGED };
      }
      return req;
    });

    setRequirements([...updatedReqs, newReq]);
    setLineage([...lineage, newLineage]);
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

  const handleViewDoc = (doc: Requirement | Plan | Subcontract | ProjectApproval, type: 'REQ' | 'PLAN' | 'SUB' | 'PROJECT') => {
    setViewingDoc(doc as any);
    if (type === 'REQ') setCurrentView('VIEW_REQ');
    else if (type === 'PLAN') setCurrentView('VIEW_PLAN');
    else if (type === 'PROJECT') setCurrentView('VIEW_PROJECT');
    else setCurrentView('VIEW_SUB');
  };

  const confirmMergePlans = () => {
    const ids = mergeTargetIds;
    const selectedPlans = plans.filter(p => ids.includes(p.id));
    if (selectedPlans.length === 0) return;

    const now = Date.now();
    const totalQty = selectedPlans.reduce((sum, p) => sum + p.qty, 0);
    const first = selectedPlans[0];

    // Aggregate all items from selected plans
    const allItems: LineItem[] = [];
    selectedPlans.forEach(p => {
      if (p.items && p.items.length > 0) {
        allItems.push(...p.items);
      } else {
        allItems.push({
          id: `LI-FALLBACK-${p.id}`,
          materialCode: p.materialCode,
          materialName: p.name,
          spec: p.spec,
          unit: '个',
          qty: p.qty,
          unitPrice: 0
        });
      }
    });

    // Group by material properties for line items
    const itemGroups: Record<string, { materialCode: string, materialName: string, spec: string, unit: string, totalQty: number, unitPrice: number }> = {};
    allItems.forEach(item => {
      const key = `${item.materialCode}|${item.materialName}|${item.spec}`;
      if (!itemGroups[key]) {
        itemGroups[key] = { 
          materialCode: item.materialCode, 
          materialName: item.materialName, 
          spec: item.spec, 
          unit: item.unit,
          totalQty: 0,
          unitPrice: item.unitPrice
        };
      }
      itemGroups[key].totalQty += item.qty;
    });

    const newItems = Object.values(itemGroups).map((g, idx) => ({
      id: `LI-${now}-${idx}`,
      materialCode: g.materialCode,
      materialName: g.materialName,
      spec: g.spec,
      unit: g.unit,
      qty: g.totalQty,
      unitPrice: g.unitPrice
    }));

    const newPlan: Plan = {
      id: `PLN-MERGE-${now}`,
      reqLineId: first.reqLineId,
      materialCode: newItems.length === 1 ? newItems[0].materialCode : 'MULTIPLE',
      name: newItems.length === 1 ? newItems[0].materialName : `[合并汇总] ${first.name} 等 ${selectedPlans.length} 项`,
      spec: newItems.length === 1 ? newItems[0].spec : '混合规格',
      qty: totalQty,
      auditStatus: AuditStatus.APPROVED,
      processStatus: PlanProcessStatus.NORMAL,
      createdAt: new Date().toLocaleString(),
      items: newItems
    };

    const newLineage: LineageRelation = {
      id: `L-PLAN-MERGE-${now}`,
      type: 'PLAN_MERGE',
      sourceIds: selectedPlans.map(i => i.id),
      targetIds: [newPlan.id],
      qty: totalQty,
      timestamp: new Date().toLocaleString(),
    };

    const updatedPlans = plans.map(p => {
      if (ids.includes(p.id)) {
        return { ...p, processStatus: PlanProcessStatus.MERGED };
      }
      return p;
    });

    setPlans([...updatedPlans, newPlan]);
    setLineage([...lineage, newLineage]);
    setMergeModalOpen(false);
    setMergeTargetIds([]);
  };

  const confirmSplit = (itemSplits: Record<string, number[]>) => {
    if (!splitTargetId) return;
    const now = Date.now();

    if (splitType === 'REQ') {
      const target = requirements.find(r => r.id === splitTargetId);
      if (!target) return;

      // itemSplits[itemId] = [remainingQty, extractedQty]
      const remainingItems: any[] = [];
      const extractedItems: any[] = [];

      const items = target.items && target.items.length > 0 
        ? target.items 
        : [{ id: 'DEFAULT', materialName: target.name, materialCode: target.materialCode, spec: target.spec, qty: target.qty, unit: '个', unitPrice: target.unitPrice }];

      items.forEach(item => {
        const [remain, extract] = itemSplits[item.id] || [item.qty, 0];
        if (remain > 0) {
          remainingItems.push({ ...item, qty: remain });
        }
        if (extract > 0) {
          extractedItems.push({ ...item, id: `LI-EXTRACT-${now}-${item.id}`, qty: extract });
        }
      });

      const updatedTarget: Requirement = {
        ...target,
        qty: remainingItems.reduce((sum, i) => sum + i.qty, 0),
        items: remainingItems.length > 0 ? remainingItems : target.items, // Keep original items if fully split for display
        processStatus: remainingItems.length > 0 ? target.processStatus : ReqProcessStatus.SPLIT
      };

      const newReq: Requirement | null = extractedItems.length > 0 ? {
        id: `REQ-SPLIT-${now}`,
        materialCode: extractedItems.length === 1 ? extractedItems[0].materialCode : 'MULTIPLE',
        name: `采购申请拆分`,
        spec: extractedItems.length === 1 ? extractedItems[0].spec : '混合规格',
        qty: extractedItems.reduce((sum, i) => sum + i.qty, 0),
        assignedQty: 0,
        unitPrice: target.unitPrice,
        auditStatus: AuditStatus.DRAFT,
        processStatus: ReqProcessStatus.NORMAL,
        createdAt: new Date().toLocaleString(),
        creator: '系统拆分',
        items: extractedItems
      } : null;

      const updatedReqs = requirements.map(req => req.id === splitTargetId ? updatedTarget : req);
      setRequirements(newReq ? [...updatedReqs, newReq] : updatedReqs);
      
      if (newReq) {
        const newLineage: LineageRelation = {
          id: `L-REQ-SPLIT-${now}`,
          type: 'REQ_SPLIT',
          sourceIds: [splitTargetId],
          targetIds: [newReq.id],
          qty: newReq.qty,
          timestamp: new Date().toLocaleString(),
        };
        setLineage([...lineage, newLineage]);
      }
    } else {
      const target = plans.find(p => p.id === splitTargetId);
      if (!target) return;

      const remainingItems: any[] = [];
      const extractedItems: any[] = [];

      const items = target.items && target.items.length > 0 
        ? target.items 
        : [{ id: 'DEFAULT', materialName: target.name, materialCode: target.materialCode, spec: target.spec, qty: target.qty, unit: '个', unitPrice: 0 }];

      items.forEach(item => {
        const [remain, extract] = itemSplits[item.id] || [item.qty, 0];
        if (remain > 0) {
          remainingItems.push({ ...item, qty: remain });
        }
        if (extract > 0) {
          extractedItems.push({ ...item, id: `LI-EXTRACT-${now}-${item.id}`, qty: extract });
        }
      });

      const updatedTarget: Plan = {
        ...target,
        qty: remainingItems.reduce((sum, i) => sum + i.qty, 0),
        items: remainingItems,
        processStatus: remainingItems.length > 0 ? target.processStatus : PlanProcessStatus.SPLIT
      };

      const newPlan: Plan | null = extractedItems.length > 0 ? {
        id: `PLN-SPLIT-${now}`,
        reqLineId: target.reqLineId,
        materialCode: extractedItems.length === 1 ? extractedItems[0].materialCode : 'MULTIPLE',
        name: extractedItems.length === 1 ? extractedItems[0].materialName : `[拆分] ${target.name}`,
        spec: extractedItems.length === 1 ? extractedItems[0].spec : '混合规格',
        qty: extractedItems.reduce((sum, i) => sum + i.qty, 0),
        auditStatus: target.auditStatus === AuditStatus.APPROVED ? AuditStatus.APPROVED : AuditStatus.DRAFT,
        processStatus: PlanProcessStatus.NORMAL,
        createdAt: new Date().toLocaleString(),
        items: extractedItems
      } : null;

      const updatedPlans = plans.map(p => p.id === splitTargetId ? updatedTarget : p);
      setPlans(newPlan ? [...updatedPlans, newPlan] : updatedPlans);
      
      if (newPlan) {
        const newLineage: LineageRelation = {
          id: `L-PLAN-SPLIT-${now}`,
          type: 'PLAN_SPLIT',
          sourceIds: [splitTargetId],
          targetIds: [newPlan.id],
          qty: newPlan.qty,
          timestamp: new Date().toLocaleString(),
        };
        setLineage([...lineage, newLineage]);
      }
    }
    
    setSplitModalOpen(false);
    setSplitTargetId(null);
  };

  const handleAssignPlan = (ids: string[]) => {
    setAssignTargetIds(ids);
    setAssignModalOpen(true);
  };

  const confirmAssign = (user: string, dept: string) => {
    const updatedPlans = plans.map(p => {
      if (assignTargetIds.includes(p.id)) {
        return { 
          ...p, 
          assignedTo: user, 
          processStatus: PlanProcessStatus.ASSIGNED,
          procurementManager: user,
          procurementDept: dept
        };
      }
      return p;
    });
    setPlans(updatedPlans);
    setAssignModalOpen(false);
    setAssignTargetIds([]);
    setCurrentView('PLAN_POOL');
  };

  const handleSubcontract = (ids: string[]) => {
    if (ids.length !== 1) return;
    const selected = plans.filter(p => ids.includes(p.id));
    setSubcontractTargetPlans(selected);
    setSubcontractModalOpen(true);
  };

  const confirmSubcontract = (name: string, selectedItems: { id: string, qty: number }[]) => {
    const now = Date.now();
    const subcontractItems: any[] = [];
    const itemIds = selectedItems.map(i => i.id);
    const itemQtyMap = selectedItems.reduce((acc, curr) => {
      acc[curr.id] = curr.qty;
      return acc;
    }, {} as Record<string, number>);

    const updatedPlans = plans.map(plan => {
      if (!plan.items) return plan;
      
      const itemsInThisPlan = plan.items.filter(item => itemIds.includes(item.id));
      if (itemsInThisPlan.length === 0) return plan;

      const newItems = plan.items.map(item => {
        if (itemIds.includes(item.id)) {
          const extractQty = itemQtyMap[item.id];
          subcontractItems.push({ ...item, qty: extractQty, sourcePlanId: plan.id });
          return { ...item, qty: item.qty - extractQty };
        }
        return item;
      }).filter(item => item.qty > 0);

      return {
        ...plan,
        items: newItems,
        qty: newItems.reduce((sum, i) => sum + i.qty, 0),
        processStatus: newItems.length === 0 ? PlanProcessStatus.SUBCONTRACTED : plan.processStatus
      };
    });

    const newSub: Subcontract = {
      id: `SUB-${now}`,
      name: name,
      planIds: Array.from(new Set(subcontractTargetPlans.map(p => p.id))),
      status: '审核通过',
      createdAt: new Date().toLocaleString(),
      items: subcontractItems
    };

    setSubcontracts([...subcontracts, newSub]);
    setPlans(updatedPlans);
    setSubcontractModalOpen(false);
    setSubcontractTargetPlans([]);
    setCurrentView('SUB_POOL');

    // Lineage
    const newLineage: LineageRelation = {
      id: `L-SUB-${now}`,
      type: 'PLAN_TO_SUB' as any,
      sourceIds: subcontractTargetPlans.map(p => p.id),
      targetIds: [newSub.id],
      qty: subcontractItems.reduce((sum, i) => sum + i.qty, 0),
      timestamp: new Date().toLocaleString(),
    };
    setLineage([...lineage, newLineage]);
  };

  const handleDeleteSubcontract = (id: string) => {
    const sub = subcontracts.find(s => s.id === id);
    if (!sub) return;

    const subItems = sub.items || [];
    
    // Restore quantities to plans
    const updatedPlans = plans.map(plan => {
      if (!sub.planIds.includes(plan.id)) return plan;

      const itemsToReturn = subItems.filter(item => item.sourcePlanId === plan.id);
      if (itemsToReturn.length === 0) return plan;

      let newItems = [...(plan.items || [])];
      
      itemsToReturn.forEach(itemToReturn => {
        const existingItem = newItems.find(i => i.id === itemToReturn.id);
        if (existingItem) {
          existingItem.qty += itemToReturn.qty;
        } else {
          // If item was fully removed, add it back
          newItems.push({ ...itemToReturn });
        }
      });

      return {
        ...plan,
        items: newItems,
        qty: newItems.reduce((sum, i) => sum + i.qty, 0),
        processStatus: plan.processStatus === PlanProcessStatus.SUBCONTRACTED ? PlanProcessStatus.NORMAL : plan.processStatus
      };
    });

    setPlans(updatedPlans);
    setSubcontracts(subcontracts.filter(s => s.id !== id));
  };

  const handleCreateProjectFromSub = (subs: Subcontract[]) => {
    setSelectedSubsForProject(subs);
    setCurrentView('CREATE_PROJECT');
  };

  const handleSaveReq = (req: Requirement) => {
    setRequirements([req, ...requirements]);
    setCurrentView('REQ_APP');
  };

  const handleUpdateDoc = (updatedDoc: Requirement | Plan | Subcontract) => {
    if (updatedDoc.id.startsWith('REQ')) {
      setRequirements(requirements.map(r => r.id === updatedDoc.id ? updatedDoc as Requirement : r));
    } else if (updatedDoc.id.startsWith('PLN')) {
      setPlans(plans.map(p => p.id === updatedDoc.id ? updatedDoc as Plan : p));
    } else {
      setSubcontracts(subcontracts.map(s => s.id === updatedDoc.id ? updatedDoc as Subcontract : s));
    }
    setViewingDoc(updatedDoc);
  };

  const handleSubmitDoc = (id: string) => {
    setRequirements(prev => prev.map(r => r.id === id ? { 
      ...r, 
      auditStatus: r.auditStatus === AuditStatus.CHANGE_DRAFT ? AuditStatus.CHANGE_PENDING : 
                  r.auditStatus === AuditStatus.TERMINATE_DRAFT ? AuditStatus.TERMINATE_PENDING : AuditStatus.PENDING 
    } : r));
    setPlans(prev => prev.map(p => p.id === id ? { 
      ...p, 
      auditStatus: p.auditStatus === AuditStatus.CHANGE_DRAFT ? AuditStatus.CHANGE_PENDING : 
                  p.auditStatus === AuditStatus.TERMINATE_DRAFT ? AuditStatus.TERMINATE_PENDING : AuditStatus.PENDING 
    } : p));
  };

  const handleChangeDoc = (id: string, reason: string) => {
    setRequirements(prev => prev.map(r => r.id === id ? { ...r, auditStatus: AuditStatus.CHANGE_DRAFT, changeReason: reason } : r));
    setPlans(prev => prev.map(p => p.id === id ? { ...p, auditStatus: AuditStatus.CHANGE_DRAFT, changeReason: reason } : p));
  };

  const handleTerminateDoc = (id: string, reason: string) => {
    setRequirements(prev => prev.map(r => r.id === id ? { ...r, auditStatus: AuditStatus.TERMINATE_DRAFT, terminationReason: reason } : r));
    setPlans(prev => prev.map(p => p.id === id ? { ...p, auditStatus: AuditStatus.TERMINATE_DRAFT, terminationReason: reason } : p));
  };

  const handleSaveProject = (project: ProjectApproval) => {
    setProjects(prev => [...prev, project]);
    setCurrentView('PROJECT_APP');
  };

  const handleApprove = (id: string, type: 'REQ' | 'PLAN' | 'SUB' | 'PROJECT') => {
    const timestamp = new Date().toISOString();
    if (type === 'REQ') {
      setRequirements(requirements.map(r => {
        if (r.id === id) {
          const newHistory = [...(r.history || [])];
          if (r.auditStatus === AuditStatus.CHANGE_PENDING) {
            newHistory.push({
              id: `H-${Math.random().toString(36).substr(2, 9)}`,
              type: 'CHANGE',
              reason: r.changeReason || '',
              timestamp,
              operator: '管理员',
              status: AuditStatus.APPROVED
            });
            return { ...r, auditStatus: AuditStatus.APPROVED, history: newHistory };
          }
          if (r.auditStatus === AuditStatus.TERMINATE_PENDING) {
            newHistory.push({
              id: `H-${Math.random().toString(36).substr(2, 9)}`,
              type: 'TERMINATE',
              reason: r.terminationReason || '',
              timestamp,
              operator: '管理员',
              status: AuditStatus.TERMINATED
            });
            return { ...r, auditStatus: AuditStatus.TERMINATED, processStatus: ReqProcessStatus.TERMINATED, history: newHistory };
          }
          return { ...r, auditStatus: AuditStatus.APPROVED };
        }
        return r;
      }));
    } else if (type === 'PLAN') {
      setPlans(plans.map(p => {
        if (p.id === id) {
          const newHistory = [...(p.history || [])];
          if (p.auditStatus === AuditStatus.CHANGE_PENDING) {
            newHistory.push({
              id: `H-${Math.random().toString(36).substr(2, 9)}`,
              type: 'CHANGE',
              reason: p.changeReason || '',
              timestamp,
              operator: '管理员',
              status: AuditStatus.APPROVED
            });
            return { ...p, auditStatus: AuditStatus.APPROVED, history: newHistory };
          }
          if (p.auditStatus === AuditStatus.TERMINATE_PENDING) {
            newHistory.push({
              id: `H-${Math.random().toString(36).substr(2, 9)}`,
              type: 'TERMINATE',
              reason: p.terminationReason || '',
              timestamp,
              operator: '管理员',
              status: AuditStatus.TERMINATED
            });
            return { ...p, auditStatus: AuditStatus.TERMINATED, processStatus: PlanProcessStatus.TERMINATED, history: newHistory };
          }
          return { ...p, auditStatus: AuditStatus.APPROVED };
        }
        return p;
      }));
    } else if (type === 'PROJECT') {
      setProjects(projects.map(p => p.id === id ? { ...p, status: '审核通过' } : p));
    } else if (type === 'SUB') {
      setSubcontracts(subcontracts.map(s => s.id === id ? { ...s, status: '审核通过' } : s));
    }
  };

  const handleReject = (id: string, type: 'REQ' | 'PLAN' | 'SUB' | 'PROJECT') => {
    if (type === 'REQ') {
      setRequirements(requirements.map(r => {
        if (r.id === id) {
          if (r.auditStatus === AuditStatus.CHANGE_PENDING) return { ...r, auditStatus: AuditStatus.CHANGE_REJECTED };
          if (r.auditStatus === AuditStatus.TERMINATE_PENDING) return { ...r, auditStatus: AuditStatus.TERMINATE_REJECTED };
          return { ...r, auditStatus: AuditStatus.REJECTED };
        }
        return r;
      }));
    } else if (type === 'PLAN') {
      setPlans(plans.map(p => {
        if (p.id === id) {
          if (p.auditStatus === AuditStatus.CHANGE_PENDING) return { ...p, auditStatus: AuditStatus.CHANGE_REJECTED };
          if (p.auditStatus === AuditStatus.TERMINATE_PENDING) return { ...p, auditStatus: AuditStatus.TERMINATE_REJECTED };
          return { ...p, auditStatus: AuditStatus.REJECTED };
        }
        return p;
      }));
    } else if (type === 'PROJECT') {
      setProjects(projects.map(p => p.id === id ? { ...p, status: '审核不通过' } : p));
    } else if (type === 'SUB') {
      setSubcontracts(subcontracts.map(s => s.id === id ? { ...s, status: '审核不通过' } : s));
    }
  };

  const handleRemoveRequirement = (planId: string, reqId: string) => {
    setLineage(prev => prev.map(l => {
      if (l.targetIds.includes(planId) && l.sourceIds.includes(reqId)) {
        return {
          ...l,
          sourceIds: l.sourceIds.filter(id => id !== reqId)
        };
      }
      return l;
    }).filter(l => l.sourceIds.length > 0));

    setRequirements(prev => prev.map(r => {
      if (r.id === reqId) {
        return { ...r, assignedQty: 0, processStatus: ReqProcessStatus.NORMAL };
      }
      return r;
    }));

    setPlans(prev => prev.map(p => {
      if (p.id === planId) {
        const updatedItems = (p.items || []).filter(item => !item.id.includes(reqId));
        const updatedPlan = { ...p, items: updatedItems, qty: updatedItems.reduce((sum, i) => sum + i.qty, 0) };
        if (viewingDoc && viewingDoc.id === planId) {
          setViewingDoc(updatedPlan);
        }
        return updatedPlan;
      }
      return p;
    }));
  };

  const handleRemoveLineItem = (planId: string, itemId: string) => {
    setPlans(prev => prev.map(p => {
      if (p.id === planId) {
        const updatedItems = (p.items || []).filter(item => item.id !== itemId);
        const updatedPlan = { ...p, items: updatedItems, qty: updatedItems.reduce((sum, i) => sum + i.qty, 0) };
        if (viewingDoc && viewingDoc.id === planId) {
          setViewingDoc(updatedPlan);
        }
        return updatedPlan;
      }
      return p;
    }));
  };

  const handleAddLineItem = (planId: string) => {
    setPlans(prev => prev.map(p => {
      if (p.id === planId) {
        const newItem = {
          id: `PLN-LI-${Date.now()}`,
          materialCode: 'NEW-MAT',
          materialName: '新物料',
          spec: '规格',
          unit: '个',
          qty: 1,
          unitPrice: 0
        };
        const updatedPlan = { ...p, items: [...(p.items || []), newItem], qty: (p.qty || 0) + 1 };
        if (viewingDoc && viewingDoc.id === planId) {
          setViewingDoc(updatedPlan);
        }
        return updatedPlan;
      }
      return p;
    }));
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
            <TopMenuLink label="采购需求" active={currentView === 'REQ_APP' || currentView === 'REQ_POOL' || currentView === 'CREATE_REQ' || currentView === 'REQ_CHANGE' || currentView === 'REQ_TERMINATE'} onClick={() => setCurrentView('REQ_APP')} />
            <TopMenuLink label="采购计划" active={currentView === 'PLAN_POOL' || currentView === 'SUB_POOL' || currentView === 'PLAN_CHANGE' || currentView === 'PLAN_TERMINATE'} onClick={() => setCurrentView('PLAN_POOL')} />
            <TopMenuLink label="采购立项" active={currentView === 'PROJECT_APP' || currentView === 'CREATE_PROJECT'} onClick={() => setCurrentView('PROJECT_APP')} />
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
               currentView === 'REQ_APP' || currentView === 'REQ_POOL' || currentView === 'CREATE_REQ' || currentView === 'REQ_CHANGE' || currentView === 'REQ_TERMINATE' ? '采购需求' : 
               currentView === 'PLAN_POOL' || currentView === 'PLAN_CHANGE' || currentView === 'PLAN_TERMINATE' ? '采购计划' : 
               currentView === 'SUB_POOL' ? '分包管理' : 
               currentView === 'PROJECT_APP' || currentView === 'CREATE_PROJECT' ? '采购立项' : '血缘追溯'}
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
            ) : (currentView === 'REQ_APP' || currentView === 'REQ_POOL' || currentView === 'CREATE_REQ' || currentView === 'REQ_CHANGE' || currentView === 'REQ_TERMINATE') ? (
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
                <SideNavItem 
                  icon={<RefreshCw className="w-4 h-4" />} 
                  label="需求变更" 
                  active={currentView === 'REQ_CHANGE'}
                  onClick={() => setCurrentView('REQ_CHANGE')}
                />
                <SideNavItem 
                  icon={<XCircle className="w-4 h-4" />} 
                  label="需求取消" 
                  active={currentView === 'REQ_TERMINATE'}
                  onClick={() => setCurrentView('REQ_TERMINATE')}
                />
              </>
            ) : (currentView === 'PLAN_POOL' || currentView === 'SUB_POOL' || currentView === 'PLAN_CHANGE' || currentView === 'PLAN_TERMINATE') ? (
              <>
                <SideNavItem 
                  icon={<ClipboardList className="w-4 h-4" />} 
                  label="采购计划申请" 
                  active={currentView === 'PLAN_POOL'}
                  onClick={() => setCurrentView('PLAN_POOL')}
                />
                <SideNavItem 
                  icon={<RefreshCw className="w-4 h-4" />} 
                  label="计划变更" 
                  active={currentView === 'PLAN_CHANGE'}
                  onClick={() => setCurrentView('PLAN_CHANGE')}
                />
                <SideNavItem 
                  icon={<XCircle className="w-4 h-4" />} 
                  label="计划取消" 
                  active={currentView === 'PLAN_TERMINATE'}
                  onClick={() => setCurrentView('PLAN_TERMINATE')}
                />
                <SideNavItem 
                  icon={<Package className="w-4 h-4" />} 
                  label="分包管理" 
                  active={currentView === 'SUB_POOL'}
                  onClick={() => setCurrentView('SUB_POOL')}
                />
              </>
            ) : currentView === 'PROJECT_APP' || currentView === 'CREATE_PROJECT' ? (
              <>
                <SideNavItem 
                  icon={<ClipboardList className="w-4 h-4" />} 
                  label="采购立项申请" 
                  active={currentView === 'PROJECT_APP' || currentView === 'CREATE_PROJECT'}
                  onClick={() => setCurrentView('PROJECT_APP')}
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
              {/* Header buttons removed, moved to component footer */}
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
                    onApprove={(id) => handleApprove(id, 'REQ')}
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
                    onUpdate={handleUpdateDoc}
                    onSubmit={handleSubmitDoc}
                    onChange={handleChangeDoc}
                    onTerminate={handleTerminateDoc}
                    onApprove={(id) => handleApprove(id, 'REQ')}
                    onReject={(id) => handleReject(id, 'REQ')}
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
                    onUpdate={handleUpdateDoc}
                    onSubmit={handleSubmitDoc}
                    onChange={handleChangeDoc}
                    onTerminate={handleTerminateDoc}
                    onApprove={(id) => handleApprove(id, 'PLAN')}
                    onReject={(id) => handleReject(id, 'PLAN')}
                    onAddRequirement={(planId) => {
                      setPickReqTargetId(planId);
                      setPickReqModalOpen(true);
                    }}
                    onRemoveRequirement={handleRemoveRequirement}
                    onAddLineItem={handleAddLineItem}
                    onRemoveLineItem={handleRemoveLineItem}
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
                    onApprove={(id) => handleApprove(id, 'REQ')}
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
                    onApprove={(id) => handleApprove(id, 'PLAN')}
                    onPickRequirements={(targetId) => {
                      setPickReqTargetId(targetId);
                      setPickReqModalOpen(true);
                    }}
                  />
                </motion.div>
              )}
              {currentView === 'SUB_POOL' && (
                <motion.div key="sub" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <SubcontractPool 
                    subcontracts={subcontracts} 
                    lineage={lineage}
                    onBack={() => setCurrentView('PLAN_POOL')} 
                    onView={(sub) => handleViewDoc(sub, 'SUB')}
                    onApprove={(id) => handleApprove(id, 'SUB')}
                    onDelete={handleDeleteSubcontract}
                    onCreateProject={handleCreateProjectFromSub}
                  />
                </motion.div>
              )}
              {currentView === 'PROJECT_APP' && (
                <motion.div key="project" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <ProjectApprovalPool 
                    projects={projects} 
                    onCreate={() => setCurrentView('CREATE_PROJECT')}
                    onView={(p) => handleViewDoc(p, 'PROJECT')} 
                    onApprove={(id) => handleApprove(id, 'PROJECT')}
                  />
                </motion.div>
              )}
              {currentView === 'REQ_CHANGE' && (
                <motion.div key="req-change" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <RequirementPool 
                    requirements={requirements} 
                    lineage={lineage}
                    onPickToPlan={handlePickToPlan}
                    onMerge={handleMergeReqs}
                    onSplit={handleSplitReq}
                    onView={(req) => handleViewDoc(req, 'REQ')}
                    onApprove={(id) => handleApprove(id, 'REQ')}
                    mode="CHANGE"
                    onInitiate={() => {
                      setPickApprovedType('REQ');
                      setPickApprovedAction('CHANGE');
                      setPickApprovedModalOpen(true);
                    }}
                  />
                </motion.div>
              )}
              {currentView === 'REQ_TERMINATE' && (
                <motion.div key="req-terminate" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <RequirementPool 
                    requirements={requirements} 
                    lineage={lineage}
                    onPickToPlan={handlePickToPlan}
                    onMerge={handleMergeReqs}
                    onSplit={handleSplitReq}
                    onView={(req) => handleViewDoc(req, 'REQ')}
                    onApprove={(id) => handleApprove(id, 'REQ')}
                    mode="TERMINATE"
                    onInitiate={() => {
                      setPickApprovedType('REQ');
                      setPickApprovedAction('TERMINATE');
                      setPickApprovedModalOpen(true);
                    }}
                  />
                </motion.div>
              )}
              {currentView === 'PLAN_CHANGE' && (
                <motion.div key="plan-change" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <PlanPool 
                    plans={plans} 
                    lineage={lineage}
                    onAssign={handleAssignPlan}
                    onSubcontract={handleSubcontract}
                    onMerge={handleMergePlans}
                    onSplit={handleSplitPlan}
                    onView={(plan) => handleViewDoc(plan, 'PLAN')}
                    onApprove={(id) => handleApprove(id, 'PLAN')}
                    onPickRequirements={(targetId) => {
                      setPickReqTargetId(targetId);
                      setPickReqModalOpen(true);
                    }}
                    mode="CHANGE"
                    onInitiate={() => {
                      setPickApprovedType('PLAN');
                      setPickApprovedAction('CHANGE');
                      setPickApprovedModalOpen(true);
                    }}
                  />
                </motion.div>
              )}
              {currentView === 'PLAN_TERMINATE' && (
                <motion.div key="plan-terminate" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <PlanPool 
                    plans={plans} 
                    lineage={lineage}
                    onAssign={handleAssignPlan}
                    onSubcontract={handleSubcontract}
                    onMerge={handleMergePlans}
                    onSplit={handleSplitPlan}
                    onView={(plan) => handleViewDoc(plan, 'PLAN')}
                    onApprove={(id) => handleApprove(id, 'PLAN')}
                    onPickRequirements={(targetId) => {
                      setPickReqTargetId(targetId);
                      setPickReqModalOpen(true);
                    }}
                    mode="TERMINATE"
                    onInitiate={() => {
                      setPickApprovedType('PLAN');
                      setPickApprovedAction('TERMINATE');
                      setPickApprovedModalOpen(true);
                    }}
                  />
                </motion.div>
              )}
              {currentView === 'CREATE_PROJECT' && (
                <motion.div key="create-project" initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 100 }} className="h-full">
                  <CreateProjectApproval 
                    onClose={() => {
                      setCurrentView('PROJECT_APP');
                      setSelectedSubsForProject([]);
                    }} 
                    onSave={handleSaveProject}
                    onApprove={(id) => handleApprove(id, 'PROJECT')}
                    onReject={(id) => handleReject(id, 'PROJECT')}
                    onDeleteLot={(subId) => setSubcontracts(subcontracts.map(s => s.id === subId ? { ...s, status: '编辑中' } : s))}
                    plans={plans}
                    subcontracts={subcontracts}
                    initialSubcontracts={selectedSubsForProject}
                  />
                </motion.div>
              )}
              {currentView === 'VIEW_PROJECT' && viewingDoc && (
                <motion.div key="view-project" initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 100 }} className="h-full">
                  <CreateProjectApproval 
                    onClose={() => setCurrentView('PROJECT_APP')} 
                    onSave={handleSaveProject}
                    onApprove={(id) => handleApprove(id, 'PROJECT')}
                    onReject={(id) => handleReject(id, 'PROJECT')}
                    onDeleteLot={(subId) => setSubcontracts(subcontracts.map(s => s.id === subId ? { ...s, status: '编辑中' } : s))}
                    plans={plans}
                    subcontracts={subcontracts}
                    project={viewingDoc as any}
                  />
                </motion.div>
              )}
              {currentView === 'VIEW_SUB' && viewingDoc && (
                <motion.div key="view-sub" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
                  <ViewDocument 
                    document={viewingDoc} 
                    type="SUB" 
                    lineage={lineage}
                    onClose={() => setCurrentView('SUB_POOL')} 
                    onUpdate={handleUpdateDoc}
                    onApprove={(id) => handleApprove(id, 'SUB')}
                    onReject={(id) => handleReject(id, 'SUB')}
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

      <SubcontractModal 
        isOpen={subcontractModalOpen}
        onClose={() => setSubcontractModalOpen(false)}
        onConfirm={confirmSubcontract}
        selectedPlans={subcontractTargetPlans}
      />

      <PickRequirementModal 
        isOpen={pickReqModalOpen}
        onClose={() => {
          setPickReqModalOpen(false);
          setPickReqTargetId(undefined);
        }}
        onConfirm={(reqs) => {
          handlePickToPlan(reqs.map(r => r.id), pickReqTargetId);
          setPickReqModalOpen(false);
          setPickReqTargetId(undefined);
        }}
        requirements={requirements}
      />

      <AssignModal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        onConfirm={confirmAssign}
        targetIds={assignTargetIds}
      />

      {pickApprovedModalOpen && (
        <PickApprovedModal 
          type={pickApprovedType}
          actionType={pickApprovedAction}
          requirements={requirements}
          plans={plans}
          onClose={() => setPickApprovedModalOpen(false)}
          onPick={(id) => {
            setPickApprovedModalOpen(false);
            const doc = pickApprovedType === 'REQ' ? requirements.find(r => r.id === id) : plans.find(p => p.id === id);
            
            if (doc) {
              const updatedDoc = { 
                ...doc, 
                auditStatus: pickApprovedAction === 'CHANGE' ? AuditStatus.CHANGE_DRAFT : AuditStatus.TERMINATE_DRAFT,
                changeReason: pickApprovedAction === 'CHANGE' ? '' : (doc as any).changeReason,
                terminationReason: pickApprovedAction === 'TERMINATE' ? '' : (doc as any).terminationReason
              };
              
              if (pickApprovedAction === 'CHANGE') {
                handleChangeDoc(id, '');
              } else {
                handleTerminateDoc(id, '');
              }
              
              handleViewDoc(updatedDoc, pickApprovedType);
            }
          }}
        />
      )}
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
