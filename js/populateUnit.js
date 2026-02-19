function populateUnit() {
  const apiParam = getDatasetNameByDefaultSIECAndTrade(REF.fuel, REF.trade);
  const units = apiParam.unit;

  const target = document.querySelector("#containerUnit");
  if (!target) return console.error("containerUnit not found in DOM");

  const elementId = "selectUnit";
  const optionsArray = units;
  const labelDescription = languageNameSpace.labels["UNIT"];
  const activeElement = REF.unit;
  const textChange = languageNameSpace.labels["MENU_UNIT"];

  // Remove any existing widget safely
  document.getElementById(elementId)
    ?.closest(".ecl-form-group")
    ?.remove();
  // Defensive cleanup — remove any stray duplicates that may have been rendered previously
  Array.from(target.querySelectorAll(`#${elementId}`)).forEach(el => el.closest('.ecl-form-group')?.remove());

  // Create new single select component
  const singleSelect = new Singleselect(
    elementId,
    optionsArray,
    labelDescription,
    activeElement,
    textChange,
    handleUnitSelection
  );

  // Render and mount
  target.insertAdjacentHTML("beforeend", singleSelect.createSingleSelect());
  singleSelect.attachEventListeners();

  // Callback handler
  function handleUnitSelection(selectedValue) {
    REF.unit = selectedValue;
  }
}