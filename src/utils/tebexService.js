/**
 * Tebex.js integration service for handling Minecraft store checkout
 */

// Check if we're in development mode
const isDevelopment = process.env.NODE_ENV === 'development';

// In-memory cache for package data
let packageCache = {
  data: null,
  timestamp: null,
  expiryTime: 5 * 60 * 1000 // 5 minutes in milliseconds
};

/**
 * Initialize the Tebex.js library
 * @param {string} storeId - The Tebex store ID
 * @returns {Promise} - Resolves when Tebex is loaded
 */
export const initializeTebex = async (storeId) => {
  if (!storeId) {
    console.error('Tebex store ID is required');
    return false;
  }

  return new Promise((resolve) => {
    if (window.Tebex) {
      try {
        window.Tebex.init({
          storeId: storeId,
          theme: 'dark'
        });
        console.log('Tebex SDK initialized successfully');
        resolve(true);
      } catch (error) {
        console.error('Failed to initialize Tebex SDK:', error);
        resolve(false);
      }
    } else {
      console.error('Tebex SDK not available');
      resolve(false);
    }
  });
};

/**
 * Fetch packages from Tebex API via serverless function
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
    // Call our serverless function endpoint
    const isDev = import.meta.env.DEV;
    
    // Use the appropriate API endpoint based on environment
    const apiUrl = isDev
      ? '/api/tebex/packages' // Local development proxy
      : '/.netlify/functions/tebex-packages'; // Netlify Functions in production
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch packages: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Cache the result
    packageCache.data = data.packages || [];
    packageCache.timestamp = Date.now();
    
    return packageCache.data;
  } catch (error) {
    console.error('Error fetching packages:', error);
    
    // If we're in development mode, return mock data
    if (import.meta.env.DEV) {
      console.log('Development mode: Using mock packages');
      return getMockPackages();
    }
    
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
    if (isDevelopment || import.meta.env.DEV) {
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
  if (!window.tebex) {
    throw new Error('Tebex SDK not initialized');
  }

  // Format username for Bedrock if needed
  const formattedUsername = isBedrock ? `.${username}` : username;
  
  // In development, use mock implementation
  if (isDevelopment) {
    console.log(`Creating mock basket for username: ${formattedUsername}`);
    return Promise.resolve({
      id: 'mock-basket-' + Date.now(),
      username: formattedUsername
    });
  }

  try {
    const basket = await window.tebex.createBasket({
      username: formattedUsername
    });
    return basket;
  } catch (error) {
    console.error('Error creating Tebex basket:', error);
    throw new Error(error.message || 'Failed to create basket');
  }
}

/**
 * Add a package to the basket
 * @param {string} basketId - The basket ID
 * @param {string} packageId - The package ID
 * @returns {Promise} - Resolves when package is added
 */
export async function addPackageToBasket(basketId, packageId) {
  if (!window.tebex) {
    throw new Error('Tebex SDK not initialized');
  }

  // In development, use mock implementation
  if (isDevelopment) {
    console.log(`Adding package ${packageId} to mock basket ${basketId}`);
    return Promise.resolve({
      success: true,
      basketId,
      packageId
    });
  }

  try {
    const result = await window.tebex.addPackageToBasket(basketId, packageId);
    return result;
  } catch (error) {
    console.error('Error adding package to basket:', error);
    throw new Error(error.message || 'Failed to add package to basket');
  }
}

/**
 * Create a checkout for the basket
 * @param {string} basketId - The basket ID
 * @returns {Promise} - Resolves with the checkout ID
 */
export async function createCheckout(basketId) {
  if (!window.tebex) {
    throw new Error('Tebex SDK not initialized');
  }

  // In development, use mock implementation
  if (isDevelopment) {
    console.log(`Creating mock checkout for basket ${basketId}`);
    return Promise.resolve({
      id: 'mock-checkout-' + Date.now(),
      basketId
    });
  }

  try {
    const checkout = await window.tebex.createCheckout(basketId);
    return checkout;
  } catch (error) {
    console.error('Error creating checkout:', error);
    throw new Error(error.message || 'Failed to create checkout');
  }
}

