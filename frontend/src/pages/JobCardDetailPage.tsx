import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Bell, ChevronDown, Phone, MessageCircle, Printer, Download, FileText,
  Receipt, Check, Clock, AlertTriangle, ChevronRight, Plus, Eye, Camera,
  Upload, Paperclip, Star, Send, ChevronUp, ExternalLink, Mail, MapPin,
  Fuel, Calendar, Shield, Activity, Wrench, Package, CreditCard, Brain,
  Heart, History, MessageSquare, PenTool, ThumbsUp, File, Link2, Settings
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface TimelineItem {
  id: number;
  time: string;
  description: string;
  actor: string;
  status: 'completed' | 'current' | 'pending' | 'ai';
}

interface ServiceItem {
  id: number;
  type: string;
  description: string;
  technician: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'completed' | 'in-progress' | 'queued' | 'on-hold';
  estTime: string;
  actualTime: string;
}

interface PartItem {
  id: number;
  name: string;
  partNumber: string;
  category: string;
  qty: string;
  unitPrice: number;
  total: number;
  warranty: string;
  availability: 'in-stock' | 'low-stock' | 'ordered' | 'out-of-stock';
  availabilityNote?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SAMPLE DATA
// ═══════════════════════════════════════════════════════════════════════════════

const sampleTimeline: TimelineItem[] = [
  { id: 1, time: '10:30 AM', description: 'Job card created', actor: 'Priya (Front Desk)', status: 'completed' },
  { id: 2, time: '10:35 AM', description: 'Payment received: ₹5,000 (UPI)', actor: 'System', status: 'completed' },
  { id: 3, time: '10:40 AM', description: 'Vehicle moved to Bay #3', actor: 'Rajesh K.', status: 'completed' },
  { id: 4, time: '10:45 AM', description: 'Pre-inspection checklist completed', actor: 'Rajesh K.', status: 'completed' },
  { id: 5, time: '10:50 AM', description: 'EKA-AI scan complete: 3 insights generated', actor: 'EKA-AI 🤖', status: 'ai' },
  { id: 6, time: '11:00 AM', description: 'General service started', actor: 'Rajesh K.', status: 'completed' },
  { id: 7, time: '12:30 PM', description: 'General service completed (1h 45m)', actor: 'Rajesh K.', status: 'completed' },
  { id: 8, time: '12:35 PM', description: 'Brake inspection started', actor: 'Suresh M.', status: 'current' },
  { id: 9, time: 'Pending', description: 'AC service', actor: 'Vijay R.', status: 'pending' },
  { id: 10, time: 'Pending', description: 'Wheel alignment', actor: 'Rajesh K.', status: 'pending' },
  { id: 11, time: 'Pending', description: 'Quality check', actor: 'Supervisor', status: 'pending' },
  { id: 12, time: 'Pending', description: 'Customer notification', actor: 'System', status: 'pending' },
  { id: 13, time: 'Pending', description: 'Vehicle delivery', actor: 'Front Desk', status: 'pending' },
];

const sampleServices: ServiceItem[] = [
  { id: 1, type: 'General Service', description: 'Full car servicing — oil change, filter replacement, multi-point check', technician: 'Rajesh K.', priority: 'normal', status: 'completed', estTime: '2h 00m', actualTime: '1h 45m' },
  { id: 2, type: 'Brake Inspection & Repair', description: 'Front & rear brake pad inspection. Front pads replaced.', technician: 'Suresh M.', priority: 'high', status: 'in-progress', estTime: '1h 00m', actualTime: '0h 40m...' },
  { id: 3, type: 'AC Service & Gas Top-up', description: 'AC gas refill (R134a), cooling coil cleaning, cabin filter check', technician: 'Vijay R.', priority: 'normal', status: 'queued', estTime: '1h 30m', actualTime: '—' },
  { id: 4, type: 'Wheel Alignment & Balancing', description: '4-wheel computerized alignment + balancing', technician: 'Rajesh K.', priority: 'low', status: 'queued', estTime: '0h 45m', actualTime: '—' },
];

const sampleParts: PartItem[] = [
  { id: 1, name: 'Engine Oil 5W-30 (Castrol)', partNumber: 'OIL-5W30-4L', category: 'Lubricant', qty: '4 L', unitPrice: 350, total: 1400, warranty: '—', availability: 'in-stock' },
  { id: 2, name: 'Oil Filter (Genuine)', partNumber: 'FLT-MSZ-OIL-22', category: 'Filter', qty: '1', unitPrice: 280, total: 280, warranty: '6 months', availability: 'in-stock' },
  { id: 3, name: 'Front Brake Pad Set (Brembo)', partNumber: 'BRK-FRT-SWF-B', category: 'Brake', qty: '1 set', unitPrice: 2200, total: 2200, warranty: '12 months', availability: 'in-stock' },
  { id: 4, name: 'AC Gas R134a', partNumber: 'ACG-R134A-1KG', category: 'AC', qty: '1 kg', unitPrice: 650, total: 650, warranty: '—', availability: 'low-stock', availabilityNote: '2 left' },
  { id: 5, name: 'Cabin Air Filter', partNumber: 'FLT-CAB-SWF', category: 'Filter', qty: '1', unitPrice: 380, total: 380, warranty: '—', availability: 'ordered', availabilityNote: 'ETA: Tomorrow' },
];

// ═══════════════════════════════════════════════════════════════════════════════
// STYLE CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

const styles = {
  // Colors
  ekaOrange: '#E8952F',
  ekaOrangeHover: '#CC7A1A',
  ekaOrangeLight: '#FEF6EC',
  ekaOrangeSuperLight: '#FFFAF5',
  ekaOrangeBorder: 'rgba(232, 149, 47, 0.2)',
  g4gPurple: '#5B2D8E',
  g4gPurpleLight: '#F3EDF8',
  g4gGreen: '#3CB44B',
  white: '#FFFFFF',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',
  success: '#16A34A',
  successLight: '#ECFDF5',
  successBorder: '#BBF7D0',
  error: '#DC2626',
  errorLight: '#FEF2F2',
  errorBorder: '#FECACA',
  warning: '#F59E0B',
  warningLight: '#FFFBEB',
  warningBorder: '#FDE68A',
  info: '#2563EB',
  infoLight: '#EFF6FF',
  infoBorder: '#BFDBFE',
  
  // Shadows
  shadowSm: '0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)',
  shadowMd: '0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -1px rgba(0, 0, 0, 0.04)',
  shadowLg: '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04)',
  shadowOrange: '0 4px 14px rgba(232, 149, 47, 0.25)',
  
  // Typography
  fontPrimary: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  fontMono: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
};

// ═══════════════════════════════════════════════════════════════════════════════
// UTILITY COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

const formatCurrency = (amount: number): string => {
  return '₹' + amount.toLocaleString('en-IN');
};

const Badge: React.FC<{
  children: React.ReactNode;
  variant: 'orange' | 'purple' | 'success' | 'error' | 'warning' | 'info' | 'gray';
  size?: 'sm' | 'md';
  pulse?: boolean;
}> = ({ children, variant, size = 'md', pulse }) => {
  const variantStyles: Record<string, React.CSSProperties> = {
    orange: { background: styles.ekaOrangeLight, color: styles.ekaOrange, border: `1px solid ${styles.ekaOrangeBorder}` },
    purple: { background: styles.g4gPurpleLight, color: styles.g4gPurple, border: `1px solid rgba(91, 45, 142, 0.2)` },
    success: { background: styles.successLight, color: styles.success, border: `1px solid ${styles.successBorder}` },
    error: { background: styles.errorLight, color: styles.error, border: `1px solid ${styles.errorBorder}` },
    warning: { background: styles.warningLight, color: styles.warning, border: `1px solid ${styles.warningBorder}` },
    info: { background: styles.infoLight, color: styles.info, border: `1px solid ${styles.infoBorder}` },
    gray: { background: styles.gray100, color: styles.gray500, border: `1px solid ${styles.gray200}` },
  };

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: size === 'sm' ? '3px 10px' : '5px 14px',
      borderRadius: '9999px',
      fontSize: size === 'sm' ? '11px' : '12px',
      fontWeight: 600,
      ...variantStyles[variant],
    }}>
      {pulse && (
        <span style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: 'currentColor',
          animation: 'pulse-dot 1.5s ease-in-out infinite',
        }} />
      )}
      {children}
    </span>
  );
};

const Card: React.FC<{
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  hover?: boolean;
}> = ({ children, style, hover = true }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => hover && setIsHovered(true)}
      onMouseLeave={() => hover && setIsHovered(false)}
      style={{
        background: styles.white,
        border: `1px solid ${styles.gray200}`,
        borderRadius: '12px',
        boxShadow: isHovered ? styles.shadowMd : styles.shadowSm,
        padding: '24px',
        transition: 'box-shadow 200ms ease, transform 200ms ease',
        transform: isHovered ? 'translateY(-2px)' : 'none',
        ...style,
      }}
    >
      {children}
    </div>
  );
};

