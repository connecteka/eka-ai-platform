import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard,
  Wrench, 
  ClipboardCheck,
  Truck,
  FileText,
  Settings,
  Plus,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Trash2,
  MoreHorizontal,
  Zap
} from 'lucide-react';
import { clsx } from 'clsx';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

interface ChatSession {
  id: string;
  session_id: string;
  title: string;
  updated_at: string;
}

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
  badge?: number | null;
}

const API_URL = import.meta.env.VITE_API_URL || '';

// Navigation items
const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/app/dashboard', badge: null },
  { icon: Wrench, label: 'Job Cards', path: '/app/job-cards', badge: 3 },
  { icon: ClipboardCheck, label: 'PDI Checklist', path: '/app/pdi', badge: null },
  { icon: Truck, label: 'Fleet Mgmt', path: '/app/fleet', badge: null },
  { icon: FileText, label: 'Invoices', path: '/app/invoices', badge: null },
];

// Helper to group chats by date
const groupChatsByDate = (chats: ChatSession[]): Record<string, ChatSession[]> => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const groups: Record<string, ChatSession[]> = {
    'Today': [],
    'Yesterday': [],
    'This Week': [],
    'Older': [],
  };

  chats.forEach(chat => {
    const chatDate = new Date(chat.updated_at);
    chatDate.setHours(0, 0, 0, 0);

    if (chatDate.getTime() === today.getTime()) {
      groups['Today'].push(chat);
    } else if (chatDate.getTime() === yesterday.getTime()) {
      groups['Yesterday'].push(chat);
    } else if (chatDate >= weekAgo) {
      groups['This Week'].push(chat);
    } else {
      groups['Older'].push(chat);
    }
  });

  return groups;
};

