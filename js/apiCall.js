const cache = {};

function addToCache(query, d) {
  if (!cache[query]) {
    cache[query] = [];
  }

  cache[query].push(d);
}

async function chartApiCall(query) {
  try {
    let url =
      "https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/" +
      REF.dataset +
      "?";
    url += "format=JSON";
    url += "&lang=" + REF.language;

    switch (REF.chart) {
      case "lineChart":
        url += "&geo=" + REF.geo;
        url += "&siec=" + REF.siec;
        url += "&unit=" + REF.unit;
        break;

      default:
        url += "&geo=" + REF.geo;
        url += "&siec=" + REF.siec;
        url += "&unit=" + REF.unit;
        url += "&time=" + REF.year;
        break;
    }

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
