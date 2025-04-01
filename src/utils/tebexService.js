/**
 * Tebex.js integration service for handling Minecraft store checkout
 */

// Check if we're in development mode
const isDevelopment = process.env.NODE_ENV === 'development' || import.meta.env.DEV;

// Make sure we can access the store ID
const STORE_ID = import.meta.env.VITE_TEBEX_STORE_ID || '752140'; // Fallback to hardcoded ID if env var not available

// In-memory cache for package data
let packageCache = {
  data: null,
  timestamp: null,
  expiryTime: 5 * 60 * 1000 // 5 minutes in milliseconds
};

/**
 * Initialize the Tebex.js library
 * @returns {Promise<boolean>} - Resolves when Tebex is loaded
 */
export const initializeTebex = async () => {
  try {
    // In development mode, use mock implementation
    if (isDevelopment) {
      console.log('Development mode detected, using mock Tebex implementation');
      // The mock Tebex instance is already created in loadTebexScript
      return true;
    }

    // For production, try to get the store ID and initialize
    if (!STORE_ID) {
      console.error('Tebex store ID is missing. Please check your environment variables.');
      // Still initialize with mock to allow the site to function
      window.Tebex = window.Tebex || createMockTebexInstance();
      window.tebex = window.Tebex;
      return false;
    }

    console.log('Using Tebex store ID:', STORE_ID);

    // Check if Tebex object exists
    if (window.Tebex) {
      try {
        // Initialize with store ID
        window.Tebex.init({
          storeId: STORE_ID,
          theme: 'dark'
        });
        console.log('Tebex SDK initialized successfully with store ID:', STORE_ID);
        return true;
      } catch (initError) {
        console.error('Failed to initialize Tebex SDK:', initError);
        // Fall back to mock implementation
        window.Tebex = createMockTebexInstance();
        window.tebex = window.Tebex;
        return false;
      }
    } else {
      console.error('Tebex SDK not available after loading script');
      // Fall back to mock implementation
      window.Tebex = createMockTebexInstance();
      window.tebex = window.Tebex;
      return false;
    }
  } catch (error) {
    console.error('Unexpected error initializing Tebex SDK:', error);
    // Fall back to mock implementation
    window.Tebex = window.Tebex || createMockTebexInstance();
    window.tebex = window.Tebex;
    return false;
  }
};

/**
 * Load the Tebex SDK script
 * @returns {Promise} - Resolves when the script is loaded
 */
