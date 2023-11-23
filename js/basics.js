var log = console.log.bind(document)

var isMobile = /Mobi|Android/i.test(navigator.userAgent) || window.innerWidth < 850 || /Mobi|Android/i.test(navigator.userAgent) && (window.innerWidth < window.innerHeight);


const message = (/The ENTRADE tool is down since:     (.*)/)

// browser platform support
// taken from http://stackoverflow.com/questions/9847580/how-to-detect-safari-chrome-ie-firefox-and-opera-browser
// Opera 8.0+
var isOpera = (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;

// Firefox 1.0+
var isFirefox = typeof InstallTrigger !== 'undefined';
// At least Safari 3+: "[object HTMLElementConstructor]"
if (navigator.appVersion.indexOf("Mac") != -1) {
	var isSafari = navigator.userAgent.toLowerCase().indexOf('safari/') > -1;
} else {
	var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
}

var objAgent = navigator.userAgent;
var safariMajorVersion = parseInt(navigator.appVersion, 10);
var objOffsetVersion, ix;

//get Safari version
if (isSafari) {
	objfullVersion = objAgent.substring(objOffsetVersion + 7);

	if ((objOffsetVersion = objAgent.indexOf("Version")) != -1) objfullVersion = objAgent.substring(objOffsetVersion + 8);
	if ((ix = objfullVersion.indexOf(";")) != -1) objfullVersion = objfullVersion.substring(0, ix);
	if ((ix = objfullVersion.indexOf(" ")) != -1) objfullVersion = objfullVersion.substring(0, ix);

	safariMajorVersion = parseInt('' + objfullVersion, 10);
	if (isNaN(safariMajorVersion)) {
		objfullVersion = '' + parseFloat(navigator.appVersion);
		safariMajorVersion = parseInt(navigator.appVersion, 10);
	}
	// console.log(objfullVersion); //full version X.xx.xx
	// console.log(safariMajorVersion); // Major version X
}

// Internet Explorer 6-11
var isIEBrowser = /*@cc_on!@*/ false || !!document.documentMode;
// Edge 20+
var isEdge = !isIEBrowser && !!window.StyleMedia;
// Chrome 1+
var isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
// Blink engine detection
var isBlink = (isChrome || isOpera) && !!window.CSS;

// supported platforms
var isBrowserSupported = isFirefox || isChrome || isIEBrowser || (isSafari && safariMajorVersion > 9) || isEdge;
var output = 'Detecting browsers:<hr>';
output += 'isFirefox: ' + isFirefox + '<br>';
output += 'isChrome: ' + isChrome + '<br>';
output += 'isSafari: ' + isSafari + '<br>';
output += 'isOpera: ' + isOpera + '<br>';
output += 'isIEBrowser: ' + isIEBrowser + '<br>';
output += 'isEdge: ' + isEdge + '<br>';
output += 'isBlink: ' + isBlink + '<br>';
// console.log(output)

var isMobile = navigator.userAgent.match(/Android/i) != null || navigator.userAgent.match(/webOS/i) != null || navigator.userAgent.match(/iPhone/i) != null || navigator.userAgent.match(/iPad/i) != null ||
	navigator.userAgent.match(/iPod/i) != null || navigator.userAgent.match(/BlackBerry/i) != null || navigator.userAgent.match(/Windows Phone/i) != null;

	function getOrientation() {
		if(screen.height > screen.width){	    
			return "portrait";
		} else {
			return "landscape";
		} 
	}


// read variables from URL
// code from http://papermashup.com/read-url-get-variables-withjavascript/
function getUrlVars() {
	var vars = {};
	var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
		vars[key] = value;
	});
	return vars;
};

//dialog box position object
var dialogBoxPosition = function (x, y) {
	this.x = x;
	this.y = y;
};

//calculate the dialog box position to display it all the time inside the diagram wether for the extrem right and bottom nodes
function calculateDialogBoxPosition(x, y, width, height) {
	var rightSpace = $(window).width() - x;
	var bottomSpace = imgHeight - y;
	var newX,
		newY;

	if (rightSpace < width) {
		newX = x - width;
		if (bottomSpace < height) {
			newY = y - height;
		} else {
			newY = y - 20;
		}
	} else if (bottomSpace < height) {
		newX = x;
		newY = y - height;
	} else {
		newX = x;
		newY = y;
	}
	return new dialogBoxPosition(newX, newY);
}

