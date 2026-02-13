import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Car, 
  User, 
  Phone, 
  Calendar,
  Wrench,
  FileText,
  CheckCircle,
  AlertTriangle,
  Clock,
  Edit,
  Trash2,
  Download,
  MessageSquare
} from 'lucide-react';
import { clsx } from 'clsx';
import JobCardStepper from '../components/features/JobCardStepper';
import { JobStatus, JobCardLifecycleStatus, JOB_CARD_LIFECYCLE_STATES } from '../types';

const API_URL = import.meta.env.VITE_API_URL || '';

interface JobCardDetail {
  id: string;
  registration_number: string;
  customer_name: string;
  customer_phone?: string;
  status: JobStatus;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';
  symptoms: string[];
  reported_issues?: string;
  created_at: string;
  updated_at?: string;
  vehicle_brand?: string;
  vehicle_model?: string;
  vehicle_year?: string;
  odometer_reading?: number;
  assigned_technician?: string;
  estimated_completion?: string;
  audit_trail?: Array<{
    timestamp: string;
    action: string;
    actor: string;
    notes?: string;
  }>;
}

const PRIORITY_COLORS: Record<string, string> = {
  LOW: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  NORMAL: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  HIGH: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  CRITICAL: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const JobCardDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [jobCard, setJobCard] = useState<JobCardDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchJobCard(id);
    }
  }, [id]);

  const fetchJobCard = async (jobCardId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_URL}/api/job-cards/${jobCardId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch job card');
      }
      
      const data = await response.json();
      setJobCard(data.data || data);
    } catch (err: any) {
      setError(err.message || 'Failed to load job card');
    } finally {
      setLoading(false);
    }
  };

  const handleTransition = async (targetStatus: JobCardLifecycleStatus) => {
    if (!jobCard) return;
    
    try {
      const response = await fetch(`${API_URL}/api/job-cards/${jobCard.id}/transition`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target_state: targetStatus, notes: `Transitioned to ${targetStatus}` })
      });

      if (response.ok) {
        fetchJobCard(jobCard.id);
      }
    } catch (error) {
      console.error('Error transitioning job card:', error);
    }
  };

  const handleDelete = async () => {
    if (!jobCard || !confirm('Are you sure you want to delete this job card?')) return;
    
    try {
      const response = await fetch(`${API_URL}/api/job-cards/${jobCard.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        navigate('/app/job-cards');
      }
    } catch (error) {
      console.error('Error deleting job card:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-12 h-12 bg-brand-orange/20 rounded-xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Wrench className="w-6 h-6 text-brand-orange" />
          </div>
          <p className="text-text-secondary">Loading job card...</p>
        </div>
      </div>
    );
  }

  if (error || !jobCard) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-text-primary mb-2">Job Card Not Found</h2>
          <p className="text-text-secondary mb-4">{error || 'The requested job card could not be found.'}</p>
          <button
            onClick={() => navigate('/app/job-cards')}
            className="px-4 py-2 bg-brand-orange text-white rounded-lg hover:bg-brand-hover transition-colors"
          >
            Back to Job Cards
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6" data-testid="job-card-detail-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/app/job-cards')}
            className="p-2 rounded-lg hover:bg-surface transition-colors"
            data-testid="back-btn"
          >
            <ArrowLeft className="w-5 h-5 text-text-secondary" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">
              {jobCard.registration_number}
            </h1>
            <p className="text-text-secondary text-sm">{jobCard.customer_name}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className={clsx(
            "px-3 py-1 rounded-full text-xs font-medium border",
            PRIORITY_COLORS[jobCard.priority] || PRIORITY_COLORS.NORMAL
          )}>
            {jobCard.priority}
          </span>
          <button
            onClick={() => navigate(`/app/job-cards/${jobCard.id}/edit`)}
            className="p-2 rounded-lg hover:bg-surface transition-colors"
            title="Edit"
          >
            <Edit className="w-5 h-5 text-text-secondary" />
          </button>
          <button
            onClick={handleDelete}
            className="p-2 rounded-lg hover:bg-red-500/10 transition-colors"
            title="Delete"
          >
            <Trash2 className="w-5 h-5 text-red-400" />
          </button>
        </div>
      </div>

      {/* Progress Stepper */}
      <div className="bg-background-alt rounded-xl p-6 border border-border">
        <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-4">
          Job Progress
        </h2>
        <JobCardStepper 
          currentStatus={jobCard.status} 
          onStepClick={handleTransition}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Vehicle Information */}
          <div className="bg-background-alt rounded-xl p-6 border border-border">
            <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
              <Car className="w-5 h-5 text-brand-orange" />
              Vehicle Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <InfoItem label="Registration" value={jobCard.registration_number} />
              <InfoItem label="Brand" value={jobCard.vehicle_brand || 'Not specified'} />
              <InfoItem label="Model" value={jobCard.vehicle_model || 'Not specified'} />
              <InfoItem label="Year" value={jobCard.vehicle_year || 'Not specified'} />
              <InfoItem 
                label="Odometer" 
                value={jobCard.odometer_reading ? `${jobCard.odometer_reading.toLocaleString()} km` : 'Not recorded'} 
              />
            </div>
          </div>

          {/* Customer Information */}
          <div className="bg-background-alt rounded-xl p-6 border border-border">
            <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-brand-orange" />
              Customer Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <InfoItem label="Name" value={jobCard.customer_name} />
              <InfoItem label="Phone" value={jobCard.customer_phone || 'Not provided'} />
            </div>
          </div>

          {/* Reported Issues */}
          <div className="bg-background-alt rounded-xl p-6 border border-border">
            <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
              <Wrench className="w-5 h-5 text-brand-orange" />
              Reported Issues
            </h3>
            {jobCard.symptoms && jobCard.symptoms.length > 0 ? (
              <div className="flex flex-wrap gap-2 mb-4">
                {jobCard.symptoms.map((symptom, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-surface text-text-secondary text-sm rounded-full border border-border"
                  >
                    {symptom}
                  </span>
                ))}
              </div>
            ) : null}
            {jobCard.reported_issues ? (
              <p className="text-text-secondary text-sm">{jobCard.reported_issues}</p>
            ) : (
              <p className="text-text-muted text-sm">No issues reported</p>
            )}
          </div>
        </div>

        {/* Right Column - Timeline & Actions */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-background-alt rounded-xl p-6 border border-border">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <ActionButton 
                icon={<MessageSquare className="w-4 h-4" />}
                label="Start AI Diagnosis"
                onClick={() => navigate(`/chat?vehicle=${jobCard.registration_number}`)}
              />
              <ActionButton 
                icon={<FileText className="w-4 h-4" />}
                label="Generate Invoice"
                onClick={() => navigate(`/app/invoices?job_card=${jobCard.id}`)}
              />
              <ActionButton 
                icon={<Download className="w-4 h-4" />}
                label="Download Report"
                onClick={() => {}}
              />
            </div>
          </div>

          {/* Audit Trail / Timeline */}
          <div className="bg-background-alt rounded-xl p-6 border border-border">
            <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-brand-orange" />
              Activity Timeline
            </h3>
            <div className="space-y-4">
              {jobCard.audit_trail && jobCard.audit_trail.length > 0 ? (
                jobCard.audit_trail.slice(0, 5).map((entry, idx) => (
                  <TimelineItem
                    key={idx}
                    time={new Date(entry.timestamp).toLocaleString()}
                    action={entry.action}
                    actor={entry.actor}
                  />
                ))
              ) : (
                <>
                  <TimelineItem
                    time={new Date(jobCard.created_at).toLocaleString()}
                    action="Job card created"
                    actor="System"
                  />
                  {jobCard.updated_at && (
                    <TimelineItem
                      time={new Date(jobCard.updated_at).toLocaleString()}
                      action="Last updated"
                      actor="System"
                    />
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper Components
const InfoItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div>
    <p className="text-xs text-text-muted uppercase tracking-wider">{label}</p>
    <p className="text-text-primary font-medium mt-1">{value}</p>
  </div>
);

const ActionButton: React.FC<{ icon: React.ReactNode; label: string; onClick: () => void }> = ({ 
  icon, label, onClick 
}) => (
  <button
    onClick={onClick}
    className="w-full flex items-center gap-3 px-4 py-3 bg-surface border border-border rounded-lg hover:border-brand-orange/50 transition-colors text-left"
  >
    <span className="text-brand-orange">{icon}</span>
    <span className="text-sm text-text-primary">{label}</span>
  </button>
);

const TimelineItem: React.FC<{ time: string; action: string; actor: string }> = ({ 
  time, action, actor 
}) => (
  <div className="flex gap-3">
    <div className="w-2 h-2 bg-brand-orange rounded-full mt-2 flex-shrink-0" />
    <div className="flex-1">
      <p className="text-sm text-text-primary">{action}</p>
      <p className="text-xs text-text-muted mt-0.5">
        {actor} • {time}
      </p>
    </div>
  </div>
);

export default JobCardDetailPage;
