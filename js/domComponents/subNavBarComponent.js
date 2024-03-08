class SubNavbar {
    constructor() {
      this.subNavbar = document.createElement('nav');
      this.subNavbar.setAttribute('aria-label', 'Menu toolbar');
      this.subNavbar.setAttribute('id', 'menuToolbar');
      this.subNavbar.setAttribute('class', 'navbar navbar-expand-sm navbar-light bg-light');

      // const isMobile = /Mobi|Android/i.test(navigator.userAgent) || window.innerWidth < 768
  

      const browser = `<div class="container-fluid">
            <div class="col-1">              
              <button id="menu" class="btnGroup" type="button" aria-label="${languageNameSpace.labels["MAINMENU"]}" title="${languageNameSpace.labels["MAINMENU"]}" aria-haspopup="true">
                <i class="fas fa-bars" aria-hidden="true"></i>             
              </button>
            </div>
            <div class="col-8">
              <div class="text-group">
                <h2 id="title" class="title"></h2>
                <h6 id="subtitle" class="subtitle"></h6>      
              </div>
            </div>



        <div class="col-3">
            <ul id="chartBtns" role="menubar" aria-label="Options graph toolbox" class="navbar-nav ms-auto my-2 my-lg-0 navbar-nav-scroll" style="--bs-scroll-height: 50vw;">
              <li class="nav-item dropdown px-1" id="infoBtnChart" role="none">
                  <button class="ecl-button ecl-button--primary round-btn" type="button" aria-label="InfoBtn" data-bs-toggle="dropdown" role="menuitem" title="Info" aria-haspopup="true" aria-expanded="true" id="infoBtn">
                    <i class="fas fa-info"></i>
                  </button>
                  <ul class="dropdown-menu dropdown-menu-end" role="menu" aria-labelledby="infoBtn">     					
                    <button class="dropdown-item" role="menuitem" onclick="tutorial()" aria-label="${languageNameSpace.labels['TUTORIAL']}" value="Tutorial">${languageNameSpace.labels['TUTORIAL']}</button>
                    <button class="dropdown-item" role="menuitem" onclick="openMeta()" aria-label="${languageNameSpace.labels['METADATA']}" value="Metadata" >${languageNameSpace.labels['METADATA']}</button>
                    <button class="dropdown-item" role="menuitem" onclick="mailContact()" aria-label="${languageNameSpace.labels['CONTACT']}" value="Feedback">${languageNameSpace.labels['CONTACT']}</button>          		
                  </ul>
                </li>
   

                <li class="nav-item button px-1" id="embebedChart" role="none">
                  <button id="embebedBtn" title="Embebed chart iframe" type="button" class="ecl-button ecl-button--primary round-btn" aria-label="Embebed chart iframe" onclick="exportIframe()">
                    <i class="fas fa-code" aria-hidden="true"></i>
                  </button>
                </li>

                <li class="nav-item dropdown px-1" id="social-media" role="none">
                  <button class="ecl-button ecl-button--primary round-btn" type="button" aria-label="Share in social media" data-bs-toggle="dropdown" role="menuitem" title="Share chart" aria-haspopup="true" aria-expanded="true" id="shareChart">
                    <i class="fas fa-share-alt" aria-hidden="true"></i>
                  </button>
                  <ul class="dropdown-menu dropdown-menu-end" role="menu" aria-labelledby="Share chart">     					
                    <button class="dropdown-item" role="menuitem" onclick="socialNameSpace.twitter()" aria-label="${languageNameSpace.labels['twitter']}">${languageNameSpace.labels["twitter"]}</button>
                    <button class="dropdown-item" role="menuitem" onclick="socialNameSpace.facebook()" aria-label="${languageNameSpace.labels['facebook']}">${languageNameSpace.labels["facebook"]}</button>
                    <button class="dropdown-item" role="menuitem" onclick="socialNameSpace.linkedIn()" aria-label="${languageNameSpace.labels['linkedin']}">${languageNameSpace.labels["linkedin"]}</button>        		
                  </ul>
                </li>    

              </ul>
            </div>
            </div>

            
            <div id="chartOptionsMenu" class="toggleMenu">
              <div class="close-button-container">
                <button id="closeChartMenuBtn" class="btn btn-primary close-chart-menu-btn" aria-label="Close chart menu">
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
                <span class="iconText">${languageNameSpace.labels["MAINMENU"]}</span>           
              </button>
          </div>

        <div class="chartMenuMobile d-none">
          <ul id="chartBtns" role="menubar" aria-label="Options graph toolbox" class="navbar-nav ms-auto my-2 my-lg-0 navbar-nav-scroll" style="--bs-scroll-height: 50vw;">
              <li class="nav-item dropdown px-1" id="infoBtnChart" role="none">
                <button class="btn btn-primary min-with--nav" type="button" aria-label="InfoBtn" data-bs-toggle="dropdown" role="menuitem" title="Info" aria-haspopup="true" aria-expanded="true" id="infoBtn">
                  <i class="fas fa-info" aria-hidden="true"></i>
                </button>
                <ul class="dropdown-menu dropdown-menu-end" role="menu" aria-labelledby="infoBtn">     					
                  <button class="dropdown-item" role="menuitem" onclick="tutorial()" aria-label="${languageNameSpace.labels['TUTORIAL']}" value="Tutorial">${languageNameSpace.labels['TUTORIAL']}</button>
                  <button class="dropdown-item" role="menuitem" onclick="openMeta()" aria-label="${languageNameSpace.labels['METADATA']}" value="Metadata" >${languageNameSpace.labels['METADATA']}</button>
                  <button class="dropdown-item" role="menuitem" onclick="mailContact()" aria-label="${languageNameSpace.labels['CONTACT']}" value="Feedback">${languageNameSpace.labels['CONTACT']}</button>          		
                </ul>
              </li> 
              <li class="nav-item button px-1" id="shareChart" role="none">
                <button id="shareBtn" title="share chart" type="button" class="btn btn-primary min-with--nav" aria-label="share chart" onclick="">
                  <i class="fas fa-share-alt" aria-hidden="true"></i>
                </button>
              </li>
              <li class="nav-item button px-1" id="embebedChart" role="none">
                <button id="embebedBtn" title="Embebed chart iframe" type="button" class="btn btn-primary min-with--nav" aria-label="Embebed chart iframe" onclick="exportIframe()">
                  <i class="fas fa-code" aria-hidden="true"></i>
                </button>
              </li>
          </ul>
        </div>

            <div id="chartOptionsMenu" class="toggleMenu">
              <div class="close-button-container">
                <button id="closeChartMenuBtn" class="btn btn-primary close-chart-menu-btn" aria-label="Close chart menu">
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











  