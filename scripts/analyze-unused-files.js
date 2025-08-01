const fs = require('fs');
const path = require('path');

console.log('🔍 Analyse des fichiers non utilisés...\n');

// Fonction pour lire récursivement tous les fichiers
function getAllFiles(dir, extensions = ['.js', '.jsx']) {
  const files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules' && item !== 'build' && item !== 'coverage') {
      files.push(...getAllFiles(fullPath, extensions));
    } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Fonction pour extraire les imports d'un fichier
function extractImports(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const imports = [];
    
    // Regex pour détecter les imports
    const importRegex = /import\s+(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)\s+from\s+)?['"`]([^'"`]+)['"`]/g;
    let match;
    
    while ((match = importRegex.exec(content)) !== null) {
      const importPath = match[1];
      if (importPath.startsWith('.') || importPath.startsWith('/')) {
        imports.push(importPath);
      }
    }
    
    return imports;
  } catch (error) {
    console.warn(`Erreur lors de la lecture de ${filePath}:`, error.message);
    return [];
  }
}

// Fonction pour résoudre un chemin d'import
function resolveImportPath(importPath, currentFile) {
  const currentDir = path.dirname(currentFile);
  
  if (importPath.startsWith('./') || importPath.startsWith('../')) {
    let resolvedPath = path.resolve(currentDir, importPath);
    
    // Essayer différentes extensions
    const extensions = ['.js', '.jsx', '.ts', '.tsx'];
    for (const ext of extensions) {
      if (fs.existsSync(resolvedPath + ext)) {
        return resolvedPath + ext;
      }
    }
    
    // Essayer avec index.js
    if (fs.existsSync(path.join(resolvedPath, 'index.js'))) {
      return path.join(resolvedPath, 'index.js');
    }
    
    return resolvedPath;
  }
  
  return null;
}

// Analyser les fichiers
const srcDir = path.join(__dirname, '../src');
const allFiles = getAllFiles(srcDir);

console.log(`📁 ${allFiles.length} fichiers trouvés dans src/\n`);

// Collecter tous les imports
const fileImports = new Map();
const importedFiles = new Set();

for (const file of allFiles) {
  const imports = extractImports(file);
  fileImports.set(file, imports);
  
  for (const importPath of imports) {
    const resolvedPath = resolveImportPath(importPath, file);
    if (resolvedPath && fs.existsSync(resolvedPath)) {
      importedFiles.add(resolvedPath);
    }
  }
}

// Identifier les fichiers non utilisés
const unusedFiles = allFiles.filter(file => !importedFiles.has(file));

// Filtrer les fichiers qui ne devraient pas être importés
const excludePatterns = [
  /index\.js$/, // Fichiers index
  /App\.js$/, // App principal
  /setupTests\.js$/, // Configuration des tests
  /serviceWorkerRegistration\.js$/, // Service worker
  /i18n\.js$/, // Configuration i18n
];

const trulyUnusedFiles = unusedFiles.filter(file => 
  !excludePatterns.some(pattern => pattern.test(file))
);

console.log('📋 Fichiers potentiellement non utilisés :');
console.log('=====================================');

if (trulyUnusedFiles.length === 0) {
  console.log('✅ Aucun fichier non utilisé trouvé !');
} else {
  trulyUnusedFiles.forEach(file => {
    const relativePath = path.relative(srcDir, file);
    console.log(`❌ ${relativePath}`);
  });
}

// Analyser les composants spécifiquement
console.log('\n🔍 Analyse des composants :');
console.log('==========================');

const componentFiles = allFiles.filter(file => 
  file.includes('/components/') && 
  (file.endsWith('.jsx') || file.endsWith('.js'))
);

const unusedComponents = componentFiles.filter(file => !importedFiles.has(file));

console.log(`📦 ${componentFiles.length} composants trouvés`);
console.log(`❌ ${unusedComponents.length} composants non utilisés :`);

unusedComponents.forEach(file => {
  const relativePath = path.relative(srcDir, file);
  console.log(`   - ${relativePath}`);
});

// Analyser les hooks
console.log('\n🔍 Analyse des hooks :');
console.log('=====================');

const hookFiles = allFiles.filter(file => 
  file.includes('/hooks/') && 
  file.endsWith('.js') &&
  !file.endsWith('index.js')
);

const unusedHooks = hookFiles.filter(file => !importedFiles.has(file));

console.log(`🎣 ${hookFiles.length} hooks trouvés`);
console.log(`❌ ${unusedHooks.length} hooks non utilisés :`);

unusedHooks.forEach(file => {
  const relativePath = path.relative(srcDir, file);
  console.log(`   - ${relativePath}`);
});

// Analyser les utils
console.log('\n🔍 Analyse des utilitaires :');
console.log('============================');

const utilFiles = allFiles.filter(file => 
  file.includes('/utils/') && 
  file.endsWith('.js') &&
  !file.endsWith('index.js')
);

const unusedUtils = utilFiles.filter(file => !importedFiles.has(file));

console.log(`🛠️  ${utilFiles.length} utilitaires trouvés`);
console.log(`❌ ${unusedUtils.length} utilitaires non utilisés :`);

unusedUtils.forEach(file => {
  const relativePath = path.relative(srcDir, file);
  console.log(`   - ${relativePath}`);
});

console.log('\n✅ Analyse terminée !'); 