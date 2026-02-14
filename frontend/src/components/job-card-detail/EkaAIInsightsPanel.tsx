import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { styles, formatCurrency } from './styles';
import { Badge, Button } from './UIComponents';
import type { InsightsData } from '../../hooks/useJobCardDetail';

interface EkaAIInsightsPanelProps {
  insights: InsightsData['insights'];
}

export const EkaAIInsightsPanel: React.FC<EkaAIInsightsPanelProps> = ({ insights: apiInsights }) => {
  const [aiQuery, setAiQuery] = useState('');

  const insights = apiInsights.length > 0 ? apiInsights : [
    {
      type: 'predictive',
      icon: '🔮',
      title: 'Next Service Prediction',
      body: 'Based on driving patterns (avg 1,400 km/month), next service at 37,500 km — approximately April 2025. Recommend scheduling proactive reminder 2 weeks before.',
      confidence: 94,
      action: '📅 Schedule Reminder',
      border_color: styles.ekaOrange,
      bg_color: styles.ekaOrangeLight,
    },
    {
      type: 'alert',
      icon: '⚠️',
      title: 'Attention Required',
      body: 'Rear brake pads at 40% wear (measured during current inspection). At current driving pattern, estimated 5,000 km before replacement needed.',
      priority: 'Medium Priority',
      action: 'Add to Current Job Card',
      border_color: styles.warning,
      bg_color: styles.warningLight,
    },
    {
      type: 'savings',
      icon: '💡',
      title: 'Cost Savings Detected',
      body: 'By bundling AC service + general service in this visit, customer saves ₹400 compared to separate visits.',
      savings_this_visit: 400,
      lifetime_savings: 2800,
      action: 'View Savings Report',
      border_color: styles.success,
      bg_color: styles.successLight,
    },
  ];

  const suggestions = [
    'Estimate next visit cost',
    'Compare with market rate',
    'What parts will need replacement soon?'
  ];

  return (
    <div style={{
      margin: '0 32px 24px',
      background: `linear-gradient(135deg, ${styles.ekaOrangeSuperLight} 0%, ${styles.white} 60%, ${styles.g4gPurpleLight} 100%)`,
      border: '1px solid rgba(232, 149, 47, 0.15)',
      borderRadius: '20px',
      padding: '32px',
      position: 'relative',
      overflow: 'hidden',
      boxShadow: styles.shadowLg,
    }}>
      {/* Decorative circles */}
      <div style={{
        position: 'absolute',
        top: '-50px',
        left: '-50px',
        width: '200px',
        height: '200px',
        borderRadius: '50%',
        background: `radial-gradient(circle, ${styles.ekaOrange} 0%, transparent 70%)`,
        opacity: 0.05,
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-30px',
        right: '-30px',
        width: '150px',
        height: '150px',
        borderRadius: '50%',
        background: `radial-gradient(circle, ${styles.g4gPurple} 0%, transparent 70%)`,
        opacity: 0.04,
      }} />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', position: 'relative' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: styles.gray900, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            🤖 EKA-AI Insights
          </h2>
          <div style={{ fontSize: '12px', fontWeight: 500, color: styles.g4gPurple, marginTop: '4px' }}>
            Governed Intelligence for Automobiles
          </div>
          <div style={{ width: '48px', height: '3px', background: styles.ekaOrange, borderRadius: '9999px', marginTop: '8px' }} />
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: styles.ekaOrangeLight,
            border: `2px solid ${styles.ekaOrangeBorder}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
          }}>🐘</div>
          <div style={{ fontSize: '10px', color: styles.gray400, marginTop: '4px' }}>v3.2</div>
        </div>
      </div>

      {/* Insight Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '24px' }}>
        {insights.map((insight, idx) => (
          <div key={idx} style={{
            background: styles.white,
            border: `1px solid ${styles.gray200}`,
            borderTop: `4px solid ${insight.border_color || styles.ekaOrange}`,
            borderRadius: '12px',
            padding: '20px',
            boxShadow: styles.shadowSm,
            transition: 'all 200ms ease',
            cursor: 'pointer',
          }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = styles.shadowMd;
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = styles.shadowSm;
              e.currentTarget.style.transform = 'none';
            }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: insight.bg_color || styles.ekaOrangeLight,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              marginBottom: '12px',
            }}>{insight.icon}</div>
            <h4 style={{ fontSize: '15px', fontWeight: 600, color: styles.gray900, margin: '0 0 8px' }}>{insight.title}</h4>
            <p style={{ fontSize: '13px', color: styles.gray600, lineHeight: 1.6, margin: '0 0 12px' }}>{insight.body}</p>

            {insight.confidence && (
              <div style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '12px', color: styles.gray500 }}>Confidence</span>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: styles.success }}>{insight.confidence}%</span>
                </div>
                <div style={{ height: '6px', background: styles.gray200, borderRadius: '9999px', overflow: 'hidden' }}>
                  <div style={{ width: `${insight.confidence}%`, height: '100%', background: styles.success, borderRadius: '9999px' }} />
                </div>
              </div>
            )}

            {insight.priority && (
              <div style={{ marginBottom: '8px' }}>
                <Badge variant="warning" size="sm">{insight.priority}</Badge>
              </div>
            )}

            {insight.savings_this_visit && (
              <div style={{
                background: styles.successLight,
                border: `1px solid ${styles.successBorder}`,
                borderRadius: '8px',
                padding: '12px',
                textAlign: 'center',
                marginBottom: '12px',
              }}>
                <div style={{ fontSize: '20px', fontWeight: 700, color: styles.success }}>{formatCurrency(insight.savings_this_visit)} SAVED</div>
                <div style={{ fontSize: '11px', color: styles.gray500 }}>This Visit</div>
              </div>
            )}

            {insight.lifetime_savings && (
              <div style={{ fontSize: '12px', marginBottom: '8px' }}>
                <span style={{ fontWeight: 600, color: styles.g4gPurple }}>{formatCurrency(insight.lifetime_savings)} total savings</span>
              </div>
            )}

            <button style={{
              background: 'none',
              border: 'none',
              color: styles.ekaOrange,
              fontSize: '12px',
              cursor: 'pointer',
              padding: 0,
              fontFamily: styles.fontPrimary,
            }}
              onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
              onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}>
              {insight.action} →
            </button>
          </div>
        ))}
      </div>

      {/* AI Chat Input */}
      <div style={{
        background: styles.white,
        border: `2px dashed ${styles.ekaOrangeBorder}`,
        borderRadius: '12px',
        padding: '20px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <span style={{ fontSize: '20px' }}>🐘</span>
          <span style={{ fontSize: '14px', color: styles.gray400 }}>Ask EKA-AI about this job card...</span>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <input
            type="text"
            value={aiQuery}
            onChange={(e) => setAiQuery(e.target.value)}
            placeholder="What's the service history for this car?"
            style={{
              flex: 1,
              height: '44px',
              border: `1px solid ${styles.gray300}`,
              borderRadius: '8px',
              padding: '0 16px',
              fontSize: '14px',
              fontFamily: styles.fontPrimary,
              outline: 'none',
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = styles.ekaOrange}
            onBlur={(e) => e.currentTarget.style.borderColor = styles.gray300}
          />
          <Button variant="primary" icon={<Send size={16} />}>Ask EKA</Button>
        </div>
        <div style={{ marginTop: '12px', fontSize: '12px', color: styles.gray400, fontStyle: 'italic' }}>
          Try: {suggestions.map((s, i) => (
            <span key={i}>
              <button 
                onClick={() => setAiQuery(s)}
                style={{ background: 'none', border: 'none', color: styles.gray500, cursor: 'pointer', fontFamily: styles.fontPrimary, fontSize: '12px' }}
                onMouseEnter={(e) => e.currentTarget.style.color = styles.ekaOrange}
                onMouseLeave={(e) => e.currentTarget.style.color = styles.gray500}>
                "{s}"
              </button>
              {i < suggestions.length - 1 && ' • '}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
