var socialNameSpace = {

		//social media
		linkedIn: function () {
			var currentUrl = window.location.href;
			var encodedUrl = encodeURIComponent(currentUrl);
			var url = 'https://www.linkedin.com/shareArticle?mini=true&title=EnergyTrade&url=' + encodedUrl;
			window.open(url, '', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=450,width=650');
			return false;
		},

		twitter: function () {
			var currentUrl = window.location.href;
			var encodedUrl = encodeURIComponent(currentUrl);
			var url = 'https://twitter.com/share?text=EnergyTrade&url=' + encodedUrl;
			window.open(url, '', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=400,width=700');
			return false;
		},

		facebook: function () {
			var currentUrl = window.location.href;
			var encodedUrl = encodeURIComponent(currentUrl);
			var url = 'https://www.facebook.com/sharer.php?t=EnergyTrade&u=' + encodedUrl;
			window.open(url, '', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=500,width=700');
			return false;
		}
		
};


// function linksChange(social) {
	




// }
