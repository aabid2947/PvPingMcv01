import React, { useState } from "react"
import GamingSidebarMenu from "../components/originPassSideBar"
import arrow from "../assets/arrow.png"
import { FiAward, FiChevronRight, FiMenu, FiX } from 'react-icons/fi';

export default function OriginPass() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const passes = [
    {
      name: "Explorer Pass",
      icon: "🔹",
      color: "bg-blue-500",
      hoverColor: "hover:bg-blue-600",
      textColor: "text-blue-500",
      price: "$9.99/mo",
      credits: "1000",
      bundle: "x1 SOTW Bundle",
      cosmetic: "x1 Cosmetic Key",
      randomTitle: false,
    },
    {
      name: "Hero Pass",
      icon: "🟢",
      color: "bg-green-500",
      hoverColor: "hover:bg-green-600",
      textColor: "text-green-500",
      price: "$14.99/mo",
      credits: "2450",
      bundle: "x2 SOTW Bundle",
      cosmetic: "x2 Cosmetic Key",
      randomTitle: false,
    },
    {
      name: "Elite Pass",
      icon: "🟣",
      color: "bg-purple-500",
      hoverColor: "hover:bg-purple-600",
      textColor: "text-purple-500",
      price: "$24.99/mo",
      credits: "5540",
      bundle: "x3 SOTW Bundle",
      cosmetic: "x3 Cosmetic Key",
      randomTitle: true,
    },
    {
      name: "Origin Pass",
      icon: "🔷",
      color: "bg-cyan-500",
      hoverColor: "hover:bg-cyan-600",
      textColor: "text-cyan-500",
      price: "$34.99/mo",
      credits: "7350",
      bundle: "x6 SOTW Bundle",
      cosmetic: "x6 Cosmetic Key",
      randomTitle: true,
    },
  ]

  // Labels for the rows
  const rowLabels = [
    "Pass Type",
    "Price",
    "Monthly Credits",
    "SOTW Bundle",
    "Feature 1",
    "Feature 2",
    "Feature 3",
    "Cosmetic Keys",
    "Random Title"
  ];

  return (
    <div className="w-full bg-[#13141d] text-white min-h-screen">
      <div className="container mx-auto md:w-4/5 px-4 py-12">
        {/* Header section */}
        <div className="mb-16 flex items-center">
          <div className="flex items-center gap-3">
            <div className="bg-[#3ABCFD] rounded-full w-12 h-12 flex items-center justify-center">
              <FiAward className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Origin Pass <span className="text-sm text-blue-400 font-medium">[Exclusive]</span></h1>
              <div className="w-32 h-1 bg-blue-500 mt-2"></div>
            </div>
          </div>
      
        </div>

        {/* Content section */}
        <div className="bg-[#111827] rounded-xl p-6 shadow-lg">
          {/* Mobile Toggle Button */}
          <div className="md:hidden flex justify-between items-center mb-4">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center gap-2 text-blue-400 bg-gray-800 px-4 py-2 rounded-md focus:outline-none"
            >
              {isMenuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
              <span>Menu</span>
            </button>
          </div>

          <div className="flex flex-col md:flex-row items-start gap-4">
            {/* Sidebar with transition */}
            <div className={`${isMenuOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0 md:max-h-[600px] md:opacity-100'} transition-all duration-300 ease-in-out overflow-hidden w-full md:w-auto`}>
              <GamingSidebarMenu />
            </div>

            {/* Pass Content Area */}
            <div className="w-full overflow-x-auto">
              {/* Desktop View - Grid Layout */}
              <div className="hidden md:block">
                {/* Header Row */}
                <div className="grid grid-cols-4 gap-3 mb-3">
                  {passes.map((pass, index) => (
                    <div key={`header-${index}`} className="flex items-center justify-center gap-2">
                      <span className="text-xl">{pass.icon}</span>
                      <span className={`font-bold ${pass.textColor}`}>{pass.name}</span>
                    </div>
                  ))}
                </div>

                {/* Price Row */}
                <div className="grid grid-cols-4 gap-3 mb-3">
                  {passes.map((pass, index) => (
                    <button
                      key={`price-${index}`}
                      className={`${pass.color} ${pass.hoverColor} text-white py-2 px-4 rounded-md transition-colors duration-200 text-center`}
                    >
                      {pass.price}
                    </button>
                  ))}
                </div>

                {/* Credits Row */}
                <div className="grid grid-cols-4 gap-3 mb-3">
                  {passes.map((pass, index) => (
                    <div
                      key={`credits-${index}`}
                      className="bg-emerald-900/50 border border-emerald-800 text-white py-2 px-4 rounded-md text-center"
                    >
                      {pass.credits}
                    </div>
                  ))}
                </div>

                {/* Bundle Row */}
                <div className="grid grid-cols-4 gap-3 mb-3">
                  {passes.map((pass, index) => (
                    <div
                      key={`bundle-${index}`}
                      className="bg-emerald-900/50 border border-emerald-800 text-white py-2 px-4 rounded-md text-center"
                    >
                      {pass.bundle}
                    </div>
                  ))}
                </div>

                {/* Yes Row 1 */}
                <div className="grid grid-cols-4 gap-3 mb-3">
                  {passes.map((pass, index) => (
                    <div
                      key={`yes1-${index}`}
                      className="bg-emerald-900/50 border border-emerald-800 text-white py-2 px-4 rounded-md text-center"
                    >
                      Yes
                    </div>
                  ))}
                </div>

                {/* Yes Row 2 */}
                <div className="grid grid-cols-4 gap-3 mb-3">
                  {passes.map((pass, index) => (
                    <div
                      key={`yes2-${index}`}
                      className="bg-emerald-900/50 border border-emerald-800 text-white py-2 px-4 rounded-md text-center"
                    >
                      Yes
                    </div>
                  ))}
                </div>

                {/* Yes Row 3 */}
                <div className="grid grid-cols-4 gap-3 mb-3">
                  {passes.map((pass, index) => (
                    <div
                      key={`yes3-${index}`}
                      className="bg-emerald-900/50 border border-emerald-800 text-white py-2 px-4 rounded-md text-center"
                    >
                      Yes
                    </div>
                  ))}
                </div>

                {/* Cosmetic Key Row */}
                <div className="grid grid-cols-4 gap-3 mb-3">
                  {passes.map((pass, index) => (
                    <div
                      key={`cosmetic-${index}`}
                      className="bg-emerald-900/50 border border-emerald-800 text-white py-2 px-4 rounded-md text-center"
                    >
                      {pass.cosmetic}
                    </div>
                  ))}
                </div>

                {/* Random Title Row */}
                <div className="grid grid-cols-4 gap-3">
                  {passes.map((pass, index) => (
                    <div
                      key={`title-${index}`}
                      className={`${pass.randomTitle ? `${pass.color} ${pass.hoverColor}` : "bg-red-900/50 border border-red-800"} text-white py-2 px-4 rounded-md text-center`}
                    >
                      {pass.randomTitle ? "Random Title" : "No"}
                    </div>
                  ))}
                </div>
              </div>

              {/* Mobile View - Stacked Layout */}
              <div className="md:hidden space-y-6">
                {passes.map((pass, index) => (
                  <div key={`pass-${index}`} className="bg-gray-800/50 rounded-lg overflow-hidden border border-gray-700">
                    {/* Pass Header */}
                    <div className={`${pass.color} p-3 flex items-center justify-between`}>
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{pass.icon}</span>
                        <span className="font-bold text-white">{pass.name}</span>
                      </div>
                      <span className="font-bold text-white">{pass.price}</span>
                    </div>
                    
                    {/* Pass Details */}
                    <div className="p-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Monthly Credits:</span>
                        <span className="font-medium">{pass.credits}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">SOTW Bundle:</span>
                        <span className="font-medium">{pass.bundle}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Feature 1:</span>
                        <span className="font-medium text-green-400">Yes</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Feature 2:</span>
                        <span className="font-medium text-green-400">Yes</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Feature 3:</span>
                        <span className="font-medium text-green-400">Yes</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Cosmetic Keys:</span>
                        <span className="font-medium">{pass.cosmetic}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Random Title:</span>
                        <span className={pass.randomTitle ? "font-medium text-green-400" : "font-medium text-red-400"}>
                          {pass.randomTitle ? "Yes" : "No"}
                        </span>
                      </div>
                    </div>
                    
                    {/* Purchase Button */}
                    <div className="p-4">
                      <button className={`w-full ${pass.color} ${pass.hoverColor} text-white py-2 px-4 rounded-md transition-colors duration-200`}>
                        Purchase
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
          </div>
          
        </div>
        <div className="w-full mt-6 bg-[#1D1E29AB] rounded-md py-8 px-4 relative overflow-hidden">
      {/* Blue accent lines */}
      <div className="absolute h-1/2 my-auto left-0 top-0 bottom-0 w-1 bg-cyan-400"></div>
      <div className="absolute h-1/2 my-auto right-0 top-0 bottom-0 w-1 bg-cyan-400"></div>

      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-white text-2xl md:text-3xl font-bold tracking-wide mb-2">
          READY TO LEVEL UP YOUR GAME EXPERIENCE?
        </h2>
        <p className="text-gray-300 text-sm md:text-base">
          Use the <span className="text-cyan-400">/originpass</span> command in-game to get started!
        </p>
      </div>
    </div>
      </div>
      
    </div>
  )
}

