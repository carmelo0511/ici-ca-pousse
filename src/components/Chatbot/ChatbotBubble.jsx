import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X } from 'lucide-react';
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
      if (last && last.role === 'assistant' && props.messages.length > lastMsgCount.current) {
        setUnread(true);
        lastMsgCount.current = props.messages.length;
      }
    }
    if (open) setUnread(false);
  }, [props.messages, open]);

  return (
    <>
      {/* Bulle flottante */}
      <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1000 }}>
        {!open && (
          <button
            onClick={() => setOpen(true)}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full shadow-lg p-4 flex items-center justify-center relative hover:scale-105 transition-all"
            aria-label="Ouvrir le chatbot IA"
          >
            <MessageCircle className="w-7 h-7" />
            {unread && <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>}
          </button>
        )}
        {open && (
          <div className="fixed bottom-24 right-6 w-[350px] max-w-[95vw] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col z-50 animate-fade-in">
            <div className="flex justify-between items-center p-3 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-t-2xl">
              <span className="font-bold text-indigo-700 text-lg">Chatbot IA</span>
              <button onClick={() => setOpen(false)} className="text-gray-500 hover:text-red-500 p-1 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto max-h-[60vh]">
              <Chatbot {...props} minimalMode />
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ChatbotBubble; 