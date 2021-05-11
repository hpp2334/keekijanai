import { Comment } from "../type";

export function convert(entity: any, direction: 'to-db'): any;
export function convert(entity: any, direction: 'from-db'): any;
export function convert(entity: any, direction: 'to-db' | 'from-db'): any {
  const handler = direction === 'to-db'
    ? (s: string) => s.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase()
    : (s: string) => s.replace(/_([a-z])/g, (_, q) => q.toUpperCase())
  const next = {} as any;
  for (const key in entity) {
    next[handler(key)] = entity[key];
  }
  return next;
}
