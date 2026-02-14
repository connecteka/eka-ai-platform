import React from 'react';
import { Phone, Mail, MapPin, Check } from 'lucide-react';
import { styles, formatCurrency } from './styles';
import { Badge, Card, Button } from './UIComponents';
import type { JobCardDetail } from '../../hooks/useJobCardDetail';

interface VehicleCustomerInfoProps {
  vehicle: JobCardDetail['vehicle'];
  customer: JobCardDetail['customer'];
}

export const VehicleCustomerInfo: React.FC<VehicleCustomerInfoProps> = ({ vehicle, customer }) => {
  return (
    <div style={{
      padding: '24px 32px',
      background: styles.gray50,
      display: 'grid',
      gridTemplateColumns: '3fr 2fr',
      gap: '24px',
    }}>
      {/* Vehicle Information Card */}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>🚗</span>
            <span style={{ color: styles.gray800, fontSize: '16px', fontWeight: 600 }}>Vehicle Information</span>
          </div>
          <Badge variant="success" size="sm">
            <Check size={10} /> EKA-AI Verified
          </Badge>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          {[
            { label: 'Registration No.', value: vehicle.registration_number },
            { label: 'Make & Model', value: `${vehicle.make} ${vehicle.model}` },
            { label: 'Manufacturing Year', value: vehicle.year?.toString() || 'N/A' },
            { label: 'Fuel Type', value: <><span style={{ width: '8px', height: '8px', borderRadius: '50%', background: styles.success, display: 'inline-block', marginRight: '6px' }} />{vehicle.fuel_type}</> },
            { label: 'Chassis/VIN', value: <span style={{ fontFamily: styles.fontMono }}>{vehicle.chassis_vin || 'N/A'}</span> },
            { label: 'Engine No.', value: <span style={{ fontFamily: styles.fontMono }}>{vehicle.engine_number || 'N/A'}</span> },
            { label: 'Odometer Reading', value: `${vehicle.odometer_reading?.toLocaleString('en-IN') || 0} km` },
            { label: 'Color', value: <><span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#F5F5F5', border: `1px solid ${styles.gray300}`, display: 'inline-block', marginRight: '6px' }} />{vehicle.color || 'N/A'}</> },
            { label: 'Insurance Valid Till', value: vehicle.insurance_valid_till ? <><span style={{ color: styles.warning }}>⚠️</span> {vehicle.insurance_valid_till}</> : 'N/A' },
            { label: 'PUC Valid Till', value: vehicle.puc_valid_till || 'N/A' },
            { label: 'Last Service', value: vehicle.last_service_date ? `${vehicle.last_service_date} at ${vehicle.last_service_km?.toLocaleString('en-IN')} km` : 'N/A' },
            { label: 'Tyre Condition', value: vehicle.tyre_condition || 'N/A' },
          ].map((item, idx) => (
            <div key={idx}>
              <div style={{ fontSize: '11px', color: styles.gray400, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
                {item.label}
              </div>
              <div style={{ fontSize: '14px', color: styles.gray900, fontWeight: 500 }}>
                {item.value}
              </div>
            </div>
          ))}
        </div>

        {/* AI Note */}
        <div style={{
          background: styles.ekaOrangeSuperLight,
          borderLeft: `3px solid ${styles.ekaOrange}`,
          borderRadius: '0 6px 6px 0',
          padding: '12px 16px',
          fontSize: '13px',
          color: styles.gray600,
        }}>
          <span style={{ fontWeight: 600 }}>🤖 EKA-AI Note:</span> Vehicle has completed {vehicle.odometer_reading?.toLocaleString('en-IN')} km. Next major service at {((vehicle.odometer_reading || 30000) + 8000).toLocaleString('en-IN')} km. Insurance renewal due soon. Recommend reminding customer during delivery.
        </div>
      </Card>

      {/* Customer Information Card */}
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: styles.g4gPurpleLight,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            fontWeight: 600,
            color: styles.g4gPurple,
          }}>{customer.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'NA'}</div>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 600, color: styles.gray900 }}>{customer.name}</div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
              <Badge variant="purple" size="sm">{customer.total_visits > 3 ? 'Regular Customer' : 'New Customer'}</Badge>
              {customer.member_since && <Badge variant="gray" size="sm">Since {customer.member_since}</Badge>}
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '14px', color: styles.gray700 }}>
            <Phone size={14} color={styles.gray400} />
            <span>{customer.phone}</span>
            <Button size="sm" variant="ghost" style={{ padding: '4px 8px', fontSize: '11px' }}>Call</Button>
            <Button size="sm" variant="ghost" style={{ padding: '4px 8px', fontSize: '11px', color: '#25D366' }}>WhatsApp</Button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '14px', color: styles.gray700 }}>
            <Mail size={14} color={styles.gray400} />
            <span>{customer.email || 'customer@email.com'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: styles.gray700 }}>
            <MapPin size={14} color={styles.gray400} />
            <span>{customer.address || 'HSR Layout, Bangalore, Karnataka 560102'}</span>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px' }}>
          {[
            { value: customer.total_visits?.toString() || '0', label: 'Visits', color: styles.ekaOrange },
            { value: formatCurrency(customer.lifetime_value || 0), label: 'Lifetime', color: styles.g4gPurple },
            { value: `${customer.rating || 0}⭐`, label: 'Rating', color: styles.warning },
          ].map((stat, idx) => (
            <div key={idx} style={{
              background: styles.gray50,
              border: `1px solid ${styles.gray100}`,
              borderRadius: '8px',
              padding: '12px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '20px', fontWeight: 700, color: stat.color }}>{stat.value}</div>
              <div style={{ fontSize: '11px', color: styles.gray400 }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Preferences */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '11px', color: styles.gray400, textTransform: 'uppercase', marginBottom: '8px' }}>Customer Preferences (EKA-AI detected)</div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {(customer.preferences?.length ? customer.preferences : ['Prefers SMS updates', 'Usually pays via UPI']).map((pref, idx) => (
              <span key={idx} style={{
                background: styles.ekaOrangeSuperLight,
                color: styles.gray600,
                fontSize: '11px',
                padding: '4px 8px',
                borderRadius: '4px',
              }}>{pref}</span>
            ))}
          </div>
        </div>

        {/* AI Note */}
        <div style={{
          background: styles.ekaOrangeSuperLight,
          borderLeft: `3px solid ${styles.ekaOrange}`,
          borderRadius: '0 6px 6px 0',
          padding: '12px 16px',
          fontSize: '13px',
          color: styles.gray600,
        }}>
          <span style={{ fontWeight: 600 }}>🤖 EKA-AI:</span> {customer.total_visits > 5 ? 'High retention score. VIP treatment recommended.' : 'New customer. Focus on service quality.'}
        </div>
      </Card>
    </div>
  );
};
