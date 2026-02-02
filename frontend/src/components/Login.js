import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiUser, FiLock, FiLogIn } from 'react-icons/fi';
import Message from './Message';

const Login = ({ setAuthToken, setRole }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.successMessage) {
      setSuccessMessage(location.state.successMessage);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        'https://mindscape-ghx1.onrender.com/api/auth/login',
        { username, password }
      );

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.role);
      localStorage.setItem('userId', res.data.userId);

      setAuthToken(res.data.token);
      setRole(res.data.role);

      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">

      {/* LEFT SIDE – IMAGE / ILLUSTRATION */}
      <div className="hidden md:flex items-center justify-center bg-gradient-to-br from-purple-600 to-indigo-700 text-white p-10">
        <div className="text-center max-w-md">
          <img
            src="https://images.unsplash.com/photo-1584697964403-8c5fbc0b82b3"
            alt="Learning"
            className="rounded-xl shadow-lg mb-8"
          />
          <h2 className="text-3xl font-bold mb-4">
            Welcome to Mindscape
          </h2>
          <p className="text-lg opacity-90">
            Learn. Grow. Explore your potential with us.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE – LOGIN FORM */}
      <div className="flex items-center justify-center bg-gray-100 p-6">
        <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md">

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Welcome
            </h1>
            <p className="text-gray-600">Sign in to continue</p>
          </div>

          {successMessage && (
            <Message type="success" onClose={() => setSuccessMessage('')}>
              {successMessage}
            </Message>
          )}

          {error && (
            <Message type="error" onClose={() => setError('')}>
              {error}
            </Message>
          )}

          <form onSubmit={handleLogin} className="space-y-6">

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <div className="relative">
                <FiUser className="absolute top-4 left-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Enter username"
                  className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <FiLock className="absolute top-4 left-3 text-gray-400" />
                <input
                  type="password"
                  placeholder="Enter password"
                  className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition flex items-center justify-center"
            >
              <FiLogIn className="mr-2" />
              Sign In
            </button>

            <p className="text-center text-gray-600 mt-6">
              Don't have an account?{' '}
              <a
                href="/register"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Create account
              </a>
            </p>

          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
