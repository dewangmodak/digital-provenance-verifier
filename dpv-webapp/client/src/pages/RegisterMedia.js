import React, { useState } from 'react';
import API from '../services/api';

const RegisterMedia = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setMessage('');
      setError('');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select an image first.');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    const formData = new FormData();
    // 💡 Using 'image' here to match our Multer setup. If your media route uses a different word, change it here!
    formData.append('image', file); 

    try {
      const response = await API.post('/media/register', formData);
      setMessage('✅ Media successfully registered into the MySQL Provenance Ledger!');
      setFile(null);
      setPreview(null);
    } catch (err) {
      console.error("Registration Error:", err.response?.data);
      setError(err.response?.data?.message || 'Failed to register media. Check console.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto pt-10 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 sm:p-12">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-gray-900 mb-3">Register Original Media</h1>
          <p className="text-gray-500">
            Secure your digital artwork. We will generate a cryptographic hash and store it in our immutable ledger.
          </p>
        </div>

        {error && <div className="p-4 mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg font-medium">{error}</div>}
        {message && <div className="p-4 mb-6 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-lg font-bold">{message}</div>}

        <form onSubmit={handleRegister} className="space-y-8">
          {/* Drag & Drop Upload Area */}
          <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:bg-gray-50 transition relative group cursor-pointer">
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFileChange} 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            
            {!preview ? (
              <div className="space-y-4">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-700">Click or drag image to upload</p>
                  <p className="text-sm text-gray-400 mt-1">PNG, JPG, WEBP up to 5MB</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <img src={preview} alt="Preview" className="max-h-64 mx-auto rounded-lg shadow-sm border border-gray-200" />
                <p className="text-sm font-medium text-blue-600">Selected: {file.name}</p>
                <p className="text-xs text-gray-400">Click anywhere in the box to change image</p>
              </div>
            )}
          </div>

          <button 
            type="submit" 
            disabled={!file || loading}
            className="w-full py-4 bg-gray-900 text-white font-bold rounded-xl shadow-lg hover:bg-black transition-all disabled:bg-gray-300 disabled:cursor-not-allowed text-lg"
          >
            {loading ? 'Generating Hashes & Registering...' : 'Lock into Provenance Registry'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterMedia;