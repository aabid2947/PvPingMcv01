import React, { useState } from 'react';
import { FiShoppingCart, FiCheck } from 'react-icons/fi';
import LoginModal from './LoginModal';
import PaymentDialog from './PaymentDialog';

/**
 * Button component that handles the purchase flow for Minecraft packages
 */
function PurchaseButton({ packageDetails }) {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handle the initial purchase button click
  const handlePurchaseClick = () => {
    setError(null);
    
    // Check if we already have the username (e.g. from localStorage)
    const savedUsername = localStorage.getItem('minecraft_username');
    const savedEdition = localStorage.getItem('minecraft_edition') || 'java';
    
    if (savedUsername) {
      // If we already have a username, go straight to payment
      setUserInfo({
        username: savedUsername,
        edition: savedEdition
      });
      setShowPaymentDialog(true);
    } else {
      // Otherwise show the login modal first
      setShowLoginModal(true);
    }
  };

  // Handle login modal success (user entered a username)
  const handleLoginSuccess = ({ username, edition }) => {
    // Save the username in localStorage for future purchases
    localStorage.setItem('minecraft_username', username);
    localStorage.setItem('minecraft_edition', edition);
    
    // Set the user info for the payment dialog
    setUserInfo({
      username,
      edition
    });
    
    // Close login modal and open payment dialog
    setShowLoginModal(false);
    setShowPaymentDialog(true);
  };

  // Handle payment successful completion
  const handlePaymentSuccess = (purchaseDetails) => {
    console.log('Purchase successful:', purchaseDetails);
    
    // Update UI to show purchase was successful
    setPurchaseSuccess(true);
    
    // Record the purchase in localStorage
    const purchases = JSON.parse(localStorage.getItem('minecraft_purchases') || '[]');
    purchases.push(purchaseDetails);
    localStorage.setItem('minecraft_purchases', JSON.stringify(purchases));
    
    // Reset UI after a delay
    setTimeout(() => {
      setShowPaymentDialog(false);
    }, 3000);
  };

  // Handle payment errors
  const handlePaymentError = (err) => {
    console.error('Payment error:', err);
    setError('There was an error processing your payment. Please try again.');
    setLoading(false);
  };

  // Close the payment dialog
  const handleClosePaymentDialog = () => {
    setShowPaymentDialog(false);
  };

  return (
    <>
      <button
        onClick={handlePurchaseClick}
        disabled={loading || !packageDetails}
        className={`flex items-center justify-center px-4 py-2 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 ${
          purchaseSuccess
            ? 'bg-green-600 hover:bg-green-700 text-white' 
            : 'bg-purple-600 hover:bg-purple-700 text-white'
        } ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
      >
        {loading ? (
          <span className="flex items-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </span>
        ) : purchaseSuccess ? (
          <span className="flex items-center">
            <FiCheck className="mr-1" />
            Purchased
          </span>
        ) : (
          <span className="flex items-center">
            <FiShoppingCart className="mr-1" />
            Purchase Now
          </span>
        )}
      </button>

      {/* Error message if payment fails */}
      {error && (
        <p className="text-red-500 text-sm mt-2">{error}</p>
      )}

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Payment Dialog */}
      {showPaymentDialog && userInfo && (
        <PaymentDialog
          isOpen={showPaymentDialog}
          onClose={handleClosePaymentDialog}
          packageDetails={packageDetails}
          username={userInfo.username}
          edition={userInfo.edition}
          onPaymentSuccess={handlePaymentSuccess}
          onPaymentError={handlePaymentError}
        />
      )}
    </>
  );
}

export default PurchaseButton; 