
import storeImg from "../assets/store.png"
import React, { useState } from 'react';
import { FiShoppingCart, FiPackage, FiStar, FiShield, FiTool, FiShoppingBag } from 'react-icons/fi';
import arrow from "../assets/arrow.png"

const StoreItem = ({ name, price, description, category, bestseller }) => {
  return (
    <div className="bg-[#0c0c14]  rounded-xl overflow-hidden shadow-lg transition-transform duration-300 hover:transform hover:scale-105">
      <div className="relative">
        <div className="h-48 bg-[#1F2937]">
          <img 
            src={storeImg} 
            alt={name} 
            className="w-full h-full object-cover"
          />
        </div>
        {bestseller && (
          <div className="absolute top-3 right-3 bg-yellow-500 text-black text-sm font-bold px-3 py-1 rounded">
            BESTSELLER
          </div>
        )}
      </div>
      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-2xl font-bold text-white">{name}</h3>
          <span className="text-xl font-bold text-purple-400">{price}</span>
        </div>
        <p className="text-gray-400 text-lg mb-5">{description}</p>
        <button className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-lg font-medium rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors flex items-center justify-center gap-2">
          <FiShoppingCart /> Add to Cart
        </button>
      </div>
    </div>
  );
};

export default function StorePage() {
  const [activeCategory, setActiveCategory] = useState('all');
  
  const categories = [
    { id: 'all', name: 'All Items', icon: <FiPackage /> },
    { id: 'ranks', name: 'Ranks', icon: <FiStar /> },
    { id: 'crates', name: 'Crates', icon: <FiPackage /> },
    { id: 'kits', name: 'Kits', icon: <FiShield /> },
    { id: 'tools', name: 'Tools & Weapons', icon: <FiTool /> }
  ];
  
  const storeItems = [
    {
      id: 1,
      name: "VIP Rank",
      price: "$9.99",
      description: "Get VIP status with special perks and privileges on the server.",
      category: "ranks",
      bestseller: true
    },
    {
      id: 2,
      name: "MVP Rank",
      price: "$19.99",
      description: "Upgrade to MVP for premium features and exclusive access.",
      category: "ranks",
      bestseller: false
    },
    {
      id: 3,
      name: "Legendary Crate",
      price: "$14.99",
      description: "Unlock rare items and special rewards with this legendary crate.",
      category: "crates",
      bestseller: true
    },
    {
      id: 4,
      name: "Mystery Crate",
      price: "$7.99",
      description: "Try your luck with our mystery crate filled with random goodies.",
      category: "crates",
      bestseller: false
    },
    {
      id: 5,
      name: "Warrior Kit",
      price: "$12.99",
      description: "Start with full warrior gear and powerful weapons and armor.",
      category: "kits",
      bestseller: false
    },
    {
      id: 6,
      name: "Miner Kit",
      price: "$9.99",
      description: "Get all the mining tools and resources you need to build and craft.",
      category: "kits",
      bestseller: false
    },
    {
      id: 7,
      name: "Enchanted Sword",
      price: "$8.99",
      description: "A powerful enchanted sword with special abilities.",
      category: "tools",
      bestseller: false
    },
    {
      id: 8,
      name: "Dragon Bow",
      price: "$11.99",
      description: "A mighty bow with fire and knockback enchantments.",
      category: "tools",
      bestseller: true
    }
  ];
  
  const filteredItems = activeCategory === 'all' 
    ? storeItems 
    : storeItems.filter(item => item.category === activeCategory);

  return (
    <div className="w-full bg-[#13141d] text-white min-h-screen">
      <div className="container mx-auto md:w-4/5 px-4 py-12">
        <div className="mb-16 flex items-center">
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
        
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category) => (
            <button
              key={category.id}
              className={`flex items-center gap-2 px-6 py-3 rounded-full text-lg font-medium transition-colors ${
                activeCategory === category.id
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                  : 'bg-[#111827] text-gray-300 hover:bg-[#1F2937]'
              }`}
              onClick={() => setActiveCategory(category.id)}
            >
              {category.icon}
              {category.name}
            </button>
          ))}
        </div>
        
        <p className="text-gray-300 text-xl mb-12">
          Support our server and enhance your gameplay with exclusive items and perks
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredItems.map((item) => (
            <StoreItem key={item.id} {...item} />
          ))}
        </div>
        
        <div className="mt-16 bg-[#111827] rounded-xl p-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <h2 className="text-3xl font-bold text-white mb-3">Need a custom package?</h2>
              <p className="text-gray-300 text-xl">
                If you don't see what you're looking for, contact our support team to discuss custom packages for your needs.
              </p>
            </div>
            <button className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xl font-medium rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors whitespace-nowrap">
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
