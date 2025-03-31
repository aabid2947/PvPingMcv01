import React, { useEffect, useRef } from 'react';
import { CheckCircle } from 'lucide-react';

/**
 * A confirmation modal that appears briefly after successful login
 */
const LoginConfirmation = ({ isOpen, username, onContinue }) => {
  const modalRef = useRef(null);
  
  // Auto-continue after delay
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onContinue();
      }, 1500); // Auto-continue after 1.5 seconds
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, onContinue]);
  
  // Handle escape key to continue
  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === 'Escape') {
        onContinue();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleEscapeKey);
      
      // Prevent body scrolling when modal is open
      document.body.style.overflow = 'hidden';
      document.body.classList.add('confirmation-modal-open');
    }

    return () => {
      window.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'auto';
      document.body.classList.remove('confirmation-modal-open');
    };
  }, [isOpen, onContinue]);
  
  if (!isOpen) return null;
  
  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[99999] flex items-center justify-center p-4"
      onClick={onContinue} // Close when clicking anywhere
      style={{ isolation: 'isolate' }}
    >
      <div 
        ref={modalRef}
        className="bg-[#1e1f2c] rounded-lg p-8 shadow-xl text-center max-w-sm mx-auto animate-fadeIn"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking on the modal
      >
        <div className="flex justify-center mb-4">
          <CheckCircle className="h-20 w-20 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Login Successful!</h2>
        <p className="text-gray-300 mb-6">
          Welcome, <span className="text-blue-400 font-semibold">{username}</span>
        </p>
        <p className="text-gray-400 text-sm">
          Proceeding to checkout...
        </p>
      </div>
    </div>
  );
};

export default LoginConfirmation; 