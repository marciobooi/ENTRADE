let countryTotal = 0;
let coords = []; // Declare coords at the global scope
let map; // Initialize the map variable
let isOpenChartContainer = false;
let mapCenterCoords = null;
let euCtr = '#738ce5';
let partnersCtr = '#17256b';
let selectLayer = "#0b39a2";


// Fetch coordination data asynchronously
fetch("data/data.json")
  .then(response => response.json())
  .then(data => {
    coords.push(data);
    dataNameSpace.getRefURL()
    renderMap();
    hideForIframe();
    if (REF.geo !== "") {
      fireOnStart(REF.geo)
    }
  }).catch(error => console.error('Error loading coordination data:', error));

  function fireOnStart(geo) {
    let country = geo;
    
    setTimeout(function () {
      // Check if map and map._layers exist before accessing
      if (!map || !map._layers) {
        console.warn('Map or map._layers not yet initialized, retrying...');
        fireOnStart(geo); // Retry if map not ready
        return;
      }

      for (const layerId in map._layers) {
        if (map._layers.hasOwnProperty(layerId)) {
            const layer = map._layers[layerId];
    
            // Check if the layer represents a GeoJSON feature
            if (layer.feature && layer.feature.properties) {
                const properties = layer.feature.properties;   

                if (properties.CNTR_ID === REF.geo) {    
                    loadCountryData(properties);   
                    return
                }
            }
        }
    }
    }, 1000);
  }

