let countryTotal = 0;
let coords = []; // Global coords array
let map; // Global map variable (eurostatmap flow instance)
let isOpenChartContainer = false;
let mapCenterCoords = null;
let euCtr = '#738ce5';
let partnersCtr = '#17256b';
let selectLayer = "#0b39a2";
let activePartners = [];
// Note: z is pixelSize (m/px). eurostatmap.js WORLD_54030 computes a negative baseZ
// due to a projection edge-wrapping bug, so we use a negative z to get positive k=baseZ/z
// y=50 (reused from the old Leaflet/Mercator config's center:[50,10]) doesn't
// translate to the same framing under Robinson: Mercator expands high
// latitudes, Robinson compresses them, so centering on 50N here pushes too
// much empty Arctic ocean into frame and crops the Mediterranean/N. Africa
// at the bottom on typical short/wide viewports. y=42 keeps Scandinavia in
// frame while no longer cropping the south, checked at multiple aspect ratios.
const MAP_INITIAL_POSITION = { x: 14, y: 42, z: -0.0755 };
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
      map = eurostatmap
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

      if (REF && REF.language && typeof map.language === 'function') {
        map.language(REF.language);
      }

      map.build();
    } else {
      console.warn('eurostatmap library not loaded.');
    }
  } catch (e) {
    console.error('Error executing eurostatmap.map("flow"):', e);
  }
}

/**
 * Current D3 zoom scale factor (k) read straight from the zoom group's
 * transform attribute. Shared by everything that needs to keep an element
 * visually constant-sized (or color-coded stroke widths) across zoom levels.
 */
