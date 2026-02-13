import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X, Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Maximize2, Check } from 'lucide-react';

interface DemoStep {
  title: string;
  description: string;
  action?: string;
  highlight?: string;
  screenshot?: string;
  hotspot?: { x: number; y: number; label: string };
}

interface FeatureDemo {
  id: string;
  title: string;
  subtitle: string;
  duration: string;
  steps: DemoStep[];
  color: string;
  hasRealRecording: boolean;
}

const FEATURE_DEMOS: Record<string, FeatureDemo> = {
  pdi: {
    id: 'pdi',
    title: 'PDI Process Demo',
    subtitle: 'Pre-Delivery Inspection Workflow',
    duration: '2:30',
    color: '#10B981',
    hasRealRecording: true,
    steps: [
      { title: 'Access PDI Tools', description: 'Open the Artifacts page to access PDI checklist tools', action: 'Navigate', highlight: 'Artifacts', screenshot: '/recordings/pdi-1.png' },
      { title: 'Select PDI Template', description: 'Choose PDI Checklist Generator from available tools', action: 'Select', highlight: 'Checklist', screenshot: '/recordings/pdi-1.png', hotspot: { x: 50, y: 50, label: 'PDI Checklist' } },
      { title: 'Vehicle Details', description: 'Enter registration number - system auto-fetches vehicle data', action: 'Type', highlight: 'MH01AB1234', screenshot: '/recordings/pdi-1.png' },
      { title: 'Exterior Check', description: 'Complete 45-point exterior inspection with photo capture', action: 'Checklist', highlight: '45 items', screenshot: '/recordings/pdi-1.png' },
      { title: 'Interior Check', description: 'Verify dashboard, seats, AC, and electronics', action: 'Checklist', highlight: '35 items', screenshot: '/recordings/pdi-1.png' },
      { title: 'Engine Bay', description: 'Check fluid levels, battery, and engine components', action: 'Checklist', highlight: '25 items', screenshot: '/recordings/pdi-1.png' },
      { title: 'Digital Signature', description: 'Customer signs on tablet for delivery acceptance', action: 'Sign', highlight: 'Touch signature', screenshot: '/recordings/pdi-1.png' },
      { title: 'Generate Report', description: 'Instant PDF report with photos sent to customer', action: 'Export', highlight: 'PDF + Email', screenshot: '/recordings/pdi-1.png' },
    ]
  },
  mg: {
    id: 'mg',
    title: 'MG Model Demo',
    subtitle: 'Maintenance Guarantee Setup',
    duration: '1:45',
    color: '#3B82F6',
    hasRealRecording: true,
    steps: [
      { title: 'Access MG Fleet', description: 'Open the MG Fleet management dashboard', action: 'Navigate', highlight: 'MG Fleet', screenshot: '/recordings/mg-1.png' },
      { title: 'View Contracts', description: 'See all active MG contracts and their status', action: 'View', highlight: 'Active Contracts', screenshot: '/recordings/mg-1.png' },
      { title: 'Create Contract', description: 'Click "New Contract" to start a new MG subscription', action: 'Click', highlight: '+ New Contract', screenshot: '/recordings/mg-1.png', hotspot: { x: 92, y: 12, label: 'New Contract' } },
      { title: 'Fleet Details', description: 'Enter fleet name and contract period', action: 'Form', highlight: 'Fleet Name', screenshot: '/recordings/mg-2.png', hotspot: { x: 50, y: 20, label: 'Enter Details' } },
      { title: 'Set KM Limit', description: 'Define assured KM per year and excess rates', action: 'Configure', highlight: 'KM Limits', screenshot: '/recordings/mg-2.png', hotspot: { x: 50, y: 45, label: 'Set Limits' } },
      { title: 'Set Billing', description: 'Choose billing cycle and rate per KM', action: 'Configure', highlight: 'Billing Cycle', screenshot: '/recordings/mg-2.png', hotspot: { x: 50, y: 65, label: 'Set Billing' } },
      { title: 'Generate Contract', description: 'Create the MG contract with all terms', action: 'Generate', highlight: 'Digital contract', screenshot: '/recordings/mg-2.png', hotspot: { x: 75, y: 85, label: 'Create Contract' } },
    ]
  },
  jobcard: {
    id: 'jobcard',
    title: 'Job Card → Invoice',
    subtitle: 'Complete Service Workflow',
    duration: '3:00',
    color: '#F97316',
    hasRealRecording: true,
    steps: [
      { title: 'View Job Cards', description: 'Access the job cards dashboard with all active jobs', action: 'Open', highlight: 'Dashboard', screenshot: '/recordings/jobcard-1.png' },
      { title: 'Create Job Card', description: 'Click "New Job Card" to start a new service order', action: 'Click', highlight: '+ New Job', screenshot: '/recordings/jobcard-1.png', hotspot: { x: 92, y: 12, label: 'Click Here' } },
      { title: 'Enter Details', description: 'Fill registration number, customer info, and symptoms', action: 'Form', highlight: 'Auto-fill', screenshot: '/recordings/jobcard-2.png', hotspot: { x: 50, y: 25, label: 'Enter Registration' } },
      { title: 'Add Symptoms', description: 'Record customer complaints and observations', action: 'Type', highlight: 'Voice input', screenshot: '/recordings/jobcard-2.png', hotspot: { x: 50, y: 60, label: 'Add Symptoms' } },
      { title: 'AI Diagnosis', description: 'EKA-AI suggests probable issues and parts', action: 'AI', highlight: 'Smart suggestions', screenshot: '/recordings/jobcard-2.png' },
      { title: 'Create Estimate', description: 'Build estimate with labor and parts', action: 'Build', highlight: 'Real-time pricing', screenshot: '/recordings/jobcard-2.png' },
      { title: 'Customer Approval', description: 'Send WhatsApp link for customer approval', action: 'Send', highlight: 'One-tap approve', screenshot: '/recordings/jobcard-1.png' },
      { title: 'Track Progress', description: 'Update status as work progresses', action: 'Update', highlight: 'Live tracking', screenshot: '/recordings/jobcard-1.png' },
      { title: 'Generate Invoice', description: 'Convert to GST invoice with one click', action: 'Convert', highlight: 'Auto GST', screenshot: '/recordings/invoice-1.png' },
      { title: 'Payment & Delivery', description: 'Collect payment and complete delivery', action: 'Complete', highlight: 'UPI/Card/Cash', screenshot: '/recordings/invoice-1.png' },
    ]
  },
  chat: {
    id: 'chat',
    title: 'AI Chat Assistant',
    subtitle: 'EKA-AI Powered Diagnostics',
    duration: '2:00',
    color: '#A855F7',
    hasRealRecording: true,
    steps: [
      { title: 'Open Chat', description: 'Access EKA-AI chat from any screen in the app', action: 'Open', highlight: 'Always available', screenshot: '/recordings/chat-1.png', hotspot: { x: 50, y: 85, label: 'Type Here' } },
      { title: 'Describe Issue', description: 'Type your vehicle problem - "Engine warning light on"', action: 'Type', highlight: 'Natural language', screenshot: '/recordings/chat-2.png', hotspot: { x: 85, y: 85, label: 'Send' } },
      { title: 'AI Response', description: 'EKA-AI provides instant diagnostic analysis', action: 'AI', highlight: 'Smart analysis', screenshot: '/recordings/chat-3.png' },
      { title: 'Get Diagnosis', description: 'View probable causes ranked by likelihood', action: 'Results', highlight: '95% accuracy', screenshot: '/recordings/chat-3.png' },
      { title: 'Cost Estimate', description: 'Instant repair cost estimate with breakdown', action: 'Calculate', highlight: '₹ breakdown', screenshot: '/recordings/chat-3.png' },
      { title: 'Book Service', description: 'Schedule appointment directly from chat', action: 'Book', highlight: 'Calendar sync', screenshot: '/recordings/chat-3.png' },
      { title: 'Create Job Card', description: 'Auto-create job card from conversation', action: 'Create', highlight: 'One-click', screenshot: '/recordings/chat-3.png' },
    ]
  },
  brand: {
    id: 'brand',
    title: 'Brand Marketing',
    subtitle: 'Multi-Brand Campaign Management',
    duration: '1:30',
    color: '#06B6D4',
    hasRealRecording: true,
    steps: [
      { title: 'View Dashboard', description: 'Access the brand marketing dashboard', action: 'Open', highlight: 'Overview', screenshot: '/recordings/dashboard-1.png' },
      { title: 'Select Brand', description: 'Choose from authorized brand partners', action: 'Select', highlight: '20+ brands', screenshot: '/recordings/dashboard-1.png' },
      { title: 'View Metrics', description: 'Check revenue, subscriptions, and sales data', action: 'View', highlight: 'Real-time data', screenshot: '/recordings/dashboard-1.png' },
      { title: 'Create Campaign', description: 'Design promotional campaign with AI help', action: 'Create', highlight: 'AI copywriting', screenshot: '/recordings/dashboard-1.png' },
      { title: 'Target Audience', description: 'Select customer segments for targeting', action: 'Target', highlight: 'Precision targeting', screenshot: '/recordings/dashboard-1.png' },
      { title: 'Launch & Track', description: 'Go live and monitor performance', action: 'Launch', highlight: 'Real-time metrics', screenshot: '/recordings/dashboard-1.png' },
    ]
  },
  regional: {
    id: 'regional',
    title: 'Regional Marketing',
    subtitle: 'City & Zone Targeting',
    duration: '1:45',
    color: '#F59E0B',
    hasRealRecording: false,
    steps: [
      { title: 'Select Region', description: 'Choose state, city, or custom zones', action: 'Select', highlight: 'India map' },
      { title: 'Draw Zones', description: 'Define custom service areas on map', action: 'Draw', highlight: 'Polygon tool' },
      { title: 'Set Local Pricing', description: 'Configure zone-specific pricing', action: 'Price', highlight: 'Dynamic pricing' },
      { title: 'Local Language', description: 'Enable regional language support', action: 'Language', highlight: '12 languages' },
      { title: 'Local Campaigns', description: 'Create geo-targeted promotions', action: 'Create', highlight: 'Festival offers' },
      { title: 'Analytics', description: 'View zone-wise performance metrics', action: 'Analyze', highlight: 'Heat maps' },
    ]
  }
};

