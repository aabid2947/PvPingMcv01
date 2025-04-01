import React, { useEffect, useRef, useState } from 'react';
import { FiX, FiCreditCard, FiCheckCircle, FiAlertCircle, FiShield } from 'react-icons/fi';
import { initiateCheckout } from '../utils/tebexService';

/**
 * Payment dialog component that integrates with Tebex.js to handle checkout
 */
// Use a constant with fallback for the store ID
const STORE_ID = import.meta.env.VITE_TEBEX_STORE_ID || '752140';

function PaymentDialog({ 
  isOpen, 
  onClose, 
  packageDetails, 
  username, 
  edition,
  onPaymentSuccess,
  onPaymentError
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [checkoutStage, setCheckoutStage] = useState('initializing'); // initializing, preparing, ready, complete, error
  const dialogRef = useRef(null);
  const checkoutContainerRef = useRef(null);

  // Handle click outside modal to close only if not in checkout process
  useEffect(() => {
    function handleClickOutside(event) {
      if (dialogRef.current && !dialogRef.current.contains(event.target) && !isLoading && !checkoutSuccess) {
        onClose();
      }
    }

    // Handle escape key to close modal
    function handleEscKey(event) {
      if (event.key === 'Escape' && !isLoading && !checkoutSuccess) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscKey);
      document.body.classList.add('payment-dialog-open');
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscKey);
      document.body.classList.remove('payment-dialog-open');
    };
  }, [isOpen, onClose, isLoading, checkoutSuccess]);

  // Initialize Tebex checkout when component mounts
  useEffect(() => {
    const initializeCheckout = async () => {
      if (!isOpen) return;
      
      try {
        setIsLoading(true);
        setError(null);
        setCheckoutStage('initializing');
        
        // Short delay to show loading state
        await new Promise(resolve => setTimeout(resolve, 500));
        setCheckoutStage('preparing');
        
        console.log('Using Tebex store ID:', STORE_ID);
        if (!STORE_ID) {
          throw new Error('Tebex store ID is missing. Please configure your environment variables.');
        }
        
        console.log(`Initializing checkout for package ${packageDetails.id} for user ${username} (${edition})`);
        
        // Use our tebexService to initiate checkout
        await initiateCheckout(
          packageDetails.id,
          username,
          {
            game: edition === 'java' ? 'minecraft' : 'bedrock',
            // Success callback
            onSuccess: () => {
              console.log('Payment successful!');
              setCheckoutSuccess(true);
              setCheckoutStage('complete');
              setIsLoading(false);
              
              // Call the success handler
              if (typeof onPaymentSuccess === 'function') {
                onPaymentSuccess();
              }
            },
            // Error callback
            onError: (error) => {
              console.error('Checkout error:', error);
              setError(error.message || 'Payment failed. Please try again.');
              setCheckoutStage('error');
              setIsLoading(false);
              
              // Call the error handler
              if (typeof onPaymentError === 'function') {
                onPaymentError(error);
              }
            },
            // This container will be used to render the checkout UI
            container: checkoutContainerRef.current,
            // Additional options
            completeUrl: window.location.href,
            failUrl: window.location.href
          }
        );
        
        setCheckoutStage('ready');
        setIsLoading(false);
      } catch (error) {
        console.error('Payment initialization error:', error);
        setError(error.message || 'Failed to initialize payment. Please try again.');
        setCheckoutStage('error');
        setIsLoading(false);
        
        // Call the error handler
        if (typeof onPaymentError === 'function') {
          onPaymentError(error);
        }
      }
    };

    initializeCheckout();
  }, [isOpen, packageDetails, username, edition, onPaymentSuccess, onPaymentError]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm">
      <div 
        ref={dialogRef}
        className="bg-[#1D1E29] text-white rounded-lg shadow-xl w-full max-w-2xl mx-4 overflow-hidden transform transition-all"
      >
        <div className="flex justify-between items-center p-5 border-b border-gray-700 relative">
          <h3 className="text-xl font-semibold text-white">
            {checkoutSuccess ? 'Payment Complete' : 'Complete Your Purchase'}
          </h3>
          {!isLoading && !checkoutSuccess && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-200 focus:outline-none"
              aria-label="Close"
            >
              <FiX size={24} />
            </button>
          )}
        </div>
        
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {isLoading && (
            <div className="py-10 flex flex-col items-center justify-center">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-300">
                {checkoutStage === 'initializing' ? 'Initializing payment system...' : 
                 checkoutStage === 'preparing' ? 'Preparing your checkout...' : 
                 'Setting up payment gateway...'}
              </p>
            </div>
          )}
          
          {error && (
            <div className="py-8 flex flex-col items-center justify-center">
              <FiAlertCircle size={48} className="text-red-500 mb-4" />
              <p className="text-red-400 text-center mb-4">{error}</p>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
              >
                Close
              </button>
            </div>
          )}
          
          {checkoutSuccess && (
            <div className="py-8 flex flex-col items-center justify-center">
              <FiCheckCircle size={48} className="text-green-500 mb-4" />
              <h4 className="text-2xl font-bold text-green-400 mb-2">Thank You!</h4>
              <p className="text-gray-300 text-center mb-6">
                Your purchase of <span className="font-semibold">{packageDetails?.name}</span> for {edition === 'bedrock' ? `.${username}` : username} was successful!
              </p>
              <p className="text-sm text-gray-400">
                You will receive your items the next time you join the server.
              </p>
              <button
                onClick={onClose}
                className="mt-6 px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
              >
                Done
              </button>
            </div>
          )}
          
          {!isLoading && !error && !checkoutSuccess && (
            <div className="mb-4">
              <div className="flex items-center mb-4">
                <FiCreditCard className="text-purple-400 mr-2" size={20} />
                <h4 className="text-lg font-medium">Payment Details</h4>
              </div>
              
              <div className="bg-[#272935] p-4 rounded-md mb-4">
                <p className="text-sm text-gray-400 mb-1">Package</p>
                <p className="font-medium text-white">{packageDetails?.name}</p>
                
                {packageDetails?.originalPrice && (
                  <div className="flex items-center mt-1">
                    <span className="text-lg font-bold text-purple-400">{packageDetails?.price}</span>
                    <span className="text-sm text-gray-400 line-through ml-2">{packageDetails?.originalPrice}</span>
                  </div>
                )}
                {!packageDetails?.originalPrice && (
                  <p className="text-lg font-bold text-purple-400 mt-1">{packageDetails?.price}</p>
                )}
                
                <div className="border-t my-3 border-gray-700"></div>
                
                <p className="text-sm text-gray-400 mb-1">Username</p>
                <p className="font-medium text-white">{edition === 'bedrock' ? `.${username}` : username}</p>
                <p className="text-xs text-gray-500 mt-1">Edition: {edition === 'java' ? 'Java' : 'Bedrock'}</p>
                
                <div className="flex items-center mt-4 text-xs text-gray-400">
                  <FiShield className="mr-1 text-green-400" />
                  <span>Secure payment powered by Tebex</span>
                </div>
              </div>
              
              <div 
                ref={checkoutContainerRef} 
                className="checkout-container min-h-[300px] bg-[#272935] border border-gray-700 rounded-md p-4"
              >
                <div className="flex justify-center items-center h-full">
                  <p className="text-gray-400">Loading payment options...</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PaymentDialog; 