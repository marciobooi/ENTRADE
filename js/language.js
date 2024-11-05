var languageNameSpace = {

	//Label containers for the selected language
	labels: {}, 
	tutorial: {}, 
	
	//selected language
	languageSelected: '',

	//init of the labels for the language defined in the URL
	initLanguage: function (val, language) {

		language = val
		
		languageNameSpace.languageSelected = language;
		
		$.ajax({
			url: 'data/translations.json',
			type: "GET",
			dataType: "json",
			async: false,
			success: function (data) {
				const labels = {};

				for (let key in data) {
					if (data[key][language]) {
						// Assign the translation for the specified language to the labels object
						labels[key] = data[key][language];
					}
				}
			
				// Set the filtered language data to languageNameSpace.labels
				languageNameSpace.labels = labels;
			},
			error: function () {
				console.log("Error with language: "+language);
				error("initLanguage: No label found!");
				//if language not found => set EN version by default
				languageNameSpace.setLanguage("EN");
				languageNameSpace.languageSelected = 'EN';
			}
		});

		$.ajax({
			url: 'data/tutorial_'+language+'.json',
			type: "GET",
			dataType: "json",
			async: true,
			success: function (data) {
				languageNameSpace.tutorial = data;
			},
			error: function () {
				console.log("Error with language: "+language);
				error("initLanguage: No data found for tutorial!");
			}
		});
		
		//set labels for the selected language
		$( document ).ready(function() {	


			const elementsId = ["#header-title-label"]
		
			elementsId.forEach(id => {
			  const element = $(id);
			  const label = languageNameSpace.labels[id.substring(1)];
			  element.attr({
				'title': label,
				'data-original-title': label,
				'aria-label': label
			  });
			  element.html(languageNameSpace.labels[id.substring(1)]);
			});

			

			removeComponents()
			buildComponents()		
			
			
			$(".cck-content-content > p").html(languageNameSpace.labels["COOKIETEXT"]);
			$(".cck-actions > a:nth-child(1)").text(languageNameSpace.labels["COOKIECOMPLETEacceptAll"]);
			$(".cck-actions > a:nth-child(2)").text(languageNameSpace.labels["COOKIECOMPLETEonlyTechnical"]);
			$(".cck-content-complete > p").html(languageNameSpace.labels["COOKIECOMPLETE"]);
			$(".cck-actions > a[href=\'#close']").text(languageNameSpace.labels["COOKIECOMPLETEclose"]);
			$(".cck-actions > a[href=\'#close']").append('<svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M16.538 15.205L13.32 11.99l3.199-3.194-1.332-1.332-3.2 3.193L8.812 7.48 7.48 8.812l3.177 3.177-3.195 3.199 1.334 1.333 3.193-3.2 3.217 3.217 1.333-1.333zm5.594-7.49a10.886 10.886 0 00-2.355-3.492 10.882 10.882 0 00-3.492-2.355A10.906 10.906 0 0012 1c-1.488 0-2.93.293-4.286.868a10.958 10.958 0 00-3.492 2.355 10.888 10.888 0 00-2.355 3.492A10.925 10.925 0 001 12a10.958 10.958 0 003.222 7.778 10.9 10.9 0 003.492 2.355C9.07 22.707 10.512 23 12 23a10.964 10.964 0 007.777-3.222 10.912 10.912 0 002.355-3.492A10.94 10.94 0 0023 12c0-1.487-.294-2.93-.868-4.285zM21.702 12a9.642 9.642 0 01-2.844 6.858A9.619 9.619 0 0112 21.703a9.635 9.635 0 01-6.859-2.844A9.617 9.617 0 012.298 12a9.619 9.619 0 012.843-6.859A9.615 9.615 0 0112 2.298a9.619 9.619 0 016.858 2.843A9.623 9.623 0 0121.703 12z"></path></svg>')
			
			addCredits();

			$("#footer-cookies").html(languageNameSpace.labels["COOKIES"]);
			$("#footer-privacy").html(languageNameSpace.labels["PRIVACY"]);
			$("#footer-legal").html(languageNameSpace.labels["LEGAL"]);
			$("#footer-access").html(languageNameSpace.labels["ACCESS"]);

	
				
		
		});
	},
		
	ChangeLanguage: function (val) {
		REF.language = val;
		languageNameSpace.initLanguage(REF.language);	
		removeChartOptions();	
		renderMap();
		setTimeout(() => {
			$("#wt-button-home > span").text(languageNameSpace.labels["HOME"]);
			$("#wt-button-zoomout > span").text(languageNameSpace.labels["ZOUT"]);
			$("#wt-button-zoomin > span").text(languageNameSpace.labels["ZIN"]);
			$("#wt-button-fullscreen > span").text(languageNameSpace.labels["FULL"]);
			$("#wt-button-clear > span").text(languageNameSpace.labels["CLEAR"]);

			$("#wt-button-home").attr("aria-label", languageNameSpace.labels["HOME"]);
			$("#wt-button-zoomout").attr("aria-label", languageNameSpace.labels["ZOUT"]);
			$("#wt-button-zoomin").attr("aria-label", languageNameSpace.labels["ZIN"]);
			$("#wt-button-fullscreen").attr("aria-label", languageNameSpace.labels["FULL"]);
			$("#wt-button-clear").attr("aria-label", languageNameSpace.labels["CLEAR"]);
		}, 700);
	  }

};


function addCredits() {	
	setTimeout( function() {
	document.querySelectorAll(".credits").forEach(el => el.remove());

	if($("#links").html() === "") {
	$("#links").append(linksContent);
	}

	const footerInstance  = new Footer();
	footerInstance.addToDOM('.wtfooter');

		

		},3000)	
	}

