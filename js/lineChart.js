function rendertimeChart() {
    $wt.render("timeChart", {
      service: "charts",
      provider: "highcharts",
      version: "2.0",
      dataset: {
        options: {
          series: filteredSeries,
        },
      },
      data: {
        colors: ramdomcolor,
        title: {
          text: languageNameSpace.labels[REF.trade] +
            " " +
            languageNameSpace.labels["title6"] +
            " " +
            languageNameSpace.labels[REF.siec] +
            " <br> " +
            newTitle +
            "<br><spam class='pt-1' style='font-size:10px;font-weight: bold;'>" +
            languageNameSpace.labels[REF.unit] +
            "</spam>",
        },
        // , "subtitle": {
        //     "text": '' + languageNameSpace.labels["timeChartSub"]
        // , }
        credits: {
          href: "https://ec.europa.eu/eurostat/web/energy/data/database",
          text: "Source: Eurostat",
        },
        chart: {
          type: "line",
          height: height,
        },
        yAxis: {
          allowDecimals: false,
          title: {
            text: " " + languageNameSpace.labels[REF.unit],
          },
        },
        xAxis: {
          categories: timezone,
          enabled: true,
        },
        scrollbar: {
          enabled: true,
        },
        legend: {
          itemStyle: {
            fontWeight: "bold",
          },
          enabled: false,
        },
        tooltip: {
          valueDecimals: 1,
          valueSuffix: " " + languageNameSpace.labels[abbunit],
          shared: true,
        },
        responsive: {
          rules: [
            {
              condition: {
                maxWidth: 820,
                maxHeight: 400,
              },
              chartOptions: {
                xAxis: {
                  labels: {
                    style: {
                      fontSize: "6px",
                      color: "lightblue",
                    },
                  },
                },
                legend: {
                  layout: "horizontal",
                  align: "center",
                  verticalAlign: "bottom",
                },
              },
            },
          ],
        },
        series: filteredSeries,
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