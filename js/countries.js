

// global vars

var winWidth = $(window).width();
var winHeight = $(window).height();
var eventCoordinates = {};
var flagname;

function globalVars() {
  countries = [];
  countriesValue = [];
  countriesAgregated = [];
  countriesAgregatedValue = [];
  pieData = [];
  totalCountries = [];
  totalValues = [];
  otherCountries = [];
  otherValues = [];
  tableNames = [];
  tableValues = [];
  Names = [];
  graphNames = [];
}



// dataNameSpace.setDataset();
$("#header-title-Label").html(languageNameSpace.labels["inittitle"]);
$("#subHeader-title").html([dataNameSpace.ref.year]);

var height;
var zoom;
var ramdomcolor = [];
var newTitle;

parameters();

function parameters() {
  var mq = [
    window.matchMedia("(max-width: 650px)"),
    window.matchMedia("(min-width: 651px) and (max-width: 768px)"),
    window.matchMedia("(min-width: 769px) and (max-width: 992px)"),
    window.matchMedia("(min-width: 993px) and (max-width: 1580px)"),
    window.matchMedia("(min-width: 1581px)"),
  ];
  if (mq[4].matches) {
    height = 600;
    zoom = 5;

  }
  if (mq[3].matches) {
    height = 400;
    zoom = 4;

  }
  if (mq[2].matches) {
    height = 350;
    zoom = 4;
    $('#warningMobileModal').modal('show'); 
  }
  if (mq[1].matches) {
    height = 500;
    zoom = 4;
    $('#warningMobileModal').modal('show'); 
  }
  if (mq[0].matches) {
    height = 500;

  }

  // $('#myModal').modal('show'); 

  for (i = 1; i < 21; i++) {
    // fuelColors.push('#'+Math.floor(Math.random()*16777215).toString(16))
    r = Math.floor(Math.random() * 255);
    g = Math.floor(Math.random() * 255);
    b = Math.floor(Math.random() * 255);

    ramdomcolor.push("rgb(" + r + ", " + g + ", " + b + ")");
  }
}

var topEvent, topFeature, topLayer, topMap, topREF;

// make sure div stays full width/height on resize
$(window).resize(function () {
  $(".leaflet-container").css({
    width: winWidth,
    height: winHeight,
  });
});

/**
 * ENTRADE.CSS
 * Fix issue on label cause by the transparency of css rules apply by "entrade.css".
 */
var entrade = document.createElement("style");
entrade.innerHTML = "body .wtLabelHover{background-color: #fff;}";
document.body.appendChild(entrade);

/**
 * WEBTOOLS WRAPPER
 */
