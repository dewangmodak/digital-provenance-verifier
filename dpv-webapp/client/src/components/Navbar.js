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
    <nav className="bg-white shadow-md border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo Area */}
          <div className="flex-shrink-0 flex items-center">
            <Link to={user ? "/dashboard" : "/login"} className="text-2xl font-black text-blue-600 tracking-tighter hover:text-blue-800 transition">
              DPV.AI
            </Link>
          </div>

          {/* Dynamic Links Area */}
          <div className="flex items-center space-x-6">
            {user ? (
              // WHAT LOGGED-IN USERS SEE
              <>
                <span className="hidden sm:inline-block text-sm font-medium text-gray-500">
                  Welcome, <span className="text-gray-900 font-bold">{user.role === 'admin' ? 'Admin' : 'User'}</span>
                </span>
                <Link to="/dashboard" className="text-gray-600 hover:text-blue-600 font-medium transition">Dashboard</Link>
                <Link to="/register-media" className="text-gray-600 hover:text-blue-600 font-medium transition">Register Art</Link>
                <Link to="/verify" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition shadow-sm">Verify Media</Link>
                <button 
                  onClick={handleLogout}
                  className="text-gray-500 hover:text-red-600 font-medium transition ml-4 border-l pl-4 border-gray-200"
                >
                  Logout
                </button>
              </>
            ) : (
              // WHAT GUESTS SEE
              <>
                <Link to="/login" className="text-gray-600 hover:text-blue-600 font-medium transition">Login</Link>
                <Link to="/register" className="bg-gray-900 text-white px-4 py-2 rounded-lg font-bold hover:bg-gray-800 transition shadow-sm">Register</Link>
              </>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;