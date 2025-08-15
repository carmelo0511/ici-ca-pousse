import { useState, useRef, useCallback, useEffect } from 'react';

export const useSpeechRecognition = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef(null);
  const latestTranscriptRef = useRef('');

  // Vérifier le support au montage du composant
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognition);
  }, []);

  // Vérifier si la reconnaissance vocale est supportée
  const checkSupport = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    return !!SpeechRecognition;
  }, []);

  // Initialiser la reconnaissance vocale
  const initializeRecognition = useCallback(() => {
    if (!checkSupport()) return null;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'fr-FR';
    recognition.maxAlternatives = 1;

    return recognition;
  }, [checkSupport]);

  // Démarrer l'écoute
  const startListening = useCallback((onResult, onEnd) => {
    if (!isSupported) {
      console.warn('Speech recognition not supported');
      return false;
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    const recognition = initializeRecognition();
    if (!recognition) return false;

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript('');
      latestTranscriptRef.current = '';
    };

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      const fullTranscript = finalTranscript || interimTranscript;
      setTranscript(fullTranscript);
      latestTranscriptRef.current = fullTranscript;

      if (onResult) {
        onResult(fullTranscript, event.results[event.results.length - 1].isFinal);
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      if (onEnd) {
        onEnd(latestTranscriptRef.current);
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
    return true;
  }, [initializeRecognition, isSupported]);

  // Arrêter l'écoute
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  // Parser le texte pour extraire les exercices
  const parseExerciseFromSpeech = useCallback((text) => {
    const cleanText = text.toLowerCase().trim();

    
    // Mapping complet basé sur la base de données des exercices
    const exerciseMapping = {
      // Pectoraux
      'pompes': 'Pompes',
      'pompe': 'Pompes', 
      'pomes': 'Pompes',
      'développé couché': 'Développé couché',
      'developpe couche': 'Développé couché',
      'develope couche': 'Développé couché',
      'devole couche': 'Développé couché',
      'développer coucher': 'Développé couché',
      'developper coucher': 'Développé couché',
      'devlopper coucher': 'Développé couché',
      'développé coucher': 'Développé couché',
      'developpe coucher': 'Développé couché',
      'develope coucher': 'Développé couché',
      'développer couché': 'Développé couché',
      'developper couché': 'Développé couché',
      'devlopper couché': 'Développé couché',
      'devole couché': 'Développé couché',
      'développé incliné': 'Développé incliné',
      'developpe incline': 'Développé incliné',
      'develope incline': 'Développé incliné',
      'développer incliner': 'Développé incliné',
      'developper incliner': 'Développé incliné',
      'devlopper incliner': 'Développé incliné',
      'devole incliner': 'Développé incliné',
      'developpe incliné': 'Développé incliné',
      'develope incliné': 'Développé incliné',
      'développer incliné': 'Développé incliné',
      'developper incliné': 'Développé incliné',
      'devlopper incliné': 'Développé incliné',
      'devole incliné': 'Développé incliné',
      'développé décliné': 'Développé décliné',
      'developpe decline': 'Développé décliné',
      'develope decline': 'Développé décliné',
      'développer décliner': 'Développé décliné',
      'developper decliner': 'Développé décliné',
      'devlopper decliner': 'Développé décliné',
      'devole decliner': 'Développé décliné',
      'développé decliner': 'Développé décliné',
      'developpe decliner': 'Développé décliné',
      'develope decliner': 'Développé décliné',
      'développé haltères': 'Développé haltères',
      'developpe haltere': 'Développé haltères',
      'develope haltere': 'Développé haltères',
      'développer haltères': 'Développé haltères',
      'developper haltere': 'Développé haltères',
      'devlopper haltere': 'Développé haltères',
      'devole haltere': 'Développé haltères',
      'développé haltere': 'Développé haltères',
      'developpe halteres': 'Développé haltères',
      'develope halteres': 'Développé haltères',
      'dips': 'Dips',
      'écarté couché': 'Écarté couché',
      'ecarte couche': 'Écarté couché',
      'écarté incliné': 'Écarté incliné',
      'ecarte incline': 'Écarté incliné',
      'pull-over': 'Pull-over',
      'pull over': 'Pull-over',
      'pec deck': 'Pec deck',
      
      // Dos
      'tractions': 'Tractions',
      'traction': 'Tractions',
      'tractions barre': 'Tractions',
      'traction barre': 'Tractions',
      'pull up': 'Tractions',
      'pull ups': 'Tractions',
      'pullup': 'Tractions',
      'pullups': 'Tractions',
      'tractions lestées': 'Tractions lestées',
      'traction lestee': 'Tractions lestées',
      'tractions assistées': 'Tractions assistées',
      'traction assistee': 'Tractions assistées',
      'rowing barre': 'Rowing barre',
      'rowing': 'Rowing barre',
      'rowing haltères': 'Rowing haltères',
      'rowing haltere': 'Rowing haltères',
      'tirage horizontal': 'Tirage horizontal',
      'tirage vertical': 'Tirage vertical',
      'soulevé de terre': 'Soulevé de terre',
      'souleve de terre': 'Soulevé de terre',
      'rowing t-bar': 'Rowing T-bar',
      'rowing t bar': 'Rowing T-bar',
      'shrugs': 'Shrugs',
      'hyperextensions': 'Hyperextensions',
      'tirage poulie haute': 'Tirage poulie haute',
      
      // Épaules
      'développé militaire': 'Développé militaire',
      'developpe militaire': 'Développé militaire',
      'develope militaire': 'Développé militaire',
      'élévations latérales': 'Élévations latérales',
      'elevation laterale': 'Élévations latérales',
      'élévation latérale': 'Élévations latérales',
      'élévations frontales': 'Élévations frontales',
      'elevation frontale': 'Élévations frontales',
      'élévation frontale': 'Élévations frontales',
      'oiseau': 'Oiseau',
      'développé arnold': 'Développé Arnold',
      'developpe arnold': 'Développé Arnold',
      'upright row': 'Upright row',
      'face pull': 'Face pull',
      'handstand push-up': 'Handstand push-up',
      
      // Biceps
      'curl barre': 'Curl barre',
      'curl': 'Curl barre',
      'curl haltères': 'Curl haltères',
      'curl haltere': 'Curl haltères',
      'curl marteau': 'Curl marteau',
      'curl concentré': 'Curl concentré',
      'curl concentre': 'Curl concentré',
      'curl pupitre': 'Curl pupitre',
      'curl 21': 'Curl 21',
      'traction supination': 'Traction supination',
      'curl câble': 'Curl câble',
      'curl cable': 'Curl câble',
      
      // Triceps
      'extension couché': 'Extension couché',
      'extension couche': 'Extension couché',
      'extension verticale': 'Extension verticale',
      'pompes diamant': 'Pompes diamant',
      'kick back': 'Kick back',
      'extension poulie haute': 'Extension poulie haute',
      'développé serré': 'Développé serré',
      'developpe serre': 'Développé serré',
      
      // Jambes
      'squat': 'Squat',
      'squats': 'Squat',
      'leg press': 'Leg press',
      'fentes': 'Fentes',
      'fente': 'Fentes',
      'leg curl': 'Leg curl',
      'leg extension': 'Leg extension',
      'soulevé de terre roumain': 'Soulevé de terre roumain',
      'souleve de terre roumain': 'Soulevé de terre roumain',
      'mollets debout': 'Mollets debout',
      'mollets assis': 'Mollets assis',
      'hack squat': 'Hack squat',
      'goblet squat': 'Goblet squat',
      
      // Abdos
      'crunch': 'Crunch',
      'crunchs': 'Crunch',
      'planche': 'Planche',
      'gainage': 'Planche',
      'relevé de jambes': 'Relevé de jambes',
      'releve de jambes': 'Relevé de jambes',
      'russian twist': 'Russian twist',
      'grimpeur': 'Grimpeur',
      'bicycle crunch': 'Bicycle crunch',
      'dead bug': 'Dead bug',
      'hanging knee raise': 'Hanging knee raise',
      
      // Cardio
      'course à pied': 'Course à pied',
      'course a pied': 'Course à pied',
      'course': 'Course à pied',
      'vélo': 'Vélo',
      'velo': 'Vélo',
      'elliptique': 'Elliptique',
      'rameur': 'Rameur',
      'tapis de course': 'Tapis de course',
      'vélo spinning': 'Vélo spinning',
      'velo spinning': 'Vélo spinning',
      'stepper': 'Stepper',
      'corde à sauter': 'Corde à sauter',
      'corde a sauter': 'Corde à sauter',
      'burpees': 'Burpees',
      'sauts étoiles': 'Sauts étoiles',
      'sauts etoiles': 'Sauts étoiles',
      'genoux hauts': 'Genoux hauts',
      'montées de genoux': 'Montées de genoux',
      'montees de genoux': 'Montées de genoux',
      'sprint': 'Sprint',
      'marche rapide': 'Marche rapide',
      'natation': 'Natation',
      'aquabike': 'Aquabike',
      'hiit': 'HIIT',
      'tabata': 'Tabata'
    };

    // Tri des clés par longueur décroissante pour vérifier les expressions longues d'abord
    const sortedKeys = Object.keys(exerciseMapping).sort((a, b) => b.length - a.length);
    
    

    // Chercher une correspondance exacte d'abord
    for (const spokenName of sortedKeys) {
      if (cleanText === spokenName) {

        return {
          name: exerciseMapping[spokenName],
          found: true,
          confidence: 1
        };
      }
    }

    // Ensuite chercher avec includes, toujours en commençant par les plus longs
    for (const spokenName of sortedKeys) {
      if (cleanText.includes(spokenName)) {

        return {
          name: exerciseMapping[spokenName],
          found: true,
          confidence: 1
        };
      }
    }

    // Détection intelligente par mots-clés en dernier recours
    const keywordDetection = {
      // Élévations en premier (priorité haute)
      'Élévations latérales': ['élévation', 'elevation', 'latérale', 'laterale'],
      'Élévations frontales': ['élévation', 'elevation', 'frontale', 'frontale'],
      
      // Rowing en premier (priorité haute) - avec détection spécifique
      'Rowing barre': ['rowing', 'roing', 'roin'],
      'Rowing haltères': ['rowing', 'roing', 'roin'],
      'Tractions': ['tractions', 'traction'],
      'Soulevé de terre': ['soulevé', 'souleve', 'soulev'],
      
      // Développés avec variations
      'Développé couché': ['développé', 'developpe', 'develope', 'devole', 'développer', 'developper', 'devlopper'],
      'Développé incliné': ['développé', 'developpe', 'develope', 'devole', 'développer', 'developper', 'devlopper'],
      'Développé décliné': ['développé', 'developpe', 'develope', 'devole', 'développer', 'developper', 'devlopper'],
      'Développé haltères': ['développé', 'developpe', 'develope', 'devole', 'développer', 'developper', 'devlopper'],
      
      // Autres exercices
      'Pompes': ['pompes', 'pompe', 'pomes'],
      'Squat': ['squats', 'squat'],
      'Curl barre': ['curl'],
      'Planche': ['gainage', 'planche'],
      'Vélo': ['vélo', 'velo'],
      'Course à pied': ['course']
    };

    // Vérifier les mots-clés en dernier recours
    for (const [exercise, keywords] of Object.entries(keywordDetection)) {
      for (const keyword of keywords) {
        if (cleanText.includes(keyword)) {
          // Vérification spéciale pour les élévations (priorité haute)
          if (exercise.includes('Élévations')) {
            if (cleanText.includes('latérale') || cleanText.includes('laterale')) {
      
              return {
                name: 'Élévations latérales',
                found: true,
                confidence: 1
              };
            } else if (cleanText.includes('frontale') || cleanText.includes('frontale')) {
      
              return {
                name: 'Élévations frontales',
                found: true,
                confidence: 1
              };
            }
          }
          // Vérification spéciale pour les développés - seulement si le mot-clé est vraiment un développé
          else if (exercise.includes('Développé') && (keyword.includes('développ') || keyword.includes('develo') || keyword.includes('devol'))) {
            if (cleanText.includes('incliné') || cleanText.includes('incline') || cleanText.includes('incliner')) {
      
              return {
                name: 'Développé incliné',
                found: true,
                confidence: 1
              };
            } else if (cleanText.includes('décliné') || cleanText.includes('decline') || cleanText.includes('decliner')) {
      
              return {
                name: 'Développé décliné',
                found: true,
                confidence: 1
              };
            } else if (cleanText.includes('haltères') || cleanText.includes('haltere')) {
      
              return {
                name: 'Développé haltères',
                found: true,
                confidence: 1
              };
            } else if (cleanText.includes('couché') || cleanText.includes('couche') || cleanText.includes('coucher')) {
      
              return {
                name: 'Développé couché',
                found: true,
                confidence: 1
              };
            }
          } else if (exercise.includes('Curl') && keyword.includes('curl')) {
            if (cleanText.includes('haltères') || cleanText.includes('haltere')) {
      
              return {
                name: 'Curl haltères',
                found: true,
                confidence: 1
              };
            } else {
      
              return {
                name: 'Curl barre',
                found: true,
                confidence: 1
              };
            }
          } else if (exercise.includes('Rowing')) {
            // Logique spécifique pour distinguer rowing barre vs rowing haltères
            if (cleanText.includes('bar') || cleanText.includes('barre')) {
      
              return {
                name: 'Rowing barre',
                found: true,
                confidence: 1
              };
            } else if (cleanText.includes('haltères') || cleanText.includes('haltere')) {
      
              return {
                name: 'Rowing haltères',
                found: true,
                confidence: 1
              };
            } else {
              // Par défaut, rowing barre
      
              return {
                name: 'Rowing barre',
                found: true,
                confidence: 1
              };
            }
          } else {
    
            return {
              name: exercise,
              found: true,
              confidence: 1
            };
          }
        }
      }
    }


    // Si aucune correspondance, retourner le texte brut
    return {
      name: text.trim(),
      found: false,
      confidence: 0.5
    };
  }, []);

  // Déterminer le groupe musculaire à partir du nom de l'exercice
  const getMuscleGroupFromExercise = useCallback((exerciseName) => {
    const exerciseLower = exerciseName.toLowerCase();
    
    // Mapping précis basé sur la base de données des exercices
    const muscleGroups = {
      pectoraux: [
        'développé couché', 'développé incliné', 'développé décliné', 'développé haltères',
        'pompes', 'écarté couché', 'écarté incliné', 'pull-over', 'pec deck'
      ],
      dos: [
        'tractions', 'tractions lestées', 'tractions assistées', 'rowing barre', 'rowing haltères',
        'tirage horizontal', 'tirage vertical', 'soulevé de terre', 'rowing t-bar', 'shrugs',
        'hyperextensions', 'tirage poulie haute'
      ],
      épaules: [
        'développé militaire', 'élévations latérales', 'élévations frontales', 'oiseau',
        'développé arnold', 'upright row', 'face pull', 'handstand push-up'
      ],
      biceps: [
        'curl barre', 'curl haltères', 'curl marteau', 'curl concentré', 'curl pupitre',
        'curl 21', 'traction supination', 'curl câble'
      ],
      triceps: [
        'dips', 'extension couché', 'extension verticale', 'pompes diamant', 'kick back',
        'extension poulie haute', 'développé serré'
      ],
      jambes: [
        'squat', 'leg press', 'fentes', 'leg curl', 'leg extension', 'soulevé de terre roumain',
        'mollets debout', 'mollets assis', 'hack squat', 'goblet squat'
      ],
      abdos: [
        'crunch', 'planche', 'relevé de jambes', 'russian twist', 'grimpeur',
        'bicycle crunch', 'dead bug', 'hanging knee raise'
      ],
      cardio: [
        'course à pied', 'vélo', 'elliptique', 'rameur', 'tapis de course', 'vélo spinning',
        'stepper', 'corde à sauter', 'burpees', 'sauts étoiles', 'genoux hauts',
        'montées de genoux', 'sprint', 'marche rapide', 'natation', 'aquabike', 'hiit', 'tabata'
      ]
    };

    for (const [muscle, exercises] of Object.entries(muscleGroups)) {
      if (exercises.some(exercise => exerciseLower.includes(exercise.toLowerCase()))) {
        return muscle;
      }
    }

    // Fallback avec mots-clés génériques
    const keywordMapping = {
      pectoraux: ['développé', 'pompes', 'dips', 'écarté', 'pec'],
      dos: ['tractions', 'tirage', 'rowing', 'soulevé', 'pull'],
      jambes: ['squat', 'fentes', 'leg', 'mollets'],
      biceps: ['curl', 'biceps'],
      triceps: ['extension', 'triceps'],
      épaules: ['militaire', 'élévations', 'épaules'],
      abdos: ['crunch', 'gainage', 'planche', 'abdos'],
      cardio: ['course', 'vélo', 'rameur', 'elliptique', 'cardio']
    };

    for (const [muscle, keywords] of Object.entries(keywordMapping)) {
      if (keywords.some(keyword => exerciseLower.includes(keyword))) {
        return muscle;
      }
    }

    return 'pectoraux'; // Groupe par défaut
  }, []);

  // Parser le texte pour extraire séries, répétitions et poids
  const parseWorkoutDataFromSpeech = useCallback((text) => {
    let cleanText = text.toLowerCase().trim();

    
    // Convertir les nombres en lettres en chiffres
    const numberWords = {
      'un': '1', 'une': '1',
      'deux': '2',
      'trois': '3',
      'quatre': '4',
      'cinq': '5',
      'six': '6',
      'sept': '7',
      'huit': '8',
      'neuf': '9',
      'dix': '10',
      'onze': '11',
      'douze': '12',
      'treize': '13',
      'quatorze': '14',
      'quinze': '15',
      'seize': '16',
      'vingt': '20',
      'trente': '30',
      'quarante': '40',
      'cinquante': '50',
      'soixante': '60',
      'soixante-dix': '70',
      'quatre-vingt': '80',
      'quatre-vingts': '80',
      'quatre-vingt-dix': '90'
    };
    
    // Remplacer les nombres en lettres par des chiffres
    for (const [word, number] of Object.entries(numberWords)) {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      cleanText = cleanText.replace(regex, number);
    }
    

    
    const result = {
      sets: null,
      reps: null,
      weight: null,
      found: false
    };

    // Regex pour détecter les nombres suivis de mots-clés
    const patterns = {
      // Séries (ordre important : plus spécifique en premier)
      sets: [
        /(\d+)\s*(?:série|séries|serie|series|set|sets)/i,
        /(?:série|séries|serie|series|set|sets)\s*(?:de\s*)?(\d+)/i
      ],
      // Répétitions (ordre important : plus spécifique en premier)
      reps: [
        /(\d+)\s*(?:répétition|répétitions|repetition|repetitions|rep|reps)/i,
        /(\d+)\s*(?:mouvement|mouvements)/i,
        /(?:répétition|répétitions|repetition|repetitions|rep|reps)\s*(?:de\s*)?(\d+)/i,
        /(\d+)\s*(?:repet|répét)/i,
        /(\d+)\s*fois/i  // "fois" seulement pour les répétitions, pas les séries
      ],
      // Poids
      weight: [
        /(\d+(?:[.,]\d+)?)\s*(?:kg|kilo|kilos|kilogramme|kilogrammes)/i,
        /(\d+(?:[.,]\d+)?)\s*(?:livre|livres|lb|lbs)/i,
        /(?:poids|weight)\s*(?:de\s*)?(\d+(?:[.,]\d+)?)/i,
        /(\d+(?:[.,]\d+)?)\s*(?:kgs)/i
      ]
    };

    // D'abord, vérifier les patterns complexes (ordre important : plus spécifique en premier)
    const complexPatterns = [
      // "3 séries de 12 répétitions à 50 kg" (pattern le plus complet)
      /(\d+)\s*(?:série|séries|serie|series|set|sets)\s*de\s*(\d+)\s*(?:répétition|répétitions|repetition|repetitions|rep|reps|fois)?\s*(?:a|à|avec|de)?\s*(\d+(?:[.,]\d+)?)\s*(?:kg|kilo|kilos)/i,
      // "3 séries de 12 répétitions" (sans poids)
      /(\d+)\s*(?:série|séries|serie|series|set|sets)\s*de\s*(\d+)\s*(?:répétition|répétitions|repetition|repetitions|rep|reps|fois)/i,
      // "12 répétitions à 50 kg"
      /(\d+)\s*(?:répétition|répétitions|repetition|repetitions|rep|reps|fois)\s*(?:a|à|avec|de)\s*(\d+(?:[.,]\d+)?)\s*(?:kg|kilo|kilos)/i,
      // "50 kg pour 12 répétitions"
      /(\d+(?:[.,]\d+)?)\s*(?:kg|kilo|kilos)\s*pour\s*(\d+)\s*(?:répétition|répétitions|repetition|repetitions|rep|reps|fois)/i
    ];

    let foundComplexPattern = false;
    for (let i = 0; i < complexPatterns.length; i++) {
      const pattern = complexPatterns[i];
      const match = cleanText.match(pattern);
      if (match) {
        if (i === 0 && match[3]) {
          // Pattern "3 séries de 12 répétitions à 50 kg" (avec poids)
          result.sets = parseInt(match[1]);
          result.reps = parseInt(match[2]);
          result.weight = parseFloat(match[3].replace(',', '.'));
  
        } else if (i === 1) {
          // Pattern "3 séries de 12 répétitions" (sans poids)
          result.sets = parseInt(match[1]);
          result.reps = parseInt(match[2]);

        } else if (i === 3) {
          // Pattern "50 kg pour 12 répétitions"
          result.weight = parseFloat(match[1].replace(',', '.'));
          result.reps = parseInt(match[2]);

        } else if (i === 2) {
          // Pattern "12 répétitions à 50 kg"
          result.reps = parseInt(match[1]);
          result.weight = parseFloat(match[2].replace(',', '.'));

        }
        result.found = true;
        foundComplexPattern = true;
        break;
      }
    }

    // Si aucun pattern complexe n'a été trouvé, chercher les patterns simples
    if (!foundComplexPattern) {
      for (const [dataType, regexList] of Object.entries(patterns)) {
        for (const regex of regexList) {
          const match = cleanText.match(regex);
          if (match) {
            let value = parseFloat(match[1].replace(',', '.'));
            
            // Conversion des livres en kg si nécessaire
            if (dataType === 'weight' && /livre|lb/.test(match[0])) {
              value = Math.round(value * 0.453592 * 4) / 4; // Conversion en kg, arrondi au quart le plus proche
            }
            
            result[dataType] = value;
            result.found = true;
    
          }
        }
      }
    }

    // Validation des valeurs
    if (result.sets && (result.sets < 1 || result.sets > 20)) {
      console.warn('❌ Invalid sets value:', result.sets);
      result.sets = null;
    }
    if (result.reps && (result.reps < 1 || result.reps > 100)) {
      console.warn('❌ Invalid reps value:', result.reps);
      result.reps = null;
    }
    if (result.weight && (result.weight < 0 || result.weight > 1000)) {
      console.warn('❌ Invalid weight value:', result.weight);
      result.weight = null;
    }


    return result;
  }, []);

  return {
    isListening,
    transcript,
    isSupported,
    startListening,
    stopListening,
    parseExerciseFromSpeech,
    parseWorkoutDataFromSpeech,
    getMuscleGroupFromExercise,
    checkSupport
  };
};