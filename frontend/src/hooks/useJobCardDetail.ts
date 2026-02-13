import { useState, useEffect, useCallback } from 'react';

const API_URL = import.meta.env.VITE_API_URL || '';

// Types
export interface VehicleInfo {
  registration_number: string;
  make: string;
  model: string;
  variant?: string;
  year: number;
  fuel_type: string;
  chassis_vin?: string;
  engine_number?: string;
  odometer_reading: number;
  color: string;
  insurance_valid_till?: string;
  puc_valid_till?: string;
  last_service_date?: string;
  last_service_km?: number;
  tyre_condition?: string;
}

export interface CustomerInfo {
  name: string;
  phone: string;
  email?: string;
  address?: string;
  total_visits: number;
  lifetime_value: number;
  rating: number;
  member_since?: string;
  preferences: string[];
}

export interface ServiceItem {
  id: string;
  service_type: string;
  description: string;
  technician: string;
  priority: string;
  status: string;
  estimated_time: string;
  actual_time?: string;
  cost: number;
}

export interface PartItem {
  id: string;
  name: string;
  part_number: string;
  category: string;
  quantity: string;
  unit_price: number;
  total: number;
  warranty?: string;
  availability: string;
  availability_note?: string;
}

export interface PaymentInfo {
  subtotal: number;
  discounts: any[];
  cgst: number;
  sgst: number;
  igst: number;
  grand_total: number;
  amount_paid: number;
  balance_due: number;
  payment_status: string;
  payment_mode?: string;
  transaction_id?: string;
  paid_on?: string;
}

export interface TimelineEntry {
  id: string;
  timestamp: string;
  description: string;
  actor: string;
  status: string;
}

export interface InternalNote {
  id: string;
  author: string;
  timestamp: string;
  text: string;
  is_ai: boolean;
  attachments: string[];
}

export interface JobCardDetail {
  id: string;
  job_card_number: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  bay_number?: string;
  technician?: string;
  promised_delivery?: string;
  vehicle: VehicleInfo;
  customer: CustomerInfo;
  services: ServiceItem[];
  parts: PartItem[];
  payment: PaymentInfo;
  timeline: TimelineEntry[];
  notes: InternalNote[];
  pre_inspection: Record<string, any>;
  photos: any[];
  documents: any[];
  related_job_cards: any[];
  approval_status: string;
  signature?: any;
  feedback?: any;
}

export interface InsightItem {
  type: string;
  icon: string;
  title: string;
  body: string;
  confidence?: number;
  priority?: string;
  risk_delayed?: string;
  risk_now?: string;
  savings_this_visit?: number;
  lifetime_savings?: number;
  action: string;
  border_color: string;
  bg_color: string;
}

export interface HealthScore {
  overall: number;
  engine: number;
  brakes: number;
  tyres: number;
  ac: number;
  electrical: number;
  body: number;
}

export interface InsightsData {
  insights: InsightItem[];
  health_score: HealthScore;
  generated_at: string;
}

export function useJobCardDetail(jobCardId: string | undefined) {
  const [data, setData] = useState<JobCardDetail | null>(null);
  const [insights, setInsights] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = useCallback(async () => {
    if (!jobCardId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_URL}/api/job-cards/${jobCardId}/detail`);
      if (!response.ok) {
        throw new Error('Failed to fetch job card details');
      }
      const result = await response.json();
      if (result.success) {
        setData(result.data);
      } else {
        throw new Error(result.message || 'Failed to fetch job card details');
      }
    } catch (err) {
      console.error('Error fetching job card detail:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [jobCardId]);

  const fetchInsights = useCallback(async () => {
    if (!jobCardId) return;

    try {
      const response = await fetch(`${API_URL}/api/job-cards/${jobCardId}/insights`);
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setInsights(result.data);
        }
      }
    } catch (err) {
      console.error('Error fetching insights:', err);
    }
  }, [jobCardId]);

  const addNote = useCallback(async (text: string, author: string) => {
    if (!jobCardId) return null;

    try {
      const response = await fetch(`${API_URL}/api/job-cards/${jobCardId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, author, attachments: [] }),
      });
      
      if (response.ok) {
        const result = await response.json();
        // Refresh data
        await fetchDetail();
        return result.data;
      }
    } catch (err) {
      console.error('Error adding note:', err);
    }
    return null;
  }, [jobCardId, fetchDetail]);

  const saveSignature = useCallback(async (
    signatureImage: string,
    customerName: string,
    verifiedVia: string = 'manual',
    otpVerified: boolean = false
  ) => {
    if (!jobCardId) return false;

    try {
      const response = await fetch(`${API_URL}/api/job-cards/${jobCardId}/signature`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job_card_id: jobCardId,
          signature_image: signatureImage,
          customer_name: customerName,
          verified_via: verifiedVia,
          otp_verified: otpVerified,
        }),
      });
      
      if (response.ok) {
        await fetchDetail();
        return true;
      }
    } catch (err) {
      console.error('Error saving signature:', err);
    }
    return false;
  }, [jobCardId, fetchDetail]);

  const uploadPhoto = useCallback(async (file: File, category: string = 'vehicle_photo') => {
    if (!jobCardId) return null;

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('job_card_id', jobCardId);
      formData.append('category', category);

      const response = await fetch(`${API_URL}/api/files/upload`, {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        const result = await response.json();
        await fetchDetail();
        return result.data;
      }
    } catch (err) {
      console.error('Error uploading photo:', err);
    }
    return null;
  }, [jobCardId, fetchDetail]);

  useEffect(() => {
    fetchDetail();
    fetchInsights();
  }, [fetchDetail, fetchInsights]);

  return {
    data,
    insights,
    loading,
    error,
    refetch: fetchDetail,
    refetchInsights: fetchInsights,
    addNote,
    saveSignature,
    uploadPhoto,
  };
}

