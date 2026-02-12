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
      // scrollWheelZoom: true,
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
      scrollWheelZoom: false, smoothWheelZoom: true, smoothSensitivity: 2,
      smoothFactor: 1,
      language: REF.language,
      background : ["positron_background"],
      height: "60vh",
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
              },
            },
          },
          label: {
            mode: "fixed",
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
      }, 500);
  });
}




function addClearToMenu() {
  const icon = '<i class="fas fa-eraser"></i>';
  const content = `<button class="wt-btn clear" name="clear" id="wt-button-clear" aria-label="clear" type="button">
  <b class="wt-noconflict"></b>
  <span class="wt-noconflict">Clear map</span>
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


function loadCountryData(country) {  
  REF.dataset = REF.dataset;  // Consider whether this line is necessary if you're not changing anything
  REF.geo = country.CNTR_ID;
  REF.chart = "map";

  // Assuming chartApiCall returns an object with a 'value' property
  let d = chartApiCall();

  let values = d.value;
  let allZero = values.every(value => value === 0);
  let allNull = values.every(value => value === null);
  let allUndefined = values.every(value => typeof value === 'undefined');

  if (allZero || allNull || allUndefined) {

    let content = /*html*/`
    <div class="alert-popup">
        <div style="display: flex; align-items: center; margin-right: 16px;">
            <i class="fas fa-exclamation-triangle" style="color: #ffcc00; margin-right: 8px;"></i>
            <p style="display: inline-block; margin: 0;">${languageNameSpace.labels['NODATA']}</p>
        </div>
        <div>
            <button type="button" class="btn btn-outline-danger btn-sm" id="closeAlertPopup" aria-label="Close">
                <i class="fas fa-times"></i>
            </button>
        </div>
    </div>
`;

  document.body.insertAdjacentHTML('beforeend', content);

  // Function to remove the alert popup
  function removeAlertPopup() {
    const popup = document.querySelector('.alert-popup');
    if (popup) popup.remove();
  }

  // Set timeout to auto-destroy the alert after 3 seconds
  setTimeout(removeAlertPopup, 3000);

  // Add a click event listener to close the alert popup manually
  const closeBtn = document.querySelector('#closeAlertPopup');
  if (closeBtn) {
    closeBtn.addEventListener('click', removeAlertPopup);
  }




  } else {
    let partners = countriesDataHandler(d);
    countryInfo(country);
    drawLines(country, partners);
    getTitle();
    chartContainerStatus();

    if (isOpenChartContainer) {
      const countryInfo = document.querySelector('#countryInfo');
      if (countryInfo) countryInfo.remove();
      removeChartOptions();
      openFactSheet();
    }
  }
}


function openFactSheet(country) {
  const chartContainer = document.querySelector('#chartContainer');
  if (!chartContainer) {
    console.error('chartContainer not found');
    return;
  }

  // Only initialize and show the chart container if it's currently empty
  const isEmpty = chartContainer.innerHTML.trim() === '' && window.getComputedStyle(chartContainer).display === 'none';
  if (!isEmpty) return; // already open — nothing to do


  chartContainer.style.display = 'block';

  // initialize content
  addChartOptions();
  createTableChart();
  getTitle();
  disableBtns();

  isOpenChartContainer = true;
}



function countriesDataHandler(d) {

  if (d === null) {
    return []; // Return an empty array if the input is null
  }

  const partnerIds = d.Dimension("partner").id;

  let partners = partnerIds.map((currentPartnerId, index) => {
    if (!excludedPartners.includes(currentPartnerId) && d.value[index] > 0) {
      return [currentPartnerId, d.value[index]]
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
      this.bindTooltip(tooltipContent, { sticky: true }).openTooltip();
    }).on('mouseout', function (event) {
      this.closeTooltip();
    }).addTo(map);

    const radius = calculateRadius(partners, value);
    markerRadii.push(radius);

    const marker = L.circle(partnerCoords, {
      color: 'rgb(170 95 24)', // Set the color of the circle's border to transparent
      fillColor: 'rgb(170 95 24)', // Set the fill color of the circle
      fillOpacity: 1, // Set the opacity of the fill color
      radius: radius // Set the radius of the circle in meters
    }).addTo(map)
    .bindPopup(lineTooltip(partnerCountry, value, countryName))
    .on('mouseover', function (e) { this.openPopup(); })
    .on('mouseout', function (e) { this.closePopup(); });

    marker._path.classList.add('marker');

    lines.push(line);
    markers.push(marker);
    styleCountry(partnerCountry);
  });

  // Single zoom handler for ALL markers (instead of one per marker)
  function updateAllCircleSizes() {
    const zoomLevel = map.getZoom();
    const scale = Math.pow(2, 5 - zoomLevel);
    markers.forEach((m, i) => {
      const r = markerRadii[i];
      if (r !== undefined) {
        m.setRadius(r * scale);
      }
    });
  }

  map.on('zoom', updateAllCircleSizes);
  zoomHandlers.push(updateAllCircleSizes);
}




function getMidpoint(sourceCoords, partnerCoords) {
  const sourceLat = sourceCoords[0];
  const sourceLng = sourceCoords[1];
  const partnerLat = partnerCoords[0];
  const partnerLng = partnerCoords[1];

  // Calculate the distance between source and partner coordinates
  const distance = Math.sqrt(Math.pow(partnerLat - sourceLat, 2) + Math.pow(partnerLng - sourceLng, 2));

  // Adjust the curve factor based on the distance using a logarithmic function
  const curveFactor = distance > 35 ? Math.log(distance + 1) * 3.5 : 1.1  

  // Calculate the midpoint
  const midLat = (sourceLat + partnerLat) / 2;
  const midLng = (sourceLng + partnerLng) / 2;

  // Use the midpoint as the control point for the quadratic Bezier curve, multiplied by the curve factor
  const controlPoint = [midLat + curveFactor, midLng + curveFactor];

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
  // Remove all accumulated zoom handlers
  zoomHandlers.forEach(handler => map.off('zoom', handler));
  zoomHandlers.length = 0;

  markers.forEach(marker => map.removeLayer(marker));
  markers.length = 0;
}

function clearMap() {
  document.querySelectorAll('path').forEach((element) => {    
    element.style.fill = 'transparent';    
  });

  // Build a lookup map for defGeos labels to avoid repeated lookups
  const geoLabelMap = {};
  defGeos.forEach(key => { geoLabelMap[languageNameSpace.labels[key]] = key; });
  const selectedLabel = languageNameSpace.labels[REF.geo];

  // Single pass over all labelled paths
  document.querySelectorAll('path[aria-label]').forEach((element) => {
    const countryName = element.getAttribute('aria-label').trim();

    if (geoLabelMap[countryName]) {
      element.style.fill = euCtr;
      element.style.stroke = '#4b598b';
      element.style.strokeWidth = '2px';
    } else if (countryName === selectedLabel) {
      element.style.fill = selectLayer;
      element.style.stroke = 'white';
      element.style.strokeWidth = '2px';
    }
  });

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

  markers.forEach(function(marker) {
    map.removeLayer(marker);
  });
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

  const title = languageNameSpace.labels[REF.dataset]
  const countryOne = REF.trade == "imp" ? languageNameSpace.labels[partnerCountry] : languageNameSpace.labels[countryNAme]
  const countryTwo = REF.trade == "imp" ?  languageNameSpace.labels[countryNAme] : languageNameSpace.labels[partnerCountry]
  const orientation = "&#8594" 
  const labelFuel = languageNameSpace.labels[REF.fuel]
  const countryValue = value.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  const unit = languageNameSpace.labels["abr_"+REF.unit]
  const icon = REF.fuel
  const flag = partnerCountry

  const tooltipContent = `
  <div id="popCard">
  <div id="sectionOne">
    <img id="popImg" src="img/fuel-family/${icon}.png" alt="fuel-family ${icon}">
    <p id="popDescription">${labelFuel}</p>
  </div>
  <hr class="vertical-hr">
  <div id="sectionTwo">
    <h5 id="popTitle">${title}</h5>
    <h6 id="popSubtitle">${countryOne} ${orientation} ${countryTwo}</h6>            
    <p id="popValue">${countryValue} ${unit}</p>
  </div>
</div>`
  return tooltipContent  
}


function countryInfoMenu(country) {
  const countryContent = `
  <div id="countryInfo">
    <button id="factSheet" 
            class="ecl-button ecl-button--cta" 
            type="submit"
            onclick="openFactSheet()"
            title="${languageNameSpace.labels["FACTSHEET"]}"
            >
            ${languageNameSpace.labels["FACTSHEET"]}
    </button>
</div>
`;

return countryContent
  
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