import React, { useState, useEffect, useRef } from 'react';
import { X, ShoppingCart, CheckCircle } from 'lucide-react';
import tebexService from '../services/tebexService';
import { useUser } from '../context/UserContext';

const PurchaseModal = ({ isOpen, onClose, packageId, packageName, price, description }) => {
  const { addPurchase } = useUser();
  const [username, setUsername] = useState('');
  const [edition, setEdition] = useState('java');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [basketId, setBasketId] = useState(null);
  const [purchaseStep, setPurchaseStep] = useState('username'); // 'username', 'checkout', 'success'
  const modalRef = useRef(null);

  // Handle click outside to prevent accidental closing
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Only handle clicks outside the modal content, and specifically ignore store elements
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        // Prevent the event from bubbling further
        event.stopPropagation();
      }
    };

    // Add the event listener only when the modal is open
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside, { capture: true });
      document.addEventListener('mouseover', handleClickOutside, { capture: true });

      // Prevent body scrolling when modal is open
      document.body.style.overflow = 'hidden';
      
      // Add a class to the body to indicate modal is open
      document.body.classList.add('purchase-modal-open');
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside, { capture: true });
      document.removeEventListener('mouseover', handleClickOutside, { capture: true });
      document.body.style.overflow = 'auto';
      document.body.classList.remove('purchase-modal-open');
    };
  }, [isOpen]);

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      window.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen]);

  // Handle submit username and create basket
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    if (!username.trim()) {
      setError('Please enter a valid username');
      return;
    }
    
    // Clear previous errors
    setError('');
    setLoading(true);
    
    try {
      // Add the . prefix for Bedrock Edition
      const formattedUsername = edition === 'bedrock' ? `.${username.trim()}` : username.trim();
      
      // Check if Tebex is loaded
      if (!tebexService.isTebexLoaded()) {
        throw new Error('Payment system is not available. Please try again later.');
      }
      
      // Create a basket and add the package
      const newBasketId = await tebexService.completePurchase(formattedUsername, packageId);
      setBasketId(newBasketId);
      
      // Move to checkout step
      setPurchaseStep('checkout');
      
      // Initialize Tebex checkout
      initializeTebexCheckout(newBasketId);
    } catch (error) {
      console.error('Error creating basket:', error);
      setError(error.message || 'Failed to create purchase. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Initialize Tebex checkout
  const initializeTebexCheckout = (basketId) => {
    // Get checkout container
    const checkoutContainer = document.getElementById('tebex-checkout-container');
    
    if (checkoutContainer && window.tebex) {
      try {
        // Initialize the Tebex checkout in the iframe
        window.tebex.checkout.setup(basketId, {
          embedElement: checkoutContainer,
          onSuccess: () => {
            console.log('Payment successful!');
            
            // Add purchase to history
            const purchaseData = {
              username: edition === 'bedrock' ? `.${username.trim()}` : username.trim(),
              packageId,
              packageName,
              price,
              basketId,
              date: new Date().toISOString()
            };
            addPurchase(purchaseData);
            
            // Show success step
            setPurchaseStep('success');
            
            // Close modal after short delay and notify parent component of success
            setTimeout(() => {
              handleClose('success');
            }, 2000);
          },
          onCancel: () => {
            console.log('Payment cancelled');
            // Go back to username step
            setPurchaseStep('username');
          },
          onError: (error) => {
            console.error('Payment error:', error);
            setError(`Payment error: ${error || 'Unknown error'}`);
            // Go back to username step
            setPurchaseStep('username');
          },
          onLoad: () => {
            // Hide loading indicators if needed
            const loadingSpinner = document.getElementById('purchase-loading-spinner');
            if (loadingSpinner) {
              loadingSpinner.style.display = 'none';
            }
          }
        });
      } catch (error) {
        console.error('Failed to initialize Tebex checkout:', error);
        setError('Failed to initialize payment system. Please try again.');
        setPurchaseStep('username');
      }
    }
  };

  // Handle closing the modal with status
  const handleClose = (status) => {
    // Reset state
    setPurchaseStep('username');
    setUsername('');
    setError('');
    setLoading(false);
    setBasketId(null);
    
    // Close the modal and pass status to parent
    onClose(status);
  };

  const handleCloseClick = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[99999] flex items-center justify-center p-4 overflow-y-auto"
      onClick={(e) => e.stopPropagation()} // Prevent click from reaching elements underneath
      style={{ isolation: 'isolate' }} // Establish a new stacking context
    >
      <div 
        ref={modalRef}
        className="bg-[#1e1f2c] rounded-lg w-full max-w-4xl shadow-xl relative animate-fadeIn"
        onClick={(e) => e.stopPropagation()} // Stop propagation within the modal
      >
        <div className="flex justify-between items-center p-5 bg-[#1d1e29] rounded-t-lg">
          <div>
            <h2 className="text-2xl font-bold text-white">
              {purchaseStep === 'username' && 'Purchase Package'}
              {purchaseStep === 'checkout' && 'Complete Your Purchase'}
              {purchaseStep === 'success' && 'Purchase Successful!'}
            </h2>
            <p className="text-gray-400">{packageName} - ${price}</p>
          </div>
          <button 
            onClick={handleCloseClick}
            className="text-red-500 hover:text-red-400 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {purchaseStep === 'username' && (
          <form onSubmit={handleSubmit} className="p-6">
            <div className="mb-6">
              <h3 className="text-xl text-gray-300 mb-4">
                Enter your Minecraft username to purchase this package:
              </h3>
              
              <div className="flex items-center mb-4">
                <img 
                  src="https://crafatar.com/avatars/8667ba71b85a4004af54457a9734eed7" 
                  alt="Minecraft Avatar" 
                  className="w-10 h-10 mr-2"
                />
                <input
                  type="text"
                  placeholder="Minecraft Username"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setError('');
                  }}
                  className="w-full p-2 bg-[#2c2d38] border border-gray-700 rounded text-white"
                  autoFocus
                />
              </div>

              {error && (
                <p className="text-red-500 mb-4">{error}</p>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-bold text-amber-500 mb-2">Am I on Java Edition or Bedrock Edition?</h3>
                <p className="text-gray-300 mb-2">
                  On OPLegends, your name will begin with a . before it if you are a <span className="text-amber-500 font-bold">Bedrock Edition</span> player. Make sure to include this!
                </p>
                
                <div className="flex space-x-4 mt-4">
                  <button
                    type="button"
                    className={`flex-1 py-2 px-4 rounded ${edition === 'java' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
                    onClick={() => setEdition('java')}
                  >
                    Java Edition
                  </button>
                  <button
                    type="button"
                    className={`flex-1 py-2 px-4 rounded ${edition === 'bedrock' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
                    onClick={() => setEdition('bedrock')}
                  >
                    Bedrock Edition
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 rounded-md font-medium text-white transition-colors ${
                  loading ? 'bg-gray-500 cursor-not-allowed' : 'bg-[#679016] hover:bg-[#76a318]'
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                    <span>Processing...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    <span>Continue to Payment</span>
                  </div>
                )}
              </button>
            </div>
          </form>
        )}

        {purchaseStep === 'checkout' && (
          <div className="flex-1 min-h-[600px] relative">
            {/* Loading spinner */}
            <div 
              id="purchase-loading-spinner"
              className="absolute inset-0 flex flex-col items-center justify-center bg-[#1e1f2c]/90 z-10"
            >
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
              <p className="mt-6 text-gray-300">Loading payment options...</p>
            </div>
            
            {/* Container for the Tebex checkout iframe */}
            <div 
              id="tebex-checkout-container" 
              className="w-full h-full min-h-[600px] bg-white rounded"
            >
              {/* Development mode fallback */}
              {process.env.NODE_ENV === 'development' && (
                <div className="w-full h-full p-8 bg-gray-100 text-gray-800 flex flex-col items-center justify-center">
                  <h3 className="text-xl font-bold mb-4">Development Mode: Tebex Checkout</h3>
                  <p className="mb-6 text-center">
                    In production, this would display the Tebex checkout interface.
                    <br />
                    A successful payment will be simulated after 3 seconds.
                  </p>
                  <div className="w-full max-w-md p-4 bg-white rounded-lg shadow">
                    <div className="mb-4 border-b pb-4">
                      <div className="flex justify-between">
                        <span className="font-medium">{packageName}</span>
                        <span>${price}</span>
                      </div>
                      <div className="text-sm text-gray-500 mt-1">Minecraft Username: {edition === 'bedrock' ? `.${username}` : username}</div>
                    </div>
                    <div className="mb-4">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>${price}</span>
                      </div>
                      <div className="flex justify-between font-bold mt-2">
                        <span>Total:</span>
                        <span>${price}</span>
                      </div>
                    </div>
                    <div className="animate-pulse bg-green-500 text-white text-center py-3 rounded-md">
                      Processing Payment...
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {purchaseStep === 'success' && (
          <div className="p-10 text-center">
            <div className="flex justify-center mb-6">
              <CheckCircle className="h-24 w-24 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Purchase Successful!</h2>
            <p className="text-gray-300 mb-8">
              Thank you for your purchase, <span className="text-blue-400 font-semibold">{username}</span>!
            </p>
            <p className="text-gray-400">
              Your items will be delivered to your account shortly.
            </p>
          </div>
        )}
        
        <div className="p-4 bg-[#1d1e29] rounded-b-lg">
          <p className="text-gray-400 text-sm text-center">
            Secure payment processing by Tebex. Your information is encrypted and secure.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PurchaseModal; 