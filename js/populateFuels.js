  function populateFuel() {
    const target = document.querySelector("#containerFuel");
    const elementId = 'selectFuel';
    const optionsArray = Object.keys(tradeFuel);
    const labelDescription = languageNameSpace.labels["FUEL"];
    const activeElement = REF.fuel;
    const textChange = languageNameSpace.labels["MENU_FUEL"];
  
    const existingSingleSelect = document.getElementById(elementId);
    if (existingSingleSelect) {    
        existingSingleSelect.parentElement.parentElement.remove();
    }
  
    const singleSelect = new Singleselect(elementId, optionsArray, labelDescription, activeElement, textChange, selectedValue => {
      REF.fuel = selectedValue;

        const apiParam = getDatasetNameByDefaultSIECAndTrade(REF.fuel, REF.trade);

        REF.dataset = apiParam.name; 
        REF.siec = apiParam.defSiec
        REF.unit = apiParam.defUnit
        populateUnit()
        populateProduct()

    });
  
    const singleSelectHTML = singleSelect.createSingleSelect();
    target.insertAdjacentHTML('beforeend', singleSelectHTML);
  
  
  
    singleSelect.attachEventListeners();
  
  }
  
  
  