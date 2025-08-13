import React from 'react';
import ReactDOM from 'react-dom';
import { X } from 'lucide-react';
import Chatbot from './Chatbot';
import { STORAGE_KEYS } from '../../constants/storageKeys';

// Props : user, workouts, setExercisesFromWorkout, setShowAddExercise, setActiveTab
function ChatbotBubble(props) {
  const [open, setOpen] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const lastMsgCount = React.useRef(0);

  // Détecte les nouveaux messages assistants
  React.useEffect(() => {
    if (!open && props.messages) {
      const last = props.messages[props.messages.length - 1];
      if (
        last &&
        last.role === 'assistant' &&
        props.messages.length > lastMsgCount.current
      ) {
        lastMsgCount.current = props.messages.length;
      }
    }
  }, [props.messages, open]);

  // Fonction pour fermer le chatbot
  const handleClose = () => {
    setOpen(false);
  };

  // Fonction pour envoyer un message
  const handleSendMessage = () => {
    if (message.trim()) {
      // Créer un message utilisateur pour le chatbot
      const userMessage = {
        role: 'user',
        content: message,
        timestamp: Date.now()
      };
      
      // Stocker le message dans localStorage
      const existingMessages = JSON.parse(localStorage.getItem(STORAGE_KEYS.CHATBOT_MEMORY) || '[]');
      const updatedMessages = [...existingMessages, userMessage];
      localStorage.setItem(STORAGE_KEYS.CHATBOT_MEMORY, JSON.stringify(updatedMessages));
      
      // Forcer le rechargement des messages dans le chatbot
      window.dispatchEvent(new Event('storage'));
      
      // Déclencher une réponse automatique du chatbot
      window.dispatchEvent(new CustomEvent('triggerChatbotResponse', { 
        detail: { 
          message: message,
          user: props.user,
          workouts: props.workouts
        } 
      }));
      
      // Envoyer le message au chatbot via les props
      if (props.onSendMessage) {
        props.onSendMessage(message);
      }
      setMessage('');
      
      // Ouvrir le chatbot après avoir envoyé le message
      setTimeout(() => {
        setOpen(true);
      }, 200);
    }
  };

  // Fonction pour ouvrir le chatbot
  const handleOpenChatbot = () => {
    setOpen(true);
  };

  // Fonction pour gérer la touche Entrée
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Créer le contenu du bouton flottant
  const floatingButton = (
    <div 
      className="lex-ia-container"
      style={{ 
        position: 'fixed', 
        left: '50%', 
        bottom: '20px', 
        transform: 'translateX(-50%)',
        zIndex: 10001,
        pointerEvents: 'auto',
        display: 'flex',
        justifyContent: 'center',
        width: '100%'
      }}
    >
      {!open && (
        <div style={{
          position: 'relative',
          background: 'rgba(255, 255, 255, 0.08)',
          borderRadius: '28px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(25px)',
          width: '320px',
          maxWidth: 'calc(100vw - 40px)'
        }}>

          {/* Champ de saisie principal */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            padding: '12px 16px'
          }}>
            <div style={{
              flex: 1,
              position: 'relative'
            }}>
              <input
                type="text"
                placeholder="Demande à LexIA"
                value={message || ''}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  fontSize: '13px',
                  color: 'rgba(255, 255, 255, 0.85)',
                  paddingRight: '32px',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            {/* Boutons d'action */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginLeft: '12px'
            }}>
              {/* Bouton chat */}
                                            <button
                 onClick={handleSendMessage}
                 disabled={!message.trim()}
                 title="Envoyer le message et ouvrir le chatbot"
                 style={{
                   width: '36px',
                   height: '36px',
                   background: message.trim() ? 'rgba(34, 197, 94, 0.7)' : 'rgba(255, 255, 255, 0.08)',
                   borderRadius: '50%',
                   border: '1px solid rgba(255, 255, 255, 0.15)',
                   cursor: message.trim() ? 'pointer' : 'not-allowed',
                   display: 'flex',
                   alignItems: 'center',
                   justifyContent: 'center',
                   transition: 'all 0.3s ease',
                   position: 'relative',
                   backdropFilter: 'blur(10px)'
                 }}
                 onMouseEnter={(e) => {
                   if (message.trim()) {
                     e.target.style.background = 'rgba(22, 163, 74, 0.9)';
                     e.target.style.transform = 'scale(1.05)';
                     e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                   }
                 }}
                 onMouseLeave={(e) => {
                   if (message.trim()) {
                     e.target.style.background = 'rgba(34, 197, 94, 0.8)';
                   } else {
                     e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                   }
                   e.target.style.transform = 'scale(1)';
                   e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                 }}
               >
                 <svg
                   width="18"
                   height="18"
                   viewBox="0 0 24 24"
                   fill="none"
                   stroke="white"
                   strokeWidth="2"
                   strokeLinecap="round"
                   strokeLinejoin="round"
                 >
                   <path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                 </svg>
                 {/* Tooltip */}
                 <div style={{
                   position: 'absolute',
                   bottom: '-30px',
                   left: '50%',
                   transform: 'translateX(-50%)',
                   background: '#374151',
                   color: 'white',
                   padding: '4px 8px',
                   borderRadius: '4px',
                   fontSize: '12px',
                   whiteSpace: 'nowrap',
                   opacity: 0,
                   transition: 'opacity 0.2s ease',
                   pointerEvents: 'none',
                   zIndex: 1000
                 }} className="tooltip">
                   Envoyer et ouvrir
                 </div>
               </button>

              {/* Bouton envoi */}
                                            <button
                 onClick={handleOpenChatbot}
                 title="Ouvrir le chatbot"
                 style={{
                   width: '36px',
                   height: '36px',
                   background: 'rgba(255, 255, 255, 0.08)',
                   borderRadius: '50%',
                   border: '1px solid rgba(255, 255, 255, 0.15)',
                   cursor: 'pointer',
                   display: 'flex',
                   alignItems: 'center',
                   justifyContent: 'center',
                   transition: 'all 0.3s ease',
                   position: 'relative',
                   backdropFilter: 'blur(10px)'
                 }}
                 onMouseEnter={(e) => {
                   e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                   e.target.style.transform = 'scale(1.05)';
                   e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                 }}
                 onMouseLeave={(e) => {
                   e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                   e.target.style.transform = 'scale(1)';
                   e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                 }}
               >
                 <svg
                   width="18"
                   height="18"
                   viewBox="0 0 24 24"
                   fill="none"
                   stroke="#9ca3af"
                   strokeWidth="2"
                   strokeLinecap="round"
                   strokeLinejoin="round"
                 >
                   <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                 </svg>
                 {/* Tooltip */}
                 <div style={{
                   position: 'absolute',
                   bottom: '-30px',
                   left: '50%',
                   transform: 'translateX(-50%)',
                   background: '#374151',
                   color: 'white',
                   padding: '4px 8px',
                   borderRadius: '4px',
                   fontSize: '12px',
                   whiteSpace: 'nowrap',
                   opacity: 0,
                   transition: 'opacity 0.2s ease',
                   pointerEvents: 'none',
                   zIndex: 1000
                 }} className="tooltip">
                   Ouvrir le chat
                 </div>
               </button>
            </div>
          </div>
        </div>
      )}
      {open && (
        <div 
          style={{
            position: 'fixed',
            right: '20px',
            bottom: '90px',
            width: 'min(600px, calc(100vw - 40px))',
            height: 'min(70vh, 600px)',
            maxHeight: 'calc(100vh - 120px)',
            zIndex: 10000,
            background: 'rgba(15, 15, 35, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '20px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            animation: 'cardEntry 0.6s ease-out',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            color: '#ffffff'
          }}
        >
          <div 
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px 20px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              background: 'rgba(15, 15, 35, 0.8)',
              borderTopLeftRadius: '20px',
              borderTopRightRadius: '20px',
              flexShrink: 0
            }}
          >
            <span 
              style={{
                fontSize: '18px',
                fontWeight: '700',
                background: 'linear-gradient(135deg, #ffffff 0%, #a1a1aa 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              Coach Lex IA
            </span>
            <button
              onClick={handleClose}
              style={{
                background: 'rgba(15, 15, 35, 0.4)',
                backdropFilter: 'blur(10px)',
                color: 'rgba(255, 255, 255, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '15px',
                padding: '8px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(15, 15, 35, 0.6)';
                e.target.style.color = '#ffffff';
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(15, 15, 35, 0.4)';
                e.target.style.color = 'rgba(255, 255, 255, 0.8)';
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              <X size={16} />
            </button>
          </div>
          <div 
            style={{
              flex: 1,
              overflowY: 'auto',
              background: 'rgba(15, 15, 35, 0.7)',
              borderBottomLeftRadius: '20px',
              borderBottomRightRadius: '20px',
              minHeight: '450px'
            }}
          >
            <div style={{
              background: 'rgba(15, 15, 35, 0.7)',
              color: '#ffffff'
            }}>
              <Chatbot {...props} minimalMode onClose={handleClose} />
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* CSS pour les tooltips */}
      <style>
        {`
          .tooltip {
            opacity: 0;
            transition: opacity 0.2s ease;
          }
          button:hover .tooltip {
            opacity: 1;
          }
        `}
      </style>
      {/* Rendre le bouton directement dans le body via un portail */}
      {typeof document !== 'undefined' && ReactDOM.createPortal(floatingButton, document.body)}
    </>
  );
}

export default ChatbotBubble;
