import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
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
import InvoicesPage from './pages/InvoicesPage';
import MGFleetPage from './pages/MGFleetPage';
import LandingPage from './pages/LandingPage';
import LegalPage from './pages/LegalPage';
import PricingPage from './pages/PricingPage';
import PublicApprovalPage from './pages/PublicApprovalPage';
import SettingsPage from './pages/SettingsPage';
import ProjectsPage from './pages/ProjectsPage';
import ArtifactsPage from './pages/ArtifactsPage';
import WorldClockPage from './pages/WorldClockPage';
import ClockDemoPage from './pages/ClockDemoPage';
import ClaudeChatPage from './pages/ClaudeChatPage';
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
        {/* Claude-like Chat (Full Screen, No Layout) */}
        <Route path="/claude-chat" element={<ClaudeChatPage />} />

        {/* Login as default home page */}
        <Route path="/" element={<LoginPage />} />
        
        <Route element={<MainLayout />}>
          {/* Core Pages */}
          <Route path="/home" element={<HomePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/contact" element={<ContactPage />} />

          {/* Auth Pages */}
          <Route path="/login" element={<LoginPage />} />

          {/* Feature Pages - Support both /path and /app/path */}
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/chats" element={<ChatsPage />} />
          <Route path="/job-cards" element={<JobCardsPage />} />
          <Route path="/invoices" element={<InvoicesPage />} />
          <Route path="/mg-fleet" element={<MGFleetPage />} />
          
          {/* /app/* Routes (sidebar navigation) */}
          <Route path="/app" element={<DashboardPage />} />
          <Route path="/app/dashboard" element={<DashboardPage />} />
          <Route path="/app/job-cards" element={<JobCardsPage />} />
          <Route path="/app/pdi" element={<ArtifactsPage />} />
          <Route path="/app/fleet" element={<MGFleetPage />} />
          <Route path="/app/invoices" element={<InvoicesPage />} />
          <Route path="/app/settings" element={<SettingsPage />} />
          <Route path="/app/pricing" element={<PricingPage />} />
          
          {/* Marketing Pages */}
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/legal" element={<LegalPage />} />
          
          {/* Utility Pages */}
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/artifacts" element={<ArtifactsPage />} />
          <Route path="/world-clock" element={<WorldClockPage />} />
          <Route path="/clock-demo" element={<ClockDemoPage />} />
        </Route>
        
        {/* Public Pages (outside MainLayout) */}
        <Route path="/public/approval" element={<PublicApprovalPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
