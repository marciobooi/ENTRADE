var filterboxNameSpace = {
	filterDialogBox: null,

	drawfilterDialogBox: function () {

		if(dataNameSpace.mq[0].matches) { //@media (max-width: 650px)
			var boxWidth = 350;
		} else if(dataNameSpace.mq[1].matches) {
			var boxWidth = 350;
		} else if(dataNameSpace.mq[2].matches){
			var boxWidth = 350;
		} else if(dataNameSpace.mq[3].matches){
			var boxWidth = 450;
		} else {
			var boxWidth = 320;
		}
		
		if (filterboxNameSpace.filterDialogBox !== null) {
			closeDialogBox(filterboxNameSpace.filterDialogBox);
		}
		filterboxNameSpace.filterDialogBox = new jBox('Modal', {
			addClass: 'check-style-modal position-box-modal',
			id: 'filter-box-modal',
			constructOnInit: true,
			position: {
				x: 'left',
				y: 'center'
			},
			title: languageNameSpace.labels["BOX_FILTER_TITLE"],
			blockScroll: false,
			overlay: false,
			closeOnClick: 'body',
			closeOnEsc: true,
			closeButton: 'box',
			draggable: 'title',
			content: filterboxNameSpace.fillFilterModalContent(),
			repositionOnOpen: true,
			repositionOnContent: true,
			preventDefault: true,
			width: boxWidth,
			height: 'auto',
			// Once jBox is closed, destroy it
			onCloseComplete: function () {
				this.destroy();
			}
		});
		filterboxNameSpace.filterDialogBox.open();
	},

	fillFilterModalContent: function () {
		
		var content = "";		
		$.each(tradeFilter, function (idx, obj) {					
				//Display units belonging to the selected dataset
				// if($.inArray(iunit, codesDataset[dataNameSpace.dataset].unit) > -1) {									
									
					var checkFilter = "";
					if (REF.filter == idx) {
						checkFilter = "checked";
					}
					var filter = "<div id=\"testeteee\" class=\"buttonStyle sub-nav-text\">"
						+ "<input type=\"radio\" name=\"radio\"  id=\"" + idx + "\" class=\"radio\" onclick=\"filterboxNameSpace.changeFilter('" + idx + "')\" " + checkFilter + ">"
						+ "<label for=\"" + idx + "\">" + obj + "</label>"
						+ "</div>";
					content = content + filter;
					var i = 0;
				
			// }; 
			
		});
		return content;
	},

	changeFilter: function (filter) {
		closeDialogBox(filterboxNameSpace.filterDialogBox);
		
      
        if (REF.geo == ""){
			REF.filter = filter;      
			$("#header-title-Label").html(languageNameSpace.labels[REF.trade] + " " + languageNameSpace.labels["title6"] + " " + languageNameSpace.labels[REF.siec] + " " + languageNameSpace.labels[REF.filter]);
			$("#subHeader-title").html(newTitle + "  " + [dataNameSpace.ref.year]);	
		 }else {
			REF.filter = filter;
			renderMap()
		 }
      
	}
};
