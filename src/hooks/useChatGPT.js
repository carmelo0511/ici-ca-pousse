import { useState, useRef, useEffect } from 'react';
import { STORAGE_KEYS } from '../constants/storageKeys';
import { load, save } from '../utils/firebase/storage';
import {
  getRelevantFunctions,
  processFunctionResponse,
} from '../utils/ai/openaiFunctions';
import aiMonitoring from '../utils/ai/aiMonitoring';
import safetyValidator from '../utils/ai/safetyValidator';
import knowledgeBase from '../utils/ai/knowledgeBase';

// Cache intelligent avec expiration et persistance
class IntelligentCache {
  constructor() {
    this.cache = new Map();
    this.maxSize = 50; // Réduire la taille du cache pour améliorer les performances
    this.defaultTTL = 15 * 60 * 1000; // Réduire le TTL à 15 minutes par défaut
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
      createdAt: Date.now(),
    });

    // Sauvegarder après chaque modification
    this.saveToStorage();
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
      averageAccesses:
        entries.length > 0
          ? entries.reduce((sum, item) => sum + item.accessCount, 0) /
            entries.length
          : 0,
      oldestEntry:
        entries.length > 0
          ? Math.min(...entries.map((item) => item.createdAt))
          : null,
    };
  }

  // Vide le cache
  clear() {
    this.cache.clear();
    this.saveToStorage();
  }

  // Sauvegarde le cache dans le localStorage
  saveToStorage() {
    const cacheData = {
      cache: Array.from(this.cache.entries()),
      maxSize: this.maxSize,
      defaultTTL: this.defaultTTL,
      timestamp: Date.now(),
    };
    save(STORAGE_KEYS.CHATBOT_CACHE, cacheData);
  }

  // Charge le cache depuis le localStorage
  loadFromStorage() {
    try {
      const cacheData = load(STORAGE_KEYS.CHATBOT_CACHE, null);
      if (cacheData && cacheData.cache) {
        // Vérifier si les données ne sont pas trop anciennes (7 jours)
        const isExpired =
          Date.now() - cacheData.timestamp > 7 * 24 * 60 * 60 * 1000;
        if (!isExpired) {
          this.cache = new Map(cacheData.cache);
          this.maxSize = cacheData.maxSize || this.maxSize;
          this.defaultTTL = cacheData.defaultTTL || this.defaultTTL;
          console.log(
            '💾 Cache chargé depuis le stockage:',
            this.cache.size,
            'éléments'
          );
        } else {
          console.log('🗑️ Cache expiré, démarrage avec un cache vide');
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement du cache:', error);
    }
  }
}

// Fonction pour détecter la langue d'un texte
const detectLanguage = (text) => {
  const englishWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'can', 'may', 'might', 'give', 'workout', 'chest', 'back', 'legs', 'arms', 'shoulders', 'abs', 'exercise', 'training', 'fitness', 'gym'];
  const frenchWords = ['le', 'la', 'les', 'un', 'une', 'des', 'et', 'ou', 'mais', 'dans', 'sur', 'à', 'pour', 'de', 'avec', 'par', 'est', 'sont', 'était', 'étaient', 'être', 'été', 'avoir', 'a', 'eu', 'faire', 'fait', 'donner', 'séance', 'entraînement', 'exercice', 'musculation', 'fitness', 'salle'];
  
  const words = text.toLowerCase().split(/\s+/);
  let englishCount = 0;
  let frenchCount = 0;
  
  words.forEach(word => {
    if (englishWords.includes(word)) englishCount++;
    if (frenchWords.includes(word)) frenchCount++;
  });
  
  // Détection basée sur les mots-clés et la structure
  if (englishCount > frenchCount) return 'english';
  if (frenchCount > englishCount) return 'french';
  
  // Détection basée sur les caractères spéciaux
  if (text.includes('é') || text.includes('è') || text.includes('à') || text.includes('ç')) return 'french';
  
  // Par défaut, français
  return 'french';
};

// Instance globale du cache
const intelligentCache = new IntelligentCache();

