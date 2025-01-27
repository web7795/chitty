// Google Sheet ID and API key (Replace with your actual values)
const SHEET_ID = "1jwUyOHUtUhO3O5JBLWBB8VfyHQ6Xj6Ft-CJ2S-rqy2A"; // Replace with your Google Sheet ID
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

        // Parse the rows into structured objects (skip header)
        const rows = data.values.slice(1); // Skip the header row

        return rows.map(row => {
            return {
                timestamp: row[0] ? row[0].trim() : "",
                range: row[1] ? row[1].trim() : "",
                name: row[2] ? row[2].trim() : "",
                haraj: row[3] ? parseFloat(row[3].trim()) || 0 : 0,
                amount: row[4] ? row[4].trim() : "",
                balance: row[5] ? parseFloat(row[5].trim()) || 0 : 0,
            };
        });
    } catch (error) {
        console.error("Error fetching data from Google Sheets:", error);
        return [];
    }
}

// Function to calculate totals by year
function calculateYearlyTotals(data) {
    const yearlyTotals = {};

    data.forEach(row => {
        const year = new Date(row.timestamp).getFullYear();
        if (!yearlyTotals[year]) {
            yearlyTotals[year] = { totalHaraj: 0, totalBalance: 0 };
        }
        yearlyTotals[year].totalHaraj += row.haraj;
        yearlyTotals[year].totalBalance += row.balance;
    });

    return yearlyTotals;
}

// Function to format the timestamp into "Month Day, Year"
function formatTimestamp(dateString) {
    const date = new Date(dateString);
    if (isNaN(date)) return dateString; // Return original if invalid date
    const options = { year: "numeric", month: "long", day: "numeric" };
    return date.toLocaleDateString("en-US", options).replace(",", "");
}

// Function to render data in a box format
function renderDataBox(containerId, data) {
    let container = document.getElementById(containerId);

    // If container doesn't exist, create it dynamically
    if (!container) {
        container = document.createElement("div");
        container.id = containerId; // Set the ID dynamically
        document.body.appendChild(container); // Append it to the body or a specific section
    }

    if (data.length === 0) {
        container.innerHTML = "<p>No data available for this range.</p>";
        return;
    }

    // Calculate yearly totals
    const yearlyTotals = calculateYearlyTotals(data);

    // Create a section to display yearly totals
    const totalsBox = document.createElement("div");
    totalsBox.classList.add("totals-box");
    totalsBox.innerHTML = Object.keys(yearlyTotals)
        .map(year => {
            const { totalHaraj, totalBalance } = yearlyTotals[year];
            return `
                <p>Year:<strong> ${year}</strong> 
               ವರ್ಷದ ಬಾಡಿಗೆ: <strong>₹${totalHaraj.toLocaleString()}</strong> 
               ವರ್ಷದ Bill : <strong> ₹${totalBalance.toLocaleString()}</strong></p>
            `;
        })
        .join("");
    container.appendChild(totalsBox);

    // Create the grid layout container
    container.classList.add("grid-container");

    data.forEach((row, index) => {
        const dataBox = document.createElement("div");
        dataBox.classList.add("data-box");

        // Add reverse serial number (Sl. No.)
        const slNo = data.length - index; // Reverse order for serial number

        // Format the timestamp at the top of each box
        const timestamp = formatTimestamp(row.timestamp);

        // Create box content
        const titleBox = document.createElement("div");
        titleBox.classList.add("title-box");

        // Create the title box content dynamically
        titleBox.innerHTML = `
            <p><strong>ದಿನಾಂಕ:</strong> <span>${timestamp}</span></p>
            <p><strong>ತಿಂಗಳುಗಳು :</strong> <span>${slNo} ನೇ ತಿಂಗಳು </span></p>
            <p><strong>ಹೆಸರು:</strong> <span>${row.name}</span></p>
            <p><strong>Advance :</strong> <span>15,000</span></p> <!-- Default Amount -->
            <p><strong>Current Bill :</strong> <span>${row.balance}</span></p>
            <p><strong>ಬಾಡಿಗೆ :</strong> <span>${row.haraj}</span></p>
            <p><strong>ಇನ್ನಿ ತರ ವಿವರಗಳು:</strong> <span>${row.amount}</span></p>
        `;

        // Create Share Button
        const shareButton = document.createElement("button");
        shareButton.textContent = "Share Data";
        shareButton.classList.add("share-button");

        // Button click event to share the data
        shareButton.addEventListener("click", () => {
            // Prepare the data to share
            const shareData = {
                title: "Transaction Details",
                text: `ದಿನಾಂಕ: ${timestamp}\nತಿಂಗಳುಗಳು: ${slNo} ನೇ ತಿಂಗಳು\nಹೆಸರು: ${row.name}\n\nAdvance: 15,000\nಬಾಡಿಗೆ: ${row.haraj}\nಅಮೌಂಟ್: ${row.amount}\nಬ್ಯಾಲೆನ್ಸ್: ${row.balance}\n`,
            };

            // Check if the browser supports the Share API
            if (navigator.share) {
                navigator.share(shareData)
                    .then(() => console.log("Data shared successfully."))
                    .catch(error => console.log("Sharing failed:", error));
            } else {
                alert("Sharing is not supported in this browser.");
            }
        });

        // Append everything to the data box
        dataBox.appendChild(titleBox);
        dataBox.appendChild(shareButton);
        container.appendChild(dataBox);
    });
}

// Filter and display data for a specific range
async function filterData(range) {
    const data = await fetchGoogleSheetData();

    // Filter the data for the specified range (based on row[1] for the 'range' column)
    const filteredData = data.filter(item => item.range.toLowerCase() === range.toLowerCase());

    // Sort the filtered data by timestamp in descending order (latest first)
    filteredData.sort((a, b) => {
        const dateA = new Date(a.timestamp);
        const dateB = new Date(b.timestamp);
        return dateB - dateA; // Sort in descending order (latest dates first)
    });

    // Render the data boxes in the corresponding container
    renderDataBox(range.replace(/\s+/g, "").toLowerCase() + "-container", filteredData);
}

// Initialize the page and populate all containers
document.addEventListener("DOMContentLoaded", async () => {
    // Initialize buttons' onclick functions to fetch data dynamically
    const ranges = ["1 Prakash"]; // Add more ranges as needed
    for (const range of ranges) {
        await filterData(range);
    }
});
