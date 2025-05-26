const SHEET_ID = "1Zkf_O7ck8JKB6BQdwU96YNvpRRh8DfQgCrlmplEOf50";
const API_KEY = "AIzaSyBwnJTt3tZV61gebywzYb8MIDk4CTcleHQ";
const SHEET_NAME = "sheet1";

async function fetchGoogleSheetData() {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_NAME}?key=${API_KEY}`;
    try {
        const response = await fetch(url);
        const data = await response.json();

        if (!data.values || data.values.length === 0) {
            console.error("No data found in the Google Sheet.");
            return [];
        }

        const rows = data.values.slice(1); // Skip header

        return rows.map(row => ({
            timestamp: row[0] || "",
            date: row[1] || "",
            minimum: row[2] || "",
            payment: row[3] || "",
            interest: row[4] || "",
            haraj: row[5] || "",
            notes: row[6] || "",
        }));
    } catch (error) {
        console.error("Error fetching data from Google Sheets:", error);
        return [];
    }
}

function formatTimestamp(dateString) {
    const date = new Date(dateString);
    if (isNaN(date)) return dateString;
    const options = { year: "numeric", month: "long", day: "numeric" };
    return date.toLocaleDateString("en-US", options).replace(",", "");
}

function renderDataBox(containerId, data) {
    let container = document.getElementById(containerId);

    if (!container) {
        container = document.createElement("div");
        container.id = containerId;
        document.body.appendChild(container);
    }

    if (data.length === 0) {
        container.innerHTML = "<p>No data available.</p>";
        return;
    }

    container.classList.add("grid-container");
    container.innerHTML = ""; // Clear old content

    data.forEach((row, index) => {
        const dataBox = document.createElement("div");
        dataBox.classList.add("data-box");

        const slNo = data.length - index;
        const timestamp = formatTimestamp(row.timestamp);

        const titleBox = document.createElement("div");
        titleBox.classList.add("title-box");
        titleBox.innerHTML = `
            <p><strong>ದಿನಾಂಕ:</strong> <span>${row.date}</span></p>
            <p><strong>ಮಿನಿಮಮ್:</strong> <span>${row.minimum}</span></p>
            <p><strong>ಪೇಮೆಂಟ್:</strong> <span>${row.payment}</span></p>
            <p><strong>ಬಡ್ಡಿ:</strong> <span>${row.interest}</span></p>
            <p><strong>ಹರಾಜು:</strong> <span>${row.haraj}</span></p>
            <p><strong>ಮಾಹಿತಿ:</strong> <span>${row.notes}</span></p>
        `;

        const shareButton = document.createElement("button");
        shareButton.textContent = "Share Data";
        shareButton.classList.add("share-button");
        shareButton.addEventListener("click", () => {
            const shareData = {
                title: "Transaction Details",
                text: `ದಿನಾಂಕ:               ${timestamp} : 8 PM\nಚೀಟಿ:                    ${slNo}ನೇ ಚೀಟಿ\nಮಿನಿಮಮ್:         ${row.minimum}\nಪೇಮೆಂಟ್:           ${row.payment}\nಬಡ್ಡಿ:                     ${row.interest}\nಹರಾಜು:               ${row.haraj}\nಮಾಹಿತಿ:             ${row.notes}`,
            };

            if (navigator.share) {
                navigator.share(shareData)
                    .then(() => console.log("Data shared successfully."))
                    .catch(error => console.log("Sharing failed:", error));
            } else {
                alert("Sharing is not supported in this browser.");
            }
        });

        dataBox.appendChild(titleBox);
        dataBox.appendChild(shareButton);
        container.appendChild(dataBox);
    });
}

// Show all data sorted by the "date" column (newest first)
async function displayAllData() {
    const data = await fetchGoogleSheetData();

    const sortedData = data.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateB - dateA; // Newest first
    });

    renderDataBox("50tho12-container", sortedData);
}

document.addEventListener("DOMContentLoaded", displayAllData);
