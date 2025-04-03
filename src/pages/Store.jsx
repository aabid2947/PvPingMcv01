import React, { useState, useEffect, createContext, useContext } from 'react';
import { Helmet } from 'react-helmet-async';
import { FiShoppingCart, FiDollarSign, FiPackage, FiStar, FiTag, FiFilter, FiGrid, FiAlertCircle, FiPlus } from 'react-icons/fi';
import { fetchCategories, categorizePackages } from '../utils/packageService';
import * as tebexHeadlessService from '../utils/tebexHeadlessService';
import { useCart } from '../contexts/CartContext';
import { useUser } from '../context/UserContext';
import CartModal from '../components/CartModal';
import LoginModal from '../components/LoginModal';
import { useBasket } from '../contexts/BasketContext';

// Create context for store data
export const StoreContext = createContext();

// Store provider component
export function StoreProvider({ children }) {
  const [packages, setPackages] = useState([]);
  const [categorizedPackages, setCategorizedPackages] = useState({});
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoryRefreshTimestamp, setCategoryRefreshTimestamp] = useState(Date.now());

  // Load store categories from JSON file
  useEffect(() => {
    const loadStoreCategories = async () => {
      try {
        const response = await fetch('/store-categories.json');
        if (!response.ok) {
          throw new Error('Failed to load store categories');
        }
        
        const data = await response.json();
        if (data && data.categories) {
          setCategories(data.categories);
        }
      } catch (error) {
        console.error('Error loading store categories:', error);
        setError('Failed to load store categories');
      }
    };
    
    loadStoreCategories();
  }, []);

  // Load packages and categories when component mounts
  useEffect(() => {
    const loadPackagesAndCategories = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Step 1: Fetch categories
        const fetchedCategories = await fetchCategories();
        setCategories(fetchedCategories);
        
        // Step 2: Fetch packages
        let packageData;
        let formattedPackages = [];
        let sortedPackages = {};
        
        try {
          console.log('Fetching packages from Tebex API...');
          packageData = await tebexHeadlessService.fetchPackages();
          
          if (!packageData) {
            console.warn('No package data received from API');
            throw new Error('No package data received');
          }
          
          // Check if we received mock data in production (API fallback)
          const isMockData = !import.meta.env.DEV && 
                            packageData && 
                            Array.isArray(packageData.data) && 
                            packageData.data.some(pkg => pkg.id && pkg.id.toString().includes('mock'));
          
          if (isMockData) {
            console.log('Detected mock data in production - API may be down');
            setError('Store data temporarily unavailable. Showing placeholder content.');
          }
          
          // Format packages for display
          formattedPackages = formatPackagesForDisplay(packageData);
          setPackages(formattedPackages);
          
          // Ensure formattedPackages is an array before categorizing
          if (!Array.isArray(formattedPackages)) {
            console.warn('Formatted packages is not an array', formattedPackages);
            formattedPackages = [];
          }
          
          // Categorize packages - ensure we pass an array to categorizePackages
          sortedPackages = categorizePackages(formattedPackages, fetchedCategories);
        } catch (packageError) {
          console.error('Error loading packages:', packageError);
          formattedPackages = [];
          sortedPackages = {
            uncategorized: {
              id: 'uncategorized',
              name: 'All Packages',
              description: 'All available packages',
              packages: []
            }
          };
          
          // Set a user-friendly error message
          setError('Unable to load store packages. Please try again later or contact support if the issue persists.');
        }
        
        // Update state with whatever data we have
        setPackages(formattedPackages || []);
        setCategorizedPackages(sortedPackages || {
          uncategorized: {
            id: 'uncategorized',
            name: 'All Packages',
            description: 'All available packages',
            packages: []
          }
        });
      } catch (error) {
        console.error('Error in loadPackagesAndCategories:', error);
        setError('Failed to load store. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadPackagesAndCategories();
  }, [categoryRefreshTimestamp]);

  // Refresh categories on demand
  const refreshCategories = async () => {
    try {
      const freshCategories = await fetchCategories();
      setCategories(freshCategories);
      
      // Ensure packages is an array before re-categorizing
      let packagesToUse = packages;
      if (!Array.isArray(packagesToUse)) {
        console.warn('Packages is not an array during refresh', packagesToUse);
        packagesToUse = [];
      }
      
      // Re-categorize packages with fresh categories
      const sortedPackages = categorizePackages(packagesToUse, freshCategories);
      setCategorizedPackages(sortedPackages);
      
      // Update timestamp to trigger reload if needed
      setCategoryRefreshTimestamp(Date.now());
      
      return true;
    } catch (error) {
      console.error('Failed to refresh categories:', error);
      return false;
    }
  };

  // Helper function to format packages for display
  const formatPackagesForDisplay = (packageData) => {
    // Handle undefined or null packageData
    if (!packageData) {
      console.warn('Package data is undefined or null', packageData);
      return [];
    }
    
    // Handle if packageData is already in the correct format - an array of packages
    if (Array.isArray(packageData)) {
      return packageData.map(pkg => ({
        id: pkg.id || `unknown-${Math.random().toString(36).substring(2, 9)}`,
        name: pkg.name || 'Unknown Package',
        description: pkg.description || '',
        price: formatPrice(pkg.price || pkg.base_price || 0, pkg.currency),
        image: pkg.image || null,
        features: extractFeaturesFromDescription(pkg.description || ''),
        popular: pkg.popular || Math.random() > 0.7 // Random popular flag for demo purposes
      }));
    }
    
    // Handle Tebex Headless API format with a data property
    if (packageData && packageData.data) {
      if (Array.isArray(packageData.data)) {
        return packageData.data.map(pkg => ({
          id: pkg.id || `unknown-${Math.random().toString(36).substring(2, 9)}`,
          name: pkg.name || 'Unknown Package',
          description: pkg.description || '',
          price: formatPrice(pkg.base_price || 0, pkg.currency),
          image: pkg.image || null,
          features: extractFeaturesFromDescription(pkg.description || ''),
          popular: pkg.popular || Math.random() > 0.7 // Random popular flag for demo purposes
        }));
      }
    }
    
    // If we get here, we don't recognize the format
    console.warn('Unrecognized package data format', packageData);
    return [];
  };

  // Helper function to format price with currency
  const formatPrice = (price, currency = 'USD') => {
    if (price === undefined || price === null) {
      return '$0.00';
    }
    
    // If price is already a string (like "$9.99"), return it
    if (typeof price === 'string' && price.includes('$')) {
      return price;
    }
    
    // Try to convert to a number if it's a string without currency symbol
    let numericPrice = price;
    if (typeof price === 'string') {
      numericPrice = parseFloat(price.replace(/[^0-9.]/g, ''));
    }
    
    // Check if conversion to number worked
    if (isNaN(numericPrice)) {
      return '$0.00';
    }
    
    // Format using Intl.NumberFormat for localized currency display
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency || 'USD'
      }).format(numericPrice);
    } catch (error) {
      console.error('Error formatting price:', error);
      return `$${numericPrice.toFixed(2)}`;
    }
  };
  
  // Helper function to extract features from description
  const extractFeaturesFromDescription = (description) => {
    // Simple extraction of bullet points from description
    if (!description) return [];
    
    // Look for bullet points or numbered lists in the description
    const lines = description.split(/\n|\r\n/);
    const features = lines
      .filter(line => /^[-•*]|\d+\./.test(line.trim())) // Look for bullet points or numbered lists
      .map(line => line.replace(/^[-•*]|\d+\./, '').trim())
      .filter(line => line.length > 0);
    
    // If no features found but description exists, create a simple feature
    if (features.length === 0 && description.trim().length > 0) {
      return [description];
    }
    
    return features;
  };

  // Context value
  const value = {
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
    categories
  } = useStore();
  
  // Cart context
  const { 
    addToCart, 
    isInCart, 
    getCartItemCount, 
    openCart,
    connectToBasketContext 
  } = useCart();
  
  // Basket context for Tebex integration
  const basketContext = useBasket();
  
  // User context for checking username
  const { username, isLoggedIn, login } = useUser();
  
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [animating, setAnimating] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [basketError, setBasketError] = useState(null);
  const [isContextConnected, setIsContextConnected] = useState(false);
  
  // Connect the cart context to the basket context - only once
  useEffect(() => {
    if (basketContext && !isContextConnected) {
      connectToBasketContext(basketContext);
      console.log('Connected Cart context to Basket context');
      setIsContextConnected(true);
    }
  }, [basketContext, connectToBasketContext, isContextConnected]);
  
  // Check for just-logged-in state based on URL parameter
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const justLoggedIn = queryParams.get('just_logged_in');
    
    if (justLoggedIn === 'true') {
      // Remove the parameter to avoid infinite refreshes
      const newUrl = window.location.pathname + '?just_logged_in=true';
      window.history.replaceState({}, document.title, newUrl);
      
      // Automatically open the cart modal to show the welcome message
      // Use a short delay to ensure the cart context is fully initialized
      setTimeout(() => {
        openCart();
      }, 500);
    }
  }, [openCart]);

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

  // Handle add to cart
  const handleAddToCart = async (pkg, event) => {
    setBasketError(null);
    
    // Check if shift key is pressed for debug mode (force production API)
    if (event && event.shiftKey) {
      // Only activate in development mode
      if (process.env.NODE_ENV === 'development' || import.meta.env.DEV) {
        if (basketContext && basketContext.forceProductionMode) {
          basketContext.forceProductionMode();
          alert('Production mode forced for Tebex API calls. Refresh the page to apply changes.');
          return;
        }
      }
    }
    
    // If user is not logged in (no username), show login modal first
    // Don't initialize basket or add to cart yet
    if (!username || username.trim() === '') {
      setSelectedPackage(pkg);
      setShowLoginModal(true);
      return;
    }
    
    try {
      // Ensure we have a valid basket before adding to cart
      if (basketContext) {
        // Make sure we have a valid basket (create one if needed)
        const basketId = await basketContext.getOrCreateBasket();
        
        if (!basketId) {
          console.error('Failed to get or create basket');
          setBasketError('Failed to initialize your shopping cart. Please try again.');
          return;
        }
        
        console.log(`Adding item to cart with valid basket ID: ${basketId}`);
        
        // Format the package data for the cart
        const cartItem = {
          id: pkg.id,
          name: pkg.name,
          price: pkg.price,
          image: pkg.image || null,
          description: pkg.description || ''
        };
        
        // Add to cart (this will trigger the pending operations in CartContext)
        try {
          // First try to add the package to the basket
          const addResult = await basketContext.addPackageToBasket(pkg.id, 1);
          
          // If this succeeds (no auth redirect), add to cart
          if (addResult) {
            console.log('Package added to basket, adding to cart:', cartItem);
            addToCart(cartItem);
          } else {
            console.log('Package not added to cart - possible auth redirect or error');
          }
        } catch (basketError) {
          console.error('Error adding package to basket:', basketError);
          setBasketError('Failed to add item to your shopping cart. Please try again.');
        }
      } else {
        // No basket context, just add to cart
        addToCart({
          id: pkg.id,
          name: pkg.name,
          price: pkg.price,
          image: pkg.image || null,
          description: pkg.description || ''
        });
      }
    } catch (error) {
      console.error('Error during add to cart:', error);
      setBasketError('Failed to add item to cart. Please try again.');
    }
  };
  
  // Handle login success from the modal
  const handleLoginSuccess = ({ username: newUsername, edition }) => {
    // Save username to context
    login(newUsername);
    
    // Close the modal
    setShowLoginModal(false);
    
    // Show refreshing state
    setIsRefreshing(true);
    
    // Simply redirect to the store page with a parameter to indicate the user just logged in
    // This will ensure contexts are properly initialized with the new username
    window.location.href = window.location.pathname + '?just_logged_in=true';
  };

  // Update post-login actions to just welcome the user, not add items
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const justLoggedIn = queryParams.get('just_logged_in');
    
    if (justLoggedIn === 'true') {
      // Remove the parameter to avoid infinite refreshes
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
      
      // Just open cart to show welcome message after login
      setTimeout(() => {
        openCart();
      }, 500);
    }
  }, [openCart]);

  // Render a package card
  const renderPackageCard = (pkg) => {
    const isPackageInCart = isInCart(pkg.id);
    
    return (
      <div key={pkg.id} className="package-card relative bg-slate-900 rounded-lg shadow-lg p-6 border border-slate-800 hover:border-purple-500 transition-all duration-300">
        {pkg.popular && (
          <div className="absolute top-0 right-0 bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">
            POPULAR
          </div>
        )}
        
        {pkg.image && (
          <div className="mb-4">
            <img 
              src={pkg.image} 
              alt={pkg.name} 
              className="w-full h-48 object-cover rounded-md"
            />
          </div>
        )}
        
        <h3 className="text-xl font-bold text-white mb-2">{pkg.name}</h3>
        {/* <p className="text-gray-400 mb-4 text-sm">{pkg.description}</p> */}
        
        <div className="text-2xl font-bold text-purple-500 mb-6">
          {pkg.price}
        </div>
        
        {/* <ul className="mb-6 space-y-2">
          {pkg.features && pkg.features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <FiCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
              <span className="text-gray-300 text-sm">{feature}</span>
            </li>
          ))}
        </ul> */}
        
        {isPackageInCart ? (
          <div className="flex gap-2">
            <button
              onClick={openCart}
              className="flex-1 py-2 px-4 rounded-md font-medium flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-white transition-colors"
            >
              <FiShoppingCart className="mr-2" />
              View Cart
            </button>
          </div>
        ) : (
          <button
            onClick={(event) => handleAddToCart(pkg, event)}
            disabled={loading}
            className={`w-full py-2 px-4 rounded-md font-medium flex items-center justify-center bg-purple-600 hover:bg-purple-700 text-white transition-colors ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <FiPlus className="mr-2" />
            Add to Cart
          </button>
        )}
      </div>
    );
  };

  // Get all categories for navigation
  const getCategories = () => {
    // Start with the "all" category
    const allCategories = [
      {
        id: 'all',
        name: 'All Packages',
        description: 'View all available packages'
      }
    ];
    
    // Add other categories from the categorizedPackages
    if (categorizedPackages) {
      Object.values(categorizedPackages)
        .sort((a, b) => {
          // Sort by order if available, otherwise alphabetically
          const orderA = a.order || 999;
          const orderB = b.order || 999;
          
          if (orderA !== orderB) return orderA - orderB;
          return a.name.localeCompare(b.name);
        })
        .forEach(category => {
          if (category.id !== 'uncategorized') {
            allCategories.push(category);
          }
        });
    }
    
    return allCategories;
  };

  // Get packages to display based on selected category
  const getPackagesToDisplay = () => {
    if (selectedCategory === 'all') {
      // Get all packages from all categories
      let allPackages = [];
      
      if (categorizedPackages) {
        Object.values(categorizedPackages).forEach(category => {
          if (category.packages && Array.isArray(category.packages)) {
            allPackages = [...allPackages, ...category.packages];
          }
        });
      }
      
      return allPackages;
    }
    
    // Return packages from the selected category
    return categorizedPackages[selectedCategory]?.packages || [];
  };

  return (
    <div className="container mx-auto py-12 px-4 sm:px-6 lg:w-4/5">
      <Helmet>
        <title>Store | PvPingMC</title>
      </Helmet>

      {/* Page refreshing overlay */}
      {isRefreshing && (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
          <p className="mt-6 text-xl text-white">Refreshing page...</p>
          <p className="mt-2 text-sm text-gray-300">
            Please wait while we set up your shopping experience.
          </p>
        </div>
      )}

      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white">PvPingMC Store</h1>
        <p className="text-gray-400 mt-4 max-w-2xl mx-auto">
          Support the server and enhance your gameplay with premium packages and perks.
        </p>
      </div>
      
      {/* Category tabs */}
      <div className="flex overflow-x-auto pb-2 mb-8 scrollbar-hide">
        <div className="flex space-x-2">
          {getCategories().map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryChange(category.id)}
              className={`px-4 py-2 rounded-md whitespace-nowrap flex items-center ${
                selectedCategory === category.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
              }`}
              aria-current={selectedCategory === category.id ? 'page' : undefined}
            >
              {category.id !== 'all' && getCategoryIcon(category.id)}
              {category.name}
            </button>
          ))}
        </div>
            </div>
      
      {/* Error messages */}
      {error && (
        <div className="bg-red-900/20 border border-red-900 rounded-md p-4 mb-8">
          <div className="flex">
            <FiAlertCircle className="h-5 w-5 text-red-500 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-red-400">Error loading store</h3>
              <p className="mt-2 text-sm text-gray-300">{error}</p>
          </div>
          </div>
        </div>
      )}
      
      {basketError && (
        <div className="bg-red-900/20 border border-red-900 rounded-md p-4 mb-8">
          <div className="flex">
            <FiAlertCircle className="h-5 w-5 text-red-500 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-red-400">Shopping Cart Error</h3>
              <p className="mt-2 text-sm text-gray-300">{basketError}</p>
        </div>
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading packages...</p>
        </div>
      )}
      
      {/* Package grid */}
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-opacity duration-300 ${
        animating ? 'opacity-0' : 'opacity-100'
      }`}>
        {!loading && getPackagesToDisplay().map((pkg) => renderPackageCard(pkg))}
      </div>

      {/* Empty state */}
      {!loading && getPackagesToDisplay().length === 0 && !error && (
        <div className="text-center py-12 bg-slate-800/50 rounded-md">
          <FiPackage className="mx-auto h-12 w-12 text-gray-500" />
          <h3 className="mt-2 text-sm font-medium text-gray-300">No packages found</h3>
          <p className="mt-1 text-sm text-gray-400">
            {selectedCategory === 'all'
              ? 'There are no packages available at the moment.'
              : `There are no packages in the selected category.`}
          </p>
        </div>
      )}
      
      {/* Login Modal */}
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => {
          setShowLoginModal(false);
          setSelectedPackage(null);
        }} 
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}
