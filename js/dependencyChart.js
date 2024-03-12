function depData(params) {
    const url = `https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/${REF.dataset}?format=JSON&time=2022&unit=TJ_GCV&siec=G3000&lang=${REF.language}`;

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

    const aggregates = ['EURO_OTH', 'TOTAL', 'EU27_2020', 'EA20', 'NSP'];

    partnerIDs.forEach((partner, i) => {
        for (let j = 0; j < countryIDs.length; j++) {
            // Check if the country ID and partner ID are not in the aggregates array
            if (!aggregates.includes(countryIDs[j]) && !aggregates.includes(partner)) {
                const val = values[i * countryIDs.length + j];
                if (val > 0) {
                    obj = {
                        name: data.__tree__.dimension.geo.category.label[countryIDs[j]],
                        from: data.__tree__.dimension.partner.category.label[partner],
                        to: data.__tree__.dimension.geo.category.label[countryIDs[j]],
                        weight: val
                    }
                    processedData.push(obj);
                }
            }
        }
    });

    return processedData;
}


function createDepChart() {
    depData()
    const unit = languageNameSpace.labels[REF.unit];

    var arrow = REF.trade === "imp" ? '\u2192' : '\u2190';

      Highcharts.chart('chartContainer', {  
          title: {
              text: 'Highcharts Dependency Wheel'
          },
      
          accessibility: {
              point: {
                  valueDescriptionFormat: '{index}. From {point.from} to {point.to}: {point.weight}.'
              }
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
          series: [{
              keys: ['from', 'to', 'weight'],
              data: processedData,
              type: 'dependencywheel',
              name: 'Dependency wheel series',
              dataLabels: {
                  color: '#333',
                  style: {
                      textOutline: 'none'
                  },
                  textPath: {
                    enabled: true,
                    attributes: {
                        dy: 5
                    }
                },
                  distance: 10
              },
              size: '95%',
              colors: ['#17256b'],

   
          }]
      
      });
  }
  
  
  