import React from 'react';
import { Award, Users, Zap, Shield } from 'lucide-react';

const stats = [
  { icon: Users, value: '500+', label: 'Workshops' },
  { icon: Award, value: '10K+', label: 'Job Cards Processed' },
  { icon: Zap, value: '99.9%', label: 'Uptime' },
  { icon: Shield, value: 'GST', label: 'Compliant' },
];

const AboutUs: React.FC = () => {
  return (
    <section className="py-20" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-display" style={{ color: 'var(--text-primary)' }}>
            India's First Governed AI Platform for Workshops
          </h2>
          <p className="mt-4 text-lg max-w-3xl mx-auto text-pretty" style={{ color: 'var(--text-secondary)' }}>
            Built by Go4Garage Private Limited, EKA-AI combines cutting-edge artificial intelligence 
            with deep automotive industry expertise to revolutionize workshop management across India.
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div 
                key={index} 
                className="text-center p-6 rounded-xl border"
                style={{ 
                  backgroundColor: 'var(--surface)',
                  borderColor: 'var(--border-light)'
                }}
              >
                <div 
                  className="w-12 h-12 rounded-lg mx-auto mb-3 flex items-center justify-center"
                  style={{ 
                    backgroundColor: 'var(--eka-orange-light)',
                    color: 'var(--eka-orange)'
                  }}
                >
                  <Icon size={24} />
                </div>
                <div className="text-3xl font-bold font-display" style={{ color: 'var(--eka-orange)' }}>
                  {stat.value}
                </div>
                <div className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
