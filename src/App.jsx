import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { StoreProvider } from './pages/Store';
import { CartProvider } from './contexts/CartContext';
import { BasketProvider } from './contexts/BasketContext';
import CartModal from './components/CartModal';
import './index.css'
import Home from './pages/Home'
import BlogOverview from './pages/BlogOverview'
import BlogDetail from './pages/BlogDetail'
import Store from './pages/Store'
import Vote from './pages/Vote'
import Rules from './pages/Rules'
import PvPingMC from './pages/PvPingMC'
import HeroSection from "./pages/HeroSection.jsx"
import OriginPass from './pages/OriginPass'
import pvping from "./assets/thumb_logo.png"
import NotFound from './pages/NotFound'
import * as tebexService from './utils/tebexHeadlessService';

// Authentication Return Handler Component
const AuthReturnHandler = () => {
  useEffect(() => {
    const handleAuthReturn = async () => {
      // Check if this is a return from authentication
      const isAuthReturn = 
        window.location.search.includes('tebex_auth') || 
        window.location.search.includes('auth_return');
        
      if (isAuthReturn) {
        console.log('Detected return from Tebex authentication, processing...');
        
        try {
          // Process the pending operation
          await tebexService.handleAuthenticationReturn();
          
          // Clean up the URL
          const cleanUrl = window.location.pathname + 
                         window.location.search.replace(/[?&]tebex_auth[^&]*/, '').replace(/[?&]auth_return[^&]*/, '');
          window.history.replaceState({}, document.title, cleanUrl);
        } catch (error) {
          console.error('Error handling authentication return:', error);
        }
      }
    };
    
    handleAuthReturn();
  }, []);
  
  return null; // This component doesn't render anything
};

// Universal Footer Component
const FooterComponent = () => {
  return (
    <footer className="bg-[#1D1E29AB] border-t border-gray-800/30 py-8 w-full">
      <div className="w-full container mx-auto md:w-4/5 px-4">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="mb-6 md:mb-0 text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start mb-2">
              <span className="text-white font-medium mr-1">Copyright ©</span>
              <span className="text-blue-500 font-medium mr-1">PvPingMc</span>
              <span className="text-white font-medium">2023. All Rights Reserved.</span>
            </div>
            <p className="text-gray-500 text-xs">
              MINECRAFT IS © MOJANG STUDIOS 2009-2023. WE ARE NOT AFFILIATED WITH MOJANG STUDIOS.
            </p>
          </div>

          <div className="flex items-center">
            <img src={pvping} alt="OriginMC Logo" className="h-6 w-auto" />
          </div>
        </div>
      </div>
    </footer>
  );
};

function AppContent() {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <div className="flex flex-col min-h-screen">
      {/* Authentication Return Handler */}
      <AuthReturnHandler />
      
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={
            <div className="w-full" >
              <HeroSection />
              <div className="bg-[#13141d] mt-[-30px] w-full">
                <Home />
              </div>
            </div>
          } />
          <Route path="/blog" element={
            <div className="w-full">
              <HeroSection />
              <div className="bg-[#13141d] mt-[-30px] w-full">
                <BlogOverview />
              </div>
            </div>
          } />
          <Route path="/blog/:id" element={
            <div className="w-full">
              <HeroSection />
              <div className="bg-[#13141d] mt-[-30px] w-full">
                <BlogDetail />
              </div>
            </div>
          } />
          <Route path="/store" element={
            <div className="w-full">
              <HeroSection />
              <div className="bg-[#13141d] mt-[-30px] w-full">
                <Store />
              </div>
            </div>
          } />
          <Route path="/vote" element={
            <div className="w-full">
              <HeroSection />
              <div className="bg-[#13141d] mt-[-30px] w-full">
                <Vote />
              </div>
            </div>
          } />
          <Route path="/rules" element={
            <div className="w-full">
              <HeroSection />
              <div className="bg-[#13141d] mt-[-30px] w-full">
                <Rules />
              </div>
            </div>
          } />
          <Route path="/pvpingmc" element={
            <div className="w-full">
              <HeroSection />
              <div className="bg-[#13141d] mt-[-30px] w-full">
                <PvPingMC />
              </div>
            </div>
          } />
          <Route path="/originpass" element={
            <div className="w-full">
              <HeroSection />
              <div className="bg-[#13141d] mt-[-30px] w-full">
                <OriginPass />
              </div>
            </div>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <FooterComponent />
      
      {/* Cart Modal - will only be visible when cartOpen is true */}
      <CartModal />
    </div>
  );
}

function App() {
  return (
    <HelmetProvider>
      <BasketProvider>
        <StoreProvider>
          <CartProvider>
            <Router>
              <AppContent />
            </Router>
          </CartProvider>
        </StoreProvider>
      </BasketProvider>
    </HelmetProvider>
  );
}

export default App;
