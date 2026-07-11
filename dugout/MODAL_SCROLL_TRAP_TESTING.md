# Modal Scroll Trap Testing Guide

This document outlines how to verify that the scroll trap fix is working correctly.

## What Was Fixed

The modal scroll trap issue prevented background pages from scrolling when modals were open. The `useScrollTrap` hook now:
- Applies `overflow: hidden` to the document when a modal mounts
- Removes overflow restriction when the last modal closes
- Handles nested/stacked modals correctly
- Supports iOS Safari with touch event handling

## Test Cases

### Test 1: Basic Scroll Lock (Most Critical)

**Objective:** Verify that background doesn't scroll when a modal is open

**Steps:**
1. Start the dev server: `npm run dev`
2. Navigate to http://localhost:5174/teams
3. Select a team to enter the team page
4. Go to Schedule tab
5. Click on any event's "Supplies" button (or create an event if none exist)
6. The supplies modal should open
7. **Try to scroll the background page while the modal is open**
8. **Expected:** Background page should NOT scroll at all
9. Close the modal by clicking "Close"
10. **Expected:** Background page should now be scrollable again

**Failure Indicators:**
- ❌ Background scrolls while modal is open
- ❌ Scroll position changes when modal opens/closes

---

### Test 2: Modal Content Scrolling

**Objective:** Verify that modal content can scroll freely

**Steps:**
1. Follow Test 1 to open a supplies modal
2. **Try to scroll INSIDE the modal content area**
3. **Expected:** Modal content scrolls smoothly
4. Verify you can see all items in the modal

**Failure Indicators:**
- ❌ Modal content doesn't scroll
- ❌ Scrolling in modal doesn't show all content

---

### Test 3: Mobile Viewport

**Objective:** Verify scroll trap works on mobile devices

**Steps:**
1. Open DevTools (F12)
2. Click the device toggle to view mobile sizes
3. Choose iPhone 12/13 (375x667) or similar
4. Reload page
5. Navigate to Schedule and open a supplies modal
6. **Try to swipe/scroll on background**
7. **Expected:** Background should not respond to scroll gestures
8. **Try to scroll INSIDE the modal**
9. **Expected:** Modal content should scroll smoothly

**Failure Indicators:**
- ❌ Background scrolls on mobile
- ❌ "Rubber band" scroll effect on iOS (momentum scroll past edges)
- ❌ Modal doesn't scroll on mobile

---

### Test 4: Multiple Modals (Nested)

**Objective:** Verify that scroll lock persists with nested modals

**Steps:**
1. Open a supplies modal (from a past event if available)
2. While the modal is open, trigger another action that opens a second modal (if your app supports nested modals)
3. Try to scroll the background
4. **Expected:** Background still shouldn't scroll
5. Close the first modal (if nested architecture allows)
6. Try to scroll background again
7. **Expected:** Background still shouldn't scroll (because second modal is open)
8. Close the second modal
9. **Expected:** Background is now scrollable

**Failure Indicators:**
- ❌ Scroll lock removed when first modal closes (before second modal closed)
- ❌ Background scrolls at any point while ANY modal is open

---

### Test 5: Modal Open/Close State

**Objective:** Verify no lingering scroll lock issues

**Steps:**
1. Rapidly open and close modals 5-10 times
2. After each close, try to scroll the background
3. **Expected:** Scroll works correctly after each close
4. No "stuck" scroll lock state

**Failure Indicators:**
- ❌ Scroll gets stuck after closing a modal
- ❌ Scroll lock doesn't apply on re-open after rapid close

---

### Test 6: Document Overflow State

**Objective:** Verify CSS properties are correctly applied

**Steps:**
1. Open DevTools Inspector
2. Navigate to Schedule and open a supplies modal
3. In DevTools, inspect the `<body>` or `<html>` element
4. **Expected (modal open):**
   ```
   <html style="overflow: hidden;">
   <body style="overflow: hidden;">
   ```
