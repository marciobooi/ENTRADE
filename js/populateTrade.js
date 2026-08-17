function populateTrade() {
  renderSingleSelect(
    "#containerTrade",
    "selectTrade",
    Object.keys(trade),
    languageNameSpace.labels["TRADE"],
    REF.trade,
    languageNameSpace.labels["MENU_TRADE"],
    handleTradeSelection
  );

  function handleTradeSelection(selectedValue) {
    REF.trade = selectedValue;

    const apiParam = getDatasetNameByDefaultSIECAndTrade(REF.fuel, REF.trade);

    Object.assign(REF, {
      dataset: apiParam.name,
      siec: apiParam.defSiec
    });

    populateUnit();
  }
}