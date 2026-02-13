import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Calendar, Clock, User, Phone, Mail, Car, Settings,
  CheckCircle, AlertCircle, Wrench, Package, FileText, CreditCard,
  MessageSquare, Camera, Upload, Download, Eye, ChevronDown, ChevronUp,
  Star, Send, MoreVertical, Printer, Share2, Shield,
  MapPin, Hash, Gauge, Battery, Thermometer, Disc, Zap, Circle,
  AlertTriangle, Check, X, Sparkles, Bot, Lightbulb, TrendingDown,
  History, FileCheck, ThumbsUp, Image as ImageIcon, Paperclip, MessageCircle
} from 'lucide-react';
import Button from '../components/shared/Button';
import Badge from '../components/shared/Badge';
import { JobCard, JobCardStatus } from '../types/api.types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface ServiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  status: 'pending' | 'in_progress' | 'completed';
  technician?: string;
}

interface PartItem {
  id: string;
  name: string;
  partNumber: string;
  quantity: number;
  unitPrice: number;
  total: number;
  inStock: boolean;
}

interface TimelineEvent {
  id: string;
  status: string;
  timestamp: string;
  user: string;
  notes?: string;
  isCurrent?: boolean;
  isCompleted?: boolean;
}

interface InsightCard {
  id: string;
  type: 'predictive' | 'diagnostic' | 'cost';
  title: string;
  description: string;
  metric?: string;
  confidence?: number;
  actionText: string;
}

interface HealthScoreItem {
  name: string;
  score: number;
  status: 'good' | 'fair' | 'poor' | 'critical';
}

interface InspectionItem {
  category: string;
  items: {
    name: string;
    status: 'pass' | 'warning' | 'fail';
    note?: string;
  }[];
}

interface DocumentAttachment {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadedAt: string;
}

interface InternalNote {
  id: string;
  author: string;
  timestamp: string;
  message: string;
  isAiGenerated?: boolean;
  hasAttachment?: boolean;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const formatIndianCurrency = (amount: number): string => {
  return '₹' + amount.toLocaleString('en-IN');
};

const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    'RECEIVED': '#6B7280',
    'INSPECTED': '#3B82F6',
    'IN_PROGRESS': '#E8952F',
    'AWAITING_PARTS': '#F59E0B',
    'CUSTOMER_APPROVAL': '#8B5CF6',
    'QC': '#06B6D4',
    'PDI': '#10B981',
    'READY': '#10B981',
    'DELIVERED': '#16A34A',
    'CANCELLED': '#DC2626'
  };
  return colors[status] || '#6B7280';
};

const getHealthScoreColor = (score: number): string => {
  if (score >= 80) return '#16A34A';
  if (score >= 60) return '#E8952F';
  if (score >= 40) return '#F59E0B';
  return '#DC2626';
};

// ============================================================================
// COMPONENTS
// ============================================================================

