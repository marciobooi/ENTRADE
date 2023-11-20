


function infoModal(params) { 

  console.log(dataNameSpace.mq)
 
  if(dataNameSpace.mq[2].matches){
    $('#info').append(
      '<div class="d-flex">'
      +'<div class="panelOne">'
      +'    <div id="carouselExampleSlidesOnly" class="carousel slide carousel-fade pointer-event" data-ride="carousel">'
      +'        <div class="carousel-inner">'
      +'            <div class="carousel-item">'
      +'              <img src="./img/banner/1.jpg" class="d-block fit-image" alt="img"> </div>'
      +'              <div class="carousel-item active"> <img src="./img/banner/2.jpg" class="d-block fit-image" alt="img"></div>'
      +'              <div class="carousel-item"> <img src="./img/banner/3.jpg" class="d-block fit-image" alt="img"> </div>'
      +'              <div class="carousel-item"> <img src="./img/banner/4.jpg" class="d-block fit-image" alt="img"> </div>'
      +'        </div>'
      +'    </div>'
      +'    <div class="d-flex justify-content-between modalMobileTitle">'
      +'        <h1 class="text-center col-9">'+ languageNameSpace.labels['inftitle'] +'</h1>'
      +'        <button type="button" class="close col-2" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">X</span></button>'
      +'    </div>'
      +'</div>'
      +'<div class="panelTwo">'
      +'    <div class="modalinfotext">'
      +'        <div class="">'
      +'            <div class="col-xs-12 ">'
      +'                <nav>'
      +'                    <div class="nav nav-tabs nav-fill" id="nav-tab" role="tablist">'
                              +' <a class="nav-item nav-link active" data-toggle="tab" href="#nav-1" role="tab" aria-selected="true">' + languageNameSpace.labels['TABTITLE1'] + '</a>'
                              +' <a class="nav-item nav-link" data-toggle="tab" href="#nav-2" role="tab" aria-selected="false">' + languageNameSpace.labels['TABTITLE2'] + '</a>'
                              +' <a class="nav-item nav-link" data-toggle="tab" href="#nav-3" role="tab" aria-selected="false">' + languageNameSpace.labels['TABTITLE3'] + '</a>'
                              +' <a class="nav-item nav-link" data-toggle="tab" href="#nav-4" role="tab" aria-selected="false">' + languageNameSpace.labels['TABTITLE4'] + '</a>'
                              +' <a class="nav-item nav-link" data-toggle="tab" href="#nav-5" role="tab" aria-selected="false">' + languageNameSpace.labels['TABTITLE5'] + '</a>'
      +'                    </div>'
      +'                </nav>'
      +'                <div class="tab-content py-3 px-3 px-sm-0 " id="nav-tabContent">  '
                        +' <div class="tab-pane fade show active px-4" id="nav-1" role="tabpanel" ">'+ languageNameSpace.labels['TAB1'] + '</div>'    
                        +' <div class=" tab-pane fade show p-4" id="nav-2" role="tabpanel" ">'+ languageNameSpace.labels['TAB2'] + '</div>'    
                     +' <div class=" tab-pane fade show p-4" id="nav-3" role="tabpanel" ">'+ languageNameSpace.labels['TAB3'] + '</div>'    
                        +' <div class=" tab-pane fade show p-4" id="nav-4" role="tabpanel" ">'+ languageNameSpace.labels['TAB4'] + '</div>'    
                     +' <div class=" tab-pane fade show p-4" id="nav-5" role="tabpanel" ">'+ languageNameSpace.labels['TAB5'] + '</div>'        
      +'                    </div>'
      +'                </div>'
      +'            </div>'
      +'        </div>'
      +'    </div>'
      +'</div>'
      )
} else {
  $('#info').append(
    '  <div class="">'
    +'  <div class="">'
    +'      <div id="carouselExampleSlidesOnly" class="carousel slide carousel-fade pointer-event" data-ride="carousel">'
    +'          <div class="carousel-inner">'
    +'              <div class="carousel-item active">'
    +'                  <img src="./img/banner/1.jpg" class="d-block fit-image" alt="img">'
    +'              </div>'
    +'              <div class="carousel-item">'
    +'                  <img src="./img/banner/2.jpg" class="d-block fit-image" alt="img">'
    +'              </div>'
    +'              <div class="carousel-item">'
    +'                  <img src="./img/banner/3.jpg" class="d-block fit-image" alt="img">'
    +'              </div>'
    +'              <div class="carousel-item">'
    +'                  <img src="./img/banner/4.jpg" class="d-block fit-image" alt="img">'
    +'              </div>'
    +'          </div>'
    +'      </div>'
    +'      <div class="borderBTN d-flex justify-content-around">'
    +'              <h1 class="special text-left p-3">'+ languageNameSpace.labels['inftitle'] +'</h1>'
    +'              <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">X</span></button>'
    +'      </div>'
    +'  </div>'
    +'  <div class="">'
    +'      <div class="">'
    +'          <nav>'
    +'              <div class="nav nav-tabs nav-fill" id="nav-tab" role="tablist">'
    +'                  <a class="nav-item nav-link active" id="" data-toggle="tab" href="#nav-1" role="tab" aria-selected="true">' + languageNameSpace.labels['TABTITLE1'] + '</a> '
    +'                  <a class="nav-item nav-link" id="" data-toggle="tab" href="#nav-2" role="tab" aria-selected="false">' + languageNameSpace.labels['TABTITLE2'] + '</a>'
    // +'                  <a class="nav-item nav-link" id="" data-toggle="tab" href="#nav-3" role="tab" aria-selected="false">' + languageNameSpace.labels['TABTITLE3'] + '</a> '
    +'                  <a class="nav-item nav-link" id="" data-toggle="tab" href="#nav-4" role="tab" aria-selected="false">' + languageNameSpace.labels['TABTITLE4'] + '</a> '
    // +'                  <a class="nav-item nav-link" id="" data-toggle="tab" href="#nav-5" role="tab" aria-selected="false">' + languageNameSpace.labels['TABTITLE5'] + '</a>'
    +'              </div>'
    +'          </nav>'
    +'      </div>'
    +'          <div class="tab-content py-3 px-3 px-sm-0 " id="nav-tabContent">'
    +'              <div class="tab-pane fade show active px-2" id="nav-1" role="tabpanel" >'+ languageNameSpace.labels['TAB1'] + '</div>'
    +'              <div class="tab-pane fade show px-2" id="nav-2" role="tabpanel">'+ languageNameSpace.labels['TAB2'] + '</div>'
    // +'              <div class="tab-pane fade show px-2" id="nav-3" role="tabpanel">'+ languageNameSpace.labels['TAB3'] + '</div>'
    +'              <div class="tab-pane fade show px-2" id="nav-4" role="tabpanel">'+ languageNameSpace.labels['TAB4'] + '</div>'
    // +'              <div class="tab-pane fade show px-2" id="nav-5" role="tabpanel">'+ languageNameSpace.labels['TAB5'] + '</div>'
    +'          </div>'
    +'  </div>'
    +'</div>'
    )
}





    // Activate carousel
    $("#carouselExampleSlidesOnly").carousel(); 

    $('#energyModal').on('hidden.bs.modal', function () {
    $('#info').html('');    
  });

}