function renderMap() {
 
  map = $wt.map.render({
    map: {
      scrollWheelZoom: true,
      center: [50, 10],
      smoothZoom: false,
      zoom: 4,
      zoomDelta: 1,
      zoomSnap: 0.25,
      zoomAnimation: false,
      fadeAnimation: true,
      markerZoomAnimation: false,
      continuousWorld: true,
      worldCopyJump: true,
      inertia: true,
      smoothWheelZoom: true, 
      smoothSensitivity: 2,
      smoothFactor: 1,
      language: REF.language,
      background : ["positron_background"],
      height: "100%",
      width: "100%",
      maxBounds: [
        [-90, -Infinity],
        [90, Infinity]
      ],
    },
    layers: {
      countries: [{
        data: ["ALL", "KS*0"],
        options: {
          events: {
            click: function (layer) {    



              if (defGeos.includes(layer.feature.properties.CNTR_ID)) {
                // sync REF.trade with current trade selector value before loading data
                const selectTradeElem = document.querySelector('#selectTrade');
                if (selectTradeElem && selectTradeElem.value) {
                  REF.trade = selectTradeElem.value;
                }
                country = layer.feature.properties;
                loadCountryData(country);              

                document.querySelectorAll('path[aria-label]').forEach((element) => {
                  const countryName = element.getAttribute('aria-label').trim();           
                  if (countryName === languageNameSpace.labels[country]) {
                    element.style.fill = partnersCtr;
                    element.style.stroke = '#4b598b';
                    element.style.strokeWidth = '2px';
                  } else if (countryName === languageNameSpace.labels[REF.geo]) {
                    element.style.fill = selectLayer;
                    element.style.stroke = 'white';
                    element.style.strokeWidth = '2px';
                  }
                });
              }  

              dataNameSpace.setRefURL();
            },
            tooltip: {
              content: function (layer) {
                const countryID = layer.properties.CNTR_ID;
                let tooltipText = ""; 
                if (countryID === "KS") { 
                  tooltipText = `<b>${languageNameSpace.labels["KS"]}</b>`;
                } else {
                  tooltipText =  "<b>{CNTR_NAME}</b>";
                }

                return tooltipText;
                
                
              },
              options: {
                direction: "top",
                sticky: true,
                // Custom class lets CSS beat the webtools 12px override
                className: 'entrade-country-tooltip',
              },
            },
          },
          label: {
            mode: "none",
            language: REF.language
          },
          style: {
            color: "#f5f5f5",
            weight: 1,
            opacity: 1,
            fillColor: "#e6e6e6",
            fillOpacity: 1
          },
        }
      }]
    }
  }).ready(function (mapInstance) {
    map = mapInstance; // Update the global map variable

      setTimeout(() => {
        map.eachLayer(function (layer) {
          if (layer.feature && layer.feature.properties) {
              const countryID = layer.feature.properties.CNTR_ID;
      
              if (countryID === "KS") {
                  layer.setStyle({  
                      fillColor: "#738ce5",  
                      color: "#bcb5b5", // Border color
                      weight: 1
                  });
              } else if (countryID === "RS") {
                  layer.defaultOptions.style.fillColor= "#738ce5";      
                  layer.defaultOptions.style.color= "#4b598b";    
                  layer.defaultOptions.style.weight= "2";    
                  layer.setStyle({  
                    fillColor: "#738ce5",  
                    color: "#4b598b", // Border color
                    weight: 2
                });              
              } else {
                  layer.setStyle({  
                      color: "rgb(245, 245, 245)", // Border color
                      weight: 1,
                      opacity: 1,
                      fillColor: "rgb(230, 230, 230)", // Fill color
                      fillOpacity: 1
                  });
              }
          }
      });
          // Build label lookup once, then single pass over paths
          const geoLabels = {};
          defGeos.forEach(key => { geoLabels[languageNameSpace.labels[key]] = true; });
          const selectedGeoLabel = languageNameSpace.labels[REF.geo];

          document.querySelectorAll('path[aria-label]').forEach((element) => {
            const countryName = element.getAttribute('aria-label').trim();
            // ensure a visible/title string for tooltips and assistive tech
            if (!element.getAttribute('title')) {
              element.setAttribute('title', countryName);
            }
            if (geoLabels[countryName]) {
              element.style.fill = euCtr;
              element.style.stroke = '#4b598b';
              element.style.strokeWidth = '2px';
            } else if (countryName === selectedGeoLabel) {
              element.style.fill = selectLayer;
              element.style.stroke = 'white';
              element.style.strokeWidth = '2px';
            }
          });        
            addClearToMenu()  

            // Ensure that any focusable content inside aria-hidden map panes is neutralized
            removeFocusableFromHiddenMapPanes();

            // Give the map a programmatic name and a short, screen-reader-only description
            const mapContainer = document.querySelector('.wt-map-content') || document.querySelector('#map');
            if (mapContainer) {
              // role and accessible name
              mapContainer.setAttribute('role', 'region');
              const mapLabel = (languageNameSpace && languageNameSpace.labels && languageNameSpace.labels['header-title-label']) ? `${languageNameSpace.labels['header-title-label']} map` : 'Interactive map';
              mapContainer.setAttribute('aria-label', mapLabel);

              // create (or reuse) a visually-hidden description for screen readers
              if (!document.getElementById('mapDescription')) {
                const desc = document.createElement('div');
                desc.id = 'mapDescription';
                desc.className = 'ecl-u-sr-only';
                desc.textContent = `${mapLabel}. Use Tab to move through map routes and markers. Press Enter or Space to open details.`;
                mapContainer.parentNode && mapContainer.parentNode.insertBefore(desc, mapContainer.nextSibling);
              }
              mapContainer.setAttribute('aria-describedby', 'mapDescription');

              // Observe the map container for aria-hidden changes and neutralize focusable nodes inside hidden panes
              if (!mapContainer.__a11yObserverAttached) {
                const observer = new MutationObserver((mutations) => {
                  let shouldRun = false;
                  for (const m of mutations) {
                    if (m.type === 'attributes' && m.attributeName === 'aria-hidden') {
                      shouldRun = true;
                      break;
                    }
                    if (m.type === 'childList') {
                      shouldRun = true;
                      break;
                    }
                  }
                  if (shouldRun) removeFocusableFromHiddenMapPanes(mapContainer);
                });
                observer.observe(mapContainer, { attributes: true, attributeFilter: ['aria-hidden'], subtree: true, childList: true });
                mapContainer.__a11yObserverAttached = true;
              }

              // Apply a11y fixes to Leaflet SVG and tooltips
              // role="group" (not "img") is required because the SVG contains
              // focusable interactive child elements (paths with tabindex/role).
              // Using role="img" would hide those children from the a11y tree
              // and create a nested-interactive-controls violation.
              const mapSvg = mapContainer.querySelector('svg');
              if (mapSvg) {
                mapSvg.setAttribute('role', 'group');
              }

              document.querySelectorAll('[aria-describedby]').forEach((el) => {
                const describedId = el.getAttribute('aria-describedby');
                if (describedId && !document.getElementById(describedId)) {
                  el.removeAttribute('aria-describedby');
                }
              });
            }

            // Remove interactive attributes from non-clickable country paths.
            // Webtools adds role="button" + tabindex="0" to every Leaflet path;
            // non-defGeos paths (e.g. Russia) have huge bounding boxes that the
            // browser counts as interactive neighbours, shrinking the safe
            // touch-target space around nearby UI buttons to < 24 px (WCAG 2.5.8).
            neutralizeNonInteractivePaths();

      }, 500);
  });
}




