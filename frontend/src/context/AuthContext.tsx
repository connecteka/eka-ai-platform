import React, { createContext, useContext, useEffect, useState } from 'react';

// Custom User type for our backend auth
interface CustomUser {
  user_id: string;
  email: string;
  name: string;
  workshop_name?: string | null;
  role?: string;
  auth_provider?: string;
  created_at?: string;
  updated_at?: string;
}

interface AuthContextType {
  session: string | null;
  user: CustomUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<string | null>(null);
  const [user, setUser] = useState<CustomUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing auth in localStorage or via /api/auth/me
    const checkAuth = async () => {
      try {
        // First check localStorage
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        if (storedToken && storedUser) {
          setSession(storedToken);
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
          setSession('cookie_session');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
    
    // Listen for storage changes (cross-tab sync)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token' || e.key === 'user') {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        if (token && storedUser) {
          setSession(token);
          setUser(JSON.parse(storedUser));
        } else {
          setSession(null);
          setUser(null);
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const signOut = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      await fetch(`${apiUrl}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Logout API error:', error);
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setSession(null);
    setUser(null);
  };

  const value = {
    session,
    user,
    loading,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
