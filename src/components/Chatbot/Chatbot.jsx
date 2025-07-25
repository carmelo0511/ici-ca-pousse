import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import useChatGPT from '../../hooks/useChatGPT';
import {
  getMuscleGroupDistribution,
  getWorkoutWeightDetails,
  getWorkoutSetRepDetails,
} from '../../utils/workoutUtils';

const SESSION_TYPES = [
  { value: 'fullbody', label: 'Full body' },
  { value: 'haut', label: 'Haut du corps' },
  { value: 'bas', label: 'Bas du corps' },
  { value: 'push', label: 'Push (Pecs/Epaules/Triceps)' },
  { value: 'pull', label: 'Pull (Dos/Biceps)' },
  { value: 'cardio', label: 'Cardio' },
  { value: 'abdos', label: 'Abdos' },
  { value: 'hiit', label: 'HIIT' },
  { value: 'mobilite', label: 'Mobilité/Etirements' },
];

const INTENSITIES = [
  { value: 'facile', label: 'Facile' },
  { value: 'moyen', label: 'Moyen' },
  { value: 'difficile', label: 'Difficile' },
];

const EXERCISES_BY_TYPE = {
  fullbody: ['Pompes', 'Squats', 'Gainage', 'Burpees', 'Fentes', 'Tractions', 'Dips', 'Mountain climbers', 'Crunchs'],
  haut: ['Pompes', 'Tractions', 'Dips', 'Développé militaire', 'Rowing', 'Élévations latérales', 'Pompes diamant', 'Curl biceps'],
  bas: ['Squats', 'Fentes', 'Mollets debout', 'Hip thrust', 'Soulevé de terre jambes tendues', 'Leg curl', 'Montées de banc'],
  push: ['Pompes', 'Développé couché', 'Développé militaire', 'Dips', 'Élévations latérales', 'Pompes diamant'],
  pull: ['Tractions', 'Rowing', 'Curl biceps', 'Tirage horizontal', 'Face pull', 'Shrugs', 'Reverse fly'],
  cardio: ['Burpees', 'Jumping jacks', 'Mountain climbers', 'Corde à sauter', 'Course sur place', 'High knees'],
  abdos: ['Crunchs', 'Gainage', 'Relevé de jambes', 'Russian twist', 'Planche latérale', 'Sit-ups'],
  hiit: ['Burpees', 'Squats sautés', 'Pompes', 'Mountain climbers', 'Jumping lunges', 'Sprints sur place'],
  mobilite: ['Étirement dos', 'Étirement ischio', 'Étirement pectoraux', 'Étirement épaules', 'Étirement quadriceps', 'Étirement fessiers'],
};

function getSetsForIntensity(intensity, exercise) {
  // Nombre de séries aléatoire entre 3 et 4
  const nbSeries = Math.floor(Math.random() * 2) + 3; // 3 ou 4
  // Pour le cardio/hiit/mobilité, on privilégie la durée
  if (["cardio", "hiit", "mobilite"].some(type => exercise.toLowerCase().includes(type))) {
    let base;
    if (intensity === 'facile') base = 20;
    else if (intensity === 'moyen') base = 30;
    else base = 40;
    return Array.from({ length: nbSeries }, () => ({ reps: 0, weight: '', duration: base }));
  }
  // Pour les autres, on joue sur reps/sets, poids toujours vide
  let repsArr;
  if (intensity === 'facile') repsArr = [10, 8, 8, 8];
  else if (intensity === 'moyen') repsArr = [12, 10, 10, 8];
  else repsArr = [15, 12, 10, 10];
  return Array.from({ length: nbSeries }, (_, i) => ({ reps: repsArr[i] || repsArr[repsArr.length - 1], weight: '', duration: 0 }));
}

