/**
 * Shared mutable state for the map module split. Kept in one place because
 * ES module bindings can only be reassigned by the module that declares
 * them - anything written from more than one of the other map/*.js modules
 * (map, mapCenterCoords, activePartners) gets an explicit setter here so
 * every writer goes through the same place; state written from exactly one
 * module lives in that module instead (see e.g. mapCore.js's hasBuiltMapOnce,
 * mapKeyboardNav.js's mapKbd/suppressNextVisibilityPan).
 */

// Note: z is pixelSize (m/px). eurostatmap.js WORLD_54030 computes a negative baseZ
// due to a projection edge-wrapping bug, so we use a negative z to get positive k=baseZ/z
// y=50 (reused from the old Leaflet/Mercator config's center:[50,10]) doesn't
// translate to the same framing under Robinson: Mercator expands high
// latitudes, Robinson compresses them, so centering on 50N here pushes too
// much empty Arctic ocean into frame and crops the Mediterranean/N. Africa
// at the bottom on typical short/wide viewports. y=42 keeps Scandinavia in
// frame while no longer cropping the south, checked at multiple aspect ratios.
export const MAP_INITIAL_POSITION = { x: 14, y: 42, z: -0.0755 };

export let coords = []; // Global coords array - mutated via .push() only, safe to share as-is

export let map; // eurostatmap flow instance - only mapCore.js's renderMap() reassigns this
export function setMap(m) {
  map = m;
}

export let mapCenterCoords = null; // only mapDrawing.js's drawLines() reassigns this
export function setMapCenterCoords(v) {
  mapCenterCoords = v;
}

export let activePartners = []; // written by mapCountryData.js and mapDrawing.js
export function setActivePartners(v) {
  activePartners = v;
}
