let seq = 1;
export function nextId(prefix: string): string { return `${prefix}_${seq++}`; }
export function resetIds(): void { seq = 1; }
