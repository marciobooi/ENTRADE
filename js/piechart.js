async function createPieChart() {
  REF.chart = "pieChart";
  const chartContainer = document.getElementById("chartContainer");
  chartContainer.textContent = '';

  showChartLoader();
  try {
    await piechartdata();

    const chartTitle = getTitle();

    const emptyResponse = !piedata || piedata.length === 0 || piedata.every(pt => pt.y === 0);

    if (emptyResponse) {
      showNoDataPopup(languageNameSpace.labels['NODATA']);
      showNoDataInChartContainer(languageNameSpace.labels['NODATA']);
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
      creditsHref: `https://ec.europa.eu/eurostat/databrowser/view/${REF.dataset}/default/table?lang=${REF.language}`,
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

  const selectedYearValues = getPartnerValuesForYear(d, REF.year);
  const indicator = d.Dimension("partner")?.id || [];

  // Filter out excluded partners and values of 0 or less
  const rawData = indicator.map((partnerId, index) => {
    const value = Number(selectedYearValues[index]);
    if (!excludedPartners.includes(partnerId) && !isNaN(value) && value > 0) {
      return { name: languageNameSpace.labels[partnerId] || partnerId, y: value };    
    }
    return null;
  }).filter(item => item !== null);

  const finalSeries = buildTop5Series(rawData, languageNameSpace.labels["OTH"]);
  piedata.push(...finalSeries);
}
