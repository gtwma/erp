/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { GitBranch, ArrowRight, Package, ClipboardList, FileText } from 'lucide-react';
import { motion } from 'motion/react';
import { LineageRelation, Requirement, Plan, Subcontract } from '../types';

interface TraceabilityTreeProps {
  lineage: LineageRelation[];
  requirements: Requirement[];
  plans: Plan[];
  subcontracts: Subcontract[];
}

export const TraceabilityTree: React.FC<TraceabilityTreeProps> = ({ 
  lineage, 
  requirements, 
  plans, 
  subcontracts 
}) => {
  // Helper to find document details
  const getDoc = (id: string) => {
    const req = requirements.find(r => r.id === id);
    if (req) return { id: req.id, name: req.name, type: 'REQ', status: req.status, qty: req.qty };
    const plan = plans.find(p => p.id === id);
    if (plan) return { id: plan.id, name: plan.name, type: 'PLAN', status: plan.status, qty: plan.qty };
    const sub = subcontracts.find(s => s.id === id);
    if (sub) return { id: sub.id, name: sub.name, type: 'SUB', status: sub.status, qty: sub.items?.length || 0 };
    return null;
  };

  const { reqNodes, planNodes, subNodes } = React.useMemo(() => {
    const ids = new Set<string>();
    lineage.forEach(rel => {
      rel.sourceIds.forEach(id => ids.add(id));
      rel.targetIds.forEach(id => ids.add(id));
    });
    
    const reqs: any[] = [];
    const plns: any[] = [];
    const subs: any[] = [];
    
    ids.forEach(id => {
      const doc = getDoc(id);
      if (doc) {
        if (doc.type === 'REQ') reqs.push(doc);
        else if (doc.type === 'PLAN') plns.push(doc);
        else if (doc.type === 'SUB') subs.push(doc);
      }
    });
    
    return { reqNodes: reqs, planNodes: plns, subNodes: subs };
  }, [lineage, requirements, plans, subcontracts]);

  if (lineage.length === 0) {
    return (
      <div className="text-center p-10 text-erp-text-sub">
        未找到相关的血缘关系数据。
      </div>
    );
  }

  return (
    <div className="flex justify-between items-stretch gap-4">
      {/* Requirements Column */}
      <div className="flex-1 flex flex-col items-center space-y-4">
        <div className="text-[10px] font-bold text-erp-text-sub uppercase tracking-wider mb-2">采购需求</div>
        <div className="flex flex-col gap-4 w-full items-center">
          {reqNodes.map(node => <NodeCard key={node.id} node={node} />)}
          {reqNodes.length === 0 && <div className="h-24 w-48 border border-dashed border-gray-200 rounded-xl flex items-center justify-center text-[10px] text-gray-300 italic">无关联需求</div>}
        </div>
      </div>

      <div className="flex flex-col justify-center">
        <ArrowRight className="w-5 h-5 text-gray-300" />
      </div>

      {/* Plans Column */}
      <div className="flex-1 flex flex-col items-center space-y-4">
        <div className="text-[10px] font-bold text-erp-text-sub uppercase tracking-wider mb-2">采购计划</div>
        <div className="flex flex-col gap-4 w-full items-center">
          {planNodes.map(node => <NodeCard key={node.id} node={node} />)}
          {planNodes.length === 0 && <div className="h-24 w-48 border border-dashed border-gray-200 rounded-xl flex items-center justify-center text-[10px] text-gray-300 italic">无关联计划</div>}
        </div>
      </div>

      <div className="flex flex-col justify-center">
        <ArrowRight className="w-5 h-5 text-gray-300" />
      </div>

      {/* Subcontracts Column */}
      <div className="flex-1 flex flex-col items-center space-y-4">
        <div className="text-[10px] font-bold text-erp-text-sub uppercase tracking-wider mb-2">分包管理</div>
        <div className="flex flex-col gap-4 w-full items-center">
          {subNodes.map(node => <NodeCard key={node.id} node={node} />)}
          {subNodes.length === 0 && <div className="h-24 w-48 border border-dashed border-gray-200 rounded-xl flex items-center justify-center text-[10px] text-gray-300 italic">无关联分包</div>}
        </div>
      </div>
    </div>
  );
};

const NodeCard: React.FC<{ node: any }> = ({ node }) => {
  const icons = {
    REQ: <FileText className="w-4 h-4 text-blue-500" />,
    PLAN: <ClipboardList className="w-4 h-4 text-purple-500" />,
    SUB: <Package className="w-4 h-4 text-green-500" />,
  };

  const colors = {
    REQ: 'border-blue-200 bg-blue-50/30',
    PLAN: 'border-purple-200 bg-purple-50/30',
    SUB: 'border-green-200 bg-green-50/30',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`w-48 p-4 rounded-xl border-2 shadow-sm bg-white ${colors[node.type as keyof typeof colors]}`}
    >
      <div className="flex items-center space-x-2 mb-3">
        {icons[node.type as keyof typeof icons]}
        <span className="text-xs font-bold text-erp-text-main truncate">{node.id}</span>
      </div>
      <div className="text-[11px] text-erp-text-sub mb-3 line-clamp-2 h-8">{node.name}</div>
      <div className="flex items-center justify-between pt-3 border-t border-erp-border/50">
        <span className="text-[10px] font-medium text-erp-text-sub">{node.status}</span>
        <span className="text-xs font-bold text-erp-secondary">
          {node.type === 'SUB' ? `包含 ${node.qty} 项` : `数量: ${node.qty}`}
        </span>
      </div>
    </motion.div>
  );
}
