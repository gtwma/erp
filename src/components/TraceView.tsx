import React, { useState, useMemo } from 'react';
import { LineageRelation, Requirement, Plan, Subcontract } from '../types';
import { TraceabilityTree } from './TraceabilityTree';
import { Search, GitBranch, Info } from 'lucide-react';

interface TraceViewProps {
  lineage: LineageRelation[];
  requirements: Requirement[];
  plans: Plan[];
  subcontracts: Subcontract[];
}

export const TraceView: React.FC<TraceViewProps> = ({ lineage, requirements, plans, subcontracts }) => {
  const [selectedId, setSelectedId] = useState<string>('');

  const allItems = useMemo(() => {
    const reqs = requirements.map(r => ({ id: r.id, label: `需求: ${r.name}`, type: 'REQ' }));
    const plns = plans.map(p => ({ id: p.id, label: `计划: ${p.name}`, type: 'PLAN' }));
    const subs = subcontracts.map(s => ({ id: s.id, label: `分包: ${s.name}`, type: 'SUB' }));
    return [...reqs, ...plns, ...subs];
  }, [requirements, plans, subcontracts]);

  const filteredLineage = useMemo(() => {
    if (!selectedId) return [];
    // Simple trace: find relations where the selectedId is either source or target
    return lineage.filter(l => l.sourceIds.includes(selectedId) || l.targetIds.includes(selectedId));
  }, [lineage, selectedId]);

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      {/* Search Header */}
      <div className="p-4 border-b border-erp-border bg-gray-50/50 flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <GitBranch className="w-5 h-5 text-erp-secondary" />
          <h2 className="text-sm font-bold text-erp-text-main">单据血缘追溯</h2>
        </div>
        
        <div className="flex-1 max-w-md relative">
          <select 
            className="w-full pl-3 pr-10 py-1.5 text-xs border border-erp-border rounded outline-none focus:border-erp-secondary appearance-none bg-white"
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
          >
            <option value="">请选择要追溯的单据...</option>
            {allItems.map(item => (
              <option key={item.id} value={item.id}>
                [{item.id}] {item.label}
              </option>
            ))}
          </select>
          <Search className="w-3 h-3 absolute right-3 top-1/2 -translate-y-1/2 text-erp-text-sub pointer-events-none" />
        </div>

        {selectedId && (
          <div className="flex items-center space-x-2 text-[10px] text-erp-text-sub bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
            <Info className="w-3 h-3 text-erp-secondary" />
            <span>正在追溯单据: <span className="font-bold text-erp-secondary">{selectedId}</span></span>
          </div>
        )}
      </div>

      {/* Tree Visualization */}
      <div className="flex-1 overflow-auto bg-gray-50 p-8 flex items-center justify-center">
        {selectedId ? (
          <div className="w-full max-w-4xl bg-white p-10 rounded-2xl border border-erp-border shadow-sm">
            <TraceabilityTree 
              lineage={filteredLineage}
              requirements={requirements}
              plans={plans}
              subcontracts={subcontracts}
            />
          </div>
        ) : (
          <div className="text-center">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-erp-border">
              <GitBranch className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-sm text-erp-text-sub">请在上方选择一个需求、计划或分包单号以开始追溯</p>
          </div>
        )}
      </div>
    </div>
  );
};
