function populateYearsData() {



  const url = "https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/"+REF.dataset+"?format=JSON&geo=EU27_2020&unit=TJ_GCV&siec=G3000&partner=BE&lang=en";

  const yearsArray = JSONstat(url).Dataset(0).Dimension("time").id;  

  if(REF.year == "" || REF.year == undefined){      
    REF.year = yearsArray[yearsArray.length - 1]
  }

  const yearsDropDown = $("#chartOptionsMenu > div.dropdown-grid > div > div:nth-child(4) > div > ul");
  yearsDropDown.empty()
  let content = ''; 

  yearsArray.forEach(year => {
    const isActive = year == REF.year ? 'active' : '';
    content += `
      <a role="menuitem" class="dropdown-item d-flex justify-content-between align-items-center ${isActive}" href="#" data-year="${year}" data-bs-toggle="button" aria-pressed="true">
        <span>${year}</span>
        <i class="fas fa-check ms-2 ${isActive ? '' : 'invisible'}"></i>
      </a>`;
  });


const dropdownMenu = $("<div>")
.attr("id", "dropdown-years-list")
.attr("role", "menu")
.css("height", "auto")
.css("maxHeight", "48vh")
.css("overflowX", "hidden")
.html(content);


dropdownMenu.on('click', '.dropdown-item', function() {
  const target = $(this);
  const checkIcon = target.find('.fas.fa-check');

  dropdownMenu.find('.dropdown-item').removeClass('active');
  dropdownMenu.find('.fas.fa-check').addClass('invisible');

  target.addClass('active');
  checkIcon.removeClass('invisible');

  const selectedText = target.find('span').text();
  $('#selectYear').text(selectedText).append('<i class="fas fa-caret-down"></i>');

  REF.year = target.attr('data-year')



});

yearsDropDown.prepend(dropdownMenu);

$('#selectYear').hover(
  function() {
    $(this).data('prevText', $(this).text());
    $(this).html(`${languageNameSpace.labels['MENU_YEAR']} <i class="fas fa-caret-down"></i>`);
  },
  function() {
    const dropdownTimetList = $('#dropdown-years-list');
    const prevText = dropdownTimetList.find('.dropdown-item.active span').text();
    $(this).html(`${prevText} <i class="fas fa-caret-down"></i>`);
  }
);

}