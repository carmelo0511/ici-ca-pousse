import React from 'react';
import { Bot, MessageCircle, ArrowRight } from 'lucide-react';

const LexIA = ({ className = '' }) => {
  return (
    <div 
      className={`bg-gray-100 rounded-xl p-6 border border-gray-200 shadow-sm ${className}`}
      data-testid="ia-info-box"
    >
      <div className="flex items-center space-x-3 mb-4">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-lg">
          <Bot className="h-5 w-5 text-white" />
        </div>
        <h3 className="text-lg font-bold text-gray-800">
          🤖 LEX IA
        </h3>
      </div>
      
      <div className="space-y-3 text-gray-700">
        <p className="text-sm">
          Vous pouvez discuter librement avec le Coach IA pour :
        </p>
        
        <ul className="space-y-2 text-sm">
          <li className="flex items-start space-x-2">
            <span className="text-blue-500 mt-0.5">•</span>
            <span>Générer des plans d'entraînement selon vos objectifs (prise de masse, sèche, entretien…)</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-blue-500 mt-0.5">•</span>
            <span>Poser des questions sur votre progression ou vos performances</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-blue-500 mt-0.5">•</span>
            <span>Recevoir des conseils motivationnels ou adaptés à votre niveau</span>
          </li>
        </ul>
        
        <div className="bg-white rounded-lg p-4 border border-gray-200 mt-4">
          <div className="flex items-center space-x-2 mb-2">
            <MessageCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-gray-800">💬 Exemple :</span>
          </div>
          <p className="text-sm text-gray-700 italic">
            "Je reprends après une pause de 2 semaines, tu me proposes quoi ?"
          </p>
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-gray-600 mt-4">
          <ArrowRight className="h-4 w-4 text-blue-500" />
          <span>Le Coach IA s'appuie sur vos données passées pour répondre de façon personnalisée.</span>
        </div>
      </div>
    </div>
  );
};

export default LexIA; 