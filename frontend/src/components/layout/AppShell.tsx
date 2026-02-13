import React, { useState, createContext, useContext } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { IntelligenceMode } from '../../types';

// Context for sharing state across the app shell
interface AppShellContextType {
  intelligenceMode: IntelligenceMode;
  setIntelligenceMode: (mode: IntelligenceMode) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

const AppShellContext = createContext<AppShellContextType | undefined>(undefined);

export const useAppShell = () => {
  const context = useContext(AppShellContext);
  if (!context) {
    throw new Error('useAppShell must be used within AppShell');
  }
  return context;
};

// Loading screen component
const LoadingScreen: React.FC = () => (
  <div className="flex h-screen bg-background items-center justify-center">
    <div className="text-center">
      <div className="w-12 h-12 bg-brand-orange rounded-xl flex items-center justify-center mx-auto mb-4 animate-pulse">
        <span className="text-xl font-bold text-white">E</span>
      </div>
      <p className="text-text-secondary text-sm">Loading EKA-AI...</p>
    </div>
  </div>
);

const AppShell: React.FC = () => {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [intelligenceMode, setIntelligenceMode] = useState<IntelligenceMode>('FAST');
  const [loading, setLoading] = useState(false);

  // Check for user in localStorage (simple auth check)
  const user = React.useMemo(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }, []);

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!loading && !user) {
      navigate('/', { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading) return <LoadingScreen />;
  if (!user) return null;

  const contextValue: AppShellContextType = {
    intelligenceMode,
    setIntelligenceMode,
    sidebarCollapsed,
    setSidebarCollapsed,
  };

  return (
    <AppShellContext.Provider value={contextValue}>
      <div className="flex h-screen bg-background overflow-hidden">
        {/* Sidebar */}
        <Sidebar 
          collapsed={sidebarCollapsed} 
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
        />
        
        {/* Main Content Area */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Top Bar */}
          <TopBar 
            intelligenceMode={intelligenceMode} 
            onModeChange={setIntelligenceMode} 
          />
          
          {/* Page Content */}
          <main className="flex-1 overflow-y-auto">
            <Outlet context={{ intelligenceMode, setIntelligenceMode }} />
          </main>
        </div>
      </div>
    </AppShellContext.Provider>
  );
};

export default AppShell;
