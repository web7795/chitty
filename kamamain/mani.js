// Google Sheet ID and API key (Replace with your actual values)
const SHEET_ID = "1Zkf_O7ck8JKB6BQdwU96YNvpRRh8DfQgCrlmplEOf50"; // Replace with your Google Sheet ID
const API_KEY = "AIzaSyBwnJTt3tZV61gebywzYb8MIDk4CTcleHQ"; // Replace with your Google API Key
const SHEET_NAME = "sheet1"; // Replace with your Google Sheet tab name

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
        timestamp: row[0] || "",     // Timestamp
        date: row[1] || "",          // ದಿನಾಂಕ (as number)
        minimum: row[2] || "",       // ಮಿನಿಮಮ್
        payment: row[3] || "",       // ಪೇಮೆಂಟ್
        interest: row[4] || "",      // ಬಡ್ಡಿ
        haraj: row[5] || "",         // ಹರಾಜು
        notes: row[6] || "",         // ಇನ್ನಿತರ ಮಾಹಿತಿಗಳು ಇದ್ದಲ್ಲಿ
    };
});

    } catch (error) {
        console.error("Error fetching data from Google Sheets:", error);
        return [];
    }
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
        container.innerHTML = "<p>No data available for this name.</p>";
        return;
    }

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
    <p><strong>ದಿನಾಂಕ:</strong> <span>${row.date}</span></p>
    <p><strong>ಮಿನಿಮಮ್:</strong> <span>${row.minimum}</span></p>
    <p><strong>ಪೇಮೆಂಟ್:</strong> <span>${row.payment}</span></p>
    <p><strong>ಬಡ್ಡಿ:</strong> <span>${row.interest}</span></p>
    <p><strong>ಹರಾಜು:</strong> <span>${row.haraj}</span></p>
    <p><strong>ಮಾಹಿತಿ:</strong> <span>${row.notes}</span></p>
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
                text: `ದಿನಾಂಕ:   ${timestamp} : 8 PM\nಚೀಟಿ:                    ${slNo} ನೇ ಚೀಟಿ\nಹೆಸರು:                  ${row.name}\nminimun:            21,0000\nಚೀಟಿ ಅಮೌಂಟ್:   100,000\nಹರಾಜು:                ${row.haraj}\nಅಮೌಂಟ್:            ${row.amount}\nLV PMT:              ${row.lvpmt}\n`,
                 // Share the current URL (can be adjusted as needed) url: window.location.href
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

// Filter and display data for a specific name
async function filterData(name) {
    const data = await fetchGoogleSheetData();

    // Filter the data for the specified name (based on row[1] for the 'name' column)
    const filteredData = data.filter(item => item.name.toLowerCase() === name.toLowerCase());

    // Sort the filtered data by timestamp in descending order (latest first)
    filteredData.sort((a, b) => {
        const dateA = new Date(a.timestamp);
        const dateB = new Date(b.timestamp);
        return dateB - dateA; // Sort in descending order (latest dates first)
    });

    // Render the data boxes in the corresponding container
    renderDataBox(name.replace(/\s+/g, "").toLowerCase() + "-container", filteredData);
}


// Initialize the page and populate all containers
document.addEventListener("DOMContentLoaded", async () => {
    // Initialize buttons' onclick functions to fetch data dynamically
    const names = ["1 Lakh Mani"]; // Add more names as needed
    for (const name of names) {
        await filterData(name);
    }
});



