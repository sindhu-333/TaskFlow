import React from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import './index.css';

const AppContent = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p style={{ color: 'var(--text-3)', fontSize: '0.9rem' }}>Loading TaskFlow...</p>
      </div>
    );
  }

  return user ? <Dashboard /> : <AuthPage />;
};

const App = () => (
  <AuthProvider>
    <AppContent />
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: {
          borderRadius: '10px',
          fontFamily: 'Inter, sans-serif',
          fontSize: '0.88rem',
          boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
        },
        success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
        error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
      }}
    />
  </AuthProvider>
);

export default App;
