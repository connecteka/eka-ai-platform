import React, { useState, useEffect } from 'react';
import { Clock, Check } from 'lucide-react';
import { styles } from './styles';
import { Badge } from './UIComponents';
import type { JobCardDetail } from '../../hooks/useJobCardDetail';

interface JobCardHeaderProps {
  jobCard: JobCardDetail;
}

export const JobCardHeader: React.FC<JobCardHeaderProps> = ({ jobCard }) => {
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 32, seconds: 15 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { hours, minutes, seconds } = prev;
        if (seconds > 0) {
          seconds--;
        } else if (minutes > 0) {
          minutes--;
          seconds = 59;
        } else if (hours > 0) {
          hours--;
          minutes = 59;
          seconds = 59;
        }
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (n: number) => n.toString().padStart(2, '0');

  return (
    <div style={{
      background: styles.white,
      padding: '24px 32px 20px',
      borderBottom: `1px solid ${styles.gray200}`,
    }}>
      {/* Breadcrumb */}
      <div style={{ marginBottom: '16px', fontSize: '13px' }}>
        <span style={{ color: styles.gray400, cursor: 'pointer' }} 
          onMouseEnter={(e) => e.currentTarget.style.color = styles.ekaOrange}
          onMouseLeave={(e) => e.currentTarget.style.color = styles.gray400}>
          Dashboard
        </span>
        <span style={{ color: styles.gray300 }}> / </span>
        <span style={{ color: styles.gray400, cursor: 'pointer' }}
          onMouseEnter={(e) => e.currentTarget.style.color = styles.ekaOrange}
          onMouseLeave={(e) => e.currentTarget.style.color = styles.gray400}>
          Job Cards
        </span>
        <span style={{ color: styles.gray300 }}> / </span>
        <span style={{ color: styles.gray700, fontWeight: 500 }}>{jobCard.job_card_number}</span>
      </div>

      {/* Title + SLA */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
            <h1 style={{ 
              fontSize: '28px', 
              fontWeight: 700, 
              color: styles.gray900,
              margin: 0,
              fontFamily: styles.fontPrimary,
            }}>
              {jobCard.job_card_number}
            </h1>
            <Badge variant="orange" pulse>{jobCard.status}</Badge>
            {jobCard.priority === 'high' && <Badge variant="error">High Priority</Badge>}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ color: styles.gray400, fontSize: '13px' }}>
              Created: {new Date(jobCard.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}, {new Date(jobCard.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })} by {jobCard.created_by}
            </span>
            <span style={{ color: styles.gray500, fontSize: '13px' }}>
              {jobCard.bay_number || 'Bay #3'} • Senior Technician: {jobCard.technician || 'Unassigned'}
            </span>
            <span style={{ color: styles.gray400, fontSize: '12px', fontStyle: 'italic' }}>
              Last Updated: {jobCard.updated_at ? new Date(jobCard.updated_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) : 'N/A'}
            </span>
          </div>
        </div>

        {/* SLA Timer */}
        <div style={{
          background: styles.white,
          border: `1px solid ${styles.gray200}`,
          borderLeft: `4px solid ${styles.success}`,
          borderRadius: '12px',
          padding: '16px 24px',
          minWidth: '240px',
          boxShadow: styles.shadowSm,
        }}>
          <div style={{ 
            fontSize: '11px', 
            color: styles.gray500, 
            textTransform: 'uppercase', 
            letterSpacing: '0.05em',
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}>
            <Clock size={14} /> PROMISED DELIVERY
          </div>
          <div style={{ 
            fontFamily: styles.fontMono, 
            fontSize: '28px', 
            fontWeight: 700, 
            color: styles.gray900,
            marginBottom: '4px',
          }}>
            {formatTime(timeLeft.hours)} : {formatTime(timeLeft.minutes)} : {formatTime(timeLeft.seconds)}
          </div>
          <div style={{ 
            display: 'flex', 
            gap: '16px', 
            fontSize: '10px', 
            color: styles.gray400, 
            textTransform: 'uppercase',
            marginBottom: '12px',
          }}>
            <span>hrs</span>
            <span style={{ marginLeft: '8px' }}>min</span>
            <span style={{ marginLeft: '12px' }}>sec</span>
          </div>
          <div style={{ fontSize: '12px', color: styles.gray500, marginBottom: '8px' }}>
            Due: Today, 5:00 PM
          </div>
          <Badge variant="success" size="sm">
            <Check size={12} /> On Track
          </Badge>
        </div>
      </div>
    </div>
  );
};
