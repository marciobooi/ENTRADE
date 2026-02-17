async function createPieChart() {
  REF.chart = "pieChart";
  const chartContainer = document.getElementById("chartContainer");
  chartContainer.textContent = '';

  showChartLoader();
  try {
    await piechartdata();

    const chartTitle = getTitle();

    const emptyResponse = d==null || Object.values(d.value).some(x => (x == null && x == ''));

    if (emptyResponse) {
      nullishChart();
      return;
    }

    const seriesOpt = {
      showInLegend: true,
      dataLabels: { enabled: true },
    };

    const pieOpt = {
      allowPointSelect: true,
      innerSize: "75%",
      showInLegend: true,
      animation: true,
      cursor: "pointer",
      dataLabels: { enabled: true, style: { fontSize: '.8rem', fontWeight: 'normal' }, format: "<b>{point.name}</b>:<br>{point.percentage:.1f} %<br>value: {point.y:,.4f} " + languageNameSpace.labels["abr_"+REF.unit], },
    };

    const fullChart = window.innerWidth > 700;
    const legendSmall = { layout: 'horizontal', padding: 3, itemMarginTop: 5, itemMarginBottom: 5, itemHiddenStyle: { color: '#767676' }, itemStyle: { fontSize: '.9rem', fontWeight: 'light' } };

    const tooltipFormatter = function() { return pieTolltip(this.point); };

    const chartOptions = {
      containerId: "chartContainer",
      type: "pie",
      title: chartTitle,
      subtitle: null,
      xAxis: null,
      yAxisFormat: "",
      tooltipFormatter: tooltipFormatter,
      creditsText: credits(),
      series: [{ data: piedata, name: languageNameSpace.labels[REF.dataset] }],
      colors: colors,
      legend: legendSmall,
      pieOptions: pieOpt,
      columnOptions: null,
      seriesOptions: seriesOpt,
    };

    const chart = new Chart(chartOptions);
    chart.createChart();
  } finally {
    hideChartLoader();
  }
}

async function piechartdata() {
   piedata = [];

  const d = await chartApiCall();

  if (d === null) {
    return []; 
  }

  const indicator = d.Dimension("partner").id;

  // Filter out excluded partners and values of 0 or less
  const data = indicator.map((indicator, index) => {
    if (!excludedPartners.includes(indicator) && d.value[index] > 0) {
      return {name: languageNameSpace.labels[indicator], y: d.value[index]};    
    }
    return null;
  }).filter(partner => partner !== null);

  if (REF.filter === "top5") {
    // Sort by value (descending)
    data.sort((a, b) => b.y - a.y);

    // Get the top 5 countries
    const topCountries = data.slice(0, 5);
  
    // Sum the values of the remaining countries
    const sumOfOthers = data.slice(5).reduce((sum, item) => sum + item.y, 0);

    // Only add "Others" if sumOfOthers is greater than 0
    const finalData = sumOfOthers > 0 
      ? topCountries.concat([{ name: languageNameSpace.labels["OTH"], y: sumOfOthers }]) 
      : topCountries;

    piedata.push(...finalData);
  } else {
    piedata.push(...data);
  }

  // Sort the final data again by value (descending)
  piedata.sort((a, b) => b.y - a.y);

}
