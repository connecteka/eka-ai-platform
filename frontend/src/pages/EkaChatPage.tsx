import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Wrench, ClipboardList, FileText, Truck, Sparkles, Lock } from 'lucide-react';
import { cn } from '../lib/utils';
import { geminiService } from '../services/geminiService';
import { useJobCard }    from '../hooks/useJobCard';
import ChatMessage       from '../components/ChatMessage';
import ChatInput         from '../components/ChatInput';
import type {
  Message, VehicleContext, JobStatus,
  IntelligenceMode, OperatingMode, JobCardLifecycleStatus
} from '../types';

/* Mascot URL */
const MASCOT_URL = "https://customer-assets.emergentagent.com/job_c888b364-381d-411f-9fb8-91dd9dd39bee/artifacts/0nsgjm67_MASCOT.jpg";

/* Usage limits - Free tier */
const FREE_DAILY_LIMIT = 10;

/* ─── Suggestion chips ───────────────────────────────────── */
const CHIPS = [
  { icon: Wrench,        label: 'Diagnose a vehicle issue',  prompt: 'I need to diagnose a vehicle issue. Help me identify the root cause step by step.' },
  { icon: ClipboardList, label: 'Create a new job card',     prompt: 'I want to create a new job card for a vehicle in the workshop.' },
  { icon: FileText,      label: 'Generate a GST invoice',    prompt: 'Help me generate a GST-compliant invoice for a completed job card.' },
  { icon: Truck,         label: 'Check MG fleet contract',   prompt: 'Review an MG fleet contract and show me current utilization status.', isPro: true },
] as const;

/* ─── Welcome (empty state) ─────────────────────────────── */
const Welcome: React.FC<{ onChip: (p: string) => void; usageCount: number }> = ({ onChip, usageCount }) => {
  const navigate = useNavigate();
  const remaining = FREE_DAILY_LIMIT - usageCount;
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[55vh] px-4 text-center">
      <div className="relative mb-6">
        <img 
          src={MASCOT_URL}
          alt="eka-ai"
          className="w-16 h-16 object-cover shadow-lg"
          style={{ borderRadius: '12px' }}
        />
        <div className="absolute -inset-1 rounded-xl border border-[#F98906]/30 animate-pulse" />
      </div>
      
      <h2 className="text-2xl font-semibold text-gray-800 mb-2" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
        How can I help with the garage today?
      </h2>
      <p className="text-gray-500 text-sm mb-6 max-w-md leading-relaxed">
        Diagnose vehicle issues, create job cards, generate GST invoices, or review fleet contracts.
      </p>
      
      {/* Usage indicator */}
      <div className="mb-8 flex items-center gap-3 px-4 py-2 rounded-full bg-gray-100 border border-gray-200">
        <div className="flex items-center gap-1.5">
          <div className="flex gap-0.5">
            {[...Array(FREE_DAILY_LIMIT)].map((_, i) => (
              <div 
                key={i}
                className={cn(
                  'w-1.5 h-4 rounded-full transition-colors',
                  i < usageCount ? 'bg-[#F98906]' : 'bg-gray-300'
                )}
              />
            ))}
          </div>
          <span className="text-xs text-gray-600 ml-2">
            {remaining > 0 ? (
              <>{remaining} queries left today</>
            ) : (
              <span className="text-red-500">Daily limit reached</span>
            )}
          </span>
        </div>
        <button 
          onClick={() => navigate('/pricing')}
          className="text-[10px] font-semibold text-[#F98906] hover:underline flex items-center gap-1"
        >
          <Sparkles className="w-3 h-3" />
          Upgrade
        </button>
      </div>
      
      <div className="grid grid-cols-2 gap-3 w-full max-w-lg">
        {CHIPS.map(c => {
          const Icon = c.icon;
          const isPro = 'isPro' in c && c.isPro;
          return (
            <button
              key={c.label}
              onClick={() => isPro ? navigate('/pricing') : onChip(c.prompt)}
              className={cn(
                "flex items-center gap-3 p-4 rounded-xl text-left transition-all group border",
                isPro 
                  ? "bg-gray-50 border-gray-200 hover:border-[#F98906]/40"
                  : "bg-white border-gray-200 hover:border-[#F98906]/40 hover:shadow-md"
              )}
            >
              <Icon className={cn("w-4 h-4 flex-shrink-0", isPro ? "text-gray-400" : "text-[#F98906]")} />
              <span className={cn(
                "text-[13px] leading-snug transition-colors",
                isPro ? "text-gray-400" : "text-gray-600 group-hover:text-gray-800"
              )}>
                {c.label}
              </span>
              {isPro && (
                <span className="ml-auto flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#F98906]/10 text-[#F98906] text-[9px] font-bold">
                  <Lock className="w-2.5 h-2.5" />
                  PRO
                </span>
              )}
            </button>
          );
        })}
      </div>
      
      <div className="mt-8 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F98906]/10 border border-[#F98906]/20">
        <span className="w-1.5 h-1.5 rounded-full bg-[#F98906] animate-pulse" />
        <span className="text-[11px] text-[#F98906] font-semibold font-mono tracking-widest uppercase">
          Automobile Domain Locked
        </span>
      </div>
    </div>
  );
};

