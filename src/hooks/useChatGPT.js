import { useState } from 'react';

export default function useChatGPT(apiKey) {
  const [messages, setMessages] = useState([]);

  // Ajout d'un flag 'welcome' pour le message d'accueil
  const sendMessage = async (content, context = null, height = null, weight = null, welcome = false) => {
    if (welcome) {
      setMessages([{ role: 'assistant', content: 'Bonjour, je suis ton coach IA perso' }]);
      return;
    }
    // Ajout d'un contexte système personnalisé si height/weight sont fournis
    let systemContext = context || '';
    if (height || weight) {
      systemContext =
        (systemContext ? systemContext + '\n' : '') +
        `L'utilisateur mesure${height ? ` ${height} cm` : ''}${height && weight ? ' et' : ''}${weight ? ` pèse ${weight} kg` : ''}. Prends cela en compte dans tes conseils.`;
    }
    const userMessage = { role: 'user', content };
    // Historique pour l'API : inclut le message système si besoin
    const apiHistory = systemContext
      ? [{ role: 'system', content: systemContext }, ...messages, userMessage]
      : [...messages, userMessage];
    // Historique pour l'affichage : n'inclut jamais le message système
    const uiHistory = [...messages, userMessage];
    setMessages(uiHistory);

    if (!apiKey) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Clé API manquante' }]);
      return;
    }

    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: apiHistory,
        }),
      });
      const data = await res.json();
      if (data.choices && data.choices.length > 0) {
        setMessages(prev => [...prev, data.choices[0].message]);
      } else if (data.error) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.error.message }]);
      }
    } catch (err) {
      console.error('OpenAI error', err);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Erreur OpenAI' }]);
    }
  };

  return { messages, sendMessage, setMessages };
}
