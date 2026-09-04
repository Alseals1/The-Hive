import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useScrollTrap, getScrollTrapCount, resetScrollTrapCount } from './useScrollTrap';
import { renderHook } from '@testing-library/react';

describe('useScrollTrap', () => {
  beforeEach(() => {
    // Reset the global counter before each test
    resetScrollTrapCount();
    // Ensure document is clean
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
  });

  afterEach(() => {
    // Clean up after each test
    resetScrollTrapCount();
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
  });

  it('should apply overflow:hidden to html and body on mount', () => {
    renderHook(() => useScrollTrap());

    expect(document.documentElement.style.overflow).toBe('hidden');
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('should remove overflow:hidden on unmount', () => {
    const { unmount } = renderHook(() => useScrollTrap());

    expect(document.documentElement.style.overflow).toBe('hidden');
    unmount();
    expect(document.documentElement.style.overflow).toBe('');
    expect(document.body.style.overflow).toBe('');
  });

  it('should increment and decrement scroll trap counter', () => {
    expect(getScrollTrapCount()).toBe(0);

    const { unmount } = renderHook(() => useScrollTrap());
    expect(getScrollTrapCount()).toBe(1);

    unmount();
    expect(getScrollTrapCount()).toBe(0);
  });

  it('should handle multiple mounted hooks without removing scroll lock prematurely', () => {
    const { unmount: unmount1 } = renderHook(() => useScrollTrap());
    expect(getScrollTrapCount()).toBe(1);
    expect(document.documentElement.style.overflow).toBe('hidden');

    const { unmount: unmount2 } = renderHook(() => useScrollTrap());
    expect(getScrollTrapCount()).toBe(2);
    expect(document.documentElement.style.overflow).toBe('hidden');

    // Unmount first hook - scroll lock should still be active
    unmount1();
    expect(getScrollTrapCount()).toBe(1);
    expect(document.documentElement.style.overflow).toBe('hidden');

    // Unmount second hook - scroll lock should be removed
    unmount2();
    expect(getScrollTrapCount()).toBe(0);
    expect(document.documentElement.style.overflow).toBe('');
  });

  it('should attach touchmove listener on mount', () => {
    const addEventListenerSpy = vi.spyOn(document, 'addEventListener');
    renderHook(() => useScrollTrap());

    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'touchmove',
      expect.any(Function),
      { passive: false }
    );

    addEventListenerSpy.mockRestore();
  });

  it('should remove touchmove listener on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');
    const { unmount } = renderHook(() => useScrollTrap());

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'touchmove',
      expect.any(Function)
    );

    removeEventListenerSpy.mockRestore();
  });

  it('should not apply styles if document is undefined', () => {
    // This test verifies SSR safety
    const originalDocument = global.document;
    Object.defineProperty(global, 'document', { value: undefined });

    // Should not throw
    expect(() => renderHook(() => useScrollTrap())).not.toThrow();

    Object.defineProperty(global, 'document', { value: originalDocument });
  });

  it('should only apply scroll lock once for first modal', () => {
    const htmlElement = document.documentElement;
    const initialOverflow = htmlElement.style.overflow;

    renderHook(() => useScrollTrap());
    const afterFirstMount = htmlElement.style.overflow;

    renderHook(() => useScrollTrap());
    const afterSecondMount = htmlElement.style.overflow;

    expect(initialOverflow).toBe('');
    expect(afterFirstMount).toBe('hidden');
    expect(afterSecondMount).toBe('hidden');
  });

  it('should handle rapid mount/unmount cycles without getting stuck', () => {
    const { unmount: unmount1 } = renderHook(() => useScrollTrap());
    unmount1();
    expect(getScrollTrapCount()).toBe(0);

    const { unmount: unmount2 } = renderHook(() => useScrollTrap());
    unmount2();
    expect(getScrollTrapCount()).toBe(0);

    const { unmount: unmount3 } = renderHook(() => useScrollTrap());
    unmount3();
    expect(getScrollTrapCount()).toBe(0);

    expect(document.documentElement.style.overflow).toBe('');
    expect(document.body.style.overflow).toBe('');
  });

  it('should prevent negative counter values', () => {
    const { unmount } = renderHook(() => useScrollTrap());
    unmount();
    unmount(); // Call unmount twice

    expect(getScrollTrapCount()).toBeGreaterThanOrEqual(0);
  });
});
