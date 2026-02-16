import React from 'react';
import { Wrench, Brain, IndianRupee, ClipboardCheck, Truck, FileCheck } from 'lucide-react';

const features = [
  {
    icon: Wrench,
    title: 'Digital Job Cards',
    description: 'Create, manage, and track job cards digitally with real-time updates and customer approvals.',
  },
  {
    icon: Brain,
    title: 'AI Diagnostics',
    description: 'Get AI-powered vehicle diagnostics and repair suggestions powered by Gemini AI.',
  },
  {
    icon: IndianRupee,
    title: 'GST Invoicing',
    description: 'Generate GST-compliant invoices with automatic tax calculations and PDF export.',
  },
  {
    icon: ClipboardCheck,
    title: 'PDI Checklists',
    description: 'Pre-delivery inspection checklists with digital signatures and photo documentation.',
  },
  {
    icon: Truck,
    title: 'Fleet Management',
    description: 'Track and manage MG Fleet vehicles, service schedules, and recall notices.',
  },
  {
    icon: FileCheck,
    title: 'Customer Approvals',
    description: 'Digital approval workflow for estimates with SMS/email notifications.',
  },
];

const Features: React.FC = () => {
  return (
    <section className="py-20" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-display" style={{ color: 'var(--text-primary)' }}>
            Everything You Need to Run Your Workshop
          </h2>
          <p className="mt-2 text-lg" style={{ color: 'var(--text-secondary)' }}>
            A comprehensive AI-powered platform designed specifically for automobile workshops.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div 
                key={index} 
                className="p-6 rounded-xl border transition-all duration-300 hover:-translate-y-1"
                style={{ 
                  backgroundColor: 'var(--surface)',
                  borderColor: 'var(--border-light)',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <div 
                  className="mb-4 w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ 
                    backgroundColor: 'var(--eka-orange-light)',
                    color: 'var(--eka-orange)'
                  }}
                >
                  <Icon size={24} />
                </div>
                <h3 className="text-xl font-bold font-display mb-2" style={{ color: 'var(--text-primary)' }}>
                  {feature.title}
                </h3>
                <p style={{ color: 'var(--text-muted)' }}>{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
