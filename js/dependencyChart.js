async function depData(params) {
    const url = `https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/${REF.dataset}?format=JSON&time=${REF.year}&unit=${REF.unit}&siec=${REF.siec}&lang=${REF.language}`;

    const resp = await fetch(url);
    const json = await resp.json();
    const data = JSONstat(json).Dataset(0);
    
    // Get dimensions
    const geoDimension = data.Dimension("geo");
    const partnerDimension = data.Dimension("partner");

    // Get IDs of geographic areas and partner countries
    const countryIDs = geoDimension.id;
    const partnerIDs = partnerDimension.id;

    // Get values
    const values = data.value;

    // Initialize an array to store processed data
    processedData = []; 

    // load dummy data
    EU_MEMBER_COUNTRY_CODES.forEach(ctr => {
        processedData.push({
            name: languageNameSpace.labels[ctr],
            from: languageNameSpace.labels[ctr],
            to: languageNameSpace.labels[ctr],
            ctrCode: ctr,
            weight: 0
        });
        
    });
    NON_MEMBER_COUNTRY_CODES.forEach(ctr => {
        processedData.push({
            name: languageNameSpace.labels[ctr],
            from: languageNameSpace.labels[ctr],
            to: languageNameSpace.labels[ctr],
            ctrCode: ctr,
            weight: 0
        });
        
    });



    const aggregates = ['EURO_OTH', 'TOTAL', 'EU27_2020', 'EA20', 'NSP'];
 
        // load real data
    for (let i = 0; i < partnerIDs.length; i++) {
        // Loop through country IDs
        for (let j = 0; j < countryIDs.length; j++) {
            // Check if the country ID and partner ID are not in the aggregates array
            if (!aggregates.includes(countryIDs[j]) && !aggregates.includes(partnerIDs[i])) {
                const val = values[i * countryIDs.length + j];
                if (val > 0) {
                    const obj = {
                        name: countryIDs[j],
                        from: data.__tree__.dimension.partner.category.label[partnerIDs[i]],
                        to: data.__tree__.dimension.geo.category.label[countryIDs[j]],
                        ctrCode: partnerIDs[i],
                        weight: val
                    };


                    
                    processedData.push(obj);
                }
            }
        }
    }

    return processedData;
}




async function createDepChart() {
    REF.chart = "depChart";
    showChartLoader();
    try {
      await depData();
      const unit = languageNameSpace.labels[REF.unit];

    var arrow = REF.trade === "imp" ? '\u2192' : '\u2190';

    

    Highcharts.seriesTypes.dependencywheel.prototype.pointClass.prototype.getDataLabelPath = function(a){
        var c = this.series.chart.renderer,
        f = this.shapeArgs,
        e = 0 > this.angle || this.angle > Math.PI,
        g = f.start,
        b = f.end;
        // Create a dummy text element to get the bounding box width
        let tmpText = c.text("xx")
            // Set the appropriate text styles so that we get an accurate bounding box
            .attr({style: 'font-size: ' + a.text.styles.fontSize + '; font-weight: ' + a.text.styles.fontWeight })
            // We don't get the real box until it's been added
            .add();
        var width = tmpText.getBBox().width;
        // Clean up the dummy text element
        tmpText.destroy(); 
        // if (width < (f.r + (a.options.distance || 0))*(b-g) ) {
        //     // safe for arc shapeArgs (enough space for labelling in the arc)
        //     this.dataLabelPath = c.arc({open: !0}).add(a);
        //     this.dataLabelPath.attr({
        //         x: f.x,
        //         y: f.y,
        //         r: f.r + (a.options.distance || 0),
        //         start: e ? g : b,
        //         end: e ? b : g,
        //         clockwise: +e,
        //     })
        //     a.textStr = getKeyByValue(languageNameSpace.labels, this.id.toString())
        // } else {
            // go for radial
            var 
            x = (f.r + (a.options.distance / 2 || 0)) * Math.cos(this.angle) + f.x,
            y = (f.r + (a.options.distance / 2 || 0)) * Math.sin(this.angle) + f.y,
            p1 = [
                Math.round(x), 
                Math.round(y)
            ],
            p2 = [
                Math.round(x + Math.cos(this.angle) * width),
                Math.round(y + Math.sin(this.angle) * width)
            ];
            e = -Math.PI/2 > this.angle || this.angle > Math.PI/2;
            var svg_path = e ? ['M', p2[0], p2[1], 'L', p1[0], p1[1]] : ['M', p1[0], p1[1], 'L', p2[0], p2[1]] ;
            if (b - g === 0) {
                a.options.enabled = false;             
            } 
            a.textStr = getKeyByValue(languageNameSpace.labels, this.id.toString())
            if (!this.dataLabelPath) {
                this.dataLabelPath = c.path(svg_path).add(a);
            } else {
                this.dataLabelPath.attr({
                    d: svg_path
                });
            // }
        }
        return this.dataLabelPath;
    }



    Highcharts.chart('chartContainer', {  
        chart: {
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false,
            spacingBottom: 40,
            style: {
              fontFamily: 'arial,sans-serif',
              animation: true,
              duration: 1000,
            },
          },
          title: {
              text: getTitle() 
          },      
          accessibility: {
              point: {
                  valueDescriptionFormat: '{index}. From {point.from} to {point.to}: {point.weight}.'
              },
              // Ensure screen-reader region uses an H2 so heading order stays valid on the page
              screenReaderSection: {
                beforeChartFormat: '<h2>{chartTitle}</h2><div>{typeDescription}</div><div>{chartSubtitle}</div><div>{chartLongdesc}</div><div>{playAsSoundButton}</div><div>{viewTableButton}</div><div>{xAxisDescription}</div><div>{yAxisDescription}</div><div>{annotationsTitle}{annotationsList}</div>'
              }
          },        
          plotOptions: {
            series: {
                connectorAllowed: true,
                allowPointSelect: true,
                animation: {
                    duration: 2000
                }
              },          
            },
            tooltip: {
                formatter: function() {
                    if (this.point && this.point.isNode) {
                        // For nodes
                        return '<b>' + this.point.name + '</b><br>' +
                            'Total: ' + Highcharts.numberFormat(this.point.sum, 2) + ' ' +unit;
                    } else if (this.point) {
                        // For links
                        return '<b>' + this.point.from + ' ' + arrow + ' ' + this.point.to + '</b><br>' +
                            'Value: ' + Highcharts.numberFormat(this.point.weight, 2) + ' ' +unit;
                    } else {
                        // Handle other cases
                        return 'Unknown tooltip';
                    }
                }
            },
        credits: {
            text: credits(),
            href: 'https://ec.europa.eu/eurostat/databrowser/view/'+REF.dataset+'/default/table?lang=EN',
            position:{
              align:'center',
            },   
          },
          series: [{
              keys: ['from', 'to', 'weight'],
              data: processedData,
              type: 'dependencywheel',
              name: `trade`,
              dataLabels: {
                enabled: true,
                color: '#333',
                textPath: {
                  enabled: true,
                  attributes: {
                    dy: 5,
                  }
                },
                distance: 15
              },
             
              size: '85%',
              colors: ['#17256b'],

   
          }],
          exporting: {         
            enabled: true,
            sourceWidth: 1200,
            sourceHeight: 600,
            chartOptions: {
              xAxis: [{
                labels: {
                  style: {
                    fontSize: '10px'
                  }
                }
              }]
            },                   
          buttons: {
              contextButton: {
                  enabled: false
              }
          }
      }
      });
    } finally {
      hideChartLoader();
    }
  }
  
  
  