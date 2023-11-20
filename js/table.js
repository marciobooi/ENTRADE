function table() {

  var frog = window.open ('','_blank')	

  
  var html = '<html>'
  +'<head>'
  +'<meta charset="utf-8">'
  +'<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">'
  +'<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous">'
  +'<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css">'
  +'<link rel="stylesheet" href="css/entrade.css">'
  +'<script src="js/basics.js"></script>'


  +'<script src="https://code.jquery.com/jquery-3.4.1.slim.min.js" integrity="sha384-J6qa4849blE2+poT4WnyKhv5vZF5SrPo0iEjwBvKU7imGFAV0wwj1yYfoRSJoZ+n" crossorigin="anonymous"></script>'
  +'<script src="https://cdn.jsdelivr.net/npm/popper.js@1.16.0/dist/umd/popper.min.js" integrity="sha384-Q6E9RHvbIyZFJoft+2mJbHaEWldlvI9IOYy5n3zV9zzTtmI3UksdQRVvoxMfooAo" crossorigin="anonymous"></script>'
  +'<script src="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/js/bootstrap.min.js" integrity="sha384-wfSDF2E50Y2D1uUdj0O3uMBJnjuUD4Ih7YwaYd1iqfktj0Uod8GCExl3Og8ifwB6" crossorigin="anonymous"></script>'
  

  
  +'</head>'
  
  +'<body style="overflow-y: initial; overflow-x:initial;">'
  +'<a href="" class="btn blue" role="button" id="back-button"><i class="fa fa-arrow-left"></i></a>'
  +'<h2 class="text-center" style="padding: 3%">'+languageNameSpace.labels[dataNameSpace.dataset].slice(this.length, -19)+' '+REF.year+' in '+languageNameSpace.labels[REF.geo]+'<br><small style="font-size: 48%">'+languageNameSpace.labels[REF.unit]+'</h2>'
  +'<div class="table-responsive">'

  +'<table id="externaltable" width="100%" class="table table-striped table-hover table-bordered text-center" style="width:71%; margin-left:15%; margin-right:15%;">'
  +'<thead class="customThead">'
  +'<tr>'
  +'<th scope="col" class="customTh">Partners</th>'
  +'<th scope="col" class="customTh">values <br><small>(' + languageNameSpace.labels[REF.unit] + ')</th>'
  +'</tr>'
  +'</thead>'
  +'<tbody class="customTbody">';
      let c = 0;
      $.each(tableNames, function (idx, obj) {
           html += '<tr><td class="namesRanking" style="font-size:1vw; text-align: left; padding-left: 12.5rem;">' + languageNameSpace.labels[tableNames[c]] + '</td>';
          html += '<td class="valuesRanking text-right" style="font-size:1vw;padding-right: 8.5rem!important;">' + (Math.round(tableValues[c] * 10) / 10).toLocaleString("en-EN").replace(',', ' ')  + '<small> ' + languageNameSpace.labels['abr_'+REF.unit] + '</td>';
          html += "</tr>";
          c++;
      }); 
  +'</tbody>'
  + '</table>'
  +'</div>';



  if (typeof (document.referrer) === "string" && document.referrer !== "" && window.history.length) {
  var back_button = document.getElementById("back-button");
  if (back_button) {
  back_button.onclick = function() {
  window.history.go(-1);
  }
  }
  }
  
  html +='</body>'
  +'</html>' 

  //variable name of window must be included for all three of the following methods so that
  //javascript knows not to write the string to this window, but instead to the new window
  
  frog.document.open()	
  frog.document.write(html)
  frog.document.close();
}



