import React, { useState, useEffect, useCallback } from 'react';
import Joyride, { CallBackProps, STATUS, Step, ACTIONS, EVENTS } from 'react-joyride';
import { useLocation, useNavigate } from 'react-router-dom';
import { HelpCircle } from 'lucide-react';

// Tour step definitions
const TOUR_STEPS: Step[] = [
  // Welcome
  {
    target: 'body',
    content: (
      <div className="text-left">
        <h3 className="text-lg font-bold text-white mb-2">Welcome to EKA-AI! 🚗</h3>
        <p className="text-gray-300 text-sm">
          Your intelligent workshop assistant. Let me show you around the key features.
        </p>
      </div>
    ),
    placement: 'center',
    disableBeacon: true,
  },
  // Sidebar Navigation
  {
    target: '[data-testid="sidebar-nav"]',
    content: (
      <div className="text-left">
        <h3 className="text-lg font-bold text-white mb-2">Navigation Sidebar</h3>
        <p className="text-gray-300 text-sm">
          Access all features from here: Dashboard, AI Chat, Job Cards, Invoices, MG Fleet, and PDI checklists.
        </p>
      </div>
    ),
    placement: 'right',
    disableBeacon: true,
  },
  // New Chat Button
  {
    target: '[data-testid="new-chat-btn"]',
    content: (
      <div className="text-left">
        <h3 className="text-lg font-bold text-white mb-2">Start New Chat</h3>
        <p className="text-gray-300 text-sm">
          Click here to start a new conversation with EKA-AI. Ask about vehicle diagnostics, repairs, or get estimates.
        </p>
      </div>
    ),
    placement: 'right',
    disableBeacon: true,
  },
  // Dashboard Stats
  {
    target: '[data-testid="dashboard-stats"]',
    content: (
      <div className="text-left">
        <h3 className="text-lg font-bold text-white mb-2">Dashboard Overview</h3>
        <p className="text-gray-300 text-sm">
          See your workshop's key metrics at a glance: open job cards, completed today, revenue, and AI queries.
        </p>
      </div>
    ),
    placement: 'bottom',
    disableBeacon: true,
  },
  // Revenue Chart
  {
    target: '[data-testid="revenue-chart"]',
    content: (
      <div className="text-left">
        <h3 className="text-lg font-bold text-white mb-2">Revenue Trends</h3>
        <p className="text-gray-300 text-sm">
          Track your workshop's revenue over the last 30 days with this interactive chart.
        </p>
      </div>
    ),
    placement: 'top',
    disableBeacon: true,
  },
  // Job Cards Link
  {
    target: '[data-testid="nav-job-cards"]',
    content: (
      <div className="text-left">
        <h3 className="text-lg font-bold text-white mb-2">Job Cards Management</h3>
        <p className="text-gray-300 text-sm">
          Manage all your workshop job cards here. Track status from creation to invoice with our 9-state workflow.
        </p>
      </div>
    ),
    placement: 'right',
    disableBeacon: true,
  },
  // AI Chat Link
  {
    target: '[data-testid="nav-chat"]',
    content: (
      <div className="text-left">
        <h3 className="text-lg font-bold text-white mb-2">AI Chat Assistant</h3>
        <p className="text-gray-300 text-sm">
          Get instant help with vehicle diagnostics, repair estimates, and workshop queries. Supports voice input too!
        </p>
      </div>
    ),
    placement: 'right',
    disableBeacon: true,
  },
  // User Profile
  {
    target: '[data-testid="user-profile"]',
    content: (
      <div className="text-left">
        <h3 className="text-lg font-bold text-white mb-2">Your Profile</h3>
        <p className="text-gray-300 text-sm">
          View your account details, settings, and sign out from here.
        </p>
      </div>
    ),
    placement: 'top',
    disableBeacon: true,
  },
  // Finish
  {
    target: 'body',
    content: (
      <div className="text-left">
        <h3 className="text-lg font-bold text-white mb-2">You're All Set! 🎉</h3>
        <p className="text-gray-300 text-sm mb-3">
          That's the quick tour! Explore each section to discover more features.
        </p>
        <div className="text-xs text-gray-400">
          <p>💡 Tip: Click the <HelpCircle className="w-3 h-3 inline" /> icon anytime to restart this tour.</p>
        </div>
      </div>
    ),
    placement: 'center',
    disableBeacon: true,
  },
];

