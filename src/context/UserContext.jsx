import React, { createContext, useState, useContext, useEffect } from 'react';

// Create context
const UserContext = createContext();

// Custom hook to use the user context
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

// Provider component
export const UserProvider = ({ children }) => {
  const [username, setUsername] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  
  // Load user data from localStorage on initial render
  useEffect(() => {
    const storedUsername = localStorage.getItem('minecraft_username');
    if (storedUsername) {
      setUsername(storedUsername);
      setIsLoggedIn(true);
    }
    
    const storedPurchaseHistory = localStorage.getItem('purchase_history');
    if (storedPurchaseHistory) {
      try {
        setPurchaseHistory(JSON.parse(storedPurchaseHistory));
      } catch (error) {
        console.error('Failed to parse purchase history:', error);
      }
    }
  }, []);
  
  // Save user data to localStorage whenever it changes
  useEffect(() => {
    if (username) {
      localStorage.setItem('minecraft_username', username);
    } else {
      localStorage.removeItem('minecraft_username');
    }
    
    if (purchaseHistory.length > 0) {
      localStorage.setItem('purchase_history', JSON.stringify(purchaseHistory));
    }
  }, [username, purchaseHistory]);
  
  // Login function
  const login = (minecraftUsername) => {
    setUsername(minecraftUsername);
    setIsLoggedIn(true);
    
    // Immediately save to localStorage for better persistence across page refreshes
    localStorage.setItem('minecraft_username', minecraftUsername);
  };
  
  // Logout function
  const logout = () => {
    setUsername('');
    setIsLoggedIn(false);
  };
  
  // Add purchase to history
  const addPurchase = (purchase) => {
    const newPurchase = {
      ...purchase,
      date: new Date().toISOString(),
    };
    setPurchaseHistory(prevHistory => [newPurchase, ...prevHistory]);
  };
  
  const value = {
    username,
    isLoggedIn,
    purchaseHistory,
    login,
    logout,
    addPurchase
  };
  
  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContext; 