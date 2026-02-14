import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, ChevronDown, Zap, Brain, Database, Crown, Sparkles, Menu } from 'lucide-react';
import { useLocalUser } from '../../hooks/useLocalUser';
import { useShell } from './EkaAppShell';
import type { IntelligenceMode } from '../../types';
import { cn } from '../../lib/utils';

/* Mascot URL */
const MASCOT_URL = "https://customer-assets.emergentagent.com/job_c888b364-381d-411f-9fb8-91dd9dd39bee/artifacts/0nsgjm67_MASCOT.jpg";

const TITLES: Record<string, string> = {
  '/app/dashboard':  'Dashboard',
  '/app/chat':       'Chat',
  '/app/chats':      'Chat History',
  '/app/job-cards':  'Job Cards',
  '/app/invoices':   'Invoices',
  '/app/mg-fleet':   'Fleet Management',
  '/app/pdi':        'PDI Checklist',
  '/app/settings':   'Settings',
  '/app/search':     'Search',
};

const MODES: { value: IntelligenceMode; label: string; icon: React.ElementType; desc: string }[] = [
  { value: 'FAST',         label: 'Gemini Flash', icon: Zap,      desc: 'Fast responses'  },
  { value: 'THINKING',     label: 'Gemini Pro',   icon: Brain,    desc: 'Deep reasoning'  },
  { value: 'DEEP_CONTEXT', label: 'RAG + Agent',  icon: Database, desc: 'Knowledge base'  },
];

const NOTIFICATIONS = [
  { text: 'JC-0042 moved to PDI stage',         time: '2 min ago',  dot: '#F98906' },
  { text: 'Invoice INV-0018 marked as Paid',    time: '1 hr ago',   dot: '#22C55E' },
  { text: 'Customer approved estimate #E-09',   time: '3 hrs ago',  dot: '#3B82F6' },
];

interface Props {
  intelligenceMode: IntelligenceMode;
  onModeChange: (m: IntelligenceMode) => void;
}

const EkaTopBar: React.FC<Props> = ({ intelligenceMode, onModeChange }) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useLocalUser();
  const { setMobileMenuOpen } = useShell();
  const [open, setOpen] = useState<'mode' | 'bell' | 'user' | null>(null);

  const toggle = (menu: typeof open) => setOpen(o => o === menu ? null : menu);
  const close  = () => setOpen(null);

  const isChat   = pathname === '/app/chat';
  const title    = Object.entries(TITLES).find(([k]) => pathname.startsWith(k))?.[1] ?? 'eka-aı';
  const curMode  = MODES.find(m => m.value === intelligenceMode) ?? MODES[0];
  const MIcon    = curMode.icon;
  const initial  = (user?.name?.[0] ?? user?.email?.[0] ?? 'U').toUpperCase();
  const username = user?.name ?? user?.email?.split('@')[0] ?? 'User';
  
  // Mock PRO status
  const isPro = false;

  return (
    <header className="h-14 flex-shrink-0 flex items-center justify-between px-5 bg-white/95 backdrop-blur-md border-b border-gray-200 sticky top-0 z-40" data-testid="eka-topbar">

      {/* Page title with mascot */}
      <div className="flex items-center gap-2.5">
        <img 
          src={MASCOT_URL} 
          alt="eka-ai" 
          className="w-7 h-7 object-cover"
          style={{ borderRadius: '4px' }}
        />
        <div className="flex flex-col">
          <h1 className="text-sm font-semibold text-gray-800 tracking-tight" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            eka<span className="text-[#F98906]">-</span>a<span className="text-[#F98906]">ı</span>
            <span className="text-gray-400 font-normal ml-2">/ {title}</span>
          </h1>
        </div>
      </div>

      {/* Right cluster */}
      <div className="flex items-center gap-2">

        {/* Upgrade button (if not PRO) */}
        {!isPro && (
          <button
            onClick={() => navigate('/pricing')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#F98906] to-amber-500 text-white text-xs font-semibold hover:shadow-lg hover:shadow-[#F98906]/25 transition-all"
            data-testid="topbar-upgrade-btn"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Upgrade
          </button>
        )}

        {/* Intelligence mode — chat page only */}
        {isChat && (
          <div className="relative">
            <button
              onClick={() => toggle('mode')}
              data-testid="intelligence-mode-btn"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 border border-gray-200 hover:border-[#F98906]/40 text-gray-600 hover:text-gray-800 text-xs font-medium transition-all"
            >
              <MIcon className="w-3.5 h-3.5 text-[#F98906]" />
              <span>{curMode.label}</span>
              <ChevronDown className={cn('w-3 h-3 transition-transform duration-200', open === 'mode' && 'rotate-180')} />
            </button>

            {open === 'mode' && (
              <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-gray-200 rounded-xl shadow-xl py-1.5 z-50">
                {MODES.map(m => {
                  const I = m.icon;
                  const active = m.value === intelligenceMode;
                  return (
                    <button
                      key={m.value}
                      onClick={() => { onModeChange(m.value); close(); }}
                      className={cn(
                        'flex items-center gap-3 w-full px-3 py-2.5 text-left transition-colors',
                        active ? 'bg-[#F98906]/10 text-gray-800' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50',
                      )}
                    >
                      <I className={cn('w-4 h-4 flex-shrink-0', active && 'text-[#F98906]')} />
                      <div>
                        <p className="text-xs font-semibold leading-none mb-0.5">{m.label}</p>
                        <p className="text-[10px] text-gray-400">{m.desc}</p>
                      </div>
                      {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#F98906]" />}
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
            data-testid="notifications-btn"
            className="relative p-2 text-gray-500 hover:text-gray-800 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#F98906] animate-pulse" />
          </button>

          {open === 'bell' && (
            <div className="absolute right-0 top-full mt-1 w-72 bg-white border border-gray-200 rounded-xl shadow-xl py-2 z-50">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-4 py-1 font-mono">
                Notifications
              </p>
              {NOTIFICATIONS.map((n, i) => (
                <div key={i} className="flex items-start gap-3 px-4 py-2.5 hover:bg-gray-50 cursor-pointer transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: n.dot }} />
                  <div>
                    <p className="text-[12px] text-gray-700 leading-snug">{n.text}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5 font-mono">{n.time}</p>
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
            data-testid="user-menu-btn"
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#F98906] to-amber-500 flex items-center justify-center text-xs font-bold text-white">
              {initial}
            </div>
          </button>

          {open === 'user' && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-xl shadow-xl py-1.5 z-50">
              <div className="px-3 py-2 border-b border-gray-100">
                <p className="text-xs font-medium text-gray-800 truncate">{username}</p>
                <p className="text-[10px] text-gray-400 flex items-center gap-1">
                  {isPro ? (
                    <>
                      <Crown className="w-3 h-3 text-[#F98906]" />
                      Pro Plan
                    </>
                  ) : (
                    'Free Plan'
                  )}
                </p>
              </div>
              {!isPro && (
                <button
                  onClick={() => { navigate('/pricing'); close(); }}
                  className="w-full px-3 py-2 text-left text-xs text-[#F98906] hover:bg-[#F98906]/5 transition-colors flex items-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Upgrade to Pro
                </button>
              )}
              <button
                onClick={() => { navigate('/app/settings'); close(); }}
                className="w-full px-3 py-2 text-left text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-50 transition-colors"
              >
                Settings
              </button>
              <button
                onClick={() => { signOut(); close(); }}
                className="w-full px-3 py-2 text-left text-xs text-red-500 hover:bg-red-50 transition-colors"
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
