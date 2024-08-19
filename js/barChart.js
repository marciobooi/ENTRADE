function barchartdata() {
  barChartSeries = [];

  d = chartApiCall();

  const indicator = d.Dimension("partner").id;

  const data = indicator.map((indicator, index) => {
    if (!excludedPartners.includes(indicator) && d.value[index] > 0) {
      return { name: languageNameSpace.labels[indicator], y: d.value[index] };
    }
    return null;
  }).filter(partner => partner !== null);

  data.sort((a, b) => {
    if (a.name === 'others') return 1; // "others" always comes last
    if (b.name === 'others') return -1;
    return b.y - a.y;
  });

  if (REF.filter === "top5") {  
    const topCountries = data.slice(0, 5);
    const sumOfOthers = data.slice(5).reduce((sum, item) => sum + item.y, 0);

    // Determine the final data to be used, only adding "OTH" if sumOfOthers is greater than 0
    const finalData = sumOfOthers > 0 
        ? topCountries.concat([{ name: languageNameSpace.labels["OTH"], y: sumOfOthers, color: 'red' }]) 
        : topCountries;

    // Add the final data to the bar chart series
    barChartSeries.push(...finalData);
} else {
    // If the filter is not "top5", just use the original data
    barChartSeries.push(...data);
}

}


function createBarChart() {

  const type = "column"   
  REF.chart = "barChart"



  barchartdata();   

 

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
    creditsHref: "",
    series: [{name:languageNameSpace.labels[REF.dataset],data:barChartSeries}],
    colors: colors,
    legend: { enabled: false},
    columnOptions: {
        stacking: "normal",
        connectNulls: true,
        events: {
          mouseOver: function () {
            var point = this;
            var color = point.color;
            // $('path.highcharts-label-box.highcharts-tooltip-box').css('stroke', color);
          }
        }
      },
      seriesOptions:""
};


const customChart = new Chart(chartOptions);
barChart = customChart.createChart();





}


