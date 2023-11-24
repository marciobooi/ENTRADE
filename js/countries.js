let countryTotal = 0;
let coords = []; // Declare coords at the global scope
let map; // Initialize the map variable

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
      center: [50, 10],
      smoothZoom: true,
      zoom: 4,
      continuousWorld: true,
      worldCopyJump: true,
      inertia: true,
      smoothFactor: 1,
      language: REF.language,
      background: ["osmec"],
      height: "84vh",
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
              if (Object.keys(geoCountries).includes(layer.feature.properties.CNTR_ID)) {
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
                fillColor: '#0b39a2', 
                color: 'white', 
              });
              }
            },
            tooltip: {
              content: "<b>{CNTR_NAME}</b>",
              options: {
                direction: "bottom",
                sticky: true
              }
            }
          },
          label: {
            mode: "fixed",
            language: REF.language
          },
          style: {
            color: "transparent",
            weight: 1,
            opacity: 1,
            fillColor: "transparent",
            fillOpacity: 1
          },
        }
      }]
    }
  }).ready(function (mapInstance) {
    map = mapInstance; // Update the global map variable
    Object.keys(geoCountries).forEach(key => {    
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
  });
}

function loadCountryData(country) {  
  REF.dataset = dataNameSpace.dataset;
  REF.geo = country.CNTR_ID;
  REF.chart = "map"

  d = chartApiCall();

  partners = countriesDataHandler(d);
  countryInfo(country);
  drawLines(country, partners);
  getTitle()
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

 
  clearLinesAndMarkers();

  partners.forEach(partner => {
    const partnerCountry = partner[0];
    const value = partner[1];
    const sourceCoords = sourceCountry.CENTROID;
    const partnerCoords = getCountryCoordinates(partnerCountry);
    const countryNAme = sourceCountry.CNTR_ID




    const curvePoint = getMidpoint(sourceCoords, partnerCoords);    

    const line = L.curve([ "M", sourceCoords, "Q", curvePoint, partnerCoords], {
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
      const tooltipContent = lineTooltip(partnerCountry, value, countryNAme )  
    this.bindTooltip(tooltipContent, { sticky: true }).openTooltip();
    })
    .on('mouseout', function (event) {
      this.closeTooltip();
    }).addTo(map);

    const marker = L.marker(partnerCoords).addTo(map)
    .bindPopup(lineTooltip(partnerCountry, value, countryNAme ))
    .on('mouseover', function (e) { this.openPopup();})
    .on('mouseout', function (e) {this.closePopup();});

    lines.push(line);
    markers.push(marker);
    styleCountry(partnerCountry)
  });

}

function getMidpoint(sourceCoords, partnerCoords) {
  const sourceLat = sourceCoords[0];
  const sourceLng = sourceCoords[1];
  const partnerLat = partnerCoords[0];
  const partnerLng = partnerCoords[1];

  // Calculate the midpoint
  const midLat = (sourceLat + partnerLat) / 2;
  const midLng = (sourceLng + partnerLng) / 2;
  curveFactor = 1.1

  // Use the midpoint as the control point for the quadratic Bezier curve
  const controlPoint = [midLat * curveFactor, midLng * curveFactor];

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


  Object.keys(geoCountries).forEach(key => {    
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


// Assuming there's a function to get coordinates for each country
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
  const countryOne = REF.trade = "imp" ? languageNameSpace.labels[partnerCountry] : languageNameSpace.labels[countryNAme]
  const countryTwo = REF.trade = "imp" ?  languageNameSpace.labels[countryNAme] : languageNameSpace.labels[partnerCountry]
  const orientation = "&#8594" 
  const fuel = languageNameSpace.labels[REF.fuel]
  const countryValue = value.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  const unit = languageNameSpace.labels["abr_"+REF.unit]
  const icon = REF.fuel
  const flag = partnerCountry

  const tooltipContent = `
  <div id="popCard">
  <div id="sectionOne">
    <img id="popImg" src="img/fuel-family/${icon}.png" alt="">
    <p id="popDescription">${fuel}</p>
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
  
	return weight;
  }


  function poliColorChange() {
    const fuelColors = {
      solid: 'rgba(128, 0, 0, 0.73)',
      oil: 'rgba(20, 55, 90, 0.73)',
      gas: 'rgba(250, 165, 25, 0.73)',
      biofuels: 'rgba(95, 180, 65, 0.73)',
      electricity: 'rgba(215, 60, 65, 0.73)',
    };
  
    return fuelColors[REF.fuel] || 'rgba(0, 0, 0, 0.73)';
  }


  function openFactSheet(params) {
    const mapcontainer = document.querySelector(".wt-map-content");
    
    if (mapcontainer) {
      mapcontainer.style.width = "50%";
        map.setView([50, 70], 3);
        $('#countryInfo').remove();
        $('#map').removeClass('col-12').addClass('col-6')
    } else {
        console.error("Map element not found.");
    }

    $('#chartContainer').removeClass('col-0').addClass('col-6').css('display', 'block')

    addChartOptions()
    createPieChart()


}