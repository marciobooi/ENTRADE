var areDataDisplay = true;
var isProductsLegendDisplay = false;

function changeNameCountryChartArea(country) {
	$("#countryHeader .countryNameChartArea").text(country);
};

//construct the Legend of products color from the list
function constructProductsColorsListBox() {
	$(document).ready(function () {
		$.ajax({
			'async': false,
			'global': false,
			'url': 'data/products_colors.json',
			'dataType': "json",
			'success': function (json) {
				$.each(json.productsColors, function (idx, obj) {
					$('#products-legend')
					.append("<hr style = background-color:" + obj.colour + ">")
					.append("<span>" + obj.product + "</span> <br/>");
				});
				constructArrayFromJson(productsColorsList, json.productsColors);
			}
		});
	});
};

function constructArrayFromJson(arrayList, jsonData) {
	for (var prop in jsonData) {
		arrayList.push(jsonData[prop]);
	};
};

//Display the popup of product colors
function displayProductsLegend() {
	if (isProductsLegendDisplay == true) {
		$("#products-legend").hide();
		isProductsLegendDisplay = false;
	} else {
		$('#products-legend').show();
		isProductsLegendDisplay = true;
	};
};

// function changeYear() {
// 	var theSelect = yearForm.yearSelect;
// 	REF.year = theSelect[theSelect.selectedIndex].value;
// };
