function depData(params) {
    const url = `https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/${REF.dataset}?format=JSON&time=${REF.year}&unit=${REF.unit}&siec=${REF.siec}&lang=${REF.language}`;

    const data = JSONstat(url).Dataset(0);
    
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
                        name: data.__tree__.dimension.geo.category.label[countryIDs[j]],
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




function createDepChart() {
    REF.chart = "depChart"
    depData()
    const unit = languageNameSpace.labels[REF.unit];

    var arrow = REF.trade === "imp" ? '\u2192' : '\u2190';

    

    (function(H) {
        H.seriesTypes.dependencywheel.prototype.pointClass.prototype.getDataLabelPath = function(a) {
      
                      function EstimateLabelWidth(label) {
                          // Wasn't able to properly calculate the required width
                          // use label text length as a guide, this probably breaks if font size etc change a lot
                          return label.length * 3.6 + 15;
                      }
      
                      const c = this.series.chart.renderer;
                      const f = this.shapeArgs;
                      const e = 0 > this.angle || this.angle > Math.PI;
                      const g = f.start;
                      const b = f.end;
      
                      this.dataLabelPath ||
                      (this.dataLabelPath = c.arc({
                          open: true
                      }).add(a));
      
                      this.dataLabelPath.attr({
                          x: f.x,
                          y: f.y,
                          r: f.r + (this.series.options.dataLabels.distance),
                          start: e ? g : b,
                          end: e ? b : g,
                          clockwise: +e
                      });
      
                      const availWidth = (f.r + (this.series.options.dataLabels.distance || 0)) * (b - g);
      
                      if (EstimateLabelWidth(this.id) > availWidth) {
                          let shortName = this.id.toString().match(/\b([A-Z])/g).join('');
                          if (shortName.length < 2) {
                            // If acronym has less  
                              shortName = this.linksFrom[0].options.ctrCode;
                          }
                          a.textStr = this.linksFrom[0].options.ctrCode;
                          a.textSetter(this.linksFrom[0].options.ctrCode);
                      }      
                      return this.dataLabelPath;
                  };
      })(Highcharts);




    Highcharts.chart('chartContainer', {  
          title: {
              text: getTitle() 
          },      
          accessibility: {
              point: {
                  valueDescriptionFormat: '{index}. From {point.from} to {point.to}: {point.weight}.'
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
  }
  
  
  