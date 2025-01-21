const SHEET_ID = "1nhzL2QGAbMMUsP9_vXrpl_UBuKEalysh6yTo0h92gdc";
const API_KEY = "AIzaSyBwnJTt3tZV61gebywzYb8MIDk4CTcleHQ";
const RANGE = "Sheet1"; // Update this to your actual sheet name

// Helper function to format the timestamp
const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  const options = {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  };
  return date.toLocaleDateString('en-GB', options).replace(',', '');
};

// Function to sort rows based on the timestamp
const sortRowsByTimestamp = (rows) => {
  return rows.sort((a, b) => {
    const timestampA = new Date(a[0]);
    const timestampB = new Date(b[0]);
    return timestampB - timestampA; // Sort in descending order
  });
};

const fetchData = async () => {
  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}?key=${API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.values) {
      displayData(data.values);
    } else {
      document.getElementById("loading").innerText = "No data available.";
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    document.getElementById("loading").innerText =
      "Failed to fetch data. Check the console for details.";
  }
};

const displayData = (values) => {
  const [header, ...rows] = values; // Extract header and data rows

  // Sort the rows based on the timestamp
  const sortedRows = sortRowsByTimestamp(rows);

  // Build table body dynamically
  const tableBody = document.getElementById("table-body");
  sortedRows.forEach((row, index) => {
    const tr = document.createElement("tr");

    // Format the timestamp (if present)
    const timestamp = row[0] ? formatTimestamp(row[0]) : "N/A";
    const name = row[1] || "N/A";
    const details = row[2] || "N/A";

    // Apply alternating row background colors (sky blue for odd rows)
    if (index % 2 === 0) {
      tr.style.backgroundColor = "#e0f7fa"; // Light Sky Blue for even rows
    }

    tr.innerHTML = `
      <td>${name}</td>
      <td>${details}</td>
      <td>${timestamp}</td> <!-- Timestamp is now in the last column -->
    `;
    tableBody.appendChild(tr);
  });

  // Show the table and hide the loading text
  document.getElementById("loading").classList.add("d-none");
  document.getElementById("data-table").classList.remove("d-none");
};

// Fetch and display data on page load
document.addEventListener("DOMContentLoaded", () => {
  fetchData();
});
