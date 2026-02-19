async function populateYearsData() {
  // --- Build URL safely
  const base = "https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/";
  const dataset = encodeURIComponent(REF.dataset);
  const params = new URLSearchParams({
    format: "JSON",
    geo: "EU27_2020",
    unit: "TJ_GCV",
    siec: "G3000",
    partner: "BE",
    lang: "en"
  });
  const url = `${base}${dataset}?${params.toString()}`;

  // --- Fetch & parse data
  let yearsArray = [];
  try {
    const resp = await fetch(url, { cache: "no-store" });
    if (!resp.ok) {
      console.error(`populateYearsData: HTTP ${resp.status} for ${url}`);
      return;
    }
    const json = await resp.json();

    // Defensive: JSONstat availability & structure
    if (typeof JSONstat !== "function") {
      console.error("populateYearsData: JSONstat library not available.");
      return;
    }

    const ds = JSONstat(json)?.Dataset?.(0);
    const timeDim = ds?.Dimension?.("time");
    const ids = timeDim?.id;

    if (!Array.isArray(ids) || ids.length === 0) {
      console.error("populateYearsData: Could not resolve time dimension ids.");
      return;
    }

    yearsArray = ids; // chronological ascending (typically)
  } catch (err) {
    console.error("populateYearsData: fetch/parse error:", err);
    return;
  }

  // --- If dropdown size changed (new data), select the last available year as default
  // Use the source array (ascending) for consistent "latest" selection.
  try {
    const dropdownList = document.querySelector("#dropdown-years-list");
    const numberOfItems = dropdownList ? dropdownList.children.length : 0;

    if (numberOfItems !== yearsArray.length) {
      REF.year = yearsArray[yearsArray.length - 1];
    }
  } catch (err) {
    console.warn("populateYearsData: Unable to compare dropdown list length.", err);
    // Not fatal—continue rendering.
  }

  // --- Render the select
  const target = document.querySelector("#containerYear");
  if (!target) {
    console.error("populateYearsData: #containerYear not found in DOM");
    return;
  }

  const elementId = "selectYear";
  const labelDescription = languageNameSpace.labels["REFERENCE"];
  const textChange = languageNameSpace.labels["MENU_YEAR"];
  const activeElement = REF.year;

  // Render years in reverse (most recent first) without mutating the original array.
  const optionsArray = yearsArray.slice().reverse();

  // Remove previous select widget safely
  document.getElementById(elementId)
    ?.closest(".ecl-form-group")
    ?.remove();
  // Defensive cleanup — remove any stray duplicates that may have been rendered previously
  Array.from(target.querySelectorAll(`#${elementId}`)).forEach(el => el.closest('.ecl-form-group')?.remove());

  // Create and mount new widget
  const singleSelect = new Singleselect(
    elementId,
    optionsArray,
    labelDescription,
    activeElement,
    textChange,
    handleYearSelection
  );

  target.insertAdjacentHTML("beforeend", singleSelect.createSingleSelect());
  singleSelect.attachEventListeners();

  // --- Callback
  function handleYearSelection(selectedValue) {
    REF.year = selectedValue;
  }
}