function closeDialogBox(box) {
	box.close();
	box.destroy();
}

// change URL by adding new item to history
// code from http://www.aspsnippets.com/Articles/Change-Browser-URL-without-reloading-refreshing-page-using-HTML5-in-JavaScript-and-jQuery.aspx
function changeUrl(title, url) {
	if (typeof (history.pushState) != "undefined") {
		var obj = {
			Title: title,
			Url: url
		};
		history.pushState(obj, obj.Title, obj.Url);
	} else {
		alert(languageNameSpace.labels["MSG_BROWSER"]);
	};
};

function openDataset() {
	window.open(" https://ec.europa.eu/eurostat/databrowser/view/"+ dataNameSpace.dataset +"/default/table?lang="+ REF.language, "_self");	//
}

function modalreopen(){
	renderMap()
}

function pieChart() {
	renderPie();
	REF.chart = "pie"
	$("#columnChart").addClass("none");
	$("#timeChart").addClass("none");
	$("#pieChart").addClass("none");
	$("#stats").addClass("none");
	$("#statusinfo").addClass("none");

	$("#columnChart").removeClass("show");
	$("#timeChart").removeClass("show");
	$("#pieChart").addClass("show");
	$("#statusinfo").removeClass("show");
	$("#stats").removeClass("show");
	$(".charts-toolbar").show();

	$("#customtb").show();
	$("#customtimetb").hide();
	

}

function columnChart() {
	renderBarChart()
	REF.chart = "col"
	$("#columnChart").addClass("none");
	$("#timeChart").addClass("none");
	$("#pieChart").addClass("none");
	$("#stats").addClass("none");
	$("#statusinfo").addClass("none");

	$("#columnChart").addClass("show");
	$("#timeChart").removeClass("show");
	$("#pieChart").removeClass("show");
	$("#statusinfo").removeClass("show");
	$("#stats").removeClass("show");
	$(".charts-toolbar").show();

	$("#customtb").show();
	$("#customtimetb").hide();

}

function timeChart() {
	rendertimeChart()
	REF.chart = "time"
	$("#columnChart").addClass("none");
	$("#timeChart").addClass("none");
	$("#pieChart").addClass("none");
	$("#stats").addClass("none");
	$("#statusinfo").addClass("none");
	

	$("#columnChart").removeClass("show");
	$("#timeChart").addClass("show");
	$("#pieChart").removeClass("show");
	$("#statusinfo").removeClass("show");
	$("#stats").removeClass("show");
	$(".charts-toolbar").show();

	$("#customtb").hide();
	$("#customtimetb").show();

}

function stats() {
	REF.chart = "stat"
	$("#columnChart").addClass("none");
	$("#timeChart").addClass("none");
	$("#pieChart").addClass("none");
	$("#stats").addClass("none");
	$("#statusinfo").addClass("none");

	$("#columnChart").removeClass("show");
	$("#timeChart").removeClass("show");
	$("#pieChart").removeClass("show");
	$("#statusinfo").removeClass("show");
	$("#stats").addClass("show");
	$(".charts-toolbar").hide();
}

function info() {
	REF.chart = "info"
	$("#columnChart").addClass("none");
	$("#timeChart").addClass("none");
	$("#pieChart").addClass("none");
	$("#stats").addClass("none");
	$("#statusinfo").addClass("none");

	$("#columnChart").removeClass("show");
	$("#timeChart").removeClass("show");
	$("#pieChart").removeClass("show");
	$("#stats").removeClass("show");
	$("#statusinfo").addClass("show");
	$(".charts-toolbar").hide();
}

function filterAll() {
	// console.log(REF.filter)
	REF.filter = "all"
	if ($("#pieChart").hasClass("show")){
		renderMap()
		pieChart()
	} 
	if ($("#columnChart").hasClass("show")){
		renderMap()
		columnChart()
	}
	if ($("#timeChart").hasClass("show")){
		renderMap()
		timeChart()
	}
	if ($("#stats").hasClass("show")){
		renderMap()
		stats()
	} else {
		renderMap()
		stats()
	}
	if ($("#info").hasClass("show")){
		renderMap()
		info()
	}
	
}

function filterCounter() {
	switch (REF.filter) {
	  case "top5":
		counter = 5;
		break;
	  case "top10":
		counter = 10;
		break;
	  case "top25":
		counter = 25;
		break;
	  case "all":
		counter = 1000;
		break;
	  default:
		counter = 1000;
		break;
	}
  }

