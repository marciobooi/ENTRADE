function populateTrade() {
  const target = document.querySelector("#containerTrade");
  if (!target) return console.error("containerTrade not found in DOM");

  const elementId = "selectTrade";
  const optionsArray = Object.keys(trade);
  const labelDescription = languageNameSpace.labels["TRADE"];
  const activeElement = REF.trade;
  const textChange = languageNameSpace.labels["MENU_TRADE"];

  // Remove old widget safely
  document.getElementById(elementId)
    ?.closest(".single-select-wrapper")
    ?.remove();

  // Build new select widget
  const singleSelect = new Singleselect(
    elementId,
    optionsArray,
    labelDescription,
    activeElement,
    textChange,
    handleTradeSelection
  );

  // Render and mount new component
  target.insertAdjacentHTML("beforeend", singleSelect.createSingleSelect());
  singleSelect.attachEventListeners();

  // Callback for selection
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