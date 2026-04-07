/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Requirement, ReqStatus, LineageRelation } from '../types';
import { StatusBadge } from './StatusBadge';
import { Search, Filter, Plus, GitMerge, GitBranch, ArrowRight, X, Check, ClipboardList, Pencil, Settings, Eye, FileText, History } from 'lucide-react';
import { SearchForm } from './SearchForm';

interface RequirementPoolProps {
  requirements: Requirement[];
  lineage: LineageRelation[];
  onPickToPlan: (ids: string[]) => void;
  onMerge: (ids: string[]) => void;
  onSplit: (id: string) => void;
  onView: (req: Requirement) => void;
}

export const RequirementPool: React.FC<RequirementPoolProps> = ({
  requirements,
  lineage,
  onPickToPlan,
  onMerge,
  onSplit,
  onView,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const hasHistory = (id: string) => lineage.some(l => l.targetIds.includes(id));

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      {/* Search Form */}
      <SearchForm />

      {/* Action Bar */}
      <div className="bg-gray-50 border-b border-erp-border px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="text-xs font-medium text-erp-text-sub">
            {selectedIds.length > 0 ? `已选择 ${selectedIds.length} 项` : '未选择项'}
          </span>
          <button
            onClick={() => onPickToPlan(selectedIds)}
            disabled={selectedIds.length === 0}
            className={`px-4 py-1.5 rounded-[2px] text-xs font-medium transition-colors ${
              selectedIds.length === 0 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-[#2196F3] text-white hover:bg-blue-600'
            }`}
          >
            <span>生成计划</span>
          </button>
          <button
            onClick={() => onMerge(selectedIds)}
            disabled={selectedIds.length < 2}
            className={`px-4 py-1.5 rounded-[2px] text-xs font-medium border transition-colors ${
              selectedIds.length < 2 ? 'border-gray-200 text-gray-300 cursor-not-allowed' : 'border-gray-300 text-gray-600 hover:bg-gray-50 bg-white'
            }`}
          >
            <span>合并需求</span>
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
            <span>拆分需求</span>
          </button>
        </div>
        
        {/* Selection Summary (Aggregated Material Info) */}
        {selectedIds.length > 0 && (
          <div className="flex items-center space-x-6 px-4 py-1 bg-blue-50 rounded border border-blue-100">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] text-gray-500">已选物料汇总:</span>
              <span className="text-xs font-bold text-blue-600">
                {Array.from(new Set(requirements.filter(r => selectedIds.includes(r.id)).map(r => r.materialCode))).length} 种
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] text-gray-500">数量合计:</span>
              <span className="text-xs font-bold text-blue-600">
                {requirements.filter(r => selectedIds.includes(r.id)).reduce((sum, r) => sum + r.qty, 0).toFixed(2)}
              </span>
            </div>
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
                  checked={selectedIds.length === requirements.length && requirements.length > 0}
                  onChange={(e) =>
                    setSelectedIds(e.target.checked ? requirements.map((r) => r.id) : [])
                  }
                />
              </th>
              <th className="px-4 py-2 w-12 text-center">序</th>
              <th className="px-4 py-2">采购需求编号</th>
              <th className="px-4 py-2">采购需求内容</th>
              <th className="px-4 py-2">需求单位</th>
              <th className="px-4 py-2">审核状态</th>
              <th className="px-4 py-2 text-center">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-erp-border">
            {requirements.map((req, index) => (
              <tr
                key={req.id}
                className={`hover:bg-blue-50/30 transition-colors text-xs ${
                  selectedIds.includes(req.id) ? 'bg-blue-50/50' : ''
                }`}
              >
                <td className="px-4 py-2.5">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-erp-secondary focus:ring-erp-secondary"
                    checked={selectedIds.includes(req.id)}
                    onChange={() => toggleSelect(req.id)}
                  />
                </td>
                <td className="px-4 py-2.5 text-center text-erp-text-sub">{index + 1}</td>
                <td className="px-4 py-2.5">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-3.5 h-3.5 text-gray-400" />
                    <span 
                      onClick={() => onView(req)}
                      className="text-erp-text-main cursor-pointer hover:underline"
                    >
                      {req.id}
                    </span>
                    {hasHistory(req.id) && (
                      <History className="w-3 h-3 text-orange-400" title="该单据由拆分或合并生成" />
                    )}
                  </div>
                </td>
                <td className="px-4 py-2.5 truncate max-w-[300px]">{req.name}</td>
                <td className="px-4 py-2.5 text-erp-text-sub">{req.creator || '系统管理部'}</td>
                <td className="px-4 py-2.5">
                  <span className={`text-[11px] ${
                    req.status === ReqStatus.DRAFT ? 'text-blue-500' :
                    req.status === ReqStatus.PENDING ? 'text-orange-500' :
                    req.status === ReqStatus.APPROVED ? 'text-green-500' : 'text-erp-text-sub'
                  }`}>
                    {req.status}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-center">
                  <div className="flex items-center justify-center space-x-2">
                    {req.status === ReqStatus.DRAFT ? (
                      <button 
                        onClick={() => onView(req)}
                        className="text-erp-secondary hover:text-blue-700" 
                        title="编辑"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    ) : req.status === ReqStatus.PENDING ? (
                      <button 
                        onClick={() => onView(req)}
                        className="text-erp-secondary hover:text-blue-700" 
                        title="审核"
                      >
                        <Settings className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button 
                        onClick={() => onView(req)}
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
