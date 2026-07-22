export function formatOrderNumber(id) {
  if (!id) return '';
  if (typeof id === 'string' && id.startsWith('YNFS_')) {
    return id;
  }
  const numericId = parseInt(id, 10);
  if (isNaN(numericId)) return id;
  return `YNFS_${1000 + numericId}`;
}