const Button: React.FC<{
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  onClick?: () => void;
  fullWidth?: boolean;
  style?: React.CSSProperties;
}> = ({ children, variant = 'outline', size = 'md', icon, onClick, fullWidth, style }) => {
  const [isHovered, setIsHovered] = useState(false);

  const variantStyles: Record<string, React.CSSProperties> = {
    primary: { background: isHovered ? styles.ekaOrangeHover : styles.ekaOrange, color: styles.white, border: 'none' },
    secondary: { background: isHovered ? '#4A2375' : styles.g4gPurple, color: styles.white, border: 'none' },
    success: { background: isHovered ? '#15803d' : styles.success, color: styles.white, border: 'none' },
    outline: { background: isHovered ? styles.gray50 : styles.white, color: styles.gray700, border: `1px solid ${styles.gray300}` },
    ghost: { background: isHovered ? styles.gray50 : 'transparent', color: styles.gray500, border: 'none' },
  };

  const sizeStyles: Record<string, React.CSSProperties> = {
    sm: { padding: '6px 14px', fontSize: '13px', minHeight: '36px' },
    md: { padding: '8px 16px', fontSize: '14px', minHeight: '40px' },
    lg: { padding: '10px 20px', fontSize: '15px', minHeight: '44px' },
  };

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        borderRadius: '8px',
        fontWeight: 500,
        cursor: 'pointer',
        transition: 'all 200ms ease',
        transform: isHovered ? 'translateY(-1px)' : 'none',
        boxShadow: isHovered ? styles.shadowSm : 'none',
        width: fullWidth ? '100%' : 'auto',
        fontFamily: styles.fontPrimary,
        ...sizeStyles[size],
        ...variantStyles[variant],
        ...style,
      }}
    >
      {icon}
      {children}
    </button>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 1: TOP NAVIGATION BAR
// ═══════════════════════════════════════════════════════════════════════════════

