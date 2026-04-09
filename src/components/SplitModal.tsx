/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Check, AlertCircle, ArrowRight, FileText, History, Plus, Trash2, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Requirement, Plan, LineageRelation } from '../types';

interface SplitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (itemSplits: Record<string, number[]>) => void;
  target: Requirement | Plan | null;
  lineage: LineageRelation[];
  sourceInfo?: string; // e.g. "From REQ-123"
}

export const SplitModal: React.FC<SplitModalProps> = ({ isOpen, onClose, onConfirm, target, lineage, sourceInfo }) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [extractQtys, setExtractQtys] = useState<Record<string, number>>({});

  const items = React.useMemo(() => {
    if (!target) return [];
    return target.items && target.items.length > 0 
      ? target.items 
      : [{ id: 'DEFAULT', materialName: target.name, materialCode: target.materialCode, spec: target.spec, qty: target.qty, unit: '个' }];
  }, [target]);

  // Initialize extract quantities
  React.useEffect(() => {
    if (target && items.length > 0) {
      const initialQtys: Record<string, number> = {};
      items.forEach(item => {
        initialQtys[item.id] = item.qty;
      });
      setExtractQtys(initialQtys);
    }
  }, [target, items]);

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === items.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.map(i => i.id)));
    }
  };

  const updateExtractQty = (id: string, val: string) => {
    const num = parseFloat(val) || 0;
    const item = items.find(i => i.id === id);
    if (!item) return;
    
    // Clamp between 0 and original qty
    const clamped = Math.max(0, Math.min(item.qty, num));
    setExtractQtys(prev => ({ ...prev, [id]: clamped }));
    
    // Auto-select if quantity > 0
    if (clamped > 0 && !selectedIds.has(id)) {
      const next = new Set(selectedIds);
      next.add(id);
      setSelectedIds(next);
    }
  };

  const handleConfirm = () => {
    // Convert to the format expected by confirmSplit: Record<string, [remaining, extracted]>
    const result: Record<string, number[]> = {};
    items.forEach(item => {
      const extract = selectedIds.has(item.id) ? extractQtys[item.id] : 0;
      const remain = Number((item.qty - extract).toFixed(2));
      result[item.id] = [remain, extract];
    });
    onConfirm(result);
  };

  const hasHistory = target ? lineage.some(l => l.targetIds.includes(target.id)) : false;
  const historyRecords = target ? lineage.filter(l => l.targetIds.includes(target.id)) : [];

  if (!isOpen || !target) return null;

  const title = target.id.startsWith('REQ') ? '采购需求拆分 (勾选提取)' : '采购计划拆分 (勾选提取)';
  const anySelected = selectedIds.size > 0;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-white rounded-[2px] shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="px-6 py-3 border-b border-erp-border flex justify-between items-center bg-white">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 mr-2">
                <button
                  disabled={!anySelected}
                  onClick={handleConfirm}
                  className={`px-4 py-1.5 rounded-[2px] text-xs font-medium text-white transition-all ${
                    anySelected ? 'bg-[#2196F3] hover:bg-blue-600 shadow-sm' : 'bg-gray-300 cursor-not-allowed'
                  }`}
                >
                  确认提取拆分
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-1.5 border border-gray-300 rounded-[2px] text-xs font-medium text-gray-600 hover:bg-gray-50 transition-all bg-white"
                >
                  取消
                </button>
              </div>
              <div className="h-6 w-px bg-gray-200 mx-2"></div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-gray-800">{title}</span>
                <div className="flex items-center space-x-3 text-[10px] text-gray-500 mt-0.5">
                  <span>源单据: {target.id}</span>
                  <span className="w-px h-3 bg-gray-300"></span>
                  <span className="text-blue-600 font-medium">提示: 勾选并输入数量，提取至新单据</span>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-auto bg-[#F9FAFB]">
            <div className="p-6">
              <div className="bg-white border border-erp-border rounded-[2px] shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-[#F5F7FA] sticky top-0 z-10">
                    <tr className="text-[11px] text-gray-600 border-b border-erp-border font-medium">
                      <th className="w-12 px-4 py-3 text-center">
                        <input 
                          type="checkbox" 
                          checked={selectedIds.size === items.length && items.length > 0}
                          onChange={toggleSelectAll}
                          className="rounded-sm border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </th>
                      <th className="w-12 px-2 py-3 text-center">序</th>
                      <th className="px-4 py-3">物料信息</th>
                      <th className="w-32 px-4 py-3 text-right">原始数量</th>
                      <th className="w-48 px-4 py-3 text-right">提取数量 (至新单)</th>
                      <th className="w-32 px-4 py-3 text-right">剩余数量 (留原单)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-erp-border">
                    {items.map((item, idx) => {
                      const isSelected = selectedIds.has(item.id);
                      const extractQty = extractQtys[item.id] || 0;
                      const remainingQty = Number((item.qty - (isSelected ? extractQty : 0)).toFixed(2));
                      
                      return (
                        <tr key={item.id} className={`text-[11px] transition-colors ${isSelected ? 'bg-blue-50/20' : 'hover:bg-gray-50/50'}`}>
                          <td className="px-4 py-4 text-center">
                            <input 
                              type="checkbox" 
                              checked={isSelected}
                              onChange={() => toggleSelect(item.id)}
                              className="rounded-sm border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                          </td>
                          <td className="px-2 py-4 text-center text-gray-400">{idx + 1}</td>
                          <td className="px-4 py-4">
                            <div className="flex flex-col space-y-0.5">
                              <span className={`text-xs font-bold truncate ${isSelected ? 'text-blue-700' : 'text-gray-800'}`}>
                                {item.materialName}
                              </span>
                              <span className="text-[10px] text-gray-400 font-mono truncate">
                                {item.materialCode} | {item.spec}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <span className="text-xs font-medium text-gray-600">{item.qty} {item.unit}</span>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <input 
                                type="number"
                                disabled={!isSelected}
                                value={extractQty}
                                onChange={(e) => updateExtractQty(item.id, e.target.value)}
                                className={`w-28 px-2 py-1.5 border rounded text-xs text-right font-mono outline-none transition-all ${
                                  isSelected 
                                    ? 'border-blue-300 bg-white text-blue-700 font-bold focus:ring-1 focus:ring-blue-100' 
                                    : 'border-gray-200 bg-gray-50 text-gray-300 cursor-not-allowed'
                                }`}
                              />
                            </div>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <span className={`text-xs font-mono ${remainingQty > 0 ? 'text-gray-600' : 'text-gray-300 italic'}`}>
                              {remainingQty > 0 ? `${remainingQty} ${item.unit}` : '全部提取'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-gray-50 sticky bottom-0 z-10 border-t border-erp-border">
                    <tr className="text-[11px] font-bold">
                      <td colSpan={4} className="px-4 py-4 text-right text-gray-500">
                        已选择 {selectedIds.size} 项物料进行提取
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex flex-col items-end">
                          <span className="text-[9px] text-gray-400 font-normal">提取总量</span>
                          <span className="text-blue-600 text-sm">
                            {items.reduce((sum, item) => sum + (selectedIds.has(item.id) ? extractQtys[item.id] : 0), 0).toFixed(2)}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex flex-col items-end">
                          <span className="text-[9px] text-gray-400 font-normal">保留总量</span>
                          <span className="text-gray-600 text-sm">
                            {items.reduce((sum, item) => sum + (item.qty - (selectedIds.has(item.id) ? extractQtys[item.id] : 0)), 0).toFixed(2)}
                          </span>
                        </div>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* History Context */}
              {hasHistory && (
                <div className="mt-6 bg-orange-50/30 border border-orange-100 rounded-[2px] p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <History className="w-3.5 h-3.5 text-orange-500" />
                    <span className="text-xs font-bold text-orange-700">历史关联溯源</span>
                  </div>
                  <div className="space-y-1">
                    {historyRecords.map((record, idx) => (
                      <div key={idx} className="text-[10px] text-orange-600/80 pl-5">
                        该单据由 <span className="font-bold">{record.sourceIds.join(', ')}</span> 通过 <span className="font-bold">{record.type === 'REQ_MERGE' ? '合并' : '拆分'}</span> 生成于 {record.timestamp}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
