const cache = {};

function addToCache(query, d) {
  if (!cache[query]) {
    cache[query] = [];
  }

  cache[query].push(d);
}

function getPartnerValuesForYear(dataset, year = REF.year) {
  if (!dataset) {
    return [];
  }

  const partners = dataset.Dimension("partner")?.id || [];
  const years = dataset.Dimension("time")?.id || [];

  if (!years.length) {
    return Array.isArray(dataset.value) ? dataset.value : [];
  }

  const yearIndex = years.indexOf(String(year));
  if (yearIndex === -1) {
    return partners.map(() => null);
  }

  return partners.map((partner, partnerIndex) => {
    const flatIndex = partnerIndex * years.length + yearIndex;
    return dataset.value[flatIndex];
  });
}

async function chartApiCall() {
  try {
    let url =
      "https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/" +
      REF.dataset +
      "?";
    url += "format=JSON";
    url += "&lang=" + REF.language;

    url += "&geo=" + REF.geo;
    url += "&siec=" + REF.siec;
    url += "&unit=" + REF.unit;

    // return cached Dataset if available
    if (cache[url] && cache[url].length > 0) {
      return cache[url][cache[url].length - 1];
    }

    // async fetch JSON, parse and wrap with JSONstat
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`Network response was not ok: ${resp.status}`);
    const json = await resp.json();
    const d = JSONstat(json).Dataset(0);

    addToCache(url, d);
    return d;
  } catch (error) {
    console.error("API call failed:", error);
    return null;
  }
} 
