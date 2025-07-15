import React from 'react';
import { Download, Check } from 'lucide-react';
import { usePWA } from '../hooks/usePWA';

const PWAInstallButton = () => {
  const { isInstallable, isInstalled, installApp } = usePWA();

  if (isInstalled) {
    return (
      <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center space-x-2 z-50">
        <Check className="h-4 w-4" />
        <span className="text-sm font-medium">App installée</span>
      </div>
    );
  }

  if (!isInstallable) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 z-50">
      <button
        onClick={installApp}
        className="flex items-center space-x-2 font-medium"
      >
        <Download className="h-4 w-4" />
        <span className="text-sm">Installer l'app</span>
      </button>
    </div>
  );
};

export default PWAInstallButton; 