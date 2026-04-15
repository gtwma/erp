/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { X, Package, Check, Info, AlertCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Plan, LineItem, MOCK_INVENTORY } from '../types';
import { motion, AnimatePresence } from 'motion/react';

const InventoryCheck: React.FC<{ materialCode: string; requiredQty: number }> = ({ materialCode, requiredQty }) => {
  const item = MOCK_INVENTORY.find(i => i.materialCode === materialCode);
  if (!item) return null;

  const isShortage = item.stockQty < requiredQty;
  const isBelowSafety = item.stockQty < item.safetyStock;

  return (
    <div className="flex items-center space-x-1.5 mt-0.5">
      {isShortage ? (
        <div className="flex items-center space-x-1 text-[9px] text-red-500 bg-red-50 px-1 py-0.5 rounded border border-red-100">
          <AlertTriangle className="w-2.5 h-2.5" />
          <span>库存不足 ({item.stockQty})</span>
        </div>
      ) : isBelowSafety ? (
        <div className="flex items-center space-x-1 text-[9px] text-orange-500 bg-orange-50 px-1 py-0.5 rounded border border-orange-100">
          <AlertTriangle className="w-2.5 h-2.5" />
          <span>低于安全库存 ({item.stockQty})</span>
        </div>
      ) : (
        <div className="flex items-center space-x-1 text-[9px] text-green-600 bg-green-50 px-1 py-0.5 rounded border border-green-100">
          <CheckCircle2 className="w-2.5 h-2.5" />
          <span>库存充足 ({item.stockQty})</span>
        </div>
      )}
    </div>
  );
};

interface SubcontractModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (subcontractName: string, selectedItems: { id: string, qty: number }[]) => void;
  selectedPlans: Plan[];
}

