const SHEET_ID = "1WiMPk7ziQYdmoOgzIRNu3sTIaNkqg6zoZ-oQRDnDolw";
const API_KEY = "AIzaSyBwnJTt3tZV61gebywzYb8MIDk4CTcleHQ";
const RANGE = "sheet1";
const ENDPOINT = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}?key=${API_KEY}`;
let rawData = [];
let names = [];

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
      obj.amount = parseFloat(obj.amount) || 0;
      return obj;
    });

    names = [...new Set(rawData.map(item => item.name))].sort();
    createFilterButtons();
    
    showSummary(); // Show summary view by default
    updateHeaderTotal(); // Update the header total
  } catch (error) {
    console.error("Error fetching data:", error);
    document.querySelector("#data-table tbody").innerHTML = `<tr><td colspan="4">Error loading data. Please try again later.</td></tr>`;
  }
}

function formatTimestamp(ts) {
  const date = new Date(ts);
  if (isNaN(date.getTime())) return ts;
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).replace(/\//g, '-');
}

function createFilterButtons() {
  const container = document.querySelector(".button-container");
  container.innerHTML = '';
  
  const allButton = document.createElement("button");
  allButton.textContent = "All";
  allButton.onclick = showSummary;
  container.appendChild(allButton);
  
  names.forEach(name => {
    const button = document.createElement("button");
    button.textContent = name;
    button.onclick = () => filterByName(name);
    container.appendChild(button);
  });
}

function updateHeaderTotal() {
  const grandTotal = rawData.reduce((sum, row) => sum + row.amount, 0);
  document.getElementById("header-total").textContent = grandTotal.toLocaleString('en-IN', {minimumFractionDigits: 2});
}

function showSummary() {
  const tbody = document.querySelector("#data-table tbody");
  tbody.innerHTML = "";

  if (!rawData || rawData.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4">No data available</td></tr>`;
    return;
  }

  // Calculate totals per person
  const summary = {};
  let grandTotal = 0;

  rawData.forEach(row => {
    if (!summary[row.name]) {
      summary[row.name] = 0;
    }
    summary[row.name] += row.amount;
    grandTotal += row.amount;
  });

  // Create summary rows
  Object.entries(summary).forEach(([name, total]) => {
    const tr = document.createElement("tr");
    
    const cells = [
      "",
      name,
      total.toLocaleString('en-IN', {minimumFractionDigits: 2}),
      `${rawData.filter(row => row.name === name).length} donation(s)`
    ];

    cells.forEach(cell => {
      const td = document.createElement("td");
      td.textContent = cell;
      tr.appendChild(td);
    });

    tbody.appendChild(tr);
  });

  updateHeaderTotal();
}

function renderTable(data) {
  const tbody = document.querySelector("#data-table tbody");
  tbody.innerHTML = "";

  if (!data || data.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4">No data available</td></tr>`;
    return;
  }

  const sortedData = [...data].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  let total = 0;

  sortedData.forEach(row => {
    const tr = document.createElement("tr");

    const cells = [
      formatTimestamp(row.timestamp),
      row.name,
      row.amount.toLocaleString('en-IN', {minimumFractionDigits: 2}),
      row.details || ''
    ];

    cells.forEach(cell => {
      const td = document.createElement("td");
      td.textContent = cell;
      tr.appendChild(td);
    });

    total += row.amount;
    tbody.appendChild(tr);
  });

  document.getElementById("header-total").textContent = total.toLocaleString('en-IN', {minimumFractionDigits: 2});
}

function filterByName(name) {
  const filtered = rawData.filter(row => row.name === name);
  renderTable(filtered);
}

document.addEventListener('DOMContentLoaded', fetchData);