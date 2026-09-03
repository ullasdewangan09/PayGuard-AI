import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { AuthCallbackPage } from './pages/AuthCallbackPage';
import { AppLayout } from './components/layout/AppLayout';
import { Dashboard } from './pages/Dashboard';
import { IntentsPage } from './pages/IntentsPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { AttackLabPage } from './pages/AttackLabPage';
import { AuditPage } from './pages/AuditPage';
import { AiIntentPage } from './pages/AiIntentPage';
import { PaymentsPage } from './pages/PaymentsPage';
import { ReceiptsPage } from './pages/ReceiptsPage';
import { SecurityCenterPage } from './pages/SecurityCenterPage';
import { EvaluationPage } from './pages/EvaluationPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { SettingsPage } from './pages/SettingsPage';
import { ProfilePage } from './pages/ProfilePage';
import { SecuritySettingsPage } from './pages/SecuritySettingsPage';

import { AuthProvider, useAuth } from './context/AuthContext';
import { BeamLoader } from './components/ui/beam-components';

/**
 * Protected route component that redirects unauthenticated users to login
 */
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <BeamLoader message="Authenticating..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

/**
 * Main app routes component (wrapped by AuthProvider)
 */
const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />
      
      {/* Protected routes */}
      <Route 
        path="/app" 
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        
        {/* Control */}
        <Route path="ai-intent" element={<AiIntentPage />} />
        <Route path="intents" element={<IntentsPage />} />
        <Route path="transactions" element={<TransactionsPage />} />
        <Route path="payments" element={<PaymentsPage />} />
        <Route path="receipts" element={<ReceiptsPage />} />

        {/* Security */}
        <Route path="security" element={<SecurityCenterPage />} />
        <Route path="attack-lab" element={<AttackLabPage />} />
        <Route path="evaluation" element={<EvaluationPage />} />
        <Route path="audit" element={<AuditPage />} />

        {/* System & Profile */}
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="profile/security" element={<SecuritySettingsPage />} />
      </Route>

      {/* Fallback redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

/**
 * App component with authentication provider wrapper
 */
export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
};

export default App;
