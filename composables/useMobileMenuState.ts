export const useMobileMenuState = () => {
  // Используем useState для создания общего состояния между компонентами
  const isLeftBarOpen = useState('mobileMenuLeftBar', () => false);
  const isMobileMenuOpen = useState('mobileMenuHeader', () => false);

  const toggleLeftBar = () => {
    isLeftBarOpen.value = !isLeftBarOpen.value;
    if (isLeftBarOpen.value) {
      isMobileMenuOpen.value = false;
    }
  };

  const toggleMobileMenu = () => {
    isMobileMenuOpen.value = !isMobileMenuOpen.value;
    if (isMobileMenuOpen.value) {
      isLeftBarOpen.value = false;
    }
  };

  const closeLeftBar = () => {
    isLeftBarOpen.value = false;
  };

  const closeMobileMenu = () => {
    isMobileMenuOpen.value = false;
  };

  return {
    isLeftBarOpen,
    isMobileMenuOpen,
    toggleLeftBar,
    toggleMobileMenu,
    closeLeftBar,
    closeMobileMenu,
  };
};

