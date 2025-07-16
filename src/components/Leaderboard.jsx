import React, { useEffect, useState } from 'react';
import { db } from '../utils/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useFriends } from '../hooks/useFriends';
import { BarChart3 } from 'lucide-react';

function Leaderboard({ user, onShowComparison }) {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const { friends } = useFriends(user);

  // Récupère les stats (nombre de séances) pour chaque ami + soi-même
  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      const allUsers = [user, ...friends];
      const statsArr = [];
      for (const u of allUsers) {
        if (!u) continue;
        const q = query(collection(db, 'workouts'), where('userId', '==', u.uid));
        const snap = await getDocs(q);
        statsArr.push({
          uid: u.uid,
          displayName: u.displayName || u.email,
          count: snap.size
        });
      }
      // Tri décroissant par nombre de séances
      statsArr.sort((a, b) => b.count - a.count);
      setStats(statsArr);
      setLoading(false);
    };
    if (user) fetchStats();
  }, [user, friends]);

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded-2xl shadow-lg space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Leaderboard</h2>
        {friends.length > 0 && (
          <button
            onClick={onShowComparison}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
          >
            <BarChart3 className="h-4 w-4" />
            <span>Comparaison détaillée</span>
          </button>
        )}
      </div>
      {loading ? (
        <div className="text-gray-400 text-sm">Chargement...</div>
      ) : (
        <ol className="space-y-2">
          {stats.map((s, idx) => (
            <li key={s.uid} className={`flex items-center justify-between px-4 py-2 rounded-lg ${s.uid === user.uid ? 'bg-indigo-100 font-bold' : 'bg-gray-50'}`}> 
              <span>#{idx + 1} {s.displayName}</span>
              <span>{s.count} séances</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

export default Leaderboard; 