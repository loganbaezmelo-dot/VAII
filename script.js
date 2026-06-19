const cityInput = document.getElementById('city-input');
const datalist = document.getElementById('city-suggestions');
const weatherBtn = document.getElementById('weather-btn');
const output = document.getElementById('weather-output');

let debounceTimer;

// Handle live suggestions while typing
cityInput.addEventListener('input', function() {
    const query = cityInput.value.trim();
    
    // Clear list if text is too short
    if (query.length < 3) {
        datalist.innerHTML = "";
        return;
    }

    // Debounce stops it from hitting the API on every single keystroke
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`)
            .then(res => res.json())
            .then(geoData => {
                datalist.innerHTML = ""; // Clear old options
                if (!geoData.results) return;

                geoData.results.forEach(location => {
                    const option = document.createElement('option');
                    // Combine City with State (admin1) or Country
                    const region = location.admin1 || location.country || "";
                    option.value = region ? `${location.name}, ${region}` : location.name;
                    datalist.appendChild(option);
                });
            })
            .catch(err => console.error("Suggestions error:", err));
    }, 300); // Waits 300ms after you stop typing to search
});

// Handle Weather Lookup when clicking Check
weatherBtn.addEventListener('click', function() {
    // Grab whatever text is inside the box (either typed or clicked from suggestions)
    let fullInput = cityInput.value.trim();
    // Take just the city name before the comma to feed the coordinate lookup safely
    let searchCity = fullInput.split(',')[0].trim();
    
    output.innerText = "Searching coordinates...";
    
    fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchCity)}&count=5&language=en&format=json`)
        .then(res => res.json())
        .then(geoData => {
            if (!geoData.results || geoData.results.length === 0) {
                output.innerText = "Location not found.";
                return;
            }
            
            // Try to match the exact option chosen by checking state lines, default to first result
            let targetLocation = geoData.results[0];
            if (fullInput.includes(',')) {
                const stateSelected = fullInput.split(',')[1].trim().toLowerCase();
                const matched = geoData.results.find(loc => (loc.admin1 || '').toLowerCase() === stateSelected);
                if (matched) targetLocation = matched;
            }
            
            output.innerText = `Fetching forecast for ${targetLocation.name}...`;
            
            return fetch(`https://api.open-meteo.com/v1/forecast?latitude=${targetLocation.latitude}&longitude=${targetLocation.longitude}&current_weather=true`)
                .then(res => res.json())
                .then(weatherData => {
                    const tempCelsius = weatherData.current_weather.temperature;
                    const tempFahrenheit = Math.round((tempCelsius * 9/5) + 32);
                    
                    output.innerHTML = `
                        <strong>📍 ${targetLocation.name}, ${targetLocation.admin1 || targetLocation.country}</strong><br>
                        🌡️ Temperature: ${tempFahrenheit}°F (${tempCelsius}°C)<br>
                        💨 Wind Speed: ${weatherData.current_weather.windspeed} km/h
                    `;
                });
        })
        .catch(err => {
            output.innerText = "Error fetching live weather data.";
            console.error(err);
        });
});
