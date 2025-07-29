import { useState, useRef } from 'react';

// Cache intelligent avec expiration
class IntelligentCache {
  constructor() {
    this.cache = new Map();
    this.maxSize = 100; // Limite de taille du cache
    this.defaultTTL = 30 * 60 * 1000; // 30 minutes par défaut
  }

  // Génère une clé de cache basée sur le contexte
  generateKey(content, context, height, weight, goal) {
    const contextHash = JSON.stringify({ context, height, weight, goal });
    return `${content}:${contextHash}`;
  }

  // Vérifie si une réponse est en cache et valide
  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    // Vérifier l'expiration
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    // Mettre à jour l'utilisation
    item.lastUsed = Date.now();
    item.accessCount++;
    return item.response;
  }

  // Stocke une réponse dans le cache
  set(key, response, ttl = this.defaultTTL) {
    // Nettoyer le cache si nécessaire
    if (this.cache.size >= this.maxSize) {
      this.cleanup();
    }

    this.cache.set(key, {
      response,
      expiresAt: Date.now() + ttl,
      lastUsed: Date.now(),
      accessCount: 1,
      createdAt: Date.now()
    });
  }

  // Nettoie le cache en supprimant les éléments les moins utilisés
  cleanup() {
    const entries = Array.from(this.cache.entries());
    entries.sort((a, b) => {
      // Priorité : expiration > utilisation > ancienneté
      if (a[1].expiresAt < b[1].expiresAt) return -1;
      if (a[1].accessCount < b[1].accessCount) return -1;
      return a[1].createdAt - b[1].createdAt;
    });

    // Supprimer 20% des éléments les moins prioritaires
    const toDelete = Math.ceil(this.maxSize * 0.2);
    entries.slice(0, toDelete).forEach(([key]) => {
      this.cache.delete(key);
    });
  }

  // Statistiques du cache
  getStats() {
    const entries = Array.from(this.cache.values());
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      totalAccesses: entries.reduce((sum, item) => sum + item.accessCount, 0),
      averageAccesses: entries.length > 0 ? entries.reduce((sum, item) => sum + item.accessCount, 0) / entries.length : 0,
      oldestEntry: entries.length > 0 ? Math.min(...entries.map(item => item.createdAt)) : null
    };
  }

  // Vide le cache
  clear() {
    this.cache.clear();
  }
}

// Instance globale du cache
const intelligentCache = new IntelligentCache();

export default function useChatGPT(apiKey) {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const cacheStats = useRef(intelligentCache.getStats());

  // Ajout d'un flag 'welcome' pour le message d'accueil
  const sendMessage = async (content, context = null, height = null, weight = null, goal = null, welcome = false) => {
    if (welcome) {
      setMessages([{ role: 'assistant', content: 'Bonjour, je suis Coach Lex IA' }]);
      return;
    }

    setIsLoading(true);

    // Générer la clé de cache
    const cacheKey = intelligentCache.generateKey(content, context, height, weight, goal);
    
    // Vérifier le cache
    const cachedResponse = intelligentCache.get(cacheKey);
    if (cachedResponse) {
      console.log('🎯 Réponse trouvée en cache:', cacheKey);
      setMessages(prev => [...prev, { role: 'user', content }, { role: 'assistant', content: cachedResponse }]);
      setIsLoading(false);
      return;
    }

    // Ajout d'un contexte système personnalisé si height/weight/goal sont fournis
    let systemContext = context || '';
    if (height || weight || goal) {
      systemContext =
        (systemContext ? systemContext + '\n' : '') +
        `L'utilisateur mesure${height ? ` ${height} cm` : ''}${height && weight ? ' et' : ''}${weight ? ` pèse ${weight} kg` : ''}${(height || weight) && goal ? ' et a pour objectif' : ''}${goal ? ` ${goal}` : ''}. Prends cela en compte dans tes conseils.`;
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
      setIsLoading(false);
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
          model: 'gpt-4-turbo-preview',
          messages: apiHistory,
        }),
      });
      const data = await res.json();
      if (data.choices && data.choices.length > 0) {
        const assistantResponse = data.choices[0].message.content;
        
        // Déterminer le TTL basé sur le type de contenu
        let ttl = intelligentCache.defaultTTL;
        if (content.includes('propose') || content.includes('séance')) {
          ttl = 5 * 60 * 1000; // 5 minutes pour les recommandations de séances
        } else if (content.includes('analyse') || content.includes('progression')) {
          ttl = 15 * 60 * 1000; // 15 minutes pour les analyses
        } else if (content.includes('conseil') || content.includes('aide')) {
          ttl = 60 * 60 * 1000; // 1 heure pour les conseils généraux
        }

        // Mettre en cache la réponse
        intelligentCache.set(cacheKey, assistantResponse, ttl);
        console.log('💾 Réponse mise en cache:', cacheKey, 'TTL:', ttl / 1000 / 60, 'min');
        
        setMessages(prev => [...prev, { role: 'assistant', content: assistantResponse }]);
      } else if (data.error) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.error.message }]);
      }
    } catch (err) {
      console.error('OpenAI error', err);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Erreur OpenAI' }]);
    } finally {
      setIsLoading(false);
      // Mettre à jour les stats du cache
      cacheStats.current = intelligentCache.getStats();
    }
  };

  // Fonction pour vider le cache
  const clearCache = () => {
    intelligentCache.clear();
    cacheStats.current = intelligentCache.getStats();
    console.log('🗑️ Cache vidé');
  };

  // Fonction pour obtenir les stats du cache
  const getCacheStats = () => {
    return intelligentCache.getStats();
  };

  return { 
    messages, 
    sendMessage, 
    setMessages, 
    isLoading, 
    clearCache, 
    getCacheStats,
    cacheStats: cacheStats.current 
  };
}
