let fixedNow: Date | null = null;
export function now(): Date { return fixedNow ? new Date(fixedNow) : new Date(); }
export function setNow(value: string | Date | null): void { fixedNow = value ? new Date(value) : null; }
export function addMinutes(date: Date, minutes: number): Date { return new Date(date.getTime() + minutes * 60_000); }
export function isPast(date: Date): boolean { return date.getTime() <= now().getTime(); }
