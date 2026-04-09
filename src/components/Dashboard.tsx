import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { 
  FileText, 
  ClipboardList, 
  Package, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  Clock 
} from 'lucide-react';

interface DashboardProps {
  stats: {
    totalReq: number;
    pendingReq: number;
    totalPlan: number;
    totalSub: number;
    totalProject: number;
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export const Dashboard: React.FC<DashboardProps> = ({ stats }) => {
  const data = [
    { name: '采购需求', value: stats.totalReq },
    { name: '采购计划', value: stats.totalPlan },
    { name: '采购分包', value: stats.totalSub },
    { name: '采购立项', value: stats.totalProject },
  ];

  const statusData = [
    { name: '待审核', value: 12 },
    { name: '执行中', value: 25 },
    { name: '已完成', value: 48 },
    { name: '异常', value: 3 },
  ];

  return (
    <div className="space-y-6 p-2">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="采购需求总数" 
          value={stats.totalReq} 
          icon={<FileText className="w-5 h-5 text-blue-500" />} 
          trend="+12% 环比上月"
          color="blue"
        />
        <StatCard 
          title="待处理需求" 
          value={stats.pendingReq} 
          icon={<Clock className="w-5 h-5 text-orange-500" />} 
          trend="急需处理"
          color="orange"
        />
        <StatCard 
          title="采购计划总数" 
          value={stats.totalPlan} 
          icon={<ClipboardList className="w-5 h-5 text-purple-500" />} 
          trend="+5% 环比上月"
          color="purple"
        />
        <StatCard 
          title="采购分包总数" 
          value={stats.totalSub} 
          icon={<Package className="w-5 h-5 text-green-500" />} 
          trend="+8% 环比上月"
          color="green"
        />
        <StatCard 
          title="采购立项总数" 
          value={stats.totalProject} 
          icon={<ClipboardList className="w-5 h-5 text-indigo-500" />} 
          trend="+15% 环比上月"
          color="indigo"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-erp-border shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold text-erp-text-main flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-erp-secondary" />
              <span>业务流转概况</span>
            </h3>
            <select className="text-xs border border-erp-border rounded px-2 py-1 outline-none">
              <option>最近7天</option>
              <option>最近30天</option>
            </select>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#666' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#666' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  cursor={{ fill: '#f8fafc' }}
                />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="bg-white p-6 rounded-xl border border-erp-border shadow-sm">
          <h3 className="text-sm font-bold text-erp-text-main mb-6 flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span>单据状态分布</span>
          </h3>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {statusData.map((item, index) => (
              <div key={item.name} className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className="text-xs text-erp-text-sub">{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Alerts */}
      <div className="bg-white p-6 rounded-xl border border-erp-border shadow-sm">
        <h3 className="text-sm font-bold text-erp-text-main mb-4 flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <span>异常预警</span>
        </h3>
        <div className="space-y-3">
          <AlertItem 
            type="delay" 
            title="采购计划 PLN-20240321-001 逾期未处理" 
            time="2小时前" 
            desc="该计划已超过指派后24小时未进行分包操作。"
          />
          <AlertItem 
            type="stock" 
            title="物料 [M004] 绝缘垫片 库存预警" 
            time="5小时前" 
            desc="当前库存低于安全水位，请及时补货。"
          />
        </div>
      </div>
    </div>
  );
};

function StatCard({ title, value, icon, trend, color }: { title: string, value: number, icon: React.ReactNode, trend: string, color: string }) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    orange: 'bg-orange-50 text-orange-600',
    purple: 'bg-purple-50 text-purple-600',
    green: 'bg-green-50 text-green-600',
    indigo: 'bg-indigo-50 text-indigo-600',
  };

  return (
    <div className="bg-white p-4 rounded-xl border border-erp-border shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
        <span className="text-[10px] font-medium text-erp-text-sub bg-gray-100 px-2 py-0.5 rounded-full">{trend}</span>
      </div>
      <div className="text-2xl font-bold text-erp-text-main font-mono">{value}</div>
      <div className="text-xs text-erp-text-sub mt-1">{title}</div>
    </div>
  );
}

function AlertItem({ type, title, time, desc }: { type: string, title: string, time: string, desc: string }) {
  return (
    <div className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
      <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${type === 'delay' ? 'bg-red-500' : 'bg-orange-500'}`} />
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-erp-text-main">{title}</h4>
          <span className="text-[10px] text-erp-text-sub">{time}</span>
        </div>
        <p className="text-[10px] text-erp-text-sub mt-1">{desc}</p>
      </div>
    </div>
  );
}
