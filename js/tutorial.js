

const TutorialTour = (() => {
  const STORAGE_KEY = "tutorialSeen";
  const STORAGE_VERSION = "v1";

  const SELECTORS = {
    focus150: "#focus150",
    menuButton: "#menu",
    chartOptionsMenu: "#chartOptionsMenu",
    trade: "#containerTrade",
    fuel: "#containerFuel",
    siec: "#containerSiec",
    year: "#containerYear",
    unit: "#containerUnit",
    switchBtn: "#switchBtn",
    infoBtnChart: "#infoBtnChart",
    embeddedBtn: "#embebedBtn",
    languageBtn: "#toggleLanguageBtn",
    shareChart: "#shareChart",
    infoFallback: "button#INFO",
    openDropdowns: ".ecl-dropdown-menu.show",
    languageContainerVisible: ".ecl-site-header__language-container.visible"
  };

  let driverInstance = null;
  let lastStepIndex = 0;
  let previouslyFocusedElement = null;

  function isOpen() {
    return !!driverInstance;
  }

  function hasSeenTutorial() {
    try {
      return localStorage.getItem(STORAGE_KEY) === STORAGE_VERSION;
    } catch {
      return false;
    }
  }

  function markTutorialSeen() {
    try {
      localStorage.setItem(STORAGE_KEY, STORAGE_VERSION);
    } catch {
      // ignore storage errors
    }
  }

  function qs(selector) {
    return document.querySelector(selector);
  }

  function qsa(selector) {
    return Array.from(document.querySelectorAll(selector));
  }

  function exists(selector) {
    return !!qs(selector);
  }

  function closeAllDropdowns() {
    qsa(SELECTORS.openDropdowns).forEach((menu) => {
      menu.classList.remove("show");
      const btn = menu.previousElementSibling;
      if (btn) btn.setAttribute("aria-expanded", "false");
    });

    const langContainer = qs(SELECTORS.languageContainerVisible);
    if (langContainer) {
      langContainer.classList.remove("visible");
      const langBtn = qs(SELECTORS.languageBtn);
      if (langBtn) langBtn.setAttribute("aria-expanded", "false");
    }

    closeChartMenu();
  }

  function openChartMenu() {
    const menu = qs(SELECTORS.chartOptionsMenu);
    const btn = qs(SELECTORS.menuButton);
    if (menu?.classList.contains("toggleMenu")) {
      menu.classList.remove("toggleMenu");
      btn?.classList.add("menuOpen");
      btn?.setAttribute("aria-expanded", "true");
    }
  }

  function closeChartMenu() {
    const menu = qs(SELECTORS.chartOptionsMenu);
    const btn = qs(SELECTORS.menuButton);
    if (menu && !menu.classList.contains("toggleMenu")) {
      menu.classList.add("toggleMenu");
      btn?.classList.remove("menuOpen");
      btn?.setAttribute("aria-expanded", "false");
    }
  }

  function createStep({ element, title, description, onNextClick, onPrevClick, showButtons }) {
    const step = {
      popover: {
        title,
        description
      }
    };

    if (showButtons) step.popover.showButtons = showButtons;
    if (onNextClick) step.popover.onNextClick = onNextClick;
    if (onPrevClick) step.popover.onPrevClick = onPrevClick;

    // Only attach the element if it exists
    if (element && exists(element)) {
      step.element = element;
    }

    return step;
  }

  function buildSteps() {
    const t = languageNameSpace.tutorial;
    const l = languageNameSpace.labels;

    return [
      createStep({
        title: t["START_TOUR_TITLE"],
        description: t["START_TOUR_TEXT"],
        showButtons: ["next", "close"]
      }),

      createStep({
        element: SELECTORS.focus150,
        title: t["STEP0_TITLE"],
        description: t["STEP0_TEXT"]
      }),

      createStep({
        element: SELECTORS.menuButton,
        title: t["STEP1_TITLE"],
        description: t["STEP1_TEXT"],
        onNextClick: () => {
          openChartMenu();
          driverInstance?.moveNext();
        }
      }),

      createStep({
        element: SELECTORS.trade,
        title: t["STEP2_TITLE"],
        description: t["STEP2_TEXT"],
        onPrevClick: () => {
          closeChartMenu();
          driverInstance?.movePrevious();
        }
      }),

      createStep({
        element: SELECTORS.fuel,
        title: t["STEP3_TITLE"],
        description: t["STEP3_TEXT"]
      }),

      createStep({
        element: SELECTORS.siec,
        title: t["STEP4_TITLE"],
        description: t["STEP4_TEXT"]
      }),

      createStep({
        element: SELECTORS.year,
        title: t["STEP5_TITLE"],
        description: t["STEP5_TEXT"]
      }),

      createStep({
        element: SELECTORS.unit,
        title: t["STEP6_TITLE"],
        description: t["STEP6_TEXT"],
        onNextClick: () => {
          closeChartMenu();
          driverInstance?.moveNext();
        }
      }),

      createStep({
        element: SELECTORS.switchBtn,
        title: t["STEP7_TITLE"],
        description: t["STEP7_TEXT"],
        onPrevClick: () => {
          openChartMenu();
          driverInstance?.movePrevious();
        }
      }),

      createStep({
        element: SELECTORS.infoBtnChart,
        title: t["STEP8_TITLE"],
        description: t["STEP8_TEXT"]
      }),

      createStep({
        element: SELECTORS.embeddedBtn,
        title: t["STEP9_TITLE"],
        description: t["STEP9_TEXT"]
      }),

      createStep({
        element: SELECTORS.languageBtn,
        title: t["STEP11_TITLE"],
        description: t["STEP11_TEXT"]
      }),

      createStep({
        element: SELECTORS.shareChart,
        title: t["STEP12_TITLE"],
        description: t["STEP12_TEXT"]
      })
    ];
  }

  function focusPreferredPopoverButton(popover, activeIndex) {
    const goingBack = activeIndex < lastStepIndex;
    lastStepIndex = activeIndex;

    requestAnimationFrame(() => {
      const preferred = goingBack ? popover.previousButton : popover.nextButton;
      const fallback = goingBack ? popover.nextButton : popover.previousButton;

      const buttonToFocus =
        (preferred && !preferred.disabled && preferred.offsetParent !== null && preferred) ||
        (fallback && !fallback.disabled && fallback.offsetParent !== null && fallback) ||
        popover.closeButton;

      buttonToFocus?.focus();
    });
  }

  function start() {
    if (isOpen()) return;

    closeAllDropdowns();
    previouslyFocusedElement = document.activeElement;

    const { driver } = window.driver.js;
    const steps = buildSteps();

    driverInstance = driver({
      showProgress: false,
      smoothScroll: false,
      allowKeyboardControl: true,
      popoverClass: "customTooltip",
      nextBtnText: languageNameSpace.labels["tutNEXT"],
      prevBtnText: languageNameSpace.labels["tutBACK"],
      doneBtnText: languageNameSpace.labels["tutFINISH"],
      steps,

      onPopoverRender: (popover, { state }) => {
        const idx = state.activeIndex ?? 0;
        const titleId = `driver-title-${idx}`;

        if (popover.title) {
          popover.title.id = titleId;
          popover.wrapper.setAttribute("aria-labelledby", titleId);
        }

        focusPreferredPopoverButton(popover, idx);
      },

      onDestroyed: () => {
        closeChartMenu();
        window.scrollTo({ top: 0, behavior: "auto" });

        const fallbackFocus = qs(SELECTORS.infoFallback);
        const target =
          previouslyFocusedElement instanceof HTMLElement
            ? previouslyFocusedElement
            : fallbackFocus;

        driverInstance = null;
        lastStepIndex = 0;

        target?.focus?.();
      }
    });

    driverInstance.drive();
  }

  function stop(event) {
    if (event) event.preventDefault();
    driverInstance?.destroy();
  }

  async function checkAndShow() {
    if (hasSeenTutorial()) return;

    // optional: wait until at least core elements exist
    await waitForSelectors([SELECTORS.menuButton, SELECTORS.switchBtn], 2000);

    if (!isOpen()) {
      start();
      markTutorialSeen();
    }
  }

  function waitForSelectors(selectors, timeout = 2000) {
    return new Promise((resolve) => {
      const ready = () => selectors.every((selector) => exists(selector));
      if (ready()) return resolve(true);

      const observer = new MutationObserver(() => {
        if (ready()) {
          observer.disconnect();
          resolve(true);
        }
      });

      observer.observe(document.body, { childList: true, subtree: true });

      setTimeout(() => {
        observer.disconnect();
        resolve(false);
      }, timeout);
    });
  }

  return {
    start,
    stop,
    checkAndShow,
    isOpen
  };
})();

// Escape handler
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && TutorialTour.isOpen()) {
    TutorialTour.stop(event);
  }
});

window.tutorial = function () {  TutorialTour.start();};