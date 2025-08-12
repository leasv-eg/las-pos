import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './components/App'
import './index.css'

console.log('🚀 LAS POS - Starting application...');
console.log('📍 Root element:', document.getElementById('root'));

// Register service worker for PWA functionality
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

console.log('🎯 LAS POS - Creating React root...');
const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('❌ Root element not found!');
} else {
  console.log('✅ Root element found, rendering App...');
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
  console.log('🎉 LAS POS - App rendered successfully!');
}
