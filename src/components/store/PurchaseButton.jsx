import React from 'react';
import { useStore } from '../../context/StoreContext';

const PurchaseButton = ({ product }) => {
  const { openPurchaseModal, setSelectedProduct } = useStore();

  const handlePurchaseClick = () => {
    setSelectedProduct(product);
    openPurchaseModal();
  };

  return (
    <button
      onClick={handlePurchaseClick}
      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors"
    >
      Purchase Now
    </button>
  );
};

export default PurchaseButton; 