const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [hoveredSession, setHoveredSession] = useState<string | null>(null);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  // Get user from localStorage
  const user = React.useMemo(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }, []);

  // Fetch chat sessions
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await fetch(`${API_URL}/api/chat/sessions`);
        if (response.ok) {
          const data = await response.json();
          setSessions(data.sessions || []);
        }
      } catch (error) {
        console.error('Error fetching sessions:', error);
      }
    };

    fetchSessions();
    // Refresh every 30 seconds
    const interval = setInterval(fetchSessions, 30000);
    return () => clearInterval(interval);
  }, []);

  // Create new chat session
  const handleNewChat = async () => {
    try {
      const response = await fetch(`${API_URL}/api/chat/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'New Conversation' })
      });
      
      if (response.ok) {
        const data = await response.json();
        setActiveSessionId(data.session_id);
        navigate(`/chat?session=${data.session_id}`);
        // Refresh sessions list
        const refreshResponse = await fetch(`${API_URL}/api/chat/sessions`);
        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          setSessions(refreshData.sessions || []);
        }
      }
    } catch (error) {
      console.error('Error creating session:', error);
      navigate('/chat');
    }
  };

  // Delete chat session
  const handleDeleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await fetch(`${API_URL}/api/chat/sessions/${sessionId}`, {
        method: 'DELETE'
      });
      setSessions(prev => prev.filter(s => s.session_id !== sessionId));
      if (activeSessionId === sessionId) {
        setActiveSessionId(null);
        navigate('/chat');
      }
    } catch (error) {
      console.error('Error deleting session:', error);
    }
  };

  // Load a chat session
  const handleLoadSession = (session: ChatSession) => {
    setActiveSessionId(session.session_id);
    navigate(`/chat?session=${session.session_id}`);
  };

  const groupedSessions = groupChatsByDate(sessions);

  return (
    <aside 
      className={clsx(
        "h-full bg-background-alt border-r border-border flex flex-col transition-all duration-300 relative",
        collapsed ? "w-16" : "w-64"
      )}
      data-testid="sidebar"
    >
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-6 z-10 w-6 h-6 bg-surface border border-border rounded-full flex items-center justify-center hover:bg-background-alt transition-colors"
        data-testid="sidebar-toggle"
      >
        {collapsed ? (
          <ChevronRight className="w-3.5 h-3.5 text-text-secondary" />
        ) : (
          <ChevronLeft className="w-3.5 h-3.5 text-text-secondary" />
        )}
      </button>

      {/* Logo Section */}
      <div className={clsx(
        "p-4 border-b border-border",
        collapsed && "flex justify-center"
      )}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-orange flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-bold text-white">E</span>
          </div>
          {!collapsed && (
            <span className="text-lg font-bold text-text-primary">
              EKA<span className="text-brand-orange">AI</span>
            </span>
          )}
        </div>
      </div>

      {/* New Chat Button */}
      <div className={clsx("p-3", collapsed && "flex justify-center")}>
        <button
          onClick={handleNewChat}
          className={clsx(
            "flex items-center gap-2 py-2.5 rounded-lg bg-surface border border-border hover:border-brand-orange/50 transition-colors",
            collapsed ? "w-10 justify-center" : "w-full px-3"
          )}
          data-testid="new-chat-btn"
          title={collapsed ? "New Chat" : undefined}
        >
          <Plus className="w-4 h-4 text-text-secondary" />
          {!collapsed && (
            <span className="text-sm font-medium text-text-primary">New Chat</span>
          )}
        </button>
      </div>

      {/* Recent Chats Section */}
      {!collapsed && (
        <div className="flex-1 overflow-y-auto px-2 py-1">
          {Object.entries(groupedSessions).map(([group, chats]) => (
            chats.length > 0 && (
              <div key={group} className="mb-3">
                <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                  {group}
                </p>
                <div className="space-y-0.5">
                  {chats.slice(0, 10).map((session) => (
                    <div
                      key={session.session_id}
                      onClick={() => handleLoadSession(session)}
                      onMouseEnter={() => setHoveredSession(session.session_id)}
                      onMouseLeave={() => setHoveredSession(null)}
                      className={clsx(
                        "group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors",
                        activeSessionId === session.session_id
                          ? "bg-brand-orange/10 border-l-2 border-brand-orange"
                          : "hover:bg-surface"
                      )}
                      data-testid={`chat-session-${session.session_id}`}
                    >
                      <MessageSquare className="w-4 h-4 text-text-muted flex-shrink-0" />
                      <span className="flex-1 text-sm text-text-secondary truncate group-hover:text-text-primary">
                        {session.title || 'New Conversation'}
                      </span>
                      {hoveredSession === session.session_id && (
                        <button
                          onClick={(e) => handleDeleteSession(session.session_id, e)}
                          className="p-1 rounded hover:bg-red-500/20 transition-colors"
                          data-testid={`delete-session-${session.session_id}`}
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-400" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          ))}

          {sessions.length === 0 && (
            <div className="text-center py-6">
              <MessageSquare className="w-8 h-8 text-text-muted mx-auto mb-2 opacity-40" />
              <p className="text-xs text-text-muted">No conversations yet</p>
            </div>
          )}
        </div>
      )}

      {/* Navigation Section */}
      <nav className={clsx("p-2 border-t border-border", collapsed && "flex flex-col items-center")}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || 
            (item.path !== '/app/dashboard' && location.pathname.startsWith(item.path));
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              title={collapsed ? item.label : undefined}
              className={clsx(
                "flex items-center gap-3 rounded-lg transition-colors relative",
                collapsed ? "w-10 h-10 justify-center my-0.5" : "w-full px-3 py-2 my-0.5",
                isActive
                  ? "bg-brand-orange/10 text-brand-orange border-l-2 border-brand-orange"
                  : "text-text-secondary hover:bg-surface hover:text-text-primary"
              )}
              data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && (
                <>
                  <span className="text-sm font-medium">{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto px-1.5 py-0.5 text-[10px] font-bold bg-brand-orange text-white rounded-full">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
              {collapsed && item.badge && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 text-[9px] font-bold bg-brand-orange text-white rounded-full flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Upgrade CTA - Only when expanded */}
      {!collapsed && (
        <div className="p-3 border-t border-border">
          <div className="bg-gradient-to-br from-brand-orange/10 to-transparent border border-brand-orange/20 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1.5">
              <Zap className="w-4 h-4 text-brand-orange" />
              <span className="text-xs font-semibold text-text-primary">Pro Plan</span>
            </div>
            <p className="text-[10px] text-text-muted mb-2">Unlock unlimited AI diagnostics</p>
            <button 
              onClick={() => navigate('/pricing')}
              className="w-full py-1.5 text-xs font-medium text-brand-orange bg-brand-orange/10 rounded-lg hover:bg-brand-orange/20 transition-colors"
              data-testid="upgrade-btn"
            >
              Upgrade
            </button>
          </div>
        </div>
      )}

      {/* User Section */}
      <div className={clsx(
        "p-3 border-t border-border",
        collapsed && "flex flex-col items-center"
      )}>
        {/* Settings */}
        <button 
          onClick={() => navigate('/app/settings')}
          title={collapsed ? "Settings" : undefined}
          className={clsx(
            "flex items-center gap-3 rounded-lg text-text-secondary hover:bg-surface hover:text-text-primary transition-colors",
            collapsed ? "w-10 h-10 justify-center" : "w-full px-3 py-2"
          )}
          data-testid="nav-settings"
        >
          <Settings className="w-5 h-5" />
          {!collapsed && <span className="text-sm font-medium">Settings</span>}
        </button>

        {/* User Info */}
        {!collapsed && user && (
          <div className="flex items-center gap-3 px-3 py-2 mt-1">
            <div className="w-8 h-8 rounded-full bg-brand-orange/20 border border-brand-orange/30 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-medium text-brand-orange">
                {user.email?.[0]?.toUpperCase() || user.name?.[0]?.toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary truncate">
                {user.name || user.email?.split('@')[0] || 'User'}
              </p>
              <p className="text-[10px] text-text-muted truncate">{user.email || ''}</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
