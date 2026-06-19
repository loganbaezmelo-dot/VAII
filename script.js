const cityInput = document.getElementById('city-input');
const datalist = document.getElementById('city-suggestions');
const weatherBtn = document.getElementById('weather-btn');
const output = document.getElementById('weather-output');

let debounceTimer;

// Handle live suggestions while typing
cityInput.addEventListener('input', function() {
    const query = cityInput.value.trim();
    
    if (query.length < 3) {
        datalist.innerHTML = "";
        return;
    }

    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`)
            .then(res => res.json())
            .then(geoData => {
                datalist.innerHTML = ""; 
                if (!geoData.results) return;

                geoData.results.forEach(location => {
                    const option = document.createElement('option');
                    
                    const city = location.name;
                    const state = location.admin1;
                    const country = location.country;

                    // Build array and ignore any duplicate data entries
                    let parts = [];
                    
                    if (city) parts.push(city);
                    
                    if (state && !parts.includes(state)) {
                        parts.push(state);
                    }
                    
                    if (country && !parts.includes(country)) {
                        parts.push(country);
                    }

                    // Joins beautifully without repeating text
                    option.value = parts.join(', ');
                    
                    option.setAttribute('data-lat', location.latitude);
                    option.setAttribute('data-lon', location.longitude);
                    
                    datalist.appendChild(option);
                });
            })
            .catch(err => console.error("Suggestions error:", err));
    }, 300);
});

// Handle Weather Lookup when clicking Check
weatherBtn.addEventListener('click', function() {
    const fullInput = cityInput.value.trim();
    
    if (!fullInput) {
        output.innerText = "Please type a city first.";
        return;
    }
    
    output.innerText = "Searching coordinates...";

    const options = Array.from(datalist.options);
    const matchedOption = options.find(opt => opt.value === fullInput);

    if (matchedOption) {
        const lat = matchedOption.getAttribute('data-lat');
        const lon = matchedOption.getAttribute('data-lon');
        getWeatherData(lat, lon, fullInput);
    } else {
        const searchCity = fullInput.split(',')[0].trim();
        fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchCity)}&count=1&language=en&format=json`)
            .then(res => res.json())
            .then(geoData => {
                if (!geoData.results || geoData.results.length === 0) {
                    output.innerText = "Location not found.";
                    return;
                }
                const loc = geoData.results[0];
                getWeatherData(loc.latitude, loc.longitude, fullInput);
            })
            .catch(err => {
                output.innerText = "Error fetching location.";
                console.error(err);
            });
    }
});

function getWeatherData(lat, lon, displayName) {
    output.innerText = `Fetching forecast for ${displayName}...`;
    
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`)
        .then(res => res.json())
        .then(weatherData => {
            const tempCelsius = weatherData.current_weather.temperature;
            const tempFahrenheit = Math.round((tempCelsius * 9/5) + 32);
            
            output.innerHTML = `
                <strong>📍 ${displayName}</strong><br>
                🌡️ Temperature: ${tempFahrenheit}°F (${tempCelsius}°C)<br>
                💨 Wind Speed: ${weatherData.current_weather.windspeed} km/h
            `;
        })
        .catch(err => {
            output.innerText = "Error fetching live weather data.";
            console.error(err);
        });
}
