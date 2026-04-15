/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Requirement, Plan, AuditStatus, ReqProcessStatus, PlanProcessStatus } from '../types';
import { X, Search, FileText, Check } from 'lucide-react';

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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-2xl rounded-lg shadow-2xl flex flex-col max-h-[80vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-800">
            选择已审核通过的{type === 'REQ' ? '需求' : '计划'}进行{actionType === 'CHANGE' ? '变更' : '取消'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4 border-b border-gray-50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索编号或名称..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4">
          {filteredDocs.length > 0 ? (
            <div className="grid grid-cols-1 gap-2">
              {filteredDocs.map(doc => (
                <div
                  key={doc.id}
                  onClick={() => onPick(doc.id)}
                  className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-all group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center group-hover:bg-white transition-colors">
                      <FileText className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-800">{doc.id}</div>
                      <div className="text-xs text-gray-500">{doc.name}</div>
                    </div>
                  </div>
                  <div className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Check className="w-5 h-5" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <FileText className="w-12 h-12 mb-4 opacity-20" />
              <p>没有找到可用的已审核通过单据</p>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-lg flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
          >
            取消
          </button>
        </div>
      </div>
    </div>
  );
};
