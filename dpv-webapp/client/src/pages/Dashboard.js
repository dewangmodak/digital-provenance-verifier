import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';

const Dashboard = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        // Fetching history from the Node.js backend
        const response = await API.get('/verify/my-history');
        
        // Extracting the array of reports based on our backend structure
        const historyData = response.data.data?.history || [];
        setHistory(historyData);
      } catch (err) {
        console.error("Failed to fetch history:", err);
        setError('Failed to load verification history.');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center pt-32">
        <div className="text-2xl font-bold text-gray-500 animate-pulse">Loading your history...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-center border-b pb-6 gap-4">
        <div>
          <h1 className="text-4xl font-black text-gray-900">Verification Registry</h1>
          <p className="text-gray-500 mt-2">Your historical media integrity reports</p>
        </div>
        <Link 
          to="/verify" 
          className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl"
        >
          + New Verification
        </Link>
      </div>

      {error && <div className="p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-lg">{error}</div>}

      {/* Empty State */}
      {history.length === 0 && !error ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-gray-200 shadow-sm">
          <h3 className="text-2xl font-bold text-gray-700">No verifications yet</h3>
          <p className="text-gray-500 mt-2 mb-6">Upload your first image to start building your provenance registry.</p>
        </div>
      ) : (
        /* The History Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {history.map((report) => (
            <div key={report._id} className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-5 border-b pb-3">
                  <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                    {new Date(report.verified_at).toLocaleDateString()}
                  </span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md font-bold">
                    ID: {report._id.substring(0, 6)}
                  </span>
                </div>
                
                <div className="space-y-4">
                  {/* AI Status Block */}
                  <div className={`p-4 rounded-xl ${report.ai_detection.is_ai_generated ? 'bg-red-50 border border-red-100' : 'bg-green-50 border border-green-100'}`}>
                    <p className="text-xs font-extrabold uppercase text-gray-500 mb-1">AI Status</p>
                    <p className={`text-xl font-black tracking-tight ${report.ai_detection.is_ai_generated ? 'text-red-600' : 'text-green-600'}`}>
                      {report.ai_detection.is_ai_generated ? 'AI GENERATED' : 'HUMAN CREATED'}
                    </p>
                    <p className="text-sm mt-1 text-gray-600 font-medium">Confidence: {report.ai_detection.confidence_score}</p>
                  </div>

                  {/* Provenance Match Block */}
                  <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                    <p className="text-xs font-extrabold uppercase text-gray-500 mb-1">Database Match</p>
                    <p className="text-lg font-bold text-blue-700 leading-tight">{report.overall_verdict}</p>
                    <p className="text-sm mt-1 text-gray-600 font-medium">{report.total_matches} matches found</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;