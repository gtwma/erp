/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Requirement, ReqStatus } from '../types';
import { X, Save, AlertCircle, ChevronDown, Plus, Trash2, ClipboardList, Package } from 'lucide-react';

interface CreateRequirementProps {
  onClose: () => void;
  onSave: (req: Requirement) => void;
}

export const CreateRequirement: React.FC<CreateRequirementProps> = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: '货物',
    applyUnit: '系统管理部',
    applyPerson: '系统管理员',
    applyDate: new Date().toISOString().split('T')[0],
    reason: '',
  });

  const [items, setItems] = useState([
    { id: '1', materialName: '', materialCode: '', spec: '', unit: '个', qty: 1, unitPrice: 0 }
  ]);

  const addItem = () => {
    setItems([...items, { id: Date.now().toString(), materialName: '', materialCode: '', spec: '', unit: '个', qty: 1, unitPrice: 0 }]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, we'd handle multiple items. For this mock, we'll just save the first one or a summary.
    const newReq: Requirement = {
      id: `REQ-${Date.now()}`,
      name: formData.name || items[0].materialName || '未命名需求',
      materialCode: items[0].materialCode,
      spec: items[0].spec,
      qty: items.reduce((sum, item) => sum + item.qty, 0),
      assignedQty: 0,
      unitPrice: items[0].unitPrice,
      status: ReqStatus.PENDING,
      createdAt: new Date().toLocaleString(),
      creator: formData.applyPerson,
    };
    onSave(newReq);
  };

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      {/* Header Info */}
      <div className="px-4 py-2 border-b border-erp-border bg-white flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-4">
          <span className="text-xs font-bold text-erp-text-main">采购需求申请</span>
          <span className="text-[10px] text-erp-text-sub">申请编号: <span className="text-erp-text-main">自动生成</span></span>
          <span className="text-[10px] text-erp-text-sub">状态: <span className="text-blue-500">草稿</span></span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 overflow-auto p-4 space-y-6">
        {/* Section 01: Basic Info */}
        <div className="border border-blue-200 rounded overflow-hidden">
          <div className="px-4 py-2 bg-white border-b border-blue-100 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-blue-500 font-bold text-xs">01</span>
              <span className="text-blue-500 font-bold text-xs">基本信息</span>
            </div>
            <ChevronDown className="w-4 h-4 text-blue-400" />
          </div>
          
          <div className="p-6 bg-white grid grid-cols-2 gap-x-12 gap-y-4">
            <div className="col-span-2 flex items-start space-x-4">
              <label className="w-32 text-right text-xs text-erp-text-main pt-2 shrink-0">
                申请内容: <span className="text-red-500">*</span>
              </label>
              <textarea 
                required
                className="flex-1 border border-erp-border rounded p-2 text-xs outline-none focus:border-erp-secondary h-16"
                placeholder="请输入申请内容"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>

            <div className="flex items-center space-x-4">
              <label className="w-32 text-right text-xs text-erp-text-main shrink-0">
                需求类型: <span className="text-red-500">*</span>
              </label>
              <select 
                className="flex-1 border border-erp-border rounded px-3 py-1.5 text-xs outline-none bg-white"
                value={formData.type}
                onChange={e => setFormData({...formData, type: e.target.value})}
              >
                <option value="货物">货物</option>
                <option value="工程">工程</option>
                <option value="服务">服务</option>
              </select>
            </div>

            <div className="flex items-center space-x-4">
              <label className="w-32 text-right text-xs text-erp-text-main shrink-0">
                申请日期:
              </label>
              <input 
                type="date" 
                className="flex-1 border border-erp-border rounded px-3 py-1.5 text-xs outline-none"
                value={formData.applyDate}
                onChange={e => setFormData({...formData, applyDate: e.target.value})}
              />
            </div>

            <div className="flex items-center space-x-4">
              <label className="w-32 text-right text-xs text-erp-text-main shrink-0">
                申请单位:
              </label>
              <input type="text" className="flex-1 border border-erp-border rounded px-3 py-1.5 text-xs outline-none bg-gray-50" value={formData.applyUnit} readOnly />
            </div>

            <div className="flex items-center space-x-4">
              <label className="w-32 text-right text-xs text-erp-text-main shrink-0">
                申请人:
              </label>
              <input type="text" className="flex-1 border border-erp-border rounded px-3 py-1.5 text-xs outline-none bg-gray-50" value={formData.applyPerson} readOnly />
            </div>

            <div className="col-span-2 flex items-start space-x-4">
              <label className="w-32 text-right text-xs text-erp-text-main pt-2 shrink-0">
                申请原因:
              </label>
              <textarea 
                className="flex-1 border border-erp-border rounded p-2 text-xs outline-none focus:border-erp-secondary h-16"
                placeholder="请输入申请原因"
                value={formData.reason}
                onChange={e => setFormData({...formData, reason: e.target.value})}
              />
            </div>
          </div>
        </div>

        {/* Section 02: Item Details */}
        <div className="border border-blue-200 rounded overflow-hidden">
          <div className="px-4 py-2 bg-white border-b border-blue-100 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-blue-500 font-bold text-xs">02</span>
              <span className="text-blue-500 font-bold text-xs">需求明细</span>
            </div>
            <ChevronDown className="w-4 h-4 text-blue-400" />
          </div>
          
          <div className="p-4 bg-white">
            <div className="flex items-center space-x-2 mb-4">
              <button 
                type="button"
                onClick={addItem}
                className="text-[11px] px-4 py-1.5 border border-gray-300 rounded-[2px] text-gray-600 hover:bg-gray-50 flex items-center space-x-1 bg-white transition-colors"
              >
                <Plus className="w-3 h-3" />
                <span>新增行</span>
              </button>
            </div>
            
            <div className="border border-erp-border rounded overflow-hidden overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[1000px]">
                <thead className="bg-gray-50">
                  <tr className="text-[11px] text-erp-text-main border-b border-erp-border">
                    <th className="w-12 px-2 py-2 text-center">序</th>
                    <th className="px-4 py-2">物料名称 <span className="text-red-500">*</span></th>
                    <th className="px-4 py-2">物料编码</th>
                    <th className="px-4 py-2">规格型号</th>
                    <th className="px-4 py-2 w-20">单位</th>
                    <th className="px-4 py-2 w-24">数量 <span className="text-red-500">*</span></th>
                    <th className="px-4 py-2 w-32">预估单价(元)</th>
                    <th className="px-4 py-2 w-32">预估总价(元)</th>
                    <th className="w-16 px-4 py-2 text-center">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={item.id} className="border-b border-erp-border last:border-0">
                      <td className="px-2 py-2 text-center text-erp-text-sub">{index + 1}</td>
                      <td className="px-4 py-2">
                        <input 
                          required
                          type="text" 
                          className="w-full border border-erp-border rounded px-2 py-1 text-xs outline-none" 
                          value={item.materialName}
                          onChange={e => {
                            const newItems = [...items];
                            newItems[index].materialName = e.target.value;
                            setItems(newItems);
                          }}
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input 
                          type="text" 
                          className="w-full border border-erp-border rounded px-2 py-1 text-xs outline-none" 
                          value={item.materialCode}
                          onChange={e => {
                            const newItems = [...items];
                            newItems[index].materialCode = e.target.value;
                            setItems(newItems);
                          }}
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input 
                          type="text" 
                          className="w-full border border-erp-border rounded px-2 py-1 text-xs outline-none" 
                          value={item.spec}
                          onChange={e => {
                            const newItems = [...items];
                            newItems[index].spec = e.target.value;
                            setItems(newItems);
                          }}
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input 
                          type="text" 
                          className="w-full border border-erp-border rounded px-2 py-1 text-xs outline-none" 
                          value={item.unit}
                          onChange={e => {
                            const newItems = [...items];
                            newItems[index].unit = e.target.value;
                            setItems(newItems);
                          }}
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input 
                          required
                          type="number" 
                          min="1"
                          className="w-full border border-erp-border rounded px-2 py-1 text-xs outline-none" 
                          value={item.qty}
                          onChange={e => {
                            const newItems = [...items];
                            newItems[index].qty = Number(e.target.value);
                            setItems(newItems);
                          }}
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input 
                          type="number" 
                          step="0.01"
                          className="w-full border border-erp-border rounded px-2 py-1 text-xs outline-none" 
                          value={item.unitPrice}
                          onChange={e => {
                            const newItems = [...items];
                            newItems[index].unitPrice = Number(e.target.value);
                            setItems(newItems);
                          }}
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input 
                          type="text" 
                          className="w-full border border-erp-border rounded px-2 py-1 text-xs outline-none bg-gray-50" 
                          value={(item.qty * item.unitPrice).toFixed(2)}
                          readOnly
                        />
                      </td>
                      <td className="px-4 py-2 text-center">
                        <button 
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="text-red-400 hover:text-red-600 disabled:opacity-30"
                          disabled={items.length === 1}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Hidden Submit Button for form handling */}
        <button id="req-submit-btn" type="submit" className="hidden">Submit</button>
      </form>
    </div>
  );
};
