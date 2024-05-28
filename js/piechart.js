function createPieChart() {
  REF.chart = "pieChart";
  $('#chartContainer').empty()

  piechartdata()
 
  const chartTitle = getTitle()  

  const emptyResponse = d==null || Object.values(d.value).some(x => (x == null && x == ''))


  if (emptyResponse) {
    nullishChart();
    return
  }
  
  const seriesOpt = {
    showInLegend: true,
    dataLabels: {
      enabled: true,
    },
  };


  const pieOpt = {  
    allowPointSelect: true,
    // size: "75%",
    innerSize: "75%",
    showInLegend: true,
    animation: true,
    cursor: "pointer",
    dataLabels: {
      enabled: true,
      style: {
        fontSize: '.8rem',
        fontWeight: 'normal'
    },
    format: "<b>{point.name}</b>:<br>{point.percentage:.1f} %<br>value: {point.y:,.4f} " + languageNameSpace.labels["abr_"+REF.unit],
    },
  }
  
  const fullChart = $(window).width() > 700;

  const legendBig = {
      align: 'right',
      verticalAlign: 'middle',
      layout: 'vertical'
  };
  
  const legendSmall = {     
    layout: 'horizontal',
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
}

  const tooltipFormatter = function() {
    return pieTolltip(this.point);
  };

  const chartOptions = {
    containerId: "chartContainer",
    type: "pie",
    title: chartTitle,
    subtitle: null,
    xAxis: null,
    yAxisFormat: "",
    tooltipFormatter: tooltipFormatter,
    creditsText: credits(),
    creditsHref: "",
    series: [
      {
        data: piedata,
        name: languageNameSpace.labels[REF.dataset],
      },
    ],
    colors: colors,
    legend: legendSmall,
    pieOptions: pieOpt,
    columnOptions: null,
    seriesOptions: seriesOpt,
  
  };
  
  const chart = new Chart(chartOptions);
  chart.createChart();


}


function piechartdata() {
  piedata = [];

  d = chartApiCall();

  if (d === null) {
    return []; 
  }

  const indicator = d.Dimension("partner").id;

  const data = indicator.map((indicator, index) => {
    if (!excludedPartners.includes(indicator) && d.value[index] > 0) {
      return {name: languageNameSpace.labels[indicator],y: d.value[index]}      
    }
    return null;
  }).filter(partner => partner !== null);



  if (REF.filter === "top5") {
    data.sort((a, b) => b.y - a.y);
    const topCountries = data.slice(0, 5);
  
    const sumOfOthers = data.slice(5).reduce((sum, item) => sum + item.y, 0);
  
    const finalData = topCountries.concat([{ name: languageNameSpace.labels["OTH"], y: sumOfOthers }]);
  
    piedata.push(...finalData);
  } else {
    piedata.push(...data);
  }

piedata.sort((a, b) => b.y - a.y);


}
