import React from "react";
import Footer from "./Footer";

const Contact = () => {
  return (
    <div className="flex flex-col min-h-screen">

      <div className="flex-grow flex items-center justify-center p-6 bg-gray-100">

        <div className="bg-white shadow-lg rounded-xl p-8 max-w-lg w-full">
          <h1 className="text-3xl font-bold mb-4 text-center">
            Contact Us
          </h1>

          <p className="text-gray-600 text-center mb-6">
            Have questions or feedback? Reach out to us!
          </p>

          <div className="space-y-3 text-gray-700">
            <p><strong>Email:</strong> support@mindscape.com</p>
            <p><strong>Phone:</strong> +91 98765 43210</p>
            <p><strong>Address:</strong> Mindscape Learning Pvt. Ltd.</p>
          </div>
        </div>

      </div>

      <Footer />

    </div>
  );
};

export default Contact;
