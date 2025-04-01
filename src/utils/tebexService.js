/**
 * Tebex.js integration service for handling Minecraft store checkout
 */

// Check if we're in development mode
const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Initialize the Tebex.js library
 * @param {string} storeId - The Tebex store ID
 * @returns {Promise} - Resolves when Tebex is loaded
 */
export function initializeTebex(storeId) {
  return new Promise((resolve, reject) => {
    if (isDevelopment && !storeId) {
      console.warn('Running in development mode without a Tebex Store ID');
      // Simulate successful loading in development
      setTimeout(() => {
        window.tebex = createMockTebexInstance();
        resolve(window.tebex);
      }, 1000);
      return;
    }

    if (!storeId) {
      return reject(new Error('Tebex Store ID is required'));
    }

    // Check if Tebex is already loaded
    if (window.tebex) {
      return resolve(window.tebex);
    }

    try {
      // Load the Tebex SDK script
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@tebex/sdk-js@latest/dist/sdk.min.js';
      script.async = true;
      script.onload = () => {
        // Initialize Tebex with the store ID
        if (window.tebex) {
          window.tebex.init({ 
            storeId: storeId,
            type: 'modal'
          });
          resolve(window.tebex);
        } else {
          reject(new Error('Failed to initialize Tebex SDK'));
        }
      };
      script.onerror = () => {
        reject(new Error('Failed to load Tebex SDK script'));
      };
      document.body.appendChild(script);
    } catch (error) {
      reject(error);
    }
  });
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