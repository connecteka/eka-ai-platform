import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, Zap, Crown, ArrowLeft, Sparkles, Building2, Rocket, Shield, Users, BarChart3, MessageSquare, FileText, Truck, Brain } from 'lucide-react';

/* Mascot URL */
const MASCOT_URL = "https://customer-assets.emergentagent.com/job_c888b364-381d-411f-9fb8-91dd9dd39bee/artifacts/0nsgjm67_MASCOT.jpg";

const PLANS = [
  {
    id: 'starter',
    name: 'STARTER',
    subtitle: 'Small Workshops',
    price: '1,499',
    priceNum: 1499,
    period: '/month + GST',
    features: [
      { text: 'Up to 40 Job Cards / month', included: true },
      { text: 'AI diagnostics + estimates', included: true },
      { text: 'Customer approval link', included: true },
      { text: 'PDI checklist + declaration', included: true },
      { text: 'Invoice generation', included: true },
      { text: 'Trust Loop photos', included: true },
      { text: 'Analytics dashboard', included: false },
      { text: 'Fleet management', included: false },
      { text: 'WhatsApp / Email flow', included: false },
    ],
    icon: Zap,
    popular: false,
    aiQueries: 100,
  },
  {
    id: 'growth',
    name: 'GROWTH',
    subtitle: 'Most Popular',
    price: '2,999',
    priceNum: 2999,
    period: '/month + GST',
    features: [
      { text: 'Up to 120 Job Cards / month', included: true },
      { text: 'Priority AI inference', included: true },
      { text: 'Advanced RAG pricing accuracy', included: true },
      { text: 'Customer confidence score', included: true },
      { text: 'Analytics dashboard', included: true },
      { text: 'WhatsApp / Email customer flow', included: true },
      { text: 'Fleet management', included: false },
      { text: 'Multi-technician accounts', included: false },
      { text: 'Brand customization', included: false },
    ],
    icon: Rocket,
    popular: true,
    aiQueries: 500,
  },
  {
    id: 'elite',
    name: 'ELITE',
    subtitle: 'Multi-Bay / Premium',
    price: '5,999',
    priceNum: 5999,
    period: '/month + GST',
    features: [
      { text: 'Unlimited Job Cards', included: true },
      { text: 'Multi-technician accounts', included: true },
      { text: 'Brand customization', included: true },
      { text: 'Fleet management', included: true },
      { text: 'Audit logs + compliance exports', included: true },
      { text: 'Priority support', included: true },
      { text: 'Early feature access', included: true },
      { text: 'Dedicated account manager', included: true },
      { text: 'Custom integrations', included: true },
    ],
    icon: Crown,
    popular: false,
    aiQueries: -1, // Unlimited
  },
];

