import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [stats, setStats] = useState({ totalUsers: 0, totalVerifications: 0, aiGenerated: 0 });
  const [globalHistory, setGlobalHistory] = useState([]);
  const [usersList, setUsersList] = useState([]); 
  const [activeTab, setActiveTab] = useState('ledger'); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/dashboard');
      return;
    }

    const fetchAdminData = async () => {
      try {
        const [statsRes, historyRes, usersRes] = await Promise.all([
          API.get('/admin/stats'),
          API.get('/admin/history'),
          API.get('/admin/users')
        ]);
        
        const historyData = historyRes.data.data.history || [];
        setGlobalHistory(historyData);
        setUsersList(usersRes.data.data.users || []);

        // Safely calculate stats even if some records are missing detection data
        const aiCount = historyData.filter(r => r.ai_detection?.is_ai_generated).length;
        setStats({
          ...statsRes.data.data,
          aiGenerated: aiCount
        });

      } catch (err) {
        console.error("Admin fetch error:", err);
        setError("Failed to load admin data. Ensure you have admin privileges.");
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchAdminData();
  }, [user, navigate]);

  const handleDeleteUser = async (userId, userEmail) => {
    if (!window.confirm(`🚨 WARNING: Are you sure you want to permanently delete ${userEmail}? This cannot be undone!`)) return;
    
    try {
      await API.delete(`/admin/users/${userId}`);
      setUsersList(usersList.filter(u => u.id !== userId));
      setStats(prev => ({ ...prev, totalUsers: prev.totalUsers - 1 }));
      alert(`${userEmail} has been successfully deleted.`);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete user.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center pt-32">
        <div className="text-2xl font-bold text-gray-500 animate-pulse">Initializing Command Center...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in relative px-4">
      {/* Header */}
      <div className="border-b-4 border-gray-900 pb-6 mb-8">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Admin Command Center</h1>
        <p className="text-gray-500 mt-2 font-mono">Global Platform Analytics & User Management</p>
      </div>

      {error && <div className="p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-lg">{error}</div>}

      {/* 📊 Top Analytics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-gray-900 text-white p-6 rounded-2xl shadow-lg border border-gray-800">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Total Registered Users</p>
          <p className="text-5xl font-black">{stats.totalUsers}</p>
        </div>
        <div className="bg-blue-600 text-white p-6 rounded-2xl shadow-lg border border-blue-500">
          <p className="text-xs font-bold text-blue-200 uppercase tracking-widest mb-2">Total Scans Performed</p>
          <p className="text-5xl font-black">{stats.totalVerifications}</p>
        </div>
        <div className="bg-red-500 text-white p-6 rounded-2xl shadow-lg border border-red-400">
          <p className="text-xs font-bold text-red-200 uppercase tracking-widest mb-2">Deepfakes Flagged</p>
          <p className="text-5xl font-black">{stats.aiGenerated}</p>
        </div>
      </div>

      {/* 🗂️ TABS */}
      <div className="flex space-x-4 border-b border-gray-200 mb-6">
        <button 
          onClick={() => setActiveTab('ledger')}
          className={`pb-3 px-4 font-bold text-lg transition-colors ${activeTab === 'ledger' ? 'border-b-4 border-blue-600 text-blue-600' : 'text-gray-400 hover:text-gray-700'}`}
        >
          🌍 Global Ledger
        </button>
        <button 
          onClick={() => setActiveTab('users')}
          className={`pb-3 px-4 font-bold text-lg transition-colors ${activeTab === 'users' ? 'border-b-4 border-gray-900 text-gray-900' : 'text-gray-400 hover:text-gray-700'}`}
        >
          👥 User Management
        </button>
      </div>

      {/* 🌍 TAB CONTENT: Global Ledger */}
      {activeTab === 'ledger' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden animate-fade-in">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-bold">
                <th className="p-4">Date</th>
                <th className="p-4">User ID</th>
                <th className="p-4">Report ID</th>
                <th className="p-4">AI Status</th>
                <th className="p-4">Provenance Match</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {globalHistory.map((report) => (
                <tr key={report._id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 text-sm text-gray-600 font-medium">{new Date(report.verified_at).toLocaleDateString()}</td>
                  <td className="p-4 text-sm font-mono text-blue-600 font-bold">User #{report.user_id}</td>
                  <td className="p-4 text-sm font-mono text-gray-400">{report._id.substring(0, 8)}...</td>
                  <td className="p-4">
                    {/* 🛡️ FIXED SAFETY: Check if ai_detection exists before rendering */}
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${
                      report.ai_detection?.is_ai_generated ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {report.ai_detection ? (report.ai_detection.is_ai_generated ? 'AI Generated' : 'Human') : 'Unknown'}
                    </span>
                  </td>
                  <td className="p-4 text-sm font-bold text-gray-800">{report.overall_verdict}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 👥 TAB CONTENT: User Management */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden animate-fade-in">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-bold">
                <th className="p-4">ID</th>
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {usersList.map((usr) => (
                <tr key={usr.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 text-sm font-mono text-gray-400">#{usr.id}</td>
                  <td className="p-4 text-sm font-bold text-gray-900 capitalize">{usr.email.split('@')[0]}</td>
                  <td className="p-4 text-sm text-gray-600">{usr.email}</td>
                  <td className="p-4 text-sm">
                    <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase ${usr.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                      {usr.role}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {usr.id !== user.id ? (
                      <button 
                        onClick={() => handleDeleteUser(usr.id, usr.email)}
                        className="bg-red-50 text-red-600 hover:bg-red-600 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                      >
                        Delete User
                      </button>
                    ) : (
                      <span className="text-xs font-bold text-gray-400 italic">Current User</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;