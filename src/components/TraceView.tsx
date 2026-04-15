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
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['REQ_MERGE', 'REQ_SPLIT', 'PLAN_MERGE', 'PLAN_SPLIT', 'REQ_TO_PLAN', 'PLAN_TO_SUB']);

  const allItems = useMemo(() => {
    const reqs = requirements.map(r => ({ id: r.id, label: `需求: ${r.name}`, type: 'REQ' }));
    const plns = plans.map(p => ({ id: p.id, label: `计划: ${p.name}`, type: 'PLAN' }));
    const subs = subcontracts.map(s => ({ id: s.id, label: `分包: ${s.name}`, type: 'SUB' }));
    return [...reqs, ...plns, ...subs];
  }, [requirements, plans, subcontracts]);

  const relationTypes = [
    { id: 'REQ_MERGE', label: '需求合并' },
    { id: 'REQ_SPLIT', label: '需求拆分' },
    { id: 'PLAN_MERGE', label: '计划合并' },
    { id: 'PLAN_SPLIT', label: '计划拆分' },
    { id: 'REQ_TO_PLAN', label: '需求转计划' },
    { id: 'PLAN_TO_SUB', label: '计划转分包' },
  ];

  const toggleType = (typeId: string) => {
    setSelectedTypes(prev => 
      prev.includes(typeId) ? prev.filter(t => t !== typeId) : [...prev, typeId]
    );
  };

  const filteredLineage = useMemo(() => {
    if (!selectedId) return [];
    
    // First filter the lineage by selected types
    const typeFilteredLineage = lineage.filter(rel => selectedTypes.includes(rel.type));
    
    const connectedIds = new Set<string>([selectedId]);
    const connectedRelations = new Set<LineageRelation>();
    
    let changed = true;
    while (changed) {
      changed = false;
      typeFilteredLineage.forEach(rel => {
        if (connectedRelations.has(rel)) return;
        
        const hasSource = rel.sourceIds.some(id => connectedIds.has(id));
        const hasTarget = rel.targetIds.some(id => connectedIds.has(id));
        
        if (hasSource || hasTarget) {
          connectedRelations.add(rel);
          rel.sourceIds.forEach(id => connectedIds.add(id));
          rel.targetIds.forEach(id => connectedIds.add(id));
          changed = true;
        }
      });
    }
    
    return Array.from(connectedRelations);
  }, [lineage, selectedId, selectedTypes]);

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      {/* Search Header */}
      <div className="p-4 border-b border-erp-border bg-gray-50/50 flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <GitBranch className="w-5 h-5 text-erp-secondary" />
              <h2 className="text-sm font-bold text-erp-text-main">单据血缘追溯</h2>
            </div>
            
            <div className="w-64 relative">
              <input 
                type="text"
                placeholder="输入单据ID进行追溯..."
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-erp-border rounded outline-none focus:border-erp-secondary bg-white"
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
              />
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-erp-text-sub" />
            </div>

            <div className="h-4 w-[1px] bg-gray-300 mx-2" />

            <div className="flex-1 max-w-xs relative">
              <select 
                className="w-full pl-3 pr-10 py-1.5 text-xs border border-erp-border rounded outline-none focus:border-erp-secondary appearance-none bg-white"
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
              >
                <option value="">或从列表中选择...</option>
                {allItems.map(item => (
                  <option key={item.id} value={item.id}>
                    [{item.id}] {item.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3 h-3 absolute right-3 top-1/2 -translate-y-1/2 text-erp-text-sub pointer-events-none" />
            </div>
          </div>

          {selectedId && (
            <button 
              onClick={() => setSelectedId('')}
              className="text-[10px] text-erp-text-sub hover:text-erp-secondary flex items-center space-x-1"
            >
              <X className="w-3 h-3" />
              <span>清除追溯</span>
            </button>
          )}
        </div>

        {/* Relation Type Filters */}
        <div className="flex items-center space-x-3">
          <span className="text-[10px] font-bold text-erp-text-sub uppercase tracking-wider">关系类型过滤:</span>
          <div className="flex flex-wrap gap-2">
            {relationTypes.map(type => (
              <button
                key={type.id}
                onClick={() => toggleType(type.id)}
                className={`px-2 py-1 rounded-full text-[10px] font-medium border transition-all ${
                  selectedTypes.includes(type.id)
                    ? 'bg-blue-50 border-blue-200 text-erp-secondary shadow-sm'
                    : 'bg-white border-gray-200 text-gray-400 hover:border-gray-300'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
          <button 
            onClick={() => setSelectedTypes(selectedTypes.length === relationTypes.length ? [] : relationTypes.map(t => t.id))}
            className="text-[10px] text-erp-secondary hover:underline ml-2"
          >
            {selectedTypes.length === relationTypes.length ? '全不选' : '全选'}
          </button>
        </div>
      </div>

      {/* Tree Visualization */}
      <div className="flex-1 overflow-auto bg-gray-50 p-8">
        {selectedId ? (
          <div className="min-h-full flex items-center justify-center">
            <div className="w-full max-w-5xl bg-white p-10 rounded-2xl border border-erp-border shadow-sm min-h-[400px]">
              <TraceabilityTree 
                lineage={filteredLineage}
                requirements={requirements}
                plans={plans}
                subcontracts={subcontracts}
              />
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-erp-border">
              <GitBranch className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-base font-bold text-erp-text-main mb-1">单据全生命周期追溯</h3>
            <p className="text-sm text-erp-text-sub">请输入或选择一个需求、计划或分包单号，查看其完整的上下游关联关系</p>
          </div>
        )}
      </div>
    </div>
  );
};

import { ChevronDown, X } from 'lucide-react';
