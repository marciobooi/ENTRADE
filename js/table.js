async function createTableChart() {
  const chartContainer = document.getElementById("chartContainer");
  chartContainer.textContent = '';

  await barchartdata();

  if (!barChartSeries || barChartSeries.length === 0 || barChartSeries.every(s => !s?.y)) {
    showNoDataPopup(languageNameSpace.labels['NODATA']);
    showNoDataInChartContainer(languageNameSpace.labels['NODATA']);
    return;
  }

  const title = document.createElement("h2");
  title.classList.add("tableTitle");
  title.innerHTML = getTitle();

  // Create a new table element
  const table = document.createElement("table");
  table.classList.add("ecl-table"); // Add Bootstrap table classes for striping and hover effects
  table.style.marginTop = "20px"; // Add some top margin for spacing

  // Create thead (table header) with Bootstrap styles
  const thead = document.createElement("thead");
  thead.classList.add("ecl-table__head");
  table.appendChild(thead);

  // Create a semantic header row using <th> elements (scope allowed only on <th>)
  const headerRow = document.createElement('tr');
  headerRow.classList.add('ecl-table__row');

  const headerCell1 = document.createElement('th');
  headerCell1.classList.add('ecl-table__header');
  headerCell1.setAttribute('scope', 'col'); // scope is valid on <th>
  headerCell1.innerHTML = 'Country';

  const headerCell2 = document.createElement('th');
  headerCell2.classList.add('ecl-table__header');
  headerCell2.setAttribute('scope', 'col');
  headerCell2.innerHTML = 'Value';

  headerRow.appendChild(headerCell1);
  headerRow.appendChild(headerCell2);
  thead.appendChild(headerRow);

  // Create tbody (table body) for data rows
  const tbody = document.createElement("tbody");
  tbody.classList.add("ecl-table__body");

  const fragment = document.createDocumentFragment();

  // Iterate through the bar chart series data and populate the tbody
  barChartSeries.forEach((dataPoint) => {
    const row = document.createElement("tr");
    row.classList.add("ecl-table__row");

    const cell1 = document.createElement("td");
    const cell2 = document.createElement("td");
    cell1.classList.add("ecl-table__cell");
    cell2.classList.add("ecl-table__cell");

    cell1.textContent = dataPoint.name;
    cell2.textContent = formatNumber(dataPoint.y);

    // Add attributes for screen readers
    row.setAttribute("role", "row");
    cell1.setAttribute("role", "cell");
    cell2.setAttribute("role", "cell");

    // Add tabindex for keyboard focus
    row.setAttribute("tabindex", "0");
    row.addEventListener("keydown", (event) => handleRowKeyPress(event, row));

    row.appendChild(cell1);
    row.appendChild(cell2);
    fragment.appendChild(row);
  });

  tbody.appendChild(fragment);
  table.appendChild(tbody);

  // Get the container element by ID
  if (chartContainer) {
    // Append the title, thead, and table to the chartContainer
    chartContainer.appendChild(title);
    chartContainer.appendChild(table);
  }
  hideChartLoader();
}

 
 // Function to handle keyboard events for rows
 function handleRowKeyPress(event, row) {
   if (event.key === "Enter" || event.key === " ") {
     // Handle key press (e.g., open details for the selected row)
   }
 }
 
 // Function to format a number with one decimal place and space as the thousand separator
 function formatNumber(number) {
   return number.toFixed(1).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
 }