function addClearToMenu() {
  const icon = '<i class="fas fa-eraser"></i>';
  const clearLabel = (languageNameSpace && languageNameSpace.labels && (languageNameSpace.labels['CLEAR'] || languageNameSpace.labels['btn7'])) ? (languageNameSpace.labels['CLEAR'] || languageNameSpace.labels['btn7']) : 'Clear map';
  const content = `<button class="wt-btn clear" name="clear" id="wt-button-clear" aria-label="${clearLabel}" type="button">
  <b class="wt-noconflict"></b>
  <span class="wt-noconflict">${clearLabel}</span>
</button>`;

  const mapMenu = document.querySelector(".wt-map-menu");
  if (mapMenu) {
    mapMenu.insertAdjacentHTML('beforeend', content);
  }

  const clearBtn = document.querySelector("#wt-button-clear");
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      clearLines();
      const countryInfo = document.querySelector('#countryInfo');
      if (countryInfo) countryInfo.remove();
      clearMap();

      document.querySelectorAll('path[aria-label]').forEach((element) => {
        const countryName = element.getAttribute("aria-label").trim();

        if (countryName === languageNameSpace.labels[REF.geo]) {
          element.style.fill = "rgb(115, 140, 229)";
          element.style.stroke = "rgb(75, 89, 139)";
          element.style.strokeWidth = "2px";
        }
      });
    });
  }
}


async function loadCountryData(country) {  
  REF.dataset = REF.dataset;
  REF.geo = country.CNTR_ID;
  REF.chart = "map";

  // Clear any previous country selection before loading the new one.
  // This enforces single-country selection and prevents curves/markers accumulating.
  clearMap();

  // Assuming chartApiCall returns an object with a 'value' property
  let d = await chartApiCall();

  let values = d.value.map(v => Number(v));
  let allZero = values.every(value => !isNaN(value) && value === 0);
  let allNull = d.value.every(value => value === null);
  let allUndefined = d.value.every(value => typeof value === 'undefined');

  if (allZero || allNull || allUndefined) {
    // Delegate to the shared popup helper (also calls clearMap and manages focus).
    showNoDataPopup();
  } else {
    let partners = countriesDataHandler(d);
    countryInfo(country);
    await drawLines(country, partners);
    getTitle();
    chartContainerStatus();

    // move keyboard focus to first curve line (if any) so Tab order begins with the lines
    setTimeout(() => focusFirstMapCurve(), 120);

    if (isOpenChartContainer) {
      const countryInfo = document.querySelector('#countryInfo');
      if (countryInfo) countryInfo.remove();
      removeChartOptions();
      await openFactSheet();
    }
  }
}


async function openFactSheet(country) {
  const chartContainer = document.querySelector('#chartContainer');
  const mapContainer = document.querySelector('#map');
  if (!chartContainer) {
    console.error('chartContainer not found');
    return;
  }

  // Only initialize and show the chart container if it's currently empty
  const isEmpty = chartContainer.innerHTML.trim() === '' && window.getComputedStyle(chartContainer).display === 'none';
  if (!isEmpty) return; // already open — nothing to do

  chartContainer.style.display = 'block';
  mapContainer.style.display = 'none';

  // initialize content
  addChartOptions();
  await createTableChart();
  getTitle();
  disableBtns();

  isOpenChartContainer = true;
}



