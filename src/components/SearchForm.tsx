/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Search, RotateCcw, X, ChevronDown, ChevronUp } from 'lucide-react';
import { SearchParams } from '../types';

interface SearchFormProps {
  type?: 'REQ' | 'PLAN' | 'SUB';
  onSearch?: (params: SearchParams) => void;
  onReset?: () => void;
  onClose?: () => void;
}

export const SearchForm: React.FC<SearchFormProps> = ({ type = 'REQ', onSearch, onReset, onClose }) => {
  const [params, setParams] = useState<SearchParams>({
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [showAdvanced, setShowAdvanced] = useState(false);

  const labels = {
    REQ: { content: '采购需求内容', id: '采购需求编号', person: '需求负责人' },
    PLAN: { content: '采购计划内容', id: '采购计划编号', person: '计划负责人' },
    SUB: { content: '分包名称', id: '分包单号', person: '分包负责人' }
  }[type];

  const handleInputChange = (field: keyof SearchParams, value: string) => {
    setParams(prev => ({ ...prev, [field]: value }));
  };

  const handleReset = () => {
    setParams({
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
    onReset?.();
  };

  return (
    <div className="bg-white p-6 border-b border-erp-border space-y-4">
      <div className="grid grid-cols-3 gap-x-12 gap-y-4">
        <div className="flex items-center space-x-4">
          <label className="w-24 text-right text-xs text-gray-600 shrink-0">{labels.content}:</label>
          <input 
            type="text" 
            className="flex-1 border border-gray-300 rounded-[2px] px-3 py-1.5 text-xs outline-none focus:border-[#2196F3]" 
            value={params.content || ''}
            onChange={e => handleInputChange('content', e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-4">
          <label className="w-24 text-right text-xs text-gray-600 shrink-0">单位:</label>
          <input 
            type="text" 
            className="flex-1 border border-gray-300 rounded-[2px] px-3 py-1.5 text-xs outline-none focus:border-[#2196F3]" 
            value={params.dept || ''}
            onChange={e => handleInputChange('dept', e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-4">
          <label className="w-24 text-right text-xs text-gray-600 shrink-0">{labels.id}:</label>
          <input 
            type="text" 
            className="flex-1 border border-gray-300 rounded-[2px] px-3 py-1.5 text-xs outline-none focus:border-[#2196F3]" 
            value={params.id || ''}
            onChange={e => handleInputChange('id', e.target.value)}
          />
        </div>
        
        {showAdvanced && (
          <>
            <div className="flex items-center space-x-4">
              <label className="w-24 text-right text-xs text-gray-600 shrink-0">物料名称:</label>
              <input 
                type="text" 
                className="flex-1 border border-gray-300 rounded-[2px] px-3 py-1.5 text-xs outline-none focus:border-[#2196F3]" 
                value={params.materialName || ''}
                onChange={e => handleInputChange('materialName', e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-4">
              <label className="w-24 text-right text-xs text-gray-600 shrink-0">{labels.person}:</label>
              <input 
                type="text" 
                className="flex-1 border border-gray-300 rounded-[2px] px-3 py-1.5 text-xs outline-none focus:border-[#2196F3]" 
                value={params.person || ''}
                onChange={e => handleInputChange('person', e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-4">
              <label className="w-24 text-right text-xs text-gray-600 shrink-0">日期:</label>
              <input 
                type="date" 
                className="flex-1 border border-gray-300 rounded-[2px] px-3 py-1.5 text-xs outline-none focus:border-[#2196F3]" 
                value={params.date || ''}
                onChange={e => handleInputChange('date', e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-4">
              <label className="w-24 text-right text-xs text-gray-600 shrink-0">状态:</label>
              <select 
                className="flex-1 border border-gray-300 rounded-[2px] px-3 py-1.5 text-xs outline-none focus:border-[#2196F3] bg-white"
                value={params.status || ''}
                onChange={e => handleInputChange('status', e.target.value)}
              >
                <option value="">全部</option>
                <optgroup label="审核状态">
                  <option value="编辑中">编辑中</option>
                  <option value="待审核">待审核</option>
                  <option value="审核通过">审核通过</option>
                  <option value="审核不通过">审核不通过</option>
                </optgroup>
                <optgroup label="业务状态">
                  <option value="已合并">已合并</option>
                  <option value="已拆分">已拆分</option>
                  <option value="已指派">已指派</option>
                  <option value="已转计划">已转计划</option>
                  <option value="已组建分包">已组建分包</option>
                </optgroup>
              </select>
            </div>
          </>
        )}

        <div className="flex items-center space-x-4">
          <label className="w-24 text-right text-xs text-gray-600 shrink-0">排序字段:</label>
          <select 
            className="flex-1 border border-gray-300 rounded-[2px] px-3 py-1.5 text-xs outline-none focus:border-[#2196F3] bg-white"
            value={params.sortBy}
            onChange={e => handleInputChange('sortBy', e.target.value)}
          >
            <option value="createdAt">创建时间</option>
            <option value="id">单据编号</option>
            <option value="name">内容/名称</option>
          </select>
        </div>
        <div className="flex items-center space-x-4">
          <label className="w-24 text-right text-xs text-gray-600 shrink-0">排序方式:</label>
          <select 
            className="flex-1 border border-gray-300 rounded-[2px] px-3 py-1.5 text-xs outline-none focus:border-[#2196F3] bg-white"
            value={params.sortOrder}
            onChange={e => handleInputChange('sortOrder', e.target.value as 'asc' | 'desc')}
          >
            <option value="desc">降序</option>
            <option value="asc">升序</option>
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        <button 
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-xs text-blue-500 flex items-center space-x-1 hover:underline"
        >
          {showAdvanced ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          <span>{showAdvanced ? '收起高级搜索' : '展开高级搜索'}</span>
        </button>
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => onSearch?.(params)}
            className="px-8 py-1.5 bg-[#2196F3] text-white rounded-[2px] text-xs font-medium hover:bg-blue-600 transition-colors flex items-center space-x-1.5"
          >
            <Search className="w-3.5 h-3.5" />
            <span>搜索</span>
          </button>
          <button 
            onClick={handleReset}
            className="px-8 py-1.5 border border-gray-300 text-gray-600 rounded-[2px] text-xs font-medium hover:bg-gray-50 transition-colors bg-white flex items-center space-x-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>重置</span>
          </button>
          <button 
            onClick={onClose}
            className="px-8 py-1.5 border border-gray-300 text-gray-600 rounded-[2px] text-xs font-medium hover:bg-gray-50 transition-colors bg-white flex items-center space-x-1.5"
          >
            <X className="w-3.5 h-3.5" />
            <span>关闭</span>
          </button>
        </div>
      </div>
    </div>
  );
};
