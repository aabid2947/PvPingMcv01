import React from 'react';
import { useStore } from '../context/StoreContext';
import PurchaseButton from '../components/store/PurchaseButton';
import PurchaseModal from '../components/store/PurchaseModal';
import { FiShoppingBag, FiStar, FiPackage } from 'react-icons/fi';
import arrow from "../assets/arrow.png";

const Store = () => {
  const { products } = useStore();

  // Function to get appropriate icon based on product name
  const getProductIcon = (product) => {
    const name = product.name.toLowerCase();
    if (name.includes('rank') || name.includes('vip') || name.includes('mvp')) {
      return <FiStar className="w-5 h-5 text-yellow-400" />;
    } else if (name.includes('crate') || name.includes('box') || name.includes('chest')) {
      return <FiPackage className="w-5 h-5 text-purple-400" />;
    }
    return <FiShoppingBag className="w-5 h-5 text-blue-400" />;
  };

  return (
    <div className="w-full container mx-auto md:w-4/5 px-4 py-12">
      <div className="mb-8 flex items-center">
        <div className="flex items-center gap-3">
          <div className="bg-blue-500 rounded-full w-12 h-12 flex items-center justify-center">
            <FiShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Store</h1>
            <div className="w-24 h-1 bg-blue-500 mt-1"></div>
          </div>
        </div>
        <div className="w-8 h-8 ml-4">
          <img src={arrow} alt="" />
        </div>
      </div>
      
      <p className="text-gray-300 text-xl mb-8">
        Support our server and enhance your gameplay with exclusive items and perks
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-[#1e2132] rounded-lg overflow-hidden shadow-lg transition-all duration-300 hover:transform hover:scale-105 hover:shadow-xl hover:shadow-blue-900/20"
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold text-white">
                  {product.name}
                </h2>
                <div className="bg-blue-500/20 p-2 rounded-full">
                  {getProductIcon(product)}
                </div>
              </div>
              <p className="text-gray-400 mb-6 h-16 overflow-hidden">
                {product.description}
              </p>
              <div className="flex justify-between items-center mb-4">
                <p className="text-2xl font-bold text-blue-400">
                  ${product.price}
                </p>
                <div className="w-16"></div> {/* Spacer for layout balance */}
              </div>
              <PurchaseButton product={product} />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-16 bg-[#111827]/80 backdrop-blur-sm rounded-xl p-8 shadow-lg shadow-blue-900/10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 text-transparent bg-clip-text mb-3">
              Need a custom package?
            </h2>
            <p className="text-gray-300 text-lg">
              If you don't see what you're looking for, contact our support team to discuss custom packages for your needs.
            </p>
          </div>
          <a 
            href="http://pvpingmc.net/discord" 
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xl font-medium rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors whitespace-nowrap shadow-lg hover:shadow-purple-600/20"
          >
            Contact Support
          </a>
        </div>
      </div>

      <PurchaseModal />
    </div>
  );
};

export default Store;
