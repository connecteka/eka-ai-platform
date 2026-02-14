import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wrench, CheckCircle, IndianRupee, Brain,
  Plus, ArrowUpRight, Clock, AlertCircle,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, ResponsiveContainer,
} from 'recharts';
import StatCard from '../components/shared/StatCard';
import Button   from '../components/shared/Button';

/* ─── Mock data (replace with real API calls) ─── */
const mkRevenue = () =>
  Array.from({ length: 30 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (29 - i));
    return {
      date:    d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
      revenue: Math.floor(14000 + Math.random() * 28000),
    };
  });

const DONUT = [
  { name: 'Open',        value: 12, color: '#F45D3D' },
  { name: 'In Progress', value: 7,  color: '#3B82F6' },
  { name: 'PDI',         value: 3,  color: '#F59E0B' },
  { name: 'Invoiced',    value: 5,  color: '#8B5CF6' },
  { name: 'Closed',      value: 28, color: '#22C55E' },
];

const ROWS = [
  { id: 'JC-0047', cust: 'Rahul Sharma',   veh: 'Maruti Swift 2022',  st: 'PDI',         hi: true,  upd: '2 min ago'  },
  { id: 'JC-0046', cust: 'Priya Nair',     veh: 'Honda City 2021',    st: 'DIAGNOSED',   hi: false, upd: '14 min ago' },
  { id: 'JC-0045', cust: 'Anil Gupta',     veh: 'Hyundai Creta 2023', st: 'IN_PROGRESS', hi: false, upd: '1 hr ago'   },
  { id: 'JC-0044', cust: 'Meena Iyer',     veh: 'Tata Nexon 2022',    st: 'ESTIMATED',   hi: true,  upd: '2 hrs ago'  },
  { id: 'JC-0043', cust: 'Deepak Verma',   veh: 'MG Hector 2021',     st: 'CLOSED',      hi: false, upd: '3 hrs ago'  },
] as const;

const STATUS_STYLE: Record<string, { l: string; c: string; bg: string }> = {
  DIAGNOSED:   { l: 'Diagnosed',   c: '#8B5CF6', bg: 'rgba(139,92,246,0.1)'  },
  ESTIMATED:   { l: 'Estimated',   c: '#F59E0B', bg: 'rgba(245,158,11,0.1)'  },
  IN_PROGRESS: { l: 'In Progress', c: '#3B82F6', bg: 'rgba(59,130,246,0.1)'  },
  PDI:         { l: 'PDI',         c: '#F45D3D', bg: 'rgba(244,93,61,0.1)'   },
  INVOICED:    { l: 'Invoiced',    c: '#8B5CF6', bg: 'rgba(139,92,246,0.1)'  },
  CLOSED:      { l: 'Closed',      c: '#22C55E', bg: 'rgba(34,197,94,0.1)'   },
};

/* Custom chart tooltip */
const ChartTip: React.FC<any> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="card rounded-lg px-3 py-2 shadow-xl">
      <p className="text-[10px] text-text-secondary font-mono mb-0.5">{label}</p>
      <p className="text-sm font-bold text-brand-orange">₹{payload[0].value.toLocaleString('en-IN')}</p>
    </div>
  );
};