/* ─── 3-bounce thinking dots ─────────────────────────────── */
const Thinking: React.FC = () => (
  <div className="flex gap-4 px-4 py-2">
    <img 
      src={MASCOT_URL}
      alt="eka-ai"
      className="w-8 h-8 object-cover flex-shrink-0"
      style={{ borderRadius: '6px' }}
    />
    <div className="flex items-center gap-1 pt-2.5">
      {[0, 110, 220].map(d => (
        <span
          key={d}
          className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"
          style={{ animationDelay: `${d}ms` }}
        />
      ))}
    </div>
  </div>
);

/* ─── Usage limit reached modal ────────────────────────── */
const UsageLimitModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const navigate = useNavigate();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-6 max-w-md mx-4 shadow-2xl">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#F98906]/10 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-[#F98906]" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            Daily Limit Reached
          </h3>
          <p className="text-gray-600 text-sm mb-6">
            You've used all {FREE_DAILY_LIMIT} free queries for today. Upgrade to Pro for unlimited AI diagnostics.
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              Maybe Later
            </button>
            <button
              onClick={() => navigate('/pricing')}
              className="flex-1 px-4 py-2.5 rounded-lg bg-[#F98906] text-white hover:bg-[#E07A00] transition-colors text-sm font-bold flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              View Plans
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── 9-state progress stepper (compact strip) ───────────── */
const PIPELINE: JobCardLifecycleStatus[] = [
  'CREATED', 'CONTEXT_VERIFIED', 'DIAGNOSED', 'ESTIMATED',
  'CUSTOMER_APPROVAL', 'IN_PROGRESS', 'PDI', 'INVOICED', 'CLOSED',
];
const S_LABELS: Record<JobCardLifecycleStatus, string> = {
  CREATED: 'Created', CONTEXT_VERIFIED: 'Context', DIAGNOSED: 'Diagnosed',
  ESTIMATED: 'Estimated', CUSTOMER_APPROVAL: 'Approval', IN_PROGRESS: 'In Progress',
  PDI: 'PDI', INVOICED: 'Invoiced', CLOSED: 'Closed',
};

