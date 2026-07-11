export function isEventPast(startsAt: string, now: Date = new Date()): boolean {
  return new Date(startsAt) < now;
}
