/**
 * GLOBAN Widget Management
 * Handles initialization and re-rendering of the Eurostat Global Banner
 */

const globanManager = {
  initialized: false,
  maxAttempts: 50,

  /**
   * Initialize the GLOBAN widget with the current language
   * This function should be called AFTER REF.language is set
   */
  init: function(attempt = 0) {
    // Check if REF and language are available
    if (typeof REF === 'undefined' || !REF.language) {
      if (attempt < this.maxAttempts) {
        setTimeout(() => this.init(attempt + 1), 100);
      }
      return;
    }

    // Wait for webtools to be available (capped at maxAttempts)
    if (typeof $wt === 'undefined' || !$wt.render) {
      if (attempt < this.maxAttempts) {
        setTimeout(() => this.init(attempt + 1), 100);
      }
      return;
    }

    this.render(REF.language);
  },

  /**
   * Render the GLOBAN widget with the specified language
   * @param {string} lang - Language code (e.g., 'EN', 'FR', 'DE')
   */
  render: function(lang = 'EN') {
    if (typeof $wt === 'undefined' || !$wt.render) {
      return;
    }

    const globanContainer = document.getElementById('euGlobanContainer');
    if (!globanContainer) {
      return;
    }

    try {
      $wt.render(globanContainer, {
        service: 'globan',
        theme: 'dark',
        logo: true,
        link: true,
        lang: lang.toLowerCase(),
        mode: false,
        zindex: 40
      });
      this.initialized = true;
    } catch (error) {
      console.error('[GLOBAN] Error rendering widget:', error);
    }
  },

  /**
   * Regenerate the GLOBAN widget when language changes
   * This ensures the banner is updated in the new language
   */
  regenerate: function(lang) {
    if (typeof $wt === 'undefined' || !$wt.globan || !$wt.globan.regenerate) {
      return;
    }

    try {
      const params = lang ? { lang: lang.toLowerCase() } : {};
      $wt.globan.regenerate(params);
    } catch (error) {
      console.error('[GLOBAN] Error regenerating widget:', error);
    }
  }
};

// Hook into language changes via pub/sub subscriber
function registerGlobanLanguageListener() {
  if (typeof languageNameSpace !== 'undefined' && languageNameSpace.onLanguageChange) {
    languageNameSpace.onLanguageChange((val) => globanManager.regenerate(val));
  } else if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
      if (typeof languageNameSpace !== 'undefined' && languageNameSpace.onLanguageChange) {
        languageNameSpace.onLanguageChange((val) => globanManager.regenerate(val));
      }
    });
  }
}

registerGlobanLanguageListener();
