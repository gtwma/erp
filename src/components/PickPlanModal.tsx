import React, { useState } from 'react';
import { Plan, PlanStatus, LineItem } from '../types';
import { X, Search, FileText } from 'lucide-react';

interface PickPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (plan: Plan) => void;
  plans: Plan[];
}

export const PickPlanModal: React.FC<PickPlanModalProps> = ({ isOpen, onClose, onConfirm, plans }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const approvedPlans = plans.filter(p => p.status === PlanStatus.APPROVED || p.status === PlanStatus.SUBCONTRACTED);
  const filteredPlans = approvedPlans.filter(p => 
    p.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-sm shadow-2xl w-full max-w-5xl flex flex-col max-h-[90vh]">
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <h3 className="text-sm font-bold text-gray-800">挑选投资计划</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 border-b border-gray-100 flex justify-end">
          <div className="relative">
            <input 
              type="text" 
              placeholder="请输入采购计划编号" 
              className="pl-8 pr-4 py-1.5 border border-gray-300 rounded-[2px] text-xs w-64 focus:outline-none focus:border-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>
          <button className="bg-[#2196F3] p-1.5 rounded-[2px] text-white hover:bg-blue-600 ml-1">
            <Search className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-4">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-[11px] text-gray-500 border-b border-gray-200">
                <th className="px-4 py-2 w-10"></th>
                <th className="px-4 py-2 w-12 text-center">序</th>
                <th className="px-4 py-2">采购计划编号</th>
                <th className="px-4 py-2">采购计划内容</th>
                <th className="px-4 py-2 text-right">预计采购时间</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredPlans.map((plan, index) => (
                <tr 
                  key={plan.id} 
                  className={`text-xs hover:bg-blue-50/30 cursor-pointer ${selectedId === plan.id ? 'bg-blue-50' : ''}`}
                  onClick={() => setSelectedId(plan.id)}
                >
                  <td className="px-4 py-2.5 text-center">
                    <input 
                      type="radio" 
                      checked={selectedId === plan.id} 
                      onChange={() => setSelectedId(plan.id)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-4 py-2.5 text-center text-gray-400">{index + 1}</td>
                  <td className="px-4 py-2.5 font-mono">{plan.id}</td>
                  <td className="px-4 py-2.5">{plan.name}</td>
                  <td className="px-4 py-2.5 text-right text-gray-500">2025-11-10</td>
                </tr>
              ))}
              {filteredPlans.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-gray-400 italic">暂无符合条件的审核通过计划</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-gray-100 flex justify-center space-x-3 bg-gray-50">
          <button
            disabled={!selectedId}
            onClick={() => {
              const plan = plans.find(p => p.id === selectedId);
              if (plan) onConfirm(plan);
            }}
            className={`px-8 py-2 rounded-[2px] text-xs font-medium transition-colors ${
              !selectedId ? 'bg-gray-300 text-white cursor-not-allowed' : 'bg-[#2196F3] text-white hover:bg-blue-600'
            }`}
          >
            确认选择
          </button>
        </div>
      </div>
    </div>
  );
};
