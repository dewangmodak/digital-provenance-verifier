import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';

const Dashboard = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await API.get('/verify/my-history');
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

  // 🗑️ NEW: Handle deleting a report
  const handleDelete = async (e, reportId) => {
    e.stopPropagation(); // Prevents the modal from opening
    if (!window.confirm("Are you sure you want to delete this report from your registry?")) return;
    
    try {
      await API.delete(`/verify/${reportId}`);
      // Remove it from the screen instantly without refreshing the page!
      setHistory(history.filter(report => report._id !== reportId));
    } catch (err) {
      console.error("Failed to delete:", err);
      alert("Failed to delete report. Please try again.");
    }
  };

  const getQueryImage = (report) => {
    if (!report) return "";
    if (report.file_url) return report.file_url;
    if (report.matches && report.matches.length > 0) return report.matches[0].storage_url;
    if (report.similarity_details && report.similarity_details.length > 0) return report.similarity_details[0].storage_url;
    return "";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center pt-32">
        <div className="text-2xl font-bold text-gray-500 animate-pulse">Loading your history...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in relative">
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

      {/* History Grid */}
      {history.length === 0 && !error ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-gray-200 shadow-sm">
          <h3 className="text-2xl font-bold text-gray-700">No verifications yet</h3>
          <p className="text-gray-500 mt-2 mb-6">Upload your first image to start building your provenance registry.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {history.map((report) => (
            <div key={report._id} className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
              <div>
                {/* 💡 UPDATED: Header with Trash Can */}
                <div className="flex justify-between items-center mb-5 border-b pb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                      {new Date(report.verified_at).toLocaleDateString()}
                    </span>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md font-bold">
                      ID: {report._id.substring(0, 6)}
                    </span>
                  </div>
                  
                  <button 
                    onClick={(e) => handleDelete(e, report._id)}
                    className="text-gray-300 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-md transition-colors"
                    title="Delete Report"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
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

                  {/* CLICKABLE Provenance Match Block */}
                  <div 
                    onClick={() => setSelectedReport(report)}
                    className="p-4 bg-blue-50 border border-blue-100 rounded-xl cursor-pointer hover:bg-blue-100 transition-all group"
                  >
                    <div className="flex justify-between items-start">
                        <p className="text-xs font-extrabold uppercase text-gray-500 mb-1">Database Match</p>
                        <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">VIEW EVIDENCE</span>
                    </div>
                    <p className="text-lg font-bold text-blue-700 leading-tight">{report.overall_verdict}</p>
                    <p className="text-sm mt-1 text-gray-600 font-medium">{report.total_matches} matches found</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* THE EVIDENCE MODAL */}
      {selectedReport && (
        <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-5xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-scale-up">
            
            <div className="p-6 border-b flex justify-between items-center bg-gray-50">
              <div>
                <h2 className="text-2xl font-black text-gray-900">Provenance Evidence</h2>
                <p className="text-sm text-gray-500">Comparing query image against secure registry</p>
              </div>
              <button 
                onClick={() => setSelectedReport(null)}
                className="w-10 h-10 flex items-center justify-center bg-white border rounded-full text-gray-400 hover:text-black hover:shadow-md transition-all text-2xl"
              >
                &times;
              </button>
            </div>

            <div className="p-8 overflow-y-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-blue-600 uppercase tracking-widest bg-blue-50 w-fit px-3 py-1 rounded">Query Image</h3>
                  <div className="aspect-video bg-gray-100 rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden shadow-inner">
                    <img 
                      src={getQueryImage(selectedReport)} 
                      alt="Verified Query" 
                      className="w-full h-full object-contain"
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/400x300?text=Image+Unavailable'; }}
                    />
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl border">
                    <p className="text-xs text-gray-400 font-mono break-all">
                      Source: {selectedReport.file_url || "Local Database Upload"}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-black text-purple-600 uppercase tracking-widest bg-purple-50 w-fit px-3 py-1 rounded">Top Registry Matches</h3>
                  
                  <div className="space-y-3">
                    {((selectedReport.similarity_details && selectedReport.similarity_details.length > 0) || 
                      (selectedReport.matches && selectedReport.matches.length > 0)) ? (
                      
                      (selectedReport.similarity_details?.length > 0 ? selectedReport.similarity_details : selectedReport.matches).map((match, idx) => (
                        <div key={idx} className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:border-blue-300 transition-all">
                          <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden border">
                             <img 
                                src={match.storage_url} 
                                alt="Match" 
                                className="w-full h-full object-cover"
                                onError={(e) => { e.target.src = 'https://via.placeholder.com/100?text=Missing'; }}
                             />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-black text-gray-900 truncate">{match.filename || "Registry Item"}</p>
                            <div className="flex items-center gap-2 mt-1">
                                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-blue-600 rounded-full" 
                                        style={{ width: `${match.score || match.similarity_score}%` }}
                                    ></div>
                                </div>
                                <span className="text-xs font-bold text-blue-600">{match.score || match.similarity_score}%</span>
                            </div>
                            <p className="text-[10px] text-gray-400 mt-2 font-mono truncate">ID: {match.media_id || match._id || 'N/A'}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-10 text-center bg-gray-50 rounded-2xl border-2 border-dotted border-gray-200">
                        <p className="text-gray-400 font-medium italic">No detailed match data found for this record.</p>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>

            <div className="p-6 bg-gray-50 border-t flex justify-end">
                <button 
                    onClick={() => setSelectedReport(null)}
                    className="px-8 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-all"
                >
                    Close Evidence
                </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;