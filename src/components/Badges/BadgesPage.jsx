import React, { useState, useEffect, useRef } from 'react';
import Card from '../Card';
import { Trophy, Lock, TrendingUp, Gift, Clock } from 'lucide-react';
import Toast from '../Toast';
import { useBadges } from '../../hooks/useBadges';
import { useWeeklyBadgeUnlock } from '../../hooks/useWeeklyBadgeUnlock';
import { BADGE_CONFIG } from './Badges';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../utils/firebase/index.js';
import { useAppState } from '../../hooks';

const BadgesPage = ({
  workouts,
  challenges,
  friends,
  user,
  addBadgeUnlockXP,
}) => {
  const { showToastMsg } = useAppState();
  const [showLocked, setShowLocked] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [selectedBadgeToUnlock, setSelectedBadgeToUnlock] = useState(null);
  const [toast, setToast] = useState(null);
  const { badges, badgeCount, selectedBadge } = useBadges(
    workouts,
    challenges,
    user,
    addBadgeUnlockXP
  );
  const {
    loading: unlockLoading,
    canUnlock,
    unlockBadge,
    getTimeUntilNextUnlock,
  } = useWeeklyBadgeUnlock(user);

  // Tous les badges disponibles
  const allBadges = Object.keys(BADGE_CONFIG).map((type) => ({
    id: type,
    ...BADGE_CONFIG[type],
  }));

  // Badges débloqués et verrouillés
  const unlockedBadges = allBadges.filter((badge) => badges.includes(badge.id));
  const lockedBadges = allBadges.filter((badge) => !badges.includes(badge.id));

  // Vérifier s'il y a de nouveaux badges débloqués
  const lastBadgeRef = useRef(null);
  useEffect(() => {
    if (badgeCount > 0 && unlockedBadges.length > 0) {
      const newBadge = unlockedBadges[unlockedBadges.length - 1];
      if (lastBadgeRef.current !== newBadge.id) {
        showToastMsg(
          `🎉 Nouveau badge débloqué : ${newBadge.name} !`,
          'success'
        );
        lastBadgeRef.current = newBadge.id;
      }
    }
  }, [badgeCount, unlockedBadges, showToastMsg]);

  // Notification quand on peut débloquer un badge hebdomadaire
  useEffect(() => {
    if (canUnlock && !unlockLoading) {
      setToast({
        message: `🎁 Tu peux débloquer un badge de ton choix cette semaine !`,
        type: 'success',
      });

      // Auto-dismiss après 5 secondes
      const timer = setTimeout(() => {
        setToast(null);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [canUnlock, unlockLoading]);

  const handleBadgeSelect = async (badgeId) => {
    try {
      // Mettre à jour le badge sélectionné dans Firebase
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        selectedBadge: badgeId,
      });

      if (badgeId) {
        setToast({
          message: `Badge "${BADGE_CONFIG[badgeId]?.name}" sélectionné comme photo de profil !`,
          type: 'success',
        });
      } else {
        setToast({
          message: 'Badge retiré du profil',
          type: 'success',
        });
      }
    } catch (error) {
      console.error('Erreur lors de la sélection du badge:', error);
      setToast({
        message: 'Erreur lors de la sélection du badge',
        type: 'error',
      });
    }
  };

  const handleWeeklyUnlock = async () => {
    if (!selectedBadgeToUnlock) return;

    try {
      await unlockBadge(selectedBadgeToUnlock);
      setToast({
        message: `🎉 Badge "${BADGE_CONFIG[selectedBadgeToUnlock]?.name}" débloqué avec succès !`,
        type: 'success',
      });
      setShowUnlockModal(false);
      setSelectedBadgeToUnlock(null);

      // Forcer le rafraîchissement des badges après un délai
      setTimeout(() => {
        // Déclencher un événement personnalisé pour rafraîchir les badges
        window.dispatchEvent(new CustomEvent('refreshBadges'));
      }, 1500);
    } catch (error) {
      setToast({
        message: 'Erreur lors du déblocage du badge',
        type: 'error',
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
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl ${badge.color} ${!isUnlocked ? 'bg-gray-400' : ''}`}
          >
            {isUnlocked ? badge.icon : <Lock className="w-8 h-8 text-white" />}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{badge.name}</h3>
            <p className="text-sm text-gray-600 mb-2">{badge.description}</p>
            {isSelected && (
              <div className="text-indigo-600 text-sm font-medium">
                ✓ Photo de profil active
              </div>
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
    <div className="p-4 w-full min-h-screen h-auto">
      {/* En-tête */}
      <div className="pt-6 mb-6 pl-6">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
          Badges
        </h2>
        <p className="text-gray-600 mt-1">
          Débloquez des récompenses en progressant
        </p>
      </div>

      <div className="flex justify-between items-center mb-6">
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
            <div className="text-2xl font-bold text-green-600">
              {unlockedBadges.length}
            </div>
            <div className="text-sm text-gray-600">Débloqués</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {lockedBadges.length}
            </div>
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

      {/* Déblocage hebdomadaire */}
      <Card className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
              <Gift className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Déblocage hebdomadaire</h3>
              <p className="text-sm text-gray-600">
                Débloque un badge de ton choix une fois par semaine !
              </p>
            </div>
          </div>
          <div className="text-right">
            {canUnlock ? (
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowUnlockModal(true)}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all font-medium border border-white/20"
                  disabled={unlockLoading}
                >
                  {unlockLoading ? 'Chargement...' : 'Débloquer un badge'}
                </button>
              </div>
            ) : (
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1 text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    Prochain déblocage
                  </span>
                </div>
                {(() => {
                  const timeLeft = getTimeUntilNextUnlock();
                  return timeLeft ? (
                    <div className="text-xs text-gray-500 mt-1">
                      {timeLeft.days}j {timeLeft.hours}h
                    </div>
                  ) : (
                    <div className="text-xs text-gray-500 mt-1">
                      Bientôt disponible
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      </Card>

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
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium border border-gray-500"
          >
            Retirer le badge de profil
          </button>
        )}
      </div>

      {/* Liste des badges */}
      {!showLocked ? (
        unlockedBadges.length > 0 ? (
          <div className="space-y-4">
            {unlockedBadges.map((badge) => renderBadge(badge, true))}
          </div>
        ) : (
          <Card>
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-lg font-semibold mb-2">
                Aucun badge débloqué
              </h3>
              <p className="text-gray-600 mb-4">
                Commence à t'entraîner pour débloquer tes premiers badges !
              </p>
              <div className="text-sm text-gray-500">
                <TrendingUp className="w-4 h-4 inline mr-1" />
                Voir les badges à débloquer
              </div>
            </div>
          </Card>
        )
      ) : (
        <div className="space-y-4">
          {lockedBadges.map((badge) => renderBadge(badge, false))}
        </div>
      )}

      {/* Conseils pour débloquer plus de badges */}
      {showLocked && lockedBadges.length > 0 && (
        <Card className="mt-6">
          <h3 className="font-semibold mb-3">
            💡 Conseils pour débloquer plus de badges
          </h3>
          <div className="space-y-2 text-sm text-gray-600">
            <div>
              • Complète des séances régulièrement pour débloquer "Première
              séance" et "Régularité"
            </div>
            <div>
              • Crée des défis avec tes amis pour débloquer "Vainqueur de défi"
            </div>
            <div>
              • Souleve des poids lourds pour débloquer "Maître du poids"
            </div>
            <div>
              • Entraîne-toi 3 jours consécutifs pour débloquer "Série
              d'entraînement"
            </div>
          </div>
        </Card>
      )}

      {/* Modal de déblocage hebdomadaire */}
      {showUnlockModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  Débloquer un badge
                </h2>
                <button
                  onClick={() => setShowUnlockModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <p className="text-gray-600 mb-4">
                Choisis un badge à débloquer. Tu ne pourras plus en débloquer un
                autre avant 7 jours.
              </p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                {lockedBadges.map((badge) => (
                  <button
                    key={badge.id}
                    onClick={() => setSelectedBadgeToUnlock(badge.id)}
                    className={`p-3 border-2 rounded-lg text-center transition-all ${
                      selectedBadgeToUnlock === badge.id
                        ? 'border-yellow-500 bg-yellow-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-xl mx-auto mb-2 ${badge.color}`}
                    >
                      {badge.icon}
                    </div>
                    <div className="text-sm font-medium text-gray-800">
                      {badge.name}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {badge.description}
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowUnlockModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleWeeklyUnlock}
                  disabled={!selectedBadgeToUnlock || unlockLoading}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-white/20"
                >
                  {unlockLoading ? 'Déblocage...' : 'Débloquer le badge'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <Toast
          show={true}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default BadgesPage;