function countriesDataHandler(d) {

  if (d === null) {
    return []; // Return an empty array if the input is null
  }

  const partnerIds = d.Dimension("partner").id;

  console.log('[countriesDataHandler] values length', d.value.length);

  const MIN_LINE_VALUE = 0.5; // use 0.001 or 0.1 to avoid tiny lines if needed

  let partners = partnerIds.map((currentPartnerId, index) => {
    let raw = d.value[index];
    if (raw === null || raw === undefined || raw === '' || raw <= 0) return null;

    const numericValue = Number(raw);
    if (
      !excludedPartners.includes(currentPartnerId) &&
      !isNaN(numericValue) &&
      numericValue > MIN_LINE_VALUE
    ) {
      return [currentPartnerId, numericValue];
    }
    return null;
  }).filter(partner => partner !== null);

  console.log('[countriesDataHandler] filtered partners count', partners.length);
  console.log('[countriesDataHandler] partner list', partners.map(p => [p[0], p[1]]));

  countryTotal = Math.floor(partners.reduce((acc, currentValue) => acc + currentValue[1], 0));


  if( REF.filter === "top5" ){
    partners = getTopFive(partners);
  }

   return partners;
}

function countryInfo(country) {
  const countryInfoElem = document.querySelector('#countryInfo');
  if (countryInfoElem) countryInfoElem.remove();
  
  countryInfoContent = countryInfoMenu(country);
  const mapElem = document.querySelector("#map");
  if (mapElem) {
    mapElem.insertAdjacentHTML('beforeend', countryInfoContent);
  }
}

function closeInfo(params) {
  const countryInfoElem = document.querySelector('#countryInfo');
  if (countryInfoElem) countryInfoElem.remove();
  clearLinesAndMarkers();
}

