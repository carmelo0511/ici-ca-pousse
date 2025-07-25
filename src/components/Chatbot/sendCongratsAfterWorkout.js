// Fonction d’encouragement après une nouvelle séance
export function sendCongratsAfterWorkout({ user, workout, workouts, setMessages }) {
  const prenom = user?.displayName ? user.displayName.split(' ')[0] : '';
  // Nombre de séances cette semaine
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);
  const nbThisWeek = workouts.filter(w => {
    const d = new Date(w.date);
    return d >= weekStart && d <= weekEnd;
  }).length;
  // Record sur un exercice ?
  let recordMsg = '';
  if (workout && workout.exercises) {
    for (const ex of workout.exercises) {
      const maxWeight = Math.max(...(ex.sets?.map(s => Number(s.weight) || 0) || [0]));
      // Cherche si c’est le max historique
      const allWeights = workouts.flatMap(w => w.exercises?.filter(e => e.name === ex.name).flatMap(e => e.sets?.map(s => Number(s.weight) || 0) || []) || []);
      if (maxWeight > 0 && maxWeight === Math.max(...allWeights)) {
        recordMsg = `Super, tu as battu ton record de poids sur le ${ex.name} (${maxWeight}kg) !`;
        break;
      }
    }
  }
  setMessages(prev => [
    ...prev,
    { role: 'assistant', content: `${prenom ? prenom + ', ' : ''}bravo pour ta régularité ! Tu viens d’enchaîner ${nbThisWeek} séance${nbThisWeek > 1 ? 's' : ''} cette semaine 👏${recordMsg ? '\n' + recordMsg : ''}` }
  ]);
} 