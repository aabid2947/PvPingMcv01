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
    developmentCheckout
  } = useBasket();
  
  const [username, setUsername] = useState(savedUsername || '');
  const [edition, setEdition] = useState('java');
  const [formErrors, setFormErrors] = useState({});
  const [checkoutComplete, setCheckoutComplete] = useState(false);
  
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
    
    if (checkoutUrl) {
      console.log('Checkout URL available, preparing to redirect:', checkoutUrl);
      
      // Log URL format validation for debugging
      if (checkoutUrl.startsWith('https://pay.tebex.io/')) {
        console.log('✅ Correct Tebex checkout URL format detected');
      } else if (checkoutUrl.startsWith('https://ident.tebex.io/')) {
        console.log('✅ Tebex authentication URL detected - this will redirect to payment after auth');
      } else {
        console.warn('⚠️ Checkout URL does not match expected formats');
      }
      
      setCheckoutComplete(true);
      
      // Check if we're in development mode
      const isDev = process.env.NODE_ENV === 'development' || 
                   window.location.hostname === 'localhost' || 
                   window.location.hostname === '127.0.0.1';
      
      const isMockUrl = (checkoutUrl.includes('mock') || checkoutUrl.includes('example.com'));
      
      if ((isDev && isMockUrl) || developmentCheckout) {
        console.log('Development mode or mock URL detected - simulating redirect');
        // In development with mock URLs, we don't actually redirect
        // This prevents navigating away from the app during testing
        
        // Just log that we would redirect in production
        console.log('In production, would redirect to:', checkoutUrl);
        
        // We can display a message here if needed
        redirectTimer = setTimeout(() => {
          // After "simulated" checkout, reset so user can continue testing
          clearForm();
        }, 3000);
      } else {
        // Regular production redirect
        redirectTimer = setTimeout(() => {
          console.log('Redirecting to checkout URL:', checkoutUrl);
          try {
            window.location.assign(checkoutUrl);
            
            // Fallback
            setTimeout(() => {
              if (window.location.href !== checkoutUrl) {
                window.location.href = checkoutUrl;
              }
            }, 500);
          } catch (error) {
            console.error('Error during redirection:', error);
            window.open(checkoutUrl, '_self');
          }
        }, 1000);
      }
    }
    
    // Cleanup function to clear timeout
    return () => {
      if (redirectTimer) {
        clearTimeout(redirectTimer);
      }
    };
  }, [checkoutUrl, resetBasket, developmentCheckout]);
  
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
  
  // Show the mock data message when appropriate in checkout complete view
  const checkoutCompleteView = (
    <div className="flex flex-col items-center justify-center py-6 space-y-4">
      <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
        <Check size={32} className="text-green-500" />
      </div>
      <h3 className="text-lg font-medium text-white">
        {(developmentCheckout || checkoutUrl?.includes('example.com'))
          ? "Test Checkout Complete"
          : checkoutUrl?.includes('ident.tebex.io')
            ? "Redirecting to authentication..."
            : "Redirecting to payment..."}
      </h3>
      <p className="text-neutral-400 text-center text-sm">
        {(developmentCheckout || checkoutUrl?.includes('example.com'))
          ? "This is a test checkout. In production, you would be redirected to the payment page. The modal will close in a moment."
          : checkoutUrl?.includes('ident.tebex.io')
            ? "You will be redirected to authenticate your Minecraft account before proceeding to payment. This ensures your purchase is linked to the correct account."
            : "You will be redirected to the payment page in a moment. If you are not redirected, click the button below."}
      </p>
      <a 
        href={checkoutUrl} 
        onClick={(e) => {
          e.preventDefault();
          
          // Check if we're in development mode
          const isDev = process.env.NODE_ENV === 'development' || 
                       window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1';
          
          if ((isDev && checkoutUrl && (checkoutUrl.includes('mock') || checkoutUrl.includes('example.com'))) || developmentCheckout) {
            console.log('Development mode or mock URL detected - simulating manual redirect to:', checkoutUrl);
            // For development, just log the redirect but don't navigate away
            alert('DEVELOPMENT MODE: In production, this would redirect to:\n' + checkoutUrl);
          } else if (checkoutUrl) {
            // Regular production redirect
            console.log('Manual redirect to:', checkoutUrl);
            window.location.assign(checkoutUrl);
          }
        }}
        className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
      >
        {(developmentCheckout || checkoutUrl?.includes('example.com'))
          ? "Simulate Payment Redirect"
          : checkoutUrl?.includes('ident.tebex.io')
            ? "Continue to Authentication"
            : "Continue to Payment"}
      </a>
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
                    <span className="text-gray-400">Items ({cart.length}):</span>
                    <span className="text-white">${getCartTotal()}</span>
                  </div>
                  {/* You could add tax, discounts, etc. here */}
                  <div className="flex justify-between font-bold border-t border-gray-700 pt-2 mt-2">
                    <span className="text-white">Total:</span>
                    <span className="text-purple-500">${getCartTotal()}</span>
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
                        className="form-radio text-purple-600"
                        name="edition"
                        value="java"
                        checked={edition === 'java'}
                        onChange={() => setEdition('java')}
                        disabled={isProcessingCheckout}
                      />
                      <span className="ml-2 text-white">Java</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        className="form-radio text-purple-600"
                        name="edition"
                        value="bedrock"
                        checked={edition === 'bedrock'}
                        onChange={() => setEdition('bedrock')}
                        disabled={isProcessingCheckout}
                      />
                      <span className="ml-2 text-white">Bedrock</span>
                    </label>
                  </div>
                  {formErrors.edition && (
                    <p className="mt-1 text-sm text-red-500">{formErrors.edition}</p>
                  )}
                </div>
                
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-md transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isProcessingCheckout}
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