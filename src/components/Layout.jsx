import React from 'react';
import { Link } from 'react-router-dom';
import Navigation from './Navigation';
import thumbLogo from '../assets/thumb_logo.png';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navigation />
      
      <div className="bg-gray-800 py-4 text-center">
        <img src={thumbLogo} alt="OP Legends" className="h-16 mx-auto" />
      </div>
      <div className="bg-gray-800 py-4 text-center">
        <img src={thumbLogo} alt="OP Legends" className="h-16 mx-auto" />
      </div>
      
      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>

      <footer className="bg-gray-800 text-white mt-12 py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="mb-2">© 2024 OP Legends. All rights reserved.</p>
          <div className="flex justify-center space-x-4">
            <a href="/privacy" className="hover:text-blue-400 transition-colors">Privacy Policy</a>
            <a href="/terms" className="hover:text-blue-400 transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;