let countryTotal = 0


$wt.map.render({

  "map": {
    "center": [50, 10],
    "smoothZoom": true,
    "zoom": 4,
    "continuousWorld": true,
    "worldCopyJump": true,
    "inertia":true,
    "smoothFactor": 1,
    "language" : REF.language,
    "background": ["osmec"],
    "height": "84vh",
    "width": "100%",
    'maxBounds': [
      [-90, -Infinity],
      [90, Infinity]
  ],  
  },
  "layers": {
    "countries": [{
      "data": ["EU28", "KS*0"],
      // "data": ["EU28", "NZ","KS","ALL","PR", "XV", "XC", "XD", "XF", "XG", "XH", "GL"],        
      "options": {
        "events": {
          
          "click": function (layer) {
            const country = layer.feature.properties;
            loadCountryData(country)   
          },
          "tooltip" : {
            "content" : "<b>{CNTR_NAME}</b>",
            "options" : {
              "direction": "bottom",
              "sticky" : true
            }
          }        
        },
        "label": {
          "mode": "fixed",
          "language": REF.language
        },
        "style": {
          "color": "#4d3d3d",
          "weight": 1,
          "opacity": 1,
          "fillColor": "#738ce5",
          "fillOpacity": 1
        },
      }
    }]
  }

}) // end map obj

function loadCountryData(country) {

const dataset = dataNameSpace.dataset;

REF.geo = country.CNTR_ID



 let url = "https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/" + dataset + "?";
  url += "format=JSON";
  url += "&lang=" + REF.language;
  url += "&geo=" + REF.geo;
  url += "&siec=" + REF.siec;
  url += "&unit=" + REF.unit;
  url += "&time=" + REF.year;

  let d = JSONstat(url).Dataset(0);

  // loadData()

  countriesDataHandler(d)

  countryInfo(country)

}



function countriesDataHandler(d) {
  const excludedPartners = ["AFR_OTH", "AME_OTH", "ASI_NME_OTH", "ASI_OTH", "EUR_OTH", "EX_SU_OTH", "NSP", "TOTAL"];

  if (d === null) {
    return []; // Return an empty array if the input is null
  }

  const partnerIds = d.Dimension("partner").id;

  const partners = partnerIds.map((currentPartnerId, index) => {
      if (!excludedPartners.includes(currentPartnerId) && d.value[index] > 0) {
        return d.value[index];
      }
      return null; 
    }).filter(partner => partner !== null);

    countryTotal = Math.floor(partners.reduce((acc, currentValue) => acc + currentValue, 0));

  // return partners;
}


function countryInfo(country) {
  $('#countryInfo').remove();

  const countryInfoContent = `
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

  $("#map").append(countryInfoContent);
}

function closeInfo (params) {
  $('#countryInfo').remove();
}