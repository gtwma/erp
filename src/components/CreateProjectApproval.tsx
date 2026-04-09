import React, { useState, useEffect } from 'react';
import { Plan, Subcontract, ProjectApproval, LotInfo, LineItem } from '../types';
import { X, ChevronDown, ChevronUp, Plus, Trash2, Edit3, Save, Send, Link as LinkIcon, FileText, User, Building2, Phone, MapPin, CheckCircle2 } from 'lucide-react';
import { PickPlanModal } from './PickPlanModal';
import { LotDetailModal } from './LotDetailModal';

interface CreateProjectApprovalProps {
  onClose: () => void;
  onSave: (project: ProjectApproval) => void;
  onApprove?: (id: string) => void;
  plans: Plan[];
  subcontracts: Subcontract[];
  project?: ProjectApproval;
}

export const CreateProjectApproval: React.FC<CreateProjectApprovalProps> = ({ 
  onClose, 
  onSave, 
  onApprove, 
  plans, 
  subcontracts,
  project 
}) => {
  const [isPickModalOpen, setIsPickModalOpen] = useState(false);
  const [editingLot, setEditingLot] = useState<LotInfo | null>(null);
  const [formData, setFormData] = useState<Partial<ProjectApproval>>(project || {
    id: `GCTC-CG-2026-${Math.floor(Math.random() * 1000)}`,
    status: '编辑中',
    createdAt: new Date().toLocaleString(),
    lots: [],
    source: '自筹',
    type: '国有资金控股或占主导地位的依法招标',
  });

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    '01': true,
    '02': true,
    '03': true,
    '04': true,
  });

  const toggleSection = (id: string) => {
    setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handlePickPlan = (plan: Plan) => {
    // Find subcontracts associated with this plan
    const associatedSubs = subcontracts.filter(sub => sub.planIds.includes(plan.id));
    
    const newLots: LotInfo[] = associatedSubs.map(sub => ({
      id: `${plan.id}-${sub.id.split('-').pop()}`,
      name: sub.name,
      content: sub.name,
      budget: sub.items?.reduce((sum, item) => sum + (item.qty * item.unitPrice), 0) || 0,
      items: sub.items || []
    }));

    setFormData(prev => ({
      ...prev,
      planId: plan.id,
      name: plan.name,
      lots: newLots,
      summary: plan.name,
    }));
    setIsPickModalOpen(false);
  };

  const handleSaveLot = (updatedLot: LotInfo) => {
    setFormData(prev => ({
      ...prev,
      lots: prev.lots?.map(l => l.id === updatedLot.id ? updatedLot : l)
    }));
    setEditingLot(null);
  };

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden border-l border-erp-border shadow-xl">
      {/* Header */}
      <div className="px-6 py-4 border-b border-erp-border flex items-center justify-between bg-white sticky top-0 z-20">
        <div className="flex flex-col">
          <h2 className="text-lg font-bold text-gray-800">{project ? '查看/编辑采购立项' : '新增采购立项'}</h2>
          <div className="flex items-center space-x-4 mt-1 text-[11px] text-gray-500">
            <span>招标采购立项</span>
            <span>创建时间：{formData.createdAt}</span>
            <span>状态：<span className="text-blue-500 font-medium">{formData.status}</span></span>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button className="px-4 py-1.5 border border-gray-300 rounded-[2px] text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            修改保存
          </button>
          <button 
            onClick={() => onSave(formData as ProjectApproval)}
            className="px-4 py-1.5 bg-[#2196F3] text-white rounded-[2px] text-xs font-medium hover:bg-blue-600 transition-colors flex items-center space-x-1"
          >
            <Send className="w-3.5 h-3.5" />
            <span>提交信息</span>
          </button>
          {onApprove && formData.id && formData.status !== '审核通过' && (
            <button 
              onClick={() => {
                onApprove(formData.id!);
                onClose();
              }}
              className="px-4 py-1.5 bg-green-600 text-white rounded-[2px] text-xs font-medium hover:bg-green-700 transition-colors flex items-center space-x-1"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>审核通过</span>
            </button>
          )}
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 border-b border-erp-border bg-gray-50/50">
        <div className="flex space-x-8">
          {['基本信息', '附件信息', '审批记录'].map((tab, i) => (
            <button 
              key={tab} 
              className={`py-3 text-xs font-medium border-b-2 transition-colors ${i === 0 ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-auto p-6 space-y-6 bg-gray-50/30">
        {/* Section 01: 项目信息 */}
        <div className="bg-white border border-gray-200 rounded-sm overflow-hidden">
          <div 
            className="px-4 py-2 bg-white border-b border-gray-100 flex items-center justify-between cursor-pointer"
            onClick={() => toggleSection('01')}
          >
            <div className="flex items-center space-x-2">
              <span className="text-blue-500 font-bold text-xs">01</span>
              <span className="text-xs font-bold text-gray-700">项目信息</span>
            </div>
            {expandedSections['01'] ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
          </div>
          
          {expandedSections['01'] && (
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="flex flex-col space-y-1.5">
                  <label className="text-[11px] font-medium text-gray-600 flex items-center">
                    项目名称：<span className="text-red-500 ml-0.5">*</span>
                  </label>
                  <div className="flex flex-col space-y-2">
                    <input 
                      type="text" 
                      className="w-full border border-gray-300 rounded-[2px] px-3 py-1.5 text-xs focus:outline-none focus:border-blue-500"
                      value={formData.name || ''}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                    <button 
                      onClick={() => setIsPickModalOpen(true)}
                      className="w-fit px-3 py-1.5 bg-[#2196F3] text-white rounded-[2px] text-[11px] font-medium hover:bg-blue-600 transition-colors flex items-center space-x-1.5"
                    >
                      <LinkIcon className="w-3.5 h-3.5" />
                      <span>关联采购计划</span>
                    </button>
                  </div>
                </div>

                <div className="flex flex-col space-y-1.5">
                  <label className="text-[11px] font-medium text-gray-600 flex items-center">
                    采购条件：<span className="text-red-500 ml-0.5">*</span>
                  </label>
                  <textarea className="w-full border border-gray-300 rounded-[2px] px-3 py-1.5 text-xs focus:outline-none focus:border-blue-500 h-20" />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="flex flex-col space-y-1.5">
                    <label className="text-[11px] font-medium text-gray-600 flex items-center">
                      资金来源：<span className="text-red-500 ml-0.5">*</span>
                    </label>
                    <div className="flex items-center space-x-4 text-xs">
                      <label className="flex items-center space-x-1.5 cursor-pointer">
                        <input type="radio" name="source" checked={formData.source === '自筹'} onChange={() => setFormData({...formData, source: '自筹'})} />
                        <span>自筹</span>
                      </label>
                      <label className="flex items-center space-x-1.5 cursor-pointer">
                        <input type="radio" name="source" checked={formData.source === '政府预算补助资金'} onChange={() => setFormData({...formData, source: '政府预算补助资金'})} />
                        <span>政府预算补助资金</span>
                      </label>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <label className="text-[11px] font-medium text-gray-600 flex items-center">
                      采购情形：<span className="text-red-500 ml-0.5">*</span>
                    </label>
                    <div className="flex items-center space-x-4 text-xs">
                      <label className="flex items-center space-x-1.5 cursor-pointer">
                        <input type="radio" name="type" checked={formData.type === '国有资金控股或占主导地位的依法招标'} onChange={() => setFormData({...formData, type: '国有资金控股或占主导地位的依法招标'})} />
                        <span>国有资金控股或占主导地位的依法招标</span>
                      </label>
                      <label className="flex items-center space-x-1.5 cursor-pointer">
                        <input type="radio" name="type" checked={formData.type === '其他情形的采购'} onChange={() => setFormData({...formData, type: '其他情形的采购'})} />
                        <span>其他情形的采购</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col space-y-1.5">
                  <label className="text-[11px] font-medium text-gray-600 flex items-center">
                    项目地点：<span className="text-red-500 ml-0.5">*</span>
                  </label>
                  <input type="text" className="w-full border border-gray-300 rounded-[2px] px-3 py-1.5 text-xs focus:outline-none focus:border-blue-500" />
                </div>

                <div className="flex flex-col space-y-1.5">
                  <label className="text-[11px] font-medium text-gray-600 flex items-center">
                    项目概况：<span className="text-red-500 ml-0.5">*</span>
                  </label>
                  <textarea 
                    className="w-full border border-gray-300 rounded-[2px] px-3 py-1.5 text-xs focus:outline-none focus:border-blue-500 h-32"
                    value={formData.summary || ''}
                    onChange={e => setFormData({...formData, summary: e.target.value})}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Section 02: 采购项目信息 */}
        <div className="bg-white border border-gray-200 rounded-sm overflow-hidden">
          <div 
            className="px-4 py-2 bg-white border-b border-gray-100 flex items-center justify-between cursor-pointer"
            onClick={() => toggleSection('02')}
          >
            <div className="flex items-center space-x-2">
              <span className="text-blue-500 font-bold text-xs">02</span>
              <span className="text-xs font-bold text-gray-700">采购项目信息</span>
            </div>
            {expandedSections['02'] ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
          </div>
          {expandedSections['02'] && (
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="flex flex-col space-y-1.5">
                  <label className="text-[11px] font-medium text-gray-600 flex items-center">
                    采购项目名称：<span className="text-red-500 ml-0.5">*</span>
                  </label>
                  <input type="text" className="w-full border border-gray-300 rounded-[2px] px-3 py-1.5 text-xs focus:outline-none focus:border-blue-500" value={formData.name || ''} readOnly />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <label className="text-[11px] font-medium text-gray-600 flex items-center">
                    采购内容与范围及采购方案说明：<span className="text-red-500 ml-0.5">*</span>
                  </label>
                  <textarea className="w-full border border-gray-300 rounded-[2px] px-3 py-1.5 text-xs focus:outline-none focus:border-blue-500 h-24" />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="flex flex-col space-y-1.5">
                    <label className="text-[11px] font-medium text-gray-600 flex items-center">
                      采购类型：<span className="text-red-500 ml-0.5">*</span>
                    </label>
                    <select className="w-full border border-gray-300 rounded-[2px] px-3 py-1.5 text-xs focus:outline-none focus:border-blue-500 bg-white">
                      <option>货物类</option>
                      <option>工程类</option>
                      <option>服务类</option>
                    </select>
                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <label className="text-[11px] font-medium text-gray-600 flex items-center">
                      采购组织方式：<span className="text-red-500 ml-0.5">*</span>
                    </label>
                    <div className="flex items-center space-x-4 text-xs h-full">
                      <label className="flex items-center space-x-1.5 cursor-pointer">
                        <input type="radio" name="org" defaultChecked />
                        <span>委托采购</span>
                      </label>
                      <label className="flex items-center space-x-1.5 cursor-pointer">
                        <input type="radio" name="org" />
                        <span>自行采购</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Section 03: 采购人/采购代理信息 */}
        <div className="bg-white border border-gray-200 rounded-sm overflow-hidden">
          <div 
            className="px-4 py-2 bg-white border-b border-gray-100 flex items-center justify-between cursor-pointer"
            onClick={() => toggleSection('03')}
          >
            <div className="flex items-center space-x-2">
              <span className="text-blue-500 font-bold text-xs">03</span>
              <span className="text-xs font-bold text-gray-700">采购人/采购代理信息</span>
            </div>
            {expandedSections['03'] ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
          </div>
          {expandedSections['03'] && (
            <div className="p-6 space-y-6">
              <div className="flex items-center space-x-6">
                <label className="text-[11px] font-medium text-gray-600 flex items-center">
                  是否为集团外部采购人：<span className="text-red-500 ml-0.5">*</span>
                </label>
                <div className="flex items-center space-x-4 text-xs">
                  <label className="flex items-center space-x-1.5 cursor-pointer">
                    <input type="radio" name="external" />
                    <span>是</span>
                  </label>
                  <label className="flex items-center space-x-1.5 cursor-pointer">
                    <input type="radio" name="external" defaultChecked />
                    <span>否</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-12 gap-y-4">
                <div className="flex flex-col space-y-1.5">
                  <label className="text-[11px] font-medium text-gray-600 flex items-center">
                    采购人：<span className="text-red-500 ml-0.5">*</span>
                  </label>
                  <select className="w-full border border-gray-300 rounded-[2px] px-3 py-1.5 text-xs focus:outline-none focus:border-blue-500 bg-white">
                    <option>请选择采购人...</option>
                    <option>甘肃能化股份有限公司</option>
                  </select>
                </div>
                <div className="flex flex-col space-y-1.5">
                  <label className="text-[11px] font-medium text-gray-600 flex items-center">
                    采购负责人：<span className="text-red-500 ml-0.5">*</span>
                  </label>
                  <select className="w-full border border-gray-300 rounded-[2px] px-3 py-1.5 text-xs focus:outline-none focus:border-blue-500 bg-white">
                    <option>请选择采购负责人...</option>
                    <option>张三</option>
                  </select>
                </div>
                <div className="flex flex-col space-y-1.5">
                  <label className="text-[11px] font-medium text-gray-600 flex items-center">
                    采购负责人所在部门：<span className="text-red-500 ml-0.5">*</span>
                  </label>
                  <input type="text" className="w-full border border-gray-300 rounded-[2px] px-3 py-1.5 text-xs bg-gray-50" readOnly value="采购部" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col space-y-1.5">
                    <label className="text-[11px] font-medium text-gray-600">联系人：</label>
                    <input type="text" className="w-full border border-gray-300 rounded-[2px] px-3 py-1.5 text-xs" />
                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <label className="text-[11px] font-medium text-gray-600">联系方式：</label>
                    <input type="text" className="w-full border border-gray-300 rounded-[2px] px-3 py-1.5 text-xs" />
                  </div>
                </div>
                <div className="flex flex-col space-y-1.5">
                  <label className="text-[11px] font-medium text-gray-600">联系地址：</label>
                  <input type="text" className="w-full border border-gray-300 rounded-[2px] px-3 py-1.5 text-xs" />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <label className="text-[11px] font-medium text-gray-600 flex items-center">
                    采购人统一社会信用代码：<span className="text-red-500 ml-0.5">*</span>
                  </label>
                  <input type="text" className="w-full border border-gray-300 rounded-[2px] px-3 py-1.5 text-xs" />
                </div>

                <div className="flex flex-col space-y-1.5">
                  <label className="text-[11px] font-medium text-gray-600 flex items-center">
                    采购代理：<span className="text-red-500 ml-0.5">*</span>
                  </label>
                  <select className="w-full border border-gray-300 rounded-[2px] px-3 py-1.5 text-xs focus:outline-none focus:border-blue-500 bg-white">
                    <option>系统管理部</option>
                  </select>
                </div>
                <div className="flex flex-col space-y-1.5">
                  <label className="text-[11px] font-medium text-gray-600 flex items-center">
                    采购代理负责人：<span className="text-red-500 ml-0.5">*</span>
                  </label>
                  <select className="w-full border border-gray-300 rounded-[2px] px-3 py-1.5 text-xs focus:outline-none focus:border-blue-500 bg-white">
                    <option>系统管理员</option>
                  </select>
                </div>
                <div className="flex flex-col space-y-1.5">
                  <label className="text-[11px] font-medium text-gray-600 flex items-center">
                    采购代理负责人部门：<span className="text-red-500 ml-0.5">*</span>
                  </label>
                  <input type="text" className="w-full border border-gray-300 rounded-[2px] px-3 py-1.5 text-xs bg-gray-50" readOnly value="系统管理部" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col space-y-1.5">
                    <label className="text-[11px] font-medium text-gray-600">联系人：<span className="text-red-500 ml-0.5">*</span></label>
                    <input type="text" className="w-full border border-gray-300 rounded-[2px] px-3 py-1.5 text-xs" defaultValue="系统管理员" />
                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <label className="text-[11px] font-medium text-gray-600">联系方式：</label>
                    <input type="text" className="w-full border border-gray-300 rounded-[2px] px-3 py-1.5 text-xs" defaultValue="18714997047" />
                  </div>
                </div>
                <div className="flex flex-col space-y-1.5">
                  <label className="text-[11px] font-medium text-gray-600">联系地址：</label>
                  <input type="text" className="w-full border border-gray-300 rounded-[2px] px-3 py-1.5 text-xs" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Section 04: 标段(包)信息 */}
        <div className="bg-white border border-gray-200 rounded-sm overflow-hidden">
          <div 
            className="px-4 py-2 bg-white border-b border-gray-100 flex items-center justify-between cursor-pointer"
            onClick={() => toggleSection('04')}
          >
            <div className="flex items-center space-x-2">
              <span className="text-blue-500 font-bold text-xs">04</span>
              <span className="text-xs font-bold text-gray-700">标段(包)信息</span>
            </div>
            {expandedSections['04'] ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
          </div>
          {expandedSections['04'] && (
            <div className="p-4 space-y-4">
              <div className="flex items-center space-x-2">
                <button className="px-3 py-1 border border-gray-300 rounded-[2px] text-[11px] font-medium text-gray-600 hover:bg-gray-50">新增标段(包)</button>
                <button className="px-3 py-1 border border-gray-300 rounded-[2px] text-[11px] font-medium text-gray-600 hover:bg-gray-50">删除标段(包)</button>
              </div>
              
              <div className="border border-gray-200 rounded-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-[11px] text-gray-500 border-b border-gray-200">
                      <th className="px-4 py-2 w-10 text-center"><input type="checkbox" className="rounded" /></th>
                      <th className="px-4 py-2 w-12 text-center">序</th>
                      <th className="px-4 py-2">标段(包)编号</th>
                      <th className="px-4 py-2">标段(包)名称</th>
                      <th className="px-4 py-2">标段(包)内容</th>
                      <th className="px-4 py-2 text-right">标段(包)采购预算价</th>
                      <th className="px-4 py-2 text-center">修改</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {formData.lots?.map((lot, index) => (
                      <tr key={lot.id} className="text-xs hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-2.5 text-center"><input type="checkbox" className="rounded" /></td>
                        <td className="px-4 py-2.5 text-center text-gray-400">{index + 1}</td>
                        <td className="px-4 py-2.5 font-mono">{lot.id}</td>
                        <td className="px-4 py-2.5 font-medium">{lot.name}</td>
                        <td className="px-4 py-2.5 text-gray-500 truncate max-w-[200px]">{lot.content}</td>
                        <td className="px-4 py-2.5 text-right font-bold text-erp-secondary">¥{lot.budget.toLocaleString()}</td>
                        <td className="px-4 py-2.5 text-center">
                          <button 
                            onClick={() => setEditingLot(lot)}
                            className="text-blue-500 hover:underline"
                          >
                            编辑
                          </button>
                        </td>
                      </tr>
                    ))}
                    {(!formData.lots || formData.lots.length === 0) && (
                      <tr>
                        <td colSpan={7} className="px-4 py-12 text-center">
                          <div className="flex flex-col items-center justify-center space-y-2 text-gray-400">
                            <FileText className="w-10 h-10 opacity-20" />
                            <span className="text-xs">暂无数据</span>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      <PickPlanModal 
        isOpen={isPickModalOpen}
        onClose={() => setIsPickModalOpen(false)}
        onConfirm={handlePickPlan}
        plans={plans}
      />

      {editingLot && (
        <LotDetailModal 
          isOpen={true}
          onClose={() => setEditingLot(null)}
          lot={editingLot}
          onSave={handleSaveLot}
        />
      )}
    </div>
  );
};