// Default/sample data for when API data is not available
export const defaultJobCardData: JobCardDetail = {
  id: 'sample-001',
  job_card_number: 'JC-2025-00847',
  status: 'In Progress',
  priority: 'high',
  created_at: '2025-01-15T10:30:00Z',
  updated_at: '2025-01-15T12:35:00Z',
  created_by: 'Priya (Front Desk)',
  bay_number: 'Bay #3',
  technician: 'Rajesh Kumar',
  promised_delivery: '2025-01-15T17:00:00Z',
  vehicle: {
    registration_number: 'KA 01 AB 1234',
    make: 'Maruti Suzuki',
    model: 'Swift VXi',
    variant: 'VXi',
    year: 2022,
    fuel_type: 'Petrol',
    chassis_vin: 'MA3FJEB1S00XXXXXX',
    engine_number: 'K12MN-XXXXXXX',
    odometer_reading: 32450,
    color: 'Pearl White',
    insurance_valid_till: '2025-03-15',
    puc_valid_till: '2025-06-22',
    last_service_date: '2024-10-15',
    last_service_km: 28200,
    tyre_condition: 'Front: Good | Rear: Fair',
  },
  customer: {
    name: 'Amit Sharma',
    phone: '+91 98765 43210',
    email: 'amit.sharma@email.com',
    address: 'HSR Layout, Bangalore, Karnataka 560102',
    total_visits: 7,
    lifetime_value: 42800,
    rating: 4.8,
    member_since: '2022-03',
    preferences: ['Prefers SMS updates', 'Usually pays via UPI', 'Visits every 4 months'],
  },
  services: [
    { id: '1', service_type: 'General Service', description: 'Full car servicing — oil change, filter replacement, multi-point check', technician: 'Rajesh K.', priority: 'normal', status: 'completed', estimated_time: '2h 00m', actual_time: '1h 45m', cost: 2800 },
    { id: '2', service_type: 'Brake Inspection & Repair', description: 'Front & rear brake pad inspection. Front pads replaced.', technician: 'Suresh M.', priority: 'high', status: 'in-progress', estimated_time: '1h 00m', actual_time: '0h 40m...', cost: 500 },
    { id: '3', service_type: 'AC Service & Gas Top-up', description: 'AC gas refill (R134a), cooling coil cleaning, cabin filter check', technician: 'Vijay R.', priority: 'normal', status: 'queued', estimated_time: '1h 30m', cost: 800 },
    { id: '4', service_type: 'Wheel Alignment & Balancing', description: '4-wheel computerized alignment + balancing', technician: 'Rajesh K.', priority: 'low', status: 'queued', estimated_time: '0h 45m', cost: 650 },
  ],
  parts: [
    { id: '1', name: 'Engine Oil 5W-30 (Castrol)', part_number: 'OIL-5W30-4L', category: 'Lubricant', quantity: '4 L', unit_price: 350, total: 1400, warranty: undefined, availability: 'in-stock' },
    { id: '2', name: 'Oil Filter (Genuine)', part_number: 'FLT-MSZ-OIL-22', category: 'Filter', quantity: '1', unit_price: 280, total: 280, warranty: '6 months', availability: 'in-stock' },
    { id: '3', name: 'Front Brake Pad Set (Brembo)', part_number: 'BRK-FRT-SWF-B', category: 'Brake', quantity: '1 set', unit_price: 2200, total: 2200, warranty: '12 months', availability: 'in-stock' },
    { id: '4', name: 'AC Gas R134a', part_number: 'ACG-R134A-1KG', category: 'AC', quantity: '1 kg', unit_price: 650, total: 650, availability: 'low-stock', availability_note: '2 left' },
    { id: '5', name: 'Cabin Air Filter', part_number: 'FLT-CAB-SWF', category: 'Filter', quantity: '1', unit_price: 380, total: 380, availability: 'ordered', availability_note: 'ETA: Tomorrow' },
  ],
  payment: {
    subtotal: 9400,
    discounts: [
      { label: 'Loyal Customer Discount (5%)', amount: 470 },
      { label: 'Coupon: FIRST2025', amount: 200 },
    ],
    cgst: 786,
    sgst: 786,
    igst: 0,
    grand_total: 10302,
    amount_paid: 5000,
    balance_due: 5302,
    payment_status: 'partial',
    payment_mode: 'UPI (Google Pay)',
    transaction_id: 'TXN20250115103045',
    paid_on: '2025-01-15T10:35:00Z',
  },
  timeline: [],
  notes: [],
  pre_inspection: {
    exterior: [
      { item: 'Body condition', status: 'ok', note: 'No dents' },
      { item: 'Windshield', status: 'ok', note: 'No cracks' },
      { item: 'Paint scratches', status: 'warning', note: 'Left rear door, pre-existing' },
    ],
    interior: [
      { item: 'Dashboard', status: 'ok', note: 'No warning lights (at entry)' },
      { item: 'AC', status: 'ok', note: 'Customer reports weak cooling' },
    ],
    underHood: [
      { item: 'Engine oil level', status: 'ok', note: 'Low (to be topped up)' },
      { item: 'Coolant level', status: 'warning', note: 'Slightly below min mark' },
    ],
  },
  photos: [],
  documents: [],
  related_job_cards: [],
  approval_status: 'approved',
  signature: {
    customer_name: 'Amit Sharma',
    verified_via: 'otp',
    otp_verified: true,
    signed_at: '2025-01-15T11:00:00Z',
  },
  feedback: {
    overall_rating: 5,
    service_quality: 5,
    value_for_money: 4,
    communication: 5,
    timeliness: 4,
    review: 'Very happy with the service. Rajesh explained everything clearly. Will definitely come back.',
    reviewer: 'Amit Sharma',
    reviewed_at: '2025-01-15T18:30:00Z',
    sentiment: 'positive',
    sentiment_score: 98,
    keywords: ['happy', 'explained clearly', 'come back'],
  },
};

