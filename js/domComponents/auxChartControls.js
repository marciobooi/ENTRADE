class ChartControls {
	constructor() {
	  this.controls = document.createElement("div");
  
	  const select = document.createElement("select");
	  // select.id = REF.chartId;
	  select.classList.add("form-select", "mx-2");
	  select.setAttribute("aria-label", "Select flow");
  
	  const notMobileContent = `
		<div class="container-fluid">
		  <nav aria-label="Chart controls" id="chartControls" class="navbar navbar-expand-sm navbar-light bg-light navChartControls">
			<div class="container-fluid">
			  <div id="auxChartTitle">
				<h2 id="title" class="title">title</h2>
				<h6 id="subtitle" class="subtitle">subtitle</h6>
			  </div>
			  <div class="menu">
				<ul id="chartBtns" role="menubar" aria-label="options graph toolbox" class="navbar-nav ms-auto my-2 my-lg-0 navbar-nav-scroll" style="--bs-scroll-height: 50vw;">
				  <li class="nav-item button px-1" id="toggleBarChart" role="none"></li>
				  <li class="nav-item button px-1" id="togglePieChart" role="none"></li>
				  <li class="nav-item button px-1" id="toggleLineChart" role="none"></li>
				  <li class="nav-item button px-1" id="toggleTable" role="none"></li>
				  <li class="nav-item button px-1" id="printChart" role="none"></li>
				  <li class="nav-item dropdown px-1" id="downloadChart" role="none"></li>
				  <li class="nav-item button px-1" id="downloadExcel" role="none"></li>
				  <li class="nav-item button px-1" id="embebedChart" role="none"></li>
				  <li class="nav-item button px-1" id="closeChart" role="none"></li>
				</ul>
			  </div>
			</div>
		  </nav>
		</div>`;
  
	  const mobileContent = `
		<div id="chartOptions">
		  <div class="col-12 subNavOne auxChartbtn">
			<button id="tools" class="btnGroup pe-2" type="button" aria-label="${languageNameSpace.labels["TOOLS"]}" title="${languageNameSpace.labels["TOOLS"]}" aria-haspopup="true">
			  <i class="fas fa-ellipsis-h" aria-hidden="true"></i>
			  <span class="iconText">${languageNameSpace.labels["TOOLS"]}</span>
			</button>
			<div class="menu d-none">
			  <ul id="chartBtns" role="menubar" aria-label="options graph toolbox" class="navbar-nav ms-auto my-2 my-lg-0 navbar-nav-scroll" style="--bs-scroll-height: 50vw;">
				<li class="nav-item button px-1" id="toggleBarChart" role="none"></li>
				<li class="nav-item button px-1" id="togglePieChart" role="none"></li>
				<li class="nav-item button px-1" id="toggleLineChart" role="none"></li>
				<li class="nav-item button px-1" id="toggleTable" role="none"></li>
				<li class="nav-item button px-1" id="printChart" role="none"></li>
				<li class="nav-item dropdown px-1" id="downloadChart" role="none"></li>
				<li class="nav-item button px-1" id="downloadExcel" role="none"></li>
				<li class="nav-item button px-1" id="embebedChart" role="none"></li>
				<li class="nav-item button px-1" id="closeChart" role="none"></li>
			  </ul>
			</div>
		  </div>
		  <div class="col-12 subNavTwo">
			<div id="auxChartTitle">
			  <h2 id="title" class="title">title</h2>
			  <h6 id="subtitle" class="subtitle">subtitle</h6>
			</div>
		  </div>
		</div>`;	
		
  
	  if (isMobile) {
		log(isMobile);
		this.controls.innerHTML = mobileContent;
		this.toolsButton = this.controls.querySelector("#tools");
		this.chartToolsMenu = this.controls.querySelector(".menu");
  
		this.toolsButton.addEventListener("click", () => {
		  this.chartToolsMenu.classList.toggle("d-none");
		  this.toolsButton.style.display = "none";
		});
	  } else {		
		this.controls.innerHTML = notMobileContent;
	  }
	}
  
	addToDOM(targetElement) {
	  $("#menuToolbar").toggle();	
	  const container = document.querySelector(targetElement);
	  container.insertBefore(this.controls, container.firstChild);

	    // Create the button instances
		const barChart = new Button("barChart", ["ecl-button", "ecl-button--primary", "round-btn"], "Toggle bar Chart", "barChart", "false");
		const pieChart = new Button("pieChart", ["ecl-button", "ecl-button--primary", "round-btn"], "Toggle pie Chart", "pieChart", "true");
		const lineChart = new Button("lineChart", ["ecl-button", "ecl-button--primary", "round-btn"], "Toggle line Chart", "lineChart", "false");
		const tableChart = new Button("tableChart", ["ecl-button", "ecl-button--primary", "round-btn"], "Toggle table", "tableChart", "false");
		const createprintChart = new Button("printBtn", ["ecl-button", "ecl-button--primary", "round-btn"], "Print chart", "false");
		const downloadChart = new Button("downloadBtn", ["ecl-button", "ecl-button--primary", "round-btn"], "Download chart image", "false");
		const downloadExcel = new Button("excelBtn", ["ecl-button", "ecl-button--primary", "round-btn"], "Download chart data", "false");
		const embebedeChart = new Button("embebedBtn", ["ecl-button", "ecl-button--primary", "round-btn"], "Embebed chart iframe", "false");
		const closeChart = new Button("btnCloseModalChart", ["ecl-button", "ecl-button--primary", "round-btn"], "Close", "false");
	
		// Set inner HTML content for each button
		barChart.setInnerHtml('<i class="fas fa-chart-bar" aria-hidden="true"></i>');
		pieChart.setInnerHtml('<i class="fas fa-chart-pie" aria-hidden="true"></i>');
		lineChart.setInnerHtml('<i class="fas fa-chart-line" aria-hidden="true"></i>');
		tableChart.setInnerHtml('<i class="fas fa-table" aria-hidden="true"></i>');
		createprintChart.setInnerHtml('<i class="fas fa-print" aria-hidden="true"></i>');
		downloadChart.setInnerHtml('<i class="fas fa-download" aria-hidden="true"></i>');
		downloadExcel.setInnerHtml('<i class="fas fa-file-excel" aria-hidden="true"></i>');
		embebedeChart.setInnerHtml('<i class="fas fa-code" aria-hidden="true"></i>');
		closeChart.setInnerHtml('<i class="fas fa-times" aria-hidden="true"></i>');
	
		// Set click handlers for each button
		barChart.setClickHandler(function() {
		  disableChatOptionsBtn(this.value);
		  REF.chart = this.value;
		  createBarChart()
		});
		pieChart.setClickHandler(function() {
		  disableChatOptionsBtn(this.value);
		  REF.chart = this.value;
		  createPieChart()
		});
		lineChart.setClickHandler(function() {
		  disableChatOptionsBtn(this.value);
		  REF.chart = this.value;
		  createLineChart()
		});
		tableChart.setClickHandler(function() {
		  disableChatOptionsBtn(this.value);
		  REF.chart = this.value;
		  createTableChart()
		});
		createprintChart.setClickHandler(function() {
			exportHandling(this.id);
		});
		downloadChart.setClickHandler(function() {
			exportHandling(this.id);
		});
		downloadExcel.setClickHandler(function() {
			exportHandling(this.id);
		});
		embebedeChart.setClickHandler(function() {
			exportHandling(this.id);
		});
		closeChart.setClickHandler(function() {
		  removeChartOptions();
		});

	  	  // Create the button elements
			const barChartElement = barChart.createButton();
			const pieChartElement = pieChart.createButton();
			const lineChartElement = lineChart.createButton();
			const tableChartElement = tableChart.createButton();
			const printChartElement = createprintChart.createButton();
			const downloadChartElement = downloadChart.createButton();
			const downloadExcelElement = downloadExcel.createButton();
			const embebedeChartElement = embebedeChart.createButton();
			const closeChartElement = closeChart.createButton();

		
			// Append the button elements to the document
			document.getElementById("toggleBarChart").appendChild(barChartElement);
			document.getElementById("togglePieChart").appendChild(pieChartElement);
			document.getElementById("toggleLineChart").appendChild(lineChartElement);
			document.getElementById("toggleTable").appendChild(tableChartElement);
			document.getElementById("printChart").appendChild(printChartElement);
			document.getElementById("downloadChart").appendChild(downloadChartElement);
			document.getElementById("downloadExcel").appendChild(downloadExcelElement);
			document.getElementById("embebedChart").appendChild(embebedeChartElement);
			document.getElementById("closeChart").appendChild(closeChartElement);

			tableChart.setDisabled(true);
	}
  
	removeFromDOM() {
	  let navElement;
	  if (isMobile) {
		navElement = document.querySelector("#chartOptions");
	  } else {
		navElement = document.querySelector("div > nav.navChartControls");
	  }
  
	  if (navElement) {
		const parentContainer = navElement.closest("#subnavbar-container > div");
		if (parentContainer) {
		  parentContainer.parentNode.removeChild(parentContainer);
		}
	  }
	  $("#menuToolbar").toggle();
	
	}
  }
  
  function disableChatOptionsBtn(chartid) {
	const charts = ["barChart", "pieChart", "lineChart", "tableChart"];  
	charts.forEach(chart => {
	  if (chartid == chart) {
		$("#" + chart).attr("disabled", "disabled");
	  } else {
		$("#" + chart).removeAttr("disabled");
	  }
	});
  }
  