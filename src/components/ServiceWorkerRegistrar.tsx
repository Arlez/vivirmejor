'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegistrar() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // SW registration failed, app still works
      });
    }

    // Restore dark mode preference
    const darkMode = localStorage.getItem('respiravida-darkmode');
    if (darkMode === 'true') {
      document.documentElement.classList.add('dark');
    }
  }, []);

  return null;
}