function topFive() {
	// console.log(REF.filter)
	REF.filter = "top5"
	if ($("#pieChart").hasClass("show")){
		renderMap()
		pieChart()
	}
	if ($("#columnChart").hasClass("show")){
		renderMap()
		columnChart()
	}
	if ($("#timeChart").hasClass("show")){
		renderMap()
		timeChart()
	}
	if ($("#stats").hasClass("show")){
		renderMap()
		stats()
	} else {
		renderMap()
		stats()
	}
	if ($("#info").hasClass("show")){
		renderMap()
		info()
	}
}

function topTen() {
	// console.log(REF.filter)
	REF.filter = "top10"
	if ($("#pieChart").hasClass("show")){
		renderMap()
		pieChart()
	}
	if ($("#columnChart").hasClass("show")){
		renderMap()
		columnChart()
	}
	if ($("#timeChart").hasClass("show")){
		renderMap()
		timeChart()
	}
	if ($("#stats").hasClass("show")){
		renderMap()
		stats()
	} else {
		renderMap()
		stats()
	}
	if ($("#info").hasClass("show")){
		renderMap()
		info()
	}
}

function topTwentyFive() {
	// console.log(REF.filter)
	REF.filter = "top25"
	if ($("#pieChart").hasClass("show")){
		renderMap()
		pieChart()
	}
	if ($("#columnChart").hasClass("show")){
		renderMap()
		columnChart()
	}
	if ($("#timeChart").hasClass("show")){
		renderMap()
		timeChart()
	}
	if ($("#stats").hasClass("show")){
		renderMap()
		stats()
	} else {
		renderMap()
		stats()
	}
	if ($("#info").hasClass("show")){
		renderMap()
		info()
	}
}

function fuelColors() {

	var ramdomcolor = []
	
	for(i=1;i<11;i++){		
		// fuelColors.push('#'+Math.floor(Math.random()*16777215).toString(16))
		r = Math.floor(Math.random() * 255);
        g = Math.floor(Math.random() * 255);
        b = Math.floor(Math.random() * 255);
       
        ramdomcolor.push ('rgb(' + r + ', ' + g + ', ' + b + ')');
}	
return ramdomcolor

}


function clearmapclose() {
	  //clean lines
	  var elem = document.querySelectorAll('.myClass').forEach(function (a) {
		a.remove()
	  });
	  //clean Markers
	  var myMarkers = document.querySelectorAll('.leaflet-marker-icon').forEach(function (b) {
		b.remove()
	  }); 
	 
	  var shadow = document.querySelectorAll('.my-own-class').forEach(function (d) {
		d.remove()
	  });

	 if($( ".wtinfo" ).hasClass( "open" )){
	// close the modal
	$(".wtinfo").addClass("wtinfoshow");
	$(".wtinfo").removeClass("wtinfo");
	  } else {
		$(".wtinfo").addClass("wtinfoshow");
		$(".wtinfo").removeClass("wtinfo");
	  }

	// clean toggler modal btn          
	$("#toggleMenu").remove();
	$('#clean').remove();	
	   
	   
}



function bulkDownlod() {
	window.open("https://ec.europa.eu/eurostat/estat-navtree-portlet-prod/BulkDownloadListing?sort=1&file=data%2F" + dataNameSpace.dataset + ".tsv.gz");	
}



// function to clear the map
  function cleanmaplines(counter) {
	$("#clean").on("click", function () {
	  // alert(true)
	  counter += 1;
	  if (counter > 1) {
		//clean lines
		var elem = document.querySelectorAll('.myClass').forEach(function (a) {
		  a.remove();
		});
		//clean Markers
		var myMarkers = document.querySelectorAll('.leaflet-marker-icon').forEach(function (b) {
		  b.remove();
		});
		var shadow = document.querySelectorAll('.my-own-class').forEach(function (d) {
		  d.remove();
		});
	  }
	  // close the modal
	  $(".wtinfo").removeClass("wtinfo");
	  // clean toggler modal btn
	  $("#toggleMenu").remove();
	  $('#clean').remove();
	});
	return counter;
  }

  $("#clean").on("click", function () {
	// alert(true)
	counter += 1;
	if (counter > 1) {
	  //clean lines
	  var elem = document.querySelectorAll('.myClass').forEach(function (a) {
		a.remove();
	  });
	  //clean Markers
	  var myMarkers = document.querySelectorAll('.leaflet-marker-icon').forEach(function (b) {
		b.remove();
	  });
	  var shadow = document.querySelectorAll('.my-own-class').forEach(function (d) {
		d.remove();
	  });
	}
	// close the modal
	$(".wtinfo").removeClass("wtinfo");
	// clean toggler modal btn
	$("#toggleMenu").remove();
	$('#clean').remove();
  });

