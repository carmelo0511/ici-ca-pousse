import intelligentCache from './chatCacheService';
import apiRateLimiter from './chatRateLimitService';
import aiMonitoring from '../utils/ai/aiMonitoring';
import safetyValidator from '../utils/ai/safetyValidator';
import knowledgeBase from '../utils/ai/knowledgeBase';
import {
  getRelevantFunctions,
  processFunctionResponse,
} from '../utils/ai/openaiFunctions';

// Détection de langue
const detectLanguage = (text) => {
  if (!text) return 'french';
  
  const englishWords = ['hello', 'hi', 'how', 'what', 'when', 'where', 'why', 'the', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 'have', 'has', 'had', 'will', 'would', 'could', 'should'];
  const frenchWords = ['bonjour', 'salut', 'comment', 'quoi', 'quand', 'où', 'pourquoi', 'le', 'la', 'les', 'et', 'ou', 'mais', 'est', 'sont', 'était', 'étaient', 'avoir', 'a', 'avait', 'sera', 'serait', 'pourrait', 'devrait'];
  
  const words = text.toLowerCase().split(/\s+/);
  let englishCount = 0;
  let frenchCount = 0;
  
  words.forEach(word => {
    if (englishWords.includes(word)) englishCount++;
    if (frenchWords.includes(word)) frenchCount++;
  });
  
  return englishCount > frenchCount ? 'english' : 'french';
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

    // Vérifier les limites d'API
    const rateLimitCheck = apiRateLimiter.canMakeRequest();
    if (!rateLimitCheck.canProceed) {
      return this.handleRateLimitExceeded(content, rateLimitCheck);
    }

    // Mettre à jour les statistiques de requêtes
    aiMonitoring.metrics.totalRequests++;

    // Vérifier le cache
    const cacheKey = intelligentCache.generateKey(content, context, height, weight, goal);
    const cachedResponse = intelligentCache.get(cacheKey);
    if (cachedResponse) {
      console.log('💾 Réponse trouvée dans le cache');
      return {
        success: true,
        response: cachedResponse,
        fromCache: true,
        cacheStats: intelligentCache.getStats()
      };
    }

    // Enrichir le contenu avec RAG si nécessaire
    const enrichedContent = await this.enrichContentWithRAG(content, user);

    try {
      // Appel à l'API OpenAI
      const response = await this.callOpenAI(enrichedContent, context, apiKey);
      
      // Traiter les appels de fonction si nécessaire
      if (response.functionCall) {
        const functionResponse = await this.handleFunctionCall(
          response.functionCall, 
          workouts, 
          user
        );
        
        // Envoyer le message de suivi
        const followUpResponse = await this.sendFollowUpMessage(
          response.functionCall,
          functionResponse,
          apiKey
        );
        
        // Enregistrer la requête
        apiRateLimiter.recordRequest();
        
        return {
          success: true,
          response: followUpResponse,
          functionCall: response.functionCall,
          functionResponse: functionResponse
        };
      }

      // Valider la sécurité de la réponse
      const validation = await this.validateResponse(response.content, user, workouts);
      const finalResponse = this.addSafetyWarnings(response.content, validation);

      // Mettre en cache la réponse
      intelligentCache.set(cacheKey, finalResponse);

      // Enregistrer la requête
      apiRateLimiter.recordRequest();

      return {
        success: true,
        response: finalResponse,
        validation: validation,
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

  handleWelcomeMessage(content) {
    const welcomeLanguage = detectLanguage(content || 'bonjour');
    const welcomeMessage = welcomeLanguage === 'english' 
      ? 'Hello, I am Coach Lex IA'
      : 'Bonjour, je suis Coach Lex IA';
    
    return {
      success: true,
      response: welcomeMessage,
      isWelcome: true
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

  async callOpenAI(content, context, apiKey) {
    // Simulation de l'appel OpenAI (à remplacer par l'implémentation réelle)
    // const functions = getRelevantFunctions();
    
    // Ici, vous intégreriez l'appel réel à l'API OpenAI
    // Pour l'instant, retournons une réponse simulée
    return {
      content: `Réponse simulée pour: ${content}`,
      functionCall: null
    };
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
    // Simulation du message de suivi
    return `Fonction ${functionCall.name} exécutée avec succès. Résultat: ${JSON.stringify(functionResponse)}`;
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

    // Ajouter les erreurs critiques
    if (validation.errors.length > 0) {
      enhancedResult += '\n\n🚨 **AVERTISSEMENTS CRITIQUES :**\n';
      validation.errors.forEach((error) => {
        enhancedResult += `• ${error}\n`;
      });
      enhancedResult += '\n⚠️ **Cette recommandation présente des risques. Consultez un professionnel.**';
    }

    // Ajouter les avertissements
    if (validation.warnings.length > 0) {
      enhancedResult += '\n\n⚠️ **PRÉCAUTIONS :**\n';
      validation.warnings.forEach((warning) => {
        enhancedResult += `• ${warning}\n`;
      });
    }

    // Ajouter le score de sécurité
    const safetyEmoji = validation.safetyScore >= 90 ? '✅' : validation.safetyScore >= 70 ? '⚠️' : '🚨';
    enhancedResult += `\n\n${safetyEmoji} **Score de sécurité : ${validation.safetyScore}/100**`;

    return enhancedResult;
  }

  getFallbackResponse(content) {
    const detectedLanguage = detectLanguage(content);
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
}

// Instance singleton
const chatService = new ChatService();

export default chatService; 