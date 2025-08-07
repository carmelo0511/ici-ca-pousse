import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import Chatbot from './Chatbot';

// Props : user, workouts, setExercisesFromWorkout, setShowAddExercise, setActiveTab
const ChatbotBubble = (props) => {
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(false);
  const lastMsgCount = useRef(0);

  // Détecte les nouveaux messages assistants
  useEffect(() => {
    if (!open && props.messages) {
      const last = props.messages[props.messages.length - 1];
      if (
        last &&
        last.role === 'assistant' &&
        props.messages.length > lastMsgCount.current
      ) {
        setUnread(true);
        lastMsgCount.current = props.messages.length;
      }
    }
    if (open) setUnread(false);
  }, [props.messages, open]);

  // Fonction pour fermer le chatbot
  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      {/* Bouton texte flottant en bas à gauche - toujours visible */}
      <div style={{ 
        position: 'fixed', 
        left: 32, 
        bottom: 24, 
        zIndex: 1000,
        pointerEvents: 'auto'
      }}>
        {!open && (
          <button
            onClick={() => setOpen(true)}
            className="lex-ia-button ripple-effect flex items-center justify-center relative transition-all duration-300 px-4 py-2"
            aria-label="Ouvrir Coach Lex IA"
            style={{ 
              position: 'static', 
              width: 'auto', 
              height: 'auto', 
              borderRadius: '0.75rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 8px 25px rgba(139, 92, 246, 0.4)',
              zIndex: 1001
            }}
          >
            <span className="font-semibold text-sm tracking-wide">LEX IA</span>
            {unread && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
            )}
          </button>
        )}
        {open && (
          <div className="absolute bottom-12 left-0 right-0 sm:bottom-16 sm:left-0 sm:right-auto sm:w-[350px] sm:max-w-[95vw] w-full max-w-[calc(100vw-1rem)] modal flex flex-col z-50 animate-fade-in">
            <div className="flex justify-between items-center p-2 sm:p-3 border-b border-glass-border section bg-glass-bg-secondary rounded-t-2xl">
              <span className="section-title text-xs sm:text-lg font-medium">
                Coach Lex IA
              </span>
              <button
                onClick={handleClose}
                className="btn-secondary ripple-effect p-1 rounded-full text-xs"
              >
                <X className="w-3 h-3 sm:w-5 sm:h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto max-h-[35vh] sm:max-h-[55vh]">
              <Chatbot {...props} minimalMode onClose={handleClose} />
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ChatbotBubble;
