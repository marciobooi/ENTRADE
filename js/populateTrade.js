function populateTrade() {
  const target = document.querySelector("#containerTrade");
  const elementId = 'selectTrade';
  const optionsArray = Object.keys(trade);
  const labelDescription = languageNameSpace.labels["TRADE"];
  const activeElement = REF.product;
  const textChange = languageNameSpace.labels["MENU_TRADE"];

  const existingSingleSelect = document.getElementById(elementId);
  if (existingSingleSelect) {    
      existingSingleSelect.parentElement.parentElement.remove();
  }

  const singleSelect = new Singleselect(elementId, optionsArray, labelDescription, activeElement, textChange, selectedValue => {
    REF.trade = selectedValue;

      const apiParam = getDatasetNameByDefaultSIECAndTrade(REF.fuel, REF.trade);

      REF.dataset = apiParam.name; 
      REF.siec = apiParam.defSiec
      populateUnit()

  });

  const singleSelectHTML = singleSelect.createSingleSelect();
  target.insertAdjacentHTML('beforeend', singleSelectHTML);



  singleSelect.attachEventListeners();

}
