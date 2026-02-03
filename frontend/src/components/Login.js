import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiUser, FiLock, FiLogIn } from 'react-icons/fi';
import Message from './Message';
import logo from "../logo.png";
import Footer from "./Footer";


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
  <div className="w-full">

    {/* ===== TOP NAVBAR ===== */}
    <header className="w-full bg-blue-200 shadow-sm fixed top-0 left-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

        <div className="flex items-center space-x-2">
          <img src={logo} alt="Mindscape Logo" className="h-12 w-12 rounded-full object-contain" />
          <h1 className="text-2xl font-bold text-blue-600">
            MINDSCAPE
          </h1>
        </div>

        <button
          onClick={() =>
            document
              .getElementById("loginSection")
              .scrollIntoView({ behavior: "smooth" })
          }
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          LOGIN
        </button>

      </div>
    </header>

      {/* ===== HERO SECTION ===== */}
      <section className="min-h-screen flex flex-col md:flex-row items-center justify-center bg-gray-100 p-10">
        <div className="md:w-1/2 text-center md:text-left">
          <h1 className="text-5xl font-bold mb-6 text-blue-600">
            Learn smarter with Mindscape
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Free. Fun. Effective learning platform for students.
          </p>

          <button
            onClick={() =>
              document
                .getElementById("loginSection")
                .scrollIntoView({ behavior: "smooth" })
            }
            className="bg-blue-600 text-white px-8 py-3 rounded-lg"
          >
            Get Started
          </button>
        </div>

        <div className="md:w-1/2 flex justify-center">
          <img
            src="https://media.istockphoto.com/id/1171913244/vector/woman-with-laptop-education-or-working-concept-table-with-books-lamp-coffee-cup-vector.jpg?s=612x612&w=0&k=20&c=7e12Gv9QRyJxBiJMPuxtpgjnMNIuhWYWUBf_yGadCuU="
            className="rounded-xl shadow-lg w-96"
            alt="Learning"
          />
        </div>
      </section>

      {/* ===== FEATURES SECTION ===== */}
      <section className="min-h-screen flex flex-col md:flex-row items-center justify-center p-10">
        <div className="md:w-1/2">
          <h2 className="text-4xl font-bold text-blue-600 mb-4">
            Free. Fun. Effective.
          </h2>
          <p className="text-gray-600">
            Build strong study habits, access learning resources anytime, and track your progress in one unified learning space.
          </p>
        </div>

        <div className="md:w-1/2 flex justify-center">
          <img
            src="https://cdn-icons-png.flaticon.com/512/3135/3135755.png"
            className="w-80"
            alt="Learning"
          />
        </div>
      </section>

      {/* ===== SCIENCE SECTION ===== */}
      <section className="min-h-screen flex flex-col md:flex-row items-center justify-center bg-gray-100 p-10">
        <div className="md:w-1/2 flex justify-center">
          <img
            src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
            className="w-80"
            alt="Science"
          />
        </div>

        <div className="md:w-1/2">
          <h2 className="text-4xl font-bold text-blue-600 mb-4">
            See you inside!
          </h2>
          <p className="text-gray-600">
            Start your learning journey today with Mindscape. Explore courses, stay consistent, and achieve your academic goals with a platform designed to support your success.
            </p>
        </div>
      </section>
{/* ===== LOGIN SECTION ===== */}
<section
  id="loginSection"
  className="min-h-screen flex items-center justify-center bg-gray-100 p-6"
>
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
</section>
<Footer />

  </div>
  );
};

export default Login;
