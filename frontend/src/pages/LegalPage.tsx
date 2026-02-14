import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, FileText, Lock, Cookie, Globe, ArrowLeft, Mail, Phone, MapPin, Building2, Calendar, AlertCircle } from 'lucide-react';

const LegalPage: React.FC = () => {
  const location = useLocation();
  const mascotUrl = "https://customer-assets.emergentagent.com/job_c888b364-381d-411f-9fb8-91dd9dd39bee/artifacts/0nsgjm67_MASCOT.jpg";

  // Company Details
  const COMPANY = {
    name: 'Go4Garage Private Limited',
    brand: 'EKA-AI',
    cin: 'U74999KA2024PTC189XXX',
    gstin: '29AABCG1234X1ZX',
    pan: 'AABCG1234X',
    registered_address: 'No. 123, 4th Floor, Brigade Road, Bangalore, Karnataka 560001, India',
    support_email: 'support@go4garage.in',
    legal_email: 'legal@go4garage.in',
    privacy_email: 'privacy@go4garage.in',
    dpo_email: 'dpo@go4garage.in',
    billing_email: 'billing@go4garage.in',
    phone: '+91 80 4123 4567',
    website: 'www.eka-ai.in',
    incorporation_date: 'January 15, 2024',
    jurisdiction: 'Bangalore, Karnataka, India'
  };

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
    { id: 'gdpr', icon: Globe, title: 'GDPR & Data Protection' },
  ];

  const lastUpdated = new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="min-h-screen bg-[#0D0D0D]" data-testid="legal-page">
      
      {/* Header */}
      <header className="w-full flex items-center justify-between px-6 lg:px-10 py-5 border-b border-gray-800/50">
        <Link to="/" className="flex items-center gap-3">
          <img 
            src={mascotUrl} 
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
            Transparency and compliance are at the core of {COMPANY.brand}. Please review our policies to understand how we protect your rights and data.
          </p>
          <p className="text-sm text-gray-500 mt-4">
            <Building2 className="w-4 h-4 inline mr-1" />
            {COMPANY.name} • CIN: {COMPANY.cin}
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
            
            <p className="text-sm text-gray-500 mb-6 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Last Updated: {lastUpdated} | Effective Date: January 15, 2024
            </p>
            
            <div className="space-y-6 text-gray-300">
              <div className="p-4 bg-[#F98906]/5 border border-[#F98906]/20 rounded-lg">
                <p className="text-sm text-gray-300">
                  This Privacy Policy explains how <strong className="text-white">{COMPANY.name}</strong> ("Company", "we", "us", "our") 
                  collects, uses, and protects your information when you use {COMPANY.brand} ("Service", "Platform").
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">1. Information We Collect</h3>
                <p className="mb-3 text-gray-400">We collect information necessary to provide our automobile intelligence services:</p>
                <ul className="list-disc pl-6 space-y-2 text-gray-400">
                  <li><strong className="text-white">Account Information:</strong> Name, email address, phone number, workshop/business name, GST number</li>
                  <li><strong className="text-white">Vehicle Data:</strong> Registration numbers, make, model, year, VIN, fuel type, service history, diagnostic reports</li>
                  <li><strong className="text-white">Service Data:</strong> Job cards, estimates, invoices, PDI checklists, customer approvals, payment records</li>
                  <li><strong className="text-white">AI Interaction Data:</strong> Queries, diagnostics, recommendations, and responses generated through {COMPANY.brand}</li>
                  <li><strong className="text-white">Technical Data:</strong> IP address, browser type, device information, operating system, access times, referring URLs</li>
                  <li><strong className="text-white">Usage Data:</strong> Features used, pages visited, actions taken, session duration</li>
                  <li><strong className="text-white">Media:</strong> Photos and videos uploaded for vehicle documentation and PDI verification</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">2. How We Use Your Information</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-400">
                  <li>Provide AI-powered diagnostic and workshop management services</li>
                  <li>Generate job cards, estimates, invoices, and PDI reports</li>
                  <li>Process payments and manage subscriptions</li>
                  <li>Improve AI accuracy and service quality through anonymized data analysis</li>
                  <li>Send service notifications, updates, and support communications</li>
                  <li>Ensure platform security and prevent fraud</li>
                  <li>Comply with legal obligations, tax requirements, and audit trails</li>
                  <li>Provide customer support and troubleshoot issues</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">3. Data Sharing & Third Parties</h3>
                <p className="text-gray-400 mb-3"><strong className="text-[#F98906]">We do not sell your personal data.</strong> We may share data with:</p>
                <ul className="list-disc pl-6 space-y-2 text-gray-400">
                  <li><strong className="text-white">Cloud Service Providers:</strong> For secure data hosting and storage (e.g., AWS, MongoDB Atlas)</li>
                  <li><strong className="text-white">Payment Processors:</strong> For secure transaction processing (e.g., Razorpay, Stripe)</li>
                  <li><strong className="text-white">AI Service Providers:</strong> For processing diagnostic queries (e.g., Google AI, OpenAI)</li>
                  <li><strong className="text-white">Communication Services:</strong> For sending emails and notifications (e.g., SendGrid, Twilio)</li>
                  <li><strong className="text-white">Legal Authorities:</strong> When required by law, court order, or to protect rights</li>
                  <li><strong className="text-white">Business Partners:</strong> Only with your explicit consent for specific services</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">4. Data Security Measures</h3>
                <p className="text-gray-400 mb-3">We implement industry-standard security measures:</p>
                <ul className="list-disc pl-6 space-y-2 text-gray-400">
                  <li>SSL/TLS encryption for all data in transit</li>
                  <li>AES-256 encryption for data at rest</li>
                  <li>Secure authentication with JWT tokens and session management</li>
                  <li>Role-based access control (RBAC) for internal systems</li>
                  <li>Regular security audits and penetration testing</li>
                  <li>Automated backup and disaster recovery procedures</li>
                  <li>Compliance with ISO 27001 security standards</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">5. Data Retention</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-400">
                  <li><strong className="text-white">Active Account Data:</strong> Retained while your account is active</li>
                  <li><strong className="text-white">After Account Deletion:</strong> Personal data deleted within 30 days (except where legally required)</li>
                  <li><strong className="text-white">Tax & Financial Records:</strong> Retained for 7 years (as per Indian tax laws)</li>
                  <li><strong className="text-white">Audit Logs:</strong> Retained for 5 years for compliance</li>
                  <li><strong className="text-white">Anonymized Analytics:</strong> May be retained indefinitely</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">6. Your Rights</h3>
                <p className="text-gray-400 mb-3">Under applicable data protection laws (including IT Act 2000, DPDP Act 2023), you have the right to:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { right: 'Access', desc: 'Request a copy of your personal data' },
                    { right: 'Rectification', desc: 'Correct inaccurate or incomplete data' },
                    { right: 'Erasure', desc: 'Request deletion of your data' },
                    { right: 'Portability', desc: 'Export your data in a machine-readable format' },
                    { right: 'Restriction', desc: 'Limit how we process your data' },
                    { right: 'Objection', desc: 'Object to certain processing activities' },
                  ].map(r => (
                    <div key={r.right} className="p-3 bg-[#0D0D0D] rounded-lg border border-gray-700">
                      <p className="text-white font-medium text-sm">{r.right}</p>
                      <p className="text-gray-500 text-xs">{r.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">7. Contact for Privacy Concerns</h3>
                <p className="text-gray-400">
                  Data Protection Officer: <a href={`mailto:${COMPANY.dpo_email}`} className="text-[#F98906] hover:underline">{COMPANY.dpo_email}</a>
                  <br />
                  General Privacy Inquiries: <a href={`mailto:${COMPANY.privacy_email}`} className="text-[#F98906] hover:underline">{COMPANY.privacy_email}</a>
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
            
            <p className="text-sm text-gray-500 mb-6 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Last Updated: {lastUpdated} | Effective Date: January 15, 2024
            </p>
            
            <div className="space-y-6 text-gray-300">
              <div className="p-4 bg-[#F98906]/5 border border-[#F98906]/20 rounded-lg">
                <p className="text-sm">
                  These Terms of Service ("Terms") govern your use of {COMPANY.brand} platform and services provided by 
                  <strong className="text-white"> {COMPANY.name}</strong>. By accessing or using our Service, you agree to be bound by these Terms.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">1. Acceptance of Terms</h3>
                <p className="text-gray-400">
                  By accessing or using {COMPANY.brand} ("Service"), you acknowledge that you have read, understood, and agree to be bound 
                  by these Terms of Service. If you are using the Service on behalf of an organization, you represent that you have 
                  authority to bind that organization to these Terms. If you do not agree, you may not access or use the Service.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">2. Service Description</h3>
                <p className="text-gray-400 mb-3">
                  {COMPANY.brand} is a Governed Automobile Intelligence platform providing:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-400">
                  <li>AI-powered vehicle diagnostics and repair recommendations</li>
                  <li>Job card creation and management system</li>
                  <li>GST-compliant invoice generation</li>
                  <li>Pre-Delivery Inspection (PDI) digital checklists</li>
                  <li>Fleet management for dealerships and service centers</li>
                  <li>Customer communication and approval workflows</li>
                  <li>Business analytics and reporting dashboards</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">3. Account Registration & Eligibility</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-400">
                  <li>You must be at least 18 years old and legally capable of entering contracts</li>
                  <li>You must provide accurate, complete, and current registration information</li>
                  <li>You are responsible for maintaining the confidentiality of your account credentials</li>
                  <li>One account per workshop/business entity (multi-user accounts available on higher plans)</li>
                  <li>Accounts are non-transferable without prior written consent</li>
                  <li>You must notify us immediately of any unauthorized account access</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">4. Acceptable Use Policy</h3>
                <p className="text-gray-400 mb-3">You agree NOT to:</p>
                <ul className="list-disc pl-6 space-y-2 text-gray-400">
                  <li>Use the Service for any unlawful purpose or in violation of any laws</li>
                  <li>Attempt to gain unauthorized access to any systems or networks</li>
                  <li>Reverse engineer, decompile, or disassemble any part of the Service</li>
                  <li>Transmit viruses, malware, or any harmful code</li>
                  <li>Use automated systems (bots, scrapers) without permission</li>
                  <li>Share account credentials with unauthorized parties</li>
                  <li>Impersonate any person or entity</li>
                  <li>Use the Service to harm, harass, or defraud others</li>
                  <li>Upload false, misleading, or fraudulent information</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">5. AI Diagnostic Disclaimer</h3>
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-red-400 font-semibold mb-2">IMPORTANT DISCLAIMER</p>
                      <p className="text-gray-400 text-sm">
                        AI-generated diagnostics, estimates, and recommendations are <strong className="text-white">advisory only</strong>. 
                        They are based on patterns and probabilities and do <strong className="text-white">NOT</strong> replace professional 
                        inspection by qualified technicians. {COMPANY.name} is NOT liable for any decisions made, damages incurred, 
                        or injuries resulting from reliance solely on AI recommendations. Always verify diagnostics with a 
                        certified automotive professional before proceeding with repairs.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">6. Pricing, Payment & Billing</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-400">
                  <li>Subscription plans are available at: STARTER (₹1,499/mo), GROWTH (₹2,999/mo), ELITE (₹5,999/mo)</li>
                  <li>All prices are in Indian Rupees (INR) and exclude applicable GST (18%)</li>
                  <li>Subscriptions are billed monthly or annually as selected</li>
                  <li>Payments are processed securely through authorized payment gateways</li>
                  <li>Failed payments may result in service suspension after 7 days grace period</li>
                  <li>We reserve the right to modify pricing with 30 days advance notice</li>
                  <li>Pay-Per-Job add-on: ₹49 per additional job card beyond plan limits</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">7. Intellectual Property</h3>
                <p className="text-gray-400">
                  All content, features, functionality, trademarks, logos, and the {COMPANY.brand} name are owned by 
                  {COMPANY.name} and protected by Indian and international copyright, trademark, and other intellectual property laws. 
                  You may not copy, modify, distribute, sell, or lease any part of our Service without express written permission.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">8. Limitation of Liability</h3>
                <p className="text-gray-400">
                  TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, {COMPANY.name.toUpperCase()} SHALL NOT BE LIABLE FOR ANY INDIRECT, 
                  INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, 
                  BUSINESS OPPORTUNITIES, GOODWILL, OR OTHER INTANGIBLE LOSSES ARISING FROM YOUR USE OF THE SERVICE. 
                  OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT PAID BY YOU IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">9. Indemnification</h3>
                <p className="text-gray-400">
                  You agree to indemnify, defend, and hold harmless {COMPANY.name}, its officers, directors, employees, and agents 
                  from any claims, damages, losses, or expenses (including reasonable attorney fees) arising from your use of the Service, 
                  violation of these Terms, or infringement of any third-party rights.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">10. Governing Law & Dispute Resolution</h3>
                <p className="text-gray-400 mb-3">
                  These Terms shall be governed by the laws of India. Any disputes shall be resolved as follows:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-400">
                  <li><strong className="text-white">Informal Resolution:</strong> Contact us first to attempt amicable resolution</li>
                  <li><strong className="text-white">Mediation:</strong> If unresolved, parties agree to mediation in Bangalore</li>
                  <li><strong className="text-white">Arbitration:</strong> Binding arbitration under Arbitration and Conciliation Act, 1996</li>
                  <li><strong className="text-white">Jurisdiction:</strong> Courts of Bangalore, Karnataka, India shall have exclusive jurisdiction</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">11. Termination</h3>
                <p className="text-gray-400">
                  We may terminate or suspend your access immediately, without prior notice or liability, for any reason, including:
                  violation of these Terms, fraudulent activity, non-payment, or conduct harmful to other users or the Service. 
                  Upon termination, your right to use the Service ceases immediately.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">12. Modifications to Terms</h3>
                <p className="text-gray-400">
                  We reserve the right to modify these Terms at any time. We will provide at least 30 days notice for material changes 
                  via email or platform notification. Continued use after changes constitutes acceptance of modified Terms.
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
            
            <p className="text-sm text-gray-500 mb-6 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Last Updated: {lastUpdated}
            </p>
            
            <div className="space-y-6 text-gray-300">
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">1. Subscription Cancellation</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-400">
                  <li>You may cancel your subscription at any time from Account Settings</li>
                  <li>Cancellation takes effect at the end of the current billing period</li>
                  <li>You retain full access to paid features until the billing period ends</li>
                  <li>No partial refunds for unused portions of the billing cycle</li>
                  <li>Annual subscriptions: Cancellation effective at end of annual term</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">2. Refund Eligibility</h3>
                <p className="text-gray-400 mb-3">Refunds may be provided in the following circumstances:</p>
                <div className="space-y-3">
                  <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <p className="text-green-400 font-semibold text-sm mb-1">✓ 7-Day Satisfaction Guarantee</p>
                    <p className="text-gray-400 text-sm">Full refund within 7 days of first subscription payment if you're not satisfied. No questions asked.</p>
                  </div>
                  <div className="p-3 bg-[#0D0D0D] border border-gray-700 rounded-lg">
                    <p className="text-white font-semibold text-sm mb-1">Service Unavailability</p>
                    <p className="text-gray-400 text-sm">Pro-rata refund if core services are unavailable for more than 72 consecutive hours due to our fault.</p>
                  </div>
                  <div className="p-3 bg-[#0D0D0D] border border-gray-700 rounded-lg">
                    <p className="text-white font-semibold text-sm mb-1">Billing Errors</p>
                    <p className="text-gray-400 text-sm">Full refund for duplicate charges, incorrect amounts, or unauthorized transactions.</p>
                  </div>
                  <div className="p-3 bg-[#0D0D0D] border border-gray-700 rounded-lg">
                    <p className="text-white font-semibold text-sm mb-1">Legal Requirements</p>
                    <p className="text-gray-400 text-sm">As mandated by Consumer Protection Act, 2019 or other applicable laws.</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">3. Non-Refundable Items</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-400">
                  <li>Setup, onboarding, or training fees</li>
                  <li>Custom development or integration work</li>
                  <li>Add-on services already rendered (e.g., additional job cards used)</li>
                  <li>Subscriptions beyond 30 days from payment date (except 7-day guarantee)</li>
                  <li>Accounts terminated for Terms of Service violations</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">4. Refund Process</h3>
                <ol className="list-decimal pl-6 space-y-2 text-gray-400">
                  <li>Submit refund request to <a href={`mailto:${COMPANY.billing_email}`} className="text-[#F98906] hover:underline">{COMPANY.billing_email}</a></li>
                  <li>Include: Account email, subscription plan, payment date, reason for refund</li>
                  <li>Requests are reviewed within 5-7 business days</li>
                  <li>Approved refunds are credited within 10-14 business days to the original payment method</li>
                  <li>You will receive email confirmation when refund is processed</li>
                </ol>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">5. Downgrade Policy</h3>
                <p className="text-gray-400">
                  You may downgrade your subscription at any time. The lower tier pricing takes effect from the next billing cycle. 
                  No refunds are provided for the difference in the current cycle. Features exclusive to higher tiers become 
                  inaccessible upon downgrade.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">6. Data After Cancellation</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-400">
                  <li>Your data is retained for 30 days after cancellation to allow for reactivation</li>
                  <li>After 30 days, personal data is permanently deleted (except legal retention requirements)</li>
                  <li>You may request a data export before cancellation via Settings or email</li>
                  <li>Anonymized, aggregated data may be retained for analytics purposes</li>
                </ul>
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
            
            <p className="text-sm text-gray-500 mb-6 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Last Updated: {lastUpdated}
            </p>
            
            <div className="space-y-6 text-gray-300">
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">1. What Are Cookies</h3>
                <p className="text-gray-400">
                  Cookies are small text files stored on your device when you visit our website. They help us provide a better 
                  user experience by remembering your preferences, keeping you logged in, and enabling certain features. 
                  We also use similar technologies like local storage and session storage.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">2. Types of Cookies We Use</h3>
                <div className="space-y-4">
                  <div className="bg-[#0D0D0D] border border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-white">Essential Cookies</h4>
                      <span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded text-xs">Required</span>
                    </div>
                    <p className="text-sm text-gray-400 mb-2">Required for basic site functionality. Cannot be disabled.</p>
                    <ul className="text-xs text-gray-500 space-y-1">
                      <li>• Authentication tokens (JWT)</li>
                      <li>• Session management</li>
                      <li>• Security features (CSRF protection)</li>
                      <li>• User preferences (sidebar state)</li>
                    </ul>
                  </div>
                  <div className="bg-[#0D0D0D] border border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-white">Performance Cookies</h4>
                      <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded text-xs">Optional</span>
                    </div>
                    <p className="text-sm text-gray-400 mb-2">Help us understand how visitors use our site.</p>
                    <ul className="text-xs text-gray-500 space-y-1">
                      <li>• Page load times</li>
                      <li>• Error tracking (Sentry)</li>
                      <li>• Feature usage analytics</li>
                    </ul>
                  </div>
                  <div className="bg-[#0D0D0D] border border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-white">Functional Cookies</h4>
                      <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded text-xs">Optional</span>
                    </div>
                    <p className="text-sm text-gray-400 mb-2">Remember your preferences for enhanced functionality.</p>
                    <ul className="text-xs text-gray-500 space-y-1">
                      <li>• Language preferences</li>
                      <li>• Theme settings (dark/light)</li>
                      <li>• Recently viewed items</li>
                    </ul>
                  </div>
                  <div className="bg-[#0D0D0D] border border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-white">Analytics Cookies</h4>
                      <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded text-xs">Optional</span>
                    </div>
                    <p className="text-sm text-gray-400 mb-2">Collect anonymous data to improve our services.</p>
                    <ul className="text-xs text-gray-500 space-y-1">
                      <li>• Google Analytics (anonymized IP)</li>
                      <li>• Feature adoption tracking</li>
                      <li>• User journey analysis</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">3. Managing Cookies</h3>
                <p className="text-gray-400 mb-3">
                  You can control cookies through your browser settings. Note that disabling certain cookies may affect functionality:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-400">
                  <li>View cookies stored on your device</li>
                  <li>Delete all or specific cookies</li>
                  <li>Block third-party cookies</li>
                  <li>Set preferences for specific websites</li>
                  <li>Clear cookies on browser close</li>
                </ul>
                <p className="text-gray-500 text-sm mt-3">
                  Note: Blocking essential cookies will prevent you from logging in and using the Service.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">4. Third-Party Cookies</h3>
                <p className="text-gray-400 mb-3">We use the following third-party services that may set cookies:</p>
                <ul className="list-disc pl-6 space-y-2 text-gray-400">
                  <li><strong className="text-white">Google Analytics:</strong> Traffic and usage analysis</li>
                  <li><strong className="text-white">Razorpay/Stripe:</strong> Secure payment processing</li>
                  <li><strong className="text-white">Sentry:</strong> Error monitoring and debugging</li>
                  <li><strong className="text-white">Google OAuth:</strong> Social login functionality</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════
            GDPR & DATA PROTECTION
            ═══════════════════════════════════════════════════════════════════ */}
        <section id="gdpr" className="mb-16 scroll-mt-24">
          <div className="bg-[#1A1A1A] border border-gray-800 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-[#F98906]/10 rounded-lg">
                <Globe className="w-6 h-6 text-[#F98906]" />
              </div>
              <h2 className="text-2xl font-bold text-white" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                GDPR & Data Protection Compliance
              </h2>
            </div>
            
            <p className="text-sm text-gray-500 mb-6 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Last Updated: {lastUpdated}
            </p>
            
            <div className="space-y-6 text-gray-300">
              <div className="p-4 bg-[#F98906]/5 border border-[#F98906]/20 rounded-lg">
                <p className="text-sm text-gray-300">
                  {COMPANY.name} is committed to complying with the General Data Protection Regulation (GDPR) for users 
                  in the European Economic Area (EEA), the Digital Personal Data Protection Act, 2023 (DPDP Act) for Indian users, 
                  and other applicable data protection laws globally.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">1. Legal Basis for Processing</h3>
                <p className="text-gray-400 mb-3">We process personal data based on the following legal grounds:</p>
                <ul className="list-disc pl-6 space-y-2 text-gray-400">
                  <li><strong className="text-white">Contract:</strong> Necessary to provide the Service you've subscribed to</li>
                  <li><strong className="text-white">Legitimate Interest:</strong> Improving our services, preventing fraud, ensuring security</li>
                  <li><strong className="text-white">Consent:</strong> For marketing communications, optional analytics, and certain features</li>
                  <li><strong className="text-white">Legal Obligation:</strong> Compliance with tax, accounting, and regulatory requirements</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">2. Your Data Subject Rights</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { right: 'Right to Access', desc: 'Request a copy of all personal data we hold about you' },
                    { right: 'Right to Rectification', desc: 'Correct any inaccurate or incomplete personal data' },
                    { right: 'Right to Erasure', desc: 'Request deletion of your personal data ("Right to be Forgotten")' },
                    { right: 'Right to Portability', desc: 'Receive your data in a machine-readable format (JSON/CSV)' },
                    { right: 'Right to Object', desc: 'Object to processing based on legitimate interest' },
                    { right: 'Right to Restrict', desc: 'Limit how we process your data in certain circumstances' },
                    { right: 'Right to Withdraw Consent', desc: 'Withdraw consent at any time for consent-based processing' },
                    { right: 'Right to Complain', desc: 'Lodge a complaint with a supervisory authority' },
                  ].map(r => (
                    <div key={r.right} className="bg-[#0D0D0D] border border-gray-700 rounded-lg p-4">
                      <h4 className="font-semibold text-white mb-1 text-sm">{r.right}</h4>
                      <p className="text-xs text-gray-400">{r.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">3. International Data Transfers</h3>
                <p className="text-gray-400">
                  When we transfer personal data outside India or the EEA, we ensure adequate protection through:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-400 mt-3">
                  <li>Standard Contractual Clauses (SCCs) approved by relevant authorities</li>
                  <li>Data processing agreements with all sub-processors</li>
                  <li>Transfers only to countries with adequate protection or certified providers</li>
                  <li>Technical and organizational security measures</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">4. Data Protection Officer</h3>
                <p className="text-gray-400 mb-3">
                  For all data protection inquiries, requests, or concerns, contact our Data Protection Officer:
                </p>
                <div className="p-4 bg-[#0D0D0D] border border-gray-700 rounded-lg">
                  <p className="text-white font-medium">Data Protection Officer</p>
                  <p className="text-gray-400 text-sm">{COMPANY.name}</p>
                  <p className="text-[#F98906] text-sm mt-2">
                    Email: <a href={`mailto:${COMPANY.dpo_email}`} className="hover:underline">{COMPANY.dpo_email}</a>
                  </p>
                  <p className="text-gray-500 text-xs mt-2">
                    Response time: Within 30 days as required by GDPR
                  </p>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">5. Supervisory Authority</h3>
                <p className="text-gray-400">
                  If you believe we have not adequately addressed your data protection concerns, you have the right to 
                  lodge a complaint with the relevant supervisory authority:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-400 mt-3">
                  <li><strong className="text-white">India:</strong> Data Protection Board of India (under DPDP Act 2023)</li>
                  <li><strong className="text-white">EU/EEA:</strong> Your local Data Protection Authority</li>
                  <li><strong className="text-white">UK:</strong> Information Commissioner's Office (ICO)</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">6. Data Breach Notification</h3>
                <p className="text-gray-400">
                  In the event of a personal data breach that is likely to result in a risk to your rights and freedoms, 
                  we will notify:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-400 mt-3">
                  <li>Relevant supervisory authority within 72 hours of becoming aware</li>
                  <li>Affected individuals without undue delay if high risk</li>
                  <li>Details provided: Nature of breach, categories of data, likely consequences, measures taken</li>
                </ul>
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
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-[#F98906]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Mail className="w-5 h-5 text-[#F98906]" />
                </div>
                <h4 className="font-semibold text-white mb-2">Email</h4>
                <p className="text-sm text-gray-400">General: {COMPANY.support_email}</p>
                <p className="text-sm text-gray-400">Legal: {COMPANY.legal_email}</p>
                <p className="text-sm text-gray-400">Privacy: {COMPANY.privacy_email}</p>
                <p className="text-sm text-gray-400">Billing: {COMPANY.billing_email}</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-[#F98906]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Phone className="w-5 h-5 text-[#F98906]" />
                </div>
                <h4 className="font-semibold text-white mb-2">Phone</h4>
                <p className="text-sm text-gray-400">{COMPANY.phone}</p>
                <p className="text-sm text-gray-500">Mon-Sat, 9 AM - 6 PM IST</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-[#F98906]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <MapPin className="w-5 h-5 text-[#F98906]" />
                </div>
                <h4 className="font-semibold text-white mb-2">Registered Office</h4>
                <p className="text-sm text-gray-400">{COMPANY.name}</p>
                <p className="text-sm text-gray-400">{COMPANY.registered_address}</p>
              </div>
            </div>
            
            {/* Company Registration Details */}
            <div className="p-4 bg-[#0D0D0D] rounded-xl border border-gray-800">
              <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#F98906]" />
                Company Registration Details
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 text-xs">CIN</p>
                  <p className="text-white font-mono">{COMPANY.cin}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">GSTIN</p>
                  <p className="text-white font-mono">{COMPANY.gstin}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">PAN</p>
                  <p className="text-white font-mono">{COMPANY.pan}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Incorporated</p>
                  <p className="text-white">{COMPANY.incorporation_date}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 border-t border-gray-800/50 pt-8">
          <p>© {new Date().getFullYear()} {COMPANY.name}. All rights reserved.</p>
          <p className="mt-2 text-xs text-gray-600">
            CIN: {COMPANY.cin} | GSTIN: {COMPANY.gstin} | Jurisdiction: {COMPANY.jurisdiction}
          </p>
          <p className="mt-3">
            <Link to="/" className="text-[#F98906] hover:underline">Back to {COMPANY.brand}</Link>
            {' • '}
            <a href={`https://${COMPANY.website}`} className="text-gray-400 hover:text-white" target="_blank" rel="noopener noreferrer">{COMPANY.website}</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LegalPage;
