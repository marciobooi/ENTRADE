class Chart {
    constructor(options) {
      this.containerId = options.containerId;
      this.type = options.type;
      this.title = options.title;
      this.subtitle = options.subtitle;
      this.xAxis = options.xAxis;
      this.yAxisFormat = options.yAxisFormat;
      this.tooltipFormatter = options.tooltipFormatter;
      this.creditsText = options.creditsText;
      this.creditsHref = options.creditsHref;
      this.series = options.series;
      this.colors = options.colors;
      this.legend = options.legend;
      this.columnOptions = options.columnOptions;
      this.pieOptions = options.pieOptions;
      this.seriesOptions = options.seriesOptions;
      this.yAxisTitle = options.yAxisTitle;
    }
  
    createChart() {
      Highcharts.chart(this.containerId, {
        chart: {
          type: this.type,
          plotBackgroundColor: null,
          plotBorderWidth: null,
          plotShadow: false,
          spacingBottom: 50,
          style: {
            fontFamily: 'arial,sans-serif',
            animation: true,
            duration: 1000,
          },
        },
        title: {
          text: this.title,
        },
        subtitle: {
          text: this.subtitle,
        },
        xAxis: this.xAxis,
        yAxis: {
          labels: {
            format: this.yAxisFormat, 
            formatter: function() {
              // Handle zero value separately
              if (this.value === 0) {
                  return '0';
              }

              // Define an array with abbreviated suffixes
              var suffixes = ['k', 'M', 'G', 'T', 'P', 'E'];

              // Get the absolute value of the label
              var value = Math.abs(this.value);

              // Find the appropriate suffix based on the magnitude of the value
              var suffixIndex = Math.floor(Math.log10(value) / 3);

              // Calculate the abbreviated value
              var abbreviatedValue = value / Math.pow(10, suffixIndex * 3);

              // Format the abbreviated value with at most one decimal place
              var formattedValue = abbreviatedValue.toFixed(1).replace(/\.0+$/, '');

              // Return the formatted label with the appropriate suffix
              return formattedValue + suffixes[suffixIndex];
          }
          },
          title: {
            enabled: true,
            text: this.yAxisTitle,            
          },
        },
        colors: this.colors,
        tooltip: {
          formatter: this.tooltipFormatter,
          valueDecimals: 4,
          shared: true,
          useHTML: true,         
          padding: 0,
          // backgroundColor: "rgba(255,255,255,0.9)",   
        },
        credits: {
          text: this.creditsText,
          href: this.creditsHref,
          position:{
            align:'center',
          },   
        },
        legend: {                
          itemHiddenStyle: {
            color: '#767676'
          },
          itemStyle: {
            fontSize: '1rem',
          }
        },
        legend: this.legend,
        plotOptions: {
          column: this.columnOptions,
          pie: this.pieOptions,
          series: this.seriesOptions,
      },
        series: this.series,
        exporting: {      
          enabled: true,
          allowHTML: true,
          sourceWidth: 1200,
          sourceHeight: 800,
          scale: 1,
          chartOptions: {
            subtitle: null,
            credits:"",
            chart: {
              marginTop: 100,
              marginLeft: 100,
              marginRight: 100,
              events: {
                load: function () {                  
                  this.renderer.image(
                    'https://ec.europa.eu/eurostat/statistics-explained/images/0/09/Logo_RGB-POS.png', 
                    1100, 
                    750, 
                    90, 
                    50
                  ).add();
                },
                redraw: function () {
                  const chart = this;
                  const images = chart.container.getElementsByTagName('image');
                  if (images.length > 0) {
                    images[0].setAttribute('x', chart.chartWidth - 100);
                    images[0].setAttribute('y', chart.chartHeight - 40);
                  }
                }
              }
          } 
          },
                      
          buttons: {
              contextButton: {
                  enabled: false
              }
          }, 
          csv: {
            columnHeaderFormatter: function(item, key) {
                if (!item || item instanceof Highcharts.Axis) {
                  const chartLabels = {
                    "pieChart": languageNameSpace.labels["IND"],
                    "barChart": languageNameSpace.labels["CTR"],
                    "mainChart": languageNameSpace.labels["CTR"],
                    // Add more chart types and their corresponding labels here
                };                    
                // Default label for unknown chart types
                const defaultLabel = languageNameSpace.labels["YEAR"];  
                log(chartLabels[REF.chartId])
                const label = chartLabels[REF.chartId] || defaultLabel;
                return label;                   
                } else {
                    return item.name;
                }
            }
        }
      }
      }); // end of chart object
      enableScreenREader()
    } // end of chart function

    redrawChart() {
      if (this.chart) {
          this.chart.redraw();
          console.log('Chart redrawn');
      } else {
          console.log('Chart has not been created yet');
      }
  }
    
  }

  // function that return empty chart for when is no data to display
  function nullishChart() {
    const chartOptions = {
      containerId: "chart",
      type: null,
      title: null,
      subtitle: null,
      xAxis: null,
      yAxisFormat: null,
      tooltipFormatter: null,
      creditsText: "Source: Eurostat",
      creditsHref: "",
      series: [{ data: [] }],
      colors: null,
      legend: true,
      columnOptions: "",
      seriesOptions: ""
    };
  
    const chart = new Chart(chartOptions);
    chart.createChart();
  }
  

  