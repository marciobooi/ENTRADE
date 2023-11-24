var log = console.log.bind(document)

var isMobile = /Mobi|Android/i.test(navigator.userAgent) || window.innerWidth < 850 || /Mobi|Android/i.test(navigator.userAgent) && (window.innerWidth < window.innerHeight);


const message = (/The ENTRADE tool is down since:     (.*)/)



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

//   new codes

const excludedPartners = ["AFR_OTH", "AME_OTH", "ASI_NME_OTH", "ASI_OTH", "EUR_OTH", "EX_SU_OTH", "NSP", "TOTAL"];

	function addChartOptions() {
		const chartOptions = new ChartControls();
		chartOptions.addToDOM("#subnavbar-container"); 
  	}

	  function removeChartOptions() {
		const chartOptions = new ChartControls();
		chartOptions.removeFromDOM(); 

		const mapcontainer = document.querySelector(".wt-map-content");
    
		if (mapcontainer) {
		  mapcontainer.style.width = "100%";
			map.setView([50, 10], 4);
			$('#countryInfo').remove();
			$('#map').removeClass('col-6').addClass('col-12')
		} else {
			console.error("Map element not found.");
		}
	
		$('#chartContainer').removeClass('col-6').addClass('col-0').css('display', 'none')


	  }

	  function credits() {
		const chartCredits = `<span style="font-size: .75rem;">${languageNameSpace.labels["EXPORT_FOOTER_TITLE"]} - </span>
		<a style="color:blue; text-decoration: underline; font-size: .75rem;"
		href="https://ec.europa.eu/eurostat/databrowser/view/${REF.dataset}/default/table?lang=${REF.language}">${languageNameSpace.labels['DB']}</a>,
		<span style="font-size: .875rem;">                           
	  </span>`;
	  
		return chartCredits
	  }

		function openDataset() {
			window.open(" https://ec.europa.eu/eurostat/databrowser/view/"+ REF.dataset +"/default/table?lang="+ REF.language, "_self");	
		}

		function openMetadata () {
			window.open("https://ec.europa.eu/eurostat/cache/metadata/en/nrg_t_esms.htm", "_self");
		}
		function openContact () {
			document.location = "mailto:ESTAT-ENERGY@ec.europa.eu?subject=ENERGY%20TRADE%20CONTACT&body="+encodeURIComponent(window.location.href);
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


  function getTitle() {
	const geoLabel = languageNameSpace.labels[REF.geo];
	const time = REF.year;
	const dataset = languageNameSpace.labels[REF.dataset];
	const unit = languageNameSpace.labels[REF.unit];

	let title = ""
	let subtitle = ""
  
	let chartTitle = "";
	switch (REF.chart) {
	  case "lineChart":
		chartTitle = `${dataset}<br><span style="font-size:10px; padding-top:5px">${geoLabel} - ${consoms}</span>`;
		title = `${dataset} - ${geoLabel} ${time}`;
		subtitle = `<span style="font-size:12px; padding-top:5px">${geoLabel} - ${consoms}</span>`;
		break;
	  case "pieChart":
		chartTitle = `${dataset} <br> ${unit} - ${time}`;
		title = `${dataset}`;
		subtitle = "";
		break;
	  case "barChart":
		chartTitle = `${dataset}<br><span style="font-size:12px; padding-top:5px">${barText} - ${geoLabel} - ${time}</span>`;
		title = `${dataset}`;
		subtitle = `<span style="font-size:12px; padding-top:5px">${barText} - ${geoLabel} - ${time}</span>`;
		break;
	  default:    	 
	  title = `${dataset} - ${geoLabel} ${time}`;
	  subtitle = "";   
	}
  
	$("#title").html(title);
	$("#subtitle").html(subtitle);	
  
	return chartTitle;
  }

  function enableScreenREader(params) {
	const titleElement = document.querySelector("text.highcharts-title")
	if (titleElement) {
	  titleElement.setAttribute('aria-hidden', 'false');
	}
  
	// Find and update the subtitle element
	const subtitleElement = document.querySelector('text.highcharts-subtitle');
	if (subtitleElement) {
	  subtitleElement.setAttribute('aria-hidden', 'false');
	}

	const container = document.querySelector(".highcharts-root")

	container.removeAttribute('aria-hidden');
  }
