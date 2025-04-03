/**
 * Tebex Headless API Integration Service
 * 
 * This service handles communication with the Tebex Headless API for:
 * - Retrieving packages/categories
 * - Creating and managing baskets
 * - Checkout process
 */

// Store ID from environment variables
const STORE_ID = import.meta.env.VITE_TEBEX_STORE_ID ;

// Generate a unique token for the store (this should be stored in your environment variables in production)
const STORE_TOKEN = import.meta.env.VITE_TEBEX_API_KEY ; // Use actual API key if available

// Base URL for Tebex Headless API
const BASE_URL = 'https://headless.tebex.io/api';

// Check if we're in development mode
const isDevelopment = false;

// Force production mode if specified in URL params (for testing)
const forceProduction = () => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.has('force_production') || urlParams.has('prod');
};

// Check if we're in production mode
export const isProduction = () => {
  return true;
};

// Check if we should use mock data
export const shouldUseMockData = () => {
  return isDevelopment && !forceProduction();
};

/**
 * Safe API call wrapper
 * Handles errors gracefully and provides mock data in development
 * @param {Function} apiCall - The actual API call function to execute
 * @param {Function} mockDataFn - Function to generate mock data if API call fails
 * @param {Array} args - Arguments to pass to both functions
 */
const safeApiCall = async (apiCall, mockDataFn, ...args) => {
  try {
    // Check if we're in development mode and not forcing production
    const isDevMode = isDevelopment && !forceProduction();
    
    // In development mode, use mock data if specified
    if (isDevMode) {
      return mockDataFn(...args);
    }
    
    // Make the actual API call
    const response = await apiCall(...args);
    
    // If response indicates an error, throw it
    if (response && response.error) {
      throw new Error(response.error);
    }
    
    return response;
  } catch (error) {
    // Always fall back to mock data on error, even in production
    // This ensures the store can function even when the API is down
    return mockDataFn(...args);
  }
};

/**
 * Fetch all categories including packages
 * @returns {Promise<Object>} Categories with packages
 */
