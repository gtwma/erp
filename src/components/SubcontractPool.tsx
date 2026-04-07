import React, { useState } from 'react';
import { Subcontract } from '../types';
import { StatusBadge } from './StatusBadge';
import { Search, Filter, Package, ArrowRight, X, Check, ClipboardList, Edit3, Eye, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SubcontractPoolProps {
  subcontracts: Subcontract[];
  onBack?: () => void;
}

export const SubcontractPool: React.FC<SubcontractPoolProps> = ({ subcontracts, onBack }) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      {/* Top Toolbar */}
      <div className="px-4 py-2 border-b border-erp-border flex items-center justify-between bg-gray-50/50">
        <div className="flex items-center space-x-4">
          {onBack && (
            <button 
              onClick={onBack}
              className="flex items-center space-x-1 text-erp-secondary hover:text-blue-700 font-medium text-xs"
            >
              <ArrowRight className="w-3.5 h-3.5 rotate-180" />
              <span>返回计划池</span>
            </button>
          )}
          <div className="h-4 w-[1px] bg-gray-300" />
          <div className="flex items-center space-x-2">
            <Package className="w-4 h-4 text-erp-secondary" />
            <span className="text-xs font-bold text-gray-700">分包管理列表</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="relative">
            <input 
              type="text" 
              placeholder="搜索分包单号/名称..." 
              className="pl-8 pr-4 py-1.5 border border-erp-border rounded-[2px] text-xs w-64 focus:outline-none focus:border-erp-secondary"
            />
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>
          <button className="p-1.5 border border-erp-border rounded-[2px] hover:bg-white bg-gray-50 transition-colors">
            <Filter className="w-3.5 h-3.5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Action Bar */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-green-50 border-b border-green-100 px-4 py-2 flex items-center justify-between"
          >
            <div className="flex items-center space-x-4">
              <span className="text-xs font-medium text-green-700">已选择 {selectedIds.length} 项</span>
              <button
                className="flex items-center space-x-1.5 text-xs font-bold text-green-600 hover:text-green-800"
              >
                <FileText className="w-3 h-3" />
                <span>生成采购合同</span>
              </button>
            </div>
            <button onClick={() => setSelectedIds([])} className="text-gray-400 hover:text-gray-600">
              <X className="w-3 h-3" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

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
              <th className="px-4 py-2 text-center">包含计划数</th>
              <th className="px-4 py-2">创建时间</th>
              <th className="px-4 py-2">状态</th>
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
                <td className="px-4 py-2.5 text-erp-secondary hover:underline cursor-pointer">{sub.id}</td>
                <td className="px-4 py-2.5 font-bold">{sub.name}</td>
                <td className="px-4 py-2.5 text-center font-mono">{sub.planIds.length}</td>
                <td className="px-4 py-2.5 text-erp-text-sub">{sub.createdAt}</td>
                <td className="px-4 py-2.5">
                  <span className="text-blue-500 font-medium">{sub.status}</span>
                </td>
                <td className="px-4 py-2.5 text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <button className="text-erp-secondary hover:text-blue-700" title="修改">
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button className="text-erp-secondary hover:text-blue-700" title="查看">
                      <Eye className="w-3.5 h-3.5" />
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
