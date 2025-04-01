import React, { useState, useEffect, createContext, useContext } from 'react';
import { Helmet } from 'react-helmet-async';
import { FiBox, FiShoppingCart, FiDollarSign } from 'react-icons/fi';
import PurchaseButton from '../components/PurchaseButton';
import { initializeTebex } from '../utils/tebexService';

// Create context for store data
export const StoreContext = createContext();

// Store provider component
export function StoreProvider({ children }) {
  const [tebexLoaded, setTebexLoaded] = useState(false);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize Tebex SDK when component mounts
  useEffect(() => {
    const loadTebexSDK = async () => {
      try {
        // Check if we're in development mode using import.meta.env instead of process.env
        const isDev = import.meta.env.DEV;
        
        if (isDev) {
          console.log('Development mode: Skipping Tebex SDK load');
          setTebexLoaded(true);
          return;
        }

        // Load Tebex SDK
        const script = document.createElement('script');
        script.src = 'https://checkout.tebex.io/js/tebex.js';
        script.async = true;
        script.onload = () => {
          console.log('Tebex SDK loaded successfully');
          // Initialize Tebex with your store ID
          if (window.Tebex) {
            try {
              // Your store ID from Tebex (can be set in .env file)
              const storeId = import.meta.env.VITE_TEBEX_STORE_ID || 'your-store-id';
              
              if (storeId === 'your-store-id') {
                console.warn('Tebex store ID not configured. Payment system will be disabled.');
                setError('Payment system not configured. Products are displayed for preview only.');
                setTebexLoaded(true); // Still load products even if payment system isn't configured
                return;
              }
              
              window.Tebex.init({
                storeId: storeId,
                theme: 'dark'
              });
              setTebexLoaded(true);
            } catch (configError) {
              console.error('Failed to initialize Tebex SDK:', configError);
              setError('Payment system not properly configured. Products are displayed for preview only.');
              setTebexLoaded(true); // Still load products even if payment system isn't configured
            }
          } else {
            console.error('Tebex SDK not properly loaded');
            setError('Payment system unavailable. Products are displayed for preview only.');
            setTebexLoaded(true); // Still load products even if SDK isn't working
          }
        };
        script.onerror = (error) => {
          console.error('Failed to load Tebex SDK:', error);
          setError('Payment system unavailable. Products are displayed for preview only.');
          setTebexLoaded(true); // Still load products even if SDK fails to load
        };
        document.body.appendChild(script);
      } catch (error) {
        console.error('Failed to load Tebex SDK:', error);
        // Set tebexLoaded to true regardless of errors to ensure products still load
        setTebexLoaded(true);
        setError('Payment system unavailable. Products are displayed for preview only.');
      }
    };

    loadTebexSDK();
  }, []);

  // Load packages when Tebex is loaded
  useEffect(() => {
    if (!tebexLoaded) return;

    // Fetch packages (in a real implementation, you would fetch from your API)
    // For now, we'll use sample data
    const samplePackages = [
      {
        id: 'package-1',
        name: 'VIP Membership',
        description: 'Get access to exclusive features and benefits with our VIP membership.',
        price: '$9.99',
        features: [
          'VIP tag in-game and on Discord',
          'Access to VIP-only areas and commands',
          'Priority server access during high traffic',
          '10% discount on future purchases'
        ],
        popular: true
      },
      {
        id: 'package-2',
        name: 'Premium Starter Kit',
        description: 'Get a head start with premium tools, weapons, and resources.',
        price: '$4.99',
        features: [
          'Diamond tools and armor set',
          '64x of various valuable resources',
          '3 exclusive mystery crates',
          'Special particle effects for 7 days'
        ],
        popular: false
      },
      {
        id: 'package-3',
        name: 'Ultimate Bundle',
        description: 'The complete package with all benefits and perks combined.',
        price: '$19.99',
        features: [
          'VIP membership for 30 days',
          'Premium starter kit with double resources',
          'Exclusive cosmetic items and effects',
          '5 vote keys and 3 legendary crates'
        ],
        popular: true
      }
    ];

    setPackages(samplePackages);
    setLoading(false);
  }, [tebexLoaded]);

  // Context value
  const value = {
    tebexLoaded,
    packages,
    loading,
    error,
    setPackages
  };

  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  );
}

// Hook to use store context
export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}

/**
 * Store page component displaying packages available for purchase
 */
function Store() {
  const { packages, loading, error, tebexLoaded } = useStore();

  return (
    <div className="store-page container mx-auto px-4 py-8">
      <Helmet>
        <title>Store | PvPing MC</title>
        <meta name="description" content="Browse and purchase packages for the PvPing Minecraft server." />
      </Helmet>

      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Server Store</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Support our server and enhance your gameplay with our premium packages.
          All purchases help keep the server running and fund new features.
        </p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 max-w-2xl mx-auto">
          <p className="font-bold">Error loading store</p>
          <p>{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex  justify-center items-center py-16">
          <div className="loader"></div>
          <p className="ml-3">Loading packages...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {packages.map((pkg) => (
            <div 
              key={pkg.id} 
              className={`bg-[#1D1E29] rounded-lg shadow-md overflow-hidden transition-transform hover:shadow-lg ${
                pkg.popular ? 'ring-2 ring-purple-500' : ''
              }`}
            >
              {pkg.popular && (
                <div className="bg-purple-500 text-white text-center py-1 font-medium">
                  Most Popular
                </div>
              )}

              <div className="p-6">
                <h2 className="text-2xl font-bold mb-2">{pkg.name}</h2>
                <p className="text-gray-600 mb-4">{pkg.description}</p>
                
                <div className="text-3xl font-bold text-purple-600 mb-6">
                  {pkg.price}
                </div>
                
                <ul className="mb-6 space-y-2">
                  {pkg.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <FiCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <PurchaseButton packageDetails={pkg} />
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-16 bg-purple-600 p-6 rounded-lg shadow-md max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-4 flex items-center">
          <FiDollarSign className="mr-2 text-purple-600" />
          Need a custom package?
        </h2>
        <p className="mb-4">
          Looking for something specific or want to customize a package for your needs? 
          Contact our support team and we'll create a custom solution just for you.
        </p>
        <a 
          href="https://discord.gg/yourserver" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
        >
          Contact Support
        </a>
      </div>
    </div>
  );
}

// Component for the checkmark icon
function FiCheck(props) {
  return (
    <svg 
      stroke="currentColor" 
      fill="none" 
      strokeWidth="2" 
      viewBox="0 0 24 24" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      height="1em" 
      width="1em" 
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  );
}

export default Store;
