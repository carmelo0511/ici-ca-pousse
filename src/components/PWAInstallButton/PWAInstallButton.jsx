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
  const isiOS = isIOS();
  const standalone = isInStandaloneMode();

  // Si déjà installée, afficher un badge
  if (isInstalled || standalone) {
    return (
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center space-x-2 z-50 text-base md:text-sm">
        <Check className="h-4 w-4" />
        <span className="font-medium">App installée</span>
      </div>
    );
  }

  // iOS : Afficher une aide spécifique
  if (isiOS && !standalone) {
    return (
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-white border border-indigo-300 text-indigo-700 px-4 py-3 rounded-2xl shadow-xl flex items-center space-x-3 z-50 max-w-xs w-[95vw] text-center">
        <Info className="h-5 w-5 flex-shrink-0" />
        <span className="text-sm font-medium">
          Pour installer l'app sur iPhone :<br />
          <b>Ouvre le menu <span style={{fontWeight:'bold'}}>Partager</span> <span role='img' aria-label='share'>⬆️</span> puis choisis "Sur l'écran d'accueil"</b>
        </span>
      </div>
    );
  }

  // Android/Chrome : bouton natif
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