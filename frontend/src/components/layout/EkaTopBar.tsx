import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, ChevronDown, Zap, Brain, Database } from 'lucide-react';
import type { IntelligenceMode } from '../../types';
import { cn } from '../../lib/utils';

/* Custom User type */
interface EkaUser {
  user_id: string;
  email: string;
  name: string;
}

/* Simple hook to get user from localStorage */
function useLocalUser() {
  const [user, setUser] = useState<EkaUser | null>(null);
  
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        setUser(null);
      }
    }
  }, []);
  
  const signOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };
  
  return { user, signOut };
}

const TITLES: Record<string, string> = {
  '/app/dashboard':  'Dashboard',
  '/app/chat':       'EKA-AI Chat',
  '/app/chats':      'Chat History',
  '/app/job-cards':  'Job Cards',
  '/app/invoices':   'Invoices',
  '/app/mg-fleet':   'Fleet Management',
  '/app/pdi':        'PDI Checklist',
  '/app/settings':   'Settings',
};

const MODES: { value: IntelligenceMode; label: string; icon: React.ElementType; desc: string }[] = [
  { value: 'FAST',         label: 'Gemini Flash', icon: Zap,      desc: 'Fast responses'  },
  { value: 'THINKING',     label: 'Gemini Pro',   icon: Brain,    desc: 'Deep reasoning'  },
  { value: 'DEEP_CONTEXT', label: 'RAG + Agent',  icon: Database, desc: 'Knowledge base'  },
];

const NOTIFICATIONS = [
  { text: 'JC-0042 moved to PDI stage',         time: '2 min ago',  dot: '#F45D3D' },
  { text: 'Invoice INV-0018 marked as Paid',     time: '1 hr ago',   dot: '#22C55E' },
  { text: 'Customer approved estimate #E-09',    time: '3 hrs ago',  dot: '#3B82F6' },
];

interface Props {
  intelligenceMode: IntelligenceMode;
  onModeChange: (m: IntelligenceMode) => void;
}

const EkaTopBar: React.FC<Props> = ({ intelligenceMode, onModeChange }) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useLocalUser();
  const [open, setOpen] = useState<'mode' | 'bell' | 'user' | null>(null);

  const toggle = (menu: typeof open) => setOpen(o => o === menu ? null : menu);
  const close  = () => setOpen(null);

  const isChat   = pathname === '/app/chat';
  const title    = Object.entries(TITLES).find(([k]) => pathname.startsWith(k))?.[1] ?? 'EKA-AI';
  const curMode  = MODES.find(m => m.value === intelligenceMode) ?? MODES[0];
  const MIcon    = curMode.icon;
  const initial  = (user?.email?.[0] ?? 'U').toUpperCase();
  const username = user?.email?.split('@')[0] ?? 'User';

  return (
    <header className="h-14 flex-shrink-0 flex items-center justify-between px-5 bg-[#111113]/90 backdrop-blur-md border-b border-[#1D1D1F] sticky top-0 z-40">

      {/* Page title */}
      <h1 className="text-sm font-semibold text-[#CCC] font-heading tracking-tight">{title}</h1>

      {/* Right cluster */}
      <div className="flex items-center gap-2">

        {/* Intelligence mode — chat page only */}
        {isChat && (
          <div className="relative">
            <button
              onClick={() => toggle('mode')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-background-alt border border-[#2A2A2D] hover:border-brand-orange/40 text-[#999] hover:text-text-primary text-xs font-medium transition-all"
            >
              <MIcon className="w-3.5 h-3.5 text-brand-orange" />
              <span>{curMode.label}</span>
              <ChevronDown className={cn('w-3 h-3 transition-transform duration-200', open === 'mode' && 'rotate-180')} />
            </button>

            {open === 'mode' && (
              <div className="absolute right-0 top-full mt-1 w-52 bg-background-alt border border-border rounded-xl shadow-2xl shadow-black/50 py-1.5 z-50">
                {MODES.map(m => {
                  const I = m.icon;
                  const active = m.value === intelligenceMode;
                  return (
                    <button
                      key={m.value}
                      onClick={() => { onModeChange(m.value); close(); }}
                      className={cn(
                        'flex items-center gap-3 w-full px-3 py-2.5 text-left transition-colors',
                        active ? 'bg-brand-orange/10 text-text-primary' : 'text-[#888] hover:text-text-primary hover:bg-[#222]',
                      )}
                    >
                      <I className={cn('w-4 h-4 flex-shrink-0', active && 'text-brand-orange')} />
                      <div>
                        <p className="text-xs font-semibold leading-none mb-0.5">{m.label}</p>
                        <p className="text-[10px] text-[#555]">{m.desc}</p>
                      </div>
                      {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-orange" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Bell */}
        <div className="relative">
          <button
            onClick={() => toggle('bell')}
            className="relative p-2 text-[#555] hover:text-text-primary rounded-lg hover:bg-background-alt transition-colors"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-brand-orange animate-pulse" />
          </button>

          {open === 'bell' && (
            <div className="absolute right-0 top-full mt-1 w-72 bg-background-alt border border-border rounded-xl shadow-2xl shadow-black/50 py-2 z-50">
              <p className="text-[10px] font-semibold text-[#3A3A3A] uppercase tracking-widest px-4 py-1 font-mono">
                Notifications
              </p>
              {NOTIFICATIONS.map((n, i) => (
                <div key={i} className="flex items-start gap-3 px-4 py-2.5 hover:bg-[#222] cursor-pointer transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: n.dot }} />
                  <div>
                    <p className="text-[12px] text-[#CCC] leading-snug">{n.text}</p>
                    <p className="text-[10px] text-[#444] mt-0.5 font-mono">{n.time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* User avatar */}
        <div className="relative">
          <button
            onClick={() => toggle('user')}
            className="p-1.5 rounded-lg hover:bg-background-alt transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-orange to-amber-500 flex items-center justify-center text-xs font-bold text-black">
              {initial}
            </div>
          </button>

          {open === 'user' && (
            <div className="absolute right-0 top-full mt-1 w-44 bg-background-alt border border-border rounded-xl shadow-2xl shadow-black/50 py-1.5 z-50">
              <div className="px-3 py-2 border-b border-[#222]">
                <p className="text-xs font-medium text-text-primary truncate">{username}</p>
                <p className="text-[10px] text-[#444]">Workshop Admin</p>
              </div>
              <button
                onClick={() => { navigate('/app/settings'); close(); }}
                className="w-full px-3 py-2 text-left text-xs text-[#888] hover:text-text-primary hover:bg-[#222] transition-colors"
              >
                Settings
              </button>
              <button
                onClick={() => { signOut(); close(); }}
                className="w-full px-3 py-2 text-left text-xs text-red-400 hover:bg-red-500/10 transition-colors"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Click-away overlay */}
      {open && <div className="fixed inset-0 z-30" onClick={close} />}
    </header>
  );
};

export default EkaTopBar;
