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
    "height": "85vh",
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
            var country = layer.feature.properties;
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
  log(country)
}