$wt.map.render({
    map: {
      zoom: zoom,
      smoothZoom: true,
      smoothZoomDelay: 3000,
      height: winHeight,
      continuousWorld: true,
      worldCopyJump: true,
      inertia:true,
      smoothFactor: 1,
      language : REF.language,
      // Initial state and background.
      center: [49.771, 6.0943],
      background: "osmec",     
      'maxBounds': [
        [-90, -Infinity],
        [90, Infinity]
    ],    
    },
  }).ready(function (map) {
    topMap = map;
    var isSelected = false;
    var counter = 0;

    /**
     * YOU DON'T NEED TO USE ".addTo(map)"
     * Otherwise layer are add twice.
     *  - map.countries.add (to add directly to the map)
     *  - map.countries.set (to let you choose the target layer by using ".addTo(layer)"
     */

    map.countries.add([{ level: 0, countries: ["NZ","KS","ALL","PR", "XV", "XC", "XD", "XF", "XG", "XH", "GL"] }],  {
      //sugested by WEBTOOLS fix
      // label: {
      //   mode: "hover"
      // },
      year: 2021,
      // Major style for the map.
      style: {
        fillColor: "rgba(10, 76, 182, 0.69)",
        weight: 1,
        color: "rgba(119, 136, 153, 0.33)",
      },



      onEachFeature: function (feature, layer) {
        topFeature = feature;
        topLayer = layer;     

        /**
         * MAKE AN EXCEPTION FOR KOSOVO
         */
        var isKS = layer.feature.properties.CNTR_ID === "KS";
        var isNZ = layer.feature.properties.CNTR_ID === "NZ";
      
        if (isKS) {
          layer.setStyle({
            fillOpacity: 0,
          });
        }
        if (isNZ) {
          layer.setStyle({
            fillOpacity: 0,
          });
        }     

        /**
         * MANAGE YOURSELF THE TOOLTIP BASE FROM LEAFLET API
         * You can manage yourself any extra tooltip translation
         * base from the feature.properties.
         */    

        bindTooltipToMap(map);


      urlLoadFunction(layer, map);

        /**
         * BINDING EVENTS
         */
        layer.on({
          /**
           * WEBTOOLS ADVICES
           * -  Split this code into several functions
           * -  Move some of them outside to keep safe memory usage and also for low CPU (mobile)
           * -  Do not manipulate the dom until your data are ready.
           * -  Use layer references to cleanup markers and lines (layer.clearLayers()).
           * -  Move your ajax request (data.json) outside and store the data into a global variable.
           * -  About "data.json", you can use also "L.labels" that contains also each centroid of each countries
           *    in the world.
           * -  You can reduce the duration of the "flyTo" (3.5s) give the sensation is too slow.
           */
          click: function (event) {


            		
		if(REF.trade == "exp"){					
			$(".leaflet-interactive").css("fill", "green");			
		} else {		
			$(".leaflet-interactive").css("fill", "rgb(40, 110, 180)");			
		}	

        console.log("initiated")
        $( "#clean" ).remove()
            topEvent = event;
            topREF = REF;

            // enpricesNameSpace.setHeaderTitleLoader();dataNameSpace.getRefURL();
            dataNameSpace.setDataset();
            languageNameSpace.initLanguage(REF.language);
            EurobaseQueryEntrade(dataNameSpace.dataset,REF.siec,REF.partner,REF.unit,REF.geo,REF.year);

            // EurobaseQueryEntrade(dataNameSpace.dataset, REF.siec, REF.partner, REF.unit, REF.geo, REF.year);

            var elem;
            ({ elem, counter } = renewMapLines(counter));

            // clean the map function
            counter = cleanmaplines(counter);

            $(".wtinfoshow").addClass("wtinfo");       
      
              if (feature.properties["CNTR_CODE"] == "UK") {
                flagname = "GB";
              } else {
                flagname = feature.properties["CNTR_CODE"];
              }
      
      
            if(flagname == undefined){
              errorHandler()
              return 
            }
        

            //define the selected county
            REF.geo = feature.properties["NUTS_ID"];

            dataNameSpace.setRefURL();
  

            // code refer to title in the modal
            if (isMobile) {
              if (REF.geo == "DE" || REF.geo == "XK") {
                newTitle = languageNameSpace.labels[REF.geo + "mobile"];
              } else {
                newTitle = languageNameSpace.labels[REF.geo];
              }
            } else {
              newTitle = languageNameSpace.labels[REF.geo];
              if (newTitle == undefined) {
                if (REF.language == "EN") {
                  newTitle = feature.properties["SHRT_ENGL"];
                }
                if (REF.language == "FR") {
                  newTitle = feature.properties["SHRT_FREN"];
                }
                if (REF.language == "DE") {
                  newTitle = feature.properties["SHRT_GERM"];
                }
              }
            }
            
            // code to change dinamicly the navbar text
            // $("#header-title-Label").html(languageNameSpace.labels[dataNameSpace.dataset].slice(this.length, -19));
            titleManager();

            //global filtered data to be used on the tool
            countries = "";
            countriesValue = "";

            var i = loadData();

            timeSeriesData();                
           
              // if(totalValues.length == 0 && countriesValue.length == 0){
              //   puyModal({
              //     title: languageNameSpace.labels["nodata"],
              //     message:
              //       "<p>" +languageNameSpace.labels["error2"] + " " + languageNameSpace.labels[REF.geo] + languageNameSpace.labels["title9"] +"</p>",
              //     showHeader: true,
              //     showFooter: false,
              //   });
              //   return
              // }   
            //variable that define the coordinates of the selected county
            // var coordOne = event.latlng

            //function that will grab all the coordinates to display the lines on the graph
            var coordinates = [];

            if(!event.latlng) {
              coordinates = eventCoordinates;
              event.latlng = eventCoordinates[0]; 
            } else {
              coordinates = [event.latlng]
            }



            //const that will have all the full names for the countries for the bar chart
            // const barChartNames = graphNames;

            // var filteredCountries = []
            // console.log(countries,countriesValue)
            let objectOne = countries;
            let objectTwo = countriesValue;

            function getSortedKeys(obj) {
              let keys = Object.keys(obj);
              return keys.sort(function (a, b) {
                return obj[b] - obj[a];
              });
            }

            let sortedKeys = getSortedKeys(objectTwo);
            countries = [];
            countriesValue = [];

            for (i = 0; i < sortedKeys.length; i++) {
              countries.push(objectOne[sortedKeys[i]]);
              countriesValue.push(objectTwo[sortedKeys[i]]);
            }

            //filter by order on the table generated

            let objectTableNames = tableNames;
            let objectTableValues = tableValues;

            function getSortedKeys(obj) {
              let keys = Object.keys(obj);
              return keys.sort(function (a, b) {
                return obj[b] - obj[a];
              });
            }

            let sortedKeysTable = getSortedKeys(objectTableValues);
            tableNames = [];
            tableValues = [];

            for (i = 0; i < sortedKeysTable.length; i++) {
              tableNames.push(objectTableNames[sortedKeysTable[i]]);
              tableValues.push(objectTableValues[sortedKeysTable[i]]);
            }

            PolylinesTickness();

            pieData.sort(pievalues);

            function pievalues(a, b) {
              if (a[1] === b[1]) {
                return 0;
              } else {
                return a[1] > b[1] ? -1 : 1;
              }
            }

            switch (REF.filter) {
              case "top5":
                countries = countries.slice(0, 5);
                countriesValue = countriesValue.slice(0, 5);
                pieData = pieData.slice(0, 5);

                break;
              case "top10":
                countries = countries.slice(0, 10);
                countriesValue = countriesValue.slice(0, 10);
                pieData = pieData.slice(0, 10);
                break;
              case "top25":
                countries = countries.slice(0, 25);
                countriesValue = countriesValue.slice(0, 25);
                pieData = pieData.slice(0, 25);

                break;
              case "all":
                countries = countries;
                countriesValue = countriesValue;
                pieData = pieData;

                break;
              default:
                countries = countries;
                countriesValue = countriesValue;
                pieData = pieData;

                break;
            }
            

            // console.log(pieData)

            //ajax call to swap from the country code to full name of the coutry and the coordinates
            //it will load in data.json file the values
            ajaxCordsCall(coordinates);

            // console.log(countries, coordinates)

            //code related to convert the polyline in to a courve line
            var { i, latlngs } = curvePolilines(coordinates, event);

            
            // wtinfocontent

            $(function () {
              var i;
              ({ i, i } = mapPolyline(i,coordinates,countries, map, event, latlngs,countriesValue,PolylinesTickness));
            });

            //function to render the sidepanel of the map





            if (isMobile) {
              var elem = document.querySelectorAll("#toggleMenu").forEach(function (a) {
                  a.remove();
                });

              var buttonMenu = '<button id="toggleMenu" type="button" class="btn blue"><i class="fas fa-bars faa-vertical faa-slow animated"></i></button>';
              $("html").append(buttonMenu);
              $(".wtinfo").css({ left: "", top: "" });
              $("#toggleMenu").click(function () {
                this.remove();
                map.info.show(tableInfo());
                modalreopen();
              });
            } else {
                map.info.show(tableInfo());
            }

            function teseract() {
              // all values
              let object1 = totalCountries;
              let object2 = totalValues;
              // console.log(object1, object2)

              let object3 = countries;
              let object4 = countriesValue;
              // console.log(object3 ,object4)

              teseractname = [];
              teseractvalue = [];
              // console.log(teseractname ,teseractvalue)

              // console.log(teseractname)
              // console.log(teseractvalue)

              function getSortedKeys(obj) {
                let keys = Object.keys(obj);
                return keys.sort(function (a, b) {
                  return obj[b] - obj[a];
                });
              }

              let sortedKeys = getSortedKeys(object2);

              for (i = 0; i < sortedKeys.length; i++) {
                if (object1[sortedKeys[i]] == "TOTAL") {
                } else {
                  teseractname.push(object1[sortedKeys[i]]);
                  teseractvalue.push(object2[sortedKeys[i]]);
                }
              }

              obj2 = teseractvalue;
              obj2 = Object.values(obj2).reduce((a, b) => a + b, 0);
              obj3 = object4;
              obj3 = Object.values(obj3).reduce((a, b) => a + b, 0);

              // console.log(obj2)
              // console.log(obj3)

              result2 = obj2 - obj3;

              // console.log(result2);
              if (result2 == 0) {
                return;
              } else {
                return pieData.push([
                  languageNameSpace.labels["other"],
                  result2,
                ]);
              }
            }

            teseract();

            // console.log(pieData)



            abbunit = REF.unit;

            console.log(abbunit)

            switch (abbunit) {
              case "THS_T":
                abbunit = "abr_THS_T";
                break;
              case "MIO_M3":
                abbunit = "abr_MIO_M3";
                break;
              case "TJ_GCV":
                abbunit = "abr_TJ_GCV";
                break;
              case "GWH":
                abbunit = "abr_GWH";
                break;

              default:
                break;
            }

    

          },
        
          mouseover: function () {
            if (isSelected === layer) {
              return;
            }

            layer.setStyle({
              fillOpacity: 1,
              color: "rgba(0, 0, 0, 0.4)",
            });


          },

          mouseout: function () {
            if (isSelected === layer) {
              return;
            }

            layer.setStyle({
              fillOpacity: 0.2,
              color: "rgba(119, 136, 153, 0.33)",
            });

            /**
             * MAKE AN EXCEPTION FOR KOSOVO
             */
            if (isKS) {
              layer.setStyle({
                fillOpacity: 0,
              });
            }  
            if (isNZ) {
              layer.setStyle({
                fillOpacity: 0,
              });
            }  
          },
        });
      },
    });


    // removed has sugested by fixes document


    /**
     * PLUGINS - GLOBE MINI MAP
     */
    // var miniMap = new L.Control.GlobeMiniMap().addTo(map);


   
    /**
     * CATCH EVENTS
     */
    map.on({
      /**
       * WEBTOOLS EVENTS WHEN "INFO PANEL" CLOSE.
       */
      closeInfo: function () {
        $(".wtinfo").removeClass("open");
        var elem = document.querySelectorAll("#toggleMenu").forEach(function (a) {
            a.remove();
          });
        var buttonMenu ='<button id="toggleMenu" title="' +
          languageNameSpace.labels["btn1"] +'" type="button" class="btn blue"><i class="fas fa-bars faa-vertical faa-slow animated"></i></button>';
        $("html").append(buttonMenu);
        $(".wtinfo").css({ left: "", top: "" });
        $("#toggleMenu").click(function () {
          this.remove();
          modalreopen();
        });
      },
      // drag: function () {
      //   var southWest = L.latLng(-89.98155760646617, -180),
      //     northEast = L.latLng(89.99346179538875, 180);
      //   var bounds = L.latLngBounds(southWest, northEast);
      //   map.panInsideBounds(bounds, { animate: false });
      // },
    })
  });



















