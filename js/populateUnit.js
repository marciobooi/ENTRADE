function populateUnit() {
  const apiParam = getDatasetNameByDefaultSIECAndTrade(REF.fuel, REF.trade);
  const units = apiParam.unit;

  renderSingleSelect(
    "#containerUnit",
    "selectUnit",
    units,
    languageNameSpace.labels["UNIT"],
    REF.unit,
    languageNameSpace.labels["MENU_UNIT"],
    handleUnitSelection
  );

  function handleUnitSelection(selectedValue) {
    REF.unit = selectedValue;
  }
}