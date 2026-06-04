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

            // If a country was already selected before the language change,
            // re-draw its trade lines now that the map is ready.
            if (REF.geo) {
              fireOnStart(REF.geo);
            }

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

  let partners = countriesDataHandler(d);

  if (!partners.length) {
    // Delegate to the shared popup helper (also calls clearMap and manages focus).
    showNoDataPopup();
  } else {
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
  REF.chart = "tableChart";
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
  const selectedYearValues = getPartnerValuesForYear(d, REF.year);

  const MIN_LINE_VALUE = 0.5; // use 0.001 or 0.1 to avoid tiny lines if needed

  let partners = partnerIds.map((currentPartnerId, index) => {
    let raw = selectedYearValues[index];
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
    value > 0.000001
  );
}

function createMapFeatureLabel(partnerCountry, value) {
  const countryLabel = languageNameSpace?.labels?.[partnerCountry] || partnerCountry;
  const unitLabel = languageNameSpace?.labels?.[`abr_${REF.unit}`] || REF.unit || '';

  return `${countryLabel} — ${value} ${unitLabel}`;
}

function debounce(callback, delay = 120) {
  let timer = null;

  return function debouncedFunction(...args) {
    if (timer) {
      clearTimeout(timer);
    }

    timer = setTimeout(() => {
      callback.apply(this, args);
    }, delay);
  };
}

function registerMapHandler(eventName, handler) {
  map.on(eventName, handler);

  zoomHandlers.push({
    eventName,
    handler
  });
}

function clearZoomHandlers() {
  if (!map || !Array.isArray(zoomHandlers)) return;

  zoomHandlers.forEach(item => {
    if (typeof item === 'function') {
      map.off('zoomend', item);
      map.off('moveend', item);
    } else if (item?.eventName && item?.handler) {
      map.off(item.eventName, item.handler);
    }
  });

  zoomHandlers.length = 0;
}

function forceSvgOverflow() {
  const pane = document.querySelector('.leaflet-overlay-pane');

  if (pane) {
    pane.querySelectorAll('svg').forEach(svg => {
      svg.style.overflow = 'visible';
    });

    pane.querySelectorAll('g').forEach(group => {
      group.removeAttribute('clip-path');
    });
  }

  removeFocusableFromHiddenMapPanes();
}

function makeCurveAccessible(line, label) {
  try {
    const pathEl = line?._path;
    if (!pathEl) return;

    pathEl.classList.add('map-curve');
    pathEl.setAttribute('tabindex', '0');
    pathEl.setAttribute('focusable', 'true');
    pathEl.setAttribute('role', 'link');
    pathEl.setAttribute('aria-label', label);
    pathEl.setAttribute('title', label);

    pathEl.addEventListener('keydown', ev => {
      const key = ev.key;

      if (key === 'Enter' || key === ' ' || ev.keyCode === 13 || ev.keyCode === 32) {
        ev.preventDefault();

        try {
          line.openTooltip();
        } catch {
          // best-effort
        }
      }

      if (key === 'ArrowRight' || ev.keyCode === 39) {
        ev.preventDefault();
        focusNextMapCurve(pathEl);
      }

      if (key === 'ArrowLeft' || ev.keyCode === 37) {
        ev.preventDefault();
        focusPrevMapCurve(pathEl);
      }
    });
  } catch {
    // accessibility is best-effort
  }
}

function makeMarkerAccessible(marker, label) {
  try {
    const pathEl = marker?._path;
    if (!pathEl) return;

    pathEl.classList.add('map-marker', 'marker');
    pathEl.setAttribute('tabindex', '0');
    pathEl.setAttribute('focusable', 'true');
    pathEl.setAttribute('role', 'button');
    pathEl.setAttribute('aria-label', label);
    pathEl.setAttribute('title', label);

    pathEl.addEventListener('keydown', ev => {
      if (ev.key === 'Enter' || ev.key === ' ' || ev.keyCode === 13 || ev.keyCode === 32) {
        ev.preventDefault();
        marker.openPopup();
      }
    });
  } catch {
    // accessibility is best-effort
  }
}

function createPartnerCurve({
  sourceCoords,
  partnerCoords,
  partnerCountry,
  value,
  tooltipContent,
  label,
  scale
}) {
  const zoom = map.getZoom();
  const curvePoint = getMidpoint(sourceCoords, partnerCoords);

  const line = L.curve(['M', sourceCoords, 'Q', curvePoint, partnerCoords], {
    color: poliColorChange(),
    weight: calculateWeight(scale, value, zoom),
    opacity: 1,
    animate: 1500,
    lineCap: 'round',
    smoothFactor: 1,
    noClip: true,
    outline: 'none',
    className: 'myClass',
    _partnerCountry: partnerCountry,
    _value: value
  })
    .bindTooltip(tooltipContent, {
      sticky: true,
      opacity: 1
    })
    .on('mouseover', function () {
      this.openTooltip();
    })
    .on('mouseout', function () {
      this.closeTooltip();
    })
    .addTo(map);

  makeCurveAccessible(line, label);

  return line;
}

function createPartnerMarker({
  partnerCoords,
  partnerCountry,
  value,
  tooltipContent,
  label,
  scale
}) {
  const zoom = map.getZoom();

  const marker = L.circle(partnerCoords, {
    color: 'rgb(170 95 24)',
    fillColor: 'rgb(170 95 24)',
    fillOpacity: 1,
    radius: calculateRadius(scale, value, zoom),
    _partnerCountry: partnerCountry,
    _value: value
  })
    .addTo(map)
    .bindPopup(tooltipContent, {
      className: 'pop-card-popup'
    })
    .on('mouseover', function () {
      this.openPopup();
    })
    .on('mouseout', function () {
      this.closePopup();
    });

  makeMarkerAccessible(marker, label);

  return marker;
}

function drawLines(sourceCountry, partners) {
  if (!map) {
    console.error('Map not initialized.');
    return;
  }

  if (!sourceCountry?.CENTROID || !Array.isArray(partners)) {
    console.warn('drawLines: invalid source country or partners data.', {
      sourceCountry,
      partners
    });
    return;
  }

  mapCenterCoords = sourceCountry;

  clearLinesAndMarkers();

  const sourceCoords = sourceCountry.CENTROID;
  const sourceCountryCode = sourceCountry.CNTR_ID;
  const validPartners = partners.filter(isValidPartner);
  const scale = createLeafletScaler(validPartners);

  validPartners.forEach(([partnerCountry, value]) => {
    const partnerCoords = getCountryCoordinates(partnerCountry);

    if (!partnerCoords) {
      console.warn(`drawLines: missing coordinates for partner country "${partnerCountry}".`);
      return;
    }

    const tooltipContent = lineTooltip(partnerCountry, value, sourceCountryCode);
    const label = createMapFeatureLabel(partnerCountry, value);

    const line = createPartnerCurve({
      sourceCoords,
      partnerCoords,
      partnerCountry,
      value,
      tooltipContent,
      label,
      scale
    });

    const marker = createPartnerMarker({
      partnerCoords,
      partnerCountry,
      value,
      tooltipContent,
      label,
      scale
    });

    lines.push(line);
    markers.push(marker);
    styleCountry(partnerCountry);
  });

  function updateFeatureSizes() {
    const zoom = map.getZoom();

    lines.forEach((line) => {
      const weight = calculateWeight(scale, line.options._value, zoom);
      line.setStyle({ weight });
    });

    markers.forEach((marker) => {
      const radius = calculateRadius(scale, marker.options._value, zoom);
      marker.setRadius(radius);
    });
  }

  const debouncedRedrawCurves = debounce(() => {
    lines.forEach(line => {
      try {
        if (typeof line.redraw === 'function') {
          line.redraw();
        }
      } catch {
        // best-effort redraw
      }
    });

    forceSvgOverflow();
    reapplyCountryColors();

    markers.forEach(marker => {
      const partnerCountry = marker?.options?._partnerCountry;

      if (partnerCountry) {
        styleCountry(partnerCountry);
      }
    });

    neutralizeNonInteractivePaths();
  }, 120);

  forceSvgOverflow();
  updateFeatureSizes();

  registerMapHandler('zoomend', updateFeatureSizes);
  registerMapHandler('zoomend', debouncedRedrawCurves);
  registerMapHandler('moveend', debouncedRedrawCurves);
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
  // Primary: find the SVG path via Leaflet layer (matches by CNTR_ID — immune
  // to label translation mismatches like "United States" vs "United States of America").
  let found = false;
  for (const layerId in map._layers) {
    const layer = map._layers[layerId];
    if (
      layer.feature &&
      layer.feature.properties &&
      layer.feature.properties.CNTR_ID === partnerCountry &&
      layer._path
    ) {
      layer._path.style.fill = partnersCtr;
      layer._path.style.stroke = 'white';
      layer._path.style.strokeWidth = '2px';
      found = true;
      // A country can have multiple polygons (e.g. islands) — style all of them
    }
  }
  if (found) return;

  // Fallback: match by translated label (works for countries whose GeoJSON name
  // matches the label exactly, e.g. Algeria → "Algeria").
  const label = languageNameSpace.labels[partnerCountry];
  if (!label) return;
  const paths = document.querySelectorAll('path[aria-label]');
  for (let i = 0; i < paths.length; i++) {
    if (paths[i].getAttribute('aria-label').trim() === label) {
      paths[i].style.fill = partnersCtr;
      paths[i].style.stroke = 'white';
      paths[i].style.strokeWidth = '2px';
      if (!paths[i].getAttribute('title')) paths[i].setAttribute('title', label);
      break;
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

// Function to clear markers
function clearMarkers() {
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
  clearLinesAndMarkers();

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
  }
}

// Function to clear both lines and markers
function clearLinesAndMarkers() {
  clearZoomHandlers();
  clearLines();
  clearMarkers();
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
    return null;
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

function createLeafletScaler(partners) {
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

function calculateWeight(scale, value, zoom) {
  const BASE_MIN = 1.5;
  const BASE_MAX = 10;

  const zoomFactor = Math.max(0.6, Math.min(1.8, zoom / 6));

  const minWeight = BASE_MIN * zoomFactor;
  const maxWeight = BASE_MAX * zoomFactor;

  return Math.round(scale(value, minWeight, maxWeight, "sqrt"));
}

function calculateRadius(scale, value, zoom) {
  const BASE_MIN = 5;
  const BASE_MAX = 25;

  const zoomFactor = Math.max(0.7, Math.min(2.0, zoom / 6));

  const minRadius = BASE_MIN * zoomFactor;
  const maxRadius = BASE_MAX * zoomFactor;

  return Math.round(scale(value, minRadius, maxRadius, "sqrt"));
}

function poliColorChange() {
  const fuelColors = {
    solid: 'rgba(128, 0, 0, 0.75)',
    oil: 'rgba(20, 55, 90, 0.75)',
    gas: 'rgba(250, 165, 25, 0.75)',
    biofuels: 'rgba(95, 180, 65, 0.75)',
    electricity: 'rgba(215, 60, 65, 0.75)',
  };

  return fuelColors[REF?.fuel] || 'rgba(204, 163, 0, 0.85)';
}





function chartContainerStatus() {
  const chartContainer = document.querySelector('#chartContainer');
  isOpenChartContainer = chartContainer && window.getComputedStyle(chartContainer).display !== 'none' ? true : false;
}