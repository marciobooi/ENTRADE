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

  switch (REF.chart) {
    case "lineChart": 
      url += "&geo=" + REF.geo;
      url += "&siec=" + REF.siec;
      url += "&unit=" + REF.unit;     
      break;

//  case "barChart":
//     url += "&geo=" + REF.geo;
//     url += "&siec=" + REF.siec;
//     url += "&unit=" + REF.unit;
//     url += "&time=" + REF.year;
//   break
//   case "pieChart":
//     url += "&geo=" + REF.geo;
//     url += "&siec=" + REF.siec;
//     url += "&unit=" + REF.unit;
//     url += "&time=" + REF.year;  
//     break

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
  
    const d = JSONstat(url).Dataset(0);

    addToCache(url, d);
    
    return d;
  }


}