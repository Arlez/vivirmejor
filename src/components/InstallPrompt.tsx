'use client';

import { useEffect, useState } from 'react';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setVisible(true);
    };

    const onAppInstalled = () => {
      setDeferredPrompt(null);
      setVisible(false);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstall as EventListener);
    window.addEventListener('appinstalled', onAppInstalled as EventListener);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall as EventListener);
      window.removeEventListener('appinstalled', onAppInstalled as EventListener);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    try {
      // show the browser install prompt
      await deferredPrompt.prompt();
      // wait for the user's choice
      const choice = await deferredPrompt.userChoice;
      // hide UI after choice
      setVisible(false);
      setDeferredPrompt(null);
      // optionally: track choice.outcome === 'accepted' | 'dismissed'
    } catch (err) {
      setVisible(false);
      setDeferredPrompt(null);
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-24 left-0 right-0 flex justify-center z-50">
      <div className="max-w-lg w-full px-4">
        <div className="flex items-center justify-between bg-white/95 dark:bg-gray-800/95 border rounded-2xl shadow-lg p-4">
          <div className="flex items-center gap-3">
            <img src="/icons/logo-64.png" alt="Vivir Mejor" className="w-10 h-10 rounded" />
            <div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">Instalar Vivir Mejor</div>
              <div className="text-sm text-gray-500 dark:text-gray-300">Añadir la app a su dispositivo para acceso rápido</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setVisible(false); setDeferredPrompt(null); }}
              className="px-4 py-2 rounded-xl text-sm text-gray-600 dark:text-gray-300">
              Cerrar
            </button>
            <button
              onClick={handleInstall}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl font-semibold"
            >
              Instalar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
