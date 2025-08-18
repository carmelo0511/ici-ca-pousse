#!/usr/bin/env node

/**
 * Script d'optimisation des imports
 * Supprime les imports inutiles et optimise les imports
 */

const fs = require('fs');
const path = require('path');

function findJSFiles(dir, files = []) {
  const dirFiles = fs.readdirSync(dir);
  
  for (const file of dirFiles) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && file !== 'node_modules' && file !== 'build' && file !== 'coverage') {
      findJSFiles(filePath, files);
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
      files.push(filePath);
    }
  }
  
  return files;
}

function analyzeImports(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  const imports = [];
  const usages = new Set();
  
  // Extraire les imports
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('import ') && !line.includes('//')) {
      imports.push({ line, index: i, content: line });
    }
  }
  
  // Analyser l'utilisation
  const restOfFile = lines.slice(imports.length).join('\n');
  
  for (const importLine of imports) {
    // Extraire les noms importés
    const match = importLine.content.match(/import\s+{([^}]+)}/);
    if (match) {
      const importedNames = match[1].split(',').map(name => name.trim());
      
      for (const name of importedNames) {
        const cleanName = name.replace(/\s+as\s+\w+/, '').trim();
        if (restOfFile.includes(cleanName)) {
          usages.add(importLine.content);
        }
      }
    } else {
      // Import par défaut ou import complet
      const defaultMatch = importLine.content.match(/import\s+(\w+)/);
      if (defaultMatch) {
        const importName = defaultMatch[1];
        if (restOfFile.includes(importName)) {
          usages.add(importLine.content);
        }
      }
    }
  }
  
  return {
    totalImports: imports.length,
    usedImports: usages.size,
    unusedImports: imports.length - usages.size,
    filePath
  };
}

function main() {
  console.log('🔍 Analyse des imports...\n');
  
  const srcDir = path.join(__dirname, '..', 'src');
  const jsFiles = findJSFiles(srcDir);
  
  let totalFiles = 0;
  let totalImports = 0;
  let totalUnused = 0;
  
  for (const file of jsFiles) {
    const analysis = analyzeImports(file);
    
    if (analysis.unusedImports > 0) {
      console.log(`📄 ${path.relative(srcDir, analysis.filePath)}`);
      console.log(`   Total imports: ${analysis.totalImports}`);
      console.log(`   Utilisés: ${analysis.usedImports}`);
      console.log(`   ⚠️  Potentiellement inutilisés: ${analysis.unusedImports}\n`);
    }
    
    totalFiles++;
    totalImports += analysis.totalImports;
    totalUnused += analysis.unusedImports;
  }
  
  console.log('📊 Résumé:');
  console.log(`   Fichiers analysés: ${totalFiles}`);
  console.log(`   Total imports: ${totalImports}`);
  console.log(`   Potentiellement inutilisés: ${totalUnused}`);
  console.log(`   Taux d'optimisation: ${((1 - totalUnused / totalImports) * 100).toFixed(1)}%`);
  
  if (totalUnused === 0) {
    console.log('✅ Tous les imports semblent être utilisés !');
  } else {
    console.log('\n💡 Note: Cette analyse est basique. Vérifiez manuellement avant de supprimer.');
  }
}

main();