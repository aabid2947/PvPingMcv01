// main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { UserProvider } from './context/UserContext'
import { CartProvider } from './contexts/CartContext'
import { BasketProvider } from './contexts/BasketContext'

// Using React 18's createRoot API
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <UserProvider>
      <CartProvider>
        <BasketProvider>
          <App />
        </BasketProvider>
      </CartProvider>
    </UserProvider>
  </React.StrictMode>
)