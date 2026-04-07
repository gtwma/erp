/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Requirement, ReqStatus } from '../types';
import { Search, Filter, Plus, Pencil, Eye, FileText, ChevronRight, X } from 'lucide-react';
import { SearchForm } from './SearchForm';

interface RequirementAppListProps {
  requirements: Requirement[];
  onCreateNew: () => void;
  onView: (req: Requirement) => void;
}

export const RequirementAppList: React.FC<RequirementAppListProps> = ({ requirements, onCreateNew, onView }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(true);

  const filteredReqs = requirements.filter(req => 
    req.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      {/* Search Form */}
      {showSearch && (
        <SearchForm onClose={() => setShowSearch(false)} />
      )}

      {/* Action Bar */}
      <div className="px-4 py-2 border-b border-erp-border flex items-center justify-between bg-gray-50/50">
        <div className="flex items-center space-x-2">
          <button 
            onClick={onCreateNew}
            className="text-xs px-4 py-1.5 rounded-[2px] bg-[#2196F3] text-white hover:bg-blue-600 transition-colors font-medium"
          >
            新增采购需求
          </button>
          {!showSearch && (
            <button 
              onClick={() => setShowSearch(true)}
              className="text-xs px-4 py-1.5 rounded-[2px] border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors bg-white font-medium flex items-center space-x-1"
            >
              <Search className="w-3 h-3" />
              <span>展开搜索</span>
            </button>
          )}
        </div>
        <div className="flex items-center space-x-2 text-erp-text-sub text-xs">
          <span>共 {filteredReqs.length} 条记录</span>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 z-10">
            <tr className="erp-table-header border-b border-erp-border">
              <th className="px-4 py-2 w-10"><input type="checkbox" className="rounded" /></th>
              <th className="px-4 py-2 w-12 text-center">序</th>
              <th className="px-4 py-2">申请编号</th>
              <th className="px-4 py-2">申请内容</th>
              <th className="px-4 py-2">申请人</th>
              <th className="px-4 py-2">申请单位</th>
              <th className="px-4 py-2">申请日期</th>
              <th className="px-4 py-2">审核状态</th>
              <th className="px-4 py-2 text-center">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-erp-border">
            {filteredReqs.map((req, index) => (
              <tr key={req.id} className="hover:bg-blue-50/30 transition-colors text-xs">
                <td className="px-4 py-2.5"><input type="checkbox" className="rounded" /></td>
                <td className="px-4 py-2.5 text-center text-erp-text-sub">{index + 1}</td>
                <td className="px-4 py-2.5">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-3.5 h-3.5 text-gray-400" />
                    <span 
                      onClick={() => onView(req)}
                      className="text-erp-secondary cursor-pointer hover:underline"
                    >
                      {req.id}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-2.5">
                  <div className="flex flex-col">
                    <span className="text-gray-800 font-medium truncate max-w-[250px]">{req.name}</span>
                    <div className="flex items-center space-x-2 mt-0.5">
                      <span className="text-[10px] text-gray-400 bg-gray-50 px-1 rounded border border-gray-100">
                        {req.materialCode}
                      </span>
                      <span className="text-[10px] text-erp-text-sub">
                        数量: <span className="font-bold text-gray-700">{req.qty}</span>
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-2.5">{req.creator}</td>
                <td className="px-4 py-2.5 text-erp-text-sub">系统管理部</td>
                <td className="px-4 py-2.5 text-erp-text-sub">{req.createdAt.split(' ')[0]}</td>
                <td className="px-4 py-2.5">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                    req.status === ReqStatus.DRAFT ? 'bg-gray-100 text-gray-600' :
                    req.status === ReqStatus.PENDING ? 'bg-orange-100 text-orange-600' :
                    req.status === ReqStatus.APPROVED ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                  }`}>
                    {req.status}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-center">
                  <div className="flex items-center justify-center space-x-3">
                    <button 
                      onClick={() => onView(req)}
                      className="text-erp-secondary hover:text-blue-700" 
                      title="查看"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    {req.status === ReqStatus.DRAFT && (
                      <button className="text-erp-secondary hover:text-blue-700" title="编辑"><Pencil className="w-3.5 h-3.5" /></button>
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
