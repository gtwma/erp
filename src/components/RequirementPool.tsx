/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Requirement, AuditStatus, ReqProcessStatus, LineageRelation, MOCK_INVENTORY, SearchParams } from '../types';
import { StatusBadge } from './StatusBadge';
import { Search, Filter, Plus, PlusCircle, GitMerge, GitBranch, ArrowRight, X, Check, ClipboardList, Pencil, Settings, Eye, FileText, History, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { SearchForm } from './SearchForm';

const InventoryCheck: React.FC<{ materialCode: string; requiredQty: number }> = ({ materialCode, requiredQty }) => {
  const item = MOCK_INVENTORY.find(i => i.materialCode === materialCode);
  if (!item) return null;

  const isShortage = item.stockQty < requiredQty;
  const isBelowSafety = item.stockQty < item.safetyStock;

  return (
    <div className="flex flex-col space-y-1 mt-1.5">
      {isShortage ? (
        <div className="flex items-center space-x-1.5 text-[11px] font-bold text-red-600 bg-red-50 px-2 py-1 rounded border border-red-200 animate-pulse">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>库存严重不足！现存: {item.stockQty}{item.unit} (需求: {requiredQty}{item.unit})</span>
        </div>
      ) : isBelowSafety ? (
        <div className="flex items-center space-x-1.5 text-[11px] font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded border border-orange-200">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>低于安全库存！现存: {item.stockQty}{item.unit} (安全线: {item.safetyStock}{item.unit})</span>
        </div>
      ) : (
        <div className="flex items-center space-x-1.5 text-[10px] text-green-600 bg-green-50/50 px-2 py-0.5 rounded border border-green-100 w-fit">
          <CheckCircle2 className="w-3 h-3" />
          <span>库存充足 (现存: {item.stockQty}{item.unit})</span>
        </div>
      )}
    </div>
  );
};

interface RequirementPoolProps {
  requirements: Requirement[];
  lineage: LineageRelation[];
  onPickToPlan: (ids: string[]) => void;
  onMerge: (ids: string[]) => void;
  onSplit: (id: string) => void;
  onView: (req: Requirement) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  mode?: 'NORMAL' | 'CHANGE' | 'TERMINATE';
  onInitiate?: () => void;
}

export const RequirementPool: React.FC<RequirementPoolProps> = ({
  requirements,
  lineage,
  onPickToPlan,
  onMerge,
  onSplit,
  onView,
  onApprove,
  onReject,
  mode = 'NORMAL',
  onInitiate
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchParams, setSearchParams] = useState<SearchParams>({
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  const activeRequirements = useMemo(() => {
    let filtered = requirements.filter(r => r.processStatus !== ReqProcessStatus.COMPLETED);

    if (mode === 'CHANGE') {
      filtered = filtered.filter(r => 
        r.auditStatus === AuditStatus.APPROVED ||
        r.auditStatus === AuditStatus.CHANGE_DRAFT || 
        r.auditStatus === AuditStatus.CHANGE_PENDING
      );
    } else if (mode === 'TERMINATE') {
      filtered = filtered.filter(r => 
        r.auditStatus === AuditStatus.APPROVED ||
        r.auditStatus === AuditStatus.TERMINATE_DRAFT || 
        r.auditStatus === AuditStatus.TERMINATE_PENDING || 
        r.auditStatus === AuditStatus.TERMINATED
      );
    } else {
      filtered = filtered.filter(r => 
        r.auditStatus !== AuditStatus.CHANGE_DRAFT && 
        r.auditStatus !== AuditStatus.CHANGE_PENDING && 
        r.auditStatus !== AuditStatus.TERMINATE_DRAFT && 
        r.auditStatus !== AuditStatus.TERMINATE_PENDING && 
        r.auditStatus !== AuditStatus.TERMINATED
      );
    }

    // Apply filters
    if (searchParams.content) {
      filtered = filtered.filter(r => r.name.toLowerCase().includes(searchParams.content!.toLowerCase()));
    }
    if (searchParams.id) {
      filtered = filtered.filter(r => r.id.toLowerCase().includes(searchParams.id!.toLowerCase()));
    }
    if (searchParams.dept) {
      filtered = filtered.filter(r => (r.creator || '系统管理部').toLowerCase().includes(searchParams.dept!.toLowerCase()));
    }
    if (searchParams.materialName) {
      filtered = filtered.filter(r => r.name.toLowerCase().includes(searchParams.materialName!.toLowerCase()));
    }
    if (searchParams.status) {
      filtered = filtered.filter(r => r.auditStatus === searchParams.status || r.processStatus === searchParams.status);
    }
    if (searchParams.date) {
      filtered = filtered.filter(r => r.createdAt.includes(searchParams.date!));
    }

    // Apply sorting
    const { sortBy, sortOrder } = searchParams;
    filtered.sort((a, b) => {
      let valA: any = a[sortBy as keyof Requirement] || '';
      let valB: any = b[sortBy as keyof Requirement] || '';

      if (sortBy === 'createdAt') {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [requirements, searchParams]);

  const hasHistory = (id: string) => lineage.some(l => l.targetIds.includes(id));

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      {/* Search Form */}
      <SearchForm 
        type="REQ" 
        onSearch={setSearchParams}
        onReset={() => setSearchParams({ sortBy: 'createdAt', sortOrder: 'desc' })}
      />

      {/* Action Bar */}
      <div className="bg-gray-50 border-b border-erp-border px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="text-xs font-medium text-erp-text-sub">
            {selectedIds.length > 0 ? `已选择 ${selectedIds.length} 项` : '未选择项'}
          </span>
          {mode === 'NORMAL' ? (
            <>
              <button
                onClick={() => {
                  onPickToPlan(selectedIds);
                  setSelectedIds([]);
                }}
                disabled={
                  selectedIds.length === 0 || 
                  requirements.filter(r => selectedIds.includes(r.id)).some(r => r.auditStatus !== AuditStatus.APPROVED || r.processStatus === ReqProcessStatus.MERGED)
                }
                className={`px-4 py-1.5 rounded-[2px] text-xs font-medium transition-colors ${
                  (selectedIds.length === 0 || requirements.filter(r => selectedIds.includes(r.id)).some(r => r.auditStatus !== AuditStatus.APPROVED || r.processStatus === ReqProcessStatus.MERGED)) 
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                    : 'bg-[#2196F3] text-white hover:bg-blue-600'
                }`}
              >
                <span>生成计划</span>
              </button>
              <button
                onClick={() => {
                  onMerge(selectedIds);
                  setSelectedIds([]);
                }}
                disabled={
                  selectedIds.length < 2 || 
                  requirements.filter(r => selectedIds.includes(r.id)).some(r => r.auditStatus !== AuditStatus.APPROVED || r.processStatus === ReqProcessStatus.MERGED || r.processStatus === ReqProcessStatus.SPLIT)
                }
                className={`px-4 py-1.5 rounded-[2px] text-xs font-medium border transition-colors ${
                  (selectedIds.length < 2 || requirements.filter(r => selectedIds.includes(r.id)).some(r => r.auditStatus !== AuditStatus.APPROVED || r.processStatus === ReqProcessStatus.MERGED))
                    ? 'border-gray-200 text-gray-300 cursor-not-allowed' 
                    : 'border-gray-300 text-gray-600 hover:bg-gray-50 bg-white'
                }`}
              >
                <span>合并需求</span>
              </button>
              <button
                onClick={() => {
                  if (selectedIds.length === 1) onSplit(selectedIds[0]);
                }}
                disabled={
                  selectedIds.length !== 1 || 
                  requirements.filter(r => selectedIds.includes(r.id)).some(r => r.processStatus === ReqProcessStatus.MERGED)
                }
                className={`px-4 py-1.5 rounded-[2px] text-xs font-medium border transition-colors ${
                  (selectedIds.length !== 1 || requirements.filter(r => selectedIds.includes(r.id)).some(r => r.processStatus === ReqProcessStatus.MERGED)) ? 'border-gray-200 text-gray-300 cursor-not-allowed' : 'border-gray-300 text-gray-600 hover:bg-gray-50 bg-white'
                }`}
              >
                <span>拆分需求</span>
              </button>
            </>
          ) : (
            <button
              onClick={onInitiate}
              className="px-4 py-1.5 rounded-[2px] text-xs font-medium bg-orange-500 text-white hover:bg-orange-600 transition-colors shadow-sm flex items-center space-x-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>{mode === 'CHANGE' ? '发起变更' : '发起取消'}</span>
            </button>
          )}
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
                  checked={selectedIds.length === activeRequirements.length && activeRequirements.length > 0}
                  onChange={(e) =>
                    setSelectedIds(e.target.checked ? activeRequirements.map((r) => r.id) : [])
                  }
                />
              </th>
              <th className="px-4 py-2 w-12 text-center">序</th>
              <th className="px-4 py-2">采购需求编号</th>
              <th className="px-4 py-2">采购需求内容</th>
              <th className="px-4 py-2">需求单位</th>
              {mode === 'CHANGE' && <th className="px-4 py-2">变更理由</th>}
              {mode === 'TERMINATE' && <th className="px-4 py-2">取消理由</th>}
              <th className="px-4 py-2">审核状态</th>
              <th className="px-4 py-2">需求状态</th>
              <th className="px-4 py-2 text-center">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-erp-border">
            {activeRequirements.map((req, index) => (
              <tr
                key={req.id}
                onClick={() => onView(req)}
                className={`hover:bg-blue-50/30 transition-colors text-xs cursor-pointer ${
                  selectedIds.includes(req.id) ? 'bg-blue-50/50' : ''
                }`}
              >
                <td className="px-4 py-2.5" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-erp-secondary focus:ring-erp-secondary disabled:opacity-30 disabled:cursor-not-allowed"
                    checked={selectedIds.includes(req.id)}
                    onChange={() => toggleSelect(req.id)}
                    disabled={req.processStatus === ReqProcessStatus.SPLIT || req.processStatus === ReqProcessStatus.MERGED}
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
                <td className="px-4 py-2.5">
                  <div className="font-medium text-gray-800">{req.name}</div>
                  <InventoryCheck materialCode={req.materialCode} requiredQty={req.qty} />
                </td>
                <td className="px-4 py-2.5 text-erp-text-sub">{req.creator || '系统管理部'}</td>
                {mode === 'CHANGE' && (
                  <td className="px-4 py-2.5 text-erp-text-sub max-w-[200px] truncate" title={req.changeReason}>
                    {req.changeReason || '-'}
                  </td>
                )}
                {mode === 'TERMINATE' && (
                  <td className="px-4 py-2.5 text-erp-text-sub max-w-[200px] truncate" title={req.terminationReason}>
                    {req.terminationReason || '-'}
                  </td>
                )}
                <td className="px-4 py-2.5">
                  <span className={`text-[11px] ${
                    req.auditStatus === AuditStatus.DRAFT ? 'text-blue-500' :
                    req.auditStatus === AuditStatus.PENDING ? 'text-orange-500' :
                    req.auditStatus === AuditStatus.APPROVED ? 'text-green-500' : 
                    req.auditStatus === AuditStatus.REJECTED ? 'text-red-500' : 
                    req.auditStatus === AuditStatus.CHANGE_DRAFT ? 'text-blue-400' :
                    req.auditStatus === AuditStatus.CHANGE_PENDING ? 'text-orange-400' :
                    req.auditStatus === AuditStatus.TERMINATED ? 'text-gray-400' : 'text-erp-text-sub'
                  }`}>
                    {req.auditStatus}
                  </span>
                </td>
                <td className="px-4 py-2.5">
                  <span className={`text-[11px] ${
                    req.processStatus === ReqProcessStatus.MERGED ? 'text-purple-500' :
                    req.processStatus === ReqProcessStatus.SPLIT ? 'text-indigo-500' :
                    req.processStatus === ReqProcessStatus.COMPLETED ? 'text-gray-500' : 'text-erp-text-sub'
                  }`}>
                    {req.processStatus}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <button 
                      className="text-erp-secondary hover:text-blue-700" 
                      title={req.auditStatus === AuditStatus.DRAFT || req.auditStatus === AuditStatus.REJECTED || req.auditStatus === AuditStatus.CHANGE_DRAFT ? "编辑" : "查看"}
                    >
                      {req.auditStatus === AuditStatus.DRAFT || req.auditStatus === AuditStatus.REJECTED || req.auditStatus === AuditStatus.CHANGE_DRAFT ? <Pencil className="w-3.5 h-3.5" /> : <Search className="w-3.5 h-3.5" />}
                    </button>
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
