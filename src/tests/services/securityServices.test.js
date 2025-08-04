import inputValidationService from '../../services/inputValidationService';
import rateLimitService from '../../services/rateLimitService';
import securityLogService from '../../services/securityLogService';

describe('🔒 Tests des Services de Sécurité', () => {
  beforeEach(() => {
    // Nettoyer les services avant chaque test
    rateLimitService.storage.clear();
    rateLimitService.blockedIPs.clear();
    rateLimitService.suspiciousIPs.clear();
    
    securityLogService.logs = [];
  });

  describe('📝 Validation d\'Entrée', () => {
    test('devrait valider un email correct', () => {
      const result = inputValidationService.validate('test@example.com', 'email');
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.sanitizedValue).toBe('test@example.com');
    });

    test('devrait rejeter un email invalide', () => {
      const result = inputValidationService.validate('invalid-email', 'email');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('email ne respecte pas le format requis');
    });

    test('devrait détecter un email temporaire', () => {
      const result = inputValidationService.validate('test@tempmail.com', 'email');
      
      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('Email temporaire détecté');
    });

    test('devrait valider un mot de passe fort', () => {
      const result = inputValidationService.validate('StrongP@ss123', 'password');
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('devrait rejeter un mot de passe faible', () => {
      const result = inputValidationService.validate('weak', 'password');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('password doit contenir au moins 8 caractères');
      expect(result.errors).toContain('Le mot de passe doit contenir au moins une majuscule');
    });

    test('devrait rejeter un mot de passe avec pattern interdit', () => {
      const result = inputValidationService.validate('password123', 'password');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Le mot de passe contient un pattern interdit');
    });

    test('devrait valider un nom d\'utilisateur correct', () => {
      const result = inputValidationService.validate('user123', 'username');
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('devrait rejeter un nom d\'utilisateur avec mot interdit', () => {
      const result = inputValidationService.validate('admin_user', 'username');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Le nom d\'utilisateur ne peut pas contenir "admin"');
    });

    test('devrait valider un poids correct', () => {
      const result = inputValidationService.validate('70.5', 'weight');
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('devrait rejeter un poids invalide', () => {
      const result = inputValidationService.validate('500', 'weight');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('La valeur ne peut pas dépasser 300');
    });

    test('devrait détecter une tentative XSS', () => {
      const result = inputValidationService.validate('<script>alert("xss")</script>', 'message');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Contenu potentiellement dangereux détecté');
    });

    test('devrait sanitiser du contenu HTML', () => {
      const input = '<script>alert("xss")</script>Hello World';
      const sanitized = inputValidationService.sanitize(input);
      
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).toContain('Hello World');
    });

    test('devrait valider un formulaire complet', () => {
      const formData = {
        email: 'test@example.com',
        password: 'StrongP@ss123',
        username: 'user123'
      };
      
      const schema = {
        email: { type: 'email' },
        password: { type: 'password' },
        username: { type: 'username' }
      };
      
      const result = inputValidationService.validateForm(formData, schema);
      
      expect(result.isValid).toBe(true);
      expect(Object.keys(result.errors)).toHaveLength(0);
      expect(result.sanitizedData.email).toBe('test@example.com');
    });

    test('devrait valider un fichier correct', async () => {
      // Mock Image constructor
      const mockImage = {
        width: 800,
        height: 600,
        onload: null,
        onerror: null,
        src: null
      };
      
      // Mock URL.createObjectURL
      const originalCreateObjectURL = URL.createObjectURL;
      URL.createObjectURL = jest.fn(() => 'mock-url');
      
      // Mock Image constructor
      global.Image = jest.fn(() => mockImage);
      
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      
      // Simulate image load
      setTimeout(() => {
        if (mockImage.onload) {
          mockImage.onload();
        }
      }, 0);
      
      const result = await inputValidationService.validateFile(file);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      
      // Restore original
      URL.createObjectURL = originalCreateObjectURL;
    }, 30000); // Augmenter le timeout à 30 secondes

    test('devrait rejeter un fichier trop volumineux', async () => {
      // Créer un fichier de 10MB
      const largeContent = new Array(10 * 1024 * 1024).fill('a').join('');
      const file = new File([largeContent], 'large.txt', { type: 'text/plain' });
      
      const result = await inputValidationService.validateFile(file, { maxSize: 5 * 1024 * 1024 });
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Fichier trop volumineux (max: 5MB)');
    });

    test('devrait valider une URL correcte', () => {
      const result = inputValidationService.validateURL('https://example.com');
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('devrait rejeter une URL invalide', () => {
      const result = inputValidationService.validateURL('not-a-url');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('URL invalide');
    });
  });

  describe('⏱️ Rate Limiting', () => {
    test('devrait autoriser les requêtes dans la limite', () => {
      const ip = '192.168.1.1';
      const action = 'login';
      
      // 4 tentatives (dans la limite de 5)
      for (let i = 0; i < 4; i++) {
        const result = rateLimitService.checkLimit(ip, action, 'auth');
        expect(result.allowed).toBe(true);
      }
    });

    test('devrait bloquer après dépassement de limite', () => {
      const ip = '192.168.1.2';
      const action = 'login';
      
      // 6 tentatives (dépassement de la limite de 5)
      for (let i = 0; i < 5; i++) {
        rateLimitService.checkLimit(ip, action, 'auth');
      }
      
      const result = rateLimitService.checkLimit(ip, action, 'auth');
      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('Limite dépassée');
    });

    test('devrait détecter une activité suspecte', () => {
      const ip = '192.168.1.3';
      const action = 'general';
      
      // Simuler une activité intensive (dépasser le seuil de 80%)
      for (let i = 0; i < 850; i++) { // 85% de la limite pour déclencher l'alerte
        rateLimitService.recordAttempt(ip, action);
      }
      
      // Déclencher la détection
      rateLimitService.detectSuspiciousActivity(ip, action, 850);
      
      expect(rateLimitService.suspiciousIPs.has(ip)).toBe(true);
    });

    test('devrait bloquer une IP malveillante', () => {
      const ip = '192.168.1.4';
      const action = 'general';
      
      // Simuler une activité très intensive
      for (let i = 0; i < 1500; i++) { // 150% de la limite
        rateLimitService.recordAttempt(ip, action);
      }
      
      // Déclencher la détection et le blocage
      rateLimitService.detectSuspiciousActivity(ip, action, 1500);
      
      expect(rateLimitService.blockedIPs.has(ip)).toBe(true);
    });

    test('devrait débloquer une IP manuellement', () => {
      const ip = '192.168.1.5';
      
      rateLimitService.blockedIPs.add(ip);
      expect(rateLimitService.blockedIPs.has(ip)).toBe(true);
      
      rateLimitService.unblockIP(ip);
      expect(rateLimitService.blockedIPs.has(ip)).toBe(false);
    });

    test('devrait fournir des statistiques', () => {
      const ip = '192.168.1.6';
      
      rateLimitService.recordAttempt(ip, 'test');
      
      const stats = rateLimitService.getStats();
      
      expect(stats.totalKeys).toBeGreaterThan(0);
      expect(stats.blockedIPs).toBe(0);
      expect(stats.suspiciousIPs).toBe(0);
    });

    test('devrait obtenir les détails d\'une IP', () => {
      const ip = '192.168.1.7';
      
      rateLimitService.recordAttempt(ip, 'test');
      
      const details = rateLimitService.getIPDetails(ip);
      
      expect(details.identifier).toBe(ip);
      expect(details.isBlocked).toBe(false);
      expect(details.isSuspicious).toBe(false);
      expect(Object.keys(details.activities).length).toBeGreaterThan(0);
    });
  });

  describe('📋 Logs de Sécurité', () => {
    test('devrait logger un événement de sécurité', () => {
      const logEntry = securityLogService.log(
        securityLogService.eventTypes.AUTH_LOGIN_SUCCESS,
        'LOW',
        { method: 'email' },
        'user123',
        '192.168.1.1'
      );
      
      expect(logEntry.eventType).toBe('auth.login.success');
      expect(logEntry.severityName).toBe('LOW');
      expect(logEntry.userId).toBe('user123');
      expect(logEntry.ip).toBe('192.168.1.1');
      expect(securityLogService.logs).toHaveLength(1);
    });

    test('devrait logger une tentative de connexion échouée', () => {
      const logEntry = securityLogService.logLoginFailed(
        'test@example.com',
        '192.168.1.1',
        'Invalid credentials'
      );
      
      expect(logEntry.eventType).toBe('auth.login.failed');
      expect(logEntry.severityName).toBe('MEDIUM');
      expect(logEntry.details.email).toBe('test@example.com');
      expect(logEntry.details.reason).toBe('Invalid credentials');
    });

    test('devrait logger une activité suspecte', () => {
      const logEntry = securityLogService.logSuspiciousActivity(
        '192.168.1.1',
        'Multiple failed logins'
      );
      
      expect(logEntry.eventType).toBe('api.suspicious.activity');
      expect(logEntry.severityName).toBe('HIGH');
      expect(logEntry.details.activity).toBe('Multiple failed logins');
    });

    test('devrait logger une tentative XSS', () => {
      const logEntry = securityLogService.logXSSDetected(
        '<script>alert("xss")</script>',
        'user123',
        '192.168.1.1'
      );
      
      expect(logEntry.eventType).toBe('validation.xss.detected');
      expect(logEntry.severityName).toBe('HIGH');
      expect(logEntry.details.input).toBe('<script>alert("xss")</script>');
    });

    test('devrait rechercher dans les logs', () => {
      // Créer quelques logs
      securityLogService.logLoginSuccess('user1', '192.168.1.1');
      securityLogService.logLoginFailed('test@example.com', '192.168.1.2', 'Invalid password');
      securityLogService.logLoginSuccess('user2', '192.168.1.3');
      
      const results = securityLogService.search({
        eventType: 'auth.login.success'
      });
      
      expect(results).toHaveLength(2);
      expect(results[0].eventType).toBe('auth.login.success');
    });

    test('devrait filtrer par sévérité', () => {
      securityLogService.logLoginSuccess('user1', '192.168.1.1'); // LOW
      securityLogService.logLoginFailed('test@example.com', '192.168.1.2', 'Invalid password'); // MEDIUM
      securityLogService.logSuspiciousActivity('192.168.1.3', 'Suspicious'); // HIGH
      
      const results = securityLogService.search({
        severity: 'HIGH'
      });
      
      expect(results.every(log => log.severity >= securityLogService.severityLevels.HIGH)).toBe(true);
    });

    test('devrait obtenir les statistiques', () => {
      securityLogService.logLoginSuccess('user1', '192.168.1.1');
      securityLogService.logLoginFailed('test@example.com', '192.168.1.2', 'Invalid password');
      securityLogService.logSuspiciousActivity('192.168.1.3', 'Suspicious');
      
      const stats = securityLogService.getStats('24h');
      
      expect(stats.totalLogs).toBe(3);
      expect(stats.bySeverity.LOW).toBe(1);
      expect(stats.bySeverity.MEDIUM).toBe(1);
      expect(stats.bySeverity.HIGH).toBe(1);
    });

    test('devrait détecter les alertes de sécurité', () => {
      // Créer plusieurs échecs de connexion pour déclencher une alerte
      for (let i = 0; i < 11; i++) {
        securityLogService.logLoginFailed(`test${i}@example.com`, '192.168.1.1', 'Invalid password');
      }
      
      const alerts = securityLogService.getSecurityAlerts();
      
      expect(alerts.length).toBeGreaterThan(0);
      expect(alerts.some(alert => alert.type === 'MULTIPLE_LOGIN_FAILURES')).toBe(true);
    });

    test('devrait sauvegarder et charger les logs', () => {
      securityLogService.logLoginSuccess('user1', '192.168.1.1');
      securityLogService.logLoginFailed('test@example.com', '192.168.1.2', 'Invalid password');
      
      const initialCount = securityLogService.logs.length;
      
      securityLogService.saveLogs();
      securityLogService.logs = []; // Vider les logs
      
      securityLogService.loadLogs();
      
      expect(securityLogService.logs).toHaveLength(initialCount);
    });
  });

  describe('🚀 Tests d\'Intégration', () => {
    test('devrait gérer un workflow de sécurité complet', () => {
      const ip = '192.168.1.100';
      const email = 'test@example.com';
      const password = 'weak';
      
      // 1. Validation d'entrée
      const emailValidation = inputValidationService.validate(email, 'email');
      const passwordValidation = inputValidationService.validate(password, 'password');
      
      expect(emailValidation.isValid).toBe(true);
      expect(passwordValidation.isValid).toBe(false);
      
      // 2. Rate limiting
      const rateLimitResult = rateLimitService.checkLimit(ip, 'login', 'auth');
      expect(rateLimitResult.allowed).toBe(true);
      
      // 3. Logs de sécurité
      if (!passwordValidation.isValid) {
        securityLogService.logValidationFailed('password', password, 'Mot de passe trop faible');
      }
      
      const logs = securityLogService.search({ eventType: 'validation.failed' });
      expect(logs.length).toBeGreaterThan(0);
    });

    test('devrait détecter et bloquer une attaque', () => {
      const maliciousIP = '192.168.1.200';
      const xssInput = '<script>alert("xss")</script>';
      
      // 1. Détecter XSS
      const validation = inputValidationService.validate(xssInput, 'message');
      expect(validation.isValid).toBe(false);
      
      // 2. Logger l'attaque
      securityLogService.logXSSDetected(xssInput, null, maliciousIP);
      
      // 3. Simuler une activité intensive
      for (let i = 0; i < 1500; i++) {
        rateLimitService.recordAttempt(maliciousIP, 'general');
      }
      
      // 4. Déclencher la détection et le blocage
      rateLimitService.detectSuspiciousActivity(maliciousIP, 'general', 1500);
      
      // 5. Vérifier le blocage
      expect(rateLimitService.blockedIPs.has(maliciousIP)).toBe(true);
      
      // 6. Vérifier les logs
      const logs = securityLogService.search({ ip: maliciousIP });
      expect(logs.length).toBeGreaterThan(0);
    });

    test('devrait gérer les alertes de sécurité', () => {
      const suspiciousIP = '192.168.1.300';
      
      // Créer plusieurs activités suspectes
      for (let i = 0; i < 6; i++) {
        securityLogService.logSuspiciousActivity(suspiciousIP, `Activity ${i}`);
      }
      
      // Créer plusieurs violations IA
      for (let i = 0; i < 2; i++) {
        securityLogService.logAISafetyViolation(
          { type: 'unsafe_exercise' },
          { userId: 'user123' }
        );
      }
      
      const alerts = securityLogService.getSecurityAlerts();
      
      expect(alerts.some(alert => alert.type === 'SUSPICIOUS_ACTIVITIES')).toBe(true);
      expect(alerts.some(alert => alert.type === 'AI_SAFETY_VIOLATIONS')).toBe(true);
    });
  });
}); 