const FAQS = [
  {
    q: 'How does the subscription model work?',
    a: 'You pay a fixed monthly fee based on your plan. No commission on jobs, no hidden fees. Your subscription includes all features mentioned in your plan tier.',
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
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
    // In production, this would redirect to payment gateway
    alert(`Selected ${planId.toUpperCase()} plan. Payment integration coming soon!`);
  };

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
      <div className="text-center py-16 px-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F98906]/10 border border-[#F98906]/20 mb-6">
          <span className="text-[11px] text-[#F98906] font-semibold uppercase tracking-wider">Transparent Pricing</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
          Simple. Honest. <span className="text-[#F98906]">No Surprises.</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Pay only for productivity. No commission. No customer app required.
        </p>

        {/* Trust badges */}
        <div className="flex items-center justify-center gap-6 mt-8">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Shield className="w-4 h-4 text-[#F98906]" />
            <span>No Commission</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Users className="w-4 h-4 text-[#F98906]" />
            <span>No Customer App Required</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <BarChart3 className="w-4 h-4 text-[#F98906]" />
            <span>Pay Only for Productivity</span>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-6xl mx-auto px-6 pb-16">
        <div className="grid md:grid-cols-3 gap-6">
          {PLANS.map((plan) => {
            const Icon = plan.icon;
            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl p-6 flex flex-col transition-all duration-300 ${
                  plan.popular
                    ? 'bg-gradient-to-b from-[#1A0A00] to-[#0D0D0D] border-2 border-[#F98906] shadow-2xl shadow-[#F98906]/10 scale-105'
                    : 'bg-[#111113] border border-[#1A1A1A] hover:border-[#F98906]/30'
                }`}
                data-testid={`plan-${plan.id}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#F98906] rounded-full text-xs font-bold text-black">
                    RECOMMENDED
                  </div>
                )}

                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    plan.popular ? 'bg-[#F98906]' : 'bg-[#1A1A1A]'
                  }`}>
                    <Icon className={`w-5 h-5 ${plan.popular ? 'text-black' : 'text-[#F98906]'}`} />
                  </div>
                  <div>
                    <h3 className="text-white font-bold">{plan.name}</h3>
                    <p className="text-xs text-gray-500">{plan.subtitle}</p>
                  </div>
                </div>

                <div className="mb-6">
                  <span className="text-4xl font-bold text-white">₹{plan.price}</span>
                  <span className="text-gray-500 text-sm">{plan.period}</span>
                </div>

                {/* AI Queries indicator */}
                <div className="flex items-center gap-2 mb-6 px-3 py-2 rounded-lg bg-[#1A1A1A] border border-[#2A2A2A]">
                  <Brain className="w-4 h-4 text-[#F98906]" />
                  <span className="text-xs text-gray-400">
                    {plan.aiQueries === -1 ? 'Unlimited AI queries' : `${plan.aiQueries} AI queries/month`}
                  </span>
                </div>

                <ul className="space-y-3 mb-6 flex-1">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                        feature.included 
                          ? 'bg-[#F98906]/20 text-[#F98906]' 
                          : 'bg-[#1A1A1A] text-gray-600'
                      }`}>
                        <Check className="w-3 h-3" />
                      </div>
                      <span className={`text-sm ${feature.included ? 'text-gray-300' : 'text-gray-600'}`}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSelectPlan(plan.id)}
                  className={`w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                    plan.popular
                      ? 'bg-[#F98906] text-black hover:bg-[#E07A00]'
                      : 'bg-[#1A1A1A] text-white border border-[#2A2A2A] hover:border-[#F98906]/50 hover:bg-[#222]'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  Get Started
                </button>
              </div>
            );
          })}
        </div>

        {/* Pay-Per-Job Add-on */}
        <div className="mt-8 p-6 rounded-2xl bg-[#111113] border border-[#1A1A1A] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#1A1A1A] flex items-center justify-center">
              <FileText className="w-6 h-6 text-[#F98906]" />
            </div>
            <div>
              <h4 className="text-white font-semibold">Pay-Per-Job Add-on</h4>
              <p className="text-sm text-gray-500">Exceeded your limit? No problem.</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-white">₹49</span>
            <span className="text-gray-500 text-sm"> per additional job card</span>
          </div>
        </div>
      </div>

      {/* Feature Comparison */}
      <div className="bg-[#0A0A0A] py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-white text-center mb-8" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            What's included in each plan
          </h2>

          <div className="grid grid-cols-4 gap-4 text-center mb-4">
            <div></div>
            <div className="text-sm font-semibold text-gray-400">STARTER</div>
            <div className="text-sm font-semibold text-[#F98906]">GROWTH</div>
            <div className="text-sm font-semibold text-gray-400">ELITE</div>
          </div>

          {[
            { feature: 'Job Cards', starter: '40/mo', growth: '120/mo', elite: 'Unlimited' },
            { feature: 'AI Queries', starter: '100/mo', growth: '500/mo', elite: 'Unlimited' },
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

      {/* FAQs */}
      <div className="py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-white text-center mb-8" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            Frequently Asked Questions
          </h2>

          <div className="space-y-4">
            {FAQS.map((faq, idx) => (
              <details key={idx} className="group bg-[#111113] border border-[#1A1A1A] rounded-xl">
                <summary className="flex items-center justify-between px-6 py-4 cursor-pointer text-white font-medium">
                  {faq.q}
                  <span className="text-[#F98906] group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="px-6 pb-4 text-gray-400 text-sm leading-relaxed">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>

          <p className="text-center text-gray-500 text-sm mt-8">
            Still have questions?{' '}
            <a href="mailto:connect@go4garage.in" className="text-[#F98906] hover:underline">
              Contact us at connect@go4garage.in
            </a>
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#1A1A1A] py-8 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={MASCOT_URL} alt="eka-ai" className="w-8 h-8 object-cover" style={{ borderRadius: '4px' }} />
            <span className="text-sm text-gray-500">
              © {new Date().getFullYear()} Go4Garage Private Limited. All rights reserved.
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
