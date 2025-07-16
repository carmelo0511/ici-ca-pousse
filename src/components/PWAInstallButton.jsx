import React from 'react';
import { Download } from 'lucide-react';
import { usePWA } from '../hooks/usePWA';
import { useTranslation } from 'react-i18next';

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
  const { t, i18n } = useTranslation();

  // iOS: notice harmonisée avec le bouton natif
  if (isIOS() && !isInStandaloneMode() && !isInstalled) {
    return (
      <div
        className="fixed bottom-4 right-4 z-50 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center space-x-2 text-sm md:text-base pulse-soft"
        style={{ maxWidth: 320 }}
      >
        <Download className="h-4 w-4 md:h-5 md:w-5" />
        <span>
          {i18n.language === 'fr'
            ? "Pour installer l'app, ouvrez le menu de partage de Safari puis 'Sur l'écran d'accueil'"
            : "To install, open Safari's share menu then 'Add to Home Screen'"}
        </span>
      </div>
    );
  }

  // Android/desktop : bouton natif
  if (isInstalled || !isInstallable) return null;

  return (
    <button
      onClick={installApp}
      className="fixed bottom-4 right-4 z-50 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center space-x-2 text-sm md:text-base hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 pulse-soft"
      aria-label={t('install_app')}
      style={{ maxWidth: 320 }}
    >
      <Download className="h-4 w-4 md:h-5 md:w-5" />
      <span>{t('install_app')}</span>
    </button>
  );
};

export default PWAInstallButton; 