import React from 'react';
import { Download } from 'lucide-react';
import { usePWA } from '../hooks/usePWA';
import { useTranslation } from 'react-i18next';

const PWAInstallButton = () => {
  const { isInstallable, isInstalled, installApp } = usePWA();
  const { t } = useTranslation();

  if (isInstalled || !isInstallable) return null;

  return (
    <button
      onClick={installApp}
      className="fixed bottom-4 right-4 z-50 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center space-x-2 text-sm md:text-base hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 pulse-soft"
      aria-label={t('install_app')}
    >
      <Download className="h-4 w-4 md:h-5 md:w-5" />
      <span>{t('install_app')}</span>
    </button>
  );
};

export default PWAInstallButton; 