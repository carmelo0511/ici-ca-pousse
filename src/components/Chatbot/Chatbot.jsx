import React, { useState } from 'react';
import PropTypes from 'prop-types';
import useChatGPT from '../../hooks/useChatGPT';

const Chatbot = ({ workouts }) => {
  const apiKey = process.env.REACT_APP_OPENAI_API_KEY;
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
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Chatbot IA</h2>
        <select
          value={mode}
          onChange={e => setMode(e.target.value)}
          className="border rounded p-1"
        >
          <option value="advice">Recommandations</option>
          <option value="free">Libre</option>
        </select>
      </div>
      <div className="border rounded-xl p-4 h-64 overflow-y-auto bg-white space-y-2">
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
          className="flex-1 border rounded px-2 py-1"
          placeholder="Votre message..."
        />
        <button onClick={handleSend} className="bg-indigo-600 text-white px-4 py-2 rounded">
          Envoyer
        </button>
      </div>
    </div>
  );
};

Chatbot.propTypes = {
  workouts: PropTypes.array.isRequired,
};

export default Chatbot;
