import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import API from '../services/api';

const Verify = () => {
  const [file, setFile] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onDrop = (acceptedFiles) => {
    setFile(acceptedFiles[0]);
    setResults(null);
    setError('');
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop, 
    accept: {'image/*': []},
    multiple: false 
  });

  const handleVerify = async () => {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    
    // 💡 HINT: If your Node.js multer is expecting 'image' or 'file', change 'media' here!
    formData.append('image', file);

    try {
      const response = await API.post('/verify', formData, {

      });
      
      // Look at the exact payload your backend sends back
      const resultsData = response.data.data || response.data;
      setResults(resultsData);
      
    } catch (err) {
      // 🚨 THE X-RAY LOG: This prints exactly why your backend rejected the file!
      console.error("BACKEND REJECTION:", err.response?.data);
      
      // Show the actual backend error message on the screen
      setError(err.response?.data?.message || err.response?.data?.error || 'Verification failed. Check console.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-black text-gray-900">AI Integrity Check</h1>
        <p className="text-gray-500 mt-2">Upload an image to verify its origin and AI status.</p>
      </div>

      {/* Drag & Drop Area */}
      <div {...getRootProps()} className={`border-4 border-dashed rounded-3xl p-12 text-center transition-all cursor-pointer ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:border-blue-400'}`}>
        <input {...getInputProps()} />
        {file ? (
          <p className="text-blue-600 font-bold text-lg">Selected: {file.name}</p>
        ) : (
          <p className="text-gray-400 text-lg">Drag & drop an image here, or click to select</p>
        )}
      </div>

      <button 
        onClick={handleVerify}
        disabled={!file || loading}
        className="w-full py-4 bg-black text-white rounded-2xl font-bold text-xl hover:bg-gray-800 disabled:bg-gray-300 transition-all shadow-lg"
      >
        {loading ? 'Analyzing with AI...' : 'Verify Image Integrity'}
      </button>

      {error && <div className="p-4 bg-red-100 text-red-700 rounded-xl">{error}</div>}

      {/* Display Results */}
      {results && (
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 animate-fade-in">
          <h2 className="text-2xl font-bold mb-6">Verification Report</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={`p-6 rounded-2xl ${results.ai_detection.is_ai_generated ? 'bg-red-50' : 'bg-green-50'}`}>
              <p className="text-sm font-bold uppercase tracking-wider text-gray-500">AI Status</p>
              <p className={`text-2xl font-black ${results.ai_detection.is_ai_generated ? 'text-red-600' : 'text-green-600'}`}>
                {results.ai_detection.is_ai_generated ? 'AI GENERATED' : 'HUMAN CREATED'}
              </p>
              <p className="text-sm mt-1">Confidence Score: {results.ai_detection.confidence_score}</p>
            </div>

            <div className="p-6 bg-blue-50 rounded-2xl">
              <p className="text-sm font-bold uppercase tracking-wider text-gray-500">Provenance Match</p>
              <p className="text-2xl font-black text-blue-600">{results.overall_verdict}</p>
              <p className="text-sm mt-1">{results.total_matches} matches found in registry</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Verify;