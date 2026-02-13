import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Paperclip, Mic, Brain, Zap, Sparkles, Plus, MessageSquare, Trash2, ChevronLeft, ChevronRight, Upload, X, FileText, Image as ImageIcon } from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { useJobCard } from '../hooks/useJobCard';
import { JobStatus, IntelligenceMode, OperatingMode } from '../types';

const API_URL = import.meta.env.VITE_API_URL || '';

interface ChatSession {
  id: string;
  session_id: string;
  title: string;
  updated_at: string;
  messages: { role: string; content: string; timestamp: string }[];
}

const ChatPage = () => {
  const [messages, setMessages] = useState<{role: string, parts: {text: string}[]}[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setLoading] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [useStreaming, setUseStreaming] = useState(true);
  const [mode, setMode] = useState<IntelligenceMode>('FAST');
  const [status, setStatus] = useState<JobStatus>('CREATED');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [attachedFile, setAttachedFile] = useState<{ name: string; url: string } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Connect to Job Card system
  const [jobCardState, jobCardActions] = useJobCard();

  // Load chat sessions on mount
  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamingText]);

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

  const createNewSession = async () => {
    try {
      const response = await fetch(`${API_URL}/api/chat/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'New Conversation' })
      });
      
      if (response.ok) {
        const data = await response.json();
        setSessionId(data.session_id);
        setMessages([]);
        fetchSessions();
      }
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };

  const loadSession = async (session: ChatSession) => {
    setSessionId(session.session_id);
    
    // Convert stored messages to component format
    const loadedMessages = session.messages?.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.content }]
    })) || [];
    
    setMessages(loadedMessages);
  };

  const deleteSession = async (sessionIdToDelete: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await fetch(`${API_URL}/api/chat/sessions/${sessionIdToDelete}`, {
        method: 'DELETE'
      });
      
      if (sessionId === sessionIdToDelete) {
        setSessionId(null);
        setMessages([]);
      }
      fetchSessions();
    } catch (error) {
      console.error('Error deleting session:', error);
    }
  };

  const saveMessageToSession = async (role: string, content: string) => {
    if (!sessionId) return;
    
    try {
      await fetch(`${API_URL}/api/chat/sessions/${sessionId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, role, content })
      });
      fetchSessions(); // Refresh to get updated title
    } catch (error) {
      console.error('Error saving message:', error);
    }
  };

  // File upload handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', 'chat-attachment');

    try {
      const response = await fetch(`${API_URL}/api/files/upload`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setAttachedFile({ name: file.name, url: data.url });
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploadingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // SSE Streaming handler
  const handleStreamingSend = useCallback(async () => {
    if (!input.trim() && !attachedFile) return;

    // Create session if not exists
    if (!sessionId) {
      const response = await fetch(`${API_URL}/api/chat/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: input.slice(0, 50) })
      });
      if (response.ok) {
        const data = await response.json();
        setSessionId(data.session_id);
        fetchSessions();
      }
    }

    const messageText = attachedFile 
      ? `${input}\n\n[Attached: ${attachedFile.name}]`
      : input;

    const userMsg = { role: 'user', parts: [{ text: messageText }] };
    setMessages(prev => [...prev, userMsg]);
    const userInput = input;
    setInput('');
    setAttachedFile(null);
    setLoading(true);
    setStreamingText('');

    // Save user message to session
    if (sessionId) {
      saveMessageToSession('user', messageText);
    }

    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch(`${API_URL}/api/chat/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userInput,
          context: jobCardState.vehicleData || undefined,
          session_id: sessionId
        }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) throw new Error('Stream request failed');

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');

      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.type === 'start') {
                if (!sessionId) setSessionId(data.session_id);
              } else if (data.type === 'chunk') {
                fullText += data.content;
                setStreamingText(fullText);
              } else if (data.type === 'done') {
                setStreamingText('');
                setMessages(prev => [...prev, { role: 'model', parts: [{ text: data.full_text }] }]);
                
                // Save AI response to session
                if (sessionId) {
                  saveMessageToSession('model', data.full_text);
                }
                
                if (data.show_orange_border && !jobCardState.jobCard) {
                  const regMatch = userInput.match(/([A-Z]{2}[\s-]?\d{1,2}[\s-]?[A-Z]{0,2}[\s-]?\d{1,4})/i);
                  jobCardActions.initializeJobCard({
                    vehicleType: '4W',
                    brand: '',
                    model: '',
                    year: '',
                    fuelType: '',
                    registrationNumber: regMatch ? regMatch[1].toUpperCase() : 'NEW-VEHICLE',
                  });
                }
              } else if (data.type === 'error') {
                setMessages(prev => [...prev, { role: 'model', parts: [{ text: `Error: ${data.content}` }] }]);
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('Streaming error:', error);
        setMessages(prev => [...prev, { role: 'model', parts: [{ text: 'Connection error. Falling back to standard mode.' }] }]);
      }
    } finally {
      setLoading(false);
      setStreamingText('');
      abortControllerRef.current = null;
    }
  }, [input, jobCardState, sessionId, jobCardActions, attachedFile]);

  // Standard (non-streaming) handler
  const handleStandardSend = async () => {
    if (!input.trim()) return;

    const userMsg = { role: 'user', parts: [{ text: input }] };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await geminiService.sendMessage(
        [...messages, userMsg], 
        jobCardState.vehicleData || undefined,
        status,
        mode,
        0 as OperatingMode
      );
      
      const aiText = response.response_content?.visual_text || "System processing...";
      const aiMsg = { role: 'model', parts: [{ text: aiText }] };
      setMessages(prev => [...prev, aiMsg]);

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
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', parts: [{ text: "Connection error. Please check backend." }] }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = useStreaming ? handleStreamingSend : handleStandardSend;

  return (
    <div className="flex h-full">
      {/* Chat History Sidebar */}
      <div className={`bg-[#1A1A1C] border-r border-border transition-all duration-300 flex flex-col ${sidebarOpen ? 'w-64' : 'w-0'}`}>
        {sidebarOpen && (
          <>
            <div className="p-3 border-b border-border">
              <button
                onClick={createNewSession}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-brand-orange text-white rounded-lg hover:bg-brand-hover transition-colors text-sm font-medium"
                data-testid="new-chat-btn"
              >
                <Plus size={16} />
                New Chat
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {sessions.map(session => (
                <div
                  key={session.session_id}
                  onClick={() => loadSession(session)}
                  className={`group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                    sessionId === session.session_id 
                      ? 'bg-brand-orange/20 text-white' 
                      : 'text-text-secondary hover:bg-surface hover:text-white'
                  }`}
                  data-testid={`session-${session.session_id}`}
                >
                  <MessageSquare size={14} className="flex-shrink-0" />
                  <span className="flex-1 text-sm truncate">{session.title}</span>
                  <button
                    onClick={(e) => deleteSession(session.session_id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded transition-all"
                  >
                    <Trash2 size={12} className="text-red-400" />
                  </button>
                </div>
              ))}
              
              {sessions.length === 0 && (
                <div className="text-center py-8 text-text-muted text-sm">
                  No conversations yet
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Toggle Sidebar Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-surface border border-border p-1.5 rounded-r-lg hover:bg-[#333] transition-colors"
        style={{ left: sidebarOpen ? '256px' : '0' }}
      >
        {sidebarOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
      </button>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full">
        
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 scroll-smooth" ref={scrollRef}>
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center opacity-40 mt-20">
              <div className="w-16 h-16 bg-brand-orange rounded-2xl flex items-center justify-center mb-6">
                <span className="text-3xl font-bold text-white">E</span>
              </div>
              <h2 className="text-2xl font-semibold text-white mb-2">How can I help with the garage today?</h2>
              <p className="text-text-secondary">Create job cards, diagnose issues, or check inventory.</p>
            </div>
          )}
          
          {messages.map((msg, idx) => (
             <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : ''}`}>
               {msg.role === 'model' && (
                 <div className="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center text-xs font-bold text-brand-orange flex-shrink-0">
                   <Brain size={14} />
                 </div>
               )}
               <div className={`px-4 py-3 rounded-2xl max-w-[85%] leading-relaxed text-sm ${
                 msg.role === 'user' 
                   ? 'bg-surface text-text-primary border border-border' 
                   : 'text-text-primary'
               }`}>
                 {msg.parts[0].text.split('\n').map((line, i) => (
                   <p key={i} className="mb-1 last:mb-0">{line}</p>
                 ))}
               </div>
             </div>
          ))}

          {/* Streaming Response */}
          {streamingText && (
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center text-xs">
                <Sparkles size={14} className="text-brand-orange animate-pulse" />
              </div>
              <div className="text-text-primary text-sm max-w-[85%]">
                {streamingText.split('\n').map((line, i) => (
                  <p key={i} className="mb-1 last:mb-0">{line}</p>
                ))}
                <span className="inline-block w-2 h-4 bg-brand-orange animate-pulse ml-1"></span>
              </div>
            </div>
          )}

          {isLoading && !streamingText && (
             <div className="flex gap-4">
               <div className="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center text-xs animate-pulse">
                 <Brain size={14} className="text-brand-orange" />
               </div>
               <div className="text-text-secondary text-sm flex items-center gap-1">
                 <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                 <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '75ms' }}></span>
                 <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
               </div>
             </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 pb-6">
          {/* Mode Toggle */}
          <div className="flex items-center justify-between mb-2 px-1 max-w-3xl mx-auto">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setMode(mode === 'FAST' ? 'THINKING' : 'FAST')}
                className="flex items-center gap-2 text-xs font-medium text-text-secondary bg-surface px-3 py-1.5 rounded-full hover:bg-[#333] transition-colors border border-border"
              >
                {mode === 'FAST' ? '⚡ FAST (Gemini)' : '🧠 THINKING (Claude)'}
              </button>
              <button 
                onClick={() => setUseStreaming(!useStreaming)}
                className={`flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full transition-colors border ${
                  useStreaming 
                    ? 'bg-brand-orange/20 text-brand-orange border-brand-orange/30' 
                    : 'bg-surface text-text-secondary border-border hover:bg-[#333]'
                }`}
                title={useStreaming ? 'SSE Streaming enabled' : 'Standard mode'}
              >
                <Zap size={12} className={useStreaming ? 'animate-pulse' : ''} />
                {useStreaming ? 'Streaming' : 'Standard'}
              </button>
            </div>
          </div>

          {/* Attached File Preview */}
          {attachedFile && (
            <div className="mb-2 flex items-center gap-2 bg-surface px-3 py-2 rounded-lg border border-border max-w-3xl mx-auto">
              {attachedFile.name.match(/\.(jpg|jpeg|png|gif|webp)$/i) 
                ? <ImageIcon size={16} className="text-blue-400" />
                : <FileText size={16} className="text-orange-400" />
              }
              <span className="text-sm text-text-primary flex-1 truncate">{attachedFile.name}</span>
              <button onClick={() => setAttachedFile(null)} className="p-1 hover:bg-red-500/20 rounded">
                <X size={14} className="text-red-400" />
              </button>
            </div>
          )}

          <div className="bg-surface border border-border rounded-2xl shadow-lg p-2 focus-within:ring-1 focus-within:ring-brand-orange transition-all max-w-3xl mx-auto">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
              placeholder="Describe the vehicle issue or ask a question..."
              className="w-full bg-transparent text-white placeholder-text-muted px-3 py-2 outline-none resize-none min-h-[60px] max-h-[200px] text-sm"
              rows={1}
            />
            <div className="flex justify-between items-center px-2 pb-1">
              <div className="flex gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx,.txt"
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingFile}
                  className="p-2 text-text-muted hover:text-white transition-colors rounded-lg hover:bg-[#333] disabled:opacity-50"
                  title="Attach file"
                >
                  {uploadingFile ? (
                    <Upload size={18} className="animate-pulse" />
                  ) : (
                    <Paperclip size={18} />
                  )}
                </button>
                <button className="p-2 text-text-muted hover:text-white transition-colors rounded-lg hover:bg-[#333]">
                  <Mic size={18} />
                </button>
              </div>
              <button 
                onClick={handleSend}
                disabled={!input.trim() && !attachedFile}
                className={`p-2 rounded-lg transition-colors ${
                  (input.trim() || attachedFile) ? 'bg-brand-orange text-white hover:bg-brand-hover' : 'bg-[#333] text-text-muted'
                }`}
                data-testid="send-message-btn"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
          <div className="text-center mt-2">
             <p className="text-[10px] text-text-muted">EKA-AI can make mistakes. Please verify critical diagnostics.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
