let countryTotal = 0;
let coords = []; // Declare coords at the global scope
let map; // Initialize the map variable
let isOpenChartContainer
let mapCenterCoords

// Fetch coordination data asynchronously
fetch("data/data.json")
  .then(response => response.json())
  .then(data => {
    coords.push(data);

    // Render the map after coordination data is loaded
    renderMap();
  })
  .catch(error => console.error('Error loading coordination data:', error));

function renderMap() {
  map = $wt.map.render({
    map: {
      scrollWheelZoom: true,
      center: [50, 10],
      smoothZoom: true,
      zoom: 4,
      continuousWorld: true,
      worldCopyJump: true,
      inertia: true,
      smoothFactor: 1,
      language: REF.language,
      background: ["osmec"],
      height: "86vh",
      width: "100%",
      maxBounds: [
        [-90, -Infinity],
        [90, Infinity]
      ],
    },
    layers: {
      countries: [{
        data: ["all"],
        options: {
          events: {
            click: function (layer) {    
              if (defGeos.includes(layer.feature.properties.CNTR_ID)) {
                const country = layer.feature.properties;
                loadCountryData(country);    
                $('path:has(desc b)').each(function () {
                  const countryName = $(this).find('desc b').text().trim();
                  if (countryName === country.CNTR_NAME) {
                    $(this).css('fill', '#0b39a2'); 
                    $(this).css('stroke', '#fff'); 
                    $(this).css('stroke-width', '2'); 
                  }
              });
              layer.setStyle({
                fillColor: 'red', 
                color: 'white', 
              });
              }
            },
            tooltip: {
              content: "<b>{CNTR_NAME}</b>",
              options: {
                direction: "top",
                sticky: true
              }
            }
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
              defGeos.forEach(key => {    
                  $('path:has(desc b)').each(function () {
                    const countryName = $(this).find('desc b').text().trim();
                    if (countryName == languageNameSpace.labels[key]) {
                      // log(countryName, languageNameSpace.labels[key])
                      $(this).css('fill', '#738ce5'); 
                      $(this).css('stroke', 'black'); 
                      // $(this).css('stroke-width', '.5px');
                    }       
                });
              const elementsWithClasses = $('div.leaflet-tooltip.wtLabelFix.leaflet-zoom-animated.leaflet-tooltip-top');
        
              // Iterate through the found elements
              elementsWithClasses.each(function () {
                // Check inner text
                const countryName = $(this).text().trim();
              
                // Check if the inner text matches the desired name
                if (countryName.includes(languageNameSpace.labels[key])) {         
                  // Change the color property of the div element with !important
                  this.style.setProperty('color', '#fff', 'important');
                }
              });
              
            });    
      }, 300);
  });
}

function loadCountryData(country) {  
  REF.dataset = REF.dataset;
  REF.geo = country.CNTR_ID;
  REF.chart = "map"

  d = chartApiCall();

  partners = countriesDataHandler(d);
  countryInfo(country);
  drawLines(country, partners);
  getTitle()
  chartContainerStatus()
  if (isOpenChartContainer) {
    $('#countryInfo').remove()
    removeChartOptions()  
    openFactSheet()
  }
}

function openFactSheet(country) {

  log(mapCenterCoords)

  const mapcontainer = document.querySelector(".wt-map-content");
  
  if (mapcontainer) {

      mapcontainer.style.width = "50%";
      map.setView([mapCenterCoords.CENTROID[0], mapCenterCoords.CENTROID[1] + 30], 4);
  
      $('#countryInfo').remove();
      $('#map').removeClass('col-12').addClass('col-6')
  } else {
      console.error("Map element not found.");
  }

  $('#chartContainer').removeClass('col-0').addClass('col-6').css('display', 'block')

  addChartOptions()
  // createTableChart()
  createDepChart()


}

function countriesDataHandler(d) {

  if (d === null) {
    return []; // Return an empty array if the input is null
  }

  const partnerIds = d.Dimension("partner").id;

  const partners = partnerIds.map((currentPartnerId, index) => {
    if (!excludedPartners.includes(currentPartnerId) && d.value[index] > 0) {
      return [currentPartnerId, d.value[index]]
    }
    return null;
  }).filter(partner => partner !== null);

  countryTotal = Math.floor(partners.reduce((acc, currentValue) => acc + currentValue[1], 0));

  return partners;
}

function countryInfo(country) {
  $('#countryInfo').remove();
  countryInfoContent = countryInfoMenu(country)
  $("#map").append(countryInfoContent);
}

function closeInfo(params) {
  $('#countryInfo').remove();
  clearLinesAndMarkers();
}

function drawLines(sourceCountry, partners) {
  if (!map) {
    console.error('Map not initialized.');
    return;
  }

  mapCenterCoords = sourceCountry;

  clearLinesAndMarkers();

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

    const radius = calculateRadius(partners, value); // Declare radius outside forEach loop

    const marker = L.circle(partnerCoords, {
      color: 'rgb(170 95 24)', // Set the color of the circle's border to transparent
      fillColor: 'rgb(170 95 24)', // Set the fill color of the circle
      fillOpacity: 1, // Set the opacity of the fill color
      radius: radius // Set the radius of the circle in meters
    }).addTo(map)
    .bindPopup(lineTooltip(partnerCountry, value, countryName))
    .on('mouseover', function (e) { this.openPopup(); })
    .on('mouseout', function (e) { this.closePopup(); });

    // Function to update circle sizes based on current zoom level
    function updateCircleSize() {
      const zoomLevel = map.getZoom();
      const scale = Math.pow(2, 5 - zoomLevel); // Adjust the power according to your starting zoom level
      const newRadius = radius * scale; // Adjust radius based on zoom level
      marker.setRadius(newRadius);
    }

    // Listen for 'zoom' event on the map and update circle size
    map.on('zoom', updateCircleSize);

    lines.push(line);
    markers.push(marker);
    styleCountry(partnerCountry);
  });
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

  log(distance, curveFactor)

  // Calculate the midpoint
  const midLat = (sourceLat + partnerLat) / 2;
  const midLng = (sourceLng + partnerLng) / 2;

  // Use the midpoint as the control point for the quadratic Bezier curve, multiplied by the curve factor
  const controlPoint = [midLat + curveFactor, midLng + curveFactor];

  return controlPoint;
}



function styleCountry(partnerCountry) {

$('path:has(desc b)').each(function () {
  // Get the text content of the descendant b element
  var countryName = $(this).find('desc b').text().trim();

  // Check if the countryName matches the desired name (replace 'NAME' with the actual name)
  if (countryName === languageNameSpace.labels[partnerCountry]) {
    // Change the fill property of the path element
    $(this).css('fill', '#17256b'); // Change '#ff0000' to the desired fill color
  }
});
}


const lines = [];
const markers = [];

// Function to clear lines
function clearLines() {
  lines.forEach(line => map.removeLayer(line));
  lines.length = 0; // Clear the lines array
}

// Function to clear markers
function clearMarkers() {
  markers.forEach(marker => map.removeLayer(marker));
  markers.length = 0; // Clear the markers array
}

function clearMap() {

  $('path').each(function () {    
      $(this).css('fill', 'transparent');    
});


defGeos.forEach(key => {    
    $('path:has(desc b)').each(function () {
      const countryName = $(this).find('desc b').text().trim();
      if (countryName === languageNameSpace.labels[key]) {
        $(this).css('fill', '#738ce5'); 
        $(this).css('stroke', '#444'); 
      }
  });

const elementsWithClasses = $('div.leaflet-tooltip.wtLabelFix.leaflet-zoom-animated.leaflet-tooltip-top');

  // Iterate through the found elements
  elementsWithClasses.each(function () {
    // Check inner text
    var countryName = $(this).text().trim();
  
    // Check if the inner text matches the desired name
    if (countryName.includes(languageNameSpace.labels[key])) {         
      // Change the color property of the div element with !important
      this.style.setProperty('color', '#fff', 'important');
    }
  });
  
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
    <img id="popImg" src="img/fuel-family/${icon}.png" alt="">
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
  <header style="text-align: center;">
    <div id="countryInfoHeader">
      <img src="img/country_flags/${country.CNTR_ID.toLowerCase()}.webp" alt="${country.CNTR_NAME} Flag">
      <h3>${country.CNTR_NAME}</h3>
    </div>
  </header>
  <section>
    <p>Total: ${countryTotal.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} ${languageNameSpace.labels["abr_"+REF.unit]}</p>
    <nav>
      <button title="Close" type="button" onclick="closeInfo()" class="btn btn-primary min-with--nav">Close</button>
      <button id="factSheet" title="Open factSheet" type="button" onclick="openFactSheet()" class="btn btn-primary min-with--nav">open factsheet</button>
    </nav>
  </section>
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
  isOpenChartContainer = ($('#chartContainer').css('display') === 'none') ? false : true;
}