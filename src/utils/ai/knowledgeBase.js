// Base de connaissances spécialisée en fitness avec système RAG
class KnowledgeBase {
  constructor() {
    this.documents = new Map();
    this.embeddings = new Map();
    this.index = new Map(); // Index inversé pour recherche rapide

    // Initialiser la base de connaissances
    this.initializeKnowledgeBase();
  }

  // Initialiser la base de connaissances avec des documents spécialisés
  initializeKnowledgeBase() {
    const fitnessDocuments = [
      {
        id: 'anatomy-001',
        title: 'Anatomie et Muscles',
        category: 'anatomy',
        content: `
          # Anatomie et Muscles Principaux
          
          ## Groupe Musculaire Supérieur
          - **Pectoraux** : Muscles de la poitrine, responsables des mouvements de poussée
          - **Dorsaux** : Muscles du dos, essentiels pour la posture et les tractions
          - **Épaules** : Deltoïdes antérieur, moyen et postérieur
          - **Biceps** : Flexion du coude et rotation de l'avant-bras
          - **Triceps** : Extension du coude, antagoniste des biceps
          
          ## Groupe Musculaire Inférieur
          - **Quadriceps** : Extension du genou, muscles de la cuisse avant
          - **Ischio-jambiers** : Flexion du genou, muscles de la cuisse arrière
          - **Fessiers** : Extension de la hanche, stabilisation du bassin
          - **Mollets** : Flexion plantaire, propulsion à la marche
          
          ## Muscles Stabilisateurs
          - **Abdominaux** : Stabilisation du tronc, protection des organes
          - **Lombaires** : Extension du dos, maintien de la posture
          - **Trapèzes** : Élévation et rétraction des épaules
        `,
        tags: ['anatomie', 'muscles', 'groupe musculaire', 'stabilisation'],
      },

      {
        id: 'exercises-001',
        title: 'Exercices Fondamentaux',
        category: 'exercises',
        content: `
          # Exercices Fondamentaux et Techniques
          
          ## Exercices Poly-articulaires
          - **Squat** : Exercice roi pour les jambes, engage quadriceps, fessiers, ischio-jambiers
          - **Deadlift** : Renforcement du dos, fessiers, ischio-jambiers, gainage
          - **Bench Press** : Développement des pectoraux, triceps, épaules antérieures
          - **Pull-ups** : Renforcement des dorsaux, biceps, trapèzes
          - **Overhead Press** : Développement des épaules, triceps, gainage
          
          ## Exercices d'Isolation
          - **Bicep Curls** : Isolation des biceps
          - **Tricep Extensions** : Isolation des triceps
          - **Lateral Raises** : Isolation des épaules moyennes
          - **Leg Extensions** : Isolation des quadriceps
          - **Leg Curls** : Isolation des ischio-jambiers
          
          ## Techniques de Progression
          - **Progressive Overload** : Augmentation progressive de la charge
          - **Volume Training** : Augmentation du nombre de séries/répétitions
          - **Intensity Training** : Augmentation de l'intensité relative
          - **Frequency Training** : Augmentation de la fréquence d'entraînement
        `,
        tags: [
          'exercices',
          'techniques',
          'progression',
          'poly-articulaire',
          'isolation',
        ],
      },

      {
        id: 'nutrition-001',
        title: 'Nutrition et Macronutriments',
        category: 'nutrition',
        content: `
          # Nutrition et Macronutriments
          
          ## Protéines (4 kcal/g)
          - **Rôle** : Construction et réparation musculaire
          - **Besoins** : 1.6-2.2g/kg de poids corporel pour la musculation
          - **Sources** : Viande, poisson, œufs, produits laitiers, légumineuses
          - **Timing** : Répartition sur 3-4 repas, post-entraînement important
          
          ## Glucides (4 kcal/g)
          - **Rôle** : Énergie principale, récupération glycogénique
          - **Besoins** : 3-7g/kg selon l'intensité et la fréquence
          - **Sources** : Riz, pâtes, pommes de terre, fruits, légumes
          - **Timing** : Avant et après entraînement pour performance et récupération
          
          ## Lipides (9 kcal/g)
          - **Rôle** : Hormones, absorption vitamines, énergie de réserve
          - **Besoins** : 0.8-1.5g/kg, minimum 20% des calories
          - **Sources** : Huiles, noix, avocat, poissons gras
          - **Types** : Oméga-3, oméga-6, graisses saturées
          
          ## Hydratation
          - **Besoins** : 2-4L/jour selon activité et climat
          - **Pendant l'entraînement** : 500-1000ml/heure
          - **Électrolytes** : Sodium, potassium, magnésium pour efforts longs
        `,
        tags: [
          'nutrition',
          'protéines',
          'glucides',
          'lipides',
          'hydratation',
          'macronutriments',
        ],
      },

      {
        id: 'recovery-001',
        title: 'Récupération et Régénération',
        category: 'recovery',
        content: `
          # Récupération et Régénération
          
          ## Sommeil
          - **Durée** : 7-9h par nuit pour récupération optimale
          - **Qualité** : Sommeil profond essentiel pour la sécrétion d'hormones
          - **Rythme** : Respecter le cycle circadien, horaires réguliers
          - **Environnement** : Chambre fraîche, sombre, silencieuse
          
          ## Techniques de Récupération
          - **Étirements** : Dynamiques avant, statiques après entraînement
          - **Foam Rolling** : Auto-massage pour relâcher les tensions
          - **Cryothérapie** : Glace pour réduire l'inflammation
          - **Compression** : Vêtements compressifs pour circulation
          - **Électrostimulation** : Stimulation nerveuse pour récupération
          
          ## Gestion de la Fatigue
          - **Surveillance** : RPE (Rate of Perceived Exertion), fréquence cardiaque
          - **Délestage** : Semaines de réduction d'intensité
          - **Variation** : Alternance des types d'entraînement
          - **Écoute corporelle** : Respecter les signaux de fatigue
          
          ## Nutrition Post-Entraînement
          - **Fenêtre anabolique** : 30-60min après entraînement
          - **Protéines** : 20-30g pour stimulation de la synthèse protéique
          - **Glucides** : 0.8-1.2g/kg pour reconstitution glycogénique
          - **Hydratation** : Remplacer les pertes hydriques
        `,
        tags: [
          'récupération',
          'sommeil',
          'fatigue',
          'techniques',
          'nutrition post-entraînement',
        ],
      },

      {
        id: 'programming-001',
        title: "Programmation d'Entraînement",
        category: 'programming',
        content: `
          # Programmation d'Entraînement
          
          ## Principes de Programmation
          - **Spécificité** : Adapter l'entraînement aux objectifs
          - **Progression** : Augmentation progressive des stimuli
          - **Surcharge** : Stimulus suffisant pour adaptation
          - **Variation** : Éviter la stagnation et l'ennui
          - **Récupération** : Temps nécessaire pour adaptation
          
          ## Types de Programmes
          - **Full Body** : Tous les groupes musculaires par séance
          - **Split** : Division par groupes musculaires
          - **Push/Pull/Legs** : Poussée, traction, jambes
          - **Upper/Lower** : Haut et bas du corps
          - **Circuit Training** : Enchaînement d'exercices
          
          ## Variables d'Entraînement
          - **Volume** : Nombre total de séries × répétitions × charge
          - **Intensité** : Pourcentage de la charge maximale
          - **Fréquence** : Nombre de séances par semaine
          - **Densité** : Volume par unité de temps
          - **Temps de repos** : Récupération entre séries
          
          ## Périodisation
          - **Macrocycle** : Planification annuelle
          - **Mésocycle** : Blocs de 4-6 semaines
          - **Microcycle** : Semaine d'entraînement
          - **Séance** : Entraînement individuel
        `,
        tags: [
          'programmation',
          'programmes',
          'variables',
          'périodisation',
          'principe',
        ],
      },

      {
        id: 'injury-001',
        title: 'Prévention des Blessures',
        category: 'injury',
        content: `
          # Prévention des Blessures
          
          ## Échauffement
          - **Cardio** : 5-10min d'activité cardiovasculaire légère
          - **Mobilité** : Exercices de mobilité articulaire
          - **Activation** : Exercices spécifiques pour activer les muscles
          - **Progression** : Augmentation progressive de l'intensité
          
          ## Technique Correcte
          - **Posture** : Maintien de l'alignement corporel
          - **Respiration** : Coordination respiration/mouvement
          - **Contrôle** : Mouvement contrôlé, pas de momentum
          - **Amplitude** : Respecter les amplitudes naturelles
          
          ## Blessures Courantes
          - **Épaules** : Tendinite, bursite, instabilité
          - **Genoux** : Syndrome rotulien, tendinite
          - **Dos** : Lombalgie, hernie discale
          - **Poignets** : Tendinite, syndrome du canal carpien
          
          ## Facteurs de Risque
          - **Surcharge** : Augmentation trop rapide de la charge
          - **Déséquilibre** : Muscles antagonistes faibles
          - **Fatigue** : Technique dégradée par la fatigue
          - **Mobilité** : Amplitude articulaire insuffisante
          
          ## Récupération Active
          - **Étirements** : Maintien de la mobilité
          - **Renforcement** : Muscles stabilisateurs
          - **Équilibre** : Travail des muscles antagonistes
          - **Récupération** : Temps de repos suffisant
        `,
        tags: [
          'blessures',
          'prévention',
          'échauffement',
          'technique',
          'récupération',
        ],
      },

      {
        id: 'supplements-001',
        title: 'Suppléments et Ergogéniques',
        category: 'supplements',
        content: `
          # Suppléments et Ergogéniques
          
          ## Suppléments de Base
          - **Protéines en poudre** : Complément alimentaire pratique
          - **Créatine** : Améliore la performance anaérobie
          - **Vitamine D** : Essentielle pour la santé osseuse
          - **Oméga-3** : Anti-inflammatoire, santé cardiovasculaire
          - **Multivitamines** : Couverture des micronutriments
          
          ## Suppléments de Performance
          - **Caféine** : Stimulant, améliore l'endurance
          - **BCAA** : Acides aminés branchés, récupération
          - **Beta-Alanine** : Améliore la performance anaérobie
          - **Citrulline** : Améliore la circulation sanguine
          - **Glutamine** : Récupération, système immunitaire
          
          ## Suppléments de Récupération
          - **Magnésium** : Relaxation musculaire, sommeil
          - **Zinc** : Récupération, système immunitaire
          - **Curcumine** : Anti-inflammatoire naturel
          - **Probiotiques** : Santé digestive, immunité
          
          ## Précautions
          - **Qualité** : Choisir des marques certifiées
          - **Dosage** : Respecter les recommandations
          - **Interactions** : Vérifier les interactions médicamenteuses
          - **Contre-indications** : Consulter un professionnel
        `,
        tags: [
          'suppléments',
          'ergogéniques',
          'performance',
          'récupération',
          'précautions',
        ],
      },

      {
        id: 'psychology-001',
        title: 'Psychologie et Motivation',
        category: 'psychology',
        content: `
          # Psychologie et Motivation
          
          ## Facteurs de Motivation
          - **Objectifs SMART** : Spécifiques, Mesurables, Atteignables, Réalistes, Temporels
          - **Auto-efficacité** : Croyance en sa capacité de réussir
          - **Contrôle interne** : Sentiment de maîtrise de ses actions
          - **Support social** : Encouragement de l'entourage
          
          ## Techniques de Motivation
          - **Visualisation** : Imaginer le succès et le processus
          - **Auto-discours positif** : Dialogue interne constructif
          - **Récompenses** : Célébration des petites victoires
          - **Responsabilité** : Partager ses objectifs avec d'autres
          
          ## Gestion du Stress
          - **Techniques de respiration** : Respiration diaphragmatique
          - **Méditation** : Pleine conscience, réduction du stress
          - **Gestion du temps** : Planification, priorités
          - **Loisirs** : Activités de détente et plaisir
          
          ## Obstacles Psychologiques
          - **Peur de l'échec** : Perfectionnisme, procrastination
          - **Comparaison sociale** : Se comparer aux autres
          - **Manque de confiance** : Doute de ses capacités
          - **Burnout** : Épuisement physique et mental
          
          ## Stratégies de Persévérance
          - **Habits** : Créer des routines automatiques
          - **Flexibilité** : Adapter les objectifs selon les circonstances
          - **Support** : Demander de l'aide quand nécessaire
          - **Réflexion** : Analyser les succès et échecs
        `,
        tags: [
          'psychologie',
          'motivation',
          'stress',
          'obstacles',
          'persévérance',
        ],
      },
    ];

    // Ajouter les documents à la base de connaissances
    fitnessDocuments.forEach((doc) => {
      this.addDocument(doc);
    });

    // Base de connaissances initialisée avec ${fitnessDocuments.length} documents
  }

