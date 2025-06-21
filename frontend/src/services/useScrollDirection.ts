import { useState, useEffect, useRef } from 'react';

interface UseScrollDirectionOptions {
  threshold?: number;
}

type ScrollDirection = 'up' | 'down' | null;

export function useScrollDirection(options: UseScrollDirectionOptions = {}) {
  const { threshold = 50 } = options;
  
  const [scrollDirection, setScrollDirection] = useState<ScrollDirection>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    const updateScrollDirection = () => {
      const scrollY = window.pageYOffset || document.documentElement.scrollTop;
      
      // Check if user has scrolled past threshold
      setIsScrolled(scrollY > threshold);
      
      // Determine scroll direction
      if (Math.abs(scrollY - lastScrollY.current) < threshold) {
        ticking.current = false;
        return;
      }
      
      if (scrollY > lastScrollY.current && scrollY > threshold) {
        // Scrolling down
        setScrollDirection('down');
      } else if (scrollY < lastScrollY.current) {
        // Scrolling up
        setScrollDirection('up');
      }
      
      lastScrollY.current = scrollY;
      ticking.current = false;
    };

    const onScroll = () => {
      if (!ticking.current) {
        requestAnimationFrame(() => {
          updateScrollDirection();
        });
        ticking.current = true;
      }
    };

    // Set initial scroll position
    lastScrollY.current = window.pageYOffset || document.documentElement.scrollTop;
    
    // Add scroll listener
    window.addEventListener('scroll', onScroll, { passive: true });
    
    // Cleanup
    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, [threshold]);

  return {
    scrollDirection,
    isScrolled,
    isScrollingDown: scrollDirection === 'down',
    isScrollingUp: scrollDirection === 'up'
  };
} 