/**
 * Trade-flow arcs/markers: drawing them for a selection, scaling their
 * values, coloring the country fills to match a selection, and clearing it
 * all back out. Also owns the plain map-click listener (click a country ->
 * select it) since that's the other half of "what happens when a selection
 * changes."
 */
import { map, activePartners, setActivePartners, setMapCenterCoords } from './mapState.js';
import { getCountryCoordinates, getMidpoint, isValidPartner, getMapZoomK, getPathCountryCode } from './mapUtils.js';
import { computeFitToPartnersPosition, animateMapToPosition, animateMapToCountry, attachZoomScaling } from './mapAnimation.js';
import { lineTooltip, positionTooltip, hideKeyboardTooltip, hideCountryNameTooltipForFocus } from './mapTooltips.js';
import { mapKbd, resetTrapItemTabindex } from './mapKeyboardNav.js';
import { selectCountryByCode } from './mapCountryData.js';

const euCtr = '#738ce5';
const partnersCtr = '#17256b';
const selectLayer = '#0b39a2';

export function createFlowValueScaler(partners) {
  if (!partners?.length) return () => 0;

  const values = partners
    .map(item => item[1])
    .filter(value => typeof value === 'number' && Number.isFinite(value));

  if (!values.length) return () => 0;

  const min = Math.min(...values);
  const max = Math.max(...values);

  return function scale(value, outMin, outMax, mode = "sqrt") {
    if (min === max) return outMin;

    let normalized = (value - min) / (max - min);
    normalized = Math.max(0, Math.min(1, normalized));

    if (mode === "sqrt") {
      normalized = Math.sqrt(normalized);
    } else if (mode === "log") {
      normalized = Math.log(normalized * 9 + 1) / Math.log(10);
    }

    const scaled = outMin + normalized * (outMax - outMin);
    return Math.max(outMin, Math.min(outMax, scaled));
  };
}

export function calculateWeight(scale, value, zoom = 4) {
  const BASE_MIN = 2;
  const BASE_MAX = 10;
  return Math.round(scale(value, BASE_MIN, BASE_MAX, "sqrt"));
}

export function calculateRadius(scale, value, zoom = 4) {
  const BASE_MIN = 4;
  const BASE_MAX = 18;
  return Math.round(scale(value, BASE_MIN, BASE_MAX, "sqrt"));
}

export function poliColorChange() {
  const fuelColors = {
    solid: 'rgba(128, 0, 0, 0.85)',
    oil: 'rgba(20, 55, 90, 0.85)',
    gas: 'rgba(250, 165, 25, 0.85)',
    biofuels: 'rgba(95, 180, 65, 0.85)',
    electricity: 'rgba(215, 60, 65, 0.85)',
  };

  return fuelColors[REF?.fuel] || 'rgba(250, 165, 25, 0.85)';
}

