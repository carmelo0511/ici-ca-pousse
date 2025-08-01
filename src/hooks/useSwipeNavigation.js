import { useEffect, useRef, useCallback } from 'react';

export const useSwipeNavigation = (activeTab, setActiveTab, tabs) => {
  const touchStart = useRef(null);
  const touchEnd = useRef(null);

  // Distance minimale pour considérer un swipe
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    touchEnd.current = null;
    touchStart.current = e.targetTouches[0].clientX;
  };

  const onTouchMove = (e) => {
    touchEnd.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = useCallback(() => {
    if (!touchStart.current || !touchEnd.current) return;

    const distance = touchStart.current - touchEnd.current;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe || isRightSwipe) {
      const currentIndex = tabs.findIndex((tab) => tab.id === activeTab);
      let newIndex;

      if (isLeftSwipe && currentIndex < tabs.length - 1) {
        // Swipe gauche = onglet suivant
        newIndex = currentIndex + 1;
      } else if (isRightSwipe && currentIndex > 0) {
        // Swipe droite = onglet précédent
        newIndex = currentIndex - 1;
      }

      if (newIndex !== undefined) {
        setActiveTab(tabs[newIndex].id);
      }
    }
  }, [activeTab, tabs, setActiveTab]);

  useEffect(() => {
    const element = document.getElementById('main-content');
    if (!element) return;

    element.addEventListener('touchstart', onTouchStart);
    element.addEventListener('touchmove', onTouchMove);
    element.addEventListener('touchend', onTouchEnd);

    return () => {
      element.removeEventListener('touchstart', onTouchStart);
      element.removeEventListener('touchmove', onTouchMove);
      element.removeEventListener('touchend', onTouchEnd);
    };
  }, [onTouchEnd]);

  return null;
};
