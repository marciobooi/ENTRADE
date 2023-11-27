// var unitboxNameSpace = {
//     unitDialogBox: null,

//     drawUnitDialogBox: function () {

//         if (dataNameSpace.mq[0].matches) { //@media (max-width: 650px)
//             var boxWidth = 470;
//         } else if (dataNameSpace.mq[1].matches) {
//             var boxWidth = 470;
//         } else if (dataNameSpace.mq[2].matches) {
//             var boxWidth = 500;
//         } else if (dataNameSpace.mq[3].matches) {
//             var boxWidth = 720;
//         } else {
//             var boxWidth = 320;
//         }

//         if (unitboxNameSpace.unitDialogBox !== null) {
//             closeDialogBox(unitboxNameSpace.unitDialogBox);
//         }
//         unitboxNameSpace.unitDialogBox = new jBox('Modal', {
//             addClass: 'check-style-modal position-box-modal modalfix'
//             , id: 'unit-box-modal'
//             , constructOnInit: true
//             , position: {
//                 x: 'left'
//                 , y: 'center'
//             }
//             , title: languageNameSpace.labels["BOX_UNIT_TITLE"]
//             , blockScroll: false
//             , overlay: false
//             , closeOnClick: 'body'
//             , closeOnEsc: true
//             , closeButton: 'box'
//             , draggable: 'title'
//             , content: unitboxNameSpace.fillUnitModalContent()
//             , repositionOnOpen: true
//             , repositionOnContent: true
//             , preventDefault: true
//             , width: boxWidth
//             , height: 'auto',
//             // Once jBox is closed, destroy it
//             onCloseComplete: function () {
//                 this.destroy();
//             }
//         });
//         unitboxNameSpace.unitDialogBox.open();
//     },

//     fillUnitModalContent: function () {

//         var content = "";
//         // dataNameSpace.getRefURL()
//         $.each(tradeUnit, function (iunit, unit) {

//             //Display units belonging to the selected dataset
//             if ($.inArray(iunit, codesDataset[dataNameSpace.dataset].unit) > -1) {

//                 var checkUnit = "";
//                 if (REF.unit == iunit) {
//                     checkUnit = "checked";
//                 }
//                 var unit = "<div class=\"buttonStyle sub-nav-text\">" +
//                     "<input type=\"radio\" name=\"radio\"  id=\"" + iunit + "\" class=\"radio\" onclick=\"unitboxNameSpace.changeUnit('" + iunit + "')\" " + checkUnit + ">" +
//                     "<label for=\"" + iunit + "\">" + unit + "</label>" +
//                     "</div>";
//                 content = content + unit;
//                 var i = 0;

//             }

//         });
//         return content;
//     },

//     changeUnit: function (unit) {
//         closeDialogBox(unitboxNameSpace.unitDialogBox);
//         REF.unit = unit;
//         console.log(unit)
//         $("#header-title-Label").html(languageNameSpace.labels[REF.trade] + " " + languageNameSpace.labels["title6"] + " " + languageNameSpace.labels[REF.siec] + " " + languageNameSpace.labels[REF.unit]);
//         $("#subHeader-title").html(newTitle + "  " + [dataNameSpace.ref.year]);	
//         renderMap()
//     }
// };