// function to redraw the lines in the map


  
// function to make the polylines curve in the map
  function curvePolilines(coordinates, event) {
	var latlngs = [];
	for (var i = 1; i < coordinates.length; i++) {
	  var latlng1 = Object.values(event.latlng), latlng2 = [coordinates[i][0], coordinates[i][1]];
	  var offsetX = latlng2[1] - latlng1[1], offsetY = latlng2[0] - latlng1[0];
	  var r = Math.sqrt(Math.pow(offsetX, 2) + Math.pow(offsetY, 2)), theta = Math.atan2(offsetY, offsetX);
	  if (offsetX > 0) {
		var thetaOffset = (6.14 / 19);
	  }
	  else {
		var thetaOffset = -(6.14 / 19);
	  }
	  var r2 = (r / 2) / (Math.cos(thetaOffset)), theta2 = theta + thetaOffset;
	  var midpointX = (r2 * Math.cos(theta2)) + latlng1[1], midpointY = (r2 * Math.sin(theta2)) + latlng1[0];
	  var midpointLatLng = [midpointY, midpointX];
	  latlngs.push(midpointLatLng);
	  // console.log(midpointLatLng)
	}
	return { i, latlngs };
  }


// function to get the coordinates of the map 
function ajaxCordsCall(coordinates) {

		// console.log(countries)

		// proposed by webtools
		for (var i = 0; i < countries.length; i++) {
				//   console.log(countries[i], L.labels[countries[i]].c)				
				coordinates.push(L.labels[countries[i]].c);	
		}		
	// $.ajax({
	//   type: 'GET',
	//   dataType: 'json',
	//   async: false,
	//   url: 'data/data.json',
	//   success: function (data) {
	// 	for (var i = 0; i < countries.length; i++) {
	// 	  $.each(data['features'], (index, obj) => {
	// 		for (let [key, value] of Object.entries(obj)) {
	// 		  if (countries[i].includes(value)) {
	// 			coordinates.push([(Object.entries(obj)[0][1].coordinates[1]), (Object.entries(obj)[0][1].coordinates[0])]);
	// 		  }
	// 		}
	// 	  });
	// 	}
	//   }
	// });
  }


