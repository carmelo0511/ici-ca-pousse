// Service de validation d'entrée pour sécuriser l'application
class InputValidationService {
  constructor() {
    this.validationRules = {
      // Règles pour les emails
      email: {
        pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        maxLength: 254,
        minLength: 5
      },
      
      // Règles pour les mots de passe
      password: {
        minLength: 8,
        maxLength: 128,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
        forbiddenPatterns: [
          /password/i,
          /123456/,
          /qwerty/i,
          /admin/i
        ]
      },
      
      // Règles pour les pseudos
      username: {
        minLength: 3,
        maxLength: 30,
        pattern: /^[a-zA-Z0-9_-]+$/,
        forbiddenWords: ['admin', 'root', 'system', 'test', 'guest']
      },
      
      // Règles pour les noms
      name: {
        minLength: 2,
        maxLength: 50,
        pattern: /^[a-zA-ZÀ-ÿ\s'-]+$/,
        sanitize: true
      },
      
      // Règles pour les poids
      weight: {
        min: 20,
        max: 300,
        decimals: 1
      },
      
      // Règles pour les tailles
      height: {
        min: 100,
        max: 250,
        decimals: 0
      },
      
      // Règles pour les âges
      age: {
        min: 13,
        max: 120
      },
      
      // Règles pour les exercices
      exercise: {
        name: {
          minLength: 2,
          maxLength: 100,
          pattern: /^[a-zA-ZÀ-ÿ0-9\s\-_()]+$/,
          sanitize: true
        },
        reps: {
          min: 1,
          max: 1000
        },
        sets: {
          min: 1,
          max: 50
        },
        weight: {
          min: 0,
          max: 1000,
          decimals: 2
        }
      },
      
      // Règles pour les messages
      message: {
        minLength: 1,
        maxLength: 2000,
        sanitize: true,
        forbiddenPatterns: [
          /<script/i,
          /javascript:/i,
          /on\w+\s*=/i,
          /data:text\/html/i
        ]
      }
    };
    
    this.sanitizationRules = {
      // Supprimer les balises HTML dangereuses
      removeTags: ['script', 'iframe', 'object', 'embed', 'form', 'input', 'textarea', 'select'],
      
      // Échapper les caractères spéciaux
      escapeChars: {
        '<': '&lt;',
        '>': '&gt;',
        '&': '&amp;',
        '"': '&quot;',
        "'": '&#x27;',
        '/': '&#x2F;'
      },
      
      // Caractères autorisés pour les noms
      allowedChars: /[a-zA-ZÀ-ÿ0-9\s\-_().,]/g
    };
  }

  // Validation principale
  validate(input, type, options = {}) {
    const rule = this.validationRules[type];
    if (!rule) {
      throw new Error(`Type de validation inconnu: ${type}`);
    }

    const result = {
      isValid: true,
      errors: [],
      warnings: [],
      sanitizedValue: null
    };

    // Vérifier si l'entrée est définie
    if (input === null || input === undefined) {
      result.isValid = false;
      result.errors.push(`${type} est requis`);
      return result;
    }

    // Convertir en string si nécessaire
    const stringValue = String(input).trim();
    
    // Vérifier la longueur minimale
    if (rule.minLength && stringValue.length < rule.minLength) {
      result.isValid = false;
      result.errors.push(`${type} doit contenir au moins ${rule.minLength} caractères`);
    }

    // Vérifier la longueur maximale
    if (rule.maxLength && stringValue.length > rule.maxLength) {
      result.isValid = false;
      result.errors.push(`${type} ne peut pas dépasser ${rule.maxLength} caractères`);
    }

    // Vérifier le pattern
    if (rule.pattern && !rule.pattern.test(stringValue)) {
      result.isValid = false;
      result.errors.push(`${type} ne respecte pas le format requis`);
    }

    // Validation spécifique par type
    switch (type) {
      case 'email':
        this.validateEmail(stringValue, result);
        break;
      case 'password':
        this.validatePassword(stringValue, result);
        break;
      case 'username':
        this.validateUsername(stringValue, result);
        break;
      case 'weight':
      case 'height':
      case 'age':
        this.validateNumber(stringValue, rule, result);
        break;
      case 'exercise':
        this.validateExercise(stringValue, result);
        break;
      case 'message':
        this.validateMessage(stringValue, result);
        break;
    }

    // Sanitisation si demandée
    if (rule.sanitize && result.isValid) {
      result.sanitizedValue = this.sanitize(stringValue, type);
    } else {
      result.sanitizedValue = stringValue;
    }

    return result;
  }

  // Validation d'email
  validateEmail(email, result) {
    // Vérifier les domaines suspects
    const suspiciousDomains = ['tempmail.com', '10minutemail.com', 'guerrillamail.com'];
    const domain = email.split('@')[1];
    
    if (suspiciousDomains.includes(domain)) {
      result.warnings.push('Email temporaire détecté');
    }
  }

  // Validation de mot de passe
  validatePassword(password, result) {
    const rule = this.validationRules.password;
    
    // Vérifier les caractères requis
    if (rule.requireUppercase && !/[A-Z]/.test(password)) {
      result.isValid = false;
      result.errors.push('Le mot de passe doit contenir au moins une majuscule');
    }
    
    if (rule.requireLowercase && !/[a-z]/.test(password)) {
      result.isValid = false;
      result.errors.push('Le mot de passe doit contenir au moins une minuscule');
    }
    
    if (rule.requireNumbers && !/\d/.test(password)) {
      result.isValid = false;
      result.errors.push('Le mot de passe doit contenir au moins un chiffre');
    }
    
    if (rule.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      result.isValid = false;
      result.errors.push('Le mot de passe doit contenir au moins un caractère spécial');
    }
    
    // Vérifier les patterns interdits
    for (const pattern of rule.forbiddenPatterns) {
      if (pattern.test(password)) {
        result.isValid = false;
        result.errors.push('Le mot de passe contient un pattern interdit');
        break;
      }
    }
  }

  // Validation de nom d'utilisateur
  validateUsername(username, result) {
    const rule = this.validationRules.username;
    
    // Vérifier les mots interdits
    for (const forbiddenWord of rule.forbiddenWords) {
      if (username.toLowerCase().includes(forbiddenWord)) {
        result.isValid = false;
        result.errors.push(`Le nom d'utilisateur ne peut pas contenir "${forbiddenWord}"`);
        break;
      }
    }
  }

  // Validation de nombres
  validateNumber(value, rule, result) {
    const numValue = parseFloat(value);
    
    if (isNaN(numValue)) {
      result.isValid = false;
      result.errors.push('Valeur numérique invalide');
      return;
    }
    
    if (rule.min !== undefined && numValue < rule.min) {
      result.isValid = false;
      result.errors.push(`La valeur doit être au moins ${rule.min}`);
    }
    
    if (rule.max !== undefined && numValue > rule.max) {
      result.isValid = false;
      result.errors.push(`La valeur ne peut pas dépasser ${rule.max}`);
    }
    
    if (rule.decimals !== undefined) {
      const decimalPlaces = (value.toString().split('.')[1] || '').length;
      if (decimalPlaces > rule.decimals) {
        result.isValid = false;
        result.errors.push(`Maximum ${rule.decimals} décimales autorisées`);
      }
    }
  }

  // Validation d'exercice
  validateExercise(exerciseData, result) {
    if (typeof exerciseData === 'object') {
      // Validation du nom d'exercice
      if (exerciseData.name) {
        const nameValidation = this.validate(exerciseData.name, 'exercise.name');
        if (!nameValidation.isValid) {
          result.errors.push(...nameValidation.errors);
          result.isValid = false;
        }
      }
      
      // Validation des répétitions
      if (exerciseData.reps !== undefined) {
        const repsValidation = this.validate(exerciseData.reps, 'exercise.reps');
        if (!repsValidation.isValid) {
          result.errors.push(...repsValidation.errors);
          result.isValid = false;
        }
      }
      
      // Validation des séries
      if (exerciseData.sets !== undefined) {
        const setsValidation = this.validate(exerciseData.sets, 'exercise.sets');
        if (!setsValidation.isValid) {
          result.errors.push(...setsValidation.errors);
          result.isValid = false;
        }
      }
      
      // Validation du poids
      if (exerciseData.weight !== undefined) {
        const weightValidation = this.validate(exerciseData.weight, 'exercise.weight');
        if (!weightValidation.isValid) {
          result.errors.push(...weightValidation.errors);
          result.isValid = false;
        }
      }
    }
  }

  // Validation de message
  validateMessage(message, result) {
    const rule = this.validationRules.message;
    
    // Vérifier les patterns interdits (XSS)
    for (const pattern of rule.forbiddenPatterns) {
      if (pattern.test(message)) {
        result.isValid = false;
        result.errors.push('Contenu potentiellement dangereux détecté');
        break;
      }
    }
  }

  // Sanitisation
  sanitize(input, type = 'general') {
    let sanitized = String(input);
    
    // Supprimer les balises HTML dangereuses
    for (const tag of this.sanitizationRules.removeTags) {
      const regex = new RegExp(`<${tag}[^>]*>.*?</${tag}>`, 'gi');
      sanitized = sanitized.replace(regex, '');
    }
    
    // Échapper les caractères spéciaux
    for (const [char, escaped] of Object.entries(this.sanitizationRules.escapeChars)) {
      sanitized = sanitized.replace(new RegExp(char, 'g'), escaped);
    }
    
    // Nettoyer les espaces multiples
    sanitized = sanitized.replace(/\s+/g, ' ').trim();
    
    return sanitized;
  }

  // Validation de formulaire complet
  validateForm(formData, schema) {
    const result = {
      isValid: true,
      errors: {},
      warnings: {},
      sanitizedData: {}
    };

    for (const [field, config] of Object.entries(schema)) {
      const value = formData[field];
      const validation = this.validate(value, config.type, config.options);
      
      if (!validation.isValid) {
        result.isValid = false;
        result.errors[field] = validation.errors;
      }
      
      if (validation.warnings.length > 0) {
        result.warnings[field] = validation.warnings;
      }
      
      result.sanitizedData[field] = validation.sanitizedValue;
    }

    return result;
  }

  // Validation en temps réel (pour les formulaires)
  validateRealTime(input, type, callback) {
    const validation = this.validate(input, type);
    callback(validation);
    return validation;
  }

  // Validation de fichier
  validateFile(file, options = {}) {
    const result = {
      isValid: true,
      errors: [],
      warnings: []
    };

    const {
      maxSize = 5 * 1024 * 1024, // 5MB par défaut
      allowedTypes = ['image/jpeg', 'image/png', 'image/webp'],
      maxDimensions = { width: 2048, height: 2048 }
    } = options;

    // Vérifier la taille
    if (file.size > maxSize) {
      result.isValid = false;
      result.errors.push(`Fichier trop volumineux (max: ${Math.round(maxSize / 1024 / 1024)}MB)`);
    }

    // Vérifier le type
    if (!allowedTypes.includes(file.type)) {
      result.isValid = false;
      result.errors.push(`Type de fichier non autorisé: ${file.type}`);
    }

    // Vérifier les dimensions pour les images
    if (file.type.startsWith('image/')) {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          if (img.width > maxDimensions.width || img.height > maxDimensions.height) {
            result.warnings.push(`Image très grande (${img.width}x${img.height})`);
          }
          resolve(result);
        };
        img.onerror = () => {
          result.errors.push('Impossible de lire les dimensions de l\'image');
          resolve(result);
        };
        img.src = URL.createObjectURL(file);
      });
    }

    return Promise.resolve(result);
  }

  // Validation d'URL
  validateURL(url, options = {}) {
    const result = {
      isValid: true,
      errors: [],
      warnings: []
    };

    try {
      const urlObj = new URL(url);
      
      // Vérifier le protocole
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        result.isValid = false;
        result.errors.push('Protocole non autorisé');
      }
      
      // Vérifier les domaines autorisés
      if (options.allowedDomains) {
        const domain = urlObj.hostname;
        if (!options.allowedDomains.includes(domain)) {
          result.isValid = false;
          result.errors.push('Domaine non autorisé');
        }
      }
      
    } catch (error) {
      result.isValid = false;
      result.errors.push('URL invalide');
    }

    return result;
  }
}

// Instance singleton
const inputValidationService = new InputValidationService();

export default inputValidationService; 