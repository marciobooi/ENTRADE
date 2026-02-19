function populateFuel() {
  const target = document.querySelector("#containerFuel");
  if (!target) return console.error("containerFuel not found in DOM");

  const elementId = "selectFuel";
  const labelDescription = languageNameSpace.labels["FUEL"];
  const optionsArray = Object.keys(tradeFuel);
  const activeElement = REF.fuel;
  const textChange = languageNameSpace.labels["MENU_FUEL"];

  // Remove previous widget if it exists
  document.getElementById(elementId)?.closest(".ecl-form-group")?.remove();
  // Defensive cleanup — remove any stray duplicates that may have been rendered previously
  Array.from(target.querySelectorAll(`#${elementId}`)).forEach(el => el.closest('.ecl-form-group')?.remove());

  // Create the new select component
  const singleSelect = new Singleselect(
    elementId,
    optionsArray,
    labelDescription,
    activeElement,
    textChange,
    handleFuelSelection
  );

  // Render and mount
  target.insertAdjacentHTML("beforeend", singleSelect.createSingleSelect());
  singleSelect.attachEventListeners();

  function handleFuelSelection(selectedValue) {
    REF.fuel = selectedValue;

    const apiParam = getDatasetNameByDefaultSIECAndTrade(REF.fuel, REF.trade);

    Object.assign(REF, {
      dataset: apiParam.name,
      siec: apiParam.defSiec,
      unit: apiParam.defUnit
    });

    populateUnit();
    populateProduct();
  }
}
