import React from 'react';
import { Download, Check, Info } from 'lucide-react';
import { usePWA } from '../../hooks/usePWA';

function isIOS() {
  return (
    /iphone|ipad|ipod/i.test(window.navigator.userAgent) &&
    !window.MSStream
  );
}

function isInStandaloneMode() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  );
}

const PWAInstallButton = () => {
  const { isInstallable, isInstalled, installApp } = usePWA();

  // N'affiche rien si l'app est déjà installée
  if (isInstalled) return null;

  // Affiche le bouton si installable
  if (isInstallable) {
    return (
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-4 rounded-2xl shadow-xl flex items-center space-x-3 z-50 max-w-xs w-[95vw] text-center">
        <button
          onClick={installApp}
          className="flex items-center space-x-2 font-semibold w-full justify-center text-base md:text-sm"
        >
          <Download className="h-5 w-5" />
          <span>Installer l'app</span>
        </button>
      </div>
    );
  }

  return null;
};

export default PWAInstallButton; 