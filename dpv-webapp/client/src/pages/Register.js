import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState(''); // NEW: Tracks password strength
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // 🚨 THE REGEX: 8+ chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_#-])[A-Za-z\d@$!%*?&_#-]{8,}$/;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Live Password Validation as they type
    if (name === 'password') {
      if (value.length > 0 && !passwordRegex.test(value)) {
        setPasswordError('Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character (@$!%*?&_#-).');
      } else {
        setPasswordError(''); // Clears the error when valid
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Final safety check to prevent submitting a weak password
    if (!passwordRegex.test(formData.password)) {
      setPasswordError('Please enter a stronger password before registering.');
      return;
    }

    setLoading(true);

    try {
      const response = await API.post('/auth/register', formData);
      if (response.data.success) {
        setSuccess(true);
        setTimeout(() => navigate('/login'), 3000); // Redirect after 3 seconds
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  // Determines if the button should be locked
  const isFormValid = formData.name && formData.email && formData.password && !passwordError;

  return (
    <div className="flex items-center justify-center pt-10">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900">Create Account</h2>
          <p className="text-gray-500 mt-2">Join the Digital Provenance Registry</p>
        </div>

        {error && <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 text-red-700 text-sm">{error}</div>}
        {success && <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 text-green-700 text-sm">Account created! Redirecting to login...</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700">Full Name</label>
            <input
              type="text"
              name="name"
              required
              className="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition"
              placeholder="John Doe"
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700">Email Address</label>
            <input
              type="email"
              name="email"
              required
              className="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition"
              placeholder="john@example.com"
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700">Password</label>
            <input
              type="password"
              name="password"
              required
              // Changes border to red if there is an error
              className={`mt-1 block w-full px-4 py-3 bg-gray-50 border rounded-lg focus:ring-2 transition ${passwordError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
              placeholder="••••••••"
              onChange={handleChange}
            />
            {/* The Warning Message */}
            {passwordError && (
              <p className="text-xs text-red-500 mt-2 font-medium leading-tight">
                {passwordError}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !isFormValid}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-lg transition-all disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 font-bold hover:underline">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;