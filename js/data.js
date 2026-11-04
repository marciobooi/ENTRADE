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

		// Allowlist language: an invalid/unexpected value here (typo, garbage
		// query param) used to reach Navbar's constructor unchecked, which
		// does querySelector("#" + REF.language) and then unconditionally
		// calls .classList.add on the result - a TypeError on null that
		// aborted the rest of buildComponents(), including the trade/product/
		// unit/year dropdowns. Same allowlist footerComponent.js already uses.
		const ALLOWED_LANGS = ['EN', 'FR', 'DE'];
		const upperLang = (dataNameSpace.ref.language || 'EN').toUpperCase();
		dataNameSpace.ref.language = ALLOWED_LANGS.includes(upperLang) ? upperLang : 'EN';
	},

	dataset: ""
};

// global shortcut to reference setting
const REF = dataNameSpace.ref;

// entrade.html?accessibility shows the accessibility statement instead of the tool
function isAccessibilityMode() {
	return new URLSearchParams(window.location.search).has("accessibility");
}

function showAccessibilityView() {
	// hide whatever the tool shows
	document.querySelectorAll('#allContainer, #menuSwitch, #floatingMenu, #subnavbar-container')
		.forEach(el => el.classList.add('ecl-u-d-none'));
	const view = document.getElementById('accessibilityView');
	if (view) view.classList.remove('ecl-u-d-none');
	document.querySelectorAll('.a11y-back-link')
		.forEach(a => a.setAttribute('href', `?language=${REF.language}`));
	document.title = 'Accessibility statement - Energy trade flows - Eurostat';
}
