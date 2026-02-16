import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MessageSquare, MoreHorizontal, Plus, Trash2, Clock } from 'lucide-react';

interface ChatItem {
  id: string;
  title: string;
  date: Date;
  preview?: string;
}

// Helper to format relative dates
const formatRelativeDate = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`;
  return `${Math.floor(diffDays / 365)} year${Math.floor(diffDays / 365) > 1 ? 's' : ''} ago`;
};

// Group chats by date category
const getDateGroup = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return 'Previous 7 Days';
  if (diffDays < 30) return 'Previous 30 Days';
  return 'Older';
};

const ChatsPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [hoveredChat, setHoveredChat] = useState<string | null>(null);
  const navigate = useNavigate();

  // Mock Data with actual Date objects
  const chats: ChatItem[] = [
    { 
      id: '1', 
      title: "Fortuner brake diagnosis and repair estimate", 
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      preview: "The brake pads need replacement..."
    },
    { 
      id: '2', 
      title: "MG Contract Q1 2025 fleet analysis report", 
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      preview: "Based on the current fleet utilization..."
    },
    { 
      id: '3', 
      title: "PDI Checklist - New Swift delivery preparation", 
      date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      preview: "All 120 inspection points completed..."
    },
    { 
      id: '4', 
      title: "Vehicle loan procedural compliance audit", 
      date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      preview: "Documentation review completed..."
    },
    { 
      id: '5', 
      title: "सिविल कोर्ट में अनावश्यक देरी से बचाव", 
      date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      preview: "Legal consultation notes..."
    },
    { 
      id: '6', 
      title: "Engine noise diagnosis - Creta 2023", 
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      preview: "Customer reported rattling sound..."
    },
    { 
      id: '7', 
      title: "AC compressor replacement estimate", 
      date: new Date(Date.now() - 3 * 60 * 60 * 1000),
      preview: "Compressor failure confirmed..."
    },
  ];

  // Filter and group chats
  const filteredChats = useMemo(() => {
    return chats.filter(c => 
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.preview?.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const groupedChats = useMemo(() => {
    const groups: Record<string, ChatItem[]> = {};
    const order = ['Today', 'Yesterday', 'Previous 7 Days', 'Previous 30 Days', 'Older'];
    
    filteredChats.forEach(chat => {
      const group = getDateGroup(chat.date);
      if (!groups[group]) groups[group] = [];
      groups[group].push(chat);
    });

    // Sort within each group by date (newest first)
    Object.keys(groups).forEach(key => {
      groups[key].sort((a, b) => b.date.getTime() - a.date.getTime());
    });

    // Return in correct order
    return order.filter(key => groups[key]?.length).map(key => ({
      title: key,
      chats: groups[key]
    }));
  }, [filteredChats]);

  return (
    <div className="h-full overflow-auto bg-gradient-radial p-6 lg:p-8" data-testid="chats-page">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Chats</h1>
            <p className="text-sm text-gray-500 mt-1">
              {filteredChats.length} conversation{filteredChats.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button 
            onClick={() => navigate('/chat')} 
            className="bg-brand-orange hover:bg-brand-hover text-white px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
            data-testid="new-chat-btn"
          >
            <Plus className="w-4 h-4" />
            New chat
          </button>
        </div>

        {/* Search */}
        <div className="mb-6 relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search your chats..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-testid="chat-search-input"
            className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-brand-orange/50 focus:ring-1 focus:ring-brand-orange/30 transition-all"
          />
        </div>

        {/* Grouped Chat List */}
        <div className="space-y-6">
          {groupedChats.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-gray-600" />
              </div>
              <p className="text-gray-400 text-lg">No chats found</p>
              {search && (
                <p className="text-gray-500 text-sm mt-2">
                  Try adjusting your search term
                </p>
              )}
            </div>
          ) : (
            groupedChats.map((group) => (
              <div key={group.title} data-testid={`chat-group-${group.title.toLowerCase().replace(/\s+/g, '-')}`}>
                {/* Group Header */}
                <div className="flex items-center gap-3 mb-3">
                  <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {group.title}
                  </h2>
                  <div className="flex-1 h-px bg-white/5" />
                </div>

                {/* Chat Items */}
                <div className="space-y-1">
                  {group.chats.map((chat) => (
                    <div 
                      key={chat.id}
                      onClick={() => navigate('/chat')}
                      onMouseEnter={() => setHoveredChat(chat.id)}
                      onMouseLeave={() => setHoveredChat(null)}
                      className="group flex items-center justify-between p-4 rounded-xl hover:bg-white/5 cursor-pointer transition-all border border-transparent hover:border-white/10"
                      data-testid={`chat-item-${chat.id}`}
                    >
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 bg-brand-orange/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <MessageSquare className="w-5 h-5 text-brand-orange" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-white mb-1 truncate group-hover:text-brand-orange transition-colors">
                            {chat.title}
                          </h3>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            <span>{formatRelativeDate(chat.date)}</span>
                            {chat.preview && (
                              <>
                                <span className="text-gray-700">•</span>
                                <span className="truncate text-gray-400">{chat.preview}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className={`flex items-center gap-1 transition-opacity ${hoveredChat === chat.id ? 'opacity-100' : 'opacity-0'}`}>
                        <button 
                          onClick={(e) => { e.stopPropagation(); }}
                          className="p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                          title="More options"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); }}
                          className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Delete chat"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};

export default ChatsPage;
