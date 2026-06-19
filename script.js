document.getElementById('weather-btn').addEventListener('click', function() {
    const city = document.getElementById('city-input').value;
    const output = document.getElementById('weather-output');
    
    output.innerText = "Searching for city coordinates...";
    
    // Step 1: Find coordinates for the city name
    fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`)
        .then(res => res.json())
        .then(geoData => {
            if (!geoData.results || geoData.results.length === 0) {
                output.innerText = "City not found.";
                return;
            }
            
            const location = geoData.results[0];
            output.innerText = `Fetching forecast for ${location.name}...`;
            
            // Step 2: Grab live weather using the exact coordinates
            return fetch(`https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current_weather=true`)
                .then(res => res.json())
                .then(weatherData => {
                    const tempCelsius = weatherData.current_weather.temperature;
                    // Quick conversion formula: (C * 9/5) + 32
                    const tempFahrenheit = Math.round((tempCelsius * 9/5) + 32);
                    
                    output.innerHTML = `
                        <strong>📍 ${location.name}, ${location.admin1 || ''}</strong><br>
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
