import React, { useState } from 'react';
import Card from './Card';
import { BarChart3, Users, Target } from 'lucide-react';

const ChallengeStats = ({ stats }) => {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: BarChart3 },
    { id: 'byType', label: 'Par type', icon: Target },
    { id: 'byFriend', label: 'Par ami', icon: Users }
  ];

  const renderOverview = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.overview.total}</div>
            <div className="text-sm text-gray-600">Total défis</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.overview.victories}</div>
            <div className="text-sm text-gray-600">Victoires</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{stats.overview.defeats}</div>
            <div className="text-sm text-gray-600">Défaites</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-600">{stats.overview.winRate}%</div>
            <div className="text-sm text-gray-600">Taux de victoire</div>
          </div>
        </Card>
      </div>
      
      <Card>
        <h3 className="text-lg font-semibold mb-4">Répartition des résultats</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Victoires</span>
            <div className="flex items-center space-x-2">
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ width: `${(stats.overview.victories / stats.overview.completed) * 100}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium">{stats.overview.victories}</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Défaites</span>
            <div className="flex items-center space-x-2">
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-red-500 h-2 rounded-full" 
                  style={{ width: `${(stats.overview.defeats / stats.overview.completed) * 100}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium">{stats.overview.defeats}</span>
            </div>
          </div>
          {stats.overview.ties > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Égalités</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-yellow-500 h-2 rounded-full" 
                    style={{ width: `${(stats.overview.ties / stats.overview.completed) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium">{stats.overview.ties}</span>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );

  const renderByType = () => (
    <div className="space-y-4">
      {Object.entries(stats.byType).map(([typeId, typeStats]) => (
        <Card key={typeId}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">
                {typeId === 'workouts' && '💪'}
                {typeId === 'duration' && '⏱️'}
                {typeId === 'streak' && '🔥'}
                {typeId === 'calories' && '🔥'}
              </div>
              <div>
                <h3 className="font-semibold">
                  {typeId === 'workouts' && 'Nombre de séances'}
                  {typeId === 'duration' && 'Temps d\'entraînement'}
                  {typeId === 'streak' && 'Série consécutive'}
                  {typeId === 'calories' && 'Calories brûlées'}
                </h3>
                <p className="text-sm text-gray-600">{typeStats.total} défis</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-indigo-600">{typeStats.winRate}%</div>
              <div className="text-sm text-gray-600">
                {typeStats.victories}/{typeStats.completed} victoires
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );

  const renderByFriend = () => (
    <div className="space-y-4">
      {Object.entries(stats.byFriend)
        .sort(([,a], [,b]) => b.total - a.total)
        .map(([friendId, friendStats]) => (
          <Card key={friendId}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{friendStats.name}</h3>
                <p className="text-sm text-gray-600">{friendStats.total} défis</p>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-indigo-600">
                  {friendStats.total > 0 ? Math.round((friendStats.victories / friendStats.total) * 100) : 0}%
                </div>
                <div className="text-sm text-gray-600">
                  {friendStats.victories}V - {friendStats.defeats}D
                </div>
              </div>
            </div>
          </Card>
        ))}
    </div>
  );

  return (
    <div>
      {/* Onglets */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              activeTab === id
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Contenu des onglets */}
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'byType' && renderByType()}
      {activeTab === 'byFriend' && renderByFriend()}
    </div>
  );
};

export default ChallengeStats; 