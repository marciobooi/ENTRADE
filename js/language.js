const languageNameSpace = {

	//Label containers for the selected language
	labels: {}, 
	tutorial: {}, 
	
	//selected language
	languageSelected: '',

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
			console.error(`Error with language: ${language}`, err);
			error("initLanguage: No label found!");
			//if language not found => set EN version by default
			languageNameSpace.setLanguage("EN");
			languageNameSpace.languageSelected = 'EN';
		}

		try {
			const tutorialResponse = await fetch(`data/tutorial_${language}.json`);
			const tutorialData = await tutorialResponse.json();
			languageNameSpace.tutorial = tutorialData;
		} catch (err) {
			console.error(`Error with language: ${language}`, err);
			error("initLanguage: No data found for tutorial!");
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

	updatePageLabels() {
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
		buildComponents();		
		

		
		addCredits();

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
		
	ChangeLanguage: function (val) {
		REF.language = val;
		languageNameSpace.initLanguage(REF.language);	
		removeChartOptions();	
		renderMap();
		setTimeout(() => {
			const homeBtn = document.querySelector("#wt-button-home > span");
			if (homeBtn) homeBtn.textContent = languageNameSpace.labels["HOME"];

			const zoomoutBtn = document.querySelector("#wt-button-zoomout > span");
			if (zoomoutBtn) zoomoutBtn.textContent = languageNameSpace.labels["ZOUT"];

			const zoominBtn = document.querySelector("#wt-button-zoomin > span");
			if (zoominBtn) zoominBtn.textContent = languageNameSpace.labels["ZIN"];

			const fullscreenBtn = document.querySelector("#wt-button-fullscreen > span");
			if (fullscreenBtn) fullscreenBtn.textContent = languageNameSpace.labels["FULL"];

			const clearBtn = document.querySelector("#wt-button-clear > span");
			if (clearBtn) clearBtn.textContent = languageNameSpace.labels["CLEAR"];

			document.getElementById("wt-button-home")?.setAttribute("aria-label", languageNameSpace.labels["HOME"]);
			document.getElementById("wt-button-zoomout")?.setAttribute("aria-label", languageNameSpace.labels["ZOUT"]);
			document.getElementById("wt-button-zoomin")?.setAttribute("aria-label", languageNameSpace.labels["ZIN"]);
			document.getElementById("wt-button-fullscreen")?.setAttribute("aria-label", languageNameSpace.labels["FULL"]);
			document.getElementById("wt-button-clear")?.setAttribute("aria-label", languageNameSpace.labels["CLEAR"]);

			euGlobanContainer();

			document.documentElement.lang = REF.language.toLowerCase();

		}, 700);
	}
	


};


function addCredits() {	
	setTimeout(() => {
		document.querySelectorAll(".credits").forEach(el => el.remove());

		const linksElement = document.getElementById("links");
		if (linksElement && linksElement.textContent === "") {
			linksElement.insertAdjacentHTML('beforeend', linksContent);
		}

		const footerInstance = new Footer();
		footerInstance.addToDOM('.wtfooter');
	}, 3000);
}

