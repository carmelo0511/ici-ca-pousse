import { renderHook, act } from '@testing-library/react';

// Mock des services (doivent être placés AVANT l'import du hook !)
jest.mock('../../services/chatService', () => ({
  __esModule: true,
  default: {
    sendMessage: jest.fn(),
    getCacheStats: jest.fn(() => ({ size: 0, hitRate: 0 })),
    getAPILimits: jest.fn(() => ({ daily: { used: 0, limit: 50 } })),
    getMonitoringStats: jest.fn(() => ({ totalRequests: 0 }))
  }
}));

jest.mock('../../services/chatCacheService', () => ({
  __esModule: true,
  default: {
    getStats: jest.fn(() => ({ size: 0, hitRate: 0 })),
    clear: jest.fn()
  }
}));

jest.mock('../../services/chatRateLimitService', () => ({
  __esModule: true,
  default: {
    getStats: jest.fn(() => ({ daily: { used: 0, limit: 50 } })),
    resetLimits: jest.fn()
  }
}));

jest.mock('../../utils/ai/aiMonitoring', () => ({
  __esModule: true,
  default: {
    loadMetrics: jest.fn(),
    resetMetrics: jest.fn(),
    getGlobalStats: jest.fn(() => ({ totalRequests: 0 })),
    getFunctionStats: jest.fn(),
    getPerformanceTrends: jest.fn(),
    getPerformanceAlerts: jest.fn(),
    generatePerformanceReport: jest.fn(),
    getSafetyStats: jest.fn(),
    getKnowledgeBaseStats: jest.fn(),
    addCustomKnowledge: jest.fn(),
    searchKnowledgeBase: jest.fn(),
    getKnowledgeByCategory: jest.fn()
  }
}));

jest.mock('../../utils/firebase/storage', () => ({
  load: jest.fn(() => []),
  save: jest.fn()
}));

import useChatGPTRefactored from '../../hooks/useChatGPTRefactored';

describe('Hook useChatGPTRefactored', () => {
  let chatService;
  let intelligentCache;
  let apiRateLimiter;
  let aiMonitoring;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Récupérer les mocks
    chatService = require('../../services/chatService').default;
    intelligentCache = require('../../services/chatCacheService').default;
    apiRateLimiter = require('../../services/chatRateLimitService').default;
    aiMonitoring = require('../../utils/ai/aiMonitoring').default;
  });

  test('devrait initialiser avec un état vide', () => {
    const { result } = renderHook(() => useChatGPTRefactored('test-api-key'));
    
    expect(result.current.messages).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });

  test('devrait envoyer un message avec succès', async () => {
    const mockResponse = {
      success: true,
      response: 'Réponse de test',
      fromCache: false
    };
    
    chatService.sendMessage.mockResolvedValue(mockResponse);
    
    const { result } = renderHook(() => useChatGPTRefactored('test-api-key'));
    
    await act(async () => {
      await result.current.sendMessage('Message de test');
    });
    
    expect(result.current.messages).toHaveLength(2);
    expect(result.current.messages[0]).toMatchObject({
      role: 'user',
      content: 'Message de test'
    });
    expect(result.current.messages[1]).toMatchObject({
      role: 'assistant',
      content: 'Réponse de test'
    });
  });

  test('devrait gérer les erreurs de service', async () => {
    const mockError = {
      success: false,
      error: 'Erreur de service',
      fallbackResponse: 'Réponse de secours'
    };
    
    chatService.sendMessage.mockResolvedValue(mockError);
    
    const { result } = renderHook(() => useChatGPTRefactored('test-api-key'));
    
    await act(async () => {
      await result.current.sendMessage('Message de test');
    });
    
    expect(result.current.messages).toHaveLength(2);
    expect(result.current.messages[1]).toMatchObject({
      role: 'assistant',
      content: 'Réponse de secours',
      isError: true
    });
  });

  test('devrait gérer les messages d\'accueil', async () => {
    const mockWelcome = {
      success: true,
      response: 'Bonjour, je suis Coach Lex IA',
      isWelcome: true
    };
    
    chatService.sendMessage.mockResolvedValue(mockWelcome);
    
    const { result } = renderHook(() => useChatGPTRefactored('test-api-key'));
    
    await act(async () => {
      await result.current.sendMessage('bonjour', null, null, null, null, true);
    });
    
    expect(result.current.messages).toHaveLength(2);
    expect(result.current.messages[1].content).toBe('Bonjour, je suis Coach Lex IA');
  });

  test('devrait effacer la mémoire', () => {
    const { result } = renderHook(() => useChatGPTRefactored('test-api-key'));
    
    // Ajouter quelques messages
    act(() => {
      result.current.setMessages([
        { role: 'user', content: 'Test' },
        { role: 'assistant', content: 'Réponse' }
      ]);
    });
    
    expect(result.current.messages).toHaveLength(2);
    
    // Effacer la mémoire
    act(() => {
      result.current.clearMemory();
    });
    
    expect(result.current.messages).toHaveLength(0);
  });

  test('devrait effacer toutes les données', () => {
    const { result } = renderHook(() => useChatGPTRefactored('test-api-key'));
    
    act(() => {
      result.current.clearAll();
    });
    
    expect(intelligentCache.clear).toHaveBeenCalled();
    expect(apiRateLimiter.resetLimits).toHaveBeenCalled();
    expect(aiMonitoring.resetMetrics).toHaveBeenCalled();
  });

  test('devrait obtenir les statistiques de mémoire', () => {
    const { result } = renderHook(() => useChatGPTRefactored('test-api-key'));
    
    // Ajouter des messages
    act(() => {
      result.current.setMessages([
        { role: 'user', content: 'Test 1' },
        { role: 'assistant', content: 'Réponse 1', fromCache: true },
        { role: 'user', content: 'Test 2' },
        { role: 'assistant', content: 'Réponse 2', isError: true }
      ]);
    });
    
    const stats = result.current.getMemoryStats();
    
    expect(stats.totalMessages).toBe(4);
    expect(stats.userMessages).toBe(2);
    expect(stats.assistantMessages).toBe(2);
    expect(stats.cachedResponses).toBe(1);
    expect(stats.errorMessages).toBe(1);
  });

  test('devrait gérer les appels de fonction', async () => {
    const mockFunctionResponse = {
      success: true,
      response: 'Fonction exécutée',
      functionCall: { name: 'testFunction' },
      functionResponse: { result: 'success' }
    };
    
    chatService.sendMessage.mockResolvedValue(mockFunctionResponse);
    
    const { result } = renderHook(() => useChatGPTRefactored('test-api-key'));
    
    await act(async () => {
      await result.current.sendMessage('Exécuter une fonction');
    });
    
    expect(result.current.messages).toHaveLength(2);
    expect(result.current.messages[1].content).toBe('Fonction exécutée');
  });

  test('devrait gérer les réponses du cache', async () => {
    const mockCachedResponse = {
      success: true,
      response: 'Réponse du cache',
      fromCache: true
    };
    
    chatService.sendMessage.mockResolvedValue(mockCachedResponse);
    
    const { result } = renderHook(() => useChatGPTRefactored('test-api-key'));
    
    await act(async () => {
      await result.current.sendMessage('Message avec cache');
    });
    
    expect(result.current.messages).toHaveLength(2);
    expect(result.current.messages[1]).toMatchObject({
      role: 'assistant',
      content: 'Réponse du cache',
      fromCache: true
    });
  });
}); 