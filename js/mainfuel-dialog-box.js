// /**
//  * The main fuel box object.  This object is responsible for creating the main fuel box.
//  * @type {object}
//  */
// var mainfuelboxNameSpace = {
// 	mainFuelDialogBox: null,

//  /**
//   * Draws the main fuel dialog box.
//   * @returns None
//   */
// 	drawmainFuelDialogBox: function () {		
	
// 		if(dataNameSpace.mq[0].matches) { //@media (max-width: 650px)
// 			var boxWidth = 350;
// 		} else if(dataNameSpace.mq[1].matches) {
// 			var boxWidth = 350;
// 		} else if(dataNameSpace.mq[2].matches){
// 			var boxWidth = 350;
// 		} else if(dataNameSpace.mq[3].matches){
// 			var boxWidth = 450;
// 		} else {
// 			var boxWidth = 450;
// 		}
		
// 		if (mainfuelboxNameSpace.mainFuelDialogBox !== null) {
// 			closeDialogBox(mainfuelboxNameSpace.mainFuelDialogBox);
// 		}	
// 		mainfuelboxNameSpace.mainFuelDialogBox = new jBox('Modal', {
// 			addClass: 'check-style-modal position-box-modal',
// 			id: 'main-fuel-box-modal',
// 			constructOnInit: true,
// 			position: {
// 				x: 'left',
// 				y: 'center'
// 			},
// 			title: languageNameSpace.labels["BOX_FUEL_TITLE"],
// 			blockScroll: false,
// 			overlay: false,
// 			closeOnClick: 'body',
// 			closeOnEsc: true,
// 			closeButton: 'box',
// 			draggable: 'title',
// 			content: mainfuelboxNameSpace.fillMainFuelModalContent(),
// 			repositionOnOpen: true,
// 			repositionOnContent: true,
// 			preventDefault: true,
// 			width: boxWidth,
// 			height: 'auto',
// 			// Once jBox is closed, destroy it
// 			onCloseComplete: function () {
// 				this.destroy();
// 			}
// 		});
		
// 		mainfuelboxNameSpace.mainFuelDialogBox.open();
// 	},

//  /**
//   * Fill the main fuel modal content with the correct fuel types.		
//   * @returns None		
//   */
// 	fillMainFuelModalContent: function () {
// 		var content = "";		
// 		$.each(tradeFuel, function (idx, obj) {
			
			
// 			//loop for display correspondent band for each data set
	
// 				//Display bands belonging to the selected dataset					
// 				// if($.inArray(idx, codesDataset[dataNameSpace.dataset].siec) > 0) {			

// 					var checkFuel = "";
// 					if (REF.fuel == idx) {
// 						checkFuel = "checked";
// 					}
// 					var fuel = "<div class=\"buttonStyle sub-nav-text\">"
// 						+ "<input type=\"radio\" name=\"radio\"  id=\"" + idx + "\" class=\"radio\" onclick=\"mainfuelboxNameSpace.changefuel('" + idx + "')\" " + checkFuel + ">"
// 						+ "<label for=\"" + idx + "\">" + obj + "</label>"
// 						+ "</div>";
// 					content = content + fuel;
// 					var i = 0;					
// 				// }	
		
		
// 		});
// 		return content;
// 	},
//  /**
//   * Changes the fuel type and updates the dataset accordingly.		
//   * @param fuel - the new fuel type		
//   * @returns None		
//   */
// 	changefuel: function (fuel) {
// 		closeDialogBox(mainfuelboxNameSpace.mainFuelDialogBox);
// 		REF.fuel = fuel;
// 		// dataNameSpace.setDataset();
// 		fuelboxNameSpace.drawFuelDialogBox()		
// 	}
// };