  // Ajouter un document à la base de connaissances
  addDocument(document) {
    this.documents.set(document.id, document);

    // Créer des embeddings pour le document
    const embeddings = this.createEmbeddings(document.content);
    this.embeddings.set(document.id, embeddings);

    // Indexer le document pour la recherche
    this.indexDocument(document, embeddings);
  }

  // Créer des embeddings simples (simulation)
  createEmbeddings(content) {
    // Simulation d'embeddings - dans un vrai système, utiliser un modèle d'embedding
    const words = content
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter((word) => word.length > 2);

    const embeddings = {};
    words.forEach((word) => {
      if (!embeddings[word]) {
        embeddings[word] = Math.random(); // Simulation d'un vecteur d'embedding
      }
    });

    return embeddings;
  }

  // Indexer un document pour la recherche
  indexDocument(document, embeddings) {
    const words = Object.keys(embeddings);

    words.forEach((word) => {
      if (!this.index.has(word)) {
        this.index.set(word, new Set());
      }
      this.index.get(word).add(document.id);
    });
  }

  // Rechercher des documents pertinents
  searchDocuments(query, limit = 5) {
    const queryWords = query
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter((word) => word.length > 2);

    const documentScores = new Map();

    // Calculer les scores de pertinence
    queryWords.forEach((word) => {
      const matchingDocs = this.index.get(word);
      if (matchingDocs) {
        matchingDocs.forEach((docId) => {
          const currentScore = documentScores.get(docId) || 0;
          documentScores.set(docId, currentScore + 1);
        });
      }
    });

    // Trier par score et retourner les meilleurs résultats
    const sortedDocs = Array.from(documentScores.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([docId, score]) => ({
        document: this.documents.get(docId),
        score: score / queryWords.length, // Normaliser le score
      }))
      .filter((result) => result.document && result.score > 0.1); // Seuil minimum

    return sortedDocs;
  }

