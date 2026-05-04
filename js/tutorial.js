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
            element: "#focus411",
            popover: {
                title: languageNameSpace.tutorial["STEP1_TITLE"],
                description: languageNameSpace.tutorial["STEP1_TEXT"],
            },
        },
        {
            element: ".wt-map-menu",
            popover: {
                title: languageNameSpace.tutorial["STEP1_TITLE"],
                description: languageNameSpace.tutorial["STEP1_TEXT"],
            },
        },
        {
            element: "#menu",
            popover: {
                title: languageNameSpace.tutorial["STEP1_TITLE"],
                description: languageNameSpace.tutorial["STEP1_TEXT"],
            },
        },
        {
            element: "#infoBtnChart",
            popover: {
                title: languageNameSpace.tutorial["STEP6_TITLE"],
                description: languageNameSpace.tutorial["STEP6_TEXT"],
            },
        },
        {
            element: "#toggleLanguageBtn",
            popover: {
                title: languageNameSpace.tutorial["STEP8_TITLE"],
                description: languageNameSpace.tutorial["STEP8_TEXT"],
            },
        },
        {
            element: "#social-media",
            popover: {
                title: languageNameSpace.tutorial["STEP9_TITLE"],
                description: languageNameSpace.tutorial["STEP9_TEXT"],
            },
        },
    ];

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
        },
        onDestroyed: () => {
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
