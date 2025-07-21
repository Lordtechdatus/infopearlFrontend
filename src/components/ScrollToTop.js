import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// This component will scroll the window to the top whenever the route changes
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to top of page when route changes
    window.scrollTo(0, 0);
  }, [pathname]);

  return null; // This component doesn't render anything
}

export default ScrollToTop; 