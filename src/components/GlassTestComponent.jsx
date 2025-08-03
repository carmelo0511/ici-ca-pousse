import React from 'react';
import Card from './Card';
import GradientButton from './GradientButton';

/**
 * Test component to showcase glassmorphism styling
 * This component demonstrates all the key glassmorphism elements
 */
const GlassTestComponent = () => {
  return (
    <div className="space-y-6 p-6">
      <div className="text-center">
        <h1 className="text-glass text-3xl font-bold mb-2">
          🎯 Glassmorphism Theme Test
        </h1>
        <p className="text-glass-secondary">
          Voici un aperçu du nouveau design glassmorphisme sombre
        </p>
      </div>

      {/* Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="space-y-4">
          <h3 className="text-glass text-xl font-semibold">
            ✨ Card Glassmorphisme
          </h3>
          <p className="text-glass-secondary">
            Cette carte utilise le nouveau style glassmorphisme avec effet de verre,
            bordures subtiles et ombres modernes.
          </p>
          
          <div className="space-y-3">
            <GradientButton>
              🚀 Bouton Principal
            </GradientButton>
            
            <button className="btn-secondary w-full">
              📝 Bouton Secondaire
            </button>
            
            <button className="btn-green w-full">
              ✅ Bouton Vert
            </button>
          </div>
        </Card>

        <Card className="space-y-4">
          <h3 className="text-glass text-xl font-semibold">
            🎨 Éléments d'Interface
          </h3>
          
          {/* Input Field */}
          <div>
            <label className="label">Champ de saisie glassmorphisme</label>
            <input 
              type="text" 
              className="input" 
              placeholder="Tapez quelque chose..."
            />
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <span className="badge badge-blue">🔵 Bleu</span>
            <span className="badge badge-green">🟢 Vert</span>
            <span className="badge badge-purple">🟣 Violet</span>
            <span className="badge badge-red">🔴 Rouge</span>
          </div>

          {/* Nav Tabs Demo */}
          <div className="flex gap-2">
            <button className="nav-tab active">Actif</button>
            <button className="nav-tab">Inactif</button>
            <button className="nav-tab">Tab 3</button>
          </div>
        </Card>
      </div>

      {/* Effects Demo */}
      <Card className="text-center space-y-4">
        <h3 className="text-glass text-xl font-semibold">
          ⚡ Effets et Animations
        </h3>
        
        <div className="flex flex-wrap justify-center gap-4">
          <button className="btn-primary hover-shine">
            ✨ Effet Brillance
          </button>
          
          <button className="btn-secondary hover-lift">
            📈 Effet Levée
          </button>
          
          <button className="btn-purple hover-glow">
            🌟 Effet Glow
          </button>
          
          <button className="btn-primary pulse-glow">
            💫 Pulsation
          </button>
        </div>
        
        <p className="text-glass-tertiary text-sm">
          Cliquez sur les boutons pour voir les effets de burst et animations !
        </p>
      </Card>

      {/* Background Info */}
      <div className="bg-glass-light border-glass rounded-2xl p-4">
        <h4 className="text-glass font-semibold mb-2">
          🎭 Arrière-plan avec Particules
        </h4>
        <p className="text-glass-secondary text-sm">
          Des particules flottantes subtiles sont générées automatiquement 
          pour créer un effet de profondeur et de mouvement dans l'arrière-plan.
        </p>
      </div>
    </div>
  );
};

export default GlassTestComponent;