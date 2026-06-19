const cityInput = document.getElementById('city-input');
const datalist = document.getElementById('city-suggestions');
const weatherBtn = document.getElementById('weather-btn');
const newsBtn = document.getElementById('news-btn');
const output = document.getElementById('weather-output');

let debounceTimer;

// Handle live autocomplete suggestions while typing
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

                    let parts = [];
                    if (city) parts.push(city);
                    if (state && !parts.includes(state)) parts.push(state);
                    if (country && !parts.includes(country)) parts.push(country);

                    option.value = parts.join(', ');
                    option.setAttribute('data-lat', location.latitude);
                    option.setAttribute('data-lon', location.longitude);
                    
                    datalist.appendChild(option);
                });
            })
            .catch(err => console.error("Suggestions error:", err));
    }, 300);
});

// WEATHER BUTTON ACTION
weatherBtn.addEventListener('click', function() {
    const fullInput = cityInput.value.trim();
    if (!fullInput) {
        output.innerText = "Please type a location first.";
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

// NEWS BUTTON ACTION
newsBtn.addEventListener('click', function() {
    const query = cityInput.value.trim();
    if (!query) {
        output.innerText = "Please type a topic or location for news.";
        return;
    }

    output.innerText = `Searching news for "${query}"...`;

    // Uses a completely free, CORS-safe Google News RSS converter to fetch global articles
    const feedUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`;
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`;

    fetch(apiUrl)
        .then(res => res.json())
        .then(data => {
            if (!data.items || data.items.length === 0) {
                output.innerText = `No recent news articles found for "${query}".`;
                return;
            }

            let newsHTML = `<h3>📰 Latest News: ${query}</h3>`;
            // Grab the top 4 articles to keep it clean on mobile
            data.items.slice(0, 4).forEach(item => {
                newsHTML += `
                    <div class="news-item">
                        <a class="news-title" href="${item.link}" target="_blank">${item.title}</a>
                        <div class="news-desc">📅 ${item.pubDate.split(' ')[0]}</div>
                    </div>
                `;
            });

            output.innerHTML = newsHTML;
        })
        .catch(err => {
            output.innerText = "Error loading news feed.";
            console.error(err);
        });
});
