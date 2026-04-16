import React, { useState, useMemo } from 'react';
import { Requirement, AuditStatus, ReqProcessStatus } from '../types';
import { X, Search, FileText, CheckCircle2, Search as SearchIcon } from 'lucide-react';

interface PickRequirementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (requirements: Requirement[]) => void;
  requirements: Requirement[];
}

export const PickRequirementModal: React.FC<PickRequirementModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  requirements,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const availableRequirements = useMemo(() => {
    return requirements.filter(req => 
      req.auditStatus === AuditStatus.APPROVED && 
      req.processStatus === ReqProcessStatus.NORMAL && 
      (req.qty - (req.assignedQty || 0)) > 0 &&
      (req.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
       req.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [requirements, searchTerm]);

  if (!isOpen) return null;

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleConfirm = () => {
    const selected = requirements.filter(r => selectedIds.includes(r.id));
    onConfirm(selected);
    setSelectedIds([]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4">
      <div className="bg-white rounded-sm shadow-2xl w-full max-w-7xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-3 border-b border-gray-100 flex items-center justify-between bg-white">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-blue-500" />
            <h3 className="text-sm font-bold text-gray-800">选取采购需求</h3>
          </div>
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
              placeholder="请输入需求单号"
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
                  <input 
                    type="checkbox" 
                    className="rounded-sm border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={selectedIds.length === availableRequirements.length && availableRequirements.length > 0}
                    onChange={(e) => setSelectedIds(e.target.checked ? availableRequirements.map(r => r.id) : [])}
                  />
                </th>
                <th className="w-12 px-2 py-3 text-center">序</th>
                <th className="px-4 py-3 font-medium">需求编号</th>
                <th className="px-4 py-3 font-medium">需求名称</th>
                <th className="px-4 py-3 font-medium">需求类型</th>
                <th className="px-4 py-3 font-medium">创建日期</th>
                <th className="px-4 py-3 font-medium text-right">预算金额</th>
                <th className="px-4 py-3 font-medium text-center">状态</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {availableRequirements.map((req, index) => (
                <tr 
                  key={req.id} 
                  className={`text-[11px] hover:bg-blue-50/40 cursor-pointer transition-colors ${selectedIds.includes(req.id) ? 'bg-blue-50/20' : ''}`}
                  onClick={() => toggleSelect(req.id)}
                >
                  <td className="px-4 py-3 text-center" onClick={e => e.stopPropagation()}>
                    <input 
                      type="checkbox" 
                      className="rounded-sm border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={selectedIds.includes(req.id)}
                      onChange={() => toggleSelect(req.id)}
                    />
                  </td>
                  <td className="px-2 py-3 text-center text-gray-400">{index + 1}</td>
                  <td className="px-4 py-3 text-blue-600 font-mono">{req.id}</td>
                  <td className="px-4 py-3 text-gray-800">{req.name}</td>
                  <td className="px-4 py-3 text-gray-500">材料设备</td>
                  <td className="px-4 py-3 text-gray-500">{req.createdAt.split(' ')[0]}</td>
                  <td className="px-4 py-3 text-right text-gray-700 font-medium">{(req.qty * (req.unitPrice || 100)).toLocaleString()}元</td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">审核通过</span>
                  </td>
                </tr>
              ))}
              {availableRequirements.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-20 text-center text-gray-400">
                    <div className="flex flex-col items-center">
                      <FileText className="w-10 h-10 mb-2 opacity-20" />
                      <p className="text-xs">暂无待处理的已审核需求</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-gray-100 bg-white flex items-center justify-between">
          <span className="text-[11px] text-gray-500">已选择 <span className="font-bold text-blue-600">{selectedIds.length}</span> 项需求</span>
          <div className="flex items-center space-x-3">
            <button 
              onClick={onClose}
              className="px-4 py-1.5 border border-gray-300 rounded-sm text-xs font-medium text-gray-600 hover:bg-gray-50 bg-white transition-colors"
            >
              取消
            </button>
            <button 
              onClick={handleConfirm}
              disabled={selectedIds.length === 0}
              className={`px-6 py-1.5 rounded-sm text-xs font-medium transition-all shadow-sm ${
                selectedIds.length === 0 
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                  : 'bg-blue-500 text-white hover:bg-blue-600 active:scale-95'
              }`}
            >
              确认添加
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
