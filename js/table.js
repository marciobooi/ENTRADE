function createTableChart() {
  $('#chartContainer').empty();

  barchartdata(d);
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

  const headerRow = thead.insertRow(0);
  headerRow.classList.add("ecl-table__row");
  const headerCell1 = headerRow.insertCell(0);
  const headerCell2 = headerRow.insertCell(1);
  headerCell1.classList.add("ecl-table__header");
  headerCell2.classList.add("ecl-table__header");

  headerCell1.innerHTML = "Country";
  headerCell1.setAttribute("scope", "col"); // Specify that this cell is a header for a column
  headerCell2.innerHTML = "Value";
  headerCell2.setAttribute("scope", "col"); // Specify that this cell is a header for a column

  // Create tbody (table body) for data rows
  const tbody = document.createElement("tbody");
  tbody.classList.add("ecl-table__body");
  table.appendChild(tbody);

  // Iterate through the bar chart series data and populate the tbody
  barChartSeries.forEach((dataPoint, index) => {
    const row = tbody.insertRow(index);
    row.classList.add("ecl-table__row");

    const cell1 = row.insertCell(0);
    const cell2 = row.insertCell(1);
    cell1.classList.add("ecl-table__cell");
    cell2.classList.add("ecl-table__cell");



    cell1.innerHTML = dataPoint.name;
    cell2.innerHTML = formatNumber(dataPoint.y);
  

    // Add attributes for screen readers
    row.setAttribute("role", "row");
    cell1.setAttribute("role", "cell");
    cell2.setAttribute("role", "cell");

    // Add tabindex for keyboard focus
    row.setAttribute("tabindex", "0");
    row.addEventListener("keydown", (event) => handleRowKeyPress(event, row));
  });

  // Get the container element by ID
  const chartContainer = document.getElementById("chartContainer");

  // Append the title, thead, and table to the chartContainer
  chartContainer.appendChild(title);
  chartContainer.appendChild(table);
}

 
 // Function to handle keyboard events for rows
 function handleRowKeyPress(event, row) {
   if (event.key === "Enter" || event.key === " ") {
     // Handle key press (e.g., open details for the selected row)
     console.log("Row selected:", row);
   }
 }
 
 // Function to format a number with one decimal place and space as the thousand separator
 function formatNumber(number) {
   return number.toFixed(1).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
 }