// Barrel export for job-card-detail components

// Core styles and utilities
export { styles, formatCurrency } from './styles';

// UI Components
export { Badge, Card, Button } from './UIComponents';

// Section Components
export { TopNavBar } from './TopNavBar';
export { JobCardHeader } from './JobCardHeader';
export { QuickActionsBar } from './QuickActionsBar';
export { VehicleCustomerInfo } from './VehicleCustomerInfo';
export { PreInspectionSection } from './PreInspectionSection';
export { ServiceDetailsSection, PartsInventorySection, CostPaymentSection } from './ServicePartsPayment';
export { EkaAIInsightsPanel } from './EkaAIInsightsPanel';
export { 
  VehicleHealthScore, 
  ServiceHistorySection, 
  ActivityTimelineSection,
  CustomerApprovalSection,
  CustomerFeedbackSection,
  DocumentAttachmentsSection,
  RelatedJobCardsSection
} from './AdditionalSections';
export { Footer } from './Footer';

// Re-export types
export type { JobCardDetail, InsightsData } from '../../hooks/useJobCardDetail';
