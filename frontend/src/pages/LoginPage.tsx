import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, Mail, Eye, EyeOff, Play, ChevronLeft, ChevronRight, Shield, Lock, FileText } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import DemoModal from '../components/DemoModal';

// Feature slides for the carousel with animated preview content
const FEATURE_SLIDES = [
  {
    id: 'ai-chat',
    title: 'AI-Powered Chat',
    subtitle: 'Intelligent Diagnostics',
    description: 'Get instant vehicle diagnostics and repair recommendations powered by advanced AI technology.',
    features: ['Natural language queries', 'Real-time diagnostics', 'Repair suggestions', 'Cost estimates'],
    demoId: 'chat',
    accentColor: '#F98906',
    previewType: 'chat'
  },
  {
    id: 'job-cards',
    title: 'Job Card → Invoice',
    subtitle: 'Complete Workflow',
    description: 'Seamless transition from job creation to GST-compliant invoicing with automatic calculations.',
    features: ['One-click job card creation', 'Real-time status tracking', 'Auto GST calculation', 'Digital invoice delivery'],
    demoId: 'jobcard',
    accentColor: '#F98906',
    previewType: 'jobcard'
  },
  {
    id: 'pdi',
    title: 'PDI Process',
    subtitle: 'Pre-Delivery Inspection',
    description: 'Streamlined digital PDI workflow with AI-powered checklist verification and instant reporting.',
    features: ['120+ point inspection checklist', 'Photo & video documentation', 'Digital signatures', 'Instant PDF reports'],
    demoId: 'pdi',
    accentColor: '#F98906',
    previewType: 'pdi'
  },
  {
    id: 'fleet',
    title: 'Fleet Management',
    subtitle: 'Enterprise Solutions',
    description: 'Comprehensive fleet tracking and management for dealerships and service centers.',
    features: ['Multi-vehicle tracking', 'Service scheduling', 'Performance analytics', 'Cost optimization'],
    demoId: 'mg',
    accentColor: '#F98906',
    previewType: 'fleet'
  },
  {
    id: 'invoicing',
    title: 'Smart Invoicing',
    subtitle: 'GST Compliant',
    description: 'Automatic GST calculations, digital delivery, and complete payment tracking.',
    features: ['Auto tax calculation', 'Email delivery', 'Payment tracking', 'Report generation'],
    demoId: 'jobcard',
    accentColor: '#F98906',
    previewType: 'invoice'
  },
  {
    id: 'analytics',
    title: 'Business Analytics',
    subtitle: 'Data-Driven Insights',
    description: 'Real-time dashboards and reports to track your workshop performance.',
    features: ['Revenue tracking', 'Customer insights', 'Service analytics', 'Growth metrics'],
    demoId: 'brand',
    accentColor: '#F98906',
    previewType: 'analytics'
  }
];

