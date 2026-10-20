// Læser ?side=N; ugyldige værdier giver null
export function laesSide(url: URL) {
  const raa = url.searchParams.get('side');
  if (raa === null) return 1;
  const side = Number(raa);
  return Number.isInteger(side) && side >= 1 ? side : null;
}
