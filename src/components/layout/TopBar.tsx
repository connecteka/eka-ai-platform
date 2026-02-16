import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, Zap, Brain, Search, ChevronDown, LogOut, Settings, HelpCircle } from 'lucide-react';
import { IntelligenceMode } from '../../types';
import { clsx } from 'clsx';

interface TopBarProps {
  intelligenceMode: IntelligenceMode;
  onModeChange: (mode: IntelligenceMode) => void;
}

const PAGE_TITLES: Record<string, string> = {
  '/app': 'Dashboard',
  '/app/dashboard': 'Dashboard',
  '/chat': 'Chat',
  '/app/job-cards': 'Job Cards',
  '/app/pdi': 'PDI Checklist',
  '/app/fleet': 'Fleet Management',
  '/app/invoices': 'Invoices',
  '/app/settings': 'Settings',
  '/chats': 'Chat History',
};

const TopBar: React.FC<TopBarProps> = ({ intelligenceMode, onModeChange }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = React.useState(false);
  
  const pageTitle = PAGE_TITLES[location.pathname] || 'EKA-AI';
  const isOnChatPage = location.pathname === '/chat' || location.pathname.includes('/chat');
  
  const user = React.useMemo(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/', { replace: true });
  };

  const modeOptions: { mode: IntelligenceMode; label: string; icon: React.ReactNode; desc: string }[] = [
    { mode: 'FAST', label: 'Gemini Flash', icon: <Zap className="w-3.5 h-3.5" />, desc: 'Fast responses' },
    { mode: 'THINKING', label: 'Gemini Pro', icon: <Brain className="w-3.5 h-3.5" />, desc: 'Deep analysis' },
    { mode: 'DEEP_CONTEXT', label: 'RAG + Agent', icon: <Search className="w-3.5 h-3.5" />, desc: 'Context-aware' },
  ];

  const currentMode = modeOptions.find(m => m.mode === intelligenceMode) || modeOptions[0];

  return (
    <header className="h-14 min-h-[56px] border-b border-stone-200 bg-white flex items-center justify-between px-5 lg:px-6">
      {/* Left: Page Title */}
      <div className="flex items-center gap-3">
        <h1 className="text-[15px] font-semibold text-stone-800 font-sans" data-testid="page-title">
          {pageTitle}
        </h1>
      </div>

      {/* Right: Controls */}
      <div className="flex items-center gap-2">
        {/* Model Selector */}
        {isOnChatPage && (
          <div className="relative group">
            <button 
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-50 border border-stone-200 hover:border-stone-300 hover:bg-stone-100 transition-all"
              data-testid="mode-selector"
            >
              <span className={clsx(
                "flex items-center justify-center w-5 h-5 rounded-full",
                intelligenceMode === 'FAST' && "bg-amber-100 text-amber-600",
                intelligenceMode === 'THINKING' && "bg-violet-100 text-violet-600",
                intelligenceMode === 'DEEP_CONTEXT' && "bg-blue-100 text-blue-600"
              )}>
                {currentMode.icon}
              </span>
              <span className="text-xs font-medium text-stone-700 hidden sm:inline">
                {currentMode.label}
              </span>
              <ChevronDown className="w-3 h-3 text-stone-400" />
            </button>
            
            {/* Dropdown */}
            <div className="absolute right-0 top-full mt-1.5 w-52 py-1 bg-white border border-stone-200 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
              {modeOptions.map((option) => (
                <button
                  key={option.mode}
                  onClick={() => onModeChange(option.mode)}
                  data-testid={`mode-option-${option.mode}`}
                  className={clsx(
                    "w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-stone-50 transition-colors",
                    intelligenceMode === option.mode && "bg-amber-50"
                  )}
                >
                  <span className={clsx(
                    "flex items-center justify-center w-7 h-7 rounded-lg",
                    option.mode === 'FAST' && "bg-amber-100 text-amber-600",
                    option.mode === 'THINKING' && "bg-violet-100 text-violet-600",
                    option.mode === 'DEEP_CONTEXT' && "bg-blue-100 text-blue-600"
                  )}>
                    {option.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-stone-800">{option.label}</p>
                    <p className="text-[11px] text-stone-400">{option.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Help */}
        <button 
          onClick={() => (window as any).startProductTour?.()}
          className="p-2 rounded-lg text-stone-400 hover:bg-stone-50 hover:text-stone-600 transition-all"
          data-testid="tour-help-btn"
          title="Start product tour"
        >
          <HelpCircle className="w-[18px] h-[18px]" />
        </button>

        {/* Notifications */}
        <button 
          className="relative p-2 rounded-lg text-stone-400 hover:bg-stone-50 hover:text-stone-600 transition-all"
          data-testid="notifications-btn"
        >
          <Bell className="w-[18px] h-[18px]" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full ring-2 ring-white" />
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-stone-200 mx-1" />

        {/* User Menu */}
        <div className="relative">
          <button 
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1 rounded-lg hover:bg-stone-50 transition-all"
            data-testid="user-menu-btn"
          >
            <div className="w-8 h-8 rounded-full bg-amber-100 border border-amber-200 flex items-center justify-center">
              <span className="text-sm font-semibold text-amber-700">
                {user?.email?.[0]?.toUpperCase() || user?.name?.[0]?.toUpperCase() || 'U'}
              </span>
            </div>
            <ChevronDown className="w-3 h-3 text-stone-400 hidden sm:block" />
          </button>

          {showUserMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
              <div className="absolute right-0 top-full mt-1.5 w-56 py-1 bg-white border border-stone-200 rounded-xl shadow-lg z-50">
                <div className="px-3 py-2.5 border-b border-stone-100">
                  <p className="text-sm font-medium text-stone-800 truncate">
                    {user?.name || user?.email?.split('@')[0] || 'User'}
                  </p>
                  <p className="text-[11px] text-stone-400 truncate">{user?.email || ''}</p>
                </div>
                <button
                  onClick={() => { navigate('/app/settings'); setShowUserMenu(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-left text-stone-600 hover:bg-stone-50 transition-colors"
                  data-testid="settings-menu-item"
                >
                  <Settings className="w-4 h-4" />
                  <span className="text-sm">Settings</span>
                </button>
                <div className="border-t border-stone-100 mt-1 pt-1">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2 text-left text-red-500 hover:bg-red-50 transition-colors"
                    data-testid="logout-btn"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm">Sign out</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopBar;
