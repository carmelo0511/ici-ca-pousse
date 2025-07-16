import React, { useState } from 'react';
import { useFriends } from '../hooks/useFriends';
import { useChallenges } from '../hooks/useChallenges';
import Card from './Card';
import GradientButton from './GradientButton';
import Modal from './Modal';
import Toast from './Toast';
import ChallengeStats from './ChallengeStats';
import { sendChallengeNotification } from '../utils/notifications';

const Challenges = ({ user }) => {
  const { friends } = useFriends(user);
  const { 
    challenges, 
    createChallenge, 
    getChallengeScore, 
    formatScore, 
    getChallengeStatus,
    getDetailedStats
  } = useChallenges(user);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [challengeType, setChallengeType] = useState('workouts');
  const [challengeDuration, setChallengeDuration] = useState(7);
  const [toast, setToast] = useState(null);

  // Types de défis disponibles
  const challengeTypes = [
    { id: 'workouts', label: 'Nombre de séances', icon: '💪' },
    { id: 'duration', label: 'Temps d\'entraînement', icon: '⏱️' },
    { id: 'streak', label: 'Série consécutive', icon: '🔥' },
    { id: 'calories', label: 'Calories brûlées', icon: '🔥' }
  ];

  // Durées disponibles
  const durations = [
    { value: 3, label: '3 jours' },
    { value: 7, label: '1 semaine' },
    { value: 14, label: '2 semaines' },
    { value: 30, label: '1 mois' }
  ];

  const handleCreateChallenge = async () => {
    if (!selectedFriend) {
      setToast({ message: 'Sélectionne un ami', type: 'error' });
      return;
    }

    const challengeData = {
      type: challengeType,
      duration: challengeDuration,
      friend: selectedFriend
    };

    const newChallenge = createChallenge(challengeData);
    
    // Envoyer une notification à l'ami
    try {
      await sendChallengeNotification(newChallenge, user, selectedFriend.uid);
      setToast({ message: 'Défi créé et notification envoyée !', type: 'success' });
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la notification:', error);
      setToast({ message: 'Défi créé mais erreur de notification', type: 'warning' });
    }
    
    setShowCreateModal(false);
    setSelectedFriend(null);
  };

  const getChallengeTypeLabel = (type) => {
    return challengeTypes.find(t => t.id === type)?.label || type;
  };

  const getChallengeIcon = (type) => {
    return challengeTypes.find(t => t.id === type)?.icon || '🏆';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'victory': return 'text-green-500';
      case 'defeat': return 'text-red-500';
      case 'tie': return 'text-yellow-500';
      default: return 'text-blue-500';
    }
  };

  // Calcul des statistiques
  const getChallengeStats = () => {
    const totalChallenges = challenges.length;
    const completedChallenges = challenges.filter(challenge => 
      new Date() > new Date(challenge.endDate)
    ).length;
    const activeChallenges = totalChallenges - completedChallenges;
    
    const victories = challenges.filter(challenge => {
      const status = getChallengeStatus(challenge);
      return status.status === 'victory';
    }).length;
    
    const winRate = totalChallenges > 0 ? Math.round((victories / totalChallenges) * 100) : 0;
    
    return {
      total: totalChallenges,
      active: activeChallenges,
      completed: completedChallenges,
      victories,
      winRate
    };
  };

  const stats = getChallengeStats();
  const detailedStats = getDetailedStats();

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Défis</h1>
        <GradientButton onClick={() => setShowCreateModal(true)}>
          Créer un défi
        </GradientButton>
      </div>

      {/* Statistiques des défis */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <div className="text-sm text-gray-600">En cours</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.completed}</div>
            <div className="text-sm text-gray-600">Terminés</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.victories}</div>
            <div className="text-sm text-gray-600">Victoires</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-600">{stats.winRate}%</div>
            <div className="text-sm text-gray-600">Taux de victoire</div>
          </div>
        </Card>
      </div>

      {/* Statistiques détaillées */}
      {challenges.length > 0 && (
        <div className="mb-6">
          <ChallengeStats stats={detailedStats} />
        </div>
      )}

      {challenges.length === 0 ? (
        <Card>
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🏆</div>
            <h3 className="text-lg font-semibold mb-2">Aucun défi en cours</h3>
            <p className="text-gray-600 mb-4">Crée ton premier défi avec un ami !</p>
            <GradientButton onClick={() => setShowCreateModal(true)}>
              Créer un défi
            </GradientButton>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {challenges.map(challenge => {
            const myScore = getChallengeScore(challenge);
            const status = getChallengeStatus(challenge);
            return (
              <Card key={challenge.id}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{getChallengeIcon(challenge.type)}</div>
                    <div>
                      <h3 className="font-semibold">Défi vs {challenge.friend.displayName || challenge.friend.email || 'Utilisateur'}</h3>
                      <p className="text-sm text-gray-600">
                        {getChallengeTypeLabel(challenge.type)} • {challenge.duration} jours
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold ${getStatusColor(status.status)}`}>
                      {status.text}
                    </div>
                    <div className="text-sm text-gray-600">
                      {formatScore(myScore, challenge.type)} vs {formatScore(challenge.friendScore || 0, challenge.type)}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal de création de défi */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)}>
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">Créer un nouveau défi</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Choisir un ami</label>
            {friends.length === 0 ? (
              <div className="p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500">
                Aucun ami trouvé. Ajoute des amis depuis l'onglet "Amis" d'abord !
              </div>
            ) : (
              <select 
                className="w-full p-3 border border-gray-300 rounded-lg"
                value={selectedFriend?.uid || ''}
                              onChange={(e) => {
                const friend = friends.find(f => f.uid === e.target.value);
                setSelectedFriend(friend);
              }}
              >
                <option value="">Sélectionner un ami</option>
                {friends.map(friend => (
                  <option key={friend.uid} value={friend.uid}>
                    {friend.displayName || friend.email || 'Utilisateur'}
                  </option>
                ))}
              </select>
            )}
            <div className="text-xs text-gray-500 mt-1">
              {friends.length} ami(s) trouvé(s)
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Type de défi</label>
            <div className="grid grid-cols-2 gap-2">
              {challengeTypes.map(type => (
                <button
                  key={type.id}
                  className={`p-3 border rounded-lg text-left ${
                    challengeType === type.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-300'
                  }`}
                  onClick={() => setChallengeType(type.id)}
                >
                  <div className="text-lg">{type.icon}</div>
                  <div className="text-sm font-medium">{type.label}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Durée du défi</label>
            <select 
              className="w-full p-3 border border-gray-300 rounded-lg"
              value={challengeDuration}
              onChange={(e) => setChallengeDuration(Number(e.target.value))}
            >
              {durations.map(duration => (
                <option key={duration.value} value={duration.value}>
                  {duration.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex space-x-3">
            <button
              className="flex-1 p-3 border border-gray-300 rounded-lg"
              onClick={() => setShowCreateModal(false)}
            >
              Annuler
            </button>
            <GradientButton onClick={handleCreateChallenge} className="flex-1">
              Créer le défi
            </GradientButton>
          </div>
        </div>
      </Modal>

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

export default Challenges; 