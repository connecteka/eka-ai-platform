import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, FileText, Lock, Cookie, Globe, ArrowLeft, Mail, Phone, MapPin } from 'lucide-react';

const LegalPage: React.FC = () => {
  const location = useLocation();
  const mascotUrl = "https://customer-assets.emergentagent.com/job_c888b364-381d-411f-9fb8-91dd9dd39bee/artifacts/0nsgjm67_MASCOT.jpg";

  // Scroll to section on hash change
  useEffect(() => {
    if (location.hash) {
      const element = document.querySelector(location.hash);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    }
  }, [location.hash]);

  const sections = [
    { id: 'privacy', icon: Shield, title: 'Privacy Policy' },
    { id: 'terms', icon: FileText, title: 'Terms of Service' },
    { id: 'refund', icon: Lock, title: 'Refund & Cancellation Policy' },
    { id: 'cookies', icon: Cookie, title: 'Cookie Policy' },
    { id: 'gdpr', icon: Globe, title: 'GDPR Compliance' },
  ];

  return (
    <div className="min-h-screen bg-[#0D0D0D]" data-testid="legal-page">
      
      {/* Header */}
      <header className="w-full flex items-center justify-between px-6 lg:px-10 py-5 border-b border-gray-800/50">
        <Link to="/" className="flex items-center gap-3">
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
        </Link>

        <Link 
          to="/"
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-12">
        
        {/* Page Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            Legal Information
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Transparency and compliance are at the core of EKA-AI. Please review our policies to understand how we protect your rights and data.
          </p>
        </div>

        {/* Quick Navigation */}
        <nav className="flex flex-wrap justify-center gap-3 mb-12 pb-8 border-b border-gray-800/50">
          {sections.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className="flex items-center gap-2 px-4 py-2 bg-[#1A1A1A] border border-gray-700 rounded-lg text-sm text-gray-300 hover:text-white hover:border-[#F98906] transition-all"
            >
              <section.icon className="w-4 h-4" />
              {section.title}
            </a>
          ))}
        </nav>

        {/* ═══════════════════════════════════════════════════════════════════
            PRIVACY POLICY
            ═══════════════════════════════════════════════════════════════════ */}
        <section id="privacy" className="mb-16 scroll-mt-24">
          <div className="bg-[#1A1A1A] border border-gray-800 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-[#F98906]/10 rounded-lg">
                <Shield className="w-6 h-6 text-[#F98906]" />
              </div>
              <h2 className="text-2xl font-bold text-white" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                Privacy Policy
              </h2>
            </div>
            
            <p className="text-sm text-gray-500 mb-6">Last Updated: {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            
            <div className="space-y-6 text-gray-300">
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">1. Information We Collect</h3>
                <p className="mb-3">Go4Garage Private Limited ("Company", "we", "us") collects the following information through EKA-AI:</p>
                <ul className="list-disc pl-6 space-y-2 text-gray-400">
                  <li><strong className="text-white">Personal Information:</strong> Name, email address, phone number, business details</li>
                  <li><strong className="text-white">Vehicle Data:</strong> Registration numbers, make, model, VIN, service history</li>
                  <li><strong className="text-white">Usage Data:</strong> AI queries, diagnostics, job cards, invoices, timestamps</li>
                  <li><strong className="text-white">Technical Data:</strong> IP address, browser type, device information, cookies</li>
                  <li><strong className="text-white">Payment Information:</strong> Transaction records (card details processed by payment provider)</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">2. How We Use Your Information</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-400">
                  <li>Provide AI-powered diagnostic and workshop management services</li>
                  <li>Generate job cards, invoices, and reports</li>
                  <li>Process payments and subscriptions</li>
                  <li>Improve AI models and service quality</li>
                  <li>Send service notifications and updates</li>
                  <li>Comply with legal obligations and audit requirements</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">3. Data Sharing</h3>
                <p className="text-gray-400">We do not sell your personal data. We may share data with:</p>
                <ul className="list-disc pl-6 space-y-2 text-gray-400 mt-3">
                  <li>Service providers (cloud hosting, payment processors)</li>
                  <li>Legal authorities when required by law</li>
                  <li>Business partners with your explicit consent</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">4. Data Security</h3>
                <p className="text-gray-400">
                  We implement industry-standard security measures including SSL encryption, secure authentication, 
                  database encryption at rest, and regular security audits. Data is stored on secure cloud infrastructure 
                  compliant with international security standards.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">5. Data Retention</h3>
                <p className="text-gray-400">
                  Personal data is retained while your account is active. Upon account deletion, data is removed within 
                  30 days except where legal retention is required (e.g., tax records - 7 years, audit logs - 5 years).
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">6. Your Rights</h3>
                <p className="text-gray-400 mb-3">Under applicable data protection laws, you have the right to:</p>
                <ul className="list-disc pl-6 space-y-2 text-gray-400">
                  <li>Access your personal data</li>
                  <li>Correct inaccurate data</li>
                  <li>Request data deletion (subject to legal requirements)</li>
                  <li>Export your data in a portable format</li>
                  <li>Withdraw consent for optional processing</li>
                  <li>Lodge a complaint with supervisory authority</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">7. Contact for Privacy Concerns</h3>
                <p className="text-gray-400">
                  Data Protection Officer: <a href="mailto:privacy@go4garage.com" className="text-[#F98906] hover:underline">privacy@go4garage.com</a>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════
            TERMS OF SERVICE
            ═══════════════════════════════════════════════════════════════════ */}
        <section id="terms" className="mb-16 scroll-mt-24">
          <div className="bg-[#1A1A1A] border border-gray-800 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-[#F98906]/10 rounded-lg">
                <FileText className="w-6 h-6 text-[#F98906]" />
              </div>
              <h2 className="text-2xl font-bold text-white" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                Terms of Service
              </h2>
            </div>
            
            <p className="text-sm text-gray-500 mb-6">Last Updated: {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            
            <div className="space-y-6 text-gray-300">
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">1. Acceptance of Terms</h3>
                <p className="text-gray-400">
                  By accessing or using EKA-AI ("Service"), you agree to be bound by these Terms of Service. 
                  If you disagree with any part, you may not access the Service. These terms constitute a legally 
                  binding agreement between you and Go4Garage Private Limited.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">2. Service Description</h3>
                <p className="text-gray-400">
                  EKA-AI is a Governed Automobile Intelligence platform providing AI-powered diagnostics, 
                  job card management, invoice generation, fleet management, and PDI checklists for automotive workshops.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">3. Account Registration</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-400">
                  <li>You must provide accurate, complete registration information</li>
                  <li>You are responsible for maintaining account security</li>
                  <li>One account per workshop/entity</li>
                  <li>Accounts are non-transferable</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">4. Acceptable Use</h3>
                <p className="text-gray-400 mb-3">You agree NOT to:</p>
                <ul className="list-disc pl-6 space-y-2 text-gray-400">
                  <li>Use the Service for any unlawful purpose</li>
                  <li>Attempt to gain unauthorized access to any systems</li>
                  <li>Reverse engineer or decompile any part of the Service</li>
                  <li>Transmit viruses or malicious code</li>
                  <li>Use automated systems to access the Service without permission</li>
                  <li>Share account credentials with unauthorized parties</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">5. AI Diagnostic Disclaimer</h3>
                <p className="text-gray-400">
                  <strong className="text-[#F98906]">IMPORTANT:</strong> AI-generated diagnostics and estimates are advisory only. 
                  They do not replace professional inspection by qualified technicians. Go4Garage is not liable for 
                  decisions made based solely on AI recommendations.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">6. Pricing & Payment</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-400">
                  <li>Subscription plans are billed monthly/annually as selected</li>
                  <li>Prices are in Indian Rupees (INR) and include applicable taxes</li>
                  <li>Payments are processed securely through authorized payment gateways</li>
                  <li>Failed payments may result in service suspension</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">7. Intellectual Property</h3>
                <p className="text-gray-400">
                  All content, features, and functionality of EKA-AI are owned by Go4Garage Private Limited 
                  and protected by copyright, trademark, and other intellectual property laws.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">8. Limitation of Liability</h3>
                <p className="text-gray-400">
                  To the maximum extent permitted by law, Go4Garage shall not be liable for any indirect, 
                  incidental, special, consequential, or punitive damages, including loss of profits, data, 
                  or business opportunities arising from your use of the Service.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">9. Governing Law</h3>
                <p className="text-gray-400">
                  These Terms shall be governed by the laws of India. Any disputes shall be subject to the 
                  exclusive jurisdiction of courts in Bangalore, Karnataka, India.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">10. Termination</h3>
                <p className="text-gray-400">
                  We may terminate or suspend access immediately, without prior notice, for conduct that violates 
                  these Terms or is harmful to other users, us, or third parties.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════
            REFUND & CANCELLATION POLICY
            ═══════════════════════════════════════════════════════════════════ */}
        <section id="refund" className="mb-16 scroll-mt-24">
          <div className="bg-[#1A1A1A] border border-gray-800 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-[#F98906]/10 rounded-lg">
                <Lock className="w-6 h-6 text-[#F98906]" />
              </div>
              <h2 className="text-2xl font-bold text-white" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                Refund & Cancellation Policy
              </h2>
            </div>
            
            <p className="text-sm text-gray-500 mb-6">Last Updated: {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            
            <div className="space-y-6 text-gray-300">
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">1. Subscription Cancellation</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-400">
                  <li>You may cancel your subscription at any time from your account settings</li>
                  <li>Cancellation takes effect at the end of the current billing period</li>
                  <li>You retain access to paid features until the end of the paid period</li>
                  <li>No partial refunds for unused portions of the billing cycle</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">2. Refund Eligibility</h3>
                <p className="text-gray-400 mb-3">Refunds may be provided in the following cases:</p>
                <ul className="list-disc pl-6 space-y-2 text-gray-400">
                  <li><strong className="text-white">Service Unavailability:</strong> If core services are unavailable for more than 72 consecutive hours</li>
                  <li><strong className="text-white">Billing Errors:</strong> Duplicate charges or incorrect amounts</li>
                  <li><strong className="text-white">7-Day Trial:</strong> Full refund within 7 days of first subscription payment if you're not satisfied</li>
                  <li><strong className="text-white">Legal Requirements:</strong> As mandated by consumer protection laws</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">3. Non-Refundable Items</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-400">
                  <li>Setup or onboarding fees</li>
                  <li>Custom development or integration work</li>
                  <li>Add-on services already rendered</li>
                  <li>Subscriptions beyond 30 days from payment date</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">4. Refund Process</h3>
                <ol className="list-decimal pl-6 space-y-2 text-gray-400">
                  <li>Submit refund request to <a href="mailto:billing@go4garage.com" className="text-[#F98906] hover:underline">billing@go4garage.com</a></li>
                  <li>Include your account email and reason for refund</li>
                  <li>Requests processed within 5-7 business days</li>
                  <li>Approved refunds credited within 10-14 business days to original payment method</li>
                </ol>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">5. Account Data After Cancellation</h3>
                <p className="text-gray-400">
                  Upon cancellation, your data is retained for 30 days to allow for reactivation. 
                  After 30 days, data is permanently deleted except where legal retention is required. 
                  You may request an export of your data before cancellation.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════
            COOKIE POLICY
            ═══════════════════════════════════════════════════════════════════ */}
        <section id="cookies" className="mb-16 scroll-mt-24">
          <div className="bg-[#1A1A1A] border border-gray-800 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-[#F98906]/10 rounded-lg">
                <Cookie className="w-6 h-6 text-[#F98906]" />
              </div>
              <h2 className="text-2xl font-bold text-white" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                Cookie Policy
              </h2>
            </div>
            
            <p className="text-sm text-gray-500 mb-6">Last Updated: {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            
            <div className="space-y-6 text-gray-300">
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">1. What Are Cookies</h3>
                <p className="text-gray-400">
                  Cookies are small text files stored on your device when you visit our website. 
                  They help us provide a better user experience by remembering your preferences and enabling certain features.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">2. Types of Cookies We Use</h3>
                <div className="space-y-4">
                  <div className="bg-[#0D0D0D] border border-gray-700 rounded-lg p-4">
                    <h4 className="font-semibold text-white mb-2">Essential Cookies</h4>
                    <p className="text-sm text-gray-400">Required for basic site functionality, authentication, and security. Cannot be disabled.</p>
                  </div>
                  <div className="bg-[#0D0D0D] border border-gray-700 rounded-lg p-4">
                    <h4 className="font-semibold text-white mb-2">Performance Cookies</h4>
                    <p className="text-sm text-gray-400">Help us understand how visitors use our site, enabling us to improve performance.</p>
                  </div>
                  <div className="bg-[#0D0D0D] border border-gray-700 rounded-lg p-4">
                    <h4 className="font-semibold text-white mb-2">Functional Cookies</h4>
                    <p className="text-sm text-gray-400">Remember your preferences like language and display settings.</p>
                  </div>
                  <div className="bg-[#0D0D0D] border border-gray-700 rounded-lg p-4">
                    <h4 className="font-semibold text-white mb-2">Analytics Cookies</h4>
                    <p className="text-sm text-gray-400">Collect anonymous data about site usage to help improve our services.</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">3. Managing Cookies</h3>
                <p className="text-gray-400">
                  You can control cookies through your browser settings. Note that disabling certain cookies 
                  may affect the functionality of our Service. Most browsers allow you to:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-400 mt-3">
                  <li>View cookies stored on your device</li>
                  <li>Delete all or specific cookies</li>
                  <li>Block third-party cookies</li>
                  <li>Block all cookies (may break functionality)</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">4. Third-Party Cookies</h3>
                <p className="text-gray-400">
                  We use third-party services that may set cookies, including Google Analytics for traffic analysis 
                  and payment processors for secure transactions. These are governed by their respective privacy policies.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════
            GDPR COMPLIANCE
            ═══════════════════════════════════════════════════════════════════ */}
        <section id="gdpr" className="mb-16 scroll-mt-24">
          <div className="bg-[#1A1A1A] border border-gray-800 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-[#F98906]/10 rounded-lg">
                <Globe className="w-6 h-6 text-[#F98906]" />
              </div>
              <h2 className="text-2xl font-bold text-white" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                GDPR Compliance
              </h2>
            </div>
            
            <p className="text-sm text-gray-500 mb-6">Last Updated: {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            
            <div className="space-y-6 text-gray-300">
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Commitment to GDPR</h3>
                <p className="text-gray-400">
                  Go4Garage Private Limited is committed to complying with the General Data Protection Regulation (GDPR) 
                  for users in the European Economic Area (EEA). This section outlines our GDPR-specific practices.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Legal Basis for Processing</h3>
                <p className="text-gray-400 mb-3">We process personal data based on:</p>
                <ul className="list-disc pl-6 space-y-2 text-gray-400">
                  <li><strong className="text-white">Contract:</strong> Necessary to provide the Service you've subscribed to</li>
                  <li><strong className="text-white">Legitimate Interest:</strong> Improving our services and preventing fraud</li>
                  <li><strong className="text-white">Consent:</strong> For marketing communications and optional features</li>
                  <li><strong className="text-white">Legal Obligation:</strong> Compliance with tax and financial regulations</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Your GDPR Rights</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-[#0D0D0D] border border-gray-700 rounded-lg p-4">
                    <h4 className="font-semibold text-white mb-1">Right to Access</h4>
                    <p className="text-sm text-gray-400">Request a copy of your personal data</p>
                  </div>
                  <div className="bg-[#0D0D0D] border border-gray-700 rounded-lg p-4">
                    <h4 className="font-semibold text-white mb-1">Right to Rectification</h4>
                    <p className="text-sm text-gray-400">Correct inaccurate personal data</p>
                  </div>
                  <div className="bg-[#0D0D0D] border border-gray-700 rounded-lg p-4">
                    <h4 className="font-semibold text-white mb-1">Right to Erasure</h4>
                    <p className="text-sm text-gray-400">Request deletion of your data</p>
                  </div>
                  <div className="bg-[#0D0D0D] border border-gray-700 rounded-lg p-4">
                    <h4 className="font-semibold text-white mb-1">Right to Portability</h4>
                    <p className="text-sm text-gray-400">Export your data in a portable format</p>
                  </div>
                  <div className="bg-[#0D0D0D] border border-gray-700 rounded-lg p-4">
                    <h4 className="font-semibold text-white mb-1">Right to Object</h4>
                    <p className="text-sm text-gray-400">Object to processing based on legitimate interest</p>
                  </div>
                  <div className="bg-[#0D0D0D] border border-gray-700 rounded-lg p-4">
                    <h4 className="font-semibold text-white mb-1">Right to Restrict</h4>
                    <p className="text-sm text-gray-400">Limit how we use your data</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Data Transfers</h3>
                <p className="text-gray-400">
                  When we transfer personal data outside the EEA, we ensure adequate protection through 
                  Standard Contractual Clauses (SCCs) or other approved mechanisms.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Data Protection Officer</h3>
                <p className="text-gray-400">
                  For GDPR-related inquiries, contact our Data Protection Officer at{' '}
                  <a href="mailto:dpo@go4garage.com" className="text-[#F98906] hover:underline">dpo@go4garage.com</a>
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Supervisory Authority</h3>
                <p className="text-gray-400">
                  If you believe we have not adequately addressed your concerns, you have the right to lodge 
                  a complaint with your local Data Protection Authority.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════
            CONTACT INFORMATION
            ═══════════════════════════════════════════════════════════════════ */}
        <section className="mb-12">
          <div className="bg-gradient-to-br from-[#F98906]/10 to-transparent border border-[#F98906]/30 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6 text-center" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              Contact Us
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-[#F98906]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Mail className="w-5 h-5 text-[#F98906]" />
                </div>
                <h4 className="font-semibold text-white mb-1">Email</h4>
                <p className="text-sm text-gray-400">General: support@go4garage.com</p>
                <p className="text-sm text-gray-400">Legal: legal@go4garage.com</p>
                <p className="text-sm text-gray-400">Privacy: privacy@go4garage.com</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-[#F98906]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Phone className="w-5 h-5 text-[#F98906]" />
                </div>
                <h4 className="font-semibold text-white mb-1">Phone</h4>
                <p className="text-sm text-gray-400">+91-80-XXXX-XXXX</p>
                <p className="text-sm text-gray-400">Mon-Fri, 9 AM - 6 PM IST</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-[#F98906]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <MapPin className="w-5 h-5 text-[#F98906]" />
                </div>
                <h4 className="font-semibold text-white mb-1">Registered Office</h4>
                <p className="text-sm text-gray-400">Go4Garage Private Limited</p>
                <p className="text-sm text-gray-400">Bangalore, Karnataka, India</p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 border-t border-gray-800/50 pt-8">
          <p>© {new Date().getFullYear()} Go4Garage Private Limited. All rights reserved.</p>
          <p className="mt-2 text-xs text-gray-600">CIN: U74999KA2024PTC123456 | GSTIN: 29XXXXX1234X1ZX</p>
          <p className="mt-3">
            <Link to="/" className="text-[#F98906] hover:underline">Back to EKA-AI</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LegalPage;
