import setupLocatorUI from '@locator/runtime';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Initialize LocatorJS in preview / development mode
if (import.meta.env.DEV || typeof window !== 'undefined') {
  setupLocatorUI({
    adapter: 'react',
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
