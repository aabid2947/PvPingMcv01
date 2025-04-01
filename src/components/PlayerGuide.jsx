import React, { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";


export default function PlayerGuide({ isOpen, onClose }) {
  const [selectedEdition, setSelectedEdition] = useState(null);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleSelect = (edition) => {
    setSelectedEdition(edition);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-[#13141d] rounded-xl shadow-2xl w-full max-w-4xl mx-4 overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <FiX size={24} />
        </button>

        {/* Content */}
        <div className="p-6 md:p-8">
          {/* Heading */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              How to Play PvPingMC
            </h1>
            <div className="h-1 w-16 bg-blue-500 mx-auto"></div>
          </div>

          {/* Edition Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Java Edition */}
            <div
              className={`bg-[#1D1E29AB] rounded-lg overflow-hidden cursor-pointer transition-all duration-300 hover:transform hover:scale-105 ${
                selectedEdition === "java" ? "ring-2 ring-blue-500" : ""
              }`}
              onClick={() => handleSelect("java")}
            >
              <div className="p-6 text-center">
                <h2 className="text-2xl font-bold text-white mb-3">Java Edition</h2>
                <p className="text-gray-400">
                  I play Minecraft on my personal computer: macOS, Linux, or Windows.
                </p>
              </div>
            </div>

            {/* Bedrock Edition */}
            <div
              className={`bg-[#1D1E29AB] rounded-lg overflow-hidden cursor-pointer transition-all duration-300 hover:transform hover:scale-105 ${
                selectedEdition === "bedrock" ? "ring-2 ring-blue-500" : ""
              }`}
              onClick={() => handleSelect("bedrock")}
            >
              <div className="p-6 text-center">
                <h2 className="text-2xl font-bold text-white mb-3">Bedrock Edition</h2>
                <p className="text-gray-400">
                  I play Minecraft on my phone, tablet, console, or on PC from the Microsoft Store.
                </p>
              </div>
            </div>
          </div>

          {/* Connection Instructions */}
          {selectedEdition && (
            <div className="mt-8 p-6 bg-[#1D1E29AB] rounded-lg">
              <h3 className="text-xl font-bold text-white mb-4">Connection Instructions</h3>
              {selectedEdition === "java" ? (
                <div className="space-y-4">
                  <p className="text-gray-300">1. Open Minecraft Java Edition</p>
                  <p className="text-gray-300">2. Click on "Multiplayer"</p>
                  <p className="text-gray-300">3. Click "Add Server"</p>
                  <p className="text-gray-300">4. Enter the server address: <span className="text-blue-400">play.pvpingmc.net</span></p>
                  <p className="text-gray-300">5. Click "Done" and then "Join Server"</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-gray-300">1. Open Minecraft Bedrock Edition</p>
                  <p className="text-gray-300">2. Click on "Play"</p>
                  <p className="text-gray-300">3. Click on "Servers" tab</p>
                  <p className="text-gray-300">4. Click "Add Server"</p>
                  <p className="text-gray-300">5. Enter the server address: <span className="text-blue-400">play.pvpingmc.net</span></p>
                  <p className="text-gray-300">6. Click "Save" and then "Play"</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
