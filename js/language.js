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
			url: 'data/labels_'+language+'.json',
			type: "GET",
			// contentType: "application/json; charset=ISO-8859-1",
			// //important for encoding character with accent
			// beforeSend: function(jqXHR) {
			// jqXHR.overrideMimeType('text/html;charset=iso-8859-1');
			// },
			dataType: "json",
			async: false,
			success: function (data) {
				languageNameSpace.labels = data;
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
			//contentType: "application/json; charset=ISO-8859-1",
			//important for encoding character with accent
			// beforeSend: function(jqXHR) {
			// 	jqXHR.overrideMimeType('text/html;charset=iso-8859-1');
			// },
			dataType: "json",
			async: false,
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
			
			// //set language in language drop down list
			// $("#lang-selection").val(languageNameSpace.languageSelected);		
			
			// // $('#lang-selection').on('change', function() {
			// // 	languageNameSpace.setLanguage( $(this).val());
			// // });		
			// $( "#lang-selection" ).change(function() {
			// 	console.log( "Handler for .change() called." );
			// 	languageNameSpace.setLanguage( $(this).val());
			//   });
			
			// language codes for mapping the menus
			$("#menu-product-title").text(languageNameSpace.labels["MENU_FUEL"]);
			$("#menu-unit-title").text(languageNameSpace.labels["MENU_UNIT"]);
			$("#menu-country-title").text(languageNameSpace.labels["MENU_TRADE"]);
			$("#menu-more-title").text(languageNameSpace.labels["MENU_MORE"]);			
			$("#filter-box-modal").text(languageNameSpace.labels["MENU_FILTER"]);	
			$("#main-filter-box-modal").text(languageNameSpace.labels["MENU_FILTER"]);	
			$("#menu-filter").text(languageNameSpace.labels["MENU_FILTER"]);	

			$(".disclaimerTitle").text(languageNameSpace.labels["DISCLAIMERTITLE"]);	
			$("disclaimerText").text(languageNameSpace.labels["DISCLAIMER"]);	
			// $("#header-title-Label").text(languageNameSpace.labels[dataNameSpace.dataset].slice(this.length, -19));


			
			// language codes for mapping solid fossil fuels
			tradeSiec["C0000X0350-0370"] = languageNameSpace.labels["C0000X0350-0370"];
			tradeSiec["C0100"] = languageNameSpace.labels["C0100"];
			tradeSiec["C0110"] = languageNameSpace.labels["C0110"];
			tradeSiec["C0121"] = languageNameSpace.labels["C0121"];
			tradeSiec["C0129"] = languageNameSpace.labels["C0129"];
			tradeSiec["C0200"] = languageNameSpace.labels["C0200"];
			tradeSiec["C0210"] = languageNameSpace.labels["C0210"];
			tradeSiec["C0220"] = languageNameSpace.labels["C0220"];
			tradeSiec["C0311"] = languageNameSpace.labels["C0311"];
			tradeSiec["C0320"] = languageNameSpace.labels["C0320"];
			tradeSiec["C0330"] = languageNameSpace.labels["C0330"];
			tradeSiec["C0340"] = languageNameSpace.labels["C0340"];
			tradeSiec["P1100"] = languageNameSpace.labels["P1100"];
			tradeSiec["P1200"] = languageNameSpace.labels["P1200"];
			
			tradeSiec["O4000"] = languageNameSpace.labels["O4000"];
			tradeSiec["O4000XBIO"] = languageNameSpace.labels["O4000XBIO"];
			tradeSiec["O4100_TOT_4200-4500"] = languageNameSpace.labels["O4100_TOT_4200-4500"];
			tradeSiec["O4100_TOT_4200-4500XBIO"] = languageNameSpace.labels["O4100_TOT_4200-4500XBIO"];
			tradeSiec["O4100_TOT"] = languageNameSpace.labels["O4100_TOT"];
			tradeSiec["O4200"] = languageNameSpace.labels["O4200"];
			tradeSiec["O4300"] = languageNameSpace.labels["O4300"];
			tradeSiec["O4400X4410"] = languageNameSpace.labels["O4400X4410"];
			tradeSiec["O4400"] = languageNameSpace.labels["O4400"];
			tradeSiec["O4500"] = languageNameSpace.labels["O4500"];
			tradeSiec["O4600"] = languageNameSpace.labels["O4600"];
			tradeSiec["O4600XBIO"] = languageNameSpace.labels["O4600XBIO"];
			tradeSiec["O4620"] = languageNameSpace.labels["O4620"];
			tradeSiec["O4630"] = languageNameSpace.labels["O4630"];
			tradeSiec["O4640"] = languageNameSpace.labels["O4640"];
			tradeSiec["O4651"] = languageNameSpace.labels["O4651"];
			tradeSiec["O4652"] = languageNameSpace.labels["O4652"];
			tradeSiec["O4652XR5210B"] = languageNameSpace.labels["O4652XR5210B"];
			tradeSiec["O4653"] = languageNameSpace.labels["O4653"];
			tradeSiec["O4661"] = languageNameSpace.labels["O4661"];
			tradeSiec["O4661XR5230B"] = languageNameSpace.labels["O4661XR5230B"];
			tradeSiec["O4669"] = languageNameSpace.labels["O4669"];
			tradeSiec["O4671"] = languageNameSpace.labels["O4671"];
			tradeSiec["O4671XR5220B"] = languageNameSpace.labels["O4671XR5220B"];
			tradeSiec["O46711"] = languageNameSpace.labels["O46711"];
			tradeSiec["O46712"] = languageNameSpace.labels["O46712"];
			tradeSiec["O4680"] = languageNameSpace.labels["O4680"];
			tradeSiec["O4681"] = languageNameSpace.labels["O4681"];
			tradeSiec["O4682"] = languageNameSpace.labels["O4682"];
			tradeSiec["O4691"] = languageNameSpace.labels["O4691"];
			tradeSiec["O4692"] = languageNameSpace.labels["O4692"];
			tradeSiec["O4693"] = languageNameSpace.labels["O4693"];
			tradeSiec["O4694"] = languageNameSpace.labels["O4694"];
			tradeSiec["O4695"] = languageNameSpace.labels["O4695"];
			tradeSiec["O4699"] = languageNameSpace.labels["O4699"];
			tradeSiec["R5210B"] = languageNameSpace.labels["R5210B"];
			tradeSiec["R5220B"] = languageNameSpace.labels["R5220B"];
			tradeSiec["R5230B"] = languageNameSpace.labels["R5230B"];

			tradeSiec["G3000"] = languageNameSpace.labels["G3000"];
			tradeSiec["G3200"] = languageNameSpace.labels["G3200"];

			tradeSiec["R5111"] = languageNameSpace.labels["R5111"];
			tradeSiec["R5210P"] = languageNameSpace.labels["R5210P"];
			tradeSiec["R5210E"] = languageNameSpace.labels["R5210E"];
			tradeSiec["R5220P"] = languageNameSpace.labels["R5220P"];
			tradeSiec["R5230P"] = languageNameSpace.labels["R5230P"];			
			tradeSiec["R5290"] = languageNameSpace.labels["R5290"];

			tradeSiec["E7000"] = languageNameSpace.labels["E7000"];
			tradeSiec["H8000"] = languageNameSpace.labels["H8000"];

	


			tradeFuel["solid"] = languageNameSpace.labels["solid"];
			tradeFuel["oil"] = languageNameSpace.labels["oil"];
			tradeFuel["gas"] = languageNameSpace.labels["gas"];
			tradeFuel["bio"] = languageNameSpace.labels["bio"];
			tradeFuel["electricity"] = languageNameSpace.labels["electricity"];
			
			trade["exp"] = languageNameSpace.labels["exp"];
			trade["imp"] = languageNameSpace.labels["imp"];

			tradeFilter["all"] = languageNameSpace.labels["all"];
			tradeFilter["top5"] = languageNameSpace.labels["top5"];
			tradeFilter["top10"] = languageNameSpace.labels["top10"];
			tradeFilter["top25"] = languageNameSpace.labels["top25"];			
		
			// language codes for mapping units
			tradeUnit["THS_T"] = languageNameSpace.labels["THS_T"];			
			tradeUnit["MIO_M3"] = languageNameSpace.labels["MIO_M3"];			
			tradeUnit["TJ_GCV"] = languageNameSpace.labels["TJ_GCV"];			
			tradeUnit["GWH"] = languageNameSpace.labels["GWH"];			
			tradeUnit["TJ"] = languageNameSpace.labels["TJ"];
			
			// language codes for agreegates
			agreegates["TOTAL"] = languageNameSpace.labels["TOTAL"];
			agreegates["NSP"] = languageNameSpace.labels["NSP"];
			agreegates["ASI_OTH"] = languageNameSpace.labels["ASI_OTH"];
			agreegates["ASI_NME_OTH"] = languageNameSpace.labels["ASI_NME_OTH"];
			agreegates["AFR_OTH"] = languageNameSpace.labels["AFR_OTH"];
			agreegates["EUR_OTH"] = languageNameSpace.labels["EUR_OTH"];	
			
			$(".cck-content-content > p").html(languageNameSpace.labels["COOKIETEXT"]);
			$(".cck-actions > a:nth-child(1)").text(languageNameSpace.labels["COOKIECOMPLETEacceptAll"]);
			$(".cck-actions > a:nth-child(2)").text(languageNameSpace.labels["COOKIECOMPLETEonlyTechnical"]);
			$(".cck-content-complete > p").html(languageNameSpace.labels["COOKIECOMPLETE"]);
			$(".cck-actions > a[href=\'#close']").text(languageNameSpace.labels["COOKIECOMPLETEclose"]);
			$(".cck-actions > a[href=\'#close']").append('<svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M16.538 15.205L13.32 11.99l3.199-3.194-1.332-1.332-3.2 3.193L8.812 7.48 7.48 8.812l3.177 3.177-3.195 3.199 1.334 1.333 3.193-3.2 3.217 3.217 1.333-1.333zm5.594-7.49a10.886 10.886 0 00-2.355-3.492 10.882 10.882 0 00-3.492-2.355A10.906 10.906 0 0012 1c-1.488 0-2.93.293-4.286.868a10.958 10.958 0 00-3.492 2.355 10.888 10.888 0 00-2.355 3.492A10.925 10.925 0 001 12a10.958 10.958 0 003.222 7.778 10.9 10.9 0 003.492 2.355C9.07 22.707 10.512 23 12 23a10.964 10.964 0 007.777-3.222 10.912 10.912 0 002.355-3.492A10.94 10.94 0 0023 12c0-1.487-.294-2.93-.868-4.285zM21.702 12a9.642 9.642 0 01-2.844 6.858A9.619 9.619 0 0112 21.703a9.635 9.635 0 01-6.859-2.844A9.617 9.617 0 012.298 12a9.619 9.619 0 012.843-6.859A9.615 9.615 0 0112 2.298a9.619 9.619 0 016.858 2.843A9.623 9.623 0 0121.703 12z"></path></svg>')
			
			addCredits();

			// //tutorial labels
			// tour.steps[0].title = languageNameSpace.tutorial["TUTO_1"];
			// tour.steps[0].content = languageNameSpace.tutorial["TUTO_2"];
			// tour.steps[1].title = languageNameSpace.tutorial["TUTO_3"];
			// tour.steps[1].content = languageNameSpace.tutorial["TUTO_4"];
			// tour.steps[2].title = languageNameSpace.tutorial["TUTO_5"];
			// tour.steps[2].content = languageNameSpace.tutorial["TUTO_6"];
			// tour.steps[3].title = languageNameSpace.tutorial["TUTO_7"];
			// tour.steps[3].content = languageNameSpace.tutorial["TUTO_8"];
			// tour.steps[4].title = languageNameSpace.tutorial["TUTO_9"];
			// tour.steps[4].content = languageNameSpace.tutorial["TUTO_10"];
			// tour.steps[5].title = languageNameSpace.tutorial["TUTO_11"];
			// tour.steps[5].content = languageNameSpace.tutorial["TUTO_12"];
			// tour.steps[6].title = languageNameSpace.tutorial["TUTO_13"];
			// tour.steps[6].content = languageNameSpace.tutorial["TUTO_14"];
			// tour.steps[7].title = languageNameSpace.tutorial["TUTO_15"];
			// tour.steps[7].content = languageNameSpace.tutorial["TUTO_16"];
			// tour.steps[8].title = languageNameSpace.tutorial["TUTO_17"];
			// tour.steps[8].content = languageNameSpace.tutorial["TUTO_18"];
			// tour.steps[9].title = languageNameSpace.tutorial["TUTO_19"];
			// tour.steps[9].content = languageNameSpace.tutorial["TUTO_20"];
			// tour.steps[10].title = languageNameSpace.tutorial["TUTO_21"];
			// tour.steps[10].content = languageNameSpace.tutorial["TUTO_22"];
			// tour.steps[11].title = languageNameSpace.tutorial["TUTO_23"];
			// tour.steps[11].content = languageNameSpace.tutorial["TUTO_24"];
			// tour.steps[12].title = languageNameSpace.tutorial["TUTO_25"];
			// tour.steps[12].content = languageNameSpace.tutorial["TUTO_26"];


			
			// promo_tour.steps[0].title = languageNameSpace.tutorial["PROMO_TUTO_1"];
			// promo_tour.steps[0].content = languageNameSpace.tutorial["PROMO_TUTO_2"];

		});
	},
		
	//Set language function
	// setLanguage: function (language) {
	// 	if (REF.geo == ""){      			
	// 		REF.language = language;
    //         languageNameSpace.initLanguage(REF.language);
	// 		$("#header-title-Label").html(languageNameSpace.labels["inittitle"])
	// 		$("#subHeader-title").html([dataNameSpace.ref.year]);
	// 	 }else {
	// 		$('#containerLoader').css('display', 'initial')
	// 		setTimeout(function(){
	// 			REF.language = language;
	// 			// dataNameSpace.setRefURL();
	// 			renderMap();
	// 			$('#containerLoader').css('display', 'none')
	// 		}, 2000);
	// 	 }
	// },
	myFunction: function (val) {
		REF.language = val;
		addCredits();
		if (REF.geo == ""){ 
            languageNameSpace.initLanguage(REF.language);
			$("#header-title-Label").html(languageNameSpace.labels["inittitle"])
			$("#subHeader-title").html([dataNameSpace.ref.year]);		
		 }else {
			$('#containerLoader').css('display', 'initial')
			setTimeout(function(){							
				renderMap();
				$('#containerLoader').css('display', 'none')
			}, 2000);
		 }

	}
};


