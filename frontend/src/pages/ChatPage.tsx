import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useSearchParams, useOutletContext } from 'react-router-dom';
import { 
  Send, 
  Paperclip, 
  Mic, 
  MicOff,
  Brain, 
  Zap, 
  Sparkles, 
  Upload, 
  X, 
  FileText, 
  Image as ImageIcon,
  Car,
  Wrench,
  FileCheck,
  Truck,
  Loader2
} from 'lucide-react';
import { clsx } from 'clsx';
import { geminiService } from '../services/geminiService';
import { useJobCard } from '../hooks/useJobCard';
import { JobStatus, IntelligenceMode, OperatingMode, VehicleContext } from '../types';

const API_URL = import.meta.env.VITE_API_URL || '';

interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: Date;
}

interface OutletContextType {
  intelligenceMode: IntelligenceMode;
  setIntelligenceMode: (mode: IntelligenceMode) => void;
}

// Quick suggestion chips for empty state
const SUGGESTION_CHIPS = [
  { icon: Wrench, text: 'Diagnose a vehicle issue', color: 'text-red-400' },
  { icon: FileCheck, text: 'Create a new job card', color: 'text-blue-400' },
  { icon: FileText, text: 'Generate an invoice', color: 'text-green-400' },
  { icon: Truck, text: 'Check MG fleet contract', color: 'text-purple-400' },
];

const ChatPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const context = useOutletContext<OutletContextType>();
  const intelligenceMode = context?.intelligenceMode || 'FAST';
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(searchParams.get('session'));
  const [vehicleContext, setVehicleContext] = useState<VehicleContext>({
    vehicleType: '',
    brand: '',
    model: '',
    year: '',
    fuelType: '',
    registrationNumber: '',
  });
  const [attachedFile, setAttachedFile] = useState<{ name: string; url: string } | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Job card hook
  const [jobCardState, jobCardActions] = useJobCard();

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamingText]);

  // Load session from URL param
  useEffect(() => {
    const sessionParam = searchParams.get('session');
    if (sessionParam && sessionParam !== sessionId) {
      setSessionId(sessionParam);
      loadSession(sessionParam);
    }
  }, [searchParams]);

  // Load session messages
  const loadSession = async (sid: string) => {
    try {
      const response = await fetch(`${API_URL}/api/chat/sessions`);
      if (response.ok) {
        const data = await response.json();
        const session = data.sessions?.find((s: any) => s.session_id === sid);
        if (session?.messages) {
          setMessages(session.messages.map((m: any) => ({
            id: crypto.randomUUID(),
            role: m.role === 'user' ? 'user' : 'model',
            content: m.content,
            timestamp: new Date(m.timestamp),
          })));
        }
      }
    } catch (error) {
      console.error('Error loading session:', error);
    }
  };

  // Save message to session
  const saveMessageToSession = async (role: string, content: string) => {
    if (!sessionId) return;
    try {
      await fetch(`${API_URL}/api/chat/sessions/${sessionId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, role, content })
      });
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

  // Send message with SSE streaming
  const handleSend = useCallback(async () => {
    if ((!input.trim() && !attachedFile) || isLoading) return;

    // Create session if not exists
    let currentSessionId = sessionId;
    if (!currentSessionId) {
      try {
        const response = await fetch(`${API_URL}/api/chat/sessions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: input.slice(0, 50) })
        });
        if (response.ok) {
          const data = await response.json();
          currentSessionId = data.session_id;
          setSessionId(data.session_id);
        }
      } catch (error) {
        console.error('Error creating session:', error);
      }
    }

    const messageText = attachedFile 
      ? `${input}\n\n[Attached: ${attachedFile.name}]`
      : input;

    // Add user message
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    const userInput = input;
    setInput('');
    setAttachedFile(null);
    setIsLoading(true);
    setStreamingText('');

    // Save user message to session
    if (currentSessionId) {
      saveMessageToSession('user', messageText);
    }

    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch(`${API_URL}/api/chat/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userInput,
          context: vehicleContext.brand ? vehicleContext : undefined,
          session_id: currentSessionId
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
                const aiMessage: Message = {
                  id: crypto.randomUUID(),
                  role: 'model',
                  content: data.full_text,
                  timestamp: new Date(),
                };
                setMessages(prev => [...prev, aiMessage]);
                
                // Save AI response to session
                if (currentSessionId) {
                  saveMessageToSession('model', data.full_text);
                }
                
                // Check for vehicle context detection
                if (data.show_orange_border && !jobCardState.jobCard) {
                  const regMatch = userInput.match(/([A-Z]{2}[\s-]?\d{1,2}[\s-]?[A-Z]{0,2}[\s-]?\d{1,4})/i);
                  if (regMatch) {
                    setVehicleContext(prev => ({
                      ...prev,
                      registrationNumber: regMatch[1].toUpperCase(),
                    }));
                  }
                }
              } else if (data.type === 'error') {
                setMessages(prev => [...prev, {
                  id: crypto.randomUUID(),
                  role: 'model',
                  content: `Error: ${data.content}`,
                  timestamp: new Date(),
                }]);
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
        setMessages(prev => [...prev, {
          id: crypto.randomUUID(),
          role: 'model',
          content: '⚠️ Connection error. Please check your connection and try again.',
          timestamp: new Date(),
        }]);
      }
    } finally {
      setIsLoading(false);
      setStreamingText('');
      abortControllerRef.current = null;
    }
  }, [input, sessionId, vehicleContext, attachedFile, jobCardState.jobCard, isLoading]);

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Set input from suggestion chip
  const handleSuggestionClick = (text: string) => {
    setInput(text);
    inputRef.current?.focus();
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 md:px-6 py-6"
        data-testid="messages-area"
      >
        <div className="max-w-3xl mx-auto">
          {/* Welcome Screen - Empty State */}
          {messages.length === 0 && !streamingText && (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
              <div className="w-16 h-16 bg-brand-orange rounded-2xl flex items-center justify-center mb-6">
                <span className="text-3xl font-bold text-white font-heading">E</span>
              </div>
              <h2 className="text-2xl font-semibold text-text-primary mb-3">
                How can I help with the garage today?
              </h2>
              <p className="text-text-secondary text-sm mb-8 max-w-md">
                Create job cards, diagnose vehicle issues, or check fleet contracts.
              </p>
              
              {/* Suggestion Chips */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
                {SUGGESTION_CHIPS.map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestionClick(chip.text)}
                    className="flex items-center gap-3 p-4 bg-background-alt border border-border rounded-xl text-left hover:border-brand-orange/50 transition-colors group"
                    data-testid={`suggestion-chip-${idx}`}
                  >
                    <chip.icon className={clsx("w-5 h-5", chip.color)} />
                    <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">
                      {chip.text}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="space-y-6">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={clsx(
                  "flex gap-4",
                  msg.role === 'user' ? "justify-end" : "justify-start"
                )}
              >
                {/* AI Avatar */}
                {msg.role === 'model' && (
                  <div className="w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-brand-orange">EKA</span>
                  </div>
                )}
                
                {/* Message Content */}
                <div className={clsx(
                  "max-w-[85%] rounded-2xl px-4 py-3",
                  msg.role === 'user' 
                    ? "bg-brand-orange/10 border border-brand-orange/20 text-text-primary" 
                    : "text-text-primary"
                )}>
                  {msg.content.split('\n').map((line, i) => (
                    <p key={i} className="text-sm leading-relaxed mb-1 last:mb-0">
                      {line}
                    </p>
                  ))}
                </div>

                {/* User Badge */}
                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-lg bg-brand-orange/20 border border-brand-orange/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-brand-orange">U</span>
                  </div>
                )}
              </div>
            ))}

            {/* Streaming Response */}
            {streamingText && (
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-brand-orange animate-pulse" />
                </div>
                <div className="text-text-primary max-w-[85%]">
                  {streamingText.split('\n').map((line, i) => (
                    <p key={i} className="text-sm leading-relaxed mb-1 last:mb-0">{line}</p>
                  ))}
                  <span className="inline-block w-2 h-4 bg-brand-orange animate-pulse ml-1 rounded-sm" />
                </div>
              </div>
            )}

            {/* Loading Indicator */}
            {isLoading && !streamingText && (
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center flex-shrink-0 animate-pulse">
                  <Brain className="w-4 h-4 text-brand-orange" />
                </div>
                <div className="flex items-center gap-1 pt-2">
                  {[0, 75, 150].map((delay) => (
                    <span 
                      key={delay}
                      className="w-2 h-2 bg-text-muted rounded-full animate-bounce"
                      style={{ animationDelay: `${delay}ms` }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Vehicle Context Strip */}
      {vehicleContext.brand && (
        <div className="px-4 py-2 border-t border-border bg-background-alt">
          <div className="max-w-3xl mx-auto flex items-center gap-3 text-sm">
            <Car className="w-4 h-4 text-text-secondary" />
            <span className="text-text-primary font-medium">
              {vehicleContext.brand} {vehicleContext.model} {vehicleContext.year}
            </span>
            {vehicleContext.registrationNumber && (
              <span className="text-text-secondary font-mono text-xs bg-surface px-2 py-0.5 rounded border border-border">
                {vehicleContext.registrationNumber}
              </span>
            )}
            <button 
              onClick={() => setVehicleContext({ vehicleType: '', brand: '', model: '', year: '', fuelType: '' })}
              className="ml-auto text-text-muted hover:text-text-primary transition-colors"
              data-testid="clear-vehicle-context"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 pb-6 border-t border-border bg-background">
        <div className="max-w-3xl mx-auto">
          {/* Attached File Preview */}
          {attachedFile && (
            <div className="mb-3 flex items-center gap-2 bg-surface px-3 py-2 rounded-lg border border-border">
              {attachedFile.name.match(/\.(jpg|jpeg|png|gif|webp)$/i) 
                ? <ImageIcon className="w-4 h-4 text-blue-400" />
                : <FileText className="w-4 h-4 text-brand-orange" />
              }
              <span className="text-sm text-text-primary flex-1 truncate">{attachedFile.name}</span>
              <button 
                onClick={() => setAttachedFile(null)} 
                className="p-1 hover:bg-red-500/20 rounded transition-colors"
              >
                <X className="w-4 h-4 text-red-400" />
              </button>
            </div>
          )}

          {/* Input Container */}
          <div className="bg-surface border border-border rounded-2xl focus-within:border-brand-orange/50 transition-colors">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe the vehicle issue or ask a question..."
              className="w-full bg-transparent text-text-primary placeholder-text-muted px-4 py-3 outline-none resize-none min-h-[60px] max-h-[200px] text-sm"
              rows={1}
              data-testid="chat-input"
            />
            
            {/* Input Actions */}
            <div className="flex justify-between items-center px-3 pb-2">
              <div className="flex gap-1">
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
                  className="p-2 text-text-muted hover:text-text-primary hover:bg-background-alt rounded-lg transition-colors disabled:opacity-50"
                  title="Attach file"
                  data-testid="attach-file-btn"
                >
                  {uploadingFile ? (
                    <Upload className="w-5 h-5 animate-pulse" />
                  ) : (
                    <Paperclip className="w-5 h-5" />
                  )}
                </button>
                <button 
                  className="p-2 text-text-muted hover:text-text-primary hover:bg-background-alt rounded-lg transition-colors"
                  title="Voice input"
                  data-testid="voice-input-btn"
                >
                  <Mic className="w-5 h-5" />
                </button>
              </div>
              
              <button 
                onClick={handleSend}
                disabled={(!input.trim() && !attachedFile) || isLoading}
                className={clsx(
                  "p-2 rounded-lg transition-colors",
                  (input.trim() || attachedFile) && !isLoading
                    ? "bg-brand-orange text-white hover:bg-brand-hover" 
                    : "bg-surface text-text-muted cursor-not-allowed"
                )}
                data-testid="send-message-btn"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* Disclaimer */}
          <p className="text-center mt-2 text-[10px] text-text-muted">
            EKA-AI can make mistakes. Please verify critical diagnostics.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