function drawLines(sourceCountry, partners) {
  if (!map) {
    console.error('Map not initialized.');
    return;
  }

  mapCenterCoords = sourceCountry;

  clearLinesAndMarkers();

  // Store radii so the single zoom handler can reference them
  const markerRadii = [];

  partners.forEach(partner => {
    const partnerCountry = partner[0];
    const value = partner[1];
    if (typeof value !== 'number' || isNaN(value) || value <= 0.000001) {
      return; // skip effectively zero / invalid partners
    }
    const sourceCoords = sourceCountry.CENTROID;
    const partnerCoords = getCountryCoordinates(partnerCountry);
    const countryName = sourceCountry.CNTR_ID;

    const curvePoint = getMidpoint(sourceCoords, partnerCoords);    

    const line = L.curve(["M", sourceCoords, "Q", curvePoint, partnerCoords], {
      color: poliColorChange(), // Set the desired line color
      weight: calculateWeight(partners, value),
      opacity: 1,
      animate: 1500,
      lineCap: "round",
      smoothFactor: 1,
      noClip: true,
      outline: "none",
      className: "myClass",
    }).on('mouseover', function (event) {
      const tooltipContent = lineTooltip(partnerCountry, value, countryName);
      this.bindTooltip(tooltipContent, { sticky: true, opacity: 1 }).openTooltip();
    }).on('mouseout', function (event) {
      this.closeTooltip();
    }).addTo(map);

    // Make the underlying SVG path for the curve keyboard-focusable and accessible
    try {
      if (line._path) {
        const pathEl = line._path;
        pathEl.classList.add('map-curve');
        pathEl.setAttribute('tabindex', '0');
        pathEl.setAttribute('focusable', 'true');
        pathEl.setAttribute('role', 'link');
        const pathLabel = `${languageNameSpace.labels[partnerCountry]} — ${value} ${languageNameSpace.labels['abr_'+REF.unit]}`;
        pathEl.setAttribute('aria-label', pathLabel);
        if (!pathEl.getAttribute('title')) pathEl.setAttribute('title', pathLabel);

        // Keyboard: Enter/Space opens tooltip; Arrow keys move between curves
        pathEl.addEventListener('keydown', (ev) => {
          if (ev.key === 'Enter' || ev.key === ' ' || ev.keyCode === 13 || ev.keyCode === 32) {
            ev.preventDefault();
            try { line.openTooltip(); } catch (e) {}
          }
          if (ev.key === 'ArrowRight' || ev.keyCode === 39) {
            ev.preventDefault();
            focusNextMapCurve(pathEl);
          }
          if (ev.key === 'ArrowLeft' || ev.keyCode === 37) {
            ev.preventDefault();
            focusPrevMapCurve(pathEl);
          }
        });
      }
    } catch (e) {
      /* ignore — best-effort */
    }

    const radius = calculateRadius(partners, value);
    markerRadii.push(radius);

    const marker = L.circle(partnerCoords, {
      color: 'rgb(170 95 24)', // Set the color of the circle's border to transparent
      fillColor: 'rgb(170 95 24)', // Set the fill color of the circle
      fillOpacity: 1, // Set the opacity of the fill color
      radius: radius, // Set the radius of the circle in meters
      _partnerCountry: partnerCountry // stored so zoom-redraw can recolor the country polygon
    }).addTo(map)
    .bindPopup(lineTooltip(partnerCountry, value, countryName), { className: 'pop-card-popup' })
    .on('mouseover', function (e) { this.openPopup(); })
    .on('mouseout', function (e) { this.closePopup(); });

    // make the marker path keyboard-focusable
    try {
      if (marker._path) {
        marker._path.setAttribute('tabindex', '0');
        marker._path.setAttribute('role', 'button');
        const markerLabel = `${languageNameSpace.labels[partnerCountry]} — ${value} ${languageNameSpace.labels['abr_'+REF.unit]}`;
        marker._path.setAttribute('aria-label', markerLabel);
        if (!marker._path.getAttribute('title')) marker._path.setAttribute('title', markerLabel);
        marker._path.classList.add('map-marker');
        marker._path.addEventListener('keydown', (ev) => {
          if (ev.key === 'Enter' || ev.key === ' ' || ev.keyCode === 13 || ev.keyCode === 32) {
            ev.preventDefault();
            marker.openPopup();
          }
        });
      }
    } catch (e) {
      /* best-effort */
    }

    marker._path.classList.add('marker');

    lines.push(line);
    markers.push(marker);
    styleCountry(partnerCountry);
  });

  // Single zoom handler for ALL markers (instead of one per marker)
  function updateAllCircleSizes() {
    const zoomLevel = map.getZoom();
    const scale = Math.pow(2, 5 - zoomLevel);

    // update circle marker radii only (fast, runs during zoom)
    markers.forEach((m, i) => {
      const r = markerRadii[i];
      if (r !== undefined) {
        m.setRadius(r * scale);
      }
    });
  }

  // Force overflow:visible on every SVG in the overlay pane (prevents clipping)
  function forceSvgOverflow() {
    const pane = document.querySelector('.leaflet-overlay-pane');
    if (pane) {
      pane.querySelectorAll('svg').forEach(svg => {
        svg.style.overflow = 'visible';
      });
      pane.querySelectorAll('g').forEach(g => {
        g.removeAttribute('clip-path');
      });
    }

    // Ensure that any content inside an aria-hidden pane is not focusable
    // (addresses axe: "Ensure aria-hidden elements are not focusable nor contain focusable elements")
    removeFocusableFromHiddenMapPanes();
  }

  // Debounced redraw on zoomend/moveend
  let _redrawTimer = null;
  function debouncedRedrawCurves() {
    if (_redrawTimer) clearTimeout(_redrawTimer);
    _redrawTimer = setTimeout(() => {
      lines.forEach(l => {
        try { if (typeof l.redraw === 'function') l.redraw(); } catch (e) { /* ignore */ }
      });
      forceSvgOverflow();
      // Re-apply EU country colours after Leaflet redraws paths on zoom/pan,
      // which can reset inline styles set by clearMap() / styleCountry().
      reapplyCountryColors();
      // Re-apply partner-country colours on top of the EU baseline
      markers.forEach(m => {
        if (m && m.options && m.options._partnerCountry) {
          styleCountry(m.options._partnerCountry);
        }
      });
      // Leaflet recreates path elements on zoom — re-neutralize non-interactive paths
      neutralizeNonInteractivePaths();
    }, 120);
  }

  // Apply overflow fix immediately after first draw
  forceSvgOverflow();

  map.on('zoom', updateAllCircleSizes);
  map.on('zoomend', debouncedRedrawCurves);
  map.on('moveend', debouncedRedrawCurves);
  zoomHandlers.push(updateAllCircleSizes);
  zoomHandlers.push(debouncedRedrawCurves);
}




function focusNextMapCurve(current) {
  const curves = Array.from(document.querySelectorAll('.map-curve'));
  const idx = curves.indexOf(current);
  if (idx === -1) return;
  const next = curves[idx + 1];
  if (next) next.focus();
  else {
    // no more curves -> focus the country info or map menu
    const fact = document.querySelector('#factSheet');
    const clearBtn = document.querySelector('#wt-button-clear');
    if (fact) fact.focus();
    else if (clearBtn) clearBtn.focus();
    else {
      const mapEl = document.querySelector('.wt-map-content') || document.querySelector('#map');
      if (mapEl) mapEl.focus();
    }
  }
}

