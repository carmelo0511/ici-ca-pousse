import React from 'react';
import PropTypes from 'prop-types';

const MigrationPrompt = ({ onMigrate, onIgnore }) => (
  <div className="flex flex-col items-center justify-center min-h-screen gap-6">
    <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
      <h2 className="text-2xl font-bold mb-4">Migration des données</h2>
      <p className="mb-6">
        Des séances locales ont été détectées. Voulez-vous les transférer sur
        votre compte cloud pour les retrouver sur tous vos appareils ?
      </p>
      <button
        className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 mb-2 border border-white/20"
        onClick={onMigrate}
      >
        Migrer mes séances locales vers le cloud
      </button>
      <button className="text-gray-500 underline mt-2" onClick={onIgnore}>
        Ignorer
      </button>
    </div>
  </div>
);

MigrationPrompt.propTypes = {
  onMigrate: PropTypes.func.isRequired,
  onIgnore: PropTypes.func.isRequired,
};

export default MigrationPrompt;
