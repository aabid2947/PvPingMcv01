import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import HeroSection from './HeroSection';
import { FiHome, FiAlertCircle } from 'react-icons/fi';

function NotFound() {
  return (
    <div className="w-full">
      <Helmet>
        <title>Page Not Found | PvPing MC</title>
        <meta name="description" content="The page you're looking for doesn't exist." />
      </Helmet>
      
      {/* Include the hero section at the top */}
      <HeroSection />
      
      {/* Main content with the same styling as other pages */}
      <div className="bg-[#13141d] mt-[-30px] w-full">
        <div className="container mx-auto px-4 py-16 flex flex-col items-center">
          <div className="bg-[#1e2132] rounded-lg p-8 shadow-lg max-w-lg w-full text-center">
            <FiAlertCircle className="mx-auto text-red-500 mb-4" size={64} />
            
            <h1 className="text-4xl font-bold text-white mb-4">404</h1>
            <h2 className="text-2xl font-semibold text-blue-400 mb-6">Page Not Found</h2>
            
            <p className="text-gray-300 mb-8">
              Oops! The page you're looking for doesn't exist or has been moved.
            </p>
            
            <Link 
              to="/" 
              className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              <FiHome className="mr-2" />
              Return to Home
            </Link>
          </div>
          
          <div className="mt-10 bg-[#1a1c28] p-6 rounded-lg shadow-md max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-3">Looking for something?</h3>
            <p className="text-gray-400 mb-4">
              Check out these popular pages instead:
            </p>
            <ul className="space-y-2 text-blue-400">
              <li>
                <Link to="/store" className="hover:text-blue-300 hover:underline">
                  → Store
                </Link>
              </li>
              <li>
                <Link to="/blog" className="hover:text-blue-300 hover:underline">
                  → Blog
                </Link>
              </li>
              <li>
                <Link to="/vote" className="hover:text-blue-300 hover:underline">
                  → Vote
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotFound; 