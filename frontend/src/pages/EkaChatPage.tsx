import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Wrench, ClipboardList, FileText, Truck } from 'lucide-react';
import { cn } from '../lib/utils';
import { geminiService } from '../services/geminiService';
import { useJobCard }    from '../hooks/useJobCard';
import ChatMessage       from '../components/ChatMessage';
import ChatInput         from '../components/ChatInput';
import type {
  Message, VehicleContext, JobStatus,
  IntelligenceMode, OperatingMode, JobCardLifecycleStatus
} from '../types';

/* ─── Suggestion chips ───────────────────────────────────── */
const CHIPS = [
  { icon: Wrench,        label: 'Diagnose a vehicle issue',  prompt: 'I need to diagnose a vehicle issue. Help me identify the root cause step by step.' },
  { icon: ClipboardList, label: 'Create a new job card',     prompt: 'I want to create a new job card for a vehicle in the workshop.' },
  { icon: FileText,      label: 'Generate a GST invoice',    prompt: 'Help me generate a GST-compliant invoice for a completed job card.' },
  { icon: Truck,         label: 'Check MG fleet contract',   prompt: 'Review an MG fleet contract and show me current utilization status.' },
] as const;

/* ─── Welcome (empty state) ─────────────────────────────── */
const Welcome: React.FC<{ onChip: (p: string) => void }> = ({ onChip }) => (
  <div className="flex flex-col items-center justify-center min-h-[55vh] px-4 text-center">
    <div className="relative mb-6">
      <div className="w-16 h-16 rounded-2xl bg-brand-orange flex items-center justify-center shadow-lg shadow-brand-orange/20">
        <span className="text-white font-bold text-2xl font-heading">E</span>
      </div>
      <div className="absolute -inset-1 rounded-2xl border border-brand-orange/20 animate-pulse" />
    </div>
    <h2 className="text-[22px] font-semibold text-text-primary font-heading mb-2">
      How can I help with the garage today?
    </h2>
    <p className="text-text-secondary text-sm mb-8 max-w-sm leading-relaxed">
      Diagnose vehicle issues, create job cards, generate GST invoices, or review fleet contracts.
    </p>
    <div className="grid grid-cols-2 gap-3 w-full max-w-lg">
      {CHIPS.map(c => {
        const Icon = c.icon;
        return (
          <button
            key={c.label}
            onClick={() => onChip(c.prompt)}
            className="flex items-center gap-3 p-4 card rounded-xl text-left hover:border-brand-orange/40 hover:bg-[#202022] transition-all group"
          >
            <Icon className="w-4 h-4 text-brand-orange flex-shrink-0" />
            <span className="text-[13px] text-text-secondary group-hover:text-text-primary transition-colors leading-snug">
              {c.label}
            </span>
          </button>
        );
      })}
    </div>
    <div className="mt-8 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-orange/10 border border-brand-orange/20">
      <span className="w-1.5 h-1.5 rounded-full bg-brand-orange animate-pulse" />
      <span className="text-[11px] text-brand-orange font-semibold font-mono tracking-widest uppercase">
        Automobile Domain Locked
      </span>
    </div>
  </div>
);

/* ─── 3-bounce thinking dots ─────────────────────────────── */
const Thinking: React.FC = () => (
  <div className="flex gap-4 px-4 py-2">
    <div className="w-8 h-8 rounded border border-border bg-background-alt flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-brand-orange font-mono">
      EKA
    </div>
    <div className="flex items-center gap-1 pt-2.5">
      {[0, 110, 220].map(d => (
        <span
          key={d}
          className="w-2 h-2 bg-[#444] rounded-full animate-bounce"
          style={{ animationDelay: `${d}ms` }}
        />
      ))}
    </div>
  </div>
);

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
    <div className="flex items-center px-4 py-2 border-t border-border bg-background overflow-x-auto scrollbar-none">
      {PIPELINE.map((s, i) => {
        const done = i < idx, cur = i === idx;
        return (
          <React.Fragment key={s}>
            <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
              <div className={cn(
                'w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold transition-colors',
                done ? 'bg-emerald-500 text-white'
                     : cur  ? 'bg-brand-orange text-white ring-2 ring-brand-orange/25'
                            : 'bg-background-alt border border-border text-[#3A3A3A]',
              )}>
                {done ? '✓' : i + 1}
              </div>
              <span className={cn(
                'text-[9px] whitespace-nowrap font-mono transition-colors',
                cur  ? 'text-brand-orange'
                     : done ? 'text-emerald-500' : 'text-[#3A3A3A]',
              )}>
                {S_LABELS[s]}
              </span>
            </div>
            {i < PIPELINE.length - 1 && (
              <div className={cn('h-px flex-1 min-w-[6px] max-w-[20px] mx-0.5 transition-colors', done ? 'bg-emerald-500' : 'bg-border')} />
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
    <div className="flex items-center gap-3 px-4 py-2 border-t border-border bg-background-alt">
      <span className="text-[#444] text-sm">🚗</span>
      <span className="text-text-primary font-medium text-xs">
        {[ctx.brand, ctx.model, ctx.year].filter(Boolean).join(' ')}
      </span>
      {ctx.fuelType && (
        <span className="px-2 py-0.5 rounded-full bg-background border border-border text-[10px] text-text-secondary font-mono">
          {ctx.fuelType}
        </span>
      )}
      {ctx.registrationNumber && (
        <span className="px-2 py-0.5 rounded-full bg-background border border-brand-orange/30 text-[10px] text-brand-orange font-mono">
          {ctx.registrationNumber}
        </span>
      )}
      <button onClick={onClear} className="ml-auto text-[#3A3A3A] hover:text-text-secondary text-xs transition-colors">✕</button>
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

  /* Send handler */
  const send = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

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
  }, [messages, isLoading, vehicle, status, mode, jobCardActions]);

  return (
    <div className="flex flex-col h-full bg-background">

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto w-full px-4 py-6">

          {/* Welcome screen when no messages */}
          {messages.length === 0 && <Welcome onChip={send} />}

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
        <div className="border-t border-border bg-background px-4 pt-3 pb-5">
          <div className="max-w-3xl mx-auto w-full">
            {/* ChatInput is imported unchanged */}
            <ChatInput onSend={send} isLoading={isLoading} />
            <p className="text-center text-[10px] text-[#2C2C2C] mt-2 font-mono">
              EKA-AI can make mistakes. Always verify diagnostics with a qualified technician.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EkaChatPage;
