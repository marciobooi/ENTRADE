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
// var dialogBoxPosition = function (x, y) {
// 	this.x = x;
// 	this.y = y;
// };

//calculate the dialog box position to display it all the time inside the diagram wether for the extrem right and bottom nodes
// function calculateDialogBoxPosition(x, y, width, height) {
// 	var rightSpace = $(window).width() - x;
// 	var bottomSpace = imgHeight - y;
// 	var newX,
// 		newY;

// 	if (rightSpace < width) {
// 		newX = x - width;
// 		if (bottomSpace < height) {
// 			newY = y - height;
// 		} else {
// 			newY = y - 20;
// 		}
// 	} else if (bottomSpace < height) {
// 		newX = x;
// 		newY = y - height;
// 	} else {
// 		newX = x;
// 		newY = y;
// 	}
// 	return new dialogBoxPosition(newX, newY);
// }

// function closeDialogBox(box) {
// 	box.close();
// 	box.destroy();
// }

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



// function modalreopen(){
// 	renderMap()
// }

// function pieChart() {
// 	renderPie();
// 	REF.chart = "pie"
// 	$("#columnChart").addClass("none");
// 	$("#timeChart").addClass("none");
// 	$("#pieChart").addClass("none");
// 	$("#stats").addClass("none");
// 	$("#statusinfo").addClass("none");

// 	$("#columnChart").removeClass("show");
// 	$("#timeChart").removeClass("show");
// 	$("#pieChart").addClass("show");
// 	$("#statusinfo").removeClass("show");
// 	$("#stats").removeClass("show");
// 	$(".charts-toolbar").show();

// 	$("#customtb").show();
// 	$("#customtimetb").hide();
	

// }

// function columnChart() {
// 	renderBarChart()
// 	REF.chart = "col"
// 	$("#columnChart").addClass("none");
// 	$("#timeChart").addClass("none");
// 	$("#pieChart").addClass("none");
// 	$("#stats").addClass("none");
// 	$("#statusinfo").addClass("none");

// 	$("#columnChart").addClass("show");
// 	$("#timeChart").removeClass("show");
// 	$("#pieChart").removeClass("show");
// 	$("#statusinfo").removeClass("show");
// 	$("#stats").removeClass("show");
// 	$(".charts-toolbar").show();

// 	$("#customtb").show();
// 	$("#customtimetb").hide();

// }

// function timeChart() {
// 	rendertimeChart()
// 	REF.chart = "time"
// 	$("#columnChart").addClass("none");
// 	$("#timeChart").addClass("none");
// 	$("#pieChart").addClass("none");
// 	$("#stats").addClass("none");
// 	$("#statusinfo").addClass("none");
	

// 	$("#columnChart").removeClass("show");
// 	$("#timeChart").addClass("show");
// 	$("#pieChart").removeClass("show");
// 	$("#statusinfo").removeClass("show");
// 	$("#stats").removeClass("show");
// 	$(".charts-toolbar").show();

// 	$("#customtb").hide();
// 	$("#customtimetb").show();

// }

// function stats() {
// 	REF.chart = "stat"
// 	$("#columnChart").addClass("none");
// 	$("#timeChart").addClass("none");
// 	$("#pieChart").addClass("none");
// 	$("#stats").addClass("none");
// 	$("#statusinfo").addClass("none");

// 	$("#columnChart").removeClass("show");
// 	$("#timeChart").removeClass("show");
// 	$("#pieChart").removeClass("show");
// 	$("#statusinfo").removeClass("show");
// 	$("#stats").addClass("show");
// 	$(".charts-toolbar").hide();
// }

// function info() {
// 	REF.chart = "info"
// 	$("#columnChart").addClass("none");
// 	$("#timeChart").addClass("none");
// 	$("#pieChart").addClass("none");
// 	$("#stats").addClass("none");
// 	$("#statusinfo").addClass("none");

// 	$("#columnChart").removeClass("show");
// 	$("#timeChart").removeClass("show");
// 	$("#pieChart").removeClass("show");
// 	$("#stats").removeClass("show");
// 	$("#statusinfo").addClass("show");
// 	$(".charts-toolbar").hide();
// }

