import { useState, useEffect, useCallback } from 'react';

export interface EkaUser {
  user_id: string;
  email: string;
  name: string;
  workshop_name?: string;
  role?: string;
}

interface UseLocalUserReturn {
  user: EkaUser | null;
  loading: boolean;
  signOut: () => void;
}

export const useLocalUser = (): UseLocalUserReturn => {
  const [user, setUser] = useState<EkaUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        
        if (token && userStr) {
          const parsedUser = JSON.parse(userStr) as EkaUser;
          setUser(parsedUser);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('[useLocalUser] Error parsing user:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Listen for storage changes (for multi-tab sync)
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'user' || e.key === 'token') {
        checkAuth();
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/login';
  }, []);

  return { user, loading, signOut };
};

export default useLocalUser;
