import React from 'react';
import ReactDOM from 'react-dom';
import { X } from 'lucide-react';
import Chatbot from './Chatbot';

// Props : user, workouts, setExercisesFromWorkout, setShowAddExercise, setActiveTab
function ChatbotBubble(props) {
  const [open, setOpen] = React.useState(false);
  const [unread, setUnread] = React.useState(false);
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

  // Créer le contenu du bouton flottant
  const floatingButton = (
    <div 
      className="lex-ia-container"
      style={{ 
        position: 'fixed', 
        left: '20px', 
        bottom: '20px', 
        zIndex: 10001,
        pointerEvents: 'auto',
        transform: 'none'
      }}
    >
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Ouvrir Coach Lex IA"
          style={{ 
            position: 'static', 
            width: 'auto', 
            height: 'auto', 
            borderRadius: '0.75rem',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            cursor: 'pointer',
            boxShadow: '0 8px 25px rgba(139, 92, 246, 0.4)',
            zIndex: 10000,
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            padding: '8px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease',
            fontFamily: 'inherit',
            fontSize: '14px',
            fontWeight: '600'
          }}
        >
          <span style={{ fontWeight: '600', fontSize: '14px', letterSpacing: '0.025em' }}>LEX IA</span>
          {unread && (
            <span style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              width: '12px',
              height: '12px',
              backgroundColor: '#ef4444',
              borderRadius: '50%',
              border: '2px solid white',
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
            }}></span>
          )}
        </button>
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
      {/* Rendre le bouton directement dans le body via un portail */}
      {typeof document !== 'undefined' && ReactDOM.createPortal(floatingButton, document.body)}
    </>
  );
}

export default ChatbotBubble;
