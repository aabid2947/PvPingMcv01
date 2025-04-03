import React, { createContext, useContext, useState, useEffect } from 'react';
import { useCart } from './CartContext';
import * as tebexService from '../utils/tebexHeadlessService';
import { useUser } from '../context/UserContext';

const BasketContext = createContext();

// localStorage keys
const BASKET_IDENT_KEY = 'tebexBasketIdent';
const BASKET_DATA_KEY = 'tebexBasketData';
const BASKET_USERNAME_KEY = 'tebexBasketUsername';
const BASKET_INITIALIZED_KEY = 'tebexBasketInitialized';

export function useBasket() {
  return useContext(BasketContext);
}

export function BasketProvider({ children }) {
  const { cart, clearCart } = useCart();
  const { username: userContextUsername } = useUser();
  
  // Use the username from context or localStorage if available
  const [username, setUsername] = useState(() => {
    try {
      const storedUsername = localStorage.getItem(BASKET_USERNAME_KEY);
      return storedUsername || userContextUsername || null;
    } catch (error) {
      return userContextUsername || null;
    }
  });

  const [basketIdent, setBasketIdent] = useState(() => {
    try {
      return localStorage.getItem(BASKET_IDENT_KEY) || null;
    } catch (error) {
      return null;
    }
  });

  const [basketData, setBasketData] = useState(() => {
    try {
      const storedData = localStorage.getItem(BASKET_DATA_KEY);
      return storedData ? JSON.parse(storedData) : null;
    } catch (error) {
      return null;
    }
  });

  const [hasInitializedBasket, setHasInitializedBasket] = useState(() => {
    try {
      return localStorage.getItem(BASKET_INITIALIZED_KEY) === 'true';
    } catch (error) {
      return false;
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [checkoutUrl, setCheckoutUrl] = useState(null);
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);
  const [developmentCheckout, setDevelopmentCheckout] = useState(false);
  const [lastAddedItem, setLastAddedItem] = useState(null);
  const [lastFetchTimestamp, setLastFetchTimestamp] = useState(0);
  const FETCH_COOLDOWN = 2000; // 2 seconds cooldown between fetches
  
  // Helper function to save basket state to localStorage
  const saveBasketState = (ident, data, user, initialized = true) => {
    try {
      if (ident) localStorage.setItem(BASKET_IDENT_KEY, ident);
      if (data) localStorage.setItem(BASKET_DATA_KEY, JSON.stringify(data));
      if (user) localStorage.setItem(BASKET_USERNAME_KEY, user);
      localStorage.setItem(BASKET_INITIALIZED_KEY, initialized.toString());
    } catch (error) {
      // Continue without saving to localStorage
    }
  };
  
  // Helper function to clear basket state from localStorage
  const clearBasketState = () => {
    try {
      localStorage.removeItem(BASKET_IDENT_KEY);
      localStorage.removeItem(BASKET_DATA_KEY);
      localStorage.removeItem(BASKET_USERNAME_KEY);
      localStorage.removeItem(BASKET_INITIALIZED_KEY);
    } catch (error) {
      // Continue without clearing localStorage
    }
  };
  
  // Update username in state and localStorage when userContextUsername changes
  useEffect(() => {
    if (userContextUsername && userContextUsername !== username) {
      setUsername(userContextUsername);
      saveBasketState(basketIdent, basketData, userContextUsername, hasInitializedBasket);
    }
  }, [userContextUsername]);
  
  // Load basketIdent from localStorage on initial render
  useEffect(() => {
    const loadBasketIdent = () => {
      try {
        // Only attempt to load/initialize basket if username is set
        if (!username) {
          return;
        }
        
        if (basketIdent) {
          // Fetch the latest basket data if we haven't fetched recently
          const now = Date.now();
          if (now - lastFetchTimestamp > FETCH_COOLDOWN) {
            fetchBasket(basketIdent).catch(() => {
              // If we can't fetch the existing basket, clear it so we can create a new one
              clearBasketState();
              setBasketIdent(null);
              setBasketData(null);
              setHasInitializedBasket(false);
            });
          }
        }
      } catch (e) {
        // Handle error silently
      }
    };
    
    loadBasketIdent();
  }, [username]); // Add username as dependency to re-run when it changes

  // Watch cart changes to sync with basket
  useEffect(() => {
    // Only attempt to sync cart with basket if we have items, a username, and we're not in checkout
    if (cart.length > 0 && username && !isProcessingCheckout) {
      syncCartWithBasket();
    }
  }, [cart, username, isProcessingCheckout]);
  
  // Watch for authentication returns from Tebex when the component mounts
  useEffect(() => {
    const checkForAuthReturn = async () => {
      try {
        // Check if current page is a return from authentication
        const isAuthReturn = window.location.search.includes('tebex_auth') || 
                            window.location.search.includes('auth_return');
        
        if (isAuthReturn) {
          setIsLoading(true);
          
          // Process the pending operation that was stored before redirect
          const pendingOp = localStorage.getItem('tebex_pending_operation');
          
          if (pendingOp) {
            try {
              const operation = JSON.parse(pendingOp);
              
              if (operation.type === 'add_package' && operation.basketIdent && operation.packageId) {
                // Re-attempt to add the package now that user is authenticated
                await addPackageToBasket(operation.packageId, operation.quantity || 1);
                
                // Clear the pending operation
                localStorage.removeItem('tebex_pending_operation');
              }
            } catch (parseError) {
              // Handle error silently
            }
          }
          
          // Clean up the URL by removing auth parameters
          const cleanUrl = window.location.pathname + 
                          window.location.search.replace(/[?&]tebex_auth[^&]*/, '').replace(/[?&]auth_return[^&]*/, '');
          window.history.replaceState({}, document.title, cleanUrl);
          
          setIsLoading(false);
        }
      } catch (error) {
        setIsLoading(false);
      }
    };
    
    checkForAuthReturn();
  }, []);
  
  // Sync the current cart items with the Tebex basket
  const syncCartWithBasket = async () => {
    if (!username) {
      return;
    }
    
    try {
      // Ensure we have a valid basket
      const currentBasketIdent = await getOrCreateBasket();
      if (!currentBasketIdent) {
        throw new Error('Failed to get or create basket for cart sync');
      }
      
      // For now, we'll just ensure the basket exists
      return currentBasketIdent;
    } catch (error) {
      setError('Failed to sync your cart. Please try again.');
      return null;
    }
  };
  
  // Initialize a new basket if needed
  const initializeBasket = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!username) {
        setError('You must be logged in to create a basket');
        return null;
      }
      
      // Complete URL and cancel URL default to current page
      const completeUrl = window.location.href;
      const cancelUrl = window.location.href;
      
      const response = await tebexService.createBasket(completeUrl, cancelUrl, username);
      
      if (response?.data?.ident) {
        const newBasketIdent = response.data.ident;
        
        setBasketIdent(newBasketIdent);
        setBasketData(response.data);
        setHasInitializedBasket(true);
        
        // Save to localStorage
        saveBasketState(newBasketIdent, response.data, username, true);
        
        return newBasketIdent;
      } else {
        throw new Error('Failed to create basket - no basket identifier returned');
      }
    } catch (error) {
      setError(error.message || 'Failed to initialize basket');
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch current basket data
  const fetchBasket = async (ident) => {
    if (!ident) {
      return null;
    }
    
    // Check if we fetched recently to prevent redundant calls
    const now = Date.now();
    if (now - lastFetchTimestamp < FETCH_COOLDOWN) {
      return basketData; // Return existing data if we have it
    }
    
    try {
      setIsLoading(true);
      setError(null);
      setLastFetchTimestamp(now);
      
      const response = await tebexService.getBasket(ident);
      
      if (response?.data) {
        // Extract username from basket data if it's not set yet
        const basketUsername = response.data.username || username;
        if (basketUsername && !username) {
          setUsername(basketUsername);
        }
        
        setBasketData(response.data);
        
        // Save updated data to localStorage
        saveBasketState(ident, response.data, basketUsername, hasInitializedBasket);
        
        return response.data;
      } else {
        throw new Error('Failed to fetch basket data');
      }
    } catch (error) {
      setError(error.message || 'Failed to fetch basket data');
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Get or create a basket
  const getOrCreateBasket = async () => {
    // Don't allow basket creation without a username
    if (!username) {
      return null;
    }
    
    // If we already have a basket ID and have verified it, just return it
    if (basketIdent && hasInitializedBasket) {
      return basketIdent;
    }
    
    if (basketIdent) {
      try {
        // We already have a basket, verify it's still valid
        const basketData = await fetchBasket(basketIdent);
        if (basketData) {
          setHasInitializedBasket(true);
          saveBasketState(basketIdent, basketData, username, true);
          return basketIdent;
        }
      } catch (error) {
        // Handle error silently
      }
      
      // If we couldn't fetch the basket, create a new one
      const newBasketId = await initializeBasket();
      if (newBasketId) {
        setHasInitializedBasket(true);
        saveBasketState(newBasketId, basketData, username, true);
      }
      return newBasketId;
    } else {
      // No basket exists, create a new one
      const newBasketId = await initializeBasket();
      if (newBasketId) {
        setHasInitializedBasket(true);
      }
      return newBasketId;
    }
  };
  
  // Helper function to force production mode for testing
  const forceProductionMode = () => {
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set('force_production', 'true');
    window.history.replaceState({}, '', currentUrl.toString());
  };
  
  // Helper function to reset to development mode
  const resetToDevelopmentMode = () => {
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.delete('force_production');
    window.history.replaceState({}, '', currentUrl.toString());
  };
  
  // Add a package to the basket
  const addPackageToBasket = async (packageId, quantity = 1) => {
    if (!packageId) {
      setError('Invalid package ID');
      return null;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Ensure we have a valid basket
      const currentBasketIdent = await getOrCreateBasket();
      if (!currentBasketIdent) {
        throw new Error('Could not create or fetch basket');
      }
      
      // Set return URL to current page
      const returnUrl = window.location.href;
      
      // Add the package to the basket
      const response = await tebexService.addPackageToBasket(
        currentBasketIdent, 
        packageId, 
        quantity,
        returnUrl
      );
      
      // Check if authentication is required
      if (response && response.requires_auth && response.auth_url) {
        // Store the current operation for after authentication
        localStorage.setItem('tebex_pending_operation', JSON.stringify({
          type: 'add_package',
          basketIdent: currentBasketIdent,
          packageId,
          quantity,
          returnUrl
        }));
        
        // Redirect to the authentication URL
        window.location.href = response.auth_url;
        return null;
      }
      
      if (response?.data) {
        setBasketData(response.data);
        setLastAddedItem({ packageId, timestamp: Date.now() });
        
        // Save updated basket data to localStorage
        saveBasketState(currentBasketIdent, response.data, username, true);
        
        return response.data;
      } else {
        throw new Error('Failed to add package to basket');
      }
    } catch (error) {
      setError(error.message || 'Failed to add package to basket');
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Remove a package from the basket
  const removePackageFromBasket = async (packageId) => {
    if (!packageId) {
      setError('Invalid package ID');
      return null;
    }
    
    if (!basketIdent) {
      return null;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Set return URL to current page
      const returnUrl = window.location.href;
      
      // Remove the package from the basket
      const response = await tebexService.removePackageFromBasket(basketIdent, packageId, returnUrl);
      
      // Check if authentication is required
      if (response && response.requires_auth && response.auth_url) {
        // Store the current operation for after authentication
        localStorage.setItem('tebex_pending_operation', JSON.stringify({
          type: 'remove_package',
          basketIdent,
          packageId,
          returnUrl
        }));
        
        // Redirect to the authentication URL
        window.location.href = response.auth_url;
        return null;
      }
      
      if (response?.data) {
        setBasketData(response.data);
        
        // Save updated basket data to localStorage
        saveBasketState(basketIdent, response.data, username, true);
        
        return response.data;
      } else {
        throw new Error('Failed to remove package from basket');
      }
    } catch (error) {
      setError(error.message || 'Failed to remove package from basket');
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Get authentication links for a basket
  const getBasketAuthLinks = async (returnUrl) => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!basketIdent) {
        throw new Error('No basket identifier available');
      }
      
      const response = await tebexService.getBasketAuthLinks(basketIdent, returnUrl);
      
      if (response && Array.isArray(response)) {
        return response;
      } else {
        throw new Error('Failed to get basket auth links');
      }
    } catch (error) {
      setError(error.message || 'Failed to get authentication links');
      return [];
    } finally {
      setIsLoading(false);
    }
  };
  
  // Add items from cart to basket and proceed to checkout
  const checkoutCart = async (minecraftUsername, edition = 'java') => {
    // Remove the initial cart check since we may have items in the basket even if cart is empty
    try {
      setIsProcessingCheckout(true);
      setError(null);
      
      // Use provided username or fall back to stored username
      const checkoutUsername = minecraftUsername || username;
      if (!checkoutUsername) {
        throw new Error('No username provided for checkout');
      }
      
      const formattedUsername = edition === 'bedrock' ? `.${checkoutUsername}` : checkoutUsername;
      
      // 1. Create or get existing basket
      const currentBasketIdent = await getOrCreateBasket();
      if (!currentBasketIdent) {
        throw new Error('Failed to create or get basket');
      }
      
      // Check if we have a valid basket with items
      const basketData = await fetchBasket(currentBasketIdent);
      if (!basketData || !basketData.packages || basketData.packages.length === 0) {
        setError('Your cart is empty');
        return false;
      }
      
      // 2. If we have items in cart, ensure they're in the basket
      if (cart && cart.length > 0) {
        let syncSuccess = true;
        for (const item of cart) {
          try {
            await addPackageToBasket(item.id, 1);
          } catch (e) {
            syncSuccess = false;
          }
        }
      }
      
      // 3. Get checkout data with basket ident
      const checkoutData = await tebexService.processCheckout(currentBasketIdent, formattedUsername, edition);
      
      if (!checkoutData || !checkoutData.ident) {
        throw new Error('Failed to get valid checkout data');
      }
      
      // Store the checkout ident for reference
      setCheckoutUrl(checkoutData.ident);
      
      // 4. Launch Tebex.js checkout
      // Check if window.Tebex is available (script has loaded)
      if (typeof window.Tebex !== 'undefined') {
        // Initialize Tebex checkout with the ident and our brand colors
        window.Tebex.checkout.init({
          ident: checkoutData.ident,
          theme: "dark", // Using dark theme to match our site
          colors: [
            {
              name: "primary",
              color: "#7c3aed" // Purple color from our theme
            },
            {
              name: "secondary",
              color: "#4f46e5" // Secondary color
            }
          ]
        });
        
        // Launch the checkout
        window.Tebex.checkout.launch();
        
        // Clear the cart after successful checkout preparation
        clearCart();
        
        return true;
      } else {
        setError('Checkout system not available. Please try again later.');
        return false;
      }
    } catch (error) {
      setError(`Checkout failed: ${error.message || 'Unknown error'}`);
      return false;
    } finally {
      setIsProcessingCheckout(false);
    }
  };
  
  // Apply a coupon to the basket
  const applyCoupon = async (couponCode) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Ensure we have a valid basket
      const currentBasketIdent = await getOrCreateBasket();
      if (!currentBasketIdent) {
        throw new Error('Could not create or fetch basket');
      }
      
      // Apply the coupon
      const response = await tebexService.applyCoupon(currentBasketIdent, couponCode);
      
      if (response?.data) {
        setBasketData(response.data);
        
        // Save updated basket data to localStorage
        saveBasketState(currentBasketIdent, response.data, username, true);
        
        return response.data;
      } else {
        throw new Error('Failed to apply coupon');
      }
    } catch (error) {
      setError(error.message || 'Failed to apply coupon');
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Clear the basket and create a new one
  const resetBasket = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Clear any checkout URL
      setCheckoutUrl(null);
      
      // Clear from localStorage
      clearBasketState();
      
      // Reset state
      setBasketIdent(null);
      setBasketData(null);
      setHasInitializedBasket(false);
      
      // Create a new basket
      return await initializeBasket();
    } catch (error) {
      setError('Failed to reset basket');
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Value to be provided by context
  const value = {
    basketIdent,
    basketData,
    isLoading,
    error,
    checkoutUrl,
    isProcessingCheckout,
    developmentCheckout,
    lastAddedItem,
    initializeBasket,
    fetchBasket,
    getOrCreateBasket,
    addPackageToBasket,
    removePackageFromBasket,
    checkoutCart,
    applyCoupon,
    resetBasket,
    getBasketAuthLinks,
    syncCartWithBasket,
    forceProductionMode,
    resetToDevelopmentMode,
    username,
    hasInitializedBasket
  };
  
  return (
    <BasketContext.Provider value={value}>
      {children}
    </BasketContext.Provider>
  );
} 