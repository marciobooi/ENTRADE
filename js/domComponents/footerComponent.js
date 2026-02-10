class Footer {
    constructor() {
      this.footer = document.createElement('footer');
  
      const footerContainer = document.createElement('div');
      footerContainer.id = 'footer';
  
      const footerCreditsList = document.createElement('ul');
      footerCreditsList.id = 'footerCredits';
      footerCreditsList.classList.add('nav', 'justify-content-end');
  
      footerContainer.appendChild(footerCreditsList);
      this.footer.appendChild(footerContainer);
    }



/**
 * Builds the links for the footer.
 */
  
    buildLinksFooter() {
      const footerCredits = document.querySelector('#footerCredits');
      footerCredits.innerHTML = '';
      const linksContent = /*html*/`
      <li class="ecl-site-footer__list-item">
      <a id="footer-privacy" href="https://ec.europa.eu/info/privacy-policy_${REF.language.toLowerCase()}" target="_self" rel="noreferrer noopener" class="ecl-link ecl-link--standalone ecl-site-footer__link">
      ${languageNameSpace.labels["PRIVACY"]}</a>
      </li>
      
      <li class="ecl-site-footer__list-item">
        <a id="footer-legal" href="https://ec.europa.eu/info/legal-notice_${REF.language.toLowerCase()}" target="_self" rel="noreferrer noopener"  class="ecl-link ecl-link--standalone ecl-site-footer__link">
        ${languageNameSpace.labels["LEGAL"]}</a>
        </li>
      

      <li class="ecl-site-footer__list-item">
        <a id="footer-cookies" href="https://ec.europa.eu/info/cookies_${REF.language.toLowerCase()}" target="_self" rel="noreferrer noopener" class="ecl-link ecl-link--standalone ecl-site-footer__link">
        ${languageNameSpace.labels["COOKIES"]}</a>
        </li class="ecl-site-footer__list-item">
      


      <li class="ecl-site-footer__list-item">
        <a id="footer-access" href="https://ec.europa.eu/eurostat/web/main/help/accessibility" target="_self" rel="noreferrer noopener" class="ecl-link ecl-link--standalone ecl-site-footer__link">
        ${languageNameSpace.labels["ACCESS"]}</a>
        </li>
  `;
  
      footerCredits.innerHTML = linksContent;
    }
  
    addToDOM(targetElement) {
      const container = document.querySelector(targetElement);
      if (container) {
        container.appendChild(this.footer);
        // Call the buildLinksFooter method after inserting the footer into the DOM
        this.buildLinksFooter();
      }
    }
}
  