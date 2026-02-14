import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import AppShell from './components/layout/AppShell';
import EkaAppRoutes from './EkaAppRouter';

// REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
const GOOGLE_CLIENT_ID = '429173688791-h8le2ah2l4elcn1je494hdfqv5558nfi.apps.googleusercontent.com';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import AboutPage from './pages/AboutPage';
import ServicesPage from './pages/ServicesPage';
import BlogPage from './pages/BlogPage';
import ContactPage from './pages/ContactPage';
import LoginPage from './pages/LoginPage';
import ChatPage from './pages/ChatPage';
import ChatsPage from './pages/ChatsPage';
import JobCardsPage from './pages/JobCardsPage';
import JobCardDetailPage from './pages/JobCardDetailPage';
import InvoicesPage from './pages/InvoicesPage';
import MGFleetPage from './pages/MGFleetPage';
import PDIPage from './pages/PDIPage';
import LandingPage from './pages/LandingPage';
import LegalPage from './pages/LegalPage';
import PricingPage from './pages/PricingPage';
import PublicApprovalPage from './pages/PublicApprovalPage';
import SettingsPage from './pages/SettingsPage';
import ProjectsPage from './pages/ProjectsPage';
import ArtifactsPage from './pages/ArtifactsPage';
import AuthCallback from './components/AuthCallback';

// Router wrapper that handles OAuth callback
const AppRouter: React.FC = () => {
  const location = useLocation();
  
  // Check URL fragment (not query params) for session_id - handle synchronously before routing
  // This prevents race conditions by processing the OAuth callback FIRST
  if (location.hash?.includes('session_id=')) {
    return <AuthCallback />;
  }
  
  return (
    <Routes>
      {/* ==================== PUBLIC ROUTES ==================== */}
      {/* Login as default home page */}
      <Route path="/" element={<LoginPage />} />
      <Route path="/login" element={<LoginPage />} />
      
      {/* Marketing & Info Pages */}
      <Route path="/home" element={<HomePage />} />
      <Route path="/landing" element={<LandingPage />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/legal" element={<LegalPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/services" element={<ServicesPage />} />
      <Route path="/blog" element={<BlogPage />} />
      <Route path="/contact" element={<ContactPage />} />
      
      {/* Public Approval Page (no auth required) */}
      <Route path="/public/approval" element={<PublicApprovalPage />} />

      {/* ==================== AUTHENTICATED APP ROUTES ==================== */}
      {/* All routes under AppShell require authentication */}
      <Route element={<AppShell />}>
        {/* Dashboard */}
        <Route path="/app" element={<DashboardPage />} />
        <Route path="/app/dashboard" element={<DashboardPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        
        {/* AI Chat */}
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/chats" element={<ChatsPage />} />
        
        {/* Job Cards */}
        <Route path="/app/job-cards" element={<JobCardsPage />} />
        <Route path="/app/job-cards/:id" element={<JobCardDetailPage />} />
        <Route path="/job-cards" element={<JobCardsPage />} />
        <Route path="/job-cards/:id" element={<JobCardDetailPage />} />
        
        {/* PDI Checklist */}
        <Route path="/app/pdi" element={<PDIPage />} />
        
        {/* Fleet Management */}
        <Route path="/app/fleet" element={<MGFleetPage />} />
        <Route path="/mg-fleet" element={<MGFleetPage />} />
        
        {/* Invoices */}
        <Route path="/app/invoices" element={<InvoicesPage />} />
        <Route path="/invoices" element={<InvoicesPage />} />
        
        {/* Settings */}
        <Route path="/app/settings" element={<SettingsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        
        {/* Other App Pages */}
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/artifacts" element={<ArtifactsPage />} />
      </Route>
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
};

export default App;
