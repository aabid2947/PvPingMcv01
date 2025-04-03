import React, { useState, useEffect } from 'react';
import { FiX, FiShoppingCart, FiTrash2, FiArrowRight, FiCheck, FiAlertCircle, FiRefreshCw } from 'react-icons/fi';
import { useCart } from '../contexts/CartContext';
import { useUser } from '../context/UserContext';
import { useBasket } from '../contexts/BasketContext';
import CheckoutModal from './CheckoutModal';

function CartModal() {
  const { 
    cart, 
    cartOpen, 
    closeCart, 
    removeFromCart, 
    clearCart, 
    getCartTotal, 
    getCartItemCount,
    pendingBasketOperations
  } = useCart();
  
  const { username } = useUser();
  const { 
    error: basketError, 
    isLoading: basketLoading,
    lastAddedItem,
    syncCartWithBasket,
    basketIdent
  } = useBasket();
  
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [justLoggedIn, setJustLoggedIn] = useState(false);
  const [syncStatus, setSyncStatus] = useState({ syncing: false, lastSync: null });
  
  // Check if user just logged in based on URL parameter
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const justLoggedInParam = queryParams.get('just_logged_in');
    
    if (justLoggedInParam === 'true') {
      setJustLoggedIn(true);
      
      // Clear the parameter after a delay
      setTimeout(() => {
        setJustLoggedIn(false);
      }, 5000);
    }
  }, []);
  
  // Handle manual basket sync
  const handleManualSync = async () => {
    setSyncStatus({ syncing: true, lastSync: null });
    try {
      await syncCartWithBasket();
      setSyncStatus({ 
        syncing: false, 
        lastSync: { success: true, timestamp: Date.now() }
      });
    } catch (error) {
      setSyncStatus({ 
        syncing: false, 
        lastSync: { success: false, timestamp: Date.now(), error }
      });
    }
  };
  
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
      return;
    }
    
    // Show the checkout modal
    setShowCheckoutModal(true);
  };
  
  // Handle closing the checkout modal
  const handleCloseCheckout = () => {
    setShowCheckoutModal(false);
  };

  if (!cartOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 modal-overlay bg-black bg-opacity-75 backdrop-blur-sm" onClick={handleOutsideClick}>
        <div className="absolute top-0 right-0 h-full max-w-md w-full bg-slate-900 text-white shadow-xl transform transition-transform duration-300">
          <div className="flex justify-between items-center p-5 border-b border-gray-700">
            <h3 className="text-xl font-semibold text-white flex items-center">
              <FiShoppingCart className="mr-2" />
              Your Cart
              <span className="ml-2 text-sm bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center">
                {getCartItemCount()}
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
            {/* Welcome message for just logged in users */}
            {justLoggedIn && username && (
              <div className="mb-4 p-3 bg-green-500/20 border border-green-500/30 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <FiCheck className="h-5 w-5 text-green-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-400">
                      Welcome, {username}!
                    </h3>
                    <div className="mt-1 text-sm text-gray-300">
                      <p>Your Minecraft username has been saved. You're ready to shop!</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Basket synchronization status */}
            {pendingBasketOperations.length > 0 && (
              <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0 animate-spin">
                    <FiRefreshCw className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-400">
                      Syncing cart...
                    </h3>
                    <div className="mt-1 text-sm text-gray-300">
                      <p>Please wait while we update your cart information.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Basket error message */}
            {basketError && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <FiAlertCircle className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-400">
                      Cart Error
                    </h3>
                    <div className="mt-1 text-sm text-gray-300">
                      <p>{basketError}</p>
                      <button 
                        onClick={handleManualSync}
                        className="mt-2 text-blue-400 hover:text-blue-300 flex items-center"
                        disabled={syncStatus.syncing}
                      >
                        {syncStatus.syncing ? (
                          <>
                            <FiRefreshCw className="mr-1 animate-spin" /> Syncing...
                          </>
                        ) : (
                          <>
                            <FiRefreshCw className="mr-1" /> Try Syncing Again
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Basket ID display for debugging */}
            {basketIdent && (
              <div className="mb-4 p-2 bg-gray-800 rounded text-xs text-gray-400 font-mono overflow-hidden text-ellipsis">
                Basket ID: {basketIdent}
              </div>
            )}
            
            {cart.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center">
                <FiShoppingCart size={48} className="text-gray-500 mb-4" />
                <p className="text-gray-300 text-center">Your cart is empty</p>
                <button
                  onClick={closeCart}
                  className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors duration-200"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center p-3 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors duration-200"
                    >
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-md mr-3"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-medium truncate">{item.name}</h4>
                        <p className="text-gray-400 text-sm">{item.price}</p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-red-500/20 transition-colors duration-200"
                        aria-label="Remove item"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-4 border-t border-gray-700">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-300">Total:</span>
                    <span className="text-xl font-bold text-white">${getCartTotal()}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={clearCart}
                      className="py-2 px-4 rounded-md text-gray-300 bg-slate-800 hover:bg-slate-700 transition-colors duration-200"
                    >
                      Clear Cart
                    </button>
                    <button
                      onClick={handleCheckout}
                      className="py-2 px-4 rounded-md text-white bg-purple-600 hover:bg-purple-700 transition-colors duration-200 flex items-center justify-center"
                      disabled={cart.length === 0 || pendingBasketOperations.length > 0}
                    >
                      {pendingBasketOperations.length > 0 ? (
                        <>
                          <FiRefreshCw className="animate-spin mr-2" />
                          Syncing...
                        </>
                      ) : (
                        <>
                          Checkout
                          <FiArrowRight className="ml-2" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Checkout Modal */}
      <CheckoutModal 
        isOpen={showCheckoutModal} 
        onClose={handleCloseCheckout} 
      />
    </>
  );
}

export default CartModal; 