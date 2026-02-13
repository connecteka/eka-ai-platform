import React, { useState, useEffect, useCallback } from 'react';
import { X, Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Maximize2, MessageSquare, Send, ChevronRight, Check, FileText, Car, MapPin, BarChart3 } from 'lucide-react';

interface DemoStep {
  title: string;
  description: string;
  action?: string;
  highlight?: string;
}

interface FeatureDemo {
  id: string;
  title: string;
  subtitle: string;
  duration: string;
  steps: DemoStep[];
  color: string;
}

const FEATURE_DEMOS: Record<string, FeatureDemo> = {
  pdi: {
    id: 'pdi',
    title: 'PDI Process Demo',
    subtitle: 'Pre-Delivery Inspection Workflow',
    duration: '2:30',
    color: '#10B981',
    steps: [
      { title: 'Create New PDI', description: 'Click "New Inspection" to start a fresh PDI checklist', action: 'Click', highlight: 'New Inspection' },
      { title: 'Vehicle Details', description: 'Enter registration number - system auto-fetches vehicle data', action: 'Type', highlight: 'MH01AB1234' },
      { title: 'Exterior Check', description: 'Complete 45-point exterior inspection with photo capture', action: 'Checklist', highlight: '45 items' },
      { title: 'Interior Check', description: 'Verify dashboard, seats, AC, and electronics', action: 'Checklist', highlight: '35 items' },
      { title: 'Engine Bay', description: 'Check fluid levels, battery, and engine components', action: 'Checklist', highlight: '25 items' },
      { title: 'Test Drive', description: 'Record test drive observations and readings', action: 'Record', highlight: 'GPS tracking' },
      { title: 'Digital Signature', description: 'Customer signs on tablet for delivery acceptance', action: 'Sign', highlight: 'Touch signature' },
      { title: 'Generate Report', description: 'Instant PDF report with photos sent to customer', action: 'Export', highlight: 'PDF + Email' },
    ]
  },
  mg: {
    id: 'mg',
    title: 'MG Model Demo',
    subtitle: 'Maintenance Guarantee Setup',
    duration: '1:45',
    color: '#3B82F6',
    steps: [
      { title: 'Select Plan', description: 'Choose from Basic, Premium, or Elite MG packages', action: 'Select', highlight: '3 Plans' },
      { title: 'Vehicle Selection', description: 'Add vehicles to the MG contract', action: 'Add', highlight: 'Multi-vehicle' },
      { title: 'Set KM Limit', description: 'Define monthly kilometer allowance', action: 'Configure', highlight: '1000-5000 km' },
      { title: 'Add Services', description: 'Include oil change, filters, brake service', action: 'Checklist', highlight: '15+ services' },
      { title: 'Set Duration', description: 'Choose contract period: 12, 24, or 36 months', action: 'Select', highlight: 'Flexible' },
      { title: 'Calculate Price', description: 'AI calculates optimal monthly subscription', action: 'Auto', highlight: '₹2,999/month' },
      { title: 'Generate Contract', description: 'Legal contract with terms auto-generated', action: 'Generate', highlight: 'Digital contract' },
    ]
  },
  jobcard: {
    id: 'jobcard',
    title: 'Job Card → Invoice',
    subtitle: 'Complete Service Workflow',
    duration: '3:00',
    color: '#F97316',
    steps: [
      { title: 'Create Job Card', description: 'Customer arrives - create new job card instantly', action: 'Click', highlight: '+ New Job' },
      { title: 'Scan Registration', description: 'Scan number plate or enter manually', action: 'Scan', highlight: 'Auto-fill' },
      { title: 'Add Complaints', description: 'Record customer complaints and observations', action: 'Type', highlight: 'Voice input' },
      { title: 'AI Diagnosis', description: 'EKA-AI suggests probable issues and parts', action: 'AI', highlight: 'Smart suggestions' },
      { title: 'Create Estimate', description: 'Build estimate with labor and parts', action: 'Build', highlight: 'Real-time pricing' },
      { title: 'Customer Approval', description: 'Send WhatsApp link for customer approval', action: 'Send', highlight: 'One-tap approve' },
      { title: 'Track Progress', description: 'Update status as work progresses', action: 'Update', highlight: 'Live tracking' },
      { title: 'Quality Check', description: 'Technician completes QC checklist', action: 'Verify', highlight: 'Photo proof' },
      { title: 'Generate Invoice', description: 'Convert to GST invoice with one click', action: 'Convert', highlight: 'Auto GST' },
      { title: 'Payment & Delivery', description: 'Collect payment and complete delivery', action: 'Complete', highlight: 'UPI/Card/Cash' },
    ]
  },
  chat: {
    id: 'chat',
    title: 'AI Chat Assistant',
    subtitle: 'EKA-AI Powered Diagnostics',
    duration: '2:00',
    color: '#A855F7',
    steps: [
      { title: 'Start Conversation', description: 'Open EKA-AI chat from any screen', action: 'Open', highlight: 'Always available' },
      { title: 'Describe Issue', description: 'Type or speak: "Engine warning light on"', action: 'Type', highlight: 'Natural language' },
      { title: 'AI Analysis', description: 'EKA-AI analyzes and asks clarifying questions', action: 'AI', highlight: 'Smart follow-up' },
      { title: 'Diagnostic Results', description: 'Get probable causes ranked by likelihood', action: 'Results', highlight: '95% accuracy' },
      { title: 'Cost Estimate', description: 'Instant repair cost estimate with breakdown', action: 'Calculate', highlight: '₹ breakdown' },
      { title: 'Book Service', description: 'Schedule appointment directly from chat', action: 'Book', highlight: 'Calendar sync' },
      { title: 'Create Job Card', description: 'Auto-create job card from conversation', action: 'Create', highlight: 'One-click' },
    ]
  },
  brand: {
    id: 'brand',
    title: 'Brand Marketing',
    subtitle: 'Multi-Brand Campaign Management',
    duration: '1:30',
    color: '#06B6D4',
    steps: [
      { title: 'Select Brand', description: 'Choose from authorized brand partners', action: 'Select', highlight: '20+ brands' },
      { title: 'Upload Assets', description: 'Add brand logos, banners, and templates', action: 'Upload', highlight: 'Drag & drop' },
      { title: 'Create Campaign', description: 'Design promotional campaign with AI help', action: 'Create', highlight: 'AI copywriting' },
      { title: 'Set Budget', description: 'Allocate budget across channels', action: 'Budget', highlight: 'Smart allocation' },
      { title: 'Target Audience', description: 'Select customer segments for targeting', action: 'Target', highlight: 'Precision targeting' },
      { title: 'Launch & Track', description: 'Go live and monitor performance', action: 'Launch', highlight: 'Real-time metrics' },
    ]
  },
  regional: {
    id: 'regional',
    title: 'Regional Marketing',
    subtitle: 'City & Zone Targeting',
    duration: '1:45',
    color: '#F59E0B',
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

  const demo = FEATURE_DEMOS[featureId];

  const nextStep = useCallback(() => {
    if (demo && currentStep < demo.steps.length - 1) {
      setCurrentStep(prev => prev + 1);
      setProgress(0);
    } else {
      setIsPlaying(false);
    }
  }, [currentStep, demo]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      setProgress(0);
    }
  }, [currentStep]);

  useEffect(() => {
    if (!isPlaying || !demo) return;

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
  }, [isPlaying, demo, nextStep]);

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      setProgress(0);
      setIsPlaying(true);
    }
  }, [isOpen, featureId]);

  // Handle keyboard shortcuts
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
      <div className="relative w-full max-w-6xl bg-[#0A0A0B] rounded-2xl overflow-hidden shadow-2xl border border-white/10">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#0D0D0F]">
          <div className="flex items-center gap-4">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${demo.color}20` }}
            >
              <Play className="w-5 h-5" style={{ color: demo.color }} fill={demo.color} />
            </div>
            <div>
              <h3 className="text-white font-semibold">{demo.title}</h3>
              <p className="text-gray-400 text-sm">{demo.subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-gray-400 text-xs">Press Space to pause • Arrow keys to navigate</span>
            <button 
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex h-[500px]">
          {/* Screen Recording Area */}
          <div className="flex-1 bg-[#111113] relative overflow-hidden">
            <ScreenRecording 
              featureId={featureId}
              step={step}
              stepIndex={currentStep}
              color={demo.color}
              isPlaying={isPlaying}
            />
          </div>

          {/* Steps Sidebar */}
          <div className="w-80 border-l border-white/10 bg-[#0D0D0F] overflow-y-auto">
            <div className="p-4">
              <h4 className="text-gray-400 text-xs uppercase tracking-wider mb-3">
                Walkthrough Steps ({demo.steps.length})
              </h4>
              <div className="space-y-2">
                {demo.steps.map((s, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setCurrentStep(index);
                      setProgress(0);
                    }}
                    className={`w-full text-left p-3 rounded-lg transition-all ${
                      index === currentStep 
                        ? 'bg-white/10 border border-white/20' 
                        : index < currentStep
                        ? 'bg-white/5 opacity-60'
                        : 'hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div 
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                          index < currentStep 
                            ? 'bg-green-500 text-white' 
                            : index === currentStep
                            ? 'text-white'
                            : 'bg-white/10 text-gray-400'
                        }`}
                        style={index === currentStep ? { backgroundColor: demo.color } : {}}
                      >
                        {index < currentStep ? <Check className="w-3 h-3" /> : index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${
                          index <= currentStep ? 'text-white' : 'text-gray-400'
                        }`}>
                          {s.title}
                        </p>
                        {index === currentStep && (
                          <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                            {s.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Controls Bar */}
        <div className="px-6 py-4 border-t border-white/10 bg-[#0D0D0F]">
          <div className="flex items-center gap-4 mb-3">
            <span className="text-xs text-gray-400 w-16">
              Step {currentStep + 1}/{demo.steps.length}
            </span>
            <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-100"
                style={{ 
                  width: `${((currentStep + progress / 100) / demo.steps.length) * 100}%`,
                  backgroundColor: demo.color 
                }}
              />
            </div>
            <span className="text-xs text-gray-400 w-16 text-right">{demo.duration}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsMuted(!isMuted)}
                className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={prevStep}
                disabled={currentStep === 0}
                className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                title="Previous step (←)"
              >
                <SkipBack className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-4 rounded-full text-white transition-colors"
                style={{ backgroundColor: demo.color }}
                title={isPlaying ? "Pause (Space)" : "Play (Space)"}
              >
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" fill="white" />}
              </button>
              <button 
                onClick={nextStep}
                disabled={currentStep === demo.steps.length - 1}
                className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                title="Next step (→)"
              >
                <SkipForward className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button 
                className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                title="Fullscreen"
              >
                <Maximize2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Real Screen Recording Component
interface ScreenRecordingProps {
  featureId: string;
  step: DemoStep;
  stepIndex: number;
  color: string;
  isPlaying: boolean;
}

const ScreenRecording: React.FC<ScreenRecordingProps> = ({ featureId, step, stepIndex, color, isPlaying }) => {
  switch (featureId) {
    case 'chat':
      return <ChatScreenRecording step={step} stepIndex={stepIndex} color={color} isPlaying={isPlaying} />;
    case 'jobcard':
      return <JobCardScreenRecording step={step} stepIndex={stepIndex} color={color} isPlaying={isPlaying} />;
    case 'pdi':
      return <PDIScreenRecording step={step} stepIndex={stepIndex} color={color} isPlaying={isPlaying} />;
    case 'mg':
      return <MGScreenRecording step={step} stepIndex={stepIndex} color={color} isPlaying={isPlaying} />;
    case 'brand':
      return <BrandScreenRecording step={step} stepIndex={stepIndex} color={color} isPlaying={isPlaying} />;
    case 'regional':
      return <RegionalScreenRecording step={step} stepIndex={stepIndex} color={color} isPlaying={isPlaying} />;
    default:
      return null;
  }
};

// Chat Screen Recording - Realistic EKA-AI Chat Interface
const ChatScreenRecording: React.FC<{ step: DemoStep; stepIndex: number; color: string; isPlaying: boolean }> = ({ stepIndex, color, isPlaying }) => {
  const [typingText, setTypingText] = useState('');
  const [showResponse, setShowResponse] = useState(false);
  
  const messages = [
    { role: 'system', text: 'Welcome to EKA-AI. How can I help you today?' },
    { role: 'user', text: 'My car has engine warning light on' },
    { role: 'ai', text: 'I understand you\'re seeing an engine warning light. To help diagnose this:\n\n1. What is your vehicle make and model?\n2. When did the light first appear?\n3. Any unusual sounds or performance issues?' },
    { role: 'user', text: 'Maruti Swift 2020, started yesterday, slight rough idle' },
    { role: 'ai', text: '**Diagnostic Analysis for Maruti Swift 2020**\n\nBased on your symptoms, probable causes:\n\n🔴 **High Priority (65%)**\n• Oxygen Sensor malfunction\n• Estimated cost: ₹3,500 - ₹5,000\n\n🟡 **Medium Priority (25%)**\n• Mass Airflow Sensor issue\n• Estimated cost: ₹2,500 - ₹4,000\n\n🟢 **Low Priority (10%)**\n• Loose fuel cap\n• Fix: Free (tighten cap)\n\n**Recommended Action:** Schedule a diagnostic scan at your nearest Go4Garage center.' },
    { role: 'user', text: 'Book service for tomorrow' },
    { role: 'ai', text: '✅ **Appointment Confirmed**\n\n📅 Date: Tomorrow, 10:00 AM\n📍 Location: Go4Garage Andheri\n🚗 Vehicle: Maruti Swift (MH01AB1234)\n\n📋 Job Card #JC-2024-0892 created automatically.\n\nYou\'ll receive a WhatsApp confirmation shortly.' },
  ];

  const visibleMessages = messages.slice(0, Math.min((stepIndex + 1) * 2, messages.length));

  useEffect(() => {
    if (stepIndex === 1 && isPlaying) {
      const text = 'My car has engine warning light on';
      let i = 0;
      const interval = setInterval(() => {
        setTypingText(text.slice(0, i + 1));
        i++;
        if (i >= text.length) clearInterval(interval);
      }, 50);
      return () => clearInterval(interval);
    }
  }, [stepIndex, isPlaying]);

  return (
    <div className="h-full flex flex-col bg-[#1A1A1C]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#141416]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-white font-medium">EKA-AI Assistant</h3>
            <p className="text-green-400 text-xs flex items-center gap-1">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              Online • Ready to help
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-lg hover:bg-white/10 text-gray-400">
            <span className="text-xs">🎤</span>
          </button>
          <button className="p-2 rounded-lg hover:bg-white/10 text-gray-400">
            <span className="text-xs">⚙️</span>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {visibleMessages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
            <div 
              className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                msg.role === 'user' 
                  ? 'bg-purple-600 text-white rounded-br-md' 
                  : msg.role === 'system'
                  ? 'bg-white/5 text-gray-400 text-center w-full text-sm'
                  : 'bg-[#2A2A2C] text-white rounded-bl-md'
              }`}
            >
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">{msg.text}</pre>
            </div>
          </div>
        ))}
        
        {stepIndex >= 2 && stepIndex < 6 && (
          <div className="flex justify-start">
            <div className="bg-[#2A2A2C] rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <span className="text-gray-400 text-sm ml-2">EKA-AI is analyzing...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-white/10 bg-[#141416]">
        <div className="flex items-center gap-3 bg-[#2A2A2C] rounded-xl px-4 py-3">
          <input 
            type="text"
            value={stepIndex === 1 ? typingText : ''}
            placeholder="Ask about vehicle diagnostics, repairs, or services..."
            className="flex-1 bg-transparent text-white placeholder-gray-500 outline-none text-sm"
            readOnly
          />
          <button 
            className="p-2 rounded-lg text-white"
            style={{ backgroundColor: color }}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-center text-gray-500 text-xs mt-2">
          Powered by EKA-AI • Governed Automobile Intelligence
        </p>
      </div>

      {/* Highlight Cursor */}
      {stepIndex === 0 && (
        <div className="absolute bottom-20 right-8 animate-pulse">
          <div className="w-8 h-8 rounded-full border-2 border-purple-500 flex items-center justify-center">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
      `}</style>
    </div>
  );
};