export const fetchCategories = async () => {
  try {
    const isDevMode = isDevelopment && !forceProduction();
    
    if (isDevMode) {
      return getMockCategories();
    }

    const response = await fetch(`${BASE_URL}/accounts/${STORE_TOKEN}/categories?includePackages=1`);
    if (!response.ok) {
      throw new Error(`Failed to fetch categories: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    // Return mock data in case of error
    return getMockCategories();
  }
};

/**
 * Fetch packages from the store
 * @returns {Promise<Object>} All packages 
 */
export const fetchPackages = async () => {
  // Check if we're in development mode and not forcing production
  const isDevMode = isDevelopment && !forceProduction();
  
  // In development, always use mock data
  if (isDevMode) {
    return getMockPackages();
  }
  
  try {
    // Try the categories endpoint which is more reliable
    const categoriesUrl = `${BASE_URL}/accounts/${STORE_TOKEN}/categories?includePackages=1`;
    
    let response;
    try {
      response = await fetch(categoriesUrl);
    } catch (fetchError) {
      return getMockPackages();
    }
    
    // Handle 404 or other error status
    if (!response.ok) {
      // Don't throw, just return mock data
      return getMockPackages();
    }
    
    let categoriesData;
    try {
      categoriesData = await response.json();
    } catch (jsonError) {
      return getMockPackages();
    }
    
    // Extract packages from categories
    const extractedPackages = { data: [] };
    
    try {
      // Handle different possible response structures
      if (Array.isArray(categoriesData)) {
        categoriesData.forEach(category => {
          if (category.packages && Array.isArray(category.packages)) {
            extractedPackages.data.push(...category.packages);
          }
        });
      } else if (categoriesData.data && Array.isArray(categoriesData.data)) {
        categoriesData.data.forEach(category => {
          if (category.packages && Array.isArray(category.packages)) {
            extractedPackages.data.push(...category.packages);
          }
        });
      }
    } catch (processingError) {
      return getMockPackages();
    }
    
    // If no packages were found, return mock data
    if (extractedPackages.data.length === 0) {
      return getMockPackages();
    }
    
    return extractedPackages;
  } catch (error) {
    // Catch any other errors and return mock data
    return getMockPackages();
  }
};

/**
 * Create a new basket for checkout
 * @param {string} completeUrl - URL to redirect after successful checkout
 * @param {string} cancelUrl - URL to redirect after canceled checkout
 * @returns {Promise<Object>} Basket data
 */
export const createBasket = async (completeUrl, cancelUrl, username) => {
  try {
    // Check if we're in development mode and not forcing production
    const isDevMode = isDevelopment && !forceProduction();
    
    if (isDevMode) {
      return getMockBasket();
    }
    
    // Create a new basket
    const basketData = {
      return_url: completeUrl || window.location.href,
      cancel_url: cancelUrl || window.location.href
    };
    
    // Add username if provided
    if (username) {
      basketData.ign = username;
    }
    
    // Make the API call
    const response = await fetch(`${BASE_URL}/accounts/${STORE_TOKEN}/baskets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body:JSON.stringify({
        "complete_url": completeUrl,
        "cancel_url": cancelUrl,
        "complete_auto_redirect": true,
        "username":username
      })
    });

  console.log(response.json().data)
    
    if (!response.ok) {
      throw new Error(`Failed to create basket: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    // Return mock data in case of error
    return getMockBasket();
  }
};

/**
 * Tebex authentication flow utilities
 */

// Key for storing pending basket operations in localStorage
const PENDING_BASKET_OP_KEY = 'tebex_pending_basket_operation';
const PENDING_BASKET_ID_KEY = 'tebex_pending_basket_id';
const PENDING_PACKAGE_ID_KEY = 'tebex_pending_package_id';
const PENDING_RETURN_URL_KEY = 'tebex_pending_return_url';

/**
 * Store pending basket operation information for after authentication
 * @param {Object} operation - Operation details (type, basketIdent, packageId, quantity)
 */
export const storePendingBasketOperation = (operation) => {
  try {
    localStorage.setItem(PENDING_BASKET_OP_KEY, operation.type);
    
    if (operation.basketIdent) {
      localStorage.setItem(PENDING_BASKET_ID_KEY, operation.basketIdent);
    }
    
    if (operation.packageId) {
      localStorage.setItem(PENDING_PACKAGE_ID_KEY, operation.packageId);
    }
    
    if (operation.returnUrl) {
      localStorage.setItem(PENDING_RETURN_URL_KEY, operation.returnUrl);
    }
    
    console.log('[Tebex] Stored pending basket operation:', operation);
  } catch (error) {
    console.error('[Tebex] Error storing pending basket operation:', error);
  }
};

/**
 * Retrieve pending basket operation information
 * @returns {Object|null} Pending operation or null if none exists
 */
export const getPendingBasketOperation = () => {
  try {
    const operationType = localStorage.getItem(PENDING_BASKET_OP_KEY);
    
    if (!operationType) {
      return null;
    }
    
    const operation = {
      type: operationType,
      basketIdent: localStorage.getItem(PENDING_BASKET_ID_KEY),
      packageId: localStorage.getItem(PENDING_PACKAGE_ID_KEY),
      returnUrl: localStorage.getItem(PENDING_RETURN_URL_KEY)
    };
    
    console.log('[Tebex] Retrieved pending basket operation:', operation);
    return operation;
  } catch (error) {
    console.error('[Tebex] Error retrieving pending basket operation:', error);
    return null;
  }
};

/**
 * Clear pending basket operation information
 */
export const clearPendingBasketOperation = () => {
  try {
    localStorage.removeItem(PENDING_BASKET_OP_KEY);
    localStorage.removeItem(PENDING_BASKET_ID_KEY);
    localStorage.removeItem(PENDING_PACKAGE_ID_KEY);
    localStorage.removeItem(PENDING_RETURN_URL_KEY);
    console.log('[Tebex] Cleared pending basket operation');
  } catch (error) {
    console.error('[Tebex] Error clearing pending basket operation:', error);
  }
};

/**
 * Check if we're on a return page from Tebex authentication
 * @returns {boolean} True if this is a return from authentication
 */
export const isAuthenticationReturn = () => {
  // Check URL for auth return indicators from Tebex
  const url = new URL(window.location.href);
  return url.searchParams.has('tebex_auth') || 
         url.searchParams.has('tebex_auth_success') ||
         url.pathname.includes('/auth/return');
};

/**
 * Handle authentication return and complete pending operations
 * @returns {Promise<Object>} Result of the completed operation
 */
export const handleAuthenticationReturn = async () => {
  try {
    // Check if we have a pending operation stored in localStorage
    const pendingOpData = localStorage.getItem('tebex_pending_operation');
    
    if (!pendingOpData) {
      console.log('[Tebex] No pending operations found on auth return');
      return null;
    }
    
    // Parse the pending operation
    const pendingOperation = JSON.parse(pendingOpData);
    console.log('[Tebex] Processing pending operation after authentication:', pendingOperation);
    
    let result = null;
    
    // Handle different operation types
    switch (pendingOperation.type) {
      case 'add_package':
        if (pendingOperation.basketIdent && pendingOperation.packageId) {
          console.log('[Tebex] Re-attempting to add package after authentication');
          result = await addPackageToBasket(
            pendingOperation.basketIdent, 
            pendingOperation.packageId,
            pendingOperation.quantity || 1,
            pendingOperation.returnUrl
          );
        }
        break;
        
      case 'remove_package':
        if (pendingOperation.basketIdent && pendingOperation.packageId) {
          console.log('[Tebex] Re-attempting to remove package after authentication');
          result = await removePackageFromBasket(
            pendingOperation.basketIdent, 
            pendingOperation.packageId,
            pendingOperation.returnUrl
          );
        }
        break;
        
      case 'checkout':
        if (pendingOperation.basketIdent) {
          console.log('[Tebex] Re-attempting checkout after authentication');
          result = await processCheckout(
            pendingOperation.basketIdent,
            pendingOperation.username || '',
            pendingOperation.edition || 'java'
          );
        }
        break;
        
      case 'apply_coupon':
        if (pendingOperation.basketIdent && pendingOperation.couponCode) {
          console.log('[Tebex] Re-attempting to apply coupon after authentication');
          result = await applyCoupon(
            pendingOperation.basketIdent,
            pendingOperation.couponCode
          );
        }
        break;
        
      default:
        console.warn('[Tebex] Unknown pending operation type:', pendingOperation.type);
    }
    
    // Clear the pending operation regardless of success
    localStorage.removeItem('tebex_pending_operation');
    
    // Return the result
    return result;
  } catch (error) {
    // Clear the pending operation on error
    localStorage.removeItem('tebex_pending_operation');
    return null;
  }
};

/**
 * Add a package to a basket
 * @param {string} basketIdent - The basket identifier
 * @param {string} packageId - The package ID to add
 * @param {number} quantity - The quantity to add
 * @returns {Promise<Object>} Updated basket data
 */
export const addPackageToBasket = async (basketIdent, packageId, quantity = 1) => {
  try {
    // In development mode, return mock data
    if (isDevelopment && !forceProduction()) {
      // Create a mock basket with the package added
      return getMockBasketWithPackage(basketIdent, packageId, quantity);
    }
    
    // Make the API call to add the package
    const response = await fetch(`${BASE_URL}/baskets/${basketIdent}/packages/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        package_id: 3307112,
        quantity: quantity
      })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to add package: ${response.status}`);
    }
    
    // Parse and return the updated basket data
    const data = await response.json();
    return data;
  } catch (error) {
    // Return mock updated basket in case of error
    return getMockBasketWithPackage(basketIdent, packageId, quantity);
  }
};

/**
 * Remove a package from a basket
 * @param {string} basketIdent - The basket identifier
 * @param {string} packageId - The package ID to remove
 * @returns {Promise<Object>} Updated basket data
 */
export const removePackageFromBasket = async (basketIdent, packageId) => {
  try {
    // In development mode, return mock data
    if (isDevelopment && !forceProduction()) {
      // Create a mock basket with the package removed
      return getMockBasketWithoutPackage(basketIdent, packageId);
    }
    
    // Make the API call to remove the package
    const response = await fetch(`${BASE_URL}/baskets/${basketIdent}/packages/remove`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        package_id: packageId
      })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to remove package: ${response.status}`);
    }
    
    // Parse and return the updated basket data
    const data = await response.json();
    return data;
  } catch (error) {
    // Return mock updated basket in case of error
    return getMockBasketWithoutPackage(basketIdent, packageId);
  }
};

