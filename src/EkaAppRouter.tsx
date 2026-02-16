import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AppShell from './components/layout/AppShell';

const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const JobCardsPage = lazy(() => import('./pages/JobCardsPage'));
const JobCardDetailPage = lazy(() => import('./pages/JobCardDetailPage'));
const InvoicesPage = lazy(() => import('./pages/InvoicesPage'));
const MGFleetPage = lazy(() => import('./pages/MGFleetPage'));
const PDIPage = lazy(() => import('./pages/PDIPage'));
const ChatPage = lazy(() => import('./pages/ChatPage'));
const ChatsPage = lazy(() => import('./pages/ChatsPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));

const PageLoader = () => (
  <div className="flex h-full items-center justify-center p-8">
    <div className="flex flex-col items-center gap-3">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-orange border-t-transparent" />
      <p className="text-sm text-text-muted">Loading...</p>
    </div>
  </div>
);

const EkaAppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route
          index
          element={<Navigate to="dashboard" replace />}
        />
        <Route
          path="dashboard"
          element={
            <Suspense fallback={<PageLoader />}>
              <DashboardPage />
            </Suspense>
          }
        />
        <Route
          path="job-cards"
          element={
            <Suspense fallback={<PageLoader />}>
              <JobCardsPage />
            </Suspense>
          }
        />
        <Route
          path="job-cards/:id"
          element={
            <Suspense fallback={<PageLoader />}>
              <JobCardDetailPage />
            </Suspense>
          }
        />
        <Route
          path="invoices"
          element={
            <Suspense fallback={<PageLoader />}>
              <InvoicesPage />
            </Suspense>
          }
        />
        <Route
          path="fleet"
          element={
            <Suspense fallback={<PageLoader />}>
              <MGFleetPage />
            </Suspense>
          }
        />
        <Route
          path="pdi"
          element={
            <Suspense fallback={<PageLoader />}>
              <PDIPage />
            </Suspense>
          }
        />
        <Route
          path="chat"
          element={
            <Suspense fallback={<PageLoader />}>
              <ChatPage />
            </Suspense>
          }
        />
        <Route
          path="chats"
          element={
            <Suspense fallback={<PageLoader />}>
              <ChatsPage />
            </Suspense>
          }
        />
        <Route
          path="settings"
          element={
            <Suspense fallback={<PageLoader />}>
              <SettingsPage />
            </Suspense>
          }
        />
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Route>
    </Routes>
  );
};

export default EkaAppRoutes;
