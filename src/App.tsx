import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import HomePage from './pages/HomePage';

const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ServicesPage = lazy(() => import('./pages/ServicesPage'));
const BlogPage = lazy(() => import('./pages/BlogPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const ChatPage = lazy(() => import('./pages/ChatPage'));
const ChatsPage = lazy(() => import('./pages/ChatsPage'));
const JobCardsPage = lazy(() => import('./pages/JobCardsPage'));
const JobCardDetailPage = lazy(() => import('./pages/JobCardDetailPage'));
const InvoicesPage = lazy(() => import('./pages/InvoicesPage'));
const MGFleetPage = lazy(() => import('./pages/MGFleetPage'));
const LandingPage = lazy(() => import('./pages/LandingPage'));
const LegalPage = lazy(() => import('./pages/LegalPage'));
const PricingPage = lazy(() => import('./pages/PricingPage'));
const PublicApprovalPage = lazy(() => import('./pages/PublicApprovalPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const ProjectsPage = lazy(() => import('./pages/ProjectsPage'));
const ArtifactsPage = lazy(() => import('./pages/ArtifactsPage'));
const WorldClockPage = lazy(() => import('./pages/WorldClockPage'));
const ClockDemoPage = lazy(() => import('./pages/ClockDemoPage'));
const ClaudeChatPage = lazy(() => import('./pages/ClaudeChatPage'));
const EkaAppRoutes = lazy(() => import('./EkaAppRouter'));

const Loading = () => (
  <div className="flex h-screen items-center justify-center bg-background">
    <div className="w-12 h-12 rounded-xl bg-brand-orange flex items-center justify-center shadow-lg shadow-brand-orange/20">
      <span className="text-white font-bold text-xl">E</span>
    </div>
  </div>
);

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loading />}>
        <Routes>
          {/* Claude-like Chat (Full Screen, No Layout) */}
          <Route path="/claude-chat" element={<ClaudeChatPage />} />

          <Route element={<MainLayout />}>
            {/* Core Pages */}
            <Route path="/" element={<HomePage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/contact" element={<ContactPage />} />

            {/* Auth Pages */}
            <Route path="/login" element={<LoginPage />} />

            {/* Feature Pages */}
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/chats" element={<ChatsPage />} />
            <Route path="/job-cards" element={<JobCardsPage />} />
            <Route path="/job-cards/:id" element={<JobCardDetailPage />} />
            <Route path="/invoices" element={<InvoicesPage />} />
            <Route path="/mg-fleet" element={<MGFleetPage />} />
            
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
          {/* New EKA Claude.ai-style shell */}
          <Route path="/app/*" element={<EkaAppRoutes />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default App;
