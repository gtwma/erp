import React, { useState, useMemo } from 'react';
import { Requirement, AuditStatus, ReqProcessStatus } from '../types';
import { X, Search, FileText, CheckCircle2 } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-sm shadow-2xl w-full max-w-4xl flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-erp-border flex items-center justify-between bg-white">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-blue-500" />
            <h3 className="text-sm font-bold text-gray-800">选取采购需求</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-erp-border bg-gray-50/50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="搜索需求单号或内容..."
              className="w-full pl-10 pr-4 py-1.5 border border-erp-border rounded-[2px] text-xs focus:outline-none focus:border-blue-500 bg-white"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto p-4">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10 bg-white">
              <tr className="text-[11px] text-gray-500 border-b border-erp-border font-medium bg-gray-50">
                <th className="px-4 py-2 w-10">
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={selectedIds.length === availableRequirements.length && availableRequirements.length > 0}
                    onChange={(e) => setSelectedIds(e.target.checked ? availableRequirements.map(r => r.id) : [])}
                  />
                </th>
                <th className="px-4 py-2">需求单号</th>
                <th className="px-4 py-2">需求内容</th>
                <th className="px-4 py-2">物料编码</th>
                <th className="px-4 py-2 text-right">数量</th>
                <th className="px-4 py-2">单位</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-erp-border">
              {availableRequirements.map((req) => (
                <tr 
                  key={req.id} 
                  className={`text-xs hover:bg-blue-50/30 transition-colors cursor-pointer ${selectedIds.includes(req.id) ? 'bg-blue-50/50' : ''}`}
                  onClick={() => toggleSelect(req.id)}
                >
                  <td className="px-4 py-2.5" onClick={e => e.stopPropagation()}>
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={selectedIds.includes(req.id)}
                      onChange={() => toggleSelect(req.id)}
                    />
                  </td>
                  <td className="px-4 py-2.5 font-mono text-blue-600">{req.id}</td>
                  <td className="px-4 py-2.5 font-medium text-gray-800">{req.name}</td>
                  <td className="px-4 py-2.5 text-gray-500">{req.materialCode}</td>
                  <td className="px-4 py-2.5 text-right font-bold text-gray-700">{req.qty.toFixed(2)}</td>
                  <td className="px-4 py-2.5 text-gray-500">个</td>
                </tr>
              ))}
              {availableRequirements.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2 text-gray-400">
                      <FileText className="w-10 h-10 opacity-20" />
                      <span className="text-xs">暂无待处理的已审核需求</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-erp-border flex items-center justify-between bg-gray-50/50">
          <span className="text-xs text-gray-500">已选择 <span className="font-bold text-blue-600">{selectedIds.length}</span> 项需求</span>
          <div className="flex items-center space-x-3">
            <button 
              onClick={onClose}
              className="px-4 py-1.5 border border-gray-300 rounded-[2px] text-xs font-medium text-gray-600 hover:bg-gray-50 bg-white transition-colors"
            >
              取消
            </button>
            <button 
              onClick={handleConfirm}
              disabled={selectedIds.length === 0}
              className={`px-6 py-1.5 rounded-[2px] text-xs font-medium transition-all shadow-sm ${
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
