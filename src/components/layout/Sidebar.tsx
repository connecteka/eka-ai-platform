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

const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/app/dashboard', badge: null },
  { icon: Wrench, label: 'Job Cards', path: '/app/job-cards', badge: 3 },
  { icon: ClipboardCheck, label: 'PDI Checklist', path: '/app/pdi', badge: null },
  { icon: Truck, label: 'Fleet Mgmt', path: '/app/fleet', badge: null },
  { icon: FileText, label: 'Invoices', path: '/app/invoices', badge: null },
];

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
    if (chatDate.getTime() === today.getTime()) groups['Today'].push(chat);
    else if (chatDate.getTime() === yesterday.getTime()) groups['Yesterday'].push(chat);
    else if (chatDate >= weekAgo) groups['This Week'].push(chat);
    else groups['Older'].push(chat);
  });

  return groups;
};

const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [hoveredSession, setHoveredSession] = useState<string | null>(null);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  const user = React.useMemo(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }, []);

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
    const interval = setInterval(fetchSessions, 30000);
    return () => clearInterval(interval);
  }, []);

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

  const handleDeleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await fetch(`${API_URL}/api/chat/sessions/${sessionId}`, { method: 'DELETE' });
      setSessions(prev => prev.filter(s => s.session_id !== sessionId));
      if (activeSessionId === sessionId) {
        setActiveSessionId(null);
        navigate('/chat');
      }
    } catch (error) {
      console.error('Error deleting session:', error);
    }
  };

  const handleLoadSession = (session: ChatSession) => {
    setActiveSessionId(session.session_id);
    navigate(`/chat?session=${session.session_id}`);
  };

  const groupedSessions = groupChatsByDate(sessions);

  return (
    <aside 
      className={clsx(
        "h-full bg-white border-r border-stone-200 flex flex-col transition-all duration-300 relative",
        collapsed ? "w-16" : "w-64"
      )}
      data-testid="sidebar"
    >
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-6 z-10 w-6 h-6 bg-white border border-stone-200 rounded-full flex items-center justify-center shadow-sm hover:shadow-md hover:border-stone-300 transition-all"
        data-testid="sidebar-toggle"
      >
        {collapsed ? (
          <ChevronRight className="w-3.5 h-3.5 text-stone-500" />
        ) : (
          <ChevronLeft className="w-3.5 h-3.5 text-stone-500" />
        )}
      </button>

      {/* Logo */}
      <div className={clsx(
        "h-14 flex items-center border-b border-stone-100 px-4",
        collapsed && "justify-center px-0"
      )}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-bold text-white font-sans">E</span>
          </div>
          {!collapsed && (
            <span className="text-base font-semibold text-stone-900 font-sans tracking-tight">
              EKA<span className="text-amber-600">AI</span>
            </span>
          )}
        </div>
      </div>

      {/* New Chat */}
      <div className={clsx("px-3 pt-3 pb-1", collapsed && "flex justify-center px-2")}>
        <button
          onClick={handleNewChat}
          className={clsx(
            "flex items-center gap-2 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 hover:border-stone-300 transition-all text-stone-700",
            collapsed ? "w-10 h-10 justify-center" : "w-full px-3 py-2"
          )}
          data-testid="new-chat-btn"
          title={collapsed ? "New Chat" : undefined}
        >
          <Plus className="w-4 h-4" />
          {!collapsed && (
            <span className="text-sm font-medium">New Chat</span>
          )}
        </button>
      </div>

      {/* AI Chat Nav Link */}
      {!collapsed && (
        <div className="px-2 pt-1">
          <button
            onClick={() => navigate('/chat')}
            className={clsx(
              "flex items-center gap-3 w-full px-3 py-2 rounded-lg transition-all text-sm font-medium",
              location.pathname === '/chat' || location.pathname.includes('/chat')
                ? "bg-amber-50 text-amber-700 border-l-[3px] border-amber-500"
                : "text-stone-600 hover:bg-stone-50 hover:text-stone-900"
            )}
            data-testid="nav-chat"
          >
            <MessageSquare className="w-[18px] h-[18px] flex-shrink-0" />
            <span>AI Chat</span>
          </button>
        </div>
      )}

      {/* Recent Chats */}
      {!collapsed && (
        <div className="flex-1 overflow-y-auto px-2 py-1">
          {Object.entries(groupedSessions).map(([group, chats]) => (
            chats.length > 0 && (
              <div key={group} className="mb-2">
                <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-stone-400">
                  {group}
                </p>
                <div className="flex flex-col gap-px">
                  {chats.slice(0, 10).map((session) => (
                    <div
                      key={session.session_id}
                      onClick={() => handleLoadSession(session)}
                      onMouseEnter={() => setHoveredSession(session.session_id)}
                      onMouseLeave={() => setHoveredSession(null)}
                      className={clsx(
                        "group flex items-center gap-2 px-3 py-1.5 rounded-md cursor-pointer transition-all",
                        activeSessionId === session.session_id
                          ? "bg-amber-50 text-amber-700"
                          : "text-stone-500 hover:bg-stone-50 hover:text-stone-700"
                      )}
                      data-testid={`chat-session-${session.session_id}`}
                    >
                      <MessageSquare className="w-3.5 h-3.5 flex-shrink-0 opacity-50" />
                      <span className="flex-1 text-[13px] truncate">
                        {session.title || 'New Conversation'}
                      </span>
                      {hoveredSession === session.session_id && (
                        <button
                          onClick={(e) => handleDeleteSession(session.session_id, e)}
                          className="p-1 rounded hover:bg-red-50 transition-colors"
                          data-testid={`delete-session-${session.session_id}`}
                        >
                          <Trash2 className="w-3 h-3 text-red-400" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          ))}

          {sessions.length === 0 && (
            <div className="text-center py-8">
              <MessageSquare className="w-6 h-6 text-stone-300 mx-auto mb-2" />
              <p className="text-xs text-stone-400">No conversations yet</p>
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <nav className={clsx("px-2 py-2 border-t border-stone-100", collapsed && "flex flex-col items-center")} data-testid="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || 
            (item.path !== '/app/dashboard' && location.pathname.startsWith(item.path));
          
          const testId = item.label === 'Job Cards' ? 'nav-job-cards' : 
                        item.label === 'Dashboard' ? 'nav-dashboard' :
                        `nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`;
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              title={collapsed ? item.label : undefined}
              className={clsx(
                "flex items-center gap-3 rounded-lg transition-all relative",
                collapsed ? "w-10 h-10 justify-center my-px" : "w-full px-3 py-2 my-px",
                isActive
                  ? "bg-amber-50 text-amber-700 font-medium"
                  : "text-stone-500 hover:bg-stone-50 hover:text-stone-800"
              )}
              data-testid={testId}
            >
              {isActive && !collapsed && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-amber-500 rounded-r-full" />
              )}
              <Icon className="w-[18px] h-[18px] flex-shrink-0" />
              {!collapsed && (
                <>
                  <span className="text-sm">{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto min-w-[18px] h-[18px] px-1 text-[10px] font-semibold bg-amber-500 text-white rounded-full flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
              {collapsed && item.badge && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 text-[9px] font-bold bg-amber-500 text-white rounded-full flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Upgrade CTA */}
      {!collapsed && (
        <div className="px-3 pb-2">
          <div className="bg-amber-50 border border-amber-200/60 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-semibold text-stone-800">Pro Plan</span>
            </div>
            <p className="text-[11px] text-stone-500 mb-2.5 leading-relaxed">Unlock unlimited AI diagnostics</p>
            <button 
              onClick={() => navigate('/pricing')}
              className="w-full py-1.5 text-xs font-medium text-white bg-amber-500 rounded-lg hover:bg-amber-600 transition-colors"
              data-testid="upgrade-btn"
            >
              Upgrade
            </button>
          </div>
        </div>
      )}

      {/* Settings + User */}
      <div className={clsx(
        "px-2 py-2 border-t border-stone-100",
        collapsed && "flex flex-col items-center"
      )}>
        <button 
          onClick={() => navigate('/app/settings')}
          title={collapsed ? "Settings" : undefined}
          className={clsx(
            "flex items-center gap-3 rounded-lg text-stone-500 hover:bg-stone-50 hover:text-stone-800 transition-all",
            collapsed ? "w-10 h-10 justify-center" : "w-full px-3 py-2"
          )}
          data-testid="nav-settings"
        >
          <Settings className="w-[18px] h-[18px]" />
          {!collapsed && <span className="text-sm font-medium">Settings</span>}
        </button>

        {!collapsed && user && (
          <div className="flex items-center gap-3 px-3 py-2 mt-1" data-testid="user-profile">
            <div className="w-8 h-8 rounded-full bg-amber-100 border border-amber-200 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-semibold text-amber-700">
                {user.email?.[0]?.toUpperCase() || user.name?.[0]?.toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-stone-800 truncate">
                {user.name || user.email?.split('@')[0] || 'User'}
              </p>
              <p className="text-[11px] text-stone-400 truncate">{user.email || ''}</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
