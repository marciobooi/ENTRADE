function populateTrade() {

  const tradeDropDown = $("#chartOptionsMenu > div.dropdown-grid > div > div:nth-child(1) > div > ul");
  tradeDropDown.empty()
  let content = '';

  Object.keys(trade).forEach(trade => {     
      const isActive = trade == REF.trade ? 'active' : '';
    content += `
      <a role="menuitem" class="dropdown-item d-flex justify-content-between align-items-center ${isActive}" href="#" data-trade="${trade}" data-bs-toggle="button" aria-pressed="true">
        <span>${languageNameSpace.labels[trade]}</span>
        <i class="fas fa-check ms-2 ${isActive ? '' : 'invisible'}"></i>
      </a>`;
  });

  const dropdownMenu = $("<div>")
    .attr("id", "dropdown-trade-list")
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
      $('#selectTrade').text(selectedText).append('<i class="fas fa-caret-down"></i>');

      REF.trade = target.attr('data-trade')

      const apiParam = getDatasetNameByDefaultSIECAndTrade(REF.fuel, REF.trade);

      log(apiParam)

      REF.dataset = apiParam.name;
      REF.unit = apiParam.defUnit
      REF.defaultUnit = apiParam.defUnit
      REF.siec = apiParam.defSiec

    });

  tradeDropDown.prepend(dropdownMenu);

  $('#selectTrade').hover(
      function() {
        $(this).data('prevText', $(this).text());
        $(this).html(`${languageNameSpace.labels['MENU_TRADE']} <i class="fas fa-caret-down"></i>`);
      },
      function() {
        const dropdownConsumerList = $('#dropdown-trade-list');
        const prevText = dropdownConsumerList.find('.dropdown-item.active span').text();
        $(this).html(`${prevText} <i class="fas fa-caret-down"></i>`);
      }
    );

}