const Chatbot = ({ workouts, user, setExercisesFromWorkout, setShowAddExercise, setActiveTab, messages: messagesProp, setMessages: setMessagesProp }) => {
  const apiKey = process.env.REACT_APP_OPENAI_API_KEY;
  const chatGpt = useChatGPT(apiKey);
  const messages = messagesProp || chatGpt.messages;
  const setMessages = setMessagesProp || chatGpt.setMessages;
  const sendMessage = chatGpt.sendMessage;
  const [input, setInput] = useState('');
  const [sessionType, setSessionType] = useState('fullbody');
  const [intensity, setIntensity] = useState('moyen');
  const [showMenu, setShowMenu] = useState(false);

  // Message d'accueil automatique au premier rendu
  useEffect(() => {
    if (messages.length === 0) {
      // Message d'accueil personnalisé
      const prenom = user?.displayName ? user.displayName.split(' ')[0] : '';
      setMessages([
        { role: 'assistant', content: `${prenom ? 'Bonjour ' + prenom + ', ' : 'Bonjour,'}je suis Coach Lex IA. Je peux t'aider avec tes séances de sport, la nutrition et le bien-être. Prêt pour une nouvelle séance ?` }
      ]);
    }
    // eslint-disable-next-line
  }, []);

  // Génère un contexte enrichi à chaque message, mais accepte toutes les questions
  const getSummary = () => {
    if (!workouts || workouts.length === 0) return 'Aucune séance enregistrée.';
    const distribution = getMuscleGroupDistribution(workouts);
    const distString = Object.entries(distribution)
      .map(([muscle, percent]) => `${muscle}:${percent}%`)
      .join(', ');
    return `Répartition ${distString}`;
  };
  const getDetails = () => {
    if (!workouts || workouts.length === 0) return '';
    return workouts
      .slice(-3)
      .map(
        (w) =>
          `${w.date} - ${w.exercises?.length || 0} exercices - ${w.duration || 0}min`
      )
      .join('; ');
  };
  const getWeightDetails = () => {
    if (!workouts || workouts.length === 0) return '';
    return getWorkoutWeightDetails(workouts.slice(-3));
  };
  const getSetRepDetails = () => {
    if (!workouts || workouts.length === 0) return '';
    return getWorkoutSetRepDetails(workouts.slice(-3));
  };

  // Génère une séance conseillée selon le type choisi et l’intensité
  const handleSuggestWorkout = () => {
    const allExercises = EXERCISES_BY_TYPE[sessionType] || EXERCISES_BY_TYPE['fullbody'];
    const shuffled = [...allExercises].sort(() => 0.5 - Math.random());
    const nbExercises = Math.floor(Math.random() * 3) + 4; // 4, 5 ou 6
    const selected = shuffled.slice(0, nbExercises);
    const suggestedExercises = selected.map((ex, idx) => ({
      id: Date.now() + idx + 1,
      name: ex,
      type: 'custom',
      sets: getSetsForIntensity(intensity, ex),
    }));
    setExercisesFromWorkout(suggestedExercises);
    if (setActiveTab) setActiveTab('workout');
    setShowMenu(false);
  };

  // Fonction pour générer un récap des 3 dernières séances
  const handleRecapLastWorkouts = () => {
    if (!workouts || workouts.length === 0) return;
    const last3 = workouts.slice(-3).reverse();
    const recap = last3.map(w => {
      let date = new Date(w.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
      date = date.charAt(0).toUpperCase() + date.slice(1);
      const exos = w.exercises?.map(ex => {
        // Détail séries/reps/poids
        const nbSeries = ex.sets?.length || 0;
        const reps = ex.sets?.map(s => s.reps).join('/') || '-';
        const poids = ex.sets?.map(s => s.weight).join('/') || '-';
        return `  - ${ex.name} : ${nbSeries} séries, reps : ${reps}, poids : ${poids}`;
      }).join('\n');
      return `• ${date} :\n${exos}`;
    }).join('\n');
    // Analyse intelligente des groupes musculaires pour recommandation
    const detectType = (exos) => {
      const haut = ['pompes', 'tractions', 'dips', 'développé', 'row', 'biceps', 'épaules'];
      const bas = ['squat', 'fentes', 'mollets', 'hip thrust', 'soulevé', 'leg curl', 'banc'];
      let countHaut = 0, countBas = 0;
      exos.forEach(n => {
        const nLower = n.toLowerCase();
        if (haut.some(h => nLower.includes(h))) countHaut++;
        if (bas.some(b => nLower.includes(b))) countBas++;
      });
      if (countHaut > countBas * 1.5) return 'haut';
      if (countBas > countHaut * 1.5) return 'bas';
      if (countHaut && countBas) return 'mixte';
      return 'autre';
    };
    const types = last3.map(w => detectType(w.exercises?.map(ex => ex.name) || []));
    const nbHaut = types.filter(t => t === 'haut').length;
    const nbBas = types.filter(t => t === 'bas').length;
    let reco = '';
    if (nbHaut > nbBas) reco = '\n💡 Tu as surtout travaillé le haut du corps, pense à une séance bas du corps !';
    else if (nbBas > nbHaut) reco = '\n💡 Tu as surtout travaillé le bas du corps, pense à une séance haut du corps !';
    else reco = '\n💡 Bonne répartition, continue à varier les groupes musculaires !';
    // Extraire le prénom de l’utilisateur
    const prenom = user?.displayName ? user.displayName.split(' ')[0] : '';
    setMessages(prev => [
      ...prev,
      { role: 'assistant', content: `${prenom ? prenom + ', ' : ''}voici le récap de tes 3 dernières séances :\n${recap}${reco}` }
    ]);
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    // Contexte enrichi, mais l'utilisateur peut parler de tout
    const context = `Tu es un assistant personnel sportif et bien-être. Sois motivant, bienveillant et adapte tes réponses à mon niveau. Voici un résumé de mes dernières séances : ${getSummary()} ${getDetails()} ${getWeightDetails()} ${getSetRepDetails()}`;
    await sendMessage(input, context, user?.height, user?.weight);
    setInput('');
  };

  return (
    <div className="p-6 space-y-4 bg-white/60 backdrop-blur-lg rounded-xl shadow-lg">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-800">Coach Lex IA</h2>
      </div>
      <div className="mb-2 flex gap-2 items-center">
        <button
          onClick={() => setShowMenu(v => !v)}
          className="bg-gradient-to-r from-green-400 to-blue-500 text-white px-4 py-2 rounded shadow font-semibold hover:from-green-500 hover:to-blue-600 transition"
        >
          Propose-moi une séance
        </button>
        <button
          onClick={handleRecapLastWorkouts}
          className="bg-gradient-to-r from-indigo-400 to-purple-500 text-white px-4 py-2 rounded shadow font-semibold hover:from-indigo-500 hover:to-purple-600 transition"
        >
          Récap des dernières séances
        </button>
        {showMenu && (
          <div className="absolute z-50 mt-2 p-4 bg-white border rounded-xl shadow-xl flex flex-col gap-3" style={{ minWidth: 220 }}>
            <label className="font-semibold text-gray-700">Type de séance</label>
            <select
              value={sessionType}
              onChange={e => setSessionType(e.target.value)}
              className="border rounded px-2 py-1 text-lg"
            >
              {SESSION_TYPES.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <label className="font-semibold text-gray-700 mt-2">Intensité</label>
            <select
              value={intensity}
              onChange={e => setIntensity(e.target.value)}
              className="border rounded px-2 py-1 text-lg"
            >
              {INTENSITIES.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <button
              onClick={handleSuggestWorkout}
              className="mt-3 bg-gradient-to-r from-green-500 to-blue-600 text-white px-4 py-2 rounded font-semibold shadow hover:from-green-600 hover:to-blue-700 transition"
            >
              Valider
            </button>
            <button
              onClick={() => setShowMenu(false)}
              className="text-gray-500 text-sm mt-1 hover:underline"
            >Annuler</button>
          </div>
        )}
      </div>
      <div className="border rounded-xl p-4 h-64 overflow-y-auto bg-white space-y-2 shadow-inner">
        {messages.map((m, i) => (
          <div
            key={i}
            className={m.role === 'user' ? 'text-right' : 'text-left'}
          >
            <span
              className={
                m.role === 'user'
                  ? 'bg-indigo-100 text-indigo-800 px-3 py-2 rounded inline-block text-lg'
                  : 'bg-gray-100 px-3 py-2 rounded inline-block text-lg'
              }
            >
              {m.content}
            </span>
          </div>
        ))}
      </div>
      <div className="flex space-x-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 border rounded px-3 py-2 text-lg input-modern"
          placeholder="Posez n'importe quelle question..."
        />
        <button
          onClick={handleSend}
          className="btn-gradient text-white px-5 py-2 rounded text-lg"
        >
          Envoyer
        </button>
      </div>
    </div>
  );
};

Chatbot.propTypes = {
  workouts: PropTypes.array.isRequired,
  user: PropTypes.object,
  setExercisesFromWorkout: PropTypes.func.isRequired,
  setShowAddExercise: PropTypes.func.isRequired,
  setActiveTab: PropTypes.func,
  messages: PropTypes.array,
  setMessages: PropTypes.func,
};

export default Chatbot;
