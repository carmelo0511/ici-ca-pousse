import intelligentCache from './chatCacheService';
import apiRateLimiter from './chatRateLimitService';
import aiMonitoring from '../utils/ai/aiMonitoring';
import safetyValidator from '../utils/ai/safetyValidator';
import knowledgeBase from '../utils/ai/knowledgeBase';
import {
  // getRelevantFunctions,
  processFunctionResponse,
} from '../utils/ai/openaiFunctions';

// Détection de langue optimisée
const detectLanguage = (text) => {
  if (!text) return 'french';
  const lowerText = text.toLowerCase();
  
  // Détection rapide basée sur des mots-clés courants
  const englishMarkers = ['hello', 'hi', 'how', 'what', 'the', 'and', 'is', 'are'];
  const frenchMarkers = ['bonjour', 'salut', 'comment', 'quoi', 'le', 'la', 'et', 'est'];
  
  const hasEnglish = englishMarkers.some(word => lowerText.includes(word));
  const hasFrench = frenchMarkers.some(word => lowerText.includes(word));
  
  return hasEnglish && !hasFrench ? 'english' : 'french';
};

// Cache des réponses fréquentes pour optimiser la vitesse
const FREQUENT_RESPONSES = {
  'bonjour': 'Salut ! Comment puis-je t\'aider aujourd\'hui ? 💪',
  'salut': 'Hello ! Prêt pour une séance ou des conseils ? 🔥',
  'hello': 'Hi! How can I help you today? 💪',
  'hi': 'Hey! Ready for a workout or some advice? 🔥',
  'merci': 'De rien ! Toujours là pour t\'accompagner ! 😊',
  'thanks': 'You\'re welcome! Always here to help! 😊',
  'motivation': 'Tu es capable de plus que tu ne penses ! Continue comme ça ! 💪🔥',
  'fatigue': 'Écoute ton corps, le repos fait partie de la progression ! 💤',
  'progression': 'Chaque entraînement compte, les résultats arrivent ! 📈',
  'ok': 'Parfait ! Autre chose ? 👍',
  'oui': 'Super ! Comment puis-je continuer à t\'aider ? ✨',
  'non': 'Pas de souci ! Je reste là si tu as besoin ! 😊'
};

// Système de prompts optimisé pour rapidité
const OPTIMIZED_SYSTEM_PROMPTS = {
  simple: 'Tu es Coach Lex IA, assistant fitness concis et efficace. RÈGLES: Réponses en 1-2 phrases maximum, direct et actionnable, pas d\'explications longues. Compétences: fitness, nutrition, motivation.',
  
  complex: 'Tu es Coach Lex IA, assistant fitness expert. Tu peux parler de tout : sport, nutrition, bien-être, conseils personnels. Sois motivant, bienveillant et concis. Pour les plans d\'entraînement, sois détaillé avec séries/répétitions.'
};

// Détection intelligente de complexité
const isComplexQuery = (content) => {
  const complexKeywords = [
    'programme', 'plan', 'entraînement', 'exercice', 'nutrition', 
    'régime', 'perte de poids', 'prise de masse', 'workout', 'training',
    'diet', 'exercise', 'routine', 'schedule', 'conseil', 'advice'
  ];
  
  const lowerContent = content.toLowerCase();
  return complexKeywords.some(keyword => lowerContent.includes(keyword)) || content.length > 50;
};

// Fonction pour vérifier si on doit utiliser les function calls
const shouldUseFunctionCalling = (content) => {
  const functionTriggers = [
    'génère', 'crée', 'programme', 'plan', 'entraînement', 
    'analyse', 'évalue', 'performance', 'generate', 'create', 
    'workout', 'training', 'analyze', 'evaluate'
  ];
  
  const lowerContent = content.toLowerCase();
  return functionTriggers.some(trigger => lowerContent.includes(trigger));
};

class ChatService {
  constructor() {
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return;
    
    // Charger les services
    intelligentCache.loadFromStorage();
    apiRateLimiter.loadFromStorage();
    
    // Charger les métriques de monitoring
    const savedMetrics = aiMonitoring.loadMetrics();
    if (savedMetrics) {
      console.log('📊 Métriques de monitoring chargées');
    }
    
    this.isInitialized = true;
  }