// function to change the navbar text according to selected in the map
  function titleManager() {
	$("#header-title-Label").html(languageNameSpace.labels[REF.trade] + " " + languageNameSpace.labels["title6"] + " " + languageNameSpace.labels[REF.siec]);
	$("#subHeader-title").html(newTitle + "  " + [dataNameSpace.ref.year]);
  }


  function poliColorChange(color) {
	const fuelColors = {
	  solid: isEdge ? "#800000" : "#800000ba",
	  oil: isEdge ? "#14375a" : "#14375aba",
	  gas: isEdge ? "#faa519" : "#faa519ba",
	  biofuels: isEdge ? "#5fb441" : "#5fb441ba",
	  electricity: isEdge ? "#d73c41" : "#d73c41ba",
	};
  
	return fuelColors[REF.fuel] || color;
  }

  function polyPopUpHandler(countries, i, countriesValue, pl) {
	var customPopup = '<div class="popTitle">' + languageNameSpace.labels[dataNameSpace.dataset].slice(this.length, -19)
	  + "</div>"
	  + '<div class="popBody">'
	  + '<div class="popText">';
	if (REF.trade == "exp") {
	  customPopup += '<div class="popSubTitle"><b>' + newTitle + '</b><span> &#8594; </span> <b>' + languageNameSpace.labels[countries[i - 1]] + "</b></div>";
	} else {
	  customPopup += '<div class="popSubTitle"><b>' + languageNameSpace.labels[countries[i - 1]] + '</b><span> &#8594; </span><b>' + newTitle + "</b></div>";
	}
	customPopup += '<div class="popFuel">' + languageNameSpace.labels[REF.siec] + "</div>"
	  + '<div class="popValue">' + (Math.round(countriesValue[i - 1] * 10) / 10).toLocaleString("en-EN").replace(",", " ") + " - <small> " + languageNameSpace.labels[REF.unit]
	  + "</div>"
	  + "</div>"
	  + '<div class="popImg"><img class="icoBack text-center" src="img/fuel-family/' + REF.fuel + '.png" alt="" width="100px"/></div>'
	  + "</div>";
	// specify popup options
	var customOptions = {
	  maxWidth: "400",
	  width: "290",
	  className: "popupCustom",
	};
	// code related to the popup on the polylines
	return pl.bindPopup(customPopup, customOptions, { weight: 250, height: 25,});
  }

  function bindTooltipToMap(map) {
	bindTooltip = topLayer.bindTooltip(function (layer) {
	  switch (REF.language) {
		case "DE":
		  if (layer.feature.properties.SHRT_GERM == 'undefined') {
			return layer.feature.properties.SHRT_GERM;
		  } else {
			return languageNameSpace.labels[layer.feature.properties.CNTR_ID];
		  }
		case "EN":
		  if (layer.feature.properties.SHRT_ENGL == 'undefined') {
			return layer.feature.properties.SHRT_ENGL;
		  } else {
			return languageNameSpace.labels[layer.feature.properties.CNTR_ID];
		  }
		case "FR":
		  if (layer.feature.properties.SHRT_FREN == 'undefined') {
			return layer.feature.properties.SHRT_FREN;
		  } else {
			return languageNameSpace.labels[layer.feature.properties.CNTR_ID];
		  }
	  }
	}, {
	  sticky: true,
	  direction: "top",
	  className: "wtLabelHover",
	  opacity: 1,
	  zindex: 9999999,
	} //then add your options
	).addTo(map);
  }

  function urlLoadFunction(layer, map) {
	if (REF.geo == layer.feature.properties.CNTR_ID) {
	  map.loading.show();
	  eventCoordinates = [layer._latlngs[0][0][0]];
	  $.ajax({
		url: 'data/data.json',
		type: "GET",
		dataType: "json",
		async: false,
		success: function (result) {
  
		  for (let i = 0; i < result.features.length; i++) {
			if (result.features[i].properties.CNTR_ID == REF.geo) {
			  eventCoordinates = [{
				lat: result.features[i].geometry.coordinates[1],
				lng: result.features[i].geometry.coordinates[0]
			  }];
			  setTimeout(() => layer.fire('click'), 10);
			  map.loading.hide();
			  break;
			}
		  }
		}
	  });
	}
  }


  function agregateIcon() {
	const iconHTML = `
	<span class="agregates fa-stack fa-rotate-180" style=" position: absolute; top: 8px;">
	  <i class="fa fa-square fa-stack-1x" style="top: .0em; left: .0em; color: white;"></i>
	  <i class="fa fa-square fa-stack-1x" style="top: .2em; left: .2em; color: #0a328e;"></i>
	  <i class="fa fa-square fa-stack-1x" style="top: .2em; left: .2em; color: transparent;"></i>
	  <i class="fa fa-square fa-stack-1x" style="top: .3em; left: .3em; color: white;"></i>
	  <i class="fa fa-square fa-stack-1x" style="top: .5em; left: .5em; color: #0a328e;"></i>
	  <i class="fa fa-square fa-stack-1x" style="top: .5em; left: .5em; color: transparent;"></i>
	  <i class="fa fa-square fa-stack-1x" style="top: .6em; left: .6em; color: white;"></i>
	  <i class="fa fa-square fa-stack-1x" style="top: .8em; left: .8em; color: #0a328e;"></i>
	  <i class="fa fa-square fa-stack-1x" style="top: .8em; left: .8em; color: transparent;"></i>
	  <i class="fa fa-square fa-stack-1x" style="top: .9em; left: .9em; color: white;"></i>
	</span>
  `;
  return iconHTML;
  }
  
  function nonagregateIcon() {
	const iconHTML = `
		<span class="nonAgregates fa-stack fa-rotate-180" style="position: absolute;top: 4px;">
		  <i class="fa fa-square fa-stack-1x" style="top: .0em;left: .0em;color: white;"></i>
		  <i class="fa fa-square fa-stack-1x" style="top: .2em;left: .2em;color: #0a328e;"></i>
		  <i class="fa fa-square fa-stack-1x" style="top: .2em;left: .2em;color: transparent;"></i>
		  <i class="fa fa-square fa-stack-1x" style="top: .3em;left: .3em;color: white;"></i>
		</span>`;
  return iconHTML;
  }