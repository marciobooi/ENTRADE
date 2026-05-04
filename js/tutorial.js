let isOpen = false;
let driverObj = null;

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
        if (cookie.indexOf(nameEQ) === 0) return cookie.substring(nameEQ.length, cookie.length);
    }
    return null;
}

function checkAndShowTutorial() {
    const tutorialCookie = getCookie("tutorialShown");
    if (!tutorialCookie) {
        setTimeout(() => {
            tutorial();
            setCookie("tutorialShown", "true", 30);
        }, 600);
    }
}

function closeAllDropdowns() {
    // Close ECL dropdown menus (info button, share button)
    document.querySelectorAll(".ecl-dropdown-menu.show").forEach((menu) => {
        menu.classList.remove("show");
        const btn = menu.previousElementSibling;
        if (btn) btn.setAttribute("aria-expanded", "false");
    });

    // Close language dropdown
    const langContainer = document.querySelector(".ecl-site-header__language-container.visible");
    if (langContainer) {
        langContainer.classList.remove("visible");
        const langBtn = document.querySelector("#toggleLanguageBtn");
        if (langBtn) langBtn.setAttribute("aria-expanded", "false");
    }

    // Close chart options menu (absent toggleMenu class = open)
    const chartOptionsMenu = document.querySelector("#chartOptionsMenu:not(.toggleMenu)");
    if (chartOptionsMenu) {
        chartOptionsMenu.classList.add("toggleMenu");
        const menuBtn = document.querySelector("#menu");
        if (menuBtn) menuBtn.classList.remove("menuOpen");
    }
}

function openChartMenu() {
    const menu = document.querySelector("#chartOptionsMenu");
    const btn = document.querySelector("#menu");
    if (menu && menu.classList.contains("toggleMenu")) {
        menu.classList.remove("toggleMenu");
        if (btn) btn.classList.add("menuOpen");
    }
}

function closeChartMenu() {
    const menu = document.querySelector("#chartOptionsMenu");
    const btn = document.querySelector("#menu");
    if (menu && !menu.classList.contains("toggleMenu")) {
        menu.classList.add("toggleMenu");
        if (btn) btn.classList.remove("menuOpen");
    }
}

