// Navbar.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiBook, FiLogOut } from 'react-icons/fi';
import logo from "../logo.png";


const Navbar = ({ setAuthToken }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    setAuthToken(null);
    navigate('/login');
  };

  return (
  <nav className="bg-gradient-to-r from-blue-400 to-indigo-700 shadow-sm px-6 py-4 flex items-center justify-between rounded-b-xl">

    <div className="flex items-center">
      <img
        src={logo}
        alt="Mindscape Logo"
        className="h-10 w-10 rounded-full object-cover mr-2"
      />
      <span className="text-xl font-bold text-black">MINDSCAPE</span>
    </div>

    <div className="flex items-center gap-3">

      {/* Contact Button */}
      <button
        onClick={() => navigate('/contact')}
        className="px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-100 transition"
      >
        Contact Us
      </button>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="flex items-center px-4 py-2 text-red-500 bg-white rounded-lg hover:bg-red-100 transition-colors"
      >
        <FiLogOut className="mr-2" />
        Logout
      </button>

    </div>

  </nav>
);

};

export default Navbar;