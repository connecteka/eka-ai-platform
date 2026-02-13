import React, { useState, useEffect, useCallback } from 'react';
import { X, Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Maximize2 } from 'lucide-react';

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
  mockupType: 'chat' | 'dashboard' | 'form' | 'table' | 'map';
}

const FEATURE_DEMOS: Record<string, FeatureDemo> = {
  pdi: {
    id: 'pdi',
    title: 'PDI Process Demo',
    subtitle: 'Pre-Delivery Inspection Workflow',
    duration: '2:30',
    color: '#10B981',
    mockupType: 'form',
    steps: [
      { title: 'Create New PDI', description: 'Click "New Inspection" to start a fresh PDI checklist', action: 'Click Button', highlight: 'New Inspection' },
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
    mockupType: 'form',
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
    mockupType: 'table',
    steps: [
      { title: 'Create Job Card', description: 'Customer arrives - create new job card instantly', action: 'Click', highlight: '+ New Job' },
      { title: 'Scan Registration', description: 'Scan number plate or enter manually', action: 'Scan/Type', highlight: 'Auto-fill' },
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
    mockupType: 'chat',
    steps: [
      { title: 'Start Conversation', description: 'Open EKA-AI chat from any screen', action: 'Open', highlight: 'Always available' },
      { title: 'Describe Issue', description: 'Type or speak: "Engine warning light on"', action: 'Type/Voice', highlight: 'Natural language' },
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
    mockupType: 'dashboard',
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
    mockupType: 'map',
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

    const stepDuration = 4000; // 4 seconds per step
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

  if (!isOpen || !demo) return null;

  const step = demo.steps[currentStep];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-5xl bg-[#0A0A0B] rounded-2xl overflow-hidden shadow-2xl border border-white/10">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
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
          <button 
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Content */}
        <div className="flex">
          {/* Video/Animation Area */}
          <div className="flex-1 aspect-video bg-[#141416] relative">
            {/* Mockup Display */}
            <div className="absolute inset-0 flex items-center justify-center p-8">
              <MockupDisplay 
                type={demo.mockupType} 
                step={step} 
                color={demo.color}
                stepIndex={currentStep}
              />
            </div>

            {/* Step Indicator Overlay */}
            <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2">
              <span className="text-white text-sm font-medium">
                Step {currentStep + 1} of {demo.steps.length}
              </span>
            </div>

            {/* Action Badge */}
            {step.action && (
              <div 
                className="absolute top-4 right-4 px-3 py-1 rounded-full text-white text-xs font-medium"
                style={{ backgroundColor: demo.color }}
              >
                {step.action}
              </div>
            )}
          </div>

          {/* Steps Sidebar */}
          <div className="w-72 border-l border-white/10 bg-[#0D0D0F] overflow-y-auto max-h-[500px]">
            <div className="p-4">
              <h4 className="text-gray-400 text-xs uppercase tracking-wider mb-3">Steps</h4>
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
                        {index < currentStep ? '✓' : index + 1}
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
          {/* Progress Bar */}
          <div className="flex items-center gap-4 mb-4">
            <span className="text-xs text-gray-400 w-12">
              {Math.floor((currentStep / demo.steps.length) * 100)}%
            </span>
            <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all"
                style={{ 
                  width: `${((currentStep + progress / 100) / demo.steps.length) * 100}%`,
                  backgroundColor: demo.color 
                }}
              />
            </div>
            <span className="text-xs text-gray-400 w-12 text-right">{demo.duration}</span>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsMuted(!isMuted)}
                className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={prevStep}
                disabled={currentStep === 0}
                className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors disabled:opacity-30"
              >
                <SkipBack className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-3 rounded-full text-white transition-colors"
                style={{ backgroundColor: demo.color }}
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" fill="white" />}
              </button>
              <button 
                onClick={nextStep}
                disabled={currentStep === demo.steps.length - 1}
                className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors disabled:opacity-30"
              >
                <SkipForward className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button 
                className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
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

// Mockup Display Component
interface MockupDisplayProps {
  type: 'chat' | 'dashboard' | 'form' | 'table' | 'map';
  step: DemoStep;
  color: string;
  stepIndex: number;
}

const MockupDisplay: React.FC<MockupDisplayProps> = ({ type, step, color, stepIndex }) => {
  const renderMockup = () => {
    switch (type) {
      case 'chat':
        return <ChatMockup step={step} color={color} stepIndex={stepIndex} />;
      case 'dashboard':
        return <DashboardMockup step={step} color={color} stepIndex={stepIndex} />;
      case 'form':
        return <FormMockup step={step} color={color} stepIndex={stepIndex} />;
      case 'table':
        return <TableMockup step={step} color={color} stepIndex={stepIndex} />;
      case 'map':
        return <MapMockup step={step} color={color} stepIndex={stepIndex} />;
      default:
        return <FormMockup step={step} color={color} stepIndex={stepIndex} />;
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Step Info */}
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-white mb-2">{step.title}</h3>
        <p className="text-gray-400">{step.description}</p>
        {step.highlight && (
          <span 
            className="inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium text-white"
            style={{ backgroundColor: color }}
          >
            {step.highlight}
          </span>
        )}
      </div>

      {/* Mockup Area */}
      <div className="flex-1 flex items-center justify-center">
        {renderMockup()}
      </div>
    </div>
  );
};

// Chat Mockup
const ChatMockup: React.FC<{ step: DemoStep; color: string; stepIndex: number }> = ({ color, stepIndex }) => {
  const messages = [
    { role: 'user', text: 'My car has engine warning light on' },
    { role: 'ai', text: 'I understand. Let me help diagnose this. What is your vehicle make and model?' },
    { role: 'user', text: 'Maruti Swift 2020' },
    { role: 'ai', text: 'Based on the engine warning light in your Swift, here are the most likely causes:\n\n1. Oxygen sensor issue (45%)\n2. Catalytic converter (25%)\n3. Mass airflow sensor (20%)\n\nEstimated repair: ₹3,500 - ₹8,000' },
  ];

  const visibleMessages = messages.slice(0, Math.min(stepIndex + 1, messages.length));

  return (
    <div className="w-full max-w-md bg-[#1A1A1C] rounded-xl border border-white/10 overflow-hidden">
      <div className="p-3 border-b border-white/10 flex items-center gap-2">
        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: color }}>
          <span className="text-white text-xs font-bold">AI</span>
        </div>
        <span className="text-white text-sm font-medium">EKA-AI Chat</span>
      </div>
      <div className="p-4 space-y-3 h-64 overflow-y-auto">
        {visibleMessages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div 
              className={`max-w-[80%] p-3 rounded-lg text-sm ${
                msg.role === 'user' 
                  ? 'bg-white/10 text-white' 
                  : 'text-white'
              }`}
              style={msg.role === 'ai' ? { backgroundColor: `${color}20` } : {}}
            >
              <pre className="whitespace-pre-wrap font-sans">{msg.text}</pre>
            </div>
          </div>
        ))}
        <div className="flex items-center gap-2 text-gray-400 text-sm">
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: color }}></div>
          <span>EKA-AI is typing...</span>
        </div>
      </div>
    </div>
  );
};

