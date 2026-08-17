/**
 * Small, dependency-light helpers shared across the map modules: country-code
 * resolution, coordinate lookups, geometry math, and the current zoom-scale
 * reader. Nothing here holds state of its own beyond reading js/map/mapState.js.
 */
import { coords } from './mapState.js';

export function debounce(callback, delay = 150) {
  let timer = null;
  return function debouncedFunction(...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      callback.apply(this, args);
    }, delay);
  };
}

export function getPathCountryCode(path) {
  if (!path) return null;

  // 1. Check D3 __data__ on path or its parent
  const data = path.__data__ || path.parentElement?.__data__;
  if (data?.properties?.id) return data.properties.id.toUpperCase();
  if (data?.properties?.CNTR_ID) return data.properties.CNTR_ID.toUpperCase();
  if (data?.properties?.NUTS_ID) return data.properties.NUTS_ID.substring(0, 2).toUpperCase();
  if (data?.id && typeof data.id === 'string' && data.id.length <= 4) return data.id.toUpperCase();

  // 2. Check DOM ID and data attributes
  let id = (
    path.getAttribute('id') ||
    path.getAttribute('data-id') ||
    path.getAttribute('data-geo') ||
    path.parentElement?.getAttribute('id') ||
    ''
  ).toUpperCase();

  if (id) {
    if (id.includes('-')) id = id.split('-').pop();
    if (id.startsWith('PS')) id = id.substring(2);
    if (id.length <= 4) return id;
  }

  // 3. Check aria-label / title
  const ariaLabel = (path.getAttribute('aria-label') || path.parentElement?.getAttribute('aria-label') || '').trim();
  if (ariaLabel && languageNameSpace?.labels) {
    for (const [code, label] of Object.entries(languageNameSpace.labels)) {
      if (label === ariaLabel) return code;
    }
  }

  // 4. Check CSS class names
  for (const code of defGeos) {
    if (path.classList.contains(code) || path.classList.contains(`nuts_${code}`) || path.parentElement?.classList.contains(code)) {
      return code;
    }
  }

  return null;
}

export function getCountryCoordinates(countryCode) {
  const feature = coords?.[0]?.features?.find(f => f?.properties?.CNTR_ID === countryCode || f?.id === countryCode);
  if (!feature?.geometry?.coordinates) {
    console.warn(`Coordinates not found for country code: ${countryCode}`);
    return null;
  }

  // coordinates is [longitude, latitude] in GeoJSON -> return [latitude, longitude]
  return [feature.geometry.coordinates[1], feature.geometry.coordinates[0]];
}

export function getMidpoint(sourceCoords, partnerCoords) {
  const sourceLat = sourceCoords[0];
  const sourceLng = sourceCoords[1];
  const partnerLat = partnerCoords[0];
  const partnerLng = partnerCoords[1];

  // Haversine-style distance in degrees (approx) used to scale arc peaks
  const dLat = partnerLat - sourceLat;
  const dLng = partnerLng - sourceLng;
  const distance = Math.sqrt(dLat * dLat + dLng * dLng);

  // Spherical midpoint calculation
  const toRad = (deg) => deg * Math.PI / 180;
  const toDeg = (rad) => rad * 180 / Math.PI;
  const φ1 = toRad(sourceLat);
  const λ1 = toRad(sourceLng);
  const φ2 = toRad(partnerLat);
  const λ2 = toRad(partnerLng);

  const bx = Math.cos(φ2) * Math.cos(λ2 - λ1);
  const by = Math.cos(φ2) * Math.sin(λ2 - λ1);
  const φm = Math.atan2(Math.sin(φ1) + Math.sin(φ2), Math.sqrt((Math.cos(φ1) + bx) * (Math.cos(φ1) + bx) + by * by));
  const λm = λ1 + Math.atan2(by, Math.cos(φ1) + bx);

  const midLat = toDeg(φm);
  const midLng = (toDeg(λm) + 540) % 360 - 180;

  // Bearing from source to partner
  const y = Math.sin(λ2 - λ1) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(λ2 - λ1);
  const initialBearing = (toDeg(Math.atan2(y, x)) + 360) % 360;

  // Perpendicular bearing for arc peak
  const perpBearing = (initialBearing + 90) % 360;

  // Convert distance to approximate kilometers (1 degree ≈ 111 km)
  const distKm = distance * 111;
  const arcHeightKm = Math.min(500, Math.max(25, 0.25 * distKm));

  // Geodesic control point
  const R = 6371;
  const δ = arcHeightKm / R;
  const θ = toRad(perpBearing);
  const φmRad = toRad(midLat);
  const λmRad = toRad(midLng);

  const φc = Math.asin(Math.sin(φmRad) * Math.cos(δ) + Math.cos(φmRad) * Math.sin(δ) * Math.cos(θ));
  const λc = λmRad + Math.atan2(Math.sin(θ) * Math.sin(δ) * Math.cos(φmRad), Math.cos(δ) - Math.sin(φmRad) * Math.sin(φc));

  return [toDeg(φc), (toDeg(λc) + 540) % 360 - 180];
}

export function isValidPartner(partner) {
  if (!Array.isArray(partner) || partner.length < 2) {
    return false;
  }

  const [partnerCountry, value] = partner;

  return (
    Boolean(partnerCountry) &&
    typeof value === 'number' &&
    Number.isFinite(value) &&
    value > 0.000001 &&
    !excludedPartners.includes(partnerCountry)
  );
}

/**
 * Current D3 zoom scale factor (k) read straight from the zoom group's
 * transform attribute. Shared by everything that needs to keep an element
 * visually constant-sized (or color-coded stroke widths) across zoom levels.
 */
export function getMapZoomK() {
  const zoomGroup = document.querySelector('#em-zoom-group-mapSvg');
  const transform = zoomGroup?.getAttribute('transform') || '';
  const match = transform.match(/scale\(([\d.eE+\-]+)\)/) || transform.match(/matrix\(([\d.eE+\-]+)/);
  const k = match ? parseFloat(match[1]) : 1;
  return (k && !isNaN(k) && k > 0) ? k : 1;
}