/**
 * Show the checkout in the container
 * @param {string} checkoutId - The checkout ID
 * @param {object} options - Checkout options
 * @returns {Promise} - Resolves when checkout is complete
 */
export function showCheckout(checkoutId, options) {
  if (!window.tebex) {
    throw new Error('Tebex SDK not initialized');
  }

  // In development, use mock implementation
  if (isDevelopment) {
    console.log(`Showing mock checkout ${checkoutId}`, options);
    
    // Create a mock checkout UI for development
    const container = options.container;
    
    if (container) {
      // Clear any existing content
      container.innerHTML = '';
      
      // Add mock checkout UI
      container.innerHTML = `
        <div class="p-4 bg-gray-100 rounded-md">
          <h3 class="text-lg font-bold mb-4">Development Mode Checkout</h3>
          <p class="mb-4">This is a mock checkout interface for development.</p>
          <p class="mb-2"><strong>Checkout ID:</strong> ${checkoutId}</p>
          <div class="border-t border-gray-300 my-4"></div>
          <div class="mb-4">
            <label class="block mb-2">Card Number</label>
            <input type="text" value="4242 4242 4242 4242" readonly class="w-full p-2 border border-gray-300 rounded" />
          </div>
          <div class="mb-4">
            <label class="block mb-2">Expiry</label>
            <input type="text" value="12/25" readonly class="w-full p-2 border border-gray-300 rounded" />
          </div>
          <div class="mb-4">
            <label class="block mb-2">CVC</label>
            <input type="text" value="123" readonly class="w-full p-2 border border-gray-300 rounded" />
          </div>
          <button id="mock-checkout-button" class="w-full bg-purple-600 text-white py-2 px-4 rounded">
            Complete Purchase ($0.00)
          </button>
          <p class="text-xs text-gray-500 mt-2">This is a mock checkout. No actual payment will be processed.</p>
        </div>
      `;
      
      // Add mock success handler
      const button = container.querySelector('#mock-checkout-button');
      button.addEventListener('click', () => {
        button.textContent = 'Processing...';
        button.disabled = true;
        
        // Simulate processing delay
        setTimeout(() => {
          if (options.success && typeof options.success === 'function') {
            options.success();
          }
        }, 3000);
      });
    }
    
    return Promise.resolve();
  }

  try {
    return window.tebex.showCheckout(checkoutId, options);
  } catch (error) {
    console.error('Error showing checkout:', error);
    throw new Error(error.message || 'Failed to show checkout');
  }
}

/**
 * Create a mock Tebex instance for development
 * @returns {object} - Mock Tebex instance
 */
function createMockTebexInstance() {
  return {
    init: (options) => {
      console.log('Tebex mock initialized with options:', options);
      return Promise.resolve();
    },
    createBasket: (options) => {
      console.log('Creating mock basket with options:', options);
      return Promise.resolve({
        id: 'mock-basket-' + Date.now(),
        username: options?.username || 'mock-user'
      });
    },
    addPackageToBasket: (basketId, packageId) => {
      console.log(`Adding package ${packageId} to mock basket ${basketId}`);
      return Promise.resolve({
        success: true,
        basketId,
        packageId
      });
    },
    createCheckout: (basketId) => {
      console.log(`Creating mock checkout for basket ${basketId}`);
      return Promise.resolve({
        id: 'mock-checkout-' + Date.now(),
        basketId
      });
    },
    showCheckout: (checkoutId, options) => {
      console.log(`Showing mock checkout ${checkoutId}`, options);
      
      // Simulate a successful checkout after 3 seconds
      setTimeout(() => {
        if (options.success && typeof options.success === 'function') {
          options.success();
        }
      }, 3000);
      
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