  // Rechercher par catégorie
  searchByCategory(category, limit = 3) {
    const categoryDocs = Array.from(this.documents.values())
      .filter((doc) => doc.category === category)
      .slice(0, limit);

    return categoryDocs.map((doc) => ({
      document: doc,
      score: 1.0,
    }));
  }

  // Rechercher par tags
  searchByTags(tags, limit = 3) {
    const matchingDocs = Array.from(this.documents.values())
      .filter((doc) => tags.some((tag) => doc.tags.includes(tag)))
      .slice(0, limit);

    return matchingDocs.map((doc) => ({
      document: doc,
      score: 1.0,
    }));
  }

  // Générer un contexte enrichi pour une requête
  generateEnrichedContext(query, userProfile = {}) {
    const relevantDocs = this.searchDocuments(query);

    if (relevantDocs.length === 0) {
      return null;
    }

    // Construire le contexte enrichi
    let enrichedContext = '## Contexte Spécialisé en Fitness\n\n';

    relevantDocs.forEach((result, index) => {
      const doc = result.document;
      enrichedContext += `### ${doc.title}\n`;
      enrichedContext += `**Catégorie :** ${doc.category}\n`;
      enrichedContext += `**Pertinence :** ${Math.round(result.score * 100)}%\n\n`;

      // Extraire les sections les plus pertinentes
      const relevantSections = this.extractRelevantSections(doc.content, query);
      enrichedContext += relevantSections + '\n\n';
    });

    // Ajouter des recommandations personnalisées
    if (userProfile.level) {
      const levelSpecificDocs = this.searchByCategory(userProfile.level);
      if (levelSpecificDocs.length > 0) {
        enrichedContext += '### Recommandations Personnalisées\n\n';
        levelSpecificDocs.forEach((result) => {
          const doc = result.document;
          enrichedContext += `**${doc.title}** : ${this.extractSummary(doc.content)}\n\n`;
        });
      }
    }

    return enrichedContext;
  }

