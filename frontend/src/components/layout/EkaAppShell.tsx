import React, { useState, createContext, useContext } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useLocalUser } from '../../hooks/useLocalUser';
import EkaSidebar from './EkaSidebar';
import EkaTopBar  from './EkaTopBar';
import type { IntelligenceMode } from '../../types';

/* Shell context — child pages read intelligenceMode via useOutletContext */
interface ShellCtx {
  intelligenceMode: IntelligenceMode;
  setIntelligenceMode: (m: IntelligenceMode) => void;
  sidebarCollapsed: boolean;
}
export const ShellContext = createContext<ShellCtx>({
  intelligenceMode: 'FAST',
  setIntelligenceMode: () => {},
  sidebarCollapsed: false,
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

  React.useEffect(() => {
    if (!loading && !user) navigate('/login');
  }, [user, loading, navigate]);

  if (loading) return <Loader />;
  if (!user)   return null;

  return (
    <ShellContext.Provider value={{ intelligenceMode: mode, setIntelligenceMode: setMode, sidebarCollapsed: collapsed }}>
      <div className="flex h-screen overflow-hidden bg-white" data-testid="eka-app-shell">
        {/* Dark sidebar */}
        <EkaSidebar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
        
        {/* White content area */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden bg-white">
          <EkaTopBar intelligenceMode={mode} onModeChange={setMode} />
          <main className="flex-1 overflow-y-auto bg-[#FAFAFA]">
            <Outlet context={{ intelligenceMode: mode, setIntelligenceMode: setMode }} />
          </main>
        </div>
      </div>
    </ShellContext.Provider>
  );
};

export default EkaAppShell;
