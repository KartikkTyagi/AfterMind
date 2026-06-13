import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { EstateProvider } from './context/EstateContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import SetupChat from './pages/SetupChat';
import TimeCapsules from './pages/TimeCapsules';
import TrustedContacts from './pages/TrustedContacts';
import FamilyPortal from './pages/FamilyPortal';
import ExecutionStatus from './pages/ExecutionStatus';

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 warm-bg paper-texture text-muted-rose font-sans">
        <svg className="animate-spin h-6 w-6 text-amber mb-2" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span>Securing connection...</span>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <EstateProvider>
          <div className="min-h-screen flex flex-col bg-[#0d0a07] relative overflow-hidden font-sans text-[#E8D5B7]">
            {/* Persistent background mesh and noise overlays */}
            <div className="noise-overlay" />
            <div className="mesh-blob-1" />
            <div className="mesh-blob-2" />

            {/* Top Navigation */}
            <Navbar />
            
            {/* Main Content Viewport */}
            <main className="flex-grow flex flex-col relative bg-transparent z-10">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                
                {/* Family Portal Routes (unsecured by login, secured by access code inside component) */}
                <Route path="/family-portal" element={<FamilyPortal />} />
                <Route path="/family-portal/home" element={<FamilyPortal />} />
                <Route path="/family-portal/guide" element={<FamilyPortal />} />

                {/* Owner Protected Routes */}
                <Route path="/onboarding" element={
                  <ProtectedRoute>
                    <Onboarding />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/setup" element={
                  <ProtectedRoute>
                    <SetupChat />
                  </ProtectedRoute>
                } />
                <Route path="/capsules" element={
                  <ProtectedRoute>
                    <TimeCapsules />
                  </ProtectedRoute>
                } />
                <Route path="/contacts" element={
                  <ProtectedRoute>
                    <TrustedContacts />
                  </ProtectedRoute>
                } />
                <Route path="/execution-status" element={
                  <ProtectedRoute>
                    <ExecutionStatus />
                  </ProtectedRoute>
                } />

                {/* Fallback Redirect */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>

            {/* Bottom Footer */}
            <Footer />
          </div>
        </EstateProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
