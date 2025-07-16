import React, { useState, useEffect } from 'react';
import Card from './Card';
import { Trophy, Lock, TrendingUp } from 'lucide-react';
import Toast from './Toast';
import { useBadges } from '../hooks/useBadges';
import { BADGE_CONFIG } from './Badges';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../utils/firebase';

const BadgesPage = ({ workouts, challenges, friends, user }) => {
  const [showLocked, setShowLocked] = useState(false);
  const [toast, setToast] = useState(null);
  const { badges, badgeCount, selectedBadge } = useBadges(workouts, challenges, user);

  // Tous les badges disponibles
  const allBadges = Object.keys(BADGE_CONFIG).map(type => ({
    id: type,
    ...BADGE_CONFIG[type]
  }));

  // Badges débloqués et verrouillés
  const unlockedBadges = allBadges.filter(badge => badges.includes(badge.id));
  const lockedBadges = allBadges.filter(badge => !badges.includes(badge.id));

  // Vérifier s'il y a de nouveaux badges débloqués
  useEffect(() => {
    if (badgeCount > 0 && unlockedBadges.length > 0) {
      const newBadge = unlockedBadges[unlockedBadges.length - 1];
      setToast({ 
        message: `🎉 Nouveau badge débloqué : ${newBadge.name} !`, 
        type: 'success' 
      });
    }
  }, [badgeCount, unlockedBadges]);

  const handleBadgeSelect = async (badgeId) => {
    try {
      // Mettre à jour le badge sélectionné dans Firebase
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        selectedBadge: badgeId
      });
      
      if (badgeId) {
        setToast({ 
          message: `Badge "${BADGE_CONFIG[badgeId]?.name}" sélectionné comme photo de profil !`, 
          type: 'success' 
        });
      } else {
        setToast({ 
          message: 'Badge retiré du profil', 
          type: 'success' 
        });
      }
    } catch (error) {
      console.error('Erreur lors de la sélection du badge:', error);
      setToast({ 
        message: 'Erreur lors de la sélection du badge', 
        type: 'error' 
      });
    }
  };

  const renderBadge = (badge, isUnlocked = true) => {
    const isSelected = selectedBadge === badge.id;
    
    return (
      <Card 
        key={badge.id} 
        className={`relative overflow-hidden ${!isUnlocked ? 'opacity-60' : ''} ${isSelected ? 'ring-2 ring-indigo-500' : ''}`}
        onClick={isUnlocked ? () => handleBadgeSelect(badge.id) : undefined}
      >
        <div className="flex items-center space-x-4">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl ${badge.color} ${!isUnlocked ? 'bg-gray-400' : ''}`}>
            {isUnlocked ? badge.icon : <Lock className="w-8 h-8 text-white" />}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{badge.name}</h3>
            <p className="text-sm text-gray-600 mb-2">{badge.description}</p>
            {isSelected && (
              <div className="text-indigo-600 text-sm font-medium">✓ Photo de profil active</div>
            )}
          </div>
          {isUnlocked && (
            <div className="flex items-center space-x-2">
              {isSelected ? (
                <div className="text-indigo-500">
                  <Trophy className="w-6 h-6" />
                </div>
              ) : (
                <div className="text-green-500">
                  <Trophy className="w-6 h-6" />
                </div>
              )}
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
            {unlockedBadges.length}/{allBadges.length} débloqués
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
              {Math.round((unlockedBadges.length / allBadges.length) * 100)}%
            </div>
            <div className="text-sm text-gray-600">Complétion</div>
          </div>
        </Card>
      </div>

      {/* Onglets et sélection de badge */}
      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mb-6">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg flex-1">
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
        
        {selectedBadge && (
          <button
            onClick={() => handleBadgeSelect(null)}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
          >
            Retirer le badge de profil
          </button>
        )}
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
            <div>• Complète des séances régulièrement pour débloquer "Première séance" et "Régularité"</div>
            <div>• Crée des défis avec tes amis pour débloquer "Vainqueur de défi"</div>
            <div>• Souleve des poids lourds pour débloquer "Maître du poids"</div>
            <div>• Entraîne-toi 3 jours consécutifs pour débloquer "Série d'entraînement"</div>
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

export default BadgesPage; 