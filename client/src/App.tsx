import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/Layout';

// Pages
import { Dashboard } from './pages/Dashboard';
import { Developers } from './pages/Developers';
import { DeveloperProfile } from './pages/DeveloperProfile';
import { Companies } from './pages/Companies';
import { CompanyProfile } from './pages/CompanyProfile';
import { Jobs } from './pages/Jobs';
import { NetworkExplorer } from './pages/NetworkExplorer';
import { Bookmarks } from './pages/Bookmarks';
import { Login } from './pages/Login';
import { Register } from './pages/Register';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Pages wrapped in main Layout */}
      <Route path="/" element={<Layout><Dashboard /></Layout>} />
      <Route path="/developers" element={<Layout><Developers /></Layout>} />
      <Route path="/developers/:id" element={<Layout><DeveloperProfile /></Layout>} />
      <Route path="/companies" element={<Layout><Companies /></Layout>} />
      <Route path="/companies/:id" element={<Layout><CompanyProfile /></Layout>} />
      <Route path="/jobs" element={<Layout><Jobs /></Layout>} />
      <Route path="/network-explorer" element={<Layout><NetworkExplorer /></Layout>} />

      {/* Protected Pages */}
      <Route 
        path="/bookmarks" 
        element={
          <ProtectedRoute>
            <Layout>
              <Bookmarks />
            </Layout>
          </ProtectedRoute>
        } 
      />

      {/* Auth Pages */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
