import React, { useState } from 'react';
import { X, User, Building2 } from 'lucide-react';

interface AssignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (user: string, dept: string) => void;
  targetIds: string[];
}

export const AssignModal: React.FC<AssignModalProps> = ({ isOpen, onClose, onConfirm, targetIds }) => {
  const [user, setUser] = useState('');
  const [dept, setDept] = useState('');

  if (!isOpen) return null;

  const users = ['张三', '李四', '王五', '赵六', '采购员A', '采购员B'];
  const depts = ['采购部', '供应部', '物流部', '财务部'];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        <div className="px-4 py-3 border-b border-erp-border flex items-center justify-between bg-erp-bg">
          <h3 className="font-bold text-erp-primary flex items-center">
            <User className="w-4 h-4 mr-2" />
            一键指派负责人
          </h3>
          <button onClick={onClose} className="text-erp-text-light hover:text-erp-text-main">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="bg-blue-50 p-3 rounded text-xs text-blue-700 mb-4">
            正在为 {targetIds.length} 个计划指派负责人
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-medium text-erp-text-main">采购负责人</label>
            <div className="relative">
              <select
                value={user}
                onChange={(e) => setUser(e.target.value)}
                className="w-full pl-8 pr-3 py-2 border border-erp-border rounded text-sm focus:ring-1 focus:ring-erp-secondary outline-none appearance-none"
              >
                <option value="">请选择负责人</option>
                {users.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
              <User className="w-4 h-4 text-erp-text-light absolute left-2.5 top-2.5" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-medium text-erp-text-main">负责人部门</label>
            <div className="relative">
              <select
                value={dept}
                onChange={(e) => setDept(e.target.value)}
                className="w-full pl-8 pr-3 py-2 border border-erp-border rounded text-sm focus:ring-1 focus:ring-erp-secondary outline-none appearance-none"
              >
                <option value="">请选择部门</option>
                {depts.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <Building2 className="w-4 h-4 text-erp-text-light absolute left-2.5 top-2.5" />
            </div>
          </div>
        </div>

        <div className="px-4 py-3 bg-erp-bg border-t border-erp-border flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-1.5 border border-erp-border rounded text-xs font-medium text-erp-text-main hover:bg-white transition-colors"
          >
            取消
          </button>
          <button
            onClick={() => user && dept && onConfirm(user, dept)}
            disabled={!user || !dept}
            className="px-4 py-1.5 bg-erp-secondary text-white rounded text-xs font-medium hover:bg-erp-secondary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            确认指派
          </button>
        </div>
      </div>
    </div>
  );
};
