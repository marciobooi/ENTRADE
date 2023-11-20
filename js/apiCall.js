

function loadData() {
    globalVars();
    //function to detect the availeble partners inside dataset
    //partners.js
    availablePartners();
  
    const dataset = dataNameSpace.dataset;
    log(dataset);
  
    if (typeof year === "string") year = [year];
    if (typeof siec === "undefined") siec = "G300";
    if (typeof unit === "undefined") unit = "TJ_GCV"; 
  
    let url = [];
  
    const chunckSize = 14;
    const res = partner.reduce((acc, _curr, i) => {
      if (!(i % chunckSize)) {
        acc.push(partner.slice(i, i + chunckSize));
      }
      return acc;
    }, []);
  
    
  
    res.forEach(function (value, i) {
    url[i] = "https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/" + dataset + "?";
    url[i] += "format=JSON";
    url[i] += "&lang=" + REF.language;
    url[i] += "&geo=" + REF.geo;
    url[i] += "&siec=" + REF.siec;
    url[i] += "&unit=" + REF.unit;
    url[i] += "&time=" + REF.year;
    for (let p = 0; p < value.length; p++) {
      url[i] += "&partner=" + value[p];
    }
  
    });
    conditionOne = ["AFR_OTH", "AME_OTH", "ASI_NME_OTH", "ASI_OTH", "EUR_OTH", "EX_SU_OTH", "NSP", "TOTAL",]
    conditionTwo = ["AFR_OTH", "AME_OTH", "ASI_NME_OTH", "ASI_OTH", "EUR_OTH", "EX_SU_OTH", "NSP"]
  
    for (i = 0; i < url.length; i++) {
      let d = JSONstat(url[i]).Dataset(0);
     
    if (d !== null) {    
      for (let item in res[i]) {
        for (let value in d.value) {
          if (item === value) {
            if (d.value[value]) {   
  
              const partnerId = d.Dimension("partner").id[item]
              const partnerValue = d.value[value]
  
              if ( conditionOne.includes(partnerId)) {              
                countriesAgregated.push(partnerId);
                countriesAgregatedValue.push(partnerValue);
                totalCountries.push(partnerId);
                totalValues.push(partnerValue);
                tableNames.push(partnerId);
                tableValues.push(partnerValue);
  
                  if (conditionTwo.includes(partnerId)) {
                    otherCountries.push(partnerId);
                    otherValues.push(partnerValue);
                  }
  
              } else {
                countries.push(partnerId);
                countriesValue.push(partnerValue);
                pieData.push([languageNameSpace.labels[partnerId],partnerValue,]);
                totalCountries.push(partnerId);
                totalValues.push(partnerValue);
                otherCountries.push(partnerId);
                otherValues.push(partnerValue);
                tableNames.push(partnerId);
                tableValues.push(partnerValue);
              }
            }
          }
        }
      }
    }       
    }
    return i;
  }


  /**
 * function to query Eurobase dataset using the Eurostat JSON web service
 * Query Eurobase for the given dataset, geo, siec, unit, and year. 
 * @param dataset - the dataset to query for. 
 * @param geo - the geo to query for. 
 * @param siec - the siec to query for. 
 * @param unit - the unit to query for. 
 * @param year - the year to query for. 
 * @param partner - the partner to query for. 
 * @returns None
 */
function EurobaseQueryEntrade(dataset, geo, siec, unit, year, partner) {
  // array with JSON URLs to download
  var urlList = [];

  // max. number of cells per URL (JSON web service restriction)
  var nMax = 50;

  // Ajax calls as proposed by B.3
  var ajaxCount = 0;
  $.each(urlList, function (iurl, url) {
    $.ajax(url, {
      success: function (data) {
        // console.log((data));
        loadAllValues(JSONstat(data));
        ajaxCount++;
      },
      error: function () {
        ajaxCount++;
      },
    });
  });
}