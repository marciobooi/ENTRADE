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

  if (data.length > 5) {
    data.sort((a, b) => {
      if (a.name === 'others') return 1; // "others" always comes last
      if (b.name === 'others') return -1;
      return b.y - a.y;
    });

    const topCountries = data.slice(0, 5);
    const sumOfOthers = data.slice(5).reduce((sum, item) => sum + item.y, 0);
    const finalData = topCountries.concat([{ name: 'others', y: sumOfOthers, color: 'rgb(37 123 228)'}]);
    barChartSeries.push(...finalData);
  } else {
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
            $('path.highcharts-label-box.highcharts-tooltip-box').css('stroke', color);
          }
        }
      },
      seriesOptions:""
};


const customChart = new Chart(chartOptions);
barChart = customChart.createChart();





}


