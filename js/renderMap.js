// var counter = 0;
// var render = 0

// function renderMap() {

//     console.log("step 2")
//     console.log("redraw initiated")

//     $( "#clean" ).remove()
  
//                        var elem = document.querySelectorAll(".myClass").forEach(function (a) {
//                            a.remove();
//                          });
//                        //clean Markers
//                        var myMarkers = document.querySelectorAll(".leaflet-marker-icon").forEach(function (b) {
//                            b.remove();
//                          });

//                        // alert("IN RENDER MAP")
//                        event = topEvent;
//                        feature = topFeature;
//                        layer = topLayer;
//                        map = topMap;
//                        console.log(render)
//                       //  EurobaseQueryEntrade(dataNameSpace.dataset,REF.siec,REF.partner,REF.unit,REF.geo,REF.year);
//                        if(render == 1){
//                             render = 0
//                        } else {
//                         languageNameSpace.initLanguage(REF.language);
//                        }
              
                     
//                        // console.log(animationState)
//                        if (animationState == "true") {
//                          $(".wtinfo").removeClass("wtinfo");
//                        } else {
//                          $(".ui-draggable").addClass("wtinfo");

//                          $(".wtinfo").css({
//                            left: "",
//                            top: "",
//                          });
//                        }

//                        // btn to clear map

//                       //  if (document.getElementById("clean") !== null || $("#clean").css("display" === "none")) {
//                       //    alert(true)
//                       //    $("#clean").css("display", "initial");
//                       //  } else {
//                       //    alert(false)
//                       //    var button ='<button id="clean" data-toggle="tooltip" title="'+languageNameSpace.labels["btn7"]+'" type="button" class="btn blue"><i class="fas fa-eraser"></i></button>';
//                       //   $("#cleanBtn").append(button);
//                       //  }

                      
//                        ({ elem, counter } = renewMapLines(counter));

//                        //clean the map function
//                        counter = cleanmaplines(counter);


//                        dataNameSpace.setRefURL();

                       

//                        Names = [];
//                        graphNames = [];

//                        // code refer to title in the modal
//                        if (isMobile) {
//                          if (REF.geo == "DE" || REF.geo == "XK") {
//                            newTitle =
//                              languageNameSpace.labels[REF.geo + "mobile"];
//                          } else {
//                            newTitle = languageNameSpace.labels[REF.geo];
//                          }
//                        } else {
//                          newTitle = languageNameSpace.labels[REF.geo];
//                          if (newTitle == undefined) {
//                            if (REF.language == "EN") {
//                              newTitle = feature.properties["SHRT_ENGL"];
//                            }
//                            if (REF.language == "FR") {
//                              newTitle = feature.properties["SHRT_FREN"];
//                            }
//                            if (REF.language == "DE") {
//                              newTitle = feature.properties["SHRT_GERM"];
//                            }
//                          }
//                        }

//                        // code to change dinamicly the navbar text
//                        // $("#header-title-Label").html(languageNameSpace.labels[dataNameSpace.dataset].slice(this.length, -19));
//                        titleManager();

//                        //global filtered data to be used on the tool
//                        countries = "";
//                        countriesValue = "";

//                        var i = loadData();





//                        timeSeriesData();


//                        if(totalValues.length == 0 && countriesValue.length == 0){
//                         $(".wtinfo").removeClass("wtinfo");
//                         $("#clean").remove();
//                         $("#toggleMenu").remove();
//                         errorHandler()
//                           return
//                         }



//                        //function that will grab all the coordinates to display the lines on the graph
//                        var coordinates = [event.latlng];

//                        //const that will have all the full names for the countries for the bar chart
//                        const barChartNames = graphNames;

//                        // var filteredCountries = []
//                        // console.log(countries,countriesValue)
//                        let objectOne = countries;
//                        let objectTwo = countriesValue;

//                        function getSortedKeys(obj) {
//                          let keys = Object.keys(obj);
//                          return keys.sort(function (a, b) {
//                            return obj[b] - obj[a];
//                          });
//                        }
//                        let sortedKeys = getSortedKeys(objectTwo);
//                        countries = [];
//                        countriesValue = [];

//                        for (i = 0; i < sortedKeys.length; i++) {
//                          countries.push(objectOne[sortedKeys[i]]);
//                          countriesValue.push(objectTwo[sortedKeys[i]]);
//                        }
                     
//                                    //filter by order on the table generated

//                         let objectTableNames = tableNames;
//                         let objectTableValues = tableValues;

//                         function getSortedKeys(obj) {
//                         let keys = Object.keys(obj);
//                         return keys.sort(function (a, b) {
//                             return obj[b] - obj[a];
//                         });
//                         }

//                         let sortedKeysTable = getSortedKeys(objectTableValues);
//                         tableNames = [];
//                         tableValues = [];

