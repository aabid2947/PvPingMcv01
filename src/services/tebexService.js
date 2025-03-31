/**
 * Service to handle Tebex API interactions
 */

// Check if we're in development mode
const isDevelopmentMode = process.env.NODE_ENV === 'development';

// Mock functions for development mode
const mockBasket = {
  id: 'mock-basket-' + Math.random().toString(36).substring(2, 9),
  username: '',
  total: 0,
  items: []
};

// Check if the Tebex SDK is loaded
const isTebexLoaded = () => {
  // In development mode, always return true to prevent errors
  if (isDevelopmentMode) {
    console.log('Development mode: using Tebex mock functions');
    return true;
  }
  return typeof window.tebex !== 'undefined';
};

// Initialize Tebex with your store ID
const initializeTebex = (storeId) => {
  if (isDevelopmentMode) {
    console.log('Development mode: Mock Tebex initialized with store ID:', storeId);
    return true;
  }

  if (!isTebexLoaded()) {
    console.error('Tebex SDK not loaded');
    return false;
  }
  
  try {
    window.tebex.store.setup(storeId);
    console.log('Tebex initialized successfully with store ID:', storeId);
    return true;
  } catch (error) {
    console.error('Failed to initialize Tebex:', error);
    return false;
  }
};

// Create a new basket with a username
const createBasket = async (username) => {
  if (isDevelopmentMode) {
    console.log('Development mode: Creating mock basket for user:', username);
    mockBasket.username = username;
    return { ...mockBasket };
  }

  if (!isTebexLoaded()) {
    throw new Error('Tebex SDK not loaded');
  }
  
  if (!username || username.trim() === '') {
    throw new Error('Username is required');
  }
  
  try {
    console.log('Creating basket for user:', username);
    const basket = await window.tebex.basket.create({
      username: username,
      // Additional optional parameters:
      // ip_address: userIp, // If you have the user's IP
      // Complete user info if you have it:
      // user_info: {
      //   username: username,
      //   email: email,
      //   first_name: firstName,
      //   last_name: lastName
      // }
    });
    
    console.log('Basket created:', basket);
    return basket;
  } catch (error) {
    console.error('Failed to create basket:', error);
    throw new Error(error.message || 'Failed to create basket. Please try again.');
  }
};

// Add a package to a basket
const addPackageToBasket = async (basketId, packageId, quantity = 1) => {
  if (isDevelopmentMode) {
    console.log(`Development mode: Adding package ${packageId} to mock basket ${basketId}`);
    mockBasket.items.push({
      packageId,
      quantity,
      price: 9.99 // Mock price
    });
    mockBasket.total += 9.99 * quantity;
    return { success: true };
  }

  if (!isTebexLoaded()) {
    throw new Error('Tebex SDK not loaded');
  }
  
  if (!basketId) {
    throw new Error('Basket ID is required');
  }
  
  if (!packageId) {
    throw new Error('Package ID is required');
  }
  
  try {
    console.log(`Adding package ${packageId} to basket ${basketId}`);
    const result = await window.tebex.basket.addPackage(basketId, packageId, quantity);
    console.log('Package added to basket:', result);
    return result;
  } catch (error) {
    console.error(`Failed to add package ${packageId} to basket ${basketId}:`, error);
    throw new Error(error.message || 'Failed to add package to basket. Please try again.');
  }
};

// Get basket information
const getBasket = async (basketId) => {
  if (isDevelopmentMode) {
    console.log(`Development mode: Getting mock basket information for ${basketId}`);
    return { ...mockBasket };
  }

  if (!isTebexLoaded()) {
    throw new Error('Tebex SDK not loaded');
  }
  
  if (!basketId) {
    throw new Error('Basket ID is required');
  }
  
  try {
    console.log(`Getting basket information for ${basketId}`);
    const basket = await window.tebex.basket.get(basketId);
    console.log('Basket information:', basket);
    return basket;
  } catch (error) {
    console.error(`Failed to get basket ${basketId}:`, error);
    throw new Error(error.message || 'Failed to get basket information. Please try again.');
  }
};

// Create and open checkout in modal
const openCheckout = (basketId, options = {}) => {
  if (isDevelopmentMode) {
    console.log(`Development mode: Setting up mock checkout for basket ${basketId}`);
    
    // In development, simulate a successful checkout after a delay
    setTimeout(() => {
      if (options.onSuccess) {
        options.onSuccess();
      }
    }, 3000);
    
    return true;
  }

  if (!isTebexLoaded()) {
    throw new Error('Tebex SDK not loaded');
  }
  
  if (!basketId) {
    throw new Error('Basket ID is required');
  }
  
  try {
    console.log(`Setting up checkout for basket ${basketId}`);
    window.tebex.checkout.setup(basketId, {
      embedElement: options.embedElement || null,
      onSuccess: options.onSuccess || (() => {
        console.log('Checkout completed successfully');
      }),
      onCancel: options.onCancel || (() => {
        console.log('Checkout cancelled by user');
      }),
      onError: options.onError || ((error) => {
        console.error('Checkout error:', error);
      }),
      onLoad: options.onLoad || (() => {
        console.log('Checkout loaded');
      })
    });
    
    return true;
  } catch (error) {
    console.error('Failed to set up checkout:', error);
    throw new Error(error.message || 'Failed to set up checkout. Please try again.');
  }
};

// Complete purchase flow
const completePurchase = async (username, packageId, quantity = 1) => {
  try {
    if (!username || username.trim() === '') {
      throw new Error('Username is required');
    }
    
    if (!packageId) {
      throw new Error('Package ID is required');
    }
    
    console.log(`Starting purchase flow for user ${username}, package ${packageId}`);
    
    // 1. Create a basket
    const basket = await createBasket(username);
    
    if (!basket || !basket.id) {
      throw new Error('Failed to create basket');
    }
    
    // 2. Add package to basket
    await addPackageToBasket(basket.id, packageId, quantity);
    
    // 3. Return the basket ID for the checkout process
    console.log(`Purchase flow completed successfully for basket ${basket.id}`);
    return basket.id;
  } catch (error) {
    console.error('Failed to complete purchase flow:', error);
    throw new Error(error.message || 'Failed to complete purchase. Please try again.');
  }
};

export default {
  isTebexLoaded,
  initializeTebex,
  createBasket,
  addPackageToBasket,
  getBasket,
  openCheckout,
  completePurchase
}; 