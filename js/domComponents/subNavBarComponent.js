class SubNavbar {
    constructor() {
      this.subNavbar = document.createElement('nav');
      this.subNavbar.setAttribute('aria-label', 'Menu toolbar');
      this.subNavbar.setAttribute('id', 'menuToolbar');
      this.subNavbar.setAttribute('class', 'navbar navbar-expand-sm navbar-light bg-light');

      // const isMobile = /Mobi|Android/i.test(navigator.userAgent) || window.innerWidth < 768
  

      const browser = `<div class="container-fluid">
            <div class="col-1">              
              <button id="menu" class="btnGroup" type="button" aria-label="${
                languageNameSpace.labels["MAINMENU"]
              }" title="${
        languageNameSpace.labels["MAINMENU"]
      }" aria-haspopup="true">
                <i class="fas fa-bars" aria-hidden="true"></i>             
              </button>
            </div>

            <div class="col-7">
              <div class="text-group">
                <h2 id="title" class="title"></h2>
                <h6 id="subtitle" class="subtitle"></h6>      
              </div>
            </div>

          <div class="col-4">
            <ul id="chartBtns" role="menubar" aria-label="Options graph toolbox" class="navbar-nav ms-auto my-2 my-lg-0 navbar-nav-scroll" style="--bs-scroll-height: 50vw;">
                
              <div id="switchBtn">  
                <label class="form-check-label" for="switchTop5">${
                  languageNameSpace.labels["top5"]
                }</label>
                <div class="form-check form-switch d-inline-block">
                  <input class="form-check-input focus-ring" type="checkbox" value="${
                    REF.filter
                  }" role="switch" id="switchTop5" ${
        REF.filter == "top5" ? "checked" : ""
      } aria-checked=${REF.filter == "top5" ? "true" : "false"}>
                </div>
              </div>
            
            
                <li class="nav-item dropdown px-1" id="infoBtnChart" aria-haspopup="menu">
                  <button class="ecl-button ecl-button--primary round-btn" type="button" aria-label="${
                    languageNameSpace.labels["infoBtn"]
                  }" data-bs-toggle="dropdown"  title="${
        languageNameSpace.labels["infoBtn"]
      }" aria-haspopup="true" aria-expanded="true" id="infoBtn">
                    <i class="fas fa-info"></i>
                  </button>
                  <ul class="dropdown-menu dropdown-menu-end" role="menu" aria-labelledby="infoBtn">     					
                    <button class="dropdown-item ecl-link ecl-link--standalone"  onclick="tutorial()" aria-label="${
                      languageNameSpace.labels["TUTORIAL"]
                    }" value="Tutorial">${
        languageNameSpace.labels["TUTORIAL"]
      }</button>
                    <button class="dropdown-item ecl-link ecl-link--standalone"  onclick="openMeta()" aria-label="${
                      languageNameSpace.labels["METADATA"]
                    }" value="Metadata" >${
        languageNameSpace.labels["METADATA"]
      }</button>
                    <button class="dropdown-item ecl-link ecl-link--standalone"  onclick="mailContact()" aria-label="${
                      languageNameSpace.labels["CONTACT"]
                    }" value="Feedback">${
        languageNameSpace.labels["CONTACT"]
      }</button>          		
                  </ul>
                </li>
   

                <li class="nav-item button px-1" id="embebedChart" aria-haspopup="menu">
                  <button id="embebedBtn" title="${
                    languageNameSpace.labels["embebedBtn"]
                  }" type="button" class="ecl-button ecl-button--primary round-btn" aria-label="${
        languageNameSpace.labels["embebedBtn"]
      }" onclick="exportIframe()">
                    <i class="fas fa-code" aria-hidden="true"></i>
                  </button>
                </li>

                <li class="nav-item dropdown px-1" id="social-media" aria-haspopup="menu">
                <button class="ecl-button ecl-button--primary round-btn" type="button" aria-label="${
                  languageNameSpace.labels["shareChart"]
                }" data-bs-toggle="dropdown"  title="${
        languageNameSpace.labels["shareChart"]
      }" aria-haspopup="true" aria-expanded="true" id="shareChart">
                  <i class="fas fa-share-alt" aria-hidden="true"></i>
                </button>


                <ul class="dropdown-menu dropdown-menu-end" style="padding: 12px;" role="menu" aria-labelledby="Share chart">     			
                <p id="SHARETITLE" class="ecl-social-media-share__description" style="font-weight: normal;">Share this page</p>   		

                <button class="dropdown-item ecl-link ecl-link--standalone"  onclick="socialNameSpace.twitter()" aria-label="${
                  languageNameSpace.labels["twitter"]
                }">                  
                    <span class="socialImg ecl-icon ecl-icon--m ecl-link__icon ecl-social-media-share__icon">
                      <img class="ecl-icon ecl-icon--m ecl-link__icon ecl-social-media-share__icon" src="img/social-media/twiter.svg" alt="Twitter Icon" width="24" height="24" focusable="false" aria-hidden="true">
                    </span>
                    <span class="ecl-link__label">${
                      languageNameSpace.labels["twitter"]
                    }</span>                  
                </button>  

                <button class="dropdown-item ecl-link ecl-link--standalone"  onclick="socialNameSpace.facebook()" aria-label="${
                  languageNameSpace.labels["facebook"]
                }">
                  <span class="socialImg ecl-icon ecl-icon--m ecl-link__icon ecl-social-media-share__icon">
                    <img class="ecl-icon ecl-icon--m ecl-link__icon ecl-social-media-share__icon" src="img/social-media/face.svg" alt="Facebook Icon" width="24" height="24" focusable="false" aria-hidden="true">
                  </span>
                  <span class="ecl-link__label">${
                    languageNameSpace.labels["facebook"]
                  }</span>                  
                </button>

                <button class="dropdown-item ecl-link ecl-link--standalone"  onclick="socialNameSpace.linkedin()" aria-label="${
                  languageNameSpace.labels["linkedin"]
                }">
                  <span class="socialImg ecl-icon ecl-icon--m ecl-link__icon ecl-social-media-share__icon">
                    <img class="ecl-icon ecl-icon--m ecl-link__icon ecl-social-media-share__icon" src="img/social-media/linkdin.svg" alt="Linkedin Icon" width="24" height="24" focusable="false" aria-hidden="true">
                  </span>
                  <span class="ecl-link__label">${
                    languageNameSpace.labels["linkedin"]
                  }</span>                  
                </button>
               </ul>                
              </li>    

              </ul>
            </div>
            </div>

            
            <div id="chartOptionsMenu" class="toggleMenu">
              <div class="close-button-container">
                <button id="closeChartMenuBtn" class="ecl-button ecl-button--tertiary ecl-modal__close ecl-button--icon-only" aria-controls="chartOptionsMenu" aria-label="Close chart menu">
                <span class="ecl-button__label sr-only" data-ecl-label="true">Close</span>
                <i class="fas fa-times" aria-hidden="true"></i>
                </button>
              </div>
              <div class="dropdown-grid">
                <div class="row w-75">
                  <div id="containerTrade" class="col-12 col-sm-4 p-2"></div>
                  <div id="containerFuel" class="col-12 col-sm-4 p-2"></div>
                  <div id="containerSiec" class="col-12 col-sm-4 p-2"></div>
                  <div id="containerYear" class="col-12 col-sm-4 p-2"></div>
                  <div id="containerUnit" class="col-12 col-sm-4 p-2"></div>      
                </div>
              </div>
            </div>
          </div>`;


      const mobileContent = /*html*/ `<div class="">
        <div class="col-12 subNavOne">
          <div class="">              
              <button id="tools" class="btnGroup" type="button" aria-label="${languageNameSpace.labels["TOOLS"]}" title="${languageNameSpace.labels["TOOLS"]}" aria-haspopup="true">
                <i class="fas fa-ellipsis-h" aria-hidden="true"></i>      
                <span class="iconText">${languageNameSpace.labels["TOOLS"]}</span>    
              </button>
          </div>
          <div class="">              
              <button id="menu" class="btnGroup" type="button" aria-label="${languageNameSpace.labels["MAINMENU"]}" title="${languageNameSpace.labels["MAINMENU"]}" aria-haspopup="true">
                <i class="fas fa-bars" aria-hidden="true"></i>                    
                <span class="iconText">Menu</span>           
              </button>
          </div>
          
        <div class="chartMenuMobile d-none">
          <ul id="chartBtns" role="menubar" aria-label="Options graph toolbox" class="navbar-nav ms-auto my-2 my-lg-0 navbar-nav-scroll" style="--bs-scroll-height: 50vw;">
              <li class="nav-item dropdown px-1" id="infoBtnChart" aria-haspopup="menu">
                <button class="ecl-button ecl-button--primary round-btn" type="button" aria-label="InfoBtn" data-bs-toggle="dropdown"  title="Info" aria-haspopup="true" aria-expanded="true" id="infoBtn">
                  <i class="fas fa-info" aria-hidden="true"></i>
                </button>
                <ul class="dropdown-menu dropdown-menu-end" role="menu" aria-labelledby="infoBtn">     					
                  <button class="dropdown-item ecl-link ecl-link--standalone"  onclick="tutorial()" aria-label="${languageNameSpace.labels["TUTORIAL"]}" value="Tutorial">${languageNameSpace.labels["TUTORIAL"]}</button>
                  <button class="dropdown-item ecl-link ecl-link--standalone"  onclick="openMeta()" aria-label="${languageNameSpace.labels["METADATA"]}" value="Metadata" >${languageNameSpace.labels["METADATA"]}</button>
                  <button class="dropdown-item ecl-link ecl-link--standalone"  onclick="mailContact()" aria-label="${languageNameSpace.labels["CONTACT"]}" value="Feedback">${languageNameSpace.labels["CONTACT"]}</button>          		
                </ul>
              </li> 
              <li class="nav-item button px-1" id="shareChart" aria-haspopup="menu">
                <button id="shareBtn" title="share chart" type="button" class="ecl-button ecl-button--primary round-btn" aria-label="share chart" onclick="">
                  <i class="fas fa-share-alt" aria-hidden="true"></i>
                </button>
              </li>
              <li class="nav-item button px-1" id="embebedChart" aria-haspopup="menu">
                <button id="embebedBtn" title="Embebed chart iframe" type="button" class="ecl-button ecl-button--primary round-btn" aria-label="Embebed chart iframe" onclick="exportIframe()">
                  <i class="fas fa-code" aria-hidden="true"></i>
                </button>
              </li>
          </ul>
        </div>

            <div id="chartOptionsMenu" class="toggleMenu">
              <div class="close-button-container">
                <button id="closeChartMenuBtn" class="btn btn-primary close-chart-menu-btn" aria-controls="chartOptionsMenu" aria-label="Close chart menu">
                <span class="ecl-button__label sr-only" data-ecl-label="true">Close</span>
                <i class="fas fa-times" aria-hidden="true"></i>
                </button>
              </div>
              <div class="dropdown-grid">
                <div class="row">    
                  <div id="containerTrade" class="col-12 col-sm-4 p-2"></div>
                  <div id="containerFuel" class="col-12 col-sm-4 p-2"></div>
                  <div id="containerSiec" class="col-12 col-sm-4 p-2"></div>
                  <div id="containerYear" class="col-12 col-sm-4 p-2"></div>
                  <div id="containerUnit" class="col-12 col-sm-4 p-2"></div>          
                </div>
              </div>
            </div>


        </div>
        <div class="col-12 subNavTwo">
          <div class="text-group">
              <h2 id="title" class="title"></h2>
              <h6 id="subtitle" class="subtitle"></h6>      
            </div>
        </div>
      </div>`;


         


        if (isMobile) {          
          this.subNavbar.innerHTML = mobileContent         
          
          this.toolsButton = this.subNavbar.querySelector('#tools');
          this.chartToolsMenu = this.subNavbar.querySelector('.chartMenuMobile');
          this.menuButton = this.subNavbar.querySelector('#menu');
          this.chartOptionsMenu = this.subNavbar.querySelector('#chartOptionsMenu');
          this.chartMenuOpen = this.subNavbar.querySelector('#menu');
      
          this.toolsButton.addEventListener('click', () => {        
            this.chartOptionsMenu.classList.contains("toggleMenu") ? "" : this.toggleChartOptionsMenu();
            this.chartToolsMenu.classList.toggle('d-none');
          });

          this.menuButton.addEventListener('click', () => {
            this.chartToolsMenu.classList.contains("d-none") ? "" : this.chartToolsMenu.classList.toggle('d-none');
            this.toggleChartOptionsMenu();
          });

        } else {

          this.subNavbar.innerHTML = browser         


          
      

          this.menuButton = this.subNavbar.querySelector('#menu');
          this.chartOptionsMenu = this.subNavbar.querySelector('#chartOptionsMenu');
          this.chartMenuOpen = this.subNavbar.querySelector('#menu');
  
          this.menuButton.addEventListener('click', () => {
            this.toggleChartOptionsMenu();
            trapTab()
          });
  
          this.closeChartMenuBtn = this.subNavbar.querySelector('#closeChartMenuBtn');
  
          this.closeChartMenuBtn.addEventListener('click', () => {
            this.toggleChartOptionsMenu();

            setTimeout(() => {
              this.menuButton.focus();    
            }, 100);
          });

          function toggleSwitch(switchElement) {
            switchElement.addEventListener('click', () => {        
              // Toggle the switch value between 1 and 0 when clicked
              switchElement.value = switchElement.value === 'top5' ? 'all' : 'top5';    
              switchElement.setAttribute('aria-checked', switchElement.value === 'top5' ? 'true' : 'false')
              REF.filter = switchElement.value;     

              const label = document.querySelector('label[for="switchTop5"]');
              label.style.fontWeight = switchElement.value === 'top5' ? 'bold' : 'inherit';

              if (typeof country !== 'undefined') {
                loadCountryData(country);
              }
            });     
          }
          
          this.switchElements = this.subNavbar.querySelectorAll('[role="switch"]');
          
          
          // Loop through each switch element and attach event listeners
          this.switchElements.forEach(switchElement => {
            toggleSwitch(switchElement);
          });
          




        }     
    }
    toggleChartOptionsMenu() {
      this.chartOptionsMenu.classList.toggle('toggleMenu');
      this.chartMenuOpen.classList.toggle('menuOpen');   
    }

    addToDOM(targetElement) {
      const container = document.querySelector(targetElement);
      container.appendChild(this.subNavbar);   
    }
  }











  