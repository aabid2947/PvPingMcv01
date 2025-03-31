import React, { createContext, useState, useContext, useEffect } from 'react';

// Create the store context
const StoreContext = createContext();

// Custom hook to use the store context
export const useStore = () => useContext(StoreContext);

// Sample store products for development
const sampleProducts = [
  {
    id: 1,
    name: "VIP Rank",
    price: "9.99",
    description: "Get VIP status with special perks and privileges on the server.",
  },
  {
    id: 2,
    name: "MVP Rank",
    price: "19.99",
    description: "Upgrade to MVP for premium features and exclusive access.",
  },
  {
    id: 3,
    name: "Legendary Crate",
    price: "14.99",
    description: "Unlock rare items and special rewards with this legendary crate.",
  },
  {
    id: 4,
    name: "Mystery Crate",
    price: "7.99",
    description: "Try your luck with our mystery crate filled with random goodies.",
  }
];

// Store Provider component
export const StoreProvider = ({ children }) => {
  // State for products
  const [products, setProducts] = useState(sampleProducts);
  
  // State for selected product
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  // State for purchase flow
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [edition, setEdition] = useState('java');
  const [purchaseStep, setPurchaseStep] = useState('username'); // username, checkout, success
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  
  // Load state from sessionStorage on initial render
  useEffect(() => {
    const storedUsername = sessionStorage.getItem('mc_username');
    const storedEdition = sessionStorage.getItem('mc_edition');
    const storedPurchaseSuccess = sessionStorage.getItem('purchase_success');
    
    if (storedUsername) setUsername(storedUsername);
    if (storedEdition) setEdition(storedEdition);
    if (storedPurchaseSuccess === 'true') setPurchaseSuccess(true);
  }, []);
  
  // Save state to sessionStorage when relevant values change
  useEffect(() => {
    if (username) sessionStorage.setItem('mc_username', username);
    if (edition) sessionStorage.setItem('mc_edition', edition);
    sessionStorage.setItem('purchase_success', purchaseSuccess.toString());
  }, [username, edition, purchaseSuccess]);
  
  // Handle opening purchase modal for a specific product
  const openPurchaseModal = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
    setPurchaseStep('username');
    setError(null);
  };
  
  // Handle closing the purchase modal
  const closePurchaseModal = () => {
    setIsModalOpen(false);
    setError(null);
    
    // Delay resetting other states to allow for animations
    setTimeout(() => {
      setPurchaseStep('username');
      if (!purchaseSuccess) {
        setSelectedProduct(null);
      }
    }, 300);
  };
  
  // Move to the next purchase step
  const goToCheckout = () => {
    if (!username.trim()) {
      setError('Please enter your Minecraft username');
      return;
    }
    
    setPurchaseStep('checkout');
    setError(null);
  };
  
  // Complete the purchase successfully
  const completePurchase = () => {
    setPurchaseSuccess(true);
    setPurchaseStep('success');
    setTimeout(() => {
      closePurchaseModal();
    }, 3000);
  };
  
  // Reset purchase state (e.g., after navigating away)
  const resetPurchase = () => {
    setSelectedProduct(null);
    setPurchaseSuccess(false);
    setPurchaseStep('username');
    setError(null);
  };
  
  // Context value to be provided
  const contextValue = {
    // Products
    products,
    setProducts,
    
    // Product selection
    selectedProduct,
    setSelectedProduct,
    
    // Purchase flow
    isModalOpen,
    setIsModalOpen,
    username,
    setUsername,
    edition,
    setEdition,
    purchaseStep,
    setPurchaseStep,
    loading,
    setLoading,
    error,
    setError,
    purchaseSuccess,
    setPurchaseSuccess,
    
    // Methods
    openPurchaseModal,
    closePurchaseModal,
    goToCheckout,
    completePurchase,
    resetPurchase
  };
  
  return (
    <StoreContext.Provider value={contextValue}>
      {children}
    </StoreContext.Provider>
  );
};

export default StoreContext; 