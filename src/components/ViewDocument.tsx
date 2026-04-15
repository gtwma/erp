/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, FileText, ChevronDown, ChevronLeft, ChevronRight, Printer, Download, Share2, History as HistoryIcon, Edit3, Save, CheckCircle2, User, Clock, MessageSquare } from 'lucide-react';
import { Requirement, Plan, Subcontract, AuditStatus, ReqProcessStatus, PlanProcessStatus, LineageRelation, HistoryRecord } from '../types';

interface ViewDocumentProps {
  document: Requirement | Plan | Subcontract;
  type: 'REQ' | 'PLAN' | 'SUB';
  lineage: LineageRelation[];
  onClose: () => void;
  onUpdate?: (doc: Requirement | Plan | Subcontract) => void;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onSubmit?: (id: string) => void;
  onChange?: (id: string, reason: string) => void;
  onTerminate?: (id: string, reason: string) => void;
  onAddRequirement?: (planId: string) => void;
  onRemoveRequirement?: (planId: string, reqId: string) => void;
  onAddLineItem?: (planId: string) => void;
  onRemoveLineItem?: (planId: string, itemId: string) => void;
}

export const ViewDocument: React.FC<ViewDocumentProps> = ({ 
  document, 
  type, 
  lineage, 
  onClose, 
  onUpdate, 
  onApprove, 
  onReject, 
  onSubmit, 
  onChange, 
  onTerminate,
  onAddRequirement,
  onRemoveRequirement,
  onAddLineItem,
  onRemoveLineItem
}) => {
  const auditStatus = (document as any).auditStatus || (document as any).status;
  const isDraftOrRejected = auditStatus === AuditStatus.DRAFT || auditStatus === AuditStatus.REJECTED || auditStatus === AuditStatus.CHANGE_DRAFT || auditStatus === AuditStatus.TERMINATE_DRAFT || auditStatus === AuditStatus.CHANGE_REJECTED || auditStatus === AuditStatus.TERMINATE_REJECTED || auditStatus === '编辑中' || auditStatus === '审核不通过';
  const isChangePending = auditStatus === AuditStatus.CHANGE_PENDING || auditStatus === AuditStatus.TERMINATE_PENDING;
  const isTerminated = auditStatus === AuditStatus.TERMINATED;
  
  const [isEditing, setIsEditing] = useState(isDraftOrRejected);
  const [editData, setEditData] = useState({ ...document });
  const [selectedReqIds, setSelectedReqIds] = useState<string[]>([]);
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);

  const history: HistoryRecord[] = (document as any).history || [];

  const isReq = type === 'REQ';
  const isPlan = type === 'PLAN';
  const isSub = type === 'SUB';
  
  const title = isSub ? '查看分包单' : isReq ? (isEditing ? '修改采购需求' : '查看采购需求') : (isEditing ? '修改采购计划' : '查看采购计划');
  const docTypeLabel = isSub ? '分包管理单' : isReq ? '采购需求申请' : '采购计划单';

  const handleSave = () => {
    if (onUpdate) {
      onUpdate(editData as any);
    }
    // If it was PENDING or APPROVED and we were editing (Modify Document), we might want to stay in view mode after save
    if (!isDraftOrRejected) {
      setIsEditing(false);
    }
  };

  const handleSubmit = () => {
    if (onSubmit) {
      onSubmit(document.id);
      onClose();
    }
  };

  const handleChange = () => {
    if (onChange) {
      onChange(document.id, '');
      setIsEditing(true);
    }
  };

  const handleTerminate = () => {
    if (onTerminate) {
      onTerminate(document.id, '');
      setIsEditing(true);
    }
  };

  const getQty = () => {
    if ('qty' in document) return document.qty;
    if ('items' in document && document.items) return document.items.reduce((sum, i) => sum + i.qty, 0);
    return 0;
  };

  const qty = getQty();

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      {/* Header */}
      <div className="px-6 py-3 border-b border-erp-border flex justify-between items-center bg-white shrink-0">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 mr-2">
            {/* Action Buttons based on Status */}
            {isDraftOrRejected ? (
              <div className="flex items-center space-x-2">
                <button 
                  onClick={handleSave}
                  className="flex items-center space-x-1.5 px-4 py-1.5 bg-green-500 text-white text-xs font-medium rounded-[2px] hover:bg-green-600 transition-all shadow-sm"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>修改保存</span>
                </button>
                <button 
                  onClick={handleSubmit}
                  className="flex items-center space-x-1.5 px-4 py-1.5 bg-erp-secondary text-white text-xs font-medium rounded-[2px] hover:bg-blue-600 transition-all shadow-sm"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>提交申请</span>
                </button>
              </div>
            ) : auditStatus === AuditStatus.PENDING || auditStatus === AuditStatus.CHANGE_PENDING || auditStatus === '待审核' ? (
              <div className="flex items-center space-x-2">
                {onApprove && (
                  <button 
                    onClick={() => {
                      onApprove(document.id);
                      onClose();
                    }}
                    className="flex items-center space-x-1.5 px-4 py-1.5 bg-green-600 text-white text-xs font-medium rounded-[2px] hover:bg-green-700 transition-all shadow-sm"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>审核通过</span>
                  </button>
                )}
                {onReject && (
                  <button 
                    onClick={() => {
                      onReject(document.id);
                      onClose();
                    }}
                    className="flex items-center space-x-1.5 px-4 py-1.5 bg-red-600 text-white text-xs font-medium rounded-[2px] hover:bg-red-700 transition-all shadow-sm"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>审核不通过</span>
                  </button>
                )}
              </div>
            ) : auditStatus === AuditStatus.APPROVED || auditStatus === '审核通过' ? (
              <div className="flex items-center space-x-2">
                {isEditing ? (
                  <button 
                    onClick={handleSave}
                    className="flex items-center space-x-1.5 px-4 py-1.5 bg-green-500 text-white text-xs font-medium rounded-[2px] hover:bg-green-600 transition-all shadow-sm"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>保存修改</span>
                  </button>
                ) : (
                  <>
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="flex items-center space-x-1.5 px-4 py-1.5 bg-erp-secondary text-white text-xs font-medium rounded-[2px] hover:bg-blue-600 transition-all shadow-sm"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>修改单据</span>
                    </button>
                  </>
                )}
              </div>
            ) : null}

            <button 
              onClick={onClose}
              className="px-4 py-1.5 border border-gray-300 rounded-[2px] text-xs font-medium text-gray-600 hover:bg-gray-50 transition-all bg-white"
            >
              返回
            </button>
          </div>
          <div className="h-6 w-px bg-gray-200 mx-2"></div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-gray-800">{title}</span>
            <div className="flex items-center space-x-3 text-[10px] text-gray-500 mt-0.5">
              <span>{docTypeLabel}</span>
              <span className="w-px h-3 bg-gray-300"></span>
              <span>创建时间: {document.createdAt}</span>
              <span className="w-px h-3 bg-gray-300"></span>
              <span>状态: <span className="text-blue-500 font-medium">{(document as any).auditStatus || (document as any).status}</span></span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded transition-all" title="打印">
            <Printer className="w-4 h-4" />
          </button>
          <button className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded transition-all" title="导出">
            <Download className="w-4 h-4" />
          </button>
          <div className="w-px h-4 bg-gray-200 mx-2"></div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-all">
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
            
            <div className="p-6">
              {isPlan ? (
                <div className="grid grid-cols-2 gap-y-4 gap-x-12">
                  {/* Row 1: Content */}
                  <div className="col-span-2 flex items-start space-x-4">
                    <label className="w-32 text-right text-xs text-gray-500 shrink-0 mt-2">采购计划内容: <span className="text-red-500">*</span></label>
                    {isEditing ? (
                      <textarea 
                        className="flex-1 border border-gray-300 rounded-[2px] p-2 text-xs outline-none focus:border-blue-500 h-16 bg-white"
                        value={editData.name}
                        onChange={e => setEditData({ ...editData, name: e.target.value })}
                        placeholder="请输入采购计划内容"
                      />
                    ) : (
                      <span className="text-xs text-gray-800 font-medium leading-relaxed mt-2">{document.name}</span>
                    )}
                  </div>

                  {/* Row 2: Attribute & Estimated Time */}
                  <div className="flex items-center space-x-4">
                    <label className="w-32 text-right text-xs text-gray-500 shrink-0">采购计划属性: <span className="text-red-500">*</span></label>
                    {isEditing ? (
                      <div className="flex items-center space-x-4 text-xs">
                        {['工程', '货物', '服务'].map(attr => (
                          <label key={attr} className="flex items-center space-x-1.5 cursor-pointer">
                            <input 
                              type="radio" 
                              name="attribute" 
                              className="text-blue-500 focus:ring-blue-500"
                              checked={(editData as any).attribute === attr}
                              onChange={() => setEditData({ ...editData, attribute: attr } as any)}
                            />
                            <span>{attr}</span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-800">{(document as any).attribute || '货物'}</span>
                    )}
                  </div>
                  <div className="flex items-center space-x-4">
                    <label className="w-32 text-right text-xs text-gray-500 shrink-0">预计采购时间:</label>
                    {isEditing ? (
                      <input 
                        type="date" 
                        className="flex-1 border border-gray-300 rounded-[2px] px-3 py-1.5 text-xs outline-none focus:border-blue-500 bg-white"
                        value={(editData as any).estimatedTime || ''}
                        onChange={e => setEditData({ ...editData, estimatedTime: e.target.value } as any)}
                      />
                    ) : (
                      <span className="text-xs text-gray-800">{(document as any).estimatedTime || '--'}</span>
                    )}
                  </div>

                  {/* Row 3: Has Contract & Plan Type */}
                  <div className="flex items-center space-x-4">
                    <label className="w-32 text-right text-xs text-gray-500 shrink-0">已有合同转订单: <span className="text-red-500">*</span></label>
                    {isEditing ? (
                      <div 
                        className={`w-10 h-5 rounded-full p-1 cursor-pointer transition-colors ${(editData as any).hasContract ? 'bg-blue-500' : 'bg-gray-300'}`}
                        onClick={() => setEditData({ ...editData, hasContract: !(editData as any).hasContract } as any)}
                      >
                        <div className={`w-3 h-3 bg-white rounded-full transition-transform ${(editData as any).hasContract ? 'translate-x-5' : 'translate-x-0'}`} />
                      </div>
                    ) : (
                      <span className="text-xs text-gray-800">{(document as any).hasContract ? '是' : '否'}</span>
                    )}
                  </div>
                  <div className="flex items-center space-x-4">
                    <label className="w-32 text-right text-xs text-gray-500 shrink-0">采购计划类型: <span className="text-red-500">*</span></label>
                    {isEditing ? (
                      <div className="flex items-center space-x-4 text-xs">
                        {['年度采购计划', '季度采购计划', '月度采购计划'].map(type => (
                          <label key={type} className="flex items-center space-x-1.5 cursor-pointer">
                            <input 
                              type="radio" 
                              name="planType" 
                              className="text-blue-500 focus:ring-blue-500"
                              checked={(editData as any).planType === type}
                              onChange={() => setEditData({ ...editData, planType: type } as any)}
                            />
                            <span>{type}</span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-800">{(document as any).planType || '年度采购计划'}</span>
                    )}
                  </div>

                  {/* Row 4: Org Form & Method */}
                  <div className="flex items-center space-x-4">
                    <label className="w-32 text-right text-xs text-gray-500 shrink-0">采购组织形式: <span className="text-red-500">*</span></label>
                    {isEditing ? (
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
                        {['分散采购', '集中采购', '框架协议采购', '战略采购'].map(form => (
                          <label key={form} className="flex items-center space-x-1.5 cursor-pointer">
                            <input 
                              type="radio" 
                              name="orgForm" 
                              className="text-blue-500 focus:ring-blue-500"
                              checked={(editData as any).orgForm === form}
                              onChange={() => setEditData({ ...editData, orgForm: form } as any)}
                            />
                            <span>{form}</span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-800">{(document as any).orgForm || '集中采购'}</span>
                    )}
                  </div>
                  <div className="flex items-center space-x-4">
                    <label className="w-32 text-right text-xs text-gray-500 shrink-0">采购方式:</label>
                    {isEditing ? (
                      <select 
                        className="flex-1 border border-gray-300 rounded-[2px] px-3 py-1.5 text-xs outline-none focus:border-blue-500 bg-white"
                        value={(editData as any).method || ''}
                        onChange={e => setEditData({ ...editData, method: e.target.value } as any)}
                      >
                        <option value="">请选择采购方式</option>
                        <option value="公开招标">公开招标</option>
                        <option value="邀请招标">邀请招标</option>
                        <option value="竞争性谈判">竞争性谈判</option>
                        <option value="单一来源采购">单一来源采购</option>
                        <option value="询价采购">询价采购</option>
                      </select>
                    ) : (
                      <span className="text-xs text-gray-800">{(document as any).method || '公开招标'}</span>
                    )}
                  </div>

                  {/* Row 5: Budget & Actual Budget */}
                  <div className="flex items-center space-x-4">
                    <label className="w-32 text-right text-xs text-gray-500 shrink-0">采购计划预算: <span className="text-red-500">*</span></label>
                    {isEditing ? (
                      <div className="flex-1 flex items-center border border-gray-300 rounded-[2px] bg-gray-50">
                        <input 
                          type="number" 
                          className="flex-1 px-3 py-1.5 text-xs outline-none bg-transparent"
                          value={(editData as any).budget || 0}
                          onChange={e => setEditData({ ...editData, budget: parseFloat(e.target.value) } as any)}
                        />
                        <span className="px-3 text-xs text-gray-400">元</span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-800">{(document as any).budget?.toLocaleString() || '0.00'} 元</span>
                    )}
                  </div>
                  <div className="flex items-center space-x-4">
                    <label className="w-32 text-right text-xs text-gray-500 shrink-0">实际批复预算:</label>
                    {isEditing ? (
                      <div className="flex-1 flex items-center border border-gray-300 rounded-[2px]">
                        <input 
                          type="number" 
                          className="flex-1 px-3 py-1.5 text-xs outline-none"
                          value={(editData as any).actualBudget || ''}
                          onChange={e => setEditData({ ...editData, actualBudget: parseFloat(e.target.value) } as any)}
                        />
                        <span className="px-3 text-xs text-gray-400">元</span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-800">{(document as any).actualBudget?.toLocaleString() || '--'} 元</span>
                    )}
                  </div>

                  {/* Row 6: Contact & Phone */}
                  <div className="flex items-center space-x-4">
                    <label className="w-32 text-right text-xs text-gray-500 shrink-0">联系人: <span className="text-red-500">*</span></label>
                    {isEditing ? (
                      <select 
                        className="flex-1 border border-gray-300 rounded-[2px] px-3 py-1.5 text-xs outline-none focus:border-blue-500 bg-white"
                        value={(editData as any).contactPerson || ''}
                        onChange={e => setEditData({ ...editData, contactPerson: e.target.value } as any)}
                      >
                        <option value="系统管理员">系统管理员</option>
                        <option value="张三">张三</option>
                        <option value="李四">李四</option>
                      </select>
                    ) : (
                      <span className="text-xs text-gray-800">{(document as any).contactPerson || '系统管理员'}</span>
                    )}
                  </div>
                  <div className="flex items-center space-x-4">
                    <label className="w-32 text-right text-xs text-gray-500 shrink-0">联系电话: <span className="text-red-500">*</span></label>
                    {isEditing ? (
                      <input 
                        type="text" 
                        className="flex-1 border border-gray-300 rounded-[2px] px-3 py-1.5 text-xs outline-none focus:border-blue-500 bg-white"
                        value={(editData as any).contactPhone || ''}
                        onChange={e => setEditData({ ...editData, contactPhone: e.target.value } as any)}
                      />
                    ) : (
                      <span className="text-xs text-gray-800">{(document as any).contactPhone || '18714997047'}</span>
                    )}
                  </div>

                  {/* Row 7: Entry Unit (Read-only) */}
                  <div className="flex items-center space-x-4">
                    <label className="w-32 text-right text-xs text-gray-500 shrink-0">采购计划录入单位:</label>
                    <span className="text-xs text-gray-800">系统管理部</span>
                  </div>
                  <div />

                  {/* Row 8: Apply Unit & Manager */}
                  <div className="flex items-center space-x-4">
                    <label className="w-32 text-right text-xs text-gray-500 shrink-0">采购申请单位: <span className="text-red-500">*</span></label>
                    {isEditing ? (
                      <div className="flex-1 relative">
                        <select 
                          className="w-full border border-gray-300 rounded-[2px] px-3 py-1.5 text-xs outline-none focus:border-blue-500 bg-white appearance-none"
                          value={(editData as any).applyUnit || ''}
                          onChange={e => setEditData({ ...editData, applyUnit: e.target.value } as any)}
                        >
                          <option value="系统管理部">系统管理部</option>
                          <option value="财务部">财务部</option>
                          <option value="技术部">技术部</option>
                        </select>
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1 pointer-events-none">
                          <X className="w-3 h-3 text-gray-400 cursor-pointer pointer-events-auto hover:text-gray-600" onClick={() => setEditData({ ...editData, applyUnit: '' } as any)} />
                          <ChevronDown className="w-3 h-3 text-gray-400" />
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-800">{(document as any).applyUnit || '系统管理部'}</span>
                    )}
                  </div>
                  <div className="flex items-center space-x-4">
                    <label className="w-32 text-right text-xs text-gray-500 shrink-0">采购申请分派负责人: <span className="text-red-500">*</span></label>
                    {isEditing ? (
                      <select 
                        className="flex-1 border border-gray-300 rounded-[2px] px-3 py-1.5 text-xs outline-none focus:border-blue-500 bg-white"
                        value={(editData as any).applyManager || ''}
                        onChange={e => setEditData({ ...editData, applyManager: e.target.value } as any)}
                      >
                        <option value="系统管理员">系统管理员</option>
                        <option value="张三">张三</option>
                        <option value="李四">李四</option>
                      </select>
                    ) : (
                      <span className="text-xs text-gray-800">{(document as any).applyManager || '系统管理员'}</span>
                    )}
                  </div>

                  {/* Row 9: Impl Unit & Manager */}
                  <div className="flex items-center space-x-4">
                    <label className="w-32 text-right text-xs text-gray-500 shrink-0">采购实施单位:</label>
                    {isEditing ? (
                      <div className="flex-1 relative">
                        <select 
                          className="w-full border border-gray-300 rounded-[2px] px-3 py-1.5 text-xs outline-none focus:border-blue-500 bg-white appearance-none"
                          value={(editData as any).implUnit || ''}
                          onChange={e => setEditData({ ...editData, implUnit: e.target.value } as any)}
                        >
                          <option value="">请选择实施单位</option>
                          <option value="系统管理部">系统管理部</option>
                          <option value="外部机构">外部机构</option>
                        </select>
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1 pointer-events-none">
                          <X className="w-3 h-3 text-gray-400 cursor-pointer pointer-events-auto hover:text-gray-600" onClick={() => setEditData({ ...editData, implUnit: '' } as any)} />
                          <ChevronDown className="w-3 h-3 text-gray-400" />
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-800">{(document as any).implUnit || '--'}</span>
                    )}
                  </div>
                  <div className="flex items-center space-x-4">
                    <label className="w-32 text-right text-xs text-gray-500 shrink-0">采购实施负责人:</label>
                    {isEditing ? (
                      <select 
                        className="flex-1 border border-gray-300 rounded-[2px] px-3 py-1.5 text-xs outline-none focus:border-blue-500 bg-white"
                        value={(editData as any).implManager || ''}
                        onChange={e => setEditData({ ...editData, implManager: e.target.value } as any)}
                      >
                        <option value="">请选择负责人</option>
                        <option value="系统管理员">系统管理员</option>
                        <option value="张三">张三</option>
                      </select>
                    ) : (
                      <span className="text-xs text-gray-800">{(document as any).implManager || '--'}</span>
                    )}
                  </div>

                  {/* Row 10: Warehouse Name & Code */}
                  <div className="flex items-center space-x-4">
                    <label className="w-32 text-right text-xs text-gray-500 shrink-0">入库仓库名称:</label>
                    {isEditing ? (
                      <select 
                        className="flex-1 border border-gray-300 rounded-[2px] px-3 py-1.5 text-xs outline-none focus:border-blue-500 bg-white"
                        value={(editData as any).warehouseName || ''}
                        onChange={e => setEditData({ ...editData, warehouseName: e.target.value } as any)}
                      >
                        <option value="">请选择仓库</option>
                        <option value="中心仓库">中心仓库</option>
                        <option value="备用仓库">备用仓库</option>
                      </select>
                    ) : (
                      <span className="text-xs text-gray-800">{(document as any).warehouseName || '--'}</span>
                    )}
                  </div>
                  <div className="flex items-center space-x-4">
                    <label className="w-32 text-right text-xs text-gray-500 shrink-0">入库仓库编号:</label>
                    {isEditing ? (
                      <input 
                        type="text" 
                        className="flex-1 border border-gray-300 rounded-[2px] px-3 py-1.5 text-xs outline-none bg-gray-50"
                        value={(editData as any).warehouseCode || ''}
                        readOnly
                      />
                    ) : (
                      <span className="text-xs text-gray-800">{(document as any).warehouseCode || '--'}</span>
                    )}
                  </div>

                  {/* Change/Termination Reasons */}
                  {(auditStatus === AuditStatus.CHANGE_DRAFT || auditStatus === AuditStatus.CHANGE_PENDING || auditStatus === AuditStatus.CHANGE_REJECTED || (document as any).changeReason) && (
                    <div className="col-span-2 flex items-start space-x-4 mt-2">
                      <label className="w-32 text-right text-xs text-gray-500 shrink-0 mt-2">变更理由:</label>
                      {isEditing ? (
                        <textarea 
                          className="flex-1 border border-gray-300 rounded-[2px] p-2 text-xs outline-none focus:border-blue-500 h-16 bg-white"
                          value={(editData as any).changeReason || ''}
                          onChange={e => setEditData({ ...editData, changeReason: e.target.value } as any)}
                          placeholder="请输入变更理由..."
                        />
                      ) : (
                        <span className="text-xs text-gray-800 leading-relaxed mt-2">{(document as any).changeReason}</span>
                      )}
                    </div>
                  )}

                  {(auditStatus === AuditStatus.TERMINATE_DRAFT || auditStatus === AuditStatus.TERMINATE_PENDING || auditStatus === AuditStatus.TERMINATE_REJECTED || auditStatus === AuditStatus.TERMINATED || (document as any).terminationReason) && (
                    <div className="col-span-2 flex items-start space-x-4 mt-2">
                      <label className="w-32 text-right text-xs text-gray-500 shrink-0 mt-2">取消理由:</label>
                      {isEditing ? (
                        <textarea 
                          className="flex-1 border border-gray-300 rounded-[2px] p-2 text-xs outline-none focus:border-blue-500 h-16 bg-white"
                          value={(editData as any).terminationReason || ''}
                          onChange={e => setEditData({ ...editData, terminationReason: e.target.value } as any)}
                          placeholder="请输入取消理由..."
                        />
                      ) : (
                        <span className="text-xs text-gray-800 leading-relaxed mt-2">{(document as any).terminationReason}</span>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-y-6 gap-x-16">
                  <div className="col-span-2 flex items-start space-x-4">
                    <span className="w-32 text-right text-xs text-gray-500 shrink-0">{isSub ? '分包名称' : '采购需求内容'}:</span>
                    {isEditing && !isSub ? (
                      <textarea 
                        className="flex-1 border border-erp-border rounded p-2 text-xs outline-none focus:border-erp-secondary h-16 bg-white"
                        value={editData.name}
                        onChange={e => setEditData({ ...editData, name: e.target.value })}
                      />
                    ) : (
                      <span className="text-xs text-gray-800 font-medium leading-relaxed">{document.name}</span>
                    )}
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

                  {(auditStatus === AuditStatus.CHANGE_DRAFT || auditStatus === AuditStatus.CHANGE_PENDING || auditStatus === AuditStatus.CHANGE_REJECTED || (document as any).changeReason) && (
                    <div className="col-span-2 flex items-start space-x-4">
                      <span className="w-32 text-right text-xs text-gray-500 shrink-0">变更理由:</span>
                      {isEditing ? (
                        <textarea 
                          className="flex-1 border border-erp-border rounded p-2 text-xs outline-none focus:border-erp-secondary h-16 bg-white"
                          value={(editData as any).changeReason || ''}
                          onChange={e => setEditData({ ...editData, changeReason: e.target.value } as any)}
                          placeholder="请输入变更理由..."
                        />
                      ) : (
                        <span className="text-xs text-gray-800 leading-relaxed">{(document as any).changeReason}</span>
                      )}
                    </div>
                  )}

                  {(auditStatus === AuditStatus.TERMINATE_DRAFT || auditStatus === AuditStatus.TERMINATE_PENDING || auditStatus === AuditStatus.TERMINATE_REJECTED || auditStatus === AuditStatus.TERMINATED || (document as any).terminationReason) && (
                    <div className="col-span-2 flex items-start space-x-4">
                      <span className="w-32 text-right text-xs text-gray-500 shrink-0">取消理由:</span>
                      {isEditing ? (
                        <textarea 
                          className="flex-1 border border-erp-border rounded p-2 text-xs outline-none focus:border-erp-secondary h-16 bg-white"
                          value={(editData as any).terminationReason || ''}
                          onChange={e => setEditData({ ...editData, terminationReason: e.target.value } as any)}
                          placeholder="请输入取消理由..."
                        />
                      ) : (
                        <span className="text-xs text-gray-800 leading-relaxed">{(document as any).terminationReason}</span>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Section 02: Integrated Requirement Information (Only for Plans) */}
          {isPlan && (
            <div className="bg-white border border-erp-border rounded-[2px] shadow-sm overflow-hidden">
              <div className="px-4 py-2.5 border-b border-erp-border flex items-center justify-between bg-white">
                <div className="flex items-center space-x-2">
                  <span className="text-blue-500 font-bold text-xs">02</span>
                  <span className="text-blue-500 font-bold text-xs">整合需求信息</span>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-300" />
              </div>
              <div className="p-4 space-y-4">
                {isEditing && (
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => onAddRequirement && onAddRequirement(document.id)}
                      className="px-3 py-1.5 border border-gray-300 rounded-[2px] text-xs font-medium text-gray-600 hover:bg-gray-50 transition-all bg-white"
                    >
                      新增需求
                    </button>
                    <button 
                      onClick={() => {
                        selectedReqIds.forEach(id => onRemoveRequirement && onRemoveRequirement(document.id, id));
                        setSelectedReqIds([]);
                      }}
                      disabled={selectedReqIds.length === 0}
                      className="px-3 py-1.5 border border-red-200 rounded-[2px] text-xs font-medium text-red-500 hover:bg-red-50 transition-all bg-white disabled:opacity-50"
                    >
                      删除
                    </button>
                  </div>
                )}
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-[#F5F7FA]">
                      <tr className="text-[11px] text-gray-600 border-b border-erp-border font-medium">
                        <th className="w-10 px-4 py-3 text-center">
                          <input 
                            type="checkbox" 
                            className="rounded-[2px] border-gray-300 text-blue-500 focus:ring-blue-500" 
                            onChange={(e) => {
                              const reqIds = lineage
                                .filter(l => l.targetIds.includes(document.id))
                                .flatMap(l => l.sourceIds);
                              setSelectedReqIds(e.target.checked ? reqIds : []);
                            }}
                            checked={selectedReqIds.length > 0 && selectedReqIds.length === lineage.filter(l => l.targetIds.includes(document.id)).flatMap(l => l.sourceIds).length}
                          />
                        </th>
                        <th className="w-12 px-4 py-3 text-center">序</th>
                        <th className="px-4 py-3">采购需求编号</th>
                        <th className="px-4 py-3">采购需求内容</th>
                        <th className="px-4 py-3">需求单位</th>
                        <th className="px-4 py-3">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-erp-border">
                      {lineage.filter(l => l.targetIds.includes(document.id)).length > 0 ? (
                        lineage
                          .filter(l => l.targetIds.includes(document.id))
                          .flatMap(l => l.sourceIds)
                          .map((id, idx) => (
                            <tr key={id} className="text-[11px] hover:bg-gray-50 transition-colors">
                              <td className="px-4 py-3 text-center">
                                <input 
                                  type="checkbox" 
                                  className="rounded-[2px] border-gray-300 text-blue-500 focus:ring-blue-500" 
                                  checked={selectedReqIds.includes(id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedReqIds([...selectedReqIds, id]);
                                    } else {
                                      setSelectedReqIds(selectedReqIds.filter(sid => sid !== id));
                                    }
                                  }}
                                />
                              </td>
                              <td className="px-4 py-3 text-center text-gray-400">{idx + 1}</td>
                              <td className="px-4 py-3 text-blue-600 font-mono">{id}</td>
                              <td className="px-4 py-3 text-gray-800">采购需求内容示例</td>
                              <td className="px-4 py-3 text-gray-800">系统管理部</td>
                              <td className="px-4 py-3 text-blue-500 space-x-2">
                                <span className="cursor-pointer hover:underline">查看详情</span>
                                {isEditing && (
                                  <span 
                                    onClick={() => onRemoveRequirement && onRemoveRequirement(document.id, id)}
                                    className="text-red-500 cursor-pointer hover:underline"
                                  >
                                    移除
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="py-12">
                            <div className="flex flex-col items-center justify-center text-gray-400 space-y-2">
                              <div className="w-16 h-16 bg-gray-50 rounded-lg flex items-center justify-center border border-dashed border-gray-200">
                                <FileText className="w-8 h-8 text-gray-200" />
                              </div>
                              <span className="text-xs">暂无数据</span>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-end space-x-2 text-[10px] text-gray-500 pt-2">
                  <div className="flex items-center border border-gray-200 rounded-[2px] overflow-hidden">
                    <button className="px-2 py-1 hover:bg-gray-50 border-r border-gray-200 disabled:opacity-50" disabled>
                      <ChevronLeft className="w-3 h-3" />
                    </button>
                    <button className="px-2 py-1 hover:bg-gray-50 disabled:opacity-50" disabled>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="flex items-center space-x-1">
                    <select className="border border-gray-200 rounded-[2px] px-1 py-0.5 outline-none bg-white">
                      <option>13 条/页</option>
                    </select>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span>跳至</span>
                    <input type="text" className="w-8 border border-gray-200 rounded-[2px] px-1 py-0.5 text-center outline-none bg-white" defaultValue="1" />
                    <span>页</span>
                  </div>
                  <span>共0条</span>
                </div>
              </div>
            </div>
          )}

          {/* Section 02/03: Line Item Information */}
          <div className="bg-white border border-erp-border rounded-[2px] shadow-sm overflow-hidden">
            <div className="px-4 py-2.5 border-b border-erp-border flex items-center justify-between bg-white">
              <div className="flex items-center space-x-2">
                <span className="text-blue-500 font-bold text-xs">{isReq ? '02' : '03'}</span>
                <span className="text-blue-500 font-bold text-xs">行项目信息</span>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-300" />
            </div>
            
            <div className="p-4 space-y-4">
              {isEditing && (
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => onAddLineItem && onAddLineItem(document.id)}
                    className="px-3 py-1.5 border border-gray-300 rounded-[2px] text-xs font-medium text-gray-600 hover:bg-gray-50 transition-all bg-white"
                  >
                    新增行项目
                  </button>
                  <button 
                    onClick={() => {
                      selectedItemIds.forEach(id => onRemoveLineItem && onRemoveLineItem(document.id, id));
                      setSelectedItemIds([]);
                    }}
                    disabled={selectedItemIds.length === 0}
                    className="px-3 py-1.5 border border-red-200 rounded-[2px] text-xs font-medium text-red-500 hover:bg-red-50 transition-all bg-white disabled:opacity-50"
                  >
                    删除行项目
                  </button>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-[#F5F7FA]">
                    <tr className="text-[11px] text-gray-600 border-b border-erp-border font-medium">
                      <th className="w-10 px-4 py-3 text-center">
                        <input 
                          type="checkbox" 
                          className="rounded-[2px] border-gray-300 text-blue-500 focus:ring-blue-500" 
                          onChange={(e) => {
                            const itemIds = (document.items || []).map(i => i.id);
                            setSelectedItemIds(e.target.checked ? itemIds : []);
                          }}
                          checked={selectedItemIds.length > 0 && selectedItemIds.length === (document.items || []).length}
                        />
                      </th>
                      <th className="w-12 px-4 py-3 text-center">序</th>
                      <th className="px-4 py-3">行项目编号</th>
                      <th className="px-4 py-3">物料名称</th>
                      <th className="px-4 py-3">物料编码</th>
                      <th className="px-4 py-3 text-right">预估单价(元)</th>
                      <th className="px-4 py-3 text-right">数量</th>
                      <th className="px-4 py-3 text-right">预估总价(元)</th>
                      <th className="px-4 py-3">需求编号</th>
                      <th className="px-4 py-3">需求内容</th>
                      <th className="px-4 py-3">需求单位</th>
                      <th className="px-4 py-3">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-erp-border">
                    {document.items && document.items.length > 0 ? (
                      document.items.map((item, index) => (
                        <tr key={item.id} className="text-[11px] hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 text-center">
                            <input 
                              type="checkbox" 
                              className="rounded-[2px] border-gray-300 text-blue-500 focus:ring-blue-500" 
                              checked={selectedItemIds.includes(item.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedItemIds([...selectedItemIds, item.id]);
                                } else {
                                  setSelectedItemIds(selectedItemIds.filter(sid => sid !== item.id));
                                }
                              }}
                            />
                          </td>
                          <td className="px-4 py-3 text-center text-gray-400">{index + 1}</td>
                          <td className="px-4 py-3 text-gray-800 font-mono">{item.id}</td>
                          <td className="px-4 py-3 text-gray-800 font-medium">{item.materialName}</td>
                          <td className="px-4 py-3 text-gray-600">{item.materialCode}</td>
                          <td className="px-4 py-3 text-right text-gray-400">{item.unitPrice || '--'}</td>
                          <td className="px-4 py-3 text-right font-bold text-gray-700">{item.qty.toFixed(2)}</td>
                          <td className="px-4 py-3 text-right text-gray-800">¥ {(item.qty * (item.unitPrice || 0)).toFixed(2)}</td>
                          <td className="px-4 py-3 text-blue-600 font-mono">REQ-20260303001</td>
                          <td className="px-4 py-3 text-gray-500 truncate max-w-[150px]">需求内容示例</td>
                          <td className="px-4 py-3 text-gray-800">系统管理部</td>
                          <td className="px-4 py-3 text-blue-500 space-x-2">
                            <span className="cursor-pointer hover:underline">编辑</span>
                            {isEditing && (
                              <span 
                                onClick={() => onRemoveLineItem && onRemoveLineItem(document.id, item.id)}
                                className="text-red-500 cursor-pointer hover:underline"
                              >
                                移除
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={12} className="py-12">
                          <div className="flex flex-col items-center justify-center text-gray-400 space-y-2">
                            <div className="w-16 h-16 bg-gray-50 rounded-lg flex items-center justify-center border border-dashed border-gray-200">
                              <FileText className="w-8 h-8 text-gray-200" />
                            </div>
                            <span className="text-xs">暂无数据</span>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-end space-x-2 text-[10px] text-gray-500 pt-2">
                <div className="flex items-center border border-gray-200 rounded-[2px] overflow-hidden">
                  <button className="px-2 py-1 hover:bg-gray-50 border-r border-gray-200 disabled:opacity-50" disabled>
                    <ChevronLeft className="w-3 h-3" />
                  </button>
                  <button className="px-2 py-1 hover:bg-gray-50 disabled:opacity-50" disabled>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
                <div className="flex items-center space-x-1">
                  <select className="border border-gray-200 rounded-[2px] px-1 py-0.5 outline-none bg-white">
                    <option>10 条/页</option>
                  </select>
                </div>
                <div className="flex items-center space-x-1">
                  <span>跳至</span>
                  <input type="text" className="w-8 border border-gray-200 rounded-[2px] px-1 py-0.5 text-center outline-none bg-white" defaultValue="1" />
                  <span>页</span>
                </div>
                <span>共0条</span>
              </div>
            </div>
          </div>

          {/* Section 04: Material Information Summary */}
          {isPlan && (
            <div className="bg-white border border-erp-border rounded-[2px] shadow-sm overflow-hidden">
              <div className="px-4 py-2.5 border-b border-erp-border flex items-center justify-between bg-white">
                <div className="flex items-center space-x-2">
                  <span className="text-blue-500 font-bold text-xs">04</span>
                  <span className="text-blue-500 font-bold text-xs">物料信息汇总</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-xs text-gray-500">采购执行预算: <span className="text-gray-800">0 元</span></span>
                  <ChevronDown className="w-4 h-4 text-gray-300" />
                </div>
              </div>
              <div className="p-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-[#F5F7FA]">
                      <tr className="text-[11px] text-gray-600 border-b border-erp-border font-medium">
                        <th className="w-10 px-4 py-3 text-center">
                          <input type="checkbox" className="rounded-[2px] border-gray-300 text-blue-500 focus:ring-blue-500" />
                        </th>
                        <th className="px-4 py-3">物料名称</th>
                        <th className="px-4 py-3">物料编码</th>
                        <th className="px-4 py-3">物料信息</th>
                        <th className="px-4 py-3 text-right">执行价格(元)</th>
                        <th className="px-4 py-3 text-right">数量</th>
                        <th className="px-4 py-3">计量单位</th>
                        <th className="px-4 py-3 text-right">执行总价(元)</th>
                        <th className="px-4 py-3">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-erp-border">
                      {document.items && document.items.length > 0 ? (
                        document.items.map((item) => (
                          <tr key={item.id} className="text-[11px] hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3 text-center">
                              <input type="checkbox" className="rounded-[2px] border-gray-300 text-blue-500 focus:ring-blue-500" />
                            </td>
                            <td className="px-4 py-3 text-gray-800 font-medium">{item.materialName}</td>
                            <td className="px-4 py-3 text-gray-600 font-mono">{item.materialCode}</td>
                            <td className="px-4 py-3 text-gray-500 truncate max-w-[150px]">{item.spec}</td>
                            <td className="px-4 py-3 text-right text-gray-800">{(item.unitPrice || 0).toFixed(2)}</td>
                            <td className="px-4 py-3 text-right font-bold text-gray-700">{item.qty.toFixed(2)}</td>
                            <td className="px-4 py-3 text-gray-600">台</td>
                            <td className="px-4 py-3 text-right text-gray-800">{(item.qty * (item.unitPrice || 0)).toFixed(2)}</td>
                            <td className="px-4 py-3 text-blue-500 cursor-pointer hover:underline">编辑</td>
                          </tr>
                        ))
                      ) : (
                        <tr className="text-[11px] hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 text-center">
                            <input type="checkbox" className="rounded-[2px] border-gray-300 text-blue-500 focus:ring-blue-500" />
                          </td>
                          <td className="px-4 py-3 text-gray-800 font-medium">{document.name}</td>
                          <td className="px-4 py-3 text-gray-600 font-mono">{'materialCode' in document ? document.materialCode : '--'}</td>
                          <td className="px-4 py-3 text-gray-500 truncate max-w-[150px]">{'spec' in document ? document.spec : '--'}</td>
                          <td className="px-4 py-3 text-right text-gray-800">0.00</td>
                          <td className="px-4 py-3 text-right font-bold text-gray-700">{qty.toFixed(2)}</td>
                          <td className="px-4 py-3 text-gray-600">台</td>
                          <td className="px-4 py-3 text-right text-gray-800">0.00</td>
                          <td className="px-4 py-3 text-blue-500 cursor-pointer hover:underline">编辑</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Section 05: Inventory Information */}
          {isPlan && (
            <div className="bg-white border border-erp-border rounded-[2px] shadow-sm overflow-hidden">
              <div className="px-4 py-2.5 border-b border-erp-border flex items-center justify-between bg-white">
                <div className="flex items-center space-x-2">
                  <span className="text-blue-500 font-bold text-xs">05</span>
                  <span className="text-blue-500 font-bold text-xs">库存信息</span>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-300" />
              </div>
              <div className="p-4 space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-[#F5F7FA]">
                      <tr className="text-[11px] text-gray-600 border-b border-erp-border font-medium">
                        <th className="w-12 px-4 py-3 text-center">序</th>
                        <th className="px-4 py-3">仓库名称</th>
                        <th className="px-4 py-3">仓库所属单位</th>
                        <th className="px-4 py-3">责任人</th>
                        <th className="px-4 py-3">物料名称</th>
                        <th className="px-4 py-3">物料编码</th>
                        <th className="px-4 py-3">规格型号</th>
                        <th className="px-4 py-3">品牌</th>
                        <th className="px-4 py-3 text-right">库存数量</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-erp-border">
                      <tr className="text-[11px] hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-center text-gray-400">1</td>
                        <td className="px-4 py-3 text-gray-800">中心仓库</td>
                        <td className="px-4 py-3 text-gray-800">系统管理部</td>
                        <td className="px-4 py-3 text-gray-800">系统管理员</td>
                        <td className="px-4 py-3 text-gray-800 font-medium">{document.name}</td>
                        <td className="px-4 py-3 text-gray-600 font-mono">{'materialCode' in document ? document.materialCode : '--'}</td>
                        <td className="px-4 py-3 text-gray-500">{'spec' in document ? document.spec : '--'}</td>
                        <td className="px-4 py-3 text-gray-500">通用</td>
                        <td className="px-4 py-3 text-right font-bold text-gray-700">100.00</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                {/* Pagination */}
                <div className="flex items-center justify-end space-x-2 text-[10px] text-gray-500 pt-2">
                  <div className="flex items-center border border-gray-200 rounded-[2px] overflow-hidden">
                    <button className="px-2 py-1 hover:bg-gray-50 border-r border-gray-200 disabled:opacity-50" disabled>
                      <ChevronLeft className="w-3 h-3" />
                    </button>
                    <button className="px-2 py-1 hover:bg-gray-50 disabled:opacity-50" disabled>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="flex items-center space-x-1">
                    <select className="border border-gray-200 rounded-[2px] px-1 py-0.5 outline-none bg-white">
                      <option>10 条/页</option>
                    </select>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span>跳至</span>
                    <input type="text" className="w-8 border border-gray-200 rounded-[2px] px-1 py-0.5 text-center outline-none bg-white" defaultValue="1" />
                    <span>页</span>
                  </div>
                  <span>共0条</span>
                </div>
              </div>
            </div>
          )}

          {/* Section 06: Original Procurement Plan Information */}
          {isPlan && (
            <div className="bg-white border border-erp-border rounded-[2px] shadow-sm overflow-hidden">
              <div className="px-4 py-2.5 border-b border-erp-border flex items-center justify-between bg-white">
                <div className="flex items-center space-x-2">
                  <span className="text-blue-500 font-bold text-xs">06</span>
                  <span className="text-blue-500 font-bold text-xs">原采购计划信息</span>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-300" />
              </div>
              <div className="p-4 space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-[#F5F7FA]">
                      <tr className="text-[11px] text-gray-600 border-b border-erp-border font-medium">
                        <th className="w-12 px-4 py-3 text-center">序</th>
                        <th className="px-4 py-3">采购计划编号</th>
                        <th className="px-4 py-3">采购计划内容</th>
                        <th className="px-4 py-3 text-right">采购计划预算 (元)</th>
                        <th className="px-4 py-3">预计采购时间</th>
                        <th className="px-4 py-3">查看</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-erp-border">
                      <tr>
                        <td colSpan={6} className="py-12">
                          <div className="flex flex-col items-center justify-center text-gray-400 space-y-2">
                            <div className="w-16 h-16 bg-gray-50 rounded-lg flex items-center justify-center border border-dashed border-gray-200">
                              <FileText className="w-8 h-8 text-gray-200" />
                            </div>
                            <span className="text-xs">暂无数据</span>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                {/* Pagination */}
                <div className="flex items-center justify-end space-x-2 text-[10px] text-gray-500 pt-2">
                  <div className="flex items-center border border-gray-200 rounded-[2px] overflow-hidden">
                    <button className="px-2 py-1 hover:bg-gray-50 border-r border-gray-200 disabled:opacity-50" disabled>
                      <ChevronLeft className="w-3 h-3" />
                    </button>
                    <button className="px-2 py-1 hover:bg-gray-50 disabled:opacity-50" disabled>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="flex items-center space-x-1">
                    <select className="border border-gray-200 rounded-[2px] px-1 py-0.5 outline-none bg-white">
                      <option>10 条/页</option>
                    </select>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span>跳至</span>
                    <input type="text" className="w-8 border border-gray-200 rounded-[2px] px-1 py-0.5 text-center outline-none bg-white" defaultValue="1" />
                    <span>页</span>
                  </div>
                  <span>共0条</span>
                </div>
              </div>
            </div>
          )}

          {/* Section 03/04/07: History / Lineage */}
          <div className="bg-white border border-erp-border rounded-[2px] shadow-sm overflow-hidden">
            <div className="px-4 py-2.5 border-b border-erp-border flex items-center justify-between bg-white">
              <div className="flex items-center space-x-2">
                <span className="text-blue-500 font-bold text-xs">{isReq ? '03' : '07'}</span>
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
                        <HistoryIcon className="w-4 h-4 text-orange-500" />
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
                  <HistoryIcon className="w-4 h-4" />
                  <span>暂无历史溯源关联记录</span>
                </div>
              )}
            </div>
          </div>
          {/* Section 04/05/08: Change/Termination History */}
          {(history.length > 0) && (
            <div className="bg-white border border-erp-border rounded-[2px] shadow-sm overflow-hidden">
              <div className="px-4 py-2.5 border-b border-erp-border flex items-center justify-between bg-white">
                <div className="flex items-center space-x-2">
                  <span className="text-blue-500 font-bold text-xs">{isReq ? '04' : '08'}</span>
                  <span className="text-blue-500 font-bold text-xs">变更/取消历史记录</span>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-300" />
              </div>
              <div className="p-6">
                <div className="relative border-l-2 border-gray-100 ml-3 space-y-8">
                  {history.map((record, idx) => (
                    <div key={record.id} className="relative pl-8">
                      <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-2 border-blue-500 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                      </div>
                      <div className="bg-gray-50 rounded p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              record.type === 'CHANGE' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {record.type === 'CHANGE' ? '变更记录' : '取消记录'}
                            </span>
                            <span className="text-xs font-bold text-gray-800">{record.operator}</span>
                          </div>
                          <div className="flex items-center text-[10px] text-gray-400 space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{record.timestamp}</span>
                          </div>
                        </div>
                        <div className="flex items-start space-x-2 text-xs text-gray-600">
                          <MessageSquare className="w-3.5 h-3.5 mt-0.5 text-gray-400" />
                          <p className="leading-relaxed">
                            <span className="font-medium text-gray-500 mr-1">{record.type === 'CHANGE' ? '变更理由:' : '取消理由:'}</span>
                            {record.reason}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2 text-[10px]">
                          <span className="text-gray-400">执行状态:</span>
                          <span className="text-green-600 font-medium">{record.status}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