export async function drawLines(sourceCountry, partners) {
  if (!sourceCountry || !Array.isArray(partners)) return;

  setMapCenterCoords(sourceCountry);
  const sourceCode = sourceCountry.CNTR_ID;
  const validPartners = partners.filter(isValidPartner);
  setActivePartners(validPartners);

  // Source centroid coords: [lat, lng]
  let sourceCoords = sourceCountry.CENTROID;
  if (!sourceCoords) {
    sourceCoords = getCountryCoordinates(sourceCode);
  }
  if (!sourceCoords) return;

  // Smooth camera move to frame the source country together with every one
  // of its partners (not just a fixed pull-back on the source alone), so
  // e.g. a US or Algeria partner is visible from the moment the flows draw
  // in rather than only after tabbing to it. Falls back to the simpler
  // source-only recenter if the projection isn't ready yet.
  const fitPosition = computeFitToPartnersPosition(sourceCoords, validPartners);
  if (fitPosition) {
    animateMapToPosition(fitPosition.x, fitPosition.y, fitPosition.z);
  } else {
    animateMapToCountry(sourceCoords[0], sourceCoords[1]);
  }

  // Clear previous flow layer
  const prevLayer = document.querySelector('#entrade-flow-layer');
  if (prevLayer) prevLayer.remove();

  // Find the zoom group inside mapSvg to attach flow arcs & markers
  const zoomGroup = document.querySelector('#em-zoom-group-mapSvg') || document.querySelector('#mapSvg g');
  if (!zoomGroup) return;

  const flowGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  flowGroup.id = 'entrade-flow-layer';
  // Decorative from a screen-reader's perspective: the per-partner figures
  // are announced as a summary (see announceToScreenReader in loadCountryData)
  // rather than requiring AT users to explore each arc/marker individually.
  flowGroup.setAttribute('aria-hidden', 'true');
  zoomGroup.appendChild(flowGroup);

  const scale = createFlowValueScaler(validPartners);
  const lineColor = poliColorChange();
  const projection = (map && map._projection) ? map._projection : null;

  if (!projection) return;

  const [sx, sy] = projection([sourceCoords[1], sourceCoords[0]]); // [lng, lat] -> [x, y]

  // Setup Pop-Card tooltip container
  let tooltipContainer = document.querySelector('#entradeMapTooltip');
  if (!tooltipContainer) {
    tooltipContainer = document.createElement('div');
    tooltipContainer.id = 'entradeMapTooltip';
    tooltipContainer.style.position = 'absolute';
    tooltipContainer.style.zIndex = '10000';
    tooltipContainer.style.display = 'none';
    tooltipContainer.style.pointerEvents = 'none';
    document.body.appendChild(tooltipContainer);
  }

  validPartners.forEach(([partnerCountry, value], index) => {
    const partnerCoords = getCountryCoordinates(partnerCountry);
    if (!partnerCoords) return;

    const [px, py] = projection([partnerCoords[1], partnerCoords[0]]);
    const ctrlCoords = getMidpoint(sourceCoords, partnerCoords);
    const [cx, cy] = projection([ctrlCoords[1], ctrlCoords[0]]);

    const weight = calculateWeight(scale, value);
    // Markers scale naturally with the map (bigger zoomed in, smaller zoomed
    // out) rather than staying a constant screen size: size for the current
    // zoom level once at creation time, then let the zoom group's own
    // transform take it from there instead of continuously re-compensating.
    const radius = calculateRadius(scale, value) / getMapZoomK();

    const staggerDelay = index * 60; // ms stagger between each arc

    // ── Quadratic Bezier Arc with draw-on animation ──────────────────────────
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', `M ${sx},${sy} Q ${cx},${cy} ${px},${py}`);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', lineColor);
    path.setAttribute('stroke-width', `${weight}px`);
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('class', 'map-curve');
    path.dataset.baseWeight = weight;
    path.style.cursor = 'pointer';
    path.style.pointerEvents = 'stroke';
    path.style.transition = 'stroke-width 0.2s ease';

    // Stroke-dasharray draw-on animation: measure path length and animate dashoffset 0
    flowGroup.appendChild(path);
    const pathLen = path.getTotalLength();
    path.style.strokeDasharray = `${pathLen}`;
    path.style.strokeDashoffset = `${pathLen}`;
    path.style.opacity = '0';
    // Trigger reflow then animate
    requestAnimationFrame(() => {
      setTimeout(() => {
        path.style.transition = `stroke-dashoffset 0.55s cubic-bezier(0.4, 0, 0.2, 1) ${staggerDelay}ms,
                                  stroke-width 0.2s ease,
                                  opacity 0.15s ease ${staggerDelay}ms`;
        path.style.strokeDashoffset = '0';
        path.style.opacity = '1';
      }, staggerDelay);
    });

    // ── Circle Marker with scale-in animation ───────────────────────────────
    const marker = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    marker.setAttribute('cx', px);
    marker.setAttribute('cy', py);
    marker.setAttribute('r', radius);
    marker.setAttribute('fill', 'rgb(170, 95, 24)');
    marker.setAttribute('stroke', '#ffffff');
    marker.setAttribute('stroke-width', '1.5px');
    marker.setAttribute('class', 'map-marker');
    marker.style.cursor = 'pointer';
    marker.style.pointerEvents = 'all';
    marker.style.opacity = '0';
    marker.style.transformOrigin = `${px}px ${py}px`;
    marker.style.transform = 'scale(0)';

    flowGroup.appendChild(marker);
    // Animate marker in after the arc drawing begins
    const markerDelay = staggerDelay + 420;
    requestAnimationFrame(() => {
      setTimeout(() => {
        marker.style.transition = `transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) ${markerDelay}ms,
                                    opacity 0.2s ease ${markerDelay}ms`;
        marker.style.transform = 'scale(1)';
        marker.style.opacity = '1';
      }, 10);
    });

    // ── Tooltip event handlers ───────────────────────────────────────────────
    const showTip = (e) => {
      const currentW = parseFloat(path.style.strokeWidth || path.getAttribute('stroke-width') || `${weight}px`);
      path.style.strokeWidth = `${currentW + 3}px`;
      tooltipContainer.innerHTML = lineTooltip(partnerCountry, value, sourceCode);
      tooltipContainer.style.display = 'block';
      positionTooltip(tooltipContainer, e.pageX + 15, e.pageY + 15);
    };

    const moveTip = (e) => {
      positionTooltip(tooltipContainer, e.pageX + 15, e.pageY + 15);
    };

    const hideTip = () => {
      path.style.strokeWidth = `${weight / getMapZoomK()}px`;
      tooltipContainer.style.display = 'none';
    };

    path.addEventListener('mouseenter', showTip);
    path.addEventListener('mousemove', moveTip);
    path.addEventListener('mouseleave', hideTip);

    marker.addEventListener('mouseenter', showTip);
    marker.addEventListener('mousemove', moveTip);
    marker.addEventListener('mouseleave', hideTip);
  });

  reapplyCountryColors(validPartners);
  attachZoomScaling();
}

export function reapplyCountryColors(partners = activePartners) {
  const selectedGeo = REF.geo;
  const partnerSet = new Set((partners || []).map(p => Array.isArray(p) ? p[0] : p));
  const defGeoSet = new Set(defGeos);

  // eurostat-map keeps its own boundary strokes visually constant across zoom
  // by continuously rescaling them from a fixed base width (see scaleStrokeWidths
  // in eurostatmap.js, invoked on every zoom event). Our border-width values
  // below are chosen at k=1 and divided by the current zoom scale so they land
  // on the *same* effective on-screen width that mechanism targets - otherwise
  // whichever one last touched the path "wins" until the other fires again,
  // which reads as borders randomly flipping between too thick and too thin.
  const k = getMapZoomK();

  // Scoped to the country-region fill layer only. The boundary/halo layers
  // (#em-worldbn, #em-worldbn-halo) are stroke-only (fill:none by design) and
  // must never be touched here: their geometry self-intersects at border
  // tripoints, so forcing an opaque fill on them renders as large spurious
  // triangular "spikes" (e.g. at the NO/SE/FI/RU and GE/RU/TR junctions).
  const paths = document.querySelectorAll('#em-worldrg path');
  paths.forEach(path => {
    const cntrCode = getPathCountryCode(path);
    if (!cntrCode) return;

    if (cntrCode === selectedGeo) {
      path.style.setProperty('fill', selectLayer, 'important');
      path.style.setProperty('stroke', '#ffffff', 'important');
      path.style.setProperty('stroke-width', `${2 / k}px`, 'important');
      path.style.cursor = 'pointer';
    } else if (partnerSet.has(cntrCode)) {
      path.style.setProperty('fill', partnersCtr, 'important');
      path.style.setProperty('stroke', '#ffffff', 'important');
      path.style.setProperty('stroke-width', `${2 / k}px`, 'important');
      path.style.cursor = 'pointer';
    } else if (defGeoSet.has(cntrCode) || defGeos.includes(cntrCode)) {
      path.style.setProperty('fill', euCtr, 'important');
      path.style.setProperty('stroke', '#4b598b', 'important');
      path.style.setProperty('stroke-width', `${1.5 / k}px`, 'important');
      path.style.cursor = 'pointer';
    } else {
      path.style.setProperty('fill', '#e6e6e6', 'important');
      path.style.setProperty('stroke', '#ffffff', 'important');
      path.style.setProperty('stroke-width', `${0.5 / k}px`, 'important');
    }
  });
}

export function clearMap() {
  setActivePartners([]);

  // Fade out existing flow layer before removing
  const flowLayer = document.querySelector('#entrade-flow-layer');
  if (flowLayer) {
    flowLayer.style.transition = 'opacity 0.25s ease';
    flowLayer.style.opacity = '0';
    setTimeout(() => flowLayer.remove(), 260);
  }

  reapplyCountryColors([]);

  const countryInfoElem = document.querySelector('#countryInfo');
  if (countryInfoElem) {
    countryInfoElem.style.transition = 'opacity 0.2s ease';
    countryInfoElem.style.opacity = '0';
    setTimeout(() => countryInfoElem.remove(), 220);
  }

  hideKeyboardTooltip();
  hideCountryNameTooltipForFocus();
  // Drop any partner-scoped keyboard trap items (tabindex=0 on a country
  // that's no longer a partner) without stealing focus - a mouse-driven
  // clear shouldn't jump focus onto the map. selectCountryByCode's own
  // Escape/Enter handlers set up whichever trap applies after this runs.
  if (mapKbd.active) {
    mapKbd.items.forEach(resetTrapItemTabindex);
    mapKbd.items = [];
    mapKbd.active = false;
  }
}

export function clearLinesAndMarkers() {
  clearMap();
}

export function attachMapClickListeners() {
  const mapSvg = document.querySelector('#mapSvg') || document.querySelector('#map');
  if (!mapSvg || mapSvg.__clickAttached) return;

  mapSvg.addEventListener('click', (event) => {
    const path = event.target.closest('path');
    if (!path) return;

    // Skip flow lines or markers
    if (path.classList.contains('map-curve') || path.classList.contains('map-marker') || path.classList.contains('flow') || path.id === 'em-sphere') {
      return;
    }

    selectCountryByCode(getPathCountryCode(path));
  });

  mapSvg.__clickAttached = true;
}
