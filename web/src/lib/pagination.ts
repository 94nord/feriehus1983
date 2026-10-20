// Reads ?side=N (the URL parameter stays Danish); invalid values return null
export function readPageNumber(url: URL) {
  const raw = url.searchParams.get('side');
  if (raw === null) return 1;
  const page = Number(raw);
  return Number.isInteger(page) && page >= 1 ? page : null;
}
