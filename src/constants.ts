/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Requirement, ReqStatus, Plan, PlanStatus, Subcontract, LineageRelation, ProjectApproval } from './types';

export const MOCK_REQUIREMENTS: Requirement[] = [
  {
    id: 'REQ-20260407-001',
    materialCode: 'M-001',
    name: '采购申请单-001',
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
    name: '采购申请单-002',
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
    name: '采购申请单-003',
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
    name: '采购申请单-004',
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

export const MOCK_PROJECTS: ProjectApproval[] = [
  {
    id: 'GCTC-CG-2026-458',
    name: '靖远煤业集团刘化有限公司机封、轴承、阀门、管件、法兰供应商入围项目',
    planId: 'PLN-20260407-001',
    status: '审核通过',
    createdAt: '2026-04-01 09:00',
    lots: [
      { id: 'GCTC-CG-2026-458-01', name: '机封', content: '机封采购', budget: 50000, items: [] },
      { id: 'GCTC-CG-2026-458-02', name: '轴承', content: '轴承采购', budget: 30000, items: [] },
      { id: 'GCTC-CG-2026-458-03', name: '阀门', content: '阀门采购', budget: 20000, items: [] },
    ],
    source: '自筹',
    type: '国有资金控股或占主导地位的依法招标',
    location: '甘肃省白银市',
    summary: '本项目为靖远煤业集团刘化有限公司机封、轴承、阀门、管件、法兰供应商入围项目。',
  },
  {
    id: 'GCTC-CG-2026-459',
    name: '甘肃能化金昌能源化工开发有限公司二季度生产经营材料采购项目',
    planId: 'PLN-20260407-001',
    status: '编辑中',
    createdAt: '2026-04-02 11:00',
    lots: [
      { id: 'GCTC-CG-2026-459-01', name: '一标段', content: '生产经营材料', budget: 150000, items: [] },
    ],
    source: '自筹',
    type: '国有资金控股或占主导地位的依法招标',
    location: '甘肃省金昌市',
    summary: '本项目为甘肃能化金昌能源化工开发有限公司二季度生产经营材料采购项目。',
  }
];

export const MATERIAL_MASTER = [
  { code: 'M-001', name: '不锈钢螺栓', spec: 'M8*25', unit: '个', price: 0.5 },
  { code: 'M-002', name: '高强度垫片', spec: 'D10', unit: '片', price: 0.2 },
  { code: 'M-003', name: '铝合金支架', spec: 'L-Type', unit: '个', price: 15.0 },
  { code: 'M-004', name: '尼龙扎带', spec: '3*150mm', unit: '包', price: 5.5 },
  { code: 'M-005', name: '绝缘胶带', spec: '18mm*10m', unit: '卷', price: 2.8 },
  { code: 'M-006', name: '六角螺母', spec: 'M8', unit: '个', price: 0.15 },
  { code: 'M-007', name: '弹簧垫圈', spec: 'M8', unit: '个', price: 0.08 },
  { code: 'M-008', name: '镀锌钢管', spec: 'DN25', unit: '米', price: 22.5 },
  { code: 'M-009', name: 'PVC弯头', spec: 'DN25', unit: '个', price: 1.2 },
  { code: 'M-010', name: '膨胀螺栓', spec: 'M10*100', unit: '套', price: 1.8 },
];
