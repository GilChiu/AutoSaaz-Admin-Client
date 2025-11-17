import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Layout from "./components/Layout/Layout";
import "./index.css";

// Lazy load pages for code splitting and faster initial load
const LoginPage = lazy(() => import("./pages/LoginPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const DashboardAnalyticsPage = lazy(() => import("./pages/DashboardAnalyticsPage"));
const UserManagementPage = lazy(() => import("./pages/UserManagementPage"));
const UserDetailPage = lazy(() => import("./pages/UserDetailPage"));
const GarageManagementPage = lazy(() => import("./pages/GarageManagementPage"));
const GarageDetailPage = lazy(() => import("./pages/GarageDetailPage"));
const OrderManagementPage = lazy(() => import("./pages/OrderManagementPage"));
const PaymentsPage = lazy(() => import("./pages/PaymentsPage"));
const PaymentDetailPage = lazy(() => import("./pages/PaymentDetailPage"));
const DisputesPage = lazy(() => import("./pages/DisputesPage"));
const DisputeDetailPage = lazy(() => import("./pages/DisputeDetailPage"));
const SupportUserTicketsPage = lazy(() => import("./pages/SupportUserTicketsPage"));
const SupportGarageTicketsPage = lazy(() => import("./pages/SupportGarageTicketsPage"));
const SupportUserChatPage = lazy(() => import("./pages/SupportUserChatPage"));
const SupportGarageChatPage = lazy(() => import("./pages/SupportGarageChatPage"));
const ContentPushNotificationsPage = lazy(() => import("./pages/ContentPushNotificationsPage"));
const ContentAppBannersPage = lazy(() => import("./pages/ContentAppBannersPage"));
const ContentCMSPoliciesPage = lazy(() => import("./pages/ContentCMSPoliciesPage"));
const ContentServiceSettingsPage = lazy(() => import("./pages/ContentServiceSettingsPage"));
const NotificationsPage = lazy(() => import("./pages/NotificationsPage"));

// Loading component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4"></div>
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
);


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
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to="/dashboard/overview" /> : <LoginPage />} 
        />
        <Route path="/*" element={
          <ProtectedRoute>
            <Layout>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard/overview" />} />
                  <Route path="/dashboard" element={<Navigate to="/dashboard/overview" />} />
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
                  <Route path="/notifications" element={<NotificationsPage />} />
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
              </Suspense>
            </Layout>
          </ProtectedRoute>
        } />
      </Routes>
    </Suspense>
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
