import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Wrench, 
  CheckCircle, 
  IndianRupee, 
  Brain, 
  TrendingUp,
  TrendingDown,
  Clock,
  Car,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { clsx } from 'clsx';

const API_URL = import.meta.env.VITE_API_URL || '';

// KPI Card Component
interface KPICardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  color: 'orange' | 'green' | 'blue' | 'purple';
  onClick?: () => void;
}

const KPICard: React.FC<KPICardProps> = ({ label, value, icon: Icon, change, trend, color, onClick }) => {
  const colorStyles = {
    orange: { bg: 'bg-brand-orange/10', text: 'text-brand-orange', border: 'border-brand-orange/20' },
    green: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
    blue: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
    purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
  };

  const styles = colorStyles[color];

  return (
    <div 
      onClick={onClick}
      className={clsx(
        "bg-background-alt rounded-xl p-5 border border-border transition-all duration-300",
        "hover:border-border/80 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20",
        onClick && "cursor-pointer"
      )}
      data-testid={`kpi-${label.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1 min-w-0">
          <p className="text-text-secondary text-sm font-medium truncate">{label}</p>
          <h3 className={clsx("text-2xl font-bold mt-1", styles.text)}>{value}</h3>
        </div>
        <div className={clsx("p-3 rounded-lg flex-shrink-0 ml-3", styles.bg, styles.text)}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      
      <div className="flex items-center gap-2 text-xs">
        <span className={clsx(
          "flex items-center gap-1",
          trend === 'up' && "text-emerald-500",
          trend === 'down' && "text-red-500",
          trend === 'neutral' && "text-text-muted"
        )}>
          {trend === 'up' && <TrendingUp className="w-3 h-3" />}
          {trend === 'down' && <TrendingDown className="w-3 h-3" />}
          {change}
        </span>
      </div>
    </div>
  );
};

// Generate mock revenue data for last 30 days
const generateRevenueData = () => {
  const data = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
      revenue: Math.floor(Math.random() * 50000) + 20000,
    });
  }
  return data;
};

// Job status distribution data
const JOB_STATUS_DATA = [
  { name: 'Open', value: 40, color: '#F45D3D' },
  { name: 'In Progress', value: 25, color: '#3B82F6' },
  { name: 'PDI', value: 15, color: '#F59E0B' },
  { name: 'Invoiced', value: 10, color: '#22C55E' },
  { name: 'Closed', value: 10, color: '#6B7280' },
];

// Recent jobs mock data
const RECENT_JOBS = [
  { id: 'JC-2024-001', customer: 'Raj Motors', vehicle: 'Maruti Swift', status: 'IN_PROGRESS', assignedTo: 'Technician A', updated: '2 hours ago' },
  { id: 'JC-2024-002', customer: 'Krishna Auto', vehicle: 'Honda City', status: 'CREATED', assignedTo: 'Technician B', updated: '4 hours ago' },
  { id: 'JC-2024-003', customer: 'Sharma Cars', vehicle: 'Toyota Fortuner', status: 'PDI', assignedTo: 'Technician A', updated: '1 day ago' },
  { id: 'JC-2024-004', customer: 'Delhi Wheels', vehicle: 'Hyundai Creta', status: 'INVOICED', assignedTo: 'Technician C', updated: '1 day ago' },
  { id: 'JC-2024-005', customer: 'Gupta Services', vehicle: 'Mahindra XUV', status: 'CLOSED', assignedTo: 'Technician B', updated: '2 days ago' },
];

// AI Activity feed
const AI_ACTIVITY = [
  { time: '10:32 AM', action: 'Diagnosed brake issue', vehicle: 'Maruti Swift', confidence: 94 },
  { time: '09:45 AM', action: 'Generated estimate', vehicle: 'Honda City', confidence: 98 },
  { time: '09:12 AM', action: 'Verified PDI checklist', vehicle: 'Toyota Fortuner', confidence: 100 },
  { time: '08:55 AM', action: 'Identified recall notice', vehicle: 'Hyundai Creta', confidence: 87 },
];

// Custom tooltip for area chart
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface border border-border rounded-lg p-3 shadow-xl">
        <p className="text-text-secondary text-xs mb-1">{label}</p>
        <p className="text-text-primary font-semibold">
          ₹{payload[0].value.toLocaleString('en-IN')}
        </p>
      </div>
    );
  }
  return null;
};

// Status badge colors
const STATUS_COLORS: Record<string, string> = {
  CREATED: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  IN_PROGRESS: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  PDI: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  INVOICED: 'bg-green-500/10 text-green-400 border-green-500/20',
  CLOSED: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
};

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [revenueData] = useState(generateRevenueData);
  const [stats, setStats] = useState({
    openJobCards: 12,
    completedToday: 8,
    monthRevenue: '₹2.4L',
    aiQueries: 47,
  });

  // Fetch dashboard stats (mock for now)
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`${API_URL}/api/dashboard/stats`);
        if (response.ok) {
          const data = await response.json();
          setStats(prev => ({ ...prev, ...data }));
        }
      } catch (error) {
        // Use default mock data
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="p-6 space-y-6" data-testid="dashboard-page">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
          <p className="text-text-secondary text-sm mt-1">Welcome back! Here's your garage overview.</p>
        </div>
        <button 
          onClick={() => navigate('/chat')}
          className="flex items-center gap-2 px-4 py-2 bg-brand-orange text-white rounded-lg hover:bg-brand-hover transition-colors"
          data-testid="start-chat-btn"
        >
          <Brain className="w-4 h-4" />
          Start AI Chat
        </button>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Open Job Cards"
          value={stats.openJobCards}
          icon={Wrench}
          change="+3 today"
          trend="up"
          color="orange"
          onClick={() => navigate('/app/job-cards')}
        />
        <KPICard
          label="Completed Today"
          value={stats.completedToday}
          icon={CheckCircle}
          change="+2 vs yesterday"
          trend="up"
          color="green"
        />
        <KPICard
          label="Revenue This Month"
          value={stats.monthRevenue}
          icon={IndianRupee}
          change="+12% vs last month"
          trend="up"
          color="blue"
        />
        <KPICard
          label="AI Queries Today"
          value={stats.aiQueries}
          icon={Brain}
          change="3 pending"
          trend="neutral"
          color="purple"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Area Chart */}
        <div className="lg:col-span-2 bg-background-alt rounded-xl p-5 border border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-text-primary">Revenue Trend</h3>
            <span className="text-xs text-text-muted">Last 30 days</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F45D3D" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#F45D3D" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="date" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#999', fontSize: 10 }}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  hide 
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#F45D3D" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#revenueGradient)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Job Status Donut */}
        <div className="bg-background-alt rounded-xl p-5 border border-border">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Job Status</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={JOB_STATUS_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {JOB_STATUS_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-3 mt-2">
            {JOB_STATUS_DATA.map((item) => (
              <div key={item.name} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-xs text-text-secondary">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Jobs Table */}
        <div className="lg:col-span-2 bg-background-alt rounded-xl border border-border overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <h3 className="text-lg font-semibold text-text-primary">Recent Job Cards</h3>
            <button 
              onClick={() => navigate('/app/job-cards')}
              className="flex items-center gap-1 text-sm text-brand-orange hover:underline"
            >
              View all <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Job ID</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Customer</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Vehicle</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Updated</th>
                </tr>
              </thead>
              <tbody>
                {RECENT_JOBS.map((job) => (
                  <tr key={job.id} className="border-b border-border/50 hover:bg-surface transition-colors">
                    <td className="px-5 py-3 text-sm font-mono text-brand-orange">{job.id}</td>
                    <td className="px-5 py-3 text-sm text-text-primary">{job.customer}</td>
                    <td className="px-5 py-3 text-sm text-text-secondary">{job.vehicle}</td>
                    <td className="px-5 py-3">
                      <span className={clsx(
                        "px-2 py-0.5 text-xs font-medium rounded-full border",
                        STATUS_COLORS[job.status] || STATUS_COLORS.CREATED
                      )}>
                        {job.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm text-text-muted">{job.updated}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* AI Activity Feed */}
        <div className="bg-background-alt rounded-xl border border-border overflow-hidden">
          <div className="p-5 border-b border-border">
            <h3 className="text-lg font-semibold text-text-primary">AI Activity</h3>
            <p className="text-xs text-text-muted mt-1">Recent AI-powered actions</p>
          </div>
          <div className="p-3 space-y-3">
            {AI_ACTIVITY.map((activity, idx) => (
              <div 
                key={idx}
                className="flex items-start gap-3 p-3 bg-surface rounded-lg border border-border/50"
              >
                <div className="w-8 h-8 rounded-lg bg-brand-orange/10 flex items-center justify-center flex-shrink-0">
                  <Brain className="w-4 h-4 text-brand-orange" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-primary font-medium">{activity.action}</p>
                  <p className="text-xs text-text-muted mt-0.5 flex items-center gap-2">
                    <Car className="w-3 h-3" />
                    {activity.vehicle}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-xs text-text-muted">{activity.time}</span>
                  <div className="flex items-center gap-1 mt-1">
                    <span className={clsx(
                      "text-[10px] font-medium",
                      activity.confidence >= 90 ? "text-emerald-400" : "text-yellow-400"
                    )}>
                      {activity.confidence}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
