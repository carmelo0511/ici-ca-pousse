import { useEffect } from 'react';

export const useKeyboardNavigation = (activeTab, setActiveTab, tabs) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignorer si l'utilisateur tape dans un champ de saisie
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.contentEditable === 'true') {
        return;
      }

      const currentIndex = tabs.findIndex(tab => tab.id === activeTab);

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          if (currentIndex > 0) {
            setActiveTab(tabs[currentIndex - 1].id);
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (currentIndex < tabs.length - 1) {
            setActiveTab(tabs[currentIndex + 1].id);
          }
          break;
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
          e.preventDefault();
          const index = parseInt(e.key) - 1;
          if (index < tabs.length) {
            setActiveTab(tabs[index].id);
          }
          break;
        case 'w':
        case 'W':
          e.preventDefault();
          setActiveTab('workout');
          break;
        case 'c':
        case 'C':
          e.preventDefault();
          setActiveTab('calendar');
          break;
        case 's':
        case 'S':
          e.preventDefault();
          setActiveTab('stats');
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          setActiveTab('friends');
          break;
        case 'l':
        case 'L':
          e.preventDefault();
          setActiveTab('leaderboard');
          break;
        case 'd':
        case 'D':
          e.preventDefault();
          setActiveTab('challenges');
          break;
        case 'b':
        case 'B':
          e.preventDefault();
          setActiveTab('badges');
          break;
        case 'p':
        case 'P':
          e.preventDefault();
          setActiveTab('profile');
          break;
        case 't':
        case 'T':
          e.preventDefault();
          setActiveTab('templates');
          break;
        case 'n':
        case 'N':
          e.preventDefault();
          setActiveTab('notifications');
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, setActiveTab, tabs]);
}; 