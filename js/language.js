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
		
		const cookieTextElem = document.querySelector(".cck-content-content > p");
		if (cookieTextElem) {
			cookieTextElem.textContent = languageNameSpace.labels["COOKIETEXT"];
		}

		const cookieAcceptAll = document.querySelector(".cck-actions > a:nth-child(1)");
		if (cookieAcceptAll) {
			cookieAcceptAll.textContent = languageNameSpace.labels["COOKIECOMPLETEacceptAll"];
		}

		const cookieTechnical = document.querySelector(".cck-actions > a:nth-child(2)");
		if (cookieTechnical) {
			cookieTechnical.textContent = languageNameSpace.labels["COOKIECOMPLETEonlyTechnical"];
		}

		const cookieComplete = document.querySelector(".cck-content-complete > p");
		if (cookieComplete) {
			cookieComplete.textContent = languageNameSpace.labels["COOKIECOMPLETE"];
		}

		const closeButtons = document.querySelectorAll(".cck-actions > a[href='#close']");
		closeButtons.forEach(btn => {
			btn.textContent = languageNameSpace.labels["COOKIECOMPLETEclose"];
			const svgHTML = '<svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M16.538 15.205L13.32 11.99l3.199-3.194-1.332-1.332-3.2 3.193L8.812 7.48 7.48 8.812l3.177 3.177-3.195 3.199 1.334 1.333 3.193-3.2 3.217 3.217 1.333-1.333zm5.594-7.49a10.886 10.886 0 00-2.355-3.492 10.882 10.882 0 00-3.492-2.355A10.906 10.906 0 0012 1c-1.488 0-2.93.293-4.286.868a10.958 10.958 0 00-3.492 2.355 10.888 10.888 0 00-2.355 3.492A10.925 10.925 0 001 12a10.958 10.958 0 003.222 7.778 10.9 10.9 0 003.492 2.355C9.07 22.707 10.512 23 12 23a10.964 10.964 0 007.777-3.222 10.912 10.912 0 002.355-3.492A10.94 10.94 0 0023 12c0-1.487-.294-2.93-.868-4.285zM21.702 12a9.642 9.642 0 01-2.844 6.858A9.619 9.619 0 0112 21.703a9.635 9.635 0 01-6.859-2.844A9.617 9.617 0 012.298 12a9.619 9.619 0 012.843-6.859A9.615 9.615 0 0112 2.298a9.619 9.619 0 016.858 2.843A9.623 9.623 0 0121.703 12z"></path></svg>';
			btn.insertAdjacentHTML('beforeend', svgHTML);
		});
		
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

