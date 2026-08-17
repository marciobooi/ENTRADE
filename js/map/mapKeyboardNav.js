/**
 * Keyboard + screen-reader support for the map, following the pattern maps
 * like Google Maps use: the map is ONE tab stop (arrow keys pan it, +/-
 * zoom it - not hundreds of individually-tabbable features), Tab from there
 * reaches the small set of actually-selectable countries one at a time, and
 * a live region announces the outcome of a selection instead of requiring
 * screen-reader users to explore each drawn flow arc/marker individually.
 */
import { map, activePartners } from './mapState.js';
import { getPathCountryCode, getCountryCoordinates, getMapZoomK } from './mapUtils.js';
import { animateMapToCountry, animateMapToPosition } from './mapAnimation.js';
import { hideKeyboardTooltip, hideCountryNameTooltipForFocus, showKeyboardTooltip, showCountryNameTooltipForFocus } from './mapTooltips.js';
import { clearMap } from './mapDrawing.js';
import { selectCountryByCode } from './mapCountryData.js';

/**
 * Composite-widget keyboard model (the same shape Google Maps' own embed
 * uses): the map is ONE tab stop in the page. Tab past it without pressing
 * Enter and you continue straight to the next real control (toolbar, then
 * footer) - it never swallows Tab. Press Enter to "enter" the widget, which
 * starts a roving-tabindex trap over just the relevant countries: every
 * defGeos country when nothing is selected, or the selected country plus
 * only its trade partners once one is. Escape steps back out one level at a
 * time - selected -> browse-all -> outer stop - rather than overloading it
 * with two different meanings.
 */
export const mapKbd = { active: false, items: [], index: 0 };

/**
 * Set right before a programmatic .focus() call that's part of *entering* a
 * trap (enterMapBrowseMode/enterMapSelectedMode), not a user pressing Tab.
 * That focus event re-fires the same handler ensureFocusedCountryVisible
 * uses, but at that exact moment the correct camera move for this selection
 * (drawLines' fit-to-bounds animation, still mid-flight) hasn't settled yet,
 * so a naive visibility check reads the source country as "not visible" and
 * fires a second, simpler recenter that cancels the correct one via the
 * shared animation token - which is what was pulling the view off the
 * selected country entirely. Consumed (reset) by the focus handler itself.
 */
let suppressNextVisibilityPan = false;

/**
 * Country paths aren't naturally focusable, so they need an explicit
 * tabindex=-1 baseline outside the trap (see makeCountriesFocusable). The
 * factSheet button is a real, always-tabbable element though - leaving it
 * stuck at tabindex=-1 after the trap moves on or exits would remove it from
 * the page's normal tab order entirely, so it gets its attribute removed
 * instead, restoring its native default.
 */
export function resetTrapItemTabindex(item) {
  if (item.isFactSheet) {
    item.el.removeAttribute('tabindex');
  } else {
    item.el.setAttribute('tabindex', '-1');
  }
}

export function mapKbdEntries(codes) {
  const paths = Array.from(document.querySelectorAll('#em-worldrg path'));
  const seen = new Set();
  return codes
    .filter(code => !seen.has(code) && seen.add(code))
    .map(code => ({ code, el: paths.find(p => getPathCountryCode(p) === code) }))
    .filter(item => item.el);
}

export function mapKbdSetItems(items, focusIndex) {
  mapKbd.items.forEach(resetTrapItemTabindex);
  mapKbd.items = items;
  mapKbd.index = Math.max(0, focusIndex);
  mapKbd.items.forEach((item, i) => item.el.setAttribute('tabindex', i === mapKbd.index ? '0' : '-1'));
}

