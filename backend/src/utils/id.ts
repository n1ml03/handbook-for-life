/**
 * Simple ID generation utility to replace UUID
 */
export function generateId(): string {
  // Use timestamp + random string for simple unique ID generation
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 15);
  return `${timestamp}-${randomStr}`;
} 