// function filterAll() {
// 	// console.log(REF.filter)
// 	REF.filter = "all"
// 	if ($("#pieChart").hasClass("show")){
// 		renderMap()
// 		pieChart()
// 	} 
// 	if ($("#columnChart").hasClass("show")){
// 		renderMap()
// 		columnChart()
// 	}
// 	if ($("#timeChart").hasClass("show")){
// 		renderMap()
// 		timeChart()
// 	}
// 	if ($("#stats").hasClass("show")){
// 		renderMap()
// 		stats()
// 	} else {
// 		renderMap()
// 		stats()
// 	}
// 	if ($("#info").hasClass("show")){
// 		renderMap()
// 		info()
// 	}
	
// }

// function filterCounter() {
// 	switch (REF.filter) {
// 	  case "top5":
// 		counter = 5;
// 		break;
// 	  case "top10":
// 		counter = 10;
// 		break;
// 	  case "top25":
// 		counter = 25;
// 		break;
// 	  case "all":
// 		counter = 1000;
// 		break;
// 	  default:
// 		counter = 1000;
// 		break;
// 	}
//   }

// function topFive() {
// 	// console.log(REF.filter)
// 	REF.filter = "top5"
// 	if ($("#pieChart").hasClass("show")){
// 		renderMap()
// 		pieChart()
// 	}
// 	if ($("#columnChart").hasClass("show")){
// 		renderMap()
// 		columnChart()
// 	}
// 	if ($("#timeChart").hasClass("show")){
// 		renderMap()
// 		timeChart()
// 	}
// 	if ($("#stats").hasClass("show")){
// 		renderMap()
// 		stats()
// 	} else {
// 		renderMap()
// 		stats()
// 	}
// 	if ($("#info").hasClass("show")){
// 		renderMap()
// 		info()
// 	}
// }

// function topTen() {
// 	// console.log(REF.filter)
// 	REF.filter = "top10"
// 	if ($("#pieChart").hasClass("show")){
// 		renderMap()
// 		pieChart()
// 	}
// 	if ($("#columnChart").hasClass("show")){
// 		renderMap()
// 		columnChart()
// 	}
// 	if ($("#timeChart").hasClass("show")){
// 		renderMap()
// 		timeChart()
// 	}
// 	if ($("#stats").hasClass("show")){
// 		renderMap()
// 		stats()
// 	} else {
// 		renderMap()
// 		stats()
// 	}
// 	if ($("#info").hasClass("show")){
// 		renderMap()
// 		info()
// 	}
// }

// function topTwentyFive() {
// 	// console.log(REF.filter)
// 	REF.filter = "top25"
// 	if ($("#pieChart").hasClass("show")){
// 		renderMap()
// 		pieChart()
// 	}
// 	if ($("#columnChart").hasClass("show")){
// 		renderMap()
// 		columnChart()
// 	}
// 	if ($("#timeChart").hasClass("show")){
// 		renderMap()
// 		timeChart()
// 	}
// 	if ($("#stats").hasClass("show")){
// 		renderMap()
// 		stats()
// 	} else {
// 		renderMap()
// 		stats()
// 	}
// 	if ($("#info").hasClass("show")){
// 		renderMap()
// 		info()
// 	}
// }

// function fuelColors() {

// 	var ramdomcolor = []
	
// 	for(i=1;i<11;i++){		
// 		// fuelColors.push('#'+Math.floor(Math.random()*16777215).toString(16))
// 		r = Math.floor(Math.random() * 255);
//         g = Math.floor(Math.random() * 255);
//         b = Math.floor(Math.random() * 255);
       
//         ramdomcolor.push ('rgb(' + r + ', ' + g + ', ' + b + ')');
// }	
// return ramdomcolor

// }


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




// function to clear the map
//   function cleanmaplines(counter) {
// 	$("#clean").on("click", function () {
// 	  // alert(true)
// 	  counter += 1;
// 	  if (counter > 1) {
// 		//clean lines
// 		var elem = document.querySelectorAll('.myClass').forEach(function (a) {
// 		  a.remove();
// 		});
// 		//clean Markers
// 		var myMarkers = document.querySelectorAll('.leaflet-marker-icon').forEach(function (b) {
// 		  b.remove();
// 		});
// 		var shadow = document.querySelectorAll('.my-own-class').forEach(function (d) {
// 		  d.remove();
// 		});
// 	  }
// 	  // close the modal
// 	  $(".wtinfo").removeClass("wtinfo");
// 	  // clean toggler modal btn
// 	  $("#toggleMenu").remove();
// 	  $('#clean').remove();
// 	});
// 	return counter;
//   }