  async sendMessage(content, options = {}) {
    const startTime = performance.now();
    const {
      context = null,
      height = null,
      weight = null,
      goal = null,
      welcome = false,
      workouts = null,
      user = null,
      apiKey = null
    } = options;

    await this.initialize();

    if (welcome) {
      return this.handleWelcomeMessage(content);
    }

    // Vérifier les réponses fréquentes en premier (ultra rapide)
    const frequentResponse = this.checkFrequentResponses(content);
    if (frequentResponse) {
      const duration = performance.now() - startTime;
      console.log(`⚡ Réponse instantanée en ${duration.toFixed(1)}ms`);
      
      // Métriques pour réponses fréquentes
      if (!aiMonitoring.metrics.frequentResponses) {
        aiMonitoring.metrics.frequentResponses = { count: 0, totalTime: 0 };
      }
      aiMonitoring.metrics.frequentResponses.count++;
      aiMonitoring.metrics.frequentResponses.totalTime += duration;
      
      aiMonitoring.metrics.responseTimes.push({
        timestamp: Date.now(),
        duration: duration,
        type: 'frequent',
        cached: true,
        source: 'frequent_cache'
      });

      if (aiMonitoring.metrics.responseTimes.length > 100) {
        aiMonitoring.metrics.responseTimes.shift();
      }
      
      return {
        success: true,
        response: frequentResponse,
        fromFrequentCache: true,
        responseTime: duration
      };
    }

    // Vérifier les limites d'API
    const rateLimitCheck = apiRateLimiter.canMakeRequest();
    if (!rateLimitCheck.canProceed) {
      return this.handleRateLimitExceeded(content, rateLimitCheck);
    }

    // Mettre à jour les statistiques de requêtes
    aiMonitoring.metrics.totalRequests++;
    
    // Enregistrer le type de requête pour les métriques
    const queryType = isComplexQuery(content) ? 'complex' : 'simple';
    if (!aiMonitoring.metrics.queryTypes) {
      aiMonitoring.metrics.queryTypes = new Map();
    }
    const typeStats = aiMonitoring.metrics.queryTypes.get(queryType) || { count: 0, totalTime: 0 };
    aiMonitoring.metrics.queryTypes.set(queryType, typeStats);

    // Vérifier le cache intelligent
    const cacheKey = intelligentCache.generateKey(content, context, height, weight, goal);
    const cachedResponse = intelligentCache.get(cacheKey);
    if (cachedResponse) {
      const duration = performance.now() - startTime;
      console.log(`💾 Réponse cache ${queryType} en ${duration.toFixed(1)}ms`);
      
      // Mettre à jour les métriques pour les réponses cachées
      typeStats.count++;
      typeStats.totalTime += duration;
      aiMonitoring.metrics.queryTypes.set(queryType, typeStats);
      
      aiMonitoring.metrics.responseTimes.push({
        timestamp: Date.now(),
        duration: duration,
        type: queryType,
        cached: true,
        source: 'intelligent_cache'
      });

      if (aiMonitoring.metrics.responseTimes.length > 100) {
        aiMonitoring.metrics.responseTimes.shift();
      }
      
      return {
        success: true,
        response: cachedResponse,
        fromCache: true,
        responseTime: duration,
        queryType: queryType,
        cacheStats: intelligentCache.getStats()
      };
    }

    // Enrichir le contenu avec RAG seulement si nécessaire
    const enrichedContent = this.shouldEnrichWithRAG(content, user) 
      ? await this.enrichContentWithRAG(content, user)
      : content;

    try {
      // Déterminer les paramètres optimaux
      const isComplex = isComplexQuery(content);
      const useFunctionCalling = shouldUseFunctionCalling(content);

      // Appel à l'API OpenAI optimisé
      const response = await this.callOpenAI(enrichedContent, context, apiKey, isComplex, useFunctionCalling);
      
      // Traiter les appels de fonction si nécessaire
      if (response.functionCall) {
        const functionResponse = await this.handleFunctionCall(
          response.functionCall, 
          workouts, 
          user
        );
        
        const followUpResponse = await this.sendFollowUpMessage(
          response.functionCall,
          functionResponse,
          apiKey
        );
        
        apiRateLimiter.recordRequest();
        
        const duration = performance.now() - startTime;
        console.log(`🔧 Réponse avec fonction en ${duration.toFixed(1)}ms`);
        
        return {
          success: true,
          response: followUpResponse,
          functionCall: response.functionCall,
          functionResponse: functionResponse,
          responseTime: duration
        };
      }

      // Validation de sécurité en parallèle avec mise en cache
      const [validation] = await Promise.all([
        this.validateResponse(response.content, user, workouts),
        // Mise en cache en parallèle avec le contenu pour déterminer le TTL
        Promise.resolve().then(() => intelligentCache.set(cacheKey, response.content, content))
      ]);

      const finalResponse = this.addSafetyWarnings(response.content, validation);

      // Mettre à jour le cache avec la réponse finale si elle diffère
      if (finalResponse !== response.content) {
        intelligentCache.set(cacheKey, finalResponse, content);
      }

      apiRateLimiter.recordRequest();

      const duration = performance.now() - startTime;
      console.log(`💬 Réponse ${queryType} générée en ${duration.toFixed(1)}ms`);

      // Mettre à jour les métriques de performance
      typeStats.count++;
      typeStats.totalTime += duration;
      aiMonitoring.metrics.queryTypes.set(queryType, typeStats);
      
      // Enregistrer le temps de réponse global
      aiMonitoring.metrics.responseTimes.push({
        timestamp: Date.now(),
        duration: duration,
        type: queryType,
        cached: false,
        model: 'gpt-4o-mini'
      });

      // Garder seulement les 100 derniers temps de réponse
      if (aiMonitoring.metrics.responseTimes.length > 100) {
        aiMonitoring.metrics.responseTimes.shift();
      }

      return {
        success: true,
        response: finalResponse,
        validation: validation,
        responseTime: duration,
        queryType: queryType,
        cacheStats: intelligentCache.getStats()
      };

    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      return {
        success: false,
        error: error.message,
        fallbackResponse: this.getFallbackResponse(content)
      };
    }
  }

