let buttonTimer;
let currentStep;
let isOpen = false

function setCookie(name, value, days = 30) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "expires=" + date.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
}

function getCookie(name) {
    const nameEQ = name + "=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookieArray = decodedCookie.split(';');
    for (let i = 0; i < cookieArray.length; i++) {
        let cookie = cookieArray[i].trim();
        if (cookie.indexOf(nameEQ) == 0) return cookie.substring(nameEQ.length, cookie.length);
    }
    return null;
}

function checkAndShowTutorial() {
    const tutorialCookie = getCookie("tutorialShown");
    if (!tutorialCookie) {
        // If the cookie doesn't exist, show the tutorial and set the cookie
        setTimeout(() => {
            tutorial(); // Function to show the tutorial
            setCookie("tutorialShown", "true", 30); // Set cookie for 30 days
        }, 600);
    }
}

function tutorial(buttonTimer) {

	closeTutorial()

	const introProfile = introJs();

	itens = [
    {
      title: languageNameSpace.tutorial["START_TOUR_TITLE"],
      intro: languageNameSpace.tutorial["START_TOUR_TEXT"],
    },
    {
      element: document.querySelector("#focus411"),
      title: languageNameSpace.tutorial["STEP1_TITLE"],
      intro: languageNameSpace.tutorial["STEP1_TEXT"],
      position: "auto",
    },
    {
      element: document.querySelector(".wt-map-menu"),
      title: languageNameSpace.tutorial["STEP1_TITLE"],
      intro: languageNameSpace.tutorial["STEP1_TEXT"],
      position: "auto",
    },
    {
      element: document.querySelector("#menu"),
      title: languageNameSpace.tutorial["STEP1_TITLE"],
      intro: languageNameSpace.tutorial["STEP1_TEXT"],
      position: "auto",
    },
    {
      element: document.querySelector("#infoBtnChart"),
      title: languageNameSpace.tutorial["STEP6_TITLE"],
      intro: languageNameSpace.tutorial["STEP6_TEXT"],
      position: "auto",
    },
    // {
    //   element: document.querySelector(".wtfooter"),
    //   title: languageNameSpace.tutorial["STEP7_TITLE"],
    //   intro: languageNameSpace.tutorial["STEP7_TEXT"],
    //   position: 'auto'
    // },
    {
      element: document.querySelector("#toggleLanguageBtn"),
      title: languageNameSpace.tutorial["STEP8_TITLE"],
      intro: languageNameSpace.tutorial["STEP8_TEXT"],
      position: "auto",
    },
    {
      element: document.querySelector("#social-media"),
      title: languageNameSpace.tutorial["STEP9_TITLE"],
      intro: languageNameSpace.tutorial["STEP9_TEXT"],
    },
  ];



	introProfile.setOptions({
		showProgress: false,
		scrollToElement: false,
		showBullets: false,
		autoPosition:false,
		tooltipClass: "customTooltip",
		exitOnEsc: true,
		nextLabel:  languageNameSpace.labels['tutNEXT'],
		prevLabel: languageNameSpace.labels['tutBACK'],
		doneLabel: languageNameSpace.labels['tutFINISH'],
		steps: itens
	  });  	 
	  
	introProfile.onexit(function () { window.scrollTo(0, 0) });
	
		  const observer = new MutationObserver(() => {
        // Locate the tooltip and title elements
        const tooltip = document.querySelector(".introjs-tooltip");
        const currentStep = introProfile._currentStep;

        if (tooltip && itens[currentStep].title) {
          const titleId = `introjs-title-${currentStep}`;

          const titleElement = tooltip.querySelector(".introjs-tooltip-title");
          if (titleElement) {
            titleElement.id = titleId;
            tooltip.setAttribute("aria-labelledby", titleId);
          }
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });

	  introProfile.start();
  
	  isOpen = true

	  introProfile.onchange(function () {

		currentStep = this._currentStep

		if (currentStep === 0) {
			const prevButton = document.querySelector("body > div.introjs-tooltipReferenceLayer > div > div.introjs-tooltipbuttons > a.introjs-button.introjs-prevbutton");
			if (prevButton) {
				prevButton.textContent = languageNameSpace.labels['tutFINISH'];
				setTimeout(() => {
					const disabledButton = document.querySelector("body > div.introjs-tooltipReferenceLayer > div > div.introjs-tooltipbuttons > a.introjs-button.introjs-prevbutton.introjs-disabled");
					if (disabledButton) {
						disabledButton.classList.add("close");
					}
				}, 100);
			}
		} else {
			const prevButton = document.querySelector("body > div.introjs-tooltipReferenceLayer > div > div.introjs-tooltipbuttons > a.introjs-button.introjs-prevbutton");
			if (prevButton) {
				prevButton.textContent = languageNameSpace.labels['tutBACK'];
				prevButton.classList.remove("close");
			}

			const autoTooltip = document.querySelector(".introjs-tooltip.customTooltip.introjs-auto");
			if (autoTooltip) {
				autoTooltip.style.left = "50% !important";
				autoTooltip.style.top = "50%";
				autoTooltip.style.marginLeft = "auto";
				autoTooltip.style.marginTop = "auto";
				autoTooltip.style.transform = "translate(-50%,-50%)";
			}
		}

	  });

	const closeHeaderBtn = document.querySelector("body > div.introjs-tooltipReferenceLayer > div > div.introjs-tooltip-header > a");
	if (closeHeaderBtn) {
		closeHeaderBtn.setAttribute("alt", "Close");
		closeHeaderBtn.setAttribute("id", "tutorialClose");
		closeHeaderBtn.setAttribute("tabindex", "0");
		closeHeaderBtn.setAttribute("href", "javascript:");
                closeHeaderBtn.setAttribute("class", "ecl-button ecl-button--secondary min-with--nav");
	}

	traptutorialfocus();

}

function closeTutorial() {
	buttonTimer = setTimeout(() => { introJs().exit(); }, 4000);	
	isOpen = false;
	const infoBtn = document.querySelector("button#INFO");
	if (infoBtn) infoBtn.focus();
}

const btn = document.querySelector("body > div.introjs-tooltipReferenceLayer > div > div.introjs-tooltipbuttons > a.introjs-button.introjs-nextbutton");
if (btn) {
	btn.addEventListener('click', () => {
		clearTimeout(buttonTimer);	
	});
}

function closeProcess(event) {
	event.preventDefault();
	introJs().exit();
	buttonTimer = setTimeout(() => { introJs().exit(); }, 4000);
	clearTimeout(buttonTimer);
	isOpen = false;
	const infoBtn = document.querySelector("button#INFO");
	if (infoBtn) infoBtn.focus();
}

const tutorialCloseBtn = document.querySelector("#tutorialClose");
if (tutorialCloseBtn) {
	tutorialCloseBtn.addEventListener("click", (event) => {
		closeProcess(event);
	});

	tutorialCloseBtn.addEventListener("keydown", (event) => {
		if (event.key === "Escape" || event.key === "Enter" || event.keyCode === 13) {
			closeProcess(event);
		}
	});
}

document.addEventListener("click", function(event) {
	if (event.target && event.target.classList.contains("close")) {
		closeProcess(event);
	}
});

document.addEventListener("keydown", function(event) {
	if (event.target && event.target.classList.contains("close")) {
		if (event.key === "Escape" || event.key === "Enter" || event.keyCode === 13) {
			closeProcess(event);
		}
	}
});

document.addEventListener('keydown', function(event) {
	if (event.key === 'Escape') {
		if(isOpen){
			closeProcess(event);
		} 
	}
});



  function traptutorialfocus() {	

	const focusableElements = '.introjs-tooltip.customTooltip.introjs-floating a[role="button"][tabindex="0"]:not([tabindex="-1"])';
	const element = document.querySelector('.introjs-tooltip.customTooltip.introjs-floating');

	log(element)
  
	if (element) {
	  const focusableContent = element.querySelectorAll(focusableElements);
	  const firstFocusableElement = focusableContent[0];
	  const lastFocusableElement = focusableContent[focusableContent.length - 1];
  
	  document.addEventListener('keydown', function (e) {
		const isTabPressed = e.key === 'Tab' || e.keyCode === 9;
  
		if (!isTabPressed) {
		  return;
		}
  
		if (e.shiftKey) {
		  if (document.activeElement === firstFocusableElement) {
			lastFocusableElement.focus();
			e.preventDefault();
		  }
		} else {
		  if (document.activeElement === lastFocusableElement) {
			firstFocusableElement.focus();
			e.preventDefault();
		  }
		}
	  });
  
	  // Set initial focus on the first focusable element
	  if (focusableContent.length > 0) {
		firstFocusableElement.focus();
	  }
	}
  };
  


