import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, ChevronDown, Menu, X } from 'lucide-react';

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
  const [isLoading, setIsLoading] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Typing animation state
  const [displayedMain, setDisplayedMain] = useState('');
  const [displayedHighlight, setDisplayedHighlight] = useState('');
  const [isTypingMain, setIsTypingMain] = useState(true);
  const [typingComplete, setTypingComplete] = useState(false);
  
  const tagline = getDailyTagline();

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

  const handleGoogleLogin = () => {
    alert('Google login coming soon! Use email login for now.');
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
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || 'Login failed');
      }

      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);
      navigate('/claude-chat');
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
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
  const logoUrl = "https://customer-assets.emergentagent.com/job_c888b364-381d-411f-9fb8-91dd9dd39bee/artifacts/n6x27w1i_IMG-20260129-WA0121.jpg";

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
              to="/claude-chat"
              className="px-4 py-2 text-sm text-white bg-[#1A1915] rounded-md hover:bg-[#2D2B26] transition-colors"
            >
              Try EKA-AI
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 text-[#1A1915]"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
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
                to="/claude-chat"
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
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border border-[#D4D0C8] rounded-lg hover:bg-gray-50 transition-colors mb-4"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="text-[#1A1915] font-medium">Continue with Google</span>
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
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white border border-[#D4D0C8] rounded-lg text-[#1A1915] placeholder-[#9B9B9B] focus:outline-none focus:ring-2 focus:ring-[#1A1915] focus:border-transparent"
                placeholder="Enter your email"
              />

              {showEmailForm && (
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 bg-white border border-[#D4D0C8] rounded-lg text-[#1A1915] placeholder-[#9B9B9B] focus:outline-none focus:ring-2 focus:ring-[#1A1915] focus:border-transparent"
                  placeholder="Enter your password"
                />
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-4 py-3 bg-[#1A1915] text-white font-medium rounded-lg hover:bg-[#2D2B26] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  'Continue with email'
                )}
              </button>
            </form>

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

      {/* RIGHT SIDE - Video/Image */}
      <div className="hidden lg:block w-1/2 bg-[#1A1915] relative overflow-hidden">
        {/* Background Image as fallback */}
        <img 
          src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=1920&q=80"
          alt="Team collaboration"
          className="absolute inset-0 w-full h-full object-cover"
        />
        
        {/* Video overlay - will play if supported */}
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          poster="https://images.unsplash.com/photo-1552664730-d307ca884978?w=1920&q=80"
        >
          <source src="https://cdn.coverr.co/videos/coverr-typing-on-computer-keyboard-8668/1080p.mp4" type="video/mp4" />
        </video>
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        
        {/* Welcome Card */}
        <div className="absolute bottom-8 right-8 left-8 max-w-md ml-auto">
          <div className="bg-[#1A1915]/90 backdrop-blur-sm rounded-xl p-6 text-white">
            <div className="flex items-center gap-3 mb-3">
              <img 
                src={mascotUrl} 
                alt="EKA-AI Mascot" 
                className="w-12 h-12 rounded-full object-cover border-2 border-[#E65C2E]"
              />
              <div>
                <h3 className="text-lg font-semibold">Welcome to EKA-AI</h3>
                <p className="text-xs text-gray-400">Governed Automobile Intelligence</p>
              </div>
            </div>
            <p className="text-sm text-gray-300 mb-4">
              Your intelligent automobile assistant. Get instant diagnostics, 
              manage job cards, and streamline your workshop operations.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <button className="px-4 py-2 border border-white/30 rounded-lg text-sm hover:bg-white/10 transition-colors">
                Learn More
              </button>
              <Link
                to="/claude-chat"
                className="px-4 py-2 bg-[#E65C2E] rounded-lg text-sm hover:bg-[#D54D1F] transition-colors text-center"
              >
                Start Chatting
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Video Section */}
      <div className="lg:hidden w-full h-64 sm:h-80 bg-[#1A1915] relative overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=1920&q=80"
          alt="Team collaboration"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          poster="https://images.unsplash.com/photo-1552664730-d307ca884978?w=1920&q=80"
        >
          <source src="https://cdn.coverr.co/videos/coverr-typing-on-computer-keyboard-8668/1080p.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3">
          <img 
            src={mascotUrl} 
            alt="EKA-AI Mascot" 
            className="w-10 h-10 rounded-full object-cover border-2 border-[#E65C2E]"
          />
          <div>
            <h3 className="text-white font-semibold">Intelligent Workshop Management</h3>
            <p className="text-gray-300 text-sm">AI-powered diagnostics for your garage</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