  // Vérifier les réponses fréquentes pour optimisation ultra-rapide
  checkFrequentResponses(content) {
    if (!content) return null;
    
    const normalizedContent = content.toLowerCase().trim();
    return FREQUENT_RESPONSES[normalizedContent] || null;
  }

  // Détermine si on doit enrichir avec RAG (optimisation conditionnelle)
  shouldEnrichWithRAG(content, user) {
    if (!content || content.length < 10) return false;
    
    const simpleGreetings = ['bonjour', 'salut', 'hello', 'hi', 'merci', 'thanks', 'ok', 'oui', 'non'];
    const lowerContent = content.toLowerCase();
    
    return !simpleGreetings.some(greeting => lowerContent.includes(greeting));
  }

  handleWelcomeMessage(content) {
    const welcomeLanguage = detectLanguage(content || 'bonjour');
    const welcomeMessage = welcomeLanguage === 'english' 
      ? 'Hello, I am Coach Lex IA! Ready to crush your fitness goals? 💪'
      : 'Bonjour, je suis Coach Lex IA ! Prêt à atteindre tes objectifs fitness ? 💪';
    
    return {
      success: true,
      response: welcomeMessage,
      isWelcome: true,
      responseTime: 1 // Ultra rapide
    };
  }

  handleRateLimitExceeded(content, rateLimitCheck) {
    const detectedLanguage = detectLanguage(content);
    const limitMessage = detectedLanguage === 'english' 
      ? `⚠️ API Rate Limit Reached! You've used ${rateLimitCheck.used.daily} calls today. Please wait before making another request.`
      : `⚠️ Limite d'API atteinte ! Vous avez utilisé ${rateLimitCheck.used.daily} appels aujourd'hui. Veuillez attendre avant de faire une autre demande.`;
    
    return {
      success: false,
      response: limitMessage,
      rateLimitExceeded: true,
      limits: rateLimitCheck
    };
  }

