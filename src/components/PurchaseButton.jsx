import React, { useState, useContext } from 'react';
import { FiShoppingCart, FiCheck, FiAlertCircle } from 'react-icons/fi';
import LoginModal from './LoginModal';
import PaymentDialog from './PaymentDialog';
import { StoreContext } from '../pages/Store';

/**
 * Button component for purchasing packages
 */
function PurchaseButton({ packageDetails, tebexStatus = { loaded: true, error: null } }) {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [username, setUsername] = useState('');
  const [edition, setEdition] = useState('java');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Try to get store context if available, fallback to props if not
  let tebexLoaded, storeError;
  
  try {
    // Only use context if we're within a StoreProvider
    const storeContext = useContext(StoreContext);
    if (storeContext) {
      tebexLoaded = storeContext.tebexLoaded;
      storeError = storeContext.error;
    } else {
      // Use fallback props
      tebexLoaded = tebexStatus.loaded;
      storeError = tebexStatus.error;
    }
  } catch (err) {
    // If context is not available, use fallback props
    tebexLoaded = tebexStatus.loaded;
    storeError = tebexStatus.error;
  }

  const handlePurchaseClick = () => {
    // Check if there's a store error indicating payment system is unavailable
    if (storeError && storeError.includes && storeError.includes('Payment system')) {
      setError('Payment system is not available at this time. Please try again later.');
      return;
    }
    
    // Check if user is already logged in (stored in localStorage)
    const savedUsername = localStorage.getItem('minecraft_username');
    const savedEdition = localStorage.getItem('minecraft_edition');
    
    if (savedUsername && savedEdition) {
      setUsername(savedUsername);
      setEdition(savedEdition);
      setShowPaymentDialog(true);
    } else {
      setShowLoginModal(true);
    }
  };
  
  const handleLoginSuccess = (username, edition) => {
    setUsername(username);
    setEdition(edition);
    setShowLoginModal(false);
    
    // Save the username and edition to localStorage
    localStorage.setItem('minecraft_username', username);
    localStorage.setItem('minecraft_edition', edition);
    
    // Open payment dialog
    setShowPaymentDialog(true);
  };
  
  const handlePaymentSuccess = () => {
    setPurchaseSuccess(true);
    setShowPaymentDialog(false);
    
    // Save purchase information to localStorage for future reference
    const purchases = JSON.parse(localStorage.getItem('purchases') || '[]');
    purchases.push({
      packageId: packageDetails.id,
      packageName: packageDetails.name,
      username,
      edition,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('purchases', JSON.stringify(purchases));
  };
  
  const handlePaymentError = (error) => {
    console.error('Payment error:', error);
    setError('There was an issue processing your payment. Please try again.');
  };

  return (
    <div>
      {error && (
        <div className="text-red-500 text-sm mb-2 flex items-center">
          <FiAlertCircle className="mr-1" />
          {error}
        </div>
      )}
      
      <button
        onClick={handlePurchaseClick}
        disabled={loading || !tebexLoaded}
        className={`w-full py-3 px-4 rounded-md font-medium flex items-center justify-center transition-colors ${
          purchaseSuccess 
            ? 'bg-green-500 hover:bg-green-600 text-white' 
            : 'bg-purple-600 hover:bg-purple-700 text-white'
        } ${(!tebexLoaded || loading) ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {loading ? (
          <>
            <div className="mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Processing...
          </>
        ) : purchaseSuccess ? (
          <>
            <FiCheck className="mr-2" />
            Purchased
          </>
        ) : (
          <>
            <FiShoppingCart className="mr-2" />
            Purchase Now
          </>
        )}
      </button>
      
      {storeError && !error && storeError.includes && storeError.includes('preview only') && (
        <div className="text-yellow-500 text-sm mt-2 flex items-center">
          <FiAlertCircle className="mr-1" />
          Payment system is in preview mode only
        </div>
      )}
      
      <LoginModal 
        show={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={handleLoginSuccess}
      />
      
      <PaymentDialog
        isOpen={showPaymentDialog}
        onClose={() => setShowPaymentDialog(false)}
        packageDetails={packageDetails}
        username={username}
        edition={edition}
        onPaymentSuccess={handlePaymentSuccess}
        onPaymentError={handlePaymentError}
      />
    </div>
  );
}

export default PurchaseButton; 