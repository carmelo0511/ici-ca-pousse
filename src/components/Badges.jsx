import React, { useState, useEffect } from 'react';
import Card from './Card';
import { Trophy, Lock, TrendingUp } from 'lucide-react';
import Toast from './Toast';
import { 
  badges, 
  calculateBadgeStats, 
  getUnlockedBadges, 
  getLockedBadges, 
  getBadgeProgress 
} from '../utils/badges';

const Badges = ({ workouts, challenges, friends }) => {
  const [stats, setStats] = useState(null);
  const [unlockedBadges, setUnlockedBadges] = useState([]);
  const [lockedBadges, setLockedBadges] = useState([]);
  const [showLocked, setShowLocked] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const badgeStats = calculateBadgeStats(workouts, challenges, friends);
    const newUnlockedBadges = getUnlockedBadges(badgeStats);
    const newLockedBadges = getLockedBadges(badgeStats);
    
    // Vérifier s'il y a de nouveaux badges débloqués
    if (unlockedBadges.length > 0 && newUnlockedBadges.length > unlockedBadges.length) {
      const newBadges = newUnlockedBadges.filter(badge => 
        !unlockedBadges.find(existing => existing.id === badge.id)
      );
      if (newBadges.length > 0) {
        setToast({ 
          message: `🎉 Nouveau badge débloqué : ${newBadges[0].name} !`, 
          type: 'success' 
        });
      }
    }
    
    setStats(badgeStats);
    setUnlockedBadges(newUnlockedBadges);
    setLockedBadges(newLockedBadges);
  }, [workouts, challenges, friends, unlockedBadges]);

  if (!stats) {
    return (
      <div className="p-4">
        <div className="text-center py-8">
          <div className="text-4xl mb-4">🏆</div>
          <h3 className="text-lg font-semibold mb-2">Chargement des badges...</h3>
        </div>
      </div>
    );
  }

  const renderBadge = (badge, isUnlocked = true) => {
    const progress = getBadgeProgress(badge.id, stats);
    
    return (
      <Card key={badge.id} className={`relative overflow-hidden ${!isUnlocked ? 'opacity-60' : ''}`}>
        <div className="flex items-center space-x-4">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl ${badge.color} ${!isUnlocked ? 'bg-gray-400' : ''}`}>
            {isUnlocked ? badge.icon : <Lock className="w-8 h-8 text-white" />}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{badge.name}</h3>
            <p className="text-sm text-gray-600 mb-2">{badge.description}</p>
            {!isUnlocked && progress > 0 && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Progrès</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
          {isUnlocked && (
            <div className="text-green-500">
              <Trophy className="w-6 h-6" />
            </div>
          )}
        </div>
      </Card>
    );
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Badges</h1>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">
            {unlockedBadges.length}/{Object.keys(badges).length} débloqués
          </span>
        </div>
      </div>

      {/* Statistiques des badges */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{unlockedBadges.length}</div>
            <div className="text-sm text-gray-600">Débloqués</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{lockedBadges.length}</div>
            <div className="text-sm text-gray-600">À débloquer</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {Math.round((unlockedBadges.length / Object.keys(badges).length) * 100)}%
            </div>
            <div className="text-sm text-gray-600">Complétion</div>
          </div>
        </Card>
      </div>

      {/* Onglets */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setShowLocked(false)}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
            !showLocked
              ? 'bg-white text-indigo-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <div className="flex items-center justify-center space-x-2">
            <Trophy className="h-4 w-4" />
            <span>Débloqués ({unlockedBadges.length})</span>
          </div>
        </button>
        <button
          onClick={() => setShowLocked(true)}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
            showLocked
              ? 'bg-white text-indigo-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <div className="flex items-center justify-center space-x-2">
            <Lock className="h-4 w-4" />
            <span>À débloquer ({lockedBadges.length})</span>
          </div>
        </button>
      </div>

      {/* Liste des badges */}
      {!showLocked ? (
        unlockedBadges.length > 0 ? (
          <div className="space-y-4">
            {unlockedBadges.map(badge => renderBadge(badge, true))}
          </div>
        ) : (
          <Card>
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-lg font-semibold mb-2">Aucun badge débloqué</h3>
              <p className="text-gray-600 mb-4">Commence à t'entraîner pour débloquer tes premiers badges !</p>
              <div className="text-sm text-gray-500">
                <TrendingUp className="w-4 h-4 inline mr-1" />
                Voir les badges à débloquer
              </div>
            </div>
          </Card>
        )
      ) : (
        <div className="space-y-4">
          {lockedBadges.map(badge => renderBadge(badge, false))}
        </div>
      )}

      {/* Conseils pour débloquer plus de badges */}
      {showLocked && lockedBadges.length > 0 && (
        <Card className="mt-6">
          <h3 className="font-semibold mb-3">💡 Conseils pour débloquer plus de badges</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <div>• Complète des séances régulièrement pour débloquer "Premier Pas" et "Régularité"</div>
            <div>• Crée des défis avec tes amis pour débloquer "Défieur Débutant"</div>
            <div>• Ajoute des amis pour débloquer "Papillon Social"</div>
            <div>• Entraîne-toi tôt le matin ou tard le soir pour des badges spéciaux</div>
          </div>
        </Card>
      )}

      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
    </div>
  );
};

export default Badges; 