export function mapKbdMove(delta) {
  if (mapKbd.items.length < 2) return;
  resetTrapItemTabindex(mapKbd.items[mapKbd.index]);
  mapKbd.index = (mapKbd.index + delta + mapKbd.items.length) % mapKbd.items.length;
  mapKbd.items[mapKbd.index].el.setAttribute('tabindex', '0');
  // preventScroll: the browser's native focus-scroll operates on page/document
  // scroll, not the map's own pan/zoom - without this it fights (and
  // corrupts) the custom camera framing that ensureFocusedCountryVisible /
  // animateMapToPosition already handle, non-deterministically shoving the
  // whole page's scroll position around depending on exactly where the
  // focused country's SVG geometry sits at that instant.
  mapKbd.items[mapKbd.index].el.focus({ preventScroll: true });
}

export function enterMapBrowseMode(preferredCode) {
  const labels = languageNameSpace?.labels || {};
  const sortedGeos = [...defGeos].sort((a, b) => {
    const nameA = labels[a] || a;
    const nameB = labels[b] || b;
    return nameA.localeCompare(nameB, REF?.language || 'en');
  });
  const items = mapKbdEntries(sortedGeos);
  if (!items.length) return;
  mapKbd.active = true;
  const startIndex = preferredCode ? Math.max(0, items.findIndex(i => i.code === preferredCode)) : 0;
  mapKbdSetItems(items, startIndex);
  suppressNextVisibilityPan = true;
  mapKbd.items[mapKbd.index].el.focus({ preventScroll: true });
}

export function enterMapSelectedMode(sourceCode, partnerCodes) {
  const items = mapKbdEntries([sourceCode, ...partnerCodes]);
  if (!items.length) { enterMapBrowseMode(); return; }

  // The "Open factsheet" button that appears alongside a selection is a real
  // action, not a country - include it as the last stop in the same roving
  // cycle so keyboard users reach it without leaving the trap first.
  const factSheetBtn = document.querySelector('#factSheet');
  if (factSheetBtn) items.push({ code: null, el: factSheetBtn, isFactSheet: true });

  mapKbd.active = true;
  mapKbdSetItems(items, 0);
  suppressNextVisibilityPan = true;
  mapKbd.items[0].el.focus({ preventScroll: true });
}

export function exitMapKeyboardTrap() {
  mapKbd.items.forEach(resetTrapItemTabindex);
  mapKbd.items = [];
  mapKbd.active = false;
  hideKeyboardTooltip();
  hideCountryNameTooltipForFocus();
  document.querySelector('#mapSvg')?.focus({ preventScroll: true });
}

export function attachMapKeyboardNav(mapSvg) {
  // Attached to #map, not #mapSvg: the factSheet button that joins the trap
  // (see enterMapSelectedMode) lives in #countryInfo, a sibling of #mapSvg,
  // so its keydown events never bubble through the SVG at all - #map is the
  // nearest ancestor common to both.
  const mapContainer = document.querySelector('#map');
  if (!mapContainer || mapContainer.__keyboardNavAttached) return;
  mapContainer.__keyboardNavAttached = true;

  mapContainer.addEventListener('keydown', (event) => {
    if (handlePanZoomKey(event)) return;

    const atOuterStop = document.activeElement === mapSvg;

    if (atOuterStop) {
      // Single entry point: any key other than Enter is left alone, so a
      // plain Tab carries on to the toolbar/footer exactly like any other
      // control the user chose not to activate.
      if (event.key === 'Enter') {
        event.preventDefault();
        if (REF.geo && activePartners.length) {
          enterMapSelectedMode(REF.geo, activePartners.map(p => p[0]));
        } else {
          enterMapBrowseMode();
        }
      }
      return;
    }

    if (!mapKbd.active) return; // focus is on a path but not through our trap (shouldn't normally happen)

    if (event.key === 'Tab') {
      event.preventDefault();
      mapKbdMove(event.shiftKey ? -1 : 1);
    } else if (event.key === 'Enter' || event.key === ' ' || event.key === 'Spacebar') {
      const current = mapKbd.items[mapKbd.index];
      if (current?.isFactSheet) {
        event.preventDefault();
        current.el.click();
        return;
      }
      event.preventDefault();
      const code = current?.code;
      selectCountryByCode(code).then(() => {
        if (REF.geo === code && activePartners.length) {
          enterMapSelectedMode(code, activePartners.map(p => p[0]));
        }
      });
    } else if (event.key === 'Escape') {
      event.preventDefault();
      if (REF.geo) {
        const previousSource = REF.geo;
        REF.geo = '';
        REF.chart = 'map';
        clearMap();
        announceToScreenReader(languageNameSpace?.labels?.['CLEAR'] || 'Clear map');
        enterMapBrowseMode(previousSource);
      } else {
        exitMapKeyboardTrap();
      }
    }
  });
}

