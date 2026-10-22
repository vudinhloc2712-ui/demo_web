
const API_BASE_URL = "http://127.0.0.1:8000";

let weatherData = [];
let selectedId = null;


// ==========================================
// API HELPER
// ==========================================

async function apiRequest(path, options = {}) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers: {
            ...(options.body
                ? { "Content-Type": "application/json" }
                : {}),
            ...options.headers
        }
    });

    if (!response.ok) {
        let message = `HTTP error ${response.status}`;

        try {
            const error = await response.json();
            message = error.detail || message;
        } catch {}

        throw new Error(message);
    }

    if (response.status === 204) {
        return null;
    }

    return response.json();
}




// ==========================================
// LOAD WEATHER
// ==========================================

async function loadWeather() {
    try {
        weatherData = await apiRequest("/weather");
        selectedId = null;
        displayTable();
    } catch (error) {
        console.error(error);
        alert("Cannot connect to weather API.");
    }
}


// ==========================================
// DISPLAY TABLE
// ==========================================

function displayTable() {
    const table = document.getElementById("weatherTable");
    table.innerHTML = "";

    weatherData.forEach(item => {
        const row = document.createElement("tr");

        if (item.id === selectedId) {
            row.classList.add("selected");
        }

        const values = [
            item.city,
            item.date,
            `${item.temperature} °C`,
            `${item.humidity} %`,
            `${item.wind} km/h`,
            item.weather
        ];

        values.forEach(value => {
            const cell = document.createElement("td");
            cell.textContent = value ?? "";
            row.appendChild(cell);
        });

        row.onclick = () => selectWeather(item.id);

        table.appendChild(row);
    });
}


// ==========================================
// SELECT WEATHER
// ==========================================

function selectWeather(id) {
    const item = weatherData.find(record => record.id === id);

    if (!item) return;

    selectedId = id;

    document.getElementById("city").value = item.city;
    document.getElementById("date").value = item.date;
    document.getElementById("temperature").value = item.temperature;
    document.getElementById("humidity").value = item.humidity;
    document.getElementById("wind").value = item.wind;
    document.getElementById("weather").value = item.weather;

    displayTable();
}


// ==========================================
// GET FORM DATA
// ==========================================

function getFormData() {
    return {
        city: document.getElementById("city").value.trim(),
        date: document.getElementById("date").value,
        temperature: Number(document.getElementById("temperature").value),
        humidity: Number(document.getElementById("humidity").value),
        wind: Number(document.getElementById("wind").value),
        weather: document.getElementById("weather").value
    };
}


function validateForm(data) {
    if (!data.city) {
        alert("Please enter city.");
        return false;
    }

    if (!data.date) {
        alert("Please enter date.");
        return false;
    }

    const fields = ["temperature", "humidity", "wind"];

    for (const field of fields) {
        const value = document.getElementById(field).value;

        if (value.trim() === "" || !Number.isFinite(Number(value))) {
            alert(`Please enter a valid ${field}.`);
            return false;
        }
    }

    return true;
}


// ==========================================
// ADD
// ==========================================

async function addWeather() {
    const data = getFormData();

    if (!validateForm(data)) return;

    try {
        await apiRequest("/weather", {
            method: "POST",
            body: JSON.stringify(data)
        });

        await loadWeather();
        clearForm();
    } catch (error) {
        alert(`Cannot add weather record: ${error.message}`);
    }
}


// ==========================================
// UPDATE
// ==========================================

async function updateWeather() {
    if (selectedId === null) {
        alert("Please select a weather record.");
        return;
    }

    const data = getFormData();

    if (!validateForm(data)) return;

    try {
        await apiRequest(`/weather/${selectedId}`, {
            method: "PUT",
            body: JSON.stringify(data)
        });

        await loadWeather();
        clearForm();
    } catch (error) {
        alert(`Cannot update weather record: ${error.message}`);
    }
}


// ==========================================
// DELETE
// ==========================================

async function deleteWeather() {
    if (selectedId === null) {
        alert("Please select a weather record.");
        return;
    }

    if (!confirm("Are you sure you want to delete this record?")) {
        return;
    }

    try {
        await apiRequest(`/weather/${selectedId}`, {
            method: "DELETE"
        });

        await loadWeather();
        clearForm();
    } catch (error) {
        alert(`Cannot delete weather record: ${error.message}`);
    }
}


// ==========================================
// CLEAR FORM
// ==========================================

function clearForm() {
    document.getElementById("city").value = "";
    document.getElementById("date").value = "";
    document.getElementById("temperature").value = "";
    document.getElementById("humidity").value = "";
    document.getElementById("wind").value = "";
    document.getElementById("weather").value = "Sunny";

    selectedId = null;
    displayTable();
}


// ==========================================
// SHOW JSON
// ==========================================

async function showJSON() {
    const preview = document.getElementById("preview");

    try {
        const data = await apiRequest("/weather");
        preview.textContent = JSON.stringify(data, null, 4);
    } catch (error) {
        preview.textContent = `Cannot load JSON: ${error.message}`;
    }
}


// ==========================================
// SHOW XML
// ==========================================

async function showXML() {
    const preview = document.getElementById("preview");

    try {
        const response = await fetch(`${API_BASE_URL}/weather/xml`);

        if (!response.ok) {
            throw new Error(`HTTP error ${response.status}`);
        }

        preview.textContent = await response.text();
    } catch (error) {
        preview.textContent = `Cannot load XML: ${error.message}`;
    }
}


// ==========================================
// START APPLICATION
// ==========================================

loadWeather();
