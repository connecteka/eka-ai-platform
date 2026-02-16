import React from 'react';
import { clsx } from 'clsx';
import { Check } from 'lucide-react';
import { JobCardLifecycleStatus, JOB_CARD_LIFECYCLE_STATES, mapStatusToLifecycleState, JobStatus } from '../../types';

interface JobCardStepperProps {
  currentStatus: JobStatus;
  onStepClick?: (status: JobCardLifecycleStatus) => void;
}

const JobCardStepper: React.FC<JobCardStepperProps> = ({ currentStatus, onStepClick }) => {
  const currentLifecycleStatus = mapStatusToLifecycleState(currentStatus);
  const currentIndex = JOB_CARD_LIFECYCLE_STATES.findIndex(s => s.id === currentLifecycleStatus);

  return (
    <div className="w-full" data-testid="job-card-stepper">
      {/* Desktop Stepper */}
      <div className="hidden md:flex items-center justify-between">
        {JOB_CARD_LIFECYCLE_STATES.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isActive = index === currentIndex;
          const isPending = index > currentIndex;

          return (
            <React.Fragment key={step.id}>
              {/* Step */}
              <div
                className={clsx(
                  "flex flex-col items-center cursor-pointer group",
                  onStepClick && "hover:opacity-80"
                )}
                onClick={() => onStepClick?.(step.id)}
                data-testid={`step-${step.id}`}
              >
                {/* Circle */}
                <div
                  className={clsx(
                    "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all",
                    isCompleted && "bg-brand-orange border-brand-orange text-white",
                    isActive && "border-brand-orange bg-brand-orange/20 text-brand-orange ring-4 ring-brand-orange/20",
                    isPending && "border-border bg-surface text-text-muted"
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-semibold">{index + 1}</span>
                  )}
                </div>

                {/* Label */}
                <div className="mt-2 text-center">
                  <p
                    className={clsx(
                      "text-xs font-medium transition-colors",
                      isCompleted && "text-brand-orange",
                      isActive && "text-text-primary",
                      isPending && "text-text-muted"
                    )}
                  >
                    {step.label}
                  </p>
                </div>
              </div>

              {/* Connector Line */}
              {index < JOB_CARD_LIFECYCLE_STATES.length - 1 && (
                <div
                  className={clsx(
                    "flex-1 h-0.5 mx-2 transition-colors",
                    index < currentIndex ? "bg-brand-orange" : "bg-border"
                  )}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Mobile Stepper */}
      <div className="md:hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-text-secondary">
            Step {currentIndex + 1} of {JOB_CARD_LIFECYCLE_STATES.length}
          </span>
          <span className="text-sm font-medium text-brand-orange">
            {JOB_CARD_LIFECYCLE_STATES[currentIndex]?.label || 'Unknown'}
          </span>
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-surface rounded-full h-2">
          <div
            className="bg-brand-orange h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / JOB_CARD_LIFECYCLE_STATES.length) * 100}%` }}
          />
        </div>

        {/* Current step description */}
        <p className="mt-2 text-xs text-text-muted">
          {JOB_CARD_LIFECYCLE_STATES[currentIndex]?.description || ''}
        </p>
      </div>
    </div>
  );
};

export default JobCardStepper;
