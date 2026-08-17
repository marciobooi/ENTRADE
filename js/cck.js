/**
 * Cookie Consent Kit (CCK) Management
 * Handles re-rendering of the EU Cookie Consent Banner on language change
 * 
 * Note: CCK auto-initializes via the JSON config in the HTML head
 */

const cckManager = {
  initialized: true, // CCK is auto-initialized via HTML config
  maxAttempts: 50,

  /**
   * Regenerate the CCK when language changes
   * This ensures the banner is updated in the new language
   * Uses $wt.cck.regenerate(params) with language parameter
   */
  regenerate: function(lang, attempt = 0) {
    // Ensure language is lowercase
    const langLower = lang ? lang.toLowerCase() : 'en';
    
    // Set the document language
    document.documentElement.lang = langLower;

    // Wait for webtools and CCK to be available (capped at maxAttempts)
    if (typeof $wt === 'undefined' || !$wt.cck || !$wt.cck.regenerate) {
      if (attempt < this.maxAttempts) {
        setTimeout(() => this.regenerate(lang, attempt + 1), 100);
      }
      return;
    }

    try {
      // Regenerate the CCK banner with the new language
      $wt.cck.regenerate({
        lang: langLower
      });
    } catch (error) {
      console.error('[CCK] Error regenerating CCK:', error);
    }
  },

  /**
   * Get CCK cookie value
   * Returns the cck1 cookie which stores user's cookie preferences
   */
  getCookiePreference: function() {
    if (typeof $wt === 'undefined' || !$wt.cookie || !$wt.cookie.get) {
      return null;
    }

    try {
      const cookieValue = $wt.cookie.get('cck1');
      return cookieValue;
    } catch (error) {
      console.error('[CCK] Error getting cookie:', error);
      return null;
    }
  }
};

/**
 * Set up event listeners for CCK banner events
 */
function setupCCKEventListeners() {
  if (typeof window !== 'undefined') {
    window.addEventListener('cck_banner_displayed', () => {});
    window.addEventListener('cck_all_accepted', () => {});
    window.addEventListener('cck_technical_accepted', () => {});
  }
}

// Hook into language changes via pub/sub subscriber
function registerCCKLanguageListener() {
  if (typeof languageNameSpace !== 'undefined' && languageNameSpace.onLanguageChange) {
    languageNameSpace.onLanguageChange((val) => cckManager.regenerate(val));
  } else if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
      if (typeof languageNameSpace !== 'undefined' && languageNameSpace.onLanguageChange) {
        languageNameSpace.onLanguageChange((val) => cckManager.regenerate(val));
      }
    });
  }
}

registerCCKLanguageListener();
setupCCKEventListeners();