function focusPrevMapCurve(current) {
  const curves = Array.from(document.querySelectorAll('.map-curve'));
  const idx = curves.indexOf(current);
  if (idx > 0) curves[idx - 1].focus();
  else {
    // focus back to the selected country path if present
    const selectedLabel = languageNameSpace.labels[REF.geo];
    const countryPath = Array.from(document.querySelectorAll('path[aria-label]')).find(p => p.getAttribute('aria-label').trim() === selectedLabel);
    if (countryPath) countryPath.focus();
  }
}

function focusFirstMapCurve() {
  // focus first curve if exists
  const first = document.querySelector('.map-curve');
  if (first) {
    first.focus();
    return true;
  }
  return false;
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

  // Spherical midpoint calculation (more robust than a simple average)
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
  const midLng = (toDeg(λm) + 540) % 360 - 180; // normalize to [-180,180]

  // Bearing from source to partner
  const y = Math.sin(λ2 - λ1) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(λ2 - λ1);
  const initialBearing = (toDeg(Math.atan2(y, x)) + 360) % 360;

  // Perpendicular bearing for arc peak
  const perpBearing = (initialBearing + 90) % 360;

  // Convert distance to approximate kilometers (1 degree ≈ 111 km)
  const distKm = distance * 111;

  // control distance from midpoint: larger for short lines, smaller for very long lines
  const arcHeightKm = Math.min(500, Math.max(25, 0.25 * distKm));

  // Destination from midpoint using bearing + offset (simple geodesic approximation)
  const R = 6371; // Earth radius km
  const δ = arcHeightKm / R;
  const θ = toRad(perpBearing);
  const φmRad = toRad(midLat);
  const λmRad = toRad(midLng);

  const φc = Math.asin(Math.sin(φmRad) * Math.cos(δ) + Math.cos(φmRad) * Math.sin(δ) * Math.cos(θ));
  const λc = λmRad + Math.atan2(Math.sin(θ) * Math.sin(δ) * Math.cos(φmRad), Math.cos(δ) - Math.sin(φmRad) * Math.sin(φc));

  const controlPoint = [toDeg(φc), (toDeg(λc) + 540) % 360 - 180];
  return controlPoint;
}



function styleCountry(partnerCountry) {
  const label = languageNameSpace.labels[partnerCountry];
  if (!label) return;
  const paths = document.querySelectorAll('path[aria-label]');
  for (let i = 0; i < paths.length; i++) {
    if (paths[i].getAttribute('aria-label').trim() === label) {
      paths[i].style.fill = partnersCtr;
      paths[i].style.stroke = 'white';
      paths[i].style.strokeWidth = '2px';
      // add title for screen readers / tooltips
      if (!paths[i].getAttribute('title')) paths[i].setAttribute('title', label);
      break; // Each country has one path, stop once found
    }
  }
}


const lines = [];
const markers = [];
const zoomHandlers = [];

// Function to clear lines
function clearLines() {
  lines.forEach(line => map.removeLayer(line));
  lines.length = 0;
}

// Function to clear markers and their zoom handlers
function clearMarkers() {
  // Remove all accumulated zoom/zoomend/moveend handlers
  zoomHandlers.forEach(handler => {
    map.off('zoom', handler);
    map.off('zoomend', handler);
    map.off('moveend', handler);
  });
  zoomHandlers.length = 0;

  markers.forEach(marker => map.removeLayer(marker));
  markers.length = 0;
}

// Remove role="button" / tabindex="0" from country paths that are NOT in defGeos.
// Webtools/Leaflet adds these attributes to every country path; non-interactive
// paths (e.g. Russia, China) have huge bounding boxes that the browser counts as
// interactive neighbours, collapsing the safe touch-target space around nearby
// UI buttons below the WCAG 2.5.8 minimum of 24 px.
function neutralizeNonInteractivePaths() {
  const geoLabelSet = new Set(defGeos.map(key => languageNameSpace.labels[key]));

  // Only target paths created by webtools (leaflet-interactive), not our own
  // curve / marker paths which must remain focusable.
  document.querySelectorAll('path.leaflet-interactive').forEach(path => {
    if (path.classList.contains('map-curve') ||
        path.classList.contains('map-marker') ||
        path.classList.contains('marker')) return;

    const label = (path.getAttribute('aria-label') || '').trim();
    if (!geoLabelSet.has(label)) {
      // Strip interactive attributes so the element is invisible to AT and
      // not counted as an interactive neighbour by touch-target audits.
      path.setAttribute('tabindex', '-1');
      path.setAttribute('aria-hidden', 'true');
      path.removeAttribute('role');
    }
  });
}

