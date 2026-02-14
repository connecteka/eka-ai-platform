import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Wrench, ClipboardCheck, Truck, FileText,
  Settings, ChevronLeft, ChevronRight, Plus, MessageSquare,
  MoreHorizontal, Zap,
} from 'lucide-react';
import { cn } from '../../lib/utils';

/* Navigation items — paths match /app/* routes in EkaAppRouter */
const NAV = [
  { icon: LayoutDashboard, label: 'Dashboard',     path: '/app/dashboard',  badge: null },
  { icon: Wrench,          label: 'Job Cards',     path: '/app/job-cards',  badge: 3    },
  { icon: ClipboardCheck,  label: 'PDI Checklist', path: '/app/pdi',        badge: null },
  { icon: Truck,           label: 'Fleet Mgmt',    path: '/app/mg-fleet',   badge: null },
  { icon: FileText,        label: 'Invoices',      path: '/app/invoices',   badge: null },
] as const;

/* Mock recent chats — replace with Supabase query when ready */
const CHATS = [
  { id: '1', title: 'Fortuner brake vibration diagnosis',     g: 'Today'     },
  { id: '2', title: 'Swift 2022 oil change estimate',         g: 'Today'     },
  { id: '3', title: 'MG fleet Q1 2025 billing analysis',      g: 'Yesterday' },
  { id: '4', title: 'PDI checklist — new Nexon delivery',     g: 'Yesterday' },
  { id: '5', title: 'DTC P0300 misfire Innova Crysta',        g: 'This Week' },
  { id: '6', title: 'Clutch replacement estimate Creta',      g: 'Older'     },
] as const;
const GROUPS = ['Today', 'Yesterday', 'This Week', 'Older'] as const;

interface Props { collapsed: boolean; onToggle: () => void; }