//   $("#clean").on("click", function () {
// 	// alert(true)
// 	counter += 1;
// 	if (counter > 1) {
// 	  //clean lines
// 	  var elem = document.querySelectorAll('.myClass').forEach(function (a) {
// 		a.remove();
// 	  });
// 	  //clean Markers
// 	  var myMarkers = document.querySelectorAll('.leaflet-marker-icon').forEach(function (b) {
// 		b.remove();
// 	  });
// 	  var shadow = document.querySelectorAll('.my-own-class').forEach(function (d) {
// 		d.remove();
// 	  });
// 	}
// 	// close the modal
// 	$(".wtinfo").removeClass("wtinfo");
// 	// clean toggler modal btn
// 	$("#toggleMenu").remove();
// 	$('#clean').remove();
//   });

// function to redraw the lines in the map


  
// function to make the polylines curve in the map
//   function curvePolilines(coordinates, event) {
// 	var latlngs = [];
// 	for (var i = 1; i < coordinates.length; i++) {
// 	  var latlng1 = Object.values(event.latlng), latlng2 = [coordinates[i][0], coordinates[i][1]];
// 	  var offsetX = latlng2[1] - latlng1[1], offsetY = latlng2[0] - latlng1[0];
// 	  var r = Math.sqrt(Math.pow(offsetX, 2) + Math.pow(offsetY, 2)), theta = Math.atan2(offsetY, offsetX);
// 	  if (offsetX > 0) {
// 		var thetaOffset = (6.14 / 19);
// 	  }
// 	  else {
// 		var thetaOffset = -(6.14 / 19);
// 	  }
// 	  var r2 = (r / 2) / (Math.cos(thetaOffset)), theta2 = theta + thetaOffset;
// 	  var midpointX = (r2 * Math.cos(theta2)) + latlng1[1], midpointY = (r2 * Math.sin(theta2)) + latlng1[0];
// 	  var midpointLatLng = [midpointY, midpointX];
// 	  latlngs.push(midpointLatLng);
// 	  // console.log(midpointLatLng)
// 	}
// 	return { i, latlngs };
//   }


// function to get the coordinates of the map 
// function ajaxCordsCall(coordinates) {

// 		// console.log(countries)

// 		// proposed by webtools
// 		for (var i = 0; i < countries.length; i++) {
// 				//   console.log(countries[i], L.labels[countries[i]].c)				
// 				coordinates.push(L.labels[countries[i]].c);	
// 		}		
// 	// $.ajax({
// 	//   type: 'GET',
// 	//   dataType: 'json',
// 	//   async: false,
// 	//   url: 'data/data.json',
// 	//   success: function (data) {
// 	// 	for (var i = 0; i < countries.length; i++) {
// 	// 	  $.each(data['features'], (index, obj) => {
// 	// 		for (let [key, value] of Object.entries(obj)) {
// 	// 		  if (countries[i].includes(value)) {
// 	// 			coordinates.push([(Object.entries(obj)[0][1].coordinates[1]), (Object.entries(obj)[0][1].coordinates[0])]);
// 	// 		  }
// 	// 		}
// 	// 	  });
// 	// 	}
// 	//   }
// 	// });
//   }


