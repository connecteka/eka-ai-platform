import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  sub?: string;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  colorClass?: string;
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  sub, 
  icon: Icon, 
  trend,
  trendUp = true,
  colorClass = 'orange',
  onClick
}) => {
  const colorStyles: Record<string, { bg: string; text: string; iconBg: string }> = {
    blue:   { bg: 'bg-blue-50',    text: 'text-blue-700',    iconBg: 'bg-blue-100' },
    orange: { bg: 'bg-amber-50',   text: 'text-amber-700',   iconBg: 'bg-amber-100' },
    green:  { bg: 'bg-emerald-50', text: 'text-emerald-700', iconBg: 'bg-emerald-100' },
    red:    { bg: 'bg-red-50',     text: 'text-red-700',     iconBg: 'bg-red-100' },
    purple: { bg: 'bg-violet-50',  text: 'text-violet-700',  iconBg: 'bg-violet-100' },
    amber:  { bg: 'bg-amber-50',   text: 'text-amber-700',   iconBg: 'bg-amber-100' },
    gray:   { bg: 'bg-stone-50',   text: 'text-stone-600',   iconBg: 'bg-stone-100' },
  };

  const colors = colorStyles[colorClass] || colorStyles.orange;

  return (
    <div 
      onClick={onClick}
      className={`
        bg-white rounded-xl p-5 
        border border-stone-200 ${onClick ? 'cursor-pointer' : ''}
        transition-all duration-200 hover:shadow-md hover:border-stone-300
      `}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 min-w-0">
          <p className="text-stone-500 text-sm font-medium truncate">{title}</p>
          <h3 className="text-2xl font-bold text-stone-900 mt-1">
            {value}
          </h3>
          {sub && <p className="text-xs text-stone-400 mt-1">{sub}</p>}
        </div>
        <div className={`p-2.5 rounded-lg ${colors.iconBg} ${colors.text} flex-shrink-0 ml-3`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      
      {trend && (
        <div className="flex items-center gap-2 text-xs pt-2 border-t border-stone-100">
          <span className={`flex items-center gap-1 font-medium ${trendUp ? 'text-emerald-600' : 'text-red-500'}`}>
            {trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {trend}
          </span>
          <span className="text-stone-400">vs last week</span>
        </div>
      )}
    </div>
  );
};

export default StatCard;
