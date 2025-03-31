import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';

const PaymentDialog = ({ isOpen, onClose, basketId, packageName, amount }) => {
  const dialogRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Handle outside clicks to prevent accidental closing
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dialogRef.current && !dialogRef.current.contains(event.target)) {
        // Prevent the event from bubbling further
        event.stopPropagation();
      }
    };

    // Add event listeners only when the dialog is open
    // if (isOpen) {
    //   document.addEventListener('mousedown', handleClickOutside, { capture: true });
    //   document.addEventListener('mouseover', handleClickOutside, { capture: true });
      
    //   // Prevent body scrolling when modal is open
    //   document.body.style.overflow = 'hidden';
      
    //   // Add a class to the body to indicate payment dialog is open
    //   document.body.classList.add('payment-dialog-open');
    // }
    return
    // return () => {
    //   document.removeEventListener('mousedown', handleClickOutside, { capture: true });
    //   document.removeEventListener('mouseover', handleClickOutside, { capture: true });
    //   document.body.style.overflow = 'auto';
    //   document.body.classList.remove('payment-dialog-open');
    // };
  }, [isOpen]);
  
  // Handle escape key to close dialog
  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === 'Escape') {
        onClose('user-close');
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      window.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, onClose]);
  
  useEffect(() => {
    // Only initialize Tebex checkout when the dialog is open and we have a basketId
    if (isOpen && basketId && window.tebex) {
      setIsLoading(true);
      
      // Create a container for the checkout
      const checkoutContainer = document.getElementById('tebex-checkout-container');
      
      if (checkoutContainer) {
        try {
          // Initialize the Tebex checkout in the iframe
          window.tebex.checkout.setup(basketId, {
            embedElement: checkoutContainer,
            onSuccess: () => {
              console.log('Payment successful!');
              // Close modal and show success message
              onClose('success');
            },
            onCancel: () => {
              console.log('Payment cancelled');
              // Handle cancellation
              onClose('cancel');
            },
            onError: (error) => {
              console.error('Payment error:', error);
              // Handle error
              onClose('error', error);
            },
            onLoad: () => {
              // Hide loading spinner when checkout is loaded
              setIsLoading(false);
              
              // Hide the default loading spinner provided by the checkout library
              const loadingSpinner = document.getElementById('loading-spinner');
              if (loadingSpinner) {
                loadingSpinner.style.display = 'none';
              }
            }
          });
        } catch (error) {
          console.error('Failed to initialize Tebex checkout:', error);
          setIsLoading(false);
        }
      }
    }
    
    // Cleanup function
    return () => {
      if (window.tebex && window.tebex.checkout && typeof window.tebex.checkout.cleanup === 'function') {
        try {
          window.tebex.checkout.cleanup();
        } catch (error) {
          console.error('Error cleaning up Tebex checkout:', error);
        }
      }
    };
  }, [isOpen, basketId, onClose]);
  
  const handleCloseClick = (e) => {
    e.stopPropagation();
    onClose('user-close');
  };
  
  if (!isOpen) return null;
  
  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[99999] flex items-center justify-center p-4 overflow-y-auto"
      onClick={(e) => e.stopPropagation()} // Prevent click from reaching elements underneath
      style={{ isolation: 'isolate' }} // Establish a new stacking context
    >
      <div 
        ref={dialogRef} 
        className="bg-[#1e1f2c] rounded-lg w-full max-w-4xl h-[80vh] max-h-[800px] flex flex-col shadow-xl relative animate-fadeIn"
        onClick={(e) => e.stopPropagation()} // Stop propagation within the dialog
      >
        <div className="flex justify-between items-center p-5 bg-[#1d1e29] rounded-t-lg">
          <div>
            <h2 className="text-2xl font-bold text-white">Complete Your Purchase</h2>
            <p className="text-gray-400">{packageName} - ${amount}</p>
          </div>
          <button 
            onClick={handleCloseClick}
            className="text-red-500 hover:text-red-400 transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="flex-1 overflow-hidden p-4 relative">
          {/* Loading spinner while the Tebex checkout initializes */}
          {isLoading && (
            <div 
              id="loading-spinner"
              className="absolute inset-0 flex flex-col items-center justify-center bg-[#1e1f2c]/90 z-10"
            >
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
              <p className="mt-6 text-gray-300">Loading payment options...</p>
            </div>
          )}
          
          {/* Container for the Tebex checkout iframe */}
          <div 
            id="tebex-checkout-container" 
            ref={iframeRef => {
              // Store the iframe reference
              if (iframeRef) {
                // Add any additional iframe handling if needed
              }
            }}
            className="w-full h-full bg-white rounded"
          >
            {/* Tebex will inject the checkout interface here */}
          </div>
        </div>
        
        <div className="p-4 bg-[#1d1e29] rounded-b-lg">
          <p className="text-gray-400 text-sm text-center">
            Secure payment processing by Tebex. Your information is encrypted and secure.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentDialog; 