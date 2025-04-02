import React, { createContext, useContext, useState, useEffect } from 'react';
import { useCart } from './CartContext';
import * as tebexService from '../utils/tebexHeadlessService';

const BasketContext = createContext();

export function useBasket() {
  return useContext(BasketContext);
}

export function BasketProvider({ children }) {
  const { cart, clearCart } = useCart();
  
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
  
  // Add items from cart to basket and proceed to checkout
  const checkoutCart = async (username, edition) => {
    if (!cart || cart.length === 0) {
      console.error('Cannot checkout empty cart');
      setError('Your cart is empty');
      return false;
    }
    
    try {
      setIsProcessingCheckout(true);
      setError(null);
      
      console.log(`Processing checkout for ${username} (${edition})`);
      
      // 1. Create items array in the format expected by the API
      const items = cart.map(item => ({
        id: item.id,
        quantity: 1
      }));
      
      // 2. Process checkout with items
      const result = await tebexService.processCheckout(
        basketIdent || null,
        username,
        edition,
        items
      );
      
      console.log('Checkout result:', result);
      
      if (!result || !result.url) {
        throw new Error('Invalid checkout response');
      }
      
      // Set checkout URL for redirection
      setCheckoutUrl(result.url);
      
      // If this is a development mode checkout, keep track of that
      if (result.development_mode) {
        setDevelopmentCheckout(true);
      }
      
      // Clear the cart after successful checkout
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
      
      // Remove from localStorage
      try {
        localStorage.removeItem('tebexBasketIdent');
      } catch (e) {
        console.error('Error removing basket from localStorage:', e);
      }
      
      // Reset state
      setBasketIdent(null);
      setBasketData(null);
      setCheckoutUrl(null);
      
      // Don't automatically create a new basket here
      // Instead, let getOrCreateBasket handle this when needed
      
      return null;
    } catch (error) {
      console.error('Error resetting basket:', error);
      setError(error.message || 'Failed to reset basket');
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Value object for the context
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
    resetBasket
  };
  
  return (
    <BasketContext.Provider value={value}>
      {children}
    </BasketContext.Provider>
  );
} 