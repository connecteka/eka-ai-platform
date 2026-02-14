/**
 * Job Card Detail Page (Refactored)
 * 
 * This page displays a comprehensive 17-section job card detail view.
 * Components are organized in /app/frontend/src/components/job-card-detail/
 * 
 * Section Layout:
 * 1. TopNavBar - Navigation header
 * 2. JobCardHeader - Job card number, status, SLA timer
 * 3. QuickActionsBar - Action buttons and workflow steps
 * 4. VehicleCustomerInfo - Vehicle and customer details
 * 5. PreInspectionSection - Checklist and photo documentation
 * 6. ServiceDetailsSection - Service work log
 * 7. PartsInventorySection - Parts used
 * 8. CostPaymentSection - Cost breakdown and payment status
 * 9. EkaAIInsightsPanel - AI-powered insights (Hero section)
 * 10. VehicleHealthScore - Overall vehicle health
 * 11. ServiceHistorySection - Past service records
 * 12. ActivityTimelineSection - Timeline and internal notes
 * 13. CustomerApprovalSection - Digital signature and approval
 * 14. CustomerFeedbackSection - Post-service feedback
 * 15. DocumentAttachmentsSection - Related documents
 * 16. RelatedJobCardsSection - Linked job cards
 * 17. Footer - Company information
 */

import React from 'react';
import { useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useJobCardDetail } from '../hooks/useJobCardDetail';

// Import all components from the job-card-detail directory
import {
  styles,
  TopNavBar,
  JobCardHeader,
  QuickActionsBar,
  VehicleCustomerInfo,
  PreInspectionSection,
  ServiceDetailsSection,
  PartsInventorySection,
  CostPaymentSection,
  EkaAIInsightsPanel,
  VehicleHealthScore,
  ServiceHistorySection,
  ActivityTimelineSection,
  CustomerApprovalSection,
  CustomerFeedbackSection,
  DocumentAttachmentsSection,
  RelatedJobCardsSection,
  Footer,
} from '../components/job-card-detail';

// Default data fallbacks
const defaultJobCardData = {
  job_card_number: 'JC-2025-00847',
  status: 'In-Progress',
  priority: 'high',
  bay_number: 'Bay #3',
  technician: 'Rajesh K. (Senior)',
  created_by: 'Priya (Front Desk)',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  vehicle: {
    registration_number: 'KA 01 AB 1234',
    make: 'Maruti Suzuki',
    model: 'Swift VXi',
    year: 2022,
    fuel_type: 'Petrol',
    chassis_vin: 'MA3EYC11S00T12345',
    engine_number: 'K12MN1234567',
    odometer_reading: 32450,
    color: 'Pearl Arctic White',
    insurance_valid_till: '2025-03-15',
    puc_valid_till: '2025-06-20',
    last_service_date: '2024-08-10',
    last_service_km: 27500,
    tyre_condition: 'Front: 70%, Rear: 75%',
  },
  customer: {
    name: 'Amit Sharma',
    phone: '+91 98765 43210',
    email: 'amit.sharma@email.com',
    address: 'HSR Layout, Bangalore',
    total_visits: 7,
    lifetime_value: 42800,
    rating: 4.8,
    member_since: '2021',
    preferences: ['Prefers SMS updates', 'Usually pays via UPI'],
  },
  services: [],
  parts: [],
  payment: {
    services_total: 4750,
    parts_total: 4910,
    subtotal: 9660,
    gst: 1739,
    discount: 500,
    grand_total: 10899,
    amount_paid: 5000,
    payment_mode: 'UPI',
  },
  pre_inspection: {},
  photos: [],
  timeline: [],
  notes: [],
  approval_status: 'pending',
  signature: null,
  feedback: null,
  documents: [],
  related_job_cards: [],
};

const defaultInsightsData = {
  insights: [],
  health_score: {
    overall: 78,
    engine: 92,
    brakes: 65,
    tyres: 80,
    ac: 55,
    electrical: 95,
    body: 88,
  },
};

const JobCardDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data, insights, loading, addNote, saveSignature, uploadPhoto } = useJobCardDetail(id);
  
  // Use API data or fall back to sample data
  const jobCardData = data || defaultJobCardData;
  const insightsData = insights || defaultInsightsData;

  // Loading state
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: styles.white,
        fontFamily: styles.fontPrimary,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{ textAlign: 'center' }}>
          <Loader2 size={48} color={styles.ekaOrange} style={{ animation: 'spin 1s linear infinite' }} />
          <p style={{ marginTop: '16px', color: styles.gray500 }}>Loading job card details...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: styles.white,
      fontFamily: styles.fontPrimary,
    }}>
      {/* Global Styles */}
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse-dot { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes pulse-orange { 0%, 100% { box-shadow: 0 0 0 0 rgba(232, 149, 47, 0.4); } 50% { box-shadow: 0 0 0 8px rgba(232, 149, 47, 0); } }
        @media print { .no-print { display: none !important; } }
      `}</style>
      
      {/* Section 1: Top Navigation */}
      <TopNavBar />
      
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        {/* Section 2: Header with SLA Timer */}
        <JobCardHeader jobCard={jobCardData} />
        
        {/* Section 3: Quick Actions Bar */}
        <QuickActionsBar />
        
        {/* Section 4: Vehicle & Customer Info */}
        <VehicleCustomerInfo vehicle={jobCardData.vehicle} customer={jobCardData.customer} />
        
        {/* Section 5: Pre-Inspection & Photos */}
        <PreInspectionSection 
          preInspection={jobCardData.pre_inspection} 
          photos={jobCardData.photos} 
          onUpload={uploadPhoto} 
        />
        
        {/* Section 6: Service Details */}
        <ServiceDetailsSection services={jobCardData.services} />
        
        {/* Section 7: Parts & Inventory */}
        <PartsInventorySection parts={jobCardData.parts} />
        
        {/* Section 8: Cost & Payment */}
        <CostPaymentSection payment={jobCardData.payment} />
      </div>
      
      {/* Section 9: EKA-AI Insights Panel (Hero) */}
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <EkaAIInsightsPanel insights={insightsData.insights} />
      </div>
      
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        {/* Section 10: Vehicle Health Score */}
        <VehicleHealthScore healthScore={insightsData.health_score} />
        
        {/* Section 11: Service History */}
        <ServiceHistorySection />
        
        {/* Section 12: Activity Timeline & Notes */}
        <ActivityTimelineSection 
          timeline={jobCardData.timeline} 
          notes={jobCardData.notes} 
          onAddNote={addNote} 
        />
        
        {/* Section 13: Customer Approval */}
        <CustomerApprovalSection 
          approvalStatus={jobCardData.approval_status}
          signatureData={jobCardData.signature}
          onSaveSignature={saveSignature}
        />
        
        {/* Section 14: Customer Feedback */}
        <CustomerFeedbackSection feedback={jobCardData.feedback} />
        
        {/* Section 15: Documents & Attachments */}
        <DocumentAttachmentsSection 
          documents={jobCardData.documents} 
          onUpload={uploadPhoto} 
        />
        
        {/* Section 16: Related Job Cards */}
        <RelatedJobCardsSection relatedCards={jobCardData.related_job_cards} />
      </div>
      
      {/* Section 17: Footer */}
      <Footer />
    </div>
  );
};

export default JobCardDetailPage;