function tutorial() {
    closeAllDropdowns();
    closeTutorial();

    const { driver } = window.driver.js;

    const steps = [
        {
            popover: {
                title: languageNameSpace.tutorial["START_TOUR_TITLE"],
                description: languageNameSpace.tutorial["START_TOUR_TEXT"],
                showButtons: ["next", "close"],
            },
        },
                {
            element: "#focus150",
            popover: {
                title: languageNameSpace.tutorial["STEP0_TITLE"],
                description: languageNameSpace.tutorial["STEP0_TEXT"],
            },
        },
        // Step 1 — menu button: clicking Next opens the chart options menu
        {
            element: "#menu",
            popover: {
                title: languageNameSpace.tutorial["STEP1_TITLE"],
                description: languageNameSpace.tutorial["STEP1_TEXT"],
                onNextClick: () => {
                    openChartMenu();
                    driverObj.moveNext();
                },
            },
        },
        // Steps 2-4 are inside the open chart options menu
        {
            element: "#containerTrade",
            popover: {
                title: languageNameSpace.tutorial["STEP2_TITLE"],
                description: languageNameSpace.tutorial["STEP2_TEXT"],
                // Going back from here closes the menu and returns to the menu button
                onPrevClick: () => {
                    closeChartMenu();
                    driverObj.movePrevious();
                },
            },
        },
        {
            element: "#containerFuel",
            popover: {
                title: languageNameSpace.tutorial["STEP3_TITLE"],
                description: languageNameSpace.tutorial["STEP3_TEXT"],
            },
        },
        {
            element: "#containerSiec",
            popover: {
                title: languageNameSpace.tutorial["STEP4_TITLE"],
                description: languageNameSpace.tutorial["STEP4_TEXT"],
            },
        },
        {
            element: "#containerYear",
            popover: {
                title: languageNameSpace.tutorial["STEP5_TITLE"],
                description: languageNameSpace.tutorial["STEP5_TEXT"],
            },
        },
        {
            element: "#containerUnit",
            popover: {
                title: languageNameSpace.tutorial["STEP6_TITLE"],
                description: languageNameSpace.tutorial["STEP6_TEXT"],
                // Last menu step: clicking Next closes the menu before advancing
                onNextClick: () => {
                    closeChartMenu();
                    driverObj.moveNext();
                },
            },
        },
        // Steps 5+ are outside the menu
        {
            element: "#switchBtn",
            popover: {
                title: languageNameSpace.tutorial["STEP7_TITLE"],
                description: languageNameSpace.tutorial["STEP7_TEXT"],
                // Going back re-opens the menu so the user returns to the last menu step
                onPrevClick: () => {
                    openChartMenu();
                    driverObj.movePrevious();
                },
            },
        },
        {
            element: "#infoBtnChart",
            popover: {
                title: languageNameSpace.tutorial["STEP8_TITLE"],
                description: languageNameSpace.tutorial["STEP8_TEXT"],
            },
        },
        {
            element: "#embebedBtn",
            popover: {
                title: languageNameSpace.tutorial["STEP9_TITLE"],
                description: languageNameSpace.tutorial["STEP9_TEXT"],
            },
        },

        
        {
            element: "#toggleLanguageBtn",
            popover: {
                title: languageNameSpace.tutorial["STEP11_TITLE"],
                description: languageNameSpace.tutorial["STEP11_TEXT"],
            },
        },
        {
            element: "#shareChart",
            popover: {
                title: languageNameSpace.tutorial["STEP12_TITLE"],
                description: languageNameSpace.tutorial["STEP13_TEXT"],
            },
        },
    ];

    let _lastStepIndex = 0;

    driverObj = driver({
        showProgress: false,
        smoothScroll: false,
        allowKeyboardControl: true,
        popoverClass: "customTooltip",
        nextBtnText: languageNameSpace.labels['tutNEXT'],
        prevBtnText: languageNameSpace.labels['tutBACK'],
        doneBtnText: languageNameSpace.labels['tutFINISH'],
        steps,
        onPopoverRender: (popover, { state }) => {
            // Set unique per-step id so aria-labelledby on the popover wrapper is accurate
            const idx = state.activeIndex ?? 0;
            const titleId = `driver-title-${idx}`;
            if (popover.title) {
                popover.title.id = titleId;
                popover.wrapper.setAttribute('aria-labelledby', titleId);
            }

            // driver.js always focuses _[0] (the close button, first in DOM).
            // Queue a rAF so it runs AFTER that focus theft and redirects to the
            // correct navigation button based on travel direction.
            const goingBack = idx < _lastStepIndex;
            _lastStepIndex = idx;
            requestAnimationFrame(() => {
                const preferred = goingBack ? popover.previousButton : popover.nextButton;
                const fallback  = goingBack ? popover.nextButton     : popover.previousButton;
                const btn = (preferred && !preferred.disabled && preferred.offsetParent !== null)
                    ? preferred
                    : (fallback && !fallback.disabled && fallback.offsetParent !== null)
                    ? fallback
                    : popover.closeButton;
                if (btn) btn.focus();
            });
        },
        onDestroyed: () => {
            closeChartMenu();
            window.scrollTo(0, 0);
            isOpen = false;
            driverObj = null;
            const infoBtn = document.querySelector("button#INFO");
            if (infoBtn) infoBtn.focus();
        },
    });

    driverObj.drive();
    isOpen = true;
}

function closeTutorial() {
    if (driverObj) {
        driverObj.destroy();
        // driverObj is nulled out inside onDestroyed
    }
    isOpen = false;
}

function closeProcess(event) {
    if (event) event.preventDefault();
    closeTutorial();
}

document.addEventListener("click", function (event) {
    if (event.target && event.target.classList.contains("close")) {
        closeProcess(event);
    }
});

document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && isOpen) {
        closeProcess(event);
    }
});
