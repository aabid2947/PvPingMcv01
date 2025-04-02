import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function useCart() {
  return useContext(CartContext);
}

export function CartProvider({ children }) {
  // Load cart from localStorage on initial render
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem('shoppingCart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      return [];
    }
  });
  
  const [cartOpen, setCartOpen] = useState(false);
  
  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('shoppingCart', JSON.stringify(cart));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }, [cart]);
  
  // Add an item to the cart
  const addToCart = (item) => {
    setCart(prevCart => {
      // Check if the item is already in the cart
      const itemExists = prevCart.some(cartItem => cartItem.id === item.id);
      
      if (itemExists) {
        // Item already exists, no need to add it again
        return prevCart;
      } else {
        // Add the new item to the cart
        return [...prevCart, item];
      }
    });
    
    // Open the cart modal automatically when adding an item
    setCartOpen(true);
  };
  
  // Remove an item from the cart
  const removeFromCart = (itemId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== itemId));
  };
  
  // Clear the entire cart
  const clearCart = () => {
    setCart([]);
  };
  
  // Calculate the total price of items in the cart
  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      // Extract numeric price from formatted price string (e.g., "$9.99" -> 9.99)
      const numericPrice = parseFloat(item.price.replace(/[^0-9.]/g, ''));
      return total + numericPrice;
    }, 0).toFixed(2);
  };
  
  // Check if an item is in the cart
  const isInCart = (itemId) => {
    return cart.some(item => item.id === itemId);
  };
  
  // Get the number of items in the cart
  const getCartItemCount = () => {
    return cart.length;
  };
  
  // Open the cart modal
  const openCart = () => {
    setCartOpen(true);
  };
  
  // Close the cart modal
  const closeCart = () => {
    setCartOpen(false);
  };
  
  // Context value
  const value = {
    cart,
    cartOpen,
    addToCart,
    removeFromCart,
    clearCart,
    getCartTotal,
    isInCart,
    getCartItemCount,
    openCart,
    closeCart
  };
  
  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
} 