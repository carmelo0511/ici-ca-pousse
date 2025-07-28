import React, { useState } from 'react';
import { useFriends } from '../hooks/useFriends';
import { useChallenges } from '../hooks/useChallenges';
import Card from './Card';
import GradientButton from './GradientButton';
import Modal from './Workout/Modal';
import Toast from './Toast';
import { createNotification, NOTIFICATION_TYPES } from '../utils/notifications';
import { useNotifications } from '../hooks/useNotifications';

const Challenges = ({ user }) => {
  const { friends } = useFriends(user);
  const { notifications, markAsRead } = useNotifications(user);
  const { 
    challenges, 
    createChallenge, 
    getChallengeScore, 
    formatScore, 
    getChallengeStatus,
    getSentChallenges,
    getReceivedChallenges,
    getActiveChallenges,
    getCompletedChallenges,
    acceptChallenge,
    declineChallenge,
    cancelChallenge,
    deleteChallenge,
    challengeTypes,
    challengeDurations,
    challengeTargets,
    challengeRewards,
    calculateChallengeLevel,
    getNextLevel
  } = useChallenges(user);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [challengeType, setChallengeType] = useState('workouts');
  const [challengeDuration, setChallengeDuration] = useState(7);
  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'sent', 'received' ou 'completed'
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [hiddenChallenges, setHiddenChallenges] = useState(new Set());

  const handleCreateChallenge = async () => {
    if (!selectedFriend) {
      setToast({ message: 'Sélectionne un ami', type: 'error' });
      return;
    }
    
    if (!selectedTarget) {
      setToast({ message: 'Sélectionne un objectif', type: 'error' });
      return;
    }

    try {
      const challengeData = {
        type: challengeType,
        duration: challengeDuration,
        target: selectedTarget,
        friend: selectedFriend
      };

      const newChallenge = await createChallenge(challengeData);
      
      // Envoyer une notification à l'ami
      try {
        await createNotification(selectedFriend.uid, {
          type: NOTIFICATION_TYPES.CHALLENGE_INVITE,
          title: 'Nouveau défi !',
          message: `${user.displayName || user.email} t'a envoyé un défi de ${getChallengeTypeLabel(challengeType)} !`,
          challengeId: newChallenge.id
        });
        setToast({ message: 'Défi créé et notification envoyée !', type: 'success' });
      } catch (error) {
        console.error('Erreur lors de l\'envoi de la notification:', error);
        setToast({ message: 'Défi créé mais erreur de notification', type: 'warning' });
      }
      
      setShowCreateModal(false);
      setSelectedFriend(null);
    } catch (error) {
      console.error('Erreur lors de la création du défi:', error);
      setToast({ message: 'Erreur lors de la création du défi', type: 'error' });
    }
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
    
    // Calculer les vraies victoires en vérifiant les scores
    const victories = challenges.filter(challenge => {
      if (challenge.status !== 'completed') return false;
      
      const myScore = getChallengeScore(challenge);
      const friendScore = getFriendScore(challenge);
      return myScore > friendScore;
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
  const sentChallenges = getSentChallenges();
  const receivedChallenges = getReceivedChallenges();

  // Handlers pour les actions sur les défis
  const handleAcceptChallenge = async (challengeId) => {
    try {
      await acceptChallenge(challengeId);
      
      // Notifier le créateur du défi
      const challenge = challenges.find(c => c.id === challengeId);
      if (challenge && challenge.senderId) {
        await createNotification(challenge.senderId, {
          type: NOTIFICATION_TYPES.CHALLENGE_UPDATE,
          title: 'Défi accepté !',
          message: `${user.displayName || user.email} a accepté ton défi de ${getChallengeTypeLabel(challenge.type)} !`,
          challengeId: challenge.id
        });
      }
      
      setToast({ message: 'Défi accepté !', type: 'success' });
    } catch (error) {
      setToast({ message: 'Erreur lors de l\'acceptation', type: 'error' });
    }
  };

  const handleDeclineChallenge = async (challengeId) => {
    try {
      await declineChallenge(challengeId);
      
      // Notifier le créateur du défi
      const challenge = challenges.find(c => c.id === challengeId);
      if (challenge && challenge.senderId) {
        await createNotification(challenge.senderId, {
          type: NOTIFICATION_TYPES.CHALLENGE_UPDATE,
          title: 'Défi refusé',
          message: `${user.displayName || user.email} a refusé ton défi de ${getChallengeTypeLabel(challenge.type)}.`,
          challengeId: challenge.id
        });
      }
      
      setToast({ message: 'Défi refusé', type: 'info' });
    } catch (error) {
      setToast({ message: 'Erreur lors du refus', type: 'error' });
    }
  };

  const handleCancelChallenge = async (challengeId) => {
    try {
      await cancelChallenge(challengeId);
      
      // Notifier le destinataire du défi
      const challenge = challenges.find(c => c.id === challengeId);
      if (challenge && challenge.receiverId) {
        await createNotification(challenge.receiverId, {
          type: NOTIFICATION_TYPES.CHALLENGE_UPDATE,
          title: 'Défi annulé',
          message: `${user.displayName || user.email} a annulé le défi de ${getChallengeTypeLabel(challenge.type)}.`,
          challengeId: challenge.id
        });
      }
      
      setToast({ message: 'Défi annulé', type: 'info' });
    } catch (error) {
      setToast({ message: 'Erreur lors de l\'annulation', type: 'error' });
    }
  };

  const handleDeleteChallenge = async (challengeId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer définitivement ce défi ?')) {
      try {
        deleteChallenge(challengeId);
        setToast({ message: 'Défi supprimé', type: 'success' });
      } catch (error) {
        setToast({ message: 'Erreur lors de la suppression', type: 'error' });
      }
    }
  };

  const handleHideChallenge = (challengeId) => {
    setHiddenChallenges(prev => new Set([...prev, challengeId]));
    setToast({ message: 'Défi masqué de la vue active', type: 'success' });
  };

  const handleShowChallenge = (challengeId) => {
    setHiddenChallenges(prev => {
      const newSet = new Set(prev);
      newSet.delete(challengeId);
      return newSet;
    });
    setToast({ message: 'Défi affiché à nouveau', type: 'success' });
  };

  // Fonction pour calculer le score de l'ami
  const getFriendScore = (challenge) => {
    const isSentByMe = challenge.senderId === user?.uid;
    return isSentByMe ? (challenge.friendScore || 0) : (challenge.myScore || 0);
  };

  // Fonction pour afficher les récompenses d'un défi
  const renderChallengeRewards = (challenge) => {
    if (!challenge.target) return null;
    
    const myScore = getChallengeScore(challenge);
    const achievedLevel = calculateChallengeLevel(myScore, challenge.type, challenge.target);
    const nextLevel = getNextLevel(myScore, challenge.type);
    
    if (achievedLevel) {
      const reward = challengeRewards[achievedLevel];
      return (
        <div className="flex items-center space-x-2 mt-2">
          <span className="text-lg">{reward.badge}</span>
          <span className="text-sm text-green-600 font-medium">+{reward.xp} XP</span>
          <span className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded">
            {reward.name}
          </span>
        </div>
      );
    } else if (nextLevel) {
      return (
        <div className="flex items-center space-x-2 mt-2">
          <span className="text-sm text-gray-500">
            Prochain: {nextLevel.reward.badge} {nextLevel.reward.name}
          </span>
          <span className="text-xs text-gray-400">
            ({nextLevel.remaining} restant)
          </span>
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className="p-4 w-full min-h-screen h-auto">
      {/* En-tête */}
      <div className="pt-6 mb-6 pl-6">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Défis</h2>
        <p className="text-gray-600 mt-1">Affrontez vos amis dans des défis sportifs</p>
      </div>
      
      <div className="flex justify-between items-center mb-6">
        <GradientButton onClick={() => setShowCreateModal(true)}>
          Créer un défi
        </GradientButton>
      </div>

      {/* Onglets */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('all')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
            activeTab === 'all'
              ? 'bg-white text-indigo-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Actifs ({getActiveChallenges().length})
        </button>
        <button
          onClick={() => setActiveTab('sent')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
            activeTab === 'sent'
              ? 'bg-white text-indigo-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Envoyés ({sentChallenges.length})
        </button>
        <button
          onClick={() => setActiveTab('received')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
            activeTab === 'received'
              ? 'bg-white text-indigo-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Reçus ({receivedChallenges.length})
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
            activeTab === 'completed'
              ? 'bg-white text-indigo-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Terminés ({getCompletedChallenges().length})
        </button>
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

      {/* Notifications de défis */}
      {notifications.filter(n => n.type === 'challenge_invite' && !n.read).length > 0 && (
        <Card className="mb-6 border-l-4 border-l-yellow-500 bg-yellow-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">⚡</div>
              <div>
                <h3 className="font-semibold text-gray-900">Nouveaux défis !</h3>
                <p className="text-sm text-gray-600">
                  Tu as {notifications.filter(n => n.type === 'challenge_invite' && !n.read).length} défi(s) en attente
                </p>
              </div>
            </div>
            <button
              onClick={() => notifications.filter(n => n.type === 'challenge_invite' && !n.read).forEach(n => markAsRead(n.id))}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Marquer comme lu
            </button>
          </div>
        </Card>
      )}

      {/* Statistiques détaillées */}
      {/* Temporairement désactivé - ChallengeStats stats={stats} /> */}

      {/* Onglet Actifs */}
      {activeTab === 'all' && (() => {
        const activeChallenges = getActiveChallenges().filter(challenge => !hiddenChallenges.has(challenge.id));
        
        if (activeChallenges.length === 0) {
          return (
            <Card>
              <div className="text-center py-8">
                <div className="text-4xl mb-4">🏆</div>
                <h3 className="text-lg font-semibold mb-2">Aucun défi actif</h3>
                <p className="text-gray-600 mb-4">Crée ton premier défi ou attends d'en recevoir un !</p>
              </div>
            </Card>
          );
        }
        
        return (
          <div className="space-y-4">
            {activeChallenges.map(challenge => {
              const myScore = getChallengeScore(challenge);
              const status = getChallengeStatus(challenge);
              const isSentByMe = challenge.senderId === user?.uid;
              const isPending = challenge.status === 'pending';
              const isStreakChallenge = challenge.type === 'streak';
              const startDate = challenge.startDate ? new Date(challenge.startDate) : null;
              const endDate = challenge.endDate ? new Date(challenge.endDate) : null;
              return (
                <Card key={challenge.id}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{getChallengeIcon(challenge.type)}</div>
                      <div>
                        <h3 className="font-semibold">
                          {isSentByMe 
                            ? `Défi vs ${challenge.receiverName || 'Utilisateur'}`
                            : `Défi de ${challenge.senderName || 'Un ami'}`
                          }
                        </h3>
                        <p className="text-sm text-gray-600">
                          {getChallengeTypeLabel(challenge.type)} • {challenge.duration} jours
                        </p>
                        <p className="text-xs text-gray-500">
                          {isSentByMe ? 'Envoyé par toi' : 'Reçu de ' + (challenge.senderName || 'un ami')} • Statut: {challenge.status || 'en attente'}
                        </p>
                        {isStreakChallenge && startDate && endDate && (
                          <p className="text-xs text-indigo-500 mt-1">
                            Période du défi : {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
                          </p>
                        )}
                        {renderChallengeRewards(challenge)}
                      </div>
                    </div>
                    <div className="text-right">
                      {isPending && !isSentByMe ? (
                        <div className="flex flex-col space-y-2">
                          <div className="text-sm text-gray-600">En attente de réponse</div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleAcceptChallenge(challenge.id)}
                              className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors shadow-sm"
                            >
                              Accepter
                            </button>
                            <button
                              onClick={() => handleDeclineChallenge(challenge.id)}
                              className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors shadow-sm"
                            >
                              Refuser
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className={`font-bold ${getStatusColor(status.status)}`}>
                            {status.text}
                          </div>
                          <div className="text-sm text-gray-600">
                            {formatScore(myScore, challenge.type)} vs {formatScore(getFriendScore(challenge), challenge.type)}
                          </div>
                          {isStreakChallenge && myScore === 0 && (
                            <div className="text-xs text-red-500 mt-1">Aucune série consécutive pendant la période du défi.</div>
                          )}
                          {isPending && isSentByMe && (
                            <button
                              onClick={() => handleCancelChallenge(challenge.id)}
                              className="mt-2 text-xs text-red-600 hover:text-red-800"
                            >
                              Annuler le défi
                            </button>
                          )}
                          {isSentByMe && (
                            <div className="flex flex-col space-y-1 mt-2">
                              <button
                                onClick={() => handleHideChallenge(challenge.id)}
                                className="text-xs text-gray-600 hover:text-gray-800"
                              >
                                Masquer de la vue active
                              </button>
                              <button
                                onClick={() => handleDeleteChallenge(challenge.id)}
                                className="text-xs text-red-600 hover:text-red-800"
                              >
                                Supprimer définitivement
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        );
      })()}

      {/* Onglet Envoyés */}
      {activeTab === 'sent' && (
        sentChallenges.length === 0 ? (
          <Card>
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🏆</div>
              <h3 className="text-lg font-semibold mb-2">Aucun défi envoyé</h3>
              <p className="text-gray-600 mb-4">Crée ton premier défi avec un ami !</p>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {sentChallenges.map(challenge => {
              const myScore = getChallengeScore(challenge);
              const status = getChallengeStatus(challenge);
              return (
                <Card key={challenge.id}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{getChallengeIcon(challenge.type)}</div>
                      <div>
                        <h3 className="font-semibold">Défi vs {challenge.receiverName || 'Utilisateur'}</h3>
                        <p className="text-sm text-gray-600">
                          {getChallengeTypeLabel(challenge.type)} • {challenge.duration} jours
                        </p>
                        <p className="text-xs text-gray-500">
                          Statut: {challenge.status || 'en attente'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-bold ${getStatusColor(status.status)}`}>
                        {status.text}
                      </div>
                      <div className="text-sm text-gray-600">
                        {formatScore(myScore, challenge.type)} vs {formatScore(getFriendScore(challenge), challenge.type)}
                      </div>
                      {challenge.status === 'pending' && (
                        <button
                          onClick={() => handleCancelChallenge(challenge.id)}
                          className="mt-2 text-xs text-red-600 hover:text-red-800"
                        >
                          Annuler le défi
                        </button>
                      )}
                      {challenge.status === 'pending' && (
                        <button
                          onClick={() => handleDeleteChallenge(challenge.id)}
                          className="mt-2 text-xs text-red-600 hover:text-red-800"
                        >
                          Supprimer le défi
                        </button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )
      )}

      {/* Onglet Reçus */}
      {activeTab === 'received' && (
        receivedChallenges.length === 0 ? (
          <Card>
            <div className="text-center py-8">
              <div className="text-4xl mb-4">📨</div>
              <h3 className="text-lg font-semibold mb-2">Aucun défi reçu</h3>
              <p className="text-gray-600 mb-4">Tes amis peuvent t'envoyer des défis !</p>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {receivedChallenges.map(challenge => {
              const myScore = getChallengeScore(challenge);
              const status = getChallengeStatus(challenge);
              const isPending = challenge.status === 'pending';
              
              return (
                <Card key={challenge.id}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{getChallengeIcon(challenge.type)}</div>
                      <div>
                        <h3 className="font-semibold">Défi de {challenge.senderName || 'Un ami'}</h3>
                        <p className="text-sm text-gray-600">
                          {getChallengeTypeLabel(challenge.type)} • {challenge.duration} jours
                        </p>
                        <p className="text-xs text-gray-500">
                          Statut: {challenge.status || 'en attente'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      {isPending ? (
                        <div className="flex flex-col space-y-2">
                          <div className="text-sm text-gray-600">En attente de réponse</div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleAcceptChallenge(challenge.id)}
                              className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors shadow-sm"
                            >
                              Accepter
                            </button>
                            <button
                              onClick={() => handleDeclineChallenge(challenge.id)}
                              className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors shadow-sm"
                            >
                              Refuser
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className={`font-bold ${getStatusColor(status.status)}`}>
                            {status.text}
                          </div>
                          <div className="text-sm text-gray-600">
                            {formatScore(myScore, challenge.type)} vs {formatScore(getFriendScore(challenge), challenge.type)}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )
      )}

      {/* Onglet Terminés */}
      {activeTab === 'completed' && (() => {
        const completedChallenges = getCompletedChallenges();
        const hiddenCompletedChallenges = completedChallenges.filter(challenge => hiddenChallenges.has(challenge.id));
        
        if (completedChallenges.length === 0) {
          return (
            <Card>
              <div className="text-center py-8">
                <div className="text-4xl mb-4">🏁</div>
                <h3 className="text-lg font-semibold mb-2">Aucun défi terminé</h3>
                <p className="text-gray-600 mb-4">Termine tes premiers défis pour les voir ici !</p>
              </div>
            </Card>
          );
        }
        
        return (
          <div className="space-y-4">
            {/* Défis terminés visibles */}
            {completedChallenges.filter(challenge => !hiddenChallenges.has(challenge.id)).map(challenge => {
              const myScore = getChallengeScore(challenge);
              const status = getChallengeStatus(challenge);
              const isSentByMe = challenge.senderId === user?.uid;
              
              return (
                <Card key={challenge.id} className="bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{getChallengeIcon(challenge.type)}</div>
                      <div>
                        <h3 className="font-semibold">
                          {isSentByMe 
                            ? `Défi vs ${challenge.receiverName || 'Utilisateur'}`
                            : `Défi de ${challenge.senderName || 'Un ami'}`
                          }
                        </h3>
                        <p className="text-sm text-gray-600">
                          {getChallengeTypeLabel(challenge.type)} • {challenge.duration} jours
                        </p>
                        <p className="text-xs text-gray-500">
                          Terminé le {new Date(challenge.endDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-bold ${getStatusColor(status.status)}`}>
                        {status.text}
                      </div>
                      <div className="text-sm text-gray-600">
                        {formatScore(myScore, challenge.type)} vs {formatScore(getFriendScore(challenge), challenge.type)}
                      </div>
                      {isSentByMe && (
                        <button
                          onClick={() => handleDeleteChallenge(challenge.id)}
                          className="mt-2 text-xs text-red-600 hover:text-red-800"
                        >
                          Supprimer définitivement
                        </button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
            
            {/* Défis terminés masqués */}
            {hiddenCompletedChallenges.length > 0 && (
              <Card className="bg-blue-50 border-l-4 border-l-blue-500">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">👁️</div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Défis masqués</h3>
                      <p className="text-sm text-gray-600">
                        {hiddenCompletedChallenges.length} défi(s) terminé(s) masqué(s)
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => hiddenCompletedChallenges.forEach(challenge => handleShowChallenge(challenge.id))}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Afficher tous
                  </button>
                </div>
              </Card>
            )}
          </div>
        );
      })()}

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
            
            {/* Catégories de défis */}
            <div className="mb-3">
              <div className="flex space-x-2 mb-2">
                {['base', 'progression', 'regularity', 'variety', 'performance'].map(category => (
                  <button
                    key={category}
                    className={`px-3 py-1 text-xs rounded-full transition-all ${
                      challengeTypes.some(t => t.category === category && challengeType === t.id)
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                    onClick={() => {
                      const firstTypeInCategory = challengeTypes.find(t => t.category === category);
                      if (firstTypeInCategory) {
                        setChallengeType(firstTypeInCategory.id);
                        setSelectedTarget(null);
                      }
                    }}
                  >
                    {category === 'base' && 'Base'}
                    {category === 'progression' && 'Progression'}
                    {category === 'regularity' && 'Régularité'}
                    {category === 'variety' && 'Variété'}
                    {category === 'performance' && 'Performance'}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Types de défis par catégorie */}
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
              {challengeTypes
                .filter(type => {
                  const selectedCategory = challengeTypes.find(t => t.id === challengeType)?.category;
                  return selectedCategory ? type.category === selectedCategory : type.category === 'base';
                })
                .map(type => (
                  <button
                    key={type.id}
                    className={`p-3 border rounded-lg text-left transition-all ${
                      challengeType === type.id 
                        ? 'border-blue-500 bg-blue-50 shadow-md' 
                        : 'border-gray-300 bg-white hover:bg-gray-50 hover:border-gray-400'
                    }`}
                    onClick={() => {
                      setChallengeType(type.id);
                      setSelectedTarget(null);
                    }}
                  >
                    <div className="text-lg">{type.icon}</div>
                    <div className="text-sm font-medium">{type.label}</div>
                  </button>
                ))}
            </div>
          </div>

          {/* Sélection de l'objectif */}
          {challengeType && challengeTargets[challengeType] && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Objectif et niveau</label>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                {challengeTargets[challengeType].map((target, index) => {
                  const reward = challengeRewards[target.level];
                  return (
                    <button
                      key={index}
                      className={`p-3 border rounded-lg text-center transition-all ${
                        selectedTarget === target.value 
                          ? 'border-blue-500 bg-blue-50 shadow-md' 
                          : 'border-gray-300 bg-white hover:bg-gray-50 hover:border-gray-400'
                      }`}
                      onClick={() => setSelectedTarget(target.value)}
                    >
                      <div className="text-lg mb-1">{reward.badge}</div>
                      <div className="text-sm font-medium">{target.value}</div>
                      <div className="text-xs text-gray-500">
                        {formatScore(target.value, challengeType)}
                      </div>
                      <div className="text-xs text-green-600 font-medium">
                        +{reward.xp} XP
                      </div>
                      <div className="text-xs text-purple-600">
                        {reward.name}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Durée du défi</label>
            <div className="grid grid-cols-2 gap-2">
              {challengeDurations.map(duration => (
                <button
                  key={duration.value}
                  className={`p-3 border rounded-lg text-center transition-all ${
                    challengeDuration === duration.value 
                      ? 'border-blue-500 bg-blue-50 shadow-md' 
                      : 'border-gray-300 bg-white hover:bg-gray-50 hover:border-gray-400'
                  }`}
                  onClick={() => setChallengeDuration(duration.value)}
                >
                  <div className="text-sm font-medium">{duration.label}</div>
                  <div className="text-xs text-gray-500">{duration.category}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              className="flex-1 p-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 hover:border-gray-400 transition-all"
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