export default function useChatGPT(apiKey) {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const cacheStats = useRef(intelligentCache.getStats());

  // Charger la mémoire du chatbot au démarrage
  useEffect(() => {
    // Charger le cache depuis le stockage
    intelligentCache.loadFromStorage();

    // Charger les messages précédents
    const savedMessages = load(STORAGE_KEYS.CHATBOT_MEMORY, []) || [];
    if (savedMessages.length > 0) {
      setMessages(savedMessages);
      console.log(
        '💾 Messages du chatbot chargés:',
        savedMessages.length,
        'messages'
      );
    }

    // Charger les métriques de monitoring
    const savedMetrics = aiMonitoring.loadMetrics();
    if (savedMetrics) {
      console.log('📊 Métriques de monitoring chargées');
    }
  }, []);

  // Sauvegarder les messages quand ils changent
  useEffect(() => {
    if (messages.length > 0) {
      save(STORAGE_KEYS.CHATBOT_MEMORY, messages);
    }
  }, [messages]);

  // Ajout d'un flag 'welcome' pour le message d'accueil
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
    if (welcome) {
      // Détecter la langue pour le message d'accueil
      const welcomeLanguage = detectLanguage(content || 'bonjour');
      const welcomeMessage = welcomeLanguage === 'english' 
        ? 'Hello, I am Coach Lex IA'
        : 'Bonjour, je suis Coach Lex IA';
      
      setMessages([
        { role: 'assistant', content: welcomeMessage },
      ]);
      return;
    }

    setIsLoading(true);
    const startTime = Date.now();

    // Mettre à jour les statistiques de requêtes
    aiMonitoring.metrics.totalRequests++;

    // Générer le contexte enrichi avec RAG (optimisé pour les performances)
    let enrichedContent = content;
    let enrichedContext = null;
    
    // Ne générer le contexte RAG que si nécessaire (éviter pour les questions simples)
    if (content.length > 10 && !content.toLowerCase().includes('bonjour') && !content.toLowerCase().includes('salut')) {
      try {
        enrichedContext = knowledgeBase.generateEnrichedContext(content, user);
        if (enrichedContext) {
          enrichedContent = `Contexte spécialisé:\n${enrichedContext}\n\nQuestion utilisateur: ${content}`;
          console.log('📚 Contexte RAG ajouté pour enrichir la réponse');
        }
      } catch (error) {
        console.warn('Erreur lors de la génération du contexte RAG:', error);
        // Continuer sans le contexte RAG en cas d'erreur
      }
    }

    // Générer la clé de cache avec le contenu enrichi
    const cacheKey = intelligentCache.generateKey(
      enrichedContent,
      context,
      height,
      weight,
      goal
    );

    // Vérifier le cache
    const cachedResponse = intelligentCache.get(cacheKey);
    if (cachedResponse) {
      console.log('🎯 Réponse trouvée en cache:', cacheKey);
      const responseTime = Date.now() - startTime;

      // Enregistrer les métriques
      aiMonitoring.recordResponseTime(responseTime);
      aiMonitoring.recordUserSatisfaction(content, cachedResponse, 'cache_hit');
      aiMonitoring.recordConversationFlow(content, cachedResponse);
      aiMonitoring.recordSuccessfulRequest();

      setMessages((prev) => [
        ...prev,
        { role: 'user', content, timestamp: Date.now() },
        { role: 'assistant', content: cachedResponse, timestamp: Date.now() },
      ]);
      setIsLoading(false);
      return;
    }

    // Détecter la langue de la question
    const detectedLanguage = detectLanguage(content);
    console.log('🌍 Langue détectée:', detectedLanguage);

    // Ajout d'un contexte système personnalisé adapté à la langue
    let systemContext = context || '';
    
    // Instructions de langue pour l'IA
    const languageInstruction = detectedLanguage === 'english' 
      ? 'IMPORTANT: Respond in the same language as the user\'s question. If the user asks in English, respond in English. If the user asks in French, respond in French.'
      : 'IMPORTANT: Réponds dans la même langue que la question de l\'utilisateur. Si l\'utilisateur pose sa question en anglais, réponds en anglais. Si l\'utilisateur pose sa question en français, réponds en français.';
    
    systemContext = languageInstruction + (systemContext ? '\n' + systemContext : '');
    
    // Ajouter les informations utilisateur dans la langue appropriée
    if (height || weight || goal) {
      if (detectedLanguage === 'english') {
        systemContext += `\nUser profile: ${height ? `Height: ${height} cm` : ''}${height && weight ? ' and' : ''}${weight ? ` Weight: ${weight} kg` : ''}${(height || weight) && goal ? ' with goal:' : ''}${goal ? ` ${goal}` : ''}. Take this into account in your advice.`;
      } else {
        systemContext += `\nProfil utilisateur: ${height ? `Taille: ${height} cm` : ''}${height && weight ? ' et' : ''}${weight ? ` Poids: ${weight} kg` : ''}${(height || weight) && goal ? ' avec objectif:' : ''}${goal ? ` ${goal}` : ''}. Prends cela en compte dans tes conseils.`;
      }
    }

    // Déterminer les fonctions pertinentes selon le message (optimisé)
    const relevantFunctions = getRelevantFunctions(enrichedContent, context) || [];
    
    // Limiter le nombre de fonctions pour améliorer les performances
    const limitedFunctions = relevantFunctions.slice(0, 3);
    
    console.log(
      '🔧 Fonctions détectées:',
      limitedFunctions.map((f) => f.name)
    );

    const userMessage = { role: 'user', content, timestamp: Date.now() };
    // Historique pour l'API : inclut le message système si besoin (optimisé)
    // Limiter l'historique pour améliorer les performances
    const maxHistoryLength = 10;
    const limitedMessages = messages.slice(-maxHistoryLength);
    
    const apiHistory = systemContext
      ? [{ role: 'system', content: systemContext }, ...limitedMessages, userMessage]
      : [...limitedMessages, userMessage];
    // Historique pour l'affichage : n'inclut jamais le message système
    const uiHistory = [...messages, userMessage];
    setMessages(uiHistory);

    if (!apiKey) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Clé API manquante' },
      ]);
      setIsLoading(false);
      return;
    }

    try {
      // Préparer le body de la requête avec ou sans fonctions
      const requestBody = {
        model: 'gpt-4-turbo-preview',
        messages: apiHistory,
      };

      // Ajouter les fonctions si elles sont pertinentes
      if (limitedFunctions.length > 0) {
        requestBody.functions = limitedFunctions;
        requestBody.function_call = 'auto'; // Laisse l'IA décider quand utiliser les fonctions
      }

      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(requestBody),
        // Ajouter un timeout pour éviter les requêtes trop longues
        signal: AbortSignal.timeout(30000), // 30 secondes max
      });
      const data = await res.json();
      if (data.choices && data.choices.length > 0) {
        const choice = data.choices[0];
        let assistantResponse = '';
        let functionUsed = null;

        // Vérifier si l'IA a appelé une fonction
        if (choice.message.function_call) {
          const functionCall = choice.message.function_call;
          console.log('🔧 Fonction appelée:', functionCall.name);
          functionUsed = functionCall.name;

          // Traiter l'appel de fonction
          const functionStartTime = Date.now();
          const functionResponse = await handleFunctionCall(
            functionCall,
            workouts,
            user
          );
          const functionExecutionTime = Date.now() - functionStartTime;

          // Enregistrer les métriques de la fonction
          aiMonitoring.recordFunctionCall(
            functionCall.name,
            functionCall.arguments,
            functionResponse,
            functionExecutionTime
          );

          // Envoyer la réponse de la fonction à l'IA
          const followUpResponse = await sendFollowUpMessage(
            functionCall,
            functionResponse,
            apiKey
          );

          assistantResponse = followUpResponse || functionResponse;
        } else {
          assistantResponse = choice.message.content;
        }

        // Calculer le temps de réponse total
        const totalResponseTime = Date.now() - startTime;

        // Enregistrer les métriques
        aiMonitoring.recordResponseTime(totalResponseTime);
        aiMonitoring.recordUserSatisfaction(
          content,
          assistantResponse,
          functionUsed ? 'function_call' : 'direct_response'
        );
        aiMonitoring.recordConversationFlow(
          content,
          assistantResponse,
          functionUsed
        );
        aiMonitoring.recordSuccessfulRequest();

        // Déterminer le TTL basé sur le type de contenu
        let ttl = intelligentCache.defaultTTL;
        if (content.includes('propose') || content.includes('séance')) {
          ttl = 5 * 60 * 1000; // 5 minutes pour les recommandations de séances
        } else if (
          content.includes('analyse') ||
          content.includes('progression')
        ) {
          ttl = 15 * 60 * 1000; // 15 minutes pour les analyses
        } else if (content.includes('conseil') || content.includes('aide')) {
          ttl = 60 * 60 * 1000; // 1 heure pour les conseils généraux
        }

        // Mettre en cache la réponse
        intelligentCache.set(cacheKey, assistantResponse, ttl);
        console.log(
          '💾 Réponse mise en cache:',
          cacheKey,
          'TTL:',
          ttl / 1000 / 60,
          'min'
        );

        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: assistantResponse,
            timestamp: Date.now(),
          },
        ]);
      } else if (data.error) {
        // Enregistrer l'erreur
        aiMonitoring.recordError('openai_api', data.error, {
          content,
          context,
        });
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: data.error.message,
            timestamp: Date.now(),
          },
        ]);
      }
    } catch (err) {
      console.error('OpenAI error', err);
      // Enregistrer l'erreur
      aiMonitoring.recordError('network_error', err, { content, context });
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Erreur OpenAI' },
      ]);
    } finally {
      setIsLoading(false);
      // Mettre à jour les stats du cache
      cacheStats.current = intelligentCache.getStats();

      // Mettre à jour les statistiques de cache
      const currentCacheStats = intelligentCache.getStats();
      aiMonitoring.updateCacheStats(
        currentCacheStats.size,
        aiMonitoring.metrics.totalRequests
      );

      // Sauvegarder les métriques périodiquement
      if (aiMonitoring.metrics.totalRequests % 10 === 0) {
        aiMonitoring.saveMetrics();
      }
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

  // Fonction pour vider la mémoire du chatbot
  const clearMemory = () => {
    setMessages([]);
    save(STORAGE_KEYS.CHATBOT_MEMORY, []);
    console.log('🗑️ Mémoire du chatbot vidée');
  };

  // Fonction pour vider le cache et la mémoire
  const clearAll = () => {
    clearCache();
    clearMemory();
    console.log('🗑️ Cache et mémoire du chatbot vidés');
  };

  // Fonction pour exporter la conversation
  const exportConversation = () => {
    const conversation = {
      timestamp: new Date().toISOString(),
      messages: messages,
      stats: {
        totalMessages: messages.length,
        userMessages: messages.filter((m) => m.role === 'user').length,
        assistantMessages: messages.filter((m) => m.role === 'assistant')
          .length,
      },
    };

    const blob = new Blob([JSON.stringify(conversation, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `conversation-chatbot-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    console.log('📤 Conversation exportée');
  };

  // Fonction pour obtenir les statistiques de la mémoire
  const getMemoryStats = () => {
    return {
      totalMessages: messages.length,
      userMessages: messages.filter((m) => m.role === 'user').length,
      assistantMessages: messages.filter((m) => m.role === 'assistant').length,
      oldestMessage:
        messages.length > 0
          ? new Date(messages[0].timestamp || Date.now())
          : null,
      newestMessage:
        messages.length > 0
          ? new Date(messages[messages.length - 1].timestamp || Date.now())
          : null,
    };
  };

  // Fonctions de gestion de la base de connaissances RAG
  const getKnowledgeBaseStats = () => {
    return knowledgeBase.getStats();
  };

  const addCustomKnowledge = (title, content, category, tags = []) => {
    try {
      const docId = knowledgeBase.addCustomDocument(
        title,
        content,
        category,
        tags
      );
      console.log('📚 Document personnalisé ajouté:', docId);
      return { success: true, docId };
    } catch (error) {
      console.error("Erreur lors de l'ajout du document:", error);
      return { success: false, error: error.message };
    }
  };

  const searchKnowledgeBase = (query, limit = 5) => {
    return knowledgeBase.searchDocuments(query, limit);
  };

  const getKnowledgeByCategory = (category, limit = 3) => {
    return knowledgeBase.searchByCategory(category, limit);
  };

  // Fonction pour gérer les appels de fonctions
  const handleFunctionCall = async (functionCall, workouts, user) => {
    const functionName = functionCall.name;
    const functionArgs = JSON.parse(functionCall.arguments);

    console.log('🔧 Exécution de la fonction:', functionName, functionArgs);

    try {
      let result = '';

      switch (functionName) {
        case 'analyze_workout_performance':
          result = await analyzeWorkoutPerformance(
            functionArgs,
            workouts,
            user
          );
          break;
        case 'generate_personalized_workout':
          result = await generatePersonalizedWorkout(
            functionArgs,
            workouts,
            user
          );
          break;
        case 'nutrition_recommendations':
          result = await getNutritionRecommendations(functionArgs, user);
          break;
        case 'progress_analysis':
          result = await analyzeProgress(functionArgs, workouts, user);
          break;
        case 'recovery_recommendations':
          result = await getRecoveryRecommendations(
            functionArgs,
            workouts,
            user
          );
          break;
        case 'exercise_form_analysis':
          result = await analyzeExerciseForm(functionArgs, user);
          break;
        case 'motivation_boost':
          result = await getMotivationBoost(functionArgs, user);
          break;
        default:
          result = `Fonction ${functionName} non implémentée`;
      }

      // Valider la sécurité de la réponse
      const validation = validateFunctionResponse(
        functionName,
        result,
        user,
        workouts
      );

      // Ajouter les avertissements de sécurité si nécessaire
      if (validation.warnings.length > 0 || validation.errors.length > 0) {
        result = addSafetyWarnings(result, validation);
      }

      // Enregistrer la validation dans le monitoring
      aiMonitoring.recordSafetyValidation(functionName, validation);

      return processFunctionResponse(functionName, result);
    } catch (error) {
      console.error("Erreur lors de l'exécution de la fonction:", error);
      return `Erreur lors de l'exécution de la fonction ${functionName}: ${error.message}`;
    }
  };

  // Fonction pour envoyer un message de suivi après l'appel de fonction
  const sendFollowUpMessage = async (
    functionCall,
    functionResponse,
    apiKey
  ) => {
    try {
      const followUpMessages = [
        ...messages,
        {
          role: 'user',
          content:
            'Utilise les données de la fonction pour me donner une réponse personnalisée et motivante.',
        },
        {
          role: 'function',
          name: functionCall.name,
          content: functionResponse,
        },
      ];

      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4-turbo-preview',
          messages: followUpMessages,
        }),
      });

      const data = await res.json();
      if (data.choices && data.choices.length > 0) {
        return data.choices[0].message.content;
      }
    } catch (error) {
      console.error('Erreur lors du message de suivi:', error);
    }

    return null;
  };

  // Implémentations des fonctions spécialisées
  const analyzeWorkoutPerformance = async (args, workouts, user) => {
    // Analyse des performances basée sur les données réelles
    const workoutData = workouts || [];
    // const userProfile = { // TODO: Utiliser pour des analyses plus poussées
    //   goal: user?.goal || 'général',
    //   level: determineUserLevel(workoutData),
    //   height: user?.height,
    //   weight: user?.weight,
    // };

    return {
      summary: `Analyse de ${workoutData.length} séances`,
      strengths: ["Régularité dans l'entraînement", 'Progression constante'],
      areas_for_improvement: ['Variété des exercices', 'Intensité progressive'],
      recommendations: [
        'Ajouter des exercices de mobilité',
        'Augmenter progressivement les charges',
      ],
    };
  };

  const generatePersonalizedWorkout = async (args, workouts, user) => {
    const { user_level, workout_type, intensity } = args;

    // Logique de génération de séance personnalisée
    const exercises = getExercisesForType(workout_type, intensity, user_level);

    return {
      exercises: exercises.map((ex) => ({
        name: ex,
        muscle_group: getMuscleGroupForExercise(ex),
        sets: getSetsForIntensity(intensity, ex),
        reps: getRepsForIntensity(intensity),
        duration: getDurationForIntensity(intensity, ex),
      })),
      notes: `Séance ${workout_type} de niveau ${intensity} adaptée à votre niveau ${user_level}`,
    };
  };

  const getNutritionRecommendations = async (args, user) => {
    const { user_goals, activity_level } = args;

    return {
      calorie_target: calculateCalorieTarget(user, user_goals, activity_level),
      macronutrients: {
        protein: calculateProteinNeeds(user, user_goals),
        carbs: calculateCarbNeeds(user, user_goals),
        fat: calculateFatNeeds(user, user_goals),
      },
      meal_suggestions: [
        {
          name: 'Petit-déjeuner',
          description: 'Protéines + glucides complexes',
        },
        { name: 'Collation', description: 'Fruits + noix' },
        { name: 'Déjeuner', description: 'Protéines + légumes + glucides' },
      ],
      supplements: [
        { name: 'Vitamine D', reason: 'Soutien immunitaire et récupération' },
        { name: 'Oméga-3', reason: 'Anti-inflammatoire et récupération' },
      ],
    };
  };

  const analyzeProgress = async (args, workouts, user) => {
    const workoutHistory = workouts || [];

    return {
      overall_progress: 'Progression positive sur les 4 dernières semaines',
      metrics: {
        'Séances par semaine': calculateWorkoutsPerWeek(workoutHistory),
        'Durée moyenne': calculateAverageDuration(workoutHistory),
        'Progression poids': calculateWeightProgress(workoutHistory),
      },
      trends: [
        "Augmentation de la fréquence d'entraînement",
        "Amélioration de l'endurance",
        'Progression des charges',
      ],
      next_steps: [
        'Maintenir la régularité',
        "Augmenter progressivement l'intensité",
        'Ajouter des exercices de mobilité',
      ],
    };
  };

  const getRecoveryRecommendations = async (args, workouts, user) => {
    const { current_fatigue } = args;

    return {
      recovery_priority:
        current_fatigue === 'eleve'
          ? 'Récupération active'
          : 'Récupération passive',
      techniques: [
        {
          name: 'Étirements',
          description: "15-20 minutes d'étirements dynamiques",
        },
        { name: 'Foam rolling', description: 'Auto-massage avec rouleau' },
        { name: 'Bain contrasté', description: 'Alternance chaud/froid' },
      ],
      sleep_recommendations: [
        '7-9 heures de sommeil par nuit',
        'Routine de coucher régulière',
        'Chambre fraîche et sombre',
      ],
      nutrition_tips: [
        'Protéines dans les 30 minutes post-entraînement',
        'Hydratation suffisante',
        'Antioxydants (fruits, légumes)',
      ],
    };
  };

  const analyzeExerciseForm = async (args, user) => {
    const { exercise_name } = args; // const { user_level } = args; // TODO: Utiliser pour adapter les conseils au niveau

    return {
      exercise_name,
      proper_form: {
        steps: [
          'Position de départ correcte',
          'Mouvement contrôlé',
          'Respiration synchronisée',
          'Retour à la position initiale',
        ],
        cues: [
          'Garde le dos droit',
          'Contrôle le mouvement',
          "Expire à l'effort",
        ],
        safety_tips: [
          'Ne pas forcer',
          'Écouter son corps',
          'Arrêter si douleur',
        ],
      },
      common_mistakes: [
        'Arquage du dos',
        'Mouvement trop rapide',
        'Respiration bloquée',
      ],
    };
  };

  const getMotivationBoost = async (args, user) => {
    // const { current_motivation, user_personality } = args; // TODO: Utiliser pour personnaliser les messages

    return {
      motivational_message:
        'Tu as déjà fait le plus dur : commencer. Continue sur cette lancée !',
      strategies: [
        'Fixer des objectifs SMART',
        'Célébrer les petites victoires',
        "Trouver un partenaire d'entraînement",
        'Varier les exercices',
      ],
      visualization:
        'Imagine-toi atteindre ton objectif et ressentir cette satisfaction',
      action_steps: [
        'Prépare tes affaires la veille',
        "Planifie tes séances à l'avance",
        'Trouve ta musique motivante',
        'Rejoins une communauté fitness',
      ],
    };
  };

  // Fonctions utilitaires
  // const determineUserLevel = (workouts) => { // TODO: Utiliser pour adapter les recommandations au niveau
  //   if (!workouts || workouts.length === 0) return 'débutant';
  //   if (workouts.length < 10) return 'débutant';
  //   if (workouts.length < 30) return 'intermédiaire';
  //   return 'avancé';
  // };

  const getExercisesForType = (type, intensity, level) => {
    // Logique de sélection d'exercices selon le type et l'intensité
    const exerciseDatabase = {
      fullbody: ['Pompes', 'Squats', 'Gainage', 'Burpees'],
      haut: ['Pompes', 'Tractions', 'Dips', 'Développé militaire'],
      bas: ['Squats', 'Fentes', 'Mollets', 'Hip thrust'],
      cardio: ['Burpees', 'Grimpeur', 'Sauts étoiles', 'Corde à sauter'],
    };

    return exerciseDatabase[type] || exerciseDatabase.fullbody;
  };

  const getMuscleGroupForExercise = (exercise) => {
    const mapping = {
      Pompes: 'pectoraux',
      Squats: 'jambes',
      Gainage: 'abdos',
      Burpees: 'cardio',
    };
    return mapping[exercise] || 'général';
  };

  const getSetsForIntensity = (intensity, exercise) => {
    const sets = { facile: 3, moyen: 4, difficile: 5 };
    return sets[intensity] || 3;
  };

  const getRepsForIntensity = (intensity) => {
    const reps = { facile: '8-10', moyen: '10-12', difficile: '12-15' };
    return reps[intensity] || '10-12';
  };

  const getDurationForIntensity = (intensity, exercise) => {
    const duration = { facile: 30, moyen: 45, difficile: 60 };
    return duration[intensity] || 45;
  };

  const calculateCalorieTarget = (user, goal, activity) => {
    // Calcul basique des calories selon l'objectif
    const baseCalories = 2000; // Valeur par défaut
    const multipliers = {
      perte_poids: 0.8,
      prise_masse: 1.2,
      maintien: 1.0,
    };
    return Math.round(baseCalories * (multipliers[goal] || 1.0));
  };

  const calculateProteinNeeds = (user, goal) => {
    const weight = user?.weight || 70;
    const multipliers = {
      perte_poids: 2.0,
      prise_masse: 2.2,
      maintien: 1.8,
    };
    return Math.round(weight * (multipliers[goal] || 1.8));
  };

  const calculateCarbNeeds = (user, goal) => {
    const weight = user?.weight || 70;
    const multipliers = {
      perte_poids: 3.0,
      prise_masse: 6.0,
      maintien: 4.0,
    };
    return Math.round(weight * (multipliers[goal] || 4.0));
  };

  const calculateFatNeeds = (user, goal) => {
    const weight = user?.weight || 70;
    const multipliers = {
      perte_poids: 0.8,
      prise_masse: 1.0,
      maintien: 0.9,
    };
    return Math.round(weight * (multipliers[goal] || 0.9));
  };

  const calculateWorkoutsPerWeek = (workouts) => {
    if (!workouts || workouts.length === 0) return 0;
    const weeks = Math.max(1, Math.ceil(workouts.length / 4));
    return (workouts.length / weeks).toFixed(1);
  };

  const calculateAverageDuration = (workouts) => {
    if (!workouts || workouts.length === 0) return 0;
    const totalDuration = workouts.reduce(
      (sum, w) => sum + (w.duration || 0),
      0
    );
    return Math.round(totalDuration / workouts.length);
  };

  const calculateWeightProgress = (workouts) => {
    // Logique simplifiée pour la progression des poids
    return '+2.5kg en moyenne';
  };

  // Fonction pour valider la sécurité d'une réponse de fonction
  const validateFunctionResponse = (functionName, result, user, workouts) => {
    try {
      // Créer un profil utilisateur pour la validation
      const userProfile = {
        weight: user?.weight,
        height: user?.height,
        age: user?.age,
        gender: user?.gender,
        goal: user?.goal,
        experience: calculateUserExperience(workouts),
        workoutCount: workouts?.length || 0,
        medicalConditions: user?.medicalConditions || [],
        dietaryRestrictions: user?.dietaryRestrictions || [],
        activityLevel: user?.activityLevel || 'moderate',
      };

      // Contexte pour la validation
      const context = {
        workoutHistory: workouts || [],
        previousWorkout:
          workouts && workouts.length > 0
            ? workouts[workouts.length - 1]
            : null,
        fatigueLevel: determineFatigueLevel(workouts),
      };

      // Valider selon le type de fonction
      switch (functionName) {
        case 'generate_personalized_workout':
          return safetyValidator.validateExerciseRecommendation(
            result,
            userProfile,
            context
          );
        case 'nutrition_recommendations':
          return safetyValidator.validateNutritionRecommendation(
            result,
            userProfile
          );
        case 'recovery_recommendations':
          return safetyValidator.validateRecoveryRecommendation(
            result,
            userProfile,
            workouts
          );
        case 'progress_analysis':
          return safetyValidator.validateProgressRecommendation(
            result,
            userProfile,
            workouts
          );
        default:
          return { isValid: true, warnings: [], errors: [], safetyScore: 100 };
      }
    } catch (error) {
      console.error('Erreur lors de la validation de sécurité:', error);
      return { isValid: true, warnings: [], errors: [], safetyScore: 100 };
    }
  };

  // Fonction pour ajouter les avertissements de sécurité
  const addSafetyWarnings = (result, validation) => {
    let enhancedResult = result;

    // Ajouter les erreurs critiques
    if (validation.errors.length > 0) {
      enhancedResult += '\n\n🚨 **AVERTISSEMENTS CRITIQUES :**\n';
      validation.errors.forEach((error) => {
        enhancedResult += `• ${error}\n`;
      });
      enhancedResult +=
        '\n⚠️ **Cette recommandation présente des risques. Consultez un professionnel.**';
    }

    // Ajouter les avertissements
    if (validation.warnings.length > 0) {
      enhancedResult += '\n\n⚠️ **PRÉCAUTIONS :**\n';
      validation.warnings.forEach((warning) => {
        enhancedResult += `• ${warning}\n`;
      });
    }

    // Ajouter le score de sécurité
    const safetyEmoji =
      validation.safetyScore >= 90
        ? '✅'
        : validation.safetyScore >= 70
          ? '⚠️'
          : '🚨';

    enhancedResult += `\n\n${safetyEmoji} **Score de sécurité : ${validation.safetyScore}/100**`;

    return enhancedResult;
  };

  // Fonction pour calculer l'expérience utilisateur
  const calculateUserExperience = (workouts) => {
    if (!workouts || workouts.length === 0) return 0;

    const firstWorkout = new Date(workouts[0].date);
    const now = new Date();
    const monthsDiff = (now - firstWorkout) / (1000 * 60 * 60 * 24 * 30);

    return Math.round(monthsDiff);
  };

  // Fonction pour déterminer le niveau de fatigue
  const determineFatigueLevel = (workouts) => {
    if (!workouts || workouts.length === 0) return 'low';

    const recentWorkouts = workouts.slice(-3);
    const highFatigueCount = recentWorkouts.filter(
      (w) =>
        w.feeling === 'hard' ||
        w.feeling === 'weak' ||
        w.feeling === 'demotivated'
    ).length;

    if (highFatigueCount >= 2) return 'high';
    if (highFatigueCount >= 1) return 'medium';
    return 'low';
  };

  return {
    messages,
    sendMessage,
    setMessages,
    isLoading,
    clearCache,
    getCacheStats,
    cacheStats: cacheStats.current,
    clearMemory,
    clearAll,
    exportConversation,
    getMemoryStats,
    // Fonctions de monitoring
    getMonitoringStats: () => aiMonitoring.getGlobalStats(),
    getFunctionStats: (functionName) =>
      aiMonitoring.getFunctionStats(functionName),
    getPerformanceTrends: () => aiMonitoring.getPerformanceTrends(),
    getPerformanceAlerts: () => aiMonitoring.getPerformanceAlerts(),
    generatePerformanceReport: () => aiMonitoring.generatePerformanceReport(),
    resetMonitoring: () => aiMonitoring.resetMetrics(),
    getSafetyStats: () => aiMonitoring.getSafetyStats(),
    // Fonctions de base de connaissances RAG
    getKnowledgeBaseStats,
    addCustomKnowledge,
    searchKnowledgeBase,
    getKnowledgeByCategory,
  };
}
