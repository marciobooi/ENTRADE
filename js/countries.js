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
                log(true)
                const country = layer.feature.properties;
                loadCountryData(country);    
                $('path:has(desc b)').each(function () {
                  const countryName = $(this).find('desc b').text().trim();
                  if (countryName === country.CNTR_NAME) {
                    $(this).css('fill', '#0b39a2'); 
                    $(this).css('stroke', '#fff'); 
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
  dataset = dataNameSpace.dataset;
  REF.geo = country.CNTR_ID;

  log(dataset)

  url = "https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/" + dataset + "?";
  url += "format=JSON";
  url += "&lang=" + REF.language;
  url += "&geo=" + REF.geo;
  url += "&siec=" + REF.siec;
  url += "&unit=" + REF.unit;
  url += "&time=" + REF.year;

  d = JSONstat(url).Dataset(0);
   partners = countriesDataHandler(d);
  countryInfo(country);
  drawLines(country, partners);
}

function countriesDataHandler(d) {
  const excludedPartners = ["AFR_OTH", "AME_OTH", "ASI_NME_OTH", "ASI_OTH", "EUR_OTH", "EX_SU_OTH", "NSP", "TOTAL"];

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




    const line = L.polyline([sourceCoords, partnerCoords], {
      color: 'red', // Set the desired line color
      weight: 2,
      opacity: 1,
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

  const title = languageNameSpace.labels[dataset]
  const partner = languageNameSpace.labels[partnerCountry]
  const sourceCountryName = languageNameSpace.labels[countryNAme]
  const orientation = REF.trade = "imp" ? "&#8594" : "&#8592"
  const fuel = languageNameSpace.labels[REF.fuel]
  const countryValue = value.toFixed(0)
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
    <h6 id="popSubtitle">${partner} ${orientation} ${sourceCountryName}</h6>            
    <p id="popValue">${countryValue} ${unit}</p>
  </div>
</div>`
  return tooltipContent  
}


function countryInfoMenu(country) {
  const countryContent = `
  <div id="countryInfo">
    <div style="text-align: center;">
      <div id="countryInfoHeader">
        <img src="img/country_flags/${country.CNTR_ID.toLowerCase()}.webp" alt="${country.CNTR_NAME} Flag">
        <h3>${country.CNTR_NAME}</h3>
      </div>
      <p>Total: ${countryTotal} ${languageNameSpace.labels["abr_"+REF.unit]}</p>
      <button title="factSheet" type="button" onclick="closeInfo()" class="btn btn-primary min-with--nav">Close</button>
      <button id="factSheet" title="factSheet" type="button" onclick="openFactSheet()" class="btn btn-primary min-with--nav">factsheet</button>
    </div>
  </div>
`;

return countryContent
  
}