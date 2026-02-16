import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLocalUser } from '../../hooks/useLocalUser';
import {
  LayoutDashboard, Wrench, ClipboardCheck, Truck, FileText,
  Settings, ChevronLeft, ChevronRight, Plus, MessageSquare,
  MoreHorizontal, Zap, Search, Crown, CreditCard, LogOut,
  Sparkles, Lock,
} from 'lucide-react';
import { cn } from '../../lib/utils';

/* Mascot URL */
const MASCOT_URL = "https://customer-assets.emergentagent.com/job_c888b364-381d-411f-9fb8-91dd9dd39bee/artifacts/0nsgjm67_MASCOT.jpg";

/* Free features - accessible to all */
const FREE_NAV = [
  { icon: MessageSquare, label: 'Chat',           path: '/app/chat',      badge: null },
  { icon: Search,        label: 'Search',         path: '/app/search',    badge: null },
  { icon: Wrench,        label: 'Open Job Card',  path: '/app/job-cards', badge: 3    },
  { icon: FileText,      label: 'Invoices',       path: '/app/invoices',  badge: null },
] as const;

/* PRO features - require subscription */
const PRO_NAV = [
  { icon: LayoutDashboard, label: 'Dashboard',     path: '/app/dashboard', badge: null },
  { icon: Truck,           label: 'Fleet Mgmt',    path: '/app/mg-fleet',  badge: null },
  { icon: ClipboardCheck,  label: 'PDI Checklist', path: '/app/pdi',       badge: null },
] as const;

/* Mock recent chats */
const CHATS = [
  { id: '1', title: 'Fortuner brake vibration diagnosis',     g: 'Today'     },
  { id: '2', title: 'Swift 2022 oil change estimate',         g: 'Today'     },
  { id: '3', title: 'MG fleet Q1 2025 billing analysis',      g: 'Yesterday' },
  { id: '4', title: 'PDI checklist — new Nexon delivery',     g: 'Yesterday' },
  { id: '5', title: 'DTC P0300 misfire Innova Crysta',        g: 'This Week' },
] as const;
const GROUPS = ['Today', 'Yesterday', 'This Week'] as const;

interface Props { collapsed: boolean; onToggle: () => void; }

