import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, Zap, Brain, Search, ChevronDown, LogOut, Settings, HelpCircle } from 'lucide-react';
import { IntelligenceMode } from '../../types';
import { clsx } from 'clsx';

interface TopBarProps {
  intelligenceMode: IntelligenceMode;
  onModeChange: (mode: IntelligenceMode) => void;
}

// Page titles based on route
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
  
  // Get page title from route
  const pageTitle = PAGE_TITLES[location.pathname] || 'EKA-AI';
  
  // Check if on chat page to show mode selector
  const isOnChatPage = location.pathname === '/chat' || location.pathname.includes('/chat');
  
  // Get user from localStorage
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
    <header className="h-14 min-h-[56px] border-b border-border bg-background-alt flex items-center justify-between px-4 lg:px-6">
      {/* Left: Page Title */}
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-semibold text-text-primary" data-testid="page-title">
          {pageTitle}
        </h1>
      </div>

      {/* Right: Controls */}
      <div className="flex items-center gap-3">
        {/* Model Selector - Only on chat page */}
        {isOnChatPage && (
          <div className="relative group">
            <button 
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-border hover:border-brand-orange/50 transition-colors"
              data-testid="mode-selector"
            >
              <span className={clsx(
                "flex items-center justify-center w-5 h-5 rounded-full",
                intelligenceMode === 'FAST' && "bg-yellow-500/20 text-yellow-500",
                intelligenceMode === 'THINKING' && "bg-purple-500/20 text-purple-500",
                intelligenceMode === 'DEEP_CONTEXT' && "bg-blue-500/20 text-blue-500"
              )}>
                {currentMode.icon}
              </span>
              <span className="text-xs font-medium text-text-primary hidden sm:inline">
                {currentMode.label}
              </span>
              <ChevronDown className="w-3 h-3 text-text-secondary" />
            </button>
            
            {/* Dropdown */}
            <div className="absolute right-0 top-full mt-2 w-48 py-1 bg-surface border border-border rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
              {modeOptions.map((option) => (
                <button
                  key={option.mode}
                  onClick={() => onModeChange(option.mode)}
                  data-testid={`mode-option-${option.mode}`}
                  className={clsx(
                    "w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-background-alt transition-colors",
                    intelligenceMode === option.mode && "bg-brand-orange/10"
                  )}
                >
                  <span className={clsx(
                    "flex items-center justify-center w-6 h-6 rounded-full",
                    option.mode === 'FAST' && "bg-yellow-500/20 text-yellow-500",
                    option.mode === 'THINKING' && "bg-purple-500/20 text-purple-500",
                    option.mode === 'DEEP_CONTEXT' && "bg-blue-500/20 text-blue-500"
                  )}>
                    {option.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary">{option.label}</p>
                    <p className="text-xs text-text-secondary">{option.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Notifications */}
        <button 
          className="relative p-2 rounded-lg hover:bg-surface transition-colors"
          data-testid="notifications-btn"
        >
          <Bell className="w-5 h-5 text-text-secondary" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-orange rounded-full" />
        </button>

        {/* User Menu */}
        <div className="relative">
          <button 
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1 rounded-lg hover:bg-surface transition-colors"
            data-testid="user-menu-btn"
          >
            <div className="w-8 h-8 rounded-full bg-brand-orange/20 border border-brand-orange/30 flex items-center justify-center">
              <span className="text-sm font-medium text-brand-orange">
                {user?.email?.[0]?.toUpperCase() || user?.name?.[0]?.toUpperCase() || 'U'}
              </span>
            </div>
            <ChevronDown className="w-3 h-3 text-text-secondary hidden sm:block" />
          </button>

          {/* User Dropdown */}
          {showUserMenu && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowUserMenu(false)} 
              />
              <div className="absolute right-0 top-full mt-2 w-56 py-1 bg-surface border border-border rounded-lg shadow-xl z-50">
                <div className="px-3 py-2 border-b border-border">
                  <p className="text-sm font-medium text-text-primary truncate">
                    {user?.name || user?.email?.split('@')[0] || 'User'}
                  </p>
                  <p className="text-xs text-text-secondary truncate">{user?.email || ''}</p>
                </div>
                <button
                  onClick={() => { navigate('/app/settings'); setShowUserMenu(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-background-alt transition-colors"
                  data-testid="settings-menu-item"
                >
                  <Settings className="w-4 h-4 text-text-secondary" />
                  <span className="text-sm text-text-primary">Settings</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-red-500/10 transition-colors"
                  data-testid="logout-btn"
                >
                  <LogOut className="w-4 h-4 text-red-400" />
                  <span className="text-sm text-red-400">Sign out</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopBar;
