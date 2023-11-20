function changeImage(counter) {
  var images = [
    '<i class="fad fa-analytics"></i>',
    '<i class="fad fa-chart-pie"></i>',
    '<i class="fad fa-globe-europe"></i>',
    '<i class="fad fa-chart-line"></i>',
    '<i class="fad fa-chart-bar"></i>',
    '<i class="fad fa-chart-area"></i>',
    '<i class="fad fa-chart-scatter"></i>',
    '<i class="far fa-analytics"></i>',
    '<i class="fad fa-chart-area"></i>',
    '<i class="fad fa-chart-line"></i>',
    '<i class="fad fa-chart-bar"></i>',
    '<i class="fad fa-analytics"></i>',
    '<i class="fad fa-chart-pie"></i>',
    '<i class="fad fa-globe-europe"></i>',
    '<i class="fad fa-chart-line"></i>',
    '<i class="fad fa-chart-bar"></i>',
    '<i class="fad fa-chart-area"></i>',
    '<i class="fad fa-chart-scatter"></i>',
    '<i class="far fa-analytics"></i>',
    '<i class="fad fa-chart-area"></i>',
    '<i class="fad fa-chart-line"></i>',
    '<i class="fad fa-chart-bar"></i>',
  ];

  var images2 = [
    '<i class="fad fa-chart-bar"></i>',
    '<i class="fad fa-analytics"></i>',
    '<i class="far fa-analytics"></i>',
    '<i class="fad fa-chart-area"></i>',
    '<i class="fad fa-chart-pie"></i>',
    '<i class="fad fa-chart-scatter"></i>',
    '<i class="fad fa-chart-line"></i>',
    '<i class="fad fa-chart-line"></i>',
    '<i class="fad fa-globe-europe"></i>',
    '<i class="fad fa-chart-bar"></i>',
    '<i class="fad fa-chart-area"></i>',
    '<i class="fad fa-chart-bar"></i>',
    '<i class="fad fa-analytics"></i>',
    '<i class="far fa-analytics"></i>',
    '<i class="fad fa-chart-area"></i>',
    '<i class="fad fa-chart-pie"></i>',
    '<i class="fad fa-chart-scatter"></i>',
    '<i class="fad fa-chart-line"></i>',
    '<i class="fad fa-chart-line"></i>',
    '<i class="fad fa-globe-europe"></i>',
    '<i class="fad fa-chart-bar"></i>',
    '<i class="fad fa-chart-area"></i>',
  ];

  var images3 = [
    '<i class="fad fa-chart-line"></i>',
    '<i class="fad fa-chart-area"></i>',
    '<i class="fad fa-chart-bar"></i>',
    '<i class="fad fa-chart-scatter"></i>',
    '<i class="fad fa-globe-europe"></i>',
    '<i class="fad fa-analytics"></i>',
    '<i class="fad fa-chart-pie"></i>',
    '<i class="fad fa-chart-bar"></i>',
    '<i class="far fa-analytics"></i>',
    '<i class="fad fa-chart-scatter"></i>',
    '<i class="fad fa-analytics"></i>',
    '<i class="fad fa-chart-line"></i>',
    '<i class="fad fa-chart-area"></i>',
    '<i class="fad fa-chart-bar"></i>',
    '<i class="fad fa-chart-scatter"></i>',
    '<i class="fad fa-globe-europe"></i>',
    '<i class="fad fa-analytics"></i>',
    '<i class="fad fa-chart-pie"></i>',
    '<i class="fad fa-chart-bar"></i>',
    '<i class="far fa-analytics"></i>',
    '<i class="fad fa-chart-scatter"></i>',
    '<i class="fad fa-analytics"></i>',
  ];

  $(".loader .image").html("" + images[counter] + "");
  $(".loader .image2").html("" + images2[counter] + "");
  $(".loader .image3").html("" + images3[counter] + "");
}