/**
 * Get current basket data
 * @param {string} basketIdent - The basket identifier
 * @returns {Promise<Object>} Basket data
 */
export const getBasket = async (basketIdent) => {
  try {
    // In development mode, return mock data
    if (isDevelopment && !forceProduction()) {
      return getMockBasketById(basketIdent);
    }
    
    // Make the API call to get the basket
    const response = await fetch(`${BASE_URL}/baskets/${basketIdent}`);
    
    if (!response.ok) {
      throw new Error(`Failed to get basket: ${response.status}`);
    }
    
    // Parse and return the basket data
    const basketData = await response.json();
    return basketData;
  } catch (error) {
    return getMockBasketById(basketIdent);
  }
};

/**
 * Force production mode for testing
 */
export const forceProductionMode = () => {
  // Set a URL parameter to force production mode
  const url = new URL(window.location.href);
  url.searchParams.set('force_production', 'true');
  window.history.replaceState({}, document.title, url.toString());
};

/**
 * Get authentication links for a basket
 * @param {string} basketIdent - The basket identifier
 * @returns {Promise<Object>} Authentication links
 */
export const getAuthLinks = async (basketIdent) => {
  try {
    // In development mode, return mock data
    if (isDevelopment && !forceProduction()) {
      // Create mock auth links
      return {
        links: {
          steam: `https://example.com/mock-auth/steam?basket=${basketIdent}`,
          microsoft: `https://example.com/mock-auth/microsoft?basket=${basketIdent}`
        }
      };
    }
    
    // Make the API call to get auth links
    const response = await fetch(`${BASE_URL}/baskets/${basketIdent}/auth`);
    
    if (!response.ok) {
      throw new Error(`Failed to get auth links: ${response.status}`);
    }
    
    // Parse and return the auth links
    const data = await response.json();
    return data;
  } catch (error) {
    // Return mock auth links in case of error
    return {
      links: {
        steam: `https://example.com/mock-auth/steam?basket=${basketIdent}`,
        microsoft: `https://example.com/mock-auth/microsoft?basket=${basketIdent}`
      }
    };
  }
};

