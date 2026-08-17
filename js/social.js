const socialNameSpace = (() => {
	const text = {
	  EN: "By using the Energy Trade tool, created by Eurostat, you can easily visualize energy trade flows between countries and see how much energy and from/to which countries it is imported or exported.",
	  FR: "Grâce à l'outil de commerce de l'énergie créé par Eurostat, vous pouvez facilement visualiser les flux commerciaux énergétiques entre pays et voir combien d'énergie est importée ou exportée vers/depuis quels pays.",
	  DE: "Mit dem Energiehandelstool von Eurostat können Sie Energiehandelsströme zwischen Ländern einfach visualisieren und sehen, wie viel Energie in welche und aus welchen Ländern importiert oder exportiert wird."
	};
  
	const currentUrl = encodeURIComponent(window.location.href);
	const language = (REF.language || 'EN').toUpperCase(); // Default to English and ensure uppercase
  
	const openWindow = (url, height = 450, width = 650) => {
	  window.open(url, "", `menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=${height},width=${width}`);
	};
  
	return {
	  linkedin: () => {
		// shareArticle (and its title/summary params) is a deprecated LinkedIn
		// endpoint - it now just redirects to the sharing/compose screen
		// without carrying the params through, which is why the preview never
		// loads. share-offsite is LinkedIn's current supported share URL; it
		// only takes the target url and scrapes title/description/image from
		// that page's own Open Graph tags (already set in entrade.html's <head>).
		const url = `https://www.linkedin.com/sharing/share-offsite/?url=${currentUrl}`;
		 openWindow(url, 650, 450);
		return false;
	  },

	  twitter: () => {
		// /share (no /intent/) is the same kind of deprecated legacy endpoint
		// as LinkedIn's shareArticle above - /intent/tweet is the current,
		// stable web-intent URL.
		const textContent = encodeURIComponent(text[language]);
		const url = `https://twitter.com/intent/tweet?text=${textContent}&url=${currentUrl}`;
		openWindow(url, 700, 400);
		return false;
	  },
  
	  facebook: () => {
		const description = encodeURIComponent(text[language]);
		const url = `https://www.facebook.com/sharer.php?u=${currentUrl}&quote=${description}`;
		openWindow(url, 700, 500);
		return false;
	  },
  
	  email: () => {
		const subject = encodeURIComponent("Energy trade");
		const body = encodeURIComponent(`${text[language]} ${window.location.href}`);
		document.location = `mailto:ESTAT-ENERGY@ec.europa.eu?subject=${subject}&body=${body}`;
	  },

	  // Mobile "share" button (js/domComponents/subNavBarComponent.js's
	  // shareBtn) had an empty onclick - a plain button, not a dropdown like
	  // its desktop counterpart, is exactly what the native Web Share API is
	  // for: it hands off to the OS's own share sheet (WhatsApp, Messages,
	  // etc.), which is broader and more natively "mobile" than a fixed
	  // 3-platform dropdown would be. Falls back to the LinkedIn share
	  // (matching the desktop dropdown's default) on browsers without it.
	  share: () => {
		if (navigator.share) {
		  navigator.share({
			title: document.title,
			text: text[language],
			url: window.location.href,
		  }).catch(() => {}); // user cancelling the native share sheet is not an error
		} else {
		  socialNameSpace.linkedin();
		}
	  },
	};
})();