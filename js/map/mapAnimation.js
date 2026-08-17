/**
 * Camera animation (click/keyboard-select recenter) and the zoom-driven
 * flow-arc stroke-width rescaling that keeps trade lines a constant visual
 * weight as the user zooms in/out.
 */
import { map, MAP_INITIAL_POSITION } from './mapState.js';
import { getCountryCoordinates, getMapZoomK } from './mapUtils.js';

/**
 * Keeps arc stroke-widths and marker radii visually constant by tracking the
 * D3 zoom transform (k) on the zoom group and scaling inversely.
 */
export function attachZoomScaling() {
  const zoomGroup = document.querySelector('#em-zoom-group-mapSvg');
  if (!zoomGroup) return;

  function rescaleFlowLayer(k) {
    if (!k || isNaN(k) || k <= 0) return;

    // Rescale arcs only: stroke-width stays a constant screen weight
    // (representing trade volume consistently regardless of zoom level).
    // Markers are intentionally NOT rescaled here - they're sized once at
    // creation time and left to scale naturally with the map's own zoom
    // transform, so they grow/shrink like any other geographic feature.
    document.querySelectorAll('#entrade-flow-layer .map-curve').forEach(path => {
      const baseW = parseFloat(path.dataset.baseWeight || path.getAttribute('stroke-width') || '3');
      if (!path.dataset.baseWeight) path.dataset.baseWeight = baseW;
      path.style.strokeWidth = `${baseW / k}px`;
    });
  }

  // Apply now, then once more on the next frame: right after a fresh
  // map.build(), the zoom group's transform can still be settling (position()
  // dispatches its zoom event synchronously, but that can race the browser's
  // own attribute write on first paint), so a same-tick read of k can be
  // stale and leave markers/arcs at their unscaled, oversized base value.
  rescaleFlowLayer(getMapZoomK());
  requestAnimationFrame(() => rescaleFlowLayer(getMapZoomK()));

  if (zoomGroup.__zoomScalingAttached) return;
  zoomGroup.__zoomScalingAttached = true;

  // Watch the zoom group transform attribute for changes (D3 zoom writes here
  // on every drag mousemove/wheel tick, and animateMapToPosition writes it
  // once per rAF step too) - coalesced to at most one rescale per animation
  // frame instead of running the full querySelectorAll+loop synchronously on
  // every single mutation, which was far more often than the screen repaints
  // and was the source of visibly janky drag/click-select animation.
  let rescaleScheduled = false;
  const observer = new MutationObserver(() => {
    if (rescaleScheduled) return;
    rescaleScheduled = true;
    requestAnimationFrame(() => {
      rescaleScheduled = false;
      rescaleFlowLayer(getMapZoomK());
    });
  });

  observer.observe(zoomGroup, { attributes: true, attributeFilter: ['transform'] });

  // Also handle mouse wheel via capture to get current zoom k quickly
  const mapSvg = document.querySelector('#mapSvg');
  if (mapSvg && !mapSvg.__wheelScalingAttached) {
    mapSvg.__wheelScalingAttached = true;
    mapSvg.addEventListener('wheel', () => {
      requestAnimationFrame(() => {
        rescaleFlowLayer(getMapZoomK());
      });
    }, { passive: true });
  }
}

/**
 * Smoothly recenters on a newly selected country with a gentle pull-back
 * (rather than an abrupt jump), so its trade-flow arcs are revealed as the
 * camera settles. Always eases toward the same "slightly zoomed out from
 * default" view regardless of the map's current zoom/pan, so repeated
 * clicks feel consistent instead of compounding into an ever-wider view.
 * Reuses map.position() (the same API the toolbar's Home button uses)
 * rather than reaching into eurostat-map's internal zoom-transform
 * machinery, interpolating it across frames via requestAnimationFrame.
 */
