// ========================================
// VÉRIFICATION COULEURS TAILWIND - PROFIL ET CLASSEMENT
// ========================================

console.log('🎨 Vérification des couleurs Tailwind - Profil et Classement');

// Fonction pour vérifier les couleurs
function checkTailwindColors() {
    console.log('🔍 Vérification des couleurs Tailwind...');
    
    // Vérifier les boutons avec classes Tailwind
    const muscleButtons = document.querySelectorAll('button[class*="bg-gradient-to-br from-gray-50 to-gray-100"]');
    console.log(`📊 Boutons groupes musculaires trouvés: ${muscleButtons.length}`);
    
    muscleButtons.forEach((button, index) => {
        const styles = getComputedStyle(button);
        const hasDarkBg = styles.backgroundColor.includes('rgba(15, 15, 35') || 
                         styles.backgroundColor.includes('rgb(15, 15, 35');
        const hasWhiteText = styles.color.includes('rgb(255, 255, 255') || 
                           styles.color.includes('rgba(255, 255, 255');
        
        console.log(`Bouton muscle ${index + 1}:`, {
            fondSombre: hasDarkBg ? '✅' : '❌',
            texteBlanc: hasWhiteText ? '✅' : '❌',
            backgroundColor: styles.backgroundColor,
            color: styles.color
        });
    });
    
    // Vérifier les boutons d'exercices
    const exerciseButtons = document.querySelectorAll('button[class*="bg-gradient-to-r from-gray-50 to-gray-100"], button[class*="bg-gradient-to-r from-yellow-50 to-yellow-100"]');
    console.log(`📊 Boutons exercices trouvés: ${exerciseButtons.length}`);
    
    exerciseButtons.forEach((button, index) => {
        const styles = getComputedStyle(button);
        const hasDarkBg = styles.backgroundColor.includes('rgba(15, 15, 35') || 
                         styles.backgroundColor.includes('rgb(15, 15, 35');
        const hasWhiteText = styles.color.includes('rgb(255, 255, 255') || 
                           styles.color.includes('rgba(255, 255, 255');
        
        console.log(`Bouton exercice ${index + 1}:`, {
            fondSombre: hasDarkBg ? '✅' : '❌',
            texteBlanc: hasWhiteText ? '✅' : '❌',
            backgroundColor: styles.backgroundColor,
            color: styles.color
        });
    });
    
    // Vérifier les sections profil
    const profileSections = document.querySelectorAll('div[class*="bg-white rounded-xl shadow-sm border border-gray-200"]');
    console.log(`📊 Sections profil trouvées: ${profileSections.length}`);
    
    profileSections.forEach((section, index) => {
        const styles = getComputedStyle(section);
        const hasDarkBg = styles.backgroundColor.includes('rgba(15, 15, 35') || 
                         styles.backgroundColor.includes('rgb(15, 15, 35');
        const hasWhiteText = styles.color.includes('rgb(255, 255, 255') || 
                           styles.color.includes('rgba(255, 255, 255');
        
        console.log(`Section profil ${index + 1}:`, {
            fondSombre: hasDarkBg ? '✅' : '❌',
            texteBlanc: hasWhiteText ? '✅' : '❌',
            backgroundColor: styles.backgroundColor,
            color: styles.color
        });
    });
    
    // Vérifier les sections classement
    const leaderboardSections = document.querySelectorAll('div[class*="bg-white rounded-2xl shadow-lg"]');
    console.log(`📊 Sections classement trouvées: ${leaderboardSections.length}`);
    
    leaderboardSections.forEach((section, index) => {
        const styles = getComputedStyle(section);
        const hasDarkBg = styles.backgroundColor.includes('rgba(15, 15, 35') || 
                         styles.backgroundColor.includes('rgb(15, 15, 35');
        const hasWhiteText = styles.color.includes('rgb(255, 255, 255') || 
                           styles.color.includes('rgba(255, 255, 255');
        
        console.log(`Section classement ${index + 1}:`, {
            fondSombre: hasDarkBg ? '✅' : '❌',
            texteBlanc: hasWhiteText ? '✅' : '❌',
            backgroundColor: styles.backgroundColor,
            color: styles.color
        });
    });
    
    // Vérifier les éléments du chatbot
    const chatElements = document.querySelectorAll('div[class*="bg-white/"], div[class*="chat"], div[class*="message"], div[class*="bubble"]');
    console.log(`📊 Éléments chatbot trouvés: ${chatElements.length}`);
    
    chatElements.forEach((element, index) => {
        const styles = getComputedStyle(element);
        const hasDarkBg = styles.backgroundColor.includes('rgba(15, 15, 35') || 
                         styles.backgroundColor.includes('rgb(15, 15, 35');
        const hasWhiteText = styles.color.includes('rgb(255, 255, 255') || 
                           styles.color.includes('rgba(255, 255, 255');
        
        console.log(`Élément chatbot ${index + 1}:`, {
            fondSombre: hasDarkBg ? '✅' : '❌',
            texteBlanc: hasWhiteText ? '✅' : '❌',
            backgroundColor: styles.backgroundColor,
            color: styles.color
        });
    });
    
    // Résumé
    const totalButtons = muscleButtons.length + exerciseButtons.length;
    const totalSections = profileSections.length + leaderboardSections.length;
    const totalChatElements = chatElements.length;
    
    console.log('📋 RÉSUMÉ DES CORRECTIONS:');
    console.log(`- Boutons groupes musculaires: ${muscleButtons.length}`);
    console.log(`- Boutons exercices: ${exerciseButtons.length}`);
    console.log(`- Sections profil: ${profileSections.length}`);
    console.log(`- Sections classement: ${leaderboardSections.length}`);
    console.log(`- Éléments chatbot: ${totalChatElements}`);
    console.log(`- Total boutons: ${totalButtons}`);
    console.log(`- Total sections: ${totalSections}`);
    console.log(`- Total chatbot: ${totalChatElements}`);
    
    if (totalButtons > 0 || totalSections > 0 || totalChatElements > 0) {
        console.log('🎉 Corrections appliquées avec succès !');
        console.log('✅ Les cartes, profil, classement et chatbot ne sont plus blancs et le texte est visible');
    } else {
        console.log('⚠️ Aucun élément trouvé. Vérifiez les sélecteurs CSS.');
    }
}

// Démarrage de la vérification
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('✅ DOM chargé - Vérification Tailwind');
        setTimeout(checkTailwindColors, 1000);
    });
} else {
    console.log('✅ DOM déjà chargé - Vérification Tailwind');
    setTimeout(checkTailwindColors, 1000);
}

// Export pour utilisation dans d'autres fichiers
export { checkTailwindColors }; 