/** Arrow keys pan, +/- zoom - mirrors Google Maps' keyboard controls. Shared regardless of trap state. */
export function handlePanZoomKey(event) {
  if (!map || !map.svg_ || !map.__zoomBehavior) return false;
  const step = 80 / getMapZoomK(); // constant on-screen distance regardless of zoom

  switch (event.key) {
    case 'ArrowUp':
      map.svg_.transition().duration(100).call(map.__zoomBehavior.translateBy, 0, step);
      break;
    case 'ArrowDown':
      map.svg_.transition().duration(100).call(map.__zoomBehavior.translateBy, 0, -step);
      break;
    case 'ArrowLeft':
      map.svg_.transition().duration(100).call(map.__zoomBehavior.translateBy, step, 0);
      break;
    case 'ArrowRight':
      map.svg_.transition().duration(100).call(map.__zoomBehavior.translateBy, -step, 0);
      break;
    case '+':
    case '=':
      // animateMapToPosition rather than zoomBehavior.scaleBy: see the same
      // note on the toolbar's zoom buttons in mapToolbar.js - the real D3
      // zoom transition dispatches a 'zoom' event on every tick that's
      // extremely costly to restyle at .geo('WORLD') scale.
      if (map.position_) animateMapToPosition(map.position_.x, map.position_.y, map.position_.z / 1.4, 250);
      break;
    case '-':
    case '_':
      if (map.position_) animateMapToPosition(map.position_.x, map.position_.y, map.position_.z * 1.4, 250);
      break;
    default:
      return false;
  }
  event.preventDefault();
  return true;
}

/**
 * When keyboard focus lands on a country that's off-screen or barely
 * visible, pans the map to bring it into view instead of leaving the user
 * stuck on something they can't see. The camera pull-back on selection only
 * frames the *source* country plus a modest margin - global partners like
 * the US, Russia or Qatar are routinely well outside that, unlike nearby
 * European ones, which is why they "worked" (visibly) and these didn't.
 * Returns true if a pan was actually started, so the caller can wait for it
 * to settle before positioning anything relative to the country's new spot.
 */
export function ensureFocusedCountryVisible(path, code) {
  const mapRect = document.querySelector('#map')?.getBoundingClientRect();
  if (!mapRect) return false;

  const rect = path.getBoundingClientRect();
  const visibleW = Math.max(0, Math.min(rect.right, mapRect.right) - Math.max(rect.left, mapRect.left));
  const visibleH = Math.max(0, Math.min(rect.bottom, mapRect.bottom) - Math.max(rect.top, mapRect.top));
  if (visibleW > 24 && visibleH > 24) return false; // already reasonably in view

  const coords = getCountryCoordinates(code); // [lat, lng]
  if (!coords) return false;
  animateMapToCountry(coords[0], coords[1], 500);
  return true;
}

/**
 * Gives every identifiable country a baseline tabindex=-1 (script-focusable,
 * not a natural Tab stop) plus a label and a tooltip-on-focus handler.
 *
 * defGeos only gates which countries the roving trap ever *lists* - browse
 * mode lists just those ~40, selected mode lists the current source plus
 * whichever partner codes actually came back from the API (which are very
 * often outside defGeos: RU, QA, US, DZ and other global energy suppliers
 * are real partners but not themselves reportable countries). Skipping
 * tabindex here for non-defGeos paths, as an earlier version did, meant
 * .focus() silently did nothing for exactly those partners - Tab would land on
 * nothing and their tooltip could never fire. Every path gets the same
 * baseline; enterMapBrowseMode/enterMapSelectedMode are what actually
 * restrict which ones are reachable.
 * Re-run after every map rebuild since eurostat-map recreates the paths.
 */