//                         for (i = 0; i < sortedKeysTable.length; i++) {
//                         tableNames.push(objectTableNames[sortedKeysTable[i]]);
//                         tableValues.push(objectTableValues[sortedKeysTable[i]]);
//                         }

//                         PolylinesTickness();

//                        pieData.sort(pievalues);

//                        function pievalues(a, b) {
//                          if (a[1] === b[1]) {
//                            return 0;
//                          } else {
//                            return a[1] > b[1] ? -1 : 1;
//                          }
//                        }

//                        switch (REF.filter) {
//                          case "top5":
//                            countries = countries.slice(0, 5);
//                            countriesValue = countriesValue.slice(0, 5);
//                            pieData = pieData.slice(0, 5);

//                            break;
//                          case "top10":
//                            countries = countries.slice(0, 10);
//                            countriesValue = countriesValue.slice(0, 10);
//                            pieData = pieData.slice(0, 10);
//                            break;
//                          case "top25":
//                            countries = countries.slice(0, 25);
//                            countriesValue = countriesValue.slice(0, 25);
//                            pieData = pieData.slice(0, 25);

//                            break;
//                          case "all":
//                            countries = countries;
//                            countriesValue = countriesValue;
//                            pieData = pieData;

//                            break;
//                          default:
//                            countries = countries;
//                            countriesValue = countriesValue;
//                            pieData = pieData;

//                            break;
//                        }

//                        //ajax call to swap from the country code to full name of the coutry and the coordinates
//                        //it will load in data.json file the values
//                        ajaxCordsCall(coordinates);

//                        // console.log(countries, coordinates)

//                        //code related to convert the polyline in to a courve line
//                        var { i, latlngs } = curvePolilines(coordinates, event);

//                        //animation on map when we press in country
//                        $(function () {
//                          var i;
//                          ({ i, i } = redrawmapPolyline(i,coordinates,countries,map,event,latlngs,countriesValue,PolylinesTickness));
//                        });


//                            if (isMobile) {
//                                 map.flyTo(event.latlng, 3, {
//                                     smoothZoom: true,
//                                     smoothZoomDelay: 150,
//                                     duration: 3.5,
//                                 });
//                                 } else {
//                                 map.flyTo(event.latlng, 4, {
//                                     smoothZoom: true,
//                                     smoothZoomDelay: 150,
//                                     duration: 3.5,
//                                 });
//                                 }

//                                 if (isMobile) {
//                                     var elem = document.querySelectorAll("#toggleMenu").forEach(function (a) {
//                                         a.remove();
//                                       });
                      
//                                     var buttonMenu =
//                                       '<button id="toggleMenu" type="button" class="btn blue"><i class="fas fa-bars faa-vertical faa-slow animated"></i></button>';
//                                     $("html").append(buttonMenu);
//                                     $(".wtinfo").css({ left: "", top: "" });
//                                     $("#toggleMenu").click(function () {
//                                       this.remove();
//                                       map.info.show(tableInfo());
//                                       // modalreopen();
//                                     });
//                                   } else {
//                                     map.info.show(tableInfo());
//                                   }

//                                   function teseract() {
//                                     // all values
//                                     let object1 = totalCountries;
//                                     let object2 = totalValues;
//                                     // console.log(object1, object2)
                      
//                                     let object3 = countries;
//                                     let object4 = countriesValue;
//                                     // console.log(object3 ,object4)
                      
//                                     teseractname = [];
//                                     teseractvalue = [];
//                                     // console.log(teseractname ,teseractvalue)
                      
//                                     // console.log(teseractname)
//                                     // console.log(teseractvalue)
                      
//                                     function getSortedKeys(obj) {
//                                       let keys = Object.keys(obj);
//                                       return keys.sort(function (a, b) {
//                                         return obj[b] - obj[a];
//                                       });
//                                     }
                      
//                                     let sortedKeys = getSortedKeys(object2);
                      
//                                     for (i = 0; i < sortedKeys.length; i++) {
//                                       if (object1[sortedKeys[i]] == "TOTAL") {
//                                       } else {
//                                         teseractname.push(object1[sortedKeys[i]]);
//                                         teseractvalue.push(object2[sortedKeys[i]]);
//                                       }
//                                     }
                      
//                                     obj2 = teseractvalue;
//                                     obj2 = Object.values(obj2).reduce((a, b) => a + b, 0);
//                                     obj3 = object4;
//                                     obj3 = Object.values(obj3).reduce((a, b) => a + b, 0);
                      
//                                     // console.log(obj2)
//                                     // console.log(obj3)
                      
//                                     result2 = obj2 - obj3;
                      
//                                     // console.log(result2);
//                                     if (result2 == 0) {
//                                       return;
//                                     } else {
//                                       return pieData.push([
//                                         languageNameSpace.labels["other"],
//                                         result2,
//                                       ]);
//                                     }
//                                   }

//                        teseract();                    
                   

//                        abbunit = REF.unit;