export const SubcontractModal: React.FC<SubcontractModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  selectedPlans,
}) => {
  const [subcontractName, setSubcontractName] = useState('');
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [itemQuantities, setItemQuantities] = useState<Record<string, number>>({});

  // Flatten all items from selected plans
  const allItems = useMemo(() => {
    const items: (LineItem & { planId: string })[] = [];
    selectedPlans.forEach(plan => {
      if (plan.items && plan.items.length > 0) {
        plan.items.forEach(item => {
          items.push({ ...item, planId: plan.id });
        });
      } else {
        // Fallback for plans without explicit items
        items.push({
          id: `LI-${plan.id}`,
          materialCode: plan.materialCode,
          materialName: plan.name,
          spec: plan.spec,
          qty: plan.qty,
          unit: '个',
          unitPrice: 0,
          planId: plan.id
        });
      }
    });
    return items;
  }, [selectedPlans]);

  // Initialize quantities when items change
  React.useEffect(() => {
    const initialQtys: Record<string, number> = {};
    allItems.forEach(item => {
      initialQtys[item.id] = item.qty;
    });
    setItemQuantities(initialQtys);
  }, [allItems]);

  // Auto-set default name
  React.useEffect(() => {
    if (isOpen && !subcontractName) {
      setSubcontractName(`采购分包-${new Date().getTime().toString().slice(-4)}`);
    }
  }, [isOpen]);

  const toggleItem = (id: string) => {
    setSelectedItemIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleQtyChange = (id: string, val: string, max: number) => {
    const num = parseFloat(val);
    if (isNaN(num)) {
      setItemQuantities(prev => ({ ...prev, [id]: 0 }));
      return;
    }
    const safeNum = Math.min(Math.max(0, num), max);
    setItemQuantities(prev => ({ ...prev, [id]: safeNum }));
  };

  const handleConfirm = () => {
    if (!subcontractName.trim()) return;
    if (selectedItemIds.length === 0) return;
    
    const selectedItems = selectedItemIds.map(id => ({
      id,
      qty: itemQuantities[id] || 0
    })).filter(item => item.qty > 0);

    if (selectedItems.length === 0) return;

    onConfirm(subcontractName, selectedItems);
    setSelectedItemIds([]);
    setSubcontractName('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white w-full max-w-4xl rounded-lg shadow-2xl flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-erp-border flex items-center justify-between bg-gray-50/50 rounded-t-lg">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
              <Package className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-800">组建分包</h3>
              <p className="text-[10px] text-gray-500 mt-0.5">
                正在为计划 <span className="font-mono font-bold text-blue-600">{selectedPlans[0]?.id}</span> 组建分包明细
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Area */}
        <div className="p-6 border-b border-erp-border bg-white">
          <div className="flex items-center space-x-4">
            <label className="text-xs font-medium text-gray-600 w-20 shrink-0">分包名称:</label>
            <input 
              type="text" 
              className="flex-1 border border-erp-border rounded px-3 py-2 text-xs outline-none focus:border-blue-400 transition-all"
              placeholder="请输入分包名称..."
              value={subcontractName}
              onChange={e => setSubcontractName(e.target.value)}
            />
          </div>
        </div>

        {/* Selection Area */}
        <div className="flex-1 overflow-auto p-6 bg-gray-50/30">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-xs font-bold text-gray-700">待选物料明细 ({allItems.length})</span>
            <div className="flex items-center space-x-4 text-[10px] text-gray-500">
              <span className="flex items-center space-x-1">
                <Info className="w-3 h-3" />
                <span>已选 {selectedItemIds.length} 项</span>
              </span>
              <button 
                onClick={() => setSelectedItemIds(selectedItemIds.length === allItems.length ? [] : allItems.map(i => i.id))}
                className="text-blue-600 hover:underline"
              >
                {selectedItemIds.length === allItems.length ? '取消全选' : '全选'}
              </button>
            </div>
          </div>

          <div className="bg-white border border-erp-border rounded overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 border-b border-erp-border">
                <tr className="text-[11px] text-gray-600 font-medium">
                  <th className="w-10 px-4 py-3 text-center">
                    <input 
                      type="checkbox" 
                      className="rounded"
                      checked={selectedItemIds.length === allItems.length && allItems.length > 0}
                      onChange={() => setSelectedItemIds(selectedItemIds.length === allItems.length ? [] : allItems.map(i => i.id))}
                    />
                  </th>
                  <th className="px-4 py-3">物料名称</th>
                  <th className="px-4 py-3">物料编码</th>
                  <th className="px-4 py-3">规格型号</th>
                  <th className="px-4 py-3 text-right">计划数量</th>
                  <th className="px-4 py-3 text-center w-32">分包数量</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-erp-border">
                {allItems.map((item) => (
                  <tr 
                    key={item.id} 
                    className={`text-[11px] hover:bg-blue-50/20 transition-colors cursor-pointer ${selectedItemIds.includes(item.id) ? 'bg-blue-50/40' : ''}`}
                    onClick={() => toggleItem(item.id)}
                  >
                    <td className="px-4 py-3 text-center" onClick={e => e.stopPropagation()}>
                      <input 
                        type="checkbox" 
                        className="rounded"
                        checked={selectedItemIds.includes(item.id)}
                        onChange={() => toggleItem(item.id)}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-800">{item.materialName}</div>
                      <InventoryCheck materialCode={item.materialCode} requiredQty={itemQuantities[item.id] || 0} />
                    </td>
                    <td className="px-4 py-3 text-gray-500 font-mono">{item.materialCode}</td>
                    <td className="px-4 py-3 text-gray-400">{item.spec}</td>
                    <td className="px-4 py-3 text-right font-bold text-gray-700">{item.qty.toFixed(2)}</td>
                    <td className="px-4 py-3 text-center" onClick={e => e.stopPropagation()}>
                      <input 
                        type="number"
                        className={`w-24 border rounded px-2 py-1 text-right text-xs outline-none transition-all ${
                          selectedItemIds.includes(item.id) ? 'border-blue-400 bg-white' : 'border-gray-200 bg-gray-50 text-gray-400'
                        }`}
                        disabled={!selectedItemIds.includes(item.id)}
                        value={itemQuantities[item.id] || 0}
                        onChange={(e) => handleQtyChange(item.id, e.target.value, item.qty)}
                        min={0}
                        max={item.qty}
                        step={0.01}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-erp-border flex items-center justify-between bg-white rounded-b-lg">
          <div className="flex items-center space-x-2 text-orange-500">
            <AlertCircle className="w-4 h-4" />
            <span className="text-[10px]">确认后，所选物料将从原计划中提取并组建新的采购分包</span>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-[2px] text-xs font-medium text-gray-600 hover:bg-gray-50 transition-all"
            >
              取消
            </button>
            <button 
              onClick={handleConfirm}
              disabled={!subcontractName.trim() || selectedItemIds.length === 0}
              className={`px-8 py-2 rounded-[2px] text-xs font-medium transition-all shadow-sm ${
                !subcontractName.trim() || selectedItemIds.length === 0
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              确认组建
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
