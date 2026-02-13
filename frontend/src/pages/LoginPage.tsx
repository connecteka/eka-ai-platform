import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, ChevronDown, Menu, X, Mail, Eye, EyeOff } from 'lucide-react';
import FeatureVideoCarousel from '../components/FeatureVideoCarousel';

// Daily rotating taglines
const TAGLINES = [
  { main: "The AI for", highlight: "problem solvers" },
  { main: "Your intelligent", highlight: "workshop assistant" },
  { main: "Diagnose smarter,", highlight: "repair faster" },
  { main: "The future of", highlight: "auto service" },
  { main: "AI-powered", highlight: "garage intelligence" },
  { main: "Transform your", highlight: "workshop today" },
  { main: "Smart diagnostics for", highlight: "modern garages" },
];

// Get tagline based on day of year
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  
  // Typing animation state
  const [displayedMain, setDisplayedMain] = useState('');
  const [displayedHighlight, setDisplayedHighlight] = useState('');
  const [isTypingMain, setIsTypingMain] = useState(true);
  const [typingComplete, setTypingComplete] = useState(false);
  
  const tagline = getDailyTagline();

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
        // Not authenticated, continue showing login
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
        }, 80);
      } else {
        setIsTypingMain(false);
      }
    } else {
      if (displayedHighlight.length < tagline.highlight.length) {
        timeout = setTimeout(() => {
          setDisplayedHighlight(tagline.highlight.slice(0, displayedHighlight.length + 1));
        }, 80);
      } else {
        setTypingComplete(true);
      }
    }
    
    return () => clearTimeout(timeout);
  }, [displayedMain, displayedHighlight, isTypingMain, tagline]);

  // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
  const handleGoogleLogin = () => {
    setIsGoogleLoading(true);
    setError(null);
    
    // Build redirect URL dynamically from current origin
    const redirectUrl = window.location.origin + '/app/dashboard';
    
    // Redirect to Emergent Auth
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!showEmailForm) {
      setShowEmailForm(true);
      return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const endpoint = isSignUp ? '/api/auth/register' : '/api/auth/login';
      
      const body = isSignUp 
        ? { email, password, name: name || email.split('@')[0] }
        : { email, password };

      const response = await fetch(`${apiUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || 'Authentication failed');
      }

      // Store user data
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      
      navigate('/app/dashboard', { replace: true, state: { user: data.user } });
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsSignUp(!isSignUp);
    setError(null);
    setPassword('');
  };

  const navItems = [
    { label: 'Meet EKA-AI', hasDropdown: true },
    { label: 'Platform', hasDropdown: true },
    { label: 'Solutions', hasDropdown: true },
    { label: 'Pricing', hasDropdown: true },
    { label: 'Learn', hasDropdown: true },
  ];

  // Brand assets
  const mascotUrl = "https://customer-assets.emergentagent.com/job_c888b364-381d-411f-9fb8-91dd9dd39bee/artifacts/0nsgjm67_MASCOT.jpg";

  // Show loading while checking auth
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#F5F1EB] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-[#E65C2E] mx-auto mb-3" />
          <p className="text-[#6B6B6B]">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* LEFT SIDE - Beige/Cream Background */}
      <div className="w-full lg:w-1/2 bg-[#F5F1EB] flex flex-col min-h-screen lg:min-h-0">
        {/* Header */}
        <header className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
          {/* Logo with Mascot */}
          <div className="flex items-center gap-2">
            <img 
              src={mascotUrl} 
              alt="EKA-AI Mascot" 
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-[#E65C2E]"
            />
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-bold text-[#1A1915] tracking-tight">
                eka-ai
              </span>
              <span className="text-[10px] text-[#6B6B6B] -mt-1 hidden sm:block">
                Governed Automobile Intelligence
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item, index) => (
              <button
                key={index}
                className="flex items-center gap-1 px-3 py-2 text-sm text-[#1A1915] hover:bg-black/5 rounded-md transition-colors"
              >
                {item.label}
                {item.hasDropdown && <ChevronDown className="w-4 h-4" />}
              </button>
            ))}
          </nav>

          {/* Right Side Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <button className="px-4 py-2 text-sm text-[#1A1915] hover:bg-black/5 rounded-md transition-colors">
              Contact sales
            </button>
            <Link
              to="/app/dashboard"
              className="px-4 py-2 text-sm text-white bg-[#1A1915] rounded-md hover:bg-[#2D2B26] transition-colors"
            >
              Try EKA-AI
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 text-[#1A1915]"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="mobile-menu-toggle"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </header>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#F5F1EB] border-t border-[#E5E1DB] px-4 py-4">
            {navItems.map((item, index) => (
              <button
                key={index}
                className="flex items-center justify-between w-full px-3 py-3 text-sm text-[#1A1915] hover:bg-black/5 rounded-md"
              >
                {item.label}
                {item.hasDropdown && <ChevronDown className="w-4 h-4" />}
              </button>
            ))}
            <div className="border-t border-[#E5E1DB] mt-3 pt-3 space-y-2">
              <button className="w-full px-3 py-3 text-sm text-[#1A1915] hover:bg-black/5 rounded-md text-left">
                Contact sales
              </button>
              <Link
                to="/app/dashboard"
                className="block w-full px-3 py-3 text-sm text-white bg-[#1A1915] rounded-md text-center"
              >
                Try EKA-AI
              </Link>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-8 py-8 lg:py-0">
          {/* Animated Tagline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-serif text-[#1A1915] text-center leading-tight mb-8 lg:mb-12 min-h-[120px] sm:min-h-[160px] lg:min-h-[200px]">
            <span className="block">
              {displayedMain}
              {isTypingMain && <span className="animate-pulse text-[#E65C2E]">|</span>}
            </span>
            <span className="italic block">
              {displayedHighlight}
              {!isTypingMain && !typingComplete && <span className="animate-pulse text-[#E65C2E]">|</span>}
            </span>
          </h1>

          {/* Auth Card */}
          <div className="w-full max-w-sm sm:max-w-md">
            {/* Google Button */}
            <button
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading}
              data-testid="google-login-btn"
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border border-[#D4D0C8] rounded-lg hover:bg-gray-50 transition-colors mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGoogleLoading ? (
                <Loader2 className="w-5 h-5 animate-spin text-[#1A1915]" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              <span className="text-[#1A1915] font-medium">
                {isGoogleLoading ? 'Connecting...' : 'Continue with Google'}
              </span>
            </button>

            {/* Divider */}
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-[#D4D0C8]"></div>
              <span className="text-sm text-[#6B6B6B]">OR</span>
              <div className="flex-1 h-px bg-[#D4D0C8]"></div>
            </div>

            {/* Email Form */}
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3" data-testid="auth-error">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Name field (only for signup) */}
              {showEmailForm && isSignUp && (
                <div className="relative">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    data-testid="name-input"
                    className="w-full px-4 py-3 bg-white border border-[#D4D0C8] rounded-lg text-[#1A1915] placeholder-[#9B9B9B] focus:outline-none focus:ring-2 focus:ring-[#1A1915] focus:border-transparent"
                    placeholder="Your name"
                  />
                </div>
              )}

              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9B9B9B]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  data-testid="email-input"
                  className="w-full pl-12 pr-4 py-3 bg-white border border-[#D4D0C8] rounded-lg text-[#1A1915] placeholder-[#9B9B9B] focus:outline-none focus:ring-2 focus:ring-[#1A1915] focus:border-transparent"
                  placeholder="Enter your email"
                />
              </div>

              {showEmailForm && (
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    data-testid="password-input"
                    className="w-full px-4 py-3 pr-12 bg-white border border-[#D4D0C8] rounded-lg text-[#1A1915] placeholder-[#9B9B9B] focus:outline-none focus:ring-2 focus:ring-[#1A1915] focus:border-transparent"
                    placeholder={isSignUp ? 'Create a password (min 6 characters)' : 'Enter your password'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9B9B9B] hover:text-[#1A1915] transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                data-testid="email-submit-btn"
                className="w-full px-4 py-3 bg-[#1A1915] text-white font-medium rounded-lg hover:bg-[#2D2B26] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
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
              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={toggleAuthMode}
                  data-testid="toggle-auth-mode"
                  className="text-sm text-[#6B6B6B] hover:text-[#1A1915] transition-colors"
                >
                  {isSignUp ? (
                    <>Already have an account? <span className="font-medium text-[#E65C2E]">Sign in</span></>
                  ) : (
                    <>Don't have an account? <span className="font-medium text-[#E65C2E]">Sign up</span></>
                  )}
                </button>
              </div>
            )}

            {/* Terms */}
            <p className="text-xs text-[#6B6B6B] text-center mt-6 leading-relaxed">
              By continuing, you agree to EKA-AI's{' '}
              <a href="/legal#terms" className="underline hover:text-[#1A1915]">
                Consumer Terms
              </a>{' '}
              and{' '}
              <a href="/legal#privacy" className="underline hover:text-[#1A1915]">
                Usage Policy
              </a>
              , and acknowledge their{' '}
              <a href="/legal#privacy" className="underline hover:text-[#1A1915]">
                Privacy Policy
              </a>
              .
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - Feature Video Carousel */}
      <div className="hidden lg:block w-1/2 bg-[#0A0A0B] relative overflow-hidden">
        <FeatureVideoCarousel />
      </div>

      {/* Mobile Feature Showcase Section */}
      <div className="lg:hidden w-full bg-[#0A0A0B] relative overflow-hidden">
        <MobileFeatureShowcase />
      </div>
    </div>
  );
};

// Mobile Feature Showcase Component
const MobileFeatureShowcase: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const features = [
    { title: "PDI Process", desc: "120+ point digital inspection", icon: "📋", color: "#10B981" },
    { title: "MG Model", desc: "Fixed monthly subscription", icon: "🚗", color: "#3B82F6" },
    { title: "Job Card → Invoice", desc: "Complete workflow automation", icon: "📄", color: "#F97316" },
    { title: "AI Chat", desc: "Instant vehicle diagnostics", icon: "💬", color: "#A855F7" },
    { title: "Brand Marketing", desc: "Multi-brand campaigns", icon: "🎯", color: "#06B6D4" },
    { title: "Regional Targeting", desc: "City-wise marketing", icon: "📍", color: "#F59E0B" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const currentFeature = features[currentSlide];

  return (
    <div className="py-8 px-4" data-testid="mobile-feature-showcase">
      {/* Current Feature */}
      <div className="text-center mb-6">
        <div 
          className="inline-flex items-center justify-center w-16 h-16 rounded-2xl text-3xl mb-3"
          style={{ backgroundColor: `${currentFeature.color}20` }}
        >
          {currentFeature.icon}
        </div>
        <h3 className="text-white text-xl font-bold" data-testid="mobile-feature-title">
          {currentFeature.title}
        </h3>
        <p className="text-gray-400 text-sm mt-1" data-testid="mobile-feature-desc">
          {currentFeature.desc}
        </p>
      </div>

      {/* Feature Dots */}
      <div className="flex justify-center gap-2 mb-4" data-testid="mobile-feature-dots">
        {features.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            data-testid={`mobile-dot-${index}`}
            aria-label={`Go to feature ${index + 1}`}
            className={`h-2 rounded-full transition-all ${
              index === currentSlide ? 'w-6 bg-[#E65C2E]' : 'w-2 bg-white/30'
            }`}
          />
        ))}
      </div>

      {/* Feature Grid Preview */}
      <div className="grid grid-cols-3 gap-2 mt-4" data-testid="mobile-feature-grid">
        {features.map((feature, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            data-testid={`mobile-feature-btn-${index}`}
            className={`p-3 rounded-lg text-center transition-all ${
              index === currentSlide 
                ? 'bg-white/10 border border-white/20' 
                : 'bg-white/5'
            }`}
          >
            <span className="text-xl block">{feature.icon}</span>
            <p className="text-[10px] text-white/70 mt-1 truncate">{feature.title}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default LoginPage;
