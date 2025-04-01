import React, { useEffect, useRef, useState } from 'react';
import { FiX, FiCreditCard, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

/**
 * Payment dialog component that integrates with Tebex.js to handle checkout
 */
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
      try {
        if (!window.Tebex) {
          throw new Error('Tebex SDK not loaded. Please refresh the page and try again.');
        }

        setIsLoading(true);
        setError(null);

        // Create a new basket
        const basket = await window.Tebex.basket.create();
        
        // Add the package to the basket
        await window.Tebex.basket.addPackage(basket.id, packageDetails.id, {
          username: username,
          game: edition === 'java' ? 'minecraft' : 'bedrock'
        });

        // Create the checkout
        const checkout = await window.Tebex.checkout.create(basket.id);

        // Show the checkout
        window.Tebex.checkout.show(checkout.id, {
          onSuccess: () => {
            setCheckoutSuccess(true);
            onPaymentSuccess();
          },
          onError: (error) => {
            setError(error.message || 'Payment failed. Please try again.');
            onPaymentError(error);
          }
        });

        setIsLoading(false);
      } catch (error) {
        console.error('Payment error:', error);
        setError(error.message || 'Failed to initialize payment. Please try again.');
        setIsLoading(false);
        onPaymentError(error);
      }
    };

    if (isOpen) {
      initializeCheckout();
    }
  }, [isOpen, packageDetails, username, edition, onPaymentSuccess, onPaymentError]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm">
      <div 
        ref={dialogRef}
        className="bg-[white] rounded-lg shadow-xl w-full max-w-2xl mx-4 overflow-hidden transform transition-all"
      >
        <div className="flex justify-between items-center p-5 border-b relative">
          <h3 className="text-xl font-semibold text-gray-900">
            {checkoutSuccess ? 'Payment Complete' : 'Complete Your Purchase'}
          </h3>
          {!isLoading && !checkoutSuccess && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <FiX size={24} />
            </button>
          )}
        </div>
        
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {isLoading && (
            <div className="py-10 flex flex-col items-center justify-center">
              <div className="loader mb-4"></div>
              <p className="text-gray-600">Initializing payment system...</p>
            </div>
          )}
          
          {error && (
            <div className="py-8 flex flex-col items-center justify-center">
              <FiAlertCircle size={48} className="text-red-500 mb-4" />
              <p className="text-red-600 text-center mb-4">{error}</p>
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
              <h4 className="text-2xl font-bold text-green-600 mb-2">Thank You!</h4>
              <p className="text-gray-600 text-center mb-6">
                Your purchase of <span className="font-semibold">{packageDetails?.name}</span> for {edition === 'bedrock' ? `.${username}` : username} was successful!
              </p>
              <p className="text-sm text-gray-500">
                You will receive your items the next time you join the server.
              </p>
            </div>
          )}
          
          {!isLoading && !error && !checkoutSuccess && (
            <div className="mb-4">
              <div className="flex items-center mb-4">
                <FiCreditCard className="text-purple-600 mr-2" size={20} />
                <h4 className="text-lg font-medium">Payment Details</h4>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md mb-4">
                <p className="text-sm text-gray-500 mb-1">Package</p>
                <p className="font-medium">{packageDetails?.name}</p>
                <p className="text-lg font-bold text-purple-600 mt-1">{packageDetails?.price}</p>
                
                <div className="border-t my-3 border-gray-200"></div>
                
                <p className="text-sm text-gray-500 mb-1">Username</p>
                <p className="font-medium">{edition === 'bedrock' ? `.${username}` : username}</p>
              </div>
              
              <div 
                ref={checkoutContainerRef} 
                className="checkout-container min-h-[300px] border border-gray-200 rounded-md p-2"
              ></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PaymentDialog; 