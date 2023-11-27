function createTableChart() {

  $('#chartContainer').empty();

  barchartdata(d)

   // Create a new table element
   const table = document.createElement("table");
   table.classList.add("table", "table-bordered", "table-striped", "table-hover"); // Add Bootstrap table classes for striping and hover effects
   table.style.marginTop = "20px"; // Add some top margin for spacing
 
   // Create a header row with Bootstrap styles
   const headerRow = table.insertRow(0);
   headerRow.classList.add("bg-primary", "text-white"); // Add Bootstrap classes for a blue background and white text
   const headerCell1 = headerRow.insertCell(0);
   const headerCell2 = headerRow.insertCell(1);
 
   headerCell1.innerHTML = "Country";
   headerCell1.setAttribute("scope", "col"); // Specify that this cell is a header for a column
   headerCell2.innerHTML = "Value";
   headerCell2.setAttribute("scope", "col"); // Specify that this cell is a header for a column
 
   // Iterate through the bar chart series data and populate the table
   barChartSeries.forEach((dataPoint, index) => {
     const row = table.insertRow(index + 1); // Add 1 to account for the header row
 
     const cell1 = row.insertCell(0);
     const cell2 = row.insertCell(1);
 
     cell1.innerHTML = dataPoint.name;
     cell2.innerHTML = formatNumber(dataPoint.y);
     cell2.classList.add("text-right"); // Add Bootstrap class to align text to the right
 
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
 
   // Append the table to the chartContainer
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