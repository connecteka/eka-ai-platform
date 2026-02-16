import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, ArrowLeft, Shield, Users, BarChart3, Sparkles, Brain, Car, Wrench, Zap, Crown, Building2, Truck, Package, Megaphone } from 'lucide-react';

/* Mascot URL */
const MASCOT_URL = "https://customer-assets.emergentagent.com/job_c888b364-381d-411f-9fb8-91dd9dd39bee/artifacts/0nsgjm67_MASCOT.jpg";

type TabId = 'eka-ai' | 'workshop' | 'mg-fleet' | 'addon';

const TABS = [
  { id: 'eka-ai' as TabId, label: 'EKA-Ai', icon: Brain },
  { id: 'workshop' as TabId, label: 'Workshop', icon: Wrench },
  { id: 'mg-fleet' as TabId, label: 'MG Fleet', icon: Truck },
  { id: 'addon' as TabId, label: 'Add-On', icon: Package },
];

// EKA-Ai Tab Plans
const EKA_AI_PLANS = [
  {
    id: 'free',
    name: 'Free Tier',
    subtitle: 'LEAD MAGNET',
    badge: 'LEAD MAGNET',
    price: '0',
    priceLabel: 'forever',
    period: '',
    description: 'Public Access — No Login',
    features: [
      { text: 'General automobile Q&A', included: true },
      { text: 'Part price estimates (range)', included: true },
      { text: 'Basic troubleshooting', included: true },
      { text: 'No job card, no storage', included: true, negative: true },
    ],
    cta: 'GET STARTED',
    ctaStyle: 'outline' as const,
    dailyLimit: 5,
  },
  {
    id: 'pro',
    name: 'Pro AI Access',
    subtitle: 'CAR OWNERS',
    badge: 'CAR OWNERS',
    price: '299',
    priceLabel: '/month',
    period: '',
    description: 'For Individuals',
    features: [
      { text: 'Unlimited automobile questions', included: true },
      { text: 'Vehicle history memory', included: true },
      { text: 'Predictive maintenance hints', included: true },
      { text: 'No workshop tools', included: true, negative: true },
    ],
    cta: 'GET STARTED',
    ctaStyle: 'primary' as const,
    popular: true,
    dailyLimit: -1,
  },
];

// Workshop Tab Plans
const WORKSHOP_PLANS = [
  {
    id: 'starter',
    name: 'STARTER',
    subtitle: 'Small Workshops',
    badge: null,
    price: '1,499',
    priceLabel: '/month + GST',
    period: '',
    description: 'Small Workshops',
    features: [
      { text: 'Up to 40 Job Cards / month', included: true },
      { text: 'AI diagnostics + estimates', included: true },
      { text: 'Customer approval link', included: true },
      { text: 'PDI checklist + declaration', included: true },
      { text: 'Invoice generation', included: true },
      { text: 'Trust Loop photos', included: true },
    ],
    cta: 'GET STARTED',
    ctaStyle: 'outline' as const,
    dailyLimit: 50,
  },
  {
    id: 'growth',
    name: 'GROWTH',
    subtitle: 'Most Popular',
    badge: 'RECOMMENDED',
    price: '2,999',
    priceLabel: '/month + GST',
    period: '',
    description: 'Most Popular',
    features: [
      { text: 'Up to 120 Job Cards / month', included: true },
      { text: 'Priority AI inference', included: true },
      { text: 'Advanced RAG pricing accuracy', included: true },
      { text: 'Customer confidence score', included: true },
      { text: 'Analytics dashboard', included: true },
      { text: 'WhatsApp / Email customer flow', included: true },
    ],
    cta: 'GET STARTED',
    ctaStyle: 'primary' as const,
    popular: true,
    dailyLimit: 200,
  },
  {
    id: 'elite',
    name: 'ELITE',
    subtitle: 'Multi-Bay / Premium',
    badge: null,
    price: '5,999',
    priceLabel: '/month + GST',
    period: '',
    description: 'Multi-Bay / Premium',
    features: [
      { text: 'Unlimited Job Cards', included: true },
      { text: 'Multi-technician accounts', included: true },
      { text: 'Brand customization', included: true },
      { text: 'Fleet management', included: true },
      { text: 'Audit logs + compliance exports', included: true },
      { text: 'Priority support', included: true },
    ],
    cta: 'GET STARTED',
    ctaStyle: 'outline' as const,
    dailyLimit: -1,
  },
];

