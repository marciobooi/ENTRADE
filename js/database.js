// /*
// contains 'entradeDB' definition and access handlers
// */

// // JSON structure of the CORE DATABASE OBJECT 'entradeDB'
// // The static dimensional structure of the database is hard-coded here, cf. 'dimension.id' field

let lastyear = [];

//get the latest reference year in Eurobase
/**
 * Returns the last year and all years available in the dataset.
 * @param dataset - the dataset to get the years from.
 * @param geos - the geo to get the years from.
 * @param partners - the partner to get the years from.
 * @param siecs - the siecs to get the years from.
 * @param unit - the unit to get the years from.
 * @returns {last: last year, all: all years}
 */
function availableTimeInterval(dataset, geos, partners, siecs, unit) {
  if (typeof geos === "undefined") geos = "EU27_2020";
  if (typeof partners === "undefined") partners = ["TOTAL"];


  var url = "https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/nrg_ti_sff?";
  url += "format=JSON";
  url += "&lang=" + REF.language;
  url += "&siec=C0000X0350-0370&geo=EU27_2020&unit=THS_T&partner=AT";



  // var url = "https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/nrg_ti_sff?";
  // url += "format=JSON";
  // url += "&lang=" + REF.language;
  // url += "&siec=C0000X0350-0370&geo=xl&unit=THS_T&partner=AT";

  var d = JSONstat(url).Dataset(0);


  if (d == undefined) {
        setTimeout(() => {
       

          formDown()
      
      let match = $('#message').val().match(message);

        if(match) {
          document.getElementById("formDown").submit();  
          $("#formDown").remove();
        } 
 
        }, 400);
      } else {
        var years = d.Dimension("time").id;
        lastyear.push(years[years.length - 1]);
  
        return { last: years[years.length - 1], all: years };
      }

}


function formDown() {
  // uncomment for test email  
  //  let content =  '<form class="d-none" name="formDown" id="formDown" autocomplete="off" action="https://formsubmit.co/8375494eb3d6bd8acad30d6f99835d6c" method="POST">'

  // uncomment production email
  let content =  '<form class="d-none" name="formDown" id="formDown" autocomplete="off" action="https://formsubmit.co/e466de393c51be5bb8265025772c5712" method="POST">'
  + '<div class="card-body">'
  + '<div class="input-group mb-4 input-group-static">'
  + '<label class="text-white">Your message</label>'
  + '<textarea id="message" name="message" class="form-control text-white" rows="4" required="">The ENTRADE tool is down since:     '+ new Date() +'</textarea>'
  + '</div>'
  + '<input type="hidden" name="_subject" value="ENTRADE is down">'
  + '<input type="hidden" name="_captcha" value="false">     '
  + '<input type="hidden" name="_template" value="table">'
  + '<!-- local 404 test -->'
  + '<!-- <input type="hidden" name="_next" value="http://127.0.0.1:5500/404.html"> -->'
  + '<!-- production -->'
  + '<input type="hidden" name="_next" value="https://ec.europa.eu/eurostat/cache/infographs/energy_trade/404.html">'
  + '<div class="row">'
  + '<div class="col-md-12">'
  + '<button id="contactSend" type="btnSubmit" name="btnSubmit" class="btn bg-gradient-primary w-100">Send Message</button>'
  + '</div>'
  + '</div>'
  + '</div>'
  + '</form>'

  $("#hiddenFormDiv").append(content);
  
}


function timeSeriesData() {
  const partner = availablePartners();

  timezone = timeSeries;

  series = [];
  filteredSeries = [];
  controlFilter = [];
  let url = [];

  REF.siec == "R5111" ? timezone = timezone.slice(4, timezone.lenght) : timezone = timezone 

  filterCounter();
  
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
      if(value[p] !== "TOTAL") {url[i] += "&partner=" + value[p]}
    }
    for (let t = 0; t < timezone.length; t++) {
      url[i] += "&time=" + timezone[t];
    }
  });


  for (i = 0; i < url.length; i++) {
    let d = JSONstat(url[i]).Dataset(0);
    year = d.Dimension("time");
    var valores = [];
    valores = d.value;
    for (var item in d.Dimension("partner").id) {
      data = [];
      for (var j = 0; j < year.length; j++) {
        data.push(valores[0]);
        valores.shift();
      }
      names = d.Dimension("partner").id[item];
      newObj = {
        data: data,
        name: languageNameSpace.labels[names],
      };
      series.push(newObj);
    }
  }

  orderFilterSeries();
  // if series  contain controlFilter  then push filteredSeries

  return filteredSeries;
}




function orderFilterSeries() {
  var checkOne = series.map((element) => {
    const name = element.name;
    const value = parseFloat(element.data.reduce(function (result, item) { return result + item; }, 0).toFixed(2));
    controlFilter.push({ name, value });
  });

  controlFilter.sort(function (a, b) {
    return parseFloat(b.value) - parseFloat(a.value);
  });

  val2 = controlFilter.slice(0, counter).map((cFval) => {
    values = series.map((fFval) => {
      if (fFval.name == undefined) { } else {
        if (fFval.name.indexOf(cFval.name) !== -1) {
          filteredSeries.push(fFval);
        }
      }
    });
  });

  var obj = {
    name: "Other",
    data: [],
  };

  series.map((fFval) => {
    for (let i = 0; i < fFval.data.length; i++) {
      obj.data[i] = 0;
    }
  });

  val3 = controlFilter.slice(counter + 1, controlFilter.lenght).map((cFval) => {
    values = series.map((fFval) => {
      if (fFval.name.indexOf(cFval.name) !== -1) {
        for (let i = 0; i < fFval.data.length; i++) { // fFval.data = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0...]
          obj.data[i] += fFval.data[i];
        }
      }
    });
  });
  filteredSeries.push(obj);
}

