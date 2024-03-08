  function populateUnit() {
  
  const apiParam = getDatasetNameByDefaultSIECAndTrade(REF.fuel, REF.trade);

  const units = apiParam.unit

    const target = document.querySelector("#containerUnit");
    const elementId = 'selectUnit';
    const optionsArray = units;
    const labelDescription = languageNameSpace.labels["UNIT"];
    const activeElement = REF.unit;
    const textChange = languageNameSpace.labels["MENU_UNIT"];

    const existingSingleSelect = document.getElementById(elementId);
    if (existingSingleSelect) {
        existingSingleSelect.parentElement.parentElement.remove();
    }  
  
    const singleSelect = new Singleselect(elementId, optionsArray, labelDescription, activeElement, textChange, selectedValue => {
        REF.unit = selectedValue;
   
    });
  
    const singleSelectHTML = singleSelect.createSingleSelect();
    target.insertAdjacentHTML('beforeend', singleSelectHTML);
  
    singleSelect.attachEventListeners();

  }