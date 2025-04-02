import React, { createContext, useContext, useState, useEffect } from 'react';
import { useCart } from './CartContext';
import * as tebexService from '../utils/tebexHeadlessService';
import { useUser } from '../context/UserContext';

const BasketContext = createContext();

export function useBasket() {
  return useContext(BasketContext);
}

export function BasketProvider({ children }) {
  const { cart, clearCart } = useCart();
  const { username } = useUser();
  
  const [basketIdent, setBasketIdent] = useState(null);
  const [basketData, setBasketData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [checkoutUrl, setCheckoutUrl] = useState(null);
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);
  const [developmentCheckout, setDevelopmentCheckout] = useState(false);
  const [lastAddedItem, setLastAddedItem] = useState(null);
  const [authStatus, setAuthStatus] = useState(null);
  
  // Load basketIdent from localStorage on initial render
  useEffect(() => {
    const loadBasketIdent = () => {
      try {
        const savedBasketIdent = localStorage.getItem('tebexBasketIdent');
        if (savedBasketIdent) {
          console.log('Found existing basket ID in localStorage:', savedBasketIdent);
          setBasketIdent(savedBasketIdent);
          // Fetch the latest basket data
          fetchBasket(savedBasketIdent).catch(err => {
            console.error('Error fetching basket on load:', err);
            // If we can't fetch the existing basket, clear it so we can create a new one
            localStorage.removeItem('tebexBasketIdent');
            setBasketIdent(null);
          });
        } else {
          console.log('No basket ID found in localStorage');
        }
      } catch (e) {
        console.error('Error loading basket from localStorage:', e);
      }
    };
    
    loadBasketIdent();
  }, []);

  // Watch cart changes to sync with basket
  useEffect(() => {
    // Only attempt to sync cart with basket if we have items and a username
    if (cart.length > 0 && username && !isProcessingCheckout) {
      syncCartWithBasket();
    }
  }, [cart, username]);
  
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
      
      console.log('Initializing new Tebex basket...');
      
      // Complete URL and cancel URL default to current page
      const completeUrl = window.location.href;
      const cancelUrl = window.location.href;
      
      const response = await tebexService.createBasket(completeUrl, cancelUrl);
      
      if (response?.data?.ident) {
        const newBasketIdent = response.data.ident;
        console.log('Successfully created new basket with ID:', newBasketIdent);
        
        setBasketIdent(newBasketIdent);
        setBasketData(response.data);
        
        // Save to localStorage
        localStorage.setItem('tebexBasketIdent', newBasketIdent);
        
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
    
    try {
      setIsLoading(true);
      setError(null);
      
      console.log(`Fetching basket data for ID: ${ident}`);
      
      const response = await tebexService.getBasket(ident);
      
      if (response?.data) {
        console.log('Basket data fetched successfully:', response.data);
        setBasketData(response.data);
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
    if (basketIdent) {
      console.log('Using existing basket ID:', basketIdent);
      
      // We already have a basket, but let's verify it's still valid
      const basketData = await fetchBasket(basketIdent);
      if (basketData) {
        return basketIdent;
      }
      
      console.log('Existing basket is invalid, creating a new one');
      // If we couldn't fetch the basket, create a new one
      return await initializeBasket();
    } else {
      console.log('No basket ID exists, creating a new one');
      // No basket exists, create a new one
      return await initializeBasket();
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
      
      // Add the package to the basket
      const response = await tebexService.addPackageToBasket(currentBasketIdent, packageId, quantity);
      
      if (response?.data) {
        console.log('Package added to basket successfully:', response.data);
        setBasketData(response.data);
        setLastAddedItem({ packageId, timestamp: Date.now() });
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
      
      // Remove the package from the basket
      const response = await tebexService.removePackageFromBasket(basketIdent, packageId);
      
      if (response?.data) {
        console.log('Package removed from basket successfully:', response.data);
        setBasketData(response.data);
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
    if (!cart || cart.length === 0) {
      console.error('Cannot checkout empty cart');
      setError('Your cart is empty');
      return false;
    }
    
    try {
      setIsProcessingCheckout(true);
      setError(null);
      
      const formattedUsername = edition === 'bedrock' ? `.${minecraftUsername}` : minecraftUsername;
      console.log(`Processing checkout for ${formattedUsername} (${edition})`);
      
      // 1. Create or get existing basket
      const currentBasketIdent = await getOrCreateBasket();
      if (!currentBasketIdent) {
        throw new Error('Failed to create or get basket');
      }
      
      // 2. Ensure all cart items are in the basket
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
      
      // 3. Authenticate the basket before checkout
      console.log('Authenticating basket before checkout...');
      const returnUrl = window.location.href;
      updateAuthStatus({ state: 'authenticating', message: 'Authenticating your basket...' });
      const authResult = await tebexService.authenticateBasket(currentBasketIdent, returnUrl);
      
      if (!authResult.success) {
        console.error('Failed to authenticate basket:', authResult.error);
        updateAuthStatus({ state: 'failed', message: `Authentication failed: ${authResult.error || 'Unknown error'}` });
        setError(`Authentication failed: ${authResult.error || 'Unknown error'}`);
        return false;
      }
      
      console.log('Basket authenticated successfully:', authResult);
      updateAuthStatus({ state: 'success', message: 'Authentication successful', data: authResult });
      
      // 4. Determine the correct checkout URL
      let checkoutUrl;
      
      // If we have an auth link from authentication, use it
      if (authResult.primaryAuthLink && authResult.primaryAuthLink.startsWith('https://')) {
        checkoutUrl = authResult.primaryAuthLink;
        console.log('Using auth link for checkout:', checkoutUrl);
      } else {
        // Fallback to direct checkout URL
        checkoutUrl = `https://pay.tebex.io/${currentBasketIdent}`;
        console.log('Using direct checkout URL:', checkoutUrl);
      }
      
      // 5. Add username as a query parameter if not already present
      if (!checkoutUrl.includes('username=')) {
        const separator = checkoutUrl.includes('?') ? '&' : '?';
        checkoutUrl = `${checkoutUrl}${separator}username=${encodeURIComponent(formattedUsername)}`;
      }
      
      console.log('Final checkout URL:', checkoutUrl);
      
      // Set the checkout URL for redirection
      setCheckoutUrl(checkoutUrl);
      
      // Clear the cart after successful checkout preparation
      clearCart();
      
      return true;
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
      
      // Remove from localStorage
      localStorage.removeItem('tebexBasketIdent');
      
      // Reset state
      setBasketIdent(null);
      setBasketData(null);
      
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
  
  // Add a function to track authentication status
  const updateAuthStatus = (status) => {
    setAuthStatus(status);
    // Log auth status for debugging
    console.log(`[Basket] Authentication status updated:`, status);
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
    authStatus,
    updateAuthStatus
  };
  
  return (
    <BasketContext.Provider value={value}>
      {children}
    </BasketContext.Provider>
  );
} 