// Chat-specific tour steps
const CHAT_TOUR_STEPS: Step[] = [
  {
    target: '[data-testid="chat-input-area"]',
    content: (
      <div className="text-left">
        <h3 className="text-lg font-bold text-white mb-2">Chat Input</h3>
        <p className="text-gray-300 text-sm">
          Type your question here or use the suggestion chips above for quick queries.
        </p>
      </div>
    ),
    placement: 'top',
    disableBeacon: true,
  },
  {
    target: '[data-testid="voice-input-btn"]',
    content: (
      <div className="text-left">
        <h3 className="text-lg font-bold text-white mb-2">Voice Input</h3>
        <p className="text-gray-300 text-sm">
          Click the microphone to speak your query. EKA-AI supports 20+ languages including Hindi!
        </p>
      </div>
    ),
    placement: 'top',
    disableBeacon: true,
  },
  {
    target: '[data-testid="attach-file-btn"]',
    content: (
      <div className="text-left">
        <h3 className="text-lg font-bold text-white mb-2">Attach Files</h3>
        <p className="text-gray-300 text-sm">
          Upload images of vehicle issues, documents, or inspection reports for AI analysis.
        </p>
      </div>
    ),
    placement: 'top',
    disableBeacon: true,
  },
];

// Job Cards specific tour steps
const JOB_CARDS_TOUR_STEPS: Step[] = [
  {
    target: '[data-testid="new-job-card-btn"]',
    content: (
      <div className="text-left">
        <h3 className="text-lg font-bold text-white mb-2">Create Job Card</h3>
        <p className="text-gray-300 text-sm">
          Click here to create a new job card for a customer's vehicle.
        </p>
      </div>
    ),
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-testid="job-cards-filter"]',
    content: (
      <div className="text-left">
        <h3 className="text-lg font-bold text-white mb-2">Filter & Search</h3>
        <p className="text-gray-300 text-sm">
          Filter job cards by status or search by vehicle registration, customer name.
        </p>
      </div>
    ),
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-testid="job-cards-table"]',
    content: (
      <div className="text-left">
        <h3 className="text-lg font-bold text-white mb-2">Job Cards List</h3>
        <p className="text-gray-300 text-sm">
          Click any row to view details. Use quick actions to transition status or generate invoices.
        </p>
      </div>
    ),
    placement: 'top',
    disableBeacon: true,
  },
];

const TOUR_STORAGE_KEY = 'eka_tour_completed';
const TOUR_VERSION = '1.0'; // Increment to show tour again after major updates

interface ProductTourProps {
  children: React.ReactNode;
}

