/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ChevronDown, FileText, Upload, HelpCircle, ChevronLeft, ChevronRight } from 'lucide-react';

export const InventorySection: React.FC<{ materialName?: string; materialCode?: string }> = ({ materialName, materialCode }) => {
  return (
    <div className="bg-white border border-erp-border rounded-[2px] shadow-sm overflow-hidden">
      <div className="px-4 py-2.5 border-b border-erp-border flex items-center justify-between bg-white">
        <div className="flex items-center space-x-2">
          <span className="text-blue-500 font-bold text-xs">03</span>
          <span className="text-blue-500 font-bold text-xs">库存信息</span>
        </div>
        <ChevronDown className="w-4 h-4 text-gray-300" />
      </div>
      <div className="p-4 space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#F5F7FA]">
              <tr className="text-[11px] text-gray-600 border-b border-erp-border font-medium">
                <th className="w-12 px-4 py-3 text-center">序</th>
                <th className="px-4 py-3">仓库名称</th>
                <th className="px-4 py-3">仓库所属单位</th>
                <th className="px-4 py-3">责任人</th>
                <th className="px-4 py-3">物料名称</th>
                <th className="px-4 py-3">物料编码</th>
                <th className="px-4 py-3 text-right">库存数量</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-erp-border">
              <tr className="text-[11px] hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-center text-gray-400">1</td>
                <td className="px-4 py-3 text-gray-800">中心仓库</td>
                <td className="px-4 py-3 text-gray-800">系统管理部</td>
                <td className="px-4 py-3 text-gray-800">系统管理员</td>
                <td className="px-4 py-3 text-gray-800 font-medium">{materialName || '--'}</td>
                <td className="px-4 py-3 text-gray-600 font-mono">{materialCode || '--'}</td>
                <td className="px-4 py-3 text-right font-bold text-gray-700">100.00</td>
              </tr>
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="flex items-center justify-end space-x-2 text-[10px] text-gray-500 pt-2">
          <div className="flex items-center border border-gray-200 rounded-[2px] overflow-hidden">
            <button className="px-2 py-1 hover:bg-gray-50 border-r border-gray-200 disabled:opacity-50" disabled>
              <ChevronLeft className="w-3 h-3" />
            </button>
            <button className="px-2 py-1 hover:bg-gray-50 disabled:opacity-50" disabled>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="flex items-center space-x-1">
            <select className="border border-gray-200 rounded-[2px] px-1 py-0.5 outline-none bg-white">
              <option>10 条/页</option>
            </select>
          </div>
          <div className="flex items-center space-x-1">
            <span>跳至</span>
            <input type="text" className="w-8 border border-gray-200 rounded-[2px] px-1 py-0.5 text-center outline-none bg-white" defaultValue="1" />
            <span>页</span>
          </div>
          <span>共0条</span>
        </div>
      </div>
    </div>
  );
};

export const AttachmentSection: React.FC = () => {
  return (
    <div className="bg-white border border-erp-border rounded-[2px] shadow-sm overflow-hidden">
      <div className="px-4 py-2.5 border-b border-erp-border flex items-center justify-between bg-white">
        <div className="flex items-center space-x-2">
          <span className="text-blue-500 font-bold text-xs">04</span>
          <span className="text-blue-500 font-bold text-xs">相关电子文件</span>
        </div>
        <ChevronDown className="w-4 h-4 text-gray-300" />
      </div>
      <div className="p-4">
        <div className="border border-erp-border rounded-[2px] overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#5897D6] text-white">
              <tr className="text-[11px] font-medium">
                <th className="px-4 py-2 border-r border-blue-400/30 w-1/4">电子文件名称</th>
                <th className="px-4 py-2 border-r border-blue-400/30 w-1/3">电子文件列表</th>
                <th className="px-4 py-2 border-r border-blue-400/30 text-center">电子文件模板</th>
                <th className="px-4 py-2 border-r border-blue-400/30 text-center">电子文件管理</th>
                <th className="px-4 py-2 text-center">说明</th>
              </tr>
            </thead>
            <tbody>
              <tr className="text-[11px] border-b border-erp-border last:border-0">
                <td className="px-4 py-3 text-gray-700">采购需求申请相关附件</td>
                <td className="px-4 py-3 text-gray-400 italic">无电子文件</td>
                <td className="px-4 py-3 text-center text-gray-400">暂无模板</td>
                <td className="px-4 py-3 text-center">
                  <button className="inline-flex items-center space-x-1 text-blue-500 hover:text-blue-600 font-medium">
                    <Upload className="w-3 h-3" />
                    <span>上传</span>
                  </button>
                </td>
                <td className="px-4 py-3 text-center">
                  <HelpCircle className="w-3.5 h-3.5 text-blue-400 mx-auto cursor-help" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export const ProcessHistorySection: React.FC = () => {
  return (
    <div className="bg-white border border-erp-border rounded-[2px] shadow-sm overflow-hidden">
      <div className="px-4 py-2.5 border-b border-erp-border flex items-center justify-between bg-white">
        <div className="flex items-center space-x-2">
          <span className="text-blue-500 font-bold text-xs">05</span>
          <span className="text-blue-500 font-bold text-xs">处理历史</span>
        </div>
        <ChevronDown className="w-4 h-4 text-gray-300" />
      </div>
      <div className="p-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#F5F7FA]">
              <tr className="text-[11px] text-gray-600 border-b border-erp-border font-medium">
                <th className="px-4 py-3">步骤</th>
                <th className="px-4 py-3">办理人员</th>
                <th className="px-4 py-3">收到时间</th>
                <th className="px-4 py-3">处理时间</th>
                <th className="px-4 py-3">处理意见</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-erp-border">
              <tr className="text-[11px] hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-gray-800">提交申请</td>
                <td className="px-4 py-3 text-gray-800">系统管理员</td>
                <td className="px-4 py-3 text-gray-500">2026-04-15 11:30:00</td>
                <td className="px-4 py-3 text-gray-500">2026-04-15 11:30:05</td>
                <td className="px-4 py-3 text-gray-800">发起采购需求申请</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
