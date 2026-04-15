import React, { useState, useMemo } from 'react';
import { Subcontract, LineageRelation, SearchParams } from '../types';
import { StatusBadge } from './StatusBadge';
import { Search, Filter, Package, ArrowRight, X, Check, ClipboardList, Edit3, Eye, FileText, History, Pencil, Settings, CheckCircle2, Trash2, Plus, Briefcase, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SearchForm } from './SearchForm';

interface SubcontractPoolProps {
  subcontracts: Subcontract[];
  lineage: LineageRelation[];
  onBack?: () => void;
  onView?: (sub: Subcontract) => void;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onDelete?: (id: string) => void;
  onCreateProject?: (subs: Subcontract[]) => void;
}

export const SubcontractPool: React.FC<SubcontractPoolProps> = ({ subcontracts, lineage, onBack, onView, onApprove, onReject, onDelete, onCreateProject }) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchParams, setSearchParams] = useState<SearchParams>({
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const hasHistory = (id: string) => lineage.some(l => l.targetIds.includes(id));

  const activeSubcontracts = useMemo(() => {
    let filtered = [...subcontracts];

    // Apply filters
    if (searchParams.content) {
      filtered = filtered.filter(s => s.name.toLowerCase().includes(searchParams.content!.toLowerCase()));
    }
    if (searchParams.id) {
      filtered = filtered.filter(s => s.id.toLowerCase().includes(searchParams.id!.toLowerCase()));
    }
    if (searchParams.dept) {
      filtered = filtered.filter(s => '系统管理部'.toLowerCase().includes(searchParams.dept!.toLowerCase()));
    }
    if (searchParams.status) {
      filtered = filtered.filter(s => s.status === searchParams.status);
    }
    if (searchParams.date) {
      filtered = filtered.filter(s => s.createdAt.includes(searchParams.date!));
    }

    // Apply sorting
    const { sortBy, sortOrder } = searchParams;
    filtered.sort((a, b) => {
      let valA: any = a[sortBy as keyof Subcontract] || '';
      let valB: any = b[sortBy as keyof Subcontract] || '';

      if (sortBy === 'createdAt') {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [subcontracts, searchParams]);

  const selectedSubcontracts = useMemo(() => 
    activeSubcontracts.filter(s => selectedIds.includes(s.id)),
  [selectedIds, activeSubcontracts]);

  const isSamePlan = useMemo(() => {
    if (selectedSubcontracts.length <= 1) return true;
    const firstPlanIds = [...selectedSubcontracts[0].planIds].sort().join(',');
    return selectedSubcontracts.every(s => [...s.planIds].sort().join(',') === firstPlanIds);
  }, [selectedSubcontracts]);

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      {/* Search Form */}
      <SearchForm 
        type="SUB" 
        onSearch={setSearchParams}
        onReset={() => setSearchParams({ sortBy: 'createdAt', sortOrder: 'desc' })}
      />

      {/* Action Bar */}
      <div className="bg-gray-50 border-b border-erp-border px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button 
            onClick={onBack}
            className="flex items-center space-x-1.5 px-4 py-1.5 bg-erp-secondary text-white text-xs font-medium rounded-[2px] hover:bg-blue-600 transition-all shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>新增分包</span>
          </button>

          <button
            onClick={() => {
              if (selectedSubcontracts.length > 0) onCreateProject?.(selectedSubcontracts);
            }}
            disabled={selectedIds.length === 0 || !isSamePlan}
            title={!isSamePlan ? "不同计划的分包不能一起进行立项" : ""}
            className={`px-4 py-1.5 rounded-[2px] text-xs font-medium transition-colors shadow-sm flex items-center space-x-1.5 ${
              selectedIds.length === 0 || !isSamePlan ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>生成采购立项</span>
          </button>

          <button
            onClick={() => {
              if (window.confirm('确定要删除选中的分包吗？相关物料将返回至原始计划。')) {
                selectedIds.forEach(id => onDelete?.(id));
                setSelectedIds([]);
              }
            }}
            disabled={selectedIds.length === 0}
            className={`px-4 py-1.5 rounded-[2px] text-xs font-medium border transition-colors flex items-center space-x-1.5 ${
              selectedIds.length === 0 ? 'border-gray-200 text-gray-300 cursor-not-allowed bg-white' : 'border-red-200 text-red-600 hover:bg-red-50 bg-white shadow-sm'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>删除分包</span>
          </button>

          <div className="h-4 w-[1px] bg-gray-300 mx-2" />
          
          <span className="text-xs font-medium text-erp-text-sub">
            {selectedIds.length > 0 ? `已选择 ${selectedIds.length} 项` : '未选择项'}
          </span>
          
          {!isSamePlan && (
            <div className="flex items-center space-x-1.5 px-3 py-1 bg-red-50 text-red-600 rounded border border-red-100 animate-pulse">
              <AlertCircle className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold">注意：所选分包属于不同计划，无法合并立项</span>
            </div>
          )}
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
                  checked={selectedIds.length === activeSubcontracts.length && activeSubcontracts.length > 0}
                  onChange={(e) =>
                    setSelectedIds(e.target.checked ? activeSubcontracts.map((r) => r.id) : [])
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
            {activeSubcontracts.map((sub, index) => (
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
                    <button 
                      onClick={() => {
                        if (window.confirm('确定要删除该分包吗？相关物料将返回至原始计划。')) {
                          onDelete?.(sub.id);
                        }
                      }}
                      className="text-red-500 hover:text-red-700" 
                      title="删除"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    {onApprove && sub.status !== '审核通过' && (
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => onApprove(sub.id)}
                          className="text-green-500 hover:text-green-700" 
                          title="审核通过"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => onReject?.(sub.id)}
                          className="text-red-500 hover:text-red-700" 
                          title="审核不通过"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
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
