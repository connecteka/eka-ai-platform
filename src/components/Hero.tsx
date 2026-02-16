import React from 'react';

const Hero: React.FC = () => {
  return (
    <section style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <div className="container mx-auto px-6 py-24 text-center">
        <h1 className="text-4xl md:text-6xl font-bold font-display leading-tight text-balance">
          Transform Your Automobile Workshop with AI
        </h1>
        <p className="mt-4 text-lg md:text-xl max-w-3xl mx-auto text-pretty" style={{ color: 'var(--text-secondary)' }}>
          EKA-AI provides intelligent job card management, AI-powered diagnostics, 
          GST invoicing, and fleet management for automobile workshops across India.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
          <a
            href="/dashboard"
            className="px-8 py-3 rounded-lg text-lg font-medium hover:opacity-90 transition shadow-lg"
            style={{ 
              backgroundColor: 'var(--eka-orange)', 
              color: 'white',
              boxShadow: 'var(--shadow-orange)'
            }}
          >
            Get Started Free
          </a>
          <a
            href="/about"
            className="px-8 py-3 rounded-lg text-lg font-medium hover:opacity-90 transition border"
            style={{ 
              backgroundColor: 'var(--surface)',
              color: 'var(--text-primary)',
              borderColor: 'var(--border-primary)'
            }}
          >
            Learn More
          </a>
        </div>
      </div>
    </section>
  );
};

export default Hero;
