export function removePassword(record) {
  if (!record) return record;
  const { password, ...clean } = record;
  return clean;
}

export function normalizeBoolean(value) {
  return value === true || value === "true" || value === 1 || value === "1";
}

export function rowsFrom(result) {
  return Array.isArray(result) ? result[0] : [];
}