function loading() {

  var fullWidth = window.innerWidth;
  var fullHeight = window.innerHeight;

$wt.render("words", {
  "service": "charts",
  "version": "2.0",
  "provider": "highcharts",  
  "plugins": [
    "more",
    "wordcloud"
  ],
  "dataset": {
    "format": "json",
    "source": wordcloudtext
  },
  "data": {
    chart: {
      type: 'line',
      width: fullWidth,
      height: fullHeight,
      backgroundColor: 'linear-gradient(to right, rgb(23, 82, 82) 0%, rgb(51, 175, 175) 100%)',
      backgroundColor: {
        linearGradient: [0, 500, 500, 0],
        stops: [
            [0, 'rgb(23, 82, 82)'],
            [1, 'rgb(51, 175, 175)']
        ]
    },
  
  },
  plotOptions: {
    series: {
      colorByPoint: true,
      colors: ["#32afaf"],
      
minFontSize: 2,
maxFontSize: 10,
      style: {
        fontFamily: '"Montserrat", sans-serif',
        color: 'rgba(255, 255, 255, 0.30)'
    },
    rotation: {
      from: 0,
      to: 0,
  },
    },
  },

    title: {
      text: null,
    },
    tooltip: {
      enabled: false
    },
    exporting: {
      enabled: false
    },
  }, 
});




  var num = 0;

  for (i = 0; i <= 100; i++) {
    setTimeout(function () {
      $(".loader span").html(num + "%");

      if (num == 100) {
          loading();
        $(".master").fadeOut(1500, function () {
          $(".master").css("display", "none");
          $("#page").css("display", "initial");
          $("body").css("overflow", "auto");
        });
      }
      num++;
    }, i * 70);
  }
}

chartData = {
  "title": {
    "text": ""
  }
}
" "
wordcloudtext = [
  {
    "type": "wordcloud",
    "name": "Occurrences",
    "data": [
      { "name": "coal", "weight": 5,  },
      { "name": "briquettes and peat", "weight": 7 },
      { "name": "briquettes", "weight": 10 },
      { "name": "plants", "weight": 6 },
      { "name": "industry", "weight": 5 },
      { "name": "sector", "weight": 4 },
      { "name": "energy use", "weight": 3 },
      { "name": "Gross electricity production", "weight": 4 },
      { "name": "Energy efficiency", "weight": 3 },
      { "name": "Energy", "weight": 11 },
      { "name": "Renewable", "weight": 3 },
      { "name": "GEO", "weight": 9 },
      { "name": "KTOE", "weight": 4 },
      { "name": "Energy consumption", "weight": 8 },
      { "name": "households", "weight": 7 },
      { "name": "adequately", "weight": 10 },
      { "name": "warm", "weight": 3 },
      { "name": "consumption", "weight": 3 },
      { "name": "Biogases", "weight": 4 },
      { "name": "Solid fossil fuels", "weight": 6 },
      { "name": "Final consumptio", "weight": 9 },
      { "name": "Coal", "weight": 11 },
      { "name": "W6220", "weight": 7 },
      { "name": "Non-renewable", "weight": 5 },
      { "name": "municipal", "weight": 3 },
      { "name": "waste", "weight": 2 },
      { "name": "Other hydrocarbons", "weight": 8 },
      { "name": "Naphtha", "weight": 4 },
      { "name": "Aviation", "weight": 6 },
      { "name": "gasoline", "weight": 7 },
      { "name": "Gasoline-type", "weight": 9 },
      { "name": "Lubricants", "weight": 7 },
      { "name": "Solar", "weight": 5 },
      { "name": "photovoltaic", "weight": 3 },
      { "name": "R5230P", "weight": 2 },
      { "name": "Pure", "weight": 6 },
      { "name": "bio", "weight": 5 },
      { "name": "jet kerosene", "weight": 5 },
      { "name": "Blended", "weight": 9 },
      { "name": "", "weight": 7 }
    ]
  }
]