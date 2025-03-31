import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

const LoginModal = ({ isOpen, onClose, onLogin }) => {
  const [username, setUsername] = useState('');
  const [edition, setEdition] = useState('java');
  const [error, setError] = useState('');
  const modalRef = useRef(null);

  // Handle click outside to prevent accidental closing
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Only handle clicks outside the modal content, and specifically ignore store elements
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        // Prevent the event from bubbling further
        event.stopPropagation();
      }
    };

    // Add the event listener only when the modal is open
    // if (isOpen) {
    //   document.addEventListener('mousedown', handleClickOutside, { capture: true });
    //   document.addEventListener('mouseover', handleClickOutside, { capture: true });

    //   // Prevent body scrolling when modal is open
    //   document.body.style.overflow = 'hidden';
      
    //   // Add a class to the body to indicate modal is open
    //   document.body.classList.add('modal-open');
    // }
return;
    // return () => {
    //   document.removeEventListener('mousedown', handleClickOutside, { capture: true });
    //   document.removeEventListener('mouseover', handleClickOutside, { capture: true });
    //   document.body.style.overflow = 'auto';
    //   document.body.classList.remove('modal-open');
    // };
  }, [isOpen]);

  const handleSubmit = (e) => {
    // Prevent any form submission default behavior
    if (e) e.preventDefault();
    
    if (!username.trim()) {
      setError('Please enter a valid username');
      return;
    }
    
    // Add the . prefix for Bedrock Edition
    const formattedUsername = edition === 'bedrock' ? `.${username.trim()}` : username.trim();
    onLogin(formattedUsername);
  };

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      window.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCloseClick = (e) => {
    e.stopPropagation();
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[99999] flex items-center justify-center p-4 overflow-y-auto"
      onClick={(e) => e.stopPropagation()} // Prevent click from reaching elements underneath
      style={{ isolation: 'isolate' }} // Establish a new stacking context
    >
      <div 
        ref={modalRef}
        className="bg-[#1e1f2c] rounded-lg w-full max-w-md shadow-xl relative animate-fadeIn"
        onClick={(e) => e.stopPropagation()} // Stop propagation within the modal
      >
        <div className="flex justify-between items-center p-5 bg-[#1d1e29] rounded-t-lg">
          <h2 className="text-2xl font-bold text-white">LOGIN</h2>
          <button 
            onClick={handleCloseClick}
            className="text-red-500 hover:text-red-400 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <button 
            type="button"
            className="w-full py-3 bg-[#679016] hover:bg-[#76a318] text-white font-bold rounded-md mb-4 transition-colors"
            onClick={() => {
              // Implement OPLegends login functionality if needed
              console.log('Login with OPLegends clicked');
            }}
          >
            Login with OPLegends
          </button>

          <div className="flex items-center my-4">
            <div className="flex-1 h-px bg-gray-700"></div>
            <p className="mx-4 text-gray-400 font-medium">OR</p>
            <div className="flex-1 h-px bg-gray-700"></div>
          </div>

          <p className="text-gray-300 text-lg mb-4">
            Enter your exact Minecraft username and tap "Login" to start shopping!
          </p>

          <div className="flex items-center mb-4">
            <img 
              src="https://crafatar.com/avatars/8667ba71b85a4004af54457a9734eed7" 
              alt="Minecraft Avatar" 
              className="w-10 h-10 mr-2"
            />
            <input
              type="text"
              placeholder="Minecraft Username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError('');
              }}
              className="w-full p-2 bg-[#2c2d38] border border-gray-700 rounded text-white"
            />
          </div>

          {error && (
            <p className="text-red-500 mb-4">{error}</p>
          )}

          <div className="mb-6">
            <h3 className="text-xl font-bold text-amber-500 mb-2">Am I on Java Edition or Bedrock Edition?</h3>
            <p className="text-gray-300 mb-2">
              On OPLegends, your name will begin with a . before it if you are a <span className="text-amber-500 font-bold">Bedrock Edition</span> player. Make sure to include this!
            </p>
            
            <div className="bg-[#2a2a38] p-4 rounded-md mt-4">
              <h3 className="text-xl font-bold text-red-500 mb-2">Why is my username invalid?</h3>
              <p className="text-gray-300">
                Your username is invalid if you have not logged into the server yet. Please join the server (IP is play.oplegens.com) and try again.
              </p>
            </div>
          </div>

          <div className="flex space-x-4 mb-2">
            <button
              type="button"
              className={`flex-1 py-2 px-4 rounded ${edition === 'java' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
              onClick={() => setEdition('java')}
            >
              Java Edition
            </button>
            <button
              type="button"
              className={`flex-1 py-2 px-4 rounded ${edition === 'bedrock' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
              onClick={() => setEdition('bedrock')}
            >
              Bedrock Edition
            </button>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-[#679016] hover:bg-[#76a318] text-white font-bold rounded-md uppercase tracking-wider transition-colors"
          >
            {username ? 'Login' : 'Enter Username Above to Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginModal; 