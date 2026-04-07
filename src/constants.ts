/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Requirement, ReqStatus, Plan, PlanStatus, Subcontract, LineageRelation } from './types';

export const MOCK_REQUIREMENTS: Requirement[] = [
  {
    id: 'REQ-20260407-001',
    materialCode: 'M-001',
    name: '不锈钢螺栓',
    spec: 'M8*25',
    qty: 1000,
    assignedQty: 400,
    unitPrice: 0.5,
    status: ReqStatus.EXECUTING,
    createdAt: '2026-04-07 09:00',
    creator: '张三',
  },
  {
    id: 'REQ-20260407-002',
    materialCode: 'M-002',
    name: '高强度垫片',
    spec: 'D10',
    qty: 500,
    assignedQty: 0,
    unitPrice: 0.2,
    status: ReqStatus.APPROVED,
    createdAt: '2026-04-07 10:30',
    creator: '李四',
  },
  {
    id: 'REQ-20260407-003',
    materialCode: 'M-001',
    name: '不锈钢螺栓',
    spec: 'M8*25',
    qty: 200,
    assignedQty: 0,
    unitPrice: 0.5,
    status: ReqStatus.APPROVED,
    createdAt: '2026-04-07 11:00',
    creator: '王五',
  },
  {
    id: 'REQ-20260407-004',
    materialCode: 'M-003',
    name: '铝合金支架',
    spec: 'L-Type',
    qty: 50,
    assignedQty: 0,
    unitPrice: 15.0,
    status: ReqStatus.APPROVED,
    createdAt: '2026-04-07 12:00',
    creator: '赵六',
  },
];

export const MOCK_PLANS: Plan[] = [
  {
    id: 'PLN-20260407-001',
    reqLineId: 'REQ-20260407-001',
    materialCode: 'M-001',
    name: '不锈钢螺栓',
    spec: 'M8*25',
    qty: 400,
    assignedTo: '采购员A',
    status: PlanStatus.ASSIGNED,
    createdAt: '2026-04-07 14:00',
  },
];

export const MOCK_SUBCONTRACTS: Subcontract[] = [
  {
    id: 'SUB-20260407-001',
    name: '基础件采购包-01',
    planIds: ['PLN-20260407-001'],
    status: '进行中',
    createdAt: '2026-04-07 15:30',
  },
];

export const MOCK_LINEAGE: LineageRelation[] = [
  {
    id: 'L-001',
    type: 'REQ_TO_PLAN',
    sourceIds: ['REQ-20260407-001'],
    targetIds: ['PLN-20260407-001'],
    qty: 400,
    timestamp: '2026-04-07 14:00',
  },
];
