/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Plan, PlanStatus, LineageRelation, MOCK_INVENTORY } from '../types';
import { StatusBadge } from './StatusBadge';
import { Search, Filter, UserPlus, Package, ArrowRight, X, Check, ClipboardList, Pencil, Settings, Eye, FileText, GitMerge, GitBranch, History, AlertTriangle, CheckCircle2, Plus } from 'lucide-react';
import { SearchForm } from './SearchForm';

const InventoryCheck: React.FC<{ materialCode: string; requiredQty: number }> = ({ materialCode, requiredQty }) => {
  const item = MOCK_INVENTORY.find(i => i.materialCode === materialCode);
  if (!item) return null;

  const isShortage = item.stockQty < requiredQty;
  const isBelowSafety = item.stockQty < item.safetyStock;

  return (
    <div className="flex items-center space-x-1.5 mt-1">
      {isShortage ? (
        <div className="flex items-center space-x-1 text-[10px] text-red-500 bg-red-50 px-1.5 py-0.5 rounded border border-red-100">
          <AlertTriangle className="w-3 h-3" />
          <span>库存不足 (现存: {item.stockQty}{item.unit})</span>
        </div>
      ) : isBelowSafety ? (
        <div className="flex items-center space-x-1 text-[10px] text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded border border-orange-100">
          <AlertTriangle className="w-3 h-3" />
          <span>低于安全库存 (现存: {item.stockQty}{item.unit})</span>
        </div>
      ) : (
        <div className="flex items-center space-x-1 text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded border border-green-100">
          <CheckCircle2 className="w-3 h-3" />
          <span>库存充足 (现存: {item.stockQty}{item.unit})</span>
        </div>
      )}
    </div>
  );
};

interface PlanPoolProps {
  plans: Plan[];
  lineage: LineageRelation[];
  onAssign: (ids: string[], user: string) => void;
  onSubcontract: (ids: string[]) => void;
  onMerge: (ids: string[]) => void;
  onSplit: (id: string) => void;
  onView: (plan: Plan) => void;
  onApprove: (id: string) => void;
  onPickRequirements: (targetId?: string) => void;
}