const EkaSidebar: React.FC<Props> = ({ collapsed, onToggle }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user, signOut } = useAuth();
  const [hovered, setHovered] = useState<string | null>(null);

  const isActive = (p: string) => pathname === p || pathname.startsWith(p + '/');
  const initial  = (user?.email?.[0] ?? 'U').toUpperCase();
  const username = user?.email?.split('@')[0] ?? 'User';

  return (
    <aside className={cn(
      'relative flex flex-col h-full bg-[#111113] border-r border-[#1D1D1F]',
      'transition-all duration-300 ease-in-out flex-shrink-0 select-none',
      collapsed ? 'w-14' : 'w-[260px]',
    )}>

      {/* ── Collapse toggle ─────────────────────────────────── */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-5 z-20 w-6 h-6 rounded-full bg-background-alt border border-border flex items-center justify-center text-[#555] hover:text-text-primary hover:border-brand-orange/50 transition-colors"
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>

      {/* ── Logo ────────────────────────────────────────────── */}
      <div className={cn(
        'flex items-center gap-3 border-b border-[#1D1D1F] flex-shrink-0',
        collapsed ? 'justify-center p-4' : 'px-4 py-4',
      )}>
        <div className="w-8 h-8 rounded-lg bg-brand-orange flex-shrink-0 flex items-center justify-center shadow-md shadow-brand-orange/25">
          <span className="text-white font-bold text-sm font-heading">E</span>
        </div>
        {!collapsed && (
          <span className="text-text-primary font-bold text-lg font-heading tracking-tight">
            EKA<span className="text-brand-orange">AI</span>
          </span>
        )}
      </div>

      {/* ── New chat ────────────────────────────────────────── */}
      <div className={cn('pt-3 pb-1 flex-shrink-0', collapsed ? 'px-2' : 'px-3')}>
        <button
          onClick={() => navigate('/app/chat')}
          className={cn(
            'flex items-center gap-2.5 w-full rounded-lg transition-all duration-150 text-sm font-medium',
            'text-[#999] hover:text-text-primary hover:bg-background-alt',
            'border border-[#2A2A2D] hover:border-brand-orange/30',
            collapsed ? 'justify-center p-2.5' : 'px-3 py-2.5',
          )}
          title={collapsed ? 'New Chat' : undefined}
        >
          <Plus className="w-4 h-4 flex-shrink-0 text-brand-orange" />
          {!collapsed && <span>New Chat</span>}
        </button>
      </div>

      {/* ── Scrollable body ─────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0">

        {/* Recent chats — hidden when collapsed */}
        {!collapsed && (
          <div className="px-3 py-2">
            {GROUPS.map(group => {
              const items = CHATS.filter(c => c.g === group);
              if (!items.length) return null;
              return (
                <div key={group} className="mb-3">
                  <p className="text-[10px] font-semibold text-[#383838] uppercase tracking-widest px-2 mb-1 font-mono">
                    {group}
                  </p>
                  {items.map(c => (
                    <div
                      key={c.id}
                      onMouseEnter={() => setHovered(c.id)}
                      onMouseLeave={() => setHovered(null)}
                      onClick={() => navigate('/app/chat')}
                      className="relative flex items-center rounded-lg px-2 py-1.5 cursor-pointer hover:bg-background-alt transition-colors group"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-[#383838] mr-2.5 flex-shrink-0" />
                      <span className="text-[13px] text-[#777] truncate flex-1 group-hover:text-[#BBB] pr-5 transition-colors">
                        {c.title}
                      </span>
                      {hovered === c.id && (
                        <button className="absolute right-1 p-1 rounded text-[#555] hover:text-text-primary hover:bg-[#2A2A2D]">
                          <MoreHorizontal className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}

        {/* Divider */}
        <div className="mx-3 border-t border-[#1D1D1F] my-1" />

        {/* Nav items */}
        <nav className="px-2 py-2 space-y-0.5">
          {NAV.map(item => {
            const Icon   = item.icon;
            const active = isActive(item.path);
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                title={collapsed ? item.label : undefined}
                className={cn(
                  'relative flex items-center gap-3 w-full rounded-lg transition-all duration-150 text-sm',
                  collapsed ? 'justify-center p-2.5' : 'px-3 py-2.5',
                  active
                    ? cn('bg-brand-orange/10 text-text-primary border-l-2 border-brand-orange', !collapsed && 'pl-[10px]')
                    : 'text-[#777] hover:text-text-primary hover:bg-background-alt',
                )}
              >
                <Icon className={cn('w-[18px] h-[18px] flex-shrink-0', active && 'text-brand-orange')} />
                {!collapsed && <span className="font-medium flex-1 text-left">{item.label}</span>}
                {/* Badge */}
                {item.badge && !collapsed && (
                  <span className="ml-auto min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-brand-orange text-white text-[10px] font-bold px-1">
                    {item.badge}
                  </span>
                )}
                {item.badge && collapsed && (
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-brand-orange" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* ── Pro upgrade card ─────────────────────────────────── */}
      {!collapsed && (
        <div className="px-3 pb-2 flex-shrink-0">
          <div className="rounded-xl border border-brand-orange/20 bg-brand-orange/5 p-3">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-3.5 h-3.5 text-brand-orange" />
              <span className="text-xs font-semibold text-text-primary">Pro Plan</span>
            </div>
            <p className="text-[11px] text-[#555] mb-2 leading-snug">Unlimited AI diagnostics &amp; fleet analysis</p>
            <button
              onClick={() => navigate('/pricing')}
              className="w-full py-1.5 text-[11px] font-semibold text-brand-orange rounded-lg bg-brand-orange/10 hover:bg-brand-orange/20 transition-colors"
            >
              Upgrade
            </button>
          </div>
        </div>
      )}

      {/* ── Footer: settings + user ──────────────────────────── */}
      <div className={cn('border-t border-[#1D1D1F] flex-shrink-0', collapsed ? 'px-2 py-3' : 'px-3 py-3')}>
        <button
          onClick={() => navigate('/app/settings')}
          title={collapsed ? 'Settings' : undefined}
          className={cn(
            'flex items-center gap-3 w-full rounded-lg text-[#777] hover:text-text-primary hover:bg-background-alt transition-all text-sm mb-2',
            collapsed ? 'justify-center p-2.5' : 'px-3 py-2',
          )}
        >
          <Settings className="w-[18px] h-[18px] flex-shrink-0" />
          {!collapsed && <span className="font-medium">Settings</span>}
        </button>

        <div
          onClick={() => signOut()}
          className={cn(
            'flex items-center rounded-lg hover:bg-background-alt cursor-pointer transition-colors',
            collapsed ? 'justify-center p-2' : 'gap-3 px-2 py-2',
          )}
          title={collapsed ? `${username} — Sign out` : undefined}
        >
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-orange to-amber-500 flex items-center justify-center text-xs font-bold text-black flex-shrink-0">
            {initial}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-text-primary truncate">{username}</p>
              <p className="text-[10px] text-[#444]">Workshop Admin</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default EkaSidebar;
