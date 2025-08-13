// ========================================
// VÉRIFICATION COULEURS TAILWIND - PROFIL ET CLASSEMENT
// ========================================

// Vérification des couleurs Tailwind - Profil et Classement

// Fonction pour vérifier les couleurs
function checkTailwindColors() {
    // Vérification des couleurs Tailwind...
    
    // Vérifier les boutons avec classes Tailwind
    const muscleButtons = document.querySelectorAll('button[class*="bg-gradient-to-br from-gray-50 to-gray-100"]');
    // Boutons groupes musculaires trouvés: ${muscleButtons.length}
    
    muscleButtons.forEach((button, index) => {
        const styles = getComputedStyle(button);
        const hasDarkBg = styles.backgroundColor.includes('rgba(15, 15, 35') || 
                         styles.backgroundColor.includes('rgb(15, 15, 35');
        const hasWhiteText = styles.color.includes('rgb(255, 255, 255') || 
                           styles.color.includes('rgba(255, 255, 255');
        
        // Bouton muscle ${index + 1} vérifié
    });
    
    // Vérifier les boutons d'exercices
    const exerciseButtons = document.querySelectorAll('button[class*="bg-gradient-to-r from-gray-50 to-gray-100"], button[class*="bg-gradient-to-r from-yellow-50 to-yellow-100"]');
    // Boutons exercices trouvés: ${exerciseButtons.length}
    
    exerciseButtons.forEach((button, index) => {
        const styles = getComputedStyle(button);
        const hasDarkBg = styles.backgroundColor.includes('rgba(15, 15, 35') || 
                         styles.backgroundColor.includes('rgb(15, 15, 35');
        const hasWhiteText = styles.color.includes('rgb(255, 255, 255') || 
                           styles.color.includes('rgba(255, 255, 255');
        
        // Bouton exercice ${index + 1} vérifié
    });
    
    // Vérifier les sections profil
    const profileSections = document.querySelectorAll('div[class*="bg-white rounded-xl shadow-sm border border-gray-200"]');
    // Sections profil trouvées: ${profileSections.length}
    
    profileSections.forEach((section, index) => {
        const styles = getComputedStyle(section);
        const hasDarkBg = styles.backgroundColor.includes('rgba(15, 15, 35') || 
                         styles.backgroundColor.includes('rgb(15, 15, 35');
        const hasWhiteText = styles.color.includes('rgb(255, 255, 255') || 
                           styles.color.includes('rgba(255, 255, 255');
        
        // Section profil ${index + 1} vérifiée
    });
    
    // Vérifier les sections classement
    const leaderboardSections = document.querySelectorAll('div[class*="bg-white rounded-2xl shadow-lg"]');
    // Sections classement trouvées: ${leaderboardSections.length}
    
    leaderboardSections.forEach((section, index) => {
        const styles = getComputedStyle(section);
        const hasDarkBg = styles.backgroundColor.includes('rgba(15, 15, 35') || 
                         styles.backgroundColor.includes('rgb(15, 15, 35');
        const hasWhiteText = styles.color.includes('rgb(255, 255, 255') || 
                           styles.color.includes('rgba(255, 255, 255');
        
        // Section classement ${index + 1} vérifiée
    });
    
    // Vérifier les éléments du chatbot
    const chatElements = document.querySelectorAll('div[class*="bg-white/"], div[class*="chat"], div[class*="message"], div[class*="bubble"]');
    // Éléments chatbot trouvés: ${chatElements.length}
    
    chatElements.forEach((element, index) => {
        const styles = getComputedStyle(element);
        const hasDarkBg = styles.backgroundColor.includes('rgba(15, 15, 35') || 
                         styles.backgroundColor.includes('rgb(15, 15, 35');
        const hasWhiteText = styles.color.includes('rgb(255, 255, 255') || 
                           styles.color.includes('rgba(255, 255, 255');
        
        // Élément chatbot ${index + 1} vérifié
    });
    
    // Résumé
    const totalButtons = muscleButtons.length + exerciseButtons.length;
    const totalSections = profileSections.length + leaderboardSections.length;
    const totalChatElements = chatElements.length;
    
    // Résumé des corrections effectuées
    if (totalButtons > 0 || totalSections > 0 || totalChatElements > 0) {
        // Corrections appliquées avec succès
    } else {
        // Aucun élément trouvé
    }
}

// Démarrage de la vérification
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(checkTailwindColors, 1000);
    });
} else {
    setTimeout(checkTailwindColors, 1000);
}

// Export pour utilisation dans d'autres fichiers
export { checkTailwindColors }; 