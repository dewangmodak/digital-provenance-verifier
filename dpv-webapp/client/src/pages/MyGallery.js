import React, { useState, useEffect } from 'react';
import API from '../services/api';

const MyGallery = () => {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMyMedia = async () => {
      try {
        const response = await API.get('/media/my-media');
        // The backend sends { success: true, count: X, data: [...] }
        setMedia(response.data.data || []);
      } catch (err) {
        console.error("Gallery Error:", err);
        setError('Failed to load your gallery. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchMyMedia();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center pt-20">
        <div className="text-xl font-bold text-blue-600 animate-pulse">Loading your vault...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pt-10 px-4 sm:px-6 lg:px-8">
      <div className="mb-10 border-b border-gray-200 pb-5">
        <h1 className="text-4xl font-black text-gray-900">My Registered Art</h1>
        <p className="text-gray-500 mt-2">
          Your secure digital provenance vault. All items here are cryptographically hashed and locked in the MySQL ledger.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Empty State */}
      {media.length === 0 && !error && (
        <div className="text-center py-20 bg-gray-50 rounded-3xl border border-gray-200">
          <p className="text-gray-500 text-lg">Your gallery is currently empty.</p>
          <p className="text-sm text-gray-400 mt-2">Go to "Register Art" to secure your first piece!</p>
        </div>
      )}

      {/* The Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {media.map((item) => (
          <div key={item.id} className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            {/* Image Preview */}
            <div className="h-64 bg-gray-100 overflow-hidden flex items-center justify-center">
              <img 
                src={item.storage_url} 
                alt={item.original_filename} 
                className="w-full h-full object-cover"
                onError={(e) => { e.target.src = 'https://via.placeholder.com/400?text=Image+Not+Found'; }}
              />
            </div>
            
            {/* Card Details */}
            <div className="p-5">
              <h3 className="font-bold text-lg text-gray-900 truncate mb-1" title={item.original_filename}>
                {item.original_filename}
              </h3>
              
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Provenance Hashes</p>
                <p className="text-xs text-gray-700 font-mono truncate" title={item.phash}>
                  <span className="text-blue-600 font-bold">pHash:</span> {item.phash}
                </p>
                <p className="text-xs text-gray-700 font-mono truncate" title={item.dhash}>
                  <span className="text-purple-600 font-bold">dHash:</span> {item.dhash}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyGallery;