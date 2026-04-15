/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Requirement, Plan, AuditStatus, ReqProcessStatus, PlanProcessStatus } from '../types';
import { X, Search, FileText, Check, Search as SearchIcon } from 'lucide-react';

interface PickApprovedModalProps {
  type: 'REQ' | 'PLAN';
  actionType: 'CHANGE' | 'TERMINATE';
  requirements: Requirement[];
  plans: Plan[];
  onClose: () => void;
  onPick: (id: string) => void;
}

export const PickApprovedModal: React.FC<PickApprovedModalProps> = ({ type, actionType, requirements, plans, onClose, onPick }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const availableDocs = useMemo(() => {
    if (type === 'REQ') {
      return requirements.filter(r => 
        r.auditStatus === AuditStatus.APPROVED && 
        r.processStatus !== ReqProcessStatus.COMPLETED &&
        r.processStatus !== ReqProcessStatus.TERMINATED
      );
    } else {
      return plans.filter(p => 
        p.auditStatus === AuditStatus.APPROVED && 
        p.processStatus !== PlanProcessStatus.SUBCONTRACTED &&
        p.processStatus !== PlanProcessStatus.TERMINATED
      );
    }
  }, [type, requirements, plans]);

  const filteredDocs = availableDocs.filter(doc => 
    doc.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4">
      <div className="bg-white w-full max-w-7xl rounded-sm shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100 bg-white">
          <h3 className="text-sm font-bold text-gray-800">
            选择已审核通过的{type === 'REQ' ? '需求' : '计划'}进行{actionType === 'CHANGE' ? '变更' : '取消'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar - Top Right Style */}
        <div className="px-6 py-3 flex justify-end bg-white border-b border-gray-50">
          <div className="flex items-center border border-gray-300 rounded-sm overflow-hidden focus-within:border-blue-500 transition-colors">
            <div className="pl-3 pr-2 py-1.5 bg-white">
              <SearchIcon className="w-3.5 h-3.5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="请输入单据编号"
              className="w-64 px-2 py-1.5 text-xs outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 transition-colors">
              <SearchIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F8F9FB] text-[11px] text-gray-500 border-b border-gray-200">
                <th className="w-12 px-4 py-3 text-center">
                  <input type="checkbox" className="rounded-sm border-gray-300" disabled />
                </th>
                <th className="w-12 px-2 py-3 text-center">序</th>
                <th className="px-4 py-3 font-medium">标段(包)编号</th>
                <th className="px-4 py-3 font-medium">招标项目名称</th>
                <th className="px-4 py-3 font-medium">标段(包)名称</th>
                <th className="px-4 py-3 font-medium">标段(包)分类</th>
                <th className="px-4 py-3 font-medium">招标方式</th>
                <th className="px-4 py-3 font-medium text-right">合同预算价</th>
                <th className="px-4 py-3 font-medium text-center">标段(包)状态</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredDocs.map((doc, index) => (
                <tr
                  key={doc.id}
                  className="text-[11px] hover:bg-blue-50/40 cursor-pointer transition-colors group"
                  onClick={() => onPick(doc.id)}
                >
                  <td className="px-4 py-3 text-center">
                    <input type="checkbox" className="rounded-sm border-gray-300" />
                  </td>
                  <td className="px-2 py-3 text-center text-gray-400">{index + 1}</td>
                  <td className="px-4 py-3 text-gray-600 font-mono">{doc.id}</td>
                  <td className="px-4 py-3 text-gray-800">【采购项目】{doc.name}</td>
                  <td className="px-4 py-3 text-gray-800">{doc.name}<span className="text-red-500 ml-1">(网)</span></td>
                  <td className="px-4 py-3 text-gray-500">材料设备</td>
                  <td className="px-4 py-3 text-gray-500">公开招标</td>
                  <td className="px-4 py-3 text-right text-gray-700 font-medium">{(doc.qty * (doc.unitPrice || 100)).toLocaleString()}元</td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">审核通过</span>
                  </td>
                </tr>
              ))}
              {filteredDocs.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-20 text-center text-gray-400">
                    <div className="flex flex-col items-center">
                      <FileText className="w-10 h-10 mb-2 opacity-20" />
                      <p className="text-xs">暂无符合条件的单据</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-gray-100 bg-white flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs border border-gray-300 rounded-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
          <button
            className="px-4 py-1.5 text-xs bg-blue-500 text-white rounded-sm hover:bg-blue-600 transition-colors shadow-sm"
            onClick={() => {
              if (filteredDocs.length > 0) onPick(filteredDocs[0].id);
            }}
          >
            确定
          </button>
        </div>
      </div>
    </div>
  );
};