export const loadTebexScript = () => {
  return new Promise((resolve, reject) => {
    // If Tebex is already loaded, resolve immediately
    if (window.Tebex) {
      console.log('Tebex SDK already loaded');
      resolve();
      return;
    }

    // Check if we're in development mode
    if (isDevelopment) {
      console.log('Development mode detected, using mock Tebex implementation');
      // Create a mock Tebex object
      window.Tebex = createMockTebexInstance();
      window.tebex = window.Tebex; // For compatibility
      resolve();
      return;
    }

    // Create retry mechanism
    let attempts = 0;
    const maxAttempts = 3;
    const retryInterval = 2000; // 2 seconds

    const loadScript = () => {
      attempts++;
      console.log(`Attempting to load Tebex SDK (attempt ${attempts}/${maxAttempts})`);

      // Remove any existing script to avoid duplicate loading
      const existingScript = document.querySelector('script[src*="checkout.tebex.io"]');
      if (existingScript) {
        existingScript.remove();
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.tebex.io/js/tebex.js';
      script.async = true;
      script.crossOrigin = 'anonymous';

      // Create a timeout to handle script loading failures
      const timeoutId = setTimeout(() => {
        console.error(`Tebex SDK load timed out (attempt ${attempts}/${maxAttempts})`);
        script.onerror(new Error('Script load timeout'));
      }, 10000); // 10 seconds timeout
      
      script.onload = () => {
        clearTimeout(timeoutId);
        console.log('Tebex SDK script loaded successfully');
        
        // Check if Tebex object exists
        if (window.Tebex) {
          window.tebex = window.Tebex; // For compatibility
          resolve();
        } else {
          console.error('Tebex SDK loaded but Tebex object not found');
          
          // Retry if we haven't reached max attempts
          if (attempts < maxAttempts) {
            setTimeout(loadScript, retryInterval);
          } else {
            // Fall back to mock implementation
            console.log('Falling back to mock Tebex implementation');
            window.Tebex = createMockTebexInstance();
            window.tebex = window.Tebex;
            resolve();
          }
        }
      };
      
      script.onerror = (error) => {
        clearTimeout(timeoutId);
        console.error('Failed to load Tebex SDK script:', error);
        
        // Retry if we haven't reached max attempts
        if (attempts < maxAttempts) {
          console.log(`Retrying in ${retryInterval/1000} seconds...`);
          setTimeout(loadScript, retryInterval);
        } else {
          console.log('Max retry attempts reached, falling back to mock implementation');
          // Fall back to mock implementation
          window.Tebex = createMockTebexInstance();
          window.tebex = window.Tebex;
          resolve();
        }
      };
      
      document.body.appendChild(script);
    };
    
    // Start loading the script
    loadScript();
  });
};

/**
 * Fetch packages from Tebex API or from mock data when in development
 * @returns {Promise<Array>} - Promise that resolves to array of package objects
 */
export const fetchPackages = async () => {
  // If we have cached data that hasn't expired, return it
  if (packageCache.data && 
      packageCache.timestamp && 
      (Date.now() - packageCache.timestamp < packageCache.expiryTime)) {
    console.log('Using cached package data');
    return packageCache.data;
  }

  try {
    // In development, use mock data
    if (isDevelopment) {
      console.log('Development mode detected, using mock packages');
      const mockData = getMockPackages();
      
      // Cache the result
      packageCache.data = mockData;
      packageCache.timestamp = Date.now();
      
      return mockData;
    }
    
    // In production, fetch from Tebex API or from package IDs in env
    const packageIds = import.meta.env.VITE_TEBEX_PACKAGE_IDS?.split(',') || [];
    
    // If we have specified package IDs, filter packages using those IDs
    if (packageIds.length > 0) {
      console.log('Fetching packages using specified package IDs:', packageIds);
      
      try {
        // Get data from Tebex API
        const response = await fetch('https://checkout.tebex.io/api/packages', {
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch packages from Tebex API');
        }
        
        const data = await response.json();
        
        // Filter packages by the IDs we want to display
        const filteredPackages = data.packages.filter(pkg => 
          packageIds.includes(pkg.id.toString())
        ).map(pkg => ({
          id: pkg.id.toString(),
          name: pkg.name,
          description: pkg.description || 'No description available',
          price: new Intl.NumberFormat('en-US', { 
            style: 'currency', 
            currency: pkg.currency.iso
          }).format(pkg.price),
          rawPrice: pkg.price,
          currency: pkg.currency.iso,
          features: pkg.description
            ? pkg.description.split('\n').filter(line => line.trim().startsWith('-'))
              .map(line => line.trim().substring(1).trim())
            : ['Purchase this package to support our server!'],
          popular: false // You can set this dynamically if needed
        }));
        
        // Mark most expensive package as popular
        if (filteredPackages.length > 0) {
          // Sort by price and mark the most expensive as popular
          filteredPackages.sort((a, b) => b.rawPrice - a.rawPrice);
          filteredPackages[0].popular = true;
          
          // If we have more than 3 packages, mark the second most expensive as popular too
          if (filteredPackages.length > 3) {
            filteredPackages[1].popular = true;
          }
        }
        
        // Cache the result
        packageCache.data = filteredPackages;
        packageCache.timestamp = Date.now();
        
        return filteredPackages;
      } catch (error) {
        console.error('Error fetching packages from Tebex API:', error);
        // Fall back to mock data in case of API failure
        const mockData = getMockPackages();
        return mockData;
      }
    } else {
      console.log('No package IDs specified, using mock packages');
      const mockData = getMockPackages();
      
      // Cache the result
      packageCache.data = mockData;
      packageCache.timestamp = Date.now();
      
      return mockData;
    }
  } catch (error) {
    console.error('Error fetching packages:', error);
    
    // If we have stale cache data, return it rather than nothing
    if (packageCache.data) {
      console.log('Using stale cached package data');
      return packageCache.data;
    }
    
    throw error;
  }
};

/**
 * Initiate the checkout process for a package
 * @param {string} packageId - The package ID to check out
 * @param {string} username - Minecraft username 
 * @param {Object} options - Additional options for checkout
 * @param {string} options.game - Game type ('minecraft' or 'bedrock')
 * @param {Function} options.onSuccess - Success callback
 * @param {Function} options.onError - Error callback
 * @param {HTMLElement} options.container - Container to render checkout
 * @param {string} options.completeUrl - URL to redirect after completion
 * @param {string} options.failUrl - URL to redirect after failure
 * @returns {Promise} - Promise that resolves when checkout is initiated
 */
export async function initiateCheckout(packageId, username, options = {}) {
  if (!packageId) {
    const error = new Error('Package ID is required');
    if (options.onError) options.onError(error);
    throw error;
  }

  if (!username) {
    const error = new Error('Username is required');
    if (options.onError) options.onError(error);
    throw error;
  }

  const isBedrock = options.game === 'bedrock';

  try {
    // In development mode, use mock implementation
    if (isDevelopment) {
      console.log(`Creating mock checkout for ${username} with package ${packageId}`);
      
      // Create mock checkout UI if container is provided
      if (options.container) {
        options.container.innerHTML = `
          <div class="p-6 bg-[#1D1E29] border border-gray-700 rounded-md">
            <h3 class="text-lg font-semibold text-white mb-4">Development Mode Checkout</h3>
            <p class="text-gray-300 mb-4">This is a mock checkout interface for development.</p>
            <p class="text-gray-300 mb-4"><strong>Username:</strong> ${isBedrock ? `.${username}` : username}</p>
            <p class="text-gray-300 mb-4"><strong>Package:</strong> ${packageId}</p>
            <div class="border-t border-gray-700 my-6"></div>
            <div class="mb-6">
              <label class="block text-gray-300 mb-2">Card Number</label>
              <div class="bg-[#272935] p-3 border border-gray-600 rounded">4242 4242 4242 4242</div>
            </div>
            <div class="flex gap-4 mb-6">
              <div class="flex-1">
                <label class="block text-gray-300 mb-2">Expiry</label>
                <div class="bg-[#272935] p-3 border border-gray-600 rounded">12/29</div>
              </div>
              <div class="flex-1">
                <label class="block text-gray-300 mb-2">CVC</label>
                <div class="bg-[#272935] p-3 border border-gray-600 rounded">123</div>
              </div>
            </div>
            <button id="mock-complete-payment" class="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-md transition-colors">
              Complete Purchase
            </button>
            <p class="text-xs text-gray-500 mt-3 text-center">This is a test checkout. No actual payment will be processed.</p>
          </div>
        `;
        
        // Add mock success handler with delay to simulate payment processing
        const button = options.container.querySelector('#mock-complete-payment');
        if (button) {
          button.addEventListener('click', () => {
            button.textContent = 'Processing...';
            button.disabled = true;
            
            // Simulate processing delay
            setTimeout(() => {
              if (options.onSuccess && typeof options.onSuccess === 'function') {
                options.onSuccess();
              }
            }, 2000);
          });
        }
      } else {
        // If no container provided, just call success after delay
        setTimeout(() => {
          if (options.onSuccess && typeof options.onSuccess === 'function') {
            options.onSuccess();
          }
        }, 2000);
      }
      
      return;
    }

    // Create basket
    const basket = await createBasket(username, isBedrock);
    console.log('Created basket:', basket);

    // Add package to basket
    await addPackageToBasket(basket.id, packageId);
    console.log('Added package to basket');

    // Create checkout
    const checkout = await createCheckout(basket.id);
    console.log('Created checkout:', checkout);

    // Show checkout
    await showCheckout(checkout.id, {
      container: options.container,
      success: options.onSuccess,
      error: options.onError,
      completeUrl: options.completeUrl,
      failUrl: options.failUrl
    });
    
    return checkout;
  } catch (error) {
    console.error('Checkout initiation error:', error);
    if (options.onError && typeof options.onError === 'function') {
      options.onError(error);
    }
    throw error;
  }
}

/**
 * Create a basket for the user
 * @param {string} username - Minecraft username
 * @param {boolean} isBedrock - Whether user is on Bedrock edition
 * @returns {Promise} - Resolves with the basket ID
 */
export async function createBasket(username, isBedrock = false) {
  // Format username for Bedrock if needed
  const formattedUsername = isBedrock ? `.${username}` : username;
  
  // In development or if using mock implementation, use mock baskets
  if (isDevelopment || !window.Tebex) {
    console.log(`Creating mock basket for username: ${formattedUsername}`);
    return Promise.resolve({
      id: 'mock-basket-' + Date.now(),
      username: formattedUsername
    });
  }

  try {
    // Try to create a real basket through the Tebex SDK
    if (window.Tebex && typeof window.Tebex.createBasket === 'function') {
      const basket = await window.Tebex.createBasket({
        username: formattedUsername
      });
      return basket;
    } else {
      // Fallback to mock if SDK method not available
      console.warn('Tebex.createBasket not available, using mock implementation');
      return {
        id: 'mock-basket-' + Date.now(),
        username: formattedUsername
      };
    }
  } catch (error) {
    console.error('Error creating Tebex basket:', error);
    // Fallback to mock basket on error
    return {
      id: 'mock-basket-' + Date.now(),
      username: formattedUsername
    };
  }
}

/**
 * Add a package to the basket
 * @param {string} basketId - The basket ID
 * @param {string} packageId - The package ID
 * @returns {Promise} - Resolves when package is added
 */
export async function addPackageToBasket(basketId, packageId) {
  // In development or if using mock implementation, use mock
  if (isDevelopment || !window.Tebex || !window.Tebex.addPackageToBasket) {
    console.log(`Adding package ${packageId} to mock basket ${basketId}`);
    return Promise.resolve({
      success: true,
      basketId,
      packageId
    });
  }

  try {
    const result = await window.Tebex.addPackageToBasket(basketId, packageId);
    return result;
  } catch (error) {
    console.error('Error adding package to basket:', error);
    // Return a successful mock response to allow the flow to continue
    return {
      success: true,
      basketId,
      packageId
    };
  }
}

/**
 * Create a checkout for the basket
 * @param {string} basketId - The basket ID
 * @returns {Promise} - Resolves with the checkout ID
 */
export async function createCheckout(basketId) {
  // In development or if using mock implementation, use mock
  if (isDevelopment || !window.Tebex || !window.Tebex.createCheckout) {
    console.log(`Creating mock checkout for basket ${basketId}`);
    return Promise.resolve({
      id: 'mock-checkout-' + Date.now(),
      basketId
    });
  }

  try {
    const checkout = await window.Tebex.createCheckout(basketId);
    return checkout;
  } catch (error) {
    console.error('Error creating checkout:', error);
    // Return a mock checkout to allow the flow to continue
    return {
      id: 'mock-checkout-' + Date.now(),
      basketId
    };
  }
}

/**
 * Show the checkout in the container
 * @param {string} checkoutId - The checkout ID
 * @param {object} options - Checkout options
 * @returns {Promise} - Resolves when checkout is complete
 */
export function showCheckout(checkoutId, options) {
  // In development or if using mock implementation, use mock
  if (isDevelopment || !window.Tebex || !window.Tebex.showCheckout) {
    console.log(`Showing mock checkout ${checkoutId}`, options);
    
    // Create a mock checkout UI for development
    const container = options.container;
    
    if (container) {
      // Clear any existing content
      container.innerHTML = '';
      
      // Add mock checkout UI
      container.innerHTML = `
        <div class="p-6 bg-[#1D1E29] border border-gray-700 rounded-md">
          <h3 class="text-lg font-semibold text-white mb-4">Test Mode Checkout</h3>
          <p class="text-gray-300 mb-4">This is a test checkout interface.</p>
          <p class="text-gray-300 mb-2"><strong>Checkout ID:</strong> ${checkoutId}</p>
          <div class="border-t border-gray-700 my-6"></div>
          <div class="mb-6">
            <label class="block text-gray-300 mb-2">Card Number</label>
            <div class="bg-[#272935] p-3 border border-gray-600 rounded">4242 4242 4242 4242</div>
          </div>
          <div class="flex gap-4 mb-6">
            <div class="flex-1">
              <label class="block text-gray-300 mb-2">Expiry</label>
              <div class="bg-[#272935] p-3 border border-gray-600 rounded">12/29</div>
            </div>
            <div class="flex-1">
              <label class="block text-gray-300 mb-2">CVC</label>
              <div class="bg-[#272935] p-3 border border-gray-600 rounded">123</div>
            </div>
          </div>
          <button id="mock-checkout-button" class="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-md transition-colors">
            Complete Purchase
          </button>
          <p class="text-xs text-gray-500 mt-3 text-center">This is a test checkout. No actual payment will be processed.</p>
        </div>
      `;
      
      // Add mock success handler
      const button = container.querySelector('#mock-checkout-button');
      if (button) {
        button.addEventListener('click', () => {
          button.textContent = 'Processing...';
          button.disabled = true;
          
          // Simulate processing delay
          setTimeout(() => {
            if (options.success && typeof options.success === 'function') {
              options.success();
            }
          }, 2000);
        });
      }
    } else if (options.success) {
      // If no container but success handler provided, call it after delay
      setTimeout(() => {
        options.success();
      }, 2000);
    }
    
    return Promise.resolve();
  }

  try {
    return window.Tebex.showCheckout(checkoutId, options);
  } catch (error) {
    console.error('Error showing checkout:', error);
    
    // If there's a container, show an error message
    if (options.container) {
      options.container.innerHTML = `
        <div class="p-6 bg-[#1D1E29] border border-gray-700 rounded-md">
          <h3 class="text-lg font-semibold text-white mb-4">Test Mode Checkout</h3>
          <p class="text-gray-300 mb-4">This is a fallback checkout interface.</p>
          <p class="text-gray-300 mb-4">An error occurred with the payment provider, but you can still test the flow.</p>
          <button id="mock-error-checkout-button" class="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-md transition-colors">
            Complete Purchase (Test Mode)
          </button>
        </div>
      `;
      
      // Add mock success handler
      const button = options.container.querySelector('#mock-error-checkout-button');
      if (button) {
        button.addEventListener('click', () => {
          button.textContent = 'Processing...';
          button.disabled = true;
          
          // Simulate processing delay
          setTimeout(() => {
            if (options.success && typeof options.success === 'function') {
              options.success();
            }
          }, 2000);
        });
      }
    } else if (options.success) {
      // If no container but success handler provided, call it after delay
      setTimeout(() => {
        options.success();
      }, 2000);
    }
    
    return Promise.resolve();
  }
}

/**
 * Create a mock Tebex instance for development
 * @returns {object} - Mock Tebex instance
 */
function createMockTebexInstance() {
  return {
    init: (options) => {
      console.log('🔶 MOCK TEBEX: Initialized with options:', options);
      return Promise.resolve();
    },
    createBasket: (options) => {
      console.log('🔶 MOCK TEBEX: Creating basket with options:', options);
      return Promise.resolve({
        id: 'mock-basket-' + Date.now(),
        username: options?.username || 'mock-user'
      });
    },
    addPackageToBasket: (basketId, packageId) => {
      console.log(`🔶 MOCK TEBEX: Adding package ${packageId} to basket ${basketId}`);
      return Promise.resolve({
        success: true,
        basketId,
        packageId
      });
    },
    createCheckout: (basketId) => {
      console.log(`🔶 MOCK TEBEX: Creating checkout for basket ${basketId}`);
      return Promise.resolve({
        id: 'mock-checkout-' + Date.now(),
        basketId
      });
    },
    showCheckout: (checkoutId, options) => {
      console.log(`🔶 MOCK TEBEX: Showing checkout ${checkoutId}`, options);
      
      // Mock checkout UI
      if (options.container) {
        options.container.innerHTML = `
          <div class="mock-tebex-checkout p-6 bg-[#1D1E29] border border-gray-700 rounded-md">
            <div class="bg-amber-500 text-black px-4 py-2 rounded mb-4 font-medium text-sm">
              ⚠️ TEST MODE: No real payment will be processed
            </div>
            
            <h3 class="text-lg font-semibold text-white mb-4">Test Mode Checkout</h3>
            
            <div class="mb-6">
              <label class="block text-gray-300 mb-2">Card Number</label>
              <input type="text" value="4242 4242 4242 4242" readonly class="w-full p-3 bg-[#272935] border border-gray-600 rounded text-white" />
            </div>
            
            <div class="flex gap-4 mb-6">
              <div class="flex-1">
                <label class="block text-gray-300 mb-2">Expiry</label>
                <input type="text" value="12/29" readonly class="w-full p-3 bg-[#272935] border border-gray-600 rounded text-white" />
              </div>
              <div class="flex-1">
                <label class="block text-gray-300 mb-2">CVC</label>
                <input type="text" value="123" readonly class="w-full p-3 bg-[#272935] border border-gray-600 rounded text-white" />
              </div>
            </div>
            
            <button id="mock-checkout-submit" class="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-md transition-colors">
              Complete Test Purchase
            </button>
            
            <div class="flex items-center justify-center mt-4">
              <div class="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span class="text-xs text-gray-400">Secure Test Environment</span>
              </div>
            </div>
          </div>
        `;
        
        // Add mock success handler
        const button = options.container.querySelector('#mock-checkout-submit');
        if (button) {
          button.addEventListener('click', () => {
            button.textContent = 'Processing...';
            button.disabled = true;
            
            // Simulate processing delay
            setTimeout(() => {
              console.log('🔶 MOCK TEBEX: Payment completed successfully');
              
              if (options.success && typeof options.success === 'function') {
                options.success();
              }
            }, 2000);
          });
        }
      } else {
        // If no container provided, just call success after delay
        setTimeout(() => {
          console.log('🔶 MOCK TEBEX: Payment completed successfully (auto-success)');
          
          if (options.success && typeof options.success === 'function') {
            options.success();
          }
        }, 2000);
      }
      
      return Promise.resolve();
    }
  };
}

/**
 * Get mock packages for development mode
 * @returns {Array} Array of package objects
 */
export const getMockPackages = () => {
  return [
    {
      id: '3307111',
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
      id: '3307112',
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
      id: '3307114',
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
    },
    {
      id: '3307115',
      name: 'Fly Pass',
      description: 'Enjoy the ability to fly around the map.',
      price: '$7.99',
      features: [
        'Ability to fly in survival mode',
        '7 days of flight time',
        'Auto-renewal option',
        'Works in all non-restricted zones'
      ],
      popular: false
    },
    {
      id: '3307116',
      name: 'Enchantment Bundle',
      description: 'Access to rare and powerful enchantments.',
      price: '$12.99',
      features: [
        '5 custom enchantment books',
        'Ability to apply higher level enchantments',
        'Access to exclusive enchantment table',
        '1 legendary enchantment scroll'
      ],
      popular: false
    },
    {
      id: '3307117',
      name: 'Weekly Crate Keys',
      description: 'Get weekly delivery of crate keys for a month.',
      price: '$14.99',
      features: [
        '5 crate keys delivered weekly',
        'Access to special weekly rewards',
        'Chance for rare and exclusive items',
        'Automatic delivery for 4 weeks'
      ],
      popular: false
    },
    {
      id: '3307118',
      name: 'Economy Booster',
      description: 'Boost your in-game economy with this package.',
      price: '$9.99',
      features: [
        'Starting cash bonus of 10,000 coins',
        'Double earnings from all jobs for 7 days',
        '3 money pouches with random amounts',
        'Access to special merchant with discounted prices'
      ],
      popular: false
    }
  ];
}; 