import React from 'react';
import { useBadges } from '../../hooks/useBadges';
import { BADGE_CONFIG } from '../Badges/Badges';
import ProfilePicture from './ProfilePicture';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../../utils/firebase/index.js';
import { Target, TrendingDown, Zap, Heart, Dumbbell } from 'lucide-react';

const ProfilePage = ({
  user,
  workouts = [],
  challenges = [],
  onUserUpdate,
  addBadgeUnlockXP,
  refreshUserProfile,
}) => {
  const { badges, selectedBadge } = useBadges(
    workouts,
    challenges,
    user,
    addBadgeUnlockXP
  );
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [localSelectedBadge, setLocalSelectedBadge] =
    React.useState(selectedBadge);
  const [successMessage, setSuccessMessage] = React.useState('');
  // Nouveaux états pour taille et poids
  const [height, setHeight] = React.useState(user.height || '');
  const [weight, setWeight] = React.useState(user.weight || '');
  // Ajout du surnom
  const [nickname, setNickname] = React.useState(user.nickname || '');
  // Suppression de currentGoal - Utiliser uniquement user.goal

  // Mettre à jour l'état local quand selectedBadge change
  React.useEffect(() => {
    setLocalSelectedBadge(selectedBadge);
  }, [selectedBadge]);

  // Initialiser les valeurs avec les données utilisateur
  React.useEffect(() => {
    if (user) {
      setHeight(user.height || '');
      setWeight(user.weight || '');
      setNickname(user.nickname || '');
      // currentGoal supprimé - utiliser uniquement user.goal
    }
  }, [user]);

  const handleBadgeSelect = async (badgeId) => {
    setLoading(true);
    setError('');
    setSuccessMessage('');
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { selectedBadge: badgeId });
      setLocalSelectedBadge(badgeId);
      if (onUserUpdate) {
        onUserUpdate({ ...user, selectedBadge: badgeId });
      }
      if (badgeId) {
        setSuccessMessage(
          `Badge "${BADGE_CONFIG[badgeId]?.name}" sélectionné !`
        );
      } else {
        setSuccessMessage('Badge retiré du profil');
      }
      setTimeout(() => setSuccessMessage(''), 3000);
      if (refreshUserProfile) {
        await refreshUserProfile();
      }
    } catch (e) {
      console.error('Erreur lors de la sélection du badge:', e);
      setError('Erreur lors de la sélection du badge');
    } finally {
      setLoading(false);
    }
  };

  // Sauvegarde taille, poids et surnom
  const handleSavePhysical = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');
    if (nickname.length > 10) {
      setError('Le surnom doit faire 10 caractères maximum.');
      setLoading(false);
      return;
    }
    try {
      const userRef = doc(db, 'users', user.uid);
      // Récupérer l'historique actuel
      const userSnap = await getDoc(userRef);
      let weightHistory =
        userSnap.exists() && userSnap.data().weightHistory
          ? userSnap.data().weightHistory
          : [];
      // Date de la semaine courante (lundi)
      const now = new Date();
      const dayOfWeek = now.getDay(); // 0 = dimanche, 1 = lundi, ..., 6 = samedi
      const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Si dimanche, on remonte de 6 jours
      const monday = new Date(now);
      monday.setDate(now.getDate() + daysToMonday);
      monday.setHours(0, 0, 0, 0);
      const weekKey = monday.toISOString().slice(0, 10);
      // Vérifier la dernière entrée
      const last =
        weightHistory.length > 0
          ? weightHistory[weightHistory.length - 1]
          : null;
      // Ajouter une entrée seulement si la semaine ou la valeur a changé
      if (!last || last.weekKey !== weekKey || last.value !== weight) {
        weightHistory = [...weightHistory, { weekKey, value: weight }];
      }
      await updateDoc(userRef, {
        height,
        weight,
        weightHistory,
        nickname,
        goal: user.goal,
      });
      setSuccessMessage('Profil mis à jour !');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (e) {
      setError('Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  // Sauvegarde de l'objectif
  const handleSaveGoal = React.useCallback(
    async (selectedGoal) => {
      setLoading(true);
      setError('');
      setSuccessMessage('');

      // Mise à jour directe dans la base de données

      try {
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, { goal: selectedGoal });

        // Rafraîchir l'objet user pour que l'objectif soit visible immédiatement
        if (refreshUserProfile) {
          await refreshUserProfile();
        }

        setSuccessMessage('Objectif mis à jour !');
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (e) {
        console.error('Error saving goal:', e);
        setError("Erreur lors de la sauvegarde de l'objectif");
      } finally {
        setLoading(false);
      }
    },
    [user, refreshUserProfile]
  );

  return (
    <div className="space-y-6">
      <div className="pt-6 mb-6 pl-6">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
          Mon Profil
        </h2>
        <p className="text-gray-600 mt-1">
          Gérez vos informations personnelles
        </p>
      </div>

      {/* Section profil utilisateur */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col items-center mb-6">
          <ProfilePicture
            user={user}
            size="xl"
            useBadgeAsProfile={!!localSelectedBadge}
            selectedBadge={localSelectedBadge}
          />
          <div className="mt-2 text-lg font-semibold">
            {user.displayName || user.email}
          </div>
          {user.nickname && (
            <div className="text-gray-700 text-sm font-bold mt-1">
              {user.nickname}
            </div>
          )}
          <div className="text-sm text-gray-500">{user.email}</div>
          {/* Affichage taille/poids et objectif */}
          <div className="mt-2 text-sm text-gray-700 flex flex-col items-center">
            {user.height && (
              <div>
                Taille : <span className="font-semibold">{user.height} cm</span>
              </div>
            )}
            {user.weight && (
              <div>
                Poids : <span className="font-semibold">{user.weight} kg</span>
              </div>
            )}
            {user.goal && (
              <div className="text-gray-700 flex items-center mt-1">
                <Target className="h-4 w-4 mr-1" />
                <span className="font-semibold">{user.goal}</span>
              </div>
            )}
          </div>
        </div>

        {/* Formulaire taille/poids et surnom */}
        <form
          onSubmit={handleSavePhysical}
          className="mb-4 flex flex-col gap-4 items-center"
        >
          <div className="flex gap-4 flex-wrap justify-center">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Taille (cm)
              </label>
              <input
                type="number"
                min="0"
                max="300"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 w-24 text-center focus:ring-2 focus:ring-gray-400 focus:border-gray-500"
                placeholder="ex: 175"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Poids (kg)
              </label>
              <input
                type="number"
                min="0"
                max="500"
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 w-24 text-center focus:ring-2 focus:ring-gray-400 focus:border-gray-500"
                placeholder="ex: 70.5"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Surnom (max 10)
              </label>
              <input
                type="text"
                maxLength={10}
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 w-28 text-center focus:ring-2 focus:ring-gray-400 focus:border-gray-500"
                placeholder="Surnom"
                disabled={loading}
              />
            </div>
          </div>
          <button
            type="submit"
            className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </form>

        {error && (
          <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="text-green-600 text-sm text-center bg-green-50 p-3 rounded-lg">
            {successMessage}
          </div>
        )}
      </div>

      {/* Section Objectifs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="font-semibold text-lg mb-4 text-center">
          Définir mon objectif
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => handleSaveGoal('Perte de poids')}
            className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all ${
              user.goal === 'Perte de poids'
                ? 'border-gray-600 bg-gray-50'
                : 'border-gray-200 bg-white hover:border-gray-400'
            }`}
            disabled={loading}
          >
            <TrendingDown className="h-6 w-6 text-red-500" />
            <div className="text-left">
              <div className="font-semibold text-gray-800">Perte de poids</div>
              <div className="text-sm text-gray-600">Brûler des calories</div>
            </div>
          </button>

          <button
            onClick={() => handleSaveGoal('Prise de masse')}
            className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all ${
              user.goal === 'Prise de masse'
                ? 'border-gray-600 bg-gray-50'
                : 'border-gray-200 bg-white hover:border-gray-400'
            }`}
            disabled={loading}
          >
            <Dumbbell className="h-6 w-6 text-gray-700" />
            <div className="text-left">
              <div className="font-semibold text-gray-800">Prise de masse</div>
              <div className="text-sm text-gray-600">Développer la force</div>
            </div>
          </button>

          <button
            onClick={() => handleSaveGoal('Endurance')}
            className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all ${
              user.goal === 'Endurance'
                ? 'border-gray-600 bg-gray-50'
                : 'border-gray-200 bg-white hover:border-gray-400'
            }`}
            disabled={loading}
          >
            <Heart className="h-6 w-6 text-green-500" />
            <div className="text-left">
              <div className="font-semibold text-gray-800">Endurance</div>
              <div className="text-sm text-gray-600">Améliorer le cardio</div>
            </div>
          </button>

          <button
            onClick={() => handleSaveGoal('Performance')}
            className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all ${
              user.goal === 'Performance'
                ? 'border-gray-600 bg-gray-50'
                : 'border-gray-200 bg-white hover:border-gray-400'
            }`}
            disabled={loading}
          >
            <Zap className="h-6 w-6 text-yellow-500" />
            <div className="text-left">
              <div className="font-semibold text-gray-800">Performance</div>
              <div className="text-sm text-gray-600">
                Optimiser les performances
              </div>
            </div>
          </button>
        </div>

        {user.goal && (
          <button
            onClick={() => handleSaveGoal('')}
            className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium w-full"
            disabled={loading}
          >
            Retirer l'objectif
          </button>
        )}
      </div>

      {/* Section badges */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="font-semibold text-lg mb-4 text-center">
          Choisir un badge comme avatar
        </h3>
        {badges.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">🔒</div>
            <p>Aucun badge débloqué pour l'instant</p>
            <p className="text-sm">
              Commence à t'entraîner pour débloquer des badges !
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 max-h-96 overflow-y-auto">
            {badges.map((badge) => (
              <button
                key={badge}
                onClick={() => handleBadgeSelect(badge)}
                className={`flex flex-col items-center p-3 rounded-lg border-2 transition-all ${
                  localSelectedBadge === badge
                    ? 'border-gray-600 bg-gray-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-gray-400 hover:shadow-sm'
                }`}
                disabled={loading}
              >
                <div
                  className={`
                  w-12 h-12 rounded-full flex items-center justify-center text-2xl ${BADGE_CONFIG[badge].color}`}
                >
                  {BADGE_CONFIG[badge].icon}
                </div>
                <span className="text-xs text-gray-700 text-center mt-2">
                  {BADGE_CONFIG[badge].name}
                </span>
                {localSelectedBadge === badge && (
                  <span className="text-gray-700 text-xs mt-1 font-medium">
                    ✓ Sélectionné
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {badges.length > 0 && (
          <button
            onClick={() => handleBadgeSelect(null)}
            className="mt-6 px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium w-full"
            disabled={loading}
          >
            Retirer le badge de profil
          </button>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
