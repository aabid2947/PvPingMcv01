import React, { useState, useEffect } from 'react';
import { useCart } from '../contexts/CartContext';
import { useBasket } from '../contexts/BasketContext';
import { useUser } from '../context/UserContext';
import { X, Check, AlertCircle, Loader2 } from 'lucide-react';

export default function CheckoutModal({ isOpen, onClose }) {
  const { cart, getCartTotal } = useCart();
  const { username: savedUsername, login } = useUser();
  const { 
    isLoading, 
    error, 
    checkoutCart, 
    checkoutUrl, 
    isProcessingCheckout,
    resetBasket,
    developmentCheckout,
    basketData,
    fetchBasket,
    basketIdent
  } = useBasket();
  
  const [username, setUsername] = useState(savedUsername || '');
  const [edition, setEdition] = useState('java');
  const [formErrors, setFormErrors] = useState({});
  const [checkoutComplete, setCheckoutComplete] = useState(false);
  const [itemCount, setItemCount] = useState(0);
  const [orderTotal, setOrderTotal] = useState('0.00');
  const [hasInitiallyFetchedBasket, setHasInitiallyFetchedBasket] = useState(false);
  
  // Get basket data when modal opens
  useEffect(() => {
    // Only fetch basket data once when the modal opens
    if (isOpen && basketIdent && !hasInitiallyFetchedBasket) {
      console.log('Fetching basket data once on modal open');
      
      setHasInitiallyFetchedBasket(true);
      
      fetchBasket(basketIdent).then(data => {
        console.log('Initial basket fetch complete');
      }).catch(err => {
        console.error('Error fetching basket on modal open:', err);
      });
    }
    
    // Reset the fetch flag when modal closes
    if (!isOpen) {
      setHasInitiallyFetchedBasket(false);
    }
  }, [isOpen, basketIdent]); // Don't include fetchBasket in dependencies to avoid loop
  
  // Update item count and order total when basketData changes
  useEffect(() => {
    if (basketData && basketData.packages) {
      setItemCount(basketData.packages.length);
      
      // Calculate total from basket data
      if (basketData.total) {
        setOrderTotal(basketData.total);
      }
    } else if (cart && cart.length > 0) {
      // Fallback to cart data if basket data is not available
      setItemCount(cart.length);
      setOrderTotal(getCartTotal());
    } else {
      setItemCount(0);
      setOrderTotal('0.00');
    }
  }, [basketData, cart, getCartTotal]);
  
  // Reset form state when modal is opened
  useEffect(() => {
    if (isOpen) {
      setUsername(savedUsername || '');
      setEdition('java');
      setFormErrors({});
      setCheckoutComplete(false);
    }
  }, [isOpen, savedUsername]);
  
  // Function to clear form fields and state
  const clearForm = () => {
    setUsername('');
    setEdition('java');
    setFormErrors({});
    setCheckoutComplete(false);
    if (resetBasket) {
      resetBasket();
    }
  };
  
  // Update the redirect useEffect with proper setTimeout handling
  useEffect(() => {
    let redirectTimer = null;
    
    if (checkoutComplete && !checkoutUrl) {
      // If checkout is complete but there's no checkout ident/URL (old flow fallback)
      // We just reset the form after a few seconds
      redirectTimer = setTimeout(() => {
        clearForm();
      }, 3000);
    }
    
    // Cleanup function to clear timeout
    return () => {
      if (redirectTimer) {
        clearTimeout(redirectTimer);
      }
    };
  }, [checkoutComplete, checkoutUrl]);

  // When checkout is successful, set checkout complete
  useEffect(() => {
    if (checkoutUrl) {
      setCheckoutComplete(true);
    }
  }, [checkoutUrl]);
  
  // Validate form before submission
  const validateForm = () => {
    const errors = {};
    
    if (!username.trim()) {
      errors.username = 'Username is required';
    } else if (username.length < 3 || username.length > 16) {
      errors.username = 'Username must be between 3 and 16 characters';
    }
    
    if (!edition) {
      errors.edition = 'Please select a Minecraft edition';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Save the username to UserContext if it's not already saved
    if (!savedUsername || savedUsername !== username) {
      login(username);
    }
    
    await checkoutCart(username, edition);
  };
  
  // If the modal is not open, don't render anything
  if (!isOpen) return null;
  
  // Show the checkout complete view
  const checkoutCompleteView = (
    <div className="flex flex-col items-center justify-center py-6 space-y-4">
      <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
        <Check size={32} className="text-green-500" />
      </div>
      <h3 className="text-lg font-medium text-white">
        {developmentCheckout ? "Test Checkout Complete" : "Checkout Initiated"}
      </h3>
      <p className="text-neutral-400 text-center text-sm">
        {developmentCheckout 
          ? "This is a test checkout. The Tebex checkout would normally appear in an overlay."
          : "The checkout form will appear in a moment. Please complete your payment to receive your items."}
      </p>
      
      {/* No need for manual redirection button with Tebex.js */}
      {developmentCheckout && (
        <button 
          onClick={() => clearForm()}
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
        >
          Close Test Checkout
        </button>
      )}
    </div>
  );
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative bg-slate-900 rounded-lg shadow-xl w-full max-w-md p-6 mx-4">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white transition-colors"
          disabled={isProcessingCheckout}
        >
          <X size={24} />
        </button>
        
        {/* Modal content */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-white">Complete Your Purchase</h2>
          
          {checkoutComplete ? (
            checkoutCompleteView
          ) : (
            <>
              {/* Cart summary */}
              <div className="bg-slate-800 rounded-md p-4">
                <h3 className="text-lg font-medium text-white mb-2">Order Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Items ({itemCount}):</span>
                    <span className="text-white">${orderTotal}</span>
                  </div>
                  {/* You could add tax, discounts, etc. here */}
                  <div className="flex justify-between font-bold border-t border-gray-700 pt-2 mt-2">
                    <span className="text-white">Total:</span>
                    <span className="text-purple-500">${orderTotal}</span>
                  </div>
                </div>
              </div>
              
              {error && (
                <div className="bg-red-500/20 border border-red-500/50 rounded-md p-3 flex items-start">
                  <AlertCircle size={20} className="text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-200">{error}</p>
                </div>
              )}
              
              {/* Checkout form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-1">
                    Minecraft Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className={`w-full px-3 py-2 bg-slate-800 border ${
                      formErrors.username ? 'border-red-500' : 'border-gray-700'
                    } rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500`}
                    placeholder="Enter your Minecraft username"
                    disabled={isProcessingCheckout}
                  />
                  {formErrors.username && (
                    <p className="mt-1 text-sm text-red-500">{formErrors.username}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-1">
                    Minecraft Edition
                  </label>
                  <div className="flex space-x-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        value="java"
                        checked={edition === 'java'}
                        onChange={() => setEdition('java')}
                        className="w-4 h-4 text-purple-600 border-gray-700 focus:ring-purple-500"
                        disabled={isProcessingCheckout}
                      />
                      <span className="ml-2 text-gray-300">Java Edition</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        value="bedrock"
                        checked={edition === 'bedrock'}
                        onChange={() => setEdition('bedrock')}
                        className="w-4 h-4 text-purple-600 border-gray-700 focus:ring-purple-500"
                        disabled={isProcessingCheckout}
                      />
                      <span className="ml-2 text-gray-300">Bedrock Edition</span>
                    </label>
                  </div>
                </div>
                
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-md transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isProcessingCheckout || isLoading || itemCount === 0}
                  >
                    {isProcessingCheckout ? (
                      <>
                        <Loader2 size={20} className="animate-spin mr-2" />
                        Processing...
                      </>
                    ) : (
                      'Proceed to Payment'
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 