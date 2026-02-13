import React, { useState, useEffect } from 'react';
import { 
  ClipboardCheck, 
  Car, 
  FileText, 
  MessageSquare, 
  Target, 
  TrendingUp,
  Play,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface FeatureSlide {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
  gradient: string;
  accentColor: string;
}

const FEATURE_SLIDES: FeatureSlide[] = [
  {
    id: 1,
    title: "PDI Process",
    subtitle: "Pre-Delivery Inspection",
    description: "Streamlined digital PDI workflow with AI-powered checklist verification and instant reporting.",
    icon: <ClipboardCheck className="w-16 h-16" />,
    features: [
      "120+ point inspection checklist",
      "Photo & video documentation",
      "Digital signatures",
      "Instant PDF reports"
    ],
    gradient: "from-emerald-500 to-teal-600",
    accentColor: "#10B981"
  },
  {
    id: 2,
    title: "MG Model",
    subtitle: "Maintenance Guarantee",
    description: "Revolutionary subscription model for predictable vehicle maintenance with fixed monthly costs.",
    icon: <Car className="w-16 h-16" />,
    features: [
      "Fixed monthly subscription",
      "Unlimited service visits",
      "Genuine parts included",
      "24/7 roadside assistance"
    ],
    gradient: "from-blue-500 to-indigo-600",
    accentColor: "#3B82F6"
  },
  {
    id: 3,
    title: "Job Card → Invoice",
    subtitle: "Complete Workflow",
    description: "Seamless transition from job creation to GST-compliant invoicing with automatic calculations.",
    icon: <FileText className="w-16 h-16" />,
    features: [
      "One-click job card creation",
      "Real-time status tracking",
      "Auto GST calculation",
      "Digital invoice delivery"
    ],
    gradient: "from-orange-500 to-red-500",
    accentColor: "#F97316"
  },
  {
    id: 4,
    title: "AI Chat Assistant",
    subtitle: "EKA-AI Powered",
    description: "Intelligent chatbot for instant vehicle diagnostics, service recommendations, and customer support.",
    icon: <MessageSquare className="w-16 h-16" />,
    features: [
      "Instant diagnostics",
      "Service cost estimates",
      "Multi-language support",
      "Voice-enabled queries"
    ],
    gradient: "from-purple-500 to-pink-500",
    accentColor: "#A855F7"
  },
  {
    id: 5,
    title: "Brand Marketing",
    subtitle: "Multi-Brand Support",
    description: "Showcase multiple automobile brands with customized marketing campaigns and promotions.",
    icon: <Target className="w-16 h-16" />,
    features: [
      "Multi-brand dashboard",
      "Custom brand themes",
      "Promotional banners",
      "Brand performance analytics"
    ],
    gradient: "from-cyan-500 to-blue-500",
    accentColor: "#06B6D4"
  },
  {
    id: 6,
    title: "Regional Marketing",
    subtitle: "City & Zone Targeting",
    description: "Target customers by region, city, and zone with localized marketing campaigns and offers.",
    icon: <TrendingUp className="w-16 h-16" />,
    features: [
      "Geo-targeted campaigns",
      "City-wise analytics",
      "Regional pricing",
      "Local language support"
    ],
    gradient: "from-amber-500 to-orange-500",
    accentColor: "#F59E0B"
  }
];

const FeatureVideoCarousel: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [progress, setProgress] = useState(0);

  const SLIDE_DURATION = 6000; // 6 seconds per slide

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          return 0;
        }
        return prev + (100 / (SLIDE_DURATION / 50));
      });
    }, 50);

    const slideInterval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentSlide(prev => (prev + 1) % FEATURE_SLIDES.length);
        setIsAnimating(false);
        setProgress(0);
      }, 300);
    }, SLIDE_DURATION);

    return () => {
      clearInterval(progressInterval);
      clearInterval(slideInterval);
    };
  }, [currentSlide]);

  const goToSlide = (index: number) => {
    if (index !== currentSlide) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentSlide(index);
        setIsAnimating(false);
        setProgress(0);
      }, 300);
    }
  };

  const nextSlide = () => {
    goToSlide((currentSlide + 1) % FEATURE_SLIDES.length);
  };

  const prevSlide = () => {
    goToSlide((currentSlide - 1 + FEATURE_SLIDES.length) % FEATURE_SLIDES.length);
  };

  const slide = FEATURE_SLIDES[currentSlide];

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#0A0A0B]">
      {/* Animated Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${slide.gradient} opacity-20 transition-all duration-500`}></div>
      
      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-full opacity-30"
            style={{
              backgroundColor: slide.accentColor,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`
            }}
          ></div>
        ))}
      </div>

      {/* Main Content */}
      <div className={`relative h-full flex flex-col items-center justify-center p-8 lg:p-12 transition-all duration-300 ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
        {/* Feature Icon with Glow */}
        <div className="relative mb-6">
          <div 
            className={`absolute inset-0 bg-gradient-to-br ${slide.gradient} blur-2xl opacity-50 scale-150`}
          ></div>
          <div 
            className={`relative p-6 rounded-2xl bg-gradient-to-br ${slide.gradient} text-white shadow-2xl`}
            style={{ boxShadow: `0 0 60px ${slide.accentColor}40` }}
          >
            {slide.icon}
          </div>
        </div>

        {/* Title */}
        <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-white text-center mb-2">
          {slide.title}
        </h2>
        <p className="text-lg lg:text-xl text-gray-400 mb-6">{slide.subtitle}</p>

        {/* Description */}
        <p className="text-gray-300 text-center max-w-lg mb-8 text-sm lg:text-base leading-relaxed">
          {slide.description}
        </p>

        {/* Features List */}
        <div className="grid grid-cols-2 gap-3 max-w-md w-full mb-8">
          {slide.features.map((feature, index) => (
            <div 
              key={index}
              className="flex items-center gap-2 bg-white/5 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/10"
              style={{ 
                animationDelay: `${index * 0.1}s`,
                animation: 'fadeInUp 0.5s ease-out forwards'
              }}
            >
              <div 
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: slide.accentColor }}
              ></div>
              <span className="text-white text-xs lg:text-sm">{feature}</span>
            </div>
          ))}
        </div>

        {/* Play Demo Button */}
        <button className="flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white hover:bg-white/20 transition-all group">
          <Play className="w-5 h-5 group-hover:scale-110 transition-transform" fill="currentColor" />
          <span className="text-sm font-medium">Watch Demo</span>
        </button>
      </div>

      {/* Navigation Arrows */}
      <button 
        onClick={prevSlide}
        data-testid="carousel-prev-btn"
        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-all z-10"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button 
        onClick={nextSlide}
        data-testid="carousel-next-btn"
        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-all z-10"
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Slide Indicators with Progress */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2">
        {FEATURE_SLIDES.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className="relative h-1.5 rounded-full overflow-hidden transition-all"
            style={{ 
              width: index === currentSlide ? '32px' : '8px',
              backgroundColor: index === currentSlide ? 'transparent' : 'rgba(255,255,255,0.3)'
            }}
          >
            {index === currentSlide && (
              <>
                <div className="absolute inset-0 bg-white/30"></div>
                <div 
                  className="absolute inset-y-0 left-0 bg-white rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                ></div>
              </>
            )}
          </button>
        ))}
      </div>

      {/* Slide Counter */}
      <div className="absolute top-6 right-6 text-white/50 text-sm font-mono">
        {String(currentSlide + 1).padStart(2, '0')} / {String(FEATURE_SLIDES.length).padStart(2, '0')}
      </div>

      {/* Brand Watermark */}
      <div className="absolute top-6 left-6 flex items-center gap-2 text-white/30">
        <span className="text-sm font-medium">eka-ai features</span>
      </div>

      {/* CSS for animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default FeatureVideoCarousel;
