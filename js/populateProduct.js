function populateProduct() {
  const apiParam = getDatasetNameByDefaultSIECAndTrade(REF.fuel, REF.trade);
  const siecs = apiParam.siecs;

  renderSingleSelect(
    "#containerSiec",
    "selectSiec",
    siecs,
    languageNameSpace.labels["PRO"],
    REF.siec,
    languageNameSpace.labels["PRODUCT"],
    handleSiecSelection
  );

  function handleSiecSelection(selectedValue) {
    REF.siec = selectedValue;
  }
}