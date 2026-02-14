import React, { useState, createContext, useContext } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useLocalUser } from '../../hooks/useLocalUser';
import EkaSidebar from './EkaSidebar';
import EkaTopBar  from './EkaTopBar';
import type { IntelligenceMode } from '../../types';

/* Shell context — child pages read intelligenceMode via useOutletContext */
interface ShellCtx {
  intelligenceMode: IntelligenceMode;
  setIntelligenceMode: (m: IntelligenceMode) => void;
  sidebarCollapsed: boolean;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}
export const ShellContext = createContext<ShellCtx>({
  intelligenceMode: 'FAST',
  setIntelligenceMode: () => {},
  sidebarCollapsed: false,
  mobileMenuOpen: false,
  setMobileMenuOpen: () => {},
});
export const useShell = () => useContext(ShellContext);

/* Fullscreen loading state while auth resolves */
const Loader: React.FC = () => (
  <div className="flex h-screen items-center justify-center bg-white">
    <div className="relative">
      <img 
        src="https://customer-assets.emergentagent.com/job_c888b364-381d-411f-9fb8-91dd9dd39bee/artifacts/0nsgjm67_MASCOT.jpg"
        alt="eka-ai"
        className="w-12 h-12 object-cover"
        style={{ borderRadius: '8px' }}
      />
      <div className="absolute inset-0 rounded-lg border-2 border-[#F98906] animate-ping opacity-20" />
    </div>
  </div>
);

const EkaAppShell: React.FC = () => {
  const { user, loading } = useLocalUser();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mode, setMode] = useState<IntelligenceMode>('FAST');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  React.useEffect(() => {
    if (!loading && !user) navigate('/login');
  }, [user, loading, navigate]);

  if (loading) return <Loader />;
  if (!user)   return null;

  return (
    <ShellContext.Provider value={{ 
      intelligenceMode: mode, 
      setIntelligenceMode: setMode, 
      sidebarCollapsed: collapsed,
      mobileMenuOpen,
      setMobileMenuOpen
    }}>
      <div className="flex h-screen overflow-hidden bg-white" data-testid="eka-app-shell">
        {/* Desktop sidebar - hidden on mobile */}
        <div className="hidden md:block">
          <EkaSidebar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
        </div>
        
        {/* Mobile sidebar overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            {/* Sidebar */}
            <div className="absolute left-0 top-0 bottom-0 w-[280px] animate-slide-in">
              <EkaSidebar collapsed={false} onToggle={() => setMobileMenuOpen(false)} />
            </div>
            {/* Close button */}
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        )}
        
        {/* White content area */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden bg-white">
          <EkaTopBar 
            intelligenceMode={mode} 
            onModeChange={setMode}
          />
          <main className="flex-1 overflow-y-auto bg-[#FAFAFA]">
            <Outlet context={{ intelligenceMode: mode, setIntelligenceMode: setMode }} />
          </main>
        </div>
      </div>
      
      {/* Mobile menu animation */}
      <style>{`
        @keyframes slide-in {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in {
          animation: slide-in 0.2s ease-out;
        }
      `}</style>
    </ShellContext.Provider>
  );
};

export default EkaAppShell;
