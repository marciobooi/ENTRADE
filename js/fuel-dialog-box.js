var fuelboxNameSpace = {
	fuelDialogBox: null,

	drawFuelDialogBox: function () {		
	
		if(dataNameSpace.mq[0].matches) { //@media (max-width: 650px)
			var boxWidth = 650;
		} else if(dataNameSpace.mq[1].matches) {
			var boxWidth = 650;
		} else if(dataNameSpace.mq[2].matches){
			var boxWidth = 650;
		} else if(dataNameSpace.mq[3].matches){
			var boxWidth = 650;
		} else {
			var boxWidth = 320;
		}
		
		if (fuelboxNameSpace.fuelDialogBox !== null) {
			closeDialogBox(fuelboxNameSpace.fuelDialogBox);
		}	
		clearmapclose()
		fuelboxNameSpace.fuelDialogBox = new jBox('Modal', {
			addClass: 'check-style-modal position-box-modal',		
			id: 'fuel-box-modal',
			constructOnInit: true,
			position: {
				x: 'left',
				y: 'center'
			},
			title: languageNameSpace.labels["BOX_FUEL_TITLE"],
			blockScroll: false,
			blockScrollAdjust:true,
			theme:'TooltipDark',
			overlay: false,
			closeOnClick: 'body',
			closeOnEsc: true,
			closeButton: 'box',
			draggable: 'title',
			content: fuelboxNameSpace.fillFuelModalContent(),
			repositionOnOpen: true,
			repositionOnContent: true,
			preventDefault: true,
			width: boxWidth,
			height: 'auto',
			// Once jBox is closed, destroy it
			onCloseComplete: function () {
				this.destroy();
			}
		});
		
		fuelboxNameSpace.fuelDialogBox.open();		
	},

	fillFuelModalContent: function () {
		var content = "";
		
		// console.log(tradeSiec)
		switch (REF.fuel) {
			case "solid":			
				newtradeSiec = Object.keys(tradeSiec).slice(0, 12).reduce((result, key) => {
                    result[key] = tradeSiec[key];
                    return result;
                }, {});
				break;
			case "oil":
				newtradeSiec = Object.keys(tradeSiec).slice(14, 52).reduce((result, key) => {
                    result[key] = tradeSiec[key];
                    return result;
                }, {});					
				break;			
			case "gas":
				newtradeSiec = Object.keys(tradeSiec).slice(52, 54).reduce((result, key) => {
                    result[key] = tradeSiec[key];
                    return result;
                }, {});
				break;
			case "biofuels":
				newtradeSiec = Object.keys(tradeSiec).slice(54, 60).reduce((result, key) => {
                    result[key] = tradeSiec[key];
                    return result;
                }, {});
				break;
			case "electricity":
				newtradeSiec = Object.keys(tradeSiec).slice(60, 62).reduce((result, key) => {
                    result[key] = tradeSiec[key];
                    return result;
                }, {});
				break;
			default:
				newtradeSiec = tradeSiec;
				break;
		}
		$.each(newtradeSiec, function (idx, obj) {		
			//loop for display correspondent band for each data set
	
				//Display bands belonging to the selected dataset					
				// if($.inArray(idx, codesDataset[dataNameSpace.dataset].siec) > 0) {			

					var checkSiec = "";
					if (REF.siec == idx) {
						checkSiec = "checked";
					}				
					var siec = "<div class=\"buttonStyle sub-nav-text\">"
						+ "<input type=\"radio\" name=\"radio\"  id=\"" + idx + "\" class=\"radio\" onclick=\"fuelboxNameSpace.changeSiec('" + idx + "')\" " + checkSiec + ">"
						+ "<label for=\"" + idx + "\">" + obj + "</label>"
						+ "</div>";
					content = content + siec;
					var i = 0;
								
				// }  	
		
		
		});
		return content;
	},
	changeSiec: function (siec) {		
		closeDialogBox(fuelboxNameSpace.fuelDialogBox);		
		REF.siec = siec;
		dataNameSpace.setDataset();	
		$(".wtinfoshow").addClass("wtinfo");

		$("#header-title-Label").html(languageNameSpace.labels[REF.trade] + " " + languageNameSpace.labels["title6"] + " " + languageNameSpace.labels[REF.siec]);
        $("#subHeader-title").html([dataNameSpace.ref.year]);	
	}
};