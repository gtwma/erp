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
    if (sub) return { id: sub.id, name: sub.name, type: 'SUB', status: sub.status, qty: sub.planIds.length };
    return null;
  };

  // Construct nodes based on lineage
  // For simplicity, we'll just show the flow of the first matching relation
  const nodes = React.useMemo(() => {
    if (lineage.length === 0) return [];
    const relation = lineage[0];
    const sourceNodes = relation.sourceIds.map(id => getDoc(id)).filter(Boolean);
    const targetNodes = relation.targetIds.map(id => getDoc(id)).filter(Boolean);
    return { sourceNodes, targetNodes, type: relation.type };
  }, [lineage, requirements, plans, subcontracts]);

  if (lineage.length === 0) {
    return (
      <div className="text-center p-10 text-erp-text-sub">
        未找到相关的血缘关系数据。
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-12">
      {/* Source Nodes */}
      <div className="flex flex-wrap justify-center gap-6">
        {nodes.sourceNodes.map((node) => (
          <NodeCard key={node!.id} node={node!} />
        ))}
      </div>

      {/* Relation Arrow */}
      <div className="flex flex-col items-center">
        <div className="h-12 w-[2px] bg-erp-border relative">
          <div className="absolute -bottom-1 -left-[3px] w-2 h-2 border-r-2 border-b-2 border-erp-border rotate-45" />
        </div>
        <span className="text-[10px] font-bold text-erp-secondary bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100 mt-2">
          {nodes.type}
        </span>
      </div>

      {/* Target Nodes */}
      <div className="flex flex-wrap justify-center gap-6">
        {nodes.targetNodes.map((node) => (
          <NodeCard key={node!.id} node={node!} />
        ))}
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
