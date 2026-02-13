import React from 'react';
import { Plus, MessageSquare, Trash2, Settings, User, ChevronLeft, Menu } from 'lucide-react';
import { ChatSession } from './ClaudeLikeChat';

interface ChatSidebarProps {
  sessions: ChatSession[];
  currentSessionId: string;
  onSessionSelect: (id: string) => void;
  onNewSession: () => void;
  onDeleteSession: (id: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  sessions,
  currentSessionId,
  onSessionSelect,
  onNewSession,
  onDeleteSession,
  isOpen,
  onToggle,
}) => {
  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Mobile overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        onClick={onToggle}
      />

      {/* Sidebar */}
      <div className="w-64 bg-background border-r border-border flex flex-col fixed lg:relative inset-y-0 left-0 z-50 lg:z-0">
        {/* Header */}
        <div className="h-14 border-b border-border flex items-center justify-between px-3">
          <button
            onClick={onNewSession}
            className="flex-1 flex items-center gap-2 px-3 py-2 bg-background-alt hover:bg-[#2a2a2c] rounded-lg transition-colors text-sm font-medium"
          >
            <Plus size={16} />
            New Chat
          </button>
          <button
            onClick={onToggle}
            className="p-2 hover:bg-background-alt rounded-lg transition-colors ml-2 lg:hidden"
          >
            <ChevronLeft size={18} />
          </button>
        </div>

        {/* Chat Sessions */}
        <div className="flex-1 overflow-y-auto py-2 px-2">
          <div className="space-y-1">
            {sessions.map((session) => (
              <div
                key={session.id}
                className={`group relative rounded-lg transition-colors cursor-pointer ${
                  session.id === currentSessionId
                    ? 'bg-background-alt'
                    : 'hover:bg-background-alt/50'
                }`}
                onClick={() => onSessionSelect(session.id)}
              >
                <div className="flex items-start gap-2 p-3">
                  <MessageSquare size={16} className="mt-0.5 flex-shrink-0 text-text-secondary" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">
                      {session.title}
                    </p>
                    <p className="text-xs text-text-secondary mt-0.5">
                      {formatTime(session.updatedAt)}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSession(session.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-[#2a2a2c] rounded transition-all text-text-secondary hover:text-red-400"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border p-3">
          <div className="flex items-center gap-2 px-3 py-2 hover:bg-background-alt rounded-lg transition-colors cursor-pointer">
            <div className="w-8 h-8 bg-brand-orange rounded-full flex items-center justify-center">
              <User size={16} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary truncate">Workshop User</p>
              <p className="text-xs text-text-secondary">View profile</p>
            </div>
            <Settings size={16} className="text-text-secondary" />
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatSidebar;
