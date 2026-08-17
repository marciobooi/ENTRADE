const languageNameSpace = {

	//Label containers for the selected language
	labels: {}, 
	tutorial: {}, 
	
	//selected language
	languageSelected: '',
	_listeners: [],

	onLanguageChange: function (callback) {
		if (typeof callback === 'function') {
			this._listeners.push(callback);
		}
	},

	//init of the labels for the language defined in the URL
	initLanguage: async function (val, language = val) {
		languageNameSpace.languageSelected = language;
		
		try {
			const translationsResponse = await fetch('data/translations.json');
			const translationsData = await translationsResponse.json();
			const labels = {};

			for (const key in translationsData) {
				if (translationsData[key][language]) {
					// Assign the translation for the specified language to the labels object
					labels[key] = translationsData[key][language];
				}
			}
		
			// Set the filtered language data to languageNameSpace.labels
			languageNameSpace.labels = labels;
		} catch (err) {
			console.error(`initLanguage: no labels found for "${language}"`, err);
			// Fall back to English once, rather than leaving labels empty -
			// but only if EN itself isn't what just failed, to avoid looping.
			if (language !== 'EN') {
				return languageNameSpace.initLanguage('EN');
			}
		}

		try {
			const tutorialResponse = await fetch(`data/tutorial_${language}.json`);
			const tutorialData = await tutorialResponse.json();
			languageNameSpace.tutorial = tutorialData;
		} catch (err) {
			console.error(`initLanguage: no tutorial data found for "${language}"`, err);
		}
		
		// Set labels for the selected language when DOM is ready
		if (document.readyState === 'loading') {
			document.addEventListener('DOMContentLoaded', () => {
				languageNameSpace.updatePageLabels();
			});
		} else {
			languageNameSpace.updatePageLabels();
		}
	},

	async updatePageLabels() {
		const elementsId = ["#header-title-label"];
	
		elementsId.forEach(id => {
			const element = document.querySelector(id);
			if (element) {
				const labelKey = id.substring(1);
				const label = languageNameSpace.labels[labelKey];
				element.setAttribute('title', label);
				element.setAttribute('data-original-title', label);
				element.setAttribute('aria-label', label);
				element.textContent = label;
			}
		});

		removeComponents();
		await buildComponents();

		const footerCookies = document.getElementById("footer-cookies");
		if (footerCookies) {
			footerCookies.textContent = languageNameSpace.labels["COOKIES"];
		}

		const footerPrivacy = document.getElementById("footer-privacy");
		if (footerPrivacy) {
			footerPrivacy.textContent = languageNameSpace.labels["PRIVACY"];
		}

		const footerLegal = document.getElementById("footer-legal");
		if (footerLegal) {
			footerLegal.textContent = languageNameSpace.labels["LEGAL"];
		}

		const footerAccess = document.getElementById("footer-access");
		if (footerAccess) {
			footerAccess.textContent = languageNameSpace.labels["ACCESS"];
		}

		// Clean up any existing tooltips before re-initializing
		cleanupTooltips();

		getTitle();
		enableTooltips();
	},
		
	ChangeLanguage: async function (val) {
		REF.language = val;
		// Awaited: renderMap() rebuilds the map toolbar (buildMapToolbar,
		// js/map/mapToolbar.js) reading languageNameSpace.labels at that exact
		// moment - calling it before the translations fetch inside
		// initLanguage() resolves meant the freshly-rebuilt toolbar's
		// aria-labels/titles were read from the OLD language. The setTimeout
		// block that used to run 700ms later tried to patch this after the
		// fact via #wt-button-home > span selectors, but the current toolbar
		// (mapToolbar.js's makeBtn) only ever renders a bare <i> icon - no
		// <span> child exists, so those patches were silently no-ops even
		// when the timing happened to work out.
		await languageNameSpace.initLanguage(REF.language);
		removeChartOptions();
		renderMap();

		// Notify registered listeners (e.g., CCK, GLOBAN)
		this._listeners.forEach((callback) => {
			try {
				callback(val);
			} catch (err) {
				console.error("Error in language listener:", err);
			}
		});

		euGlobanContainer();
		document.documentElement.lang = REF.language.toLowerCase();
	}
	


};