  // Extraire les sections pertinentes d'un document
  extractRelevantSections(content, query) {
    const sections = content.split('\n\n');
    const queryWords = query.toLowerCase().split(/\s+/);

    const relevantSections = sections.filter((section) => {
      const sectionLower = section.toLowerCase();
      return queryWords.some((word) => sectionLower.includes(word));
    });

    return relevantSections.join('\n\n');
  }

  // Extraire un résumé d'un document
  extractSummary(content) {
    const lines = content.split('\n');
    const summaryLines = lines.filter(
      (line) =>
        line.startsWith('- ') || line.startsWith('• ') || line.includes('**')
    );

    return summaryLines.slice(0, 3).join(' ');
  }

  // Obtenir des statistiques de la base de connaissances
  getStats() {
    return {
      totalDocuments: this.documents.size,
      totalWords: Array.from(this.index.keys()).length,
      categories: [
        ...new Set(
          Array.from(this.documents.values()).map((doc) => doc.category)
        ),
      ],
      tags: [
        ...new Set(
          Array.from(this.documents.values()).flatMap((doc) => doc.tags)
        ),
      ],
    };
  }

  // Ajouter un document personnalisé
  addCustomDocument(title, content, category, tags = []) {
    const docId = `custom-${Date.now()}`;
    const document = {
      id: docId,
      title,
      content,
      category,
      tags,
      custom: true,
    };

    this.addDocument(document);
    return docId;
  }

  // Mettre à jour un document existant
  updateDocument(docId, updates) {
    const document = this.documents.get(docId);
    if (!document) {
      throw new Error(`Document ${docId} non trouvé`);
    }

    const updatedDocument = { ...document, ...updates };
    this.documents.set(docId, updatedDocument);

    // Recréer les embeddings et l'index
    const embeddings = this.createEmbeddings(updatedDocument.content);
    this.embeddings.set(docId, embeddings);

    // Supprimer l'ancien index et recréer
    this.removeFromIndex(docId);
    this.indexDocument(updatedDocument, embeddings);
  }

  // Supprimer un document de l'index
  removeFromIndex(docId) {
    this.index.forEach((docSet, word) => {
      docSet.delete(docId);
      if (docSet.size === 0) {
        this.index.delete(word);
      }
    });
  }

  // Supprimer un document
  deleteDocument(docId) {
    this.documents.delete(docId);
    this.embeddings.delete(docId);
    this.removeFromIndex(docId);
  }
}

// Instance globale de la base de connaissances
const knowledgeBase = new KnowledgeBase();

export { KnowledgeBase };
export default knowledgeBase;
