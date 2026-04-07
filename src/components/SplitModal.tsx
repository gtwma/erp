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
  onConfirm: (splits: number[]) => void;
  target: Requirement | Plan | null;
  lineage: LineageRelation[];
  sourceInfo?: string; // e.g. "From REQ-123"
}

export const SplitModal: React.FC<SplitModalProps> = ({ isOpen, onClose, onConfirm, target, lineage, sourceInfo }) => {
  const originalQty = target?.qty || 0;
  const [splits, setSplits] = useState<number[]>([originalQty / 2, originalQty / 2]);

  const hasHistory = target ? lineage.some(l => l.targetIds.includes(target.id)) : false;
  const historyRecords = target ? lineage.filter(l => l.targetIds.includes(target.id)) : [];

  const total = splits.reduce((a, b) => a + b, 0);
  const isValid = Math.abs(total - originalQty) < 0.000001;

  const updateSplit = (index: number, val: string) => {
    const num = parseFloat(val) || 0;
    const newSplits = [...splits];
    newSplits[index] = num;
    setSplits(newSplits);
  };

  const addSplit = () => {
    setSplits([...splits, 0]);
  };

  const removeSplit = (index: number) => {
    if (splits.length <= 2) return;
    setSplits(splits.filter((_, i) => i !== index));
  };

  if (!isOpen || !target) return null;

  const title = target.id.startsWith('REQ') ? '采购需求拆分' : '采购计划拆分';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-white rounded-[2px] shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="px-6 py-3 border-b border-erp-border flex justify-between items-center bg-white">
            <div className="flex items-center space-x-3">
              <span className="text-sm font-bold text-gray-800">{title}</span>
              <div className="flex items-center space-x-2 text-[10px] text-gray-500">
                <span>单据编号: {target.id}</span>
                <span className="w-px h-3 bg-gray-300"></span>
                <span>状态: <span className="text-blue-500">编辑中</span></span>
              </div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-auto p-6 space-y-6 bg-[#F9FAFB]">
            <div className="max-w-5xl mx-auto space-y-6">
              
              {/* Section 01: Source Info */}
              <div className="bg-white border border-erp-border rounded-[2px] shadow-sm overflow-hidden">
                <div className="px-4 py-2.5 border-b border-erp-border flex items-center justify-between bg-white">
                  <div className="flex items-center space-x-2">
                    <span className="text-blue-500 font-bold text-xs">01</span>
                    <span className="text-blue-500 font-bold text-xs">源单据基本信息</span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-300" />
                </div>
                
                <div className="p-6 grid grid-cols-3 gap-y-6 gap-x-12">
                  <div className="col-span-3 flex items-start space-x-4">
                    <span className="w-24 text-right text-xs text-gray-500 shrink-0">物料名称:</span>
                    <span className="text-xs text-gray-800 font-medium leading-relaxed">{target.name}</span>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <span className="w-24 text-right text-xs text-gray-500 shrink-0">物料编码:</span>
                    <span className="text-xs text-gray-800 font-mono">{target.materialCode}</span>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <span className="w-24 text-right text-xs text-gray-500 shrink-0">规格型号:</span>
                    <span className="text-xs text-gray-800">{target.spec}</span>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <span className="w-24 text-right text-xs text-gray-500 shrink-0">单据编号:</span>
                    <span className="text-xs text-blue-600 font-mono font-medium">{target.id}</span>
                  </div>

                  <div className="flex items-center space-x-4">
                    <span className="w-24 text-right text-xs text-gray-500 shrink-0">原始数量:</span>
                    <span className="text-sm font-bold text-blue-600">{originalQty.toFixed(2)}</span>
                  </div>

                  <div className="flex items-center space-x-4">
                    <span className="w-24 text-right text-xs text-gray-500 shrink-0">需求单位:</span>
                    <span className="text-xs text-gray-800">系统管理部</span>
                  </div>
                </div>
              </div>

              {/* Section 02: Lineage Context (If exists) */}
              {hasHistory && (
                <div className="bg-white border border-erp-border rounded-[2px] shadow-sm overflow-hidden">
                  <div className="px-4 py-2.5 border-b border-erp-border flex items-center justify-between bg-white">
                    <div className="flex items-center space-x-2">
                      <span className="text-blue-500 font-bold text-xs">02</span>
                      <span className="text-blue-500 font-bold text-xs">历史关联溯源</span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-300" />
                  </div>
                  <div className="p-4 bg-orange-50/30">
                    {historyRecords.map((record, idx) => (
                      <div key={idx} className="flex items-center space-x-3 text-[10px] text-orange-700">
                        <History className="w-3 h-3" />
                        <span>该单据由 <span className="font-bold">{record.sourceIds.join(', ')}</span> 通过 <span className="font-bold">{record.type === 'REQ_MERGE' ? '合并' : '拆分'}</span> 生成于 {record.timestamp}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Section 03: Split Details */}
              <div className="bg-white border border-erp-border rounded-[2px] shadow-sm overflow-hidden">
                <div className="px-4 py-2.5 border-b border-erp-border flex items-center justify-between bg-white">
                  <div className="flex items-center space-x-2">
                    <span className="text-blue-500 font-bold text-xs">{hasHistory ? '03' : '02'}</span>
                    <span className="text-blue-500 font-bold text-xs">拆分明细设置</span>
                  </div>
                  <button
                    onClick={addSplit}
                    className="text-[10px] px-3 py-1 bg-white border border-gray-300 rounded-[2px] text-gray-600 hover:bg-gray-50 flex items-center space-x-1 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    <span>新增拆分行</span>
                  </button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-[#F5F7FA]">
                      <tr className="text-[11px] text-gray-600 border-b border-erp-border font-medium">
                        <th className="w-12 px-4 py-3 text-center">序</th>
                        <th className="px-4 py-3">生成单据预览</th>
                        <th className="px-4 py-3">物料名称</th>
                        <th className="px-4 py-3 w-48 text-right">拆分数量</th>
                        <th className="w-16 px-4 py-3 text-center">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-erp-border">
                      {splits.map((val, idx) => (
                        <tr key={idx} className="text-[11px] hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 text-center text-gray-400">{idx + 1}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center space-x-2">
                              <FileText className="w-3.5 h-3.5 text-gray-300" />
                              <span className="text-gray-400 italic">系统自动生成编号...</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-800 font-medium">{target.name}</td>
                          <td className="px-4 py-3 text-right">
                            <input
                              type="number"
                              value={val}
                              onChange={(e) => updateSplit(idx, e.target.value)}
                              className="w-32 px-2 py-1.5 border border-gray-300 rounded-[2px] outline-none focus:border-blue-500 text-right font-mono font-bold text-blue-600 bg-blue-50/30"
                            />
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => removeSplit(idx)}
                              disabled={splits.length <= 2}
                              className="text-red-400 hover:text-red-600 disabled:opacity-30 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50/50">
                      <tr className="text-[11px] font-bold border-t border-erp-border">
                        <td colSpan={3} className="px-4 py-3 text-right text-gray-500">拆分合计:</td>
                        <td className="px-4 py-3 text-right">
                          <span className={isValid ? 'text-green-600' : 'text-red-600'}>
                            {total.toFixed(2)} / {originalQty.toFixed(2)}
                          </span>
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-erp-border flex justify-between items-center">
            <div className="flex items-center space-x-2 text-[10px]">
              {!isValid ? (
                <div className="flex items-center space-x-1 text-red-500 bg-red-50 px-2 py-1 rounded">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>拆分总数必须等于原始数量</span>
                </div>
              ) : (
                <div className="flex items-center space-x-1 text-green-600 bg-green-50 px-2 py-1 rounded">
                  <Check className="w-3.5 h-3.5" />
                  <span>校验通过</span>
                </div>
              )}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={onClose}
                className="px-6 py-1.5 border border-gray-300 rounded-[2px] text-xs font-medium text-gray-600 hover:bg-white bg-white transition-all"
              >
                取消
              </button>
              <button
                disabled={!isValid}
                onClick={() => onConfirm(splits)}
                className={`px-6 py-1.5 rounded-[2px] text-xs font-medium text-white transition-all ${
                  isValid ? 'bg-[#2196F3] hover:bg-blue-600 shadow-sm' : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                确认拆分
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
