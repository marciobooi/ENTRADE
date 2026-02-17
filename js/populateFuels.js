function populateFuel() {
  const target = document.querySelector("#containerFuel");
  if (!target) return console.error("containerFuel not found in DOM");

  const elementId = "selectFuel";
  const labelDescription = languageNameSpace.labels["FUEL"];
  const optionsArray = Object.keys(tradeFuel);
  const activeElement = REF.fuel;
  const textChange = languageNameSpace.labels["MENU_FUEL"];

  // Remove previous widget if it exists
  document.getElementById(elementId)?.closest(".single-select-wrapper")?.remove();

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
