import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

// Get base URL from the environment or default to '/'
const baseUrl = import.meta.env.BASE_URL || '/'

// Using React 17 render method instead of React 18 createRoot
ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter basename={baseUrl}>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root')
)
