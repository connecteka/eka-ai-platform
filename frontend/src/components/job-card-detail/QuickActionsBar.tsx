import React from 'react';
import { Phone, MessageCircle, Printer, Download, FileText, Receipt, Check } from 'lucide-react';
import { styles } from './styles';
import { Button } from './UIComponents';

export const QuickActionsBar: React.FC = () => {
  const workflowSteps = [
    { label: 'Received', completed: true },
    { label: 'Inspected', completed: true },
    { label: 'In Progress', completed: false, current: true },
    { label: 'QC Check', completed: false },
    { label: 'Ready', completed: false },
    { label: 'Delivered', completed: false },
  ];

  return (
    <div className="no-print" style={{
      background: styles.gray50,
      padding: '12px 32px',
      borderBottom: `1px solid ${styles.gray200}`,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    }}>
      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <Button size="sm" icon={<Phone size={14} />}>Call Customer</Button>
        <Button size="sm" variant="primary" icon={<MessageCircle size={14} />} style={{ background: '#25D366' }}>WhatsApp Update</Button>
        <Button size="sm" icon={<Printer size={14} />}>Print Job Card</Button>
        <Button size="sm" icon={<Download size={14} />}>Export PDF</Button>
        <Button size="sm" icon={<FileText size={14} />}>Gate Pass</Button>
        <Button size="sm" variant="secondary" icon={<Receipt size={14} />}>Generate Invoice</Button>
      </div>

      {/* Workflow Steps */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {workflowSteps.map((step, index) => (
          <React.Fragment key={step.label}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: step.completed ? styles.success : step.current ? styles.ekaOrange : styles.gray300,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                animation: step.current ? 'pulse-orange 2s infinite' : 'none',
              }}>
                {step.completed && <Check size={12} color={styles.white} />}
              </div>
              <span style={{
                fontSize: '10px',
                color: step.current ? styles.ekaOrange : styles.gray500,
                fontWeight: step.current ? 600 : 400,
                marginTop: '4px',
              }}>{step.label}</span>
            </div>
            {index < workflowSteps.length - 1 && (
              <div style={{
                width: '32px',
                height: '2px',
                background: step.completed ? styles.success : styles.gray300,
                borderStyle: step.completed ? 'solid' : 'dashed',
                marginBottom: '20px',
              }} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
