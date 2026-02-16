import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, ChevronDown } from 'lucide-react';
import { styles } from './styles';

export const TopNavBar: React.FC = () => {
  const navigate = useNavigate();
  const navLinks = ['Dashboard', 'Job Cards', 'Customers', 'Inventory', 'Reports', 'Analytics'];
  const [activeLink, setActiveLink] = useState('Job Cards');

  return (
    <header className="no-print" style={{
      position: 'sticky',
      top: 0,
      zIndex: 200,
      background: styles.white,
      borderBottom: `1px solid ${styles.gray200}`,
      height: '64px',
      boxShadow: styles.shadowSm,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 32px',
    }}>
      {/* Logo Area */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: '20px', fontWeight: 700, fontFamily: styles.fontPrimary }}>
          <span style={{ color: styles.g4gPurple }}>Go</span>
          <span style={{ color: styles.g4gGreen }}>4</span>
          <span style={{ color: styles.g4gPurple }}>Garage</span>
        </div>
        <div style={{ fontSize: '11px', color: styles.gray400, display: 'flex', alignItems: 'center', gap: '4px' }}>
          Powered by <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: styles.ekaOrange, display: 'inline-block' }} /> EKA-AI
        </div>
      </div>

      {/* Navigation Links */}
      <nav style={{ display: 'flex', gap: '4px' }}>
        {navLinks.map((link) => (
          <button
            key={link}
            onClick={() => {
              setActiveLink(link);
              if (link === 'Dashboard') navigate('/dashboard');
              if (link === 'Job Cards') navigate('/job-cards');
            }}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: activeLink === link ? 600 : 500,
              color: activeLink === link ? styles.ekaOrange : styles.gray500,
              background: 'transparent',
              border: 'none',
              borderBottom: activeLink === link ? `2px solid ${styles.ekaOrange}` : '2px solid transparent',
              borderRadius: activeLink === link ? '0' : '6px',
              cursor: 'pointer',
              transition: 'all 150ms ease',
              fontFamily: styles.fontPrimary,
            }}
            onMouseEnter={(e) => {
              if (activeLink !== link) {
                e.currentTarget.style.color = styles.gray700;
                e.currentTarget.style.background = styles.gray50;
              }
            }}
            onMouseLeave={(e) => {
              if (activeLink !== link) {
                e.currentTarget.style.color = styles.gray500;
                e.currentTarget.style.background = 'transparent';
              }
            }}
          >
            {link}
          </button>
        ))}
      </nav>

      {/* Right Side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          background: styles.gray100,
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
        }}>
          <Search size={16} color={styles.gray500} />
        </button>

        <button style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          background: styles.gray100,
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          position: 'relative',
        }}>
          <Bell size={16} color={styles.gray500} />
          <span style={{
            position: 'absolute',
            top: '-2px',
            right: '-2px',
            width: '18px',
            height: '18px',
            borderRadius: '50%',
            background: styles.error,
            color: styles.white,
            fontSize: '9px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>3</span>
        </button>

        <div style={{ width: '1px', height: '24px', background: styles.gray200 }} />

        <span style={{ color: styles.gray700, fontSize: '13px', fontWeight: 500 }}>AutoCare Workshop</span>

        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          background: styles.ekaOrangeLight,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '13px',
          fontWeight: 600,
          color: styles.ekaOrange,
        }}>WS</div>

        <ChevronDown size={14} color={styles.gray400} />
      </div>
    </header>
  );
};
