import { nanoid } from 'nanoid';

/**
 * Secure ID generation utility using nanoid
 * Generates URL-safe, unique string IDs with good entropy
 */
export function generateId(): string {
  return nanoid();
}

/**
 * Generate ID with custom length
 */
export function generateIdWithLength(length: number = 21): string {
  return nanoid(length);
}