// MG Fleet Tab Plans
const MG_FLEET_PLANS = [
  {
    id: 'fleet-basic',
    name: 'MG Fleet BASIC',
    subtitle: 'Up to 10 vehicles',
    badge: null,
    price: '9,999',
    priceLabel: '/month + GST',
    period: '',
    description: 'Up to 10 vehicles',
    features: [
      { text: 'KM guarantee tracking', included: true },
      { text: 'Monthly settlement logic', included: true },
      { text: 'Cost vs revenue dashboard', included: true },
    ],
    cta: 'GET STARTED',
    ctaStyle: 'outline' as const,
  },
  {
    id: 'fleet-pro',
    name: 'MG Fleet PRO',
    subtitle: 'Up to 50 vehicles',
    badge: 'POPULAR',
    price: '24,999',
    priceLabel: '/month + GST',
    period: '',
    description: 'Up to 50 vehicles',
    features: [
      { text: 'Multi-depot analytics', included: true },
      { text: 'Over/Under-utilization logic', included: true },
      { text: 'Predictive cost alerts', included: true },
      { text: 'Contract compliance reports', included: true },
    ],
    cta: 'GET STARTED',
    ctaStyle: 'primary' as const,
    popular: true,
  },
  {
    id: 'fleet-enterprise',
    name: 'MG Fleet ENTERPRISE',
    subtitle: 'Unlimited fleet',
    badge: 'CONTACT US',
    price: 'Custom',
    priceLabel: 'pricing',
    period: '',
    description: 'Unlimited fleet',
    features: [
      { text: 'Dedicated AI tuning', included: true },
      { text: 'SLA + custom reports', included: true },
      { text: 'White-label dashboards', included: true },
    ],
    cta: 'CONTACT SALES',
    ctaStyle: 'outline' as const,
  },
];

// Add-On Tab Plans
const ADDON_PLANS = [
  {
    id: 'pay-per-job',
    name: 'Pay-Per-Job',
    subtitle: 'No subscription required',
    badge: null,
    price: '49',
    priceLabel: 'per Job Card',
    period: '',
    description: 'No subscription required',
    features: [
      { text: 'No subscription needed', included: true },
      { text: 'Pay per job card', included: true },
      { text: 'Perfect for low-volume workshops', included: true },
    ],
    extraText: 'Ideal for rural workshops or trial usage. Pay only when you use. No monthly commitment.',
    cta: 'GET STARTED',
    ctaStyle: 'outline' as const,
  },
  {
    id: 'smart-branding',
    name: 'Smart Branding Slots',
    subtitle: 'Premium visibility',
    badge: null,
    price: '₹15k – ₹50k',
    priceLabel: 'per month per brand',
    period: '',
    description: 'Premium visibility',
    features: [
      { text: 'Targeted brand placement', included: true },
      { text: 'Workshop network visibility', included: true },
      { text: 'Performance analytics', included: true },
    ],
    extraText: 'Premium visibility for insurance, tyre & battery brands within EKA-Ai ecosystem.',
    cta: 'CONTACT SALES',
    ctaStyle: 'outline' as const,
  },
];

const FAQS = [
  {
    q: 'How does the free tier work?',
    a: 'Free tier gives you 5 AI queries per day for general automobile Q&A. No login required. Upgrade to Pro for unlimited queries and vehicle history memory.',
  },
  {
    q: 'What happens when I reach my daily limit?',
    a: 'Once you hit your daily query limit, you\'ll need to wait until the next day or upgrade to a paid plan for unlimited access.',
  },
  {
    q: 'Do my customers need to download an app?',
    a: 'No. Customers receive secure browser links via WhatsApp, SMS, or email. They can view job details, approve work, and see photo/video proof without downloading anything.',
  },
  {
    q: 'What happens if I exceed my job card limit?',
    a: 'You can upgrade your plan anytime. Alternatively, use our Pay-Per-Job add-on at ₹49 per additional job card for occasional overflow.',
  },
  {
    q: 'Is there a setup fee or long-term contract?',
    a: 'No setup fees. No long-term contracts. Pay monthly and cancel anytime. We believe in earning your business every month.',
  },
  {
    q: 'How accurate are the AI diagnostics and estimates?',
    a: 'EKA-AI uses domain-verified intelligence with confidence gating. It only provides estimates when it has sufficient data and clearly indicates confidence levels. No guesswork.',
  },
];

const PricingPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabId>('eka-ai');
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
    // In production, this would redirect to payment gateway
    alert(`Selected ${planId.toUpperCase()} plan. Payment integration coming soon!`);
  };

  const getPlansForTab = () => {
    switch (activeTab) {
      case 'eka-ai': return EKA_AI_PLANS;
      case 'workshop': return WORKSHOP_PLANS;
      case 'mg-fleet': return MG_FLEET_PLANS;
      case 'addon': return ADDON_PLANS;
      default: return EKA_AI_PLANS;
    }
  };

  const getGridCols = () => {
    const plans = getPlansForTab();
    if (plans.length === 2) return 'grid-cols-1 md:grid-cols-2 max-w-4xl';
    return 'grid-cols-1 md:grid-cols-3';
  };

  const plans = getPlansForTab();

  return (
    <div className="min-h-screen bg-[#0D0D0D]" data-testid="pricing-page">
      {/* Header */}
      <header className="w-full flex items-center justify-between px-6 lg:px-10 py-5 border-b border-gray-800/50">
        <div className="flex items-center gap-3">
          <img 
            src={MASCOT_URL} 
            alt="eka-ai" 
            className="w-10 h-10 object-cover"
            style={{ borderRadius: '6px' }}
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

        <Link 
          to="/"
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </header>

      {/* Hero */}
      <div className="text-center py-12 px-6">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-3" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
          Simple. Honest. <span className="text-[#F98906]">No Surprises.</span>
        </h1>
        <p className="text-gray-400 text-base max-w-xl mx-auto mb-6">
          Pay only for productivity. No commission. No customer app required.
        </p>

        {/* Trust badges */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-8">
          {['No Commission', 'No Customer App Required', 'Pay Only for Productivity'].map((badge) => (
            <div key={badge} className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#F98906]/30 bg-[#F98906]/5">
              <Check className="w-3.5 h-3.5 text-[#F98906]" />
              <span className="text-xs text-[#F98906]">{badge}</span>
            </div>
          ))}
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center justify-center">
          <div className="inline-flex items-center gap-1 p-1 rounded-full bg-[#1A1A1A] border border-gray-800">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                    isActive 
                      ? 'bg-[#F98906] text-black' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className={`max-w-6xl mx-auto px-4 sm:px-6 pb-16`}>
        <div className={`grid ${getGridCols()} gap-6 mx-auto`}>
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-2xl p-6 flex flex-col transition-all duration-300 ${
                plan.popular
                  ? 'bg-gradient-to-b from-[#1A0A00] to-[#0D0D0D] border-2 border-[#F98906] shadow-2xl shadow-[#F98906]/10'
                  : 'bg-[#111113] border border-[#2A2A2A] hover:border-[#F98906]/30'
              }`}
              data-testid={`plan-${plan.id}`}
            >
              {/* Badge */}
              {plan.badge && (
                <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold ${
                  plan.badge === 'RECOMMENDED' || plan.badge === 'POPULAR'
                    ? 'bg-[#F98906] text-black'
                    : plan.badge === 'CONTACT US'
                    ? 'bg-gray-700 text-white'
                    : 'bg-gray-700 text-gray-300'
                }`}>
                  {plan.badge}
                </div>
              )}

              {/* Header */}
              <div className="mb-6">
                <h3 className="text-white font-bold text-lg">{plan.name}</h3>
                <p className="text-xs text-gray-500">{plan.description}</p>
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  {plan.price !== 'Custom' && plan.price !== '₹15k – ₹50k' && <span className="text-2xl text-white">₹</span>}
                  <span className="text-5xl font-bold text-white">{plan.price}</span>
                </div>
                <span className="text-gray-500 text-sm">{plan.priceLabel}</span>
              </div>

              {/* Extra text for add-ons */}
              {plan.extraText && (
                <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                  {plan.extraText}
                </p>
              )}

              {/* Daily Limit indicator for AI plans */}
              {'dailyLimit' in plan && plan.dailyLimit > 0 && (
                <div className="flex items-center gap-2 mb-6 px-3 py-2 rounded-lg bg-[#1A1A1A] border border-[#2A2A2A]">
                  <Brain className="w-4 h-4 text-[#F98906]" />
                  <span className="text-xs text-gray-400">
                    {plan.dailyLimit} AI queries/day
                  </span>
                </div>
              )}
              {'dailyLimit' in plan && plan.dailyLimit === -1 && (
                <div className="flex items-center gap-2 mb-6 px-3 py-2 rounded-lg bg-[#1A1A1A] border border-[#2A2A2A]">
                  <Sparkles className="w-4 h-4 text-[#F98906]" />
                  <span className="text-xs text-gray-400">
                    Unlimited AI queries
                  </span>
                </div>
              )}

              {/* Features */}
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className={`text-lg ${feature.included ? 'text-[#F98906]' : 'text-gray-600'}`}>
                      {feature.negative ? '−' : '+'}
                    </span>
                    <span className={`text-sm ${feature.included && !feature.negative ? 'text-gray-300' : 'text-gray-500'}`}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <button
                onClick={() => handleSelectPlan(plan.id)}
                className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                  plan.ctaStyle === 'primary'
                    ? 'bg-[#F98906] text-black hover:bg-[#E07A00]'
                    : 'bg-transparent text-[#F98906] border border-[#F98906] hover:bg-[#F98906]/10'
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Feature Comparison for Workshop Tab */}
      {activeTab === 'workshop' && (
        <div className="bg-[#0A0A0A] py-16 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-white text-center mb-8" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              Workshop Plan Comparison
            </h2>

            <div className="hidden sm:block">
              <div className="grid grid-cols-4 gap-4 text-center mb-4">
                <div></div>
                <div className="text-sm font-semibold text-gray-400">STARTER</div>
                <div className="text-sm font-semibold text-[#F98906]">GROWTH</div>
                <div className="text-sm font-semibold text-gray-400">ELITE</div>
              </div>

              {[
                { feature: 'Job Cards', starter: '40/mo', growth: '120/mo', elite: 'Unlimited' },
                { feature: 'AI Queries', starter: '50/day', growth: '200/day', elite: 'Unlimited' },
                { feature: 'Dashboard Analytics', starter: false, growth: true, elite: true },
                { feature: 'Fleet Management', starter: false, growth: false, elite: true },
                { feature: 'WhatsApp Integration', starter: false, growth: true, elite: true },
                { feature: 'Priority Support', starter: false, growth: true, elite: true },
                { feature: 'Multi-technician', starter: false, growth: false, elite: true },
              ].map((row, idx) => (
                <div key={idx} className="grid grid-cols-4 gap-4 py-3 border-t border-[#1A1A1A]">
                  <div className="text-sm text-gray-400 text-left">{row.feature}</div>
                  <div className="text-sm text-center">
                    {typeof row.starter === 'boolean' ? (
                      row.starter ? <Check className="w-4 h-4 text-[#F98906] mx-auto" /> : <span className="text-gray-600">—</span>
                    ) : (
                      <span className="text-white">{row.starter}</span>
                    )}
                  </div>
                  <div className="text-sm text-center">
                    {typeof row.growth === 'boolean' ? (
                      row.growth ? <Check className="w-4 h-4 text-[#F98906] mx-auto" /> : <span className="text-gray-600">—</span>
                    ) : (
                      <span className="text-[#F98906] font-semibold">{row.growth}</span>
                    )}
                  </div>
                  <div className="text-sm text-center">
                    {typeof row.elite === 'boolean' ? (
                      row.elite ? <Check className="w-4 h-4 text-[#F98906] mx-auto" /> : <span className="text-gray-600">—</span>
                    ) : (
                      <span className="text-white">{row.elite}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* FAQs */}
      <div className="py-16 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-white text-center mb-8" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            Frequently Asked Questions
          </h2>

          <div className="space-y-3">
            {FAQS.map((faq, idx) => (
              <details key={idx} className="group bg-[#111113] border border-[#1A1A1A] rounded-xl">
                <summary className="flex items-center justify-between px-4 sm:px-6 py-4 cursor-pointer text-white font-medium text-sm sm:text-base">
                  {faq.q}
                  <span className="text-[#F98906] group-open:rotate-180 transition-transform ml-2 flex-shrink-0">▼</span>
                </summary>
                <div className="px-4 sm:px-6 pb-4 text-gray-400 text-sm leading-relaxed">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>

          <p className="text-center text-gray-500 text-sm mt-8">
            Still have questions?{' '}
            <a href="mailto:connect@go4garage.in" className="text-[#F98906] hover:underline">
              Contact us
            </a>
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#1A1A1A] py-6 sm:py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={MASCOT_URL} alt="eka-ai" className="w-8 h-8 object-cover" style={{ borderRadius: '4px' }} />
            <span className="text-xs sm:text-sm text-gray-500 text-center sm:text-left">
              © {new Date().getFullYear()} Go4Garage Pvt. Ltd.
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/legal#privacy" className="text-xs text-gray-500 hover:text-white">Privacy</Link>
            <Link to="/legal#terms" className="text-xs text-gray-500 hover:text-white">Terms</Link>
            <Link to="/legal#refund" className="text-xs text-gray-500 hover:text-white">Refunds</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PricingPage;
