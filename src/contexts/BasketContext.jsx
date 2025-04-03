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
      console.error('Error loading username from localStorage:', error);
      return userContextUsername || null;
    }
  });

  const [basketIdent, setBasketIdent] = useState(() => {
    try {
      return localStorage.getItem(BASKET_IDENT_KEY) || null;
    } catch (error) {
      console.error('Error loading basketIdent from localStorage:', error);
      return null;
    }
  });

  const [basketData, setBasketData] = useState(() => {
    try {
      const storedData = localStorage.getItem(BASKET_DATA_KEY);
      return storedData ? JSON.parse(storedData) : null;
    } catch (error) {
      console.error('Error loading basketData from localStorage:', error);
      return null;
    }
  });

  const [hasInitializedBasket, setHasInitializedBasket] = useState(() => {
    try {
      return localStorage.getItem(BASKET_INITIALIZED_KEY) === 'true';
    } catch (error) {
      console.error('Error loading hasInitializedBasket from localStorage:', error);
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
      
      console.log('Basket state saved to localStorage:', { ident, user, initialized });
    } catch (error) {
      console.error('Error saving basket state to localStorage:', error);
    }
  };
  
  // Helper function to clear basket state from localStorage
  const clearBasketState = () => {
    try {
      localStorage.removeItem(BASKET_IDENT_KEY);
      localStorage.removeItem(BASKET_DATA_KEY);
      localStorage.removeItem(BASKET_USERNAME_KEY);
      localStorage.removeItem(BASKET_INITIALIZED_KEY);
      console.log('Basket state cleared from localStorage');
    } catch (error) {
      console.error('Error clearing basket state from localStorage:', error);
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
          console.log('No username set, skipping basket initialization');
          return;
        }
        
        if (basketIdent) {
          console.log('Found existing basket ID in state:', basketIdent);
          
          // Fetch the latest basket data if we haven't fetched recently
          const now = Date.now();
          if (now - lastFetchTimestamp > FETCH_COOLDOWN) {
            fetchBasket(basketIdent).catch(err => {
              console.error('Error fetching basket on load:', err);
              // If we can't fetch the existing basket, clear it so we can create a new one
              clearBasketState();
              setBasketIdent(null);
              setBasketData(null);
              setHasInitializedBasket(false);
            });
          }
        } else {
          console.log('No basket ID found in state');
        }
      } catch (e) {
        console.error('Error loading basket from localStorage:', e);
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
          console.log('Detected return from Tebex authentication');
          setIsLoading(true);
          
          // Process the pending operation that was stored before redirect
          const pendingOp = localStorage.getItem('tebex_pending_operation');
          
          if (pendingOp) {
            try {
              const operation = JSON.parse(pendingOp);
              console.log('Found pending operation after auth:', operation);
              
              if (operation.type === 'add_package' && operation.basketIdent && operation.packageId) {
                // Re-attempt to add the package now that user is authenticated
                await addPackageToBasket(operation.packageId, operation.quantity || 1);
                console.log('Successfully completed operation after authentication');
                
                // Clear the pending operation
                localStorage.removeItem('tebex_pending_operation');
              }
            } catch (parseError) {
              console.error('Error parsing pending operation:', parseError);
            }
          }
          
          // Clean up the URL by removing auth parameters
          const cleanUrl = window.location.pathname + 
                          window.location.search.replace(/[?&]tebex_auth[^&]*/, '').replace(/[?&]auth_return[^&]*/, '');
          window.history.replaceState({}, document.title, cleanUrl);
          
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error handling authentication return:', error);
        setIsLoading(false);
      }
    };
    
    checkForAuthReturn();
  }, []);
  
  // Sync the current cart items with the Tebex basket
  const syncCartWithBasket = async () => {
    if (!username) {
      console.warn('Cannot sync cart with basket: No username set');
      return;
    }
    
    try {
      // Ensure we have a valid basket
      const currentBasketIdent = await getOrCreateBasket();
      if (!currentBasketIdent) {
        throw new Error('Failed to get or create basket for cart sync');
      }
      
      console.log(`Syncing cart with basket ID: ${currentBasketIdent}`);
      
      // TODO: For a full sync, we would need to:
      // 1. Get current packages in the basket
      // 2. Compare with cart items
      // 3. Add missing items / remove extra items
      
      // For now, we'll just ensure the basket exists
      return currentBasketIdent;
    } catch (error) {
      console.error('Error syncing cart with basket:', error);
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
        console.warn('Cannot initialize basket: No username set');
        setError('You must be logged in to create a basket');
        return null;
      }
      
      console.log('Initializing new Tebex basket...');
      
      // Complete URL and cancel URL default to current page
      const completeUrl = window.location.href;
      const cancelUrl = window.location.href;
      
      const response = await tebexService.createBasket(completeUrl, cancelUrl, username);
      
      if (response?.data?.ident) {
        const newBasketIdent = response.data.ident;
        console.log('Successfully created new basket with ID:', newBasketIdent);
        
        setBasketIdent(newBasketIdent);
        setBasketData(response.data);
        setHasInitializedBasket(true);
        
        // Save to localStorage
        saveBasketState(newBasketIdent, response.data, username, true);
        
        return newBasketIdent;
      } else {
        console.error('Failed to create basket - no basket identifier returned', response);
        throw new Error('Failed to create basket - no basket identifier returned');
      }
    } catch (error) {
      console.error('Error initializing basket:', error);
      setError(error.message || 'Failed to initialize basket');
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch current basket data
  const fetchBasket = async (ident) => {
    if (!ident) {
      console.warn('Cannot fetch basket: No basket ID provided');
      return null;
    }
    
    // Check if we fetched recently to prevent redundant calls
    const now = Date.now();
    if (now - lastFetchTimestamp < FETCH_COOLDOWN) {
      console.log(`Skipping basket fetch, last fetch was ${now - lastFetchTimestamp}ms ago`);
      return basketData; // Return existing data if we have it
    }
    
    try {
      setIsLoading(true);
      setError(null);
      setLastFetchTimestamp(now);
      
      console.log(`Fetching basket data for ID: ${ident}`);
      
      const response = await tebexService.getBasket(ident);
      
      if (response?.data) {
        console.log('Basket data fetched successfully:', response.data);
        
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
        console.error('Failed to fetch basket data - empty response:', response);
        throw new Error('Failed to fetch basket data');
      }
    } catch (error) {
      console.error('Error fetching basket:', error);
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
      console.warn('Cannot create basket: No username set');
      return null;
    }
    
    // If we already have a basket ID and have verified it, just return it
    if (basketIdent && hasInitializedBasket) {
      console.log('Using cached basket ID:', basketIdent);
      return basketIdent;
    }
    
    if (basketIdent) {
      console.log('Using existing basket ID:', basketIdent);
      
      try {
        // We already have a basket, verify it's still valid
        const basketData = await fetchBasket(basketIdent);
        if (basketData) {
          setHasInitializedBasket(true);
          saveBasketState(basketIdent, basketData, username, true);
          return basketIdent;
        }
      } catch (error) {
        console.error('Error verifying existing basket:', error);
      }
      
      console.log('Existing basket is invalid, creating a new one');
      // If we couldn't fetch the basket, create a new one
      const newBasketId = await initializeBasket();
      if (newBasketId) {
        setHasInitializedBasket(true);
        saveBasketState(newBasketId, basketData, username, true);
      }
      return newBasketId;
    } else {
      console.log('No basket ID exists, creating a new one');
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
    console.log('🛠️ Production mode forced for Tebex API calls. Refresh to apply changes.');
  };
  
  // Helper function to reset to development mode
  const resetToDevelopmentMode = () => {
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.delete('force_production');
    window.history.replaceState({}, '', currentUrl.toString());
    console.log('🛠️ Development mode restored for Tebex API calls. Refresh to apply changes.');
  };
  
  // Add a package to the basket
  const addPackageToBasket = async (packageId, quantity = 1) => {
    if (!packageId) {
      console.error('Cannot add package to basket: No package ID provided');
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
      
      console.log(`Adding package ${packageId} to basket ${currentBasketIdent}`);
      
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
        console.log('Authentication required before adding to basket. Redirecting to:', response.auth_url);
        
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
      console.log(response)
      if (response?.data) {
        console.log('Package added to basket successfully:', response.data);
        setBasketData(response.data);
        setLastAddedItem({ packageId, timestamp: Date.now() });
        
        // Save updated basket data to localStorage
        saveBasketState(currentBasketIdent, response.data, username, true);
        
        return response.data;
      } else {
        console.error('Failed to add package to basket - empty response:', response);
        throw new Error('Failed to add package to basket');
      }
    } catch (error) {
      console.error('Error adding package to basket:', error);
      setError(error.message || 'Failed to add package to basket');
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Remove a package from the basket
  const removePackageFromBasket = async (packageId) => {
    if (!packageId) {
      console.error('Cannot remove package from basket: No package ID provided');
      setError('Invalid package ID');
      return null;
    }
    
    if (!basketIdent) {
      console.warn('Cannot remove package: No basket exists');
      return null;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      console.log(`Removing package ${packageId} from basket ${basketIdent}`);
      
      // Set return URL to current page
      const returnUrl = window.location.href;
      
      // Remove the package from the basket
      const response = await tebexService.removePackageFromBasket(basketIdent, packageId, returnUrl);
      
      // Check if authentication is required
      if (response && response.requires_auth && response.auth_url) {
        console.log('Authentication required before removing from basket. Redirecting to:', response.auth_url);
        
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
        console.log('Package removed from basket successfully:', response.data);
        setBasketData(response.data);
        
        // Save updated basket data to localStorage
        saveBasketState(basketIdent, response.data, username, true);
        
        return response.data;
      } else {
        console.error('Failed to remove package from basket - empty response:', response);
        throw new Error('Failed to remove package from basket');
      }
    } catch (error) {
      console.error('Error removing package from basket:', error);
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
        console.error('No basket identifier available for auth links');
        throw new Error('No basket identifier available');
      }
      
      console.log(`Getting auth links for basket ${basketIdent}`);
      
      const response = await tebexService.getBasketAuthLinks(basketIdent, returnUrl);
      
      if (response && Array.isArray(response)) {
        console.log('Basket auth links retrieved successfully:', response);
        return response;
      } else {
        console.error('Failed to get basket auth links - invalid response:', response);
        throw new Error('Failed to get basket auth links');
      }
    } catch (error) {
      console.error('Error getting basket auth links:', error);
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
      console.log(`Processing checkout for ${formattedUsername} (${edition})`);
      
      // 1. Create or get existing basket
      const currentBasketIdent = await getOrCreateBasket();
      if (!currentBasketIdent) {
        throw new Error('Failed to create or get basket');
      }
      
      // Check if we have a valid basket with items
      const basketData = await fetchBasket(currentBasketIdent);
      if (!basketData || !basketData.packages || basketData.packages.length === 0) {
        console.error('Cannot checkout empty basket');
        setError('Your cart is empty');
        return false;
      }
      
      // 2. If we have items in cart, ensure they're in the basket
      if (cart && cart.length > 0) {
        let syncSuccess = true;
        for (const item of cart) {
          try {
            console.log(`Ensuring item ${item.id} is in basket ${currentBasketIdent}`);
            await addPackageToBasket(item.id, 1);
          } catch (e) {
            console.error(`Failed to add item ${item.id} to basket:`, e);
            syncSuccess = false;
          }
        }
        
        if (!syncSuccess) {
          console.warn('Some items may not have been added to the basket properly');
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
        console.log('Initializing Tebex.js checkout with ident:', checkoutData.ident);
        
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
        console.error('Tebex.js not loaded');
        setError('Checkout system not available. Please try again later.');
        return false;
      }
    } catch (error) {
      console.error('Error during checkout:', error);
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
      console.error('Error applying coupon:', error);
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
      
      console.log('Basket reset successful, creating a new one');
      
      // Create a new basket
      return await initializeBasket();
    } catch (error) {
      console.error('Error resetting basket:', error);
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