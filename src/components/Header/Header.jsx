import React from 'react';
import { Dumbbell } from 'lucide-react';

const Header = ({ workoutCount }) => {
  return (
    <header className="bg-white/90 backdrop-blur-sm shadow-lg border-b border-gray-200">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-3 rounded-2xl shadow-lg">
              <Dumbbell className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Ici Ca Pousse
              </h1>
              <p className="text-sm text-gray-600 font-medium">
                {workoutCount} séance{workoutCount !== 1 ? 's' : ''} effectuée{workoutCount !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          {/* Le bouton Données locales a été supprimé */}
        </div>
      </div>
    </header>
  );
};

export default Header; 