const EkaSidebar: React.FC<Props> = ({ collapsed, onToggle }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user, signOut } = useLocalUser();
  const [hovered, setHovered] = useState<string | null>(null);

  const isActive = (p: string) => pathname === p || pathname.startsWith(p + '/');
  const initial  = (user?.name?.[0] ?? user?.email?.[0] ?? 'U').toUpperCase();
  const username = user?.name ?? user?.email?.split('@')[0] ?? 'User';
  
  // Check if user has PRO plan (mock - always false for now)
  const isPro = false;

  return (
    <aside className={cn(
      'relative flex flex-col h-full bg-[#0D0D0D] border-r border-[#1A1A1A]',
      'transition-all duration-300 ease-in-out flex-shrink-0 select-none',
      collapsed ? 'w-14' : 'w-[260px]',
    )} data-testid="eka-sidebar">

      {/* ── Collapse toggle ─────────────────────────────────── */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-5 z-20 w-6 h-6 rounded-full bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center text-[#555] hover:text-white hover:border-[#F98906]/50 transition-colors"
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        data-testid="sidebar-toggle"
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>

      {/* ── Logo with Mascot ────────────────────────────────── */}
      <div className={cn(
        'flex items-center gap-2.5 border-b border-[#1A1A1A] flex-shrink-0',
        collapsed ? 'justify-center p-4' : 'px-4 py-4',
      )}>
        <img 
          src={MASCOT_URL} 
          alt="eka-ai" 
          className="w-8 h-8 object-cover flex-shrink-0"
          style={{ borderRadius: '4px' }}
        />
        {!collapsed && (
          <div className="flex flex-col">
            <span className="text-white font-bold text-lg tracking-tight" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              eka<span className="text-[#F98906]">-</span>a<span className="text-[#F98906]">ı</span>
            </span>
            <span className="text-[9px] text-[#444] -mt-0.5 tracking-wide">
              Automobile Intelligence
            </span>
          </div>
        )}
      </div>

      {/* ── New chat button ──────────────────────────────────── */}
      <div className={cn('pt-3 pb-1 flex-shrink-0', collapsed ? 'px-2' : 'px-3')}>
        <button
          onClick={() => navigate('/app/chat')}
          data-testid="new-chat-btn"
          className={cn(
            'flex items-center gap-2.5 w-full rounded-lg transition-all duration-150 text-sm font-medium',
            'text-[#888] hover:text-white hover:bg-[#1A1A1A]',
            'border border-[#2A2A2A] hover:border-[#F98906]/40',
            collapsed ? 'justify-center p-2.5' : 'px-3 py-2.5',
          )}
          title={collapsed ? 'New Chat' : undefined}
        >
          <Plus className="w-4 h-4 flex-shrink-0 text-[#F98906]" />
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
                  <p className="text-[10px] font-semibold text-[#333] uppercase tracking-widest px-2 mb-1 font-mono">
                    {group}
                  </p>
                  {items.map(c => (
                    <div
                      key={c.id}
                      onMouseEnter={() => setHovered(c.id)}
                      onMouseLeave={() => setHovered(null)}
                      onClick={() => navigate('/app/chat')}
                      className="relative flex items-center rounded-lg px-2 py-1.5 cursor-pointer hover:bg-[#1A1A1A] transition-colors group"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-[#333] mr-2.5 flex-shrink-0" />
                      <span className="text-[13px] text-[#666] truncate flex-1 group-hover:text-[#AAA] pr-5 transition-colors">
                        {c.title}
                      </span>
                      {hovered === c.id && (
                        <button className="absolute right-1 p-1 rounded text-[#444] hover:text-white hover:bg-[#2A2A2A]">
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
        <div className="mx-3 border-t border-[#1A1A1A] my-1" />

        {/* FREE Nav items */}
        <nav className="px-2 py-2 space-y-0.5">
          <p className={cn(
            "text-[10px] font-semibold text-[#333] uppercase tracking-widest mb-1 font-mono",
            collapsed ? 'hidden' : 'px-2'
          )}>
            Features
          </p>
          {FREE_NAV.map(item => {
            const Icon   = item.icon;
            const active = isActive(item.path);
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                title={collapsed ? item.label : undefined}
                data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                className={cn(
                  'relative flex items-center gap-3 w-full rounded-lg transition-all duration-150 text-sm',
                  collapsed ? 'justify-center p-2.5' : 'px-3 py-2.5',
                  active
                    ? cn('bg-[#F98906]/10 text-white border-l-2 border-[#F98906]', !collapsed && 'pl-[10px]')
                    : 'text-[#666] hover:text-white hover:bg-[#1A1A1A]',
                )}
              >
                <Icon className={cn('w-[18px] h-[18px] flex-shrink-0', active && 'text-[#F98906]')} />
                {!collapsed && <span className="font-medium flex-1 text-left">{item.label}</span>}
                {/* Badge */}
                {item.badge && !collapsed && (
                  <span className="ml-auto min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-[#F98906] text-white text-[10px] font-bold px-1">
                    {item.badge}
                  </span>
                )}
                {item.badge && collapsed && (
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#F98906]" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Divider */}
        <div className="mx-3 border-t border-[#1A1A1A] my-2" />

        {/* PRO Nav items */}
        <nav className="px-2 py-1 space-y-0.5">
          <p className={cn(
            "text-[10px] font-semibold text-[#333] uppercase tracking-widest mb-1 font-mono flex items-center gap-1.5",
            collapsed ? 'hidden' : 'px-2'
          )}>
            <Crown className="w-3 h-3 text-[#F98906]" />
            Pro Features
          </p>
          {PRO_NAV.map(item => {
            const Icon   = item.icon;
            const active = isActive(item.path);
            const locked = !isPro;
            return (
              <button
                key={item.path}
                onClick={() => locked ? navigate('/pricing') : navigate(item.path)}
                title={collapsed ? `${item.label}${locked ? ' (PRO)' : ''}` : undefined}
                data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                className={cn(
                  'relative flex items-center gap-3 w-full rounded-lg transition-all duration-150 text-sm',
                  collapsed ? 'justify-center p-2.5' : 'px-3 py-2.5',
                  locked 
                    ? 'text-[#444] hover:text-[#666] hover:bg-[#1A1A1A] cursor-pointer'
                    : active
                      ? cn('bg-[#F98906]/10 text-white border-l-2 border-[#F98906]', !collapsed && 'pl-[10px]')
                      : 'text-[#666] hover:text-white hover:bg-[#1A1A1A]',
                )}
              >
                <Icon className={cn('w-[18px] h-[18px] flex-shrink-0', active && !locked && 'text-[#F98906]')} />
                {!collapsed && (
                  <>
                    <span className="font-medium flex-1 text-left">{item.label}</span>
                    {locked && (
                      <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#F98906]/10 text-[#F98906] text-[9px] font-bold">
                        <Lock className="w-2.5 h-2.5" />
                        PRO
                      </span>
                    )}
                  </>
                )}
                {locked && collapsed && (
                  <span className="absolute top-1 right-1 w-3 h-3 rounded-full bg-[#F98906]/20 flex items-center justify-center">
                    <Lock className="w-2 h-2 text-[#F98906]" />
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* ── Pro upgrade card ─────────────────────────────────── */}
      {!collapsed && !isPro && (
        <div className="px-3 pb-2 flex-shrink-0">
          <div className="rounded-xl border border-[#F98906]/20 bg-gradient-to-br from-[#F98906]/5 to-transparent p-3">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-[#F98906]" />
              <span className="text-xs font-semibold text-white">Upgrade to Pro</span>
            </div>
            <p className="text-[11px] text-[#555] mb-2.5 leading-snug">
              Unlock Dashboard, Fleet Management & unlimited AI queries
            </p>
            <button
              onClick={() => navigate('/pricing')}
              data-testid="upgrade-btn"
              className="w-full py-2 text-[11px] font-bold text-black bg-[#F98906] rounded-lg hover:bg-[#E07A00] transition-colors flex items-center justify-center gap-1.5"
            >
              <CreditCard className="w-3.5 h-3.5" />
              View Plans
            </button>
          </div>
        </div>
      )}

      {/* ── Footer: settings + user ──────────────────────────── */}
      <div className={cn('border-t border-[#1A1A1A] flex-shrink-0', collapsed ? 'px-2 py-3' : 'px-3 py-3')}>
        <button
          onClick={() => navigate('/app/settings')}
          title={collapsed ? 'Settings' : undefined}
          data-testid="settings-btn"
          className={cn(
            'flex items-center gap-3 w-full rounded-lg text-[#666] hover:text-white hover:bg-[#1A1A1A] transition-all text-sm mb-2',
            collapsed ? 'justify-center p-2.5' : 'px-3 py-2',
          )}
        >
          <Settings className="w-[18px] h-[18px] flex-shrink-0" />
          {!collapsed && <span className="font-medium">Settings</span>}
        </button>

        <div
          className={cn(
            'flex items-center rounded-lg hover:bg-[#1A1A1A] cursor-pointer transition-colors group',
            collapsed ? 'justify-center p-2' : 'gap-3 px-2 py-2',
          )}
          title={collapsed ? `${username} — Sign out` : undefined}
        >
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#F98906] to-amber-500 flex items-center justify-center text-xs font-bold text-black flex-shrink-0">
            {initial}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-white truncate">{username}</p>
              <p className="text-[10px] text-[#444]">Free Plan</p>
            </div>
          )}
          {!collapsed && (
            <button 
              onClick={(e) => { e.stopPropagation(); signOut(); }}
              className="p-1.5 rounded text-[#444] hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};

export default EkaSidebar;
