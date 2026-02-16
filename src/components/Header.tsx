import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';

const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'About', href: '/about' },
    { name: 'Services', href: '/services' },
    { name: 'Blog', href: '/blog' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <header className="bg-background shadow-md">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold font-display" style={{ color: 'var(--text-primary)' }}>
            EKA-AI
          </div>
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="transition hover:opacity-80"
                style={{ color: 'var(--text-secondary)' }}
              >
                {link.name}
              </a>
            ))}
            <a
              href="/login"
              className="px-4 py-2 rounded-md hover:opacity-90 transition"
              style={{ 
                backgroundColor: 'var(--eka-orange)', 
                color: 'white' 
              }}
            >
              Get Started
            </a>
          </div>
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
      {isOpen && (
        <div className="md:hidden" style={{ backgroundColor: 'var(--bg-secondary)' }}>
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="block px-3 py-2 rounded-md text-base font-medium hover:opacity-75 transition"
                style={{ color: 'var(--text-secondary)' }}
              >
                {link.name}
              </a>
            ))}
            <a
              href="/login"
              className="block px-3 py-2 rounded-md text-base font-medium"
              style={{ 
                backgroundColor: 'var(--eka-orange)', 
                color: 'white' 
              }}
            >
              Get Started
            </a>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