function addCredits() {	
	setTimeout(function(){
	document.querySelectorAll(".credits").forEach(el => el.remove());

// $(".wtattribution")[0].childNodes[8].setAttribute("data-toggle","modal")
// $(".wtattribution")[0].childNodes[8].setAttribute("data-target","#modalLinks")






linksContent = 	"<div class='modalHeader'>"
+ '<button type="button" class="btn-close2" data-bs-dismiss="modal" aria-label="Close">x</button>'
+ "<h5 class='disclaimerTitle'>" + languageNameSpace.labels["DISCLAIMERTITLE"] + "</h5>"
+ "</div>"
+ "<div>"
+ '<p class="disclaimerText">' + languageNameSpace.labels["DISCLAIMER"] + '</p>'
+ "</div>" 


if($("#links").html() === "") {
  $("#links").append(linksContent);
}



	let creditLinks = '<div class="credits">'
		+'<span class="credits">  </span><a title="'+languageNameSpace.labels["COOKIES"]+'" href=\"https://ec.europa.eu/info/cookies_'+ REF.language.toLowerCase() +'\" target=\"_self\" class="credits">'+languageNameSpace.labels["COOKIES"]+'</a>'
		+ '<span class="credits"> | </span><a title="'+languageNameSpace.labels["PRIVACY"]+'" href=\"https://ec.europa.eu/info/privacy-policy_'+ REF.language.toLowerCase() +'\" target=\"_self\" class="credits">'+languageNameSpace.labels["PRIVACY"]+'</a>'
		+ '<span class="credits"> | </span><a  title="'+languageNameSpace.labels["LEGAL"]+'" href=\"https://ec.europa.eu/info/legal-notice_'+ REF.language.toLowerCase() +'\" target=\"_self\" class="credits">'+languageNameSpace.labels["LEGAL"]+'</a>'
		+ '</div>'

		$(".wtfooter").append(creditLinks);


		
		},3000)	
	}

