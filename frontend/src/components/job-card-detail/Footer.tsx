import React from 'react';
import { styles } from './styles';

export const Footer: React.FC = () => {
  return (
    <footer style={{
      background: styles.gray900,
      padding: '48px 32px 24px',
      color: styles.gray400,
      marginTop: '32px',
    }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '48px', marginBottom: '32px' }}>
          {/* Company */}
          <div>
            <div style={{ marginBottom: '16px' }}>
              <span style={{ fontSize: '20px', fontWeight: 700 }}>
                <span style={{ color: '#C4A8E0' }}>Go</span>
                <span style={{ color: styles.g4gGreen }}>4</span>
                <span style={{ color: '#C4A8E0' }}>Garage</span>
              </span>
              <div style={{ fontSize: '13px', color: styles.gray500 }}>Private Limited</div>
            </div>
            <div style={{ fontSize: '13px', lineHeight: 1.8, color: styles.gray400 }}>
              #123, Industrial Area, Phase 2<br />
              HSR Layout, Bangalore<br />
              Karnataka 560102, India<br /><br />
              📞 +91 80 4567 8900<br />
              📧 support@go4garage.com<br />
              🌐 www.go4garage.com
            </div>
          </div>

          {/* Product */}
          <div>
            <div style={{ marginBottom: '8px' }}>
              <span style={{ color: styles.ekaOrange, fontSize: '24px', fontWeight: 700 }}>eka-ai</span>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: styles.ekaOrange, display: 'inline-block', marginLeft: '2px' }} />
            </div>
            <div style={{ fontSize: '13px', color: styles.gray500, marginBottom: '16px' }}>
              Governed Intelligence for Automobiles
            </div>
            <div style={{ fontSize: '12px', color: styles.gray500, fontFamily: styles.fontMono }}>
              Version: EKA-AI Core v3.2<br />
              Build: 2025.01.15<br />
              Model: Deterministic + Predictive
            </div>
          </div>

          {/* Links */}
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: styles.gray300, marginBottom: '16px' }}>Quick Links</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {['Privacy Policy', 'Terms of Service', 'Data Processing Agreement', 'API Documentation', 'Support Center', 'System Status'].map((link) => (
                <a key={link} href="#" style={{
                  color: styles.gray400,
                  fontSize: '13px',
                  textDecoration: 'none',
                  transition: 'color 150ms ease',
                }}
                  onMouseEnter={(e) => e.currentTarget.style.color = styles.ekaOrange}
                  onMouseLeave={(e) => e.currentTarget.style.color = styles.gray400}>
                  {link}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          borderTop: `1px solid ${styles.gray800}`,
          paddingTop: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '12px',
          color: styles.gray500,
        }}>
          <span>© 2025 Go4Garage Private Limited. All rights reserved.</span>
          <span>Made in India 🇮🇳 with 🧡 by EKA-AI</span>
          <span>GSTIN: 29AABCG1234A1Z5 | CIN: U72200KA2022PTC12345</span>
        </div>
      </div>
    </footer>
  );
};
