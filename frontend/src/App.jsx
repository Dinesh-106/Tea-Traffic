import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import OrderDashboard from './pages/OrderDashboard';
import ChefDashboard from './pages/ChefDashboard';
import BillingDashboard from './pages/BillingDashboard';

function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token) return <Navigate to="/" replace />;
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }
  return children;
}

function App() {
  return (
    <div 
      className="min-h-screen flex flex-col font-sans text-gray-900 bg-fixed bg-center bg-cover"
      style={{ backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('/img/logo.png')" }}
    >
      <Navbar />
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6 fade-in h-full flex flex-col">
        <Routes>
          <Route path="/" element={<OrderDashboard />} />
          <Route 
            path="/chef" 
            element={<ProtectedRoute allowedRoles={['Chef']}><ChefDashboard /></ProtectedRoute>} 
          />
          <Route 
            path="/billing" 
            element={<ProtectedRoute allowedRoles={['BillingStaff']}><BillingDashboard /></ProtectedRoute>} 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