//code related to the polylines
function mapPolyline(i, coordinates,countries, map, event,latlngs, countriesValue,PolylinesTickness) {

  for (var i = 1; i < coordinates.length; i++) {
    let color

    //  code to add the colors to the polylines by fuel
     color = poliColorChange(color);

    //code to define the mid point on polyline lenght and give the curve shape
    var initialPoint = Object.values(event.latlng);
    var midPoint = latlngs[i - 1];
    var endPoint = coordinates[i];

    // var weight = Math.floor(Math.random() * 10) + 2
    var weight = PolylinesTickness();

    //quadratic bezier curve
    var pl = L.curve(
      [
        // code related to the paths
        "M",
        initialPoint,
        "C",
        midPoint,
        endPoint,
        endPoint,
      ],
      {
        //code related to the style
        animate: 3000,
        color: color,
        lineCap: "round",
        weight: weight[i - 1],
        smoothFactor: 1,
        noClip: true,
        className: "myClass",
      }
    );

    // create popup contents
    polyPopUpHandler(countries, i, countriesValue, pl);
    //code related to the popup on the polylines
    pl.on("mouseover", function (e) {
      this.closePopup();
      this.mySavedWeight = this.options.weight;
      this.setStyle({
        weight: 8,
        color: "black",
      });
      this.openPopup(e.latlng);
    });
    pl.on("mouseout", function (e) {
      this.setStyle({ color: color, weight: this.mySavedWeight });
      this.closePopup();
    });
    pl.on("click", function (e) {
      this.openPopup();
      //disable mouseout behavior here?
    });
    pl.addTo(map);
    
    // add the markers on the map
    var icon = new L.Icon.Default();
    icon.options.shadowSize = [0, 0];
    icon.options.color = "green";
    icon.options.className = "my-own-class";

    marker = new L.marker(coordinates[i], {
      icon: icon,
    }).addTo(map);
 
  }

  return { i, i };
}