// function to change the navbar text according to selected in the map







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



		function printChart() { $("#chartContainer").highcharts().print()};
		function exportPngChart() { $("#chartContainer").highcharts().exportChart()};
		function exportJpegChart() { $("#chartContainer").highcharts().exportChart({type: 'image/jpeg'})};
		function exportPdfChart() { $("#chartContainer").highcharts().exportChart({type: 'application/pdf'})};
		function exportSvgChart() { $("#chartContainer").highcharts().exportChart({type: 'image/svg+xml'})};
		
		function exportXlsChart() { $("#chartContainer").highcharts().downloadXLS()};
		function exportCsvChart() { $("#chartContainer").highcharts().downloadCSV()};

		
		
		function mailContact() {
		  document.location = "mailto:ESTAT-ENERGY@ec.europa.eu?subject=ENERGY%20PRICES%20CONTACT&body=" +
		  encodeURIComponent(window.location.href);
		}
		
		function exportTable() {
		  window.open('data:application/vnd.ms-excel,' + encodeURIComponent($('.highcharts-data-table').html()));
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
	const unitAbbr = languageNameSpace.labels['abr_'+REF.unit];

	let title = ""
	let subtitle = ""
  
	let chartTitle = "";
	switch (REF.chart) {
	  case "lineChart":
		chartTitle = `${dataset} <br> ${unit} - ${time}`;
		title = `${dataset} - ${geoLabel} ${time}`;
		subtitle = "";
		break;
	  case "pieChart":
		chartTitle = `${dataset} <br> ${unit} - ${time}`;
		title = `${dataset} - ${geoLabel} ${time}`;
		subtitle = "";
		break;
	  case "depChart":
		chartTitle = `${languageNameSpace.labels["DEPTITLE"]} ${languageNameSpace.labels[REF.siec]} - ${REF.year}`;
		title = `${languageNameSpace.labels["DEPTITLE"]} ${languageNameSpace.labels[REF.siec]} - ${REF.year}`;
		subtitle = "";
		break;
	  case "barChart":
		chartTitle = `${dataset} <br> ${unit} - ${time}`;
		title = `${dataset} - ${geoLabel} ${time}`;
		subtitle = "";
		break;
	  default:    	 
	  chartTitle = `<strong>${geoLabel}</strong>, ${dataset} (${unitAbbr}) <br> ${time}`;
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

  function chartNormalTooltip(points) {
	const value = Highcharts.numberFormat(points[0].y, 4);
	const unit = `${languageNameSpace.labels["S_" + REF.currency]}/${languageNameSpace.labels["S_" + REF.unit]}`;
	const na = languageNameSpace.labels['FLAG_NA'];
	const title = REF.chartId==="lineChart" ?  points[0].key : points[0].x
	return this.y == 0 ? `<b>${title}<br>Total: <b>${na}</b>` : `<b>${title}<br>Total: <b>${value}</b> ${unit}`;
  }

  function pieTolltip(point) {
	// Assuming there is a variable 'unit' representing the unit you want to display
	const unit = REF.unit; // Replace 'your_unit' with the actual unit
	const na = languageNameSpace.labels['FLAG_NA'];
  
	const total = point.series.data.reduce((acc, point) => acc + point.y, 0);
	const percentage = (point.options.y / total) * 100;
	const formattedPercentage = Highcharts.numberFormat(percentage, 1);
	const formattedValue = Highcharts.numberFormat(point.y, 0, '', ' ');
  
	const formatPointTooltip = function () {
	  return `
	  <tr class="tooltipTableRow">
		<td><span style="color:${point.color}">\u25CF</span> ${formattedValue}</td>
		<td> ${unit}</td>
	  </tr>
	  <tr class="tooltipTableRow">
		<td><span style="color:${point.color}">\u25CF</span> ${formattedPercentage}</td>
		<td> %</td>
	  </tr>
	  `;
	};
  
	// Construct the complete tooltip content
	const tooltipRows = formatPointTooltip();
  
	// Create the HTML table structure
	const html = `<table id="tooltipTable" class="table_component"> 
	  <thead class="">
		<tr class="">
		  <th scope="col" colspan="2">${point.name}</th>                
		</tr>
	  </thead>
	  <tbody>
		${tooltipRows}
	  </tbody>
	</table>`;
  
	return html;   
  }
  
  function tooltipTable(points) {
	const dec = 0
  
	if(REF.percentage == 1 ){
	  let html = "";
	  html += `<table id="tooltipTable" class="table_component">                
				  <thead>
					<tr>
					  <th scope="cols">${points[0].x}</th>                    
					  <th scope="cols"></th>                    
					</tr>
				  </thead>`
		points.forEach(element => {
			const value = element.point.percentage.toFixed(0); // Limit decimals to three places
			const category = element.point.series.name; 
			const color = element.point.color;              
			html += `<tr>
						<td><svg width="10" height="10" style="vertical-align: baseline;"><circle cx="5" cy="5" r="3" fill="${color}" /></svg> ${category}</td>
						<td>${value} %</td>
					</tr>` 
		});
	  html += `</table>`;
	  return `<div>${html}</div>`;
	} else {
	  let html = "";
	  let totalAdded = false; // Flag to track if the total row has been added
	  let totalColor = "rgb(14, 71, 203)";
  
	  
	  // Sort the points so that the "Total" item is at the last place
	  const sortedPoints = points.sort(function (a, b) {
		if (a.series.name == languageNameSpace.labels['TOTAL']) return 1;
		if (b.series.name == languageNameSpace.labels['TOTAL']) return -1;
		return 0;
	  });
	  
	  html += `<table id="tooltipTable" class="table_component">                
		<thead>
		  <tr>
			<th scope="cols">${sortedPoints[0].key}</th>                    
			<th class="tooltipUnit" scope="cols">${REF.unit}</th>                    
		  </tr>
		</thead>`;
	  
	  sortedPoints.forEach(function (point) {
		const color = point.series.color;
		const value = point.y.toFixed(dec); // Limit decimals to three places
		const category = point.series.name;    
  
		if(REF.details != 0) {
		  html += `<tr>
		  <td><svg width="10" height="10" style="vertical-align: baseline;"><circle cx="5" cy="5" r="3" fill="${color}" /></svg> ${category}</td>
		  <td>${value}</td>
		</tr>`;
		}    
		// Check if point is "Total" and set the flag if found
		if (category == languageNameSpace.labels['total']) {
		  totalAdded = true;
		}
	  });
	  
	  // Check if all values are zero and display a message if they are
	  const allValuesZero = sortedPoints.every(function (point) {
		return point.y === 0;
	  });
	 
	  if (allValuesZero) {
		html = 
	  `<table id="tooltipTable" class="table_component">                
	  <thead>
		<tr>
		  <th scope="cols">${sortedPoints[0].key}</th>                                    
		</tr>
	  </thead><tr>      
	  <td>${languageNameSpace.labels["FLAG_NA"]}</td>
	</tr></table>`;
  
  
	  } else {
		// Add a row for the total if not already added
		if (!totalAdded) {
		  // Calculate the total sum of all values
		  const totalSum = sortedPoints.reduce(function (sum, point) {
			return sum + point.y;
		  }, 0);
	  
		  // Format the total sum with three decimal places
		  const totalValue = totalSum.toFixed(dec);
	  
		  // Add a row for the total
		//   html += `
		//   <tr class="TOTAL">
		// 	<td class="TOTAL"> ${languageNameSpace.labels['TOTAL']}</td>
		// 	<td class="TOTAL">${totalValue}</td>
		//   </tr>`;
		}
	  }    
	  html += `</table>`; 
	  return `<div>${html}</div>`;
	  
	}
  }


  function getDatasetNameByDefaultSIECAndTrade(fuel, trade) {
	for (const key in codesDataset) {
	  if (codesDataset.hasOwnProperty(key)) {
		const dataset = codesDataset[key];
		if (dataset.fuel.includes(fuel) && dataset.trade.includes(trade) ) {
			datasetobj = {
				name: key,
				unit: dataset.unit,
				defUnit: dataset.defaultUnit,
				defSiec: dataset.defaultSiec,
				siecs: dataset.siec,
			}
		  return datasetobj;
		}
	  }
	}
	return null;
  }


  function getTopFive(array) {
	function sortElements (a, b) {
	  return b[1] - a[1];
	}
	let sortedArray = array.slice().sort(sortElements);
	return sortedArray.slice(0, 5);
  }

  function getKeyByValue(object, targetValue) {
    // Iterate through each key-value pair in the object
    for (const key in object) {
        if (object.hasOwnProperty(key)) {
            // Construct a regular expression to match partial values
            const regex = new RegExp(targetValue, 'i'); // 'i' flag for case-insensitive matching
            // Check if the current value matches the target value partially
            if (regex.test(object[key])) {
                // If found, return the key
                return key;
            }
        }
    }
    // If the target value is not found, return null
    return null;
}
