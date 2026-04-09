import React, { useState } from 'react';
import { Subcontract, LineageRelation } from '../types';
import { StatusBadge } from './StatusBadge';
import { Search, Filter, Package, ArrowRight, X, Check, ClipboardList, Edit3, Eye, FileText, History, Pencil, Settings, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SearchForm } from './SearchForm';

interface SubcontractPoolProps {
  subcontracts: Subcontract[];
  lineage: LineageRelation[];
  onBack?: () => void;
  onView?: (sub: Subcontract) => void;
  onApprove?: (id: string) => void;
}

export const SubcontractPool: React.FC<SubcontractPoolProps> = ({ subcontracts, lineage, onBack, onView, onApprove }) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const hasHistory = (id: string) => lineage.some(l => l.targetIds.includes(id));

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      {/* Search Form */}
      <SearchForm type="SUB" />

      {/* Action Bar */}
      <div className="bg-gray-50 border-b border-erp-border px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {onBack && (
            <button 
              onClick={onBack}
              className="flex items-center space-x-1 text-erp-secondary hover:text-blue-700 font-medium text-xs mr-2"
            >
              <ArrowRight className="w-3.5 h-3.5 rotate-180" />
              <span>返回计划池</span>
            </button>
          )}
          <span className="text-xs font-medium text-erp-text-sub">
            {selectedIds.length > 0 ? `已选择 ${selectedIds.length} 项` : '未选择项'}
          </span>
          <button
            disabled={selectedIds.length === 0}
            className={`px-4 py-1.5 rounded-[2px] text-xs font-medium transition-colors shadow-sm ${
              selectedIds.length === 0 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-[#2196F3] text-white hover:bg-blue-600'
            }`}
          >
            <span>生成采购合同</span>
          </button>
          <button
            disabled={selectedIds.length < 2}
            className={`px-4 py-1.5 rounded-[2px] text-xs font-medium border transition-colors bg-white ${
              selectedIds.length < 2 ? 'border-gray-200 text-gray-300 cursor-not-allowed' : 'border-gray-300 text-gray-600 hover:bg-gray-50 shadow-sm'
            }`}
          >
            <span>合并分包</span>
          </button>
          <button
            disabled={selectedIds.length !== 1}
            className={`px-4 py-1.5 rounded-[2px] text-xs font-medium border transition-colors bg-white ${
              selectedIds.length !== 1 ? 'border-gray-200 text-gray-300 cursor-not-allowed' : 'border-gray-300 text-gray-600 hover:bg-gray-50 shadow-sm'
            }`}
          >
            <span>拆分分包</span>
          </button>
          <button
            disabled={selectedIds.length === 0}
            className={`px-4 py-1.5 rounded-[2px] text-xs font-medium border transition-colors bg-white ${
              selectedIds.length === 0 ? 'border-gray-200 text-gray-300 cursor-not-allowed' : 'border-gray-300 text-gray-600 hover:bg-gray-50 shadow-sm'
            }`}
          >
            <span>导出单据</span>
          </button>
        </div>
        
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
                  checked={selectedIds.length === subcontracts.length && subcontracts.length > 0}
                  onChange={(e) =>
                    setSelectedIds(e.target.checked ? subcontracts.map((r) => r.id) : [])
                  }
                />
              </th>
              <th className="px-4 py-2 w-12 text-center">序</th>
              <th className="px-4 py-2">分包单号</th>
              <th className="px-4 py-2">分包名称</th>
              <th className="px-4 py-2">包含计划</th>
              <th className="px-4 py-2">需求单位</th>
              <th className="px-4 py-2">审核状态</th>
              <th className="px-4 py-2 text-center">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-erp-border">
            {subcontracts.map((sub, index) => (
              <tr
                key={sub.id}
                className={`hover:bg-blue-50/30 transition-colors text-xs ${
                  selectedIds.includes(sub.id) ? 'bg-blue-50/50' : ''
                }`}
              >
                <td className="px-4 py-2.5">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-erp-secondary focus:ring-erp-secondary"
                    checked={selectedIds.includes(sub.id)}
                    onChange={() => toggleSelect(sub.id)}
                  />
                </td>
                <td className="px-4 py-2.5 text-center text-erp-text-sub">{index + 1}</td>
                <td className="px-4 py-2.5">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-3.5 h-3.5 text-gray-400" />
                    <span 
                      onClick={() => onView?.(sub)}
                      className="text-erp-text-main cursor-pointer hover:underline font-mono"
                    >
                      {sub.id}
                    </span>
                    {hasHistory(sub.id) && (
                      <History className="w-3 h-3 text-orange-400" title="该单据由拆分或合并生成" />
                    )}
                  </div>
                </td>
                <td className="px-4 py-2.5 font-medium truncate max-w-[300px]">{sub.name}</td>
                <td className="px-4 py-2.5">
                  <div className="flex flex-wrap gap-1">
                    {sub.planIds.map(pid => (
                      <span key={pid} className="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded-[2px] border border-blue-100 text-[10px] font-medium">
                        {pid}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-2.5 text-erp-text-sub">系统管理部</td>
                <td className="px-4 py-2.5">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                    sub.status === '审核通过' ? 'bg-green-100 text-green-600' :
                    sub.status === '待审核' ? 'bg-orange-100 text-orange-600' :
                    sub.status === '编辑中' ? 'bg-gray-100 text-gray-600' :
                    sub.status === '审核不通过' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                  }`}>
                    {sub.status}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <button 
                      onClick={() => onView?.(sub)}
                      className="text-erp-secondary hover:text-blue-700" 
                      title="查看"
                    >
                      <Search className="w-3.5 h-3.5" />
                    </button>
                    <button className="text-erp-secondary hover:text-blue-700" title="设置">
                      <Settings className="w-3.5 h-3.5" />
                    </button>
                    {onApprove && sub.status !== '审核通过' && (
                      <button 
                        onClick={() => onApprove(sub.id)}
                        className="text-green-500 hover:text-green-700" 
                        title="审核通过"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
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