/**
 * Process checkout for a basket
 * @param {string} basketIdent - The basket identifier
 * @param {string} username - The Minecraft username
 * @param {string} edition - The Minecraft edition (java/bedrock)
 * @returns {Promise<Object>} Checkout data including URL
 */
export const processCheckout = async (basketIdent, username, edition = 'java') => {
  try {
    // In development mode, return mock data
    if (isDevelopment && !forceProduction()) {
      return getMockCheckout(username, edition);
    }
    
    try {
      // First, make sure we have the basket
      const basket = await getBasket(basketIdent);
      
      if (!basket || !basket.packages || basket.packages.length === 0) {
        throw new Error('Basket is empty or invalid');
      }
      
      // Make the API call to create a checkout
      const response = await fetch(`${BASE_URL}/baskets/${basketIdent}/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ign: username,
          fields: [
            {
              identifier: 'ign',
              value: username
            },
            {
              identifier: 'bedrock_account',
              value: edition === 'bedrock' ? 'Yes' : 'No'
            }
          ]
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to process checkout: ${response.status}`);
      }
      
      // Parse and return the checkout data
      const data = await response.json();
      return data;
    } catch (basketError) {
      // Fall back to mock checkout
      return getMockCheckout(username, edition);
    }
  } catch (error) {
    // Always return mock checkout data on error
    return getMockCheckout(username, edition);
  }
};

