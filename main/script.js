// Google Sheet ID and API key (Replace with your actual values)
const SHEET_ID = "1_TTEP27CryIJi3Hl4nTMYPpb_zvotq5Lt5wRTIAof00"; // Replace with your Google Sheet ID
const API_KEY = "AIzaSyBwnJTt3tZV61gebywzYb8MIDk4CTcleHQ"; // Replace with your Google API Key
const SHEET_NAME = "Sheet1"; // Replace with your Google Sheet tab name

// Function to fetch data from Google Sheets
async function fetchGoogleSheetData() {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_NAME}?key=${API_KEY}`;
    try {
        const response = await fetch(url);
        const data = await response.json();

        if (!data.values || data.values.length === 0) {
            console.error("No data found in the Google Sheet.");
            return [];
        }

        // Parse the rows into structured objects using column indices
        const rows = data.values;
        rows.shift(); // Remove the header row
        
        return rows.map(row => ({
            timestamp: row[0] || "", // Column 0
            range: row[1] || "",     // Column 1
            name: row[2] || "",      // Column 2
            haraj: row[3] || "",     // Column 3
            amount: row[4] || "",    // Column 4
            balance: row[5] || ""    // Column 5
        }));
    } catch (error) {
        console.error("Error fetching data from Google Sheets:", error);
        return [];
    }
}

// Function to format the date into "Month Day, Year"
function formatDate(dateString) {
    const date = new Date(dateString);
    if (isNaN(date)) return dateString; // Return original if invalid date
    const options = { year: "numeric", month: "long", day: "numeric" };
    return date.toLocaleDateString("en-US", options).replace(",", "");
}

// Function to render a table for a specific range
function renderTable(containerId, tableData) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container with ID "${containerId}" not found.`);
        return;
    }

    if (tableData.length === 0) {
        container.innerHTML = "<p>No data available for this range.</p>";
        return;
    }

    const table = document.createElement("table");
    
    // Add header row with highlighted background
    const headerRow = document.createElement("tr");
    const headers = [" ಚೀಟಿ.", "ದಿನಾಂಕ", "ಹೆಸರು", "ಹರಾಜು", "ಒಟ್ಟು ಮೊತ್ತ ವ್ಯಕ್ತಿ ಪಡೆದಿರುವುದು", "ಬ್ಯಾಲೆನ್ಸ್"];
    headers.forEach(headerText => {
        const th = document.createElement("th");
        th.textContent = headerText;
        th.style.backgroundColor = '#17ab50'; // Highlight header row
        th.style.fontWeight = 'bold';
        headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    // Add data rows with alternating row colors
    tableData.forEach((row, index) => {
        const tr = document.createElement("tr");
        
        // Serial number column (reverse order)
        const tdSerialNo = document.createElement("td");
        tdSerialNo.textContent = tableData.length - index; // Reverse order serial number
        tr.appendChild(tdSerialNo);
        
        // Data columns
        ["timestamp", "name", "haraj", "amount", "balance"].forEach(key => {
            const td = document.createElement("td");
            td.textContent = key === "timestamp" ? formatDate(row[key]) : row[key];
            tr.appendChild(td);
        });

        // Alternate row colors (even and odd rows)
        tr.style.backgroundColor = index % 2 === 0 ? "#f9f9f9" : "#ffffff"; // Light and white for alternating rows
        table.appendChild(tr);
    });

    // Clear and append the table
    container.innerHTML = "";
    container.appendChild(table);
}

// Function to filter and display data for a specific range
async function filterData(range) {
    const data = await fetchGoogleSheetData();
    console.log("Fetched Data:", data); // Debugging: Log all data

    // Filter the data for the specified range (based on column 1)
    const filteredData = data.filter(item => {
        console.log("Checking row:", item); // Log each row for debugging
        const rangeValue = item["range"]; // Accessing the "range" field from the mapped object
        console.log(`Comparing "${rangeValue}" with "${range}"`); // Log the comparison

        return rangeValue && rangeValue.toLowerCase() === range.toLowerCase(); // Case-insensitive comparison
    });

    console.log(`Filtered Data for "${range}":`, filteredData); // Debugging: Log filtered data

    // Sort the filtered data by timestamp in descending order (latest first)
    filteredData.sort((a, b) => {
        const dateA = new Date(a.timestamp);
        const dateB = new Date(b.timestamp);
        return dateB - dateA; // Sort in descending order (latest dates first)
    });

    console.log(`Sorted Data for "${range}":`, filteredData); // Debugging: Log sorted data

    // Render the table in the corresponding container
    renderTable(range.replace(/\s+/g, "").toLowerCase() + "-container", filteredData);
}


// Initialize the page and populate all containers
document.addEventListener("DOMContentLoaded", async () => {
    // Initialize buttons' onclick functions to fetch data dynamically
    const ranges = ["50 Thousand 12", "1 Lakh 12", "2 Lakh 12", "50 Thousand 14", "1 Lakh 14"];
    for (const range of ranges) {
        await filterData(range);
    }
});