export function animateMapToPosition(targetX, targetY, targetZ, durationMs = 700) {
  if (!map || typeof map.position !== 'function' || !map.position_) return;

  const start = animateMapToPosition._liveState || { x: map.position_.x, y: map.position_.y, z: map.position_.z };
  const end = { x: targetX, y: targetY, z: targetZ };
  const startTime = performance.now();
  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
  const zoomGroup = document.querySelector('#em-zoom-group-mapSvg');

  const animId = ++animateMapToPosition._token;
  function step(now) {
    if (animId !== animateMapToPosition._token) return; // superseded by a newer call
    const t = Math.min(1, (now - startTime) / durationMs);
    const e = easeOutCubic(t);
    const pos = {
      x: start.x + (end.x - start.x) * e,
      y: start.y + (end.y - start.y) * e,
      z: start.z + (end.z - start.z) * e,
    };
    animateMapToPosition._liveState = pos;

    if (t < 1) {
      // map.position() dispatches a full D3 zoom event on every call, which
      // eurostat-map uses to rescale hundreds of boundary elements - roughly
      // 35ms of work per call, more than double a 60fps frame budget, which
      // was making this animation visibly stutter. Mirror its own transform
      // math directly for intermediate frames (a single attribute write) and
      // save the real, full call for the last frame only.
      const k = map.__baseZ / pos.z;
      const [projX, projY] = map._projection([pos.x, pos.y]);
      const tx = map.width_ / 2 - projX * k;
      const ty = map.height_ / 2 - projY * k;
      if (zoomGroup) zoomGroup.setAttribute('transform', `translate(${tx},${ty}) scale(${k})`);
      requestAnimationFrame(step);
    } else {
      animateMapToPosition._liveState = null;
      map.position(pos); // final settle: syncs position_, __lastTransform, stroke widths, labels, etc.
    }
  }
  requestAnimationFrame(step);
}
animateMapToPosition._token = 0;
animateMapToPosition._liveState = null;

/** Recenters on a single country with a gentle, fixed zoom-out - used when there's no partner set to fit (e.g. bringing an off-screen keyboard focus target into view). */
export function animateMapToCountry(lat, lng, durationMs = 700) {
  animateMapToPosition(lng, lat, MAP_INITIAL_POSITION.z * 1.12, durationMs);
}

/**
 * Computes the {x,y,z} position that frames the source country and every
 * one of its partners together - not just the source with a fixed pull-back
 * - by projecting all of them, taking the bounding box in that projected
 * space, and picking the zoom level that fits it (with padding) in the
 * current map size. Falls back to null (caller should use animateMapToCountry
 * instead) if the projection isn't ready yet or there's nothing to fit.
 */
export function computeFitToPartnersPosition(sourceCoords, partners) {
  if (!map || !map._projection || !map.__baseZ) return null;

  const [sourceLat, sourceLng] = sourceCoords;
  const sourceProjected = map._projection([sourceLng, sourceLat]);
  if (!Array.isArray(sourceProjected) || !Number.isFinite(sourceProjected[0]) || !Number.isFinite(sourceProjected[1])) return null;
  const [sourceX, sourceY] = sourceProjected;

  const partnerProjected = partners
    .map(([code]) => getCountryCoordinates(code))
    .filter(Boolean)
    .map(([lat, lng]) => map._projection([lng, lat]))
    .filter(p => Array.isArray(p) && Number.isFinite(p[0]) && Number.isFinite(p[1]));
  if (!partnerProjected.length) return null;

  // The view is always centered on the SELECTED country itself (never a
  // bbox average across it and its partners) - averaging pulled the center
  // toward wherever partners happened to cluster, which could push the
  // country the user just chose off toward an edge, or off-screen entirely,
  // exactly when there's only one or two partners on one side of it (e.g.
  // France with only Algeria as a top partner). The zoom level is what
  // adapts, based on the farthest partner's distance from the source.
  const maxDX = Math.max(...partnerProjected.map(([x]) => Math.abs(x - sourceX)));
  const maxDY = Math.max(...partnerProjected.map(([, y]) => Math.abs(y - sourceY)));

  const padding = 90; // px - room for markers, the pop-card tooltip and the toolbar
  const availW = Math.max(50, (map.width_ || 800) - padding * 2);
  const availH = Math.max(50, (map.height_ || 600) - padding * 2);

  const defaultK = Math.abs(map.__baseZ / MAP_INITIAL_POSITION.z);
  let k = Math.min(availW / Math.max(1, maxDX * 2), availH / Math.max(1, maxDY * 2));
  // Never zoom in tighter than a ~2x bump over the default overview (a
  // single very close partner shouldn't fill the whole screen) or out past
  // the default itself (fitting distant partners shouldn't leave you more
  // zoomed out than the app's own starting view).
  k = Math.min(defaultK * 2.2, Math.max(defaultK, k));

  return { x: sourceLng, y: sourceLat, z: map.__baseZ / k };
}
