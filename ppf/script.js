const SHEET_ID = "1WiMPk7ziQYdmoOgzIRNu3sTIaNkqg6zoZ-oQRDnDolw";
const API_KEY = "AIzaSyBwnJTt3tZV61gebywzYb8MIDk4CTcleHQ";
const RANGE = "sheet1";
const ENDPOINT = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}?key=${API_KEY}`;
let rawData = [];
let names = []; // To store unique names for buttons

async function fetchData() {
  try {
    const res = await fetch(ENDPOINT);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    
    const data = await res.json();

    if (!data.values || data.values.length < 2) {
      console.error("No data found.");
      return;
    }

    const headers = data.values[0];
    rawData = data.values.slice(1).map(row => {
      const obj = {};
      headers.forEach((header, index) => {
        obj[header.toLowerCase()] = row[index] || '';
      });
      return obj;
    });

    // Extract unique names for filtering
    names = [...new Set(rawData.map(item => item.name))].sort();
    createFilterButtons();
    
    renderTable(rawData);
  } catch (error) {
    console.error("Error fetching data:", error);
    document.getElementById("data-table").innerHTML = `<tr><td colspan="4">Error loading data. Please try again later.</td></tr>`;
  }
}

function formatTimestamp(ts) {
  const date = new Date(ts);
  if (isNaN(date.getTime())) return ts; // fallback

  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).replace(/\//g, '-');
}

function createFilterButtons() {
  const container = document.querySelector(".button-container");
  container.innerHTML = ''; // Clear existing buttons
  
  // Add "All" button first
  const allButton = document.createElement("button");
  allButton.textContent = "All";
  allButton.onclick = showAll;
  container.appendChild(allButton);
  
  // Add buttons for each name
  names.forEach(name => {
    const button = document.createElement("button");
    button.textContent = name;
    button.onclick = () => filterByName(name);
    container.appendChild(button);
  });
}

function renderTable(data) {
  const tbody = document.querySelector("#data-table tbody");
  const totalCell = document.getElementById("totalAmount");
  tbody.innerHTML = "";

  if (!data || data.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4">No data available</td></tr>`;
    totalCell.textContent = "0";
    return;
  }

  const sortedData = [...data].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  let total = 0;

  sortedData.forEach(row => {
    const tr = document.createElement("tr");

    const cells = [
      formatTimestamp(row.timestamp),
      row.name,
      parseFloat(row.amount) || 0,
      row.details || ''
    ];

    cells.forEach((cell, index) => {
      const td = document.createElement("td");
      // Format amount with 2 decimal places
      td.textContent = index === 2 ? cell.toLocaleString('en-IN', {minimumFractionDigits: 2}) : cell;
      tr.appendChild(td);
    });

    total += parseFloat(row.amount) || 0;
    tbody.appendChild(tr);
  });

  totalCell.textContent = total.toLocaleString('en-IN', {minimumFractionDigits: 2});
}

function filterByName(name) {
  const filtered = rawData.filter(row => row.name === name);
  renderTable(filtered);
}

function showAll() {
  renderTable(rawData);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', fetchData);