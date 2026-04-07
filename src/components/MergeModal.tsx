/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Check, AlertCircle, ArrowDown, Layers, History, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Requirement, Plan, LineageRelation } from '../types';

interface MergeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  sources: (Requirement | Plan)[];
  type: 'REQ' | 'PLAN';
  lineage: LineageRelation[];
}

export const MergeModal: React.FC<MergeModalProps> = ({ isOpen, onClose, onConfirm, sources, type, lineage }) => {
  if (!isOpen || sources.length === 0) return null;

  const totalQty = sources.reduce((sum, s) => sum + s.qty, 0);
  const first = sources[0];
  const title = type === 'REQ' ? '采购需求合并' : '采购计划合并';

  // Group items for preview
  const groupedTargets = React.useMemo(() => {
    const groups: Record<string, { materialCode: string, name: string, spec: string, totalQty: number, sourceCount: number }> = {};
    sources.forEach(s => {
      const key = `${s.materialCode}|${s.name}|${s.spec}`;
      if (!groups[key]) {
        groups[key] = { 
          materialCode: s.materialCode, 
          name: s.name, 
          spec: s.spec, 
          totalQty: 0,
          sourceCount: 0
        };
      }
      groups[key].totalQty += s.qty;
      groups[key].sourceCount += 1;
    });
    return Object.values(groups);
  }, [sources]);

  const getLineageFor = (id: string) => lineage.filter(l => l.targetIds.includes(id));

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
                <span>创建时间: {new Date().toLocaleDateString()}</span>
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
              
              {/* Section 01: Basic Info */}
              <div className="bg-white border border-erp-border rounded-[2px] shadow-sm overflow-hidden">
                <div className="px-4 py-2.5 border-b border-erp-border flex items-center justify-between bg-white">
                  <div className="flex items-center space-x-2">
                    <span className="text-blue-500 font-bold text-xs">01</span>
                    <span className="text-blue-500 font-bold text-xs">合并基本信息</span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-300" />
                </div>
                
                <div className="p-6 grid grid-cols-3 gap-y-6 gap-x-12">
                  <div className="col-span-3 flex items-start space-x-4">
                    <span className="w-24 text-right text-xs text-gray-500 shrink-0">合并内容:</span>
                    <span className="text-xs text-gray-800 font-medium leading-relaxed">
                      {type === 'REQ' ? '采购需求合并汇总' : '采购计划合并汇总'} - {first.name} 等 {sources.length} 项
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <span className="w-24 text-right text-xs text-gray-500 shrink-0">需求单位:</span>
                    <span className="text-xs text-gray-800">系统管理部</span>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <span className="w-24 text-right text-xs text-gray-500 shrink-0">负责人:</span>
                    <span className="text-xs text-gray-800">系统管理员</span>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <span className="w-24 text-right text-xs text-gray-500 shrink-0">期望日期:</span>
                    <span className="text-xs text-gray-800">2026-03-06</span>
                  </div>

                  <div className="flex items-center space-x-4">
                    <span className="w-24 text-right text-xs text-gray-500 shrink-0">合并总数:</span>
                    <span className="text-sm font-bold text-blue-600">{totalQty.toFixed(2)}</span>
                  </div>

                  <div className="flex items-center space-x-4">
                    <span className="w-24 text-right text-xs text-gray-500 shrink-0">审核状态:</span>
                    <span className="text-xs text-blue-500 font-medium">编辑中</span>
                  </div>
                </div>
              </div>

              {/* Section 02: Line Items */}
              <div className="bg-white border border-erp-border rounded-[2px] shadow-sm overflow-hidden">
                <div className="px-4 py-2.5 border-b border-erp-border flex items-center justify-between bg-white">
                  <div className="flex items-center space-x-2">
                    <span className="text-blue-500 font-bold text-xs">02</span>
                    <span className="text-blue-500 font-bold text-xs">待合并源单据明细</span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-300" />
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-[#F5F7FA]">
                      <tr className="text-[11px] text-gray-600 border-b border-erp-border font-medium">
                        <th className="w-12 px-4 py-3 text-center">序</th>
                        <th className="px-4 py-3">单据编号</th>
                        <th className="px-4 py-3">物料编码</th>
                        <th className="px-4 py-3">物料名称</th>
                        <th className="px-4 py-3 text-right">数量</th>
                        <th className="px-4 py-3">历史溯源</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-erp-border">
                      {sources.map((s, idx) => {
                        const sLineage = getLineageFor(s.id);
                        return (
                          <tr key={s.id} className="text-[11px] hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3 text-center text-gray-400">{idx + 1}</td>
                            <td className="px-4 py-3 text-blue-600 font-mono font-medium">{s.id}</td>
                            <td className="px-4 py-3 text-gray-600 font-mono">{s.materialCode}</td>
                            <td className="px-4 py-3 text-gray-800 font-medium">{s.name}</td>
                            <td className="px-4 py-3 text-right font-bold text-gray-700">{s.qty.toFixed(2)}</td>
                            <td className="px-4 py-3">
                              {sLineage.length > 0 ? (
                                <div className="flex items-center space-x-1 text-orange-500">
                                  <History className="w-3 h-3" />
                                  <span className="text-[9px]">曾由{sLineage[0].type.includes('SPLIT') ? '拆分' : '合并'}生成</span>
                                </div>
                              ) : (
                                <span className="text-gray-300">--</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Section 03: Grouped Result Preview */}
              <div className="bg-white border border-erp-border rounded-[2px] shadow-sm overflow-hidden">
                <div className="px-4 py-2.5 border-b border-erp-border flex items-center justify-between bg-white">
                  <div className="flex items-center space-x-2">
                    <span className="text-blue-500 font-bold text-xs">03</span>
                    <span className="text-blue-500 font-bold text-xs">合并后生成预览</span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-300" />
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-[#F5F7FA]">
                      <tr className="text-[11px] text-gray-600 border-b border-erp-border font-medium">
                        <th className="w-12 px-4 py-3 text-center">序</th>
                        <th className="px-4 py-3">物料编码</th>
                        <th className="px-4 py-3">物料名称</th>
                        <th className="px-4 py-3">规格型号</th>
                        <th className="px-4 py-3 text-right">合并后数量</th>
                        <th className="px-4 py-3 text-center">源单据数</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-erp-border">
                      {groupedTargets.map((t, idx) => (
                        <tr key={idx} className="text-[11px] hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 text-center text-gray-400">{idx + 1}</td>
                          <td className="px-4 py-3 text-gray-600 font-mono">{t.materialCode}</td>
                          <td className="px-4 py-3 text-gray-800 font-medium">{t.name}</td>
                          <td className="px-4 py-3 text-gray-500">{t.spec}</td>
                          <td className="px-4 py-3 text-right font-bold text-blue-600">{t.totalQty.toFixed(2)}</td>
                          <td className="px-4 py-3 text-center text-gray-500">{t.sourceCount}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-blue-50/30">
                      <tr className="text-[11px] font-bold border-t border-erp-border">
                        <td colSpan={4} className="px-4 py-3 text-right text-gray-500">合并总计:</td>
                        <td className="px-4 py-3 text-right text-blue-600">{totalQty.toFixed(2)}</td>
                        <td className="px-4 py-3 text-center text-gray-500">{sources.length}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Section 04: Traceability Preview */}
              <div className="bg-white border border-erp-border rounded-[2px] shadow-sm overflow-hidden">
                <div className="px-4 py-2.5 border-b border-erp-border flex items-center justify-between bg-white">
                  <div className="flex items-center space-x-2">
                    <span className="text-blue-500 font-bold text-xs">04</span>
                    <span className="text-blue-500 font-bold text-xs">溯源关联预览</span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-300" />
                </div>
                <div className="p-6">
                  <div className="flex items-center space-x-4 text-xs">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                      <History className="w-4 h-4 text-blue-500" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-gray-800 font-medium">合并溯源记录</p>
                      <p className="text-gray-500">
                        该操作将建立从 <span className="text-blue-600 font-mono">{sources.map(s => s.id).join(', ')}</span> 到新生成的单据的溯源关系。
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-erp-border flex justify-between items-center">
            <div className="flex items-center space-x-2 text-[10px] text-gray-500">
              <AlertCircle className="w-3.5 h-3.5 text-blue-500" />
              <span>系统将自动建立溯源关系，合并后原单据将标记为“已合并”</span>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={onClose}
                className="px-6 py-1.5 border border-gray-300 rounded-[2px] text-xs font-medium text-gray-600 hover:bg-white bg-white transition-all"
              >
                取消
              </button>
              <button
                onClick={onConfirm}
                className="px-6 py-1.5 rounded-[2px] text-xs font-medium text-white bg-[#2196F3] hover:bg-blue-600 transition-all shadow-sm"
              >
                确认合并
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
