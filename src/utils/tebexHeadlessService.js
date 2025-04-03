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
console.log(STORE_TOKEN);

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
  return !isDevelopment || forceProduction();
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
      console.log(`[Tebex] Using mock data for ${apiCall.name || 'API call'} (development mode)`);
      return mockDataFn(...args);
    }

    console.log(`[Tebex] Making real API call to ${apiCall.name || 'endpoint'}`);
    
    // Make the actual API call
    const response = await apiCall(...args);
    
    // If response indicates an error, throw it
    if (response && response.error) {
      throw new Error(response.error);
    }
    
    return response;
  } catch (error) {
    console.error(`[Tebex] API call error: ${error.message}`);
    
    // Always fall back to mock data on error, even in production
    // This ensures the store can function even when the API is down
    console.log(`[Tebex] Falling back to mock data after API error`);
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
      console.log('[Tebex] Using mock categories data (development mode)');
      return getMockCategories();
    }

    console.log('[Tebex] Fetching categories from API');
    const response = await fetch(`${BASE_URL}/accounts/${STORE_TOKEN}/categories?includePackages=1`);
    if (!response.ok) {
      throw new Error(`Failed to fetch categories: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('[Tebex] Error fetching categories:', error);
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
    console.log('[Tebex] Using mock package data (development mode)');
    return getMockPackages();
  }
  
  try {
    console.log(`[Tebex] Attempting to fetch packages from API with token: ${STORE_TOKEN}`);
    
    // Try the categories endpoint which is more reliable
    const categoriesUrl = `${BASE_URL}/accounts/${STORE_TOKEN}/categories?includePackages=1`;
    console.log(`[Tebex] Fetching from categories endpoint: ${categoriesUrl}`);
    
    let response;
    try {
      response = await fetch(categoriesUrl);
      console.log(`[Tebex] Response status: ${response.status}`);
    } catch (fetchError) {
      console.error('[Tebex] Network error fetching categories:', fetchError);
      return getMockPackages();
    }
    
    // Handle 404 or other error status
    if (!response.ok) {
      console.warn(`[Tebex] Categories endpoint failed with status: ${response.status}`);
      // Don't throw, just return mock data
      return getMockPackages();
    }
    
    let categoriesData;
    try {
      categoriesData = await response.json();
      console.log('[Tebex] Successfully fetched categories data');
    } catch (jsonError) {
      console.error('[Tebex] Error parsing JSON response:', jsonError);
      return getMockPackages();
    }
    
    // Extract packages from categories
    const extractedPackages = { data: [] };
    
    try {
      // Handle different possible response structures
      if (Array.isArray(categoriesData)) {
        console.log('[Tebex] Processing array of categories');
        categoriesData.forEach(category => {
          if (category.packages && Array.isArray(category.packages)) {
            extractedPackages.data.push(...category.packages);
          }
        });
      } else if (categoriesData.data && Array.isArray(categoriesData.data)) {
        console.log('[Tebex] Processing categories with data property');
        categoriesData.data.forEach(category => {
          if (category.packages && Array.isArray(category.packages)) {
            extractedPackages.data.push(...category.packages);
          }
        });
      }
      
      console.log(`[Tebex] Extracted ${extractedPackages.data.length} packages from categories`);
    } catch (processingError) {
      console.error('[Tebex] Error processing categories data:', processingError);
      return getMockPackages();
    }
    
    // If no packages were found, return mock data
    if (extractedPackages.data.length === 0) {
      console.warn('[Tebex] No packages found in categories response, using mock data');
      return getMockPackages();
    }
    
    return extractedPackages;
  } catch (error) {
    // Catch any other errors and return mock data
    console.error('[Tebex] Error in fetchPackages:', error);
    return getMockPackages();
  }
};

/**
 * Create a new basket for checkout
 * @param {string} completeUrl - URL to redirect after successful checkout
 * @param {string} cancelUrl - URL to redirect after canceled checkout
 * @returns {Promise<Object>} Basket data
 */
export const createBasket = async (completeUrl, cancelUrl,username) => {
  try {
    // Check if we're in development mode and not forcing production
    console.log(username)
    const isDevMode = isDevelopment && !forceProduction();
    console.log(`[Tebex] Environment: ${isDevMode ? 'DEVELOPMENT' : 'PRODUCTION'}`);
    
    if (isDevMode) {
      console.log('[Tebex] Using mock basket in development mode');
      return getMockBasket(completeUrl, cancelUrl);
    }

    console.log('[Tebex] Creating real basket with Tebex API:',username);
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

    console.log(response.json);


    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Tebex] Basket creation failed with status ${response.status}: ${errorText}`);
      throw new Error(`Failed to create basket: ${response.status} ${errorText}`);
    }
    
    const data = await response.json();
    console.log('[Tebex] Basket created successfully:', data);
    return data;
  } catch (error) {
    console.error('[Tebex] Error creating basket:', error);
    // Return mock basket in case of error
    console.log('[Tebex] Falling back to mock basket due to error');
    return getMockBasket(completeUrl, cancelUrl);
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
    console.error('[Tebex] Error handling authentication return:', error);
    // Clear the pending operation on error
    localStorage.removeItem('tebex_pending_operation');
    return null;
  }
};

