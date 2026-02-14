import React from 'react';
import { Plus, Search, Check, Eye } from 'lucide-react';
import { styles, formatCurrency } from './styles';
import { Badge, Card, Button } from './UIComponents';
import type { JobCardDetail } from '../../hooks/useJobCardDetail';

// SECTION 6: SERVICE DETAILS
interface ServiceDetailsSectionProps {
  services: JobCardDetail['services'];
}

export const ServiceDetailsSection: React.FC<ServiceDetailsSectionProps> = ({ services }) => {
  const sampleServices = (services && services.length > 0) ? services : [
    { id: '1', service_type: 'General Service', description: 'Full car servicing — oil change, filter replacement', technician: 'Rajesh K.', priority: 'normal', status: 'completed', estimated_time: '2h 00m', actual_time: '1h 45m', cost: 2800 },
    { id: '2', service_type: 'Brake Inspection', description: 'Front & rear brake pad inspection', technician: 'Suresh M.', priority: 'high', status: 'in-progress', estimated_time: '1h 00m', actual_time: '0h 40m', cost: 500 },
    { id: '3', service_type: 'AC Service', description: 'AC gas refill, cooling coil cleaning', technician: 'Vijay R.', priority: 'normal', status: 'queued', estimated_time: '1h 30m', cost: 800 },
  ];
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return <Badge variant="success"><Check size={10} /> Completed</Badge>;
      case 'in-progress': return <Badge variant="orange" pulse>🔄 In Progress</Badge>;
      case 'queued': return <Badge variant="gray">⏳ Queued</Badge>;
      default: return null;
    }
  };

  const completedTasks = sampleServices.filter(s => s.status === 'completed').length;
  const totalTasks = sampleServices.length;
  const progressPercent = (completedTasks / totalTasks) * 100;

  return (
    <div style={{ padding: '0 32px 24px', background: styles.gray50 }}>
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${styles.gray200}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '16px', fontWeight: 600, color: styles.gray800 }}>🔧 Service Details</span>
            <Badge variant="gray" size="sm">{totalTasks} Services</Badge>
          </div>
          <Button size="sm" variant="primary" icon={<Plus size={14} />} style={{ background: styles.ekaOrangeLight, color: styles.ekaOrange, border: `1px solid ${styles.ekaOrangeBorder}` }}>Add Service</Button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: styles.gray50 }}>
                {['#', 'Service Type', 'Technician', 'Status', 'Est. Time', 'Actions'].map((header) => (
                  <th key={header} style={{
                    padding: '10px 16px',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: styles.gray500,
                    textTransform: 'uppercase',
                    textAlign: 'left',
                    borderBottom: `1px solid ${styles.gray200}`,
                  }}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sampleServices.map((service, idx) => (
                <tr key={service.id || idx} style={{ background: idx % 2 === 0 ? styles.white : styles.gray50 }}>
                  <td style={{ padding: '14px 16px', fontSize: '14px', color: styles.gray700, borderBottom: `1px solid ${styles.gray100}` }}>{idx + 1}</td>
                  <td style={{ padding: '14px 16px', fontSize: '14px', color: styles.gray900, fontWeight: 500, borderBottom: `1px solid ${styles.gray100}` }}>{service.service_type || service.type}</td>
                  <td style={{ padding: '14px 16px', fontSize: '14px', color: styles.gray700, borderBottom: `1px solid ${styles.gray100}` }}>{service.technician}</td>
                  <td style={{ padding: '14px 16px', borderBottom: `1px solid ${styles.gray100}` }}>{getStatusBadge(service.status)}</td>
                  <td style={{ padding: '14px 16px', fontSize: '14px', color: styles.gray700, fontFamily: styles.fontMono, borderBottom: `1px solid ${styles.gray100}` }}>{service.estimated_time || '—'}</td>
                  <td style={{ padding: '14px 16px', borderBottom: `1px solid ${styles.gray100}` }}>
                    <Button size="sm" variant="ghost" style={{ padding: '4px 8px' }}><Eye size={14} /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ padding: '20px 24px', borderTop: `1px solid ${styles.gray200}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontWeight: 600, color: styles.gray700 }}>Overall Progress</span>
            <span style={{ fontSize: '13px', color: styles.gray500 }}>{progressPercent.toFixed(0)}% Complete</span>
          </div>
          <div style={{ height: '10px', background: styles.gray200, borderRadius: '9999px', overflow: 'hidden' }}>
            <div style={{
              width: `${progressPercent}%`,
              height: '100%',
              background: `linear-gradient(90deg, ${styles.ekaOrange}, #F5A623)`,
              borderRadius: '9999px',
            }} />
          </div>
        </div>
      </Card>
    </div>
  );
};

// SECTION 7: PARTS & INVENTORY
interface PartsInventorySectionProps {
  parts: JobCardDetail['parts'];
}

export const PartsInventorySection: React.FC<PartsInventorySectionProps> = ({ parts }) => {
  const sampleParts = parts.length > 0 ? parts : [
    { id: '1', name: 'Engine Oil 5W-30', part_number: 'OIL-5W30-4L', category: 'Lubricant', quantity: '4 L', unit_price: 350, total: 1400, warranty: undefined, availability: 'in-stock' },
    { id: '2', name: 'Oil Filter', part_number: 'FLT-MSZ-OIL', category: 'Filter', quantity: '1', unit_price: 280, total: 280, warranty: '6 months', availability: 'in-stock' },
    { id: '3', name: 'Brake Pad Set', part_number: 'BRK-FRT-SWF', category: 'Brake', quantity: '1 set', unit_price: 2200, total: 2200, warranty: '12 months', availability: 'in-stock' },
  ];

  const getAvailabilityBadge = (availability: string, note?: string) => {
    switch (availability) {
      case 'in-stock': return <span style={{ color: styles.success, fontSize: '13px' }}>🟢 In Stock</span>;
      case 'low-stock': return <span style={{ color: styles.warning, fontSize: '13px' }}>🟡 Low ({note})</span>;
      case 'ordered': return <span style={{ color: styles.error, fontSize: '13px' }}>🔴 Ordered</span>;
      default: return null;
    }
  };

  const totalPartsCost = sampleParts.reduce((sum, p) => sum + p.total, 0);

  return (
    <div style={{ padding: '0 32px 24px' }}>
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${styles.gray200}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '16px', fontWeight: 600, color: styles.gray800 }}>📦 Parts & Inventory</span>
            <Badge variant="gray" size="sm">{sampleParts.length} Items</Badge>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button size="sm" icon={<Plus size={14} />}>Add Part</Button>
            <Button size="sm" icon={<Search size={14} />}>Check Stock</Button>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: styles.gray50 }}>
                {['Part Name', 'Part #', 'Qty', 'Unit Price', 'Total', 'Warranty', 'Status'].map((header) => (
                  <th key={header} style={{
                    padding: '10px 16px',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: styles.gray500,
                    textTransform: 'uppercase',
                    textAlign: 'left',
                    borderBottom: `1px solid ${styles.gray200}`,
                  }}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sampleParts.map((part, idx) => (
                <tr key={part.id || idx} style={{ background: idx % 2 === 0 ? styles.white : styles.gray50 }}>
                  <td style={{ padding: '14px 16px', fontSize: '14px', color: styles.gray900, fontWeight: 500, borderBottom: `1px solid ${styles.gray100}` }}>{part.name}</td>
                  <td style={{ padding: '14px 16px', fontSize: '13px', color: styles.gray600, fontFamily: styles.fontMono, borderBottom: `1px solid ${styles.gray100}` }}>{part.part_number}</td>
                  <td style={{ padding: '14px 16px', fontSize: '14px', color: styles.gray700, borderBottom: `1px solid ${styles.gray100}` }}>{part.quantity}</td>
                  <td style={{ padding: '14px 16px', fontSize: '14px', color: styles.gray700, borderBottom: `1px solid ${styles.gray100}` }}>{formatCurrency(part.unit_price || 0)}</td>
                  <td style={{ padding: '14px 16px', fontSize: '14px', color: styles.gray900, fontWeight: 600, borderBottom: `1px solid ${styles.gray100}` }}>{formatCurrency(part.total)}</td>
                  <td style={{ padding: '14px 16px', borderBottom: `1px solid ${styles.gray100}` }}>
                    {part.warranty ? <Badge variant="info" size="sm">{part.warranty}</Badge> : <span style={{ color: styles.gray400 }}>—</span>}
                  </td>
                  <td style={{ padding: '14px 16px', borderBottom: `1px solid ${styles.gray100}` }}>{getAvailabilityBadge(part.availability, part.availability_note)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ padding: '16px 24px', background: styles.gray50, borderTop: `1px solid ${styles.gray200}`, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontWeight: 700, color: styles.gray900 }}>Total Parts Cost</span>
          <span style={{ fontWeight: 700, color: styles.gray900, fontSize: '18px' }}>{formatCurrency(totalPartsCost)}</span>
        </div>
      </Card>
    </div>
  );
};

// SECTION 8: COST & PAYMENT BREAKDOWN
interface CostPaymentSectionProps {
  payment: JobCardDetail['payment'];
}

export const CostPaymentSection: React.FC<CostPaymentSectionProps> = ({ payment }) => {
  // Default payment values if payment is undefined
  const safePayment = payment || {
    services_total: 0,
    parts_total: 0,
    subtotal: 0,
    gst: 0,
    discount: 0,
    grand_total: 0,
    amount_paid: 0,
    payment_mode: 'N/A'
  };

  const costItems = [
    { label: 'Labour Charges', amount: safePayment.services_total || 0 },
    { label: 'Parts Cost', amount: safePayment.parts_total || 0 },
    { label: 'Subtotal', amount: safePayment.subtotal || 0, isSubtotal: true },
    { label: 'GST (18%)', amount: safePayment.gst || 0 },
    { label: 'Discount Applied', amount: -(safePayment.discount || 0), isDiscount: true },
    { label: 'Grand Total', amount: safePayment.grand_total || 0, isGrandTotal: true },
  ];

  const isPaid = (safePayment.amount_paid || 0) >= (safePayment.grand_total || 0);

  return (
    <div style={{ padding: '0 32px 24px' }}>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <span style={{ fontSize: '16px', fontWeight: 600, color: styles.gray800 }}>💰 Cost & Payment</span>
          <Badge variant={isPaid ? 'success' : 'warning'}>
            {isPaid ? 'Fully Paid' : 'Partial Payment'}
          </Badge>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {/* Cost Breakdown */}
          <div>
            {costItems.map((item, idx) => (
              <div key={idx} style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '12px 0',
                borderBottom: item.isGrandTotal ? 'none' : `1px solid ${styles.gray100}`,
                background: item.isGrandTotal ? styles.ekaOrangeLight : 'transparent',
                margin: item.isGrandTotal ? '12px -16px -16px' : 0,
                padding: item.isGrandTotal ? '16px' : '12px 0',
                borderRadius: item.isGrandTotal ? '8px' : 0,
              }}>
                <span style={{
                  color: item.isGrandTotal ? styles.gray900 : styles.gray600,
                  fontWeight: item.isSubtotal || item.isGrandTotal ? 600 : 400,
                }}>{item.label}</span>
                <span style={{
                  fontWeight: item.isGrandTotal ? 700 : 500,
                  fontSize: item.isGrandTotal ? '20px' : '14px',
                  color: item.isDiscount ? styles.success : styles.gray900,
                }}>{formatCurrency(item.amount)}</span>
              </div>
            ))}
          </div>

          {/* Payment Status */}
          <div style={{ background: styles.gray50, borderRadius: '12px', padding: '20px' }}>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', color: styles.gray500, marginBottom: '4px' }}>Amount Paid</div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: styles.success }}>{formatCurrency(safePayment.amount_paid || 0)}</div>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', color: styles.gray500, marginBottom: '4px' }}>Balance Due</div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: (safePayment.grand_total || 0) - (safePayment.amount_paid || 0) > 0 ? styles.error : styles.success }}>
                {formatCurrency((safePayment.grand_total || 0) - (safePayment.amount_paid || 0))}
              </div>
            </div>
            <div style={{ fontSize: '12px', color: styles.gray500 }}>
              Payment Mode: {safePayment.payment_mode || 'N/A'}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