// Reusable helper: apply correct fill colours to all country paths in one DOM pass.
// EU countries → euCtr (blue), selected country → selectLayer (darker blue),
// everything else → transparent.  Never leaves EU paths in a transparent state.
function reapplyCountryColors() {
  const geoLabelMap = {};
  defGeos.forEach(key => { geoLabelMap[languageNameSpace.labels[key]] = key; });
  const selectedLabel = languageNameSpace.labels[REF.geo];

  // Paths without aria-label are curves / markers / UI paths — make transparent
  document.querySelectorAll('path:not([aria-label])').forEach((element) => {
    element.style.fill = 'transparent';
  });

  // Paths with aria-label are country polygons — set final colour in one pass
  // (EU countries never pass through transparent, avoiding flash-of-white).
  // Selected country is checked FIRST because it is also in defGeos; without
  // priority it would always get euCtr instead of the darker selectLayer.
  document.querySelectorAll('path[aria-label]').forEach((element) => {
    const countryName = element.getAttribute('aria-label').trim();
    if (selectedLabel && countryName === selectedLabel) {
      element.style.fill = selectLayer;
      element.style.stroke = 'white';
      element.style.strokeWidth = '2px';
    } else if (geoLabelMap[countryName]) {
      element.style.fill = euCtr;
      element.style.stroke = '#4b598b';
      element.style.strokeWidth = '2px';
    } else {
      element.style.fill = 'transparent';
    }
  });
}

function clearMap() {
  // Remove all trade curves and circle markers (also empties the arrays and
  // detaches zoom handlers so they don't accumulate across selections).
  clearLines();
  clearMarkers();

  // Apply colours in a single pass — EU paths go straight to blue, never transparent
  reapplyCountryColors();

  // Build geoLabelMap for tooltip styling below
  const geoLabelMap = {};
  defGeos.forEach(key => { geoLabelMap[languageNameSpace.labels[key]] = key; });

  // Single pass over tooltips
  const tooltipElements = document.querySelectorAll('div.leaflet-tooltip.wtLabelFix.leaflet-zoom-animated.leaflet-tooltip-top');
  tooltipElements.forEach((element) => {
    const text = element.textContent.trim();
    for (const label in geoLabelMap) {
      if (text.includes(label)) {
        element.style.setProperty('color', '#fff', 'important');
        break;
      }
    }
  });
}


// Accessibility helper: ensure focusable elements inside aria-hidden map panes are not tabbable
function removeFocusableFromHiddenMapPanes(root = document) {
  try {
    // Select map-related panes that may be aria-hidden by Leaflet/webtools
    const hiddenPanes = Array.from(root.querySelectorAll('.leaflet-pane[aria-hidden="true"], .leaflet-overlay-pane[aria-hidden="true"], .leaflet-subOverlay-pane[aria-hidden="true"]'));
    hiddenPanes.forEach(pane => {
      // Generic focusable selector (covers anchors, controls and elements with tabindex >= 0)
      const focusableSelector = '[tabindex]:not([tabindex="-1"]), a[href], button, input, select, textarea, iframe, object, embed, [contenteditable="true"], [role="button"]';
      pane.querySelectorAll(focusableSelector).forEach(el => {
        // only neutralise elements that would otherwise be reachable
        el.setAttribute('tabindex', '-1');
        // for SVG elements, mark as not focusable in some browsers
        if (el instanceof SVGElement) el.setAttribute('focusable', 'false');
      });

      // Leaflet often sets tabindex on SVG <path> directly — ensure those are non-focusable
      pane.querySelectorAll('path[tabindex]').forEach(p => p.setAttribute('tabindex', '-1'));
    });
  } catch (e) {
    // fail silently; accessibility fix is best-effort
    console.warn('removeFocusableFromHiddenMapPanes error', e);
  }
}

