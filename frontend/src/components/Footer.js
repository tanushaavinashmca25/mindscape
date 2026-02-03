import React from "react";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-blue-400 to-indigo-700 text-white text-center py-3 w-full mt-auto">
      © {new Date().getFullYear()} Mindscape. All rights reserved.
    </footer>
  );
};

export default Footer;
