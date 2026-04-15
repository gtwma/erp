import React, { useState } from 'react';
import { ProjectApproval } from '../types';
import { Search, FileText, Settings, Eye, Plus, X, CheckCircle2 } from 'lucide-react';
import { SearchForm } from './SearchForm';

interface ProjectApprovalPoolProps {
  projects: ProjectApproval[];
  onCreate: () => void;
  onView: (project: ProjectApproval) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export const ProjectApprovalPool: React.FC<ProjectApprovalPoolProps> = ({ projects, onCreate, onView, onApprove, onReject }) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('所有');

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const filteredProjects = projects.filter(p => filterStatus === '所有' || p.status === filterStatus);

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      {/* Search Form */}
      <SearchForm type="SUB" />

      {/* Action Bar */}
      <div className="bg-gray-50 border-b border-erp-border px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onCreate}
            className="bg-[#2196F3] text-white px-4 py-1.5 rounded-[2px] text-xs font-medium hover:bg-blue-600 transition-colors flex items-center space-x-1 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>新增项目</span>
          </button>
          
          <div className="h-4 w-px bg-gray-300 mx-2" />
          
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            {['所有', '编辑中', '待审核', '审核通过', '审核不通过'].map(status => (
              <label key={status} className="flex items-center space-x-1 cursor-pointer hover:text-blue-600 transition-colors">
                <input 
                  type="radio" 
                  name="status" 
                  checked={filterStatus === status} 
                  onChange={() => setFilterStatus(status)}
                  className="w-3 h-3 text-blue-600 focus:ring-blue-500"
                />
                <span>{status}</span>
              </label>
            ))}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="relative">
            <input 
              type="text" 
              placeholder="请输入招标项目编号" 
              className="pl-8 pr-4 py-1.5 border border-gray-300 rounded-[2px] text-xs w-64 focus:outline-none focus:border-blue-500"
            />
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>
          <button className="bg-[#2196F3] p-1.5 rounded-[2px] text-white hover:bg-blue-600">
            <Search className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 z-10">
            <tr className="erp-table-header border-b border-erp-border">
              <th className="px-4 py-2 w-10">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-erp-secondary focus:ring-erp-secondary"
                  checked={selectedIds.length === filteredProjects.length && filteredProjects.length > 0}
                  onChange={(e) =>
                    setSelectedIds(e.target.checked ? filteredProjects.map((r) => r.id) : [])
                  }
                />
              </th>
              <th className="px-4 py-2 w-12 text-center">序</th>
              <th className="px-4 py-2">招标项目编号</th>
              <th className="px-4 py-2">招标项目名称</th>
              <th className="px-4 py-2">标段(包)编号</th>
              <th className="px-4 py-2">标段(包)名称</th>
              <th className="px-4 py-2">审核状态</th>
              <th className="px-4 py-2 text-center">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-erp-border">
            {filteredProjects.map((project, index) => (
              <tr
                key={project.id}
                className={`hover:bg-blue-50/30 transition-colors text-xs ${
                  selectedIds.includes(project.id) ? 'bg-blue-50/50' : ''
                }`}
              >
                <td className="px-4 py-2.5">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-erp-secondary focus:ring-erp-secondary"
                    checked={selectedIds.includes(project.id)}
                    onChange={() => toggleSelect(project.id)}
                  />
                </td>
                <td className="px-4 py-2.5 text-center text-erp-text-sub">{index + 1}</td>
                <td className="px-4 py-2.5 font-mono text-erp-text-main">{project.id}</td>
                <td className="px-4 py-2.5 font-medium max-w-[300px] truncate" title={project.name}>
                  {project.name}
                </td>
                <td className="px-4 py-2.5">
                  <div className="flex flex-col space-y-1">
                    {project.lots.map(lot => (
                      <span key={lot.id} className="text-[10px] text-gray-500 font-mono">{lot.id}</span>
                    ))}
                    {project.lots.length > 3 && <span className="text-[10px] text-gray-400">...</span>}
                  </div>
                </td>
                <td className="px-4 py-2.5">
                  <div className="flex flex-col space-y-1">
                    {project.lots.map(lot => (
                      <span key={lot.id} className="text-[10px] text-gray-500 truncate max-w-[150px]">{lot.name}</span>
                    ))}
                    {project.lots.length > 3 && <span className="text-[10px] text-gray-400">...</span>}
                  </div>
                </td>
                <td className="px-4 py-2.5">
                  <span className={`${
                    project.status === '审核通过' ? 'text-green-500' : 
                    project.status === '待审核' ? 'text-orange-500' : 
                    project.status === '审核不通过' ? 'text-red-500' : 'text-blue-500'
                  } font-medium`}>
                    {project.status}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <button 
                      onClick={() => onView(project)}
                      className="text-erp-secondary hover:text-blue-700" 
                      title={project.status === '编辑中' ? '编辑' : '查看'}
                    >
                      {project.status === '编辑中' ? <Settings className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                    {project.status !== '审核通过' && (
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => onApprove(project.id)}
                          className="text-green-500 hover:text-green-700" 
                          title="审核通过"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => onReject(project.id)}
                          className="text-red-500 hover:text-red-700" 
                          title="审核不通过"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Footer / Pagination Placeholder */}
      <div className="bg-gray-50 border-t border-erp-border px-4 py-2 flex items-center justify-end text-[11px] text-gray-500 space-x-4">
        <div className="flex items-center space-x-1">
          <button className="px-2 py-1 border border-gray-300 rounded hover:bg-white disabled:opacity-50" disabled>&lt;</button>
          <button className="px-2 py-1 bg-blue-500 text-white border border-blue-500 rounded">1</button>
          <button className="px-2 py-1 border border-gray-300 rounded hover:bg-white">2</button>
          <button className="px-2 py-1 border border-gray-300 rounded hover:bg-white">3</button>
          <span>...</span>
          <button className="px-2 py-1 border border-gray-300 rounded hover:bg-white">106</button>
          <button className="px-2 py-1 border border-gray-300 rounded hover:bg-white">&gt;</button>
        </div>
        <div className="flex items-center space-x-2">
          <span>13 条/页</span>
          <span>跳至 <input type="text" className="w-8 border border-gray-300 rounded px-1 text-center" defaultValue="1" /> 页</span>
          <span>共1372条</span>
        </div>
      </div>
    </div>
  );
};
