import React from 'react';
import { Card } from './Card';
import { GradientButton } from './GradientButton';
import { CheckCircle, Clock, Target, Zap } from 'lucide-react';

const DailyChallenges = ({ dailyChallenges, todayChallenges, loading, completeDailyChallenge }) => {
  if (loading) {
    return (
      <Card>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des défis quotidiens...</p>
        </div>
      </Card>
    );
  }

  if (todayChallenges.length === 0) {
    return (
      <Card>
        <div className="text-center py-8">
          <div className="text-4xl mb-4">🎯</div>
          <h3 className="text-lg font-semibold mb-2">Aucun défi quotidien</h3>
          <p className="text-gray-600 mb-4">Les défis quotidiens seront générés automatiquement demain !</p>
        </div>
      </Card>
    );
  }

  const completedCount = todayChallenges.filter(challenge => challenge.completed).length;
  const totalCount = todayChallenges.length;

  return (
    <div className="space-y-4">
      {/* En-tête avec statistiques */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Défis Quotidiens</h2>
          <p className="text-sm text-gray-600">
            {completedCount}/{totalCount} défis terminés aujourd'hui
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="text-2xl">🎯</div>
          <div className="text-right">
            <div className="text-sm font-medium text-gray-800">Progression</div>
            <div className="text-xs text-gray-600">
              {Math.round((completedCount / totalCount) * 100)}% complété
            </div>
          </div>
        </div>
      </div>

      {/* Barre de progression */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${(completedCount / totalCount) * 100}%` }}
        ></div>
      </div>

      {/* Liste des défis */}
      <div className="space-y-3">
        {todayChallenges.map((challenge) => (
          <DailyChallengeCard
            key={challenge.id}
            challenge={challenge}
            onComplete={completeDailyChallenge}
          />
        ))}
      </div>

      {/* Message de motivation */}
      {completedCount === totalCount && totalCount > 0 && (
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <div className="text-center py-4">
            <div className="text-3xl mb-2">🎉</div>
            <h3 className="font-semibold text-green-800 mb-1">Tous les défis terminés !</h3>
            <p className="text-sm text-green-600">
              Excellent travail ! Revenez demain pour de nouveaux défis.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};

const DailyChallengeCard = ({ challenge, onComplete }) => {
  const isCompleted = challenge.completed;
  const progress = challenge.progress || 0;
  const target = challenge.target || 1;
  const progressPercentage = Math.min((progress / target) * 100, 100);

  const getCategoryColor = (category) => {
    switch (category) {
      case 'base': return 'bg-blue-100 text-blue-800';
      case 'motivation': return 'bg-orange-100 text-orange-800';
      case 'performance': return 'bg-purple-100 text-purple-800';
      case 'variété': return 'bg-green-100 text-green-800';
      case 'ciblage': return 'bg-red-100 text-red-800';
      case 'timing': return 'bg-yellow-100 text-yellow-800';
      case 'habitude': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressText = () => {
    if (isCompleted) return 'Terminé !';
    if (progress === 0) return 'Pas encore commencé';
    return `${progress}/${target}`;
  };

  return (
    <Card className={`transition-all duration-200 ${
      isCompleted ? 'bg-green-50 border-green-200' : 'hover:shadow-md'
    }`}>
      <div className="flex items-start space-x-3">
        {/* Icône du défi */}
        <div className={`text-2xl ${isCompleted ? 'opacity-50' : ''}`}>
          {challenge.icon}
        </div>

        {/* Contenu principal */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className={`font-semibold ${isCompleted ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                  {challenge.name}
                </h3>
                <span className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(challenge.category)}`}>
                  {challenge.category}
                </span>
              </div>
              
              <p className={`text-sm ${isCompleted ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                {challenge.description}
              </p>

              {/* Barre de progression */}
              <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
                <div 
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    isCompleted 
                      ? 'bg-green-500' 
                      : progress > 0 
                        ? 'bg-blue-500' 
                        : 'bg-gray-300'
                  }`}
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>

              {/* Informations de progression */}
              <div className="flex items-center justify-between text-xs">
                <span className={`flex items-center space-x-1 ${
                  isCompleted ? 'text-green-600' : 'text-gray-500'
                }`}>
                  <Target className="h-3 w-3" />
                  <span>{getProgressText()}</span>
                </span>
                
                <span className="flex items-center space-x-1 text-blue-600">
                  <Zap className="h-3 w-3" />
                  <span>+{challenge.xp} XP</span>
                </span>
              </div>
            </div>

            {/* Bouton d'action */}
            <div className="ml-3">
              {isCompleted ? (
                <div className="flex items-center space-x-1 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  <span className="text-sm font-medium">Terminé</span>
                </div>
              ) : progress >= target ? (
                <GradientButton
                  onClick={() => onComplete(challenge.id)}
                  className="px-4 py-2 text-sm"
                >
                  Valider
                </GradientButton>
              ) : (
                <div className="flex items-center space-x-1 text-gray-400">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">En cours</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default DailyChallenges; 