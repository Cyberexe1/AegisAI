import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';
import LoanApplication from './pages/LoanApplication';
import ModelHealthPage from './pages/dashboard/ModelHealth';
import RiskTrustPage from './pages/dashboard/RiskTrust';
import GovernancePage from './pages/dashboard/Governance';
import SettingsPage from './pages/dashboard/Settings';
import LLMObservability from './pages/dashboard/LLMObservability';
import UserDashboard from './pages/UserDashboard';
import UserLoanApply from './pages/UserLoanApply';
import { AuthProvider, useAuth } from './context/AuthContext';

// Simple Route Protection Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated } = useAuth();
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    return <>{children}</>;
};

function App() {
    return (
        <Router>
            <AuthProvider>
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />

                    {/* Protected Dashboard Routes */}
                    <Route path="/dashboard" element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    } />
                    <Route path="/dashboard/loan-application" element={
                        <ProtectedRoute>
                            <LoanApplication />
                        </ProtectedRoute>
                    } />
                    <Route path="/dashboard/llm" element={
                        <ProtectedRoute>
                            <LLMObservability />
                        </ProtectedRoute>
                    } />
                    <Route path="/dashboard/health" element={
                        <ProtectedRoute>
                            <ModelHealthPage />
                        </ProtectedRoute>
                    } />
                    <Route path="/dashboard/risk" element={
                        <ProtectedRoute>
                            <RiskTrustPage />
                        </ProtectedRoute>
                    } />
                    <Route path="/dashboard/governance" element={
                        <ProtectedRoute>
                            <GovernancePage />
                        </ProtectedRoute>
                    } />
                    <Route path="/dashboard/settings" element={
                        <ProtectedRoute>
                            <SettingsPage />
                        </ProtectedRoute>
                    } />

                    {/* User Routes */}
                    <Route path="/user-dashboard" element={
                        <ProtectedRoute>
                            <UserDashboard />
                        </ProtectedRoute>
                    } />
                    <Route path="/user-dashboard/apply" element={
                        <ProtectedRoute>
                            <UserLoanApply />
                        </ProtectedRoute>
                    } />

                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </AuthProvider>
        </Router>
    );
}

export default App;
