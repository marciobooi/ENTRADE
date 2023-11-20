var findmoreboxNameSpace = {
	titleOnly: true,
	valueOnly: true,
	findMoreBox: null,

	drawFindMoreDialogBox: function () {



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

		if (findmoreboxNameSpace.findMoreBox !== null) {
			closeDialogBox(findmoreboxNameSpace.findMoreBox);
		}
		findmoreboxNameSpace.findMoreBox = new jBox('Modal', {
			addClass: 'check-style-modal position-box-modal',
			id: 'find-more-box-modal',
			constructOnInit: true,
			position: {
				x: 'left',
				y: 'center'
			},
			title: languageNameSpace.labels["BOX_MORE_TITLE"],
			blockScroll: false,
			overlay: false,
			closeOnClick: 'body',
			closeOnEsc: true,
			closeButton: 'box',
			draggable: 'title',			
			content: findmoreboxNameSpace.fillFindMoreModalContent(),
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
		findmoreboxNameSpace.findMoreBox.open();
	},
	
	openStatisticExplained: function () {
		window.open("https://ec.europa.eu/eurostat/statistics-explained/index.php?title=Energy_price_statistics_-_background");
	},
	
	openDefinitions: function () {
		window.open("https://ec.europa.eu/eurostat/statistics-explained/index.php?title=Category:Energy_glossary");
	},
	
	openMetadata: function () {
		window.open("https://ec.europa.eu/eurostat/cache/metadata/en/nrg_t_esms.htm", "_self");
	},
	
	openContact: function () {
		document.location = "mailto:ESTAT-ENERGY@ec.europa.eu?subject=ENERGY%20TRADE%20CONTACT&body="+encodeURIComponent(window.location.href);
	},

	openCOOKIES: function () {
		window.open("https://ec.europa.eu/info/cookies_"+ REF.language.toLowerCase());
	},
	openPRIVACY: function () {
		window.open("https://ec.europa.eu/info/privacy-policy_"+ REF.language.toLowerCase());
	},
	openLEGAL: function () {
		window.open("https://ec.europa.eu/info/legal-notice_"+ REF.language.toLowerCase());
	},
	
	fillFindMoreModalContent: function () {	
		
		var content = 
			"<div id=\"dialog-find-more-content\">"
				+"<div class=\"buttonStyle sub-nav-text\" onclick=\"$('.jBox-closeButton').click();tutorial();\">"
					+languageNameSpace.labels["TUTORIAL"]
				+"</div>"
				// +"<div class=\"buttonStyle sub-nav-text\" onclick=\"$('.jBox-closeButton').click();findmoreboxNameSpace.openStatisticExplained();\">"
				// 	+languageNameSpace.labels["ENTRADE_EXPLAINED"]
				// +"</div>"
				+"<div class=\"buttonStyle sub-nav-text\" data-toggle='modal' data-target='#energyModal' onclick=\"$('.jBox-closeButton').click();\">"
					+languageNameSpace.labels["DEFINITIONS"]
				+"</div>"
				+"<div class=\"buttonStyle sub-nav-text\" onclick=\"$('.jBox-closeButton').click();findmoreboxNameSpace.openMetadata();\">"
					+languageNameSpace.labels["METADATA"]
				+"</div>"
				+"<div class=\"buttonStyle sub-nav-text\" onclick=\"$('.jBox-closeButton').click();openDataset();\">"
					+languageNameSpace.labels["ENTRADE_DATASET"]
				+"</div>"

	

				


			+"</div>"

		return content;
	}

};