// Job Card Screen Recording
const JobCardScreenRecording: React.FC<{ step: DemoStep; stepIndex: number; color: string; isPlaying: boolean }> = ({ stepIndex, color }) => {
  const jobs = [
    { id: 'JC-2024-0891', vehicle: 'MH01AB1234', customer: 'Rahul Sharma', status: 'In Progress', amount: '₹4,500', car: 'Maruti Swift' },
    { id: 'JC-2024-0890', vehicle: 'MH02CD5678', customer: 'Priya Patel', status: 'Completed', amount: '₹7,200', car: 'Hyundai i20' },
    { id: 'JC-2024-0889', vehicle: 'MH03EF9012', customer: 'Amit Kumar', status: 'Pending Approval', amount: '₹3,800', car: 'Honda City' },
    { id: 'JC-2024-0888', vehicle: 'MH04GH3456', customer: 'Sneha Reddy', status: 'Invoiced', amount: '₹5,600', car: 'Tata Nexon' },
  ];

  const statusColors: Record<string, string> = {
    'In Progress': '#F97316',
    'Completed': '#10B981',
    'Pending Approval': '#EAB308',
    'Invoiced': '#3B82F6',
  };

  return (
    <div className="h-full flex flex-col bg-[#1A1A1C]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#141416]">
        <div>
          <h2 className="text-white text-xl font-semibold">Job Cards</h2>
          <p className="text-gray-400 text-sm">Manage service orders and track progress</p>
        </div>
        <button 
          className={`px-4 py-2 rounded-lg text-white font-medium flex items-center gap-2 ${stepIndex === 0 ? 'ring-2 ring-offset-2 ring-offset-[#141416]' : ''}`}
          style={{ backgroundColor: color, ringColor: color }}
        >
          <span>+</span> New Job Card
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 p-4 bg-[#141416] border-b border-white/10">
        {[
          { label: 'Total Jobs', value: '24', change: '+3 today' },
          { label: 'In Progress', value: '8', change: '33% of total' },
          { label: 'Completed', value: '12', change: '₹86,400 revenue' },
          { label: 'Pending', value: '4', change: 'Needs attention' },
        ].map((stat, i) => (
          <div 
            key={i} 
            className={`p-4 rounded-xl bg-white/5 border transition-all ${
              i === stepIndex % 4 ? 'border-white/20 bg-white/10' : 'border-transparent'
            }`}
          >
            <p className="text-gray-400 text-sm">{stat.label}</p>
            <p className="text-white text-2xl font-bold mt-1">{stat.value}</p>
            <p className="text-gray-500 text-xs mt-1">{stat.change}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full">
          <thead className="bg-[#141416] sticky top-0">
            <tr>
              <th className="text-left text-gray-400 text-xs font-medium px-6 py-3">JOB ID</th>
              <th className="text-left text-gray-400 text-xs font-medium px-6 py-3">CUSTOMER</th>
              <th className="text-left text-gray-400 text-xs font-medium px-6 py-3">VEHICLE</th>
              <th className="text-left text-gray-400 text-xs font-medium px-6 py-3">STATUS</th>
              <th className="text-right text-gray-400 text-xs font-medium px-6 py-3">AMOUNT</th>
              <th className="text-right text-gray-400 text-xs font-medium px-6 py-3">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job, i) => (
              <tr 
                key={job.id}
                className={`border-b border-white/5 transition-all ${
                  i === stepIndex % 4 ? 'bg-white/10' : 'hover:bg-white/5'
                }`}
              >
                <td className="px-6 py-4">
                  <span className="text-white font-mono text-sm">{job.id}</span>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <p className="text-white text-sm">{job.customer}</p>
                    <p className="text-gray-500 text-xs">{job.vehicle}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-gray-300 text-sm">{job.car}</span>
                </td>
                <td className="px-6 py-4">
                  <span 
                    className="px-3 py-1 rounded-full text-xs font-medium"
                    style={{ 
                      backgroundColor: `${statusColors[job.status]}20`,
                      color: statusColors[job.status]
                    }}
                  >
                    {job.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="text-white font-medium">{job.amount}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-gray-400 hover:text-white p-1">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Action Indicator */}
      {stepIndex >= 3 && stepIndex <= 5 && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/80 backdrop-blur-sm rounded-xl p-6 text-center">
          <div 
            className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
            style={{ backgroundColor: `${color}20` }}
          >
            <FileText className="w-8 h-8" style={{ color }} />
          </div>
          <p className="text-white font-medium">{stepIndex === 3 ? 'AI Analyzing...' : stepIndex === 4 ? 'Building Estimate...' : 'Sending to Customer...'}</p>
          <div className="w-32 h-1 bg-white/10 rounded-full mx-auto mt-3">
            <div 
              className="h-full rounded-full animate-pulse"
              style={{ width: '60%', backgroundColor: color }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
};

// PDI Screen Recording
const PDIScreenRecording: React.FC<{ step: DemoStep; stepIndex: number; color: string; isPlaying: boolean }> = ({ stepIndex, color }) => {
  const checklistItems = [
    { category: 'Exterior', items: ['Body panels', 'Paint condition', 'Glass & mirrors', 'Lights', 'Wipers'], completed: stepIndex >= 2 ? 5 : 0 },
    { category: 'Interior', items: ['Dashboard', 'Seats', 'AC/Heating', 'Electronics', 'Controls'], completed: stepIndex >= 3 ? 5 : 0 },
    { category: 'Engine', items: ['Oil level', 'Coolant', 'Battery', 'Belts', 'Hoses'], completed: stepIndex >= 4 ? 5 : 0 },
  ];

  return (
    <div className="h-full flex flex-col bg-[#1A1A1C]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#141416]">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
            <Car className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-white text-lg font-semibold">PDI Inspection</h2>
            <p className="text-gray-400 text-sm">Vehicle: MH01AB1234 • Maruti Swift</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-emerald-400 text-sm font-medium">
            {Math.min(stepIndex * 15, 100)}% Complete
          </span>
          <div className="w-32 h-2 bg-white/10 rounded-full">
            <div 
              className="h-full rounded-full transition-all"
              style={{ width: `${Math.min(stepIndex * 15, 100)}%`, backgroundColor: color }}
            ></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Checklist */}
        <div className="w-2/3 p-6 overflow-y-auto">
          {checklistItems.map((section, sectionIndex) => (
            <div key={section.category} className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-medium">{section.category} Inspection</h3>
                <span className="text-gray-400 text-sm">{section.completed}/5</span>
              </div>
              <div className="space-y-2">
                {section.items.map((item, itemIndex) => (
                  <div 
                    key={item}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                      itemIndex < section.completed 
                        ? 'bg-emerald-500/10 border-emerald-500/30' 
                        : sectionIndex === stepIndex - 2 && itemIndex === section.completed
                        ? 'bg-white/10 border-white/30 animate-pulse'
                        : 'bg-white/5 border-white/10'
                    }`}
                  >
                    <div 
                      className={`w-5 h-5 rounded flex items-center justify-center ${
                        itemIndex < section.completed ? 'bg-emerald-500' : 'bg-white/10'
                      }`}
                    >
                      {itemIndex < section.completed && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span className={`text-sm ${itemIndex < section.completed ? 'text-white' : 'text-gray-400'}`}>
                      {item}
                    </span>
                    {itemIndex < section.completed && (
                      <span className="ml-auto text-emerald-400 text-xs">✓ Passed</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Photo Capture Panel */}
        <div className="w-1/3 border-l border-white/10 p-4 bg-[#141416]">
          <h4 className="text-white font-medium mb-4">Photo Documentation</h4>
          <div className="grid grid-cols-2 gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div 
                key={i}
                className={`aspect-square rounded-lg border-2 border-dashed flex items-center justify-center ${
                  i <= stepIndex ? 'border-emerald-500 bg-emerald-500/10' : 'border-white/20'
                }`}
              >
                {i <= stepIndex ? (
                  <span className="text-2xl">📸</span>
                ) : (
                  <span className="text-gray-500 text-xs">+ Add</span>
                )}
              </div>
            ))}
          </div>
          
          {stepIndex >= 6 && (
            <div className="mt-6 p-4 bg-white/5 rounded-lg">
              <p className="text-white text-sm font-medium mb-2">Digital Signature</p>
              <div className="h-20 border border-white/20 rounded-lg flex items-center justify-center">
                <span className="text-gray-400 italic">Customer signature here</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// MG Model Screen Recording
const MGScreenRecording: React.FC<{ step: DemoStep; stepIndex: number; color: string; isPlaying: boolean }> = ({ stepIndex, color }) => {
  const plans = [
    { name: 'Basic', price: '₹1,999', features: ['Oil change', 'Filter replacement', 'Basic inspection'] },
    { name: 'Premium', price: '₹2,999', features: ['All Basic features', 'Brake service', 'AC check', 'Tire rotation'] },
    { name: 'Elite', price: '₹4,999', features: ['All Premium features', 'Complete service', 'Roadside assistance', 'Priority booking'] },
  ];

  return (
    <div className="h-full flex flex-col bg-[#1A1A1C]">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/10 bg-[#141416]">
        <h2 className="text-white text-xl font-semibold">MG Model Setup</h2>
        <p className="text-gray-400 text-sm">Create a Maintenance Guarantee subscription</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center px-6 py-4 border-b border-white/10 bg-[#141416]">
        {['Select Plan', 'Add Vehicle', 'Configure', 'Review'].map((step, i) => (
          <div key={step} className="flex items-center">
            <div 
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                i < Math.ceil(stepIndex / 2) ? 'bg-blue-500 text-white' : 
                i === Math.ceil(stepIndex / 2) ? 'border-2 text-white' : 'bg-white/10 text-gray-400'
              }`}
              style={i === Math.ceil(stepIndex / 2) ? { borderColor: color } : {}}
            >
              {i < Math.ceil(stepIndex / 2) ? <Check className="w-4 h-4" /> : i + 1}
            </div>
            <span className={`ml-2 text-sm ${i <= Math.ceil(stepIndex / 2) ? 'text-white' : 'text-gray-400'}`}>
              {step}
            </span>
            {i < 3 && <div className="w-12 h-px bg-white/10 mx-4"></div>}
          </div>
        ))}
      </div>

      {/* Plan Selection */}
      <div className="flex-1 p-6">
        <div className="grid grid-cols-3 gap-4">
          {plans.map((plan, i) => (
            <div 
              key={plan.name}
              className={`p-6 rounded-xl border-2 transition-all cursor-pointer ${
                i === stepIndex % 3 
                  ? 'border-blue-500 bg-blue-500/10' 
                  : 'border-white/10 hover:border-white/30'
              }`}
            >
              <h3 className="text-white text-lg font-semibold">{plan.name}</h3>
              <p className="text-3xl font-bold text-white mt-2">{plan.price}</p>
              <p className="text-gray-400 text-sm">/month</p>
              <ul className="mt-4 space-y-2">
                {plan.features.map((f, fi) => (
                  <li key={fi} className="flex items-center gap-2 text-sm text-gray-300">
                    <Check className="w-4 h-4 text-blue-400" />
                    {f}
                  </li>
                ))}
              </ul>
              {i === 1 && (
                <span className="mt-4 inline-block px-3 py-1 bg-blue-500 text-white text-xs rounded-full">
                  Most Popular
                </span>
              )}
            </div>
          ))}
        </div>

        {stepIndex >= 5 && (
          <div className="mt-6 p-4 bg-white/5 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Monthly Subscription</p>
                <p className="text-gray-400 text-sm">Premium Plan • 12 months</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold" style={{ color }}>₹2,999</p>
                <p className="text-gray-400 text-sm">Total: ₹35,988/year</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Brand Marketing Screen Recording
const BrandScreenRecording: React.FC<{ step: DemoStep; stepIndex: number; color: string; isPlaying: boolean }> = ({ stepIndex, color }) => {
  const brands = ['Maruti Suzuki', 'Hyundai', 'Tata Motors', 'Honda', 'Toyota', 'Kia'];
  
  return (
    <div className="h-full flex flex-col bg-[#1A1A1C]">
      <div className="px-6 py-4 border-b border-white/10 bg-[#141416]">
        <h2 className="text-white text-xl font-semibold">Brand Marketing Hub</h2>
        <p className="text-gray-400 text-sm">Manage multi-brand campaigns</p>
      </div>

      <div className="flex-1 p-6">
        <div className="grid grid-cols-3 gap-4 mb-6">
          {brands.map((brand, i) => (
            <div 
              key={brand}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                i === stepIndex % 6 ? 'border-cyan-500 bg-cyan-500/10' : 'border-white/10 hover:border-white/30'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                  <span className="text-xl">🚗</span>
                </div>
                <div>
                  <p className="text-white font-medium text-sm">{brand}</p>
                  <p className="text-gray-400 text-xs">{Math.floor(Math.random() * 50 + 20)} campaigns</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white/5 rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-medium">Campaign Performance</h3>
            <select className="bg-white/10 text-white text-sm rounded-lg px-3 py-1 border border-white/10">
              <option>Last 7 days</option>
            </select>
          </div>
          <div className="h-40 flex items-end gap-2">
            {[40, 65, 45, 80, 55, 70, 90].map((h, i) => (
              <div 
                key={i}
                className="flex-1 rounded-t transition-all"
                style={{ 
                  height: `${h}%`, 
                  backgroundColor: i === stepIndex % 7 ? color : `${color}40`
                }}
              />
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-400">
            <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Regional Marketing Screen Recording
const RegionalScreenRecording: React.FC<{ step: DemoStep; stepIndex: number; color: string; isPlaying: boolean }> = ({ stepIndex, color }) => {
  const regions = [
    { name: 'Mumbai', workshops: 45, revenue: '₹12.5L' },
    { name: 'Delhi NCR', workshops: 38, revenue: '₹10.2L' },
    { name: 'Bangalore', workshops: 32, revenue: '₹8.7L' },
    { name: 'Chennai', workshops: 28, revenue: '₹7.4L' },
    { name: 'Pune', workshops: 24, revenue: '₹6.1L' },
    { name: 'Hyderabad', workshops: 21, revenue: '₹5.8L' },
  ];

  return (
    <div className="h-full flex flex-col bg-[#1A1A1C]">
      <div className="px-6 py-4 border-b border-white/10 bg-[#141416]">
        <h2 className="text-white text-xl font-semibold">Regional Marketing</h2>
        <p className="text-gray-400 text-sm">City-wise targeting & analytics</p>
      </div>

      <div className="flex-1 flex">
        {/* Map Area */}
        <div className="w-1/2 p-4 flex items-center justify-center">
          <div className="relative w-full max-w-sm">
            <svg viewBox="0 0 200 220" className="w-full">
              <path 
                d="M100,10 L150,30 L170,70 L165,120 L150,160 L120,190 L80,200 L40,180 L25,140 L20,90 L35,50 L70,25 Z"
                fill={`${color}15`}
                stroke={color}
                strokeWidth="2"
              />
              {[
                { x: 55, y: 95, name: 'Mumbai' },
                { x: 90, y: 45, name: 'Delhi' },
                { x: 110, y: 145, name: 'Bangalore' },
                { x: 125, y: 160, name: 'Chennai' },
                { x: 70, y: 105, name: 'Pune' },
                { x: 115, y: 115, name: 'Hyderabad' },
              ].map((city, i) => (
                <g key={city.name}>
                  <circle 
                    cx={city.x} 
                    cy={city.y} 
                    r={i === stepIndex % 6 ? 10 : 6}
                    fill={i === stepIndex % 6 ? color : `${color}80`}
                    className="transition-all cursor-pointer"
                  />
                  {i === stepIndex % 6 && (
                    <>
                      <circle cx={city.x} cy={city.y} r="15" fill="none" stroke={color} strokeWidth="2" opacity="0.5" className="animate-ping" />
                      <text x={city.x} y={city.y - 15} textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">
                        {city.name}
                      </text>
                    </>
                  )}
                </g>
              ))}
            </svg>
          </div>
        </div>

        {/* Region Stats */}
        <div className="w-1/2 border-l border-white/10 p-4 overflow-y-auto">
          <h3 className="text-white font-medium mb-4">Regional Performance</h3>
          <div className="space-y-3">
            {regions.map((region, i) => (
              <div 
                key={region.name}
                className={`p-3 rounded-lg border transition-all ${
                  i === stepIndex % 6 ? 'border-amber-500 bg-amber-500/10' : 'border-white/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" style={{ color: i === stepIndex % 6 ? color : '#9CA3AF' }} />
                    <span className="text-white text-sm font-medium">{region.name}</span>
                  </div>
                  <span className="text-white font-bold">{region.revenue}</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-gray-400 text-xs">{region.workshops} workshops</span>
                  <div className="flex-1 mx-3 h-1 bg-white/10 rounded-full">
                    <div 
                      className="h-full rounded-full"
                      style={{ width: `${(region.workshops / 45) * 100}%`, backgroundColor: color }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoModal;
export { FEATURE_DEMOS };