const Stepper: React.FC<{ status: JobStatus }> = ({ status }) => {
  const idx = PIPELINE.indexOf(status as JobCardLifecycleStatus);
  if (idx <= 0) return null;
  return (
    <div className="flex items-center px-4 py-2 border-t border-gray-200 bg-gray-50 overflow-x-auto scrollbar-none">
      {PIPELINE.map((s, i) => {
        const done = i < idx, cur = i === idx;
        return (
          <React.Fragment key={s}>
            <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
              <div className={cn(
                'w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold transition-colors',
                done ? 'bg-emerald-500 text-white'
                     : cur  ? 'bg-[#F98906] text-white ring-2 ring-[#F98906]/25'
                            : 'bg-gray-200 text-gray-400',
              )}>
                {done ? '✓' : i + 1}
              </div>
              <span className={cn(
                'text-[9px] whitespace-nowrap font-mono transition-colors',
                cur  ? 'text-[#F98906]'
                     : done ? 'text-emerald-500' : 'text-gray-400',
              )}>
                {S_LABELS[s]}
              </span>
            </div>
            {i < PIPELINE.length - 1 && (
              <div className={cn('h-px flex-1 min-w-[6px] max-w-[20px] mx-0.5 transition-colors', done ? 'bg-emerald-500' : 'bg-gray-200')} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

/* ─── Vehicle context strip ──────────────────────────────── */
const VehicleBar: React.FC<{ ctx: VehicleContext; onClear: () => void }> = ({ ctx, onClear }) => {
  if (!ctx.brand) return null;
  return (
    <div className="flex items-center gap-3 px-4 py-2 border-t border-gray-200 bg-gray-50">
      <span className="text-gray-400 text-sm">🚗</span>
      <span className="text-gray-800 font-medium text-xs">
        {[ctx.brand, ctx.model, ctx.year].filter(Boolean).join(' ')}
      </span>
      {ctx.fuelType && (
        <span className="px-2 py-0.5 rounded-full bg-white border border-gray-200 text-[10px] text-gray-600 font-mono">
          {ctx.fuelType}
        </span>
      )}
      {ctx.registrationNumber && (
        <span className="px-2 py-0.5 rounded-full bg-[#F98906]/10 border border-[#F98906]/30 text-[10px] text-[#F98906] font-mono">
          {ctx.registrationNumber}
        </span>
      )}
      <button onClick={onClear} className="ml-auto text-gray-400 hover:text-gray-600 text-xs transition-colors">✕</button>
    </div>
  );
};

/* ─── Main page ──────────────────────────────────────────── */
const EMPTY_VEHICLE: VehicleContext = { vehicleType: '', brand: '', model: '', year: '', fuelType: '' };

const EkaChatPage: React.FC = () => {
  const [messages,  setMessages]  = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [vehicle,   setVehicle]   = useState<VehicleContext>(EMPTY_VEHICLE);
  const [status,    setStatus]    = useState<JobStatus>('CREATED');
  const [usageCount, setUsageCount] = useState(() => {
    const stored = localStorage.getItem('eka_daily_usage');
    if (stored) {
      const { count, date } = JSON.parse(stored);
      const today = new Date().toDateString();
      if (date === today) return count;
    }
    return 0;
  });
  const [showLimitModal, setShowLimitModal] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  /* Get intelligenceMode from AppShell via outlet context */
  const outlet = useOutletContext<{ intelligenceMode: IntelligenceMode } | null>();
  const mode: IntelligenceMode = outlet?.intelligenceMode ?? 'FAST';

  /* Job card hook for initialising cards when AI triggers it */
  const [, jobCardActions] = useJobCard();

  /* Auto-scroll to latest message */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  /* Update usage count in localStorage */
  const incrementUsage = useCallback(() => {
    const newCount = usageCount + 1;
    setUsageCount(newCount);
    localStorage.setItem('eka_daily_usage', JSON.stringify({
      count: newCount,
      date: new Date().toDateString()
    }));
  }, [usageCount]);

  /* Send handler */
  const send = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;

    // Check usage limit (mock - will be enforced on backend in production)
    if (usageCount >= FREE_DAILY_LIMIT) {
      setShowLimitModal(true);
      return;
    }

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);
    incrementUsage();

    /* Build Gemini history (excluding the just-added user message) */
    const history = messages.map(m => ({
      role:  m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }));

    try {
      const res = await geminiService.sendMessage(
        [...history, { role: 'user', parts: [{ text }] }],
        vehicle,
        status,
        mode,
        1 as OperatingMode,          // Workshop mode
      );

      const aiMsg: Message = {
        id:                crypto.randomUUID(),
        role:              'assistant',
        content:           res?.response_content?.visual_text ?? 'Processing…',
        timestamp:         new Date(),
        job_status_update: res?.job_status_update,
        diagnostic_data:   res?.diagnostic_data,
        estimate_data:     res?.estimate_data,
        pdi_checklist:     res?.pdi_checklist,
        mg_analysis:       res?.mg_analysis,
        service_history:   res?.service_history,
        recall_data:       res?.recall_data,
        visual_metrics:    res?.visual_metrics,
        grounding_links:   res?.grounding_links,
        intelligenceMode:  mode,
      };

      setMessages(prev => [...prev, aiMsg]);

      if (res?.job_status_update) setStatus(res.job_status_update);

      /* If AI signals a new vehicle, init the job card */
      if (res?.ui_triggers?.show_orange_border && !vehicle.brand) {
        const reg = text.match(/([A-Z]{2}[\s-]?\d{1,2}[\s-]?[A-Z]{0,2}[\s-]?\d{1,4})/i);
        jobCardActions.initializeJobCard({
          vehicleType: '4W',
          brand: '', model: '', year: '', fuelType: '',
          registrationNumber: reg ? reg[1].toUpperCase() : 'NEW-VEHICLE',
        });
      }
    } catch (err) {
      console.error('[EkaChatPage] send error:', err);
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: '⚠️ EKA-AI is temporarily unavailable. Please check your backend connection.',
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading, vehicle, status, mode, jobCardActions, usageCount, incrementUsage]);

  return (
    <div className="flex flex-col h-full bg-[#FAFAFA]" data-testid="eka-chat-page">

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto w-full px-4 py-6">

          {/* Welcome screen when no messages */}
          {messages.length === 0 && <Welcome onChip={send} usageCount={usageCount} />}

          {/* Message list — ChatMessage is imported unchanged */}
          <div className="space-y-6">
            {messages.map(m => (
              <ChatMessage
                key={m.id}
                message={m}
                onEstimateApprove={d => console.log('[EkaChatPage] estimate approved', d)}
                onPDIVerify={d       => console.log('[EkaChatPage] PDI verified', d)}
              />
            ))}
            {isLoading && <Thinking />}
            <div ref={bottomRef} />
          </div>
        </div>
      </div>

      {/* Bottom zone: stepper + vehicle bar + input */}
      <div className="flex-shrink-0">
        <Stepper status={status} />
        <VehicleBar ctx={vehicle} onClear={() => setVehicle(EMPTY_VEHICLE)} />
        <div className="border-t border-gray-200 bg-white px-4 pt-3 pb-5">
          <div className="max-w-3xl mx-auto w-full">
            {/* ChatInput is imported unchanged */}
            <ChatInput onSend={send} isLoading={isLoading} />
            <p className="text-center text-[10px] text-gray-400 mt-2 font-mono">
              eka-aı can make mistakes. Always verify diagnostics with a qualified technician.
            </p>
          </div>
        </div>
      </div>

      {/* Usage limit modal */}
      {showLimitModal && <UsageLimitModal onClose={() => setShowLimitModal(false)} />}
    </div>
  );
};

export default EkaChatPage;
