#!/usr/bin/env node

/**
 * Script pour corriger automatiquement tous les imports après la réorganisation
 * Usage: node scripts/fix-imports.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Correction automatique des imports...\n');

// Définir les remplacements d'imports
const importReplacements = [
  // Utils storage
  {
    pattern: /from ['"]\.\.\/utils\/storage['"]/g,
    replacement: "from '../utils/firebase/storage'",
  },
  {
    pattern: /from ['"]\.\.\/\.\.\/utils\/storage['"]/g,
    replacement: "from '../../utils/firebase/storage'",
  },
  {
    pattern: /from ['"]\.\.\/\.\.\/\.\.\/utils\/storage['"]/g,
    replacement: "from '../../../utils/firebase/storage'",
  },

  // Utils firebase
  {
    pattern: /from ['"]\.\.\/utils\/firebase['"]/g,
    replacement: "from '../utils/firebase/index.js'",
  },
  {
    pattern: /from ['"]\.\.\/\.\.\/utils\/firebase['"]/g,
    replacement: "from '../../utils/firebase/index.js'",
  },
  {
    pattern: /from ['"]\.\.\/\.\.\/\.\.\/utils\/firebase['"]/g,
    replacement: "from '../../../utils/firebase/index.js'",
  },

  // Utils workout
  {
    pattern: /from ['"]\.\.\/utils\/workoutUtils['"]/g,
    replacement: "from '../utils/workout/workoutUtils'",
  },
  {
    pattern: /from ['"]\.\.\/\.\.\/utils\/workoutUtils['"]/g,
    replacement: "from '../../utils/workout/workoutUtils'",
  },
  {
    pattern: /from ['"]\.\.\/\.\.\/\.\.\/utils\/workoutUtils['"]/g,
    replacement: "from '../../../utils/workout/workoutUtils'",
  },

  // Utils exerciseDatabase
  {
    pattern: /from ['"]\.\.\/utils\/exerciseDatabase['"]/g,
    replacement: "from '../utils/workout/exerciseDatabase'",
  },
  {
    pattern: /from ['"]\.\.\/\.\.\/utils\/exerciseDatabase['"]/g,
    replacement: "from '../../utils/workout/exerciseDatabase'",
  },
  {
    pattern: /from ['"]\.\.\/\.\.\/\.\.\/utils\/exerciseDatabase['"]/g,
    replacement: "from '../../../utils/workout/exerciseDatabase'",
  },

  // Utils AI modules
  {
    pattern: /from ['"]\.\.\/utils\/openaiFunctions['"]/g,
    replacement: "from '../utils/ai/openaiFunctions'",
  },
  {
    pattern: /from ['"]\.\.\/\.\.\/utils\/openaiFunctions['"]/g,
    replacement: "from '../../utils/ai/openaiFunctions'",
  },
  {
    pattern: /from ['"]\.\.\/\.\.\/\.\.\/utils\/openaiFunctions['"]/g,
    replacement: "from '../../../utils/ai/openaiFunctions'",
  },

  {
    pattern: /from ['"]\.\.\/utils\/aiMonitoring['"]/g,
    replacement: "from '../utils/ai/aiMonitoring'",
  },
  {
    pattern: /from ['"]\.\.\/\.\.\/utils\/aiMonitoring['"]/g,
    replacement: "from '../../utils/ai/aiMonitoring'",
  },
  {
    pattern: /from ['"]\.\.\/\.\.\/\.\.\/utils\/aiMonitoring['"]/g,
    replacement: "from '../../../utils/ai/aiMonitoring'",
  },

  {
    pattern: /from ['"]\.\.\/utils\/safetyValidator['"]/g,
    replacement: "from '../utils/ai/safetyValidator'",
  },
  {
    pattern: /from ['"]\.\.\/\.\.\/utils\/safetyValidator['"]/g,
    replacement: "from '../../utils/ai/safetyValidator'",
  },
  {
    pattern: /from ['"]\.\.\/\.\.\/\.\.\/utils\/safetyValidator['"]/g,
    replacement: "from '../../../utils/ai/safetyValidator'",
  },

  {
    pattern: /from ['"]\.\.\/utils\/knowledgeBase['"]/g,
    replacement: "from '../utils/ai/knowledgeBase'",
  },
  {
    pattern: /from ['"]\.\.\/\.\.\/utils\/knowledgeBase['"]/g,
    replacement: "from '../../utils/ai/knowledgeBase'",
  },
  {
    pattern: /from ['"]\.\.\/\.\.\/\.\.\/utils\/knowledgeBase['"]/g,
    replacement: "from '../../../utils/ai/knowledgeBase'",
  },

  // Constants
  {
    pattern: /from ['"]\.\.\/utils\/constants['"]/g,
    replacement: "from '../constants'",
  },
  {
    pattern: /from ['"]\.\.\/\.\.\/utils\/constants['"]/g,
    replacement: "from '../../constants'",
  },
  {
    pattern: /from ['"]\.\.\/\.\.\/\.\.\/utils\/constants['"]/g,
    replacement: "from '../../../constants'",
  },
];

// Fonction pour traiter un fichier
function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    importReplacements.forEach((replacement) => {
      const newContent = content.replace(
        replacement.pattern,
        replacement.replacement
      );
      if (newContent !== content) {
        content = newContent;
        modified = true;
      }
    });

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Erreur avec ${filePath}:`, error.message);
    return false;
  }
}

// Fonction pour parcourir récursivement les dossiers
function processDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);
  let totalModified = 0;

  files.forEach((file) => {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);

    if (
      stat.isDirectory() &&
      !file.startsWith('.') &&
      file !== 'node_modules'
    ) {
      totalModified += processDirectory(filePath);
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
      if (processFile(filePath)) {
        totalModified++;
      }
    }
  });

  return totalModified;
}

// Traiter le dossier src
const srcPath = path.join(__dirname, '../src');
console.log('📁 Traitement du dossier src...\n');

const modifiedFiles = processDirectory(srcPath);

console.log('\n' + '='.repeat(50));
console.log(`🎉 Correction terminée !`);
console.log(`📊 ${modifiedFiles} fichiers modifiés`);
console.log('\n📋 Prochaines étapes:');
console.log("  • npm start - Vérifier que l'application compile");
console.log('  • npm test - Vérifier que les tests passent');
console.log('  • npm run cleanup - Vérifier la structure');