export function makeCountriesFocusable() {
  const labels = (languageNameSpace && languageNameSpace.labels) || {};
  document.querySelectorAll('#em-worldrg path').forEach(path => {
    const code = getPathCountryCode(path);
    if (!code) return;

    path.setAttribute('tabindex', '-1');
    path.setAttribute('role', 'button');
    path.setAttribute('aria-label', labels[code] || code);

    // Focus styling lives entirely in CSS (see #em-worldrg path:focus-visible
    // in main.css) so it only appears for keyboard focus, not mouse clicks,
    // and hugs the country's actual shape via drop-shadow rather than the
    // rectangular bounding box a plain CSS outline would draw on an SVG path.
    if (!path.__a11yAttached) {
      path.__a11yAttached = true;
      path.addEventListener('focus', () => {
        if (!mapKbd.active) return;

        const showTooltipsForFocus = () => {
          const partnerEntry = activePartners.find(p => p[0] === code);
          if (partnerEntry) {
            hideCountryNameTooltipForFocus();
            showKeyboardTooltip(path, code, partnerEntry[1]);
          } else {
            // Browsing all of Europe, or focused on the selected source
            // itself: no single trade figure to show, but mouse users still
            // get the country's name on hover (see attachCountryNameTooltips)
            // - give keyboard users the same instead of showing nothing.
            hideKeyboardTooltip();
            showCountryNameTooltipForFocus(path, code);
          }
        };

        let suppressed = false;
        if (suppressNextVisibilityPan) {
          suppressNextVisibilityPan = false;
          suppressed = true;
        }

        if (!suppressed && ensureFocusedCountryVisible(path, code)) {
          // A pan just started (this country was off-screen, e.g. the US or
          // Russia as a partner of a European country) - wait for it to
          // settle so the tooltip anchors to where the country actually
          // ends up, not where it was before panning.
          setTimeout(showTooltipsForFocus, 520);
        } else {
          showTooltipsForFocus();
        }
      });
    }
  });
}

/**
 * Keyboard + screen-reader support entry point: sets up the map's own ARIA
 * region/label, the live region announcements are written to, and wires up
 * the roving-tabindex trap and countries' baseline focusability.
 */
export function setupMapAccessibility() {
  const mapContainer = document.querySelector('#map');
  const mapSvg = document.querySelector('#mapSvg');
  if (!mapContainer || !mapSvg) return;

  const labels = (languageNameSpace && languageNameSpace.labels) || {};
  const mapLabel = labels['header-title-label'] ? `${labels['header-title-label']} map` : 'Interactive map';

  mapContainer.setAttribute('role', 'region');
  mapContainer.setAttribute('aria-label', mapLabel);

  mapSvg.setAttribute('tabindex', '0');
  mapSvg.setAttribute('role', 'group');
  mapSvg.setAttribute(
    'aria-label',
    labels['MAP_KEYBOARD_HINT'] || `${mapLabel}. Use arrow keys to pan, plus and minus to zoom, Tab to reach a country, Enter to select it.`
  );

  if (!document.querySelector('#mapLiveRegion')) {
    const liveRegion = document.createElement('div');
    liveRegion.id = 'mapLiveRegion';
    liveRegion.setAttribute('role', 'status');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.className = 'ecl-u-sr-only';
    mapContainer.appendChild(liveRegion);
  }

  attachMapKeyboardNav(mapSvg);
  makeCountriesFocusable();
}

/** Tells screen-reader users what just happened, in place of exploring each drawn arc/marker. */
export function announceToScreenReader(message) {
  const liveRegion = document.querySelector('#mapLiveRegion');
  if (liveRegion) liveRegion.textContent = message;
}
