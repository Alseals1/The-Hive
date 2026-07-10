import { useEffect } from 'react';

// Global counter to track how many modals are currently open
let scrollTrapCount = 0;

export function useScrollTrap() {
  useEffect(() => {
    // Increment the counter on mount
    scrollTrapCount++;

    // Only apply scroll lock on the first modal
    if (scrollTrapCount === 1) {
      applyScrollTrap();
    }

    // Cleanup: decrement and remove scroll lock when all modals are closed
    return () => {
      scrollTrapCount = Math.max(0, scrollTrapCount - 1);
      if (scrollTrapCount === 0) {
        removeScrollTrap();
      }
    };
  }, []);
}

function applyScrollTrap() {
  if (typeof document === 'undefined') return;

  const html = document.documentElement;
  const body = document.body;

  // Store original overflow values so we can restore them
  html.style.setProperty('--scroll-trap-active', 'true', 'important');
  html.style.overflow = 'hidden';
  body.style.overflow = 'hidden';

  // iOS Safari fix: also prevent touchmove on document
  document.addEventListener('touchmove', preventDefaultTouchMove, {
    passive: false,
  });
}

function removeScrollTrap() {
  if (typeof document === 'undefined') return;

  const html = document.documentElement;
  const body = document.body;

  // Restore overflow to default
  html.style.overflow = '';
  body.style.overflow = '';
  html.style.removeProperty('--scroll-trap-active');

  // Remove the touchmove listener
  document.removeEventListener('touchmove', preventDefaultTouchMove);
}

function preventDefaultTouchMove(e: TouchEvent) {
  // Allow scroll on elements with data-scroll-trap-allowed attribute
  // This lets modal content scroll normally
  const target = e.target as HTMLElement;
  if (target?.closest('[data-scroll-trap-allowed]')) {
    return;
  }
  e.preventDefault();
}

// Export counter for testing purposes
export function getScrollTrapCount(): number {
  return scrollTrapCount;
}

// Reset function for testing
export function resetScrollTrapCount(): void {
  scrollTrapCount = 0;
}
