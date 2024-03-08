function depData(params) {

const url = 'https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/nrg_ti_gas?format=JSON&time=2022&unit=TJ_GCV&siec=G3000&partner=BE&partner=BG&partner=CZ&partner=DK&partner=DE&partner=EE&partner=IE&partner=EL&partner=ES&partner=FR&partner=HR&partner=IT&partner=CY&partner=LV&partner=LT&partner=LU&partner=HU&partner=MT&partner=NL&partner=AT&partner=PL&partner=PT&partner=RO&partner=SI&partner=SK&partner=FI&partner=SE&partner=IS&partner=LI&partner=NO&partner=CH&partner=UK&partner=BA&partner=ME&partner=MD&partner=MK&partner=AL&partner=RS&partner=TR&partner=UA&partner=XK&partner=GE&partner=AD&partner=BY&partner=GI&partner=RU&partner=EX_SU_OTH&partner=EUR_OTH&partner=AO&partner=CM&partner=CG&partner=CD&partner=GQ&partner=GA&partner=ST&partner=DJ&partner=ER&partner=ET&partner=KE&partner=MG&partner=MU&partner=MZ&partner=UG&partner=TZ&partner=DZ&partner=EG&partner=LY&partner=MA&partner=SS&partner=SD&partner=TN&partner=NA&partner=ZA&partner=BJ&partner=CV&partner=CI&partner=GH&partner=GW&partner=LR&partner=MR&partner=NE&partner=NG&partner=SN&partner=SL&partner=TG&partner=AFR_OTH&partner=CA&partner=US&partner=AW&partner=BS&partner=BB&partner=VG&partner=CU&partner=CW&partner=DO&partner=JM&partner=TT&partner=BZ&partner=CR&partner=GT&partner=HN&partner=MX&partner=PA&partner=AR&partner=BO&partner=BR&partner=CL&partner=CO&partner=EC&partner=PE&partner=UY&partner=VE&partner=AME_OTH&partner=KZ&partner=KG&partner=TJ&partner=TM&partner=UZ&partner=CN&partner=HK&partner=JP&partner=MN&partner=KP&partner=KR&partner=TW&partner=BD&partner=IN&partner=IR&partner=NP&partner=PK&partner=LK&partner=BN&partner=KH&partner=ID&partner=LA&partner=MY&partner=MM&partner=PH&partner=SG&partner=TH&partner=TL&partner=VN&partner=AM&partner=AZ&partner=BH&partner=IQ&partner=IL&partner=JO&partner=KW&partner=LB&partner=OM&partner=QA&partner=SA&partner=SY&partner=AE&partner=YE&partner=ASI_NME_OTH&partner=ASI_OTH&partner=AU&partner=NZ&partner=NC&partner=PG&partner=MH&partner=TOTAL&partner=NSP&lang=en'








    return data = [
        ['Brazil', 'Portugal', 5],
        ['Brazil', 'France', 1],
        ['Brazil', 'Spain', 1],
        ['Brazil', 'England', 1],
        ['Canada', 'Portugal', 1],
        ['Canada', 'France', 5],
        ['Canada', 'England', 1],
        ['Mexico', 'Portugal', 1],
        ['Mexico', 'France', 1],
        ['Mexico', 'Spain', 5],
        ['Mexico', 'England', 1],
        ['USA', 'Portugal', 1],
        ['USA', 'France', 1],
        ['USA', 'Spain', 1],
        ['USA', 'England', 5],
        ['Portugal', 'Angola', 2],
        ['Portugal', 'Senegal', 1],
        ['Portugal', 'Morocco', 1],
        ['Portugal', 'South Africa', 3],
        ['France', 'Angola', 1],
        ['France', 'Senegal', 3],
        ['France', 'Mali', 3],
        ['France', 'Morocco', 3],
        ['France', 'South Africa', 1],
        ['Spain', 'Senegal', 1],
        ['Spain', 'Morocco', 3],
        ['Spain', 'South Africa', 1],
        ['England', 'Angola', 1],
        ['England', 'Senegal', 1],
        ['England', 'Morocco', 2],
        ['England', 'South Africa', 7],
        ['South Africa', 'China', 5],
        ['South Africa', 'India', 1],
        ['South Africa', 'Japan', 3],
        ['Angola', 'China', 5],
        ['Angola', 'India', 1],
        ['Angola', 'Japan', 3],
        ['Senegal', 'China', 5],
        ['Senegal', 'India', 1],
        ['Senegal', 'Japan', 3],
        ['Mali', 'China', 5],
        ['Mali', 'India', 1],
        ['Mali', 'Japan', 3],
        ['Morocco', 'China', 5],
        ['Morocco', 'India', 1],
        ['Morocco', 'Japan', 3],
        ['Japan', 'Brazil', 1]
    ]
    
}


function createDepChart() {


    depData()

    Highcharts.chart('chartContainer', {

        title: {
            text: 'Highcharts Dependency Wheel'
        },
    
        accessibility: {
            point: {
                valueDescriptionFormat: '{index}. From {point.from} to {point.to}: {point.weight}.'
            }
        },
    
        series: [{
            keys: ['from', 'to', 'weight'],
            data: data,
            type: 'dependencywheel',
            name: 'Dependency wheel series',
            dataLabels: {
                color: '#333',
                style: {
                    textOutline: 'none'
                },
                textPath: {
                    enabled: true
                },
                distance: 10
            },
            size: '95%'
        }]
    
    });
    
  
  
  
  }
  
  
  