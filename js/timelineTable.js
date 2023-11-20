function timelineTable() {

    var frog = window.open ('','_blank')	

    

// fiquei aqui aplicar estilo
// aplicar filtro
//aplicar melhor barras de navegacao



    var html = '<html>'
    +'<head>'
    +'<meta charset="utf-8">'
    +'<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">'
    +'<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous">'
    +'<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css">'
    +'<link rel="stylesheet" href="css/table.css">'


    
    

    
    +'</head>'
    
    +'<body style="overflow-y: initial; overflow-x:initial;">'
    +'<a href="" class="btn blue" role="button" id="back-button"><i class="fa fa-arrow-left"></i></a>'
    +'<h2 class="text-center" style="padding: 3%">'+languageNameSpace.labels[dataNameSpace.dataset].slice(this.length, -19)+' '+REF.year+' in '+languageNameSpace.labels[REF.geo]+'<br><small style="font-size: 48%">'+languageNameSpace.labels[REF.unit]+'</h2>'


    
    // +'<div class="d-flex flex-row justify-content-around mb-4">'

    // +'<div class="text-center">'
    // +'<select id="filtYears" name="filtYears" aria-controls="externaltimetable" class="custom-select custom-select-sm form-control form-control-sm" onchange="filtertable(this.value)">'
    // +'<option value="5">5 Years</option>'
    // +'<option value="10">10 Years</option>'
    // +'<option value="15">15 Years</option>'
    // +'<option value="20">20 Years</option>'
    // +'<option value="all" selected="selected">All Years</option>'
    // +'</select>'
    // +'</div>'


    // +'<div class="text-center">'
    // +'<input id="myInput" type="search" class="form-control form-control-sm" placeholder="Search" aria-controls="externaltimetable" onkeyup="myFunction()">'
    // +'</div>'

    // +'</div>'
    +'<div class="tablecontainer">'
    +'<div class="">'

    +'<table id="externaltimetable" class="table table-hover table-striped">'
    +'  <thead class="thead-dark">'
    +'    <tr>'
      if(isEdge){
        html +='<th scope="col" class="" style="z-index:99">Partners</th>'
        // html +='<th scope="col" class="">values <br><small>(' + languageNameSpace.labels[REF.unit] + ')</th>'
        let a = 0;
        $.each(timeSeries, function (idx, obj) {
          html +='<th scope="col" class="" style="">'+timeSeries[a]+'</th>'            
          a++;
        });  
      } else {
        html +='<th scope="col" class="" style="z-index:99">Partners</th>'
          let a = 0;
          $.each(timeSeries, function (idx, obj) {
            html +='<th scope="col" class="" style="">'+timeSeries[a]+'</th>'            
            a++;
          });        
      }  
    html +='</tr>'
    +'  </thead>'
    +'  <tbody>'   
      let c = 0;
      console.log(series)
      $.each(series, function (idx, obj) {          
        if(obj['data'].every( v => v === obj['data'][0] )){
          console.log(true)
        } else{
          if(obj['name'] == undefined){
            return
        } else {
            html += '<tr>'
            html += '<td scope="row" class="" style="">' + obj['name'] + '</td>';                    
            for (var i = 0; i < obj['data'].length; i++) {
                if(obj['data'][i] === null){
                    html += '<td class="" style=""></td>';
                } else {
                    html += '<td class="" nowrap="nowrap" style="font-size: 12px;">' + (Math.round(obj['data'][i] * 10) / 10).toLocaleString("en-EN").replace(',', ' ') + '</td>';
                }            
            }
        html += "</tr>";
      }
        c++;
        }
        
      }); 
      
    html +='</tbody>'
    +'</table>'
    +'</div>'

    +'</div>'

    +'<script src="https://code.jquery.com/jquery-3.5.0.min.js" integrity="sha256-xNzN2a4ltkB44Mc/Jz3pT4iU1cmeR0FkXs4pru/JxaQ=" crossorigin="anonymous"></script>'
    +'<script src="https://cdn.jsdelivr.net/npm/popper.js@1.16.0/dist/umd/popper.min.js" integrity="sha384-Q6E9RHvbIyZFJoft+2mJbHaEWldlvI9IOYy5n3zV9zzTtmI3UksdQRVvoxMfooAo" crossorigin="anonymous"></script>'
    +'<script src="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/js/bootstrap.min.js" integrity="sha384-wfSDF2E50Y2D1uUdj0O3uMBJnjuUD4Ih7YwaYd1iqfktj0Uod8GCExl3Og8ifwB6" crossorigin="anonymous"></script>'
  
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

    $( document ).ready(function() {
      
    
    filtertable()
    first()

    function first(){
      // Simulate a code delay
      setTimeout( function(){
        cleantable()
      }, 500 );
    }


    
        });
}


