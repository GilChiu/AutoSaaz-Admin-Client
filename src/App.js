import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Layout from "./components/Layout/Layout";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import DashboardAnalyticsPage from "./pages/DashboardAnalyticsPage";
import UserDetailPage from "./pages/UserDetailPage";
import GarageDetailPage from "./pages/GarageDetailPage";
import UserManagementPage from "./pages/UserManagementPage";
import GarageManagementPage from "./pages/GarageManagementPage";
import OrderManagementPage from "./pages/OrderManagementPage";
import "./index.css";
import PaymentsPage from "./pages/PaymentsPage";
import PaymentDetailPage from "./pages/PaymentDetailPage";
import DisputesPage from "./pages/DisputesPage";
import DisputeDetailPage from "./pages/DisputeDetailPage";
import SupportUserTicketsPage from "./pages/SupportUserTicketsPage";
import SupportGarageTicketsPage from "./pages/SupportGarageTicketsPage";
import SupportUserChatPage from "./pages/SupportUserChatPage";
import SupportGarageChatPage from "./pages/SupportGarageChatPage";
import ContentPushNotificationsPage from "./pages/ContentPushNotificationsPage";
import ContentAppBannersPage from "./pages/ContentAppBannersPage";
import ContentCMSPoliciesPage from "./pages/ContentCMSPoliciesPage";
import ContentServiceSettingsPage from "./pages/ContentServiceSettingsPage";


const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const AppContent = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route 
        path="/login" 
        element={isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage />} 
      />
      <Route path="/*" element={
        <ProtectedRoute>
          <Layout>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/dashboard/overview" element={<DashboardPage />} />
              <Route path="/dashboard/analytics" element={<DashboardAnalyticsPage />} />
              <Route path="/users" element={<UserManagementPage />} />
              <Route path="/users/:id" element={<UserDetailPage />} />
              <Route path="/garages" element={<GarageManagementPage />} />
              <Route path="/garages/:id" element={<GarageDetailPage />} />
              <Route path="/orders" element={<Navigate to="/orders/pending" />} />
              <Route path="/orders/:status" element={<OrderManagementPage />} />
              <Route path="/payments" element={<PaymentsPage />} />
              <Route path="/payments/:id" element={<PaymentDetailPage />} />
              <Route path="/disputes" element={<DisputesPage />} />
              <Route path="/disputes/:id" element={<DisputeDetailPage />} />
              <Route path="/support" element={<Navigate to="/support/users" />} />
              <Route path="/support/users" element={<SupportUserTicketsPage />} />
              <Route path="/support/users/:id" element={<SupportUserChatPage />} />
              <Route path="/support/garages" element={<SupportGarageTicketsPage />} />
              <Route path="/support/garages/:id" element={<SupportGarageChatPage />} />
              <Route path="/content" element={<Navigate to="/content/push" />} />
              <Route path="/content/push" element={<ContentPushNotificationsPage />} />
              <Route path="/content/banners" element={<ContentAppBannersPage />} />
              <Route path="/content/cms" element={<ContentCMSPoliciesPage />} />
              <Route path="/content/service-settings" element={<ContentServiceSettingsPage />} />
            </Routes>
          </Layout>
        </ProtectedRoute>
      } />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <AppContent />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
