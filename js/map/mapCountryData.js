/**
 * Country selection and data loading: turning a clicked/activated country
 * code into an API call, the resulting partner list, the on-map info card,
 * and (if the chart panel is already open) the factsheet/table view.
 */
import { coords, activePartners, setActivePartners } from './mapState.js';
import { drawLines, clearMap } from './mapDrawing.js';
import { announceToScreenReader } from './mapKeyboardNav.js';

// isOpenChartContainer lives on window rather than as a module-local binding:
// js/basics.js's removeChartOptions() writes to it directly as a bare
// `isOpenChartContainer = false` (no `window.` prefix, predating this
// module split). In a classic, non-strict script that bare assignment
// resolves up the scope chain - today it finds and reassigns this same
// variable because everything shared one global scope. Once this file is a
// module, module-scope bindings are invisible to that scope chain, so the
// bare assignment would silently create a *new*, disconnected
// window.isOpenChartContainer instead of updating this one. Storing it on
// window explicitly from this side keeps both writers talking to the same
// place, matching the original (accidental) behavior on purpose.
if (typeof window.isOpenChartContainer === 'undefined') window.isOpenChartContainer = false;

/**
 * Selects a country by code - the single path shared by mouse clicks and
 * keyboard activation (Enter/Space on a focused country), so both stay in sync.
 */
export async function selectCountryByCode(countryCode) {
  if (!countryCode || !defGeos.includes(countryCode)) return;

  const selectTradeElem = document.querySelector('#selectTrade');
  if (selectTradeElem && selectTradeElem.value) {
    REF.trade = selectTradeElem.value;
  }

  const countryFeature = coords?.[0]?.features?.find(f => f?.properties?.CNTR_ID === countryCode);
  const countryProps = countryFeature ? countryFeature.properties : { CNTR_ID: countryCode };

  await loadCountryData(countryProps);
  if (window.dataNameSpace && typeof dataNameSpace.setRefURL === 'function') {
    dataNameSpace.setRefURL();
  }
}

export async function loadCountryData(country) {
  if (!country || !country.CNTR_ID) return;

  REF.geo = country.CNTR_ID;
  REF.chart = 'map';

  // Show loading spinner over the map
  showMapSpinner();
  clearMap();

  const d = await chartApiCall();
  hideMapSpinner();
  const partners = countriesDataHandler(d);

  const labels = languageNameSpace?.labels || {};
  const countryLabel = labels[country.CNTR_ID] || country.CNTR_ID;

  if (!partners.length) {
    showNoDataPopup();
    announceToScreenReader(labels['MSG_NO_DATA'] || `${countryLabel}: no trade data available for the current selection.`);
    return;
  }

  setActivePartners(partners);
  countryInfo(country);
  await drawLines(country, partners);
  getTitle();
  chartContainerStatus();

  const topPartner = [...partners].sort((a, b) => b[1] - a[1])[0];
  const tradeLabel = labels[REF.trade] || REF.trade;
  const fuelLabel = labels[REF.fuel] || REF.fuel;
  const unitLabel = labels[`abr_${REF.unit}`] || REF.unit;
  const topPartnerLabel = topPartner ? (labels[topPartner[0]] || topPartner[0]) : '';
  const topValue = topPartner ? Math.round(topPartner[1]).toLocaleString(REF.language) : '';
  announceToScreenReader(
    `${countryLabel} selected. ${tradeLabel} ${fuelLabel}, ${REF.year}. ${partners.length} partner${partners.length === 1 ? '' : 's'}` +
    (topPartner ? `, top: ${topPartnerLabel}, ${topValue} ${unitLabel}.` : '.')
  );

  if (window.isOpenChartContainer) {
    const countryInfoElem = document.querySelector('#countryInfo');
    if (countryInfoElem) countryInfoElem.remove();
    removeChartOptions();
    await openFactSheet();
  }
}
// Exposed for js/domComponents/subNavBarComponent.js's top5/all-partners
// toggle, which calls this as an unguarded bare global.
window.loadCountryData = loadCountryData;

