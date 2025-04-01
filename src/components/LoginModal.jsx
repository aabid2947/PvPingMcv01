import React, { useState, useEffect, useRef } from 'react';
import { FiX, FiUser } from 'react-icons/fi';

/**
 * A modal component that prompts users to enter their Minecraft username 
 * before proceeding with a purchase
 */
function LoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [edition, setEdition] = useState('java'); // 'java' or 'bedrock'
  const modalRef = useRef(null);

  // Handle click outside modal to close
  useEffect(() => {
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    }

    // Handle escape key to close modal
    function handleEscKey(event) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscKey);
      document.body.classList.add('modal-open');
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscKey);
      document.body.classList.remove('modal-open');
    };
  }, [isOpen, onClose]);

  // Function to validate and submit the form
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Reset previous error
    setError('');
    
    // Validate username
    if (!username.trim()) {
      setError('Please enter your Minecraft username');
      return;
    }
    
    // // Validate username format using Minecraft username rules
    // const usernameRegex = /^[a-zA-Z0-9_]{3,16}$/;
    // if (!usernameRegex.test(username)) {
    //   setError('Username must be 3-16 characters and only contain letters, numbers, or underscores');
    //   return;
    // }
    
    // If all validations pass, call the success handler with username and edition
    onLoginSuccess({ username, edition });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div 
        ref={modalRef}
        className="bg-[#1D1E29] text-zinc-200 rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden transform transition-all"
      >
        <div className="flex justify-between items-center p-5 border-b">
          <h3 className="text-xl font-semibold">Enter Your Minecraft Username</h3>
          <button
            onClick={onClose}
            className="hover:text-gray-500 focus:outline-none"
          >
            <FiX size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <label htmlFor="username" className="block text-sm font-medium mb-1">
              Minecraft Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiUser className="text-gray-400" />
              </div>
              <input
                type="text"
                id="username"
                name="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="pl-10 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-purple-500"
                placeholder="Your Minecraft username"
                autoComplete="off"
              />
            </div>
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium mb-1">
              Edition
            </label>
            <div className="flex space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="edition"
                  value="java"
                  checked={edition === 'java'}
                  onChange={() => setEdition('java')}
                  className="form-radio h-4 w-4 text-purple-600 focus:ring-purple-500"
                />
                <span className="ml-2">Java Edition</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="edition"
                  value="bedrock"
                  checked={edition === 'bedrock'}
                  onChange={() => setEdition('bedrock')}
                  className="form-radio h-4 w-4 text-purple-600 focus:ring-purple-500"
                />
                <span className="ml-2">Bedrock Edition</span>
              </label>
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="mr-3 inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              Continue to Purchase
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginModal; 