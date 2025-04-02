import React, { useState, useEffect } from 'react';
import { useCart } from '../contexts/CartContext';
import { useBasket } from '../contexts/BasketContext';
import { X, Check, AlertCircle, Loader2 } from 'lucide-react';

export default function CheckoutModal({ isOpen, onClose }) {
  const { cart, getCartTotal } = useCart();
  const { 
    isLoading, 
    error, 
    checkoutCart, 
    checkoutUrl, 
    isProcessingCheckout,
    resetBasket
  } = useBasket();
  
  const [username, setUsername] = useState('');
  const [edition, setEdition] = useState('java');
  const [formErrors, setFormErrors] = useState({});
  const [checkoutComplete, setCheckoutComplete] = useState(false);
  
  // Reset form state when modal is opened
  useEffect(() => {
    if (isOpen) {
      setUsername('');
      setEdition('java');
      setFormErrors({});
      setCheckoutComplete(false);
    }
  }, [isOpen]);
  
  // Redirect to checkout URL if available
  useEffect(() => {
    if (checkoutUrl) {
      console.log('Checkout URL available, preparing to redirect:', checkoutUrl);
      
      setCheckoutComplete(true);
      
      // Check if we're in development mode
      const isDev = process.env.NODE_ENV === 'development' || 
                   window.location.hostname === 'localhost' || 
                   window.location.hostname === '127.0.0.1';
      
      if (isDev && checkoutUrl.includes('mock') || checkoutUrl.includes('example.com')) {
        console.log('Development mode or mock URL detected - simulating redirect');
        // In development with mock URLs, we don't actually redirect
        // This prevents navigating away from the app during testing
        
        // Just log that we would redirect in production
        console.log('In production, would redirect to:', checkoutUrl);
        
        // We can display a message here if needed
        setTimeout(() => {
          // After "simulated" checkout, reset so user can continue testing
          clearForm();
        }, 3000);
      } else {
        // Regular production redirect
        const redirectTimer = setTimeout(() => {
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
        
        return () => clearTimeout(redirectTimer);
      }
    }
  }, [checkoutUrl]);
  
  // Reset checkout state when modal is closed
  useEffect(() => {
    if (!isOpen && checkoutComplete && resetBasket) {
      resetBasket();
    }
  }, [isOpen, checkoutComplete, resetBasket]);
  
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
    
    await checkoutCart(username, edition);
  };
  
  // If the modal is not open, don't render anything
  if (!isOpen) return null;
  
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
            // Checkout complete view
            <div className="flex flex-col items-center justify-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
                <Check size={32} className="text-green-500" />
              </div>
              <h3 className="text-lg font-medium text-white">Redirecting to payment...</h3>
              <p className="text-neutral-400 text-center text-sm">
                You will be redirected to the payment page in a moment. If you are not redirected,
                click the button below.
              </p>
              <a 
                href={checkoutUrl} 
                onClick={(e) => {
                  e.preventDefault();
                  
                  // Check if we're in development mode
                  const isDev = process.env.NODE_ENV === 'development' || 
                               window.location.hostname === 'localhost' || 
                               window.location.hostname === '127.0.0.1';
                  
                  if (isDev && checkoutUrl && (checkoutUrl.includes('mock') || checkoutUrl.includes('example.com'))) {
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
                Continue to Payment
              </a>
            </div>
          ) : (
            <>
              {/* Cart summary */}
              <div className="bg-slate-800 rounded-md p-4">
                <h3 className="text-md font-medium text-white mb-2">Order Summary</h3>
                <div className="space-y-2">
                  {cart.map((item) => (
                    <div key={item.id} className="flex justify-between">
                      <span className="text-neutral-300">{item.name}</span>
                      <span className="text-neutral-300">{item.price}</span>
                    </div>
                  ))}
                  <div className="flex justify-between pt-2 border-t border-neutral-700">
                    <span className="font-medium text-white">Total</span>
                    <span className="font-medium text-white">${getCartTotal()}</span>
                  </div>
                </div>
              </div>
              
              {/* Checkout form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Error display */}
                {error && (
                  <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded">
                    <p className="font-bold">Error</p>
                    <p>{error}</p>
                  </div>
                )}
                
                {/* Username field */}
                <div className="space-y-1">
                  <label htmlFor="username" className="block text-sm font-medium text-neutral-300">
                    Minecraft Username
                  </label>
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your Minecraft username"
                    className={`w-full px-3 py-2 bg-slate-800 text-white rounded-md border ${
                      formErrors.username ? 'border-red-500' : 'border-neutral-700'
                    } focus:outline-none focus:ring-1 focus:ring-purple-500`}
                    disabled={isProcessingCheckout}
                  />
                  {formErrors.username && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.username}</p>
                  )}
                </div>
                
                {/* Minecraft Edition selection */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-neutral-300">
                    Minecraft Edition
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setEdition('java')}
                      className={`px-4 py-2 rounded-md text-center transition-colors ${
                        edition === 'java'
                          ? 'bg-purple-600 text-white'
                          : 'bg-slate-800 text-neutral-300 hover:bg-slate-700'
                      }`}
                      disabled={isProcessingCheckout}
                    >
                      Java Edition
                    </button>
                    <button
                      type="button"
                      onClick={() => setEdition('bedrock')}
                      className={`px-4 py-2 rounded-md text-center transition-colors ${
                        edition === 'bedrock'
                          ? 'bg-purple-600 text-white'
                          : 'bg-slate-800 text-neutral-300 hover:bg-slate-700'
                      }`}
                      disabled={isProcessingCheckout}
                    >
                      Bedrock Edition
                    </button>
                  </div>
                  {formErrors.edition && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.edition}</p>
                  )}
                </div>
                
                {/* Submit button */}
                <button
                  type="submit"
                  className="w-full py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  disabled={isProcessingCheckout || isLoading}
                >
                  {isProcessingCheckout ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <span>Proceed to Payment</span>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 