// Dashboard Mockup
const DashboardMockup: React.FC<{ step: DemoStep; color: string; stepIndex: number }> = ({ color, stepIndex }) => {
  return (
    <div className="w-full max-w-lg bg-[#1A1A1C] rounded-xl border border-white/10 overflow-hidden">
      <div className="p-4 border-b border-white/10">
        <span className="text-white font-medium">Brand Performance Dashboard</span>
      </div>
      <div className="p-4 grid grid-cols-3 gap-3">
        {['Maruti', 'Hyundai', 'Tata', 'Honda', 'Toyota', 'Kia'].map((brand, i) => (
          <div 
            key={brand} 
            className={`p-3 rounded-lg border transition-all ${
              i === stepIndex % 6 ? 'border-white/30 bg-white/10' : 'border-white/5 bg-white/5'
            }`}
          >
            <p className="text-white text-sm font-medium">{brand}</p>
            <p className="text-2xl font-bold mt-1" style={{ color }}>{Math.floor(Math.random() * 50 + 20)}%</p>
            <p className="text-gray-400 text-xs">Market Share</p>
          </div>
        ))}
      </div>
      <div className="p-4 border-t border-white/10">
        <div className="h-20 flex items-end gap-1">
          {[40, 65, 45, 80, 55, 70, 90, 60].map((h, i) => (
            <div 
              key={i}
              className="flex-1 rounded-t transition-all"
              style={{ 
                height: `${h}%`, 
                backgroundColor: i === stepIndex % 8 ? color : `${color}40`
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Form Mockup
const FormMockup: React.FC<{ step: DemoStep; color: string; stepIndex: number }> = ({ color, stepIndex }) => {
  const fields = [
    'Vehicle Registration',
    'Customer Name',
    'Phone Number',
    'Service Type',
    'Estimated Cost'
  ];

  return (
    <div className="w-full max-w-md bg-[#1A1A1C] rounded-xl border border-white/10 overflow-hidden">
      <div className="p-4 border-b border-white/10">
        <span className="text-white font-medium">New Inspection Form</span>
      </div>
      <div className="p-4 space-y-3">
        {fields.map((field, i) => (
          <div key={field} className="space-y-1">
            <label className="text-gray-400 text-xs">{field}</label>
            <div 
              className={`h-10 rounded-lg border transition-all flex items-center px-3 ${
                i <= stepIndex % 5 
                  ? 'border-white/20 bg-white/5' 
                  : 'border-white/10'
              }`}
              style={i === stepIndex % 5 ? { borderColor: color } : {}}
            >
              {i <= stepIndex % 5 && (
                <span className="text-white text-sm">
                  {i === 0 ? 'MH01AB1234' : i === 1 ? 'Rahul Sharma' : i === 2 ? '9876543210' : i === 3 ? 'Full Service' : '₹4,500'}
                </span>
              )}
              {i === stepIndex % 5 && (
                <span className="ml-auto animate-pulse" style={{ color }}>|</span>
              )}
            </div>
          </div>
        ))}
        <button 
          className="w-full py-2 rounded-lg text-white font-medium mt-4"
          style={{ backgroundColor: color }}
        >
          Submit Inspection
        </button>
      </div>
    </div>
  );
};

// Table Mockup  
const TableMockup: React.FC<{ step: DemoStep; color: string; stepIndex: number }> = ({ color, stepIndex }) => {
  const rows = [
    { id: 'JC-001', vehicle: 'MH01AB1234', status: 'In Progress', amount: '₹4,500' },
    { id: 'JC-002', vehicle: 'MH02CD5678', status: 'Completed', amount: '₹7,200' },
    { id: 'JC-003', vehicle: 'MH03EF9012', status: 'Pending', amount: '₹3,800' },
    { id: 'JC-004', vehicle: 'MH04GH3456', status: 'Invoiced', amount: '₹5,600' },
  ];

  return (
    <div className="w-full max-w-lg bg-[#1A1A1C] rounded-xl border border-white/10 overflow-hidden">
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <span className="text-white font-medium">Job Cards</span>
        <button 
          className="px-3 py-1 rounded-lg text-white text-sm"
          style={{ backgroundColor: color }}
        >
          + New Job
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left text-gray-400 text-xs p-3">ID</th>
              <th className="text-left text-gray-400 text-xs p-3">Vehicle</th>
              <th className="text-left text-gray-400 text-xs p-3">Status</th>
              <th className="text-right text-gray-400 text-xs p-3">Amount</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr 
                key={row.id}
                className={`border-b border-white/5 transition-all ${
                  i === stepIndex % 4 ? 'bg-white/10' : ''
                }`}
              >
                <td className="p-3 text-white text-sm">{row.id}</td>
                <td className="p-3 text-white text-sm">{row.vehicle}</td>
                <td className="p-3">
                  <span 
                    className="px-2 py-1 rounded text-xs"
                    style={{ 
                      backgroundColor: row.status === 'Completed' ? '#10B98120' : 
                                      row.status === 'In Progress' ? `${color}20` :
                                      row.status === 'Invoiced' ? '#3B82F620' : '#F9731620',
                      color: row.status === 'Completed' ? '#10B981' : 
                             row.status === 'In Progress' ? color :
                             row.status === 'Invoiced' ? '#3B82F6' : '#F97316'
                    }}
                  >
                    {row.status}
                  </span>
                </td>
                <td className="p-3 text-white text-sm text-right">{row.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Map Mockup
const MapMockup: React.FC<{ step: DemoStep; color: string; stepIndex: number }> = ({ color, stepIndex }) => {
  const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Pune', 'Hyderabad'];
  
  return (
    <div className="w-full max-w-lg bg-[#1A1A1C] rounded-xl border border-white/10 overflow-hidden">
      <div className="p-4 border-b border-white/10">
        <span className="text-white font-medium">Regional Coverage</span>
      </div>
      <div className="p-4">
        {/* Simplified India Map */}
        <div className="relative h-48 bg-white/5 rounded-lg overflow-hidden">
          <svg viewBox="0 0 200 200" className="w-full h-full">
            {/* India outline simplified */}
            <path 
              d="M100,20 L140,40 L160,80 L150,120 L140,160 L100,180 L60,160 L50,120 L40,80 L60,40 Z"
              fill={`${color}20`}
              stroke={color}
              strokeWidth="2"
            />
            {/* City dots */}
            {[
              { x: 70, y: 100 },  // Mumbai
              { x: 100, y: 50 },  // Delhi
              { x: 110, y: 130 }, // Bangalore
              { x: 120, y: 150 }, // Chennai
              { x: 80, y: 110 },  // Pune
              { x: 115, y: 115 }, // Hyderabad
            ].map((pos, i) => (
              <g key={i}>
                <circle 
                  cx={pos.x} 
                  cy={pos.y} 
                  r={i === stepIndex % 6 ? 8 : 5}
                  fill={i === stepIndex % 6 ? color : `${color}60`}
                  className="transition-all"
                />
                {i === stepIndex % 6 && (
                  <circle 
                    cx={pos.x} 
                    cy={pos.y} 
                    r="12"
                    fill="none"
                    stroke={color}
                    strokeWidth="2"
                    className="animate-ping"
                  />
                )}
              </g>
            ))}
          </svg>
        </div>
        {/* City Stats */}
        <div className="grid grid-cols-3 gap-2 mt-4">
          {cities.map((city, i) => (
            <div 
              key={city}
              className={`p-2 rounded-lg text-center transition-all ${
                i === stepIndex % 6 ? 'bg-white/10 border border-white/20' : 'bg-white/5'
              }`}
            >
              <p className="text-white text-xs font-medium">{city}</p>
              <p className="text-lg font-bold" style={{ color: i === stepIndex % 6 ? color : '#9CA3AF' }}>
                {Math.floor(Math.random() * 100 + 50)}
              </p>
              <p className="text-gray-400 text-[10px]">Workshops</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DemoModal;
export { FEATURE_DEMOS };
