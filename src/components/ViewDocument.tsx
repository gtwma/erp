/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, FileText, ChevronDown, Printer, Download, Share2, History } from 'lucide-react';
import { Requirement, Plan, ReqStatus, PlanStatus, LineageRelation } from '../types';

interface ViewDocumentProps {
  document: Requirement | Plan;
  type: 'REQ' | 'PLAN';
  lineage: LineageRelation[];
  onClose: () => void;
}

export const ViewDocument: React.FC<ViewDocumentProps> = ({ document, type, lineage, onClose }) => {
  const isReq = type === 'REQ';
  const title = isReq ? '查看采购需求' : '查看采购计划';
  const docTypeLabel = isReq ? '采购需求申请' : '采购计划单';

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      {/* Header */}
      <div className="px-6 py-3 border-b border-erp-border flex justify-between items-center bg-white shrink-0">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-bold text-gray-800">{title}</span>
          <div className="flex items-center space-x-3 text-[10px] text-gray-500">
            <span>{docTypeLabel}</span>
            <span className="w-px h-3 bg-gray-300"></span>
            <span>创建时间: {document.createdAt}</span>
            <span className="w-px h-3 bg-gray-300"></span>
            <span>状态: <span className="text-blue-500 font-medium">{document.status}</span></span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded transition-all" title="打印">
            <Printer className="w-4 h-4" />
          </button>
          <button className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded transition-all" title="导出">
            <Download className="w-4 h-4" />
          </button>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-all ml-2">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6 space-y-8 bg-[#F9FAFB]">
        <div className="max-w-5xl mx-auto space-y-6">
          
          {/* Section 01: Basic Info */}
          <div className="bg-white border border-erp-border rounded-[2px] shadow-sm overflow-hidden">
            <div className="px-4 py-2.5 border-b border-erp-border flex items-center justify-between bg-white">
              <div className="flex items-center space-x-2">
                <span className="text-blue-500 font-bold text-xs">01</span>
                <span className="text-blue-500 font-bold text-xs">{isReq ? '采购需求信息' : '采购计划信息'}</span>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-300" />
            </div>
            
            <div className="p-6 grid grid-cols-2 gap-y-6 gap-x-16">
              <div className="col-span-2 flex items-start space-x-4">
                <span className="w-32 text-right text-xs text-gray-500 shrink-0">采购需求内容:</span>
                <span className="text-xs text-gray-800 font-medium leading-relaxed">{document.name}</span>
              </div>
              
              <div className="flex items-center space-x-4">
                <span className="w-32 text-right text-xs text-gray-500 shrink-0">需求单位:</span>
                <span className="text-xs text-gray-800">系统管理部</span>
              </div>
              
              <div className="flex items-center space-x-4">
                <span className="w-32 text-right text-xs text-gray-500 shrink-0">需求负责人:</span>
                <span className="text-xs text-gray-800">系统管理员</span>
              </div>
              
              <div className="flex items-center space-x-4">
                <span className="w-32 text-right text-xs text-gray-500 shrink-0">期望完成日期:</span>
                <span className="text-xs text-gray-800">2026-03-06</span>
              </div>

              <div className="flex items-center space-x-4">
                <span className="w-32 text-right text-xs text-gray-500 shrink-0">单据编号:</span>
                <span className="text-xs text-blue-600 font-mono font-medium">{document.id}</span>
              </div>
            </div>
          </div>

          {/* Section 02: Line Items */}
          <div className="bg-white border border-erp-border rounded-[2px] shadow-sm overflow-hidden">
            <div className="px-4 py-2.5 border-b border-erp-border flex items-center justify-between bg-white">
              <div className="flex items-center space-x-2">
                <span className="text-blue-500 font-bold text-xs">02</span>
                <span className="text-blue-500 font-bold text-xs">行项目信息</span>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-300" />
            </div>
            
            {/* Summary Info Bar */}
            <div className="px-6 py-3 bg-blue-50/50 border-b border-erp-border flex items-center space-x-12">
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-500 mb-0.5">物料种类汇总</span>
                <span className="text-xs font-bold text-gray-800">1 种</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-500 mb-0.5">总数量汇总</span>
                <span className="text-xs font-bold text-blue-600">{document.qty.toFixed(2)}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-500 mb-0.5">预估总金额汇总</span>
                <span className="text-xs font-bold text-gray-800">¥ {((isReq ? (document as Requirement).unitPrice : 0) * document.qty).toFixed(2)}</span>
              </div>
              {isReq && (
                <div className="flex flex-col border-l border-gray-200 pl-12">
                  <span className="text-[10px] text-gray-500 mb-0.5">已转计划数量</span>
                  <span className="text-xs font-bold text-green-600">{(document as Requirement).assignedQty.toFixed(2)}</span>
                </div>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#F5F7FA]">
                  <tr className="text-[11px] text-gray-600 border-b border-erp-border font-medium">
                    <th className="w-12 px-4 py-3 text-center">序</th>
                    <th className="px-4 py-3">行项目编号</th>
                    <th className="px-4 py-3">物料编码</th>
                    <th className="px-4 py-3">物料名称</th>
                    <th className="px-4 py-3 text-right">预估单价(元)</th>
                    <th className="px-4 py-3 text-right">数量</th>
                    <th className="px-4 py-3 text-right">预估总价(元)</th>
                    <th className="px-4 py-3">物料概述</th>
                    <th className="px-4 py-3">所属集中采购目录</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-erp-border">
                  <tr className="text-[11px] hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-center text-gray-400">1</td>
                    <td className="px-4 py-3 text-gray-800 font-mono">LI-{document.id.split('-')[1] || '20260303001'}</td>
                    <td className="px-4 py-3 text-gray-600">{document.materialCode}</td>
                    <td className="px-4 py-3 text-gray-800 font-medium">{document.name}</td>
                    <td className="px-4 py-3 text-right text-gray-400">--</td>
                    <td className="px-4 py-3 text-right font-bold text-gray-700">{document.qty.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right text-gray-400">0.00</td>
                    <td className="px-4 py-3 text-gray-500 truncate max-w-[150px]">{document.spec}</td>
                    <td className="px-4 py-3 text-gray-400">--</td>
                  </tr>
                </tbody>
                <tfoot className="bg-gray-50/30">
                  <tr className="text-[11px] font-bold border-t border-erp-border">
                    <td colSpan={5} className="px-4 py-3 text-right text-gray-500">汇总合计:</td>
                    <td className="px-4 py-3 text-right text-blue-600">{document.qty.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right text-gray-800">¥ {((isReq ? (document as Requirement).unitPrice : 0) * document.qty).toFixed(2)}</td>
                    <td colSpan={2}></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Section 03: History / Lineage */}
          <div className="bg-white border border-erp-border rounded-[2px] shadow-sm overflow-hidden">
            <div className="px-4 py-2.5 border-b border-erp-border flex items-center justify-between bg-white">
              <div className="flex items-center space-x-2">
                <span className="text-blue-500 font-bold text-xs">03</span>
                <span className="text-blue-500 font-bold text-xs">溯源追溯信息</span>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-300" />
            </div>
            <div className="p-6">
              {lineage.filter(l => l.targetIds.includes(document.id)).length > 0 ? (
                <div className="space-y-4">
                  {lineage.filter(l => l.targetIds.includes(document.id)).map((record, idx) => (
                    <div key={idx} className="flex items-start space-x-4 text-xs">
                      <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
                        <History className="w-4 h-4 text-orange-500" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-gray-800">
                            {record.type === 'REQ_SPLIT' ? '需求拆分' : 
                             record.type === 'REQ_MERGE' ? '需求合并' : 
                             record.type === 'PLAN_SPLIT' ? '计划拆分' : 
                             record.type === 'PLAN_MERGE' ? '计划合并' : '需求转计划'}
                          </span>
                          <span className="text-gray-400">{record.timestamp}</span>
                        </div>
                        <p className="text-gray-600">
                          源单据: <span className="text-blue-600 font-mono">{record.sourceIds.join(', ')}</span>
                        </p>
                        <p className="text-gray-600">
                          操作描述: 该单据由源单据通过{
                            record.type === 'REQ_TO_PLAN' ? '需求转计划' :
                            record.type.includes('SPLIT') ? '拆分' : '合并'
                          }操作生成，操作数量为 <span className="font-bold text-gray-800">{record.qty}</span>。
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center space-x-4 text-xs text-gray-500 italic">
                  <History className="w-4 h-4" />
                  <span>暂无历史溯源关联记录</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
