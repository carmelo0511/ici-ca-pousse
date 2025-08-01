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
      {/* Bouton texte flottant en bas à gauche */}
      <div style={{ position: 'fixed', left: 24, bottom: 24, zIndex: 1000 }}>
        {!open && (
          <button
            onClick={() => setOpen(true)}
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg px-4 py-2 flex items-center justify-center relative hover:shadow-xl transition-all duration-300 rounded-xl border border-white/30"
            aria-label="Ouvrir Coach Lex IA"
          >
            <span className="font-semibold text-sm tracking-wide">LEX IA</span>
            {unread && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
            )}
          </button>
        )}
        {open && (
          <div className="fixed bottom-20 left-6 w-[350px] max-w-[95vw] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col z-50 animate-fade-in">
            <div className="flex justify-between items-center p-3 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl">
              <span className="font-bold text-blue-700 text-lg">
                Coach Lex IA
              </span>
              <button
                onClick={handleClose}
                className="text-gray-500 hover:text-red-500 p-1 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto max-h-[60vh]">
              <Chatbot {...props} minimalMode onClose={handleClose} />
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ChatbotBubble;
