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
		const description = encodeURIComponent(text[language]);
		const url = `https://www.linkedin.com/shareArticle?mini=true&title=Energyprices&summary=${description}&url=${currentUrl}`;
		openWindow(url);
		return false;
	  },
  
	  twitter: () => {
		const textContent = encodeURIComponent(text[language]);
		const url = `https://twitter.com/share?text=${textContent}&url=${currentUrl}`;
		openWindow(url, 400, 700);
		return false;
	  },
  
	  facebook: () => {
		const description = encodeURIComponent(text[language]);
		const url = `https://www.facebook.com/sharer.php?u=${currentUrl}&quote=${description}`;
		openWindow(url, 500, 700);
		return false;
	  },
  
	  email: () => {
		const subject = encodeURIComponent("Energy prices");
		const body = encodeURIComponent(`${text[language]} ${window.location.href}`);
		document.location = `mailto:ESTAT-ENERGY@ec.europa.eu?subject=${subject}&body=${body}`;
	  },
	};
})();