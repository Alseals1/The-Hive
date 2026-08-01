import { useEffect } from 'react';

// Global counter to track how many modals are currently open
let scrollTrapCount = 0;

/**
 * Locks background page scroll while a modal is open.
 *
 * @param active - Whether the scroll trap should be applied. Pass the modal's
 *   `open` state for components that stay mounted while closed (e.g. dialogs
 *   that return null when closed). Defaults to true for components that only
 *   mount while visible.
 */
export function useScrollTrap(active: boolean = true) {
  useEffect(() => {
    if (!active) return;

    // Increment the counter when the trap becomes active
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
  }, [active]);
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
  const scrollContainer = target?.closest('[data-scroll-trap-allowed]');

  if (!scrollContainer) {
    e.preventDefault();
    return;
  }

  // Check if the scrollable element can actually scroll
  const scrollableEl = scrollContainer as HTMLElement;
  const canScroll = scrollableEl.scrollHeight > scrollableEl.clientHeight;

  if (!canScroll) {
    e.preventDefault();
  }
}

// Export counter for testing purposes
export function getScrollTrapCount(): number {
  return scrollTrapCount;
}

// Reset function for testing
export function resetScrollTrapCount(): void {
  scrollTrapCount = 0;
}
