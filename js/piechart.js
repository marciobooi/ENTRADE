function renderPie() {
    $wt.render("pieChart", {
      service: "charts",
      provider: "highcharts",
      version: "2.0",
      dataset: {
        options: {
          data: pieData,
        },
      },
      data: {
        chart: {
          type: "pie",
          height: height,
          style: {
            animation: true,
            duration: 1000,
          },
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
          text: languageNameSpace.labels[REF.trade] + " " + languageNameSpace.labels["title6"] + " " + languageNameSpace.labels[REF.siec] +
            " <br> " + newTitle + " - " + [dataNameSpace.ref.year] + "<br><spam class='pt-1' style='font-size:10px;font-weight: bold;'>" + languageNameSpace.labels[REF.unit] + "</spam>",
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
        plotOptions: {
          series: {
            dataLabels: {
              enabled: true,
              format: "<b>{point.name}: <b>{point.percentage:.1f}%</b>",
              connectorColor: "silver",
              className: "chartfont",
              style: {
                fontFamily: "Verdana, Geneva, sans-serif",
                fontSize: "1.2em",
                fontWeight: "200",
              },
            },
          },
        
          pie: {
            startAngle: 5,
            allowPointSelect: true,
            borderWidth: 0,
            //innerSize: 80,
            innerSize: 0,
            cursor: "pointer",
          },
          slicedOffset: 27,
        },    
        colors: ramdomcolor,
        legend: {
          itemStyle: {
            fontSize: 15,
            fontWeight: "300",
          },
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
        },     
      },
      "lang": REF.language.toLowerCase()
    });
  }