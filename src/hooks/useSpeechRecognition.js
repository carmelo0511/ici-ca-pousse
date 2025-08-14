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
    console.log('🎤 Parsing speech:', cleanText);
    
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
    
    console.log('🔍 Checking against sorted keys:', sortedKeys.slice(0, 5));

    // Chercher une correspondance exacte d'abord
    for (const spokenName of sortedKeys) {
      if (cleanText === spokenName) {
        console.log('✅ Exact match found:', spokenName, '->', exerciseMapping[spokenName]);
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
        console.log('✅ Partial match found:', spokenName, '->', exerciseMapping[spokenName]);
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
              console.log('✅ Keyword match found for élévations latérales:', keyword);
              return {
                name: 'Élévations latérales',
                found: true,
                confidence: 1
              };
            } else if (cleanText.includes('frontale') || cleanText.includes('frontale')) {
              console.log('✅ Keyword match found for élévations frontales:', keyword);
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
              console.log('✅ Keyword match found for développé incliné:', keyword);
              return {
                name: 'Développé incliné',
                found: true,
                confidence: 1
              };
            } else if (cleanText.includes('décliné') || cleanText.includes('decline') || cleanText.includes('decliner')) {
              console.log('✅ Keyword match found for développé décliné:', keyword);
              return {
                name: 'Développé décliné',
                found: true,
                confidence: 1
              };
            } else if (cleanText.includes('haltères') || cleanText.includes('haltere')) {
              console.log('✅ Keyword match found for développé haltères:', keyword);
              return {
                name: 'Développé haltères',
                found: true,
                confidence: 1
              };
            } else if (cleanText.includes('couché') || cleanText.includes('couche') || cleanText.includes('coucher')) {
              console.log('✅ Keyword match found for développé couché:', keyword);
              return {
                name: 'Développé couché',
                found: true,
                confidence: 1
              };
            }
          } else if (exercise.includes('Curl') && keyword.includes('curl')) {
            if (cleanText.includes('haltères') || cleanText.includes('haltere')) {
              console.log('✅ Keyword match found for curl haltères:', keyword);
              return {
                name: 'Curl haltères',
                found: true,
                confidence: 1
              };
            } else {
              console.log('✅ Keyword match found for curl barre:', keyword);
              return {
                name: 'Curl barre',
                found: true,
                confidence: 1
              };
            }
          } else if (exercise.includes('Rowing')) {
            // Logique spécifique pour distinguer rowing barre vs rowing haltères
            if (cleanText.includes('bar') || cleanText.includes('barre')) {
              console.log('✅ Keyword match found for rowing barre:', keyword);
              return {
                name: 'Rowing barre',
                found: true,
                confidence: 1
              };
            } else if (cleanText.includes('haltères') || cleanText.includes('haltere')) {
              console.log('✅ Keyword match found for rowing haltères:', keyword);
              return {
                name: 'Rowing haltères',
                found: true,
                confidence: 1
              };
            } else {
              // Par défaut, rowing barre
              console.log('✅ Keyword match found for rowing barre (default):', keyword);
              return {
                name: 'Rowing barre',
                found: true,
                confidence: 1
              };
            }
          } else {
            console.log('✅ Keyword match found:', keyword, '->', exercise);
            return {
              name: exercise,
              found: true,
              confidence: 1
            };
          }
        }
      }
    }

    console.log('❌ No match found, returning as custom exercise');
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

  return {
    isListening,
    transcript,
    isSupported,
    startListening,
    stopListening,
    parseExerciseFromSpeech,
    getMuscleGroupFromExercise,
    checkSupport
  };
};