//                        switch (abbunit) {
//                         case "THS_T":
//                           abbunit = "abr_THS_T";
//                           break;
//                         case "MIO_M3":
//                           abbunit = "abr_MIO_M3";
//                           break;
//                         case "TJ_GCV":
//                           abbunit = "abr_TJ_GCV";
//                           break;
//                         case "GWH":
//                           abbunit = "abr_GWH";
//                           break;
          
//                         default:
//                           break;
//                       }


         

//                        render = 0
//                      }


//   //code related to the polylines  redrawmapPolyline

//   function redrawmapPolyline(i, coordinates,countries, map, event,latlngs, countriesValue,PolylinesTickness) {

//     for (var i = 1; i < coordinates.length; i++) {
//       var color;
  
//       //  code to add the colors to the polylines by fuel
//       switch (REF.fuel) {
//         case "solid":
//           if (isEdge) {
//             color = "#800000";
//           } else {
//             color = "#800000ba";
//           }
//           break;
//         case "oil":
//           if (isEdge) {
//             color = "#14375a";
//           } else {
//             color = "#14375aba";
//           }
//           break;
//         case "gas":
//           if (isEdge) {
//             color = "#faa519";
//           } else {
//             color = "#faa519ba";
//           }
//           break;
//         case "biofuels":
//           if (isEdge) {
//             color = "#5fb441";
//           } else {
//             color = "#5fb441ba";
//           }
//           break;
//         case "electricity":
//           if (isEdge) {
//             color = "#d73c41";
//           } else {
//             color = "#d73c41ba";
//           }
//           break;
  
//         default:
//           break;
//       }
  
//       //code to define the mid point on polyline lenght and give the curve shape
//       var initialPoint = Object.values(event.latlng);
//       var midPoint = latlngs[i - 1];
//       var endPoint = coordinates[i];
  
//       // var weight = Math.floor(Math.random() * 10) + 2
//       var weight = PolylinesTickness();
  
//       //quadratic bezier curve
//       var pl = L.curve(
//         [
//           // code related to the paths
//           "M",
//           initialPoint,
//           "C",
//           midPoint,
//           endPoint,
//           endPoint,
//         ],
//         {
//           //code related to the style
//           animate: 3000,
//           color: color,
//           lineCap: "round",
//           weight: weight[i - 1],
//           smoothFactor: 1,
//           noClip: true,
//           className: "myClass",
//         }
//       );
  
//       // create popup contents
//       var customPopup = '<div class="popTitle">' + languageNameSpace.labels[dataNameSpace.dataset].slice(this.length, -19)
//         + "</div>"
//         + '<div class="popBody">'
//         + '<div class="popText">';
//       if (REF.trade == "exp") {
//         customPopup += '<div class="popSubTitle"><b>' + newTitle + '</b><span> &#8594; </span> <b>' + languageNameSpace.labels[countries[i - 1]] +"</b></div>";
//       } else {
//         customPopup += '<div class="popSubTitle"><b>' + languageNameSpace.labels[countries[i - 1]] + '</b><span> &#8594; </span><b>' +  newTitle + "</b></div>";
//       }
//       customPopup += '<div class="popFuel">' + languageNameSpace.labels[REF.siec] + "</div>"
//       + '<div class="popValue">' + (Math.round(countriesValue[i - 1] * 10) / 10).toLocaleString("en-EN").replace(",", " ") + " - <small> " + languageNameSpace.labels[REF.unit]
//       + "</div>"
//       + "</div>"
//       + '<div class="popImg"><img class="icoBack text-center" src="img/fuel-family/' + REF.fuel +'.png" alt="" width="100px"/></div>'
//       + "</div>";
//       // specify popup options
//       var customOptions = {
//         maxWidth: "400",
//         width: "290",
//         className: "popupCustom",
//       };
//       // code related to the popup on the polylines
//       pl.bindPopup(customPopup, customOptions, {
//         weight: 250,
//         height: 25,
//       });
//       //code related to the popup on the polylines
//       pl.on("mouseover", function (e) {
//         this.closePopup();
//         this.mySavedWeight = this.options.weight;
//         this.setStyle({
//           weight: 8,
//           color: "black",
//         });
//         this.openPopup(e.latlng);
//       });
//       pl.on("mouseout", function (e) {
//         this.setStyle({ color: color, weight: this.mySavedWeight });
//         this.closePopup();
//       });
//       pl.on("click", function (e) {
//         this.openPopup();
//         //disable mouseout behavior here?
//       });
//       pl.addTo(map);
      
//       // add the markers on the map
//       var icon = new L.Icon.Default();
//       icon.options.shadowSize = [0, 0];
//       icon.options.color = "green";
//       icon.options.className = "my-own-class";
  
//       marker = new L.marker(coordinates[i], {
//         icon: icon,
//       }).addTo(map);
   
//     }
  
//     return { i, i };
//   }