/* ─── Page ──────────────────────────────────────────── */
const EkaDashboardPage: React.FC = () => {
  const navigate  = useNavigate();
  const revData   = React.useMemo(mkRevenue, []);
  const [range, setRange] = useState<'7' | '30'>('30');
  const chartData = range === '7' ? revData.slice(-7) : revData;

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-text-primary font-heading">Workshop Overview</h2>
          <p className="text-[#3A3A3A] text-xs font-mono mt-0.5">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => navigate('/app/chat')}>
            Ask EKA-AI
          </Button>
          <Button
            variant="primary" size="sm"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => navigate('/app/job-cards')}
          >
            New Job Card
          </Button>
        </div>
      </div>

      {/* KPI row — uses existing StatCard component */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Open Job Cards"      value={12}     sub="3 high priority"       icon={Wrench}       trend="+3 today"  trendUp={true}  colorClass="orange" onClick={() => navigate('/app/job-cards')} />
        <StatCard title="Completed Today"     value={8}      sub="vs 6 yesterday"        icon={CheckCircle}  trend="+33%"      trendUp={true}  colorClass="green"  />
        <StatCard title="Revenue This Month"  value="₹2.4L"  sub="Target: ₹3.0L"         icon={IndianRupee}  trend="+12%"      trendUp={true}  colorClass="amber"  />
        <StatCard title="AI Queries Today"    value={47}     sub="3 diagnostics pending" icon={Brain}        trend="+8 vs yesterday" trendUp={true} colorClass="blue" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Revenue area chart */}
        <div className="lg:col-span-2 card rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[10px] text-[#3A3A3A] font-mono uppercase tracking-widest">Revenue Trend</p>
              <p className="text-text-primary font-bold text-lg font-heading mt-0.5">₹2,41,850</p>
            </div>
            <div className="flex gap-1">
              {(['7', '30'] as const).map(r => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    range === r
                      ? 'bg-brand-orange/10 text-brand-orange border border-brand-orange/30'
                      : 'text-[#444] hover:text-text-primary'
                  }`}
                >
                  {r}D
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="rGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#F45D3D" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#F45D3D" stopOpacity={0}    />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1A1A1C" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fill: '#3A3A3A', fontSize: 10, fontFamily: 'monospace' }}
                tickLine={false} axisLine={false}
                interval={range === '7' ? 0 : 4}
              />
              <YAxis
                tick={{ fill: '#3A3A3A', fontSize: 10, fontFamily: 'monospace' }}
                tickLine={false} axisLine={false}
                tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<ChartTip />} />
              <Area
                type="monotone" dataKey="revenue"
                stroke="#F45D3D" strokeWidth={2}
                fill="url(#rGrad)" dot={false}
                activeDot={{ r: 4, fill: '#F45D3D', strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Job status donut */}
        <div className="card rounded-xl p-5">
          <p className="text-[10px] text-[#3A3A3A] font-mono uppercase tracking-widest mb-1">Job Status</p>
          <p className="text-text-primary font-bold text-lg font-heading mb-3">
            {DONUT.reduce((a, b) => a + b.value, 0)} Total
          </p>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={DONUT} cx="50%" cy="50%" innerRadius={46} outerRadius={70} paddingAngle={3} dataKey="value">
                {DONUT.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#1B1B1D', border: '1px solid #333', borderRadius: 8, fontSize: 12 }}
                itemStyle={{ color: '#CCC' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {DONUT.map(d => (
              <div key={d.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                  <span className="text-xs text-[#777]">{d.name}</span>
                </div>
                <span className="text-xs font-bold text-text-primary font-mono">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent jobs table */}
      <div className="card rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <p className="text-sm font-semibold text-text-primary font-heading">Recent Job Cards</p>
          <button
            onClick={() => navigate('/app/job-cards')}
            className="flex items-center gap-1 text-xs text-brand-orange hover:opacity-80 font-medium transition-opacity"
          >
            View all <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1A1A1C]">
                {['Job ID', 'Customer', 'Vehicle', 'Status', 'Priority', 'Updated'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-[10px] font-semibold text-[#3A3A3A] uppercase tracking-widest font-mono">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map(r => {
                const sc = STATUS_STYLE[r.st] ?? { l: r.st, c: '#666', bg: 'rgba(102,102,102,0.1)' };
                return (
                  <tr
                    key={r.id}
                    onClick={() => navigate('/app/job-cards')}
                    className="border-b border-[#111] hover:bg-[#141416] cursor-pointer transition-colors"
                  >
                    <td className="px-5 py-3.5 text-xs font-bold text-brand-orange font-mono">{r.id}</td>
                    <td className="px-5 py-3.5 text-sm text-[#CCC]">{r.cust}</td>
                    <td className="px-5 py-3.5 text-xs text-[#777] font-mono">{r.veh}</td>
                    <td className="px-5 py-3.5">
                      <span
                        className="inline-flex items-center px-2 py-1 rounded-full text-[11px] font-semibold"
                        style={{ color: sc.c, background: sc.bg }}
                      >
                        {sc.l}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      {r.hi
                        ? <span className="flex items-center gap-1 text-[11px] text-red-400 font-semibold"><AlertCircle className="w-3 h-3" />High</span>
                        : <span className="text-[11px] text-[#444]">Normal</span>}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="flex items-center gap-1 text-[11px] text-[#444] font-mono">
                        <Clock className="w-3 h-3" />{r.upd}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default EkaDashboardPage;
