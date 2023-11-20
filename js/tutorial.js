// Define the tour!


var buttonTimer

function tutorial(buttonTimer) {

	closeTutorial()

	if(isMobile) {
		elementName = document.querySelector(".nothing")
	} else {
		elementName = document.querySelectorAll(".icoContainer")[0]
	}



	introJs().setOptions({
		showProgress: true,
		scrollToElement: true,		
		tooltipClass: 'customTooltip',
		steps: [
		{
			title: languageNameSpace.tutorial["START_TOUR_TITLE"],
			intro: languageNameSpace.tutorial["START_TOUR_TEXT"],
		},
		{
		  element: document.querySelector("#menu-container > nav"),
		  title: languageNameSpace.tutorial["STEP1_TITLE"],
		  intro: languageNameSpace.tutorial["STEP1_TEXT"],
		  position: 'bottom'
		},
		{
		  element: document.querySelector("#country-selection-menu-icon"),
		  title: languageNameSpace.tutorial["STEP2_TITLE"],
		  intro: languageNameSpace.tutorial["STEP2_TEXT"],
		  position: 'bottom'
		},
		{
		  element: document.querySelector("#product-selection-menu-icon"),		 
		  title: languageNameSpace.tutorial["STEP3_TITLE"],
		  intro: languageNameSpace.tutorial["STEP3_TEXT"],
		  position: 'bottom'
		},
		{			
			
		  element:document.querySelector("img#unit-selection-menu-icon"),
		  title: languageNameSpace.tutorial["STEP4_TITLE"],
		  intro: languageNameSpace.tutorial["STEP4_TEXT"],
		  position: 'bottom-middle-aligned',
		},
		{			
		  element: document.querySelector("#country-filter"),
		  title: languageNameSpace.tutorial["STEP5_TITLE"],
		  intro: languageNameSpace.tutorial["STEP5_TEXT"],
		  position: 'bottom'
		},
		{			
		  element:document.querySelector("#find-more-menu-icon"),
		  title: languageNameSpace.tutorial["STEP6_TITLE"],
		  intro: languageNameSpace.tutorial["STEP6_TEXT"],
		  position: 'bottom'
		},
		{			
		  element: document.querySelector("#page > footer"),
		  title: languageNameSpace.tutorial["STEP7_TITLE"],
		  intro: languageNameSpace.tutorial["STEP7_TEXT"],
		  position: 'left'
		},
		{			
		  element: document.querySelector("#lang-selection"),
		  title: languageNameSpace.tutorial["STEP8_TITLE"],
		  intro: languageNameSpace.tutorial["STEP8_TEXT"],
		  position: 'left'
		},
		{
			element:document.querySelector("#social-media"),
			title: languageNameSpace.tutorial["STEP9_TITLE"],			
			intro: languageNameSpace.tutorial["STEP9_TEXT"],			
		  }
		]
	  }).start();	  	  

}

function closeTutorial() {	
	buttonTimer = setTimeout( function() {
		introJs().exit();
	  },4000);
}

btn = document.querySelector("body > div.introjs-tooltipReferenceLayer > div > div.introjs-tooltipbuttons > a.introjs-button.introjs-nextbutton")
$(document).on('click', btn, function() {
	clearTimeout(buttonTimer)	
});






