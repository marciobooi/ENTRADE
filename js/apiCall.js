var cache = {};

function addToCache(query, d) {
  if (!cache[query]) {
    cache[query] = [];
  }
  
  cache[query].push(d);
}


function chartApiCall(query) {


  let url = "https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/" + REF.dataset + "?";
  url += "format=JSON";
  url += "&lang=" + REF.language;



  switch (REF.chartType) {
    case "lineChart":
      url += "&unit=" + REF.unit; 
      url += "&geo=" + REF.geos;  
      if(REF.indicator.length > 0) {
        for (let i = 0; i < REF.indicator.length; i++) url += indicator_type + REF.indicator[i];  
      }
      if(REF.indicator2.length > 0) {
        for (let i = 0; i < REF.indicator2.length; i++) url += indicator2_type + REF.indicator2[i];  
      }

      if(REF.chartId === "chart_17" || REF.chartId === "chart-18") {
        REF.chartId === "chart_17" ? url += "&operator=PRR_AUTO" : url += "&operator=PRR_MAIN"
        url += "&plants=ELC"
      }
      break;

 case "barChart":
  url += "&unit=" + REF.unit; 
      if(REF.indicator.length > 0) { for (let i = 0; i < REF.indicator.length; i++) url += indicator_type + REF.indicator[i]}
      if(REF.indicator2.length > 0) {for (let i = 0; i < REF.indicator2.length; i++) url += indicator2_type + REF.indicator2[i];}
      for (let i = 0; i < geos.length; i++) url += "&geo=" + geos[i]; 
      url += "&time=" + REF.year; 

  break


  case "pieChart":
    url += "&geo=" + REF.geo;
    url += "&siec=" + REF.siec;
    url += "&unit=" + REF.unit;
    url += "&time=" + REF.year;  
    break

  default:
    url += "&geo=" + REF.geo;
    url += "&siec=" + REF.siec;
    url += "&unit=" + REF.unit;
    url += "&time=" + REF.year;
    break;

  
 
  }

  if (cache[url] && cache[url].length > 0) {  
    d = JSONstat(cache[url][cache[url].length - 1]).Dataset(0);
    return d;
  } else {
   

    const request = new XMLHttpRequest();
    request.open("GET", url, false); // Setting the third parameter to 'false' makes it synchronous
    request.send();
  
    if (request.status === 500 || request.status === 503) {
      // submitFormDown();
    }
  
    if (request.status !== 200) {
      // submitFormDown();
    }
  
    const data = JSON.parse(request.responseText);
    const d = JSONstat(data).Dataset(0);

    addToCache(url, d);
    
    return d;
  }


}