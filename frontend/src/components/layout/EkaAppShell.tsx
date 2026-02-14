import React, { useState, createContext, useContext, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
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

/* Custom User type */
interface EkaUser {
  user_id: string;
  email: string;
  name: string;
}

/* Fullscreen loading state while auth resolves */
const Loader: React.FC = () => (
  <div className="flex h-screen items-center justify-center bg-background">
    <div className="relative">
      <div className="w-12 h-12 rounded-xl bg-brand-orange flex items-center justify-center shadow-lg shadow-brand-orange/20">
        <span className="text-white font-bold text-xl font-heading">E</span>
      </div>
      <div className="absolute inset-0 rounded-xl border-2 border-brand-orange animate-ping opacity-20" />
    </div>
  </div>
);

const EkaAppShell: React.FC = () => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mode, setMode] = useState<IntelligenceMode>('FAST');
  const [user, setUser] = useState<EkaUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Direct auth check - bypasses the need for AuthProvider context
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // First check localStorage
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        if (storedToken && storedUser) {
          setUser(JSON.parse(storedUser));
          setLoading(false);
          return;
        }
        
        // Try to get session from backend via cookies
        const apiUrl = import.meta.env.VITE_API_URL || '';
        const response = await fetch(`${apiUrl}/api/auth/me`, {
          credentials: 'include'
        });
        
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          setLoading(false);
          return;
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      }
      
      // No valid auth found, redirect to login
      setLoading(false);
      navigate('/login');
    };
    
    checkAuth();
  }, [navigate]);

  if (loading) return <Loader />;
  if (!user) return null;

  return (
    <ShellContext.Provider value={{ intelligenceMode: mode, setIntelligenceMode: setMode, sidebarCollapsed: collapsed }}>
      <div className="flex h-screen overflow-hidden bg-background">
        <EkaSidebar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <EkaTopBar intelligenceMode={mode} onModeChange={setMode} />
          <main className="flex-1 overflow-y-auto">
            <Outlet context={{ intelligenceMode: mode, setIntelligenceMode: setMode }} />
          </main>
        </div>
      </div>
    </ShellContext.Provider>
  );
};

export default EkaAppShell;
