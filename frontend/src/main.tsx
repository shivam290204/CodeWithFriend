import { StrictMode } from 'react';
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import 'lenis/dist/lenis.css';
import { Toaster } from 'sonner';

const ErrorOverlay = () => {
  const [error, setError] = React.useState<string | null>(null);
  React.useEffect(() => {
    const handleError = (e: ErrorEvent) => setError(e.message + '\n' + e.error?.stack);
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);
  if (!error) return null;
  return <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999, background: 'red', color: 'white', padding: 20, whiteSpace: 'pre-wrap' }}>{error}</div>;
};

// Render error overlay in a separate div
const errorDiv = document.createElement('div');
document.body.appendChild(errorDiv);
createRoot(errorDiv).render(<ErrorOverlay />);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <Toaster position="bottom-right" richColors closeButton />
  </StrictMode>,
);
