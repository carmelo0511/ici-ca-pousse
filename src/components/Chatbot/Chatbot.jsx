import React, { useState } from 'react';
import PropTypes from 'prop-types';
import useChatGPT from '../../hooks/useChatGPT';
import {
  getMuscleGroupDistribution,
  getWorkoutWeightDetails,
  getWorkoutSetRepDetails,
} from '../../utils/workoutUtils';

const Chatbot = ({ workouts, user }) => {
  const apiKey = process.env.REACT_APP_OPENAI_API_KEY;
  console.log('REACT_APP_OPENAI_API_KEY:', apiKey);
  console.log('REACT_APP_TEST_VAR:', process.env.REACT_APP_TEST_VAR);
  const { messages, sendMessage } = useChatGPT(apiKey);
  const [input, setInput] = useState('');

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
        <h2 className="text-3xl font-bold text-gray-800">Chatbot IA</h2>
        {/* Suppression du select mode */}
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
};

export default Chatbot;
