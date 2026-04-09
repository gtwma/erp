/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Search, RotateCcw, X } from 'lucide-react';

interface SearchFormProps {
  type?: 'REQ' | 'PLAN' | 'SUB';
  onSearch?: () => void;
  onReset?: () => void;
  onClose?: () => void;
}

export const SearchForm: React.FC<SearchFormProps> = ({ type = 'REQ', onSearch, onReset, onClose }) => {
  const labels = {
    REQ: { content: '采购需求内容', id: '采购需求编号', person: '需求负责人' },
    PLAN: { content: '采购计划内容', id: '采购计划编号', person: '计划负责人' },
    SUB: { content: '分包名称', id: '分包单号', person: '分包负责人' }
  }[type];

  return (
    <div className="bg-white p-6 border-b border-erp-border space-y-4">
      <div className="grid grid-cols-3 gap-x-12 gap-y-4">
        <div className="flex items-center space-x-4">
          <label className="w-24 text-right text-xs text-gray-600 shrink-0">{labels.content}:</label>
          <input type="text" className="flex-1 border border-gray-300 rounded-[2px] px-3 py-1.5 text-xs outline-none focus:border-[#2196F3]" />
        </div>
        <div className="flex items-center space-x-4">
          <label className="w-24 text-right text-xs text-gray-600 shrink-0">单位:</label>
          <input type="text" className="flex-1 border border-gray-300 rounded-[2px] px-3 py-1.5 text-xs outline-none focus:border-[#2196F3]" />
        </div>
        <div className="flex items-center space-x-4">
          <label className="w-24 text-right text-xs text-gray-600 shrink-0">{labels.id}:</label>
          <input type="text" className="flex-1 border border-gray-300 rounded-[2px] px-3 py-1.5 text-xs outline-none focus:border-[#2196F3]" />
        </div>
        <div className="flex items-center space-x-4">
          <label className="w-24 text-right text-xs text-gray-600 shrink-0">物料名称:</label>
          <input type="text" className="flex-1 border border-gray-300 rounded-[2px] px-3 py-1.5 text-xs outline-none focus:border-[#2196F3]" />
        </div>
        <div className="flex items-center space-x-4">
          <label className="w-24 text-right text-xs text-gray-600 shrink-0">{labels.person}:</label>
          <input type="text" className="flex-1 border border-gray-300 rounded-[2px] px-3 py-1.5 text-xs outline-none focus:border-[#2196F3]" />
        </div>
        <div className="flex items-center space-x-4">
          <label className="w-24 text-right text-xs text-gray-600 shrink-0">日期:</label>
          <input type="date" className="flex-1 border border-gray-300 rounded-[2px] px-3 py-1.5 text-xs outline-none focus:border-[#2196F3]" />
        </div>
      </div>

      <div className="flex items-center justify-center space-x-3 pt-2">
        <button 
          onClick={onSearch}
          className="px-8 py-1.5 bg-[#2196F3] text-white rounded-[2px] text-xs font-medium hover:bg-blue-600 transition-colors"
        >
          搜索
        </button>
        <button 
          onClick={onReset}
          className="px-8 py-1.5 border border-gray-300 text-gray-600 rounded-[2px] text-xs font-medium hover:bg-gray-50 transition-colors bg-white"
        >
          重置
        </button>
        <button 
          onClick={onClose}
          className="px-8 py-1.5 border border-gray-300 text-gray-600 rounded-[2px] text-xs font-medium hover:bg-gray-50 transition-colors bg-white"
        >
          关闭
        </button>
      </div>
    </div>
  );
};