const TopNavBar: React.FC = () => {
  const navigate = useNavigate();
  const navLinks = ['Dashboard', 'Job Cards', 'Customers', 'Inventory', 'Reports', 'Analytics'];
  const [activeLink, setActiveLink] = useState('Job Cards');

  return (
    <header className="no-print" style={{
      position: 'sticky',
      top: 0,
      zIndex: 200,
      background: styles.white,
      borderBottom: `1px solid ${styles.gray200}`,
      height: '64px',
      boxShadow: styles.shadowSm,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 32px',
    }}>
      {/* Logo Area */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: '20px', fontWeight: 700, fontFamily: styles.fontPrimary }}>
          <span style={{ color: styles.g4gPurple }}>Go</span>
          <span style={{ color: styles.g4gGreen }}>4</span>
          <span style={{ color: styles.g4gPurple }}>Garage</span>
        </div>
        <div style={{ fontSize: '11px', color: styles.gray400, display: 'flex', alignItems: 'center', gap: '4px' }}>
          Powered by <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: styles.ekaOrange, display: 'inline-block' }} /> EKA-AI
        </div>
      </div>

      {/* Navigation Links */}
      <nav style={{ display: 'flex', gap: '4px' }}>
        {navLinks.map((link) => (
          <button
            key={link}
            onClick={() => {
              setActiveLink(link);
              if (link === 'Dashboard') navigate('/dashboard');
              if (link === 'Job Cards') navigate('/job-cards');
            }}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: activeLink === link ? 600 : 500,
              color: activeLink === link ? styles.ekaOrange : styles.gray500,
              background: activeLink === link ? 'transparent' : 'transparent',
              border: 'none',
              borderBottom: activeLink === link ? `2px solid ${styles.ekaOrange}` : '2px solid transparent',
              borderRadius: activeLink === link ? '0' : '6px',
              cursor: 'pointer',
              transition: 'all 150ms ease',
              fontFamily: styles.fontPrimary,
            }}
            onMouseEnter={(e) => {
              if (activeLink !== link) {
                e.currentTarget.style.color = styles.gray700;
                e.currentTarget.style.background = styles.gray50;
              }
            }}
            onMouseLeave={(e) => {
              if (activeLink !== link) {
                e.currentTarget.style.color = styles.gray500;
                e.currentTarget.style.background = 'transparent';
              }
            }}
          >
            {link}
          </button>
        ))}
      </nav>

      {/* Right Side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          background: styles.gray100,
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
        }}>
          <Search size={16} color={styles.gray500} />
        </button>

        <button style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          background: styles.gray100,
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          position: 'relative',
        }}>
          <Bell size={16} color={styles.gray500} />
          <span style={{
            position: 'absolute',
            top: '-2px',
            right: '-2px',
            width: '18px',
            height: '18px',
            borderRadius: '50%',
            background: styles.error,
            color: styles.white,
            fontSize: '9px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>3</span>
        </button>

        <div style={{ width: '1px', height: '24px', background: styles.gray200 }} />

        <span style={{ color: styles.gray700, fontSize: '13px', fontWeight: 500 }}>AutoCare Workshop</span>

        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          background: styles.ekaOrangeLight,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '13px',
          fontWeight: 600,
          color: styles.ekaOrange,
        }}>WS</div>

        <ChevronDown size={14} color={styles.gray400} />
      </div>
    </header>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 2: JOB CARD HEADER + SLA TIMER
// ═══════════════════════════════════════════════════════════════════════════════

const JobCardHeader: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 32, seconds: 15 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { hours, minutes, seconds } = prev;
        if (seconds > 0) {
          seconds--;
        } else if (minutes > 0) {
          minutes--;
          seconds = 59;
        } else if (hours > 0) {
          hours--;
          minutes = 59;
          seconds = 59;
        }
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (n: number) => n.toString().padStart(2, '0');

  return (
    <div style={{
      background: styles.white,
      padding: '24px 32px 20px',
      borderBottom: `1px solid ${styles.gray200}`,
    }}>
      {/* Breadcrumb */}
      <div style={{ marginBottom: '16px', fontSize: '13px' }}>
        <span style={{ color: styles.gray400, cursor: 'pointer' }} 
          onMouseEnter={(e) => e.currentTarget.style.color = styles.ekaOrange}
          onMouseLeave={(e) => e.currentTarget.style.color = styles.gray400}>
          Dashboard
        </span>
        <span style={{ color: styles.gray300 }}> / </span>
        <span style={{ color: styles.gray400, cursor: 'pointer' }}
          onMouseEnter={(e) => e.currentTarget.style.color = styles.ekaOrange}
          onMouseLeave={(e) => e.currentTarget.style.color = styles.gray400}>
          Job Cards
        </span>
        <span style={{ color: styles.gray300 }}> / </span>
        <span style={{ color: styles.gray700, fontWeight: 500 }}>JC-2025-00847</span>
      </div>

      {/* Title + SLA */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
            <h1 style={{ 
              fontSize: '28px', 
              fontWeight: 700, 
              color: styles.gray900,
              margin: 0,
              fontFamily: styles.fontPrimary,
            }}>
              JC-2025-00847
            </h1>
            <Badge variant="orange" pulse>In Progress</Badge>
            <Badge variant="error">High Priority</Badge>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ color: styles.gray400, fontSize: '13px' }}>
              Created: 15 Jan 2025, 10:30 AM by Priya (Front Desk)
            </span>
            <span style={{ color: styles.gray500, fontSize: '13px' }}>
              Bay #3 • Senior Technician: Rajesh Kumar
            </span>
            <span style={{ color: styles.gray400, fontSize: '12px', fontStyle: 'italic' }}>
              Last Updated: 2 min ago
            </span>
          </div>
        </div>

        {/* SLA Timer */}
        <div style={{
          background: styles.white,
          border: `1px solid ${styles.gray200}`,
          borderLeft: `4px solid ${styles.success}`,
          borderRadius: '12px',
          padding: '16px 24px',
          minWidth: '240px',
          boxShadow: styles.shadowSm,
        }}>
          <div style={{ 
            fontSize: '11px', 
            color: styles.gray500, 
            textTransform: 'uppercase', 
            letterSpacing: '0.05em',
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}>
            <Clock size={14} /> PROMISED DELIVERY
          </div>
          <div style={{ 
            fontFamily: styles.fontMono, 
            fontSize: '28px', 
            fontWeight: 700, 
            color: styles.gray900,
            marginBottom: '4px',
          }}>
            {formatTime(timeLeft.hours)} : {formatTime(timeLeft.minutes)} : {formatTime(timeLeft.seconds)}
          </div>
          <div style={{ 
            display: 'flex', 
            gap: '16px', 
            fontSize: '10px', 
            color: styles.gray400, 
            textTransform: 'uppercase',
            marginBottom: '12px',
          }}>
            <span>hrs</span>
            <span style={{ marginLeft: '8px' }}>min</span>
            <span style={{ marginLeft: '12px' }}>sec</span>
          </div>
          <div style={{ fontSize: '12px', color: styles.gray500, marginBottom: '8px' }}>
            Due: Today, 5:00 PM
          </div>
          <Badge variant="success" size="sm">
            <Check size={12} /> On Track
          </Badge>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 3: QUICK ACTIONS BAR
// ═══════════════════════════════════════════════════════════════════════════════

const QuickActionsBar: React.FC = () => {
  const workflowSteps = [
    { label: 'Received', completed: true },
    { label: 'Inspected', completed: true },
    { label: 'In Progress', completed: false, current: true },
    { label: 'QC Check', completed: false },
    { label: 'Ready', completed: false },
    { label: 'Delivered', completed: false },
  ];

  return (
    <div className="no-print" style={{
      background: styles.gray50,
      padding: '12px 32px',
      borderBottom: `1px solid ${styles.gray200}`,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    }}>
      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <Button size="sm" icon={<Phone size={14} />}>Call Customer</Button>
        <Button size="sm" variant="primary" icon={<MessageCircle size={14} />} style={{ background: '#25D366' }}>WhatsApp Update</Button>
        <Button size="sm" icon={<Printer size={14} />}>Print Job Card</Button>
        <Button size="sm" icon={<Download size={14} />}>Export PDF</Button>
        <Button size="sm" icon={<FileText size={14} />}>Gate Pass</Button>
        <Button size="sm" variant="secondary" icon={<Receipt size={14} />}>Generate Invoice</Button>
      </div>

      {/* Workflow Steps */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {workflowSteps.map((step, index) => (
          <React.Fragment key={step.label}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: step.completed ? styles.success : step.current ? styles.ekaOrange : styles.gray300,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                animation: step.current ? 'pulse-orange 2s infinite' : 'none',
              }}>
                {step.completed && <Check size={12} color={styles.white} />}
              </div>
              <span style={{
                fontSize: '10px',
                color: step.current ? styles.ekaOrange : styles.gray500,
                fontWeight: step.current ? 600 : 400,
                marginTop: '4px',
              }}>{step.label}</span>
            </div>
            {index < workflowSteps.length - 1 && (
              <div style={{
                width: '32px',
                height: '2px',
                background: step.completed ? styles.success : styles.gray300,
                borderStyle: step.completed ? 'solid' : 'dashed',
                marginBottom: '20px',
              }} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 4: VEHICLE & CUSTOMER INFO
// ═══════════════════════════════════════════════════════════════════════════════

const VehicleCustomerInfo: React.FC = () => {
  return (
    <div style={{
      padding: '24px 32px',
      background: styles.gray50,
      display: 'grid',
      gridTemplateColumns: '3fr 2fr',
      gap: '24px',
    }}>
      {/* Vehicle Information Card */}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>🚗</span>
            <span style={{ color: styles.gray800, fontSize: '16px', fontWeight: 600 }}>Vehicle Information</span>
          </div>
          <Badge variant="success" size="sm">
            <Check size={10} /> EKA-AI Verified
          </Badge>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          {[
            { label: 'Registration No.', value: 'KA 01 AB 1234' },
            { label: 'Make & Model', value: 'Maruti Suzuki Swift VXi' },
            { label: 'Manufacturing Year', value: '2022' },
            { label: 'Fuel Type', value: <><span style={{ width: '8px', height: '8px', borderRadius: '50%', background: styles.success, display: 'inline-block', marginRight: '6px' }} />Petrol</> },
            { label: 'Chassis/VIN', value: <span style={{ fontFamily: styles.fontMono }}>MA3FJEB1S00XXXXXX</span> },
            { label: 'Engine No.', value: <span style={{ fontFamily: styles.fontMono }}>K12MN-XXXXXXX</span> },
            { label: 'Odometer Reading', value: '32,450 km' },
            { label: 'Color', value: <><span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#F5F5F5', border: `1px solid ${styles.gray300}`, display: 'inline-block', marginRight: '6px' }} />Pearl White</> },
            { label: 'Insurance Valid Till', value: <><span style={{ color: styles.warning }}>⚠️</span> 15 March 2025</> },
            { label: 'PUC Valid Till', value: '22 June 2025' },
            { label: 'Last Service', value: '15 Oct 2024 at 28,200 km' },
            { label: 'Tyre Condition', value: 'Front: Good | Rear: Fair' },
          ].map((item, idx) => (
            <div key={idx}>
              <div style={{ fontSize: '11px', color: styles.gray400, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
                {item.label}
              </div>
              <div style={{ fontSize: '14px', color: styles.gray900, fontWeight: 500 }}>
                {item.value}
              </div>
            </div>
          ))}
        </div>

        {/* AI Note */}
        <div style={{
          background: styles.ekaOrangeSuperLight,
          borderLeft: `3px solid ${styles.ekaOrange}`,
          borderRadius: '0 6px 6px 0',
          padding: '12px 16px',
          fontSize: '13px',
          color: styles.gray600,
        }}>
          <span style={{ fontWeight: 600 }}>🤖 EKA-AI Note:</span> Vehicle has completed 32,450 km. Next major service at 40,000 km. Insurance renewal due in 59 days. Recommend reminding customer during delivery.
        </div>
      </Card>

      {/* Customer Information Card */}
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: styles.g4gPurpleLight,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            fontWeight: 600,
            color: styles.g4gPurple,
          }}>AS</div>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 600, color: styles.gray900 }}>Amit Sharma</div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
              <Badge variant="purple" size="sm">Regular Customer</Badge>
              <Badge variant="gray" size="sm">Since Mar 2022</Badge>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '14px', color: styles.gray700 }}>
            <Phone size={14} color={styles.gray400} />
            <span>+91 98765 43210</span>
            <Button size="sm" variant="ghost" style={{ padding: '4px 8px', fontSize: '11px' }}>Call</Button>
            <Button size="sm" variant="ghost" style={{ padding: '4px 8px', fontSize: '11px', color: '#25D366' }}>WhatsApp</Button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '14px', color: styles.gray700 }}>
            <Mail size={14} color={styles.gray400} />
            <span>amit.sharma@email.com</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: styles.gray700 }}>
            <MapPin size={14} color={styles.gray400} />
            <span>HSR Layout, Bangalore, Karnataka 560102</span>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px' }}>
          {[
            { value: '7', label: 'Visits', color: styles.ekaOrange },
            { value: '₹42,800', label: 'Lifetime', color: styles.g4gPurple },
            { value: '4.8⭐', label: 'Rating', color: styles.warning },
          ].map((stat, idx) => (
            <div key={idx} style={{
              background: styles.gray50,
              border: `1px solid ${styles.gray100}`,
              borderRadius: '8px',
              padding: '12px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '20px', fontWeight: 700, color: stat.color }}>{stat.value}</div>
              <div style={{ fontSize: '11px', color: styles.gray400 }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Preferences */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '11px', color: styles.gray400, textTransform: 'uppercase', marginBottom: '8px' }}>Customer Preferences (EKA-AI detected)</div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['Prefers SMS updates', 'Usually pays via UPI', 'Visits every 4 months'].map((pref, idx) => (
              <span key={idx} style={{
                background: styles.ekaOrangeSuperLight,
                color: styles.gray600,
                fontSize: '11px',
                padding: '4px 8px',
                borderRadius: '4px',
              }}>{pref}</span>
            ))}
          </div>
        </div>

        {/* AI Note */}
        <div style={{
          background: styles.ekaOrangeSuperLight,
          borderLeft: `3px solid ${styles.ekaOrange}`,
          borderRadius: '0 6px 6px 0',
          padding: '12px 16px',
          fontSize: '13px',
          color: styles.gray600,
        }}>
          <span style={{ fontWeight: 600 }}>🤖 EKA-AI:</span> High retention score. Customer has referred 2 others. VIP treatment recommended.
        </div>
      </Card>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 5: PRE-INSPECTION CHECKLIST + VEHICLE PHOTOS
// ═══════════════════════════════════════════════════════════════════════════════

const PreInspectionSection: React.FC = () => {
  const checklistData = {
    exterior: [
      { item: 'Body condition', status: 'ok', note: 'No dents' },
      { item: 'Windshield', status: 'ok', note: 'No cracks' },
      { item: 'Paint scratches', status: 'warning', note: 'Left rear door, pre-existing' },
      { item: 'Headlights/Taillights', status: 'ok', note: 'Working' },
      { item: 'Tyres', status: 'ok', note: 'Adequate tread' },
    ],
    interior: [
      { item: 'Dashboard', status: 'ok', note: 'No warning lights (at entry)' },
      { item: 'AC', status: 'ok', note: 'Customer reports weak cooling' },
      { item: 'Seats & Upholstery', status: 'ok', note: 'Good condition' },
      { item: 'Spare wheel', status: 'ok', note: 'Present' },
    ],
    underHood: [
      { item: 'Engine oil level', status: 'ok', note: 'Low (to be topped up)' },
      { item: 'Coolant level', status: 'warning', note: 'Slightly below min mark' },
      { item: 'Battery terminals', status: 'ok', note: 'Clean' },
      { item: 'Brake fluid', status: 'ok', note: 'Adequate' },
    ],
  };

  return (
    <div style={{ padding: '0 32px 24px', background: styles.gray50, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
      {/* Pre-Inspection Checklist */}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <span style={{ fontSize: '16px', fontWeight: 600, color: styles.gray800 }}>📋 Pre-Inspection Checklist</span>
          <span style={{ fontSize: '12px', color: styles.gray500 }}>Completed by: Rajesh K. at 10:45 AM</span>
        </div>

        {Object.entries(checklistData).map(([category, items]) => (
          <div key={category} style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '11px', color: styles.gray500, textTransform: 'uppercase', marginBottom: '8px', marginTop: '12px' }}>
              {category === 'exterior' ? 'EXTERIOR' : category === 'interior' ? 'INTERIOR' : 'UNDER HOOD (Quick Check)'}
            </div>
            {items.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '6px 0', fontSize: '13px' }}>
                <span style={{ color: item.status === 'ok' ? styles.success : styles.warning }}>
                  {item.status === 'ok' ? '✅' : '⚠️'}
                </span>
                <span style={{ color: styles.gray700 }}>{item.item}</span>
                <span style={{ color: styles.gray400, fontStyle: item.status === 'warning' ? 'italic' : 'normal' }}>— {item.note}</span>
              </div>
            ))}
          </div>
        ))}
      </Card>

      {/* Vehicle Photos */}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <span style={{ fontSize: '16px', fontWeight: 600, color: styles.gray800 }}>📸 Vehicle Documentation</span>
          <Badge variant="gray" size="sm">4 Photos</Badge>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
          {[
            { label: 'Front View', hasWarning: false },
            { label: 'Rear View', hasWarning: false },
            { label: 'Left Side - Scratch', hasWarning: true },
            { label: 'Odometer Reading', hasWarning: false },
          ].map((photo, idx) => (
            <div key={idx}>
              <div style={{
                aspectRatio: '4/3',
                background: styles.gray100,
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: photo.hasWarning ? `2px solid ${styles.warning}` : `1px solid ${styles.gray200}`,
              }}>
                <Camera size={32} color={styles.gray400} />
              </div>
              <div style={{ fontSize: '11px', color: styles.gray500, textAlign: 'center', marginTop: '6px' }}>{photo.label}</div>
            </div>
          ))}
        </div>

        <button style={{
          width: '100%',
          padding: '12px',
          border: `2px dashed ${styles.gray300}`,
          borderRadius: '8px',
          background: 'transparent',
          color: styles.gray500,
          fontSize: '13px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
        }}>
          <Plus size={16} /> Upload More Photos
        </button>
        <div style={{ fontSize: '11px', color: styles.gray400, textAlign: 'center', marginTop: '8px' }}>Max 10 photos, 5MB each</div>
      </Card>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 6: SERVICE DETAILS / WORK LOG
// ═══════════════════════════════════════════════════════════════════════════════

const ServiceDetailsSection: React.FC = () => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return <Badge variant="success"><Check size={10} /> Completed</Badge>;
      case 'in-progress': return <Badge variant="orange" pulse><span className="animate-spin-slow" style={{ display: 'inline-block' }}>🔄</span> In Progress</Badge>;
      case 'queued': return <Badge variant="gray">⏳ Queued</Badge>;
      case 'on-hold': return <Badge variant="info">⏸️ On Hold</Badge>;
      default: return null;
    }
  };

  const getPriorityDot = (priority: string) => {
    const colors: Record<string, string> = { low: styles.info, normal: styles.success, high: styles.ekaOrange, urgent: styles.error };
    return <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: colors[priority], display: 'inline-block' }} />;
  };

  const completedTasks = sampleServices.filter(s => s.status === 'completed').length;
  const totalTasks = sampleServices.length;
  const progressPercent = (completedTasks / totalTasks) * 100;

  return (
    <div style={{ padding: '0 32px 24px', background: styles.gray50 }}>
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${styles.gray200}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '16px', fontWeight: 600, color: styles.gray800 }}>🔧 Service Details</span>
            <Badge variant="gray" size="sm">{totalTasks} Services</Badge>
          </div>
          <Button size="sm" variant="primary" icon={<Plus size={14} />} style={{ background: styles.ekaOrangeLight, color: styles.ekaOrange, border: `1px solid ${styles.ekaOrangeBorder}` }}>Add Service</Button>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
            <thead>
              <tr style={{ background: styles.gray50 }}>
                {['#', 'Service Type', 'Description', 'Technician', 'Priority', 'Status', 'Est. Time', 'Actual Time', 'Actions'].map((header) => (
                  <th key={header} style={{
                    padding: '10px 16px',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: styles.gray500,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    textAlign: 'left',
                    borderBottom: `1px solid ${styles.gray200}`,
                  }}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sampleServices.map((service, idx) => (
                <tr key={service.id} style={{
                  background: idx % 2 === 0 ? styles.white : styles.gray50,
                  transition: 'background 150ms ease',
                }}
                  onMouseEnter={(e) => e.currentTarget.style.background = styles.ekaOrangeSuperLight}
                  onMouseLeave={(e) => e.currentTarget.style.background = idx % 2 === 0 ? styles.white : styles.gray50}
                >
                  <td style={{ padding: '14px 16px', fontSize: '14px', color: styles.gray700, borderBottom: `1px solid ${styles.gray100}` }}>{service.id}</td>
                  <td style={{ padding: '14px 16px', fontSize: '14px', color: styles.gray900, fontWeight: 500, borderBottom: `1px solid ${styles.gray100}` }}>{service.type}</td>
                  <td style={{ padding: '14px 16px', fontSize: '13px', color: styles.gray600, borderBottom: `1px solid ${styles.gray100}`, maxWidth: '300px' }}>{service.description}</td>
                  <td style={{ padding: '14px 16px', fontSize: '14px', color: styles.gray700, borderBottom: `1px solid ${styles.gray100}` }}>{service.technician}</td>
                  <td style={{ padding: '14px 16px', borderBottom: `1px solid ${styles.gray100}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {getPriorityDot(service.priority)}
                      <span style={{ fontSize: '13px', color: styles.gray600, textTransform: 'capitalize' }}>{service.priority}</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px', borderBottom: `1px solid ${styles.gray100}` }}>{getStatusBadge(service.status)}</td>
                  <td style={{ padding: '14px 16px', fontSize: '14px', color: styles.gray700, fontFamily: styles.fontMono, borderBottom: `1px solid ${styles.gray100}` }}>{service.estTime}</td>
                  <td style={{ padding: '14px 16px', fontSize: '14px', color: styles.gray700, fontFamily: styles.fontMono, borderBottom: `1px solid ${styles.gray100}` }}>{service.actualTime}</td>
                  <td style={{ padding: '14px 16px', borderBottom: `1px solid ${styles.gray100}` }}>
                    <Button size="sm" variant="ghost" style={{ padding: '4px 8px' }}><Eye size={14} /> View</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Progress Bar */}
        <div style={{ padding: '20px 24px', borderTop: `1px solid ${styles.gray200}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontWeight: 600, color: styles.gray700 }}>Overall Progress</span>
            <span style={{ fontSize: '13px', color: styles.gray500 }}>{progressPercent.toFixed(0)}% Complete — {completedTasks} of {totalTasks} tasks done • Est. remaining: 3h 15m</span>
          </div>
          <div style={{ height: '10px', background: styles.gray200, borderRadius: '9999px', overflow: 'hidden', position: 'relative' }}>
            <div style={{
              width: `${progressPercent}%`,
              height: '100%',
              background: `linear-gradient(90deg, ${styles.ekaOrange}, #F5A623)`,
              borderRadius: '9999px',
              position: 'relative',
            }}>
              <div className="animate-shimmer" style={{ position: 'absolute', inset: 0, borderRadius: '9999px' }} />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 7: PARTS & INVENTORY
// ═══════════════════════════════════════════════════════════════════════════════

const PartsInventorySection: React.FC = () => {
  const getAvailabilityBadge = (availability: string, note?: string) => {
    switch (availability) {
      case 'in-stock': return <span style={{ color: styles.success, fontSize: '13px' }}>🟢 In Stock</span>;
      case 'low-stock': return <span style={{ color: styles.warning, fontSize: '13px' }}>🟡 Low ({note})</span>;
      case 'ordered': return <span style={{ color: styles.error, fontSize: '13px' }}>🔴 Ordered ({note})</span>;
      case 'out-of-stock': return <span style={{ color: styles.error, fontSize: '13px', opacity: 0.7 }}>❌ Unavailable</span>;
      default: return null;
    }
  };

  const totalPartsCost = sampleParts.reduce((sum, p) => sum + p.total, 0);
  const warrantyItems = sampleParts.filter(p => p.warranty !== '—').length;

  return (
    <div style={{ padding: '0 32px 24px' }}>
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${styles.gray200}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '16px', fontWeight: 600, color: styles.gray800 }}>📦 Parts & Inventory</span>
            <Badge variant="gray" size="sm">{sampleParts.length} Items</Badge>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button size="sm" icon={<Plus size={14} />}>Add Part</Button>
            <Button size="sm" icon={<Search size={14} />}>Check Stock</Button>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
            <thead>
              <tr style={{ background: styles.gray50 }}>
                {['#', 'Part Name', 'Part Number', 'Category', 'Qty', 'Unit Price (₹)', 'Total (₹)', 'Warranty', 'Availability'].map((header) => (
                  <th key={header} style={{
                    padding: '10px 16px',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: styles.gray500,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    textAlign: header.includes('₹') ? 'right' : 'left',
                    borderBottom: `1px solid ${styles.gray200}`,
                  }}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sampleParts.map((part, idx) => (
                <tr key={part.id} style={{ background: idx % 2 === 0 ? styles.white : styles.gray50 }}
                  onMouseEnter={(e) => e.currentTarget.style.background = styles.ekaOrangeSuperLight}
                  onMouseLeave={(e) => e.currentTarget.style.background = idx % 2 === 0 ? styles.white : styles.gray50}>
                  <td style={{ padding: '14px 16px', fontSize: '14px', color: styles.gray700, borderBottom: `1px solid ${styles.gray100}` }}>{part.id}</td>
                  <td style={{ padding: '14px 16px', fontSize: '14px', color: styles.gray900, fontWeight: 500, borderBottom: `1px solid ${styles.gray100}` }}>{part.name}</td>
                  <td style={{ padding: '14px 16px', fontSize: '13px', color: styles.gray600, fontFamily: styles.fontMono, borderBottom: `1px solid ${styles.gray100}` }}>{part.partNumber}</td>
                  <td style={{ padding: '14px 16px', fontSize: '14px', color: styles.gray700, borderBottom: `1px solid ${styles.gray100}` }}>{part.category}</td>
                  <td style={{ padding: '14px 16px', fontSize: '14px', color: styles.gray700, borderBottom: `1px solid ${styles.gray100}` }}>{part.qty}</td>
                  <td style={{ padding: '14px 16px', fontSize: '14px', color: styles.gray700, textAlign: 'right', fontVariantNumeric: 'tabular-nums', borderBottom: `1px solid ${styles.gray100}` }}>{formatCurrency(part.unitPrice)}</td>
                  <td style={{ padding: '14px 16px', fontSize: '14px', color: styles.gray900, fontWeight: 600, textAlign: 'right', fontVariantNumeric: 'tabular-nums', borderBottom: `1px solid ${styles.gray100}` }}>{formatCurrency(part.total)}</td>
                  <td style={{ padding: '14px 16px', borderBottom: `1px solid ${styles.gray100}` }}>
                    {part.warranty !== '—' ? <Badge variant="info" size="sm">{part.warranty}</Badge> : <span style={{ color: styles.gray400 }}>—</span>}
                  </td>
                  <td style={{ padding: '14px 16px', borderBottom: `1px solid ${styles.gray100}` }}>{getAvailabilityBadge(part.availability, part.availabilityNote)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div style={{ padding: '16px 24px', background: styles.gray50, borderTop: `1px solid ${styles.gray200}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', color: styles.gray400 }}>Warranty items: {warrantyItems} | Non-warranty: {sampleParts.length - warrantyItems}</span>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontWeight: 700, color: styles.gray900, marginRight: '16px' }}>Total Parts Cost</span>
            <span style={{ fontWeight: 700, color: styles.gray900, fontSize: '18px', fontVariantNumeric: 'tabular-nums' }}>{formatCurrency(totalPartsCost)}</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 8: COST BREAKDOWN + PAYMENT STATUS
// ═══════════════════════════════════════════════════════════════════════════════

const CostPaymentSection: React.FC = () => {
  const costItems = [
    { label: 'Parts & Materials', amount: 4910 },
    { label: 'Labour Charges', amount: 2800 },
    { label: 'AC Gas Refill Charges', amount: 800 },
    { label: 'Wheel Alignment & Balancing', amount: 650 },
    { label: 'Consumables (grease, cleaning, etc.)', amount: 240 },
  ];

  const subtotal = costItems.reduce((sum, item) => sum + item.amount, 0);
  const loyaltyDiscount = Math.round(subtotal * 0.05);
  const couponDiscount = 200;
  const afterDiscount = subtotal - loyaltyDiscount - couponDiscount;
  const cgst = Math.round(afterDiscount * 0.09);
  const sgst = Math.round(afterDiscount * 0.09);
  const grandTotal = afterDiscount + cgst + sgst;

  const amountPaid = 5000;
  const balanceDue = grandTotal - amountPaid;
  const paidPercent = (amountPaid / grandTotal) * 100;

  return (
    <div style={{ padding: '0 32px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
      {/* Cost Breakdown */}
      <Card>
        <h3 style={{ fontSize: '16px', fontWeight: 600, color: styles.gray800, marginBottom: '20px' }}>💰 Cost Breakdown</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {costItems.map((item, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ color: styles.gray700, fontSize: '14px' }}>{item.label}</span>
              <span style={{ flex: 1, borderBottom: `1px dotted ${styles.gray300}`, margin: '0 8px' }} />
              <span style={{ color: styles.gray900, fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>{formatCurrency(item.amount)}</span>
            </div>
          ))}
          
          <div style={{ borderTop: `1px solid ${styles.gray200}`, margin: '8px 0', paddingTop: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ color: styles.gray700, fontWeight: 600 }}>Subtotal</span>
              <span style={{ flex: 1, borderBottom: `1px dotted ${styles.gray300}`, margin: '0 8px' }} />
              <span style={{ color: styles.gray700, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{formatCurrency(subtotal)}</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ color: styles.success }}>🏷️ Loyal Customer Discount (5%)</span>
            <span style={{ flex: 1, borderBottom: `1px dotted ${styles.gray300}`, margin: '0 8px' }} />
            <span style={{ color: styles.success, fontVariantNumeric: 'tabular-nums' }}>-{formatCurrency(loyaltyDiscount)}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ color: styles.success }}>🎫 Coupon: FIRST2025</span>
            <span style={{ flex: 1, borderBottom: `1px dotted ${styles.gray300}`, margin: '0 8px' }} />
            <span style={{ color: styles.success, fontVariantNumeric: 'tabular-nums' }}>-{formatCurrency(couponDiscount)}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ color: styles.gray700 }}>After Discount</span>
            <span style={{ flex: 1, borderBottom: `1px dotted ${styles.gray300}`, margin: '0 8px' }} />
            <span style={{ color: styles.gray700, fontVariantNumeric: 'tabular-nums' }}>{formatCurrency(afterDiscount)}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ color: styles.gray500 }}>CGST (9%)</span>
            <span style={{ flex: 1, borderBottom: `1px dotted ${styles.gray300}`, margin: '0 8px' }} />
            <span style={{ color: styles.gray500, fontVariantNumeric: 'tabular-nums' }}>{formatCurrency(cgst)}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ color: styles.gray500 }}>SGST (9%)</span>
            <span style={{ flex: 1, borderBottom: `1px dotted ${styles.gray300}`, margin: '0 8px' }} />
            <span style={{ color: styles.gray500, fontVariantNumeric: 'tabular-nums' }}>{formatCurrency(sgst)}</span>
          </div>

          <div style={{ 
            background: styles.ekaOrangeSuperLight, 
            padding: '16px', 
            borderRadius: '8px', 
            marginTop: '8px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <span style={{ fontSize: '18px', fontWeight: 700, color: styles.gray900 }}>Grand Total</span>
            <span style={{ fontSize: '28px', fontWeight: 700, color: styles.ekaOrange, fontVariantNumeric: 'tabular-nums' }}>{formatCurrency(grandTotal)}</span>
          </div>
          <div style={{ fontSize: '12px', color: styles.gray400, textAlign: 'right' }}>Rounded to: ₹10,300</div>
        </div>
      </Card>

      {/* Payment Status */}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: styles.gray800, margin: 0 }}>💳 Payment Information</h3>
          <Badge variant="warning">Partial Payment</Badge>
        </div>

        {/* Progress Bar */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ height: '12px', background: styles.gray200, borderRadius: '9999px', overflow: 'hidden', marginBottom: '8px' }}>
            <div style={{ width: `${paidPercent}%`, height: '100%', background: styles.success, borderRadius: '9999px' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
            <span style={{ color: styles.success, fontWeight: 600 }}>{formatCurrency(amountPaid)} paid</span>
            <span style={{ color: styles.gray400 }}>{paidPercent.toFixed(1)}%</span>
            <span style={{ color: styles.error, fontWeight: 600 }}>{formatCurrency(balanceDue)} due</span>
          </div>
        </div>

        {/* Payment Details */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
          <div>
            <div style={{ fontSize: '11px', color: styles.gray400, textTransform: 'uppercase', marginBottom: '4px' }}>Amount Paid</div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: styles.success }}>{formatCurrency(amountPaid)}</div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: styles.gray400, textTransform: 'uppercase', marginBottom: '4px' }}>Balance Due</div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: styles.error }}>{formatCurrency(balanceDue)}</div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: styles.gray400, textTransform: 'uppercase', marginBottom: '4px' }}>Payment Mode</div>
            <div style={{ fontSize: '14px', color: styles.gray700 }}>UPI (Google Pay)</div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: styles.gray400, textTransform: 'uppercase', marginBottom: '4px' }}>Transaction ID</div>
            <div style={{ fontSize: '13px', color: styles.gray700, fontFamily: styles.fontMono }}>TXN20250115103045</div>
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <div style={{ fontSize: '11px', color: styles.gray400, textTransform: 'uppercase', marginBottom: '4px' }}>Paid On</div>
            <div style={{ fontSize: '14px', color: styles.gray700 }}>15 Jan 2025, 10:35 AM</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Button variant="success" fullWidth icon={<CreditCard size={16} />}>Record Payment</Button>
          <Button variant="secondary" fullWidth icon={<Receipt size={16} />}>Generate GST Invoice</Button>
          <Button variant="outline" fullWidth icon={<Send size={16} />}>Send Payment Link (UPI)</Button>
        </div>
      </Card>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 9: EKA-AI INSIGHTS PANEL ⭐ HERO SECTION
// ═══════════════════════════════════════════════════════════════════════════════

const EkaAIInsightsPanel: React.FC = () => {
  const [aiQuery, setAiQuery] = useState('');

  const insights = [
    {
      type: 'predictive',
      icon: '🔮',
      title: 'Next Service Prediction',
      body: 'Based on driving patterns (avg 1,400 km/month), next service at 37,500 km — approximately April 2025. Recommend scheduling proactive reminder 2 weeks before.',
      confidence: 94,
      action: '📅 Schedule Reminder',
      borderColor: styles.ekaOrange,
      bgColor: styles.ekaOrangeLight,
    },
    {
      type: 'alert',
      icon: '⚠️',
      title: 'Attention Required',
      body: 'Rear brake pads at 40% wear (measured during current inspection). At current driving pattern, estimated 5,000 km before replacement needed. Delaying may cause rotor damage (+₹3,500 additional cost).',
      priority: 'Medium Priority',
      riskNote: { delayed: '₹3,500 additional rotor cost', now: '₹1,800 brake pads only' },
      action: 'Add to Current Job Card',
      borderColor: styles.warning,
      bgColor: styles.warningLight,
    },
    {
      type: 'savings',
      icon: '💡',
      title: 'Cost Savings Detected',
      body: 'By bundling AC service + general service in this visit, customer saves ₹400 compared to separate visits. Customer\'s lifetime savings with Go4Garage: ₹2,800 across 7 visits.',
      savings: 400,
      lifetime: '₹2,800',
      action: 'View Savings Report',
      borderColor: styles.success,
      bgColor: styles.successLight,
    },
  ];

  const suggestions = [
    'Estimate next visit cost',
    'Compare with market rate',
    'What parts will need replacement soon?'
  ];

  return (
    <div style={{
      margin: '0 32px 24px',
      background: `linear-gradient(135deg, ${styles.ekaOrangeSuperLight} 0%, ${styles.white} 60%, ${styles.g4gPurpleLight} 100%)`,
      border: '1px solid rgba(232, 149, 47, 0.15)',
      borderRadius: '20px',
      padding: '32px',
      position: 'relative',
      overflow: 'hidden',
      boxShadow: styles.shadowLg,
    }}>
      {/* Decorative circles */}
      <div style={{
        position: 'absolute',
        top: '-50px',
        left: '-50px',
        width: '200px',
        height: '200px',
        borderRadius: '50%',
        background: `radial-gradient(circle, ${styles.ekaOrange} 0%, transparent 70%)`,
        opacity: 0.05,
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-30px',
        right: '-30px',
        width: '150px',
        height: '150px',
        borderRadius: '50%',
        background: `radial-gradient(circle, ${styles.g4gPurple} 0%, transparent 70%)`,
        opacity: 0.04,
      }} />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', position: 'relative' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: styles.gray900, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            🤖 EKA-AI Insights
          </h2>
          <div style={{ fontSize: '12px', fontWeight: 500, color: styles.g4gPurple, marginTop: '4px' }}>
            Governed Intelligence for Automobiles
          </div>
          <div style={{ width: '48px', height: '3px', background: styles.ekaOrange, borderRadius: '9999px', marginTop: '8px' }} />
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: styles.ekaOrangeLight,
            border: `2px solid ${styles.ekaOrangeBorder}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
          }}>🐘</div>
          <div style={{ fontSize: '10px', color: styles.gray400, marginTop: '4px' }}>v3.2</div>
        </div>
      </div>

      {/* Insight Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '24px' }}>
        {insights.map((insight, idx) => (
          <div key={idx} style={{
            background: styles.white,
            border: `1px solid ${styles.gray200}`,
            borderTop: `4px solid ${insight.borderColor}`,
            borderRadius: '12px',
            padding: '20px',
            boxShadow: styles.shadowSm,
            transition: 'all 200ms ease',
            cursor: 'pointer',
          }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = styles.shadowMd;
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = styles.shadowSm;
              e.currentTarget.style.transform = 'none';
            }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: insight.bgColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              marginBottom: '12px',
            }}>{insight.icon}</div>
            <h4 style={{ fontSize: '15px', fontWeight: 600, color: styles.gray900, margin: '0 0 8px' }}>{insight.title}</h4>
            <p style={{ fontSize: '13px', color: styles.gray600, lineHeight: 1.6, margin: '0 0 12px' }}>{insight.body}</p>

            {insight.confidence && (
              <div style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '12px', color: styles.gray500 }}>Confidence</span>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: styles.success }}>{insight.confidence}%</span>
                </div>
                <div style={{ height: '6px', background: styles.gray200, borderRadius: '9999px', overflow: 'hidden' }}>
                  <div style={{ width: `${insight.confidence}%`, height: '100%', background: styles.success, borderRadius: '9999px' }} />
                </div>
              </div>
            )}

            {insight.priority && (
              <div style={{ marginBottom: '8px' }}>
                <Badge variant="warning" size="sm">{insight.priority}</Badge>
              </div>
            )}

            {insight.riskNote && (
              <div style={{ fontSize: '12px', marginBottom: '12px' }}>
                <div style={{ color: styles.error }}>If delayed: {insight.riskNote.delayed}</div>
                <div style={{ color: styles.success }}>If done now: {insight.riskNote.now}</div>
              </div>
            )}

            {insight.savings && (
              <div style={{
                background: styles.successLight,
                border: `1px solid ${styles.successBorder}`,
                borderRadius: '8px',
                padding: '12px',
                textAlign: 'center',
                marginBottom: '12px',
              }}>
                <div style={{ fontSize: '20px', fontWeight: 700, color: styles.success }}>{formatCurrency(insight.savings)} SAVED</div>
                <div style={{ fontSize: '11px', color: styles.gray500 }}>This Visit</div>
              </div>
            )}

            {insight.lifetime && (
              <div style={{ fontSize: '12px', marginBottom: '8px' }}>
                <span style={{ fontWeight: 600, color: styles.g4gPurple }}>{insight.lifetime} total savings</span>
              </div>
            )}

            <button style={{
              background: 'none',
              border: 'none',
              color: styles.ekaOrange,
              fontSize: '12px',
              cursor: 'pointer',
              padding: 0,
              fontFamily: styles.fontPrimary,
            }}
              onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
              onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}>
              {insight.action} →
            </button>
          </div>
        ))}
      </div>

      {/* AI Chat Input */}
      <div style={{
        background: styles.white,
        border: `2px dashed ${styles.ekaOrangeBorder}`,
        borderRadius: '12px',
        padding: '20px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <span style={{ fontSize: '20px' }}>🐘</span>
          <span style={{ fontSize: '14px', color: styles.gray400 }}>Ask EKA-AI about this job card...</span>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <input
            type="text"
            value={aiQuery}
            onChange={(e) => setAiQuery(e.target.value)}
            placeholder="What's the service history for this car?"
            style={{
              flex: 1,
              height: '44px',
              border: `1px solid ${styles.gray300}`,
              borderRadius: '8px',
              padding: '0 16px',
              fontSize: '14px',
              fontFamily: styles.fontPrimary,
              outline: 'none',
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = styles.ekaOrange}
            onBlur={(e) => e.currentTarget.style.borderColor = styles.gray300}
          />
          <Button variant="primary" icon={<Send size={16} />}>Ask EKA</Button>
        </div>
        <div style={{ marginTop: '12px', fontSize: '12px', color: styles.gray400, fontStyle: 'italic' }}>
          Try: {suggestions.map((s, i) => (
            <span key={i}>
              <button 
                onClick={() => setAiQuery(s)}
                style={{ background: 'none', border: 'none', color: styles.gray500, cursor: 'pointer', fontFamily: styles.fontPrimary, fontSize: '12px' }}
                onMouseEnter={(e) => e.currentTarget.style.color = styles.ekaOrange}
                onMouseLeave={(e) => e.currentTarget.style.color = styles.gray500}>
                "{s}"
              </button>
              {i < suggestions.length - 1 && ' • '}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 10: VEHICLE HEALTH SCORE
// ═══════════════════════════════════════════════════════════════════════════════

const VehicleHealthScore: React.FC = () => {
  const overallScore = 78;
  const subScores = [
    { system: 'Engine', score: 92, condition: 'Great' },
    { system: 'Brakes', score: 65, condition: 'Fair' },
    { system: 'Tyres', score: 80, condition: 'Good' },
    { system: 'AC', score: 55, condition: 'Needs Service' },
    { system: 'Electrical', score: 95, condition: 'Great' },
    { system: 'Body', score: 88, condition: 'Good' },
  ];

  const getScoreColor = (score: number) => {
    if (score >= 80) return styles.success;
    if (score >= 60) return styles.ekaOrange;
    if (score >= 40) return styles.warning;
    return styles.error;
  };

  return (
    <div style={{ padding: '0 32px 24px' }}>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <span style={{ fontSize: '16px', fontWeight: 600, color: styles.gray800 }}>🏥 Vehicle Health Score</span>
          <Badge variant="purple" size="sm">Powered by EKA-AI</Badge>
        </div>

        <div style={{ display: 'flex', gap: '48px', alignItems: 'center' }}>
          {/* Main Score Circle */}
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              background: `conic-gradient(${getScoreColor(overallScore)} ${overallScore * 3.6}deg, ${styles.gray200} 0deg)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}>
              <div style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                background: styles.white,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <span style={{ fontSize: '36px', fontWeight: 700, color: styles.gray900 }}>{overallScore}</span>
                <span style={{ fontSize: '14px', color: styles.gray400 }}>/100</span>
              </div>
            </div>
            <div style={{ marginTop: '12px' }}>
              <div style={{ fontSize: '16px', fontWeight: 600, color: getScoreColor(overallScore) }}>GOOD CONDITION</div>
              <div style={{ fontSize: '12px', color: styles.gray500, marginTop: '4px' }}>Your vehicle is in good shape with minor attention needed</div>
            </div>
          </div>

          {/* Sub-scores */}
          <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            {subScores.map((item, idx) => (
              <div key={idx}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '13px', color: styles.gray700 }}>{item.system}</span>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: getScoreColor(item.score) }}>{item.score}</span>
                </div>
                <div style={{ height: '8px', background: styles.gray200, borderRadius: '9999px', overflow: 'hidden', marginBottom: '4px' }}>
                  <div style={{ width: `${item.score}%`, height: '100%', background: getScoreColor(item.score), borderRadius: '9999px' }} />
                </div>
                <div style={{ fontSize: '11px', color: styles.gray400 }}>{item.condition}</div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 11: SERVICE HISTORY
// ═══════════════════════════════════════════════════════════════════════════════

const ServiceHistorySection: React.FC = () => {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const history = [
    { id: 1, jobCard: 'JC-2024-00612', date: '15 Oct 2024', service: 'General Service + AC Check', km: '28,200 km', amount: 7450, status: 'Completed' },
    { id: 2, jobCard: 'JC-2024-00398', date: '12 Jul 2024', service: 'AC Service + Battery Replacement', km: '24,100 km', amount: 5200, status: 'Completed' },
    { id: 3, jobCard: 'JC-2024-00156', date: '20 Mar 2024', service: 'General Service', km: '20,000 km', amount: 3800, status: 'Completed' },
  ];

  return (
    <div style={{ padding: '0 32px 24px' }}>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <span style={{ fontSize: '16px', fontWeight: 600, color: styles.gray800 }}>📜 Service History</span>
          <Badge variant="gray" size="sm">6 Past Records</Badge>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {history.map((item) => (
            <div key={item.id} style={{
              border: `1px solid ${styles.gray100}`,
              borderRadius: '8px',
              overflow: 'hidden',
              transition: 'background 150ms ease',
            }}
              onMouseEnter={(e) => e.currentTarget.style.background = styles.gray50}
              onMouseLeave={(e) => e.currentTarget.style.background = styles.white}>
              <button
                onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                style={{
                  width: '100%',
                  padding: '14px 18px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: styles.fontPrimary,
                }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span style={{ transform: expandedId === item.id ? 'rotate(90deg)' : 'none', transition: 'transform 200ms ease', color: styles.gray400 }}>
                    <ChevronRight size={16} />
                  </span>
                  <span style={{ fontFamily: styles.fontMono, fontWeight: 600, color: styles.gray900, fontSize: '14px' }}>{item.jobCard}</span>
                  <span style={{ color: styles.gray500, fontSize: '13px' }}>{item.date}</span>
                  <span style={{ color: styles.gray700, fontSize: '13px' }}>{item.service}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span style={{ fontSize: '13px', color: styles.gray500 }}>{item.km}</span>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: styles.gray700 }}>{formatCurrency(item.amount)}</span>
                  <Badge variant="success" size="sm"><Check size={10} /> {item.status}</Badge>
                </div>
              </button>

              {expandedId === item.id && (
                <div style={{ padding: '16px 18px 16px 50px', borderTop: `1px solid ${styles.gray100}`, background: styles.gray50 }}>
                  <div style={{ fontSize: '13px', color: styles.gray600, marginBottom: '8px' }}>
                    <strong>Services performed:</strong> Oil change, filter replacement, AC gas top-up, general inspection
                  </div>
                  <div style={{ fontSize: '13px', color: styles.gray600, marginBottom: '8px' }}>
                    <strong>Parts used:</strong> Engine oil (4L), Oil filter, AC gas R134a
                  </div>
                  <div style={{ fontSize: '13px', color: styles.gray600, marginBottom: '8px' }}>
                    <strong>Technician:</strong> Rajesh Kumar
                  </div>
                  <button style={{
                    background: 'none',
                    border: 'none',
                    color: styles.ekaOrange,
                    fontSize: '12px',
                    cursor: 'pointer',
                    padding: 0,
                    fontFamily: styles.fontPrimary,
                  }}>View Full Job Card →</button>
                </div>
              )}
            </div>
          ))}
        </div>

        <Button variant="outline" fullWidth style={{ marginTop: '16px' }}>Show All History</Button>
      </Card>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 12: ACTIVITY TIMELINE + INTERNAL NOTES
// ═══════════════════════════════════════════════════════════════════════════════

const ActivityTimelineSection: React.FC = () => {
  const [newNote, setNewNote] = useState('');

  const notes = [
    { author: 'Rajesh K.', time: '11:15 AM', text: 'Oil filter was slightly stuck. Used extra tool. No damage to housing.', isAI: false },
    { author: 'Suresh M.', time: '12:40 PM', text: 'Front brake pads were at 15% life. Customer approved replacement. Rear pads at 60% — OK for now.', isAI: false, hasAttachment: true },
    { author: 'EKA-AI', time: '12:42 PM', text: 'Auto-note: Based on brake wear pattern, customer driving style indicates heavy city braking. Recommend ceramic pads for longer life on next replacement.', isAI: true },
  ];

  const getTimelineDotStyle = (status: string): React.CSSProperties => {
    const base: React.CSSProperties = {
      width: '14px',
      height: '14px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    };

    switch (status) {
      case 'completed':
        return { ...base, background: styles.success };
      case 'current':
        return { ...base, background: styles.ekaOrange, animation: 'pulse-orange 2s infinite' };
      case 'ai':
        return { ...base, background: styles.g4gPurple };
      case 'pending':
        return { ...base, background: 'transparent', border: `2px solid ${styles.gray300}` };
      default:
        return base;
    }
  };

  return (
    <div style={{ padding: '0 32px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
      {/* Activity Timeline */}
      <Card>
        <h3 style={{ fontSize: '16px', fontWeight: 600, color: styles.gray800, marginBottom: '20px' }}>⏱️ Activity Timeline</h3>

        <div style={{ position: 'relative' }}>
          {sampleTimeline.map((item, idx) => (
            <div key={item.id} style={{ display: 'flex', gap: '12px', marginBottom: idx === sampleTimeline.length - 1 ? 0 : '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={getTimelineDotStyle(item.status)}>
                  {item.status === 'completed' && <Check size={8} color={styles.white} />}
                </div>
                {idx < sampleTimeline.length - 1 && (
                  <div style={{
                    width: '2px',
                    flex: 1,
                    marginTop: '4px',
                    background: item.status === 'completed' ? styles.success : styles.gray200,
                    borderStyle: item.status === 'pending' ? 'dashed' : 'solid',
                  }} />
                )}
              </div>
              <div style={{ flex: 1, paddingBottom: '8px' }}>
                <div style={{ fontSize: '12px', fontWeight: 500, color: styles.gray400, marginBottom: '2px' }}>
                  {item.time}
                </div>
                <div style={{ fontSize: '13px', color: styles.gray700, marginBottom: '2px' }}>
                  {item.description}
                </div>
                <div style={{ fontSize: '12px', color: styles.gray500 }}>
                  {item.actor}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Internal Notes */}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: styles.gray800, margin: 0 }}>📝 Internal Notes</h3>
          <Badge variant="error" size="sm">Workshop Team Only</Badge>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0', marginBottom: '16px' }}>
          {notes.map((note, idx) => (
            <div key={idx} style={{
              padding: '12px 16px',
              borderBottom: idx < notes.length - 1 ? `1px solid ${styles.gray100}` : 'none',
              background: note.isAI ? styles.ekaOrangeSuperLight : 'transparent',
              borderLeft: note.isAI ? `3px solid ${styles.ekaOrange}` : 'none',
            }}>
              <div style={{ fontSize: '12px', fontWeight: 500, color: styles.gray500, marginBottom: '4px' }}>
                {note.isAI ? '🤖 ' : ''}{note.author} • {note.time}
              </div>
              <div style={{ fontSize: '13px', color: styles.gray700, lineHeight: 1.5 }}>
                {note.text}
                {note.hasAttachment && <span style={{ color: styles.gray400, marginLeft: '8px' }}>[Photo attached 📎]</span>}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Add a note..."
            rows={3}
            style={{
              width: '100%',
              border: `1px solid ${styles.gray300}`,
              borderRadius: '8px',
              padding: '12px',
              fontSize: '13px',
              fontFamily: styles.fontPrimary,
              resize: 'none',
              outline: 'none',
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = styles.ekaOrange}
            onBlur={(e) => e.currentTarget.style.borderColor = styles.gray300}
          />
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button size="sm" variant="outline" icon={<Paperclip size={14} />}>Attach</Button>
            <Button size="sm" style={{ background: styles.gray700, color: styles.white }} icon={<Send size={14} />}>Add Note</Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 13: CUSTOMER APPROVAL & DIGITAL SIGNATURE
// ═══════════════════════════════════════════════════════════════════════════════

const CustomerApprovalSection: React.FC = () => {
  const approvedItems = [
    { service: 'General Service', amount: '₹2,800 (labour)' },
    { service: 'Brake Pad Replacement', amount: '₹2,200 (parts) + ₹500 (labour)' },
    { service: 'AC Gas Top-up', amount: '₹800' },
    { service: 'Wheel Alignment', amount: '₹650' },
  ];

  return (
    <div style={{ padding: '0 32px 24px' }}>
      <Card style={{ border: `1px solid ${styles.ekaOrangeBorder}` }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, color: styles.gray800, marginBottom: '20px' }}>✍️ Customer Approval</h3>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <Badge variant="success"><Check size={12} /> Customer Approved</Badge>
          <span style={{ fontSize: '13px', color: styles.gray500 }}>Approved on: 15 Jan 2025, 11:00 AM via WhatsApp link</span>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: styles.gray700, marginBottom: '8px' }}>Approved items:</div>
          {approvedItems.map((item, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0', fontSize: '13px' }}>
              <span style={{ color: styles.success }}>✅</span>
              <span style={{ color: styles.gray700 }}>{item.service}</span>
              <span style={{ color: styles.gray500 }}>— {item.amount}</span>
            </div>
          ))}
          <div style={{ marginTop: '12px', fontWeight: 600, color: styles.gray900 }}>
            Total Approved: {formatCurrency(10302)}
          </div>
        </div>

        {/* Digital Signature */}
        <div style={{
          border: `2px dashed ${styles.gray300}`,
          borderRadius: '12px',
          padding: '24px',
          textAlign: 'center',
          background: styles.gray50,
        }}>
          <div style={{
            width: '200px',
            height: '80px',
            margin: '0 auto 16px',
            background: styles.white,
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontStyle: 'italic',
            color: styles.gray400,
            fontSize: '13px',
          }}>
            [Signature Image Placeholder]
          </div>
          <div style={{ fontWeight: 600, color: styles.gray900, marginBottom: '8px' }}>Amit Sharma</div>
          <div style={{ fontSize: '11px', color: styles.gray400 }}>
            Digitally signed via OTP<br />
            OTP verified: ✅<br />
            IP: 49.xxx.xxx.xx
          </div>
        </div>
      </Card>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 14: CUSTOMER FEEDBACK / RATING
// ═══════════════════════════════════════════════════════════════════════════════

const CustomerFeedbackSection: React.FC = () => {
  const ratings = [
    { category: 'Service Quality', score: 5 },
    { category: 'Value for Money', score: 4 },
    { category: 'Communication', score: 5 },
    { category: 'Timeliness', score: 4 },
  ];

  const renderStars = (score: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star key={i} size={16} fill={i < score ? styles.warning : 'none'} color={i < score ? styles.warning : styles.gray300} />
    ));
  };

  return (
    <div style={{ padding: '0 32px 24px' }}>
      <Card>
        <h3 style={{ fontSize: '16px', fontWeight: 600, color: styles.gray800, marginBottom: '20px' }}>⭐ Customer Feedback</h3>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '20px' }}>
          <span style={{ fontSize: '14px', color: styles.gray700 }}>Overall Rating:</span>
          <div style={{ display: 'flex', gap: '2px' }}>{renderStars(5)}</div>
          <span style={{ fontSize: '14px', color: styles.gray500 }}>(5/5)</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '20px' }}>
          {ratings.map((item, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '13px', color: styles.gray700, minWidth: '120px' }}>{item.category}:</span>
              <div style={{ display: 'flex', gap: '2px' }}>{renderStars(item.score)}</div>
            </div>
          ))}
        </div>

        <div style={{
          background: styles.gray50,
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '16px',
        }}>
          <p style={{ fontSize: '14px', color: styles.gray700, fontStyle: 'italic', lineHeight: 1.6, margin: '0 0 12px' }}>
            "Very happy with the service. Rajesh explained everything clearly. Will definitely come back."
          </p>
          <div style={{ fontSize: '12px', color: styles.gray500 }}>
            — Amit Sharma, 15 Jan 2025, 6:30 PM
          </div>
        </div>

        <div style={{
          background: styles.successLight,
          borderRadius: '6px',
          padding: '8px 12px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <span style={{ fontSize: '13px' }}>🤖 EKA-AI Sentiment:</span>
          <span style={{ fontWeight: 600, color: styles.success }}>Positive (98%)</span>
        </div>
        <div style={{ fontSize: '12px', color: styles.gray500, marginTop: '8px' }}>
          Keywords: "happy", "explained clearly", "come back"
        </div>
      </Card>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 15: DOCUMENT ATTACHMENTS
// ═══════════════════════════════════════════════════════════════════════════════

const DocumentAttachmentsSection: React.FC = () => {
  const documents = [
    { name: 'Customer_Approval_JC2025-00847.pdf', size: '245 KB', icon: '📄', type: 'pdf' },
    { name: 'Vehicle_Front_Photo.jpg', size: '1.2 MB', icon: '📸', type: 'image' },
    { name: 'Vehicle_Scratch_LeftDoor.jpg', size: '890 KB', icon: '📸', type: 'image' },
    { name: 'Odometer_Reading.jpg', size: '560 KB', icon: '📸', type: 'image' },
    { name: 'GST_Invoice_INV-2025-0847.pdf', size: '180 KB', icon: '🧾', type: 'invoice' },
    { name: 'Pre_Inspection_Report.pdf', size: '320 KB', icon: '📋', type: 'pdf' },
  ];

  return (
    <div style={{ padding: '0 32px 24px' }}>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <span style={{ fontSize: '16px', fontWeight: 600, color: styles.gray800 }}>📎 Documents & Attachments</span>
          <Badge variant="gray" size="sm">{documents.length} Files</Badge>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {documents.map((doc, idx) => (
            <div key={idx} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 16px',
              borderBottom: idx < documents.length - 1 ? `1px solid ${styles.gray100}` : 'none',
              transition: 'background 150ms ease',
            }}
              onMouseEnter={(e) => e.currentTarget.style.background = styles.gray50}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '16px' }}>{doc.icon}</span>
                <span style={{ fontSize: '13px', color: styles.gray700 }}>{doc.name}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ fontSize: '12px', color: styles.gray400 }}>{doc.size}</span>
                <button style={{
                  background: 'none',
                  border: 'none',
                  color: styles.ekaOrange,
                  fontSize: '12px',
                  cursor: 'pointer',
                  fontFamily: styles.fontPrimary,
                }}>View</button>
                <button style={{
                  background: 'none',
                  border: 'none',
                  color: styles.gray500,
                  fontSize: '14px',
                  cursor: 'pointer',
                }}>↓</button>
              </div>
            </div>
          ))}
        </div>

        <div style={{
          border: `2px dashed ${styles.gray300}`,
          borderRadius: '12px',
          padding: '24px',
          textAlign: 'center',
          marginTop: '16px',
        }}>
          <Upload size={24} color={styles.gray400} style={{ marginBottom: '8px' }} />
          <div style={{ fontSize: '13px', color: styles.gray500 }}>Drop files here or click to upload</div>
          <div style={{ fontSize: '11px', color: styles.gray400, marginTop: '4px' }}>Supported: PDF, JPG, PNG (max 10MB)</div>
        </div>
      </Card>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 16: RELATED JOB CARDS
// ═══════════════════════════════════════════════════════════════════════════════

const RelatedJobCardsSection: React.FC = () => {
  const relatedCards = [
    { jobCard: 'JC-2024-00612', date: '15 Oct 2024', service: 'General Service', relation: 'Same vehicle, 4,250 km ago', badge: 'Previous', badgeVariant: 'info' as const },
    { jobCard: 'JC-2024-00398', date: '12 Jul 2024', service: 'AC Service', relation: 'AC issue recurrence detected', badge: 'Repeat ⚠️', badgeVariant: 'warning' as const },
    { jobCard: 'JC-2025-00852', date: '18 Jan 2025', service: 'Hyundai i20', relation: 'Same customer, different vehicle', badge: 'Same Owner', badgeVariant: 'purple' as const },
  ];

  return (
    <div style={{ padding: '0 32px 24px' }}>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <span style={{ fontSize: '16px', fontWeight: 600, color: styles.gray800 }}>🔗 Related Job Cards</span>
          <Badge variant="purple" size="sm">EKA-AI Detected</Badge>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {relatedCards.map((card, idx) => (
            <div key={idx} style={{
              background: styles.white,
              border: `1px solid ${styles.gray200}`,
              borderRadius: '8px',
              padding: '16px',
              cursor: 'pointer',
              transition: 'all 200ms ease',
            }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = styles.shadowMd;
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.transform = 'none';
              }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <span style={{ fontFamily: styles.fontMono, fontWeight: 600, color: styles.gray900, fontSize: '14px' }}>{card.jobCard}</span>
                <Badge variant={card.badgeVariant} size="sm">{card.badge}</Badge>
              </div>
              <div style={{ fontSize: '12px', color: styles.gray500, marginBottom: '4px' }}>
                {card.date} | {card.service}
              </div>
              <div style={{ fontSize: '12px', color: styles.gray600, fontStyle: 'italic', marginBottom: '8px' }}>
                {card.relation}
              </div>
              <button style={{
                background: 'none',
                border: 'none',
                color: styles.ekaOrange,
                fontSize: '12px',
                cursor: 'pointer',
                padding: 0,
                fontFamily: styles.fontPrimary,
              }}>View →</button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 17: FOOTER
// ═══════════════════════════════════════════════════════════════════════════════

const Footer: React.FC = () => {
  return (
    <footer style={{
      background: styles.gray900,
      padding: '48px 32px 24px',
      color: styles.gray400,
      marginTop: '32px',
    }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '48px', marginBottom: '32px' }}>
          {/* Company */}
          <div>
            <div style={{ marginBottom: '16px' }}>
              <span style={{ fontSize: '20px', fontWeight: 700 }}>
                <span style={{ color: '#C4A8E0' }}>Go</span>
                <span style={{ color: styles.g4gGreen }}>4</span>
                <span style={{ color: '#C4A8E0' }}>Garage</span>
              </span>
              <div style={{ fontSize: '13px', color: styles.gray500 }}>Private Limited</div>
            </div>
            <div style={{ fontSize: '13px', lineHeight: 1.8, color: styles.gray400 }}>
              #123, Industrial Area, Phase 2<br />
              HSR Layout, Bangalore<br />
              Karnataka 560102, India<br /><br />
              📞 +91 80 4567 8900<br />
              📧 support@go4garage.com<br />
              🌐 www.go4garage.com
            </div>
          </div>

          {/* Product */}
          <div>
            <div style={{ marginBottom: '8px' }}>
              <span style={{ color: styles.ekaOrange, fontSize: '24px', fontWeight: 700 }}>eka-ai</span>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: styles.ekaOrange, display: 'inline-block', marginLeft: '2px' }} />
            </div>
            <div style={{ fontSize: '13px', color: styles.gray500, marginBottom: '16px' }}>
              Governed Intelligence for Automobiles
            </div>
            <div style={{ fontSize: '12px', color: styles.gray500, fontFamily: styles.fontMono }}>
              Version: EKA-AI Core v3.2<br />
              Build: 2025.01.15<br />
              Model: Deterministic + Predictive
            </div>
          </div>

          {/* Links */}
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: styles.gray300, marginBottom: '16px' }}>Quick Links</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {['Privacy Policy', 'Terms of Service', 'Data Processing Agreement', 'API Documentation', 'Support Center', 'System Status'].map((link) => (
                <a key={link} href="#" style={{
                  color: styles.gray400,
                  fontSize: '13px',
                  textDecoration: 'none',
                  transition: 'color 150ms ease',
                }}
                  onMouseEnter={(e) => e.currentTarget.style.color = styles.ekaOrange}
                  onMouseLeave={(e) => e.currentTarget.style.color = styles.gray400}>
                  {link}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          borderTop: `1px solid ${styles.gray800}`,
          paddingTop: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '12px',
          color: styles.gray500,
        }}>
          <span>© 2025 Go4Garage Private Limited. All rights reserved.</span>
          <span>Made in India 🇮🇳 with 🧡 by EKA-AI</span>
          <span>GSTIN: 29AABCG1234A1Z5 | CIN: U72200KA2022PTC12345</span>
        </div>
      </div>
    </footer>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

const JobCardDetailPage: React.FC = () => {
  return (
    <div style={{
      minHeight: '100vh',
      background: styles.white,
      fontFamily: styles.fontPrimary,
    }}>
      {/* Section 1 */}
      <TopNavBar />
      
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        {/* Section 2 */}
        <JobCardHeader />
        
        {/* Section 3 */}
        <QuickActionsBar />
        
        {/* Section 4 */}
        <VehicleCustomerInfo />
        
        {/* Section 5 */}
        <PreInspectionSection />
        
        {/* Section 6 */}
        <ServiceDetailsSection />
        
        {/* Section 7 */}
        <PartsInventorySection />
        
        {/* Section 8 */}
        <CostPaymentSection />
      </div>
      
      {/* Section 9 - EKA-AI Hero - Full bleed within max-width */}
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <EkaAIInsightsPanel />
      </div>
      
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        {/* Section 10 */}
        <VehicleHealthScore />
        
        {/* Section 11 */}
        <ServiceHistorySection />
        
        {/* Section 12 */}
        <ActivityTimelineSection />
        
        {/* Section 13 */}
        <CustomerApprovalSection />
        
        {/* Section 14 */}
        <CustomerFeedbackSection />
        
        {/* Section 15 */}
        <DocumentAttachmentsSection />
        
        {/* Section 16 */}
        <RelatedJobCardsSection />
      </div>
      
      {/* Section 17 - Footer Full Width */}
      <Footer />
    </div>
  );
};

export default JobCardDetailPage;
