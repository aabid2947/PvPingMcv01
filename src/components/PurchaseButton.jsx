import React, { useState } from 'react';
import PurchaseModal from './PurchaseModal';
import { ShoppingCart } from 'lucide-react';

const PurchaseButton = ({ packageId, packageName, price, description }) => {
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);

  // Handle the initial purchase click
  const handlePurchaseClick = (e) => {
    // Prevent event bubbling
    e.preventDefault();
  
    
    // Show purchase modal directly
    setIsPurchaseModalOpen(true);
  };

  // Handle closing the purchase modal
  const handleClosePurchaseModal = (status) => {
    setIsPurchaseModalOpen(false);
    
    // If the purchase was successful, update button state
    if (status === 'success') {
      setPurchaseSuccess(true);
      
      // Reset after a delay
      setTimeout(() => {
        setPurchaseSuccess(false);
      }, 5000);
    }
  };

  // Render button content based on state
  const renderButtonContent = () => {
    if (purchaseSuccess) {
      return (
        <div className="flex items-center justify-center">
          <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
          <span>Purchase Successful!</span>
        </div>
      );
    }
    
    return (
      <div className="flex items-center justify-center">
        <ShoppingCart className="w-5 h-5 mr-2" />
        <span>Purchase Now</span>
      </div>
    );
  };

  return (
    <>
      <button
        onClick={handlePurchaseClick}
        disabled={purchaseSuccess}
        className={`w-full py-3 rounded-md font-medium text-white transition-colors ${
          purchaseSuccess 
            ? 'bg-gray-500 cursor-not-allowed' 
            : 'bg-[#679016] hover:bg-[#76a318]'
        }`}
      >
        {renderButtonContent()}
      </button>
      
      {/* Single-step Purchase Modal */}
      <PurchaseModal
        isOpen={isPurchaseModalOpen}
        onClose={handleClosePurchaseModal}
        packageId={packageId}
        packageName={packageName}
        price={price}
        description={description}
      />
      
    </>
  );
};

export default PurchaseButton; 