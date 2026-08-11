import { createRoot } from 'react-dom/client';
import { setBaseUrl, setAuthTokenGetter } from '@workspace/api-client-react';

import App from './App';
import './index.css';

if (import.meta.env.VITE_API_BASE_URL) {
  setBaseUrl(import.meta.env.VITE_API_BASE_URL);
}

// Enable cross-device JWT Bearer token authentication
setAuthTokenGetter(() => {
  try {
    return localStorage.getItem("eventhub_token");
  } catch {
    return null;
  }
});

createRoot(document.getElementById('root')!).render(<App />);
