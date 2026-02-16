import React, { useState } from 'react';
import { ChevronRight, Check, Send, Loader2, Shield, Download } from 'lucide-react';
import { styles, formatCurrency } from './styles';
import { Badge, Card, Button } from './UIComponents';
import type { JobCardDetail, InsightsData } from '../../hooks/useJobCardDetail';

// SECTION 10: VEHICLE HEALTH SCORE
interface VehicleHealthScoreProps {
  healthScore: InsightsData['health_score'];
}

export const VehicleHealthScore: React.FC<VehicleHealthScoreProps> = ({ healthScore }) => {
  const overallScore = healthScore?.overall || 78;
  const subScores = [
    { system: 'Engine', score: healthScore?.engine || 92 },
    { system: 'Brakes', score: healthScore?.brakes || 65 },
    { system: 'Tyres', score: healthScore?.tyres || 80 },
    { system: 'AC', score: healthScore?.ac || 55 },
    { system: 'Electrical', score: healthScore?.electrical || 95 },
    { system: 'Body', score: healthScore?.body || 88 },
  ];

  const getScoreColor = (score: number) => {
    if (score >= 80) return styles.success;
    if (score >= 60) return styles.ekaOrange;
    return styles.warning;
  };

  return (
    <div style={{ padding: '0 32px 24px' }}>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <span style={{ fontSize: '16px', fontWeight: 600, color: styles.gray800 }}>🏥 Vehicle Health Score</span>
          <Badge variant="purple" size="sm">Powered by EKA-AI</Badge>
        </div>

        <div style={{ display: 'flex', gap: '48px', alignItems: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              background: `conic-gradient(${getScoreColor(overallScore)} ${overallScore * 3.6}deg, ${styles.gray200} 0deg)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <div style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                background: styles.white,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <span style={{ fontSize: '36px', fontWeight: 700, color: styles.gray900 }}>{overallScore}</span>
                <span style={{ fontSize: '14px', color: styles.gray400 }}>/100</span>
              </div>
            </div>
            <div style={{ marginTop: '12px', fontSize: '14px', fontWeight: 600, color: getScoreColor(overallScore) }}>
              {overallScore >= 80 ? 'EXCELLENT' : overallScore >= 60 ? 'GOOD' : 'NEEDS ATTENTION'}
            </div>
          </div>

          <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            {subScores.map((item, idx) => (
              <div key={idx}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '13px', color: styles.gray700 }}>{item.system}</span>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: getScoreColor(item.score) }}>{item.score}</span>
                </div>
                <div style={{ height: '8px', background: styles.gray200, borderRadius: '9999px', overflow: 'hidden' }}>
                  <div style={{ width: `${item.score}%`, height: '100%', background: getScoreColor(item.score), borderRadius: '9999px' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};

// SECTION 11: SERVICE HISTORY
export const ServiceHistorySection: React.FC = () => {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const history = [
    { id: 1, jobCard: 'JC-2024-00612', date: '15 Oct 2024', service: 'General Service + AC Check', km: '28,200 km', amount: 7450 },
    { id: 2, jobCard: 'JC-2024-00398', date: '12 Jul 2024', service: 'AC Service + Battery', km: '24,100 km', amount: 5200 },
    { id: 3, jobCard: 'JC-2024-00156', date: '20 Mar 2024', service: 'General Service', km: '20,000 km', amount: 3800 },
  ];

  return (
    <div style={{ padding: '0 32px 24px' }}>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <span style={{ fontSize: '16px', fontWeight: 600, color: styles.gray800 }}>📜 Service History</span>
          <Badge variant="gray" size="sm">{history.length} Past Records</Badge>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {history.map((item) => (
            <div key={item.id} style={{ border: `1px solid ${styles.gray100}`, borderRadius: '8px', overflow: 'hidden' }}>
              <button
                onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                style={{
                  width: '100%',
                  padding: '14px 18px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: styles.fontPrimary,
                }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <ChevronRight size={16} style={{ transform: expandedId === item.id ? 'rotate(90deg)' : 'none', transition: 'transform 200ms ease', color: styles.gray400 }} />
                  <span style={{ fontFamily: styles.fontMono, fontWeight: 600, color: styles.gray900, fontSize: '14px' }}>{item.jobCard}</span>
                  <span style={{ color: styles.gray500, fontSize: '13px' }}>{item.date}</span>
                  <span style={{ color: styles.gray700, fontSize: '13px' }}>{item.service}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span style={{ fontSize: '13px', color: styles.gray500 }}>{item.km}</span>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: styles.gray700 }}>{formatCurrency(item.amount)}</span>
                  <Badge variant="success" size="sm"><Check size={10} /> Completed</Badge>
                </div>
              </button>
            </div>
          ))}
        </div>

        <Button variant="outline" fullWidth style={{ marginTop: '16px' }}>Show All History</Button>
      </Card>
    </div>
  );
};

// SECTION 12: ACTIVITY TIMELINE + INTERNAL NOTES
interface ActivityTimelineSectionProps {
  timeline: JobCardDetail['timeline'];
  notes: JobCardDetail['notes'];
  onAddNote?: (text: string, author: string) => Promise<any>;
}

export const ActivityTimelineSection: React.FC<ActivityTimelineSectionProps> = ({ timeline: apiTimeline, notes: apiNotes, onAddNote }) => {
  const [newNote, setNewNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [localNotes, setLocalNotes] = useState<any[]>([]);

  const handleAddNote = async () => {
    if (!newNote.trim() || !onAddNote) return;
    setSubmitting(true);
    try {
      const result = await onAddNote(newNote, 'Current User');
      if (result) {
        setLocalNotes(prev => [result, ...prev]);
        setNewNote('');
      }
    } catch (error) {
      console.error('Failed to add note:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const timeline = apiTimeline.length > 0 ? apiTimeline : [
    { timestamp: new Date().toISOString(), description: 'Job card created', actor: 'Priya (Front Desk)', status: 'completed' },
    { timestamp: new Date().toISOString(), description: 'Payment received: ₹5,000 (UPI)', actor: 'System', status: 'completed' },
    { timestamp: new Date().toISOString(), description: 'Vehicle moved to Bay #3', actor: 'Rajesh K.', status: 'completed' },
  ];

  const notes = [...localNotes, ...(apiNotes.length > 0 ? apiNotes : [])];

  return (
    <div style={{ padding: '0 32px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
      {/* Timeline */}
      <Card>
        <div style={{ marginBottom: '20px', fontSize: '16px', fontWeight: 600, color: styles.gray800 }}>⏱️ Activity Timeline</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {timeline.map((item, idx) => (
            <div key={idx} style={{ display: 'flex', gap: '12px' }}>
              <div style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: item.status === 'ai' ? styles.ekaOrange : styles.success,
                marginTop: '4px',
                flexShrink: 0,
              }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', color: styles.gray700 }}>{item.description}</div>
                <div style={{ fontSize: '11px', color: styles.gray400, marginTop: '2px' }}>
                  {new Date(item.timestamp).toLocaleTimeString()} • {item.actor}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Internal Notes */}
      <Card>
        <div style={{ marginBottom: '20px', fontSize: '16px', fontWeight: 600, color: styles.gray800 }}>📝 Internal Notes</div>
        
        {notes.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
            {notes.map((note, idx) => (
              <div key={idx} style={{ background: styles.gray50, padding: '12px', borderRadius: '8px' }}>
                <div style={{ fontSize: '13px', color: styles.gray700 }}>{note.text}</div>
                <div style={{ fontSize: '11px', color: styles.gray400, marginTop: '4px' }}>{note.author} • {new Date(note.created_at || note.timestamp || Date.now()).toLocaleString()}</div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ color: styles.gray400, fontSize: '13px', marginBottom: '16px' }}>No notes yet</div>
        )}

        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Add a note..."
            style={{
              flex: 1,
              padding: '10px 12px',
              border: `1px solid ${styles.gray300}`,
              borderRadius: '8px',
              fontSize: '13px',
              fontFamily: styles.fontPrimary,
              outline: 'none',
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
          />
          <Button variant="primary" onClick={handleAddNote} disabled={submitting || !newNote.trim()}>
            {submitting ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={16} />}
          </Button>
        </div>
      </Card>
    </div>
  );
};

// SECTION 13: CUSTOMER APPROVAL (Placeholder)
interface CustomerApprovalSectionProps {
  approvalStatus: string;
  signatureData?: string;
  onSaveSignature?: (data: string) => Promise<void>;
}

export const CustomerApprovalSection: React.FC<CustomerApprovalSectionProps> = ({ approvalStatus }) => {
  return (
    <div style={{ padding: '0 32px 24px' }}>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <span style={{ fontSize: '16px', fontWeight: 600, color: styles.gray800 }}>✍️ Customer Approval</span>
          <Badge variant={approvalStatus === 'approved' ? 'success' : 'warning'}>
            {approvalStatus === 'approved' ? 'Approved' : 'Pending Approval'}
          </Badge>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <Button variant="primary" icon={<Shield size={16} />}>Send Approval Link</Button>
          <Button variant="outline" icon={<Download size={16} />}>Download Consent Form</Button>
        </div>
      </Card>
    </div>
  );
};

// SECTION 14-16: Additional sections (simplified)
export const CustomerFeedbackSection: React.FC<{ feedback?: any }> = () => {
  return (
    <div style={{ padding: '0 32px 24px' }}>
      <Card>
        <div style={{ fontSize: '16px', fontWeight: 600, color: styles.gray800, marginBottom: '16px' }}>⭐ Customer Feedback</div>
        <div style={{ color: styles.gray500, fontSize: '13px' }}>No feedback collected yet. Send feedback form after delivery.</div>
        <Button variant="outline" style={{ marginTop: '16px' }}>Send Feedback Request</Button>
      </Card>
    </div>
  );
};

export const DocumentAttachmentsSection: React.FC<{ documents?: any[]; onUpload?: any }> = () => {
  return (
    <div style={{ padding: '0 32px 24px' }}>
      <Card>
        <div style={{ fontSize: '16px', fontWeight: 600, color: styles.gray800, marginBottom: '16px' }}>📎 Documents & Attachments</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
          {['Job Card Copy', 'Invoice Draft', 'Gate Pass', 'Consent Form'].map((doc, idx) => (
            <div key={idx} style={{
              padding: '16px',
              border: `1px solid ${styles.gray200}`,
              borderRadius: '8px',
              textAlign: 'center',
              cursor: 'pointer',
            }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>📄</div>
              <div style={{ fontSize: '12px', color: styles.gray600 }}>{doc}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export const RelatedJobCardsSection: React.FC<{ relatedCards?: any[] }> = () => {
  return (
    <div style={{ padding: '0 32px 24px' }}>
      <Card>
        <div style={{ fontSize: '16px', fontWeight: 600, color: styles.gray800, marginBottom: '16px' }}>🔗 Related Job Cards</div>
        <div style={{ color: styles.gray500, fontSize: '13px' }}>No related job cards for this vehicle.</div>
      </Card>
    </div>
  );
};
