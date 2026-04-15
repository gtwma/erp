/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum AuditStatus {
  DRAFT = '编辑中',
  PENDING = '待审核',
  APPROVED = '审核通过',
  REJECTED = '审核不通过',
  CHANGE_DRAFT = '变更编辑中',
  CHANGE_PENDING = '变更待审核',
  TERMINATE_DRAFT = '取消编辑中',
  TERMINATE_PENDING = '取消待审核',
  TERMINATED = '已终止',
}

export enum ReqProcessStatus {
  NORMAL = '正常',
  SPLIT = '已拆分',
  MERGED = '已合并',
  COMPLETED = '已转计划',
  CANCELLED = '已取消',
  TERMINATED = '已终止',
}

export enum PlanProcessStatus {
  NORMAL = '正常',
  ASSIGNED = '已指派',
  SUBCONTRACTED = '已分包',
  SPLIT = '已拆分',
  MERGED = '已合并',
  CANCELLED = '已取消',
  TERMINATED = '已终止',
}

export interface LineItem {
  id: string;
  materialCode: string;
  materialName: string;
  spec: string;
  unit: string;
  qty: number;
  unitPrice: number;
  sourcePlanId?: string; // Track source plan for subcontracts
}

export interface Requirement {
  id: string;
  materialCode: string;
  name: string;
  spec: string;
  qty: number;
  assignedQty: number;
  unitPrice: number;
  auditStatus: AuditStatus;
  processStatus: ReqProcessStatus;
  createdAt: string;
  creator: string;
  items?: LineItem[];
  changeReason?: string;
  terminationReason?: string;
}

export interface Plan {
  id: string;
  reqLineId: string; // 溯源需求ID
  materialCode: string;
  name: string;
  spec: string;
  qty: number;
  assignedTo?: string;
  procurementManager?: string;
  procurementDept?: string;
  auditStatus: AuditStatus;
  processStatus: PlanProcessStatus;
  createdAt: string;
  items?: LineItem[];
  changeReason?: string;
  terminationReason?: string;
}

export interface Subcontract {
  id: string;
  name: string;
  planIds: string[];
  status: '编辑中' | '待审核' | '审核通过' | '审核不通过' | '进行中' | '已完成';
  createdAt: string;
  items?: LineItem[];
}

export interface LineageRelation {
  id: string;
  type: 'REQ_MERGE' | 'REQ_SPLIT' | 'PLAN_MERGE' | 'PLAN_SPLIT' | 'REQ_TO_PLAN' | 'PLAN_TO_SUB';
  sourceIds: string[];
  targetIds: string[];
  qty: number;
  timestamp: string;
}

export interface LotInfo {
  id: string;
  name: string;
  content: string;
  budget: number;
  items: LineItem[];
  status?: '编辑中' | '已完成';
  subcontractId?: string;
}

export interface ProjectApproval {
  id: string;
  name: string;
  planId: string;
  status: '编辑中' | '待审核' | '审核通过' | '审核不通过';
  createdAt: string;
  lots: LotInfo[];
  source: '自筹' | '政府预算补助资金';
  type: '国有资金控股或占主导地位的依法招标' | '其他情形的采购';
  location: string;
  summary: string;
}

export interface Inventory {
  materialCode: string;
  materialName: string;
  spec: string;
  stockQty: number;
  safetyStock: number;
  unit: string;
}

export interface SearchParams {
  content?: string;
  id?: string;
  dept?: string;
  materialName?: string;
  person?: string;
  date?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const MOCK_INVENTORY: Inventory[] = [
  { materialCode: 'M001', materialName: '笔记本电脑', spec: '14寸/i7/16G', stockQty: 5, safetyStock: 10, unit: '台' },
  { materialCode: 'M002', materialName: '办公椅', spec: '人体工学/黑色', stockQty: 50, safetyStock: 20, unit: '把' },
  { materialCode: 'M003', materialName: '显示器', spec: '27寸/4K', stockQty: 2, safetyStock: 5, unit: '台' },
  { materialCode: 'M004', materialName: '机械键盘', spec: '红轴/104键', stockQty: 15, safetyStock: 10, unit: '把' },
];
