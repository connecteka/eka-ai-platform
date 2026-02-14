import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, Mail, Eye, EyeOff, Play, ChevronLeft, ChevronRight } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import DemoModal from '../components/DemoModal';

// Feature slides for the carousel
const FEATURE_SLIDES = [
  {
    id: 'ai-chat',
    title: 'AI-Powered Chat',
    subtitle: 'Intelligent Diagnostics',
    description: 'Get instant vehicle diagnostics and repair recommendations powered by advanced AI technology.',
    features: ['Natural language queries', 'Real-time diagnostics', 'Repair suggestions', 'Cost estimates'],
    videoUrl: '/demos/ai-chat-demo.webm',
    demoId: 'ai-chat',
    accentColor: '#F98906'
  },
  {
    id: 'job-cards',
    title: 'Job Card → Invoice',
    subtitle: 'Complete Workflow',
    description: 'Seamless transition from job creation to GST-compliant invoicing with automatic calculations.',
    features: ['One-click job card creation', 'Real-time status tracking', 'Auto GST calculation', 'Digital invoice delivery'],
    videoUrl: '/demos/job-card-demo.webm',
    demoId: 'job-cards',
    accentColor: '#F98906'
  },
  {
    id: 'pdi',
    title: 'PDI Process',
    subtitle: 'Pre-Delivery Inspection',
    description: 'Streamlined digital PDI workflow with AI-powered checklist verification and instant reporting.',
    features: ['120+ point inspection checklist', 'Photo & video documentation', 'Digital signatures', 'Instant PDF reports'],
    videoUrl: '/demos/pdi-demo.webm',
    demoId: 'pdi',
    accentColor: '#F98906'
  },
  {
    id: 'fleet',
    title: 'Fleet Management',
    subtitle: 'Enterprise Solutions',
    description: 'Comprehensive fleet tracking and management for dealerships and service centers.',
    features: ['Multi-vehicle tracking', 'Service scheduling', 'Performance analytics', 'Cost optimization'],
    videoUrl: '/demos/fleet-demo.webm',
    demoId: 'fleet',
    accentColor: '#F98906'
  },
  {
    id: 'invoicing',
    title: 'Smart Invoicing',
    subtitle: 'GST Compliant',
    description: 'Automatic GST calculations, digital delivery, and complete payment tracking.',
    features: ['Auto tax calculation', 'Email delivery', 'Payment tracking', 'Report generation'],
    videoUrl: '/demos/invoice-demo.webm',
    demoId: 'invoicing',
    accentColor: '#F98906'
  },
  {
    id: 'analytics',
    title: 'Business Analytics',
    subtitle: 'Data-Driven Insights',
    description: 'Real-time dashboards and reports to track your workshop performance.',
    features: ['Revenue tracking', 'Customer insights', 'Service analytics', 'Growth metrics'],
    videoUrl: '/demos/analytics-demo.webm',
    demoId: 'analytics',
    accentColor: '#F98906'
  }
];

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
  const [currentSlide, setCurrentSlide] = useState(2); // Start at Job Card → Invoice
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [activeDemoId, setActiveDemoId] = useState<string | null>(null);
  
  // Typing animation state
  const [displayedMain, setDisplayedMain] = useState('');
  const [displayedHighlight, setDisplayedHighlight] = useState('');
  const [isTypingMain, setIsTypingMain] = useState(true);
  const [typingComplete, setTypingComplete] = useState(false);
  
  const tagline = getDailyTagline();

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
          navigate('/app/dashboard', { replace: true });
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

  // Google OAuth
  const googleLogin = useGoogleLogin({
    flow: 'auth-code',
    onSuccess: async (codeResponse) => {
      setIsGoogleLoading(true);
      setError(null);
      try {
        const apiUrl = import.meta.env.VITE_API_URL || '';
        const response = await fetch(`${apiUrl}/api/auth/google/callback`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: codeResponse.code }),
          credentials: 'include'
        });
        
        const data = await response.json();
        if (response.ok && data.token) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          navigate('/app/dashboard');
        } else {
          setError(data.detail || 'Failed to sign in with Google');
        }
      } catch (err) {
        setError('Failed to connect to server');
      } finally {
        setIsGoogleLoading(false);
      }
    },
    onError: () => {
      setError('Google sign-in was cancelled');
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
        navigate('/app/dashboard');
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

  const mascotUrl = "https://customer-assets.emergentagent.com/job_c888b364-381d-411f-9fb8-91dd9dd39bee/artifacts/0nsgjm67_MASCOT.jpg";
  const currentFeature = FEATURE_SLIDES[currentSlide];

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
    <div className="min-h-screen flex flex-col lg:flex-row" data-testid="login-page">
      {/* ═══════════════════════════════════════════════════════════════════
          LEFT SIDE - Auth Section (Dark Theme)
          ═══════════════════════════════════════════════════════════════════ */}
      <div className="w-full lg:w-1/2 min-h-screen bg-[#0D0D0D] flex flex-col">
        
        {/* Header */}
        <header className="flex items-center justify-between px-6 lg:px-10 py-5">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img 
              src={mascotUrl} 
              alt="EKA-AI" 
              className="w-10 h-10 rounded-full object-cover border-2 border-[#F98906]"
            />
            <div className="flex flex-col">
              <span className="text-xl font-bold text-white tracking-tight" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                eka-ai
              </span>
              <span className="text-[10px] text-gray-500 -mt-0.5">
                Governed Automobile Intelligence
              </span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Meet EKA-AI</a>
            <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Pricing</a>
            <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Contact sales</a>
            <Link
              to="/app/dashboard"
              className="px-5 py-2 text-sm font-medium text-black bg-[#F98906] rounded-lg hover:bg-[#E07A00] transition-colors"
            >
              Try EKA-AI
            </Link>
          </nav>
        </header>

        {/* Main Content - Centered */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 lg:px-10 pb-10">
          
          {/* Tagline */}
          <div className="text-center mb-12 w-full max-w-md">
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
          <div className="w-full max-w-md space-y-4">
            
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
              By continuing, you agree to EKA-AI's{' '}
              <a href="/legal#terms" className="underline hover:text-gray-300 transition-colors">Consumer Terms</a>
              {' '}and{' '}
              <a href="/legal#privacy" className="underline hover:text-gray-300 transition-colors">Usage Policy</a>
              , and acknowledge their{' '}
              <a href="/legal#privacy" className="underline hover:text-gray-300 transition-colors">Privacy Policy</a>.
            </p>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          RIGHT SIDE - Feature Carousel (Dark with Gradient)
          ═══════════════════════════════════════════════════════════════════ */}
      <div className="hidden lg:flex w-1/2 min-h-screen bg-gradient-to-br from-[#1A0A00] via-[#0D0D0D] to-[#0D0D0D] flex-col relative overflow-hidden">
        
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
          
          {/* Video Preview Area */}
          <div className="relative w-full max-w-md aspect-video mb-8 rounded-2xl overflow-hidden bg-white/5 shadow-2xl">
            {/* Live Recording Badge */}
            <div className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-1.5 bg-red-500 rounded-full">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
              <span className="text-xs text-white font-medium">Live Recording</span>
            </div>
            
            {/* Placeholder for video/demo */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
              <Play className="w-16 h-16 text-white/20" />
            </div>
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