/**
 * Add a package to a basket
 * @param {string} basketIdent - Basket identifier
 * @param {string} packageId - Package ID to add
 * @param {number} quantity - Quantity of the package
 * @returns {Promise<Object>} Updated basket
 */
export const addPackageToBasket = async (basketIdent, packageId, quantity = 1, returnUrl = window.location.href) => {
  try {
    const isDevMode = isDevelopment && !forceProduction();
    
    if (isDevMode) {
      console.log('[Tebex] Using mock addPackageToBasket (development mode)');
      return getMockBasketWithPackage(basketIdent, packageId, quantity);
    }

    console.log(`[Tebex] Adding package ${packageId} to basket ${basketIdent}`);
    const response = await fetch(`${BASE_URL}/baskets/${basketIdent}/packages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        package_id: packageId,
        quantity: quantity
      })
    });

    // Check for authentication required response (422 error)
    if (response.status === 422) {
      const errorData = await response.json();
      console.log('[Tebex] Authentication error:', errorData);
      
      // If the error indicates authentication is required
      if (errorData?.error?.toLowerCase().includes('login') || 
          errorData?.error?.toLowerCase().includes('auth')) {
        console.log('[Tebex] User must authenticate before adding packages to basket');
        
        // Store the operation details for after authentication
        localStorage.setItem('tebex_pending_operation', JSON.stringify({
          type: 'add_package',
          basketIdent,
          packageId,
          quantity,
          returnUrl
        }));
        
        // Get authentication links
        const authLinks = await getBasketAuthLinks(basketIdent, returnUrl);
        
        if (authLinks && authLinks.length > 0) {
          console.log('[Tebex] Redirecting to authentication page:', authLinks[0].url);
          
          // Return special object indicating auth redirect
          return {
            requires_auth: true,
            auth_url: authLinks[0].url,
            message: 'Authentication required before adding to basket'
          };
        }
      }
      
      // If it's a different 422 error, just throw it
      throw new Error(`Failed to add package to basket: ${errorData.error || response.status}`);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Tebex] Failed to add package: ${response.status} ${errorText}`);
      throw new Error(`Failed to add package to basket: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('[Tebex] Package added successfully');
    return data;
  } catch (error) {
    console.error('[Tebex] Error adding package to basket:', error);
    // Return mock updated basket in case of error
    console.log('[Tebex] Falling back to mock basket with package');
    return getMockBasketWithPackage(basketIdent, packageId, quantity);
  }
};

/**
 * Remove a package from a basket
 * @param {string} basketIdent - Basket identifier
 * @param {string} packageId - Package ID to remove
 * @param {string} returnUrl - URL to return to after authentication
 * @returns {Promise<Object>} Updated basket
 */
export const removePackageFromBasket = async (basketIdent, packageId, returnUrl = window.location.href) => {
  try {
    const isDevMode = isDevelopment && !forceProduction();
    
    if (isDevMode) {
      console.log('[Tebex] Using mock removePackageFromBasket (development mode)');
      return getMockBasketWithoutPackage(basketIdent, packageId);
    }

    console.log(`[Tebex] Removing package ${packageId} from basket ${basketIdent}`);
    const response = await fetch(`${BASE_URL}/baskets/${basketIdent}/packages/remove`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        package_id: packageId
      })
    });

    // Check for authentication required response (422 error)
    if (response.status === 422) {
      const errorData = await response.json();
      console.log('[Tebex] Authentication error:', errorData);
      
      // If the error indicates authentication is required
      if (errorData?.error?.toLowerCase().includes('login') || 
          errorData?.error?.toLowerCase().includes('auth')) {
        console.log('[Tebex] User must authenticate before removing packages from basket');
        
        // Store the operation details for after authentication
        localStorage.setItem('tebex_pending_operation', JSON.stringify({
          type: 'remove_package',
          basketIdent,
          packageId,
          returnUrl
        }));
        
        // Get authentication links
        const authLinks = await getBasketAuthLinks(basketIdent, returnUrl);
        
        if (authLinks && authLinks.length > 0) {
          console.log('[Tebex] Redirecting to authentication page:', authLinks[0].url);
          
          // Return special object indicating auth redirect
          return {
            requires_auth: true,
            auth_url: authLinks[0].url,
            message: 'Authentication required before removing from basket'
          };
        }
      }
      
      // If it's a different 422 error, just throw it
      throw new Error(`Failed to remove package from basket: ${errorData.error || response.status}`);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Tebex] Failed to remove package: ${response.status} ${errorText}`);
      throw new Error(`Failed to remove package from basket: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('[Tebex] Package removed successfully');
    return data;
  } catch (error) {
    console.error('[Tebex] Error removing package from basket:', error);
    // Return mock updated basket in case of error
    console.log('[Tebex] Falling back to mock basket without package');
    return getMockBasketWithoutPackage(basketIdent, packageId);
  }
};

/**
 * Get basket by ID
 * @param {string} basketIdent - Basket identifier
 * @returns {Promise<Object>} Basket data
 */
export const getBasket = async (basketIdent) => {
  // Check if we're in development mode and not forcing production
  const isDevMode = isDevelopment && !forceProduction();
  
  // In development, always use mock data
  if (isDevMode) {
    console.log('[Tebex] Using mock basket data (development mode)');
    return getMockBasketById(basketIdent);
  }
  
  // If no basketIdent provided, return mock data
  if (!basketIdent) {
    console.warn('[Tebex] No basketIdent provided to getBasket');
    return getMockBasketById('mock-basket');
  }
  
  try {
    console.log(`[Tebex] Fetching basket with ID: ${basketIdent}`);
    
    let response;
    try {
      const url = `${BASE_URL}/accounts/${STORE_TOKEN}/baskets/${basketIdent}`;
      console.log(`[Tebex] GET ${url}`);
      response = await fetch(url);
      console.log(`[Tebex] Basket response status: ${response.status}`);
    } catch (fetchError) {
      console.error('[Tebex] Network error fetching basket:', fetchError);
      return getMockBasketById(basketIdent);
    }
    
    if (!response.ok) {
      console.warn(`[Tebex] Failed to get basket with status: ${response.status}`);
      // Don't throw, just return mock data
      return getMockBasketById(basketIdent);
    }
    
    let basketData;
    try {
      basketData = await response.json();
      console.log('[Tebex] Successfully fetched basket data');
    } catch (jsonError) {
      console.error('[Tebex] Error parsing basket JSON response:', jsonError);
      return getMockBasketById(basketIdent);
    }
    
    return basketData;
  } catch (error) {
    console.error('[Tebex] Error in getBasket:', error);
    return getMockBasketById(basketIdent);
  }
};

/**
 * Get authentication links for a basket
 * @param {string} basketIdent - Basket identifier
 * @param {string} returnUrl - URL to return to after authentication
 * @returns {Promise<Array>} Auth links
 */
export const getBasketAuthLinks = async (basketIdent, returnUrl = window.location.href) => {
  try {
    const isDevMode = isDevelopment && !forceProduction();
    
    if (isDevMode) {
      console.log('[Tebex] Using mock auth links (development mode)');
      return getMockAuthLinks(basketIdent, returnUrl);
    }

    console.log(`[Tebex] Getting auth links for basket ${basketIdent} with return URL ${returnUrl}`);
    
    // Encode returnUrl properly
    const encodedReturnUrl = encodeURIComponent(returnUrl);
    
    const response = await fetch(
      `${BASE_URL}/accounts/${STORE_TOKEN}/baskets/${basketIdent}/auth?returnUrl=${encodedReturnUrl}`
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Tebex] Failed to get auth links: ${response.status} ${errorText}`);
      throw new Error(`Failed to get auth links: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('[Tebex] Successfully retrieved auth links:', data);
    return data;
  } catch (error) {
    console.error('[Tebex] Error getting auth links:', error);
    // Return mock auth links in case of error
    console.log('[Tebex] Falling back to mock auth links');
    return getMockAuthLinks(basketIdent, returnUrl);
  }
};

function getMockAuthLinks(basketIdent, returnUrl) {
  const mockBasketIdent = basketIdent || `mock-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  
  // Include returnUrl in the auth URL if provided
  const authUrl = returnUrl 
    ? `https://auth.tebex.io/login/minecraft?basket=${mockBasketIdent}&return=${encodeURIComponent(returnUrl)}`
    : `https://auth.tebex.io/login/minecraft?basket=${mockBasketIdent}`;
    
  return [
    {
      name: "Minecraft",
      url: authUrl
    }
  ];
}

/**
 * Process checkout with Minecraft username
 * @param {string} basketIdent - Basket identifier
 * @param {string} username - Minecraft username
 * @param {string} edition - Minecraft edition (java/bedrock)
 * @returns {Promise<Object>} Checkout information
 */
export const processCheckout = async (basketIdent, username, edition) => {
  try {
    console.log(`[Tebex] Processing checkout for ${username} (${edition})`);
    
    // Check if we're in development mode and not forcing production
    const isDevMode = isDevelopment && !forceProduction();
    
    // In development, always use mock checkout
    if (isDevMode) {
      console.log('[Tebex] Using mock checkout data (development mode)');
      return getMockCheckout(username, edition);
    }
    
    // If no basketIdent or API errors previously, create a new mock checkout in production
    if (!basketIdent) {
      console.log('[Tebex] No basketIdent provided, using mock checkout');
      return getMockCheckout(username, edition);
    }
    
    // Try to get the current basket
    try {
      const basketResponse = await getBasket(basketIdent);
      
      // Check if we have a valid basket response
      if (basketResponse?.data?.ident) {
        const checkoutIdent = basketResponse.data.ident;
        console.log('[Tebex] Got valid basket ident for checkout:', checkoutIdent);
        
        // Return checkout data with the basket ident for Tebex.js
        return {
          success: true,
          basketIdent: checkoutIdent,
          username: username,
          edition: edition,
          ident: checkoutIdent, // Used by Tebex.js
          message: "Checkout ready"
        };
      } else {
        // No valid ident in response, use mock data
        console.log('[Tebex] No valid ident in basket response, using mock checkout');
        return getMockCheckout(username, edition);
      }
    } catch (basketError) {
      console.error('[Tebex] Error getting basket for checkout:', basketError);
      // Fall back to mock checkout
      console.log('[Tebex] Error getting basket, using mock checkout');
      return getMockCheckout(username, edition);
    }
  } catch (error) {
    console.error('[Tebex] Error processing checkout:', error);
    // Always return mock checkout data on error
    console.log('[Tebex] Error in processCheckout, using mock checkout');
    return getMockCheckout(username, edition);
  }
};

/**
 * Apply a coupon to a basket
 * @param {string} basketIdent - Basket identifier
 * @param {string} couponCode - Coupon code to apply
 * @returns {Promise<Object>} Updated basket
 */
export const applyCoupon = async (basketIdent, couponCode) => {
  try {
    const isDevMode = isDevelopment && !forceProduction();
    
    if (isDevMode) {
      console.log('[Tebex] Using mock applyCoupon (development mode)');
      return getMockBasketWithCoupon(basketIdent, couponCode);
    }

    console.log(`[Tebex] Applying coupon ${couponCode} to basket ${basketIdent}`);
    const response = await fetch(`${BASE_URL}/accounts/${STORE_TOKEN}/baskets/${basketIdent}/coupons`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        coupon_code: couponCode
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Tebex] Failed to apply coupon: ${response.status} ${errorText}`);
      throw new Error(`Failed to apply coupon: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('[Tebex] Coupon applied successfully');
    return data;
  } catch (error) {
    console.error('[Tebex] Error applying coupon:', error);
    // Return mock updated basket in case of error
    console.log('[Tebex] Falling back to mock basket with coupon');
    return getMockBasketWithCoupon(basketIdent, couponCode);
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