import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
// 1. IMPORT YOUR AUTH PROVIDER
import { AuthProvider } from './context/AuthContext'; 

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* 2. WRAP YOUR APP IN THE PROVIDER */}
    <AuthProvider> 
      <App />
    </AuthProvider>
  </React.StrictMode>
);