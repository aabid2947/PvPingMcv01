import React, { useState } from 'react';
import { FiX, FiShoppingCart, FiTrash2, FiCreditCard, FiArrowRight, FiInfo, FiExternalLink } from 'react-icons/fi';
import { useCart } from '../contexts/CartContext';
import LoginModal from './LoginModal';
import { createCheckoutUrl } from '../utils/checkoutService';

function CartModal() {
  const { 
    cart, 
    cartOpen, 
    closeCart, 
    removeFromCart, 
    clearCart, 
    getCartTotal 
  } = useCart();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [isMockCheckout, setIsMockCheckout] = useState(false);
  const [isDirectCheckout, setIsDirectCheckout] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [username, setUsername] = useState('');
  const [edition, setEdition] = useState('java');

  // Handle click outside modal to close it
  const handleOutsideClick = (e) => {
    if (e.target.classList.contains('modal-overlay')) {
      closeCart();
    }
  };

  // Handle checkout button click
  const handleCheckout = () => {
    // Check if the cart is empty
    if (cart.length === 0) {
      setError('Your cart is empty. Please add some items first.');
      return;
    }
    
    // Reset any previous errors and state
    setError(null);
    setIsMockCheckout(false);
    setIsDirectCheckout(false);
    setCheckoutUrl('');
    
    // Check if user is already logged in (stored in localStorage)
    const savedUsername = localStorage.getItem('minecraft_username');
    const savedEdition = localStorage.getItem('minecraft_edition');
    
    if (savedUsername && savedEdition) {
      setUsername(savedUsername);
      setEdition(savedEdition);
      processCheckout(savedUsername, savedEdition);
    } else {
      setShowLoginModal(true);
    }
  };
  
  // Handle direct checkout redirect button click
  const handleDirectCheckoutRedirect = () => {
    if (checkoutUrl) {
      window.location.href = checkoutUrl;
    }
    closeCart();
  };
  
  // Handle successful login from the LoginModal
  const handleLoginSuccess = (data) => {
    setUsername(data.username);
    setEdition(data.edition);
    setShowLoginModal(false);
    
    // Save the username and edition to localStorage
    localStorage.setItem('minecraft_username', data.username);
    localStorage.setItem('minecraft_edition', data.edition);
    
    // Process the checkout with the login credentials
    processCheckout(data.username, data.edition);
  };
  
  // Process the checkout by calling the API to generate a checkout URL
  const processCheckout = async (username, edition) => {
    setIsProcessing(true);
    setError(null);
    setIsMockCheckout(false);
    setIsDirectCheckout(false);
    setCheckoutUrl('');
    
    try {
      // Use our checkout service to create a checkout URL
      const checkoutData = await createCheckoutUrl(username, edition, cart);
      
      console.log('Checkout response:', checkoutData);
      
      // Check if this is a mock checkout URL (for development)
      if (checkoutData.isMock) {
        setIsMockCheckout(true);
        console.log('Detected mock checkout URL');
      }
      
      // Check if this is a direct checkout URL (for Cloudflare Pages)
      if (checkoutData.isDirectCheckout) {
        setIsDirectCheckout(true);
        setCheckoutUrl(checkoutData.url);
        console.log('Detected direct checkout URL:', checkoutData.url);
      }
      
      // Clear the cart in any case
      clearCart();
      
      // For single item checkouts
      if (checkoutData.url) {
        // If it's a mock checkout, don't redirect but show a message
        if (checkoutData.isMock) {
          setIsMockCheckout(true);
          setIsProcessing(false);
          // Don't close the cart yet to show the user the mock message
          return;
        }
        
        // If it's a direct checkout, don't redirect automatically
        if (checkoutData.isDirectCheckout) {
          setIsDirectCheckout(true);
          setCheckoutUrl(checkoutData.url);
          setIsProcessing(false);
          // Don't close the cart yet to show the user the direct checkout message
          return;
        }
        
        // Real checkout URL via API - redirect automatically
        closeCart();
        window.location.href = checkoutData.url;
        return;
      }
      
      // For multiple item checkouts, use the first checkout URL
      if (checkoutData.checkouts && checkoutData.checkouts.length > 0) {
        const firstCheckout = checkoutData.checkouts[0];
        
        // If it's a mock checkout, don't redirect but show a message
        if (firstCheckout.isMock) {
          setIsMockCheckout(true);
          setIsProcessing(false);
          // Don't close the cart yet to show the user the mock message
          return;
        }
        
        // If it's a direct checkout, don't redirect automatically
        if (firstCheckout.isDirectCheckout) {
          setIsDirectCheckout(true);
          setCheckoutUrl(firstCheckout.url);
          setIsProcessing(false);
          // Don't close the cart yet to show the user the direct checkout message
          return;
        }
        
        // Real checkout URL via API - redirect automatically
        closeCart();
        window.location.href = firstCheckout.url;
        return;
      }
      
      // If we get here, something went wrong
      throw new Error('No valid checkout URL returned from the server');
    } catch (error) {
      console.error('Checkout error:', error);
      setError(error.message || 'Failed to create checkout. Please try again.');
      setIsMockCheckout(false);
      setIsDirectCheckout(false);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!cartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 modal-overlay bg-black bg-opacity-75 backdrop-blur-sm" onClick={handleOutsideClick}>
      <div className="absolute top-0 right-0 h-full max-w-md w-full bg-[#1D1E29] text-white shadow-xl transform transition-transform duration-300">
        <div className="flex justify-between items-center p-5 border-b border-gray-700">
          <h3 className="text-xl font-semibold text-white flex items-center">
            <FiShoppingCart className="mr-2" />
            Your Cart
            <span className="ml-2 text-sm bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center">
              {cart.length}
            </span>
          </h3>
          <button
            onClick={closeCart}
            className="text-gray-400 hover:text-gray-200 focus:outline-none"
            aria-label="Close"
          >
            <FiX size={24} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 180px)' }}>
          {/* Development/Mock Mode Notice */}
          {isMockCheckout && (
            <div className="mb-6 p-4 bg-amber-900/30 border border-amber-700 rounded-md text-amber-400 text-sm">
              <div className="flex items-center mb-2">
                <FiInfo className="mr-2 flex-shrink-0" size={18} />
                <span className="font-medium">Development Mode</span>
              </div>
              <p>Your order has been processed in development mode. In a real environment, you would be redirected to the Tebex checkout page.</p>
              <div className="mt-4 p-3 bg-black/30 rounded border border-amber-800/50 font-mono text-xs overflow-auto">
                <p>Cart cleared successfully</p>
                <p>Items: {cart.length}</p>
                <p>Total: ${getCartTotal()}</p>
                <p>User: {username} ({edition})</p>
              </div>
              <button
                onClick={closeCart}
                className="mt-4 w-full py-2 px-4 bg-amber-600 hover:bg-amber-700 text-white rounded-md transition-colors"
              >
                Close
              </button>
            </div>
          )}
          
          {/* Direct Checkout Notice for Cloudflare Pages */}
          {isDirectCheckout && (
            <div className="mb-6 p-4 bg-blue-900/30 border border-blue-700 rounded-md text-blue-400 text-sm">
              <div className="flex items-center mb-2">
                <FiInfo className="mr-2 flex-shrink-0" size={18} />
                <span className="font-medium">Checkout Ready</span>
              </div>
              <p>Your order has been prepared and you'll be redirected to the Tebex checkout page. Click the button below to proceed with your payment.</p>
              <div className="mt-4 p-3 bg-black/30 rounded border border-blue-800/50 font-mono text-xs overflow-auto">
                <p>Cart cleared successfully</p>
                <p>Items: {cart.length}</p>
                <p>Total: ${getCartTotal()}</p>
                <p>User: {username} ({edition})</p>
              </div>
              <button
                onClick={handleDirectCheckoutRedirect}
                className="mt-4 w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors flex items-center justify-center"
              >
                <FiExternalLink className="mr-2" />
                Proceed to Tebex Checkout
              </button>
            </div>
          )}
          
          {cart.length === 0 && !isMockCheckout && !isDirectCheckout ? (
            <div className="py-12 flex flex-col items-center justify-center">
              <FiShoppingCart size={48} className="text-gray-500 mb-4" />
              <p className="text-gray-300 text-center">Your cart is empty</p>
              <button
                onClick={closeCart}
                className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <>
              {!isMockCheckout && !isDirectCheckout && (
                <>
                  <div className="space-y-4 mb-8">
                    {cart.map((item) => (
                      <div 
                        key={item.id} 
                        className="flex items-start justify-between p-4 bg-[#282A3A] rounded-lg border border-gray-700"
                      >
                        <div className="flex-grow">
                          <h4 className="font-medium text-white">{item.name}</h4>
                          <p className="text-sm text-gray-400 mt-1">{item.description}</p>
                          <p className="text-lg font-bold text-purple-400 mt-2">{item.price}</p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="ml-4 text-gray-400 hover:text-red-400 transition-colors"
                          aria-label="Remove item"
                        >
                          <FiTrash2 size={20} />
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  {error && (
                    <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded-md text-red-400 text-sm flex items-center">
                      <FiX className="mr-2 flex-shrink-0" />
                      {error}
                    </div>
                  )}
                  
                  <div className="border-t border-gray-700 pt-4 pb-6">
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-gray-300">Total:</span>
                      <span className="text-2xl font-bold text-white">${getCartTotal()}</span>
                    </div>
                    
                    <div className="space-y-3">
                      <button
                        onClick={handleCheckout}
                        disabled={isProcessing || cart.length === 0}
                        className={`w-full py-3 px-4 rounded-md font-medium flex items-center justify-center ${
                          isProcessing || cart.length === 0
                            ? 'bg-purple-700/50 text-gray-400 cursor-not-allowed'
                            : 'bg-purple-600 hover:bg-purple-700 text-white'
                        }`}
                      >
                        {isProcessing ? (
                          <>
                            <div className="w-5 h-5 border-2 border-gray-300 border-t-transparent rounded-full animate-spin mr-2"></div>
                            Processing...
                          </>
                        ) : (
                          <>
                            <FiCreditCard className="mr-2" />
                            Proceed to Checkout
                          </>
                        )}
                      </button>
                      
                      <button
                        onClick={clearCart}
                        disabled={isProcessing || cart.length === 0}
                        className="w-full py-2 px-4 rounded-md font-medium text-gray-300 hover:text-white bg-transparent border border-gray-700 hover:border-gray-500 transition-colors flex items-center justify-center"
                      >
                        <FiTrash2 className="mr-2" />
                        Clear Cart
                      </button>
                      
                      <button
                        onClick={closeCart}
                        className="w-full py-2 px-4 rounded-md font-medium text-gray-300 hover:text-white bg-transparent hover:bg-gray-800/50 transition-colors flex items-center justify-center"
                      >
                        <FiArrowRight className="mr-2" />
                        Continue Shopping
                      </button>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
      
      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={handleLoginSuccess}
      />
    </div>
  );
}

export default CartModal; 