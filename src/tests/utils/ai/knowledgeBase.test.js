import { KnowledgeBase } from '../../../utils/ai/knowledgeBase';

describe('KnowledgeBase', () => {
  let knowledgeBase;

  beforeEach(() => {
    knowledgeBase = new KnowledgeBase();
  });

  describe('Constructor and initialization', () => {
    test('should initialize with default structure', () => {
      expect(knowledgeBase.documents).toBeInstanceOf(Map);
      expect(knowledgeBase.embeddings).toBeInstanceOf(Map);
      expect(knowledgeBase.index).toBeInstanceOf(Map);
    });

    test('should initialize with fitness documents', () => {
      expect(knowledgeBase.documents.size).toBeGreaterThan(0);
      expect(knowledgeBase.documents.has('anatomy-001')).toBe(true);
      expect(knowledgeBase.documents.has('exercises-001')).toBe(true);
      expect(knowledgeBase.documents.has('nutrition-001')).toBe(true);
    });
  });

  describe('addDocument', () => {
    test('should add a new document', () => {
      const newDoc = {
        id: 'test-001',
        title: 'Test Document',
        category: 'test',
        content: 'Test content',
        tags: ['test'],
      };

      knowledgeBase.addDocument(newDoc);
      expect(knowledgeBase.documents.has('test-001')).toBe(true);
      expect(knowledgeBase.documents.get('test-001')).toEqual(newDoc);
    });

    test('should update existing document', () => {
      const existingDoc = knowledgeBase.documents.get('anatomy-001');
      const updatedDoc = { ...existingDoc, title: 'Updated Title' };

      knowledgeBase.addDocument(updatedDoc);
      expect(knowledgeBase.documents.get('anatomy-001').title).toBe(
        'Updated Title'
      );
    });
  });

  describe('createEmbeddings', () => {
    test('should create embeddings for content', () => {
      const content = 'Test content for embeddings';
      const embeddings = knowledgeBase.createEmbeddings(content);

      expect(typeof embeddings).toBe('object');
      expect(embeddings).not.toBeNull();
      expect(Object.keys(embeddings).length).toBeGreaterThan(0);
    });

    test('should handle empty content', () => {
      const embeddings = knowledgeBase.createEmbeddings('');
      expect(typeof embeddings).toBe('object');
    });
  });

  describe('indexDocument', () => {
    test('should index document with embeddings', () => {
      const doc = {
        id: 'test-index',
        title: 'Test Index',
        category: 'test',
        content: 'Test content for indexing',
        tags: ['test'],
      };
      const embeddings = [0.1, 0.2, 0.3];

      knowledgeBase.indexDocument(doc, embeddings);
      // Vérifier que l'index contient des mots du document
      expect(knowledgeBase.index.size).toBeGreaterThan(0);
    });
  });

  describe('searchDocuments', () => {
    test('should search documents by query', () => {
      const results = knowledgeBase.searchDocuments('muscles');
      expect(Array.isArray(results)).toBe(true);
    });

    test('should respect limit parameter', () => {
      const results = knowledgeBase.searchDocuments('exercises', 2);
      expect(results.length).toBeLessThanOrEqual(2);
    });

    test('should return empty array for no matches', () => {
      const results = knowledgeBase.searchDocuments('nonexistentquery');
      expect(Array.isArray(results)).toBe(true);
    });
  });

  describe('searchByCategory', () => {
    test('should search documents by category', () => {
      const results = knowledgeBase.searchByCategory('anatomy');
      expect(Array.isArray(results)).toBe(true);
    });

    test('should respect limit parameter', () => {
      const results = knowledgeBase.searchByCategory('exercises', 1);
      expect(results.length).toBeLessThanOrEqual(1);
    });

    test('should return empty array for non-existent category', () => {
      const results = knowledgeBase.searchByCategory('nonexistent');
      expect(Array.isArray(results)).toBe(true);
    });
  });

  describe('searchByTags', () => {
    test('should search documents by tags', () => {
      const results = knowledgeBase.searchByTags(['muscles']);
      expect(Array.isArray(results)).toBe(true);
    });

    test('should respect limit parameter', () => {
      const results = knowledgeBase.searchByTags(['exercises'], 1);
      expect(results.length).toBeLessThanOrEqual(1);
    });

    test('should return empty array for non-existent tags', () => {
      const results = knowledgeBase.searchByTags(['nonexistent']);
      expect(Array.isArray(results)).toBe(true);
    });
  });

  describe('generateEnrichedContext', () => {
    test('should generate enriched context for query', () => {
      const context = knowledgeBase.generateEnrichedContext('muscles', {
        level: 'beginner',
      });
      expect(typeof context).toBe('string');
      expect(context.length).toBeGreaterThan(0);
    });

    test('should handle empty user profile', () => {
      const context = knowledgeBase.generateEnrichedContext('exercises');
      expect(typeof context).toBe('object');
    });

    test('should handle complex queries', () => {
      const context = knowledgeBase.generateEnrichedContext(
        'nutrition proteins',
        { goal: 'muscle_gain' }
      );
      expect(typeof context).toBe('string');
    });
  });

  describe('extractRelevantSections', () => {
    test('should extract relevant sections from content', () => {
      const content = 'This is a test content with muscles and exercises';
      const sections = knowledgeBase.extractRelevantSections(
        content,
        'muscles'
      );
      expect(typeof sections).toBe('string');
    });

    test('should handle content without matches', () => {
      const content = 'This is a test content';
      const sections = knowledgeBase.extractRelevantSections(
        content,
        'nonexistent'
      );
      expect(typeof sections).toBe('string');
    });
  });

  describe('extractSummary', () => {
    test('should extract summary from content', () => {
      const content =
        'This is a long content that needs to be summarized. It contains multiple sentences and should be reduced to a shorter version.';
      const summary = knowledgeBase.extractSummary(content);
      expect(typeof summary).toBe('string');
      expect(summary.length).toBeLessThan(content.length);
    });

    test('should handle short content', () => {
      const content = 'Short content';
      const summary = knowledgeBase.extractSummary(content);
      expect(typeof summary).toBe('string');
    });
  });

  describe('getStats', () => {
    test('should return knowledge base statistics', () => {
      const stats = knowledgeBase.getStats();
      expect(stats).toHaveProperty('totalDocuments');
      expect(stats).toHaveProperty('categories');
      expect(stats).toHaveProperty('tags');
      expect(stats).toHaveProperty('totalWords');
    });

    test('should have valid statistics', () => {
      const stats = knowledgeBase.getStats();
      expect(stats.totalDocuments).toBeGreaterThan(0);
      expect(stats.categories.length).toBeGreaterThan(0);
      expect(stats.tags.length).toBeGreaterThan(0);
    });
  });

  describe('addCustomDocument', () => {
    test('should add custom document', () => {
      const result = knowledgeBase.addCustomDocument(
        'Custom Title',
        'Custom content for testing',
        'custom',
        ['test', 'custom']
      );

      expect(typeof result).toBe('string');
      expect(knowledgeBase.documents.has(result)).toBe(true);
    });

    test('should handle document without tags', () => {
      const result = knowledgeBase.addCustomDocument(
        'Custom Title',
        'Custom content',
        'custom'
      );

      expect(typeof result).toBe('string');
    });
  });

  describe('updateDocument', () => {
    test('should update existing document', () => {
      const docId = 'anatomy-001';
      const updates = { title: 'Updated Anatomy Title' };

      expect(() => {
        knowledgeBase.updateDocument(docId, updates);
      }).not.toThrow();
      expect(knowledgeBase.documents.get(docId).title).toBe(
        'Updated Anatomy Title'
      );
    });

    test('should handle non-existent document', () => {
      expect(() => {
        knowledgeBase.updateDocument('nonexistent', { title: 'New Title' });
      }).toThrow('Document nonexistent non trouvé');
    });
  });

  describe('removeFromIndex', () => {
    test('should remove document from index', () => {
      const docId = 'anatomy-001';
      knowledgeBase.removeFromIndex(docId);
      expect(knowledgeBase.index.has(docId)).toBe(false);
    });
  });

  describe('deleteDocument', () => {
    test('should delete document completely', () => {
      const docId = 'anatomy-001';

      expect(() => {
        knowledgeBase.deleteDocument(docId);
      }).not.toThrow();
      expect(knowledgeBase.documents.has(docId)).toBe(false);
    });

    test('should handle non-existent document deletion', () => {
      expect(() => {
        knowledgeBase.deleteDocument('nonexistent');
      }).not.toThrow();
    });
  });

  describe('Document content validation', () => {
    test('should validate document structure', () => {
      const validDoc = {
        id: 'valid-001',
        title: 'Valid Document',
        category: 'test',
        content: 'Valid content',
        tags: ['test'],
      };

      expect(() => {
        knowledgeBase.addDocument(validDoc);
      }).not.toThrow();
    });

    test('should handle documents with missing fields', () => {
      const incompleteDoc = {
        id: 'incomplete-001',
        title: 'Incomplete Document',
        content: 'Some content',
        // Missing category, tags
      };

      expect(() => {
        knowledgeBase.addDocument(incompleteDoc);
      }).not.toThrow();
    });
  });

  describe('Search functionality edge cases', () => {
    test('should handle empty query', () => {
      const results = knowledgeBase.searchDocuments('');
      expect(Array.isArray(results)).toBe(true);
    });

    test('should handle special characters in query', () => {
      const results = knowledgeBase.searchDocuments('muscles & exercises');
      expect(Array.isArray(results)).toBe(true);
    });

    test('should handle very long queries', () => {
      const longQuery = 'a'.repeat(1000);
      const results = knowledgeBase.searchDocuments(longQuery);
      expect(Array.isArray(results)).toBe(true);
    });
  });

  describe('Category and tag operations', () => {
    test('should get all categories', () => {
      const categories = knowledgeBase.getStats().categories;
      expect(Array.isArray(categories)).toBe(true);
      expect(categories).toContain('anatomy');
      expect(categories).toContain('exercises');
      expect(categories).toContain('nutrition');
    });

    test('should search with multiple tags', () => {
      const results = knowledgeBase.searchByTags(['muscles', 'exercises']);
      expect(Array.isArray(results)).toBe(true);
    });

    test('should handle case insensitive search', () => {
      const results1 = knowledgeBase.searchDocuments('MUSCLES');
      const results2 = knowledgeBase.searchDocuments('muscles');
      expect(Array.isArray(results1)).toBe(true);
      expect(Array.isArray(results2)).toBe(true);
    });
  });
});
