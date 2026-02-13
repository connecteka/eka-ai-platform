import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

// REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Use ref to prevent double processing in StrictMode
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const processAuth = async () => {
      try {
        // Extract session_id from URL hash
        const hash = window.location.hash;
        const sessionIdMatch = hash.match(/session_id=([^&]+)/);
        
        if (!sessionIdMatch) {
          console.error('No session_id found in URL');
          navigate('/', { replace: true });
          return;
        }

        const sessionId = sessionIdMatch[1];
        
        // Call backend to exchange session_id for user data
        const apiUrl = import.meta.env.VITE_API_URL || '';
        const response = await fetch(`${apiUrl}/api/auth/google/session`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ session_id: sessionId })
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.detail || 'Authentication failed');
        }

        const data = await response.json();
        
        // Store user data in localStorage for quick access
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
        }
        if (data.token) {
          localStorage.setItem('token', data.token);
        }

        // Navigate to dashboard with user data
        navigate('/app/dashboard', { 
          replace: true,
          state: { user: data.user }
        });

      } catch (error) {
        console.error('Auth callback error:', error);
        // Clear URL and redirect to login
        navigate('/', { replace: true });
      }
    };

    processAuth();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#F5F1EB] flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-[#E65C2E] mx-auto mb-4" />
        <h2 className="text-xl font-medium text-[#1A1915]">Signing you in...</h2>
        <p className="text-[#6B6B6B] mt-2">Please wait while we complete authentication</p>
      </div>
    </div>
  );
};

export default AuthCallback;
