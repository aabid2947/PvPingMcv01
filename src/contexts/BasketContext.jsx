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
  
  // Load basketIdent from localStorage on initial render
  useEffect(() => {
    const loadBasketIdent = () => {
      try {
        const savedBasketIdent = localStorage.getItem('tebexBasketIdent');
        if (savedBasketIdent) {
          setBasketIdent(savedBasketIdent);
          // Fetch the latest basket data
          fetchBasket(savedBasketIdent).catch(err => {
            console.error('Error fetching basket on load:', err);
            // If we can't fetch the existing basket, clear it so we can create a new one
            localStorage.removeItem('tebexBasketIdent');
            setBasketIdent(null);
          });
        }
      } catch (e) {
        console.error('Error loading basket from localStorage:', e);
      }
    };
    
    loadBasketIdent();
  }, []);
  
  // Initialize a new basket if needed
  const initializeBasket = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Complete URL and cancel URL default to current page
      const completeUrl = window.location.href;
      const cancelUrl = window.location.href;
      
      const response = await tebexService.createBasket(completeUrl, cancelUrl);
      
      if (response?.data?.ident) {
        const newBasketIdent = response.data.ident;
        setBasketIdent(newBasketIdent);
        setBasketData(response.data);
        
        // Save to localStorage
        localStorage.setItem('tebexBasketIdent', newBasketIdent);
        
        return newBasketIdent;
      } else {
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
    if (!ident) return null;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await tebexService.getBasket(ident);
      
      if (response?.data) {
        setBasketData(response.data);
        return response.data;
      } else {
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
      // We already have a basket, but let's refresh it
      const basketData = await fetchBasket(basketIdent);
      if (basketData) {
        return basketIdent;
      }
      
      // If we couldn't fetch the basket, create a new one
      return await initializeBasket();
    } else {
      // No basket exists, create a new one
      return await initializeBasket();
    }
  };
  
  // Add a package to the basket
  const addPackageToBasket = async (packageId, quantity = 1) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Ensure we have a valid basket
      const currentBasketIdent = await getOrCreateBasket();
      if (!currentBasketIdent) {
        throw new Error('Could not create or fetch basket');
      }
      
      // Add the package to the basket
      const response = await tebexService.addPackageToBasket(currentBasketIdent, packageId, quantity);
      
      if (response?.data) {
        setBasketData(response.data);
        return response.data;
      } else {
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
      
      // 2. Add all items from cart to basket
      for (const item of cart) {
        await addPackageToBasket(item.id, 1);
      }
      
      // 3. Get the return URL (current page)
      const returnUrl = window.location.href;
      
      // 4. Get auth links for the basket
      const authLinks = await getBasketAuthLinks(returnUrl);
      
      if (!authLinks || authLinks.length === 0) {
        throw new Error('Failed to get authentication links for checkout');
      }
      
      // 5. Use the first auth link (usually there's only one)
      const checkoutLink = authLinks[0]?.url;
      
      if (!checkoutLink) {
        throw new Error('No valid checkout URL found');
      }
      
      // Set the checkout URL for redirection
      setCheckoutUrl(checkoutLink);
      
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
    initializeBasket,
    fetchBasket,
    getOrCreateBasket,
    addPackageToBasket,
    checkoutCart,
    applyCoupon,
    resetBasket,
    getBasketAuthLinks
  };
  
  return (
    <BasketContext.Provider value={value}>
      {children}
    </BasketContext.Provider>
  );
} 