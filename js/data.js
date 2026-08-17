const dataNameSpace = {
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

	// reference variables for global diagram setup + default settings
	ref: {	
		"geo": "",
		"year": "2022", 
		"language": "EN", // language selected 
		"trade": "imp",
		"siec": "G3000",	
		"filter": "top5",
		"fuel":"gas",
		"unit": "TJ_GCV",
		"defaultUnit": "TJ_GCV",
		"detail": 1, 
		"chart": "map",
		"dataset": "nrg_ti_gas"
	},

	setRefURL: function () {		
		let url = window.location.href;
		const end = url.indexOf("?");
		url = (end > 0) ? url.slice(0, end) : url.slice(0);
		let iref = 0;
		const value = dataNameSpace.ref.geo;
		if (typeof value !== 'undefined' && value) {
			for (const ref in dataNameSpace.ref) {		
				url += (iref === 0) ? "?" : "&";
				url += ref + "=" + dataNameSpace.ref[ref].toString();
				iref++;
			}
		}
		
		changeUrl("title", url);
	},

	// get global ref variables in URL
	getRefURL: function () {		
		const refURL = getUrlVars();
		for (const ref in dataNameSpace.ref) {
			if (typeof refURL[ref] === "undefined") continue;
			dataNameSpace.ref[ref] = refURL[ref];
		}
	},

	dataset: ""
};

// global shortcut to reference setting
const REF = dataNameSpace.ref;
