/**
 * Map bootstrap: sizing #map to the available viewport, building the
 * eurostat-map instance, and the entry point that kicks the whole module
 * graph off once coordinate data has loaded. This is the module entrade.html
 * loads directly (`<script type="module" src="js/map/mapCore.js">`) - every
 * other js/map/*.js file is pulled in transitively via imports below.
 */
import { coords, map, setMap, MAP_INITIAL_POSITION, activePartners, mapCenterCoords } from './mapState.js';
import { debounce } from './mapUtils.js';
import { reapplyCountryColors, attachMapClickListeners, drawLines } from './mapDrawing.js';
import { buildMapToolbar } from './mapToolbar.js';
import { attachCountryNameTooltips } from './mapTooltips.js';
import { setupMapAccessibility } from './mapKeyboardNav.js';
import { attachZoomScaling } from './mapAnimation.js';
import { loadCountryData } from './mapCountryData.js';

let hasBuiltMapOnce = false;

/** #componentFooter's own rendered height, or 0 before its content (async-built) has arrived. */
function getFooterHeight() {
  const footer = document.querySelector('#componentFooter');
  return footer ? footer.getBoundingClientRect().height : 0;
}

/**
 * Sizes #map to fill exactly what's left of the viewport after the header/
 * globan/subnav above it and the footer below it - so the whole page fits
 * in one screen with no scrolling, rather than the map claiming the full
 * viewport height and pushing the footer off it.
 */
function syncMapHeight() {
  const mapSection = document.querySelector('#map');
  if (!mapSection) return Math.max(360, window.innerHeight - 190);
  const rect = mapSection.getBoundingClientRect();
  const availH = Math.max(360, window.innerHeight - rect.top - getFooterHeight());
  mapSection.style.height = availH + 'px';
  return availH;
}

function getMapDimensions() {
  const container = document.querySelector('#map');
  const width = container && container.clientWidth > 0 ? container.clientWidth : (window.innerWidth || 1200);
  const height = syncMapHeight();
  return { width, height };
}

/**
 * The header/globan banner, subnav and footer are all built asynchronously
 * (webtools.europa.eu/load.js is a deferred external script; the footer's
 * links are added by a JS component after page load) - they can finish
 * rendering, and change the page's real chrome height, well after our own
 * initial syncMapHeight() call already locked in a size. Watching them
 * directly re-syncs the map whenever that happens, instead of leaving it
 * stuck at a stale, oversized height computed before the page had settled.
 */
function watchChromeForMapResize() {
  if (watchChromeForMapResize._attached) return;
  watchChromeForMapResize._attached = true;

  const resync = debounce(() => {
    if (map && typeof map.width === 'function') {
      const { width, height } = getMapDimensions();
      map.width(width).height(height);
    } else {
      syncMapHeight();
    }
  }, 150);

  const observer = new ResizeObserver(resync);
  ['header', '#subnavbar-container', '#componentFooter'].forEach(selector => {
    const el = document.querySelector(selector);
    if (el) observer.observe(el);
  });

  window.addEventListener('load', resync);
}

function fireOnStart(geo, retries = 20) {
  if (!geo) return;

  setTimeout(async () => {
    const countryFeature = coords?.[0]?.features?.find(f => f?.properties?.CNTR_ID === geo);
    if (countryFeature?.properties) {
      await loadCountryData(countryFeature.properties);
    } else if (retries > 0) {
      fireOnStart(geo, retries - 1);
    } else {
      console.warn(`fireOnStart: country "${geo}" not found on map.`);
    }
  }, 300);
}

function renderMap() {
  const mapSection = document.querySelector("#map");
  if (mapSection && !document.querySelector("#mapSvg")) {
    mapSection.innerHTML = '<svg id="mapSvg" style="width: 100%; height: 100%;"></svg>';
  }

  // getMapDimensions() also syncs mapSection's actual pixel height as a side effect.
  const { width, height } = getMapDimensions();
  watchChromeForMapResize();

  try {
    if (typeof eurostatmap !== 'undefined') {
      const builtMap = eurostatmap
        .map('flow')
        .svgId('mapSvg')
        .containerId('map')
        .width(width)
        .height(height)
        .geo('WORLD')
        .proj('54030')
        .scale('60M')
        .nutsLevel(0)
        .nutsYear(2024)
        .position(MAP_INITIAL_POSITION)
        .flowGraph({ nodes: [], links: [] })
        .onBuild(() => {
          // Fires once geo+stat data are fully loaded and the SVG is built -
          // the reliable "map is ready" signal, instead of guessing with timeouts.
          // Also re-fires on every subsequent map.build() (e.g. on resize).
          // The pre-build .position() call alone isn't enough to reliably land
          // on the intended view - only a post-build call (which drives the
          // actual zoom transform via setMapView) does, so re-assert it here.
          if (typeof map.position === 'function') {
            map.position(MAP_INITIAL_POSITION);
          }
          reapplyCountryColors(activePartners);
          buildMapToolbar();
          attachMapClickListeners();
          attachCountryNameTooltips();
          setupMapAccessibility();
          attachZoomScaling();

          if (!hasBuiltMapOnce) {
            hasBuiltMapOnce = true;
            if (REF && REF.geo) {
              fireOnStart(REF.geo);
            }
          }
        });

      if (REF && REF.language && typeof builtMap.language === 'function') {
        builtMap.language(REF.language);
      }

      setMap(builtMap);
      map.build();
    } else {
      console.warn('eurostatmap library not loaded.');
    }
  } catch (e) {
    console.error('Error executing eurostatmap.map("flow"):', e);
  }
}
// Exposed for js/language.js's ChangeLanguage(), which calls this as a bare global.
window.renderMap = renderMap;

// Fetch coordination data asynchronously
fetch("data/data.json")
  .then(response => response.json())
  .then(data => {
    coords.push(data);
    if (window.dataNameSpace && typeof dataNameSpace.getRefURL === 'function') {
      dataNameSpace.getRefURL();
    }
    renderMap();
    if (typeof hideForIframe === 'function') {
      hideForIframe();
    }
  })
  .catch(error => console.error('Error loading coordination data:', error));

// Window resize listener to keep map full-width and centered
window.addEventListener('resize', debounce(() => {
  if (map && typeof map.width === 'function') {
    const { width, height } = getMapDimensions();
    map.width(width).height(height);
    if (activePartners && activePartners.length && mapCenterCoords) {
      drawLines(mapCenterCoords, activePartners);
    } else {
      map.build(); // re-fires the onBuild callback registered in renderMap()
    }
  }
}, 250));
