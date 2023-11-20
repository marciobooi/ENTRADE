
var timelineNameSpace = {
	totalWidth: 0,
	nbYears: 0,
	eventLeftDisabled: -1,
	marginTimeLine: 20,
	marginGrayLine: 70,
	marginLeftSelectedTimeLine: 15,
	

	//construct the html timeline
	constructTimeline: function () {

		// console.log("construct")
		// console.log(REF.year)

		

		timelineNameSpace.totalWidth = $(window).width() - 45;
		timelineNameSpace.nbYears = timeSeries.length;
		
		
		
		$.each(timeSeries, function (itime, time) {
			
			var elementYear = "<li>" + "<a href=\"#0\" id=\"" + time + "\"";
			//put the selected time
			if (time == REF.year) {
				elementYear = elementYear + " class=\"selected\"";
			}
			elementYear = elementYear + ">" + time + "</a></li>" + "</li>";
			$("#list-years").append(elementYear);
		});

		timeline = $('.horizontal-timeline');
		if (timeline.length > 0) {
			timelineNameSpace.initTimeline(timeline);
		};
	},

	initTimeline: function (timeline) {
		//cache timeline components
		var timelineComponents = timelineNameSpace.constructTimeLineComponents();

		//assign a left postion to the single events along the timeline
		timelineNameSpace.setDatePosition(timelineComponents['timelineEvents']);
		//assign a width to the timeline
		timelineNameSpace.setTimelineWidth(timelineComponents);
		//the timeline has been initialize - show it
		timeline.addClass('loaded');

		//detect click on the a single event - show new event content
		timelineComponents['eventsWrapper'].on('click', 'a', function (event) {
			// clearmapclose()			
			timelineNameSpace.removeClassComponent(timelineComponents['timelineEvents'], 'selected');
			$(this).addClass('selected');
			timelineNameSpace.updateOlderEvents($(this));
			timelineNameSpace.updateFilling($(this), timelineComponents['fillingLine']);
			REF.year = this.id;			
			$("#subHeader-title").html([dataNameSpace.ref.year]);				
			if(REF.geo == ""){ 
				return
			} else {
				console.log("step 3")
				renderMap()
			}
		});
	},
	//calculate the distance between each year
	setDatePosition: function (component) {
		var distance = (timelineNameSpace.totalWidth - timelineNameSpace.marginGrayLine) / (timelineNameSpace.nbYears - 1);
		var count = 0;
		for (var i = 0; i < timelineNameSpace.nbYears + 2 ; i++) { //for (var i = 0; i < timelineNameSpace.nbYears ; i++) {
			component.eq(i).css('left', count + 'px'); //component.eq(i).css('left', count-15 + 'px');
			count += distance;
		};
	},

	setTimelineWidth: function (timelineComponents) {
		var timeLineGrayWidth = timelineNameSpace.totalWidth - timelineNameSpace.marginGrayLine;
		timelineComponents['timeline'].css('width', timeLineGrayWidth + 'px');
		timelineNameSpace.updateFilling(timelineComponents['eventsWrapper'].find('a.selected'), timelineComponents['fillingLine']);
	},
	//change the date shape for the years before the selected one
	updateOlderEvents: function (event) {
		event.parent('li').prevAll('li').children('a').addClass('older-event').end().end().nextAll('li').children('a').removeClass('older-event');
	},
	//fill the black time line from the latest year to the selected one
	updateFilling: function (selectedEvent, filling) {
		filling.css('width', timelineNameSpace.totalWidth + 'px'); //filling.css('width', timelineNameSpace.totalWidth+10 + 'px');
		//change .filling-line length according to the selected event
		var eventStyle = window.getComputedStyle(selectedEvent.get(0), null),
		eventLeft = eventStyle.getPropertyValue('left'),
		eventLeft = Number(eventLeft.replace('px', ''));
		if (timelineNameSpace.eventLeftDisabled > -1) {
			eventLeft = eventLeft - timelineNameSpace.eventLeftDisabled;
		};
		var scaleValue = eventLeft / timelineNameSpace.totalWidth;
		timelineNameSpace.setTransformValue(filling.get(0), 'scaleX', scaleValue);
	},
	//put the transform type for the black time line
	setTransformValue: function (element, property, value) {
		element.style["-webkit-transform"] = property + "(" + value + ")";
		element.style["-moz-transform"] = property + "(" + value + ")";
		element.style["-ms-transform"] = property + "(" + value + ")";
		element.style["-o-transform"] = property + "(" + value + ")";
		element.style["transform"] = property + "(" + value + ")";
	},
	
	// disable the years not available when changing country
	disableTimeLine: function () {
		var timelineComponents = timelineNameSpace.constructTimeLineComponents(),
		countryFirstYear = timeSeries[0].replace("S", ""),
		selectedYear = null,
		diffYears = 0,
		oldYear = 0,
		eventStyle = null
		fillLineComponent = timelineComponents['fillingLine'],
		timeLineEventsComponent = timelineComponents['timelineEvents'];
		
		//alert(countryFirstYear);

	
			//when changing country put all the available years of the country on the "selecting state"		
			timelineNameSpace.removeClassComponent(timeLineEventsComponent, 'disabled');
			fillLineComponent.css('left', timelineNameSpace.marginLeftSelectedTimeLine + 'px');
			timelineNameSpace.eventLeftDisabled = -1;
			timelineNameSpace.updateFilling($('.horizontal-timeline').find('#' + REF.year), fillLineComponent);
		
	},

	//get all the elements of the html time line
	constructTimeLineComponents: function () {
	
		var timelineComponents = {};
		timelineComponents['timelineWrapper'] = timeline.find('.events-wrapper');
		timelineComponents['eventsWrapper'] = timelineComponents['timelineWrapper'].children('.events');
		timelineComponents['fillingLine'] = timelineComponents['eventsWrapper'].children('.filling-line');
		timelineComponents['timeline'] = timelineComponents['eventsWrapper'].children('.timeline');
		timelineComponents['timelineEvents'] = timelineComponents['eventsWrapper'].find('a');
		return timelineComponents;
	},

	removeClassComponent: function (component, className) {
		component.removeClass(className);
	}
};
