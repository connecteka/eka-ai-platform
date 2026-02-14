import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import EkaAppShell  from './components/layout/EkaAppShell';
import EkaChatPage       from './pages/EkaChatPage';
import EkaDashboardPage  from './pages/EkaDashboardPage';
import EkaSearchPage     from './pages/EkaSearchPage';
import JobCardsPage  from './pages/JobCardsPage';
import InvoicesPage  from './pages/InvoicesPage';
import MGFleetPage   from './pages/MGFleetPage';
import ChatsPage     from './pages/ChatsPage';
import SettingsPage  from './pages/SettingsPage';

const EkaAppRoutes: React.FC = () => (
  <Routes>
    <Route element={<EkaAppShell />}>
      {/* Default to Chat (Dashboard is PRO) */}
      <Route index                element={<Navigate to="chat" replace />} />
      <Route path="dashboard"     element={<EkaDashboardPage />} />
      <Route path="chat"          element={<EkaChatPage />}      />
      <Route path="search"        element={<EkaSearchPage />}    />
      <Route path="chats"         element={<ChatsPage />}        />
      <Route path="job-cards/*"   element={<JobCardsPage />}     />
      <Route path="invoices"      element={<InvoicesPage />}     />
      <Route path="mg-fleet"      element={<MGFleetPage />}      />
      <Route path="settings"      element={<SettingsPage />}     />
    </Route>
  </Routes>
);

export default EkaAppRoutes;