interface DemoModalProps {
  featureId: string;
  isOpen: boolean;
  onClose: () => void;
}

const DemoModal: React.FC<DemoModalProps> = ({ featureId, isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const demo = FEATURE_DEMOS[featureId];

  const goToStep = useCallback((stepIndex: number) => {
    if (stepIndex === currentStep || !demo) return;
    
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentStep(stepIndex);
      setProgress(0);
      setTimeout(() => setIsTransitioning(false), 50);
    }, 300);
  }, [currentStep, demo]);

  const nextStep = useCallback(() => {
    if (demo && currentStep < demo.steps.length - 1) {
      goToStep(currentStep + 1);
    } else {
      setIsPlaying(false);
    }
  }, [currentStep, demo, goToStep]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      goToStep(currentStep - 1);
    }
  }, [currentStep, goToStep]);

  useEffect(() => {
    if (!isPlaying || !demo || isTransitioning) return;

    const stepDuration = 4000;
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          nextStep();
          return 0;
        }
        return prev + (100 / (stepDuration / 50));
      });
    }, 50);

    return () => clearInterval(progressInterval);
  }, [isPlaying, demo, nextStep, isTransitioning]);

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      setProgress(0);
      setIsPlaying(true);
      setIsTransitioning(false);
    }
  }, [isOpen, featureId]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case ' ':
          e.preventDefault();
          setIsPlaying(p => !p);
          break;
        case 'ArrowRight':
          nextStep();
          break;
        case 'ArrowLeft':
          prevStep();
          break;
        case 'Escape':
          onClose();
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, nextStep, prevStep, onClose]);

  if (!isOpen || !demo) return null;

  const step = demo.steps[currentStep];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
      <div 
        ref={containerRef}
        className="relative w-full max-w-6xl bg-[#0A0A0B] rounded-2xl overflow-hidden shadow-2xl border border-white/10"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-gradient-to-r from-[#0D0D0F] to-[#141416]">
          <div className="flex items-center gap-4">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center relative overflow-hidden"
              style={{ backgroundColor: `${demo.color}20` }}
            >
              <div 
                className="absolute inset-0 animate-pulse opacity-50"
                style={{ background: `radial-gradient(circle, ${demo.color}40 0%, transparent 70%)` }}
              />
              <Play className="w-6 h-6 relative z-10" style={{ color: demo.color }} fill={demo.color} />
            </div>
            <div>
              <h3 className="text-white font-semibold text-lg">{demo.title}</h3>
              <p className="text-gray-400 text-sm">{demo.subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {demo.hasRealRecording && (
              <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs rounded-full flex items-center gap-1">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                Live Recording
              </span>
            )}
            <span className="text-gray-500 text-xs hidden md:block">
              Space: Play/Pause • Arrows: Navigate • Esc: Close
            </span>
            <button 
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex h-[520px]">
          {/* Video/Screen Recording Area */}
          <div className="flex-1 bg-[#0A0A0B] relative overflow-hidden">
            {/* Transition Overlay */}
            <div 
              className={`absolute inset-0 bg-black z-20 transition-opacity duration-300 pointer-events-none ${
                isTransitioning ? 'opacity-100' : 'opacity-0'
              }`}
            />

            {/* Screen Content */}
            <div className={`absolute inset-0 transition-all duration-500 ${
              isTransitioning ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
            }`}>
              {demo.hasRealRecording && step.screenshot ? (
                <RealScreenRecording 
                  screenshot={step.screenshot}
                  hotspot={step.hotspot}
                  color={demo.color}
                  isPlaying={isPlaying}
                />
              ) : (
                <AnimatedScreenRecording 
                  featureId={featureId}
                  step={step}
                  stepIndex={currentStep}
                  color={demo.color}
                  isPlaying={isPlaying}
                />
              )}
            </div>

            {/* Step Info Overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-6 z-10">
              <div className="flex items-end justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span 
                      className="px-3 py-1 rounded-full text-xs font-medium text-white"
                      style={{ backgroundColor: demo.color }}
                    >
                      Step {currentStep + 1}
                    </span>
                    {step.action && (
                      <span className="px-3 py-1 bg-white/10 rounded-full text-xs text-white">
                        {step.action}
                      </span>
                    )}
                  </div>
                  <h4 className="text-white text-xl font-semibold mb-1">{step.title}</h4>
                  <p className="text-gray-300 text-sm max-w-lg">{step.description}</p>
                </div>
                {step.highlight && (
                  <div 
                    className="px-4 py-2 rounded-lg text-white text-sm font-medium"
                    style={{ backgroundColor: `${demo.color}30`, borderColor: demo.color, borderWidth: 1 }}
                  >
                    {step.highlight}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Steps Sidebar */}
          <div className="w-72 border-l border-white/10 bg-[#0D0D0F] overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-gray-400 text-xs uppercase tracking-wider">
                  Steps
                </h4>
                <span className="text-gray-500 text-xs">
                  {currentStep + 1} of {demo.steps.length}
                </span>
              </div>
              <div className="space-y-2">
                {demo.steps.map((s, index) => (
                  <button
                    key={index}
                    onClick={() => goToStep(index)}
                    className={`w-full text-left p-3 rounded-xl transition-all duration-300 ${
                      index === currentStep 
                        ? 'bg-white/10 border border-white/20 shadow-lg' 
                        : index < currentStep
                        ? 'bg-white/5 opacity-70'
                        : 'hover:bg-white/5'
                    }`}
                    style={index === currentStep ? { 
                      boxShadow: `0 0 20px ${demo.color}20`,
                      borderColor: `${demo.color}50`
                    } : {}}
                  >
                    <div className="flex items-start gap-3">
                      <div 
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all ${
                          index < currentStep 
                            ? 'bg-green-500 text-white scale-90' 
                            : index === currentStep
                            ? 'text-white scale-110'
                            : 'bg-white/10 text-gray-400'
                        }`}
                        style={index === currentStep ? { backgroundColor: demo.color } : {}}
                      >
                        {index < currentStep ? <Check className="w-4 h-4" /> : index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate transition-colors ${
                          index <= currentStep ? 'text-white' : 'text-gray-400'
                        }`}>
                          {s.title}
                        </p>
                        {index === currentStep && (
                          <p className="text-xs text-gray-400 mt-1 line-clamp-2 animate-fadeIn">
                            {s.description}
                          </p>
                        )}
                      </div>
                    </div>
                    {/* Step Progress Bar */}
                    {index === currentStep && (
                      <div className="mt-3 h-1 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-100"
                          style={{ width: `${progress}%`, backgroundColor: demo.color }}
                        />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Controls Bar */}
        <div className="px-6 py-4 border-t border-white/10 bg-gradient-to-r from-[#0D0D0F] to-[#141416]">
          {/* Main Progress Bar */}
          <div className="flex items-center gap-4 mb-4">
            <span className="text-xs text-gray-400 w-20 font-mono">
              {Math.floor((currentStep / demo.steps.length) * 100)}% done
            </span>
            <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden relative">
              {/* Step markers */}
              <div className="absolute inset-0 flex">
                {demo.steps.map((_, i) => (
                  <div 
                    key={i} 
                    className="flex-1 border-r border-white/10 last:border-0"
                    onClick={() => goToStep(i)}
                  />
                ))}
              </div>
              <div 
                className="h-full rounded-full transition-all duration-300 relative z-10"
                style={{ 
                  width: `${((currentStep + progress / 100) / demo.steps.length) * 100}%`,
                  backgroundColor: demo.color,
                  boxShadow: `0 0 10px ${demo.color}80`
                }}
              />
            </div>
            <span className="text-xs text-gray-400 w-16 text-right font-mono">{demo.duration}</span>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsMuted(!isMuted)}
                className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-all"
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <span className="text-gray-500 text-xs ml-2">
                {isPlaying ? 'Playing' : 'Paused'}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={prevStep}
                disabled={currentStep === 0}
                className="p-3 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                title="Previous (←)"
              >
                <SkipBack className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-4 rounded-full text-white transition-all hover:scale-105 active:scale-95"
                style={{ 
                  backgroundColor: demo.color,
                  boxShadow: `0 0 20px ${demo.color}50`
                }}
                title={isPlaying ? "Pause (Space)" : "Play (Space)"}
              >
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" fill="white" />}
              </button>
              <button 
                onClick={nextStep}
                disabled={currentStep === demo.steps.length - 1}
                className="p-3 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                title="Next (→)"
              >
                <SkipForward className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={() => goToStep(0)}
                className="px-3 py-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-all text-xs"
              >
                Restart
              </button>
              <button 
                className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-all"
                title="Fullscreen"
              >
                <Maximize2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
      `}</style>
    </div>
  );
};

// Real Screen Recording Component (using actual screenshots)
interface RealScreenRecordingProps {
  screenshot: string;
  hotspot?: { x: number; y: number; label: string };
  color: string;
  isPlaying: boolean;
}

const RealScreenRecording: React.FC<RealScreenRecordingProps> = ({ screenshot, hotspot, color, isPlaying }) => {
  return (
    <div className="h-full w-full relative bg-[#1A1A1C]">
      {/* Browser Chrome */}
      <div className="h-10 bg-[#2A2A2C] flex items-center px-4 gap-2 border-b border-white/10">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <div className="flex-1 flex justify-center">
          <div className="bg-[#1A1A1C] rounded-lg px-4 py-1 text-gray-400 text-xs flex items-center gap-2">
            <span>🔒</span>
            <span>app.eka-ai.in</span>
          </div>
        </div>
      </div>

      {/* Screenshot */}
      <div className="h-[calc(100%-40px)] relative overflow-hidden">
        <img 
          src={screenshot}
          alt="App Screenshot"
          className="w-full h-full object-cover object-top transition-transform duration-500"
        />
        
        {/* Hotspot Indicator */}
        {hotspot && isPlaying && (
          <div 
            className="absolute z-20 pointer-events-none"
            style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%`, transform: 'translate(-50%, -50%)' }}
          >
            {/* Ripple Effect */}
            <div 
              className="absolute w-16 h-16 rounded-full animate-ping opacity-30"
              style={{ backgroundColor: color, left: '-32px', top: '-32px' }}
            />
            <div 
              className="absolute w-12 h-12 rounded-full animate-ping opacity-50"
              style={{ backgroundColor: color, left: '-24px', top: '-24px', animationDelay: '0.2s' }}
            />
            
            {/* Cursor */}
            <div className="relative">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="drop-shadow-lg">
                <path d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87c.48 0 .72-.58.38-.92L6.35 2.86a.5.5 0 0 0-.85.35Z" fill="white" stroke="black" strokeWidth="1"/>
              </svg>
              
              {/* Label */}
              <div 
                className="absolute left-8 top-0 px-3 py-1 rounded-lg text-white text-xs font-medium whitespace-nowrap shadow-lg"
                style={{ backgroundColor: color }}
              >
                {hotspot.label}
              </div>
            </div>
          </div>
        )}

        {/* Scan Line Effect */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-10"
          style={{
            background: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)`
          }}
        />
      </div>
    </div>
  );
};

// Animated Screen Recording (for demos without real screenshots)
interface AnimatedScreenRecordingProps {
  featureId: string;
  step: DemoStep;
  stepIndex: number;
  color: string;
  isPlaying: boolean;
}

const AnimatedScreenRecording: React.FC<AnimatedScreenRecordingProps> = ({ featureId, step, stepIndex, color, isPlaying }) => {
  // Import the appropriate screen component based on featureId
  switch (featureId) {
    case 'chat':
      return <ChatScreen stepIndex={stepIndex} color={color} isPlaying={isPlaying} />;
    case 'jobcard':
      return <JobCardScreen stepIndex={stepIndex} color={color} isPlaying={isPlaying} />;
    case 'pdi':
      return <PDIScreen stepIndex={stepIndex} color={color} isPlaying={isPlaying} />;
    case 'mg':
      return <MGScreen stepIndex={stepIndex} color={color} isPlaying={isPlaying} />;
    case 'brand':
      return <BrandScreen stepIndex={stepIndex} color={color} isPlaying={isPlaying} />;
    case 'regional':
      return <RegionalScreen stepIndex={stepIndex} color={color} isPlaying={isPlaying} />;
    default:
      return null;
  }
};

// Simplified screen components (keeping the best parts from before)
const ChatScreen: React.FC<{ stepIndex: number; color: string; isPlaying: boolean }> = ({ stepIndex, color }) => {
  const messages = [
    { role: 'ai', text: '👋 Welcome to EKA-AI! How can I assist you today?' },
    { role: 'user', text: 'My car has engine warning light on. Maruti Swift 2020.' },
    { role: 'ai', text: '🔍 Analyzing your vehicle...\n\nBased on your Swift 2020, probable causes:\n\n🔴 Oxygen Sensor (65%) - ₹3,500-5,000\n🟡 MAF Sensor (25%) - ₹2,500-4,000\n🟢 Loose fuel cap (10%) - Free\n\n✅ Recommended: Book diagnostic scan' },
  ];

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-[#1A1A1C] to-[#0D0D0F]">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-white/10">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
          <span className="text-white text-lg">🤖</span>
        </div>
        <div>
          <p className="text-white font-medium">EKA-AI Assistant</p>
          <p className="text-green-400 text-xs flex items-center gap-1">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            Online
          </p>
        </div>
      </div>
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {messages.slice(0, Math.min(stepIndex + 1, messages.length)).map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
            <div className={`max-w-[80%] p-4 rounded-2xl ${
              msg.role === 'user' ? 'bg-purple-600 rounded-br-sm' : 'bg-white/10 rounded-bl-sm'
            }`}>
              <pre className="whitespace-pre-wrap font-sans text-white text-sm">{msg.text}</pre>
            </div>
          </div>
        ))}
      </div>
      <div className="p-4 border-t border-white/10">
        <div className="bg-white/5 rounded-xl px-4 py-3 flex items-center gap-3">
          <input className="flex-1 bg-transparent text-white/50 text-sm" placeholder="Type your message..." readOnly />
          <button className="p-2 rounded-lg" style={{ backgroundColor: color }}>
            <span className="text-white">➤</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const JobCardScreen: React.FC<{ stepIndex: number; color: string; isPlaying: boolean }> = ({ stepIndex, color }) => {
  const jobs = [
    { id: 'JC-0891', customer: 'Rahul Sharma', vehicle: 'Swift', status: 'In Progress', amount: '₹4,500' },
    { id: 'JC-0890', customer: 'Priya Patel', vehicle: 'i20', status: 'Completed', amount: '₹7,200' },
    { id: 'JC-0889', customer: 'Amit Kumar', vehicle: 'City', status: 'Pending', amount: '₹3,800' },
  ];

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-[#1A1A1C] to-[#0D0D0F]">
      <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
        <h2 className="text-white text-xl font-semibold">Job Cards</h2>
        <button className="px-4 py-2 rounded-lg text-white flex items-center gap-2" style={{ backgroundColor: color }}>
          <span>+</span> New Job
        </button>
      </div>
      <div className="grid grid-cols-4 gap-4 p-4">
        {[{ l: 'Total', v: '24' }, { l: 'Active', v: '8' }, { l: 'Done', v: '12' }, { l: 'Pending', v: '4' }].map((s, i) => (
          <div key={i} className={`p-4 rounded-xl bg-white/5 ${i === stepIndex % 4 ? 'ring-2' : ''}`} style={i === stepIndex % 4 ? { ringColor: color } : {}}>
            <p className="text-gray-400 text-sm">{s.l}</p>
            <p className="text-white text-2xl font-bold">{s.v}</p>
          </div>
        ))}
      </div>
      <div className="flex-1 px-4 overflow-auto">
        <table className="w-full">
          <thead><tr className="text-left text-gray-400 text-xs">
            <th className="p-3">ID</th><th className="p-3">Customer</th><th className="p-3">Status</th><th className="p-3 text-right">Amount</th>
          </tr></thead>
          <tbody>
            {jobs.map((j, i) => (
              <tr key={j.id} className={`border-t border-white/5 ${i === stepIndex % 3 ? 'bg-white/10' : ''}`}>
                <td className="p-3 text-white font-mono text-sm">{j.id}</td>
                <td className="p-3"><span className="text-white">{j.customer}</span><br/><span className="text-gray-500 text-xs">{j.vehicle}</span></td>
                <td className="p-3"><span className={`px-2 py-1 rounded text-xs ${j.status === 'Completed' ? 'bg-green-500/20 text-green-400' : j.status === 'In Progress' ? 'bg-orange-500/20 text-orange-400' : 'bg-yellow-500/20 text-yellow-400'}`}>{j.status}</span></td>
                <td className="p-3 text-white text-right">{j.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const PDIScreen: React.FC<{ stepIndex: number; color: string; isPlaying: boolean }> = ({ stepIndex, color }) => {
  const sections = [
    { name: 'Exterior', items: 5, done: stepIndex >= 2 ? 5 : 0 },
    { name: 'Interior', items: 5, done: stepIndex >= 3 ? 5 : 0 },
    { name: 'Engine', items: 5, done: stepIndex >= 4 ? 5 : 0 },
  ];

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-[#1A1A1C] to-[#0D0D0F]">
      <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
        <div>
          <h2 className="text-white text-xl font-semibold">PDI Inspection</h2>
          <p className="text-gray-400 text-sm">MH01AB1234 • Maruti Swift</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm" style={{ color }}>{Math.min(stepIndex * 15, 100)}%</span>
          <div className="w-32 h-2 bg-white/10 rounded-full">
            <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(stepIndex * 15, 100)}%`, backgroundColor: color }}></div>
          </div>
        </div>
      </div>
      <div className="flex-1 p-4 grid grid-cols-2 gap-4">
        <div className="space-y-4">
          {sections.map((s, i) => (
            <div key={s.name} className="p-4 rounded-xl bg-white/5">
              <div className="flex justify-between mb-2">
                <span className="text-white font-medium">{s.name}</span>
                <span className="text-gray-400 text-sm">{s.done}/{s.items}</span>
              </div>
              <div className="space-y-2">
                {[...Array(s.items)].map((_, j) => (
                  <div key={j} className={`flex items-center gap-2 p-2 rounded-lg ${j < s.done ? 'bg-green-500/10' : 'bg-white/5'}`}>
                    <div className={`w-4 h-4 rounded ${j < s.done ? 'bg-green-500' : 'bg-white/10'}`}>
                      {j < s.done && <Check className="w-4 h-4 text-white" />}
                    </div>
                    <span className={`text-sm ${j < s.done ? 'text-white' : 'text-gray-400'}`}>Check item {j + 1}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 rounded-xl bg-white/5">
          <p className="text-white font-medium mb-4">Photo Documentation</p>
          <div className="grid grid-cols-2 gap-2">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className={`aspect-square rounded-lg border-2 border-dashed flex items-center justify-center ${i <= stepIndex ? 'border-green-500 bg-green-500/10' : 'border-white/20'}`}>
                {i <= stepIndex ? '📸' : '+'}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const MGScreen: React.FC<{ stepIndex: number; color: string; isPlaying: boolean }> = ({ stepIndex, color }) => {
  const plans = [
    { name: 'Basic', price: '₹1,999', features: 3 },
    { name: 'Premium', price: '₹2,999', features: 5, popular: true },
    { name: 'Elite', price: '₹4,999', features: 7 },
  ];

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-[#1A1A1C] to-[#0D0D0F]">
      <div className="px-6 py-4 border-b border-white/10">
        <h2 className="text-white text-xl font-semibold">MG Subscription</h2>
        <p className="text-gray-400 text-sm">Choose your maintenance plan</p>
      </div>
      <div className="flex-1 p-6 flex items-center justify-center gap-4">
        {plans.map((p, i) => (
          <div key={p.name} className={`w-56 p-6 rounded-2xl border-2 transition-all ${i === stepIndex % 3 ? 'border-blue-500 bg-blue-500/10 scale-105' : 'border-white/10'}`}>
            {p.popular && <span className="px-3 py-1 bg-blue-500 text-white text-xs rounded-full mb-4 inline-block">Popular</span>}
            <h3 className="text-white text-lg font-semibold">{p.name}</h3>
            <p className="text-3xl font-bold text-white mt-2">{p.price}</p>
            <p className="text-gray-400 text-sm">/month</p>
            <ul className="mt-4 space-y-2">
              {[...Array(p.features)].map((_, j) => (
                <li key={j} className="flex items-center gap-2 text-sm text-gray-300">
                  <Check className="w-4 h-4 text-blue-400" /> Feature {j + 1}
                </li>
              ))}
            </ul>
            <button className="w-full mt-4 py-2 rounded-lg text-white" style={{ backgroundColor: i === stepIndex % 3 ? color : 'rgba(255,255,255,0.1)' }}>
              Select
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const BrandScreen: React.FC<{ stepIndex: number; color: string; isPlaying: boolean }> = ({ stepIndex, color }) => {
  const brands = ['Maruti', 'Hyundai', 'Tata', 'Honda', 'Toyota', 'Kia'];

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-[#1A1A1C] to-[#0D0D0F]">
      <div className="px-6 py-4 border-b border-white/10">
        <h2 className="text-white text-xl font-semibold">Brand Marketing</h2>
      </div>
      <div className="p-4 grid grid-cols-3 gap-3">
        {brands.map((b, i) => (
          <div key={b} className={`p-4 rounded-xl border transition-all ${i === stepIndex % 6 ? 'border-cyan-500 bg-cyan-500/10' : 'border-white/10'}`}>
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center mb-2">🚗</div>
            <p className="text-white font-medium">{b}</p>
            <p className="text-gray-400 text-xs">{10 + i * 5} campaigns</p>
          </div>
        ))}
      </div>
      <div className="flex-1 p-4">
        <div className="h-full bg-white/5 rounded-xl p-4">
          <p className="text-white font-medium mb-4">Campaign Performance</p>
          <div className="h-32 flex items-end gap-2">
            {[40, 65, 45, 80, 55, 70, 90].map((h, i) => (
              <div key={i} className="flex-1 rounded-t transition-all" style={{ height: `${h}%`, backgroundColor: i === stepIndex % 7 ? color : `${color}40` }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const RegionalScreen: React.FC<{ stepIndex: number; color: string; isPlaying: boolean }> = ({ stepIndex, color }) => {
  const cities = [
    { name: 'Mumbai', x: 55, y: 95, revenue: '₹12.5L' },
    { name: 'Delhi', x: 90, y: 45, revenue: '₹10.2L' },
    { name: 'Bangalore', x: 110, y: 145, revenue: '₹8.7L' },
    { name: 'Chennai', x: 125, y: 160, revenue: '₹7.4L' },
  ];

  return (
    <div className="h-full flex bg-gradient-to-br from-[#1A1A1C] to-[#0D0D0F]">
      <div className="w-1/2 p-4 flex items-center justify-center">
        <svg viewBox="0 0 200 200" className="w-full max-w-xs">
          <path d="M100,10 L150,30 L170,70 L165,120 L150,160 L120,190 L80,200 L40,180 L25,140 L20,90 L35,50 L70,25 Z" fill={`${color}15`} stroke={color} strokeWidth="2" />
          {cities.map((c, i) => (
            <g key={c.name}>
              <circle cx={c.x} cy={c.y} r={i === stepIndex % 4 ? 10 : 6} fill={i === stepIndex % 4 ? color : `${color}60`} />
              {i === stepIndex % 4 && <circle cx={c.x} cy={c.y} r="15" fill="none" stroke={color} strokeWidth="2" className="animate-ping" />}
            </g>
          ))}
        </svg>
      </div>
      <div className="w-1/2 border-l border-white/10 p-4">
        <p className="text-white font-medium mb-4">Regional Stats</p>
        <div className="space-y-3">
          {cities.map((c, i) => (
            <div key={c.name} className={`p-3 rounded-lg transition-all ${i === stepIndex % 4 ? 'bg-amber-500/10 border border-amber-500' : 'bg-white/5'}`}>
              <div className="flex justify-between">
                <span className="text-white">{c.name}</span>
                <span className="text-white font-bold">{c.revenue}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DemoModal;
export { FEATURE_DEMOS };
