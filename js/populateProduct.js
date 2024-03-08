function populateProduct() {

  const apiParam = getDatasetNameByDefaultSIECAndTrade(REF.fuel, REF.trade);

  const siecs = apiParam.siecs

  const target = document.querySelector("#containerSiec");
  const elementId = 'selectSiec';
  const optionsArray = siecs;
  const labelDescription = languageNameSpace.labels["PRO"];
  const activeElement = REF.siec;
  const textChange = languageNameSpace.labels["PRODUCT"];

  const existingSingleSelect = document.getElementById(elementId);
  if (existingSingleSelect) {
      existingSingleSelect.parentElement.parentElement.remove();
  }

  const singleSelect = new Singleselect(elementId, optionsArray, labelDescription, activeElement, textChange, selectedValue => {
    REF.siec = selectedValue;

  });

  const singleSelectHTML = singleSelect.createSingleSelect();
  target.insertAdjacentHTML('beforeend', singleSelectHTML);

  singleSelect.attachEventListeners();
}
