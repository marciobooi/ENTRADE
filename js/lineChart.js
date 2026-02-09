function createLineChart() {

  REF.chart = "lineChart"

  d = chartApiCall();


  const years = d.Dimension("time").id;


  linechartdata(d)

  const tooltipFormatter = function () { return tooltipTable(this.points);}; 
   



    const chartOptions = {
      containerId: "chartContainer",
      type: "spline",
      title: getTitle(),
      subtitle: null,
      xAxis: { categories: years },
      yAxisFormat: "{value:.0f}",
      tooltipFormatter: tooltipFormatter,
      creditsText: credits(),
      creditsHref: 'https://ec.europa.eu/eurostat/databrowser/view/'+REF.dataset+'/default/table?lang=EN',
      series: lineChartData.sort((a, b) => a.name.localeCompare(b.name)),
      colors: colors,
      legend: {
        padding: 3,   
        itemMarginTop: 5,
        itemMarginBottom: 5,
        itemHiddenStyle: {
          color: '#767676'
        },
        itemStyle: {
          fontSize: '.9rem',
          fontWeight: 'light'
        }
      },       
      columnOptions: {
          stacking: "normal",
          events: {
            mouseOver: function () {
              const point = this;
              const color = point.color;
              const tooltipBox = document.querySelector('path.highcharts-label-box.highcharts-tooltip-box');
              if (tooltipBox) {
                tooltipBox.setAttribute('stroke', color);
              }
            }
          }
        },
      seriesOptions: ""      
    };
    
    const chart = new Chart(chartOptions);
    chart.createChart();    
}



function linechartdata(d) {
  lineChartData = [];

  const partners = d.Dimension('partner').id;
  const years = d.Dimension('time').id;

  partners.forEach((partner, partnerIndex) => {
    // Exclude partners based on the excludedPartners array, except for "NSP"
    if (!excludedPartners.includes(partner) || partner !== "NSP") {
      const data = years.map((year, yearIndex) => {
        isNaN(d.value) || d.value === undefined ? 0 : d.value = d.value;
        return d.value[partnerIndex * years.length + yearIndex] || 0;
      });

      const allZeros = data.every(value => value === 0);
      const partnerName = languageNameSpace.labels[partner];

      if (!allZeros) {
        lineObj = {
          name: partnerName,
          data: data,
        };
        lineChartData.push(lineObj);
      }
    }
  });



  if(REF.filter === "top5") {

  // Calculate the total for each country
  lineChartData.forEach((lineObj) => {
    lineObj.total = lineObj.data.reduce((sum, value) => sum + value, 0);
  });

  // Sort lineChartData based on total values in descending order
  lineChartData.sort((a, b) => b.total - a.total);

  // Select the top 5 countries
  const top5 = lineChartData.slice(0, 5);
  const rest = lineChartData.slice(5, lineChartData.length);

  // Sum values for countries in 'rest'
  const restTotal = rest.reduce((sum, lineObj) => sum + lineObj.total, 0);

  // Create an 'others' category in lineChartData
  lineChartData = top5;
  lineChartData.push({
    name: languageNameSpace.labels["OTH"],
    data: years.map((year, yearIndex) => {
      return rest.reduce((sum, lineObj) => sum + lineObj.data[yearIndex], 0);
    }),
    total: restTotal,
  });
} 
 
}



