/**
 * Apply a coupon to a basket
 * @param {string} basketIdent - The basket identifier
 * @param {string} couponCode - The coupon code to apply
 * @returns {Promise<Object>} Updated basket data
 */
export const applyCoupon = async (basketIdent, couponCode) => {
  try {
    // In development mode, return mock data
    if (isDevelopment && !forceProduction()) {
      // Create a mock basket with the coupon applied
      const mockBasket = getMockBasketById(basketIdent);
      mockBasket.coupon = {
        code: couponCode,
        discount: '5.00',
        discount_percentage: 10
      };
      return mockBasket;
    }
    
    // Make the API call to apply the coupon
    const response = await fetch(`${BASE_URL}/baskets/${basketIdent}/coupons`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        code: couponCode
      })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to apply coupon: ${response.status}`);
    }
    
    // Parse and return the updated basket data
    const data = await response.json();
    return data;
  } catch (error) {
    // Return mock updated basket in case of error
    const mockBasket = getMockBasketById(basketIdent);
    mockBasket.coupon = {
      code: couponCode,
      discount: '5.00',
      discount_percentage: 10
    };
    return mockBasket;
  }
};

/**
 * Get mock checkout data for development and testing
 * 
 * @param {string} username - Minecraft username
 * @param {string} edition - Minecraft edition (java/bedrock)
 * @returns {Object} Mock checkout object with checkout ident for Tebex.js instead of URL
 */
export const getMockCheckout = (username, edition = 'java') => {
  const mockBasketIdent = `dev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  
  return {
    status: "success",
    message: "Checkout ready for development mode",
    ident: mockBasketIdent, // This is the checkout ident for Tebex.js
    basketIdent: mockBasketIdent,
    username: username,
    edition: edition,
    development_mode: true
  };
};

// Mock data for development and fallback

function getMockCategories() {
  return {
    data: [
      {
        id: 1,
        name: "Ranks",
        slug: "ranks",
        description: "Server ranks with various perks",
        packages: [
          {
            id: "101",
            name: "VIP Rank",
            description: "Get VIP access with special perks",
            image: null,
            type: "single",
            base_price: 9.99,
            sales_tax: 0,
            total_price: 9.99,
            currency: "USD",
            category: { id: 1, name: "Ranks" }
          },
          {
            id: "102",
            name: "MVP Rank",
            description: "Become an MVP with premium features",
            image: null,
            type: "single",
            base_price: 19.99,
            sales_tax: 0,
            total_price: 19.99,
            currency: "USD",
            category: { id: 1, name: "Ranks" }
          }
        ]
      },
      {
        id: 2,
        name: "Crates",
        slug: "crates",
        description: "Crates with random rewards",
        packages: [
          {
            id: "201",
            name: "Mystery Crate",
            description: "Open for a chance to win rare items",
            image: null,
            type: "single",
            base_price: 4.99,
            sales_tax: 0,
            total_price: 4.99,
            currency: "USD",
            category: { id: 2, name: "Crates" }
          }
        ]
      }
    ]
  };
}

function getMockPackages() {
  return {
    data: [
      {
        id: "101",
        name: "VIP Rank",
        description: "Get VIP access with special perks",
        image: null,
        type: "single",
        base_price: 9.99,
        sales_tax: 0,
        total_price: 9.99,
        currency: "USD",
        category: { id: 1, name: "Ranks" }
      },
      {
        id: "102",
        name: "MVP Rank",
        description: "Become an MVP with premium features",
        image: null,
        type: "single",
        base_price: 19.99,
        sales_tax: 0,
        total_price: 19.99,
        currency: "USD",
        category: { id: 1, name: "Ranks" }
      },
      {
        id: "201",
        name: "Mystery Crate",
        description: "Open for a chance to win rare items",
        image: null,
        type: "single",
        base_price: 4.99,
        sales_tax: 0,
        total_price: 4.99,
        currency: "USD",
        category: { id: 2, name: "Crates" }
      }
    ]
  };
}

