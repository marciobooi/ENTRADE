function tableInfo() {
// console.log("here")
	$(function () {

		$('.wtinfo').draggable();
		$('.wtinfo').addClass('open');		

	});

	content = '<div id="sidepanel" class="d-flex">' +
		'<h1 style="padding-left:1em">' + newTitle + "<img class=\"flag\" alt=\"country flag\" src=\"https://flagcdn.com/w40/" + flagname.toLowerCase() + ".png\">" +
		'</h1>' +
		'</div>' +
		'<div class="myclass" style="">' +
		'<div class="">' +
		'<div class="wtCharts">' +
		'<div class="charts-toolbar text-right" style="display: none;">' +	
		'<a onclick="bulkDownlod()"><i class="fas fa-file-csv"></i> '+ languageNameSpace.labels["title7"]+'</span></a>'+
		'<a id="customtb" onclick="table()"><i class="fas fa-table"></i> '+ languageNameSpace.labels["title8"]+'</span></a>' +		
		'<a id="customtimetb" class="none" onclick="timelineTable()"><i class="fas fa-table"></i> '+ languageNameSpace.labels["title8"]+'</span></a>' +		
		'</div>' +
		'<div class="highcharts-container">' +
		'<div id="columnChart" class="none"></div>' +
		'<div id="pieChart" class="none"></div>' +
		'<div id="timeChart" class="none"></div>' +
		'<div class="menu">' +
		'<div class="d-flex justify-content-around p-3">' +
		'<div class="menuIcos"><img title="'+ languageNameSpace.labels["btn1"] +'" id="main" onclick="stats()" class="imgHover unselected" src="./img/menu.png" alt=""></div>' +
		'<div class="menuIcos"><img title="'+ languageNameSpace.labels["btn2"] +'" id="pieChart" onclick="pieChart()" class="imgHover unselected" src="./img/dialogbox/pie.png" alt=""></div>' +
		'<div class="menuIcos"><img title="'+ languageNameSpace.labels["btn3"] +'" id="barChart" onclick="columnChart()" class="imgHover unselected" src="./img/dialogbox/bar.png" alt=""></div>' +
		'<div class="menuIcos"><img title="'+ languageNameSpace.labels["btn4"] +'" id="timeChart" onclick="timeChart()" class="imgHover unselected" src="./img/dialogbox/time.png" alt=""></div>' +
		'<div class="menuIcos"><img title="'+ languageNameSpace.labels["btn5"] +'" id="info" onclick="info()" class="imgHover unselected" src="./img/dialogbox/info.png" alt=""></div>' +
		'<div class="menuIcos"><img title="'+ languageNameSpace.labels["btn6"] +'" id="info" onclick="animation()" class="imgHover unselected" src="./img/dialogbox/play.png" alt=""></div>' +
		'</div>' + 
		'</div>' + 
		'<div class="btn-group d-flex justify-content-between" role="group">' +
		'<button type="button" class="btn blue" onclick="filterAll()">'+languageNameSpace.labels["allbtn"]+'</button>' +
		'<button type="button" class="btn blue" onclick="topFive()">'+languageNameSpace.labels["top5btn"]+'</button>' +
		'<button type="button" class="btn blue" onclick="topTen()">'+languageNameSpace.labels["top10btn"]+'</button>' +
		'<button type="button" class="btn blue" onclick="topTwentyFive()">'+languageNameSpace.labels["top25btn"]+'</button>' +
		'</div>';
	content += '<div id="statusinfo" class="none">'

	$.ajax({

		url: "data/glossary_" + languageNameSpace.languageSelected + ".json",
		type: "GET",
		dataType: "json",
		async: false,
		success: function (data) {

			content += "<div class=\"glossary-full-screen\">"
			switch (REF.fuel) {
				case "solid":
					content += data["trade_title"]
							+ data["trade_solid_sub_title"] 	
							+ data["trade_solid"] 				
	
					break;
				case "oil":
					content += data["trade_title"]
							+ data["trade_oil_sub_title"] 	
							+ data["trade_oil"] 				
	
					break;		
				case "gas":
					content += data["trade_title"]
							+ data["trade_gas_sub_title"] 	
							+ data["trade_gas"] 				
	
					break;	
				case "biofuels":
					content += data["trade_title"]
							+ data["trade_biofuels_sub_title"] 	
							+ data["trade_biofuels"] 				
	
					break;	
				case "electricity":
					content += data["trade_title"]
							+ data["trade_electricity_sub_title"] 	
							+ data["trade_electricity"] 				
	
					break;	
			
				default:
					break;
				}

				content +='</div>'

		},
		error: function () {
			error("fillGlossaryModalContent: No data found!");
		}
	});

	content += "</div>"; 
		+ '</div>';

	content += '<div  id="stats">' 
		if(countries.length === 0){
			
		} else {
			content +='<table id="countryRanking" width="100%" class="table table-borderless table-hover text-center">'
				+ '<thead class="thead-dark">' + '<tr>'
				+ '<th scope="col">'+ languageNameSpace.labels["title1"] + '</th>' 
				+ '<th scope="col">'+languageNameSpace.labels["title2"] + '<small> (' + languageNameSpace.labels[REF.unit] + ')</th>' 
				+ '</tr>' 
				+ '</thead>' 
				+ '<tbody>';
			let c = 0;
			$.each(countries, function (idx, obj) {
				content += '<tr><td class="namesRanking">' + languageNameSpace.labels[countries[c]] + '</td>';
				content += '<td class="valuesRanking text-right pr-6">' + (Math.round(countriesValue[c] * 10) / 10).toLocaleString("en-EN").replace(',', ' ')  + '<small> ' + languageNameSpace.labels['abr_'+REF.unit] + '</td>';
				content += "</tr>";
				c++;
			}); 
			+ '</tbody>'
			+ '</table>'
			+ '</div>' 
		}
		

	content += '<div>' 
		+ '<table id="rankingTable" width="100%" class="table mt-3 table-borderless table-hover text-center">' 
		+ '<thead class="thead-dark">' 
		+ '<tr>' 
		+ '<th scope="col">'+languageNameSpace.labels["title3"]+'</th>' 
		+ '<th scope="col">'+languageNameSpace.labels["title2"]+'<small> (' + languageNameSpace.labels[REF.unit] + ')</th>' 
		+ '</tr>' 
		+ '</thead>' 
		+ '<tbody>   ';
	let b = 0;
	$.each(countriesAgregated, function (idx, obj) {		
		content += '<tr><td class="names">' + languageNameSpace.labels[obj] + '</td>';
		content += '<td class="values text-right pr-6">' + (Math.round(countriesAgregatedValue[b] * 10) / 10).toLocaleString("en-EN").replace(',', ' ')  + '<small> ' + languageNameSpace.labels['abr_'+REF.unit] + '</td>';
		content += "</tr>";
		b++;
	});
	content += '</tbody>' + '</table>' + '</div>' + '</div>' + '</div>' + '</div>' + '</div>' + '</div>' + '</div>' + '</div>' 

	content = content


	switch (REF.chart) {
		case "pie":
			setTimeout(function () {
				
				pieChart()
				REF.chart = "";
			 }, 100);
			break;
		case "col":
			setTimeout(function () {
			
				columnChart()
				REF.chart = "";
			 }, 100);
			break;
		case "time":
			setTimeout(function () {
				
				timeChart()
				REF.chart = "";
			 }, 100);
			break;
		case "info":
			setTimeout(function () {
				
				info()
				REF.chart = "";
			 }, 100);
			break;	
		default:
			setTimeout(function () {	
						
				stats()
				REF.chart = "";	
			 }, 100);
			break;
	}
	var i = 0;

	return content;
}