// --- SLA Timer Component ---
const SLATimer: React.FC<{ targetTime: Date }> = ({ targetTime }) => {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [isOverdue, setIsOverdue] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const diff = targetTime.getTime() - now.getTime();
      
      if (diff <= 0) {
        setIsOverdue(true);
        const overdueDiff = Math.abs(diff);
        setTimeLeft({
          hours: Math.floor(overdueDiff / (1000 * 60 * 60)),
          minutes: Math.floor((overdueDiff % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((overdueDiff % (1000 * 60)) / 1000)
        });
      } else {
        setIsOverdue(false);
        setTimeLeft({
          hours: Math.floor(diff / (1000 * 60 * 60)),
          minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((diff % (1000 * 60)) / 1000)
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [targetTime]);

  const getBorderColor = () => {
    if (isOverdue) return '#DC2626';
    if (timeLeft.hours < 1) return '#DC2626';
    if (timeLeft.hours < 2) return '#E8952F';
    return '#16A34A';
  };

  const getStatusBadge = () => {
    if (isOverdue) return { text: 'Delayed', color: 'red', icon: AlertCircle };
    if (timeLeft.hours < 1) return { text: 'At Risk', color: 'orange', icon: AlertTriangle };
    if (timeLeft.hours < 2) return { text: 'On Track', color: 'orange', icon: Clock };
    return { text: 'On Track', color: 'green', icon: CheckCircle };
  };

  const status = getStatusBadge();

  return (
    <div 
      className="bg-white rounded-xl p-5 border-l-4 shadow-sm"
      style={{ borderLeftColor: getBorderColor() }}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">SLA Timer</h3>
        <Badge variant={status.color as any} size="sm" icon={<status.icon className="w-3 h-3" />}>
          {status.text}
        </Badge>
      </div>
      
      <div className="flex items-baseline gap-1">
        <span 
          className="text-4xl font-bold tabular-nums"
          style={{ color: getBorderColor() }}
        >
          {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
        </span>
      </div>
      
      <div className="flex gap-4 mt-1 text-xs text-gray-400 uppercase tracking-wider">
        <span>hrs</span>
        <span>min</span>
        <span>sec</span>
      </div>
      
      {isOverdue && (
        <div className="mt-3 text-sm text-red-600 font-medium">
          OVERDUE by {timeLeft.hours}h {timeLeft.minutes}m
        </div>
      )}
      
      <div className="mt-3 text-xs text-gray-500">
        Target: {targetTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} IST
      </div>
    </div>
  );
};

// --- Workflow Steps Component ---
const WorkflowSteps: React.FC<{ currentStep: number }> = ({ currentStep }) => {
  const steps = [
    { name: 'Received', icon: CheckCircle },
    { name: 'Inspected', icon: Eye },
    { name: 'In Progress', icon: Wrench },
    { name: 'QC Check', icon: Shield },
    { name: 'Ready', icon: CheckCircle },
    { name: 'Delivered', icon: ThumbsUp }
  ];

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-4">Workflow Status</h3>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const StepIcon = step.icon;
          
          return (
            <React.Fragment key={step.name}>
              <div className="flex flex-col items-center">
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isCompleted 
                      ? 'bg-green-500 text-white' 
                      : isCurrent 
                        ? 'bg-orange-500 text-white animate-pulse' 
                        : 'bg-white border-2 border-gray-300 text-gray-400'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <StepIcon className="w-4 h-4" />
                  )}
                </div>
                <span 
                  className={`text-[10px] uppercase mt-1 font-medium ${
                    isCurrent ? 'text-orange-500' : isCompleted ? 'text-green-600' : 'text-gray-400'
                  }`}
                >
                  {step.name}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div 
                  className={`flex-1 h-0.5 mx-2 ${
                    isCompleted ? 'bg-green-500' : 'border-t-2 border-dashed border-gray-300'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

// --- EKA-AI Insights Panel ---
const EKAInsightsPanel: React.FC = () => {
  const [chatInput, setChatInput] = useState('');
  
  const insights: InsightCard[] = [
    {
      id: '1',
      type: 'predictive',
      title: 'Predictive Maintenance Alert',
      description: 'Based on driving pattern analysis, brake pads will need replacement in ~3,000 km. Customer drives primarily in city traffic with heavy braking.',
      metric: '3,000 km',
      confidence: 94,
      actionText: 'Schedule reminder'
    },
    {
      id: '2',
      type: 'diagnostic',
      title: 'AC Performance Issue',
      description: 'Low cooling efficiency detected. Refrigerant level at 65%. Recommended gas top-up and leak check.',
      metric: 'Priority: Medium',
      actionText: 'View diagnostic'
    },
    {
      id: '3',
      type: 'cost',
      title: 'Cost Optimization',
      description: 'Using OEM brake pads vs aftermarket saves ₹450 in long-term wear. Recommended for next service.',
      metric: 'Save ₹450',
      actionText: 'Apply recommendation'
    }
  ];

  const getBorderColor = (type: string) => {
    switch (type) {
      case 'predictive': return '#E8952F';
      case 'diagnostic': return '#F59E0B';
      case 'cost': return '#16A34A';
      default: return '#E8952F';
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'predictive': return <Sparkles className="w-5 h-5" />;
      case 'diagnostic': return <Bot className="w-5 h-5" />;
      case 'cost': return <TrendingDown className="w-5 h-5" />;
      default: return <Lightbulb className="w-5 h-5" />;
    }
  };

  return (
    <div 
      className="rounded-xl shadow-lg overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #FFFAF5 0%, #FFFFFF 60%, #F3EDF8 100%)'
      }}
    >
      {/* Top Orange Bar */}
      <div 
        className="h-1 w-full"
        style={{ background: 'linear-gradient(90deg, #E8952F, #F5A623, #E8952F)' }}
      />
      
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">EKA-AI Insights</h2>
              <p className="text-sm text-gray-500">AI-powered service recommendations</p>
            </div>
          </div>
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
            style={{ background: '#FEF6EC', border: '2px solid rgba(232,149,47,0.2)' }}
          >
            🐘
          </div>
        </div>

        {/* Insight Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {insights.map((insight) => (
            <div 
              key={insight.id}
              className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
              style={{ borderTop: `4px solid ${getBorderColor(insight.type)}` }}
            >
              <div className="flex items-start justify-between mb-2">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${getBorderColor(insight.type)}15`, color: getBorderColor(insight.type) }}
                >
                  {getIcon(insight.type)}
                </div>
                {insight.confidence && (
                  <div className="text-right">
                    <div className="text-xs text-gray-400">Confidence</div>
                    <div className="flex items-center gap-1">
                      <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full"
                          style={{ width: `${insight.confidence}%`, backgroundColor: getBorderColor(insight.type) }}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-600">{insight.confidence}%</span>
                    </div>
                  </div>
                )}
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{insight.title}</h3>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{insight.description}</p>
              {insight.metric && (
                <div className="text-sm font-bold mb-2" style={{ color: getBorderColor(insight.type) }}>
                  {insight.metric}
                </div>
              )}
              <button className="text-sm font-medium text-orange-500 hover:text-orange-600 flex items-center gap-1">
                {insight.actionText} →
              </button>
            </div>
          ))}
        </div>

        {/* Chat Input */}
        <div 
          className="bg-white rounded-lg p-4"
          style={{ border: '2px dashed rgba(232,149,47,0.3)' }}
        >
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask EKA-AI about this job card..."
              className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-400"
            />
            <Button variant="primary" className="bg-orange-500 hover:bg-orange-600">
              Ask EKA <Send className="w-4 h-4 ml-1" />
            </Button>
          </div>
          <div className="mt-2 text-xs text-gray-400 italic">
            Try: "What's the service history?" • "Compare with market rate" • "When is the next due service?"
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Vehicle Health Score Component ---
const VehicleHealthScore: React.FC = () => {
  const overallScore = 78;
  const healthItems: HealthScoreItem[] = [
    { name: 'Engine', score: 92, status: 'good' },
    { name: 'Brakes', score: 65, status: 'fair' },
    { name: 'Tyres', score: 80, status: 'good' },
    { name: 'AC System', score: 55, status: 'poor' },
    { name: 'Electrical', score: 95, status: 'good' },
    { name: 'Body', score: 88, status: 'good' }
  ];

  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (overallScore / 100) * circumference;

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm">
      <h3 className="text-base font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-100">Vehicle Health Score</h3>
      
      <div className="flex items-center gap-6">
        {/* Circular Score */}
        <div className="relative w-32 h-32 flex-shrink-0">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="45"
              fill="none"
              stroke="#E5E7EB"
              strokeWidth="10"
            />
            <circle
              cx="64"
              cy="64"
              r="45"
              fill="none"
              stroke={getHealthScoreColor(overallScore)}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-gray-900">{overallScore}</span>
            <span className="text-xs text-gray-400">/100</span>
          </div>
        </div>

        {/* Sub-scores */}
        <div className="flex-1 space-y-3">
          {healthItems.map((item) => (
            <div key={item.name} className="flex items-center gap-3">
              <span className="text-sm text-gray-600 w-24">{item.name}</span>
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-500"
                  style={{ 
                    width: `${item.score}%`,
                    backgroundColor: getHealthScoreColor(item.score)
                  }}
                />
              </div>
              <span className="text-sm font-medium w-8 text-right" style={{ color: getHealthScoreColor(item.score) }}>
                {item.score}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 p-3 bg-orange-50 rounded-lg border border-orange-100">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-orange-500" />
          <span className="text-sm font-medium text-orange-800">Good Condition</span>
        </div>
        <p className="text-xs text-orange-700 mt-1">
          Minor attention needed on AC and Brakes. Recommend AC gas top-up and brake pad inspection.
        </p>
      </div>
    </div>
  );
};

// --- Pre-Inspection Checklist Component ---
const PreInspectionChecklist: React.FC = () => {
  const inspections: InspectionItem[] = [
    {
      category: 'Exterior',
      items: [
        { name: 'Body condition', status: 'pass', note: 'No major dents' },
        { name: 'Windshield', status: 'pass', note: 'No cracks' },
        { name: 'Paint scratch', status: 'warning', note: 'Left rear door (pre-existing)' },
        { name: 'Headlights/Taillights', status: 'pass', note: 'Working' },
        { name: 'Tyres', status: 'pass', note: 'Adequate tread' }
      ]
    },
    {
      category: 'Interior',
      items: [
        { name: 'Dashboard', status: 'pass', note: 'No warning lights at entry' },
        { name: 'AC', status: 'warning', note: 'Customer reports weak cooling' },
        { name: 'Seats', status: 'pass', note: 'Good condition' }
      ]
    },
    {
      category: 'Under Hood',
      items: [
        { name: 'Engine oil', status: 'warning', note: 'Low (to be topped up)' },
        { name: 'Coolant', status: 'warning', note: 'Slightly below minimum' },
        { name: 'Battery', status: 'pass', note: 'Clean terminals' },
        { name: 'Brake fluid', status: 'pass', note: 'Adequate' }
      ]
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass': return <Check className="w-4 h-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'fail': return <X className="w-4 h-4 text-red-500" />;
      default: return null;
    }
  };

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm">
      <h3 className="text-base font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-100">Pre-Inspection Checklist</h3>
      
      <div className="space-y-6">
        {inspections.map((category) => (
          <div key={category.category}>
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs">
                {category.category[0]}
              </span>
              {category.category}
            </h4>
            <div className="space-y-2">
              {category.items.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0">
                  {getStatusIcon(item.status)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{item.name}</span>
                      <Badge 
                        variant={item.status === 'pass' ? 'green' : item.status === 'warning' ? 'yellow' : 'red'} 
                        size="sm"
                      >
                        {item.status === 'pass' ? 'OK' : item.status === 'warning' ? '⚠️' : '❌'}
                      </Badge>
                    </div>
                    {item.note && (
                      <p className="text-xs text-gray-500 mt-0.5">{item.note}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Vehicle Photos Grid */}
      <div className="mt-6">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Vehicle Photos</h4>
        <div className="grid grid-cols-2 gap-3">
          {['Front View', 'Rear View', 'Left Side — Scratch ⚠️', 'Odometer'].map((label, idx) => (
            <div 
              key={label}
              className={`aspect-[4/3] rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors ${
                idx === 2 ? 'bg-yellow-50 border-2 border-yellow-200' : 'bg-gray-100 border-2 border-dashed border-gray-300'
              }`}
            >
              <Camera className={`w-8 h-8 mb-2 ${idx === 2 ? 'text-yellow-500' : 'text-gray-400'}`} />
              <span className={`text-xs ${idx === 2 ? 'text-yellow-700' : 'text-gray-500'}`}>{label}</span>
            </div>
          ))}
        </div>
        <button className="mt-3 w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:border-orange-400 hover:text-orange-500 transition-colors flex items-center justify-center gap-2">
          <Upload className="w-4 h-4" />
          Upload More Photos
        </button>
      </div>
    </div>
  );
};

// --- Activity Timeline Component ---
const ActivityTimeline: React.FC = () => {
  const events: TimelineEvent[] = [
    { id: '1', status: 'Job Card Created', timestamp: '2025-01-15T09:00:00', user: 'Rajesh Kumar', isCompleted: true },
    { id: '2', status: 'Vehicle Inspected', timestamp: '2025-01-15T09:30:00', user: 'Suresh M.', notes: 'Pre-inspection completed. AC cooling issue noted.', isCompleted: true },
    { id: '3', status: 'Customer Approved', timestamp: '2025-01-15T11:00:00', user: 'Amit Sharma (Customer)', notes: 'Approved via WhatsApp link', isCompleted: true },
    { id: '4', status: 'Service In Progress', timestamp: '2025-01-15T11:30:00', user: 'Rajesh Kumar', isCurrent: true },
    { id: '5', status: 'QC Check', timestamp: '', user: '', isCompleted: false },
    { id: '6', status: 'Ready for Delivery', timestamp: '', user: '', isCompleted: false }
  ];

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm">
      <h3 className="text-base font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-100">Activity Timeline</h3>
      
      <div className="space-y-0">
        {events.map((event, index) => (
          <div key={event.id} className="flex gap-4">
            {/* Timeline line and dot */}
            <div className="flex flex-col items-center">
              <div 
                className={`w-3 h-3 rounded-full border-2 ${
                  event.isCompleted 
                    ? 'bg-green-500 border-green-500' 
                    : event.isCurrent 
                      ? 'bg-orange-500 border-orange-500 animate-pulse' 
                      : 'bg-white border-gray-300'
                }`}
                style={event.isCurrent ? {
                  boxShadow: '0 0 0 0 rgba(232, 149, 47, 0.5)',
                  animation: 'pulse-orange 2s infinite'
                } : {}}
              />
              {index < events.length - 1 && (
                <div 
                  className={`w-0.5 flex-1 my-1 ${
                    event.isCompleted ? 'bg-green-500' : 'border-l-2 border-dashed border-gray-300'
                  }`}
                />
              )}
            </div>
            
            {/* Content */}
            <div className={`pb-6 flex-1 ${event.isCurrent ? 'bg-orange-50 -mx-2 px-2 py-2 rounded-lg' : ''}`}>
              <div className="flex items-start justify-between">
                <div>
                  <h4 className={`text-sm font-semibold ${event.isCurrent ? 'text-orange-800' : 'text-gray-900'}`}>
                    {event.status}
                    {event.isCurrent && (
                      <span className="ml-2 text-xs font-normal text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">
                        Current
                      </span>
                    )}
                  </h4>
                  {event.user && (
                    <p className="text-xs text-gray-500 mt-0.5">by {event.user}</p>
                  )}
                  {event.notes && (
                    <p className="text-xs text-gray-600 mt-1 italic">"{event.notes}"</p>
                  )}
                </div>
                {event.timestamp && (
                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    {formatDateTime(event.timestamp)}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes pulse-orange {
          0% { box-shadow: 0 0 0 0 rgba(232, 149, 47, 0.5); }
          70% { box-shadow: 0 0 0 10px rgba(232, 149, 47, 0); }
          100% { box-shadow: 0 0 0 0 rgba(232, 149, 47, 0); }
        }
      `}</style>
    </div>
  );
};

// --- Internal Notes Component ---
const InternalNotes: React.FC = () => {
  const [newNote, setNewNote] = useState('');
  const [notes, setNotes] = useState<InternalNote[]>([
    {
      id: '1',
      author: 'Rajesh K.',
      timestamp: '11:15 AM',
      message: 'Oil filter was slightly stuck. Used extra tool. No damage to housing.'
    },
    {
      id: '2',
      author: 'Suresh M.',
      timestamp: '12:40 PM',
      message: 'Front brake pads at 15% life. Customer approved replacement. Rear at 60% — OK for now.',
      hasAttachment: true
    },
    {
      id: '3',
      author: '🤖 EKA-AI',
      timestamp: '12:42 PM',
      message: 'Auto-note: Based on brake wear pattern, customer driving indicates heavy city braking. Recommend ceramic pads next time.',
      isAiGenerated: true
    }
  ]);

  const handleAddNote = () => {
    if (newNote.trim()) {
      setNotes([...notes, {
        id: Date.now().toString(),
        author: 'You',
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        message: newNote
      }]);
      setNewNote('');
    }
  };

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
        <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
          📝 Internal Notes
        </h3>
        <Badge variant="red" size="sm">Workshop Team Only</Badge>
      </div>
      
      {/* Notes List */}
      <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
        {notes.map((note) => (
          <div 
            key={note.id}
            className={`p-3 rounded-lg ${
              note.isAiGenerated 
                ? 'bg-orange-50 border-l-3 border-orange-400' 
                : 'bg-gray-50'
            }`}
            style={note.isAiGenerated ? { borderLeft: '3px solid #E8952F' } : {}}
          >
            <div className="flex items-center justify-between mb-1">
              <span className={`text-xs font-semibold ${note.isAiGenerated ? 'text-orange-700' : 'text-gray-700'}`}>
                {note.author}
              </span>
              <span className="text-xs text-gray-400">{note.timestamp}</span>
            </div>
            <p className="text-sm text-gray-700">{note.message}</p>
            {note.hasAttachment && (
              <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                <Paperclip className="w-3 h-3" />
                <span>Photo attached</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Note Input */}
      <div className="space-y-2">
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Add an internal note..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-orange-400 resize-none"
        />
        <div className="flex items-center justify-between">
          <button className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
            <Paperclip className="w-4 h-4" />
            Attach
          </button>
          <Button variant="secondary" size="sm" onClick={handleAddNote}>
            Add Note
          </Button>
        </div>
      </div>
    </div>
  );
};

// --- Service History Component ---
const ServiceHistory: React.FC = () => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  const history = [
    { id: 'JC-2024-00612', date: '15 Oct 2024', type: 'General Service', km: 45_230, amount: 3200 },
    { id: 'JC-2024-00398', date: '12 Jul 2024', type: 'AC Service', km: 42_150, amount: 2800, hasIssue: true },
    { id: 'JC-2024-00152', date: '05 Mar 2024', type: 'Wheel Alignment', km: 38_900, amount: 800 }
  ];

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm">
      <h3 className="text-base font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-100 flex items-center gap-2">
        <History className="w-4 h-4" />
        Service History
      </h3>
      
      <div className="space-y-2">
        {history.map((item) => (
          <div 
            key={item.id}
            className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
          >
            <div className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-orange-600">{item.id}</span>
                <span className="text-xs text-gray-500">{item.date}</span>
                <span className="text-sm text-gray-700">{item.type}</span>
                {item.hasIssue && (
                  <Badge variant="yellow" size="sm">⚠️ Repeat Issue</Badge>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium tabular-nums">{formatIndianCurrency(item.amount)}</span>
                {expandedId === item.id ? (
                  <ChevronUp className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                )}
              </div>
            </div>
            
            {expandedId === item.id && (
              <div className="px-3 pb-3 pt-0 border-t border-gray-100 bg-gray-50">
                <div className="pt-3 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Odometer Reading:</span>
                    <span className="tabular-nums">{item.km.toLocaleString('en-IN')} km</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Service Type:</span>
                    <span>{item.type}</span>
                  </div>
                  <button className="text-orange-500 text-sm font-medium hover:underline mt-2">
                    View Full Job Card →
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <button className="w-full mt-3 py-2 text-sm text-gray-600 hover:text-orange-500 border border-gray-200 hover:border-orange-300 rounded-lg transition-colors">
        Show All History
      </button>
    </div>
  );
};

// --- Customer Approval Component ---
const CustomerApproval: React.FC = () => {
  const approvedItems = [
    { name: 'General Service', amount: 2800 },
    { name: 'Brake Pad Replacement', amount: 2700 },
    { name: 'AC Gas Top-up', amount: 800 },
    { name: 'Wheel Alignment', amount: 650 }
  ];

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm">
      <h3 className="text-base font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-100">
        Customer Approval
      </h3>
      
      <div className="flex items-center gap-2 mb-4">
        <CheckCircle className="w-5 h-5 text-green-500" />
        <span className="font-semibold text-green-700">Customer Approved</span>
      </div>
      
      <p className="text-sm text-gray-500 mb-4">
        Approved on: 15 Jan 2025, 11:00 AM via WhatsApp link
      </p>
      
      <div className="space-y-2 mb-4">
        {approvedItems.map((item) => (
          <div key={item.name} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              <span className="text-gray-700">{item.name}</span>
            </div>
            <span className="font-medium tabular-nums">{formatIndianCurrency(item.amount)}</span>
          </div>
        ))}
      </div>
      
      <div className="flex justify-between items-center pt-3 border-t border-gray-100 mb-4">
        <span className="font-semibold text-gray-900">Total Approved</span>
        <span className="text-xl font-bold text-orange-500 tabular-nums">{formatIndianCurrency(10302)}</span>
      </div>
      
      {/* Digital Signature */}
      <div className="border-2 border-dashed border-gray-300 bg-gray-50 rounded-lg p-6 text-center">
        <p className="font-semibold text-gray-800 text-lg italic">Amit Sharma</p>
        <p className="text-xs text-gray-500 mt-1">Digitally signed via OTP ✅</p>
        <p className="text-xs text-gray-400 mt-0.5">IP: 49.xxx.xxx.xx</p>
      </div>
    </div>
  );
};

// --- Customer Feedback Component ---
const CustomerFeedback: React.FC = () => {
  const ratings = [
    { label: 'Service Quality', score: 5 },
    { label: 'Value for Money', score: 4 },
    { label: 'Communication', score: 5 },
    { label: 'Timeliness', score: 4 }
  ];

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm">
      <h3 className="text-base font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-100">
        Customer Feedback
      </h3>
      
      {/* Overall Rating */}
      <div className="flex items-center gap-2 mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star 
            key={star} 
            className={`w-6 h-6 ${star <= 5 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
          />
        ))}
        <span className="ml-2 font-semibold text-gray-900">5/5</span>
      </div>
      
      {/* Sub-ratings */}
      <div className="space-y-2 mb-4">
        {ratings.map((rating) => (
          <div key={rating.label} className="flex items-center justify-between text-sm">
            <span className="text-gray-600">{rating.label}</span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star 
                  key={star} 
                  className={`w-3 h-3 ${star <= rating.score ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      
      {/* Review Text */}
      <blockquote className="text-sm text-gray-700 italic border-l-3 border-orange-300 pl-3 mb-3">
        "Very happy with the service. Rajesh explained everything clearly. Will definitely come back."
      </blockquote>
      
      <p className="text-xs text-gray-500">— Amit Sharma, 15 Jan 2025, 6:30 PM</p>
      
      {/* EKA-AI Sentiment */}
      <div className="mt-4 flex items-center gap-2">
        <Bot className="w-4 h-4 text-orange-500" />
        <span className="text-xs text-gray-500">EKA-AI Sentiment:</span>
        <Badge variant="green" size="sm">Positive (98%)</Badge>
      </div>
    </div>
  );
};

// --- Document Attachments Component ---
const DocumentAttachments: React.FC = () => {
  const documents: DocumentAttachment[] = [
    { id: '1', name: 'Customer_Approval_JC2025-00847.pdf', type: 'pdf', size: '245 KB', uploadedAt: '15 Jan 2025' },
    { id: '2', name: 'Vehicle_Front_Photo.jpg', type: 'image', size: '1.2 MB', uploadedAt: '15 Jan 2025' },
    { id: '3', name: 'Vehicle_Scratch_LeftDoor.jpg', type: 'image', size: '890 KB', uploadedAt: '15 Jan 2025' },
    { id: '4', name: 'Odometer_Reading.jpg', type: 'image', size: '560 KB', uploadedAt: '15 Jan 2025' },
    { id: '5', name: 'GST_Invoice_INV-2025-0847.pdf', type: 'pdf', size: '180 KB', uploadedAt: '15 Jan 2025' }
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <FileText className="w-5 h-5 text-red-500" />;
      case 'image': return <ImageIcon className="w-5 h-5 text-blue-500" />;
      default: return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm">
      <h3 className="text-base font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-100">
        Document Attachments
      </h3>
      
      <div className="space-y-2">
        {documents.map((doc) => (
          <div 
            key={doc.id}
            className="flex items-center justify-between py-2 px-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-3">
              {getIcon(doc.type)}
              <div>
                <p className="text-sm font-medium text-gray-700">{doc.name}</p>
                <p className="text-xs text-gray-400">{doc.size} • {doc.uploadedAt}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-1.5 text-gray-400 hover:text-orange-500 transition-colors">
                <Eye className="w-4 h-4" />
              </button>
              <button className="p-1.5 text-gray-400 hover:text-orange-500 transition-colors">
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {/* Upload Area */}
      <div className="mt-4 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-400 transition-colors cursor-pointer">
        <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
        <p className="text-sm text-gray-600">Drop files here or click to upload</p>
      </div>
    </div>
  );
};

// --- Related Job Cards Component ---
const RelatedJobCards: React.FC = () => {
  const related = [
    { id: 'JC-2024-00612', date: '15 Oct 2024', type: 'General Service', badge: 'Previous visit', badgeColor: 'blue' },
    { id: 'JC-2024-00398', date: '12 Jul 2024', type: 'AC Service', badge: '⚠️ Repeat Issue', badgeColor: 'yellow' },
    { id: 'JC-2025-00852', date: '18 Jan 2025', type: 'Hyundai i20', badge: 'Same Owner', badgeColor: 'purple' }
  ];

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm">
      <h3 className="text-base font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-100">
        Related Job Cards
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {related.map((item) => (
          <div 
            key={item.id}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-orange-300 cursor-pointer transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-orange-600">{item.id}</span>
              <Badge 
                variant={item.badgeColor as any} 
                size="sm"
              >
                {item.badge}
              </Badge>
            </div>
            <p className="text-xs text-gray-500 mb-1">{item.date}</p>
            <p className="text-sm text-gray-700 mb-3">{item.type}</p>
            <button className="text-sm text-orange-500 font-medium hover:underline">
              View →
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Cost Breakdown Component ---
const CostBreakdown: React.FC = () => {
  const services: ServiceItem[] = [
    { id: '1', description: 'General Service - 10,000 km', quantity: 1, unitPrice: 2800, total: 2800, status: 'completed', technician: 'Rajesh K.' },
    { id: '2', description: 'Brake Pad Replacement - Front', quantity: 1, unitPrice: 2700, total: 2700, status: 'in_progress', technician: 'Suresh M.' },
    { id: '3', description: 'AC Gas Top-up (R134a)', quantity: 1, unitPrice: 800, total: 800, status: 'pending' },
    { id: '4', description: 'Wheel Alignment & Balancing', quantity: 1, unitPrice: 650, total: 650, status: 'pending' }
  ];

  const parts: PartItem[] = [
    { id: '1', name: 'Brake Pad Set - Front', partNumber: 'BP-HND-CIVIC-F', quantity: 1, unitPrice: 2200, total: 2200, inStock: true },
    { id: '2', name: 'Engine Oil (4L)', partNumber: 'EO-5W30-4L', quantity: 1, unitPrice: 1800, total: 1800, inStock: true },
    { id: '3', name: 'Oil Filter', partNumber: 'OF-HND-001', quantity: 1, unitPrice: 350, total: 350, inStock: true }
  ];

  const serviceTotal = services.reduce((sum, s) => sum + s.total, 0);
  const partsTotal = parts.reduce((sum, p) => sum + p.total, 0);
  const subtotal = serviceTotal + partsTotal;
  const gst = subtotal * 0.18;
  const grandTotal = subtotal + gst;

  const progressPercent = 25;

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
        <h3 className="text-base font-semibold text-gray-900">Cost Breakdown</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Service Progress</span>
          <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full transition-all duration-1000 shimmer"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-xs font-medium text-gray-700">{progressPercent}%</span>
        </div>
      </div>

      {/* Services Table */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <Wrench className="w-4 h-4" />
          Services
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 font-medium text-gray-500">Description</th>
                <th className="text-center py-2 font-medium text-gray-500">Qty</th>
                <th className="text-right py-2 font-medium text-gray-500">Unit Price</th>
                <th className="text-right py-2 font-medium text-gray-500">Total</th>
                <th className="text-center py-2 font-medium text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {services.map((service) => (
                <tr key={service.id} className="border-b border-gray-50 hover:bg-orange-50/50 transition-colors">
                  <td className="py-2">
                    <div>
                      <span className="text-gray-700">{service.description}</span>
                      {service.technician && (
                        <span className="text-xs text-gray-400 block">by {service.technician}</span>
                      )}
                    </div>
                  </td>
                  <td className="text-center py-2 tabular-nums">{service.quantity}</td>
                  <td className="text-right py-2 tabular-nums">{formatIndianCurrency(service.unitPrice)}</td>
                  <td className="text-right py-2 font-medium tabular-nums">{formatIndianCurrency(service.total)}</td>
                  <td className="text-center py-2">
                    <Badge 
                      variant={service.status === 'completed' ? 'green' : service.status === 'in_progress' ? 'orange' : 'gray'} 
                      size="sm"
                    >
                      {service.status.replace('_', ' ')}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="text-right mt-2 text-sm font-medium text-gray-700">
          Services Subtotal: <span className="tabular-nums">{formatIndianCurrency(serviceTotal)}</span>
        </div>
      </div>

      {/* Parts Table */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <Package className="w-4 h-4" />
          Parts & Inventory
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 font-medium text-gray-500">Part Name</th>
                <th className="text-left py-2 font-medium text-gray-500">Part #</th>
                <th className="text-center py-2 font-medium text-gray-500">Qty</th>
                <th className="text-right py-2 font-medium text-gray-500">Unit Price</th>
                <th className="text-right py-2 font-medium text-gray-500">Total</th>
                <th className="text-center py-2 font-medium text-gray-500">Stock</th>
              </tr>
            </thead>
            <tbody>
              {parts.map((part) => (
                <tr key={part.id} className="border-b border-gray-50 hover:bg-orange-50/50 transition-colors">
                  <td className="py-2 text-gray-700">{part.name}</td>
                  <td className="py-2 text-gray-500 text-xs">{part.partNumber}</td>
                  <td className="text-center py-2 tabular-nums">{part.quantity}</td>
                  <td className="text-right py-2 tabular-nums">{formatIndianCurrency(part.unitPrice)}</td>
                  <td className="text-right py-2 font-medium tabular-nums">{formatIndianCurrency(part.total)}</td>
                  <td className="text-center py-2">
                    {part.inStock ? (
                      <span className="text-green-500 text-xs">✓ In Stock</span>
                    ) : (
                      <span className="text-red-500 text-xs">✗ Out</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="text-right mt-2 text-sm font-medium text-gray-700">
          Parts Subtotal: <span className="tabular-nums">{formatIndianCurrency(partsTotal)}</span>
        </div>
      </div>

      {/* Totals */}
      <div className="border-t border-gray-200 pt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-medium tabular-nums">{formatIndianCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">GST (18%)</span>
          <span className="font-medium tabular-nums">{formatIndianCurrency(Math.round(gst))}</span>
        </div>
        <div className="flex justify-between items-center pt-3 border-t border-gray-200">
          <span className="text-base font-bold text-gray-900">Grand Total</span>
          <span className="text-2xl font-bold text-orange-500 tabular-nums">{formatIndianCurrency(Math.round(grandTotal))}</span>
        </div>
      </div>

      <style>{`
        .shimmer {
          background: linear-gradient(90deg, #E8952F 0%, #F5A623 50%, #E8952F 100%);
          background-size: 200px 100%;
          animation: shimmer 2s infinite linear;
        }
        @keyframes shimmer {
          0% { background-position: -200px 0; }
          100% { background-position: 200px 0; }
        }
      `}</style>
    </div>
  );
};

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

const JobCardDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [jobCard, setJobCard] = useState<JobCard | null>(null);
  const [loading, setLoading] = useState(true);

  // Mock data - in real app, fetch from API
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setJobCard({
        id: id || 'JC-2025-00847',
        workshop_id: 'ws-123',
        vehicle_id: 'veh-456',
        registration_number: 'KA-01-MG-1234',
        customer_name: 'Amit Sharma',
        customer_phone: '+91 98765 43210',
        customer_email: 'amit.sharma@email.com',
        symptoms: ['AC not cooling', 'Brake noise'],
        reported_issues: 'Customer reports weak AC cooling and squeaking noise from front brakes',
        status: 'IN_PROGRESS' as JobCardStatus,
        priority: 'NORMAL',
        created_at: '2025-01-15T09:00:00',
        updated_at: '2025-01-15T11:30:00',
        created_by: 'user-123',
        allowed_transitions: ['PDI', 'CANCELLED'],
        state_history: [],
        vehicle_details: 'Honda City 2022 Petrol'
      });
      setLoading(false);
    }, 500);
  }, [id]);

  // Calculate target delivery time (today 5 PM)
  const targetTime = new Date();
  targetTime.setHours(17, 0, 0, 0);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!jobCard) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Job card not found</p>
          <Button variant="primary" onClick={() => navigate('/job-cards')} className="mt-4">
            Back to Job Cards
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Print Styles */}
      <style>{`
        @media print {
          nav, .no-print, .quick-actions-bar, button, .chat-input, .upload-area {
            display: none !important;
          }
          * {
            box-shadow: none !important;
            text-shadow: none !important;
          }
          body {
            background: white !important;
            color: black !important;
            font-size: 12px !important;
          }
          .card {
            border: 1px solid #ccc !important;
            box-shadow: none !important;
            break-inside: avoid;
          }
          .cost-breakdown-section {
            page-break-before: always;
          }
          .signature-section {
            page-break-before: always;
          }
          h1, h2, h3, h4, h5, h6, p, span, td, th, li {
            color: #000 !important;
          }
        }
        
        *:focus-visible {
          outline: 2px solid #E8952F;
          outline-offset: 2px;
          border-radius: 4px;
        }
        
        .card {
          transition: transform 200ms ease, box-shadow 200ms ease;
        }
        .card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -1px rgba(0,0,0,0.04);
        }
      `}</style>

      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate('/job-cards')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">{jobCard.id}</h1>
                  <p className="text-xs text-gray-500">Job Card Detail</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={handlePrint}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Printer className="w-4 h-4" />
                Print
              </button>
              <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                <Share2 className="w-4 h-4" />
                Share
              </button>
              <button 
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors"
                style={{ background: '#25D366' }}
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Quick Actions Bar */}
        <div className="quick-actions-bar mb-6 no-print">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-600">Status:</span>
                <Badge 
                  variant="orange" 
                  size="md"
                  className="animate-pulse"
                >
                  <Wrench className="w-3 h-3 mr-1" />
                  In Progress
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <MessageSquare className="w-4 h-4 mr-1" />
                  Message Customer
                </Button>
                <Button variant="outline" size="sm">
                  <Camera className="w-4 h-4 mr-1" />
                  Add Photo
                </Button>
                <Button variant="primary" size="sm">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Mark Complete
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Top Section: Vehicle Info + SLA + Workflow */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Vehicle & Customer Info */}
          <div className="lg:col-span-2 bg-white rounded-xl p-5 shadow-sm card">
            <h3 className="text-base font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-100">
              Vehicle & Customer Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Vehicle Info */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Car className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-gray-900">{jobCard.vehicle_details || 'Vehicle Details'}</p>
                    <p className="text-sm text-gray-500">2022 • Petrol</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Hash className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">Reg:</span>
                    <span className="font-medium text-gray-900 font-mono">{jobCard.registration_number}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Gauge className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">Odometer:</span>
                    <span className="font-medium text-gray-900 tabular-nums">45,230 km</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">Last Service:</span>
                    <span className="font-medium text-gray-900">15 Oct 2024</span>
                  </div>
                </div>
              </div>

              {/* Customer Info */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <User className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-gray-900">{jobCard.customer_name}</p>
                    <p className="text-sm text-gray-500">Customer since 2022</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">Phone:</span>
                    <span className="font-medium text-gray-900">{jobCard.customer_phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium text-gray-900">amit.sharma@email.com</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">Address:</span>
                    <span className="font-medium text-gray-900">Koramangala, Bangalore</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SLA Timer */}
          <SLATimer targetTime={targetTime} />
        </div>

        {/* Workflow Steps */}
        <div className="mb-6 no-print">
          <WorkflowSteps currentStep={3} />
        </div>

        {/* EKA-AI Insights Panel */}
        <div className="mb-6">
          <EKAInsightsPanel />
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            <PreInspectionChecklist />
            <VehicleHealthScore />
            <ActivityTimeline />
          </div>

          {/* Middle Column */}
          <div className="space-y-6">
            <div className="cost-breakdown-section">
              <CostBreakdown />
            </div>
            <InternalNotes />
            <CustomerApproval />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <CustomerFeedback />
            <DocumentAttachments />
            <ServiceHistory />
            <RelatedJobCards />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-12 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h4 className="text-lg font-bold mb-2">
                <span className="text-purple-400">Go4Garage</span>{' '}
                <span className="text-gray-400 font-normal">Private Limited</span>
              </h4>
              <p className="text-sm text-gray-400">#123, Industrial Area, Phase 2</p>
              <p className="text-sm text-gray-400">HSR Layout, Bangalore, Karnataka 560102</p>
              <p className="text-sm text-gray-400 mt-2">+91 80 4567 8900</p>
              <p className="text-sm text-gray-400">support@go4garage.com</p>
            </div>
            <div>
              <h4 className="text-xl font-bold mb-2" style={{ color: '#E8952F' }}>eka-ai</h4>
              <p className="text-sm text-gray-400">Governed Intelligence for Automobiles</p>
              <p className="text-xs text-gray-500 mt-2">Version: EKA-AI Core v3.2</p>
              <p className="text-xs text-gray-500">Build: 2025.01.15</p>
            </div>
            <div>
              <div className="flex flex-wrap gap-3 text-sm">
                <a href="#" className="text-gray-400 hover:text-white">Privacy Policy</a>
                <span className="text-gray-600">|</span>
                <a href="#" className="text-gray-400 hover:text-white">Terms of Service</a>
                <span className="text-gray-600">|</span>
                <a href="#" className="text-gray-400 hover:text-white">Support</a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-6 flex flex-wrap items-center justify-between gap-4 text-xs text-gray-500">
            <span>© 2025 Go4Garage Private Limited. All rights reserved.</span>
            <span>Made in India 🇮🇳 with 🧡 by EKA-AI</span>
            <span>GSTIN: 29AABCG1234A1Z5 | CIN: U72200KA2022PTC12345</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default JobCardDetailPage;
