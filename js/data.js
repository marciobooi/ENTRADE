
var dataNameSpace = {

	version: "2",	

	// media queries
	mq: [
		window.matchMedia("(max-width: 650px)"),
		window.matchMedia("(min-width: 651px) and (max-width: 768px)"),
		window.matchMedia("(min-width: 769px) and (max-width: 992px)"),
		window.matchMedia("(min-width: 993px) and (max-width: 1280px)"),
		window.matchMedia("(min-width: 1281px)")
	],

	marginSmall: {
		top: 30,
		bottom: 25,
		left: 35
	},

	marginLarge: {
		top: 90,
		bottom: 25,
		left: 72
	},

//nrg_te_sff
	// reference variables for global diagram setup + default settings
	ref: {	
		"geo": "",
		"year": "2022", 
		"language": "EN", // language selected 
		"trade": "imp",
		"siec": "G3000",	
		"filter": "all",
		"fuel":"gas",
		"unit": "TJ_GCV",
		"defaultUnit": "TJ_GCV",
		"detail": 1, 
		"chart": "map",
		"dataset": "nrg_ti_gas"
		},

		// handle different window resolutions
		largeResHeightPixelThreshold: 650,
		isLargeRes: false,
		
		//calculate the diagram height
		calculateImgHeight: function (crop, width, margins) {
			var height = Math.min(width * 9 / 16., crop * ((window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight)) - margins.top - margins.bottom);
			dataNameSpace.isLargeRes = (height > dataNameSpace.largeResHeightPixelThreshold);
			return height;
		},
	
		//calculate the diagram width
		calculateImgWidth : function (crop, margins) {
			return crop * ((window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth) - margins.left);
		},

	setRefURL: function () {		
		var url = window.location.href;
		var end = url.indexOf("?");
		url = (end > 0) ? url.slice(0, end) : url.slice(0);
		var iref = 0;
		// console.log(dataNameSpace.ref)
		value = dataNameSpace.ref.geo
		if (typeof value !== 'undefined' && value) {
			for (ref in dataNameSpace.ref) {		
				url += (iref == 0) ? "?" : "&";
				url += ref + "=" + dataNameSpace.ref[ref].toString();
				iref++;
			};
		}else{
			
				// puyModal({title:'Country error',
				// message:'<p>'+languageNameSpace.labels["error"]+'</p>',
				// showHeader: true,
				// showFooter: false})
				// alert(true)
			
		}
		
		changeUrl("title", url);
	},

	// get global ref variables in URL
	getRefURL: function () {		
		var refURL = getUrlVars();
		for (var ref in dataNameSpace.ref) {
			if (typeof refURL[ref] === "undefined") continue;
			dataNameSpace.ref[ref] = refURL[ref];
			// dataNameSpace.ref.language = refURL.language
		};
		
	},

		// set dataset depending on product and band selected
		setDataset: function () {	

			$.each(codesDataset, function (idataset, dataset) {										
				// if(REF.siec == dataset.siec && REF.trade == dataset.trade) dataNameSpace.dataset = idataset; //&& $.inArray(REF.consoms, dataset.consoms) > -1				
				if(dataset.siec.indexOf(REF.siec) > -1 && dataset.trade.indexOf(REF.trade) > -1) dataNameSpace.dataset = idataset; //&& $.inArray(REF.consoms, dataset.consoms) > -1				
			});	

			if($.inArray(REF.unit, codesDataset[dataNameSpace.dataset].defaultUnit) == -1) {
				REF.unit = codesDataset[dataNameSpace.dataset].defaultUnit;
			}	
			if($.inArray(REF.defaultUnit, codesDataset[dataNameSpace.dataset].defaultUnit) == -1) {
				REF.defaultUnit = codesDataset[dataNameSpace.dataset].defaultUnit;
			}	
		
			// console.log("Dataset " + dataNameSpace.dataset);
		},		
	dataset: "",
	
	


};

// global shortcut to reference setting
var REF = dataNameSpace.ref;



// general visualisation settings
dataNameSpace.isLargeRes = (window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight) > dataNameSpace.largeResHeightPixelThreshold;
var imgWidth = dataNameSpace.calculateImgWidth(dataNameSpace.cropDefaultWidth, (dataNameSpace.isLargeRes ? dataNameSpace.marginLarge : dataNameSpace.marginSmall));
var imgHeight = dataNameSpace.calculateImgHeight(dataNameSpace.cropDefaultHeight, imgWidth, (dataNameSpace.isLargeRes ? dataNameSpace.marginLarge : dataNameSpace.marginSmall));






