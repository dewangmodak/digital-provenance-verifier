import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Verify from './pages/Verify';
import Dashboard from './pages/Dashboard';
import RegisterMedia from './pages/RegisterMedia';

// Import Components
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar'; // 👈 Our new dynamic Navbar!

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        
        {/* The Smart Navbar */}
        <Navbar />

        {/* Main Routing Area */}
        <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes (Require Login) */}
            <Route path="/verify" element={
              <PrivateRoute>
                <Verify />
              </PrivateRoute>
            } />

            <Route path="/register-media" element={
              <PrivateRoute>
                <RegisterMedia />
              </PrivateRoute>
            } />

            <Route path="/dashboard" element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } />

            {/* Default Redirect */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;