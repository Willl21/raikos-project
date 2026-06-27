export function generateId(prefix) {
  return `${prefix}-${Date.now()}`;
}