5. Close the modal
6. **Expected (modal closed):**
   ```
   <html style="overflow: ;">  <!-- Empty, no overflow restriction -->
   <body style="overflow: ;">  <!-- Empty, no overflow restriction -->
   ```

**Failure Indicators:**
- ❌ `overflow: hidden` not applied when modal opens
- ❌ `overflow: hidden` not removed when modal closes
- ❌ Wrong element has overflow applied (should be both html and body)

---

### Test 7: Scrollable Modal Content

**Objective:** Verify the modal itself has proper scroll handling

**Steps:**
1. Open a modal with many items (supplies modal works well)
2. Look at the modal's container in DevTools
3. **Expected:** Modal container should have `overflow-y: auto` or `overflow: auto`
4. Scroll inside the modal
5. **Expected:** Scrollbar appears in the modal (not the page)

**Failure Indicators:**
- ❌ No scrollbar in modal even with many items
- ❌ Page scrollbar moves while scrolling modal
- ❌ Modal doesn't use `-webkit-overflow-scrolling: touch` (seen in flaky iOS scrolling)

---

## Browser Compatibility

### Desktop Browsers
- ✅ Chrome/Chromium
- ✅ Firefox
- ✅ Safari
- ✅ Edge

### Mobile Browsers
- ✅ iOS Safari (most important - needs `-webkit-overflow-scrolling: touch`)
- ✅ Chrome Mobile
- ✅ Firefox Mobile
- ✅ Samsung Internet

### Known Quirks

**iOS Safari:**
- May need `-webkit-overflow-scrolling: touch` to prevent "rubber band" scroll
- Touch events should use `{ passive: false }` to allow `preventDefault()`
- Test on actual device, not just simulator, if possible

---

## Debugging Tips

### If scroll lock isn't working:

1. **Check if hook is mounted:**
   ```javascript
   // In browser console
   document.documentElement.style.overflow  // Should be "hidden" when modal open
   ```

2. **Check for conflicting CSS:**
   - Search codebase for other `overflow: auto` or `position: fixed` that might interfere
   - Check parent component's CSS

3. **Check hook is being called:**
   - Add `console.log('useScrollTrap called')` to the hook
   - Verify it runs when modal mounts

4. **Check for event listener:**
   ```javascript
   // In console when modal is open
   getEventListeners(document).touchmove  // Should see preventDefaultTouchMove listener
   ```

### If modal content won't scroll:

1. Verify modal container has `overflow-y: auto` or similar
2. Check if height is properly constrained
3. Verify no parent has `overflow: hidden`
4. Check z-index conflicts

---

## Automated Testing (Future)

To add Vitest for unit testing:

```bash
npm install -D vitest @testing-library/react
```

Then run:
```bash
vitest src/hooks/useScrollTrap.spec.ts
```

The spec file at `src/hooks/useScrollTrap.spec.ts` is already prepared for Vitest.

---

## Playwright E2E Tests

Full E2E tests exist at `e2e/modal-scroll-trap.spec.ts`. These can be run with:

```bash
npx playwright test e2e/modal-scroll-trap.spec.ts
```

Currently most tests are marked as `.skip()` pending full integration setup, but the structure is there for comprehensive browser-based testing.

---

## Success Criteria

✅ All 7 test cases pass  
✅ No scroll lock "sticks" after modal close  
✅ Mobile scrolling works smoothly  
✅ No console errors or warnings  
✅ Keyboard navigation still works (Tab, Enter, Escape)  
✅ Screen readers can still navigate modals  

---

## Regression Prevention

This fix touches core scroll behavior. After deploying, watch for:

- Issues with modals not appearing
- Scroll functionality broken in other parts of the app
- Performance degradation (scroll stutter)
- Mobile app responsiveness issues

If issues arise, check:
1. That `useScrollTrap` is only called by actual modal components
2. That scroll count isn't getting out of sync
3. That CSS isn't conflicting with Tailwind utilities
