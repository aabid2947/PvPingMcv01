import React, { useState, useEffect, createContext, useContext } from 'react';
import { Helmet } from 'react-helmet-async';
import { FiShoppingCart, FiDollarSign, FiPackage, FiStar, FiTag, FiFilter, FiGrid, FiAlertCircle, FiPlus } from 'react-icons/fi';
import { fetchCategories, categorizePackages } from '../utils/packageService';
import * as tebexHeadlessService from '../utils/tebexHeadlessService';
import { useCart } from '../contexts/CartContext';
import CartModal from '../components/CartModal';

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
          packageData = await tebexHeadlessService.fetchPackages();
          
          if (!packageData) {
            throw new Error('No package data received');
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
          
          setError('Failed to load store packages. Using empty catalog.');
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
  const { addToCart, isInCart, getCartItemCount, openCart } = useCart();
  
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [animating, setAnimating] = useState(false);

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
  const handleAddToCart = (pkg) => {
    // Format the package data for the cart
    const cartItem = {
      id: pkg.id,
      name: pkg.name,
      price: pkg.price,
      image: pkg.image || null,
      description: pkg.description || ''
    };
    
    addToCart(cartItem);
  };

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
        <p className="text-gray-400 mb-4 text-sm">{pkg.description}</p>
        
        <div className="text-2xl font-bold text-purple-500 mb-6">
          {pkg.price}
        </div>
        
        <ul className="mb-6 space-y-2">
          {pkg.features && pkg.features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <FiCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
              <span className="text-gray-300 text-sm">{feature}</span>
            </li>
          ))}
        </ul>
        
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
            onClick={() => handleAddToCart(pkg)}
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
          <FiFilter className="mr-2 text-purple-400" />
          <h2 className="text-lg font-medium text-white">Filter by Category</h2>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => handleCategoryChange('all')}
            className={`category-btn px-4 py-2 rounded-md transition-all duration-300 ${
              selectedCategory === 'all'
                ? 'bg-purple-600 text-white shadow-lg transform scale-105'
                : 'bg-slate-800 text-gray-300 hover:bg-slate-700 border border-slate-700 hover:border-purple-400'
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
                    ? 'bg-purple-600 text-white shadow-lg transform scale-105'
                    : 'bg-slate-800 text-gray-300 hover:bg-slate-700 border border-slate-700 hover:border-purple-400'
                }`}
              >
                {getCategoryIcon(category.id)}
                {category.name}
                <span className="ml-2 bg-slate-700 text-white text-xs px-2 py-0.5 rounded-full">
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
                  ? 'bg-purple-600 text-white shadow-lg transform scale-105'
                  : 'bg-slate-800 text-gray-300 hover:bg-slate-700 border border-slate-700 hover:border-purple-400'
              }`}
            >
              <FiPackage className="mr-2 text-gray-400" />
              Other Packages
              <span className="ml-2 bg-slate-700 text-white text-xs px-2 py-0.5 rounded-full">
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
              border-top: 3px solid #8B5CF6;
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
              box-shadow: 0 0 15px rgba(139, 92, 246, 0.3);
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
          <div className="bg-purple-600 rounded-full w-12 h-12 flex items-center justify-center">
            <FiShoppingCart className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Store</h1>
            <div className="w-6 h-1 bg-purple-500 mt-1"></div>
          </div>
          </div>
        </div>
        
      {error && (
        <div className="bg-red-900/20 border border-red-800 text-red-400 px-4 py-3 rounded mb-6 max-w-2xl mx-auto">
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

      <div className="mt-16 bg-slate-900 p-6 rounded-lg shadow-md max-w-3xl mx-auto border border-slate-800">
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

      {/* Cart button with count */}
      <div className="fixed bottom-8 right-8 z-30">
        <button
          onClick={openCart}
          className="bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-full shadow-lg flex items-center justify-center transition-colors relative"
          aria-label="Open Cart"
        >
          <FiShoppingCart size={24} />
          {getCartItemCount() > 0 && (
            <span className="absolute -top-2 -right-2 bg-purple-800 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
              {getCartItemCount()}
            </span>
          )}
        </button>
      </div>
      
      {/* Cart Modal */}
      <CartModal />
    </div>
  );
}