function getMapZoomK() {
  const zoomGroup = document.querySelector('#em-zoom-group-mapSvg');
  const transform = zoomGroup?.getAttribute('transform') || '';
  const match = transform.match(/scale\(([\d.eE+\-]+)\)/) || transform.match(/matrix\(([\d.eE+\-]+)/);
  const k = match ? parseFloat(match[1]) : 1;
  return (k && !isNaN(k) && k > 0) ? k : 1;
}

/**
 * Keeps arc stroke-widths and marker radii visually constant by tracking the
 * D3 zoom transform (k) on the zoom group and scaling inversely.
 */
function attachZoomScaling() {
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

  // Watch the zoom group transform attribute for changes (D3 zoom writes here)
  const observer = new MutationObserver(() => {
    rescaleFlowLayer(getMapZoomK());
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

function getPathCountryCode(path) {
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

/**
 * Selects a country by code - the single path shared by mouse clicks and
 * keyboard activation (Enter/Space on a focused country), so both stay in sync.
 */
async function selectCountryByCode(countryCode) {
  if (!countryCode || !defGeos.includes(countryCode)) return;

  const selectTradeElem = document.querySelector('#selectTrade');
  if (selectTradeElem && selectTradeElem.value) {
    REF.trade = selectTradeElem.value;
  }

  const countryFeature = coords?.[0]?.features?.find(f => f?.properties?.CNTR_ID === countryCode);
  const countryProps = countryFeature ? countryFeature.properties : { CNTR_ID: countryCode };

  await loadCountryData(countryProps);
  if (window.dataNameSpace && typeof dataNameSpace.setRefURL === 'function') {
    dataNameSpace.setRefURL();
  }
}

function attachMapClickListeners() {
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

/**
 * Hovering any country (not just the ~40 selectable ones, and not just an
 * active selection's partners) shows its name - the old Leaflet map did this
 * natively via its own tooltip layer, but eurostat-map has no equivalent, so
 * this was silently lost in the migration. A separate, lighter tooltip
 * element from #entradeMapTooltip's trade pop-card, since the two can be
 * visible for genuinely different targets (a country's fill vs. a flow
 * arc/marker) and shouldn't share markup meant for the richer card layout.
 */
function attachCountryNameTooltips() {
  const worldrg = document.querySelector('#em-worldrg');
  if (!worldrg || worldrg.__nameTooltipAttached) return;
  worldrg.__nameTooltipAttached = true;

  let nameTooltip = document.querySelector('#entradeCountryNameTooltip');
  if (!nameTooltip) {
    nameTooltip = document.createElement('div');
    nameTooltip.id = 'entradeCountryNameTooltip';
    nameTooltip.style.display = 'none';
    document.body.appendChild(nameTooltip);
  }

  worldrg.addEventListener('mousemove', (event) => {
    const path = event.target.closest('path');
    const code = path ? getPathCountryCode(path) : null;
    if (!code) {
      nameTooltip.style.display = 'none';
      return;
    }
    const labels = (languageNameSpace && languageNameSpace.labels) || {};
    nameTooltip.textContent = labels[code] || code;
    nameTooltip.style.display = 'block';
    positionTooltip(nameTooltip, event.pageX + 15, event.pageY + 15);
  });

  worldrg.addEventListener('mouseleave', () => {
    nameTooltip.style.display = 'none';
  });
}

/**
 * Vertical icon toolbar docked to the right edge of the map: reset view (home),
 * zoom in/out, fullscreen toggle, and clear map - matching the original tool's
 * webtools-provided control bar, rebuilt natively since eurostat-map only
 * ships bare +/- buttons. Reuses the original wt-button-* ids and HOME/ZIN/
 * ZOUT/FULL/CLEAR translation keys so language.js's existing relabeling logic
 * (see updatePageLabels) keeps working on language switch, unmodified.
 */
function buildMapToolbar() {
  // Idempotent: rebuild cleanly on every map.build() (e.g. window resize).
  document.querySelectorAll('.entrade-map-toolbar').forEach(el => el.remove());

  const mapElem = document.querySelector('#map');
  if (!mapElem) return;

  const labels = (languageNameSpace && languageNameSpace.labels) || {};
  const homeLabel = labels['HOME'] || 'Home';
  const zoomInLabel = labels['ZIN'] || 'Zoom in';
  const zoomOutLabel = labels['ZOUT'] || 'Zoom out';
  const fullscreenLabel = labels['FULL'] || 'Fullscreen';
  const clearLabel = labels['CLEAR'] || labels['btn7'] || 'Clear map';

  const toolbar = document.createElement('div');
  toolbar.className = 'entrade-map-toolbar';
  toolbar.setAttribute('role', 'toolbar');
  toolbar.setAttribute('aria-label', labels['MAP_TOOLS'] || 'Map controls');

  const makeBtn = (id, icon, label, onClick) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.id = id;
    btn.className = 'entrade-map-toolbar__btn';
    btn.setAttribute('aria-label', label);
    btn.title = label;
    btn.innerHTML = `<i class="fas ${icon}" aria-hidden="true"></i>`;
    btn.addEventListener('click', onClick);
    toolbar.appendChild(btn);
    return btn;
  };

  makeBtn('wt-button-home', 'fa-home', homeLabel, () => {
    if (map && typeof map.position === 'function') {
      map.position(MAP_INITIAL_POSITION);
    }
  });

  makeBtn('wt-button-zoomin', 'fa-plus', zoomInLabel, () => {
    if (map && map.svg_ && map.__zoomBehavior) {
      map.svg_.transition().duration(200).call(map.__zoomBehavior.scaleBy, 1.6);
    }
  });

  makeBtn('wt-button-zoomout', 'fa-minus', zoomOutLabel, () => {
    if (map && map.svg_ && map.__zoomBehavior) {
      map.svg_.transition().duration(200).call(map.__zoomBehavior.scaleBy, 1 / 1.6);
    }
  });

  makeBtn('wt-button-fullscreen', 'fa-expand', fullscreenLabel, () => {
    if (!document.fullscreenElement) {
      mapElem.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  });

  if (!document.__entradeFullscreenListenerAttached) {
    document.__entradeFullscreenListenerAttached = true;
    document.addEventListener('fullscreenchange', () => {
      const icon = document.querySelector('#wt-button-fullscreen i');
      if (!icon) return;
      const isFs = document.fullscreenElement === document.querySelector('#map');
      icon.className = isFs ? 'fas fa-compress' : 'fas fa-expand';
    });
  }

  makeBtn('wt-button-help', 'fa-question-circle', labels['MAP_HELP_BTN'] || 'Map navigation help', openMapHelpModal);

  makeBtn('wt-button-clear', 'fa-eraser', clearLabel, () => {
    const countryInfo = document.querySelector('#countryInfo');
    if (countryInfo) countryInfo.remove();

    REF.geo = '';
    REF.chart = 'map';

    clearMap();
    announceToScreenReader(clearLabel);
    if (window.dataNameSpace && typeof dataNameSpace.setRefURL === 'function') {
      dataNameSpace.setRefURL();
    }
  });

  mapElem.appendChild(toolbar);
}

/**
 * Opens the map navigation help modal - reuses the same ECL <dialog> pattern
 * and trapFocusInModal() helper (defined in iframe.js) as the existing
 * share/embed modal, so it behaves and looks consistent with the rest of
 * the tool rather than introducing a second, bespoke popup mechanism.
 */
function openMapHelpModal() {
  const modal = document.querySelector('#mapHelpModal');
  if (!modal) return;
  const labels = (languageNameSpace && languageNameSpace.labels) || {};
  const t = (key, fallback) => labels[key] || fallback;

  const headerContent = modal.querySelector('.ecl-modal__header-content');
  if (headerContent) headerContent.textContent = t('MAP_HELP_TITLE', 'Map navigation');

  const closeLabel = t('MAP_HELP_CLOSE', 'Close');
  const closeLabelEl = modal.querySelector('.mapHelpCloseLabel');
  if (closeLabelEl) closeLabelEl.textContent = closeLabel;
  const closeBtnEl = modal.querySelector('.mapHelpCloseBtn');
  if (closeBtnEl) closeBtnEl.textContent = closeLabel;

  const body = modal.querySelector('.mapHelpContent');
  if (body) {
    const section = (titleKey, titleFallback, itemKeys) => `
      <h3>${t(titleKey, titleFallback)}</h3>
      <ul>${itemKeys.map(([key, fallback]) => `<li>${t(key, fallback)}</li>`).join('')}</ul>`;

    body.innerHTML = `
      <p>${t('MAP_HELP_INTRO', 'Explore the map using your mouse or keyboard.')}</p>
      ${section('MAP_HELP_MOUSE_TITLE', 'Mouse', [
        ['MAP_HELP_MOUSE_1', 'Click a country to see its trade partners.'],
        ['MAP_HELP_MOUSE_2', 'Scroll to zoom in or out.'],
        ['MAP_HELP_MOUSE_3', 'Drag the map to pan.'],
        ['MAP_HELP_MOUSE_4', 'Use the +/− buttons to zoom, or the home button to reset the view.'],
      ])}
      ${section('MAP_HELP_KEYBOARD_TITLE', 'Keyboard', [
        ['MAP_HELP_KEYBOARD_1', 'Press Tab to reach the map, then Enter to start.'],
        ['MAP_HELP_KEYBOARD_2', 'Use the arrow keys to pan, and + or − to zoom.'],
        ['MAP_HELP_KEYBOARD_3', 'Press Tab to move between countries, and Enter or Space to select one.'],
        ['MAP_HELP_KEYBOARD_4', 'Press Escape to clear a selection, or press it again to leave the map.'],
      ])}`;
  }

  modal.showModal();
  if (typeof ECL !== 'undefined' && ECL.autoInit) ECL.autoInit();
  if (typeof trapFocusInModal === 'function') trapFocusInModal(modal);
}

async function loadCountryData(country) {
  if (!country || !country.CNTR_ID) return;

  REF.geo = country.CNTR_ID;
  REF.chart = 'map';

  // Show loading spinner over the map
  showMapSpinner();
  clearMap();

  const d = await chartApiCall();
  hideMapSpinner();
  const partners = countriesDataHandler(d);

  const labels = languageNameSpace?.labels || {};
  const countryLabel = labels[country.CNTR_ID] || country.CNTR_ID;

  if (!partners.length) {
    showNoDataPopup();
    announceToScreenReader(labels['MSG_NO_DATA'] || `${countryLabel}: no trade data available for the current selection.`);
    return;
  }

  activePartners = partners;
  countryInfo(country);
  await drawLines(country, partners);
  getTitle();
  chartContainerStatus();

  const topPartner = [...partners].sort((a, b) => b[1] - a[1])[0];
  const tradeLabel = labels[REF.trade] || REF.trade;
  const fuelLabel = labels[REF.fuel] || REF.fuel;
  const unitLabel = labels[`abr_${REF.unit}`] || REF.unit;
  const topPartnerLabel = topPartner ? (labels[topPartner[0]] || topPartner[0]) : '';
  const topValue = topPartner ? Math.round(topPartner[1]).toLocaleString(REF.language) : '';
  announceToScreenReader(
    `${countryLabel} selected. ${tradeLabel} ${fuelLabel}, ${REF.year}. ${partners.length} partner${partners.length === 1 ? '' : 's'}` +
    (topPartner ? `, top: ${topPartnerLabel}, ${topValue} ${unitLabel}.` : '.')
  );

  if (isOpenChartContainer) {
    const countryInfoElem = document.querySelector('#countryInfo');
    if (countryInfoElem) countryInfoElem.remove();
    removeChartOptions();
    await openFactSheet();
  }
}

function showMapSpinner() {
  const mapElem = document.querySelector('#map');
  if (!mapElem) return;
  let overlay = document.querySelector('#map-loading-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'map-loading-overlay';
    overlay.innerHTML = '<div class="map-spinner"></div>';
    mapElem.appendChild(overlay);
  }
  // Force reflow then show
  overlay.offsetHeight;
  overlay.classList.add('visible');
}

function hideMapSpinner() {
  const overlay = document.querySelector('#map-loading-overlay');
  if (overlay) {
    overlay.classList.remove('visible');
  }
}

async function openFactSheet(country) {
  const chartContainer = document.querySelector('#chartContainer');
  const mapContainer = document.querySelector('#map');
  if (!chartContainer) {
    console.error('chartContainer not found');
    return;
  }

  const isEmpty = chartContainer.innerHTML.trim() === '' && window.getComputedStyle(chartContainer).display === 'none';
  if (!isEmpty) return;

  chartContainer.style.display = 'block';
  mapContainer.style.display = 'none';

  REF.chart = "tableChart";
  addChartOptions();
  await createTableChart();
  getTitle();
  disableBtns();

  isOpenChartContainer = true;
}

function countriesDataHandler(d) {
  if (d === null) {
    return [];
  }

  const partnerIds = d.Dimension('partner').id;
  const selectedYearValues = getPartnerValuesForYear(d, REF.year);

  const MIN_LINE_VALUE = 0.5;

  let partners = partnerIds
    .map((currentPartnerId, index) => {
      const raw = selectedYearValues[index];
      const numericValue = Number(raw);

      if (
        raw === null ||
        raw === undefined ||
        raw === '' ||
        !Number.isFinite(numericValue) ||
        numericValue <= MIN_LINE_VALUE ||
        excludedPartners.includes(currentPartnerId)
      ) {
        return null;
      }

      return [currentPartnerId, numericValue];
    })
    .filter(Boolean);

  countryTotal = Math.floor(
    partners.reduce((acc, currentValue) => acc + currentValue[1], 0)
  );

  if (REF.filter === 'top5') {
    partners = getTopFive(partners);
  }

  return partners;
}

function countryInfo(country) {
  const countryInfoElem = document.querySelector('#countryInfo');
  if (countryInfoElem) countryInfoElem.remove();

  const countryInfoContent = countryInfoMenu(country);
  const mapElem = document.querySelector("#map");
  if (mapElem) {
    mapElem.insertAdjacentHTML('beforeend', countryInfoContent);
  }
}

function closeInfo(params) {
  const countryInfoElem = document.querySelector('#countryInfo');
  if (countryInfoElem) countryInfoElem.remove();
  clearMap();
}

function isValidPartner(partner) {
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

function getCountryCoordinates(countryCode) {
  const feature = coords?.[0]?.features?.find(f => f?.properties?.CNTR_ID === countryCode || f?.id === countryCode);
  if (!feature?.geometry?.coordinates) {
    console.warn(`Coordinates not found for country code: ${countryCode}`);
    return null;
  }

  // coordinates is [longitude, latitude] in GeoJSON -> return [latitude, longitude]
  return [feature.geometry.coordinates[1], feature.geometry.coordinates[0]];
}

function getMidpoint(sourceCoords, partnerCoords) {
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

function createFlowValueScaler(partners) {
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
function animateMapToPosition(targetX, targetY, targetZ, durationMs = 700) {
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
function animateMapToCountry(lat, lng, durationMs = 700) {
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
function computeFitToPartnersPosition(sourceCoords, partners) {
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

function calculateWeight(scale, value, zoom = 4) {
  const BASE_MIN = 2;
  const BASE_MAX = 10;
  return Math.round(scale(value, BASE_MIN, BASE_MAX, "sqrt"));
}

function calculateRadius(scale, value, zoom = 4) {
  const BASE_MIN = 4;
  const BASE_MAX = 18;
  return Math.round(scale(value, BASE_MIN, BASE_MAX, "sqrt"));
}

function poliColorChange() {
  const fuelColors = {
    solid: 'rgba(128, 0, 0, 0.85)',
    oil: 'rgba(20, 55, 90, 0.85)',
    gas: 'rgba(250, 165, 25, 0.85)',
    biofuels: 'rgba(95, 180, 65, 0.85)',
    electricity: 'rgba(215, 60, 65, 0.85)',
  };

  return fuelColors[REF?.fuel] || 'rgba(250, 165, 25, 0.85)';
}

async function drawLines(sourceCountry, partners) {
  if (!sourceCountry || !Array.isArray(partners)) return;

  mapCenterCoords = sourceCountry;
  const sourceCode = sourceCountry.CNTR_ID;
  const validPartners = partners.filter(isValidPartner);
  activePartners = validPartners;

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

function reapplyCountryColors(partners = activePartners) {
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

function clearMap() {
  activePartners = [];

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

function clearLinesAndMarkers() {
  clearMap();
}

/**
 * Places a tooltip element at a desired point, then clamps it to stay fully
 * within the viewport. Tooltips were anchored purely relative to the cursor
 * (mouse) or straight above the focused country (keyboard), so near any edge
 * - especially the top, since the keyboard tooltip anchors above its country
 * - they could render partly or entirely off-screen.
 */
function positionTooltip(tooltipContainer, desiredLeft, desiredTop) {
  if (!tooltipContainer) return;

  const margin = 10;
  const tipRect = tooltipContainer.getBoundingClientRect();
  const minLeft = window.scrollX + margin;
  const maxLeft = window.scrollX + window.innerWidth - tipRect.width - margin;
  const minTop = window.scrollY + margin;
  const maxTop = window.scrollY + window.innerHeight - tipRect.height - margin;

  // If the tooltip is taller/wider than the viewport has room for, prefer
  // pinning it to the top/left margin over letting it overflow.
  const left = maxLeft >= minLeft ? Math.min(Math.max(desiredLeft, minLeft), maxLeft) : minLeft;
  const top = maxTop >= minTop ? Math.min(Math.max(desiredTop, minTop), maxTop) : minTop;

  tooltipContainer.style.left = left + 'px';
  tooltipContainer.style.top = top + 'px';
}

function lineTooltip(partnerCountry, value, countryName) {
  const labels = languageNameSpace?.labels || {};
  const title = labels[REF.trade] || labels[REF.dataset] || 'Trade';
  const labelFuel = labels[REF.fuel] || REF.fuel || 'Natural gas';
  const unit = labels[`abr_${REF.unit}`] || REF.unit || 'TJ';
  const partnerLabel = labels[partnerCountry] || partnerCountry;
  const countryLabel = labels[countryName] || countryName;
  const countryOne = REF.trade === 'imp' ? partnerLabel : countryLabel;
  const countryTwo = REF.trade === 'imp' ? countryLabel : partnerLabel;
  const countryValue = Number(value).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  const icon = REF.fuel || 'gas';

  return `
  <div class="pop-card pop-card--solid">
    <div class="pop-card__header">
      <div class="pop-card__icon-wrap">
        <img src="img/fuel-family/${icon}.png" alt="${labelFuel}">
      </div>
      <div class="pop-card__titles">
        <span class="pop-card__label">${title.toUpperCase()}</span>
        <span class="pop-card__fuel">${labelFuel}</span>
      </div>
    </div>
    <div class="pop-card__body">
      <div class="pop-card__route">
        <span class="pop-card__country">${countryOne}</span>
        <span class="pop-card__arrow">
          <svg width="24" height="12" viewBox="0 0 24 12" fill="none">
            <path d="M0 6h20m0 0l-4-4m4 4l-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </span>
        <span class="pop-card__country">${countryTwo}</span>
      </div>
      <div class="pop-card__value-wrap">
        <span class="pop-card__value">${countryValue}</span>
        <span class="pop-card__unit">${unit}</span>
      </div>
    </div>
  </div>`;
}

function countryInfoMenu(country) {
  const countryContent = `
  <div id="countryInfo">
    <button id="factSheet"
            class="ecl-button ecl-button--cta factBtn"
            type="button"
            onclick="openFactSheet()"
            title="${languageNameSpace?.labels?.["FACTSHEET"] || 'Open factsheet'}"
            aria-label="${languageNameSpace?.labels?.["FACTSHEET"] || 'Open factsheet'}">
      ${languageNameSpace?.labels?.["FACTSHEET"] || 'Open factsheet'}
    </button>
  </div>
`;

  return countryContent;
}

function chartContainerStatus() {
  const chartContainer = document.querySelector('#chartContainer');
  isOpenChartContainer = chartContainer && window.getComputedStyle(chartContainer).display !== 'none' ? true : false;
}

/**
 * Keyboard + screen-reader support for the map, following the pattern maps
 * like Google Maps use: the map is ONE tab stop (arrow keys pan it, +/-
 * zoom it - not hundreds of individually-tabbable features), Tab from there
 * reaches the small set of actually-selectable countries one at a time, and
 * a live region announces the outcome of a selection instead of requiring
 * screen-reader users to explore each drawn flow arc/marker individually.
 */
function setupMapAccessibility() {
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
const mapKbd = { active: false, items: [], index: 0 };

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
function resetTrapItemTabindex(item) {
  if (item.isFactSheet) {
    item.el.removeAttribute('tabindex');
  } else {
    item.el.setAttribute('tabindex', '-1');
  }
}

function mapKbdEntries(codes) {
  const paths = Array.from(document.querySelectorAll('#em-worldrg path'));
  const seen = new Set();
  return codes
    .filter(code => !seen.has(code) && seen.add(code))
    .map(code => ({ code, el: paths.find(p => getPathCountryCode(p) === code) }))
    .filter(item => item.el);
}

function mapKbdSetItems(items, focusIndex) {
  mapKbd.items.forEach(resetTrapItemTabindex);
  mapKbd.items = items;
  mapKbd.index = Math.max(0, focusIndex);
  mapKbd.items.forEach((item, i) => item.el.setAttribute('tabindex', i === mapKbd.index ? '0' : '-1'));
}

function mapKbdMove(delta) {
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

function enterMapBrowseMode(preferredCode) {
  const items = mapKbdEntries(defGeos);
  if (!items.length) return;
  mapKbd.active = true;
  const startIndex = preferredCode ? Math.max(0, items.findIndex(i => i.code === preferredCode)) : 0;
  mapKbdSetItems(items, startIndex);
  suppressNextVisibilityPan = true;
  mapKbd.items[mapKbd.index].el.focus({ preventScroll: true });
}

function enterMapSelectedMode(sourceCode, partnerCodes) {
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

function exitMapKeyboardTrap() {
  mapKbd.items.forEach(resetTrapItemTabindex);
  mapKbd.items = [];
  mapKbd.active = false;
  hideKeyboardTooltip();
  hideCountryNameTooltipForFocus();
  document.querySelector('#mapSvg')?.focus({ preventScroll: true });
}

function attachMapKeyboardNav(mapSvg) {
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
function handlePanZoomKey(event) {
  if (!map || !map.svg_ || !map.__zoomBehavior) return false;
  const step = 80 / getMapZoomK(); // constant on-screen distance regardless of zoom

  switch (event.key) {
    case 'ArrowUp':
      map.svg_.transition().duration(180).call(map.__zoomBehavior.translateBy, 0, step);
      break;
    case 'ArrowDown':
      map.svg_.transition().duration(180).call(map.__zoomBehavior.translateBy, 0, -step);
      break;
    case 'ArrowLeft':
      map.svg_.transition().duration(180).call(map.__zoomBehavior.translateBy, step, 0);
      break;
    case 'ArrowRight':
      map.svg_.transition().duration(180).call(map.__zoomBehavior.translateBy, -step, 0);
      break;
    case '+':
    case '=':
      map.svg_.transition().duration(180).call(map.__zoomBehavior.scaleBy, 1.4);
      break;
    case '-':
    case '_':
      map.svg_.transition().duration(180).call(map.__zoomBehavior.scaleBy, 1 / 1.4);
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
function ensureFocusedCountryVisible(path, code) {
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
function makeCountriesFocusable() {
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

/** Shows the same pop-card mouse hover uses, anchored to a keyboard-focused country instead of the cursor. */
function showKeyboardTooltip(anchorPath, partnerCode, value) {
  const tooltipContainer = document.querySelector('#entradeMapTooltip');
  if (!tooltipContainer) return;
  tooltipContainer.innerHTML = lineTooltip(partnerCode, value, REF.geo);
  tooltipContainer.style.display = 'block'; // needs to be visible before measuring its real size below

  const rect = anchorPath.getBoundingClientRect();
  const tipRect = tooltipContainer.getBoundingClientRect();
  const desiredLeft = rect.left + rect.width / 2 + window.scrollX - tipRect.width / 2; // centered on the country
  const desiredTop = rect.top + window.scrollY - tipRect.height - 12; // above it
  positionTooltip(tooltipContainer, desiredLeft, desiredTop);
}

function hideKeyboardTooltip() {
  const tooltipContainer = document.querySelector('#entradeMapTooltip');
  if (tooltipContainer) tooltipContainer.style.display = 'none';
}

/** Keyboard-focus counterpart to attachCountryNameTooltips' mouse hover - same plain name label, anchored to the focused country instead of the cursor. */
function showCountryNameTooltipForFocus(anchorPath, code) {
  const nameTooltip = document.querySelector('#entradeCountryNameTooltip');
  if (!nameTooltip) return;
  const labels = (languageNameSpace && languageNameSpace.labels) || {};
  nameTooltip.textContent = labels[code] || code;
  nameTooltip.style.display = 'block';

  const rect = anchorPath.getBoundingClientRect();
  const tipRect = nameTooltip.getBoundingClientRect();
  const desiredLeft = rect.left + rect.width / 2 + window.scrollX - tipRect.width / 2;
  const desiredTop = rect.top + window.scrollY - tipRect.height - 10;
  positionTooltip(nameTooltip, desiredLeft, desiredTop);
}

function hideCountryNameTooltipForFocus() {
  const nameTooltip = document.querySelector('#entradeCountryNameTooltip');
  if (nameTooltip) nameTooltip.style.display = 'none';
}

/** Tells screen-reader users what just happened, in place of exploring each drawn arc/marker. */
function announceToScreenReader(message) {
  const liveRegion = document.querySelector('#mapLiveRegion');
  if (liveRegion) liveRegion.textContent = message;
}

function debounce(callback, delay = 150) {
  let timer = null;
  return function debouncedFunction(...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      callback.apply(this, args);
    }, delay);
  };
}