const BANGKOK = [13.7563, 100.5018];

// Pin coords from sitter.latitude/longitude; missing/0,0 → Bangkok so the map still has a center.
export function getSitterCoords(sitter) {
  const lat = Number(sitter?.latitude);
  const lng = Number(sitter?.longitude);
  if (Number.isFinite(lat) && Number.isFinite(lng) && (lat !== 0 || lng !== 0)) {
    return [lat, lng];
  }

  return BANGKOK;
}