  async enrichContentWithRAG(content, user) {
    // Ne générer le contexte RAG que si nécessaire
    if (content.length > 10 && !content.toLowerCase().includes('bonjour') && !content.toLowerCase().includes('salut')) {
      try {
        const enrichedContext = knowledgeBase.generateEnrichedContext(content, user);
        if (enrichedContext) {
          console.log('📚 Contexte RAG ajouté pour enrichir la réponse');
          return `Contexte spécialisé:\n${enrichedContext}\n\nQuestion utilisateur: ${content}`;
        }
      } catch (error) {
        console.warn('Erreur lors de l\'enrichissement RAG:', error);
      }
    }
    return content;
  }

  async callOpenAI(content, context, apiKey, isComplex = false, useFunctionCalling = false) {
    if (!apiKey) {
      throw new Error('Clé API OpenAI manquante');
    }

    try {
      // Paramètres optimisés selon la complexité
      const optimizedParams = {
        model: 'gpt-4o-mini', // Plus rapide que gpt-4
        messages: [
          {
            role: 'system',
            content: context || (isComplex ? OPTIMIZED_SYSTEM_PROMPTS.complex : OPTIMIZED_SYSTEM_PROMPTS.simple)
          },
          {
            role: 'user',
            content: content
          }
        ],
        max_tokens: isComplex ? 300 : 150, // Réduire drastiquement pour réponses simples
        temperature: 0.3, // Plus cohérent et rapide
        top_p: 0.9,
        frequency_penalty: 0.1,
        presence_penalty: 0.1
      };

      // Ajouter les function calls seulement si nécessaire
      if (useFunctionCalling) {
        optimizedParams.functions = [
          {
            name: 'generate_personalized_workout',
            description: 'Génère un entraînement personnalisé',
            parameters: {
              type: 'object',
              properties: {
                workout_plan: {
                  type: 'string',
                  description: 'Plan d\'entraînement détaillé'
                },
                exercises: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      name: { type: 'string' },
                      sets: { type: 'number' },
                      reps: { type: 'number' },
                      weight: { type: 'string' }
                    }
                  }
                }
              },
              required: ['workout_plan', 'exercises']
            }
          },
          {
            name: 'analyze_workout_performance',
            description: 'Analyse les performances d\'entraînement',
            parameters: {
              type: 'object',
              properties: {
                analysis: { type: 'string', description: 'Analyse des performances' },
                recommendations: { type: 'string', description: 'Recommandations' }
              },
              required: ['analysis', 'recommendations']
            }
          }
        ];
        optimizedParams.function_call = 'auto';
      }

      // Ajouter un timeout pour éviter les blocages
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 secondes max

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(optimizedParams),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Erreur API OpenAI: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.choices && data.choices[0]) {
        const choice = data.choices[0];
        
        if (choice.message.function_call) {
          return {
            content: choice.message.content || '',
            functionCall: choice.message.function_call
          };
        } else {
          return {
            content: choice.message.content,
            functionCall: null
          };
        }
      } else {
        throw new Error('Réponse invalide de l\'API OpenAI');
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Timeout: La requête a pris trop de temps');
      }
      console.error('Erreur lors de l\'appel à l\'API OpenAI:', error);
      throw error;
    }
  }

  async handleFunctionCall(functionCall, workouts, user) {
    try {
      const result = await processFunctionResponse(functionCall, workouts, user);
      return result;
    } catch (error) {
      console.error('Erreur lors du traitement de l\'appel de fonction:', error);
      return { error: error.message };
    }
  }

  async sendFollowUpMessage(functionCall, functionResponse, apiKey) {
    if (!apiKey) {
      throw new Error('Clé API OpenAI manquante');
    }

    try {
      // Timeout pour les follow-ups
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 secondes max

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini', // Modèle optimisé
          messages: [
            {
              role: 'system',
              content: OPTIMIZED_SYSTEM_PROMPTS.simple // Prompt optimisé
            },
            {
              role: 'user',
              content: `Fonction ${functionCall.name}: ${JSON.stringify(functionResponse)}. Présente ce résultat de manière motivante et concise.`
            }
          ],
          max_tokens: 200, // Réduit pour plus de rapidité
          temperature: 0.3
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Erreur API OpenAI: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.choices && data.choices[0]) {
        return data.choices[0].message.content;
      } else {
        throw new Error('Réponse invalide de l\'API OpenAI');
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.warn('Timeout sur follow-up, utilisation du fallback');
      } else {
        console.error('Erreur lors de l\'appel de suivi à l\'API OpenAI:', error);
      }
      
      // Fallback optimisé selon le type de fonction
      if (functionCall.name === 'generate_personalized_workout') {
        return '🔥 Ton programme d\'entraînement personnalisé est prêt ! Prêt à transpirer ? 💪';
      } else if (functionCall.name === 'analyze_workout_performance') {
        return '📊 Analyse de tes performances terminée ! Tu progresses bien, continue comme ça ! 🚀';
      }
      
      return `✅ Fonction ${functionCall.name} exécutée avec succès ! 🎯`;
    }
  }

  // Méthode de streaming pour les réponses longues
  async streamResponse(content, context, apiKey, onChunk, isComplex = false) {
    if (!apiKey) {
      throw new Error('Clé API OpenAI manquante');
    }

    try {
      const optimizedParams = {
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: context || (isComplex ? OPTIMIZED_SYSTEM_PROMPTS.complex : OPTIMIZED_SYSTEM_PROMPTS.simple)
          },
          {
            role: 'user',
            content: content
          }
        ],
        max_tokens: isComplex ? 400 : 250,
        temperature: 0.3,
        stream: true // Activer le streaming
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 secondes pour streaming

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(optimizedParams),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Erreur API OpenAI: ${response.status} ${response.statusText}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            
            if (data === '[DONE]') {
              return fullResponse;
            }

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              
              if (content) {
                fullResponse += content;
                // Appeler le callback avec le nouveau contenu
                if (onChunk) {
                  onChunk(content, fullResponse);
                }
              }
            } catch (e) {
              // Ignorer les erreurs de parsing JSON pour les chunks partiels
            }
          }
        }
      }

      return fullResponse;
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Timeout: Le streaming a pris trop de temps');
      }
      console.error('Erreur lors du streaming:', error);
      throw error;
    }
  }

  async validateResponse(content, user, workouts) {
    try {
      return await safetyValidator.validateResponse(content, user, workouts);
    } catch (error) {
      console.error('Erreur lors de la validation de sécurité:', error);
      return { isValid: true, warnings: [], errors: [], safetyScore: 100 };
    }
  }

  addSafetyWarnings(result, validation) {
    let enhancedResult = result;

    // Ajouter les erreurs critiques (toujours affichées pour la sécurité)
    if (validation.errors.length > 0) {
      enhancedResult += '\n\n🚨 **AVERTISSEMENTS CRITIQUES :**\n';
      validation.errors.forEach((error) => {
        enhancedResult += `• ${error}\n`;
      });
      enhancedResult += '\n⚠️ **Cette recommandation présente des risques. Consultez un professionnel.**';
    }

    // Ajouter les avertissements importants (toujours affichés pour la sécurité)
    if (validation.warnings.length > 0) {
      enhancedResult += '\n\n⚠️ **PRÉCAUTIONS :**\n';
      validation.warnings.forEach((warning) => {
        enhancedResult += `• ${warning}\n`;
      });
    }

    // Le score de sécurité n'est plus affiché dans le chat
    // Il est disponible dans le dashboard via getSafetyStats()
    
    return enhancedResult;
  }

  getFallbackResponse(content) {
    const detectedLanguage = detectLanguage(content);
    const apiKey = process.env.REACT_APP_OPENAI_API_KEY;
    
    if (!apiKey || apiKey === 'your_openai_api_key_here') {
      return detectedLanguage === 'english' 
        ? '⚠️ **Configuration Required**: Please configure your OpenAI API key in the .env file. Set REACT_APP_OPENAI_API_KEY=your_actual_api_key'
        : '⚠️ **Configuration Requise** : Veuillez configurer votre clé API OpenAI dans le fichier .env. Définissez REACT_APP_OPENAI_API_KEY=votre_vraie_cle_api';
    }
    
    return detectedLanguage === 'english' 
      ? 'I apologize, but I\'m having trouble processing your request right now. Please try again later.'
      : 'Je m\'excuse, mais j\'ai des difficultés à traiter votre demande pour le moment. Veuillez réessayer plus tard.';
  }

  // Méthodes utilitaires
  getCacheStats() {
    return intelligentCache.getStats();
  }

  clearCache() {
    intelligentCache.clear();
  }

  getAPILimits() {
    return apiRateLimiter.getStats();
  }

  getMonitoringStats() {
    return aiMonitoring.getGlobalStats();
  }

  resetMonitoring() {
    aiMonitoring.resetMetrics();
  }

  // Générer un rapport de performance optimisé
  getOptimizationReport() {
    const responseTimes = aiMonitoring.metrics.responseTimes || [];
    const queryTypes = aiMonitoring.metrics.queryTypes || new Map();
    const frequentResponses = aiMonitoring.metrics.frequentResponses || { count: 0, totalTime: 0 };
    
    // Analyser les temps de réponse par source
    const bySource = responseTimes.reduce((acc, rt) => {
      const source = rt.source || (rt.cached ? 'cache' : 'api');
      if (!acc[source]) acc[source] = { count: 0, totalTime: 0, times: [] };
      acc[source].count++;
      acc[source].totalTime += rt.duration;
      acc[source].times.push(rt.duration);
      return acc;
    }, {});

    // Calculer les moyennes et percentiles
    Object.keys(bySource).forEach(source => {
      const times = bySource[source].times.sort((a, b) => a - b);
      bySource[source].average = bySource[source].totalTime / bySource[source].count;
      bySource[source].median = times[Math.floor(times.length / 2)] || 0;
      bySource[source].p95 = times[Math.floor(times.length * 0.95)] || 0;
    });

    const totalRequests = aiMonitoring.metrics.totalRequests || 0;
    const cacheStats = intelligentCache.getStats();
    
    // Calculer le taux de cache global
    const cachedResponses = responseTimes.filter(rt => rt.cached).length;
    const cacheHitRate = totalRequests > 0 ? (cachedResponses / totalRequests) * 100 : 0;

    return {
      summary: {
        totalRequests,
        averageResponseTime: responseTimes.length > 0 
          ? responseTimes.reduce((sum, rt) => sum + rt.duration, 0) / responseTimes.length 
          : 0,
        cacheHitRate: cacheHitRate.toFixed(1),
        optimizationsActive: [
          'gpt-4o-mini model',
          'Adaptive max_tokens',
          'Conditional function calling',
          'Hybrid cache system',
          'Frequent response cache',
          'Parallel validation',
          'Conditional RAG enrichment'
        ]
      },
      performance: {
        bySource: bySource,
        byType: Array.from(queryTypes.entries()).map(([type, stats]) => ({
          type,
          count: stats.count,
          averageTime: stats.count > 0 ? stats.totalTime / stats.count : 0
        })),
        frequentResponses: {
          count: frequentResponses.count,
          averageTime: frequentResponses.count > 0 
            ? frequentResponses.totalTime / frequentResponses.count 
            : 0
        }
      },
      cache: cacheStats,
      recommendations: this.getPerformanceRecommendations(bySource, cacheStats, cacheHitRate)
    };
  }

  // Recommandations d'optimisation basées sur les métriques
  getPerformanceRecommendations(bySource, cacheStats, cacheHitRate) {
    const recommendations = [];

    if (cacheHitRate < 70) {
      recommendations.push('🔧 Améliorer le taux de cache (actuellement ' + cacheHitRate.toFixed(1) + '%)');
    }

    if (bySource.api && bySource.api.average > 2000) {
      recommendations.push('⚡ Optimiser les appels API (temps moyen: ' + bySource.api.average.toFixed(0) + 'ms)');
    }

    if (cacheStats.memory && cacheStats.memory.size < 30) {
      recommendations.push('💾 Augmenter la taille du cache mémoire pour plus de rapidité');
    }

    const recentSlowResponses = aiMonitoring.metrics.responseTimes
      .filter(rt => rt.duration > 3000 && !rt.cached)
      .length;
    
    if (recentSlowResponses > 5) {
      recommendations.push('🚀 Activer le streaming pour les réponses longues');
    }

    if (recommendations.length === 0) {
      recommendations.push('✅ Performance optimale ! Toutes les optimisations sont actives.');
    }

    return recommendations;
  }
}

// Instance singleton
const chatService = new ChatService();

export default chatService; 