import storeImg from "../assets/store.png"
import React, { useState, useEffect } from 'react';
import { FiShoppingCart, FiPackage, FiStar, FiShield, FiTool, FiShoppingBag, FiInfo } from 'react-icons/fi';
import arrow from "../assets/arrow.png"
import { getStoreProducts, getStoreCategories, getTebexCategories, getPackageDetails } from '../services/api';
import PurchaseButton from '../components/PurchaseButton';
import { useUser } from '../context/UserContext';

// Load Tebex SDK
const loadTebexScript = () => {
  return new Promise((resolve, reject) => {
    if (document.querySelector('script[src*="tebex.io"]')) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    // Use the official Tebex CDN URL
    script.src = 'https://js.tebex.io/v/1.js';
    script.async = true;
    script.onload = () => {
      if (window.tebex) {
        // Your store ID - replace 'your-store-id' with your actual Tebex store ID
        window.tebex.store.setup('your-store-id');
        console.log('Tebex SDK loaded successfully');
        resolve();
      } else {
        reject(new Error('Tebex SDK failed to load'));
      }
    };
    script.onerror = () => reject(new Error('Could not load Tebex SDK'));
    document.head.appendChild(script);
  });
};

const StoreItem = ({ id, name, price, description, category, image, url, bestseller }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const { isLoggedIn, username } = useUser();

  const handleViewDetails = async (e) => {
    // Prevent event bubbling
    e.preventDefault();
    e.stopPropagation();
    
    setShowDetails(true);
    
    if (!details && !loading) {
      setLoading(true);
      try {
        const packageDetails = await getPackageDetails(id);
        setDetails(packageDetails);
      } catch (error) {
        console.error('Failed to fetch package details:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCloseDetails = (e) => {
    // Prevent event bubbling
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    setShowDetails(false);
  };

  return (
    <div 
      className="bg-[#111827] rounded-xl overflow-hidden shadow-lg transition-transform duration-300 hover:transform hover:scale-105"
     // Prevent clicks from reaching parent elements
     onClick={(e) => e.stopPropagation()}
    >
      <div className="relative">
        <div className="h-48 bg-[#1F2937]">
          <img 
            src={image || storeImg} 
            alt={name} 
            className="w-full h-full object-cover"
          />
        </div>
        {bestseller && (
          <div className="absolute top-3 right-3 bg-yellow-500 text-black text-sm font-bold px-3 py-1 rounded">
            BESTSELLER
          </div>
        )}
      </div>
      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-2xl font-bold text-white">{name}</h3>
          <span className="text-xl font-bold text-purple-400">${price}</span>
        </div>
        <p className="text-gray-400 text-lg mb-5 line-clamp-2">{description}</p>
        
        {/* Details section that shows when clicked */}
        {showDetails && (
          <div className="mb-4 p-3 bg-[#131827] rounded-lg">
            {loading ? (
              <div className="text-center py-3">
                <div className="inline-block animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500 mb-2"></div>
                <p className="text-sm text-gray-300">Loading details...</p>
              </div>
            ) : details ? (
              <div>
                <h4 className="text-lg font-semibold mb-2 text-purple-300">What's included:</h4>
                <div className="text-sm text-gray-300">
                  {details.commands && details.commands.length > 0 ? (
                    <ul className="list-disc pl-5 space-y-1">
                      {details.commands.map((cmd, index) => (
                        <li key={index}>
                          {cmd.description || 'Server command'} {cmd.conditions && <span className="text-xs text-gray-400">({cmd.conditions})</span>}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No detailed information available</p>
                  )}
                </div>
                
                {details.availability && details.availability.type !== 'standard' && (
                  <div className="mt-3">
                    <p className="text-sm font-semibold text-amber-400">
                      {details.availability.type === 'limited' ? 'Limited Availability!' : 'Special Offer!'}
                    </p>
                    {details.availability.message && (
                      <p className="text-xs text-gray-400">{details.availability.message}</p>
                    )}
                  </div>
                )}
                
                {details.requires_player && (
                  <div className="mt-2 text-xs text-amber-500">
                    * Requires player to be online
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-400">Failed to load details</p>
            )}
            <button 
              onClick={handleCloseDetails} 
              className="mt-2 text-sm text-blue-400 hover:text-blue-300"
            >
              Close details
            </button>
          </div>
        )}
        
        <div className="flex flex-col space-y-2">
          <PurchaseButton 
            packageId={id}
            packageName={name}
            price={price}
            description={description}
          />
          
          {/* {!showDetails && (
            <button
              onClick={handleViewDetails}
              className="w-full py-2 px-4 bg-transparent border border-purple-500 text-purple-400 text-sm font-medium rounded-lg hover:bg-purple-900/20 transition-colors flex items-center justify-center gap-2"
            >
              <FiInfo /> View Details
        </button>
          )} */}
        </div>
      </div>
    </div>
  );
};

export default function StorePage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [storeItems, setStoreItems] = useState([]);
  const [categories, setCategories] = useState([
    { id: 'all', name: 'All Items', icon: <FiPackage /> }
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tebexLoaded, setTebexLoaded] = useState(false);
  
  // Load Tebex SDK
  useEffect(() => {
    const loadTebex = async () => {
      try {
        // In development mode, we can skip the actual Tebex loading and just set tebexLoaded to true
        if (process.env.NODE_ENV === 'development') {
          console.log('Development mode: Skipping Tebex SDK loading');
          setTebexLoaded(true);
          return;
        }
        
        await loadTebexScript();
        setTebexLoaded(true);
      } catch (error) {
        console.error('Error loading Tebex SDK:', error);
        
        // In development mode, we can still allow the app to function
        if (process.env.NODE_ENV === 'development') {
          console.warn('Development mode: Continuing despite Tebex loading error');
          setTebexLoaded(true);
        } else {
          setError('Failed to load payment system. Please try again later.');
        }
      }
    };
    
    loadTebex();
  }, []);
  
  useEffect(() => {
    const fetchStoreData = async () => {
      try {
        setLoading(true);
        
        // Fetch products directly with included categories
        const products = await getStoreProducts();
        
        if (products && products.length > 0) {
          setStoreItems(products);
          
          // Extract unique categories from products
          const uniqueCategories = new Map();
          
          products.forEach(product => {
            if (product.category && product.category_id) {
              if (!uniqueCategories.has(product.category_id)) {
                // Determine icon based on category name
                let icon = <FiPackage />;
                const categoryName = product.category.toLowerCase();
                
                if (categoryName.includes('rank')) icon = <FiStar />;
                else if (categoryName.includes('crate')) icon = <FiPackage />;
                else if (categoryName.includes('kit')) icon = <FiShield />;
                else if (categoryName.includes('tool')) icon = <FiTool />;
                
                uniqueCategories.set(product.category_id, {
                  id: product.category_id.toString(),
                  name: product.category.charAt(0).toUpperCase() + product.category.slice(1),
                  icon
                });
              }
            }
          });
          
          // Create category list with "All Items" first
          const categoryList = [
    { id: 'all', name: 'All Items', icon: <FiPackage /> },
            ...Array.from(uniqueCategories.values())
  ];
  
          setCategories(categoryList);
        } else {
          // Fallback for development if no products
          setStoreItems([
    {
      id: 1,
      name: "VIP Rank",
              price: "9.99",
      description: "Get VIP status with special perks and privileges on the server.",
      category: "ranks",
              category_id: "ranks",
              url: "#",
      bestseller: true
    },
    {
      id: 2,
      name: "MVP Rank",
              price: "19.99",
      description: "Upgrade to MVP for premium features and exclusive access.",
      category: "ranks",
              category_id: "ranks",
              url: "#",
      bestseller: false
    },
    {
      id: 3,
      name: "Legendary Crate",
              price: "14.99",
      description: "Unlock rare items and special rewards with this legendary crate.",
      category: "crates",
              category_id: "crates",
              url: "#",
      bestseller: true
    },
    {
      id: 4,
      name: "Mystery Crate",
              price: "7.99",
      description: "Try your luck with our mystery crate filled with random goodies.",
      category: "crates",
              category_id: "crates",
              url: "#",
      bestseller: false
            }
          ]);
          
          // Set default categories
          setCategories([
            { id: 'all', name: 'All Items', icon: <FiPackage /> },
            { id: 'ranks', name: 'Ranks', icon: <FiStar /> },
            { id: 'crates', name: 'Crates', icon: <FiPackage /> },
            { id: 'kits', name: 'Kits', icon: <FiShield /> }
          ]);
        }
      } catch (err) {
        console.error('Error fetching store data:', err);
        setError('Failed to load store items. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchStoreData();
  }, []);
  
  // Filter items based on selected category
  const filteredItems = activeCategory === 'all' 
    ? storeItems 
    : storeItems.filter(item => {
        // If we're using numeric IDs from Tebex API
        if (!isNaN(activeCategory)) {
          return item.category_id?.toString() === activeCategory;
        }
        // Using string-based category names
        return item.category === activeCategory;
      });

  return (
    <div className="w-full bg-[#13141d] text-white min-h-screen pb-16">
      <div className="container mx-auto md:w-4/5 px-4 py-12">
        <div className="mb-8 flex items-center">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500 rounded-full w-12 h-12 flex items-center justify-center">
              <FiShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Store</h1>
              <div className="w-24 h-1 bg-blue-500 mt-1"></div>
            </div>
          </div>
          <div className="w-8 h-8 ml-4">
            <img src={arrow} alt="" />
          </div>
        </div>
        
        <p className="text-gray-300 text-xl mb-8">
          Support our server and enhance your gameplay with exclusive items and perks
        </p>
        
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category) => (
            <button
              key={category.id}
              className={`flex items-center gap-2 px-6 py-3 rounded-full text-lg font-medium transition-colors ${
                activeCategory === category.id
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                  : 'bg-[#111827] text-gray-300 hover:bg-[#1F2937]'
              }`}
              onClick={() => setActiveCategory(category.id)}
            >
              {category.icon}
              {category.name}
            </button>
          ))}
        </div>
        
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-xl text-gray-300">Loading store items...</p>
          </div>
        )}
        
        {error && !loading && (
          <div className="text-center py-8 mb-8">
            <p className="text-xl text-red-400">{error}</p>
          </div>
        )}
        
        {!loading && filteredItems.length === 0 && (
          <div className="text-center py-12 bg-[#111827]/60 backdrop-blur-sm rounded-xl shadow-lg">
            <p className="text-xl text-gray-400">No items found in this category</p>
            <p className="text-gray-400 mt-2">Try selecting a different category or check back later for new items.</p>
          </div>
        )}
        
        {!loading && filteredItems.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredItems.map((item) => (
            <StoreItem key={item.id} {...item} />
          ))}
        </div>
        )}
        
        <div className="mt-16 bg-[#111827]/80 backdrop-blur-sm rounded-xl p-8 shadow-lg shadow-blue-900/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 text-transparent bg-clip-text mb-3">Need a custom package?</h2>
              <p className="text-gray-300 text-lg">
                If you don't see what you're looking for, contact our support team to discuss custom packages for your needs.
              </p>
            </div>
            <a 
              href="http://pvpingmc.net/discord" 
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xl font-medium rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors whitespace-nowrap shadow-lg hover:shadow-purple-600/20"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
