import { describe, it, expect } from 'vitest';
import { isEventPast } from './eventTiming';

describe('isEventPast', () => {
  const now = new Date('2026-07-10T12:00:00Z');

  it('returns true for a start time before now', () => {
    expect(isEventPast('2026-07-10T11:59:59Z', now)).toBe(true);
  });

  it('returns false for a start time after now', () => {
    expect(isEventPast('2026-07-10T12:00:01Z', now)).toBe(false);
  });

  it('returns false when start time equals now', () => {
    expect(isEventPast('2026-07-10T12:00:00Z', now)).toBe(false);
  });

  it('defaults to the current time when now is not provided', () => {
    const past = new Date(Date.now() - 1000 * 60 * 60).toISOString();
    expect(isEventPast(past)).toBe(true);

    const future = new Date(Date.now() + 1000 * 60 * 60).toISOString();
    expect(isEventPast(future)).toBe(false);
  });
});
