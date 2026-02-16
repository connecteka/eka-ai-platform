import React from 'react';
import { Routes, Route } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import JobCardsPage from './pages/JobCardsPage';
import InvoicesPage from './pages/InvoicesPage';
import MGFleetPage from './pages/MGFleetPage';
import SettingsPage from './pages/SettingsPage';
import ChatPage from './pages/ChatPage';

/**
 * EkaAppRouter - Claude.ai-style application shell
 * This provides an alternative app experience at /app/*
 */
const EkaAppRouter: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/job-cards" element={<JobCardsPage />} />
        <Route path="/invoices" element={<InvoicesPage />} />
        <Route path="/mg-fleet" element={<MGFleetPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </div>
  );
};

export default EkaAppRouter;
