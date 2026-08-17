/**
 * Camera animation (click/keyboard-select recenter, toolbar/keyboard/wheel
 * zoom) and the zoom-driven flow-arc stroke-width rescaling that keeps trade
 * lines a constant visual weight as the user zooms in/out.
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
  // and was the source of visibly janky drag animation.
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
 * Smoothly recenters/zooms the map by interpolating {x,y,z} across frames
 * with a single lightweight transform write, instead of driving it through
 * eurostat-map's real zoom-event pipeline (map.position() or D3's own
 * zoomBehavior transitions) on ANY frame, including the last. That pipeline
 * dispatches a full 'zoom' event that eurostat-map uses to rescale every
 * boundary path's stroke width across the whole geo dataset - cheap for a
 * handful of European countries, but at .geo('WORLD') scale (~250 features,
 * needed so non-EU partners like the US/Russia/Qatar render at all) it can
 * touch thousands of individual path/line/circle elements, and the resulting
 * browser style-recalculation was measured (DevTools Performance panel +
 * PerformanceObserver longtask entries) at 3+ full seconds, as ONE
 * uninterruptible synchronous block that freezes the entire page - not just
 * the map - since it runs on the same main thread as everything else.
 * Deferring only the LAST frame to the real map.position() call (an earlier
 * attempt) still hit this same freeze, just moved to right after the
 * animation instead of spread across it, so now every frame - including
 * settle - stays on the cheap direct-transform path. D3's own zoom transform
 * bookkeeping (svgNode.__zoom, read by the next drag/wheel gesture) and
 * eurostat-map's own position_/__lastTransform are synced by hand instead,
 * completely bypassing the event dispatch that triggers the expensive
 * restyle. The one real trade-off: the library's own boundary-line stroke
 * widths (a thin secondary layer, not the per-country fill borders - those
 * are repainted independently by reapplyCountryColors after every selection)
 * won't rescale from these camera moves specifically; they catch up next
 * time a selection or a real mouse-driven zoom/drag runs.
 */