export const ProductTour: React.FC<ProductTourProps> = ({ children }) => {
  const [run, setRun] = useState(false);
  const [steps, setSteps] = useState<Step[]>(TOUR_STEPS);
  const [stepIndex, setStepIndex] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();

  // Check if tour should run
  useEffect(() => {
    const tourData = localStorage.getItem(TOUR_STORAGE_KEY);
    
    if (!tourData) {
      // First time user - start tour after short delay
      const timer = setTimeout(() => {
        if (location.pathname.includes('/dashboard')) {
          setRun(true);
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
    
    try {
      const { version, completed } = JSON.parse(tourData);
      if (version !== TOUR_VERSION && completed) {
        // New version - offer to show tour again
        // For now, just skip - user can click help icon
      }
    } catch {
      // Invalid data, reset
      localStorage.removeItem(TOUR_STORAGE_KEY);
    }
  }, [location.pathname]);

  // Handle route-specific tours
  useEffect(() => {
    if (location.pathname.includes('/chat') && !location.pathname.includes('/chats')) {
      setSteps(CHAT_TOUR_STEPS);
    } else if (location.pathname.includes('/job-cards') && !location.pathname.includes('/job-cards/')) {
      setSteps(JOB_CARDS_TOUR_STEPS);
    } else {
      setSteps(TOUR_STEPS);
    }
    setStepIndex(0);
  }, [location.pathname]);

  const handleJoyrideCallback = useCallback((data: CallBackProps) => {
    const { status, action, index, type } = data;
    
    // Handle step navigation
    if (type === EVENTS.STEP_AFTER || type === EVENTS.TARGET_NOT_FOUND) {
      setStepIndex(index + (action === ACTIONS.PREV ? -1 : 1));
    }
    
    // Handle tour completion
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      setRun(false);
      setStepIndex(0);
      
      // Save completion status
      localStorage.setItem(TOUR_STORAGE_KEY, JSON.stringify({
        version: TOUR_VERSION,
        completed: true,
        completedAt: new Date().toISOString()
      }));
    }
  }, []);

  // Public method to restart tour
  const startTour = useCallback(() => {
    setStepIndex(0);
    setRun(true);
  }, []);

  // Expose startTour globally for help button
  useEffect(() => {
    (window as any).startProductTour = startTour;
    return () => {
      delete (window as any).startProductTour;
    };
  }, [startTour]);

  return (
    <>
      <Joyride
        steps={steps}
        run={run}
        stepIndex={stepIndex}
        continuous
        showProgress
        showSkipButton
        hideCloseButton={false}
        scrollToFirstStep
        spotlightClicks
        disableOverlayClose
        callback={handleJoyrideCallback}
        styles={{
          options: {
            arrowColor: '#1A1A1B',
            backgroundColor: '#1A1A1B',
            overlayColor: 'rgba(0, 0, 0, 0.75)',
            primaryColor: '#da7756',
            textColor: '#FFFFFF',
            spotlightShadow: '0 0 20px rgba(244, 93, 61, 0.5)',
            zIndex: 10000,
          },
          spotlight: {
            borderRadius: 8,
          },
          tooltip: {
            borderRadius: 12,
            padding: 20,
          },
          tooltipContainer: {
            textAlign: 'left',
          },
          tooltipTitle: {
            color: '#FFFFFF',
            fontSize: 18,
            fontWeight: 600,
          },
          tooltipContent: {
            color: '#A0A0A0',
            fontSize: 14,
            padding: '10px 0',
          },
          buttonNext: {
            backgroundColor: '#F45D3D',
            borderRadius: 8,
            color: '#FFFFFF',
            fontSize: 14,
            fontWeight: 500,
            padding: '10px 20px',
          },
          buttonBack: {
            color: '#A0A0A0',
            fontSize: 14,
            marginRight: 10,
          },
          buttonSkip: {
            color: '#666666',
            fontSize: 12,
          },
          buttonClose: {
            color: '#666666',
          },
          beacon: {
            display: 'none', // We use disableBeacon instead
          },
          beaconInner: {
            backgroundColor: '#F45D3D',
          },
          beaconOuter: {
            borderColor: '#F45D3D',
            backgroundColor: 'rgba(244, 93, 61, 0.2)',
          },
        }}
        locale={{
          back: 'Back',
          close: 'Close',
          last: 'Finish',
          next: 'Next',
          skip: 'Skip Tour',
        }}
      />
      {children}
    </>
  );
};

// Help button component to restart tour
export const TourHelpButton: React.FC<{ className?: string }> = ({ className = '' }) => {
  const handleClick = () => {
    if ((window as any).startProductTour) {
      (window as any).startProductTour();
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg transition-colors ${className}`}
      title="Start product tour"
      data-testid="tour-help-btn"
    >
      <HelpCircle className="w-5 h-5" />
    </button>
  );
};

export default ProductTour;
