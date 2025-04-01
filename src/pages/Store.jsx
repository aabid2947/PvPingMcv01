import React, { useState, useEffect, createContext, useContext } from 'react';
import { Helmet } from 'react-helmet-async';
import { FiShoppingCart, FiDollarSign, FiPackage, FiStar, FiTag, FiFilter, FiGrid, FiAlertCircle } from 'react-icons/fi';
import { initializeTebex, fetchPackages } from '../utils/tebexService';
import { fetchCategories, categorizePackages, getMockPackages } from '../utils/packageService';
import LoginModal from '../components/LoginModal';
import PaymentDialog from '../components/PaymentDialog';

// Create context for store data
export const StoreContext = createContext();

// Store provider component
export function StoreProvider({ children }) {
  const [tebexLoaded, setTebexLoaded] = useState(false);
  const [packages, setPackages] = useState([]);
  const [categorizedPackages, setCategorizedPackages] = useState({});
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoryRefreshTimestamp, setCategoryRefreshTimestamp] = useState(Date.now());

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
              const storeId = import.meta.env.VITE_TEBEX_STORE_ID || '752140';
              
              if (storeId === 'your-store-id') {
                console.warn('Tebex store ID not configured. Payment system will be disabled.');
                setError('Payment system not configured. Products are displayed for preview only.');
                setTebexLoaded(true); // Still load products even if payment system isn't configured
                return;
              }
              
              initializeTebex(storeId).then(success => {
                if (success) {
                  console.log('Tebex SDK initialized with store ID:', storeId);
                  setTebexLoaded(true);
                } else {
                  console.error('Failed to initialize Tebex SDK');
                  setError('Payment system not properly configured. Products are displayed for preview only.');
                  setTebexLoaded(true); // Still load products even if SDK isn't working
                }
              });
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

  // Load packages and categories when Tebex is loaded
  useEffect(() => {
    if (!tebexLoaded) return;

    const loadPackagesAndCategories = async () => {
      try {
        setLoading(true);
        
        // Fetch categories from JSON file
        const fetchedCategories = await fetchCategories();
        setCategories(fetchedCategories);
        
        // Fetch packages from Tebex API
        const packageData = await fetchPackages();
        setPackages(packageData);
        
        // Categorize packages
        const sortedPackages = categorizePackages(packageData, fetchedCategories);
        setCategorizedPackages(sortedPackages);
        
        setLoading(false);
      } catch (err) {
        console.error('Error loading store data:', err);
        setError('Failed to load store data. Please try again later.');
        setLoading(false);
      }
    };

    loadPackagesAndCategories();
  }, [tebexLoaded, categoryRefreshTimestamp]);

  // Refresh categories on demand
  const refreshCategories = async () => {
    try {
      const freshCategories = await refreshCategories();
      setCategories(freshCategories);
      
      // Re-categorize packages with fresh categories
      const sortedPackages = categorizePackages(packages, freshCategories);
      setCategorizedPackages(sortedPackages);
      
      // Update timestamp to trigger reload if needed
      setCategoryRefreshTimestamp(Date.now());
      
      return true;
    } catch (error) {
      console.error('Failed to refresh categories:', error);
      return false;
    }
  };

  // Context value
  const value = {
    tebexLoaded,
    packages,
    categorizedPackages,
    categories,
    loading,
    error,
    setPackages,
    refreshCategories
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

// Helper function to get appropriate icon for category
const getCategoryIcon = (categoryId) => {
  switch (categoryId) {
    case 'vip-packages':
      return <FiStar className="mr-2 text-yellow-400" />;
    case 'game-boosts':
      return <FiTag className="mr-2 text-blue-400" />;
    case 'cosmetics':
      return <FiPackage className="mr-2 text-pink-400" />;
    case 'ranks':
      return <FiStar className="mr-2 text-green-400" />;
    default:
      return <FiPackage className="mr-2 text-purple-400" />;
  }
};

// Simple check component for feature lists
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

/**
 * Store page component displaying packages available for purchase
 */
export default function Store() {
  const { 
    categorizedPackages, 
    loading, 
    error, 
    tebexLoaded,
    categories
  } = useStore();
  
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [animating, setAnimating] = useState(false);

  // Package purchase state
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [purchaseStates, setPurchaseStates] = useState({});
  const [username, setUsername] = useState('');
  const [edition, setEdition] = useState('java');
  const [purchaseError, setPurchaseError] = useState(null);

  // Handle category change with animation
  const handleCategoryChange = (category) => {
    if (category === selectedCategory) return;
    
    setAnimating(true);
    
    // Short delay to allow animation
    setTimeout(() => {
      setSelectedCategory(category);
      setAnimating(false);
    }, 300);
  };

  // Handle purchase button click
  const handlePurchaseClick = (pkg) => {
    // Reset any previous errors
    setPurchaseError(null);
    setSelectedPackage(pkg);
    
    // Check if there's a store error indicating payment system is unavailable
    if (error && error.includes && error.includes('Payment system')) {
      setPurchaseError('Payment system is not available at this time. Please try again later.');
      return;
    }
    
    // Check if user is already logged in (stored in localStorage)
    const savedUsername = localStorage.getItem('minecraft_username');
    const savedEdition = localStorage.getItem('minecraft_edition');
    
    if (savedUsername && savedEdition) {
      setUsername(savedUsername);
      setEdition(savedEdition);
      setShowPaymentDialog(true);
    } else {
      setShowLoginModal(true);
    }
  };
  
  // Handle successful login
  const handleLoginSuccess = (data) => {
    setUsername(data.username);
    setEdition(data.edition);
    setShowLoginModal(false);
    
    // Save the username and edition to localStorage
    localStorage.setItem('minecraft_username', data.username);
    localStorage.setItem('minecraft_edition', data.edition);
    
    // Open payment dialog
    setShowPaymentDialog(true);
  };
  
  // Handle successful payment
  const handlePaymentSuccess = () => {
    // Update purchase state for the specific package
    setPurchaseStates(prev => ({
      ...prev,
      [selectedPackage.id]: true
    }));
    
    setShowPaymentDialog(false);
    
    // Save purchase information to localStorage
    const purchases = JSON.parse(localStorage.getItem('purchases') || '[]');
    purchases.push({
      packageId: selectedPackage.id,
      packageName: selectedPackage.name,
      username,
      edition,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('purchases', JSON.stringify(purchases));
  };
  
  // Handle payment errors
  const handlePaymentError = (error) => {
    console.error('Payment error:', error);
    setPurchaseError('There was an issue processing your payment. Please try again.');
  };

  // Render a package card
  const renderPackageCard = (pkg) => {
    const isPurchased = purchaseStates[pkg.id];
    
    return (
      <div key={pkg.id} className="package-card relative bg-[#1D1E29] rounded-lg shadow-lg p-6 border border-gray-800 hover:border-blue-500 transition-all duration-300">
        {pkg.popular && (
          <div className="absolute top-0 right-0 bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">
            POPULAR
          </div>
        )}
        
        <h3 className="text-xl font-bold text-white mb-2">{pkg.name}</h3>
        <p className="text-gray-400 mb-4">{pkg.description}</p>
        
        <div className="text-3xl font-bold text-purple-600 mb-6">
          {pkg.price}
        </div>
        
        <ul className="mb-6 space-y-2">
          {pkg.features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <FiCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
              <span className="text-gray-300">{feature}</span>
            </li>
          ))}
        </ul>
        
        {purchaseError && selectedPackage && selectedPackage.id === pkg.id && (
          <div className="text-red-500 text-sm mb-2 flex items-center">
            <FiAlertCircle className="mr-1" />
            {purchaseError}
          </div>
        )}
        
        <button
          onClick={() => handlePurchaseClick(pkg)}
          disabled={loading || !tebexLoaded}
          className={`w-full py-3 px-4 rounded-md font-medium flex items-center justify-center transition-colors ${
            isPurchased 
              ? 'bg-green-500 hover:bg-green-600 text-white' 
              : 'bg-purple-600 hover:bg-purple-700 text-white'
          } ${(!tebexLoaded || loading) ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isPurchased ? (
            <>
              <FiCheck className="mr-2" />
              Purchased
            </>
          ) : (
            <>
              <FiShoppingCart className="mr-2" />
              Purchase Now
            </>
          )}
        </button>
      </div>
    );
  };

  // Get all categories for navigation
  const getCategoryButtons = () => {
    if (!categorizedPackages || Object.keys(categorizedPackages).length === 0) {
      return null;
    }

    // If only one category exists and it's "uncategorized", don't show category filters
    if (Object.keys(categorizedPackages).length === 1 && Object.keys(categorizedPackages)[0] === 'uncategorized') {
      return null;
    }

    return (
      <div className="mb-10">
        <div className="flex items-center mb-4">
          <FiFilter className="mr-2 text-blue-400" />
          <h2 className="text-lg font-medium text-white">Filter by Category</h2>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => handleCategoryChange('all')}
            className={`category-btn px-4 py-2 rounded-md transition-all duration-300 ${
              selectedCategory === 'all'
                ? 'bg-blue-500 text-white shadow-lg transform scale-105'
                : 'bg-[#1D1E29] text-gray-300 hover:bg-[#282A3A] border border-gray-700 hover:border-blue-400'
            }`}
          >
            <div className="flex items-center">
              <FiGrid className="mr-2" />
              All Packages
            </div>
          </button>
          
          {Object.values(categorizedPackages).map((category) => (
            category.id !== 'uncategorized' && category.packages && category.packages.length > 0 && (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.id)}
                className={`category-btn px-4 py-2 rounded-md transition-all duration-300 flex items-center ${
                  selectedCategory === category.id
                    ? 'bg-blue-500 text-white shadow-lg transform scale-105'
                    : 'bg-[#1D1E29] text-gray-300 hover:bg-[#282A3A] border border-gray-700 hover:border-blue-400'
                }`}
              >
                {getCategoryIcon(category.id)}
                {category.name}
                <span className="ml-2 bg-gray-700 text-white text-xs px-2 py-0.5 rounded-full">
                  {category.packages.length}
                </span>
              </button>
            )
          ))}
          
          {categorizedPackages.uncategorized && categorizedPackages.uncategorized.packages && categorizedPackages.uncategorized.packages.length > 0 && (
            <button
              onClick={() => handleCategoryChange('uncategorized')}
              className={`category-btn px-4 py-2 rounded-md transition-all duration-300 flex items-center ${
                selectedCategory === 'uncategorized'
                  ? 'bg-blue-500 text-white shadow-lg transform scale-105'
                  : 'bg-[#1D1E29] text-gray-300 hover:bg-[#282A3A] border border-gray-700 hover:border-blue-400'
              }`}
            >
              <FiPackage className="mr-2 text-gray-400" />
              Other Packages
              <span className="ml-2 bg-gray-700 text-white text-xs px-2 py-0.5 rounded-full">
                {categorizedPackages.uncategorized.packages.length}
              </span>
        </button>
          )}
        </div>
    </div>
  );
};

  // Filter packages based on selected category
  const getFilteredPackages = () => {
    // If no packages exist yet
    if (!categorizedPackages || Object.keys(categorizedPackages).length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-400">No packages available</p>
        </div>
      );
    }

    if (selectedCategory === 'all') {
      // Case 1: Only uncategorized packages and nothing else
      if (Object.keys(categorizedPackages).length === 1 && Object.keys(categorizedPackages)[0] === 'uncategorized') {
        // If the packages are in the uncategorized category but it's the only one, show them without the category header
        return (
          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 transition-opacity duration-300 ${animating ? 'opacity-0' : 'opacity-100'}`}>
            {categorizedPackages.uncategorized.packages.map(renderPackageCard)}
          </div>
        );
      } else {
        // Case 2: Regular category display
        return (
          <div className={`transition-opacity duration-300 ${animating ? 'opacity-0' : 'opacity-100'}`}>
            {Object.values(categorizedPackages).map((category) => (
              category.packages && category.packages.length > 0 && (
                <div key={category.id} className="mb-12">
                  <div className="flex items-center mb-6">
                    {getCategoryIcon(category.id)}
                    <h2 className="text-2xl font-bold text-white">
                      {category.name}
                    </h2>
                  </div>
                  {category.description && (
                    <p className="text-gray-400 mb-6">{category.description}</p>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {category.packages.map(renderPackageCard)}
                  </div>
                </div>
              )
            ))}
          </div>
        );
      }
    } else {
      // Case 3: Single selected category
      const selectedCategoryData = categorizedPackages[selectedCategory];
      if (!selectedCategoryData || !selectedCategoryData.packages || selectedCategoryData.packages.length === 0) {
        return (
          <div className="text-center py-8">
            <p className="text-gray-400">No packages available in this category</p>
          </div>
        );
      }

      return (
        <div className={`mb-12 transition-opacity duration-300 ${animating ? 'opacity-0' : 'opacity-100'}`}>
          <div className="flex items-center mb-6">
            {getCategoryIcon(selectedCategoryData.id)}
            <h2 className="text-2xl font-bold text-white">
              {selectedCategoryData.name}
            </h2>
          </div>
          {selectedCategoryData.description && (
            <p className="text-gray-400 mb-6">{selectedCategoryData.description}</p>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {selectedCategoryData.packages.map(renderPackageCard)}
          </div>
        </div>
      );
    }
  };

  return (
    <div className="store-page container mx-auto px-4 py-8">
      <Helmet>
        <title>Store | PvPing MC</title>
        <meta name="description" content="Browse and purchase packages for the PvPing Minecraft server." />
        <style>
          {`
            @keyframes loaderSpin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            
            .loader {
              border: 3px solid rgba(255, 255, 255, 0.1);
              border-radius: 50%;
              border-top: 3px solid #3ABCFD;
              width: 24px;
              height: 24px;
              animation: loaderSpin 0.8s linear infinite;
            }
            
            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(10px); }
              to { opacity: 1; transform: translateY(0); }
            }
            
            .category-fade-in {
              animation: fadeIn 0.5s ease forwards;
            }
            
            .category-btn:hover {
              box-shadow: 0 0 15px rgba(59, 130, 246, 0.3);
            }
            
            .package-card {
              transition: all 0.3s ease;
            }
            
            .package-card:hover {
              transform: translateY(-5px) scale(1.02);
              box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
            }
          `}
        </style>
      </Helmet>

        <div className="mb-16 flex items-center">
          <div className="flex items-center gap-3">
          <div className="bg-[#3ABCFD] rounded-full w-12 h-12 flex items-center justify-center">
            <FiShoppingCart className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Store</h1>
              <div className="w-24 h-1 bg-blue-500 mt-1"></div>
            </div>
          </div>
        </div>
        
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 max-w-2xl mx-auto">
          <p className="font-bold">Error loading store</p>
          <p>{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-16">
          <div className="loader"></div>
          <p className="ml-3 text-gray-300">Loading packages...</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Category Navigation Buttons */}
          <div className="category-fade-in" style={{ animationDelay: '0.1s' }}>
            {getCategoryButtons()}
        </div>
        
          {/* Display filtered packages */}
          <div className="category-fade-in" style={{ animationDelay: '0.3s' }}>
            {getFilteredPackages()}
          </div>
        </div>
      )}

      <div className="mt-16 bg-[#1D1E29] p-6 rounded-lg shadow-md max-w-3xl mx-auto border border-gray-800">
        <h2 className="text-2xl font-bold mb-4 flex items-center text-white">
          <FiDollarSign className="mr-2 text-purple-500" />
          Need a custom package?
        </h2>
        <p className="mb-4 text-gray-300">
          Looking for something specific or want to customize a package for your needs? 
          Contact our support team and we'll be happy to help create a custom solution for you.
        </p>
        <a
          href="https://discord.gg/pvpingmc"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-6 rounded inline-block transition-colors"
        >
          Contact Support
        </a>
      </div>

      {/* Login Modal */}
      <LoginModal 
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={handleLoginSuccess}
      />
      
      {/* Payment Dialog - rendered outside cards at the root level */}
      {selectedPackage && (
        <PaymentDialog
          isOpen={showPaymentDialog}
          onClose={() => setShowPaymentDialog(false)}
          packageDetails={selectedPackage}
          username={username}
          edition={edition}
          onPaymentSuccess={handlePaymentSuccess}
          onPaymentError={handlePaymentError}
        />
      )}
    </div>
  );
}