export const defaultInsightsData: InsightsData = {
  insights: [
    {
      type: 'predictive',
      icon: '🔮',
      title: 'Next Service Prediction',
      body: 'Based on driving patterns (avg 1,400 km/month), next service at 37,500 km — approximately April 2025. Recommend scheduling proactive reminder 2 weeks before.',
      confidence: 94,
      action: 'Schedule Reminder',
      border_color: '#E8952F',
      bg_color: '#FEF6EC',
    },
    {
      type: 'alert',
      icon: '⚠️',
      title: 'Attention Required',
      body: 'Rear brake pads at 40% wear (measured during current inspection). At current driving pattern, estimated 5,000 km before replacement needed. Delaying may cause rotor damage (+₹3,500 additional cost).',
      priority: 'Medium Priority',
      risk_delayed: '₹3,500 additional rotor cost',
      risk_now: '₹1,800 brake pads only',
      action: 'Add to Current Job Card',
      border_color: '#F59E0B',
      bg_color: '#FFFBEB',
    },
    {
      type: 'savings',
      icon: '💡',
      title: 'Cost Savings Detected',
      body: "By bundling AC service + general service in this visit, customer saves ₹400 compared to separate visits. Customer's lifetime savings with Go4Garage: ₹2,800 across 7 visits.",
      savings_this_visit: 400,
      lifetime_savings: 2800,
      action: 'View Savings Report',
      border_color: '#16A34A',
      bg_color: '#ECFDF5',
    },
  ],
  health_score: {
    overall: 78,
    engine: 92,
    brakes: 65,
    tyres: 80,
    ac: 55,
    electrical: 95,
    body: 88,
  },
  generated_at: new Date().toISOString(),
};
