// var tradeboxNameSpace = {
// 	tradeDialogBox: null,

// 	drawTradeDialogBox: function () {		
	
// 		if(dataNameSpace.mq[0].matches) { //@media (max-width: 650px)
// 			var boxWidth = 350;
// 		} else if(dataNameSpace.mq[1].matches) {
// 			var boxWidth = 350;
// 		} else if(dataNameSpace.mq[2].matches){
// 			var boxWidth = 350;
// 		} else if(dataNameSpace.mq[3].matches){
// 			var boxWidth = 450;
// 		} else {
// 			var boxWidth = 400;
// 		}
		
// 		if (tradeboxNameSpace.tradeDialogBox !== null) {
// 			closeDialogBox(tradeboxNameSpace.tradeDialogBox);
// 		}	
// 		clearmapclose()


// 		tradeboxNameSpace.tradeDialogBox = new jBox('Modal', {
// 			addClass: 'check-style-modal position-box-modal',
// 			id: 'trade-box-modal',
// 			constructOnInit: true,
// 			position: {
// 				x: 'left',
// 				y: 'center'
// 			},
// 			title: languageNameSpace.labels["BOX_TRADE_TITLE"],
// 			blockScroll: false,
// 			overlay: false,
// 			closeOnClick: 'body',
// 			closeOnEsc: true,
// 			closeButton: 'box',
// 			draggable: 'title',
// 			content: tradeboxNameSpace.fillTradeModalContent(),
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
		
// 		tradeboxNameSpace.tradeDialogBox.open();
// 	},

// 	fillTradeModalContent: function () {
// 		var content = "";
// 		$.each(trade, function (idx, obj) {
			
// 					var checkTrade = "";
// 					if (REF.trade == idx) {
// 						checkTrade = "checked";
// 					}
// 					var trade = "<div class=\"buttonStyle sub-nav-text\">"
// 						+ "<input type=\"radio\" name=\"radio\"  id=\"" + idx + "\" class=\"radio\" onclick=\"tradeboxNameSpace.changeSiec('" + idx + "')\" " + checkTrade + ">"
// 						+ "<label for=\"" + idx + "\">" + obj + "</label>"
// 						+ "</div>";
// 					content = content + trade;
// 					var i = 0;
// 		});
// 		return content;
// 	},
// 	changeSiec: function (trade) {
// 		closeDialogBox(tradeboxNameSpace.tradeDialogBox);
		
// 		REF.trade = trade;
		
// 		if(REF.trade == "exp"){			
		
// 			$(".leaflet-interactive").css("fill", "green");		
// 			$("#header-title-Label").html(languageNameSpace.labels[REF.trade] + " " + languageNameSpace.labels["title6"] + " " + languageNameSpace.labels[REF.siec]);
// 			if(newTitle == undefined){
// 				newTitle = ""
// 			} else {
// 				newTitle = newTitle
// 			}
// 			$("#subHeader-title").html(newTitle + "  " + [dataNameSpace.ref.year]);		
// 		} else {
		
// 			$(".leaflet-interactive").css("fill", "rgb(40, 110, 180)");		
// 			$("#header-title-Label").html(languageNameSpace.labels[REF.trade] + " " + languageNameSpace.labels["title6"] + " " + languageNameSpace.labels[REF.siec]);
// 			if(newTitle == undefined){
// 				newTitle = ""
// 			} else {
// 				newTitle = newTitle
// 			}
// 			$("#subHeader-title").html(newTitle + "  " + [dataNameSpace.ref.year]);	
// 		}			
// 	}
// };








	





















