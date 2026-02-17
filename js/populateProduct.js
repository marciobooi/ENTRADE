function populateProduct() {
  const apiParam = getDatasetNameByDefaultSIECAndTrade(REF.fuel, REF.trade);
  const siecs = apiParam.siecs;

  const target = document.querySelector("#containerSiec");
  if (!target) return console.error("containerSiec not found in DOM");

  const elementId = "selectSiec";
  const optionsArray = siecs;
  const labelDescription = languageNameSpace.labels["PRO"];
  const activeElement = REF.siec;
  const textChange = languageNameSpace.labels["PRODUCT"];

  // Remove previous select component safely
  document.getElementById(elementId)
    ?.closest(".single-select-wrapper")
    ?.remove();

  // Create new widget
  const singleSelect = new Singleselect(
    elementId,
    optionsArray,
    labelDescription,
    activeElement,
    textChange,
    handleSiecSelection
  );

  // Render & mount
  target.insertAdjacentHTML("beforeend", singleSelect.createSingleSelect());
  singleSelect.attachEventListeners();

  // Callback
  function handleSiecSelection(selectedValue) {
    REF.siec = selectedValue;
  }
}