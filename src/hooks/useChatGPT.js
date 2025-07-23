import { useState } from 'react';

export default function useChatGPT(apiKey) {
  const [messages, setMessages] = useState([]);

  const sendMessage = async (content, context = null) => {
    const userMessage = { role: 'user', content };
    const history = context ? [{ role: 'system', content: context }, ...messages, userMessage] : [...messages, userMessage];
    setMessages(history);

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
          messages: history,
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

  return { messages, sendMessage };
}
