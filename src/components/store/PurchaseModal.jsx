import React, { useEffect, useRef } from 'react';
import { useStore } from '../../context/StoreContext';
import { isTebexLoaded, openCheckout } from '../../services/tebexService';

const PurchaseModal = () => {
  const {
    isModalOpen,
    selectedProduct,
    username,
    setUsername,
    edition,
    setEdition,
    purchaseStep,
    setPurchaseStep,
    loading,
    setLoading,
    error,
    setError,
    closePurchaseModal,
    goToCheckout,
    completePurchase
  } = useStore();

  const modalRef = useRef(null);
  const checkoutContainerRef = useRef(null);

  // Handle clicks outside modal to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        closePurchaseModal();
      }
    };

    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        closePurchaseModal();
      }
    };

    if (isModalOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
      document.body.classList.add('purchase-modal-open');
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.classList.remove('purchase-modal-open');
    };
  }, [isModalOpen, closePurchaseModal]);

  // Handle Tebex checkout
  useEffect(() => {
    if (purchaseStep === 'checkout' && checkoutContainerRef.current) {
      const initCheckout = async () => {
        try {
          setLoading(true);
          setError(null);

          // For development, we'll simulate the checkout process
          if (process.env.NODE_ENV === 'development' && !isTebexLoaded()) {
            console.log('Development mode: Simulating checkout...');
            setTimeout(() => {
              completePurchase();
              setLoading(false);
            }, 3000);
            return;
          }

          // For production, use the actual Tebex checkout
          const success = await openCheckout({
            username,
            edition,
            packageId: selectedProduct?.id,
            checkoutContainer: checkoutContainerRef.current,
            onSuccess: () => {
              completePurchase();
              setLoading(false);
            },
            onFailure: (err) => {
              setError(err.message || 'Failed to complete purchase');
              setPurchaseStep('username');
              setLoading(false);
            }
          });

          if (!success) {
            setError('Failed to initialize checkout. Please try again.');
            setPurchaseStep('username');
          }
        } catch (err) {
          console.error('Checkout error:', err);
          setError(err.message || 'An error occurred during checkout');
          setPurchaseStep('username');
        } finally {
          setLoading(false);
        }
      };

      initCheckout();
    }
  }, [
    purchaseStep,
    username,
    edition,
    selectedProduct,
    completePurchase,
    setError,
    setLoading,
    setPurchaseStep
  ]);

  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div
        ref={modalRef}
        className="bg-[#13141d] rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden"
      >
        {/* Header */}
        <div className="bg-[#1e2132] p-4 flex justify-between items-center border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">
            {purchaseStep === 'username' && 'Enter Minecraft Username'}
            {purchaseStep === 'checkout' && 'Complete Purchase'}
            {purchaseStep === 'success' && 'Purchase Successful!'}
          </h2>
          <button
            onClick={closePurchaseModal}
            className="text-gray-400 hover:text-white"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {purchaseStep === 'username' && (
            <div className="space-y-4">
              {selectedProduct && (
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold text-blue-400">
                    {selectedProduct.name}
                  </h3>
                  <p className="text-gray-400">{selectedProduct.description}</p>
                  <p className="text-xl font-bold mt-2">
                    ${selectedProduct.price}
                  </p>
                </div>
              )}

              <div>
                <label className="block text-gray-300 mb-2">
                  Minecraft Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-2 bg-[#1e2132] text-white rounded border border-gray-700 focus:border-blue-500 focus:outline-none"
                  placeholder="Enter your Minecraft username"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2">Game Edition</label>
                <div className="flex space-x-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="edition"
                      value="java"
                      checked={edition === 'java'}
                      onChange={() => setEdition('java')}
                      className="accent-blue-500"
                    />
                    <span className="text-white">Java</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="edition"
                      value="bedrock"
                      checked={edition === 'bedrock'}
                      onChange={() => setEdition('bedrock')}
                      className="accent-blue-500"
                    />
                    <span className="text-white">Bedrock</span>
                  </label>
                </div>
              </div>

              {error && (
                <div className="text-red-500 text-sm mt-2 p-2 bg-red-500/10 rounded">
                  {error}
                </div>
              )}

              <button
                onClick={goToCheckout}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors"
              >
                Continue to Checkout
              </button>
            </div>
          )}

          {purchaseStep === 'checkout' && (
            <div className="min-h-[300px] flex flex-col items-center justify-center">
              <div ref={checkoutContainerRef} className="w-full checkout-container">
                {loading && (
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-300">Loading payment options...</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {purchaseStep === 'success' && (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-600 rounded-full mx-auto flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Purchase Successful!
              </h3>
              <p className="text-gray-400 mb-4">
                Thank you for your purchase. Your items will be delivered to your
                account shortly.
              </p>
              <p className="text-blue-400">Username: {username}</p>
              <p className="text-blue-400">Edition: {edition}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PurchaseModal; 