function populateFuel() {
  renderSingleSelect(
    "#containerFuel",
    "selectFuel",
    Object.keys(tradeFuel),
    languageNameSpace.labels["FUEL"],
    REF.fuel,
    languageNameSpace.labels["MENU_FUEL"],
    handleFuelSelection
  );

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
