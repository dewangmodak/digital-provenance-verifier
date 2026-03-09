import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-[#111827]/80 backdrop-blur-md border-b border-[#1F2937] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          
          {/* 🛡️ LOGO AREA */}
          <div className="flex-shrink-0">
            <Link to={user ? "/home" : "/login"} className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-[#3B82F6] to-[#A78BFA] rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <svg viewBox="0 0 24 24" className="w-6 h-6 text-white fill-current">
                   <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
                </svg>
              </div>
              <span className="text-2xl font-black text-[#E5E7EB] tracking-tighter">
                DPV<span className="text-[#3B82F6]">.AI</span>
              </span>
            </Link>
          </div>

          {/* 🧭 NAVIGATION BOXES - Expanded Spacing */}
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <div className="hidden xl:flex items-center px-6 py-2 bg-[#1F2937] rounded-lg border border-[#374151] mr-4">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse mr-2"></div>
                  <span className="text-xs font-bold text-[#9CA3AF] uppercase tracking-wide">
                    Secure Mode: <span className="text-[#E5E7EB]">{user.role}</span>
                  </span>
                </div>

                <Link to="/home" className="nav-box px-6">Home</Link>
                <Link to="/dashboard" className="nav-box px-6">Registry</Link>
                <Link to="/verify" className="bg-[#3B82F6] hover:bg-[#2563EB] text-white px-8 py-2.5 rounded-xl font-bold transition shadow-lg shadow-blue-500/20 active:scale-95 ml-2">
                  Verify Now
                </Link>
                
                {user.role === 'admin' && (
                  <Link to="/admin" className="nav-box px-6 border-[#A78BFA]/30 text-[#A78BFA]">
                    ⚙️ Admin
                  </Link>
                )}

                <button 
                  onClick={handleLogout}
                  className="ml-4 p-2 text-[#9CA3AF] hover:text-[#F43F5E] transition-colors rounded-lg hover:bg-[#F43F5E]/10"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </>
            ) : (
              <div className="flex gap-4">
                <Link to="/login" className="text-[#9CA3AF] hover:text-[#E5E7EB] font-bold px-6 py-2">Login</Link>
                <Link to="/register" className="bg-[#E5E7EB] text-[#0B1120] px-8 py-2.5 rounded-xl font-bold hover:bg-white transition shadow-xl">Get Started</Link>
              </div>
            )}
          </div>

        </div>
      </div>
      
      <style jsx>{`
        .nav-box {
          @apply text-[#9CA3AF] hover:text-[#E5E7EB] hover:bg-[#1F2937] py-2.5 rounded-xl font-bold transition-all border border-transparent hover:border-[#374151] active:scale-95 flex items-center justify-center min-w-[100px];
        }
      `}</style>
    </nav>
  );
};

export default Navbar;