export function animateMapToPosition(targetX, targetY, targetZ, durationMs = 700) {
  if (!map || typeof map.position !== 'function' || !map.position_) return;

  const start = animateMapToPosition._liveState || { x: map.position_.x, y: map.position_.y, z: map.position_.z };
  const end = { x: targetX, y: targetY, z: targetZ };
  const startTime = performance.now();
  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
  const zoomGroup = document.querySelector('#em-zoom-group-mapSvg');
  const svgNode = map.svg_ && typeof map.svg_.node === 'function' ? map.svg_.node() : null;

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

    const k = map.__baseZ / pos.z;
    const [projX, projY] = map._projection([pos.x, pos.y]);
    const tx = map.width_ / 2 - projX * k;
    const ty = map.height_ / 2 - projY * k;
    if (zoomGroup) zoomGroup.setAttribute('transform', `translate(${tx},${ty}) scale(${k})`);

    if (t < 1) {
      animateMapToPosition._liveState = pos;
      requestAnimationFrame(step);
    } else {
      animateMapToPosition._liveState = null;

      // D3's Transform is just {k,x,y} plus a handful of pure methods (see
      // the bundled d3-zoom/transform.js) - reusing the existing instance's
      // own prototype keeps this indistinguishable from a "real" one to any
      // other code (e.g. the start of the next drag/wheel gesture) that
      // reads svgNode.__zoom and calls .invert()/.apply() on it.
      const protoSource = map.__lastTransform || (svgNode && svgNode.__zoom);
      if (svgNode && protoSource) {
        const newTransform = Object.create(Object.getPrototypeOf(protoSource));
        newTransform.k = k;
        newTransform.x = tx;
        newTransform.y = ty;
        svgNode.__zoom = newTransform;
        map.__lastTransform = newTransform;
      }
      map.position_.x = pos.x;
      map.position_.y = pos.y;
      map.position_.z = pos.z;
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

/**
 * Writes a screen-space {k,tx,ty} transform to the zoom group, D3's own
 * __zoom bookkeeping, eurostat-map's __lastTransform, and position_ (derived
 * back to geographic x/y/z) - the shared "apply a transform the cheap way"
 * step behind both attachCustomWheelZoom and attachCustomDragPan below.
 */
function applyScreenTransform(svgNode, k, tx, ty) {
  const zoomGroup = document.querySelector('#em-zoom-group-mapSvg');
  if (zoomGroup) zoomGroup.setAttribute('transform', `translate(${tx},${ty}) scale(${k})`);

  const current = svgNode.__zoom || map.__lastTransform;
  if (current) {
    const newTransform = Object.create(Object.getPrototypeOf(current));
    newTransform.k = k;
    newTransform.x = tx;
    newTransform.y = ty;
    svgNode.__zoom = newTransform;
    map.__lastTransform = newTransform;
  }

  const projXc = (map.width_ / 2 - tx) / k;
  const projYc = (map.height_ / 2 - ty) / k;
  const [lng, lat] = map._projection.invert([projXc, projYc]);
  map.position_.x = lng;
  map.position_.y = lat;
  map.position_.z = map.__baseZ / k;
}

/**
 * Replaces D3-zoom's own mouse-wheel handling with a direct-transform-write
 * version, for the same reason as animateMapToPosition above: eurostat-map's
 * real zoom-event pipeline (which D3's built-in wheel gesture drives too)
 * triggers a multi-second style-recalculation freeze at .geo('WORLD') scale.
 * D3-zoom attaches its own wheel listener under the "wheel.zoom" namespace
 * when the behavior is bound via svg.call(zoomBehavior) (see the bundled
 * d3-zoom source) - removing just that namespaced listener disables D3's
 * wheel-driven zooming specifically, while leaving drag/touch/programmatic
 * zoom untouched, and this attaches a replacement that reproduces the same
 * "zoom toward the cursor" feel and the same delta/scale-extent formula D3
 * itself uses, so it doesn't feel different to use - it just writes the
 * transform directly instead of dispatching a 'zoom' event.
 */
export function attachCustomWheelZoom() {
  const svgNode = map.svg_ && typeof map.svg_.node === 'function' ? map.svg_.node() : null;
  if (!svgNode || svgNode.__customWheelAttached || !map.__zoomBehavior) return;
  svgNode.__customWheelAttached = true;

  if (typeof map.svg_.on === 'function') {
    map.svg_.on('wheel.zoom', null);
  }

  svgNode.addEventListener('wheel', (event) => {
    if (!map.__baseZ || !map._projection || !map.position_) return;
    event.preventDefault();

    // Cancel any in-flight click/keyboard camera animation so it doesn't
    // fight the wheel gesture over the shared transform.
    animateMapToPosition._token++;
    animateMapToPosition._liveState = null;

    const rect = svgNode.getBoundingClientRect();
    const mx = event.clientX - rect.left;
    const my = event.clientY - rect.top;

    const current = svgNode.__zoom || map.__lastTransform;
    const k0 = current ? current.k : map.__baseZ / map.position_.z;
    const tx0 = current ? current.x : 0;
    const ty0 = current ? current.y : 0;

    // Same delta/extent formula D3-zoom's own default wheel handler uses.
    const delta = -event.deltaY * (event.deltaMode === 1 ? 0.05 : event.deltaMode ? 1 : 0.002) * (event.ctrlKey ? 10 : 1);
    const scaleExtent = typeof map.__zoomBehavior.scaleExtent === 'function' ? map.__zoomBehavior.scaleExtent() : [1, 8];
    const k1 = Math.max(scaleExtent[0], Math.min(scaleExtent[1], k0 * Math.pow(2, delta)));

    // Keep the geographic point under the cursor fixed on screen.
    const geoX = (mx - tx0) / k0;
    const geoY = (my - ty0) / k0;
    const tx1 = mx - geoX * k1;
    const ty1 = my - geoY * k1;

    applyScreenTransform(svgNode, k1, tx1, ty1);
  }, { passive: false });
}

/**
 * Same fix as attachCustomWheelZoom, for click-and-drag panning: D3-zoom
 * attaches its own drag gesture under the "mousedown.zoom" namespace (with
 * temporary "mousemove.zoom"/"mouseup.zoom" listeners on the window for the
 * gesture's duration) - each mousemove tick dispatches a real 'zoom' event
 * through eurostat-map's pipeline, same multi-second freeze at .geo('WORLD')
 * scale. Removing just "mousedown.zoom" disables D3's own drag start while
 * leaving wheel (handled separately above) and touch untouched, and this
 * reimplements plain 1:1 drag-to-pan (translate only, k fixed - no
 * zoom-toward-cursor math needed since panning doesn't change scale).
 * Suppresses the click event a drag's mouseup would otherwise fire on
 * whatever country the cursor ends up over, matching D3's own
 * moved-far-enough-to-not-be-a-click behavior (see clickDistance2 in the
 * bundled d3-zoom source) so attachMapClickListeners doesn't mistake the end
 * of a drag for a country selection.
 */
export function attachCustomDragPan() {
  const svgNode = map.svg_ && typeof map.svg_.node === 'function' ? map.svg_.node() : null;
  if (!svgNode || svgNode.__customDragAttached || !map.__zoomBehavior) return;
  svgNode.__customDragAttached = true;

  if (typeof map.svg_.on === 'function') {
    map.svg_.on('mousedown.zoom', null);
  }

  const CLICK_DISTANCE_SQ = 9; // px^2 - a few pixels of jitter still counts as a click

  svgNode.addEventListener('mousedown', (event) => {
    if (event.button !== 0 || !map.__baseZ || !map.position_) return;

    const current = svgNode.__zoom || map.__lastTransform;
    if (!current) return;

    animateMapToPosition._token++;
    animateMapToPosition._liveState = null;

    const startX = event.clientX;
    const startY = event.clientY;
    const k = current.k;
    const tx0 = current.x;
    const ty0 = current.y;
    let moved = false;

    const onMouseMove = (moveEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      if (!moved && dx * dx + dy * dy > CLICK_DISTANCE_SQ) {
        moved = true;
        // Country paths set their own inline cursor:pointer (they're
        // individually clickable) which would otherwise keep showing
        // through for the rest of the drag depending on what's under the
        // cursor - .em-dragging's !important rule (main.css) overrides it
        // on every descendant uniformly for the gesture's duration.
        document.body.classList.add('em-dragging');
      }
      if (!moved) return;
      applyScreenTransform(svgNode, k, tx0 + dx, ty0 + dy);
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      document.body.classList.remove('em-dragging');
      if (moved) {
        // Swallow the click the browser is about to dispatch on mouseup's
        // target - capture phase runs before attachMapClickListeners' own
        // (bubble-phase) listener, so this reaches the DOM first.
        const suppressClick = (clickEvent) => {
          clickEvent.stopPropagation();
          clickEvent.preventDefault();
        };
        window.addEventListener('click', suppressClick, { capture: true, once: true });
        setTimeout(() => window.removeEventListener('click', suppressClick, { capture: true }), 0);
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  });
}
