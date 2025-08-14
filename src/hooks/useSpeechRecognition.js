import { useState, useRef, useCallback, useEffect } from 'react';

export const useSpeechRecognition = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef(null);

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
        onEnd(transcript);
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
    return true;
  }, [initializeRecognition, transcript, isSupported]);

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
    
    // Mapping simplifié et plus robuste
    const exerciseMapping = {
      // Pectoraux - expressions exactes d'abord
      'pompes': 'pompes',
      'pompe': 'pompes', 
      'pomes': 'pompes',
      'développé couché': 'développé couché',
      'developpe couche': 'développé couché',
      'develope couche': 'développé couché',
      'devole couche': 'développé couché',
      'dips': 'dips',
      'écarté couché': 'écarté couché',
      'ecarte couche': 'écarté couché',
      
      // Dos
      'tractions': 'tractions',
      'traction': 'tractions',
      'soulevé de terre': 'soulevé de terre',
      'souleve de terre': 'soulevé de terre',
      'tirage horizontal': 'tirage horizontal',
      'rowing': 'rowing barre',
      
      // Jambes
      'squats': 'squats',
      'squat': 'squats',
      'fentes': 'fentes',
      'fente': 'fentes',
      'leg press': 'leg press',
      'mollets': 'mollets debout',
      
      // Épaules
      'développé militaire': 'développé militaire',
      'developpe militaire': 'développé militaire',
      'élévations latérales': 'élévations latérales',
      'elevation laterale': 'élévations latérales',
      
      // Biceps
      'curl': 'curl barre',
      'curl barre': 'curl barre',
      'curl haltères': 'curl haltères',
      'curl haltere': 'curl haltères',
      
      // Triceps
      'extension triceps': 'extension triceps',
      'barre au front': 'barre au front',
      
      // Abdos
      'crunchs': 'crunchs',
      'crunch': 'crunchs',
      'gainage': 'gainage',
      'planche': 'gainage',
      
      // Cardio - ATTENTION: mettre en dernier
      'course': 'course',
      'rameur': 'rameur',
      'elliptique': 'elliptique',
      'vélo': 'vélo',
      'velo': 'vélo'
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
    
    const muscleGroups = {
      pectoraux: ['développé couché', 'pompes', 'dips', 'écarté', 'pec'],
      dos: ['tractions', 'tirage', 'rowing', 'soulevé de terre', 'pull'],
      jambes: ['squats', 'fentes', 'leg press', 'mollets', 'quad', 'ischio'],
      biceps: ['curl', 'biceps'],
      triceps: ['extension triceps', 'barre au front', 'triceps'],
      épaules: ['développé militaire', 'élévations latérales', 'épaules', 'deltoid'],
      abdos: ['crunchs', 'gainage', 'planche', 'abdos'],
      cardio: ['course', 'vélo', 'rameur', 'elliptique', 'cardio']
    };

    for (const [muscle, keywords] of Object.entries(muscleGroups)) {
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