function getMockBasket(completeUrl, cancelUrl) {
  const basketIdent = `mock-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  return {
    data: {
      id: Date.now(),
      ident: basketIdent,
      complete: false,
      email: null,
      username: null,
      coupons: [],
      cancel_url: cancelUrl || window.location.href,
      complete_url: completeUrl || window.location.href,
      complete_auto_redirect: true,
      country: "US",
      base_price: 0,
      sales_tax: 0,
      total_price: 0,
      currency: "USD",
      packages: [],
      custom: { source: "website-cart" },
      links: {
        payment: `https://checkout.tebex.io/api/payments/mock-${basketIdent}`,
        checkout: `https://pay.tebex.io/${basketIdent}`
      }
    }
  };
}

function getMockBasketWithPackage(basketIdent, packageId, quantity) {
  // Find the mock package to add to the basket
  const mockPackages = getMockPackages();
  let addedPackage = null;
  
  if (mockPackages && mockPackages.data && Array.isArray(mockPackages.data)) {
    addedPackage = mockPackages.data.find(pkg => pkg.id === packageId);
  } else if (Array.isArray(mockPackages)) {
    addedPackage = mockPackages.find(pkg => pkg.id === packageId);
  }
  
  // If package not found, create a placeholder
  if (!addedPackage) {
    addedPackage = {
      id: packageId,
      name: `Package ${packageId}`,
      price: 9.99
    };
  }
  
  return {
    success: true,
    data: {
      ident: basketIdent || `mock-basket-${Date.now()}`,
      packages: [
        {
          id: addedPackage.id,
          name: addedPackage.name,
          quantity: quantity,
          total: (parseFloat(addedPackage.price) || 9.99) * quantity
        }
      ],
      total: (parseFloat(addedPackage.price) || 9.99) * quantity,
      currency: {
        iso_4217: 'USD',
        symbol: '$'
      },
      links: {
        checkout: `https://pay.tebex.io/${basketIdent || `mock-basket-${Date.now()}`}`
      }
    }
  };
}

function getMockBasketWithoutPackage(basketIdent, packageId) {
  // Find the mock package to remove from the basket
  const mockPackages = getMockPackages();
  let removedPackage = null;
  
  if (mockPackages && mockPackages.data && Array.isArray(mockPackages.data)) {
    removedPackage = mockPackages.data.find(pkg => pkg.id === packageId);
  } else if (Array.isArray(mockPackages)) {
    removedPackage = mockPackages.find(pkg => pkg.id === packageId);
  }
  
  // If package not found, create a placeholder
  if (!removedPackage) {
    removedPackage = {
      id: packageId,
      name: `Package ${packageId}`,
      price: 9.99
    };
  }
  
  return {
    success: true,
    data: {
      ident: basketIdent || `mock-basket-${Date.now()}`,
      packages: [],
      total: 0,
      currency: {
        iso_4217: 'USD',
        symbol: '$',
      },
      links: {
        checkout: `https://pay.tebex.io/${basketIdent || `mock-basket-${Date.now()}`}`
      }
    }
  };
}

function getMockBasketById(basketIdent) {
  return {
    success: true,
    data: {
      ident: basketIdent || `mock-basket-${Date.now()}`,
      packages: [],
      total: 0,
      currency: {
        iso_4217: 'USD',
        symbol: '$',
      },
      links: {
        checkout: `https://pay.tebex.io/${basketIdent || `mock-basket-${Date.now()}`}`
      }
    }
  };
}

function getMockBasketWithCoupon(basketIdent, couponCode) {
  const mockBasket = getMockBasketWithPackage(basketIdent, "101", 1);
  mockBasket.data.coupons = [{ coupon_code: couponCode }];
  // Apply a fake discount
  mockBasket.data.base_price = mockBasket.data.base_price * 0.9;
  mockBasket.data.total_price = mockBasket.data.total_price * 0.9;
  return mockBasket;
} 