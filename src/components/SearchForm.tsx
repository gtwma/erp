/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Search, RotateCcw, X } from 'lucide-react';

interface SearchFormProps {
  onSearch?: () => void;
  onReset?: () => void;
  onClose?: () => void;
}

export const SearchForm: React.FC<SearchFormProps> = ({ onSearch, onReset, onClose }) => {
  return (
    <div className="bg-white p-6 border-b border-erp-border space-y-4">
      <div className="grid grid-cols-3 gap-x-12 gap-y-4">
        <div className="flex items-center space-x-4">
          <label className="w-24 text-right text-xs text-gray-600 shrink-0">采购需求内容:</label>
          <input type="text" className="flex-1 border border-gray-300 rounded-[2px] px-3 py-1.5 text-xs outline-none focus:border-[#2196F3]" />
        </div>
        <div className="flex items-center space-x-4">
          <label className="w-24 text-right text-xs text-gray-600 shrink-0">需求单位:</label>
          <input type="text" className="flex-1 border border-gray-300 rounded-[2px] px-3 py-1.5 text-xs outline-none focus:border-[#2196F3]" />
        </div>
        <div className="flex items-center space-x-4">
          <label className="w-24 text-right text-xs text-gray-600 shrink-0">采购需求编号:</label>
          <input type="text" className="flex-1 border border-gray-300 rounded-[2px] px-3 py-1.5 text-xs outline-none focus:border-[#2196F3]" />
        </div>
        <div className="flex items-center space-x-4">
          <label className="w-24 text-right text-xs text-gray-600 shrink-0">物料名称:</label>
          <input type="text" className="flex-1 border border-gray-300 rounded-[2px] px-3 py-1.5 text-xs outline-none focus:border-[#2196F3]" />
        </div>
        <div className="flex items-center space-x-4">
          <label className="w-24 text-right text-xs text-gray-600 shrink-0">需求负责人:</label>
          <input type="text" className="flex-1 border border-gray-300 rounded-[2px] px-3 py-1.5 text-xs outline-none focus:border-[#2196F3]" />
        </div>
        <div className="flex items-center space-x-4">
          <label className="w-24 text-right text-xs text-gray-600 shrink-0">期望完成日期:</label>
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
