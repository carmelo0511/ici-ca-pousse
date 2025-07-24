import React, { useState } from 'react';
import PropTypes from 'prop-types';
import useChatGPT from '../../hooks/useChatGPT';
import GradientButton from '../GradientButton';

const Chatbot = ({ workouts }) => {
  const apiKey = process.env.REACT_APP_OPENAI_API_KEY;
  console.log("REACT_APP_OPENAI_API_KEY:", apiKey);
  console.log("REACT_APP_TEST_VAR:", process.env.REACT_APP_TEST_VAR);
  const { messages, sendMessage } = useChatGPT(apiKey);
  const [input, setInput] = useState('');
  const [mode, setMode] = useState('advice');

  const getSummary = () => {
    if (!workouts || workouts.length === 0) return "Aucune séance enregistrée.";
    const last = workouts.slice(-5).map(w => `${w.date} - ${w.exercises.length} ex (${w.duration || 0} min)`).join('\n');
    return `Données récentes:\n${last}`;
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const context = mode === 'advice' ? `Tu es un coach sportif. Voici mes dernières séances:\n${getSummary()}\nDonne-moi des recommandations adaptées.` : null;
    await sendMessage(input, context);
    setInput('');
  };

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6 bg-white rounded-2xl shadow-lg space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Chatbot IA</h2>
        <select
          value={mode}
          onChange={e => setMode(e.target.value)}
          className="border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="advice">Recommandations</option>
          <option value="free">Libre</option>
        </select>
      </div>
      <div className="border border-gray-200 rounded-xl p-4 h-[32rem] overflow-y-auto bg-gray-50 space-y-2 shadow-inner">
        {messages.map((m, i) => (
          <div key={i} className={m.role === 'user' ? 'text-right' : 'text-left'}>
            <span
              className={
                m.role === 'user'
                  ? 'bg-indigo-100 text-indigo-800 px-2 py-1 rounded inline-block'
                  : 'bg-gray-100 px-2 py-1 rounded inline-block'
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
          onChange={e => setInput(e.target.value)}
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Votre message..."
        />
        <GradientButton onClick={handleSend}>
          Envoyer
        </GradientButton>
      </div>
    </div>
  );
};

Chatbot.propTypes = {
  workouts: PropTypes.array.isRequired,
};

export default Chatbot;