// Function to clear both lines and markers
function clearLinesAndMarkers() {
  clearLines();
  clearMarkers();
  clearMap()
}



function getCountryCoordinates(countryCode) {
  const feature = coords[0].features.find(feature => feature.properties.CNTR_ID === countryCode);
  if (feature) {
    const coordinates = feature.geometry.coordinates;
    // Swap the coordinates
    const swappedCoordinates = [coordinates[1], coordinates[0]];
    return swappedCoordinates;
  } else {
    console.error(`Coordinates not found for country code: ${countryCode}`);
    return [0, 0]; // Return a default value or handle accordingly
  }
}


function lineTooltip(partnerCountry, value , countryNAme) {

  // Use trade mode label (import/export) instead of static dataset label for tooltip header.
  const title = languageNameSpace.labels[REF.trade] || languageNameSpace.labels[REF.dataset] || '';
  const countryOne = REF.trade === "imp" ? languageNameSpace.labels[partnerCountry] : languageNameSpace.labels[countryNAme];
  const countryTwo = REF.trade === "imp" ? languageNameSpace.labels[countryNAme] : languageNameSpace.labels[partnerCountry];
  const orientation = REF.trade === "imp" ? "&#8592" : "&#8594";
  const labelFuel = languageNameSpace.labels[REF.fuel] || '';
  const countryValue = value.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  const unit = languageNameSpace.labels["abr_"+REF.unit]
  const icon = REF.fuel
  const flag = partnerCountry

  const tooltipContent = `
  <div class="pop-card pop-card--solid">
    <div class="pop-card__header">
      <div class="pop-card__icon-wrap">
        <img src="img/fuel-family/${icon}.png" alt="${labelFuel}">
      </div>
      <div class="pop-card__titles">
        <span class="pop-card__label">${title}</span>
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
  </div>`
  return tooltipContent  
}


function countryInfoMenu(country) {
  const countryContent = `
  <div id="countryInfo">
    <button id="factSheet"
            class="ecl-button ecl-button--cta factBtn"
            type="button"
            onclick="openFactSheet()"
            title="${languageNameSpace.labels["FACTSHEET"]}"
            aria-label="${languageNameSpace.labels["FACTSHEET"]}">
      ${languageNameSpace.labels["FACTSHEET"]}
    </button>
  </div>
`;

  return countryContent;
}



// function to set the PolylinesTickness of the polylines on the map acording to the values of the countries
function calculateWeight(partners, value) {
	const values = partners.map(item => item[1]);
  
	const minValue = Math.min(...values);
	const maxValue = Math.max(...values);
	const maxWeight = 14;
	const minWeight = 2;
	const pixelLength = 2;
  
	if (minValue === maxValue) {
	  return minWeight;
	}
  
	const factor = (maxWeight - minWeight) / (maxValue - minValue);
	const weight = Math.round((factor * value) + pixelLength);
  if(weight > maxWeight) return maxWeight;
	return weight;
  }
  
  function calculateRadius(partners, value) {
    const values = partners.map(item => item[1]);
  
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const maxRadius = 35000;
    const minRadius = 20000;

    if (minValue === maxValue) {
        return minRadius; // Corrected variable name from `minWeight` to `minRadius`
    }

    const factor = (maxRadius - minRadius) / (maxValue - minValue);
    let radius = Math.round(factor * (value - minValue) + minRadius); // Adjusted formula to start from minRadius
    radius = Math.min(radius, maxRadius); // Ensuring radius doesn't exceed maxRadius
    return radius;
}

  function poliColorChange() {
    const fuelColors = {
      solid: 'rgba(128, 0, 0, 0.73)',
      oil: 'rgba(20, 55, 90, 0.73)',
      gas: 'rgba(250, 165, 25, 0.73)',
      biofuels: 'rgba(95, 180, 65, 0.73)',
      electricity: 'rgba(215, 60, 65, 0.73)',
    };
  
    // return fuelColors[REF.fuel] || 'rgb(204 163 0 / 85%)';
    return 'rgb(204 163 0)';
  }

  



function chartContainerStatus() {
  const chartContainer = document.querySelector('#chartContainer');
  isOpenChartContainer = chartContainer && window.getComputedStyle(chartContainer).display !== 'none' ? true : false;
}