export const PlanPool: React.FC<PlanPoolProps> = ({ plans, lineage, onAssign, onSubcontract, onMerge, onSplit, onView, onApprove, onPickRequirements }) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const hasHistory = (id: string) => lineage.some(l => l.targetIds.includes(id));

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      {/* Search Form */}
      <SearchForm type="PLAN" />

      {/* Action Bar */}
      <div className="bg-gray-50 border-b border-erp-border px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => onPickRequirements(selectedIds.length === 1 ? selectedIds[0] : undefined)}
            className="px-4 py-1.5 rounded-[2px] text-xs font-medium bg-[#2196F3] text-white hover:bg-blue-600 transition-colors shadow-sm flex items-center space-x-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{selectedIds.length === 1 ? '添加需求到计划' : '选取需求建计划'}</span>
          </button>
          <span className="text-xs font-medium text-erp-text-sub">
            {selectedIds.length > 0 ? `已选择 ${selectedIds.length} 项` : '未选择项'}
          </span>
          <button
            onClick={() => onAssign(selectedIds, '采购员A')}
            disabled={selectedIds.length === 0}
            className={`px-4 py-1.5 rounded-[2px] text-xs font-medium transition-colors ${
              selectedIds.length === 0 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-[#2196F3] text-white hover:bg-blue-600'
            }`}
          >
            <span>一键指派</span>
          </button>
          <button
            onClick={() => onSubcontract(selectedIds)}
            disabled={selectedIds.length === 0}
            className={`px-4 py-1.5 rounded-[2px] text-xs font-medium border transition-colors ${
              selectedIds.length === 0 ? 'border-gray-200 text-gray-300 cursor-not-allowed' : 'border-gray-300 text-gray-600 hover:bg-gray-50 bg-white'
            }`}
          >
            <span>组建分包</span>
          </button>
          <button
            onClick={() => onMerge(selectedIds)}
            disabled={
              selectedIds.length < 2 || 
              plans.filter(p => selectedIds.includes(p.id)).some(p => p.status === PlanStatus.MERGED)
            }
            className={`px-4 py-1.5 rounded-[2px] text-xs font-medium border transition-colors ${
              (selectedIds.length < 2 || plans.filter(p => selectedIds.includes(p.id)).some(p => p.status === PlanStatus.MERGED))
                ? 'border-gray-200 text-gray-300 cursor-not-allowed' 
                : 'border-gray-300 text-gray-600 hover:bg-gray-50 bg-white'
            }`}
          >
            <span>合并计划</span>
          </button>
          <button
            onClick={() => {
              if (selectedIds.length === 1) onSplit(selectedIds[0]);
            }}
            disabled={selectedIds.length !== 1}
            className={`px-4 py-1.5 rounded-[2px] text-xs font-medium border transition-colors ${
              selectedIds.length !== 1 ? 'border-gray-200 text-gray-300 cursor-not-allowed' : 'border-gray-300 text-gray-600 hover:bg-gray-50 bg-white'
            }`}
          >
            <span>拆分计划</span>
          </button>
        </div>
        {/* Selection Summary (Hidden per user request) */}
        {selectedIds.length > 0 && (
          <div className="flex items-center space-x-2 px-4 py-1 bg-blue-50 rounded border border-blue-100">
            <span className="text-[10px] text-gray-500">已选择 {selectedIds.length} 项单据</span>
            <button onClick={() => setSelectedIds([])} className="text-gray-400 hover:text-gray-600 ml-2">
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 z-10">
            <tr className="erp-table-header border-b border-erp-border">
              <th className="px-4 py-2 w-10">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-erp-secondary focus:ring-erp-secondary"
                  checked={selectedIds.length === plans.length && plans.length > 0}
                  onChange={(e) =>
                    setSelectedIds(e.target.checked ? plans.map((r) => r.id) : [])
                  }
                />
              </th>
              <th className="px-4 py-2 w-12 text-center">序</th>
              <th className="px-4 py-2">采购计划编号</th>
              <th className="px-4 py-2">采购计划内容</th>
              <th className="px-4 py-2">关联需求</th>
              <th className="px-4 py-2">需求单位</th>
              <th className="px-4 py-2">审核状态</th>
              <th className="px-4 py-2 text-center">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-erp-border">
            {plans.map((plan, index) => (
              <tr
                key={plan.id}
                className={`hover:bg-blue-50/30 transition-colors text-xs ${
                  selectedIds.includes(plan.id) ? 'bg-blue-50/50' : ''
                }`}
              >
                <td className="px-4 py-2.5">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-erp-secondary focus:ring-erp-secondary"
                    checked={selectedIds.includes(plan.id)}
                    onChange={() => toggleSelect(plan.id)}
                  />
                </td>
                <td className="px-4 py-2.5 text-center text-erp-text-sub">{index + 1}</td>
                <td className="px-4 py-2.5">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-3.5 h-3.5 text-gray-400" />
                    <span 
                      onClick={() => onView(plan)}
                      className="text-erp-text-main cursor-pointer hover:underline"
                    >
                      {plan.id}
                    </span>
                    {hasHistory(plan.id) && (
                      <History className="w-3 h-3 text-orange-400" title="该单据由拆分或合并生成" />
                    )}
                  </div>
                </td>
                <td className="px-4 py-2.5">
                  <div className="font-medium text-gray-800">{plan.name}</div>
                  <InventoryCheck materialCode={plan.materialCode} requiredQty={plan.qty} />
                </td>
                <td className="px-4 py-2.5">
                  <div className="flex flex-wrap gap-1">
                    {/* Primary source */}
                    <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded-[2px] border border-blue-100 text-[10px] font-medium">
                      {plan.reqLineId}
                    </span>
                    {/* Other lineage sources if any */}
                    {lineage
                      .filter(l => l.targetIds.includes(plan.id) && l.type === 'REQ_TO_PLAN')
                      .flatMap(l => l.sourceIds)
                      .filter(sid => sid !== plan.reqLineId)
                      .map(sid => (
                        <span key={sid} className="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded-[2px] border border-blue-100 text-[10px] font-medium">
                          {sid}
                        </span>
                      ))
                    }
                  </div>
                </td>
                <td className="px-4 py-2.5 text-erp-text-sub">系统管理部</td>
                <td className="px-4 py-2.5">
                  <span className={`text-[11px] ${
                    plan.status === PlanStatus.DRAFT ? 'text-blue-500' :
                    plan.status === PlanStatus.PENDING ? 'text-orange-500' :
                    plan.status === PlanStatus.APPROVED ? 'text-green-500' : 'text-erp-text-sub'
                  }`}>
                    {plan.status}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-center">
                  <div className="flex items-center justify-center space-x-2">
                    {plan.status !== PlanStatus.APPROVED ? (
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => onView(plan)}
                          className="text-erp-secondary hover:text-blue-700" 
                          title="编辑"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => onApprove(plan.id)}
                          className="text-green-500 hover:text-green-700" 
                          title="审核通过"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => onView(plan)}
                        className="text-erp-secondary hover:text-blue-700" 
                        title="查看"
                      >
                        <Search className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
