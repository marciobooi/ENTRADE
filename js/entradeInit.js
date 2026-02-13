if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

async function initApp() {
  // dataNameSpace.getRefURL();

  await languageNameSpace.initLanguage(REF.language);

  // Initialize GLOBAN after language is set
if (typeof globanManager !== 'undefined') {
  globanManager.init();
}

// Regenerate CCK with the current language
if (typeof cckManager !== 'undefined') {
  cckManager.regenerate(REF.language);
}


  setTimeout(() => {
    document.querySelectorAll("#chartOptionsMenu path").forEach((path) => {
      path.style.fill = "white";
    });
  }, 3000);

  ECL.autoInit();
}

function buildComponents() {
  const components = [
    { instance: new SubNavbar(), target: "#subnavbar-container" },
      // { instance: new Footer(), target: '#componentFooter' },
    { instance: new Navbar(), target: "#navbar-container" },
      // { instance: new FloatingChartControls(), target: '#componentFooter' },
  ];

  components.forEach(({ instance, target }) => {
    instance.addToDOM(target);
  });

  populateDropdownData();
}

function removeComponents() {
  const navbarContainer = document.querySelector("#navbar-container");
  if (navbarContainer) navbarContainer.textContent = '';

  const subnavbarContainer = document.querySelector("#subnavbar-container");
  if (subnavbarContainer) subnavbarContainer.textContent = '';

  const menuSwitch = document.querySelector("#menuSwitch");
  if (menuSwitch) menuSwitch.remove();

  const floatingMenu = document.querySelector("#floatingMenu");
  if (floatingMenu) floatingMenu.textContent = '';

  const componentFooter = document.querySelector("#componentFooter");
  if (componentFooter) componentFooter.textContent = '';
}

function populateDropdownData() {
  populateTrade();
  populateProduct();
  populateUnit();
  populateFuel();
  populateYearsData();
  ECL.autoInit();
}
