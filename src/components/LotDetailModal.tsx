import React, { useState } from 'react';
import { LotInfo, LineItem } from '../types';
import { X, ChevronDown, ChevronUp, Plus, Trash2, FileDown, FileUp, Upload } from 'lucide-react';

interface LotDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  lot: LotInfo;
  onSave: (updatedLot: LotInfo) => void;
}

export const LotDetailModal: React.FC<LotDetailModalProps> = ({ isOpen, onClose, lot, onSave }) => {
  const [editedLot, setEditedLot] = useState<LotInfo>({ ...lot });
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    '01': true,
    '02': true,
  });

  const toggleSection = (id: string) => {
    setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-sm shadow-2xl w-full max-w-6xl flex flex-col max-h-[95vh]">
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <h3 className="text-sm font-bold text-gray-800">修改招标采购立项 - 标段(包)信息</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6 space-y-6 bg-gray-50/30">
          {/* Section 01: 标段(包)信息 */}
          <div className="bg-white border border-gray-200 rounded-sm overflow-hidden">
            <div 
              className="px-4 py-2 bg-white border-b border-gray-100 flex items-center justify-between cursor-pointer"
              onClick={() => toggleSection('01')}
            >
              <div className="flex items-center space-x-2">
                <span className="text-blue-500 font-bold text-xs">01</span>
                <span className="text-xs font-bold text-gray-700">标段(包)信息</span>
              </div>
              {expandedSections['01'] ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
            </div>
            
            {expandedSections['01'] && (
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-6">
                  <div className="flex flex-col space-y-1.5">
                    <label className="text-[11px] font-medium text-gray-600 flex items-center">
                      标段(包)名称：<span className="text-red-500 ml-0.5">*</span>
                    </label>
                    <input 
                      type="text" 
                      className="w-full border border-gray-300 rounded-[2px] px-3 py-1.5 text-xs focus:outline-none focus:border-blue-500"
                      value={editedLot.name}
                      onChange={e => setEditedLot({...editedLot, name: e.target.value})}
                    />
                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <label className="text-[11px] font-medium text-gray-600 flex items-center">
                      项目行业分类：<span className="text-red-500 ml-0.5">*</span>
                    </label>
                    <select className="w-full border border-gray-300 rounded-[2px] px-3 py-1.5 text-xs focus:outline-none focus:border-blue-500 bg-white">
                      <option>请选择</option>
                      <option>能源化工</option>
                      <option>机械制造</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col space-y-1.5">
                  <label className="text-[11px] font-medium text-gray-600 flex items-center">
                    标段(包)内容：<span className="text-red-500 ml-0.5">*</span>
                  </label>
                  <div className="flex items-center space-x-2">
                    <textarea 
                      className="flex-1 border border-gray-300 rounded-[2px] px-3 py-1.5 text-xs focus:outline-none focus:border-blue-500 h-20"
                      value={editedLot.content}
                      onChange={e => setEditedLot({...editedLot, content: e.target.value})}
                    />
                    <button className="px-4 py-1.5 border border-gray-300 rounded-[2px] text-xs font-medium text-gray-600 hover:bg-gray-50">挑选</button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="flex flex-col space-y-1.5">
                    <label className="text-[11px] font-medium text-gray-600 flex items-center">
                      采购物料种类：
                    </label>
                    <div className="relative">
                      <input type="text" className="w-full border border-gray-300 rounded-[2px] px-3 py-1.5 text-xs focus:outline-none focus:border-blue-500" placeholder="0/50" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col space-y-1.5">
                      <label className="text-[11px] font-medium text-gray-600 flex items-center">
                        标段(包)采购预算价：<span className="text-red-500 ml-0.5">*</span>
                      </label>
                      <input 
                        type="number" 
                        className="w-full border border-gray-300 rounded-[2px] px-3 py-1.5 text-xs focus:outline-none focus:border-blue-500"
                        value={editedLot.budget}
                        onChange={e => setEditedLot({...editedLot, budget: Number(e.target.value)})}
                      />
                    </div>
                    <div className="flex flex-col space-y-1.5">
                      <label className="text-[11px] font-medium text-gray-600 flex items-center">
                        标段(包)采购预算单位：<span className="text-red-500 ml-0.5">*</span>
                      </label>
                      <div className="flex items-center space-x-4 text-xs h-full">
                        <label className="flex items-center space-x-1.5 cursor-pointer">
                          <input type="radio" name="unit" defaultChecked />
                          <span>万元</span>
                        </label>
                        <label className="flex items-center space-x-1.5 cursor-pointer">
                          <input type="radio" name="unit" />
                          <span>元</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="flex flex-col space-y-1.5">
                    <label className="text-[11px] font-medium text-gray-600 flex items-center">
                      项目类型：<span className="text-red-500 ml-0.5">*</span>
                    </label>
                    <select className="w-full border border-gray-300 rounded-[2px] px-3 py-1.5 text-xs focus:outline-none focus:border-blue-500 bg-white">
                      <option>请选择</option>
                      <option>货物类</option>
                      <option>工程类</option>
                      <option>服务类</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col space-y-1.5">
                      <label className="text-[11px] font-medium text-gray-600 flex items-center">
                        服务期：<span className="text-red-500 ml-0.5">*</span>
                      </label>
                      <input type="text" className="w-full border border-gray-300 rounded-[2px] px-3 py-1.5 text-xs focus:outline-none focus:border-blue-500" />
                    </div>
                    <div className="flex flex-col space-y-1.5">
                      <label className="text-[11px] font-medium text-gray-600 flex items-center">
                        单位：<span className="text-red-500 ml-0.5">*</span>
                      </label>
                      <div className="flex items-center space-x-4 text-xs h-full">
                        <label className="flex items-center space-x-1.5 cursor-pointer">
                          <input type="radio" name="timeUnit" defaultChecked />
                          <span>天</span>
                        </label>
                        <label className="flex items-center space-x-1.5 cursor-pointer">
                          <input type="radio" name="timeUnit" />
                          <span>月</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col space-y-1.5">
                  <label className="text-[11px] font-medium text-gray-600 flex items-center">
                    备注：
                  </label>
                  <textarea className="w-full border border-gray-300 rounded-[2px] px-3 py-1.5 text-xs focus:outline-none focus:border-blue-500 h-20" placeholder="0/1000" />
                </div>
              </div>
            )}
          </div>

          {/* Section 02: 物料信息 */}
          <div className="bg-white border border-gray-200 rounded-sm overflow-hidden">
            <div 
              className="px-4 py-2 bg-white border-b border-gray-100 flex items-center justify-between cursor-pointer"
              onClick={() => toggleSection('02')}
            >
              <div className="flex items-center space-x-2">
                <span className="text-blue-500 font-bold text-xs">02</span>
                <span className="text-xs font-bold text-gray-700">物料信息</span>
              </div>
              {expandedSections['02'] ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
            </div>
            
            {expandedSections['02'] && (
              <div className="p-4 space-y-4">
                <div className="flex items-center space-x-2 overflow-x-auto pb-2">
                  <button 
                    onClick={() => {
                      const newItem: LineItem = {
                        id: `LI-NEW-${Math.floor(Math.random() * 1000)}`,
                        materialCode: 'M-NEW',
                        materialName: '新物料',
                        spec: '待完善',
                        qty: 1,
                        unit: '个',
                        unitPrice: 0
                      };
                      setEditedLot({ ...editedLot, items: [...editedLot.items, newItem] });
                    }}
                    className="px-3 py-1 border border-gray-300 rounded-[2px] text-[11px] font-medium text-gray-600 hover:bg-gray-50 flex items-center space-x-1 whitespace-nowrap"
                  >
                    <Plus className="w-3 h-3" />
                    <span>新增物料</span>
                  </button>
                  <button 
                    onClick={() => {
                      const selectedCheckboxes = document.querySelectorAll('.material-checkbox:checked');
                      if (selectedCheckboxes.length > 0) {
                        const idsToRemove = Array.from(selectedCheckboxes).map(cb => cb.getAttribute('data-id'));
                        setEditedLot({ ...editedLot, items: editedLot.items.filter(i => !idsToRemove.includes(i.id)) });
                      } else {
                        alert('请先选择要删除的物料');
                      }
                    }}
                    className="px-3 py-1 border border-gray-300 rounded-[2px] text-[11px] font-medium text-gray-600 hover:bg-gray-50 flex items-center space-x-1 whitespace-nowrap"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>删除物料</span>
                  </button>
                  <button 
                    onClick={() => alert('正在下载Excel清单导入模板...')}
                    className="px-3 py-1 border border-gray-300 rounded-[2px] text-[11px] font-medium text-gray-600 hover:bg-gray-50 flex items-center space-x-1 whitespace-nowrap"
                  >
                    <FileDown className="w-3 h-3" />
                    <span>excel清单导入模板下载</span>
                  </button>
                  <button 
                    onClick={() => alert('正在打开Excel清单导入窗口...')}
                    className="px-3 py-1 border border-gray-300 rounded-[2px] text-[11px] font-medium text-gray-600 hover:bg-gray-50 flex items-center space-x-1 whitespace-nowrap"
                  >
                    <FileUp className="w-3 h-3" />
                    <span>Excel清单导入</span>
                  </button>
                  <button 
                    onClick={() => alert('正在打开Excel导入窗口...')}
                    className="px-3 py-1 border border-gray-300 rounded-[2px] text-[11px] font-medium text-gray-600 hover:bg-gray-50 flex items-center space-x-1 whitespace-nowrap"
                  >
                    <Upload className="w-3 h-3" />
                    <span>Excel导入</span>
                  </button>
                </div>

                <div className="border border-gray-200 rounded-sm overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[1200px]">
                    <thead>
                      <tr className="bg-gray-50 text-[11px] text-gray-500 border-b border-gray-200">
                        <th className="px-4 py-2 w-10 text-center">
                          <input 
                            type="checkbox" 
                            className="rounded" 
                            onChange={(e) => {
                              const checkboxes = document.querySelectorAll('.material-checkbox');
                              checkboxes.forEach((cb: any) => cb.checked = e.target.checked);
                            }}
                          />
                        </th>
                        <th className="px-4 py-2 w-12 text-center">序</th>
                        <th className="px-4 py-2">物料编码</th>
                        <th className="px-4 py-2">物料名称</th>
                        <th className="px-4 py-2">类目编码</th>
                        <th className="px-4 py-2">类目名称</th>
                        <th className="px-4 py-2">物料描述</th>
                        <th className="px-4 py-2">规格型号</th>
                        <th className="px-4 py-2">主机型号</th>
                        <th className="px-4 py-2">图号</th>
                        <th className="px-4 py-2 text-right">采购数量</th>
                        <th className="px-4 py-2">物资购买单位</th>
                        <th className="px-4 py-2 text-right">参考单价(元)</th>
                        <th className="px-4 py-2">需求说明</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {editedLot.items.map((item, index) => (
                        <tr key={item.id} className="text-xs hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-2.5 text-center">
                            <input type="checkbox" className="rounded material-checkbox" data-id={item.id} />
                          </td>
                          <td className="px-4 py-2.5 text-center text-gray-400">{index + 1}</td>
                          <td className="px-4 py-2.5 font-mono">{item.materialCode}</td>
                          <td className="px-4 py-2.5 font-medium">{item.materialName}</td>
                          <td className="px-4 py-2.5 text-gray-500 font-mono">C001</td>
                          <td className="px-4 py-2.5 text-gray-500">通用配件</td>
                          <td className="px-4 py-2.5 text-gray-500 truncate max-w-[150px]">{item.materialName}</td>
                          <td className="px-4 py-2.5 text-gray-500">{item.spec}</td>
                          <td className="px-4 py-2.5">
                            <input 
                              type="text" 
                              className="w-full border border-gray-200 rounded px-1 py-0.5" 
                              defaultValue="-" 
                            />
                          </td>
                          <td className="px-4 py-2.5">
                            <input 
                              type="text" 
                              className="w-full border border-gray-200 rounded px-1 py-0.5" 
                              defaultValue="-" 
                            />
                          </td>
                          <td className="px-4 py-2.5 text-right">
                            <input 
                              type="number" 
                              className="w-20 border border-gray-200 rounded px-1 py-0.5 text-right font-bold" 
                              value={item.qty}
                              onChange={e => {
                                const newItems = editedLot.items.map(i => i.id === item.id ? { ...i, qty: Number(e.target.value) } : i);
                                setEditedLot({ ...editedLot, items: newItems });
                              }}
                            />
                          </td>
                          <td className="px-4 py-2.5">
                            <input 
                              type="text" 
                              className="w-16 border border-gray-200 rounded px-1 py-0.5" 
                              value={item.unit}
                              onChange={e => {
                                const newItems = editedLot.items.map(i => i.id === item.id ? { ...i, unit: e.target.value } : i);
                                setEditedLot({ ...editedLot, items: newItems });
                              }}
                            />
                          </td>
                          <td className="px-4 py-2.5 text-right">
                            <input 
                              type="number" 
                              className="w-24 border border-gray-200 rounded px-1 py-0.5 text-right text-erp-secondary" 
                              value={item.unitPrice}
                              onChange={e => {
                                const newItems = editedLot.items.map(i => i.id === item.id ? { ...i, unitPrice: Number(e.target.value) } : i);
                                setEditedLot({ ...editedLot, items: newItems });
                              }}
                            />
                          </td>
                          <td className="px-4 py-2.5">
                            <input 
                              type="text" 
                              className="w-full border border-gray-200 rounded px-1 py-0.5" 
                              defaultValue="-" 
                            />
                          </td>
                        </tr>
                      ))}
                      {editedLot.items.length === 0 && (
                        <tr>
                          <td colSpan={14} className="px-4 py-12 text-center">
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

        <div className="p-4 border-t border-gray-100 flex justify-start space-x-3 bg-white">
          <button
            onClick={() => onSave(editedLot)}
            className="px-6 py-1.5 bg-[#2196F3] text-white rounded-[2px] text-xs font-medium hover:bg-blue-600 transition-colors"
          >
            修改保存
          </button>
        </div>
      </div>
    </div>
  );
};

function FileText(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <line x1="10" y1="9" x2="8" y2="9" />
    </svg>
  );
}
