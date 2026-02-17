
async function populateYearsData() {

  const url = "https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/"+REF.dataset+"?format=JSON&geo=EU27_2020&unit=TJ_GCV&siec=G3000&partner=BE&lang=en";

  const resp = await fetch(url);
  const json = await resp.json();
  const yearsArray = JSONstat(json).Dataset(0).Dimension("time").id;  

  const dropdownList = document.querySelector("#dropdown-years-list");
  const numberOfItems = dropdownList ? dropdownList.children.length : 0;

  if(numberOfItems !== yearsArray.length) {
    REF.year = yearsArray[yearsArray.length - 1];
  }


  const target = document.querySelector("#containerYear");
  const elementId = 'selectYear';
  const optionsArray = yearsArray.reverse();
  const labelDescription = languageNameSpace.labels["REFERENCE"];
  const activeElement = REF.year;
  const textChange = languageNameSpace.labels["MENU_YEAR"];

  const existingSingleSelect = document.getElementById(elementId);
  if (existingSingleSelect) {
      existingSingleSelect.parentElement.parentElement.remove();
  }

  const singleSelect = new Singleselect(elementId, optionsArray, labelDescription, activeElement, textChange, selectedValue => {
      REF.year = selectedValue;
  });

  const singleSelectHTML = singleSelect.createSingleSelect();
  target.insertAdjacentHTML('beforeend', singleSelectHTML);

  singleSelect.attachEventListeners();
}



