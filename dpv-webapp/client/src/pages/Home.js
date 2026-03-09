import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Home = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="min-h-screen bg-[#0B1120] animate-fade-in">
      {/* Hero Section */}
      <div className="bg-[#0B1120] text-white py-24 px-4 relative overflow-hidden border-b border-[#1F2937]">
        {/* Abstract background graphics */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-30 pointer-events-none">
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600 rounded-full blur-[120px]"></div>
            <div className="absolute top-1/2 right-0 w-80 h-80 bg-purple-600 rounded-full blur-[120px]"></div>
        </div>

        <div className="max-w-6xl mx-auto relative z-10 text-center mt-10">
          <span className="text-[#3B82F6] font-bold tracking-widest text-xs uppercase bg-[#3B82F6]/10 px-4 py-2 rounded-full border border-[#3B82F6]/30">
            Digital Provenance Vault
          </span>
          <h1 className="text-5xl md:text-7xl font-black mt-8 mb-6 leading-tight tracking-tight">
            Securing Digital Truth <br/> in an <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3B82F6] to-[#A78BFA]">AI-Generated World</span>.
          </h1>
          <p className="text-xl text-[#9CA3AF] max-w-2xl mx-auto mb-12 leading-relaxed">
            Advanced cryptographic hashing and AI deepfake detection combined to verify media authenticity, track provenance, and protect digital IP.
          </p>
          <div className="flex justify-center gap-6">
            <Link to="/verify" className="bg-[#3B82F6] hover:bg-[#2563EB] text-white px-10 py-4 rounded-2xl font-bold text-lg transition-all shadow-lg shadow-blue-500/25">
              Verify Media Now
            </Link>
            <Link to="/dashboard" className="bg-[#1F2937] hover:bg-[#374151] border border-[#374151] text-[#E5E7EB] px-10 py-4 rounded-2xl font-bold text-lg transition-all">
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* Stats/Trust Banner - Darkened */}
      <div className="bg-[#0B1120] border-b border-[#1F2937] py-12">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-[#1F2937]">
          <div>
            <p className="text-4xl font-black text-[#E5E7EB]">99.8%</p>
            <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest mt-2">AI Detection Accuracy</p>
          </div>
          <div>
            <p className="text-4xl font-black text-[#E5E7EB]">SHA-256</p>
            <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest mt-2">Cryptographic Hashing</p>
          </div>
          <div>
            <p className="text-4xl font-black text-[#E5E7EB]">&lt; 2s</p>
            <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest mt-2">Verification Speed</p>
          </div>
          <div>
            <p className="text-4xl font-black text-[#E5E7EB]">24/7</p>
            <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest mt-2">Active Ledger</p>
          </div>
        </div>
      </div>

      {/* Features Section - Slate Navy Background */}
      <div className="bg-[#0B1120] py-28 px-4">
        <div className="text-center mb-20">
          <h2 className="text-4xl font-black text-[#E5E7EB]">Enterprise-Grade Integrity Tools</h2>
          <p className="text-[#9CA3AF] mt-4 text-lg max-w-xl mx-auto">Everything you need to fight misinformation and secure your digital assets.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto">
          {/* Feature 1 */}
          <div className="bg-[#111827] p-10 rounded-3xl border border-[#1F2937] hover:border-[#3B82F6]/50 transition-all group">
            <div className="w-14 h-14 bg-[#1F2937] rounded-2xl flex items-center justify-center mb-8 group-hover:bg-[#3B82F6]/10 transition-colors">
              <span className="text-2xl">🤖</span>
            </div>
            <h3 className="text-2xl font-bold text-[#E5E7EB] mb-4">Deepfake Detection</h3>
            <p className="text-[#9CA3AF] leading-relaxed">
              State-of-the-art vision models analyze pixel-level artifacts and frequency domains to instantly flag AI-generated or manipulated images.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-[#111827] p-10 rounded-3xl border border-[#1F2937] hover:border-[#3B82F6]/50 transition-all group">
            <div className="w-14 h-14 bg-[#1F2937] rounded-2xl flex items-center justify-center mb-8 group-hover:bg-[#3B82F6]/10 transition-colors">
              <span className="text-2xl">🛡️</span>
            </div>
            <h3 className="text-2xl font-bold text-[#E5E7EB] mb-4">Provenance Registry</h3>
            <p className="text-[#9CA3AF] leading-relaxed">
              We generate unalterable pHash and dHash signatures for every upload, creating a secure, searchable ledger of authentic digital media.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-[#111827] p-10 rounded-3xl border border-[#1F2937] hover:border-[#3B82F6]/50 transition-all group">
            <div className="w-14 h-14 bg-[#1F2937] rounded-2xl flex items-center justify-center mb-8 group-hover:bg-[#3B82F6]/10 transition-colors">
              <span className="text-2xl">🧩</span>
            </div>
            <h3 className="text-2xl font-bold text-[#E5E7EB] mb-4">Browser Extension</h3>
            <p className="text-[#9CA3AF] leading-relaxed">
              Take DPV.AI anywhere. Right-click any image on the web to instantly verify its authenticity against our secure database.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;