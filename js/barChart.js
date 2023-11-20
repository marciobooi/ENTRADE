function renderBarChart() {
    $wt.render("columnChart", {
      service: "charts",
      provider: "highcharts",
      version: "2.0",
      options: {
        series: "siec",
        categories: "partner",
        sheets: "geo",
        sheets_index: 0,
      },
      data: {
        chart: {
          type: "column",
          height: height,
          style: {
            animation: true,
            duration: 1000,
          },
          marginRight: 60,
          marginBottom: 100,
          height: height,
        },
        credits: {
          href: "https://ec.europa.eu/eurostat/web/energy/data/database",
          text: "Source: Eurostat",
          style: {
            fontFamily: "Verdana, Geneva, sans-serif",
            fontSize: "0.7em",
            fontWeight: "200",
          },
        },
        title: {
          text: languageNameSpace.labels[REF.trade] +
            " " +
            languageNameSpace.labels["title6"] +
            " " +
            languageNameSpace.labels[REF.siec] +
            " <br> " +
            newTitle +
            " - " +
            [dataNameSpace.ref.year] +
            "<br><spam class='pt-1' style='font-size:10px;font-weight: bold;'>" +
            languageNameSpace.labels[REF.unit] +
            "</spam>",
        },
        tooltip: {
          headerFormat: "",
          pointFormat: "<b>{point.name} <b>: {point.y:,.1f}</b> - " +
            languageNameSpace.labels[abbunit],
          style: {
            fontFamily: "Verdana, Geneva, sans-serif",
            fontSize: "1.2em",
            fontWeight: "200",
          },
        },
        xAxis: {
          type: "category",
          // categories: languageNameSpace.labels[countries],
          labels: {
            rotation: 45,
            align: "top",
          },
        },
        yAxis: {
          allowDecimals: false,
          title: {
            text: languageNameSpace.labels[REF.unit],
          },
        },
        plotOptions: {
          series: {
            colorByPoint: true,
            colors: ["#32afaf"],
          },
        },
        legend: {
          itemStyle: {
            fontWeight: "bold",
          },
          enabled: false,
        },
        series: [
          {
            data: pieData,
          },
        ],
        exporting: {
          chartOptions:{
            legend:{
              enabled:true
            }
          },
          buttons: {
            contextButton: {
              menuItems: ["printChart",
                          "separator",
                          "downloadPNG",
                          "downloadJPEG",
                          // "downloadPDF",
                          "downloadSVG",
                          "separator",
                          "downloadCSV",
                          "downloadXLS",
                          //"viewData",
                          // "openInCloud"
                        ]
            }
          }
        }
      },
      "lang": REF.language.toLowerCase()
    });
  }