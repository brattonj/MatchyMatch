/**
 * @file main.jsx
 * @description Application entry point. Renders the React app into the DOM root element.
 * Wraps the App component in React StrictMode for development checks.
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