function sortTable(n) {
    var table, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
    table = document.getElementById("externaltimetable");
    switching = true;
    //Set the sorting direction to ascending:
    dir = "asc"; 
    /*Make a loop that will continue until
    no switching has been done:*/
    while (switching) {
      //start by saying: no switching is done:
      switching = false;
      rows = table.rows;
      /*Loop through all table rows (except the
      first, which contains table headers):*/
      for (i = 1; i < (rows.length - 1); i++) {
        //start by saying there should be no switching:
        shouldSwitch = false;
        /*Get the two elements you want to compare,
        one from current row and one from the next:*/
        x = rows[i].getElementsByTagName("TD")[n];
        y = rows[i + 1].getElementsByTagName("TD")[n];
        /*check if the two rows should switch place,
        based on the direction, asc or desc:*/
        if (dir == "asc") {
          if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
            //if so, mark as a switch and break the loop:
            shouldSwitch= true;
            break;
          }
        } else if (dir == "desc") {
          if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
            //if so, mark as a switch and break the loop:
            shouldSwitch = true;
            break;
          }
        }
      }
      if (shouldSwitch) {
        /*If a switch has been marked, make the switch
        and mark that a switch has been done:*/
        rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
        switching = true;
        //Each time a switch is done, increase this count by 1:
        switchcount ++;      
      } else {
        /*If no switching has been done AND the direction is "asc",
        set the direction to "desc" and run the while loop again.*/
        if (switchcount == 0 && dir == "asc") {
          dir = "desc";
          switching = true;
        }
      }
    }
  }


  function cleantable() {

   
      console.log("cleared")
      
  }


  function myFunction() {
    // Declare variables
    var input, filter, table, tr, td, i, txtValue;
    input = document.getElementById("myInput");
    filter = input.value.toUpperCase();
    table = document.getElementById("externaltimetable");
    tr = table.getElementsByTagName("tr");
  
    // Loop through all table rows, and hide those who don't match the search query
    for (i = 0; i < tr.length; i++) {
      td = tr[i].getElementsByTagName("td")[0];
      if (td) {
        txtValue = td.textContent || td.innerText;
        if (txtValue.toUpperCase().indexOf(filter) > -1) {
          tr[i].style.display = "";
        } else {
          tr[i].style.display = "none";
        }
      }
    }
  }

function filtertable(filtYears){    
  $('#externaltimetable th:nth-child(n)').css('display', '')
  $('#externaltimetable tr td:nth-child(n)').css('display', '')
  if(filtYears == "all"){
    filtYears = timeSeries.length;  
  } else{
    filtYears = filtYears - timeSeries.length;  
  }
  
  timetable = timeSeries
  timetable =  timetable.slice(filtYears, timetable.length);



  for (var i = 0; i < timetable.length; i++) {
    $('#externaltimetable th:nth-child(' + i + ')').css('display', 'none')
    $('#externaltimetable tr td:nth-child(' + i + ')').css('display', 'none')
 
    }

    $('#externaltimetable th:nth-child(1)').css('display', '')
    $('#externaltimetable tr td:nth-child(1)').css('display', '')
}