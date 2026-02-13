import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Image, Mic, Menu, Plus, MessageSquare, Trash2, Settings, User, ChevronLeft, ChevronRight } from 'lucide-react';
import MessageBubble from './MessageBubble';
import ChatSidebar from './ChatSidebar';
import { geminiService } from '../../services/geminiService';
import { useJobCard } from '../../hooks/useJobCard';
import { JobStatus, IntelligenceMode, OperatingMode } from '../../types';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
  attachments?: {
    type: 'file' | 'image' | 'voice';
    url: string;
    name: string;
  }[];
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

const ClaudeLikeChat: React.FC = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([
    {
      id: '1',
      title: 'New Chat',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  ]);
  const [currentSessionId, setCurrentSessionId] = useState('1');
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [mode, setMode] = useState<IntelligenceMode>('FAST');
  const [status, setStatus] = useState<JobStatus>('CREATED');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const [jobCardState, jobCardActions] = useJobCard();
  const [attachments, setAttachments] = useState<Array<{ type: 'file' | 'image' | 'voice'; url: string; name: string }>>([]);
  const [isRecording, setIsRecording] = useState(false);

  const currentSession = sessions.find(s => s.id === currentSessionId);
  const messages = currentSession?.messages || [];

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 200) + 'px';
    }
  }, [input]);

  const createNewSession = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
  };

  const deleteSession = (sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    if (currentSessionId === sessionId && sessions.length > 1) {
      const remainingSessions = sessions.filter(s => s.id !== sessionId);
      setCurrentSessionId(remainingSessions[0].id);
    }
  };

  const updateSessionTitle = (sessionId: string, firstMessage: string) => {
    setSessions(prev => prev.map(s =>
      s.id === sessionId
        ? { ...s, title: firstMessage.slice(0, 50) + (firstMessage.length > 50 ? '...' : '') }
        : s
    ));
  };

  const addMessage = (sessionId: string, message: Message) => {
    setSessions(prev => prev.map(s =>
      s.id === sessionId
        ? { ...s, messages: [...s.messages, message], updatedAt: new Date() }
        : s
    ));
  };

  const updateLastMessage = (sessionId: string, content: string) => {
    setSessions(prev => prev.map(s => {
      if (s.id === sessionId) {
        const updatedMessages = [...s.messages];
        if (updatedMessages.length > 0) {
          updatedMessages[updatedMessages.length - 1] = {
            ...updatedMessages[updatedMessages.length - 1],
            content,
            isStreaming: true,
          };
        }
        return { ...s, messages: updatedMessages };
      }
      return s;
    }));
  };

  const finalizeMessage = (sessionId: string) => {
    setSessions(prev => prev.map(s => {
      if (s.id === sessionId) {
        const updatedMessages = [...s.messages];
        if (updatedMessages.length > 0) {
          updatedMessages[updatedMessages.length - 1] = {
            ...updatedMessages[updatedMessages.length - 1],
            isStreaming: false,
          };
        }
        return { ...s, messages: updatedMessages };
      }
      return s;
    }));
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
      attachments: attachments.length > 0 ? [...attachments] : undefined,
    };

    // Update session title from first message
    if (messages.length === 0) {
      updateSessionTitle(currentSessionId, input.trim());
    }

    addMessage(currentSessionId, userMessage);
    setInput('');
    setAttachments([]);
    setIsLoading(true);

    try {
      // Convert messages to Gemini format
      const geminiMessages = [...messages, userMessage].map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      }));

      // Call AI Service
      const response = await geminiService.sendMessage(
        geminiMessages,
        jobCardState.vehicleData || undefined,
        status,
        mode,
        0 as OperatingMode
      );

      const aiText = response.response_content?.visual_text || "System processing...";

      // Add assistant message with streaming effect
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        isStreaming: true,
      };

      addMessage(currentSessionId, assistantMessage);

      // Simulate streaming effect
      let currentIndex = 0;
      const streamInterval = setInterval(() => {
        if (currentIndex < aiText.length) {
          const chunkSize = Math.floor(Math.random() * 3) + 1;
          currentIndex = Math.min(currentIndex + chunkSize, aiText.length);
          updateLastMessage(currentSessionId, aiText.slice(0, currentIndex));
        } else {
          clearInterval(streamInterval);
          finalizeMessage(currentSessionId);
        }
      }, 20);

      // Handle job card triggers
      if (response.ui_triggers?.show_orange_border && !jobCardState.jobCard) {
        const regMatch = input.match(/([A-Z]{2}[\s-]?\d{1,2}[\s-]?[A-Z]{0,2}[\s-]?\d{1,4})/i);
        jobCardActions.initializeJobCard({
          vehicleType: '4W',
          brand: '',
          model: '',
          year: '',
          fuelType: '',
          registrationNumber: regMatch ? regMatch[1].toUpperCase() : 'NEW-VEHICLE',
        });
      }

      if (response.job_status_update) {
        setStatus(response.job_status_update);
      }

    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm having trouble connecting to the AI service. Please check your connection and try again.",
        timestamp: new Date(),
      };
      addMessage(currentSessionId, errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const url = URL.createObjectURL(file);
      setAttachments(prev => [...prev, { type: 'file', url, name: file.name }]);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const url = URL.createObjectURL(file);
      setAttachments(prev => [...prev, { type: 'image', url, name: file.name }]);
    }
  };

  const handleVoiceInput = async () => {
    if (!isRecording) {
      // Start recording
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setIsRecording(true);
        // Note: Full voice recording implementation would require MediaRecorder API
        // This is a placeholder for the voice input functionality
        setTimeout(() => {
          stream.getTracks().forEach(track => track.stop());
          setIsRecording(false);
        }, 5000);
      } catch (error) {
        console.error('Error accessing microphone:', error);
      }
    } else {
      setIsRecording(false);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="flex h-screen bg-background text-text-primary overflow-hidden">
      {/* Sidebar */}
      <ChatSidebar
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSessionSelect={setCurrentSessionId}
        onNewSession={createNewSession}
        onDeleteSession={deleteSession}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative">
        {/* Header */}
        <div className="h-14 border-b border-border flex items-center justify-between px-4 bg-background/95 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center gap-3">
            {!isSidebarOpen && (
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 hover:bg-background-alt rounded-lg transition-colors"
              >
                <Menu size={20} />
              </button>
            )}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-brand-orange rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">E</span>
              </div>
              <div>
                <h1 className="text-sm font-semibold">EKA-AI Assistant</h1>
                <p className="text-xs text-text-secondary">Automobile Intelligence</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setMode(mode === 'FAST' ? 'THINKING' : 'FAST')}
              className="text-xs px-3 py-1.5 bg-background-alt hover:bg-[#2a2a2c] rounded-full border border-border transition-colors flex items-center gap-1.5"
            >
              {mode === 'FAST' ? '⚡ Fast Mode' : '🧠 Thinking Mode'}
            </button>
            <button className="p-2 hover:bg-background-alt rounded-lg transition-colors">
              <Settings size={18} />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full px-4">
              <div className="w-20 h-20 bg-brand-orange/10 rounded-2xl flex items-center justify-center mb-6">
                <div className="w-12 h-12 bg-brand-orange rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">E</span>
                </div>
              </div>
              <h2 className="text-2xl font-semibold mb-2">How can I help you today?</h2>
              <p className="text-text-secondary text-sm mb-8 text-center max-w-md">
                I'm your automobile intelligence assistant. Ask me about vehicle diagnostics,
                job cards, maintenance, or anything related to automotive repair.
              </p>

              {/* Suggested prompts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl w-full">
                {[
                  'Create a new job card for a vehicle',
                  'Diagnose engine warning light issues',
                  'Generate service estimate for brake replacement',
                  'Check vehicle maintenance schedule'
                ].map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => setInput(prompt)}
                    className="p-4 text-left bg-background-alt hover:bg-[#2a2a2c] rounded-xl border border-border transition-colors text-sm"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto w-full px-4 py-8">
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
              {isLoading && messages[messages.length - 1]?.role === 'user' && (
                <div className="flex gap-4 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-brand-orange flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-xs">E</span>
                  </div>
                  <div className="flex items-center gap-1 pt-2">
                    <span className="w-2 h-2 bg-text-secondary rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-text-secondary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                    <span className="w-2 h-2 bg-text-secondary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-border bg-background p-4">
          <div className="max-w-3xl mx-auto">
            {/* Attachments Preview */}
            {attachments.length > 0 && (
              <div className="flex gap-2 mb-2 flex-wrap">
                {attachments.map((attachment, index) => (
                  <div key={index} className="bg-background-alt border border-border rounded-lg px-3 py-2 flex items-center gap-2 text-xs">
                    {attachment.type === 'image' ? '🖼️' : attachment.type === 'file' ? '📎' : '🎤'}
                    <span className="text-text-primary">{attachment.name}</span>
                    <button
                      onClick={() => removeAttachment(index)}
                      className="text-text-secondary hover:text-red-400"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="bg-background-alt border border-border rounded-2xl p-2 focus-within:ring-2 focus-within:ring-brand-orange/50 transition-all">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about vehicle diagnostics, job cards, or automotive services..."
                data-testid="chat-input"
                className="w-full bg-transparent text-text-primary placeholder-text-secondary/50 px-3 py-2 outline-none resize-none text-sm leading-relaxed"
                rows={1}
                style={{ maxHeight: '200px' }}
              />
              <div className="flex justify-between items-center px-2 pt-1">
                <div className="flex gap-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 text-text-secondary hover:text-text-primary hover:bg-[#2a2a2c] rounded-lg transition-colors"
                    title="Attach file"
                  >
                    <Paperclip size={18} />
                  </button>
                  <button
                    onClick={() => imageInputRef.current?.click()}
                    className="p-2 text-text-secondary hover:text-text-primary hover:bg-[#2a2a2c] rounded-lg transition-colors"
                    title="Add image"
                  >
                    <Image size={18} />
                  </button>
                  <button
                    onClick={handleVoiceInput}
                    className={`p-2 rounded-lg transition-colors ${
                      isRecording
                        ? 'text-red-400 bg-red-400/10'
                        : 'text-text-secondary hover:text-text-primary hover:bg-[#2a2a2c]'
                    }`}
                    title={isRecording ? 'Recording...' : 'Voice input'}
                  >
                    <Mic size={18} />
                  </button>
                </div>
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  data-testid="send-message-btn"
                  className={`p-2 rounded-lg transition-all ${
                    input.trim() && !isLoading
                      ? 'bg-brand-orange hover:bg-[#e54d2d] text-white'
                      : 'bg-[#2a2a2c] text-text-secondary cursor-not-allowed'
                  }`}
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
            <p className="text-xs text-text-secondary/60 text-center mt-2">
              EKA-AI can make mistakes. Please verify critical diagnostics and repair information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClaudeLikeChat;