// Animated Preview Components for each feature
const AnimatedPreview: React.FC<{ type: string }> = ({ type }) => {
  const [frame, setFrame] = useState(0);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setFrame(f => (f + 1) % 100);
    }, 100);
    return () => clearInterval(timer);
  }, []);

  switch (type) {
    case 'chat':
      return (
        <div className="absolute inset-0 bg-gradient-to-br from-[#1A1A1C] to-[#0D0D0F] p-4 overflow-hidden">
          <div className="h-8 bg-white/5 rounded-lg mb-3 flex items-center px-3">
            <div className="w-6 h-6 rounded-full bg-[#F98906]/30" />
            <span className="ml-2 text-xs text-white/50">eka-aı Assistant</span>
          </div>
          <div className="space-y-3">
            <div className="flex justify-end">
              <div className="bg-[#F98906]/20 rounded-2xl rounded-br-sm px-4 py-2 max-w-[80%]">
                <p className="text-xs text-white/80">Engine warning light on Swift 2020</p>
              </div>
            </div>
            <div className="flex">
              <div className="bg-white/10 rounded-2xl rounded-bl-sm px-4 py-2 max-w-[85%]">
                <p className="text-xs text-white/60 mb-2">🔍 Analyzing your vehicle...</p>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[10px]">
                    <span className="w-2 h-2 bg-red-500 rounded-full" />
                    <span className="text-white/70">O2 Sensor (65%) - ₹3,500</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px]">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full" />
                    <span className="text-white/70">MAF Sensor (25%) - ₹2,500</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute bottom-4 left-4 right-4 h-10 bg-white/5 rounded-xl flex items-center px-3">
            <span className="text-xs text-white/30 flex items-center">
              <span className="animate-pulse">|</span> Type your question...
            </span>
          </div>
        </div>
      );
      
    case 'jobcard':
      return (
        <div className="absolute inset-0 bg-gradient-to-br from-[#1A1A1C] to-[#0D0D0F] p-4 overflow-hidden">
          <div className="flex gap-2 mb-3">
            {['Total: 24', 'Active: 8', 'Done: 12'].map((s, i) => (
              <div key={s} className={`flex-1 p-2 rounded-lg ${i === Math.floor(frame / 30) % 3 ? 'bg-[#F98906]/20 border border-[#F98906]/50' : 'bg-white/5'}`}>
                <p className="text-[10px] text-white/60">{s.split(':')[0]}</p>
                <p className="text-lg font-bold text-white">{s.split(':')[1]}</p>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            {[
              { id: 'JC-0891', status: 'In Progress', color: '#F98906' },
              { id: 'JC-0890', status: 'Completed', color: '#22C55E' },
              { id: 'JC-0889', status: 'Pending', color: '#EAB308' },
            ].map((j, i) => (
              <div key={j.id} className={`p-2 rounded-lg bg-white/5 flex items-center justify-between ${i === Math.floor(frame / 25) % 3 ? 'ring-1 ring-[#F98906]/50' : ''}`}>
                <div>
                  <p className="text-xs text-white font-mono">{j.id}</p>
                  <p className="text-[10px] text-white/50">Swift • Rahul</p>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px]" style={{ backgroundColor: `${j.color}20`, color: j.color }}>{j.status}</span>
              </div>
            ))}
          </div>
        </div>
      );
      
    case 'pdi':
      const progress = (frame % 50) * 2;
      return (
        <div className="absolute inset-0 bg-gradient-to-br from-[#1A1A1C] to-[#0D0D0F] p-4 overflow-hidden">
          <div className="flex justify-between items-center mb-3">
            <p className="text-xs text-white font-medium">PDI Checklist</p>
            <div className="flex items-center gap-2">
              <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-[#F98906] rounded-full transition-all" style={{ width: `${progress}%` }} />
              </div>
              <span className="text-[10px] text-[#F98906]">{progress}%</span>
            </div>
          </div>
          <div className="space-y-2">
            {['Exterior Check', 'Interior Check', 'Engine Bay', 'Electrical'].map((item, i) => (
              <div key={item} className="flex items-center gap-2 p-2 rounded-lg bg-white/5">
                <div className={`w-4 h-4 rounded border ${progress > (i + 1) * 20 ? 'bg-[#F98906] border-[#F98906]' : 'border-white/30'} flex items-center justify-center`}>
                  {progress > (i + 1) * 20 && <span className="text-[10px] text-white">✓</span>}
                </div>
                <span className="text-xs text-white/70">{item}</span>
              </div>
            ))}
          </div>
        </div>
      );
      
    case 'fleet':
      return (
        <div className="absolute inset-0 bg-gradient-to-br from-[#1A1A1C] to-[#0D0D0F] p-4 overflow-hidden">
          <p className="text-xs text-white font-medium mb-3">Fleet Overview</p>
          <div className="grid grid-cols-3 gap-2 mb-3">
            {['🚗 12', '🔧 3', '✅ 8'].map((v, i) => (
              <div key={i} className="p-2 rounded-lg bg-white/5 text-center">
                <p className="text-lg">{v.split(' ')[0]}</p>
                <p className="text-white text-sm font-bold">{v.split(' ')[1]}</p>
              </div>
            ))}
          </div>
          <div className="space-y-1.5">
            {['MH01AB1234 • Active', 'MH02CD5678 • Service', 'MH03EF9012 • Ready'].map((v, i) => (
              <div key={i} className={`p-2 rounded-lg bg-white/5 text-xs ${i === Math.floor(frame / 20) % 3 ? 'border border-[#F98906]/50' : ''}`}>
                <span className="text-white/70">{v}</span>
              </div>
            ))}
          </div>
        </div>
      );
      
    case 'invoice':
      return (
        <div className="absolute inset-0 bg-gradient-to-br from-[#1A1A1C] to-[#0D0D0F] p-4 overflow-hidden">
          <div className="bg-white/5 rounded-lg p-3 mb-3">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-xs text-white font-medium">INV-0024</p>
                <p className="text-[10px] text-white/50">Swift Service</p>
              </div>
              <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded text-[10px]">Paid</span>
            </div>
            <div className="space-y-1 text-[10px] text-white/60">
              <div className="flex justify-between"><span>Labour</span><span>₹2,500</span></div>
              <div className="flex justify-between"><span>Parts</span><span>₹3,200</span></div>
              <div className="flex justify-between"><span>GST (18%)</span><span>₹1,026</span></div>
              <div className="flex justify-between text-white font-bold pt-1 border-t border-white/10">
                <span>Total</span><span>₹6,726</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="flex-1 py-2 bg-[#F98906]/20 text-[#F98906] rounded-lg text-[10px]">📧 Email</button>
            <button className="flex-1 py-2 bg-white/5 text-white/50 rounded-lg text-[10px]">📄 PDF</button>
          </div>
        </div>
      );
      
    case 'analytics':
      return (
        <div className="absolute inset-0 bg-gradient-to-br from-[#1A1A1C] to-[#0D0D0F] p-4 overflow-hidden">
          <p className="text-xs text-white font-medium mb-3">Revenue This Month</p>
          <p className="text-2xl font-bold text-[#F98906] mb-3">₹2,45,000</p>
          <div className="flex items-end gap-1 h-20 mb-3">
            {[40, 65, 45, 80, 55, 70, 90, 60, 75].map((h, i) => (
              <div 
                key={i} 
                className="flex-1 rounded-t transition-all duration-300"
                style={{ 
                  height: `${h + (i === Math.floor(frame / 10) % 9 ? 10 : 0)}%`,
                  backgroundColor: i === Math.floor(frame / 10) % 9 ? '#F98906' : 'rgba(249, 137, 6, 0.3)'
                }}
              />
            ))}
          </div>
          <div className="flex justify-between text-[10px] text-white/50">
            <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
          </div>
        </div>
      );
      
    default:
      return (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
          <Play className="w-16 h-16 text-white/20" />
        </div>
      );
  }
};

// Daily rotating taglines
const TAGLINES = [
  { main: "AI-powered", highlight: "garage intelligence" },
  { main: "The AI for", highlight: "problem solvers" },
  { main: "Your intelligent", highlight: "workshop assistant" },
  { main: "Diagnose smarter,", highlight: "repair faster" },
  { main: "The future of", highlight: "auto service" },
  { main: "Transform your", highlight: "workshop today" },
  { main: "Smart diagnostics for", highlight: "modern garages" },
];

const getDailyTagline = () => {
  const start = new Date(new Date().getFullYear(), 0, 0);
  const diff = Number(new Date()) - Number(start);
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  return TAGLINES[dayOfYear % TAGLINES.length];
};

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  
  // Carousel state
  const [currentSlide, setCurrentSlide] = useState(2);
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [activeDemoId, setActiveDemoId] = useState<string | null>(null);
  
  // Typing animation state
  const [displayedMain, setDisplayedMain] = useState('');
  const [displayedHighlight, setDisplayedHighlight] = useState('');
  const [isTypingMain, setIsTypingMain] = useState(true);
  const [typingComplete, setTypingComplete] = useState(false);
  
  const tagline = getDailyTagline();
  const mascotUrl = "https://customer-assets.emergentagent.com/job_c888b364-381d-411f-9fb8-91dd9dd39bee/artifacts/0nsgjm67_MASCOT.jpg";
  const currentFeature = FEATURE_SLIDES[currentSlide];

  // Auto-advance carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % FEATURE_SLIDES.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  // Check if user is already authenticated
  useEffect(() => {
    const checkExistingAuth = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || '';
        const response = await fetch(`${apiUrl}/api/auth/me`, {
          credentials: 'include'
        });
        
        if (response.ok) {
          const user = await response.json();
          localStorage.setItem('user', JSON.stringify(user));
          navigate('/app/chat', { replace: true });
          return;
        }
      } catch (error) {
        // Not authenticated
      }
      setCheckingAuth(false);
    };
    checkExistingAuth();
  }, [navigate]);

  // Typing animation effect
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    if (isTypingMain) {
      if (displayedMain.length < tagline.main.length) {
        timeout = setTimeout(() => {
          setDisplayedMain(tagline.main.slice(0, displayedMain.length + 1));
        }, 50);
      } else {
        setIsTypingMain(false);
      }
    } else if (!typingComplete) {
      if (displayedHighlight.length < tagline.highlight.length) {
        timeout = setTimeout(() => {
          setDisplayedHighlight(tagline.highlight.slice(0, displayedHighlight.length + 1));
        }, 50);
      } else {
        setTypingComplete(true);
      }
    }
    
    return () => clearTimeout(timeout);
  }, [displayedMain, displayedHighlight, isTypingMain, typingComplete, tagline]);

  // Google OAuth - Using implicit flow with access token
  const googleLogin = useGoogleLogin({
    flow: 'implicit',
    onSuccess: async (tokenResponse) => {
      setIsGoogleLoading(true);
      setError(null);
      try {
        const apiUrl = import.meta.env.VITE_API_URL || '';
        const response = await fetch(`${apiUrl}/api/auth/google`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ access_token: tokenResponse.access_token }),
          credentials: 'include'
        });
        
        const data = await response.json();
        if (response.ok && data.token) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          navigate('/app/chat');
        } else {
          setError(data.detail || 'Failed to sign in with Google');
        }
      } catch (err) {
        setError('Failed to connect to server');
      } finally {
        setIsGoogleLoading(false);
      }
    },
    onError: (errorResponse) => {
      console.error('Google login error:', errorResponse);
      setError('Google sign-in failed. Please try again.');
      setIsGoogleLoading(false);
    }
  });

  const handleGoogleLogin = () => {
    setError(null);
    setIsGoogleLoading(true);
    googleLogin();
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!showEmailForm) {
      setShowEmailForm(true);
      return;
    }

    setIsLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const endpoint = isSignUp ? '/api/auth/signup' : '/api/auth/login';
      const body = isSignUp 
        ? { email, password, name: name || email.split('@')[0] }
        : { email, password };

      const response = await fetch(`${apiUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        credentials: 'include'
      });

      const data = await response.json();
      
      if (response.ok && data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/app/chat');
      } else {
        setError(data.detail || 'Authentication failed');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsSignUp(!isSignUp);
    setError(null);
    setPassword('');
    setName('');
  };

  const openDemo = (demoId: string) => {
    setActiveDemoId(demoId);
    setIsDemoOpen(true);
  };

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % FEATURE_SLIDES.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + FEATURE_SLIDES.length) % FEATURE_SLIDES.length);

  // Loading state
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-[#F98906] mx-auto mb-3" />
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0D0D0D]" data-testid="login-page">
      
      {/* ═══════════════════════════════════════════════════════════════════
          FULL-WIDTH HEADER
          ═══════════════════════════════════════════════════════════════════ */}
      <header className="w-full flex items-center justify-between px-6 lg:px-10 py-5 border-b border-gray-800/50">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <img 
            src={mascotUrl} 
            alt="EKA-AI" 
            className="w-10 h-10 rounded-full object-cover border-2 border-[#F98906]"
          />
          <div className="flex flex-col">
            <span className="text-xl font-bold text-white tracking-tight" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              eka<span className="text-[#F98906]">-</span>a<span className="text-[#F98906]">ı</span>
            </span>
            <span className="text-[10px] text-gray-500 -mt-0.5">
              Governed Automobile Intelligence
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <a href="#features" className="text-sm text-gray-400 hover:text-white transition-colors">Meet EKA-AI</a>
          <Link to="/pricing" className="text-sm text-gray-400 hover:text-white transition-colors">Pricing</Link>
          <a href="#contact" className="text-sm text-gray-400 hover:text-white transition-colors">Contact sales</a>
          <button
            onClick={() => document.getElementById('auth-section')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-5 py-2 text-sm font-medium text-black bg-[#F98906] rounded-lg hover:bg-[#E07A00] transition-colors"
            data-testid="try-eka-ai-btn"
          >
            Try EKA-AI
          </button>
        </nav>

        {/* Mobile Menu Button */}
        <button className="md:hidden text-white p-2" aria-label="Menu">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </header>

      {/* ═══════════════════════════════════════════════════════════════════
          MAIN CONTENT - Two Column Layout
          ═══════════════════════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col lg:flex-row">
        
        {/* LEFT SIDE - Auth Section */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 lg:px-10 py-10 lg:py-0" id="auth-section">
          
          {/* Tagline */}
          <div className="text-center lg:text-left mb-10 max-w-md mx-auto lg:mx-0">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              {displayedMain}
              {isTypingMain && <span className="animate-pulse text-[#F98906]">|</span>}
            </h1>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold italic text-[#F98906] leading-tight mt-1" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              {displayedHighlight}
              {!isTypingMain && !typingComplete && <span className="animate-pulse text-[#F98906]">|</span>}
            </h2>
          </div>

          {/* Auth Form */}
          <div className="w-full max-w-md mx-auto lg:mx-0 space-y-4">
            
            {/* Google Button */}
            <button
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading}
              data-testid="google-login-btn"
              className="w-full flex items-center justify-center gap-3 px-4 py-4 bg-[#1A1A1A] border border-gray-700 rounded-xl text-white hover:bg-[#252525] hover:border-gray-600 transition-all disabled:opacity-50"
            >
              {isGoogleLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              <span className="font-medium">{isGoogleLoading ? 'Connecting...' : 'Continue with Google'}</span>
            </button>

            {/* Divider */}
            <div className="flex items-center gap-4 py-2">
              <div className="flex-1 h-px bg-gray-700"></div>
              <span className="text-sm text-gray-500">OR</span>
              <div className="flex-1 h-px bg-gray-700"></div>
            </div>

            {/* Email Form */}
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              {/* Name field (only for signup) */}
              {showEmailForm && isSignUp && (
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  data-testid="name-input"
                  className="w-full px-4 py-4 bg-[#1A1A1A] border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#F98906] transition-colors"
                  placeholder="Your name"
                />
              )}

              {/* Email Input */}
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  data-testid="email-input"
                  className="w-full pl-12 pr-4 py-4 bg-[#1A1A1A] border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#F98906] transition-colors"
                  placeholder="Enter your email"
                />
              </div>

              {/* Password Input (shown after clicking continue) */}
              {showEmailForm && (
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    data-testid="password-input"
                    className="w-full px-4 py-4 pr-12 bg-[#1A1A1A] border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#F98906] transition-colors"
                    placeholder={isSignUp ? 'Create a password (min 6 characters)' : 'Enter your password'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                data-testid="email-submit-btn"
                className="w-full px-4 py-4 bg-[#F98906] text-black font-semibold rounded-xl hover:bg-[#E07A00] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : showEmailForm ? (
                  isSignUp ? 'Create account' : 'Sign in'
                ) : (
                  'Continue with email'
                )}
              </button>
            </form>

            {/* Toggle Login/Signup */}
            {showEmailForm && (
              <div className="text-center">
                <button
                  type="button"
                  onClick={toggleAuthMode}
                  data-testid="toggle-auth-mode"
                  className="text-sm text-gray-500 hover:text-white transition-colors"
                >
                  {isSignUp ? (
                    <>Already have an account? <span className="text-[#F98906] font-medium">Sign in</span></>
                  ) : (
                    <>Don't have an account? <span className="text-[#F98906] font-medium">Sign up</span></>
                  )}
                </button>
              </div>
            )}

            {/* Terms */}
            <p className="text-xs text-gray-500 text-center leading-relaxed pt-4">
              By continuing, you agree to eka-aı's{' '}
              <Link to="/legal#terms" className="underline hover:text-gray-300 transition-colors">Terms of Service</Link>
              {' '}and{' '}
              <Link to="/legal#privacy" className="underline hover:text-gray-300 transition-colors">Privacy Policy</Link>.
            </p>
          </div>
        </div>

        {/* RIGHT SIDE - Feature Carousel (Desktop Only) */}
        <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-[#1A0A00] via-[#0D0D0D] to-[#0D0D0D] flex-col relative overflow-hidden" id="features">
          
          {/* Decorative particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(30)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 rounded-full bg-[#F98906] opacity-20"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animation: `float ${4 + Math.random() * 4}s ease-in-out infinite`,
                  animationDelay: `${Math.random() * 3}s`
                }}
              />
            ))}
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-8 py-5">
            <span className="text-sm text-gray-500 flex items-center gap-2">
              eka-ai features
              <span className="w-1.5 h-1.5 rounded-full bg-[#F98906] animate-pulse"></span>
            </span>
            <span className="text-sm text-gray-500">
              {String(currentSlide + 1).padStart(2, '0')} / {String(FEATURE_SLIDES.length).padStart(2, '0')}
            </span>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col items-center justify-center px-8 relative">
            
            {/* Video Preview Area - Animated Demo */}
            <div className="relative w-full max-w-md aspect-video mb-8 rounded-2xl overflow-hidden bg-[#0D0D0D] shadow-2xl border border-white/10">
              {/* Live Recording Badge */}
              <div className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-1.5 bg-red-500 rounded-full">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                <span className="text-xs text-white font-medium">Live Preview</span>
              </div>
              
              {/* Animated Preview */}
              <AnimatedPreview type={currentFeature.previewType} />
            </div>

            {/* Feature Title */}
            <h2 className="text-3xl lg:text-4xl font-bold text-white text-center mb-2" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              {currentFeature.title}
            </h2>
            <p className="text-lg text-gray-400 mb-4">{currentFeature.subtitle}</p>

            {/* Description */}
            <p className="text-gray-400 text-center max-w-lg mb-8 text-sm leading-relaxed">
              {currentFeature.description}
            </p>

            {/* Features Grid */}
            <div className="grid grid-cols-2 gap-3 max-w-md w-full mb-8">
              {currentFeature.features.map((feature, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-2 bg-white/5 backdrop-blur-sm rounded-lg px-4 py-3 border border-white/10"
                >
                  <div className="w-2 h-2 rounded-full bg-[#F98906] flex-shrink-0"></div>
                  <span className="text-white text-sm">{feature}</span>
                </div>
              ))}
            </div>

            {/* Watch Demo Button */}
            <button 
              onClick={() => openDemo(currentFeature.demoId)}
              className="flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white hover:bg-white/20 transition-all group"
              data-testid="watch-demo-btn"
            >
              <Play className="w-5 h-5 group-hover:scale-110 transition-transform" fill="currentColor" />
              <span className="text-sm font-medium">Watch Demo</span>
            </button>
          </div>

          {/* Navigation Arrows */}
          <button 
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all z-10"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button 
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all z-10"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Slide Indicators */}
          <div className="flex items-center justify-center gap-2 pb-8">
            {FEATURE_SLIDES.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
                className={`h-2 rounded-full transition-all ${
                  index === currentSlide 
                    ? 'w-8 bg-[#F98906]' 
                    : 'w-2 bg-white/30 hover:bg-white/50'
                }`}
              />
            ))}
          </div>

          {/* Demo Modal */}
          <DemoModal 
            featureId={activeDemoId}
            isOpen={isDemoOpen}
            onClose={() => setIsDemoOpen(false)}
          />
        </div>
      </div>

      {/* Mobile Feature Section */}
      <div className="lg:hidden w-full bg-[#0A0A0B] py-8 px-6">
        <div className="text-center">
          <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            {currentFeature.title}
          </h3>
          <p className="text-gray-400 text-sm mb-4">{currentFeature.subtitle}</p>
          
          {/* Feature dots */}
          <div className="flex justify-center gap-2 mb-4">
            {FEATURE_SLIDES.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentSlide ? 'w-6 bg-[#F98906]' : 'w-2 bg-white/30'
                }`}
              />
            ))}
          </div>
          
          {/* Features list */}
          <div className="flex flex-wrap justify-center gap-2">
            {currentFeature.features.slice(0, 2).map((feature, index) => (
              <div key={index} className="flex items-center gap-1.5 bg-white/5 rounded-full px-3 py-1.5 text-xs text-white">
                <span className="w-1.5 h-1.5 rounded-full bg-[#F98906]"></span>
                {feature}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          FULL-WIDTH FOOTER - Legal Compliance
          ═══════════════════════════════════════════════════════════════════ */}
      <footer className="w-full bg-[#0A0A0A] border-t border-gray-800/50 py-8 px-6 lg:px-10" id="contact">
        <div className="max-w-7xl mx-auto">
          
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            
            {/* Brand Column */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <img 
                  src={mascotUrl} 
                  alt="EKA-AI" 
                  className="w-8 h-8 rounded-full object-cover border border-[#F98906]"
                />
                <span className="text-lg font-bold text-white" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                  eka<span className="text-[#F98906]">-</span>a<span className="text-[#F98906]">ı</span>
                </span>
              </div>
              <p className="text-sm text-gray-500 mb-4">
                Governed Automobile Intelligence by Go4Garage Private Limited
              </p>
              <p className="text-xs text-gray-600">
                CIN: U74999DL2024PTC123456
              </p>
            </div>
            
            {/* Product Links */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2">
                <li><a href="#features" className="text-sm text-gray-400 hover:text-white transition-colors">Features</a></li>
                <li><Link to="/pricing" className="text-sm text-gray-400 hover:text-white transition-colors">Pricing</Link></li>
                <li><a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">API Documentation</a></li>
                <li><a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Integrations</a></li>
              </ul>
            </div>
            
            {/* Company Links */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Blog</a></li>
                <li><a href="#contact" className="text-sm text-gray-400 hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            
            {/* Legal Links */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/legal#privacy" className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5" />
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/legal#terms" className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5" />
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link to="/legal#refund" className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5" />
                    Refund Policy
                  </Link>
                </li>
                <li>
                  <Link to="/legal#cookies" className="text-sm text-gray-400 hover:text-white transition-colors">
                    Cookie Policy
                  </Link>
                </li>
                <li>
                  <Link to="/legal#gdpr" className="text-sm text-gray-400 hover:text-white transition-colors">
                    GDPR Compliance
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          
          {/* Bottom Bar */}
          <div className="pt-6 border-t border-gray-800/50 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-600 text-center md:text-left">
              © {new Date().getFullYear()} Go4Garage Pvt. Ltd. All rights reserved.
            </p>
            
            {/* Trust Badges - hidden on mobile */}
            <div className="hidden sm:flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <Lock className="w-3.5 h-3.5" />
                <span>SSL Secured</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <Shield className="w-3.5 h-3.5" />
                <span>GDPR</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <span>ISO 27001</span>
              </div>
            </div>
            
            {/* Social Links */}
            <div className="flex items-center gap-4">
              <a href="#" className="text-gray-500 hover:text-white transition-colors" aria-label="Twitter">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="#" className="text-gray-500 hover:text-white transition-colors" aria-label="LinkedIn">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
              <a href="#" className="text-gray-500 hover:text-white transition-colors" aria-label="GitHub">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* CSS Animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(1); opacity: 0.2; }
          50% { transform: translateY(-20px) scale(1.2); opacity: 0.4; }
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
