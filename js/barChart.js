async function barchartdata() {
  barChartSeries = [];

  const d = await chartApiCall();
  const selectedYearValues = getPartnerValuesForYear(d, REF.year);

  const indicator = d?.Dimension("partner")?.id || [];

  const rawData = indicator.map((partnerId, index) => {
    const value = Number(selectedYearValues[index]);
    if (!excludedPartners.includes(partnerId) && !isNaN(value) && value > 0) {
      return { name: languageNameSpace.labels[partnerId] || partnerId, y: value };
    }
    return null;
  }).filter(item => item !== null);

  const finalSeries = buildTop5Series(rawData, languageNameSpace.labels["OTH"]);
  barChartSeries.push(...finalSeries);
}


async function createBarChart() {
  showChartLoader();
  try {

  const type = "column"   
  REF.chart = "barChart"



  await barchartdata();

  // If there is no data (all zeros / filtered out), show popup + container fallback and stop
  if (!barChartSeries || barChartSeries.length === 0 || barChartSeries.every(s => !s?.y)) {
    showNoDataPopup(languageNameSpace.labels['NODATA']);
    showNoDataInChartContainer(languageNameSpace.labels['NODATA']);
    return;
  }   

 

  const yAxisTitle = languageNameSpace.labels[REF.unit]   

  const xAxis =  { type: "category" };




  const tooltipFormatter = function() {
    return tooltipTable(this.points) ;
  };


  const chartOptions = {
    containerId: "chartContainer",
    type: type,
    title: getTitle(),
    subtitle: null,
    xAxis: xAxis,
    yAxisFormat: '{value:.2f}',
    yAxisTitle:  yAxisTitle,
    tooltipFormatter: tooltipFormatter,
    creditsText: credits(),
    creditsHref: `https://ec.europa.eu/eurostat/databrowser/view/${REF.dataset}/default/table?lang=${REF.language}`,
    series: [{name:languageNameSpace.labels[REF.dataset],data:barChartSeries}],
    colors: colors,
    legend: { enabled: false},
    columnOptions: {
        stacking: "normal",
        connectNulls: true,
        events: {
          mouseOver: function () {
            const point = this;
            // point.color available if needed
          }
        }
      },
      seriesOptions:""
};


const customChart = new Chart(chartOptions);
barChart = customChart.createChart();
  } finally {
    hideChartLoader();
  }





}


