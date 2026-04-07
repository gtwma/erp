/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum ReqStatus {
  DRAFT = '编辑中',
  PENDING = '待审核',
  APPROVED = '审核通过',
  REJECTED = '审核不通过',
  EXECUTING = '执行中',
  COMPLETED = '已转计划',
  SPLIT = '已拆分',
  MERGED = '已合并',
  CANCELLED = '已取消',
}

export enum PlanStatus {
  DRAFT = '编辑中',
  PENDING = '待审核',
  APPROVED = '审核通过',
  REJECTED = '审核不通过',
  ASSIGNED = '已指派',
  SUBCONTRACTED = '已分包',
  SPLIT = '已拆分',
  MERGED = '已合并',
  CANCELLED = '已取消',
}

export interface Requirement {
  id: string;
  materialCode: string;
  name: string;
  spec: string;
  qty: number;
  assignedQty: number;
  unitPrice: number;
  status: ReqStatus;
  createdAt: string;
  creator: string;
}

export interface Plan {
  id: string;
  reqLineId: string; // 溯源需求ID
  materialCode: string;
  name: string;
  spec: string;
  qty: number;
  assignedTo?: string;
  status: PlanStatus;
  createdAt: string;
}

export interface Subcontract {
  id: string;
  name: string;
  planIds: string[];
  status: '进行中' | '已完成';
  createdAt: string;
}

export interface LineageRelation {
  id: string;
  type: 'REQ_MERGE' | 'REQ_SPLIT' | 'PLAN_MERGE' | 'PLAN_SPLIT' | 'REQ_TO_PLAN';
  sourceIds: string[];
  targetIds: string[];
  qty: number;
  timestamp: string;
}
