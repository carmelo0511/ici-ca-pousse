#!/usr/bin/env node

/**
 * Script de nettoyage et maintenance du projet Ici Ca Pousse
 * Usage: node scripts/cleanup.js
 */

const fs = require('fs');
const path = require('path');

console.log('🧹 Nettoyage du projet Ici Ca Pousse...\n');

// Fichiers et dossiers à vérifier et nettoyer
const cleanupTasks = [
  {
    name: 'Vérification des fichiers de test',
    check: () => {
      const testDir = path.join(__dirname, '../src/tests');
      const files = fs.readdirSync(testDir);
      const oldTestFiles = files.filter(
        (file) =>
          file !== 'features' &&
          file.endsWith('.test.js') &&
          file !== 'allFeatures.test.js'
      );

      if (oldTestFiles.length > 0) {
        console.log(
          `❌ Fichiers de test obsolètes trouvés: ${oldTestFiles.join(', ')}`
        );
        return false;
      }
      console.log('✅ Fichiers de test propres');
      return true;
    },
  },
  {
    name: 'Vérification de la structure des utils',
    check: () => {
      const utilsDir = path.join(__dirname, '../src/utils');
      const expectedDirs = ['ai', 'firebase', 'workout'];

      for (const dir of expectedDirs) {
        const dirPath = path.join(utilsDir, dir);
        if (!fs.existsSync(dirPath)) {
          console.log(`❌ Dossier manquant: src/utils/${dir}`);
          return false;
        }

        const indexFile = path.join(dirPath, 'index.js');
        if (!fs.existsSync(indexFile)) {
          console.log(`❌ Fichier index.js manquant dans src/utils/${dir}`);
          return false;
        }
      }
      console.log('✅ Structure des utils organisée');
      return true;
    },
  },
  {
    name: 'Vérification des fichiers de configuration',
    check: () => {
      const rootDir = __dirname + '/..';
      const files = fs.readdirSync(rootDir);

      // Fichiers qui ne devraient plus exister
      const unwantedFiles = [
        'tsconfig.json',
        'REFACTORING_NOTES.md',
        'firebase-storage-rules-backup.txt',
      ];

      for (const file of unwantedFiles) {
        if (fs.existsSync(path.join(rootDir, file))) {
          console.log(`❌ Fichier indésirable trouvé: ${file}`);
          return false;
        }
      }
      console.log('✅ Fichiers de configuration propres');
      return true;
    },
  },
  {
    name: 'Vérification de la documentation',
    check: () => {
      const rootDir = __dirname + '/..';
      const docsDir = path.join(rootDir, 'docs');
      const requiredDocs = [
        'README.md', // À la racine
      ];
      const docsInDocsFolder = [
        'PROJECT_STRUCTURE.md',
        'ARCHITECTURE.md',
        'FIREBASE_SETUP.md',
      ];

      // Vérifier README.md à la racine
      if (!fs.existsSync(path.join(rootDir, 'README.md'))) {
        console.log(`❌ Documentation manquante: README.md`);
        return false;
      }

      // Vérifier les docs dans le dossier docs/
      for (const doc of docsInDocsFolder) {
        if (!fs.existsSync(path.join(docsDir, doc))) {
          console.log(`❌ Documentation manquante: docs/${doc}`);
          return false;
        }
      }
      console.log('✅ Documentation complète');
      return true;
    },
  },
];

// Exécuter les tâches de nettoyage
let allClean = true;

for (const task of cleanupTasks) {
  console.log(`\n🔍 ${task.name}...`);
  if (!task.check()) {
    allClean = false;
  }
}

console.log('\n' + '='.repeat(50));

if (allClean) {
  console.log('🎉 Projet propre et bien organisé !');
  console.log('\n📋 Actions recommandées:');
  console.log('  • npm test - Vérifier que tous les tests passent');
  console.log('  • npm run build - Vérifier le build de production');
  console.log("  • npm start - Tester l'application en développement");
} else {
  console.log('⚠️  Problèmes détectés. Veuillez les corriger.');
  console.log('\n🔧 Actions recommandées:');
  console.log('  • Supprimer les fichiers obsolètes');
  console.log('  • Réorganiser la structure si nécessaire');
  console.log('  • Mettre à jour la documentation');
}

console.log('\n📚 Documentation:');
console.log('  • README.md - Guide principal (racine)');
console.log('  • docs/PROJECT_STRUCTURE.md - Structure détaillée du projet');
console.log('  • docs/ARCHITECTURE.md - Architecture technique');