export function showMapSpinner() {
  const mapElem = document.querySelector('#map');
  if (!mapElem) return;
  let overlay = document.querySelector('#map-loading-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'map-loading-overlay';
    overlay.innerHTML = '<div class="map-spinner"></div>';
    mapElem.appendChild(overlay);
  }
  // Force reflow then show
  overlay.offsetHeight;
  overlay.classList.add('visible');
}

export function hideMapSpinner() {
  const overlay = document.querySelector('#map-loading-overlay');
  if (overlay) {
    overlay.classList.remove('visible');
  }
}

export async function openFactSheet(country) {
  const chartContainer = document.querySelector('#chartContainer');
  const mapContainer = document.querySelector('#map');
  if (!chartContainer) {
    console.error('chartContainer not found');
    return;
  }

  const isEmpty = chartContainer.innerHTML.trim() === '' && window.getComputedStyle(chartContainer).display === 'none';
  if (!isEmpty) return;

  chartContainer.style.display = 'block';
  mapContainer.style.display = 'none';

  REF.chart = "tableChart";
  addChartOptions();
  await createTableChart();
  getTitle();
  disableBtns();

  window.isOpenChartContainer = true;
}
// Exposed for the "Open factsheet" button's inline onclick (see
// countryInfoMenu below) - inline HTML event attributes always evaluate
// against window/global scope, never a module's local scope, regardless of
// which module generated the markup.
window.openFactSheet = openFactSheet;

export function countriesDataHandler(d) {
  if (d === null) {
    return [];
  }

  const partnerIds = d.Dimension('partner').id;
  const selectedYearValues = getPartnerValuesForYear(d, REF.year);

  const MIN_LINE_VALUE = 0.5;

  let partners = partnerIds
    .map((currentPartnerId, index) => {
      const raw = selectedYearValues[index];
      const numericValue = Number(raw);

      if (
        raw === null ||
        raw === undefined ||
        raw === '' ||
        !Number.isFinite(numericValue) ||
        numericValue <= MIN_LINE_VALUE ||
        excludedPartners.includes(currentPartnerId)
      ) {
        return null;
      }

      return [currentPartnerId, numericValue];
    })
    .filter(Boolean);

  if (REF.filter === 'top5') {
    partners = getTopFive(partners);
  }

  return partners;
}

export function countryInfo(country) {
  const countryInfoElem = document.querySelector('#countryInfo');
  if (countryInfoElem) countryInfoElem.remove();

  const countryInfoContent = countryInfoMenu(country);
  const mapElem = document.querySelector("#map");
  if (mapElem) {
    mapElem.insertAdjacentHTML('beforeend', countryInfoContent);
  }
}
// Exposed for js/basics.js's removeChartOptions(), which calls this as a
// bare global.
window.countryInfo = countryInfo;

export function closeInfo(params) {
  const countryInfoElem = document.querySelector('#countryInfo');
  if (countryInfoElem) countryInfoElem.remove();
  clearMap();
}

function countryInfoMenu(country) {
  const countryContent = `
  <div id="countryInfo">
    <button id="factSheet"
            class="ecl-button ecl-button--cta factBtn"
            type="button"
            onclick="openFactSheet()"
            title="${languageNameSpace?.labels?.["FACTSHEET"] || 'Open factsheet'}"
            aria-label="${languageNameSpace?.labels?.["FACTSHEET"] || 'Open factsheet'}">
      ${languageNameSpace?.labels?.["FACTSHEET"] || 'Open factsheet'}
    </button>
  </div>
`;

  return countryContent;
}

export function chartContainerStatus() {
  const chartContainer = document.querySelector('#chartContainer');
  window.isOpenChartContainer = chartContainer && window.getComputedStyle(chartContainer).display !== 'none' ? true : false;
}
