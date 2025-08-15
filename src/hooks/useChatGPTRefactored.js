import { useState, useEffect, useRef } from 'react';
import { STORAGE_KEYS } from '../constants/storageKeys';
import { load, save } from '../utils/firebase/storage';
import chatService from '../services/chatService';
import intelligentCache from '../services/chatCacheService';
import apiRateLimiter from '../services/chatRateLimitService';
import aiMonitoring from '../utils/ai/aiMonitoring';

export default function useChatGPT(apiKey) {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const cacheStats = useRef(intelligentCache.getStats());

  // Charger la mémoire du chatbot au démarrage
  useEffect(() => {
    loadChatbotMemory();
  }, []);

  // Sauvegarder les messages quand ils changent
  useEffect(() => {
    if (messages.length > 0) {
      save(STORAGE_KEYS.CHATBOT_MEMORY, messages);
    }
  }, [messages]);

  const loadChatbotMemory = async () => {
    try {
      // Charger les messages précédents
      const savedMessages = load(STORAGE_KEYS.CHATBOT_MEMORY, []) || [];
      if (savedMessages.length > 0) {
        setMessages(savedMessages);
    
      }

      // Charger les métriques de monitoring
      const savedMetrics = aiMonitoring.loadMetrics();
      if (savedMetrics) {
  
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la mémoire:', error);
    }
  };

  const sendMessage = async (
    content,
    context = null,
    height = null,
    weight = null,
    goal = null,
    welcome = false,
    workouts = null,
    user = null
  ) => {
    setIsLoading(true);
    const startTime = Date.now();

    try {
      // Ajouter le message utilisateur
      const userMessage = { role: 'user', content, timestamp: Date.now() };
      setMessages(prev => [...prev, userMessage]);

      // Envoyer le message via le service
      const result = await chatService.sendMessage(content, {
        context,
        height,
        weight,
        goal,
        welcome,
        workouts,
        user,
        apiKey
      });

      if (result.success) {
        // Ajouter la réponse de l'assistant
        const assistantMessage = { 
          role: 'assistant', 
          content: result.response, 
          timestamp: Date.now(),
          fromCache: result.fromCache || false,
          validation: result.validation || null
        };
        
        setMessages(prev => [...prev, assistantMessage]);

        // Mettre à jour les statistiques du cache
        cacheStats.current = intelligentCache.getStats();

        // Log des performances
        const duration = Date.now() - startTime;
  
      } else {
        // Gérer les erreurs
        const errorMessage = { 
          role: 'assistant', 
          content: result.fallbackResponse || result.response, 
          timestamp: Date.now(),
          isError: true
        };
        
        setMessages(prev => [...prev, errorMessage]);
        
        if (result.rateLimitExceeded) {
          console.warn('⚠️ Limite d\'API atteinte');
        }
      }

    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      
      const errorMessage = { 
        role: 'assistant', 
        content: 'Je m\'excuse, mais j\'ai des difficultés à traiter votre demande pour le moment. Veuillez réessayer plus tard.',
        timestamp: Date.now(),
        isError: true
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fonctions de gestion de la mémoire
  const clearMemory = () => {
    setMessages([]);
    save(STORAGE_KEYS.CHATBOT_MEMORY, []);

  };

  const clearAll = () => {
    clearMemory();
    intelligentCache.clear();
    apiRateLimiter.resetLimits();
    aiMonitoring.resetMetrics();

  };

  const exportConversation = () => {
    const conversation = {
      messages,
      timestamp: new Date().toISOString(),
      stats: {
        cache: intelligentCache.getStats(),
        apiLimits: apiRateLimiter.getStats(),
        monitoring: aiMonitoring.getGlobalStats()
      }
    };

    const blob = new Blob([JSON.stringify(conversation, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chatbot-conversation-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Fonctions de statistiques
  const getMemoryStats = () => {
    return {
      totalMessages: messages.length,
      userMessages: messages.filter(m => m.role === 'user').length,
      assistantMessages: messages.filter(m => m.role === 'assistant').length,
      cachedResponses: messages.filter(m => m.fromCache).length,
      errorMessages: messages.filter(m => m.isError).length,
      lastMessage: messages.length > 0 ? messages[messages.length - 1].timestamp : null
    };
  };

  const getKnowledgeBaseStats = () => {
    return aiMonitoring.getKnowledgeBaseStats();
  };

  // Fonctions de cache
  const clearCache = () => {
    intelligentCache.clear();
    cacheStats.current = intelligentCache.getStats();

  };

  // Fonctions de gestion de la base de connaissances
  const addCustomKnowledge = (title, content, category, tags = []) => {
    return aiMonitoring.addCustomKnowledge(title, content, category, tags);
  };

  const searchKnowledgeBase = (query, limit = 5) => {
    return aiMonitoring.searchKnowledgeBase(query, limit);
  };

  const getKnowledgeByCategory = (category, limit = 3) => {
    return aiMonitoring.getKnowledgeByCategory(category, limit);
  };

  // Fonctions de cache et monitoring à exposer
  const getCacheStats = () => intelligentCache.getStats();
  const getAPILimits = () => apiRateLimiter.getStats();
  const getMonitoringStats = () => aiMonitoring.getGlobalStats();

  return {
    // État principal
    messages,
    sendMessage,
    setMessages,
    isLoading,
    
    // Gestion de la mémoire
    clearMemory,
    clearAll,
    exportConversation,
    getMemoryStats,
    
    // Cache
    clearCache,
    getCacheStats,
    
    // Monitoring
    getMonitoringStats,
    getFunctionStats: (functionName) => aiMonitoring.getFunctionStats(functionName),
    getPerformanceTrends: () => aiMonitoring.getPerformanceTrends(),
    getPerformanceAlerts: () => aiMonitoring.getPerformanceAlerts(),
    generatePerformanceReport: () => aiMonitoring.generatePerformanceReport(),
    resetMonitoring: () => aiMonitoring.resetMetrics(),
    getSafetyStats: () => aiMonitoring.getSafetyStats(),
    
    // Base de connaissances RAG
    getKnowledgeBaseStats,
    addCustomKnowledge,
    searchKnowledgeBase,
    getKnowledgeByCategory,
    
    // Limitation API
    getAPILimits,
  };
} 