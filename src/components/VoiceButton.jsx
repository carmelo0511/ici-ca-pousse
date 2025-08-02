import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Loader } from 'lucide-react';

const VoiceButton = ({ 
  onTranscript, 
  size = 'md', 
  showTranscript = false, 
  autoStop = false,
  className = '' 
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);

  // Vérifier si l'API Web Speech est disponible
  const isSpeechSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  
  useEffect(() => {
    if (!isSpeechSupported) {
      setError('La reconnaissance vocale n\'est pas supportée par votre navigateur');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = !autoStop;
    recognition.interimResults = true;
    recognition.lang = 'fr-FR';

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
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

      const fullTranscript = finalTranscript + interimTranscript;
      setTranscript(fullTranscript);

      if (finalTranscript && autoStop) {
        recognition.stop();
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      if (transcript.trim() && onTranscript) {
        onTranscript(transcript.trim());
      }
    };

    recognition.onerror = (event) => {
      setIsListening(false);
      if (event.error === 'no-speech') {
        setError('Aucune parole détectée');
      } else if (event.error === 'audio-capture') {
        setError('Problème d\'accès au microphone');
      } else if (event.error === 'not-allowed') {
        setError('Accès au microphone refusé');
      } else {
        setError('Erreur de reconnaissance vocale');
      }
    };

    if (isListening) {
      recognition.start();
    }

    return () => {
      recognition.stop();
    };
  }, [isListening, autoStop, onTranscript, isSpeechSupported]);

  const toggleListening = () => {
    if (!isSpeechSupported) {
      setError('La reconnaissance vocale n\'est pas supportée');
      return;
    }
    setIsListening(!isListening);
  };

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  if (!isSpeechSupported) {
    return (
      <button
        disabled
        className={`${sizeClasses[size]} bg-gray-300 text-gray-500 rounded-full flex items-center justify-center cursor-not-allowed ${className}`}
        title="Reconnaissance vocale non supportée"
      >
        <MicOff className={iconSizes[size]} />
      </button>
    );
  }

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <button
        onClick={toggleListening}
        disabled={!!error}
        className={`
          ${sizeClasses[size]} 
          ${isListening 
            ? 'bg-red-500 hover:bg-red-600 text-white' 
            : 'bg-blue-500 hover:bg-blue-600 text-white'
          } 
          rounded-full flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-xl
          ${error ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        title={isListening ? 'Arrêter l\'écoute' : 'Commencer l\'écoute'}
      >
        {isListening ? (
          <Loader className={`${iconSizes[size]} animate-spin`} />
        ) : (
          <Mic className={iconSizes[size]} />
        )}
      </button>
      
      {showTranscript && transcript && (
        <div className="mt-2 p-2 bg-gray-100 rounded text-sm text-gray-700 max-w-xs">
          {transcript}
        </div>
      )}
      
      {error && (
        <div className="mt-2 p-2 bg-red-100 rounded text-xs text-red-700 max-w-xs">
          {error}
        </div>
      )}
    </div>
  );
};

export default VoiceButton; 